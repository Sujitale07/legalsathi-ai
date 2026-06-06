import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const doc = await prisma.document.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      status: true,
      domain: true,
      createdAt: true,
      _count: { select: { chunks: true } },
      chunks: {
        select: {
          id: true,
          content: true,
          chunkIndex: true,
          totalChunks: true,
          createdAt: true,
        },
        orderBy: { chunkIndex: 'asc' },
      },
    },
  })

  // Count chunks with null embeddings
  const nullEmbedCount = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*)::int as count FROM "DocumentChunk"
    WHERE "documentId" = ${id} AND embedding IS NULL
  `
  if (!doc) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json({ ...doc, nullEmbedCount: Number(nullEmbedCount[0]?.count ?? 0) })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.document.deleteMany({ where: { id } })
  return new Response(null, { status: 204 })
}
