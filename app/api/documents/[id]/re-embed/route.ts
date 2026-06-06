import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateEmbeddingsBatch } from '@/lib/embeddings'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

const DB_BATCH_SIZE = 50

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const doc = await prisma.document.findUnique({
    where: { id },
    select: { id: true, title: true, status: true },
  })
  if (!doc) return Response.json({ error: 'Not found' }, { status: 404 })

  // Find chunks with null embeddings
  const nullChunks = await prisma.$queryRaw<{ id: string; content: string; chunkIndex: number }[]>`
    SELECT id, content, "chunkIndex"
    FROM "DocumentChunk"
    WHERE "documentId" = ${id}
      AND embedding IS NULL
    ORDER BY "chunkIndex" ASC
  `

  if (nullChunks.length === 0) {
    return Response.json({ message: 'All chunks already have embeddings', fixed: 0 })
  }

  // Mark as processing while we re-embed
  await prisma.document.update({ where: { id }, data: { status: 'processing' } })

  // Re-embed in background
  reEmbed(id, nullChunks).catch(async (err) => {
    console.error(`[re-embed] ${id} failed:`, err)
    await prisma.document.update({ where: { id }, data: { status: 'failed' } })
  })

  return Response.json({ message: `Re-embedding ${nullChunks.length} chunks`, chunks: nullChunks.length }, { status: 202 })
}

async function reEmbed(documentId: string, chunks: { id: string; content: string }[]) {
  const embeddings = await generateEmbeddingsBatch(chunks.map((c) => c.content))

  for (let i = 0; i < chunks.length; i += DB_BATCH_SIZE) {
    await Promise.all(
      chunks.slice(i, i + DB_BATCH_SIZE).map((chunk, j) => {
        const vec = `[${embeddings[i + j].join(',')}]`
        return prisma.$executeRaw`
          UPDATE "DocumentChunk"
          SET embedding = ${vec}::vector
          WHERE id = ${chunk.id}
        `
      })
    )
  }

  await prisma.document.update({ where: { id: documentId }, data: { status: 'ready' } })
  console.log(`[re-embed] ${documentId} — done`)
}
