import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const conversations = await prisma.conversation.findMany({
    orderBy: { updatedAt: 'desc' },
    select: { id: true, title: true, domain: true, createdAt: true, updatedAt: true },
  })
  return Response.json(conversations)
}

export async function POST(request: NextRequest) {
  let domain = 'general'
  try {
    const body = await request.json()
    if (typeof body?.domain === 'string' && body.domain.trim()) {
      domain = body.domain.trim()
    }
  } catch { /* no body — use default */ }

  const conversation = await prisma.conversation.create({
    data: { title: 'New Chat', domain },
  })
  return Response.json(conversation, { status: 201 })
}
