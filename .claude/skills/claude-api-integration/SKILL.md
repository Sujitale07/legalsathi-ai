---
name: claude-api-integration
description: >
  Patterns for integrating Anthropic Claude API (claude-sonnet-4-20250514) into
  the LegalSathi application. Use when implementing AI chat, contract review,
  streaming responses, system prompts, error handling, and token management.
  Triggers on tasks involving AI responses, Claude client setup, streaming UX,
  or server-side AI logic.
license: MIT
metadata:
  author: legalsathi
  version: "1.0.0"
---

# Claude API Integration Skill

Patterns for integrating the Anthropic Claude API into LegalSathi's Next.js
backend for streaming chat, contract analysis, and structured AI outputs.

---

## Setup

```ts
// lib/claude.ts
import Anthropic from '@anthropic-ai/sdk';

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY is not set');
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const MODEL = 'claude-sonnet-4-20250514';
export const MAX_TOKENS_CHAT     = 1500;
export const MAX_TOKENS_CONTRACT = 2500;
```

---

## System Prompts

### Legal Q&A System Prompt

```ts
// lib/prompts.ts
export const LEGAL_QA_SYSTEM_PROMPT = `You are LegalSathi, a knowledgeable and cautious AI legal guide for Nepali citizens and businesses.

Your role:
- Provide clear, plain-English answers to legal questions grounded in Nepali law.
- Reference relevant acts when applicable (Civil Code 2074, Labor Act 2074, Company Act 2063, Consumer Protection Act 2075, etc.).
- Use structured formatting: numbered lists, headers, and bullet points for clarity.
- Always include a disclaimer that your response is informational and not a substitute for professional legal advice.
- Recommend consulting a verified lawyer for complex, urgent, or high-stakes matters.
- Never fabricate specific case law, court decisions, or legal citations you are not certain about.
- Be empathetic — users may be stressed about their legal situation.

Format your responses with:
1. A direct answer to the question
2. Relevant legal context (which laws apply)
3. Practical steps the user can take
4. A disclaimer paragraph at the end
5. A "💼 Need a lawyer?" prompt linking to the Lawyer Finder

Respond in clear, simple English. Avoid legalese.`;

export const CONTRACT_REVIEW_SYSTEM_PROMPT = `You are a legal document analyst for LegalSathi, specializing in reviewing contracts under Nepali law.

Analyze the provided contract and return a structured JSON response with these exact fields:
{
  "summary": "2-3 sentence plain English summary of what this contract is about",
  "parties": ["Party 1 name/role", "Party 2 name/role"],
  "keyClauses": [
    { "title": "clause name", "content": "plain English explanation", "flagged": false }
  ],
  "risks": [
    { "title": "risk name", "description": "why this is risky", "severity": "HIGH|MEDIUM|LOW" }
  ],
  "missingProtections": ["protection 1", "protection 2"],
  "riskScore": "LOW|MEDIUM|HIGH",
  "recommendation": "1-2 sentence overall recommendation"
}

Rules:
- Be thorough but concise in clause explanations.
- Flag anything that is one-sided, unusual, or potentially harmful to the weaker party.
- Consider Nepali legal context: Civil Code 2074, Labor Act 2074, Consumer Protection Act 2075.
- If the document does not appear to be a contract, return an error field instead.
- Always recommend professional review for HIGH risk contracts.`;
```

---

## Streaming Chat Route

```ts
// app/api/chat/route.ts
import { NextRequest } from 'next/server';
import { anthropic, MODEL, MAX_TOKENS_CHAT } from '@/lib/claude';
import { LEGAL_QA_SYSTEM_PROMPT } from '@/lib/prompts';

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid messages' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate message format
    const validMessages = messages.filter(
      m => m.role && m.content && typeof m.content === 'string'
    );

    const stream = await anthropic.messages.stream({
      model: MODEL,
      max_tokens: MAX_TOKENS_CHAT,
      system: LEGAL_QA_SYSTEM_PROMPT,
      messages: validMessages,
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              controller.enqueue(encoder.encode(chunk.delta.text));
            }
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no', // Disable Nginx buffering for streams
      },
    });
  } catch (error: unknown) {
    console.error('[POST /api/chat]', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
```

