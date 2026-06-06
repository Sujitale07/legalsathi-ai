# LegalSathi AI — UI Design Specification

> Full-screen, immersive, modern. Dark sidebar + white main. Perplexity Pro aesthetic.
> Reference: Perplexity Pro, Linear, Vercel dashboard.

---

## Color Palette

### Sidebar (dark)

| Role          | Token                | Hex       |
|---------------|----------------------|-----------|
| Background    | `--sb-bg`            | `#1e1e2e` |
| Surface       | `--sb-surface`       | `#2a2a3d` |
| Surface hover | `--sb-hover`         | `#313147` |
| Border        | `--sb-border`        | `#2d2d3d` |
| Text          | `--sb-text`          | `#e2e8f0` |
| Text muted    | `--sb-muted`         | `#8892a4` |
| Active bg     | `--sb-active-bg`     | `#2d2b52` |
| Active border | `--sb-active-border` | `#6366f1` |

### Main (light)

| Role           | Token              | Hex       |
|----------------|--------------------|-----------|
| Background     | `--bg`             | `#ffffff` |
| Surface        | `--surface`        | `#f8fafc` |
| Surface hover  | `--surface-hover`  | `#f1f5f9` |
| Primary        | `--primary`        | `#6366f1` |
| Primary dark   | `--primary-dark`   | `#4f46e5` |
| Primary tint   | `--primary-tint`   | `#eef2ff` |
| Text           | `--text`           | `#0f172a` |
| Text muted     | `--text-muted`     | `#64748b` |
| Text subtle    | `--text-subtle`    | `#94a3b8` |
| Border         | `--border`         | `#e2e8f0` |
| Border strong  | `--border-strong`  | `#cbd5e1` |
| Error          | `--error`          | `#ef4444` |
| Success        | `--success`        | `#10b981` |

---

## Typography

- **Font:** Geist Sans — fallback: `ui-sans-serif, system-ui, sans-serif`
- **Body:** 15px, `font-weight: 400`, `line-height: 1.7`
- **Sidebar items:** 13px, `--sb-muted`
- **Labels:** 12px, uppercase, `letter-spacing: 0.06em` — sidebar section headers only
- **Headings:** `font-weight: 600`, no letter-spacing in main content
- **Hero heading:** 28px, `font-weight: 700`, `letter-spacing: -0.5px`
- **Messages:** 15px, `line-height: 1.75`

---

## Spacing

4px base scale: `4, 8, 12, 16, 20, 24, 32, 48, 64px`.

---

## Border Radius

| Element         | Radius               |
|-----------------|----------------------|
| Buttons         | `8px`                |
| Inputs          | `12px`               |
| Input hero      | `16px`               |
| Cards           | `12px`               |
| Sidebar items   | `8px`                |
| Avatars         | `50%`                |
| User bubble     | `20px 20px 4px 20px` |
| Suggestion chip | `8px`                |
| Brand mark      | `10px`               |

---

## Shadows

- **Input hero focus:** `0 0 0 4px rgba(99,102,241,0.18)`
- **Input bar:** `0 -1px 0 var(--border)`
- **Floating input:** `0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)`
- **Card:** `0 1px 3px rgba(0,0,0,0.06)`

---

## Components

### Sidebar

- Width: `260px` fixed
- Background: `--sb-bg` (`#1e1e2e`)
- Header: `60px` tall, brand mark + name, bottom border `--sb-border`
- Nav items: `13px`, `--sb-muted`, padding `8px 12px`, radius `8px`
- Active: bg `--sb-active-bg`, `border-left: 3px solid --sb-active-border`, text `#fff`, `font-weight: 500`
- Hover: bg `--sb-hover`
- Section headers: `11px uppercase letter-spacing:0.06em`, color `--sb-muted`, opacity 0.6
- Delete button: hidden by default, appears on row hover, color `--sb-muted` → `#ef4444`
- No border on right side of sidebar — hard contrast with white main handles visual separation

### Chat Layout (active)

- Topbar: `56px`, bg `--bg`, `border-bottom: 1px solid --border`, title `15px font-weight:600`
- Message list: vertically scrollable, max-width `760px` centered, `gap: 32px`, `padding: 40px 24px`
- Input bar: fixed bottom, bg `--bg`, `border-top: 1px solid --border`, `padding: 16px 24px`

### Empty State (hero)

- Full-height centered column, no topbar
- Brand mark: `56px`, radius `10px`, bg `--primary`, white text
- Heading: `28px font-weight:700`, `letter-spacing: -0.5px`
- Sub-text: `16px --text-muted`
- Hero input: `width: 100%`, `max-width: 680px`, radius `16px`, `padding: 20px 24px`, `font-size: 16px`, border `1px solid --border`
- Focus: `box-shadow: 0 0 0 4px rgba(99,102,241,0.18)`, `border-color: --primary`
- Suggestion chips: row of 3, border `1px solid --border`, radius `8px`, `12px`, bg `--surface`, hover bg `--surface-hover`

### Buttons

- **Primary:** bg `--primary`, text white, `8px` radius, `px-5 py-2.5`, `font-weight: 500`
- **Send (circle):** `40px` circle, bg `--primary`, white icon, disabled: `--border` bg
- Hover: `opacity: 0.88`
- Disabled: `opacity: 0.45`, `cursor: not-allowed`

### Chat Bubbles

- **User:** bg `--primary`, text white, `border-radius: 20px 20px 4px 20px`, `px-5 py-3.5`, max-width 65%, `font-size: 15px`
- **AI:** full-width prose block under avatar, no bubble background
  - Left accent bar: `border-left: 3px solid #c7d2fe` (indigo-200), `padding-left: 20px`
  - AI label: `12px font-weight:600 --primary`
  - Content: `15px line-height:1.75 --text`

### Inputs

- Border: `1px solid --border`, bg `--bg`
- Focus: `border-color: --primary`, `box-shadow: 0 0 0 3px rgba(99,102,241,0.15)`
- No floating labels

---

## Animations & Transitions

- Color/border/opacity/shadow: `150ms ease`
- Height (textarea expand): `100ms ease`
- No transforms, no scale on hover, no spring animations
- Thinking dots: `opacity` pulse only (`0.3 → 1`), no translate

---

## Explicitly Banned

- No gradient backgrounds
- No glassmorphism
- No colored glows (focus ring excepted)
- No `rounded-full` on non-circular elements
- No uppercase in main content area
- No transform animations on hover
- No pill buttons (circle send button excepted)
- No fake charts or decorative graphics
- No dramatic drop shadows in main content
- No hero sections inside the active chat view
