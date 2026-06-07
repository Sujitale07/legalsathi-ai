import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'

const OUT = path.resolve('LegalSathi-AI-Technical-Docs.pdf')
const doc = new PDFDocument({ margin: 55, size: 'A4', bufferPages: true })
const stream = fs.createWriteStream(OUT)
doc.pipe(stream)

// ── colour palette ──────────────────────────────────────────────────────────
const NAVY   = '#1E2E4F'
const TEAL   = '#0D9488'
const GRAY   = '#6B7280'
const LGRAY  = '#F3F4F6'
const BLACK  = '#111827'
const WHITE  = '#FFFFFF'

// ── helpers ─────────────────────────────────────────────────────────────────
const W = doc.page.width - 110   // usable width

function pageHeader() {
  doc.save()
    .rect(0, 0, doc.page.width, 36)
    .fill(NAVY)
    .font('Helvetica-Bold').fontSize(9).fillColor(WHITE)
    .text('LegalSathi AI  —  Technical Architecture Documentation', 55, 12)
    .text('CONFIDENTIAL', doc.page.width - 110, 12, { width: 80, align: 'right' })
    .restore()
}

function h1(txt) {
  doc.addPage()
  pageHeader()
  doc.moveDown(2)
  doc.save()
    .rect(55, doc.y, W, 34)
    .fill(NAVY)
    .font('Helvetica-Bold').fontSize(16).fillColor(WHITE)
    .text(txt, 65, doc.y + 9, { width: W - 20 })
    .restore()
  doc.moveDown(2.2)
  doc.fillColor(BLACK)
}

function h2(txt) {
  doc.moveDown(0.8)
  doc.font('Helvetica-Bold').fontSize(12).fillColor(NAVY).text(txt)
  doc.moveTo(55, doc.y + 2).lineTo(55 + W, doc.y + 2).stroke(TEAL)
  doc.moveDown(0.6)
  doc.fillColor(BLACK)
}

function h3(txt) {
  doc.moveDown(0.5)
  doc.font('Helvetica-Bold').fontSize(10).fillColor(TEAL).text(txt)
  doc.moveDown(0.3)
  doc.fillColor(BLACK)
}

function body(txt) {
  doc.font('Helvetica').fontSize(9.5).fillColor(BLACK).text(txt, { lineGap: 3 })
  doc.moveDown(0.4)
}

function bullet(items) {
  for (const item of items) {
    doc.font('Helvetica').fontSize(9.5).fillColor(BLACK)
      .text(`• ${item}`, { indent: 14, lineGap: 2 })
  }
  doc.moveDown(0.4)
}

function kv(label, value) {
  doc.font('Helvetica-Bold').fontSize(9.5).fillColor(NAVY)
    .text(label + '  ', { continued: true })
    .font('Helvetica').fillColor(BLACK).text(value, { lineGap: 2 })
}

function code(txt) {
  const lines = txt.trim().split('\n')
  const lineH = 13
  const boxH = lines.length * lineH + 14
  doc.save()
    .rect(55, doc.y, W, boxH).fill(LGRAY)
    .font('Courier').fontSize(7.5).fillColor('#374151')
  let y = doc.y + 7
  for (const ln of lines) {
    doc.text(ln, 65, y, { lineBreak: false, width: W - 20 })
    y += lineH
  }
  doc.restore()
  doc.moveDown((boxH + 6) / 14.5)
}

function table(headers, rows) {
  const colW = Math.floor(W / headers.length)
  const rowH = 18
  let x = 55, y = doc.y

  // header row
  doc.save().rect(x, y, W, rowH).fill(NAVY).restore()
  doc.font('Helvetica-Bold').fontSize(8).fillColor(WHITE)
  headers.forEach((h, i) => {
    doc.text(h, x + i * colW + 5, y + 5, { width: colW - 8, lineBreak: false })
  })
  y += rowH

  // data rows
  rows.forEach((row, ri) => {
    doc.save().rect(x, y, W, rowH).fill(ri % 2 === 0 ? '#F9FAFB' : WHITE).restore()
    doc.font('Helvetica').fontSize(8).fillColor(BLACK)
    row.forEach((cell, ci) => {
      doc.text(String(cell), x + ci * colW + 5, y + 4, { width: colW - 8, lineBreak: false })
    })
    y += rowH
  })
  doc.moveTo(55, y).lineTo(55 + W, y).stroke('#D1D5DB')
  doc.y = y + 8
  doc.moveDown(0.5)
}

function note(txt, colour = TEAL) {
  const startY = doc.y
  doc.save()
    .rect(55, startY, 3, 999).fill(colour)
    .restore()
  doc.font('Helvetica-Oblique').fontSize(8.8).fillColor(GRAY)
    .text(txt, 64, startY, { width: W - 9, lineGap: 2 })
  doc.moveDown(0.8)
  doc.fillColor(BLACK)
}

// ════════════════════════════════════════════════════════════════════════════
//  COVER PAGE
// ════════════════════════════════════════════════════════════════════════════
doc.save()
  .rect(0, 0, doc.page.width, doc.page.height).fill(NAVY)
  .restore()

doc.font('Helvetica-Bold').fontSize(38).fillColor(WHITE)
  .text('LegalSathi AI', 55, 180, { align: 'center' })
doc.font('Helvetica').fontSize(16).fillColor('#94A3B8')
  .text('Technical Architecture Documentation', { align: 'center' })
doc.moveDown(0.6)
doc.font('Helvetica').fontSize(10).fillColor('#64748B')
  .text('Version 1.0  ·  June 2026  ·  Confidential', { align: 'center' })