---

## Contract Review Route (Structured JSON)

```ts
// app/api/review/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { anthropic, MODEL, MAX_TOKENS_CONTRACT } from '@/lib/claude';
import { CONTRACT_REVIEW_SYSTEM_PROMPT } from '@/lib/prompts';

export async function POST(request: NextRequest) {
  try {
    const { contractText } = await request.json();

    if (!contractText || typeof contractText !== 'string') {
      return NextResponse.json({ error: 'contractText is required' }, { status: 400 });
    }

    if (contractText.length > 50000) {
      return NextResponse.json({ error: 'Contract too long (max 50,000 characters)' }, { status: 400 });
    }

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS_CONTRACT,
      system: CONTRACT_REVIEW_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Please analyze this contract:\n\n${contractText}`,
        },
      ],
    });

    const rawText = response.content[0].type === 'text' ? response.content[0].text : '';

    // Extract JSON from response (Claude may wrap in markdown code blocks)
    const jsonMatch = rawText.match(/```json\n?([\s\S]*?)\n?```/) ||
                      rawText.match(/({[\s\S]*})/);

    if (!jsonMatch) {
      return NextResponse.json({ error: 'Could not parse AI response' }, { status: 500 });
    }

    const analysis = JSON.parse(jsonMatch[1]);
    return NextResponse.json(analysis);

  } catch (error: unknown) {
    console.error('[POST /api/review]', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Failed to parse contract analysis' }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

## Client-Side Streaming Hook

```tsx
// hooks/useStreamingChat.ts
"use client";

import { useState, useCallback } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function useStreamingChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    const assistantId = crypto.randomUUID();

    // Add placeholder assistant message
    setMessages(prev => [
      ...prev,
      { id: assistantId, role: 'assistant', content: '', timestamp: new Date() },
    ]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });

        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId
              ? { ...m, content: m.content + chunk }
              : m
          )
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      // Remove the empty assistant message on error
      setMessages(prev => prev.filter(m => m.id !== assistantId));
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, isLoading, error, sendMessage, clearMessages };
}
```

---

## Rate Limiting & Error Handling

### Anthropic Error Types

```ts
import Anthropic from '@anthropic-ai/sdk';

try {
  // API call
} catch (error) {
  if (error instanceof Anthropic.APIError) {
    if (error.status === 429) {
      // Rate limit — implement exponential backoff
      return NextResponse.json({ error: 'Too many requests, please wait' }, { status: 429 });
    }
    if (error.status === 401) {
      console.error('Invalid API key');
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }
    if (error.status === 529) {
      // Anthropic overloaded
      return NextResponse.json({ error: 'AI service temporarily unavailable' }, { status: 503 });
    }
  }
}
```

### Simple Exponential Backoff

```ts
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, baseDelay * 2 ** attempt));
    }
  }
  throw new Error('Max retries exceeded');
}
```

---

## Token Management Guidelines

| Feature | Max Tokens | Rationale |
|---|---|---|
| Legal Q&A Chat | 1,500 | Sufficient for most legal explanations |
| Contract Review | 2,500 | Needs room for structured JSON output |
| Follow-up questions | 800 | Short, targeted answers |

- Monitor response lengths — if responses are being cut off, increase `max_tokens`.
- For contract review, the input can be large. Trim whitespace and limit to 50,000 chars.
- Consider chunking very long contracts and summarizing each chunk separately.

---

## Security Rules

1. **Never expose `ANTHROPIC_API_KEY` to the client** — always call Claude from server-side route handlers.
2. **Validate and sanitize all user input** before sending to Claude.
3. **Set max input length limits** to prevent prompt injection abuse.
4. **Log errors server-side**, never leak stack traces to the client.
5. **Rate limit the API routes** if you add authentication (e.g., 10 requests/minute per user).
