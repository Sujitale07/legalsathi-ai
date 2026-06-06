import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateEmbedding, chunkText } from '@/lib/embeddings'

export async function GET() {
  const documents = await prisma.document.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { chunks: true } } },
  })
  return Response.json(documents)
}

export async function POST(request: NextRequest) {
  const { title, content } = await request.json()

  if (!title || !content) {
    return Response.json({ error: 'title and content are required' }, { status: 400 })
  }

  const document = await prisma.document.create({ data: { title } })

  const textChunks = chunkText(content)

  await Promise.all(
    textChunks.map(async (chunkContent) => {
      const chunk = await prisma.documentChunk.create({
        data: { content: chunkContent, documentId: document.id },
      })

      const embedding = await generateEmbedding(chunkContent)
      const embeddingString = `[${embedding.join(',')}]`

      await prisma.$executeRaw`
        UPDATE "DocumentChunk"
        SET embedding = ${embeddingString}::vector
        WHERE id = ${chunk.id}
      `
    })
  )

  return Response.json({ id: document.id, title, chunks: textChunks.length }, { status: 201 })
}
