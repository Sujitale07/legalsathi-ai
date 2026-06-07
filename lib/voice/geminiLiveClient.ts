import { GoogleGenAI, Modality } from "@google/genai";
import { DOMAIN_MAP } from "@/lib/domains";

export type VoiceState =
  | "idle"
  | "connecting"
  | "listening"
  | "thinking"
  | "speaking"
  | "disconnected";

export interface TranscriptEntry {
  id: string;
  role: "user" | "ai";
  text: string;
}

export interface GeminiLiveCallbacks {
  onStateChange: (state: VoiceState) => void;
  onTranscript:  (entry: TranscriptEntry) => void;
  onAudioChunk:  (data: string, mimeType: string) => void;
  onInterrupt:   () => void;
  onError:       (error: Error) => void;
  fetchRagContext?: (query: string, domain: string) => Promise<string>;
}

function buildVoiceSystemInstruction(domain: string): string {
  const config = DOMAIN_MAP[domain] ?? DOMAIN_MAP["general"];

  return `You are LegalSathi, a voice assistant specializing in ${config.label} law in Nepal.

YOUR KNOWLEDGE:
- You have general knowledge about ${config.label} law in Nepal and can answer from that knowledge.
- When a <retrieved_legal_context> block is provided in the user message, prefer it and cite it.
- If no context block is present, answer from your general ${config.label} legal knowledge.

DOMAIN BOUNDARY:
- Only answer questions about ${config.label}. If the question is completely unrelated, say: "I can only help with ${config.label} questions in this session."
- Do not refuse questions that are genuinely about ${config.label}.

VOICE RULES:
- Short, natural sentences only. No markdown, bullets, or formatting.
- Keep answers to 2–4 sentences unless more detail is requested.
- Be calm and helpful.

LANGUAGE RULE:
- Always reply in the same language the user used. Never switch languages unless the user does first.`;
}

export class GeminiLiveClient {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private session: any = null;
  private callbacks: GeminiLiveCallbacks;
  private ai: GoogleGenAI;
  private domain: string;

  private pendingAiText   = "";
  private pendingUserText = "";
  private ragInFlight     = false;

  constructor(domain: string, callbacks: GeminiLiveCallbacks) {
    this.domain    = domain;
    this.callbacks = callbacks;
    this.ai = new GoogleGenAI({
      apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? "",
      httpOptions: { apiVersion: "v1beta" },
    });
  }

