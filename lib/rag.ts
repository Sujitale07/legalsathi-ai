import { prisma } from './prisma'
import { generateEmbedding } from './embeddings'

type RetrievedChunk = { id: string; content: string; similarity: number }

export async function retrieveRelevantChunks(query: string, limit = 5): Promise<RetrievedChunk[]> {
  const queryEmbedding = await generateEmbedding(query)
  const embeddingString = `[${queryEmbedding.join(',')}]`

  const results = await prisma.$queryRaw<RetrievedChunk[]>`
    SELECT id, content, 1 - (embedding <=> ${embeddingString}::vector) AS similarity
    FROM "DocumentChunk"
    WHERE embedding IS NOT NULL
    ORDER BY embedding <=> ${embeddingString}::vector
    LIMIT ${limit}
  `

  return results
}

export function buildSystemPrompt(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) {
    return `You are LegalSathi, an AI legal assistant. Answer questions helpfully and clearly. If you are unsure about something, say so and recommend consulting a qualified lawyer.`
  }

  const context = chunks.map((c, i) => `[${i + 1}] ${c.content}`).join('\n\n')

  return `You are LegalSathi, an AI legal assistant. Use the following excerpts from legal documents to answer the user's question. Cite the excerpt numbers when referencing them. If the answer isn't in the provided context, say so and provide general guidance.

CONTEXT:
${context}`
}
