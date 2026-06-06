---
name: uiux-pro
description: >
  Professional UI/UX design system and implementation patterns for premium web
  interfaces. Use when designing or reviewing pages, components, layouts, color
  systems, typography, animations, dark mode, glassmorphism, responsive design,
  micro-interactions, and accessibility. Triggers on tasks involving visual
  design, component styling, user flows, design tokens, or UI polish.
license: MIT
metadata:
  author: legalsathi
  version: "1.0.0"
---

# UI/UX Pro Skill

A comprehensive guide for designing and implementing premium, accessible, and
visually stunning web interfaces. This skill covers design principles,
component patterns, animation strategies, color systems, and UX best practices.

## Design Philosophy

### Core Principles

1. **Visual Hierarchy First** — Guide the user's eye with size, weight, contrast, and spacing.
2. **Progressive Disclosure** — Show what's needed, reveal more on demand.
3. **Feedback at Every Step** — Every user action should produce a visible response.
4. **Accessible by Default** — Design for all users; WCAG 2.1 AA minimum.
5. **Delight Through Detail** — Micro-animations and subtle polish make products feel premium.

---

## Color Systems

### Design Token Architecture

Always define colors as semantic tokens, never hardcode raw hex values in components.

```ts
// tokens/colors.ts — Semantic color system
export const colors = {
  // Primitives (never use directly in components)
  primitives: {
    indigo: { 50: '#eef2ff', 500: '#6366f1', 900: '#312e81' },
    slate:  { 50: '#f8fafc', 500: '#64748b', 950: '#020617' },
    emerald:{ 50: '#ecfdf5', 500: '#10b981', 700: '#047857' },
    rose:   { 50: '#fff1f2', 500: '#f43f5e', 700: '#be123c' },
    amber:  { 50: '#fffbeb', 500: '#f59e0b', 700: '#b45309' },
  },

  // Semantic tokens (use these in components)
  semantic: {
    brand:     { DEFAULT: '#6366f1', hover: '#4f46e5', muted: '#818cf8' },
    surface:   { DEFAULT: '#0f172a', raised: '#1e293b', overlay: '#334155' },
    text:      { primary: '#f1f5f9', secondary: '#94a3b8', muted: '#475569' },
    border:    { DEFAULT: 'rgba(148,163,184,0.12)', strong: 'rgba(148,163,184,0.25)' },
    success:   { DEFAULT: '#10b981', bg: 'rgba(16,185,129,0.10)' },
    warning:   { DEFAULT: '#f59e0b', bg: 'rgba(245,158,11,0.10)' },
    danger:    { DEFAULT: '#f43f5e', bg: 'rgba(244,63,94,0.10)' },
    info:      { DEFAULT: '#38bdf8', bg: 'rgba(56,189,248,0.10)' },
  },
};
```

### Dark Mode Best Practices

- Use `hsl()` or CSS custom properties so themes switch without duplicating rules.
- Never use pure `#000000` for backgrounds — use near-black like `#0a0a0f` or `#0f172a`.
- Never use pure `#ffffff` for text — use off-white like `#f1f5f9`.
- Reduce saturation slightly in dark mode; highly saturated colors vibrate on dark backgrounds.
- Layer depth with slight lightness steps: `bg → surface → card → overlay`.

```css
:root {
  --bg-base:    hsl(222, 47%, 7%);
  --bg-surface: hsl(222, 47%, 11%);
  --bg-card:    hsl(222, 47%, 14%);
  --text-primary:   hsl(210, 40%, 96%);
  --text-secondary: hsl(215, 20%, 65%);
  --border:     hsl(215, 20%, 65%, 0.12);
  --brand:      hsl(239, 84%, 67%);
  --brand-glow: hsl(239, 84%, 67%, 0.25);
}
```

---

## Typography

### Type Scale

Use a modular scale (ratio 1.25 or 1.333) to achieve visual harmony.

```css
/* Font: Inter from Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

:root {
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;

  /* Modular scale ×1.25 base 16px */
  --text-xs:   0.64rem;   /* 10.24px */
  --text-sm:   0.8rem;    /* 12.8px  */
  --text-base: 1rem;      /* 16px    */
  --text-lg:   1.25rem;   /* 20px    */
  --text-xl:   1.563rem;  /* 25px    */
  --text-2xl:  1.953rem;  /* 31.25px */
  --text-3xl:  2.441rem;  /* 39px    */
  --text-4xl:  3.052rem;  /* 48.8px  */

  /* Line heights */
  --leading-tight:  1.2;
  --leading-normal: 1.5;
  --leading-relaxed:1.75;
}
```

### Typography Rules

