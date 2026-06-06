import { prisma } from './prisma'
import { generateEmbedding } from './embeddings'

// ─── Types ────────────────────────────────────────────────────────────────────

export type RetrievedChunk = {
  id: string
  content: string
  similarity: number
  documentId: string
  documentTitle: string
  chunkIndex: number
  totalChunks: number
}

export type Source = {
  documentId: string
  documentTitle: string
  chunkIndex: number
  totalChunks: number
}

// ─── Config ───────────────────────────────────────────────────────────────────

const SIMILARITY_THRESHOLD  = 0.50   // discard chunks below this cosine similarity
const MAX_CHUNKS            = 6      // max chunks to retrieve
const MAX_CONTEXT_WORDS     = 2000   // hard cap on total words sent to Claude
const DEDUP_SIMILARITY_GAP  = 0.02   // drop a chunk if a better one from same doc is within this gap

// ─── Retrieval ────────────────────────────────────────────────────────────────

export async function retrieveRelevantChunks(query: string): Promise<RetrievedChunk[]> {
  const queryEmbedding = await generateEmbedding(query)
  const vec            = `[${queryEmbedding.join(',')}]`

  // Raw SQL: cosine similarity via pgvector <=> operator, join Document for title
  const rows = await prisma.$queryRaw<RetrievedChunk[]>`
    SELECT
      dc.id,
      dc.content,
      dc."chunkIndex",
      dc."totalChunks",
      dc."documentId",
      d.title AS "documentTitle",
      1 - (dc.embedding <=> ${vec}::vector) AS similarity
    FROM   "DocumentChunk" dc
    JOIN   "Document"      d  ON d.id = dc."documentId"
    WHERE  dc.embedding IS NOT NULL
      AND  d.status = 'ready'
      AND  1 - (dc.embedding <=> ${vec}::vector) >= ${SIMILARITY_THRESHOLD}
    ORDER  BY dc.embedding <=> ${vec}::vector
    LIMIT  ${MAX_CHUNKS * 2}
  `

  // ── Deduplicate: keep only the highest-scoring chunk per (documentId, close similarity) ──
  const seen = new Map<string, number>()   // documentId -> best similarity so far
  const deduped: RetrievedChunk[] = []

  for (const row of rows) {
    const best = seen.get(row.documentId) ?? -1
    if (row.similarity >= best - DEDUP_SIMILARITY_GAP) {
      if (row.similarity > best) {
        seen.set(row.documentId, row.similarity)
        deduped.push(row)
      }
    } else {
      deduped.push(row)
    }
  }

  // ── Context budget: drop chunks that would exceed MAX_CONTEXT_WORDS ──
  const budget: RetrievedChunk[] = []
  let totalWords = 0

  for (const chunk of deduped.slice(0, MAX_CHUNKS)) {
    const words = chunk.content.split(/\s+/).length
    if (totalWords + words > MAX_CONTEXT_WORDS) break
    budget.push(chunk)
    totalWords += words
  }

  return budget
}

// ─── Prompt builder ───────────────────────────────────────────────────────────

export function buildSystemPrompt(chunks: RetrievedChunk[]): { system: string; sources: Source[] } {
  const sources: Source[] = chunks.map((c) => ({
    documentId:    c.documentId,
    documentTitle: c.documentTitle,
    chunkIndex:    c.chunkIndex,
    totalChunks:   c.totalChunks,
  }))

  if (chunks.length === 0) {
    return {
      system: `You are LegalSathi, an AI legal assistant specialising in Nepali law.
Answer the user's question clearly and concisely.
If you are not certain of an answer, say so and recommend consulting a qualified lawyer.
Never fabricate citations, statutes, or case references.`,
      sources: [],
    }
  }

  const context = chunks
    .map(
      (c, i) =>
        `[Source ${i + 1}] ${c.documentTitle} — chunk ${c.chunkIndex + 1} of ${c.totalChunks}\n${c.content}`
    )
    .join('\n\n---\n\n')

  return {
    system: `You are LegalSathi, an AI legal assistant specialising in Nepali law.
Use the following excerpts retrieved from the user's legal documents to answer their question.
When you use information from a source, cite it inline as [Source N].
If the answer is not in the provided context, say so clearly — do not fabricate information.
Never invent statutes, section numbers, or case names.

CONTEXT:
${context}`,
    sources,
  }
}
