import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/prisma'
import { retrieveRelevantChunks, buildSystemPrompt } from '@/lib/rag'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  const { conversationId, message } = await request.json()

  if (!conversationId || !message) {
    return Response.json({ error: 'conversationId and message are required' }, { status: 400 })
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  })

  if (!conversation) {
    return Response.json({ error: 'Conversation not found' }, { status: 404 })
  }

  await prisma.message.create({
    data: { role: 'user', content: message, conversationId },
  })

  if (conversation.title === 'New Chat') {
    const shortTitle = message.slice(0, 60).trim()
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { title: shortTitle },
    })
  }

  const chunks = await retrieveRelevantChunks(message)
  const systemPrompt = buildSystemPrompt(chunks)

  const history = conversation.messages.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }))

  const stream = await anthropic.messages.stream({
    model: 'claude-opus-4-8',
    max_tokens: 2048,
    system: systemPrompt,
    messages: [...history, { role: 'user', content: message }],
    thinking: { type: 'adaptive' },
  })

  const encoder = new TextEncoder()
  let fullResponse = ''

  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          const text = event.delta.text
          fullResponse += text
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
        }
      }

      await prisma.message.create({
        data: { role: 'assistant', content: fullResponse, conversationId },
      })

      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      controller.close()
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
