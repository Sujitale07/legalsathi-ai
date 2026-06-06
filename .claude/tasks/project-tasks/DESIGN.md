# LegalSathi AI — UI Design Specification

> Enforces Uncodixfy principles: clean, functional, human-designed.
> Reference aesthetic: Linear, Stripe, GitHub, Raycast.

---

## Color Palette — "Porcelain Clean"

| Role        | Token             | Hex       |
|-------------|-------------------|-----------|
| Background  | `--bg`            | `#f9fafb` |
| Surface     | `--surface`       | `#ffffff`  |
| Primary     | `--primary`       | `#4f46e5` |
| Secondary   | `--secondary`     | `#8b5cf6` |
| Accent      | `--accent`        | `#ec4899` |
| Text        | `--text`          | `#111827` |
| Muted Text  | `--text-muted`    | `#6b7280` |
| Border      | `--border`        | `#e5e7eb` |
| Error       | `--error`         | `#dc2626` |
| Warning     | `--warning`       | `#d97706` |
| Success     | `--success`       | `#059669` |

---

## Typography

- **Font:** Geist Sans (already set in Next.js default layout) — system fallback: `ui-sans-serif, system-ui, sans-serif`
- **Body:** 14–15px, `font-weight: 400`, `line-height: 1.6`, color `--text`
- **Labels / metadata:** 13px, `--text-muted`, `font-weight: 500`
- **Headings:** `font-weight: 600`, no letter-spacing, no uppercase, no gradient text
- **Scale:**
  - `text-sm` (13px) — labels, captions
  - `text-base` (15px) — body copy
  - `text-lg` (18px) — section headings
  - `text-2xl` (24px) — page titles
  - `text-3xl` (30px) — landing hero only

**Banned typography:**
- Eyebrow labels (`<small>SECTION TITLE</small>`)
- Gradient text fills
- Mixed serif + sans combinations
- Uppercase + letter-spacing decorative headers

---

## Spacing

Strict 4px base scale. Use only: `4, 8, 12, 16, 20, 24, 32, 48, 64px`.
No random padding values. No overpadded containers.

---

## Border Radius

| Element    | Radius      |
|------------|-------------|
| Buttons    | `6px`       |
| Inputs     | `6px`       |
| Cards      | `8px`       |
| Badges     | `4px`       |
| Avatars    | `50%` (circle) |
| Modals     | `8px`       |

**Max allowed anywhere: `12px`.** No pill shapes, no `rounded-full` on non-circular elements.

---

## Components

### Navbar
- Height: `56px`, `border-bottom: 1px solid var(--border)`, background `--surface`
- Brand: text only (`font-weight: 700`, `--text`), no gradient logo block
- Nav links: `14px`, `--text-muted` default, `--text` on hover, `--primary` on active
- Active state: `border-bottom: 2px solid var(--primary)` — no pill background
- CTA button: solid `--primary` fill, `6px` radius, no gradient, `14px` text
- Mobile: hamburger icon toggle, no animated slide-in — simple `display: block/none`

### Footer
- `border-top: 1px solid var(--border)`, background `--surface`
- 3-column grid on desktop, stacked on mobile
- Links: `14px --text-muted`, hover `--text`
- No decorative copy, no graphic elements, minimal height (~120px)

### Buttons
- **Primary:** bg `--primary`, text white, `6px` radius, `px-4 py-2`, `font-weight: 500`
- **Secondary:** bg `--surface`, border `--border`, text `--text`, same sizing
- **Danger:** bg `--error`, text white
- Hover: `opacity: 0.9` — no transform, no shadow changes
- No gradient backgrounds, no pill shapes, no glow effects

### Cards
- bg `--surface`, border `1px solid var(--border)`, radius `8px`
- Shadow: `0 1px 4px rgba(0,0,0,0.06)` max — no dramatic drop shadows
- Padding: `20px` consistent
- Hover on clickable cards: border color shift to `--primary` at low opacity — no lift/translate effect

### Inputs & Textareas
- Border: `1px solid var(--border)`, radius `6px`, bg `--surface`
- Focus: `border-color: var(--primary)`, `outline: 2px solid rgba(79,70,229,0.2)`
- No floating labels, no animated underlines, no morphing shapes
- Label always above the input, `13px --text-muted font-weight: 500`

### Badges / Risk Labels
- Padding: `2px 8px`, radius `4px`, `12px font-weight: 500`
- Low risk: bg `#dcfce7`, text `#15803d`
- Medium risk: bg `#fef9c3`, text `#a16207`
- High risk: bg `#fee2e2`, text `#dc2626`
- No glow, no drop shadow, no pulse animation

### Chat Bubbles
- User message: bg `--primary`, text white, radius `8px 8px 2px 8px`, `px-4 py-3`
- AI message: bg `--surface`, border `1px solid var(--border)`, radius `8px 8px 8px 2px`
- No floating glassmorphism panels, no dramatic shadows
- Avatar: 32px circle, simple initials or icon — no status rings

### Lawyer Cards
- Standard card pattern (see Cards above)
- Photo: 48px circle, simple, no decorative border
- Rating: simple star icons, no glow
- Specialization chips: `4px` radius, border `1px solid var(--border)`, `12px` text — no pill shapes
- "Featured" badge: `4px` radius, bg `--primary` at 10% opacity, text `--primary`, `font-weight: 600`

---

## Page Layouts

### Landing Page
- Max-width container: `1200px` centered, `px-6` sides
- Hero section: full-width, bg `--bg`, no gradient background, no floating panels
- Feature cards: 3-column grid, `gap-6`, standard card pattern
- Stats row: 4 columns, large numbers `text-3xl font-bold`, label `14px --text-muted`
- No hero sections inside other sections, no decorative copy blocks

### Chat Page
- Two-panel layout: narrow info sidebar (240px) + main chat area
- Or: single column if sidebar adds no value — don't force it
- Message list: vertically scrollable, `gap-4` between messages
- Input area: `border-top: 1px solid var(--border)`, fixed at bottom of chat area

### Contract Review Page
- Single-column, centered, max-width `720px`
- Upload area: dashed `border: 2px dashed var(--border)`, simple drag-drop cue
- Results: stacked sections with `border-top` dividers, no nested card-in-card

### Lawyer Directory
- Filter bar: horizontal row below page title, simple `select` dropdowns + text input
- Grid: `3 col → 2 col → 1 col` responsive, `gap-5`

### Lawyer Profile
- Two-column: main content left (2/3), contact sidebar right (1/3)
- Simple `border-left: 1px solid var(--border)` on sidebar — no floating panel

---

## Animations & Transitions

- Duration: `150ms ease` for color/border/opacity changes
- No `transform`, no `translateX/Y`, no `scale` on hover
- No bouncy easings, no spring animations
- No skeleton loaders with shimmer animations (simple `opacity: 0.5` pulse max)

---

## Explicitly Banned for This Project

- No gradient backgrounds anywhere (hero or otherwise)
- No `rounded-full` on non-circular elements
- No glassmorphism / backdrop-filter blur panels
- No colored box shadows or glows
- No eyebrow labels (`<small>CATEGORY</small>` style)
- No hero sections inside the dashboard or app pages
- No metric-card grid as default layout
- No decorative copy ("Operational clarity without the clutter")
- No uppercase + letter-spacing labels
- No transform animations on hover
- No pill-shaped buttons or tags
- No blue-black gradient "premium dark" mode
- No fake charts to fill space
- No status dots with `::before` pseudo-elements
- No sticky right rail unless genuinely needed
- No nav badges with counts
