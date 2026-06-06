# LegalSathi AI — Detailed Task Progress

> Last updated: 2026-06-06 | Hackathon Build

Legend: `[ ]` = not started · `[x]` = done · `[~]` = in progress

---

## PHASE 1 — Project Setup

### 1.1 Initialize Next.js Project
- [x] Create Next.js app with App Router
- [x] Enable TypeScript
- [x] Enable Tailwind CSS
- [x] Enable ESLint
- [x] Configure import aliases in tsconfig.json

### 1.2 Install Required Dependencies
- [ ] Install `@anthropic-ai/sdk` — Claude API client
- [ ] Install `ai` (Vercel AI SDK) — streaming helpers
- [ ] Install `pdf-parse` — PDF text extraction for contract upload
- [ ] Install `lucide-react` — icon library
- [ ] Install `clsx` + `tailwind-merge` — conditional class utility
- [ ] Install `@types/pdf-parse` — TypeScript types for pdf-parse

### 1.3 Setup Project Folder Structure
- [ ] Create `app/chat/page.tsx`
- [ ] Create `app/contract-review/page.tsx`
- [ ] Create `app/lawyers/page.tsx`
- [ ] Create `app/lawyers/[id]/page.tsx`
- [ ] Create `app/api/chat/route.ts`
- [ ] Create `app/api/review/route.ts`
- [ ] Create `components/` directory
- [ ] Create `data/` directory
- [ ] Create `lib/` directory

### 1.4 Environment Configuration
- [ ] Create `.env.local` with `ANTHROPIC_API_KEY=` placeholder
- [ ] Confirm `.env.local` is in `.gitignore`

