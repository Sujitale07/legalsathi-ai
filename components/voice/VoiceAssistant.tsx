"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  GeminiLiveClient,
  VoiceState,
  TranscriptEntry,
} from "@/lib/voice/geminiLiveClient";
import { AudioCapture } from "@/lib/voice/audioCapture";
import { AudioPlayback } from "@/lib/voice/audioPlayback";
import { SessionStatus } from "./SessionStatus";
import { ConversationTranscript } from "./ConversationTranscript";
import { DOMAIN_MAP } from "@/lib/domains";
import { StopCircleIcon } from "lucide-react";

// ─── Orb ─────────────────────────────────────────────────────────────────────

function VoiceOrb({ state, compact }: { state: VoiceState; compact?: boolean }) {
  const outer = compact ? "w-10 h-10" : "w-20 h-20";
  const mid   = compact ? "w-7 h-7"  : "w-14 h-14";
  const dot   = compact ? "w-5 h-5"  : "w-9 h-9";

  if (state === "connecting" || state === "thinking") {
    return (
      <div className={`${outer} flex items-center justify-center`}>
        <div className={`${mid} rounded-full border-4 border-[var(--color-app-accent)] border-t-transparent animate-spin`} />
      </div>
    );
  }
  if (state === "listening") {
    return (
      <div className={`relative ${outer} flex items-center justify-center`}>
        <span className={`absolute ${outer} rounded-full bg-green-400/20 animate-ping`} />
        <span className={`absolute ${mid} rounded-full bg-green-400/30 animate-pulse`} />
        <span className={`${dot} rounded-full bg-green-500 block`} />
      </div>
    );
  }
  if (state === "speaking") {
    return (
      <div className={`relative ${outer} flex items-center justify-center`}>
        <span className={`absolute ${outer} rounded-full border-2 border-purple-400 animate-ping opacity-40`} />
        <span
          className={`absolute ${mid} rounded-full border-2 border-purple-400 animate-ping opacity-60`}
          style={{ animationDelay: "200ms" }}
        />
        <span className={`${dot} rounded-full bg-purple-500 block`} />
      </div>
    );
  }
  return (
    <div className={`${outer} flex items-center justify-center`}>
      <span className={`${mid} rounded-full bg-[var(--color-app-border)] block`} />
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  domain: string;
  /** Called when the user stops or closes the voice session */
  onClose?: () => void;
  /** Immediately starts the session on mount — no "Start" button shown */
  autoStart?: boolean;
  /** Renders a compact inline bar (no title, smaller orb, no transcript panel) */
  compact?: boolean;
}

export function VoiceAssistant({
  domain,
  onClose,
  autoStart = false,
  compact = false,
}: Props) {
  const [state, setState]       = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [error, setError]       = useState<string | null>(null);

  const clientRef   = useRef<GeminiLiveClient | null>(null);
  const captureRef  = useRef<AudioCapture | null>(null);
  const playbackRef = useRef<AudioPlayback | null>(null);
  const cleaningRef = useRef(false);
  const didStart    = useRef(false);

  const domainConfig = DOMAIN_MAP[domain] ?? DOMAIN_MAP["general"];

  const cleanup = useCallback(() => {
    if (cleaningRef.current) return;
    cleaningRef.current = true;
    captureRef.current?.stop();
    clientRef.current?.disconnect();
    playbackRef.current?.stop();
    captureRef.current  = null;
    clientRef.current   = null;
    playbackRef.current = null;
    cleaningRef.current = false;
  }, []);

  // Disconnect when parent unmounts the component (voiceOpen = false)
  useEffect(() => () => { cleanup(); }, [cleanup]);

  const handleStart = useCallback(async () => {
    setError(null);
    setTranscript([]);

    const playback = new AudioPlayback();
    playbackRef.current = playback;

    const fetchRagContext = async (query: string, d: string): Promise<string> => {
      try {
        const res = await fetch("/api/voice-rag", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, domain: d }),
        });
        return (await res.json()).context ?? "";
      } catch {
        return "";
      }
    };

    const client = new GeminiLiveClient(domain, {
      fetchRagContext,
      onStateChange: (s) => {
        setState(s);
        if (s === "disconnected") {
          // Guard: only touch shared refs when this is still the active session.
          // Without this, a stale session's onclose fires after the new session
          // has already written its own instances into the refs, killing the new session.
          if (clientRef.current === client) {
            captureRef.current?.stop();
            captureRef.current  = null;
            playbackRef.current?.stop();
            playbackRef.current = null;
            clientRef.current   = null;
          }
        }
      },
      onTranscript: (entry) => setTranscript((p) => [...p, entry]),
      onAudioChunk: (data, mimeType) => playback.queueChunk(data, mimeType),
      onInterrupt:  () => { playbackRef.current?.clearQueue(); },
      onError:      (err) => setError(err.message),
    });
    clientRef.current = client;

    try {
      await client.connect();
    } catch (err) {
      // Only tear down if this session is still the active one.
      // If playbackRef changed, a newer session took over — don't interfere.
      if (playbackRef.current === playback) {
        setError(err instanceof Error ? err.message : "Failed to start session");
        setState("disconnected");
        cleanup();
      }
      return;
    }

    // React StrictMode unmounts + remounts in dev. If cleanup ran while we were
    // awaiting connect(), playbackRef will have been nulled or replaced — abort
    // this stale session so the fresh one (started on remount) takes over.
    if (playbackRef.current !== playback) {
      try { client.disconnect(); } catch { /* ignore */ }
      try { playback.stop(); } catch { /* ignore — context may already be closed */ }
      return;
    }

    try {
      const capture = new AudioCapture(
        (text) => void client.endUserTurn(text), // Web Speech API final transcript → RAG → Gemini
        ()     => { playback.clearQueue(); setState("listening"); }, // barge-in: cut model audio
        ()     => {},                            // speech end (no-op — transcript fires instead)
      );
      captureRef.current = capture;
      await capture.start();
    } catch (err) {
      if (playbackRef.current === playback) {
        setError(err instanceof Error ? err.message : "Failed to start mic");
        setState("disconnected");
        cleanup();
      }
    }
  }, [domain, cleanup]);

  // Auto-start on mount. Reset didStart on cleanup so React StrictMode's
  // fake unmount+remount cycle re-triggers handleStart on the live instance.
  useEffect(() => {
    if (autoStart && !didStart.current) {
      didStart.current = true;
      handleStart();
    }
    return () => {
      didStart.current = false;
    };
  }, [autoStart, handleStart]);

  const handleEnd = useCallback(() => {
    cleanup();
    setState("idle");
    onClose?.();
  }, [cleanup, onClose]);

  // ── Compact mode — inline inside the chat input area ─────────────────────
  if (compact) {
    const recent = transcript.slice(-4);
    return (
      <div className="flex flex-col gap-3 w-full">

        {/* Orb + status + Stop */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <VoiceOrb state={state} compact />
            <div>
              <p className="text-[11px] font-semibold text-[#1E2E4F]">
                {domainConfig.icon} {domainConfig.label}
              </p>
              <SessionStatus state={state} />
            </div>
          </div>

          <button
            type="button"
            onClick={handleEnd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[12px] font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            <StopCircleIcon className="w-3.5 h-3.5" />
            Stop
          </button>
        </div>

        {error && (
          <p className="text-[12px] text-red-600 bg-red-50 border border-red-200 rounded px-3 py-1.5">
            {error}
          </p>
        )}

        {/* Recent transcript */}
        {recent.length > 0 && (
          <div className="space-y-1 max-h-24 overflow-y-auto border-t border-app-border pt-2">
            {recent.map((e) => (
              <p
                key={e.id}
                className={`text-[12px] leading-snug ${
                  e.role === "user" ? "text-right text-app-text" : "text-left text-[#1E2E4F]"
                }`}
              >
                <span className="opacity-40 text-[10px] mr-1">
                  {e.role === "user" ? "You" : "LegalSathi"}
                </span>
                {e.text}
              </p>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Full / standalone mode (/voice page or full modal) ────────────────────
  const active = state === "listening" || state === "thinking" || state === "speaking";
  const busy   = state === "connecting";

  return (
    <div className="flex flex-col items-center gap-5 p-6 w-full">

      {/* Domain badge + close */}
      <div className="flex items-center justify-between w-full">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#E8ECF4] text-[#1E2E4F] border border-[#C8D4E8]">
          {domainConfig.icon} {domainConfig.label} · locked
        </span>
        {onClose && (
          <button
            type="button"
            onClick={() => { cleanup(); onClose(); }}
            className="text-[11px] text-app-text-subtle hover:text-app-text transition-colors px-2 py-1 rounded"
          >
            ✕ Close
          </button>
        )}
      </div>

      <SessionStatus state={state} />
      <VoiceOrb state={state} />

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 w-full text-center">
          {error}
        </div>
      )}

      {active ? (
        <button
          type="button"
          onClick={handleEnd}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
        >
          <StopCircleIcon className="w-4 h-4" /> Stop
        </button>
      ) : (
        <button
          type="button"
          onClick={handleStart}
          disabled={busy}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium bg-[var(--color-app-accent)] text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {busy
            ? <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            : <span>🎙</span>
          }
          {busy ? "Connecting..." : "Start Conversation"}
        </button>
      )}

      <ConversationTranscript entries={transcript} />
    </div>
  );
}
