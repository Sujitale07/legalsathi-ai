"use client";

import { AudioLinesIcon, StopCircleIcon } from "lucide-react";
import { VoiceState } from "@/lib/voice/geminiLiveClient";

interface Props {
  state: VoiceState;
  onStart: () => void;
  onEnd: () => void;
}

export function VoiceButton({ state, onStart, onEnd }: Props) {
  const active = state === "listening" || state === "thinking" || state === "speaking";
  const busy = state === "connecting";

  if (active) {
    return (
      <button
        type="button"
        onClick={onEnd}
        className="
          flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors
          bg-red-500 text-white hover:bg-red-600
        "
      >
        <StopCircleIcon className="w-4 h-4" />
        Stop
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onStart}
      disabled={busy}
      className="
        flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors
        bg-[var(--color-app-accent)] text-white
        hover:bg-[var(--color-app-accent-hover)]
        disabled:opacity-40 disabled:cursor-not-allowed
      "
    >
      {busy ? (
        <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
      ) : (
        <AudioLinesIcon className="w-4 h-4" />
      )}
      {busy ? "Connecting..." : "Start Conversation"}
    </button>
  );
}