### 1.5 Verify Development Setup
- [x] Dev server starts without errors (`pnpm dev` → http://localhost:3000)
- [ ] Confirm no missing dependency errors after new installs

---

## PHASE 2 — Core Architecture Setup

### 2.1 AI Client Configuration (`lib/claude.ts`)
- [ ] Initialize `Anthropic` client using `process.env.ANTHROPIC_API_KEY`
- [ ] Set default model to `claude-sonnet-4-20250514`
- [ ] Write shared system prompt including:
  - [ ] Nepal-specific legal context (Civil Code 2074, Labor Act 2074, Company Act 2063, etc.)
  - [ ] Instruction to format responses clearly in plain English
  - [ ] Mandatory disclaimer on every response
  - [ ] Rule: never fabricate case law or court decisions
  - [ ] Instruction to suggest professional lawyers for complex matters

### 2.2 Lawyer Dataset (`data/lawyers.ts`)
- [ ] Define `Lawyer` TypeScript interface with fields:
  - `id`, `name`, `photo`, `specializations[]`, `location`, `experience`, `languages[]`, `feeRange`, `rating`, `bio`, `education`, `phone`, `email`, `featured`
- [ ] Populate 10–15 realistic mock lawyer profiles with variation in:
  - [ ] Specialization (Business, Labor, Property, Family, Criminal, Immigration)
  - [ ] Location (Kathmandu, Pokhara, Lalitpur, Bhaktapur, etc.)
  - [ ] Experience (2–25 years)
  - [ ] Fee range (NPR 2,000 – 20,000)
  - [ ] Featured vs. standard listing
- [ ] Export `specializations` filter list
- [ ] Export `locations` filter list

### 2.3 Navbar Component (`components/Navbar.tsx`)
- [ ] Brand logo + "LegalSathi" name on the left
- [ ] Navigation links: "Legal Q&A", "Contract Review", "Find a Lawyer"
- [ ] Active link highlighting using `usePathname()`
- [ ] "Ask a Question" CTA button (links to `/chat`)
- [ ] Mobile hamburger menu toggle
- [ ] Responsive: full menu on desktop, collapsed on mobile

### 2.4 Footer Component (`components/Footer.tsx`)
- [ ] Brand name + one-line description
- [ ] Quick links: Q&A, Contract Review, Lawyers
- [ ] Legal disclaimer text (AI is not a substitute for professional advice)
- [ ] Copyright line
- [ ] Responsive 3-column grid → single column on mobile

### 2.5 Global Layout (`app/layout.tsx`)
- [ ] Import and render `<Navbar />` on every page
- [ ] Import and render `<Footer />` on every page
- [ ] Set global font (Inter or similar)
- [ ] Add `pt-16` or equivalent top padding to avoid navbar overlap
- [ ] Configure page metadata (title: "LegalSathi AI", description)

---

## PHASE 3 — Landing Page (`app/page.tsx`)

### 3.1 Hero Section
- [ ] Full-width gradient background (blue → purple or green → blue)
- [ ] H1: bold value proposition headline (e.g., "Legal Answers for Every Nepali")
- [ ] Subheading: 1–2 sentence platform description
- [ ] Primary CTA button → `/chat`
- [ ] Secondary CTA button → `/contract-review`
- [ ] Mobile responsive layout

### 3.2 Feature Highlight Section
- [ ] 3-column card grid (→ 1 column on mobile)
- [ ] Card 1 — AI Legal Q&A: icon + title + description + "Try it" link
- [ ] Card 2 — Contract Review: icon + title + description + "Upload" link
- [ ] Card 3 — Lawyer Finder: icon + title + description + "Browse" link
- [ ] Hover effect on each card

### 3.3 Statistics Section
- [ ] Display 4 key metrics:
  - "10,000+ Legal Questions Answered"
  - "500+ Contracts Reviewed"
  - "50+ Verified Lawyers"
  - "30M+ Citizens Served"
- [ ] Large numbers visually prominent
- [ ] Horizontally centered, responsive grid

### 3.4 Use Cases / Legal Topics Section
- [ ] Chip/tag display of 8 legal problem categories:
  - Business Registration, Rental Disputes, Employment Issues, Land Disputes, Family Law, Criminal Defense, Immigration, Startup Contracts
- [ ] Clickable chips that navigate to `/chat` with pre-filled query (optional)

### 3.5 Why LegalSathi Section
- [ ] 3 benefit icons with short explanations:
  - Instant answers
  - Grounded in Nepali law
  - Plain language, no jargon
- [ ] Clean two-column or centered layout

### 3.6 Final CTA Section
- [ ] Contrasting background section at page bottom
- [ ] "Ready to get legal clarity?" headline
- [ ] Big "Start Asking Now" button → `/chat`

---

## PHASE 4 — AI Chat System

### 4.1 Chat API Route (`app/api/chat/route.ts`)
- [ ] Accept `POST` with `{ messages: { role, content }[] }` body
- [ ] Validate request body — return 400 if malformed
- [ ] Call Claude API with:
  - [ ] Model: `claude-sonnet-4-20250514`
  - [ ] System prompt from `lib/claude.ts`
  - [ ] `max_tokens: 1500`
  - [ ] `stream: true`
- [ ] Return streaming `text/event-stream` response
- [ ] Handle Claude API errors → return 500 with message

### 4.2 Chat Page UI (`app/chat/page.tsx`)
- [ ] Page title: "AI Legal Q&A"
- [ ] Scrollable message history area
- [ ] User message bubble (right-aligned, colored)
- [ ] AI message bubble (left-aligned, neutral)
- [ ] Avatar icons for User vs. AI
- [ ] Loading / typing indicator while streaming
- [ ] Auto-scroll to latest message on new message

### 4.3 Message Input System
- [ ] Textarea input for multi-line questions
- [ ] "Send" button with icon
- [ ] Submit on `Enter` key (Shift+Enter for newline)
- [ ] Disable input + button while AI is responding
- [ ] Clear input field on send
- [ ] Prevent sending empty messages

### 4.4 Suggestion Chips
- [ ] Show 4–6 pre-written sample legal questions on load
- [ ] Example questions:
  - "What are my rights if my landlord won't return my deposit?"
  - "How do I register a private limited company in Nepal?"
  - "Can my employer fire me without notice?"
  - "What is the process for divorce in Nepal?"
- [ ] Clicking a chip populates the input field
- [ ] Hide suggestions after first message is sent

### 4.5 UX Enhancements
- [ ] Yellow/amber disclaimer banner at top of chat page
- [ ] "Find a Lawyer" button appears after 3+ message exchanges
- [ ] Smooth text streaming render (no flickering)
- [ ] Graceful error fallback: show error message in chat if API fails

---

## PHASE 5 — Contract Review System

### 5.1 Contract Review API Route (`app/api/review/route.ts`)
- [ ] Accept `POST` with `{ contractText: string }` body
- [ ] Validate: reject if `contractText` is shorter than 50 characters
- [ ] Build review prompt instructing Claude to return **strict JSON only**:
  ```json
  {
    "summary": "string",
    "riskScore": "Low | Medium | High",
    "keyClauses": [{ "title": "string", "explanation": "string" }],
    "risks": ["string"],
    "missingProtections": ["string"]
  }
  ```
- [ ] Call Claude with `max_tokens: 2500`, JSON-only instruction
- [ ] Parse response JSON safely (`try/catch`)
- [ ] Return structured object or 500 on parse failure

### 5.2 File Upload System
- [ ] Hidden `<input type="file" accept=".txt,.pdf" />`
- [ ] Visible styled upload button triggers file input
- [ ] On `.txt` file: read with `FileReader.readAsText()`
- [ ] On `.pdf` file: send to server or use `pdf-parse` server-side
- [ ] Display extracted text in the textarea for user to review before submitting

### 5.3 Contract Review Page UI (`app/contract-review/page.tsx`)
- [ ] Page title + description
- [ ] Large textarea for pasting contract text
- [ ] Upload button for file input
- [ ] Character count display
- [ ] "Analyze Contract" submit button
- [ ] Loading spinner / skeleton during analysis
- [ ] Clear error message display

### 5.4 Results Display
- [ ] Contract Summary card (top, always visible)
- [ ] Risk Score badge (color-coded: green/yellow/red)
- [ ] Key Clauses section — expandable list per clause
- [ ] Risk Flags section — bulleted red-highlighted list
- [ ] Missing Protections section — bulleted amber list
- [ ] All sections collapsible/expandable

### 5.5 Risk Badge Component (`components/RiskBadge.tsx`)
- [ ] Accepts `level: "Low" | "Medium" | "High"` prop
- [ ] Low → green badge
- [ ] Medium → yellow/amber badge
- [ ] High → red badge
- [ ] Icon + label text

### 5.6 Reset Flow
- [ ] "Analyze Another Contract" button shown after results
- [ ] Clears textarea, results, and resets to initial state

---

## PHASE 6 — Lawyer Discovery System

### 6.1 Lawyer Directory Page (`app/lawyers/page.tsx`)
- [ ] Page title "Find a Lawyer in Nepal"
- [ ] Load full lawyer dataset from `data/lawyers.ts`
- [ ] Render all lawyer cards in responsive grid (3 col → 2 col → 1 col)

### 6.2 Search Functionality
- [ ] Text search input at top of page
- [ ] Filter by: name, specialization keyword
- [ ] Real-time filtering as user types (no submit button needed)

### 6.3 Filter Dropdowns
- [ ] "Specialization" dropdown using `specializations` list from data
- [ ] "Location" dropdown using `locations` list from data
- [ ] Combined: search + specialization + location all filter simultaneously
- [ ] "Clear filters" button resets all filters

### 6.4 Lawyer Card Component (`components/LawyerCard.tsx`)
- [ ] Profile photo (or fallback avatar)
- [ ] Name (bold)
- [ ] Star rating display
- [ ] Experience in years
- [ ] Location with icon
- [ ] Top 2–3 specializations as chips
- [ ] Fee range
- [ ] "Featured" badge if `featured: true`
- [ ] Full card is clickable → navigates to `/lawyers/[id]`

### 6.5 Lawyer Profile Page (`app/lawyers/[id]/page.tsx`)
- [ ] Dynamic route: look up lawyer by `id` from params
- [ ] 404 redirect if lawyer not found
- [ ] Display all profile fields:
  - Photo, name, rating, location, experience
  - Full bio paragraph
  - Education history
  - Languages spoken
  - All specializations
  - Fee range
- [ ] "Back to Directory" navigation link
- [ ] Contact section (phone, email, consultation button)

### 6.6 Contact UI
- [ ] Phone: `<a href="tel:+977...">` clickable link
- [ ] Email: `<a href="mailto:...">` clickable link
- [ ] "Request Consultation" button → shows success toast/message (mock)

---

## PHASE 7 — Polish & Deployment

### 7.1 Full System Testing
- [ ] Landing page: all links work, no broken navigation
- [ ] Chat: messages send, stream renders correctly, suggestions work
- [ ] Contract review: file upload works, analysis returns, results display
- [ ] Lawyer directory: search + filters work, cards link correctly
- [ ] Lawyer profile: dynamic routes resolve, contact links work
- [ ] Mobile: all pages usable on 375px viewport
- [ ] Console: zero errors, zero warnings

### 7.2 Performance & UX
- [ ] Page transitions feel smooth
- [ ] No layout shift on load
- [ ] Loading states on all async operations
- [ ] Error states on all failure paths
- [ ] Consistent spacing and alignment across pages

### 7.3 Deployment
- [ ] Run `pnpm build` — zero TypeScript errors, zero ESLint errors
- [ ] Deploy to Vercel (`vercel --prod`)
- [ ] Set `ANTHROPIC_API_KEY` in Vercel environment variables
- [ ] Verify live URL: all three features functional

### 7.4 Demo Preparation
- [ ] Scripted walkthrough ready:
  1. Landing page — explain the product
  2. Chat demo — ask "How do I register a company in Nepal?"
  3. Contract review — paste a sample rental agreement
  4. Lawyer finder — search "property" in Kathmandu
- [ ] Sample contract text ready to paste
- [ ] Backup: cached AI responses in case of API rate limits

### 7.5 Final QA Checklist
- [ ] No broken links
- [ ] No runtime JavaScript errors
- [ ] All 5 pages accessible and functional
- [ ] API routes return correct responses
- [ ] Mobile UI is usable
- [ ] AI responses include disclaimer
- [ ] Deployment successful and live

---

## Summary

| Phase | Tasks | Done |
|---|---|---|
| 1 — Setup | 14 | 4 |
| 2 — Architecture | 22 | 0 |
| 3 — Landing Page | 16 | 0 |
| 4 — Chat System | 18 | 0 |
| 5 — Contract Review | 16 | 0 |
| 6 — Lawyer Finder | 20 | 0 |
| 7 — Polish & Deploy | 17 | 0 |
| **Total** | **123** | **4** |
