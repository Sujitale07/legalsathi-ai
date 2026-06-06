"use client";

import { VoiceState } from "@/lib/voice/geminiLiveClient";

interface StatusConfig {
  label: string;
  dotClass: string;
  textClass: string;
}

const STATUS: Record<VoiceState, StatusConfig> = {
  idle:         { label: "Idle",          dotClass: "bg-gray-400",   textClass: "text-gray-500"  },
  connecting:   { label: "Connecting...", dotClass: "bg-yellow-400 animate-pulse", textClass: "text-yellow-600" },
  listening:    { label: "Listening...",  dotClass: "bg-green-400 animate-pulse",  textClass: "text-green-600"  },
  thinking:     { label: "Thinking...",   dotClass: "bg-blue-400 animate-pulse",   textClass: "text-blue-600"   },
  speaking:     { label: "Speaking...",   dotClass: "bg-purple-400 animate-pulse", textClass: "text-purple-600" },
  disconnected: { label: "Disconnected",  dotClass: "bg-red-400",    textClass: "text-red-500"   },
};

interface Props {
  state: VoiceState;
}

export function SessionStatus({ state }: Props) {
  const cfg = STATUS[state];
  return (
    <div className="flex items-center gap-2">
      <span className={`w-2.5 h-2.5 rounded-full ${cfg.dotClass}`} />
      <span className={`text-sm font-medium ${cfg.textClass}`}>{cfg.label}</span>
    </div>
  );
}
