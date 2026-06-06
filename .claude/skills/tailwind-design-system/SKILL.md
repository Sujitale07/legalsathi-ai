---
name: tailwind-design-system
description: >
  Tailwind CSS design system patterns, configuration, and component utilities
  for this project. Use when configuring the Tailwind theme, creating reusable
  utility patterns, handling dark mode, or building consistent component styles.
  Triggers on tasks involving tailwind.config.ts, CSS utilities, class merging,
  or design token integration.
license: MIT
metadata:
  author: legalsathi
  version: "1.0.0"
---

# Tailwind Design System Skill

Best practices for using Tailwind CSS in this Next.js project to build a
consistent, maintainable, and premium design system.

---

## Tailwind Configuration

### `tailwind.config.ts`

```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  darkMode: 'class', // or 'media' for system-level dark mode
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          900: '#312e81',
        },
        surface: {
          DEFAULT: '#0f172a',
          raised:  '#1e293b',
          overlay: '#334155',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        glow:       '0 0 20px rgba(99,102,241,0.4)',
        'glow-sm':  '0 0 10px rgba(99,102,241,0.25)',
        'glow-lg':  '0 0 40px rgba(99,102,241,0.5)',
      },
      animation: {
        'fade-in-up':   'fadeInUp 0.4s ease-out both',
        'scale-in':     'scaleIn 0.25s ease-out both',
        'shimmer':      'shimmer 1.5s linear infinite',
        'pulse-slow':   'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          from: { backgroundPosition: '-200% 0' },
          to:   { backgroundPosition:  '200% 0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## Class Merging with `clsx` + `tailwind-merge`

Always use `cn()` for conditional class merging to avoid Tailwind class conflicts.

```ts
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Usage:

```tsx
<div className={cn(
  'rounded-xl bg-surface p-4',
  isActive && 'ring-2 ring-brand-500',
  className
)} />
```

**Install**: `npm install clsx tailwind-merge`

---

## Core Utility Patterns

### Glass Card

```
bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl shadow-black/20
```

### Gradient Text

```
bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent
```

### Glow Button

```
bg-gradient-to-r from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40
```

### Gradient Orb (background decoration)

```
absolute rounded-full bg-indigo-500/20 blur-3xl pointer-events-none
```

### Focus Ring

```
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface
```

### Skeleton Shimmer

```
bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] animate-shimmer
```

---

## Component Utility Groups

### Button Variants

```tsx
const buttonVariants = {
  primary: 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40 hover:brightness-110',
  secondary: 'bg-surface-raised text-slate-100 border border-white/10 hover:bg-surface-overlay hover:border-white/20',
  ghost: 'text-slate-400 hover:text-white hover:bg-white/5',
  danger: 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20',
};

const buttonSizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-7 py-3.5 text-base rounded-xl',
};
```

### Badge / Status Variants

```tsx
const badgeVariants = {
  success: 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20',
  warning: 'bg-amber-500/10  text-amber-400  ring-1 ring-amber-500/20',
  danger:  'bg-rose-500/10   text-rose-400   ring-1 ring-rose-500/20',
  info:    'bg-sky-500/10    text-sky-400    ring-1 ring-sky-500/20',
  default: 'bg-slate-500/10  text-slate-400  ring-1 ring-slate-500/20',
};
```

---

## Responsive Utilities

Always write mobile-first:

```tsx
// ❌ Bad — desktop first
<div className="flex-row md:flex-col" />

// ✅ Good — mobile first
<div className="flex-col md:flex-row" />
```

Common responsive patterns:

```
// Stack on mobile, side-by-side on desktop
flex flex-col md:flex-row

// 1 col → 2 col → 3 col grid
grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3

// Hidden on mobile, visible on desktop
hidden lg:block

// Full width on mobile, auto on desktop
w-full md:w-auto
```

---

## Dark Mode Strategy

Use `dark:` prefix with `darkMode: 'class'` in config. Toggle by adding/removing `dark` class on `<html>`.

```tsx
// In a component
<div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" />
```

For this project, the UI is dark-mode-first. Write base styles for dark mode and use `light:` or rely on OS preference.

---

## Tailwind Anti-Patterns to Avoid

| Anti-Pattern | Why Bad | Fix |
|---|---|---|
| `style={{ color: '#6366f1' }}` | Bypasses design system | `text-brand-500` |
| Long className strings inline | Unreadable | Extract to `cn()` with named groups |
| Mixing Tailwind + custom CSS arbitrarily | Conflicts | Use CSS variables for dynamic values, Tailwind for static |
| `!important` utilities (`!text-red-500`) | Hard to override | Refactor specificity at source |
| Hardcoded breakpoints in JS | Fragile | Use `tailwind-responsive-hooks` or CSS media queries |

---

## Useful Arbitrary Values

When you need a one-off value not in the scale:

```
w-[72px]          → exact pixel width
h-[calc(100vh-4rem)]
bg-[#1a1a2e]      → exact color
grid-cols-[280px_1fr]
text-[0.625rem]   → 10px
-translate-y-[3px]
```

Use sparingly — prefer design tokens where possible.

---

## PostCSS Configuration

The project uses `postcss.config.mjs`. Don't add plugins without testing — PostCSS plugins can conflict with Tailwind's JIT engine.

```js
// postcss.config.mjs
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```
