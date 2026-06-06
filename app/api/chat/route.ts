import { NextRequest } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { prisma } from '@/lib/prisma'
import { retrieveRelevantChunks, buildSystemPrompt } from '@/lib/rag'

const ai = new GoogleGenAI({
  apiKey: (process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY)!,
})

const CHAT_MODEL  = 'gemini-2.5-flash'
const MAX_HISTORY = 10

// Convert stored messages to Gemini's content format
function toGeminiHistory(messages: { role: string; content: string }[]) {
  return messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))
}

export async function POST(request: NextRequest) {
  let body: { conversationId?: string; message?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { conversationId, message } = body
  if (!conversationId || !message?.trim()) {
    return Response.json({ error: 'conversationId and message are required' }, { status: 400 })
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  })
  if (!conversation) {
    return Response.json({ error: 'Conversation not found' }, { status: 404 })
  }

  // Persist user message
  await prisma.message.create({
    data: { role: 'user', content: message, conversationId },
  })

  const needsTitle = conversation.title === 'New Chat' || conversation.title === 'New chat'

  // RAG retrieval — if embedding/DB fails, return a clean error instead of unhandled 500
  let chunks, system, sources
  try {
    chunks = await retrieveRelevantChunks(message)
    ;({ system, sources } = buildSystemPrompt(chunks))
  } catch (err) {
    console.error('RAG retrieval failed:', err)
    ;({ system, sources } = buildSystemPrompt([]))
  }

  // Trim history to last MAX_HISTORY messages
  const history = toGeminiHistory(conversation.messages.slice(-MAX_HISTORY))

  const encoder = new TextEncoder()
  let fullResponse = ''
  let streamError: string | null = null
  let isJsonMode = false  // set true once we detect a JSON response

  const readable = new ReadableStream({
    async start(controller) {
      try {
        const stream = await ai.models.generateContentStream({
          model: CHAT_MODEL,
          contents: [...history, { role: 'user', parts: [{ text: message }] }],
          config: {
            systemInstruction: system,
            maxOutputTokens: 8192,
          },
        })

        for await (const chunk of stream) {
          const text = chunk.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
          if (text) {
            fullResponse += text
            // Detect JSON mode on first meaningful content
            if (!isJsonMode && fullResponse.trimStart().length > 0) {
              const start = fullResponse.trimStart().slice(0, 3)
              isJsonMode = start.startsWith('{') || start.startsWith('```')
            }
            // Only stream text to client in markdown mode
            if (!isJsonMode) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
            }
          }
        }
      } catch (err) {
        streamError = err instanceof Error ? err.message : 'Stream error'
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: streamError })}\n\n`))
      } finally {
        // Persist assistant turn
        if (fullResponse) {
          await prisma.message.create({
            data: { role: 'assistant', content: fullResponse, conversationId },
          })
        }

        // Send sources
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ sources })}\n\n`))

        // Try to parse fullResponse as scenario JSON.
        // Use regex to extract the outermost {...} block — this handles code fences,
        // trailing [TRIGGER:...] text, and Disclaimer footers the model appends.
        let parsedAsScenario = false
        if (fullResponse) {
          const jsonMatch = fullResponse.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            try {
              const scenario = JSON.parse(jsonMatch[0])
              if (scenario && typeof scenario === 'object' && scenario.sections) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ scenario })}\n\n`))
                parsedAsScenario = true
              }
            } catch { /* not valid JSON */ }
          }
          // If response looked like JSON but failed to parse (or no sections),
          // send the raw text so the client has something to show instead of blank
          if (!parsedAsScenario && fullResponse.trimStart().startsWith('{')) {
            const stripped = fullResponse
              .replace(/^```json\s*\n?/, '').replace(/^```\s*\n?/, '')
              .replace(/\n?```\s*$/, '').trim()
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: stripped })}\n\n`))
          }
        }

        // Run title + suggestions concurrently so both finish before stream closes
        if (fullResponse && !streamError) {
          const titleTask = needsTitle ? generateTitle(conversationId, message) : Promise.resolve()

          const suggestionsTask = (async () => {
            try {
              const suggRes = await ai.models.generateContent({
                model: CHAT_MODEL,
                contents: [{
                  role: 'user',
                  parts: [{ text: `Based on this legal Q&A, generate exactly 3 brief follow-up questions a Nepali user might ask next. Return ONLY a raw JSON array of 3 strings, max 9 words each. No markdown, no explanation.
Q: ${message.slice(0, 300)}
A: ${fullResponse.slice(0, 500)}` }],
                }],
                config: { maxOutputTokens: 150 },
              })
              const raw = suggRes.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ''
              const match = raw.match(/\[[\s\S]*?\]/)
              if (match) {
                const suggestions: unknown = JSON.parse(match[0])
                if (Array.isArray(suggestions) && suggestions.length > 0) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ suggestions })}\n\n`))
                }
              }
            } catch { /* skip suggestions on error */ }
          })()

          await Promise.allSettled([titleTask, suggestionsTask])
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      }
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

async function generateTitle(conversationId: string, firstMessage: string) {
  const res = await ai.models.generateContent({
    model: CHAT_MODEL,
    contents: [{
      role: 'user',
      parts: [{ text: `Write a 4-6 word title for a legal chat that starts with this question.
Reply with ONLY the title, no quotes, no punctuation at the end.
Question: ${firstMessage.slice(0, 200)}` }],
    }],
    config: { maxOutputTokens: 20 },
  })
  const title = (res.candidates?.[0]?.content?.parts?.[0]?.text ?? '').trim().slice(0, 80)
  if (title) {
    await prisma.conversation.update({ where: { id: conversationId }, data: { title } })
  }
}
