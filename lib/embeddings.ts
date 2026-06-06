import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: (process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY)! })

const EMBED_MODEL      = 'gemini-embedding-2'
const EMBED_DIMS       = 768
const BATCH_SIZE       = 50   // max inputs per Gemini embedContent call
const MAX_RETRIES      = 3
const RETRY_BASE_MS    = 1000

// ─── Types ────────────────────────────────────────────────────────────────────

export type Chunk = {
  content: string
  chunkIndex: number
  totalChunks: number
}

const TARGET_WORDS      = 400
const OVERLAP_SENTENCES = 2
const MIN_WORDS         = 30

function splitSentences(text: string): string[] {
  return text
    .replace(/\r\n/g, '\n')
    .split(/(?<=[.!?])\s+(?=[A-Z"''"])|(?<=\n)\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

export function chunkText(text: string): Chunk[] {
  const sentences = splitSentences(text)
  const rawChunks: string[] = []

  let current: string[] = []
  let wordCount = 0

  for (const sentence of sentences) {
    const words = sentence.split(/\s+/).length
    current.push(sentence)
    wordCount += words

    if (wordCount >= TARGET_WORDS) {
      rawChunks.push(current.join(' '))
      current   = current.slice(-OVERLAP_SENTENCES)
      wordCount = current.reduce((n, s) => n + s.split(/\s+/).length, 0)
    }
  }

  if (current.length > 0) rawChunks.push(current.join(' '))

  const filtered = rawChunks.filter((c) => c.split(/\s+/).length >= MIN_WORDS)
  const total    = filtered.length

  return filtered.map((content, i) => ({ content, chunkIndex: i, totalChunks: total }))
}

// ─── Retry helper ─────────────────────────────────────────────────────────────

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let attempt = 0
  while (true) {
    try {
      return await fn()
    } catch (err: unknown) {
      attempt++
      const status = (err as { status?: number }).status ?? 0
      if (attempt >= MAX_RETRIES || (status !== 429 && status < 500)) throw err
      await sleep(RETRY_BASE_MS * 2 ** (attempt - 1))
    }
  }
}

// ─── Single embedding (for query-time retrieval) ──────────────────────────────

export async function generateEmbedding(text: string): Promise<number[]> {
  const res = await withRetry(() =>
    ai.models.embedContent({
      model: EMBED_MODEL,
      contents: [text.replace(/\n/g, ' ')],
      config: { outputDimensionality: EMBED_DIMS },
    })
  )
  const values = res.embeddings?.[0]?.values
  if (!values) throw new Error('Gemini embedContent returned no values')
  return values
}

// ─── Batched embeddings (for document ingest) ─────────────────────────────────
//
// Groups texts into batches of BATCH_SIZE, retries each batch independently
// on 429 / 5xx. Returns embeddings in the same order as the input.

export async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  const results: number[][] = []

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch     = texts.slice(i, i + BATCH_SIZE).map((t) => t.replace(/\n/g, ' '))
    const res       = await withRetry(() =>
      ai.models.embedContent({
        model: EMBED_MODEL,
        contents: batch.map(text => ({ role: 'user', parts: [{ text }] })),
        config: { outputDimensionality: EMBED_DIMS },
      })
    )
    const embeddings = res.embeddings ?? []
    if (embeddings.length !== batch.length) {
      throw new Error(`Gemini returned ${embeddings.length} embeddings for ${batch.length} inputs`)
    }
    results.push(...embeddings.map((e) => e.values ?? []))
  }

  return results
}
