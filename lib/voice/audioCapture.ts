export type TranscriptCallback  = (text: string) => void;
export type SpeechStartCallback = () => void;
export type SpeechEndCallback   = () => void;

export class AudioCapture {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private recognition: any = null;
  private isRunning = false;

  private onTranscript:  TranscriptCallback;
  private onSpeechStart: SpeechStartCallback;
  private onSpeechEnd:   SpeechEndCallback;

  constructor(
    onTranscript:  TranscriptCallback,
    onSpeechStart: SpeechStartCallback,
    onSpeechEnd:   SpeechEndCallback,
  ) {
    this.onTranscript  = onTranscript;
    this.onSpeechStart = onSpeechStart;
    this.onSpeechEnd   = onSpeechEnd;
  }

  async start(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    if (!SR) throw new Error("SpeechRecognition is not supported. Please use Chrome or Edge.");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.recognition = new SR() as any;
    this.recognition.continuous     = true;
    this.recognition.interimResults = true;
    // ne-NP for Nepali accent; Chrome handles English code-switching gracefully
    this.recognition.lang = "ne-NP";

    this.recognition.onspeechstart = () => this.onSpeechStart();
    this.recognition.onspeechend   = () => this.onSpeechEnd();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          const text = event.results[i][0].transcript.trim();
          if (text.length > 0) this.onTranscript(text);
        }
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.recognition.onerror = (event: any) => {
      if (event.error === "not-allowed" || event.error === "service-not-available") {
        console.error("[AudioCapture] mic not allowed / service unavailable:", event.error);
        return;
      }
      console.warn("[AudioCapture] SpeechRecognition error:", event.error, "— restarting");
      if (this.isRunning) setTimeout(() => { try { this.recognition?.start(); } catch { /* ignore */ } }, 300);
    };

    // Auto-restart on unexpected stop (Chrome stops recognition after ~60s of silence)
    this.recognition.onend = () => {
      if (this.isRunning) setTimeout(() => { try { this.recognition?.start(); } catch { /* ignore */ } }, 100);
    };

    this.recognition.start();
    this.isRunning = true;
  }

  stop(): void {
    this.isRunning = false;
    try { this.recognition?.stop(); } catch { /* ignore */ }
    this.recognition = null;
  }
}
