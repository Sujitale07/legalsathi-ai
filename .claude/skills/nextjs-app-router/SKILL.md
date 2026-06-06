---
name: nextjs-app-router
description: >
  Next.js App Router patterns, conventions, and best practices for this project.
  Use when creating routes, layouts, server/client components, API routes,
  middleware, data fetching, streaming, metadata, and error handling. Triggers
  on tasks involving file-based routing, route handlers, server actions, or
  Next.js-specific configuration.
license: MIT
metadata:
  author: legalsathi
  version: "1.0.0"
---

# Next.js App Router Skill

> ⚠️ **Read `node_modules/next/dist/docs/` before writing any Next.js code.**
> APIs and conventions differ significantly between versions. This skill reflects
> current App Router conventions — always verify against the installed version.

## Project Structure

```
app/
├── layout.tsx              # Root layout (HTML shell, providers)
├── page.tsx                # Landing page → route: /
├── globals.css             # Global styles
├── not-found.tsx           # 404 page
├── error.tsx               # Error boundary (client component)
├── loading.tsx             # Loading UI (Suspense wrapper)
├── chat/
│   ├── page.tsx            # → /chat
│   └── loading.tsx
├── contract-review/
│   └── page.tsx            # → /contract-review
├── lawyers/
│   ├── page.tsx            # → /lawyers
│   └── [id]/
│       └── page.tsx        # → /lawyers/:id
└── api/
    ├── chat/
    │   └── route.ts        # POST /api/chat
    └── review/
        └── route.ts        # POST /api/review
```

---

## Server vs Client Components

### Decision Rule

```
Is this component interactive (onClick, onChange, useState, useEffect)?
  YES → Add "use client" directive
  NO  → Keep as Server Component (default)
```

### Server Component (default, no directive needed)

```tsx
// app/lawyers/page.tsx
import { getLawyers } from '@/lib/data';

// No "use client" — runs on server, can be async
export default async function LawyersPage() {
  const lawyers = await getLawyers();

  return (
    <main>
      {lawyers.map(lawyer => (
        <LawyerCard key={lawyer.id} lawyer={lawyer} />
      ))}
    </main>
  );
}
```

### Client Component

```tsx
"use client";

import { useState } from 'react';

export function SearchBar({ onSearch }: { onSearch: (q: string) => void }) {
  const [query, setQuery] = useState('');

  return (
    <input
      value={query}
      onChange={e => setQuery(e.target.value)}
      onKeyDown={e => e.key === 'Enter' && onSearch(query)}
    />
  );
}
```

### Composition Pattern — Push Client Down

```tsx
// Good: Server component wraps a Client component
// Server component (no "use client")
export default async function Page() {
  const data = await fetchData(); // runs on server
  return <InteractiveSection initialData={data} />; // Client component
}
```

---

## Route Handlers (API Routes)

### Standard Route Handler

```ts
// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'messages array is required' },
        { status: 400 }
      );
    }

    // ... process
    return NextResponse.json({ result });
  } catch (error) {
    console.error('[API /chat]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Streaming Route Handler

```ts
// app/api/chat/route.ts — Streaming with ReadableStream
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  const { messages } = await request.json();

  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    system: 'You are a Nepali legal assistant...',
    messages,
  });

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (
          chunk.type === 'content_block_delta' &&
          chunk.delta.type === 'text_delta'
        ) {
          controller.enqueue(encoder.encode(chunk.delta.text));
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
```

---

## Metadata

### Static Metadata

```tsx
// app/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'LegalSathi — AI Legal Assistant for Nepal',
    template: '%s | LegalSathi',
  },
  description: 'Get instant legal answers, review contracts, and find verified lawyers — powered by Claude AI.',
  keywords: ['legal', 'Nepal', 'AI', 'lawyer', 'contract review'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://legalsathi.ai',
    siteName: 'LegalSathi',
  },
};
```

### Dynamic Metadata (per page)

```tsx
// app/lawyers/[id]/page.tsx
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const lawyer = await getLawyerById(params.id);
  return {
    title: lawyer.name,
    description: `${lawyer.name} — ${lawyer.specialization} in ${lawyer.location}`,
  };
}
```

---

## Loading & Suspense

### loading.tsx (route-level)

```tsx
// app/chat/loading.tsx
export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
    </div>
  );
}
```

### Suspense boundaries (granular)

```tsx
import { Suspense } from 'react';
import { LawyerCardSkeleton } from '@/components/LawyerCard';

export default function LawyersPage() {
  return (
    <div>
      <h1>Find a Lawyer</h1>
      <Suspense fallback={<LawyerCardSkeleton count={6} />}>
        <LawyerList /> {/* async server component */}
      </Suspense>
    </div>
  );
}
```

---

## Error Handling

### error.tsx (route-level error boundary)

```tsx
"use client";

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h2 className="text-2xl font-bold text-slate-100">Something went wrong</h2>
      <p className="mt-2 text-slate-400">{error.message}</p>
      <button onClick={reset} className="mt-6 rounded-lg bg-indigo-500 px-4 py-2 text-white">
        Try again
      </button>
    </div>
  );
}
```

---

## Environment Variables

```bash
# .env.local — never commit this file
ANTHROPIC_API_KEY=sk-ant-...

# Access server-side only (no NEXT_PUBLIC_ prefix)
# Access in route handlers and server components:
process.env.ANTHROPIC_API_KEY
```

Rules:
- Variables without `NEXT_PUBLIC_` are **server-only** — safe for API keys.
- Variables with `NEXT_PUBLIC_` are **bundled into client code** — never put secrets here.
- Always validate env vars at startup:

```ts
// lib/env.ts
export function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}
```

---

## Performance Patterns

### Image Optimization

```tsx
import Image from 'next/image';

<Image
  src="/lawyers/avatar.jpg"
  alt="Lawyer Name — Property Lawyer Kathmandu"
  width={80}
  height={80}
  className="rounded-full"
  priority={false} // true only for above-fold images
/>
```

### Font Optimization

```tsx
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
```

---

## Common Pitfalls

| Mistake | Fix |
|---|---|
| Using `useState` in a Server Component | Add `"use client"` or move state to a child Client Component |
| Importing a Client Component into a Server Component that uses `cookies()` | Move the import to a boundary component |
| Putting API keys in `NEXT_PUBLIC_` env vars | Use plain `PROCESS_ENV_KEY` — server-only |
| Using `useRouter` from `next/router` | Import from `next/navigation` in App Router |
| Using `getServerSideProps` or `getStaticProps` | Data fetching is now `async` in Server Components |
| Forgetting `export const dynamic = 'force-dynamic'` for routes that read cookies/headers | Add when route must be dynamic |