doc.save()
  .moveTo(140, doc.y + 30).lineTo(doc.page.width - 140, doc.y + 30).stroke(TEAL)
  .restore()
doc.moveDown(4)

const sections = [
  '1  Runtime & Framework',
  '2  AI / LLM Stack',
  '3  Authentication — Clerk v7',
  '4  Database — PostgreSQL + pgvector',
  '5  RAG Pipeline',
  '6  Legal Domain System',
  '7  Chat API — Streaming',
  '8  Document Ingestion',
  '9  Voice Architecture',
  '10  Export System',
  '11  Lawyer Directory',
  '12  Frontend Components',
  '13  Environment Variables',
  '14  Build & Deployment',
  '15  Full Data-Flow Diagram',
]
doc.font('Helvetica').fontSize(10).fillColor('#CBD5E1')
for (const s of sections) {
  doc.text(s, { align: 'center', lineGap: 4 })
}

// ════════════════════════════════════════════════════════════════════════════
//  SECTION 1 — Runtime & Framework
// ════════════════════════════════════════════════════════════════════════════
h1('1  Runtime & Framework')

table(
  ['Layer', 'Technology', 'Version'],
  [
    ['Framework', 'Next.js', '16.2.7'],
    ['UI Runtime', 'React + React DOM', '19.2.4'],
    ['Language', 'TypeScript', '5'],
    ['Package Manager', 'pnpm', '10.16.1'],
    ['Node target', 'ES2017 / esnext bundler', '—'],
  ]
)

h2('Next.js 16 — Breaking Changes')
bullet([
  'proxy.ts replaces middleware.ts — middleware is now exported as `proxy` with type ProxyConfig (not NextConfig).',
  'Server Actions body limit raised to 20 MB to support large legal document uploads.',
  'App Router with file-based routing, route groups (auth), catch-all segments [[...slug]], and layouts.',
  'AGENTS.md and CLAUDE.md instruct agents to read node_modules/next/dist/docs/ before writing any Next.js code.',
])

h2('TypeScript Configuration')
bullet([
  'Strict mode enabled; path alias @/* → root directory.',
  'Includes .next/types and .next/dev/types for incremental type builds.',
  'Target: ES2017 — ensures broad Node.js compatibility.',
  'Special include: docs/VoiceRecog.txt (voice recognition reference documentation).',
])

// ════════════════════════════════════════════════════════════════════════════
//  SECTION 2 — AI / LLM Stack
// ════════════════════════════════════════════════════════════════════════════
h1('2  AI / LLM Stack')

h2('Google Gemini  (@google/genai ^2.8.0)')
body('Three distinct Gemini models are deployed for different cost/capability tradeoffs:')

table(
  ['Model', 'Use Case', 'Rationale'],
  [
    ['gemini-2.5-flash', 'Main chat responses', 'Best quality; 8,192 output tokens'],
    ['gemini-2.0-flash-lite', 'Title + suggestions (post-stream)', 'Higher free-tier RPM; avoids 429s'],
    ['gemini-embedding-2', 'Document + query embeddings', '768-dim vectors for pgvector'],
    ['gemini-3.1-flash-live-preview', 'Real-time voice', 'Gemini Live WebSocket API'],
  ]
)

note(
  'The two-model split (2.5-flash for chat, 2.0-flash-lite for title/suggestions) was introduced specifically to solve ' +
  'Gemini 429 rate-limit errors caused by 3 concurrent calls to the same model per message on the free tier. ' +
  'Both model names are overridable via GEMINI_MODEL and GEMINI_SECONDARY_MODEL environment variables.'
)

h2('Other LLM SDKs')
bullet([
  '@anthropic-ai/sdk ^0.101.0 — Anthropic Claude, installed as optional fallback. Not wired into active flows.',
  'openai ^6.42.0 — Legacy OpenAI support. Present for compatibility; not used in active code paths.',
])

h2('Streaming Protocol')
body(
  'Chat responses are streamed via Server-Sent Events (SSE) using ReadableStream with Content-Type: text/event-stream. ' +
  'Each event is a JSON payload on a "data:" line followed by a blank line. Voice uses a persistent WebSocket to Gemini Live.'
)

// ════════════════════════════════════════════════════════════════════════════
//  SECTION 3 — Authentication
// ════════════════════════════════════════════════════════════════════════════
h1('3  Authentication — Clerk v7.4.3')

h2('Architecture Overview')
body('Clerk is the sole authentication provider. There is no username/password flow — only OAuth SSO via Google and Facebook.')
code(
`Browser → OAuth Provider (Google / Facebook)
  → /sso-callback  (custom handler)
    → handleRedirectCallback() + window.location.href (hard redirect)
      → Next.js proxy.ts (clerkMiddleware validates JWT cookie)
        → /chat`
)

h2('proxy.ts — Middleware (Next.js 16 ProxyConfig)')
body('Three route classes are defined using Clerk\'s createRouteMatcher:')
table(
  ['Route Class', 'Pattern', 'Logic'],
  [
    ['isAuthRoute', '/sign-in, /sign-up', 'Redirect to /chat if userId present'],
    ['isProtectedRoute', '/chat, /api/chat, /api/documents, …', 'Redirect to /sign-in if no userId'],
    ['isAdminRoute', '/admin(.*)', 'Redirect to /chat if role ≠ admin'],
  ]
)
body('Admin role is read from sessionClaims.publicMetadata.role — set exclusively in the Clerk dashboard, never in client code.')

