# LegalSathi AI — Product Requirements Document

> v1.0 · Hackathon Edition · June 2026
> Nepal's AI-powered legal assistant for citizens, businesses & lawyers

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Product Vision & Goals](#3-product-vision--goals)
4. [Feature Specifications](#4-feature-specifications)
5. [Technical Architecture](#5-technical-architecture)
6. [Monetization Model](#6-monetization-model)
7. [Hackathon Build Plan](#7-hackathon-build-plan-24-hours)
8. [Risks & Mitigations](#8-risks--mitigations)
9. [Out of Scope](#9-out-of-scope-hackathon-v1)
10. [Future Roadmap](#10-future-roadmap)
11. [Appendix: Key Nepali Laws](#appendix-key-nepali-laws-referenced)

---

## 1. Executive Summary

LegalSathi is an AI-powered legal assistant platform designed for the Nepali market. It democratizes access to legal knowledge by enabling anyone to ask legal questions in plain English, review contracts using AI, and find and connect with verified lawyers — all in one product.

The platform addresses three critical pain points:

- **Legal literacy gap** — Most citizens do not understand their rights, contracts, or government procedures.
- **Access barrier** — Quality legal advice is expensive and geographically concentrated in Kathmandu.
- **Discovery problem** — There is no trusted, structured directory for finding specialized lawyers in Nepal.

---

## 2. Problem Statement

### 2.1 Target Users

| User Segment | Core Problem | Willingness to Pay |
|---|---|---|
| Individual Citizens | Do not understand rights, contracts, government paperwork | Low – Medium |
| Small Business Owners | Need compliance guidance, contract drafting, labor law help | Medium – High |
| Startup Founders | Company registration, IP, investment agreements | High |
| Lawyers / Law Firms | Need qualified client leads | High (lead fees) |
| HR / Legal Teams | Bulk contract review, compliance monitoring | High (subscription) |

### 2.2 Market Context

- Nepal has approximately 10,000+ registered lawyers for a population of 30 million.
- Legal consultation fees range from NPR 2,000 to NPR 20,000+ per session.
- Most legal information available online is in English legalese, inaccessible to average citizens.
- No dominant AI-powered legal tech product exists in the Nepali market as of 2026.

---

## 3. Product Vision & Goals

### 3.1 Vision Statement

> *"LegalSathi makes legal knowledge as accessible as a Google search — instant, understandable, and actionable — for every Nepali citizen and business."*

### 3.2 Hackathon Goals (24-Hour Build)

- Ship a working Next.js full-stack application with three core features.
- Demonstrate AI Legal Q&A powered by Claude API.
- Demonstrate AI Contract Review with file upload and analysis.
- Demonstrate Lawyer Finder with search, filter, and profile views.
- Present a polished, demo-ready UI that judges can interact with live.

### 3.3 Success Metrics

| Metric | Hackathon Target | 3-Month Target |
|---|---|---|
| AI Q&A response quality | Judges rate 4+/5 | 95% relevant responses |
| Contract review accuracy | Demo flows cleanly | Key clause identification |
| Lawyer profiles shown | 10+ mock profiles | 50+ real lawyer onboarding |
| Page load speed | Under 2 seconds | Under 1.5 seconds |
| Mobile responsiveness | 100% of pages | 100% of pages |

---

## 4. Feature Specifications

### 4.1 Feature 1: AI Legal Q&A Chatbot

#### Overview
A conversational AI interface where users type legal questions in plain English and receive clear, structured answers grounded in Nepali law context.

#### User Stories
- As a citizen, I want to ask what my rights are if my landlord refuses to return my deposit, so that I understand my options without hiring a lawyer.
- As a business owner, I want to know the steps to register a private limited company, so that I can prepare the right documents.
- As a user, I want the AI to suggest consulting a lawyer for complex issues, so that I get appropriate help.

#### Functional Requirements
- Chat interface with message history within a session.
- Powered by Claude Sonnet API with a Nepal-law-aware system prompt.
- AI must add a disclaimer on all responses: advice is informational, not a substitute for professional legal counsel.
- Suggested follow-up questions shown after each response.
- CTA to connect with a lawyer shown contextually.

#### AI System Prompt Design
The system prompt instructs Claude to:
- Act as a knowledgeable but cautious Nepali legal guide.
- Reference relevant acts (Civil Code 2074, Labor Act 2074, Company Act 2063, etc.) when applicable.
- Respond in clear, plain English with structured formatting.
- Always recommend professional legal advice for complex or high-stakes matters.
- Never fabricate specific case law or court decisions.

#### API Route
```
POST /api/chat
Body: { messages: [ { role, content } ] }
Response: streamed text
```

---

### 4.2 Feature 2: AI Contract Review

#### Overview
Users upload a contract (PDF or plain text), and the AI analyzes it for key clauses, risks, missing protections, and plain-language summaries.

#### User Stories
- As a tenant, I want to upload my rental agreement and get a summary of key terms, so that I know what I'm agreeing to.
- As a business owner, I want to know which clauses in a vendor contract are risky or one-sided, so that I can negotiate.
- As a freelancer, I want to see if a client contract protects my payment terms and IP rights.

#### Functional Requirements
- File upload: accept PDF and `.txt` formats.
- Extract and display text before analysis.
- AI analysis output structured into sections:
  - Contract Summary (2–3 sentences)
  - Key Clauses identified and explained
  - Risk Flags (highlighted)
  - Missing Protections
  - Overall Risk Score: `Low` / `Medium` / `High`
- Option to ask follow-up questions about the contract.
- Credits-based usage model: 3 free reviews, then paid.

#### API Route
```
POST /api/review
Body: { contractText: string }
Response: { summary, clauses, risks, missing, riskScore }
```

---

### 4.3 Feature 3: Lawyer Finder

#### Overview
A searchable directory of lawyers with profiles, specializations, location, and contact options. Lawyers pay for premium placement and lead access.

#### User Stories
- As a user, I want to find a family law specialist in Kathmandu, so that I can get targeted help.
- As a user, I want to see a lawyer's specialization, experience, and fee range before contacting them.
- As a lawyer, I want to receive qualified leads from users who need my specialty.

#### Functional Requirements
- Search bar with filters: Specialization, Location, Language, Fee Range.
- Lawyer profile cards: Name, Photo, Specialization, Experience, Location, Languages, Fee Range, Rating.
- Profile detail page with full bio and contact button.
- Contact button sends lead notification (mock in hackathon).
- Featured / Premium badge for paying lawyers.

#### Lawyer Specializations (v1)

| Category | Sub-specializations |
|---|---|
| Business & Corporate | Company Registration, Contracts, M&A, Startup Law |
| Labor & Employment | Wrongful Termination, HR Compliance, Union Law |
| Property & Real Estate | Land Disputes, Rental, Title Verification |
| Family Law | Divorce, Inheritance, Child Custody |
| Criminal Defense | Bail, FIR Response, Appeals |
| Immigration | Visa, Citizenship, Work Permits |

---

## 5. Technical Architecture

### 5.1 Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Frontend | Next.js 14 (App Router) | SSR + API routes in one framework |
| Styling | Tailwind CSS | Fast, consistent UI development |
| AI Engine | Claude Sonnet (`claude-sonnet-4-20250514`) | Best quality legal reasoning |
| File Parsing | `pdf-parse` / native text extraction | Contract PDF reading |
| Data | Mock JSON (hackathon) → PostgreSQL (production) | Speed for demo |
| Hosting | Vercel | Zero-config Next.js deployment |
| Auth (optional) | NextAuth.js | Simple auth if time permits |

### 5.2 Folder Structure

```
legalsathi/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── chat/
│   │   └── page.tsx              # AI Legal Q&A
│   ├── contract-review/
│   │   └── page.tsx              # Contract Review
│   ├── lawyers/
│   │   ├── page.tsx              # Lawyer Directory
│   │   └── [id]/
│   │       └── page.tsx          # Lawyer Profile
│   └── api/
│       ├── chat/
│       │   └── route.ts          # Claude chat handler
│       └── review/
│           └── route.ts          # Claude contract review handler
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── ChatMessage.tsx
│   ├── LawyerCard.tsx
│   └── RiskBadge.tsx
├── data/
│   └── lawyers.ts                # Mock lawyer data
├── lib/
│   └── claude.ts                 # Anthropic client setup
├── .env.local                    # API keys (never commit)
├── tailwind.config.ts
└── package.json
```

### 5.3 Environment Variables

```bash
# .env.local
ANTHROPIC_API_KEY=your_key_here
```

### 5.4 Claude API Integration Notes

- **Model:** `claude-sonnet-4-20250514` for all features
- **Max tokens:** 1500 for Q&A, 2500 for contract review
- **System prompts** are feature-specific, stored server-side only
- **Streaming** used for chat responses (better UX)
- **API key** in `ANTHROPIC_API_KEY` env var — never in client code

### 5.5 Page Routes

| Route | Page | Key Components |
|---|---|---|
| `/` | Landing Page | Hero, Features, CTA |
| `/chat` | Legal Q&A Chatbot | Chat UI, Message History, Disclaimer |
| `/contract-review` | Contract Review | File Upload, Analysis Output, Risk Badge |
| `/lawyers` | Lawyer Directory | Search, Filters, Profile Cards |
| `/lawyers/[id]` | Lawyer Profile | Full Profile, Contact Button |
| `/api/chat` | API: Chat | Claude streaming handler |
| `/api/review` | API: Contract Review | File processing + Claude |

---

## 6. Monetization Model

| Revenue Stream | Mechanism | Price (NPR) |
|---|---|---|
| Freemium Q&A | 5 free queries/day, unlimited for Premium | Free / 299/month |
| Contract Review Credits | 3 free, then pay-per-review | 150–500 per review |
| Premium Subscription | Unlimited Q&A + 10 reviews/month | 799/month |
| Lawyer Lead Generation | Lawyer pays per qualified lead | 500–2,000 per lead |
| Lawyer Premium Listing | Featured placement in directory | 2,000–5,000/month |
| Business Compliance Plan | Team access + compliance calendar | 4,999–9,999/month |

---

## 7. Hackathon Build Plan (24 Hours)

| Phase | Time | Deliverable |
|---|---|---|
| Phase 1: Setup | 0–1 hr | Next.js project, Tailwind, folder structure, env vars |
| Phase 2: Landing Page | 1–2 hrs | Hero, feature cards, nav, footer |
| Phase 3: Chat Feature | 2–4 hrs | Chat UI + Claude API + system prompt |
| Phase 4: Contract Review | 4–7 hrs | File upload, PDF parsing, Claude analysis, output UI |
| Phase 5: Lawyer Finder | 7–9 hrs | Directory, filters, profile cards, detail page |
| Phase 6: Polish | 9–11 hrs | Responsive design, loading states, error handling |
| Phase 7: Demo Prep | 11–12 hrs | Test all flows, demo script, deploy to Vercel |

### Priority Order (if time runs short)
1. ✅ Chat — most impressive AI demo
2. ✅ Landing page — first impression for judges
3. ✅ Contract review — high wow factor
4. ⚠️ Lawyer finder — can use static mock if needed

---

## 8. Risks & Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Claude API rate limits during demo | Low | Cache sample responses; have offline fallback |
| PDF parsing fails for complex contracts | Medium | Accept plain text paste as fallback |
| UI not polished enough | Medium | Use shadcn/ui components + Tailwind defaults |
| Not enough time for all 3 features | Medium | Chat is MVP; lawyer finder can be static |
| Legal accuracy concerns from judges | Low | Prominent disclaimers on every AI response |

---

## 9. Out of Scope (Hackathon v1)

- Nepali language support (Devanagari) — planned for v2
- Real lawyer onboarding and verification
- Payment gateway (Khalti, eSewa)
- User accounts and persistent history
- Mobile native app (iOS/Android)
- Document generation (draft contracts from templates)
- Court case tracking

---

## 10. Future Roadmap

| Version | Timeline | Key Features |
|---|---|---|
| v1.0 (Hackathon) | Now | Q&A Chat, Contract Review, Lawyer Finder |
| v1.5 | Month 1–2 | Auth, saved history, real lawyer profiles, payments |
| v2.0 | Month 3–4 | Nepali language, document drafting, compliance calendar |
| v3.0 | Month 6+ | Mobile app, lawyer CRM dashboard, court filing tracker |

---

## Appendix: Key Nepali Laws Referenced

- **Muluki Civil Code 2074 (2017)** — property, contracts, family
- **Labor Act 2074 (2017)** — employment rights and obligations
- **Company Act 2063 (2006)** — company registration and governance
- **Consumer Protection Act 2075 (2018)** — buyer rights
- **Electronic Transaction Act 2063 (2006)** — digital contracts and signatures
- **Income Tax Act 2058 (2002)** — tax obligations
- **Foreign Investment and Technology Transfer Act 2075** — startup/FDI

---

*LegalSathi AI · Hackathon Build · June 2026*