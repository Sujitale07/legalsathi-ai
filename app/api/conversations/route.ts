import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const conversations = await prisma.conversation.findMany({
    orderBy: { updatedAt: 'desc' },
    select: { id: true, title: true, createdAt: true, updatedAt: true },
  })
  return Response.json(conversations)
}

export async function POST(_request: NextRequest) {
  const conversation = await prisma.conversation.create({
    data: { title: 'New Chat' },
  })
  return Response.json(conversation, { status: 201 })
}
