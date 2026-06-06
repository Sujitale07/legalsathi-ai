---
name: accessibility-a11y
description: >
  Accessibility (a11y) patterns and WCAG 2.1 AA compliance guidelines for the
  LegalSathi web application. Use when building interactive components, forms,
  modals, navigation, dynamic content, or when reviewing components for keyboard
  navigation, screen reader support, color contrast, and focus management.
  Triggers on tasks involving aria attributes, focus traps, live regions,
  semantic HTML, or accessibility audits.
license: MIT
metadata:
  author: legalsathi
  version: "1.0.0"
---

# Accessibility (A11y) Skill

WCAG 2.1 AA compliance patterns for LegalSathi. This ensures the platform is
usable by people with visual, motor, cognitive, and auditory disabilities.

---

## Core Principles (POUR)

| Principle | Meaning | Key Test |
|---|---|---|
| **Perceivable** | Users can perceive all UI information | Color contrast, alt text, captions |
| **Operable** | All functionality is keyboard accessible | Tab navigation, focus management |
| **Understandable** | UI is clear and predictable | Labels, error messages, language |
| **Robust** | Works across assistive technologies | Semantic HTML, ARIA patterns |

---

## Semantic HTML

### Use the right element

```tsx
// ❌ Bad — div soup
<div onClick={navigate}>Lawyers</div>
<div onClick={submit}>Submit</div>

// ✅ Good — semantic elements
<a href="/lawyers">Lawyers</a>
<button type="submit">Submit</button>
```

### Heading Hierarchy

- One `<h1>` per page — the main page title.
- Use `<h2>` for sections, `<h3>` for sub-sections.
- Never skip levels (h1 → h3 skipping h2).

```tsx
// app/chat/page.tsx
<h1>AI Legal Assistant</h1>          {/* Page title */}
  <h2>Your Conversation</h2>         {/* Section */}
  <h2>Suggested Questions</h2>       {/* Section */}
```

### Landmark Regions

```tsx
<header>           {/* Site header / navbar */}
  <nav>            {/* Primary navigation */}
<main>             {/* Main content — only ONE per page */}
  <section>        {/* Distinct content section */}
  <article>        {/* Self-contained content (chat message) */}
  <aside>          {/* Supplementary content (sidebar) */}
<footer>           {/* Site footer */}
```

---

## Color Contrast

### WCAG 2.1 AA Requirements

| Text Size | Minimum Contrast Ratio |
|---|---|
| Normal text (< 18pt / < 14pt bold) | **4.5 : 1** |
| Large text (≥ 18pt / ≥ 14pt bold) | **3 : 1** |
| UI components & focus indicators | **3 : 1** |
| Decorative elements | No requirement |

### LegalSathi Color Contrast Checks

```
✅ slate-100 (#f1f5f9) on slate-950 (#020617) → ~19:1
✅ slate-400 (#94a3b8) on slate-950 (#020617) → ~6.5:1
✅ indigo-400 (#818cf8) on slate-950 (#020617) → ~7.2:1
✅ emerald-400 (#34d399) on slate-950 (#020617) → ~10.1:1
✅ amber-400 (#fbbf24) on slate-950 (#020617) → ~11.2:1
✅ rose-400 (#fb7185) on slate-950 (#020617) → ~5.8:1
⚠️ slate-500 (#64748b) on slate-950 (#020617) → ~3.9:1 — use only for large text
❌ slate-600 (#475569) on slate-950 (#020617) → ~2.6:1 — too low, don't use for text
```

Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) to verify.

---

## Focus Management

### Always Visible Focus Ring

```css
/* globals.css */

/* Remove default and add custom focus ring */
:focus {
  outline: none;
}

:focus-visible {
  outline: 2px solid #818cf8; /* indigo-400 */
  outline-offset: 2px;
  border-radius: 4px;
}
```

```tsx
/* In Tailwind */
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
```

### Skip Navigation Link

```tsx
// Place at the very top of the layout
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className={cn(
        'absolute left-4 top-4 z-50 px-4 py-2 rounded-lg',
        'bg-indigo-500 text-white font-semibold text-sm',
        'translate-y-[-200%] focus:translate-y-0',
        'transition-transform duration-200',
      )}
    >
      Skip to main content
    </a>
  );
}

// In page layout
<main id="main-content" tabIndex={-1}>
```

### Focus Trap in Modals

```tsx
"use client";

import { useEffect, useRef } from 'react';

export function Modal({ isOpen, onClose, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const focusableSelectors = [
      'a[href]', 'button:not([disabled])', 'input:not([disabled])',
      'select:not([disabled])', 'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(focusableSelectors);
    const first = focusableElements?.[0];
    const last = focusableElements?.[focusableElements.length - 1];

    first?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      ref={modalRef}
      className="..."
    >
      {children}
    </div>
  );
}
```