h2('SSO Callback — Hard Redirect')
body(
  'The OAuth callback page uses window.location.href instead of Next.js router.push() — this is critical. ' +
  'A soft Next.js navigation does not send a full HTTP request, so middleware never sees the fresh Clerk JWT cookie. ' +
  'The hard redirect forces a page reload, triggering middleware which then validates the session.'
)
code(
`handleRedirectCallback(
  { signInForceRedirectUrl: '/chat', signUpForceRedirectUrl: '/chat' },
  (to) => { window.location.href = to; return Promise.resolve() }
)`
)

h2('JWT Lifecycle & Clock Skew')
bullet([
  'Clerk session JWTs have a ~60-second TTL.',
  '__client_uat cookie signals an active session; auth() validates the short-lived JWT.',
  'Clock skew between development machine and Clerk servers causes nbf (not-before) failures.',
  'Fix on Windows: w32tm /resync /force (run as Administrator) to sync system clock via NTP.',
])

h2('signIn.sso() / signUp.sso() — Error Handling')
body(
  'In Clerk v7, these methods return { error } — they do NOT throw. The catch block only handles network-level ' +
  'failures. Always destructure and check the returned error object.'
)
code(
`const { error } = await signIn!.sso({ strategy, redirectCallbackUrl: '/sso-callback', redirectUrl: '/chat' })
if (error) {
  setError(error.longMessage ?? error.message ?? 'Something went wrong.')
  setLoading(null)
}`
)

// ════════════════════════════════════════════════════════════════════════════
//  SECTION 4 — Database
// ════════════════════════════════════════════════════════════════════════════
h1('4  Database — PostgreSQL + pgvector')

h2('Connection Stack')
bullet([
  'Neon Serverless PostgreSQL — DATABASE_URL env var.',
  '@prisma/adapter-pg wraps native pg driver for connection pooling on serverless.',
  'Prisma client uses global singleton pattern to prevent hot-reload re-initialization in dev.',
  'pgvector extension required: CREATE EXTENSION IF NOT EXISTS vector;',
])

h2('Schema Overview')

h3('User')
bullet([
  'id (CUID primary key)',
  'clerkUserId (unique — mirrors Clerk identity)',
  'role enum: "user" | "admin"',
  'Relations: conversations, messages, documents, ingestionLogs',
])

h3('Conversation')
bullet([
  'id (CUID)',
  'title (default: "New Chat")',
  'domain — one of: general | traffic | taxation | divorce | labor | property | business',
  'clerkUserId — ownership',
  'messages (1:many, cascade delete)',
])

h3('Message')
bullet([
  'role: "user" | "assistant"',
  'content — full text of response or query',
  'conversationId — cascade delete',
])

h3('Document  (Knowledge Base)')
bullet([
  'status cycles: processing → ready | failed',
  'fileType: text | pdf | json | csv | manual',
  'domain — determines retrieval namespace',
  'chunks (1:many DocumentChunk)',
])

h3('DocumentChunk  (Unit of Retrieval)')
bullet([
  'content — ~400-word text segment',
  'embedding — vector(768), pgvector column; populated asynchronously after upload',
  'chunkIndex / totalChunks — ordering metadata',
])

h3('Lawyer  (Advocate Directory)')
bullet([
  'Auto-increment integer PK (not CUID)',
  'Fields: name, specialization, experience, location, languages[], feeRange, rating, casesHandled, bio, phone, email, featured',
  'Queried inline during chat when AI determines referral is needed',
])

h2('Vector Search Query Pattern')
code(
`SELECT id, content, "documentId",
  1 - (embedding <=> $1::vector) AS similarity
FROM "DocumentChunk"
WHERE "documentId" IN (
  SELECT id FROM "Document" WHERE domain = $2 AND status = 'ready'
)
  AND 1 - (embedding <=> $1::vector) > 0.45
ORDER BY embedding <=> $1::vector
LIMIT 10`
)
body('The <=> operator is pgvector\'s cosine distance. 1 − distance converts to similarity. Threshold 0.45 filters noise before RRF fusion.')

// ════════════════════════════════════════════════════════════════════════════
//  SECTION 5 — RAG Pipeline
// ════════════════════════════════════════════════════════════════════════════
h1('5  RAG Pipeline')

body(
  'The RAG (Retrieval-Augmented Generation) pipeline is the core of LegalSathi\'s legal accuracy. ' +
  'It runs on every chat message before the prompt is sent to Gemini. Located in lib/rag.ts.'
)

h2('Step 1 — Domain Detection')
body(
  'Before retrieval, the query is scanned with regex signal patterns to detect cross-domain queries. ' +
  'Example: a traffic query mentioning "fine" or "tax" also triggers the taxation domain retrieval. Max 3 domains per query.'
)

h2('Step 2 — Query Expansion')
body('A domain-specific keyword prefix is prepended to the user query before embedding to bias semantic search toward legal vocabulary:')
table(
  ['Domain', 'Expansion Prefix'],
  [
    ['traffic', '"Nepal motor vehicle traffic law rule fine violation सवारी यातायात नियम"'],
    ['taxation', '"Nepal tax law IRD VAT PAN income tax कर ऐन"'],
    ['labor', '"Nepal labor employment law worker minimum wage श्रम ऐन"'],
    ['property', '"Nepal land property registration stamp duty lalpurja जग्गा"'],
    ['business', '"Nepal company OCR registration Industry Act व्यापार"'],
    ['divorce', '"Nepal divorce family custody alimony Muluki Civil Code पारिवारिक"'],
  ]
)

