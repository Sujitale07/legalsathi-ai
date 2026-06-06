import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { chunkText, generateEmbeddingsBatch } from '@/lib/embeddings'

// Allow large PDF text payloads
export const maxDuration = 60
export const dynamic = 'force-dynamic'

export async function GET() {
  const documents = await prisma.document.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      status: true,
      fileType: true,
      domain: true,
      createdAt: true,
      _count: { select: { chunks: true } },
    },
  })
  return Response.json(documents)
}

export async function POST(request: NextRequest) {
  const { title, content, fileType, domain } = await request.json()

  if (!title?.trim() || !content?.trim()) {
    return Response.json({ error: 'title and content are required' }, { status: 400 })
  }

  const document = await prisma.document.create({
    data: {
      title: title.trim(),
      status: 'processing',
      fileType: typeof fileType === 'string' ? fileType.trim() : 'text',
      domain: typeof domain === 'string' && domain.trim() ? domain.trim() : 'general',
    },
  })

  // Run ingest in the background — do NOT await
  ingestDocument(document.id, content).catch(async (err) => {
    console.error(`[ingest] document ${document.id} failed:`, err)
    await prisma.document.update({
      where: { id: document.id },
      data: { status: 'failed' },
    })
  })

  return Response.json({ id: document.id, title: document.title, status: 'processing' }, { status: 202 })
}

const DB_BATCH_SIZE = 50 // insert chunks in batches to avoid overwhelming the connection pool

async function ingestDocument(documentId: string, content: string) {
  const chunks = chunkText(content)

  if (chunks.length === 0) {
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'failed' },
    })
    return
  }

  console.log(`[ingest] ${documentId} — ${chunks.length} chunks`)

  // Insert chunk rows in batches (sequential to avoid connection pool exhaustion)
  const created: { id: string }[] = []
  for (let i = 0; i < chunks.length; i += DB_BATCH_SIZE) {
    const batch = chunks.slice(i, i + DB_BATCH_SIZE)
    const rows = await Promise.all(
      batch.map((c) =>
        prisma.documentChunk.create({
          data: {
            content: c.content,
            chunkIndex: c.chunkIndex,
            totalChunks: c.totalChunks,
            documentId,
          },
          select: { id: true },
        })
      )
    )
    created.push(...rows)
  }

  // Generate embeddings in batches (generateEmbeddingsBatch already batches at 50)
  const embeddings = await generateEmbeddingsBatch(chunks.map((c) => c.content))

  // Write embeddings back in batches
  for (let i = 0; i < created.length; i += DB_BATCH_SIZE) {
    await Promise.all(
      created.slice(i, i + DB_BATCH_SIZE).map((chunk, j) => {
        const vec = `[${embeddings[i + j].join(',')}]`
        return prisma.$executeRaw`
          UPDATE "DocumentChunk"
          SET embedding = ${vec}::vector
          WHERE id = ${chunk.id}
        `
      })
    )
  }

  await prisma.document.update({
    where: { id: documentId },
    data: { status: 'ready' },
  })

  console.log(`[ingest] ${documentId} — done`)
}