---

## ARIA Patterns

### Live Regions (Dynamic Content)

```tsx
// For streaming AI responses — announce to screen readers
<div
  aria-live="polite"      // "polite" = announces when idle; "assertive" = interrupts
  aria-atomic="false"     // false = announce additions only, not whole region
  aria-relevant="additions text"
>
  {aiResponse}
</div>

// For status messages (loading, errors)
<div role="status" aria-live="polite">
  {isLoading && 'Analyzing your contract...'}
</div>
```

### Loading States

```tsx
// Spinner with accessible label
<div
  role="status"
  aria-label="Loading AI response"
>
  <div className="animate-spin h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full" />
  <span className="sr-only">Loading AI response</span>
</div>
```

### Icon-Only Buttons

```tsx
// Always provide aria-label for icon-only interactive elements
<button
  aria-label="Send message"
  type="submit"
>
  <SendIcon size={20} aria-hidden="true" />
</button>
```

### Expanded/Collapsed Toggles

```tsx
<button
  aria-expanded={isOpen}
  aria-controls="faq-answer-1"
  onClick={() => setIsOpen(!isOpen)}
>
  What is LegalSathi?
</button>
<div id="faq-answer-1" hidden={!isOpen}>
  LegalSathi is an AI legal assistant...
</div>
```

---

## Form Accessibility

```tsx
// Always associate labels with inputs
<div>
  <label htmlFor="search-lawyers" className="sr-only">
    Search lawyers by name or specialization
  </label>
  <input
    id="search-lawyers"
    type="search"
    placeholder="Search lawyers..."
    aria-describedby="search-hint"
  />
  <span id="search-hint" className="sr-only">
    Press Enter to search
  </span>
</div>

// Error states with aria
<div>
  <label htmlFor="contract-text">
    Contract Text
    <span aria-hidden="true" className="text-rose-400 ml-1">*</span>
    <span className="sr-only"> (required)</span>
  </label>
  <textarea
    id="contract-text"
    aria-required="true"
    aria-invalid={!!error}
    aria-describedby={error ? 'contract-error' : undefined}
  />
  {error && (
    <p id="contract-error" role="alert" className="text-rose-400 text-sm mt-1">
      {error}
    </p>
  )}
</div>
```

---

## Screen Reader Utilities

```css
/* Visually hidden but accessible to screen readers */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

Usage:

```tsx
// In Tailwind
<span className="sr-only">Lawyer verified badge</span>

// For decorative elements — hide from screen readers
<img src="..." alt="" aria-hidden="true" />
<svg aria-hidden="true" focusable="false">...</svg>
```

---

## Reduced Motion

```css
/* globals.css */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

```ts
// In JS — respect user preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

---

## Keyboard Navigation Checklist

- [ ] All interactive elements reachable via **Tab**
- [ ] Logical tab order follows visual order
- [ ] **Enter** activates buttons and links
- [ ] **Space** activates checkboxes, radio buttons, buttons
- [ ] **Escape** closes modals, dropdowns, tooltips
- [ ] **Arrow keys** navigate within composite widgets (menus, tabs, listboxes)
- [ ] No keyboard traps (except intentional modal traps)
- [ ] Skip link present at top of page

---

## A11y Audit Tools

| Tool | Use Case |
|---|---|
| **axe DevTools** (Chrome extension) | Automated audit in browser |
| **Lighthouse** (Chrome DevTools) | Accessibility score + report |
| **WebAIM WAVE** | Visual overlay of a11y issues |
| **VoiceOver** (macOS) | Screen reader testing |
| **NVDA** (Windows, free) | Screen reader testing |
| `eslint-plugin-jsx-a11y` | Static analysis in editor |

Install ESLint plugin:

```bash
npm install -D eslint-plugin-jsx-a11y
```

```js
// eslint.config.mjs
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default [
  jsxA11y.flatConfigs.recommended,
  // ... other config
];
```

---

## LegalSathi-Specific A11y Notes

- **Legal disclaimers** must be perceivable — use `role="note"` or `aria-label="Legal disclaimer"`.
- **Chat messages** should use `<article>` elements with `aria-label` indicating speaker.
- **Risk badges** must not convey meaning through color alone — include text labels.
- **File upload** drag-and-drop must have a keyboard-accessible fallback `<input type="file">`.
- **Lawyer ratings** should be announced as "4.5 out of 5 stars" not just a visual star rendering.

```tsx
// Risk badge — color + text, never color alone
<span className="badge-danger" aria-label="High risk">
  <span aria-hidden="true">🔴</span> High Risk
</span>

// Rating
<div aria-label={`Rating: ${rating} out of 5 stars`}>
  {/* star icons */}
</div>
```
