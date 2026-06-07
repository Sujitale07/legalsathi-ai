import { NextRequest } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { prisma } from '@/lib/prisma'
import { retrieveRelevantChunks, buildSystemPrompt } from '@/lib/rag'

const ai = new GoogleGenAI({
  apiKey: (process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY)!,
})

const CHAT_MODEL      = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash'
const SECONDARY_MODEL = process.env.GEMINI_SECONDARY_MODEL ?? 'gemini-2.0-flash-lite'
const MAX_HISTORY = 10

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

  await prisma.message.create({
    data: { role: 'user', content: message, conversationId },
  })

  const needsTitle = conversation.title === 'New Chat' || conversation.title === 'New chat'

  const domain = conversation.domain ?? 'general'

  let system: string, sources: ReturnType<typeof buildSystemPrompt>['sources']
  try {
    const chunks = await retrieveRelevantChunks(message, domain)
    ;({ system, sources } = buildSystemPrompt(chunks, domain))
  } catch (err) {
    console.error('RAG retrieval failed:', err)
    ;({ system, sources } = buildSystemPrompt([], domain))
  }

  const history = toGeminiHistory(conversation.messages.slice(-MAX_HISTORY))

  const encoder = new TextEncoder()
  let fullResponse = ''
  let streamError: string | null = null
  let isJsonMode = false

  const readable = new ReadableStream({
    async start(controller) {
      try {
        const stream = await ai.models.generateContentStream({
          model: CHAT_MODEL,
          contents: [...history, { role: 'user', parts: [{ text: message }] }],
          config: { systemInstruction: system, maxOutputTokens: 8192, temperature: 0 },
        })

        for await (const chunk of stream) {
          const text = chunk.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
          if (text) {
            fullResponse += text
            if (!isJsonMode && fullResponse.trimStart().length > 0) {
              const start = fullResponse.trimStart().slice(0, 3)
              isJsonMode = start.startsWith('{') || start.startsWith('```')
            }
            if (!isJsonMode) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
            }
          }
        }
      } catch (err) {
        streamError = friendlyError(err)
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: streamError })}\n\n`))
      } finally {
        if (fullResponse) {
          await prisma.message.create({
            data: { role: 'assistant', content: fullResponse, conversationId },
          })
        }

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ sources })}\n\n`))

        // Parse scenario JSON — use regex to ignore code fences and trailing trigger codes
        let parsedAsScenario = false
        if (fullResponse) {
          const jsonMatch = fullResponse.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            try {
              const scenario = JSON.parse(jsonMatch[0])
              if (scenario && typeof scenario === 'object' && scenario.sections) {
                // Attach real lawyers from DB — isolated so a DB error never blocks scenario rendering
                if (Array.isArray(scenario.required_lawyers) && scenario.required_lawyers.length > 0) {
                  try {
                    // Fallback map: AI sometimes uses natural names not in DB schema
                    const TYPE_MAP: Record<string, string> = {
                      traffic_lawyer:   'civil_lawyer',
                      transport_lawyer: 'civil_lawyer',
                      vehicle_lawyer:   'civil_lawyer',
                      contract_lawyer:  'corporate_lawyer',
                      business_registration_lawyer: 'corporate_lawyer',
                      litigation_lawyer: 'civil_lawyer',
                      general_lawyer:   'civil_lawyer',
                    }
                    // For traffic domain, criminal_lawyer is never appropriate for routine fines
                    const TRAFFIC_OVERRIDE: Record<string, string> = {
                      criminal_lawyer: 'civil_lawyer',
                    }
                    const types: string[] = scenario.required_lawyers
                      .map((l: { type?: string }) => {
                        const t = l.type?.toLowerCase().trim() ?? ''
                        const mapped = TYPE_MAP[t] ?? t
                        return domain === 'traffic' ? (TRAFFIC_OVERRIDE[mapped] ?? mapped) : mapped
                      })
                      .filter(Boolean)
                    if (types.length > 0) {
                      const matched = await prisma.lawyer.findMany({
                        where: { specialties: { hasSome: types } },
                        orderBy: { experience: 'desc' },
                        take: 4,
                      })
                      if (matched.length > 0) {
                        scenario.matched_lawyers = matched
                        scenario.matched_lawyer_types = types
                      }
                    }
                  } catch (e) {
                    console.error('Lawyer DB fetch failed:', e)
                  }
                }
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ scenario })}\n\n`))
                parsedAsScenario = true
              }
            } catch { /* not valid JSON */ }
          }

          // Fallback: if response looked like JSON but failed, send as text
          if (!parsedAsScenario && isJsonMode) {
            const stripped = fullResponse
              .replace(/^```json\s*\n?/, '').replace(/^```\s*\n?/, '')
              .replace(/\n?```\s*$/, '').trim()
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: stripped })}\n\n`))
          }
        }

        if (fullResponse && !streamError) {
          const titleTask = needsTitle ? generateTitle(conversationId, message) : Promise.resolve()

          const suggestionsTask = (async () => {
            try {
              const suggRes = await ai.models.generateContent({
                model: SECONDARY_MODEL,
                contents: [{ role: 'user', parts: [{ text: `Based on this legal Q&A, generate exactly 3 brief follow-up questions a Nepali user might ask next. Return ONLY a raw JSON array of 3 strings, max 9 words each. No markdown, no explanation.\nQ: ${message.slice(0, 300)}\nA: ${fullResponse.slice(0, 500)}` }] }],
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
            } catch (err) { console.error('[suggestions]', err) }
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
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
      Connection: 'keep-alive',
    },
  })
}

function friendlyError(err: unknown): string {
  const msg = (err instanceof Error ? err.message : String(err)).toLowerCase()
  if (msg.includes('503') || msg.includes('unavailable') || msg.includes('high demand'))
    return 'Our servers are a bit busy right now — try again in a moment.'
  if (msg.includes('429') || msg.includes('quota') || msg.includes('resource_exhausted'))
    return 'Too many requests at once. Give it a few seconds and try again.'
  if (msg.includes('abort') || msg.includes('timed out') || msg.includes('timeout'))
    return 'Took too long to respond. Try a shorter question.'
  if (msg.includes('401') || msg.includes('403') || msg.includes('api_key') || msg.includes('unauthenticated'))
    return 'Something went wrong on our end — contact support.'
  return 'Something went wrong. Try again.'
}

async function generateTitle(conversationId: string, firstMessage: string) {
  // Always save a fallback title first so "New Chat" is never shown after the first message
  const fallback = firstMessage.length > 60 ? firstMessage.slice(0, 57).trimEnd() + '…' : firstMessage
  await prisma.conversation.update({ where: { id: conversationId }, data: { title: fallback } })

  // Try to upgrade to an AI-generated title (best-effort — quota failures are silently ignored)
  try {
    const res = await ai.models.generateContent({
      model: SECONDARY_MODEL,
      contents: [{ role: 'user', parts: [{ text: `Write a 4-6 word title for a legal chat that starts with this question.\nReply with ONLY the title, no quotes, no punctuation at the end.\nQuestion: ${firstMessage.slice(0, 200)}` }] }],
      config: { maxOutputTokens: 20 },
    })
    const aiTitle = (res.candidates?.[0]?.content?.parts?.[0]?.text ?? '').trim().slice(0, 80)
    if (aiTitle) {
      await prisma.conversation.update({ where: { id: conversationId }, data: { title: aiTitle } })
    }
  } catch (err) {
    console.error('[title]', err)
  }
}