- **Headings**: `font-weight: 700–800`, tight line-height (`1.1–1.25`), letter-spacing `-0.02em`.
- **Body**: `font-weight: 400`, relaxed line-height (`1.6–1.75`), max 65–75ch per line.
- **Labels/Captions**: `font-weight: 500–600`, `text-transform: uppercase`, `letter-spacing: 0.06em`.
- **Code**: Use `JetBrains Mono` or `Fira Code` for monospace content.
- Use at most **2 typefaces** per project.

---

## Spacing & Layout

### Spacing System

Use an 8pt grid. All spacing should be multiples of 4 or 8.

```
4px  → micro gap (icon padding, tight items)
8px  → xs  (inline elements, small badges)
12px → sm  (compact list items)
16px → md  (card padding, section gaps)
24px → lg  (component separation)
32px → xl  (section padding)
48px → 2xl (major section breaks)
64px → 3xl (hero sections)
96px → 4xl (page-level padding)
```

### Layout Patterns

**Sidebar Layout**:
```css
.app-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  min-height: 100vh;
}
```

**Content with max-width**:
```css
.content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 clamp(1rem, 5vw, 4rem);
}
```

**Responsive breakpoints**:
```
sm:  640px
md:  768px
lg:  1024px
xl:  1280px
2xl: 1536px
```

---

## Component Patterns

### Premium Card

```tsx
// Glassmorphism card with hover elevation
export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md',
        'p-6 shadow-xl shadow-black/20',
        'transition-all duration-300 ease-out',
        'hover:border-white/20 hover:bg-white/8 hover:-translate-y-1 hover:shadow-2xl',
        className
      )}
    >
      {children}
    </div>
  );
}
```

### Primary Button

```tsx
export function Button({ children, variant = 'primary', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'relative inline-flex items-center gap-2 rounded-xl px-6 py-3',
        'text-sm font-semibold tracking-wide transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'active:scale-[0.97]',
        variant === 'primary' && [
          'bg-gradient-to-r from-indigo-500 to-violet-500',
          'text-white shadow-lg shadow-indigo-500/25',
          'hover:shadow-xl hover:shadow-indigo-500/40 hover:brightness-110',
          'focus-visible:ring-indigo-500',
        ],
        variant === 'ghost' && [
          'bg-transparent text-slate-300 border border-white/10',
          'hover:bg-white/5 hover:border-white/20 hover:text-white',
          'focus-visible:ring-white/30',
        ],
      )}
      {...props}
    >
      {children}
    </button>
  );
}
```

### Badge / Pill

```tsx
export function Badge({ children, intent = 'default' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5',
        'text-xs font-semibold uppercase tracking-wider',
        intent === 'success' && 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20',
        intent === 'warning' && 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20',
        intent === 'danger'  && 'bg-rose-500/10  text-rose-400  ring-1 ring-rose-500/20',
        intent === 'info'    && 'bg-sky-500/10   text-sky-400   ring-1 ring-sky-500/20',
        intent === 'default' && 'bg-slate-500/10 text-slate-400 ring-1 ring-slate-500/20',
      )}
    >
      {children}
    </span>
  );
}
```

### Input Field

```tsx
export function Input({ label, error, ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full rounded-xl bg-white/5 px-4 py-3 text-sm text-slate-100',
          'border border-white/10 placeholder:text-slate-600',
          'outline-none transition-all duration-200',
          'focus:border-indigo-500/50 focus:bg-white/8 focus:ring-2 focus:ring-indigo-500/20',
          error && 'border-rose-500/50 focus:ring-rose-500/20',
        )}
        {...props}
      />
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  );
}
```

---

## Animation & Motion

### Principles

- **Duration**: 150–300ms for UI interactions, 400–600ms for page transitions.
- **Easing**: Use `ease-out` for elements entering, `ease-in` for leaving, `ease-in-out` for transforms.
- **Reduce Motion**: Always respect `prefers-reduced-motion`.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Common Animation Classes

```css
/* Fade in up — entrance animation */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Scale in — modal/dialog entrance */
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}

/* Shimmer — loading skeleton */
@keyframes shimmer {
  from { background-position: -200% 0; }
  to   { background-position:  200% 0; }
}

.animate-fade-in-up { animation: fadeInUp 0.4s ease-out both; }
.animate-scale-in   { animation: scaleIn  0.25s ease-out both; }
```

### Stagger Children

```tsx
// Apply delay to each child for stagger effect
{items.map((item, i) => (
  <div
    key={item.id}
    className="animate-fade-in-up"
    style={{ animationDelay: `${i * 80}ms` }}
  >
    {/* content */}
  </div>
))}
```

### Loading Skeleton

