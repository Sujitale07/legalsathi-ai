export type AudioChunkCallback  = (base64: string, mimeType: string) => void;
export type SpeechStartCallback = () => void;
export type SpeechEndCallback   = () => void;

const INPUT_SAMPLE_RATE = 16000;

// VAD timing
const SPEECH_START_MS = 250;   // consecutive loud frames before "speech started"
const SPEECH_END_MS   = 1200;  // consecutive silent frames before "speech ended"

// Noise-floor calibration: measure this many ms of ambient audio before going live.
const CALIBRATION_MS   = 1500;
// Threshold = noiseFloor × NOISE_MULTIPLIER, never below MIN_THRESHOLD.
const NOISE_MULTIPLIER = 4;
const MIN_THRESHOLD    = 0.25;

export class AudioCapture {
  private audioCtx: AudioContext    | null = null;
  private stream:   MediaStream     | null = null;
  private worklet:  AudioWorkletNode | null = null;
  private isRunning = false;

  // VAD state
  private speechActive = false;
  private silenceMs    = 0;
  private speechMs     = 0;
  private vadThreshold = MIN_THRESHOLD;

  // Calibration state
  private calibrating     = true;
  private calibrationMs   = 0;
  private calibrationSumSq = 0;
  private calibrationN     = 0;

  constructor(
    private readonly onAudioChunk:  AudioChunkCallback,
    private readonly onSpeechStart: SpeechStartCallback,
    private readonly onSpeechEnd:   SpeechEndCallback,
  ) {}

  async start(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          // Disable AGC — it amplifies background noise up to near-speech levels,
          // defeating the purpose of a high VAD threshold in noisy rooms.
          autoGainControl:  false,
          sampleRate:       INPUT_SAMPLE_RATE,
          channelCount:     1,
        },
      });
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      throw new Error(
        name === "NotAllowedError"
          ? "Microphone access denied. Please allow mic access and try again."
          : "Could not access the microphone.",
      );
    }

    this.audioCtx = new AudioContext({ sampleRate: INPUT_SAMPLE_RATE });
    await this.audioCtx.audioWorklet.addModule("/audio-processor.js");

    const source   = this.audioCtx.createMediaStreamSource(this.stream);
    this.worklet   = new AudioWorkletNode(this.audioCtx, "pcm-processor");
    this.isRunning = true;

    this.worklet.port.onmessage = (ev: MessageEvent<Float32Array>) => {
      if (!this.isRunning) return;
      const float32 = ev.data;
      const chunkMs = (float32.length / INPUT_SAMPLE_RATE) * 1000;
      const amp     = this.rms(float32);

      // ── Phase 1: calibrate noise floor (first 1.5 s) ─────────────────────
      // During calibration the user should not speak — we measure ambient RMS
      // and set the VAD threshold to 4× that level so close speech is detected
      // but room noise is ignored. Audio is still streamed so Gemini's greeting
      // response comes through uninterrupted.
      if (this.calibrating) {
        this.calibrationSumSq += amp * amp;
        this.calibrationN     += 1;
        this.calibrationMs    += chunkMs;

        if (this.calibrationMs >= CALIBRATION_MS) {
          const noiseFloor   = Math.sqrt(this.calibrationSumSq / this.calibrationN);
          this.vadThreshold  = Math.max(MIN_THRESHOLD, noiseFloor * NOISE_MULTIPLIER);
          this.calibrating   = false;
          console.log(
            `[AudioCapture] noise floor=${noiseFloor.toFixed(4)} ` +
            `→ VAD threshold=${this.vadThreshold.toFixed(4)}`
          );
        }

        // Emit audio during calibration (don't block the greeting from Gemini).
        this.emitChunk(float32);
        return;
      }

      // ── Phase 2: VAD + audio streaming ───────────────────────────────────
      if (amp > this.vadThreshold) {
        this.silenceMs  = 0;
        this.speechMs  += chunkMs;
        if (!this.speechActive && this.speechMs >= SPEECH_START_MS) {
          this.speechActive = true;
          this.onSpeechStart();
        }
      } else {
        this.speechMs = 0;
        if (this.speechActive) {
          this.silenceMs += chunkMs;
          if (this.silenceMs >= SPEECH_END_MS) {
            this.speechActive = false;
            this.silenceMs    = 0;
            this.onSpeechEnd();
          }
        }
      }

      this.emitChunk(float32);
    };

    source.connect(this.worklet);
    // AudioWorkletNode does not require a destination connection to run.
  }

  stop(): void {
    this.isRunning       = false;
    this.speechActive    = false;
    this.silenceMs       = 0;
    this.speechMs        = 0;
    this.calibrating     = true;
    this.calibrationMs   = 0;
    this.calibrationSumSq = 0;
    this.calibrationN    = 0;
    try { this.worklet?.disconnect(); } catch { /* ignore */ }
    this.worklet = null;
    if (this.audioCtx && this.audioCtx.state !== "closed") {
      void this.audioCtx.close();
    }
    this.audioCtx = null;
    this.stream?.getTracks().forEach(t => t.stop());
    this.stream = null;
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private emitChunk(float32: Float32Array): void {
    const pcm16  = this.float32ToPcm16(float32);
    const base64 = this.uint8ToBase64(new Uint8Array(pcm16.buffer));
    this.onAudioChunk(base64, `audio/pcm;rate=${INPUT_SAMPLE_RATE}`);
  }

  private rms(samples: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i];
    return Math.sqrt(sum / samples.length);
  }

  private float32ToPcm16(float32: Float32Array): Int16Array {
    const out = new Int16Array(float32.length);
    for (let i = 0; i < float32.length; i++) {
      const s = Math.max(-1, Math.min(1, float32[i]));
      out[i]  = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return out;
  }

  private uint8ToBase64(bytes: Uint8Array): string {
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }
}
