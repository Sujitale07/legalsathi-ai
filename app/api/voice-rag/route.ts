import { NextRequest, NextResponse } from "next/server";
import { retrieveRelevantChunks } from "@/lib/rag";

export async function POST(req: NextRequest) {
  try {
    const { query, domain = "general" } = await req.json();
    if (!query || typeof query !== "string" || query.trim().length < 5) {
      return NextResponse.json({ context: "" });
    }

    const chunks = await retrieveRelevantChunks(query.trim(), domain);
    if (chunks.length === 0) {
      return NextResponse.json({ context: "" });
    }

    const context = chunks
      .map(
        (c, i) =>
          `[Source ${i + 1}] ${c.documentTitle} (chunk ${c.chunkIndex + 1}/${c.totalChunks})\n${c.content}`
      )
      .join("\n\n---\n\n");

    return NextResponse.json({ context });
  } catch (err) {
    console.error("[voice-rag] retrieval error:", err);
    return NextResponse.json({ context: "" });
  }
}
