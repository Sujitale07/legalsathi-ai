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
      createdAt: true,
      _count: { select: { chunks: true } },
    },
  })
  if (!doc) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json(doc)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.document.delete({ where: { id } })
  return new Response(null, { status: 204 })
}