  async connect(): Promise<void> {
    console.log("[GeminiLive] connect() — domain:", this.domain);
    this.callbacks.onStateChange("connecting");

    this.session = await this.ai.live.connect({
      model: "gemini-3.1-flash-live-preview",
      config: {
        responseModalities: [Modality.AUDIO],
        // Transcribe what the user says (arrives as inputTranscription in messages)
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        systemInstruction: buildVoiceSystemInstruction(this.domain),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } },
          languageCode: "ne-NP",
        } as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        contextWindowCompression: {
          triggerTokens: 25600,
          slidingWindow: {},
        } as any,
      },
      callbacks: {
        onopen: () => {
          console.log("[GeminiLive] WebSocket opened");
          this.callbacks.onStateChange("listening");
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onmessage: (message: any) => this.handleMessage(message),
        onerror: (error: ErrorEvent) => {
          console.error("[GeminiLive] error:", error);
          this.session = null;
          this.callbacks.onError(new Error(error.message || "Connection error"));
          this.callbacks.onStateChange("disconnected");
        },
        onclose: (event: CloseEvent) => {
          console.warn("[GeminiLive] closed:", event.code, event.reason);
          this.session = null;
          this.callbacks.onStateChange("disconnected");
        },
      },
    });

    // Greeting
    const cfg = DOMAIN_MAP[this.domain] ?? DOMAIN_MAP["general"];
    this.session.sendClientContent({
      turns: [
        {
          role: "user",
          parts: [
            {
              text: `Say exactly this and nothing else: "नमस्ते! म LegalSathi AI हुँ र तपाईंलाई ${cfg.label} सम्बन्धी कानुनी प्रश्नहरूमा सहयोग गर्न यहाँ छु।"`,
            },
          ],
        },
      ],
      turnComplete: true,
    });
  }

  /** Stream a raw PCM16 audio chunk directly to Gemini Live. */
  sendAudioChunk(base64: string, mimeType: string): void {
    if (!this.session) return;
    this.session.sendRealtimeInput({ audio: { data: base64, mimeType } });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handleMessage(message: any): void {
    const sc = message?.serverContent;
    if (!sc) return;

    const { modelTurn, turnComplete, interrupted, outputTranscription, inputTranscription } = sc;

    if (interrupted) {
      this.pendingAiText   = "";
      this.pendingUserText = "";
      this.callbacks.onInterrupt();
      this.callbacks.onStateChange("listening");
      return;
    }

    // Gemini streams user speech transcription incrementally.
    if (inputTranscription?.text) {
      this.pendingUserText += inputTranscription.text;
    }

    // Gemini Live sends outputTranscription incrementally (one chunk per audio packet).
    // Accumulate with += so the full sentence is preserved at turnComplete.
    if (outputTranscription?.text) {
      this.pendingAiText += outputTranscription.text;
    }

    if (modelTurn?.parts) {
      // When the model starts generating, commit the accumulated user transcript
      // and kick off async RAG context injection for the next response.
      if (this.pendingUserText) {
        const userText = this.pendingUserText.trim();
        this.pendingUserText = "";
        if (userText) {
          this.callbacks.onTranscript({ id: crypto.randomUUID(), role: "user", text: userText });
          this.callbacks.onStateChange("thinking");
          // Async: fetch RAG and inject as additional context for next turn.
          void this.injectRagContext(userText);
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const part of modelTurn.parts as any[]) {
        if (part.inlineData) {
          this.callbacks.onStateChange("speaking");
          this.callbacks.onAudioChunk(
            part.inlineData.data,
            part.inlineData.mimeType ?? "audio/pcm;rate=24000"
          );
        }
      }
    }

    if (turnComplete) {
      if (this.pendingAiText) {
        this.callbacks.onTranscript({
          id:   crypto.randomUUID(),
          role: "ai",
          text: this.pendingAiText,
        });
        this.pendingAiText = "";
      }
      this.callbacks.onStateChange("listening");
    }
  }

  /** Fetch RAG context for the user's query and silently inject it into the session
   *  so the model can reference it when answering follow-up questions. */
  private async injectRagContext(query: string): Promise<void> {
    if (this.ragInFlight || !this.callbacks.fetchRagContext || query.length < 4) return;
    this.ragInFlight = true;
    try {
      const context = await this.callbacks.fetchRagContext(query, this.domain);
      if (context && this.session) {
        const label = (DOMAIN_MAP[this.domain] ?? DOMAIN_MAP["general"]).label;
        // Inject retrieved context as a "tool" turn so the model has it for its reply.
        this.session.sendClientContent({
          turns: [{
            role: "user",
            parts: [{ text:
              `<retrieved_legal_context>\n${context}\n</retrieved_legal_context>\n` +
              `Reference this context when answering about ${label}.`,
            }],
          }],
          turnComplete: false,
        });
        console.log("[GeminiLive] RAG context injected, chars:", context.length);
      }
    } catch (err) {
      console.warn("[GeminiLive] RAG inject failed:", err);
    } finally {
      this.ragInFlight = false;
    }
  }

  disconnect(): void {
    const s          = this.session;
    this.session     = null;
    this.ragInFlight = false;
    if (s) { try { s.close(); } catch { /* ignore */ } }
    this.pendingAiText   = "";
    this.pendingUserText = "";
  }

  isConnected(): boolean {
    return this.session !== null;
  }
}
