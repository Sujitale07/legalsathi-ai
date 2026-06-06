---
name: typescript-react-patterns
description: >
  TypeScript and React patterns for this Next.js project. Use when typing props,
  hooks, API responses, utility functions, context, or async data. Triggers on
  tasks involving interface design, generic types, discriminated unions, type
  guards, React component typing, or form handling.
license: MIT
metadata:
  author: legalsathi
  version: "1.0.0"
---

# TypeScript + React Patterns Skill

Type-safe patterns for building the LegalSathi Next.js application with
TypeScript. Covers component props, API types, hooks, and utility types.

---

## Component Typing

### Props with Children

```tsx
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements; // allows polymorphic rendering
}

export function Card({ children, className, as: Tag = 'div' }: CardProps) {
  return <Tag className={className}>{children}</Tag>;
}
```

### Polymorphic Components

```tsx
type ButtonProps<T extends React.ElementType = 'button'> = {
  as?: T;
  children: ReactNode;
  variant?: 'primary' | 'ghost' | 'danger';
} & Omit<React.ComponentPropsWithoutRef<T>, 'as'>;

export function Button<T extends React.ElementType = 'button'>({
  as,
  children,
  variant = 'primary',
  ...props
}: ButtonProps<T>) {
  const Tag = as ?? 'button';
  return <Tag {...props}>{children}</Tag>;
}
```

---

## Domain Types

### Lawyer Directory Types

```ts
// types/lawyer.ts
export type Specialization =
  | 'Corporate & Business'
  | 'Labor & Employment'
  | 'Property & Real Estate'
  | 'Family Law'
  | 'Criminal Defense'
  | 'Immigration';

export interface Lawyer {
  id: string;
  name: string;
  specialization: Specialization;
  subSpecializations: string[];
  location: string;
  languages: string[];
  experienceYears: number;
  feeRangeMin: number; // NPR
  feeRangeMax: number; // NPR
  rating: number;      // 1–5
  reviewCount: number;
  photoUrl: string;
  bio: string;
  isPremium: boolean;
  contactEmail?: string;
  contactPhone?: string;
}

export interface LawyerFilter {
  specialization?: Specialization;
  location?: string;
  language?: string;
  maxFee?: number;
  query?: string;
}
```

### Chat Types

```ts
// types/chat.ts
export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface AnthropicMessage {
  role: MessageRole;
  content: string;
}
```

### Contract Review Types

```ts
// types/contract.ts
export type RiskSeverity = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ContractClause {
  title: string;
  content: string;
  flagged: boolean;
}

export interface ContractRisk {
  title: string;
  description: string;
  severity: RiskSeverity;
}

export interface ContractAnalysis {
  summary: string;
  parties: string[];
  keyClauses: ContractClause[];
  risks: ContractRisk[];
  missingProtections: string[];
  riskScore: RiskSeverity;
  recommendation: string;
}

export interface ContractReviewState {
  status: 'idle' | 'uploading' | 'analyzing' | 'done' | 'error';
  analysis: ContractAnalysis | null;
  error: string | null;
}
```

---

## Hook Patterns

### Generic Fetch Hook

```ts
// hooks/useFetch.ts
"use client";

import { useState, useEffect } from 'react';

interface UseFetchState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export function useFetch<T>(url: string, options?: RequestInit): UseFetchState<T> {
  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const res = await fetch(url, options);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: T = await res.json();
        if (!cancelled) setState({ data, isLoading: false, error: null });
      } catch (err) {
        if (!cancelled) {
          setState({
            data: null,
            isLoading: false,
            error: err instanceof Error ? err.message : 'Unknown error',
          });
        }
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [url]);

  return state;
}
```

### Debounce Hook

```ts
// hooks/useDebounce.ts
"use client";

import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Usage in LawyerSearch
const debouncedQuery = useDebounce(searchQuery, 300);
```

### Local Storage Hook

```ts
// hooks/useLocalStorage.ts
"use client";

import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const stored = window.localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      console.warn(`Failed to save "${key}" to localStorage`);
    }
  }, [key, value]);

  return [value, setValue] as const;
}
```

---

## Type Guards

```ts
// lib/typeGuards.ts
import type { ContractAnalysis } from '@/types/contract';

export function isContractAnalysis(value: unknown): value is ContractAnalysis {
  return (
    typeof value === 'object' &&
    value !== null &&
    'summary' in value &&
    'riskScore' in value &&
    'keyClauses' in value
  );
}

export function isApiError(value: unknown): value is { error: string } {
  return typeof value === 'object' && value !== null && 'error' in value;
}
```

---

## Discriminated Unions for State Machines

```ts
// Prefer discriminated unions over boolean flags + nullable values
type ReviewState =
  | { status: 'idle' }
  | { status: 'uploading'; fileName: string }
  | { status: 'analyzing' }
  | { status: 'done'; analysis: ContractAnalysis }
  | { status: 'error'; message: string };

// Usage in component
function ReviewContent({ state }: { state: ReviewState }) {
  switch (state.status) {
    case 'idle':     return <UploadPrompt />;
    case 'uploading': return <UploadProgress fileName={state.fileName} />;
    case 'analyzing': return <AnalyzingSkeleton />;
    case 'done':     return <AnalysisResult analysis={state.analysis} />;
    case 'error':    return <ErrorMessage message={state.message} />;
  }
}
```

---

## API Response Types

```ts
// types/api.ts
export interface ApiSuccess<T> {
  data: T;
  error?: never;
}

export interface ApiError {
  data?: never;
  error: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// Type-safe fetch wrapper
export async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(url, options);
    const json = await res.json();
    if (!res.ok) return { error: json.error ?? `HTTP ${res.status}` };
    return { data: json as T };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Network error' };
  }
}

// Usage
const result = await apiFetch<ContractAnalysis>('/api/review', { method: 'POST', body: ... });
if (result.error) {
  // handle error
} else {
  // result.data is ContractAnalysis
}
```

---

## Utility Types

```ts
// types/utils.ts

// Make specific keys optional
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Non-nullable deep
type NonNullableDeep<T> = {
  [K in keyof T]: NonNullable<T[K]>;
};

// Extract enum values as union
type LawyerSpecializationValues = Specialization; // already a union

// Promise return type
type AsyncReturnType<T extends (...args: unknown[]) => Promise<unknown>> =
  T extends (...args: unknown[]) => Promise<infer R> ? R : never;
```

---

## Rules & Best Practices

| Rule | Example |
|---|---|
| Always type component props explicitly | `interface Props { ... }` not `any` |
| Never use `any` — use `unknown` and narrow | `(value: unknown)` then type guard |
| Use `const assertions` for literal types | `const ROLES = ['user', 'assistant'] as const` |
| Avoid type casting (`as`) unless necessary | Prefer type guards |
| Use `interface` for object shapes, `type` for unions | Consistent convention |
| Export types from a central `types/` directory | Avoids circular imports |
| Use `satisfies` operator to validate literals | `const config = { ... } satisfies Config` |
