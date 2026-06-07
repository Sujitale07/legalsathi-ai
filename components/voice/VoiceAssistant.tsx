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
        <div className={`${mid} rounded-full border-4 border-app-accent border-t-transparent animate-spin`} />
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
      <span className={`${mid} rounded-full bg-app-border block`} />
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

  const clientRef        = useRef<GeminiLiveClient | null>(null);
  const captureRef       = useRef<AudioCapture | null>(null);
  const playbackRef      = useRef<AudioPlayback | null>(null);
  const cleaningRef      = useRef(false);
  const didStart         = useRef(false);
  const userStoppedRef   = useRef(false);   // true when the user explicitly clicked Stop
  const autoReconnectRef = useRef(0);       // counts server-initiated disconnects; resets on user stop
  // Stable ref so the onStateChange closure always calls the latest handleStart
  // without capturing it as a dep (which would rebuild the client on every render).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleStartRef   = useRef<(preserveTranscript?: boolean) => Promise<void>>(null as any);

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

  const handleStart = useCallback(async (preserveTranscript = false) => {
    userStoppedRef.current = false;    // user is starting — allow auto-reconnect again
    setError(null);
    if (!preserveTranscript) setTranscript([]);

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
            const micWasRunning = captureRef.current !== null;
            captureRef.current?.stop();
            captureRef.current  = null;
            playbackRef.current?.stop();
            playbackRef.current = null;
            clientRef.current   = null;

            // Auto-reconnect when Gemini drops the session (code 1000 inactivity timeout)
            // and the user hasn't clicked Stop. Limit to 3 attempts to avoid infinite loops.
            if (micWasRunning && !userStoppedRef.current && !cleaningRef.current
                && autoReconnectRef.current < 3) {
              autoReconnectRef.current += 1;
              console.log(`[VoiceAssistant] Gemini dropped session, auto-reconnect #${autoReconnectRef.current}`);
              setTimeout(() => {
                if (!cleaningRef.current && !userStoppedRef.current) {
                  void handleStartRef.current(true); // preserve transcript on reconnect
                }
              }, 1500);
            }
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
        (b64, mime) => client.sendAudioChunk(b64, mime), // stream PCM16 directly to Gemini Live
        // Don't cut the AI off on our own naive amplitude-threshold VAD — it
        // fires on echo, background noise, or breathing and was chopping
        // answers off mid-sentence. Gemini Live's own server-side turn
        // detection sends `interrupted` (wired to onInterrupt below) only
        // when the user genuinely starts a new question — that's the sole
        // signal that should stop playback, so the AI always finishes its
        // current answer first.
        ()          => {},                               // local speech start — no barge-in
        ()          => {},                               // speech end (Gemini handles VAD)
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

  // Keep the ref in sync so the onStateChange closure always has the latest version.
  useEffect(() => { handleStartRef.current = handleStart; }, [handleStart]);

  // Auto-start on mount. Reset didStart on cleanup so React StrictMode's
  // fake unmount+remount cycle re-triggers handleStart on the live instance.
  useEffect(() => {
    if (autoStart && !didStart.current) {
      didStart.current = true;
      userStoppedRef.current   = false;
      autoReconnectRef.current = 0;
      handleStart();
    }
    return () => {
      didStart.current = false;
    };
  }, [autoStart, handleStart]);

  const handleEnd = useCallback(() => {
    userStoppedRef.current   = true;   // prevent auto-reconnect
    autoReconnectRef.current = 0;
    cleanup();
    setState("idle");
    onClose?.();
  }, [cleanup, onClose]);

  // ── Compact mode — inline inside the chat input area ─────────────────────
  if (compact) {
    const recent = transcript.slice(-4);
    const disconnected = state === "disconnected" || state === "idle";
    return (
      <div className="flex flex-col gap-3 w-full">

        {/* Orb + status + Stop / Reconnect */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <VoiceOrb state={state} compact />
            <div>
              <p className="text-[11px] font-semibold text-app-accent">
                {domainConfig.icon} {domainConfig.label}
              </p>
              <SessionStatus state={state} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {disconnected && (
              <button
                type="button"
                onClick={() => { setError(null); handleStart(); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[12px] font-medium bg-app-accent text-white hover:opacity-90 transition-opacity"
              >
                🎙 Reconnect
              </button>
            )}
            <button
              type="button"
              onClick={handleEnd}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[12px] font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              <StopCircleIcon className="w-3.5 h-3.5" />
              {disconnected ? "Close" : "Stop"}
            </button>
          </div>
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
                  e.role === "user" ? "text-right text-app-text" : "text-left text-app-accent"
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
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-app-accent-light text-app-accent border border-[#C8D4E8]">
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
          onClick={() => void handleStart()}
          disabled={busy}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium bg-app-accent text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
