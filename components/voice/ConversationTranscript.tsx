"use client";

import { useEffect, useRef } from "react";
import { TranscriptEntry } from "@/lib/voice/geminiLiveClient";

interface Props {
  entries: TranscriptEntry[];
}

export function ConversationTranscript({ entries }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries]);

  return (
    <div className="w-full max-w-lg rounded-xl border border-[var(--color-app-border)] bg-[var(--color-app-surface)] overflow-hidden">
      <div className="px-4 py-2.5 border-b border-[var(--color-app-border)]">
        <span className="text-xs font-semibold text-[var(--color-app-text-muted)] uppercase tracking-wide">
          Conversation Transcript
        </span>
      </div>

      <div className="h-60 overflow-y-auto p-4 scroll-area">
        {entries.length === 0 ? (
          <p className="text-sm text-[var(--color-app-text-subtle)] text-center mt-8">
            Conversation will appear here once you start talking.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className={`flex gap-2 ${entry.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    entry.role === "user"
                      ? "bg-[var(--color-app-accent)] text-white"
                      : "bg-[var(--color-app-surface-hover)] text-[var(--color-app-text)]"
                  }`}
                >
                  <span className="block text-[10px] font-semibold uppercase tracking-wide opacity-60 mb-0.5">
                    {entry.role === "user" ? "You" : "AI"}
                  </span>
                  {entry.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
    </div>
  );
}
