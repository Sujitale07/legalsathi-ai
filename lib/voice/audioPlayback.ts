interface QueuedChunk {
  data: string;
  sampleRate: number;
}

export class AudioPlayback {
  private audioCtx: AudioContext;
  private queue: QueuedChunk[] = [];
  private isPlaying = false;
  private currentSource: AudioBufferSourceNode | null = null;
  private stopped = false;

  constructor() {
    // Create eagerly (called from handleStart which is in/near user-gesture scope)
    // so Chrome grants autoplay permission immediately.
    // Hard-code 24 kHz to match Gemini Live output and avoid resampling glitches.
    this.audioCtx = new AudioContext({ sampleRate: 24000 });
    // Pre-resume while still inside the gesture window — safe to ignore if rejected
    void this.audioCtx.resume();
  }

  queueChunk(base64Data: string, mimeType: string): void {
    if (this.stopped) {
      console.warn("[AudioPlayback] chunk BLOCKED — stopped flag is true (stale instance)");
      return;
    }
    const sampleRate = this.parseSampleRate(mimeType);
    console.debug("[AudioPlayback] chunk queued — ctx:", this.audioCtx.state, "q:", this.queue.length + 1);
    this.queue.push({ data: base64Data, sampleRate });
    if (!this.isPlaying) void this.playNext();
  }

  private parseSampleRate(mimeType: string): number {
    const match = mimeType.match(/rate=(\d+)/);
    return match ? parseInt(match[1], 10) : 24000;
  }

  private async playNext(): Promise<void> {
    if (this.stopped || this.queue.length === 0) {
      this.isPlaying = false;
      this.currentSource = null;
      return;
    }

    this.isPlaying = true;
    const chunk = this.queue.shift()!;

    try {
      if (this.audioCtx.state === "closed") {
        this.isPlaying = false;
        return;
      }
      if (this.audioCtx.state === "suspended") {
        await this.audioCtx.resume();
      }

      const int16   = this.base64ToPcm16(chunk.data);
      const float32 = this.pcm16ToFloat32(int16);

      const buffer = this.audioCtx.createBuffer(1, float32.length, chunk.sampleRate);
      buffer.getChannelData(0).set(float32);

      const source = this.audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioCtx.destination);
      this.currentSource = source;
      source.onended = () => {
        if (this.currentSource === source) this.currentSource = null;
        void this.playNext();
      };
      source.start();
    } catch (err) {
      console.error("[AudioPlayback] playNext failed:", err);
      this.currentSource = null;
      this.isPlaying = false;
      // Do NOT recurse — a failed decode/play should not drain the queue silently
    }
  }

  private killCurrent(): void {
    if (this.currentSource) {
      try { this.currentSource.stop(0); } catch { /* already ended */ }
      this.currentSource = null;
    }
  }

  /**
   * Drop all queued chunks and cut the currently playing chunk (barge-in / interrupted).
   * Does NOT touch isPlaying — the killed source's onended fires async, calls playNext(),
   * finds an empty queue, and resets isPlaying itself. This keeps a single playNext chain.
   */
  clearQueue(): void {
    this.queue = [];
    this.killCurrent();
  }

  stop(): void {
    this.stopped = true;
    this.queue = [];
    this.killCurrent();
    this.isPlaying = false;
    if (this.audioCtx.state !== "closed") {
      void this.audioCtx.close();
    }
  }

  private base64ToPcm16(base64: string): Int16Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new Int16Array(bytes.buffer);
  }

  private pcm16ToFloat32(int16: Int16Array): Float32Array {
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / (int16[i] < 0 ? 0x8000 : 0x7fff);
    }
    return float32;
  }
}
