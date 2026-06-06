import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { chunkText, generateEmbeddingsBatch } from '@/lib/embeddings'

export async function GET() {
  const documents = await prisma.document.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      status: true,
      fileType: true,
      createdAt: true,
      _count: { select: { chunks: true } },
    },
  })
  return Response.json(documents)
}

export async function POST(request: NextRequest) {
  const { title, content } = await request.json()

  if (!title?.trim() || !content?.trim()) {
    return Response.json({ error: 'title and content are required' }, { status: 400 })
  }

  // Create document immediately so the UI can show it as "processing"
  const document = await prisma.document.create({
    data: { title: title.trim(), status: 'processing' },
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

async function ingestDocument(documentId: string, content: string) {
  const chunks = chunkText(content)

  if (chunks.length === 0) {
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'failed' },
    })
    return
  }

  // Create all chunk rows first (no embedding yet)
  const created = await Promise.all(
    chunks.map((c) =>
      prisma.documentChunk.create({
        data: {
          content: c.content,
          chunkIndex: c.chunkIndex,
          totalChunks: c.totalChunks,
          documentId,
        },
      })
    )
  )

  // Generate all embeddings in batches
  const embeddings = await generateEmbeddingsBatch(chunks.map((c) => c.content))

  // Write embeddings back with raw SQL (pgvector type)
  await Promise.all(
    created.map((chunk, i) => {
      const vec = `[${embeddings[i].join(',')}]`
      return prisma.$executeRaw`
        UPDATE "DocumentChunk"
        SET embedding = ${vec}::vector
        WHERE id = ${chunk.id}
      `
    })
  )

  await prisma.document.update({
    where: { id: documentId },
    data: { status: 'ready' },
  })
}