h2('Step 3 — Dual Retrieval (per domain)')
bullet([
  'Vector search — cosine similarity via embedding <=> operator on 768-dim Gemini embeddings.',
  'Full-text search — to_tsvector(\'simple\', content) + plainto_tsquery, ranked by ts_rank_cd().',
  'Both run in parallel for each detected domain.',
])

h2('Step 4 — Reciprocal Rank Fusion (RRF)')
body('Both ranked lists are merged using RRF with k=60:')
code('score(chunk) = 1/(60 + rank_vector) + 1/(60 + rank_fts)')
body(
  'RRF is a parameter-free fusion method that is robust to score scale differences between semantic ' +
  'and lexical retrieval. k=60 is the standard default from the original RRF paper (Cormack et al., 2009). ' +
  'Results from multiple domains are interleaved (primary domain first at each round).'
)

h2('Step 5 — Budget & Filtering')
table(
  ['Parameter', 'Value', 'Purpose'],
  [
    ['Similarity threshold', '0.45', 'Filter low-quality vector matches before RRF'],
    ['Max chunks returned', '6', 'Keeps prompt token count manageable'],
    ['Max context words', '2,500', 'Hard word budget across all retrieved chunks'],
    ['RRF k parameter', '60', 'Standard RRF constant, controls rank influence'],
  ]
)

h2('Step 6 — System Prompt Assembly')
body(
  'buildSystemPrompt(chunks, domain) wraps retrieved chunks in <retrieved_legal_context> XML tags, ' +
  'prepends the domain\'s systemInstructions, and appends the RESPONSE QUALITY MANDATE:'
)
bullet([
  'CITE SPECIFIC SECTIONS — exact act and section (e.g. "MVTMA 2049, Section 164(1)")',
  'GIVE EXACT AMOUNTS — specific NPR figures or tight ranges',
  'GIVE EXACT TIMELINES — real durations from the law',
  'COVER ALL ANGLES — procedure, cost, documents, legal consequence, contact',
  'DISTINGUISH SOURCES — prefix pre-trained knowledge with "Based on Nepal law:"',
  'NO HEDGING ON FACTS',
  'MINIMUM DEPTH — at least 3 substantive items per section',
  'PLAIN LANGUAGE — translate legal jargon immediately',
])

// ════════════════════════════════════════════════════════════════════════════
//  SECTION 6 — Legal Domain System
// ════════════════════════════════════════════════════════════════════════════
h1('6  Legal Domain System')

body('7 domains are defined in lib/domains.ts. Each has: slug, label, icon (emoji), description, and systemInstructions.')

h2('Statute References Per Domain')
table(
  ['Domain', 'Primary Statutes'],
  [
    ['Traffic', 'Motor Vehicles & Transport Management Act 2049 (MVTMA)'],
    ['Taxation', 'Income Tax Act 2058, Value Added Tax Act 2052, IRD Guidelines'],
    ['Divorce/Family', 'Muluki Civil Code 2074 Part 4 (§93–176), DV Act 2066, Children\'s Act 2075'],
    ['Labor', 'Labor Act 2074, Labor Rules 2075, Social Security Act 2075, Bonus Act 2030'],
    ['Property', 'Land Registration Act 2021, Lands Act 2021, Land Revenue Act 2034'],
    ['Business', 'Company Act 2063, Industrial Enterprises Act 2076, FITTA 2075, VAT Act 2052'],
    ['General', 'Constitution of Nepal 2072, Muluki Criminal Code 2074, all of the above'],
  ]
)

h2('Key Statutory Numbers Embedded')

h3('Labor Act 2074')
bullet([
  'Written contract required within 15 days (§8)',
  'Probation: max 6 months, cannot extend (§13)',
  'Employer termination: 30 days notice (§28); Employee: 30 days notice (§29)',
  'Wrongful termination: 1 month/year of service, min 3 months compensation (§33)',
  'Home leave: 13 days/year (§52); Sick leave: 12 days/year (§53)',
  'Maternity: 98 days (§55); Paternity: 15 days (§56)',
  'Overtime: max 4h/day, 24h/week, 1.5× rate (§45)',
  'Gratuity: 8.33% of basic salary per year of service (§59)',
  'Minimum Wage (2082 BS): NPR 19,550/month',
])

h3('Property Law')
bullet([
  'Stamp duty: 4% of government valuation (male buyer); 1.5% (female buyer)',
  'Capital gains: 5% if held >5 years; 10% if <5 years; 15% corporate',
  'Tenancy risk: 3+ years occupation may trigger legal claim (Lands Act 2021 §26)',
  'Land ceiling — Kathmandu Valley: max 10 ropani',
])

h3('Business Registration')
bullet([
  'OCR registration fee: NPR 1,000–5,000 (depends on paid-up capital)',
  'VAT registration threshold: NPR 50 lakh annual turnover (VAT Act §10)',
  'Corporate tax: 25% standard; 20% manufacturing; 15% SEZ; 1% cooperatives',
  'Trademark: Department of Industry, IP Division — 10-year validity, renewable',
])

h2('Domain Gating & Anti-Hallucination')
bullet([
  'Each domain\'s systemInstructions includes an explicit out-of-scope rejection template.',
  'Traffic domain refuses divorce/labor queries with a hard-coded redirect message.',
  'All domains forbid inventing amounts, section numbers, deadlines, or procedures.',
  'If context is insufficient, the domain must state it — not guess.',
])