```tsx
function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-lg bg-gradient-to-r from-white/5 via-white/10 to-white/5',
        'bg-[length:200%_100%] animate-[shimmer_1.5s_linear_infinite]',
        className
      )}
    />
  );
}
```

---

## Glassmorphism

Apply glassmorphism on top of gradient/blurred backgrounds:

```css
.glass {
  background:   rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
```

**Rules for glassmorphism**:
- Use sparingly — max 2–3 glass layers in a view.
- Always pair with a colorful, blurred background behind it.
- Avoid glass on glass (it kills legibility).
- Test with `backdrop-filter: none` for fallback (Firefox pre-v103).

---

## Hero Sections

```tsx
// Gradient mesh background hero
export function Hero() {
  return (
    <section className="relative isolate overflow-hidden py-24 sm:py-32">
      {/* Gradient orbs */}
      <div className="pointer-events-none absolute -top-40 -right-20 h-[600px] w-[600px] rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-20 h-[500px] w-[500px] rounded-full bg-violet-500/15 blur-3xl" />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-300">
          ✦ Powered by Claude AI
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
          Legal clarity for{' '}
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            every Nepali
          </span>
        </h1>
        <p className="mt-6 text-lg leading-8 text-slate-400">
          Ask legal questions, review contracts, and find verified lawyers —
          all powered by AI trained on Nepali law.
        </p>
      </div>
    </section>
  );
}
```

---

## Gradient Text

```css
/* Indigo → Violet */
.gradient-text-brand {
  background: linear-gradient(135deg, #818cf8 0%, #a78bfa 50%, #c084fc 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

/* Gold → Amber (premium) */
.gradient-text-gold {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
```

---

## Icon Usage

- Use **Lucide React** (`lucide-react`) as the primary icon library — consistent, tree-shakeable.
- Always provide `aria-hidden="true"` on decorative icons.
- Label interactive icon-only buttons with `aria-label`.
- Size icons with `size={16|20|24}` prop, not CSS — ensures visual alignment.

```tsx
import { Scale, Shield, Users } from 'lucide-react';

<Scale size={20} aria-hidden="true" className="text-indigo-400" />
```

---

## Accessibility (A11y) Quick Reference

| Rule | Implementation |
|---|---|
| Color contrast | 4.5:1 for normal text, 3:1 for large text |
| Focus ring | Never `outline: none` without a visible alternative |
| Interactive elements | Min touch target 44×44px |
| Images | Always meaningful `alt` text |
| Form controls | Always associated `<label>` |
| Keyboard navigation | All interactions reachable by Tab + Enter/Space |
| Screen reader | Use `aria-live` for dynamic content updates |
| Skip link | Add skip-to-content for keyboard users |

---

## Responsive Design

### Mobile-First Rules

- Write base styles for mobile, then override for larger screens.
- Test at 320px (small phones), 375px (iPhone SE), 768px (tablet), 1280px (desktop).
- Touch targets: min 44px height/width with adequate spacing.
- Avoid hover-only interactions — provide tap equivalents.

### Fluid Typography

```css
h1 {
  font-size: clamp(1.875rem, 5vw, 3.75rem);
}
p {
  font-size: clamp(0.9rem, 2vw, 1.125rem);
}
```

---

## UX Patterns for LegalSathi

### Chat Interface
- Show typing indicator with 3 animated dots when AI is responding.
- Auto-scroll to latest message with smooth behavior.
- Distinguish user vs AI messages with alignment + background color.
- Show disclaimer badge beneath every AI response.
- Suggested follow-up questions as clickable chips below response.

### File Upload
- Drag-and-drop zone with dashed border that glows on hover.
- Show file name, size, and type after selection.
- Progress bar during upload/processing.
- Clear error state if file format is invalid.

### Legal Risk Badges
```
LOW    → emerald  bg + ring
MEDIUM → amber    bg + ring
HIGH   → rose     bg + ring
```

### Empty States
- Never show a blank screen. Always provide:
  - Illustration or icon
  - Descriptive heading
  - Sub-text explaining what to do
  - Primary CTA button

### Error States
- Toast notifications for transient errors (3–5 second duration).
- Inline validation for form fields.
- Full-page error boundary for critical failures with "Try again" action.

---

## Performance & Polish Checklist

- [ ] Images optimized with `next/image` (WebP, lazy loading, explicit `width`/`height`)
- [ ] Fonts loaded with `display=swap` to prevent FOIT
- [ ] Above-fold content renders without JS (SSR/SSG)
- [ ] Smooth scroll-anchored navigation
- [ ] No layout shift (CLS < 0.1)
- [ ] Loading skeletons for all async data
- [ ] `prefers-reduced-motion` respected
- [ ] Dark mode tested at system level
- [ ] All interactive elements keyboard accessible
- [ ] Color contrast validated for all text
