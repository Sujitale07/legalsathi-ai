import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

/** Append a single message to a conversation without running the AI pipeline —
 *  used by the voice assistant to persist its own turns (user + AI transcript)
 *  so a voice session is saved as a real chat with reusable history, the same
 *  way text messages are. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  let body: { role?: string; content?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { role, content } = body
  if ((role !== 'user' && role !== 'assistant') || !content?.trim()) {
    return Response.json({ error: 'role (user|assistant) and content are required' }, { status: 400 })
  }

  const conversation = await prisma.conversation.findUnique({ where: { id } })
  if (!conversation) {
    return Response.json({ error: 'Conversation not found' }, { status: 404 })
  }

  const message = await prisma.message.create({
    data: { role, content: content.trim(), conversationId: id },
  })

  // Give voice chats a real title from the first thing the user says — mirrors
  // the text-chat fallback title so they show up meaningfully in history.
  if (role === 'user' && (conversation.title === 'New Chat' || conversation.title === 'New chat')) {
    const fallback = content.length > 60 ? content.slice(0, 57).trimEnd() + '…' : content
    await prisma.conversation.update({ where: { id }, data: { title: fallback } })
  }

  return Response.json(message, { status: 201 })
}