h2('Local Vocabulary Mapping (Traffic Domain)')
table(
  ['Colloquial', 'Legal Meaning'],
  [
    ['Mama / Traffic Mama / Cop', 'Nepal Traffic Police officer'],
    ['Chit / Chalan / Cheet / Slip', 'Official traffic fine / ticket'],
    ['Mapase', 'Drunk driving (DUI)'],
    ['Bluebook / Bilbuk', 'Vehicle Registration Certificate'],
    ['Yatayat', 'Department of Transport Management (DOTM)'],
    ['Dalal', 'Informal broker / middleman'],
    ['Likhit', 'Written driving license examination'],
    ['Trial', 'Practical driving test'],
  ]
)

// ════════════════════════════════════════════════════════════════════════════
//  SECTION 7 — Chat API
// ════════════════════════════════════════════════════════════════════════════
h1('7  Chat API — Streaming Architecture')

h2('POST /api/chat — Full Flow')
code(
`Request: { conversationId, message }
  1. requireAuth()  — validate Clerk JWT from cookie
  2. Save Message (role=user) to DB
  3. RAG retrieval  — retrieveRelevantChunks(message, domain)
  4. buildSystemPrompt(chunks, domain)
  5. generateContentStream(prompt) → Gemini 2.5-flash (8,192 token max output)
  6. ReadableStream → SSE to browser
  [Post-stream, non-blocking Promise.resolve()]
  7. Save Message (role=assistant) to DB
  8. Generate title  → gemini-2.0-flash-lite  (first message of conversation only)
  9. Generate suggestions → gemini-2.0-flash-lite`
)

h2('SSE Event Types')
table(
  ['Event', 'Payload', 'When Sent'],
  [
    ['text', '{ text: string }', 'Each streamed token from Gemini'],
    ['sources', '{ sources: Source[] }', 'Once; after first token; document refs'],
    ['scenario', '{ scenario: ScenarioJSON }', 'When AI returns structured JSON mode'],
    ['suggestions', '{ suggestions: string[] }', 'Post-stream; secondary model call'],
    ['error', '{ error: string }', 'Any failure; user-facing friendly message'],
    ['[DONE]', 'literal string', 'Stream complete; client closes connection'],
  ]
)

h2('Structured JSON (Scenario) Mode')
body(
  'When the AI determines a structured response is appropriate it returns a JSON blob inside the text stream. ' +
  'The API parses it and re-emits as a "scenario" event. The client renders it via <ScenarioRenderer>.'
)

h3('Response Modes')
bullet([
  'violation — traffic or regulatory infraction with fine, points, procedure',
  'procedure — step-by-step legal process (registration, filing, appeal)',
  'information — factual legal information (statute explanation, rights)',
  'rights — constitutional or statutory rights of the user',
  'emergency — urgent situation requiring immediate legal action',
])

h3('UI Variants (per section)')
table(
  ['Variant', 'Rendering'],
  [
    ['stepper / timeline', 'Numbered steps with cost/duration badges'],
    ['card_grid', '2-column grid with tag chips'],
    ['table', 'Alternating-row styled table'],
    ['stat_grid', 'Metric + label + note layout'],
    ['checklist', 'Checkbox items with descriptions'],
    ['alert_box', 'Yellow (high severity) / blue (low) left-border boxes'],
    ['info_banner', 'Headline + description highlight box'],
    ['comparison', '3-column aspect comparison'],
    ['minimal_text', 'Plain text — fallback'],
  ]
)

h2('Lawyer Matching (inline)')
body(
  'After the AI generates a scenario with required_lawyers[], the chat API immediately queries the Lawyer table ' +
  'by specialization and attaches matching real advocates directly to the SSE scenario event. This gives users a ' +
  'concrete referral alongside the legal guidance in a single response.'
)

// ════════════════════════════════════════════════════════════════════════════
//  SECTION 8 — Document Ingestion
// ════════════════════════════════════════════════════════════════════════════
h1('8  Document Ingestion Pipeline')

h2('POST /api/documents — Async Flow')
code(
`Body: { title, content, fileType?, domain? }

  1. Create Document row — status: "processing"
  2. Return 202 Accepted immediately  (non-blocking)
  3. Background (unawaited Promise):
     a. chunkText(content)
        → sentence-aware splitting, ~400 words/chunk, 2-sentence overlap
        → discard chunks < 30 words
     b. Bulk INSERT DocumentChunk rows (content only; embedding = null)
        → batches of 50 rows (connection pool safety)
     c. generateEmbeddingsBatch(allChunkTexts)
        → 50 texts per Gemini call
        → Exponential backoff retry: 6 attempts; handles 429 + 5xx
     d. UPDATE DocumentChunk SET embedding = $1 WHERE id = $2
        → batches of 50
     e. UPDATE Document SET status = 'ready'`
)

h2('Chunking Algorithm  (lib/embeddings.ts)')
bullet([
  'Splits on sentence boundaries: (?<=[.!?])\\s+(?=[A-Z]) and blank lines (?<=\\n)\\n+',
  'Accumulates sentences until reaching target ~400 words',
  'Carries last 2 sentences as overlap into next chunk (context continuity)',
  'Discards chunks < 30 words (avoids embedding noise)',
])

h2('Embedding Batch & Retry')
bullet([
  'Batch size: 50 texts per Gemini embedding-2 call',
  '6 max attempts with exponential backoff',
  'Retries on: 429 Too Many Requests, 5xx server errors',
  'Replaces newlines with spaces before embedding (API requirement)',
])

h2('Re-Embed Endpoint  POST /api/documents/[id]/re-embed')
body(
  'For documents with partially failed embedding (some chunks have embedding=null): queries null-embedding chunks only, ' +
  're-runs batch embedding, updates vectors, marks document ready. Returns 202 and runs async. ' +
  'Useful for recovering from Gemini quota exhaustion during initial ingest.'
)

h2('Client-Side File Processing')
bullet([
  'Supported: .txt, .md, .json, .csv, .pdf',
  'PDF text extraction: pdfjs-dist ^6.0.227 runs entirely in the browser',
  'Automatic chunk count estimation shown before upload',
  'Drag-and-drop + bulk upload queue in app/ingest/page.tsx',
])

h2('Polling for Processing State')
body(
  'The ingest page polls GET /api/documents/[id] every 3 seconds for documents in "processing" state. ' +
  'Fix for infinite 404 loop: 404 responses set a "missing" flag; those document IDs are filtered out of React state ' +
  'rather than staying in the polling queue indefinitely.'
)
code(
`const missingIds = new Set(results.filter(r => r.missing).map(r => r.id))
setDocuments(prev =>
  prev
    .filter(d => !missingIds.has(d.id))   // remove 404'd docs
    .map(d => { /* update status from API response */ })
)`
)

// ════════════════════════════════════════════════════════════════════════════
//  SECTION 9 — Voice Architecture
// ════════════════════════════════════════════════════════════════════════════
h1('9  Voice Architecture')

body('Four-layer stack. All layers are client-side except the RAG context fetch which hits the server.')

h2('Layer 1 — Audio Capture  (lib/voice/audioCapture.ts)')
bullet([
  'Wraps Web SpeechRecognition API (Chrome/Edge native)',
  'Language: ne-NP (Nepali with English code-switching)',
  'Continuous mode with interim results for real-time display',
  'Auto-restarts on timeout — Chrome disconnects after ~60s silence',
  'Callbacks: onTranscript, onSpeechStart, onSpeechEnd',
])

h2('Layer 2 — RAG Context Injection  (POST /api/voice-rag)')
body(
  'Before each user turn is sent to Gemini Live, the current transcript is sent to /api/voice-rag. ' +
  'The server runs retrieveRelevantChunks(query, domain) — the same pipeline as text chat — ' +
  'and returns { context: string } formatted source text. This is prepended to the Gemini Live turn, ' +
  'giving the voice assistant the same legal accuracy as text chat.'
)

h2('Layer 3 — Gemini Live  (lib/voice/geminiLiveClient.ts)')
bullet([
  'Model: gemini-3.1-flash-live-preview',
  'Uses @google/genai v1beta live.connect() for WebSocket connection',
  'Modalities: audio output + transcription enabled',
  'Voice: "Aoede" with Nepali language hint',
  'Protocol: endUserTurn(transcript) → inject RAG context → send with turnComplete=true',
])

h2('Layer 4 — Audio Playback  (lib/voice/audioPlayback.ts)')
bullet([
  'Web Audio API — AudioContext at 24 kHz (matches Gemini Live PCM16 output)',
  'Base64 → PCM16 → Float32 → AudioBuffer decoding pipeline',
  'Queue-based: auto-chains audio chunks as they arrive from WebSocket',
  'Barge-in support: immediately clears queue and stops current playback',
])

h2('Full Voice Flow')
code(
`User speaks
  → SpeechRecognition (ne-NP)  [continuous, interim results]
  → onTranscript callback
    → POST /api/voice-rag  → RAG retrieval  → { context }
    → GeminiLiveClient.endUserTurn(transcript)
      → inject context into Gemini Live turn
      → send turn with turnComplete=true (WebSocket)
        → Gemini Live server response:
          ├─ outputTranscription  (AI text for display)
          ├─ audio chunks         (base64 PCM16)
          └─ turnComplete         (end of response)
        → AudioPlayback.queueChunk(pcm16)
          → Web Audio API playback @ 24 kHz`
)

// ════════════════════════════════════════════════════════════════════════════
//  SECTION 10 — Export System
// ════════════════════════════════════════════════════════════════════════════
h1('10  Export System')

table(
  ['Format', 'Generated Where', 'Mechanism'],
  [
    ['Markdown', 'Client-side', 'String template from scenario JSON'],
    ['PDF', 'Client-side', 'Markdown → HTML → window.print()'],
    ['DOCX', 'Server-side (/api/export)', 'docx library (Office Open XML)'],
  ]
)

h2('Markdown (lib/export.ts — scenarioToMarkdown)')
bullet([
  'Renders each scenario section with variant-specific formatting',
  'Stepper → numbered list; table → markdown table; checklist → task list',
  'Includes: summary, map entities, legal references, sources, disclaimer',
  'Mode: "full" (all sections) or "brief" (high-priority only)',
])

h2('PDF (lib/export.ts — scenarioToHtml)')
bullet([
  'Converts markdown output to HTML with print-optimized CSS',
  'Typography: Georgia serif, narrow margins, A4 page breaks',
  'Injects into a new browser window and auto-triggers window.print()',
  'Page-break hints for tables and long sections',
])

h2('DOCX (app/api/export/route.ts + docx ^9.7.1)')
bullet([
  'Uses Document API from docx (Office Open XML format)',
  'Styled: headings, tables with alternating rows, alert boxes with colored left borders',
  'Metadata: creator="LegalSathi", title=scenario.title',
  'Returns binary buffer with Content-Disposition: attachment; filename=....docx',
])

// ════════════════════════════════════════════════════════════════════════════
//  SECTION 11 — Lawyer Directory
// ════════════════════════════════════════════════════════════════════════════
h1('11  Lawyer Directory')

h2('Schema: Lawyer Table')
table(
  ['Field', 'Type', 'Purpose'],
  [
    ['id', 'Int (auto-increment)', 'Primary key — integer not CUID'],
    ['name', 'String', 'Full name of advocate'],
    ['specialization', 'String', 'Field of law (civil, criminal, tax, etc.)'],
    ['experience', 'Int', 'Years of practice'],
    ['location', 'String', 'City / district'],
    ['languages', 'String[]', 'Languages spoken'],
    ['feeRange', 'String', 'e.g. "NPR 1,000–5,000/hr"'],
    ['rating', 'Float', 'Star rating'],
    ['featured', 'Boolean', 'Premium listing flag'],
    ['phone / email', 'String', 'Contact details'],
  ]
)

h2('Search API  (GET /api/lawyers)')
bullet([
  'Full-text search on name, specialization, bio, location — PostgreSQL ILIKE',
  'Filters: specialization, location, minRating, featured (boolean)',
  'Pagination: limit / offset query params',
  'Returns array of Lawyer objects ordered by featured desc, rating desc',
])

h2('Inline Chat Matching')
body(
  'After scenario generation, the chat API reads required_lawyers[] from the JSON response and immediately ' +
  'queries the Lawyer table by specialization. Matching advocates are attached to the SSE scenario event ' +
  'so users receive a concrete referral in the same response — no extra round-trip needed.'
)

// ════════════════════════════════════════════════════════════════════════════
//  SECTION 12 — Frontend Components
// ════════════════════════════════════════════════════════════════════════════
h1('12  Frontend Components')

h2('ScenarioRenderer.tsx')
body(
  'The primary output renderer for structured AI responses (~500 lines). ' +
  'Accepts a parsed ScenarioJSON object and renders each section with a variant-specific component. ' +
  'Also renders the map entities section (government office images), required lawyers (from DB), and summary.'
)

h2('LegalResponse.tsx')
body('Markdown-to-React converter for plain-text (non-scenario) responses. Custom renderers:')
bullet([
  'Ordered lists → navy-circled numbered step cards',
  'Unordered lists → styled bullet dots',
  'Strong text → navy colour emphasis',
  'H2 / H3 headings → section dividers with border-bottom',
  'Tables → styled markdown tables',
])

h2('VoiceAssistant.tsx')
body(
  'Orchestrates the full voice loop (microphone → transcription → RAG → Gemini Live → audio playback). ' +
  'Renders conversation transcript with user and AI turns, session status indicator, ' +
  'and start/stop/clear controls. Props: domain, autoStart, compact, onClose.'
)

h2('app/chat/page.tsx  (~1,200 lines)')
body('The main application UI. Key sections:')
bullet([
  'Left sidebar: brand, navigation, new conversation button, conversation history, knowledge base panel',
  'Main area: message thread (user navy bubbles + AI avatar), streaming indicator, sources chips, suggestion buttons',
  'Input: growing textarea (max 300px), voice toggle, send button',
  'Hero mode: domain selection grid when no conversation is active',
  'Export dropdown: md, docx, pdf × brief/full modes',
])

h2('Landing Page Components')
bullet([
  'Navbar, HeroSection, ProblemSection, SolutionSection, FeaturesSection',
  'HowItWorksSection — RAG pipeline explanation for non-technical users',
  'DemoSection, ComparisonSection, FutureVisionSection, ImpactSection, CtaBanner, Footer',
])

// ════════════════════════════════════════════════════════════════════════════
//  SECTION 13 — Environment Variables
// ════════════════════════════════════════════════════════════════════════════
h1('13  Environment Variables')

code(
`# PostgreSQL (required)
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# Google Gemini (required)
GEMINI_API_KEY=AIza...
GEMINI_MODEL=gemini-2.5-flash
GEMINI_SECONDARY_MODEL=gemini-2.0-flash-lite
NEXT_PUBLIC_GEMINI_API_KEY=AIza...    # client-side voice only

# Clerk Authentication (required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/chat
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/chat
CLERK_WEBHOOK_SECRET=whsec_...`
)

note('NEXT_PUBLIC_GEMINI_API_KEY is exposed to the browser for the Gemini Live voice WebSocket. Scope it to voice-only; never use it for server-side RAG or embedding calls.', '#F59E0B')

// ════════════════════════════════════════════════════════════════════════════
//  SECTION 14 — Build & Deployment
// ════════════════════════════════════════════════════════════════════════════
h1('14  Build & Deployment')

h2('Commands')
code(
`# Install dependencies (triggers postinstall: prisma generate)
pnpm install

# Development
pnpm dev

# Production build
prisma generate && next build

# Start production server
next start`
)

h2('Key Build Notes')
bullet([
  'postinstall runs prisma generate automatically — Prisma client types regenerated from schema.prisma on every install.',
  'next build compiles both server and client bundles; App Router generates RSC manifests.',
  'Target platform: Vercel (native Next.js) or any Node.js 18+ host.',
  'DATABASE_URL must point to a running PostgreSQL instance with pgvector extension at build time (Prisma introspection).',
])

h2('Critical Dependencies & Versions')
table(
  ['Package', 'Version', 'Purpose'],
  [
    ['@google/genai', '^2.8.0', 'Chat, embeddings, Gemini Live voice'],
    ['@prisma/client', '^7.8.0', 'ORM for PostgreSQL'],
    ['@prisma/adapter-pg', '^7.8.0', 'Native pg connection pooling adapter'],
    ['@clerk/nextjs', '^7.4.3', 'Auth — user roles, session management'],
    ['docx', '^9.7.1', 'Server-side DOCX generation'],
    ['pdfjs-dist', '^6.0.227', 'Client-side PDF text extraction'],
    ['react-markdown', '^10.1.0', 'Markdown rendering in chat'],
    ['framer-motion', '12.40.0', 'UI animations'],
    ['tailwindcss', '^4', 'Styling via PostCSS plugin'],
    ['@anthropic-ai/sdk', '^0.101.0', 'Optional Claude fallback'],
  ]
)

// ════════════════════════════════════════════════════════════════════════════
//  SECTION 15 — Full Data-Flow Diagram
// ════════════════════════════════════════════════════════════════════════════
h1('15  Full Data-Flow Diagram')

h2('Text Chat Flow')
code(
`USER TYPES QUESTION
  └─ POST /api/chat
       ├─ requireAuth()  — Clerk JWT from cookie (middleware already validated)
       ├─ Save Message (role=user) to PostgreSQL
       ├─ RAG Pipeline:
       │    ├─ Domain detection          (regex signal scan)
       │    ├─ Query expansion            (prepend domain keywords + Nepali terms)
       │    ├─ generate query embedding   (Gemini embedding-2, 768-dim)
       │    ├─ Vector search              (pgvector cosine <=>; threshold 0.45)
       │    ├─ Full-text search           (tsvector + plainto_tsquery; ts_rank_cd)
       │    └─ RRF fusion k=60            → top 6 chunks, max 2,500 words
       ├─ Build system prompt             (domain rules + retrieved context XML)
       ├─ generateContentStream           → Gemini 2.5-flash (8,192 token max)
       └─ SSE ReadableStream to browser:
            ├─ { text }       — token by token
            ├─ { sources }    — retrieved document chips
            ├─ { scenario }   — parsed JSON → ScenarioRenderer
            ├─ { suggestions} — follow-up questions
            └─ [DONE]
       [Post-stream, non-blocking]:
            ├─ Save Message (role=assistant) to PostgreSQL
            ├─ gemini-2.0-flash-lite → generate conversation title
            └─ gemini-2.0-flash-lite → generate 3 follow-up suggestions`
)

h2('Document Ingestion Flow')
code(
`FILE UPLOADED (drag-drop or paste in /ingest)
  └─ Client-side: PDF? → pdfjs-dist text extraction → raw text string
  └─ POST /api/documents  → 202 Accepted (immediate)
       [Background async task]:
            ├─ chunkText()
            │    ├─ Split on sentence boundaries + blank lines
            │    ├─ Target: ~400 words/chunk; 2-sentence overlap
            │    └─ Discard chunks < 30 words
            ├─ INSERT DocumentChunk rows (batch 50) — embedding=null
            ├─ generateEmbeddingsBatch()
            │    ├─ 50 texts per Gemini embedding-2 call
            │    └─ Retry: 6 attempts, exponential backoff (429 + 5xx)
            ├─ UPDATE DocumentChunk SET embedding=$1 (batch 50)
            └─ UPDATE Document SET status='ready'

FRONTEND polls GET /api/documents/[id] every 3s
  └─ 404? → filter document out of React state (prevents infinite 404 loop)
  └─ ready? → stop polling; show chunk count`
)

h2('Voice Session Flow')
code(
`USER SPEAKS
  └─ SpeechRecognition API (ne-NP, continuous)
  └─ onTranscript(text) callback fires
       ├─ POST /api/voice-rag  { query: text, domain }
       │    └─ retrieveRelevantChunks()  → same RAG as text chat
       │    └─ returns { context: string }
       ├─ GeminiLiveClient.endUserTurn(transcript)
       │    ├─ prepend RAG context to message content
       │    └─ send over WebSocket with turnComplete=true
       └─ Gemini Live WebSocket response:
            ├─ outputTranscription  → display AI text in transcript
            ├─ audio chunks (base64 PCM16)
            │    └─ AudioPlayback.queueChunk()
            │         └─ Decode PCM16 → Float32 → AudioBuffer
            │         └─ Web Audio API playback @ 24 kHz
            └─ turnComplete → ready for next user turn`
)

h2('Authentication Flow')
code(
`USER CLICKS "Continue with Google"
  └─ signIn.sso({ strategy: 'oauth_google', redirectCallbackUrl: '/sso-callback' })
       └─ Clerk redirects → Google OAuth consent screen
         └─ Google redirects → /sso-callback?code=...&state=...

/sso-callback (page.tsx):
  └─ handleRedirectCallback(options, navigate)
       └─ navigate = (to) => { window.location.href = to }  ← HARD REDIRECT
         └─ Full HTTP request → Next.js proxy.ts (clerkMiddleware)
              └─ auth() validates fresh JWT cookie
                └─ isAuthRoute check: userId present → redirect /chat
                  └─ /chat renders (user is now authenticated)`
)

// ── page numbers ─────────────────────────────────────────────────────────────
const totalPages = doc.bufferedPageRange().count
for (let i = 0; i < totalPages; i++) {
  doc.switchToPage(i)
  if (i === 0) continue // skip cover
  doc.save()
    .rect(0, doc.page.height - 28, doc.page.width, 28).fill('#F8FAFC')
    .font('Helvetica').fontSize(8).fillColor(GRAY)
    .text(
      `LegalSathi AI — Technical Docs  ·  Page ${i + 1} of ${totalPages}`,
      55, doc.page.height - 18,
      { width: doc.page.width - 110, align: 'center' }
    )
    .restore()
}

doc.end()
stream.on('finish', () => {
  console.log(`✓ PDF written → ${OUT}`)
})
stream.on('error', (err) => {
  console.error('PDF write error:', err)
  process.exit(1)
})
