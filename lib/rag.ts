import { prisma } from './prisma'
import { generateEmbedding } from './embeddings'
import { getDomain } from './domains'

// ─── Types ────────────────────────────────────────────────────────────────────

export type RetrievedChunk = {
  id: string
  content: string
  similarity: number
  documentId: string
  documentTitle: string
  chunkIndex: number
  totalChunks: number
  domain?: string   // which legal domain this chunk came from
}

export type Source = {
  documentId: string
  documentTitle: string
  chunkIndex: number
  totalChunks: number
  pages?: number[]
}

function extractPages(content: string): number[] {
  const matches = [...content.matchAll(/\[PAGE (\d+)\]/g)]
  return [...new Set(matches.map(m => parseInt(m[1])))]
}

// ─── Config ───────────────────────────────────────────────────────────────────

const SIMILARITY_THRESHOLD = 0.45
const MAX_CHUNKS           = 6
const MAX_CONTEXT_WORDS    = 2500
const RRF_K                = 60

// ─── Domain Detection ─────────────────────────────────────────────────────────
//
// Detects which legal domains a query touches beyond the primary (chat) domain.
// Used to trigger cross-domain parallel retrieval.

const DOMAIN_SIGNALS: Record<string, RegExp> = {
  traffic:  /\b(license|bluebook|vehicle|driving|bike|car|motorbike|chalani|transport|traffic|road|motorcycle|category|endorse|donotm|dotm)\b/i,
  taxation: /\b(tax|vat|pan|ird|revenue|fee|tirne|tir|payment|kar|income|customs|shulk|dastoor|rajaswa|fiscal)\b|कर|शुल्क|दस्तुर|राजस्व/i,
  business: /\b(company|firm|ocr|business|trade|enterprise|incorporate|pvt|ltd|proprietor|startup)\b/i,
  labor:    /\b(salary|wage|job|employment|worker|leave|bonus|hire|fire|terminate|employer|employee|labour|labor|pf|provident)\b/i,
  property: /\b(land|property|house|plot|deed|transfer|lalpurja|cadastral|real.?estate)\b|जग्गा|सम्पत्ति/i,
  divorce:  /\b(divorce|marriage|custody|alimony|separation|spouse|matrimonial)\b/i,
  general:  /\b(rights|citizenship|nid|court|complaint|constitution|fundamental|writ|police)\b/i,
}

// Domains that are naturally coupled: when primary domain is X and the query
// contains fee/tax signals, also pull from the coupled domain.
const COUPLED_DOMAINS: Record<string, string[]> = {
  traffic:  ['taxation'],   // bluebook/license renewal → vehicle tax, road tax
  business: ['taxation'],   // company registration → PAN/VAT registration
  property: ['taxation'],   // land transfer → stamp duty, capital gains revenue
  labor:    ['taxation'],   // employment → TDS on salary
}

// Trigger pattern: signals that cross-domain tax/revenue retrieval is needed
const TAX_SIGNALS = /\b(tax|fee|tirne|payment|revenue|shulk|kar|pay|vat|pan|ird|dastoor|rajaswa|charge|cost|amount|fine|penalty)\b|कर|शुल्क|दस्तुर|राजस्व/i

function detectQueryDomains(query: string, primaryDomain: string): string[] {
  const domains: string[] = [primaryDomain]

  // Step 1: Check coupled domains — add them if tax/fee signals present in query
  for (const coupled of (COUPLED_DOMAINS[primaryDomain] ?? [])) {
    if (domains.includes(coupled)) continue
    const domainSignal = DOMAIN_SIGNALS[coupled]
    if (TAX_SIGNALS.test(query) || (domainSignal && domainSignal.test(query))) {
      domains.push(coupled)
    }
  }

  // Step 2: Direct domain signals — add any domain the query explicitly mentions
  if (domains.length < 3) {
    for (const [domain, signal] of Object.entries(DOMAIN_SIGNALS)) {
      if (domains.includes(domain)) continue
      if (signal.test(query)) {
        domains.push(domain)
        if (domains.length >= 3) break
      }
    }
  }

  return domains
}

// ─── Query Expansion ─────────────────────────────────────────────────────────

const DOMAIN_PREFIXES: Record<string, string> = {
  traffic:  'Nepal motor vehicle traffic law rule fine violation सवारी यातायात नियम',
  taxation: 'Nepal tax law IRD VAT PAN income tax कर ऐन',
  labor:    'Nepal labor employment contract wage श्रम रोजगार',
  divorce:  'Nepal family marriage divorce custody separation पारिवारिक विवाह सम्बन्ध विच्छेद',
  property: 'Nepal property land registration deed transfer सम्पत्ति जग्गा',
  business: 'Nepal company registration trade business law व्यापार कम्पनी',
  general:  'Nepal law legal procedure नेपाल कानून',
}

function expandQuery(query: string, domain: string): string {
  const prefix = DOMAIN_PREFIXES[domain] ?? DOMAIN_PREFIXES.general
  return `${prefix} ${query}`
}

// ─── Single-Domain Retrieval ──────────────────────────────────────────────────

async function retrieveFromDomain(
  query: string,
  domain: string,
  limit: number,
): Promise<RetrievedChunk[]> {
  const expanded       = expandQuery(query, domain)
  const queryEmbedding = await generateEmbedding(expanded)
  const vec            = `[${queryEmbedding.join(',')}]`
  const vecLimit       = limit * 3
  const ftsLimit       = limit * 3

  const rows = await prisma.$queryRaw<RetrievedChunk[]>`
    WITH
      vec_ranked AS (
        SELECT
          dc.id,
          1 - (dc.embedding <=> ${vec}::vector)                                     AS vec_score,
          ROW_NUMBER() OVER (ORDER BY dc.embedding <=> ${vec}::vector)               AS rnk
        FROM "DocumentChunk" dc
        JOIN "Document"      d ON d.id = dc."documentId"
        WHERE dc.embedding IS NOT NULL
          AND d.status  = 'ready'
          AND d.domain  = ${domain}
          AND 1 - (dc.embedding <=> ${vec}::vector) >= ${SIMILARITY_THRESHOLD}
        ORDER BY dc.embedding <=> ${vec}::vector
        LIMIT ${vecLimit}
      ),
      fts_ranked AS (
        SELECT
          dc.id,
          ROW_NUMBER() OVER (
            ORDER BY ts_rank_cd(
              to_tsvector('simple', dc.content),
              plainto_tsquery('simple', ${query})
            ) DESC
          ) AS rnk
        FROM "DocumentChunk" dc
        JOIN "Document"      d ON d.id = dc."documentId"
        WHERE dc.embedding IS NOT NULL
          AND d.status = 'ready'
          AND d.domain = ${domain}
          AND to_tsvector('simple', dc.content) @@ plainto_tsquery('simple', ${query})
        LIMIT ${ftsLimit}
      ),
      fused AS (
        SELECT
          COALESCE(v.id, f.id)                                                        AS id,
          COALESCE(1.0 / (${RRF_K}::float + v.rnk), 0.0)
            + COALESCE(1.0 / (${RRF_K}::float + f.rnk), 0.0)                        AS rrf_score
        FROM      vec_ranked v
        FULL OUTER JOIN fts_ranked f ON v.id = f.id
      )
    SELECT
      dc.id,
      dc.content,
      dc."chunkIndex",
      dc."totalChunks",
      dc."documentId",
      d.title    AS "documentTitle",
      fused.rrf_score AS similarity
    FROM   fused
    JOIN   "DocumentChunk" dc ON dc.id    = fused.id
    JOIN   "Document"      d  ON d.id     = dc."documentId"
    ORDER  BY fused.rrf_score DESC
    LIMIT  ${limit * 2}
  `

  // Tag each chunk with its source domain
  return rows.map(r => ({ ...r, domain }))
}

// ─── Cross-Domain Retrieval ───────────────────────────────────────────────────

export async function retrieveRelevantChunks(query: string, primaryDomain: string): Promise<RetrievedChunk[]> {
  const domains  = detectQueryDomains(query, primaryDomain)
  const perLimit = domains.length === 1
    ? MAX_CHUNKS
    : Math.ceil((MAX_CHUNKS + 2) / domains.length)   // slight over-fetch, then trim

  // Parallel retrieval — primary domain failure is fatal; secondary failures are silent
  const perDomainResults = await Promise.all(
    domains.map((d, idx) =>
      retrieveFromDomain(query, d, perLimit).catch(err => {
        if (idx === 0) throw err   // primary domain must succeed
        console.error(`Cross-domain retrieval failed for ${d}:`, err)
        return [] as RetrievedChunk[]
      })
    )
  )

  // Interleave: alternate between primary and secondary to maintain diversity
  // (primary domain always gets first pick at each round)
  const seen   = new Set<string>()
  const merged: RetrievedChunk[] = []
  const maxLen = Math.max(...perDomainResults.map(r => r.length))

  for (let i = 0; i < maxLen; i++) {
    for (const domainChunks of perDomainResults) {
      if (i < domainChunks.length) {
        const c = domainChunks[i]
        if (!seen.has(c.id)) {
          seen.add(c.id)
          merged.push(c)
        }
      }
    }
  }

  // Sort by RRF score, then apply word budget
  merged.sort((a, b) => b.similarity - a.similarity)

  const budget: RetrievedChunk[] = []
  let totalWords = 0
  for (const chunk of merged.slice(0, MAX_CHUNKS)) {
    const words = chunk.content.split(/\s+/).length
    if (totalWords + words > MAX_CONTEXT_WORDS) break
    budget.push(chunk)
    totalWords += words
  }

  return budget
}

// ─── Prompt Builder ───────────────────────────────────────────────────────────

const SCENARIO_SCHEMA = `{
  "scenario_id": "string",
  "response_mode": "violation | procedure | information | rights | emergency",
  "title": "string",
  "user_intent": "string",
  "business_type": "small_business | tech | freelance | import_export | hospitality | real_estate | ngo | general",
  "citations": ["[§1: Document Title]", "[§2: Document Title]"],
  "sections": [
    {
      "section_type": "flow | checklist | cards | table | map | text | warning | actions | stats | banner",
      "title": "string",
      "ui_variant": "stepper | timeline | card_grid | list | compact_list | table | alert_box | minimal_text | checklist | stat_grid | info_banner | comparison",
      "priority": "high | medium | low",
      "content": { "items": [] }
    }
  ],
  "map_entities": [
    {
      "name": "string",
      "type": "municipality | tax_office | customs | government | legal_firm | other",
      "purpose": "string",
      "location_hint": "string",
      "image_url": "string (optional)"
    }
  ],
  "required_lawyers": [
    { "type": "civil_lawyer | criminal_lawyer | labor_lawyer | corporate_lawyer | compliance_lawyer | tax_consultant | property_lawyer | land_lawyer | family_lawyer | constitutional_lawyer | ip_lawyer | immigration_lawyer", "reason": "string", "ui": "card" }
  ],
  "summary": { "ui_variant": "highlight_card | plain_text | bullet_list", "content": "string" },
  "next_actions": { "ui_variant": "button_list | checklist | compact_cards", "actions": [] }
}`

const UI_RULES = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DOMAIN GATE — check BEFORE selecting any response mode
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Step 1: Read the <system_instructions> block at the very top of this prompt.
Step 2: Determine if the user's query falls within the declared domain scope.
Step 3:
  - If OUT OF SCOPE → output the exact refusal phrase from <system_instructions>. Do NOT generate JSON. Do NOT apply any response template. STOP.
  - If IN SCOPE → continue to Step 4.
Step 4: Select the matching response template below.

CRITICAL: "emergency", "violation", and "procedure" templates only apply when the CURRENT DOMAIN covers that topic.
A Taxation domain instance MUST refuse traffic, criminal, divorce, and labor queries — no exceptions, even if the query sounds urgent.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESPONSE TEMPLATES — pick ONE mode and follow its section pattern EXACTLY.
DO NOT mix patterns from different modes. Each query type produces a DIFFERENT visual layout.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MODE: violation  (user broke a rule, got a ticket, committed an offense)
  response_mode: "violation"
  summary: short, direct statement of the offense and consequence
  sections IN THIS ORDER:
    1. ui_variant="stat_grid"  title="Fine Structure"         priority="high"   → fine amounts per offense tier
    2. ui_variant="alert_box"  title="Legal Consequences"     priority="high"   → what happens next (points, license, class)
    3. ui_variant="stepper"    title="What To Do Now"         priority="medium" → steps: pay fine → attend class → collect receipt
    4. ui_variant="checklist"  title="Documents to Bring"     priority="low"    → documents for fine payment
  SKIP: lengthy text, comparison tables

MODE: procedure  (how to register, apply, renew, get a license/permit)
  response_mode: "procedure"
  summary: what this process achieves and rough timeline
  sections IN THIS ORDER:
    1. ui_variant="stepper"    title="Step-by-Step Process"   priority="high"   → numbered steps with cost + duration
    2. ui_variant="table"      title="Fee Breakdown"          priority="high"   → itemised costs per step
    3. ui_variant="checklist"  title="Required Documents"     priority="medium" → checklist of docs to prepare
    4. ui_variant="alert_box"  title="Important Warnings"     priority="low"    → pitfalls, expiry, rejection risks
  SKIP: stat_grid (use table instead), info_banner

MODE: information  (what is X, what are the rules, speed limits, legal definitions)
  response_mode: "information"
  summary: one-sentence direct answer
  sections IN THIS ORDER:
    1. ui_variant="info_banner" title="Key Rule"              priority="high"   → single most important fact/limit/definition
    2. ui_variant="card_grid"   title="Related Rules"         priority="high"   → 2-4 cards covering related sub-rules
    3. ui_variant="table"       title="Detailed Breakdown"    priority="medium" → table only if there are multiple categories/amounts
    4. ui_variant="minimal_text" title="Background"           priority="low"    → brief legal context (1-2 sentences max)
  SKIP: stepper, checklist (no process involved)

MODE: rights  (what are my rights, can they do X, is this legal, I was wronged)
  response_mode: "rights"
  summary: direct answer — yes/no + your legal standing
  sections IN THIS ORDER:
    1. ui_variant="alert_box"   title="Your Legal Right"      priority="high"   → the specific right being invoked (severity="low" if protected, "high" if violated)
    2. ui_variant="minimal_text" title="Legal Explanation"    priority="high"   → explain the law in plain language
    3. ui_variant="stepper"     title="If Your Rights Were Violated" priority="medium" → what to do (file complaint, collect evidence, consult lawyer)
    4. ui_variant="checklist"   title="Evidence to Collect"   priority="low"    → what to document/preserve
  SKIP: cost tables unless fines/compensation involved

MODE: emergency  (arrested, FIR filed, accident just happened, urgent situation)
  response_mode: "emergency"
  summary: IMMEDIATELY what to do in the next 30 minutes
  sections IN THIS ORDER:
    1. ui_variant="alert_box"   title="URGENT — Immediate Steps"  priority="high" severity="high" → do THIS right now
    2. ui_variant="stepper"     title="Next 24 Hours"             priority="high" → bail, FIR, phone call, lawyer contact
    3. ui_variant="checklist"   title="Do NOT Do These Things"    priority="high" → critical mistakes to avoid
    4. ui_variant="info_banner" title="Your Legal Rights"         priority="medium" → right to remain silent, right to lawyer
  required_lawyers: ALWAYS include criminal_lawyer for emergency mode
  SKIP: cost tables, map entities (not the time for that)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ITEM SHAPES BY UI VARIANT (use EXACT field names):
  stepper / timeline:  { "title": "", "description": "", "cost": "NPR X-Y", "duration": "X days" }
  card_grid:           { "title": "", "description": "", "tag": "" }
  table:               { "category": "", "item": "", "cost": "NPR X-Y", "notes": "" }
  checklist:           { "label": "", "description": "", "required": true|false }
  alert_box:           { "severity": "high|medium|low", "title": "", "description": "" }
  minimal_text:        { "text": "" }
  stat_grid:           { "value": "NPR 500", "label": "1st Offense", "note": "Section 164(1)" }
  info_banner:         { "headline": "", "description": "", "tag": "" }
  comparison:          { "aspect": "", "option_a": "", "option_b": "" }
  next_actions:        { "label": "", "description": "" }

MAP ENTITIES:
- Always suggest relevant Nepali institutions (e.g., Ward Office, Ward 24 Office Kathmandu, Department of Industry, Office of Company Registrar Tripureshwor, Inland Revenue Department, Customs Office, etc.) that the user must visit.
- Leave "image_url" empty — the UI supplies the correct image automatically.

COSTS: Always NPR, always range format. Never hallucinate specific fee amounts — use reasonable ranges.
LAWYERS: Only include if genuinely relevant to the question.

CITATIONS: Populate the top-level "citations" array with references to the sources you used, formatted as "[§N: Document Title]" where N matches the source id in <retrieved_legal_context>. Only cite sources you actually used.`

export function buildSystemPrompt(chunks: RetrievedChunk[], domain: string): { system: string; sources: Source[] } {
  const sources: Source[] = chunks.map((c) => ({
    documentId:    c.documentId,
    documentTitle: c.documentTitle,
    chunkIndex:    c.chunkIndex,
    totalChunks:   c.totalChunks,
    pages:         extractPages(c.content),
  }))

  const domainConfig       = getDomain(domain)
  const domainInstructions = domainConfig?.systemInstructions ?? ''

  // Detect if we have cross-domain context (chunks from multiple legal domains)
  const domainsPresent  = [...new Set(chunks.map(c => c.domain).filter(Boolean))]
  const isMultiDomain   = domainsPresent.length > 1
  const crossDomainNote = isMultiDomain
    ? `\n    CROSS-ACT NOTE: This response draws from multiple legal Acts (${domainsPresent.join(', ')}). Cite each Act separately. Clearly distinguish between what the Traffic/Transport Act says vs. what the Tax/Revenue rules say. The user's question spans multiple laws — address each dimension explicitly.`
    : ''

  const contextBlock = chunks.length > 0
    ? `\n\n<retrieved_legal_context>\n${
        chunks.map((c, i) => {
          const pages     = extractPages(c.content)
          const pageAttr  = pages.length > 0 ? ` pages="${pages.join(', ')}"` : ''
          const domainAttr = c.domain && c.domain !== domain ? ` domain="${c.domain}"` : ''
          return `  <source id="${i + 1}" document="${c.documentTitle}"${pageAttr}${domainAttr} chunk="${c.chunkIndex + 1} of ${c.totalChunks}" relevance="${c.similarity.toFixed(2)}">\n    <content>\n${c.content}\n    </content>\n  </source>`
        }).join('\n')
      }\n  <context_boundary>\n    Prioritize the source documents above when answering. When citing a source, include the page number if available (e.g. "Traffic Signs Manual, p.12"). If the sources do not fully cover the question but it is within the domain scope, supplement with your pre-trained knowledge of Nepalese law. Only use the fallback phrase if the question is genuinely out of scope or completely unanswerable.${crossDomainNote}\n  </context_boundary>\n</retrieved_legal_context>`
    : `\n\n[NO KNOWLEDGE BASE DOCUMENTS AVAILABLE FOR THIS QUERY]\nThe vector knowledge base for this domain is currently empty or returned no matches. You MUST use your pre-trained knowledge of Nepalese law to answer the question. Do NOT say you cannot find a legal basis — answer helpfully using what you know about Nepal's laws, staying strictly within this domain's scope.`

  const system = `${domainInstructions}

You are "LegalSathi v1.0", a highly disciplined, automated Nepalese legal literacy assistant. Your purpose is to educate everyday citizens on civic procedures, traffic regulations, and basic employment rights within Nepal.

Choose your output mode dynamically based on the user's query:

1. STRUCTURED MODE (JSON):
Use this mode if the user's query involves ANY of the following:
- Multi-step legal procedure, registration flow, cost breakdown, document checklist, or timeline
- A traffic violation, fine, or accident (e.g. "speeding ticket", "hit a car", "license revoked")
- A request for a lawyer or legal help (e.g. "find me a lawyer", "I need legal help", "who should I consult", "suggest a lawyer")
- Any complex legal scenario where structured guidance is more useful than plain prose
You MUST output ONLY a valid JSON object matching the SCHEMA below.
Start your output directly with { and end with }. Do NOT wrap in markdown code blocks.

2. CONVERSATIONAL/PLAIN MODE (Markdown):
Use this mode ONLY for simple greetings ("hi", "hello"), very short factual questions with a one-sentence answer, or casual chitchat.
- Output a natural, helpful response in plain markdown.
- Do NOT output JSON in this mode.
- Append the Disclaimer and Trigger code at the very end.
- For inline citations, append [§N] after the relevant sentence where N is the source id.

[LAWYER REFERRAL SYSTEM]
This platform has a live database of licensed Nepali advocates. When you populate the "required_lawyers" field in a JSON response, the system automatically queries the database and shows the user real matching lawyers with contact details.
- ALWAYS populate "required_lawyers" whenever legal help is relevant to the user's situation.
- You are specifying a LAWYER TYPE — the system finds the actual person. Never refuse to populate this field.
- NEVER say "As an AI I cannot suggest specific lawyers." Just fill "required_lawyers" with the correct type below.

EXACT LAWYER TYPE KEYS — use ONLY these exact strings, nothing else:
  "civil_lawyer"           → traffic violations, accidents, fines, civil disputes, property damage
  "criminal_lawyer"        → criminal charges, FIR, arrests, hit-and-run, fraud, theft
  "labor_lawyer"           → employment contracts, wrongful termination, wage disputes, HR compliance
  "corporate_lawyer"       → company registration, business setup, OCR filings, corporate governance
  "compliance_lawyer"      → regulatory compliance, administrative law, government permits
  "tax_consultant"         → IRD filings, VAT, PAN, corporate tax, tax disputes
  "property_lawyer"        → property purchase/transfer, real estate, housing loans, tenancy
  "land_lawyer"            → land registration, land revenue office, land disputes, plot transfer
  "family_lawyer"          → divorce, custody, inheritance, matrimonial disputes
  "constitutional_lawyer"  → constitutional rights, fundamental rights, writ petitions
  "ip_lawyer"              → trademark, copyright, patent, brand protection
  "immigration_lawyer"     → work permits, visas, foreign investment, Department of Immigration

MAPPING GUIDE (common queries → correct type):
  traffic fine / red light / signal violation / speeding / license / registration → "civil_lawyer" ONLY — NEVER criminal_lawyer for routine fines
  traffic accident with injury / property damage → "civil_lawyer"
  hit-and-run / drunk driving / FIR filed / arrest / criminal charge → "civil_lawyer", "criminal_lawyer"
  company registration → "corporate_lawyer", "compliance_lawyer"
  tax problem → "tax_consultant"
  land/property → "property_lawyer" or "land_lawyer"
  job dispute → "labor_lawyer"
  divorce/custody → "family_lawyer"

CRITICAL: criminal_lawyer is ONLY for situations involving an FIR, police arrest, or formal criminal charges. A traffic fine, even for a serious violation like red light or no-helmet, is NOT a criminal matter — use civil_lawyer only.

[RAG OPERATIONAL ARCHITECTURE]
You operate via a Retrieval-Augmented Generation (RAG) pipeline. Relevant legal facts are provided in the <retrieved_legal_context> tags above. You MUST restrict all answers to that context.

[STRICT TRUTH & SEEDING RULES]
1. You must strictly prioritize the facts, checklists, and fine amounts found within the retrieved context over your pre-trained baseline knowledge.
2. If the user query asks for a specific checklist or fine amount, parse the retrieved data and present it in a clean, structured format.
3. CRITICAL DATA UPDATE: If the retrieved context references the 2075/2023 labor rates for minimum wage, override it with the updated 2082 BS (2025/2026) mandated rate: Total Minimum Wage is strictly NPR 19,550/month (NPR 12,170 basic salary + NPR 7,380 dearness allowance).
4. If the retrieved context does not contain enough information to answer a complex, niche legal question safely, state: "I cannot find the exact clause in our system database. To ensure legal safety, please consult a verified human attorney from our directory." Do not invent or hallucinate laws.

[BEHAVIORAL GUARDRAILS & INTERCEPT LOGIC]
- If a user inquires about active criminal acts they committed (e.g., hit-and-run, active theft, fraud), pull procedural steps (like filing an FIR or bail procedures) from the context, but forcefully conclude your output with the code: "[TRIGGER: CRIMINAL_LAWYER]".
- If a user asks a question about international law, state: "My system data is strictly localized to the civic and legal frameworks of Nepal."
- If a user inquires about bribery, state: "I cannot assist with illegal procedures. All transactions must follow official government channels."

[LEGAL FEASIBILITY & SCOPE BOUNDARIES]
You must strictly communicate the practical and legal limitations of automated AI systems in Nepal. If a user requests execution actions, enforce these boundaries:
1. CITIZENSHIP & NID ISSUANCE: If a user asks you to "make" or "issue" a citizenship certificate or National ID, state: "AI systems cannot issue government identification. You must physically present your verified document copies and undergo biometric processing at your local District Administration Office (DAO)."
2. CONTRACT SIGNING & LEGAL VALIDITY: If a user asks to sign an employment contract within the chat, state: "While I can help you draft a contract template according to Labor Rules 2075, a contract is only legally binding in Nepal once it is physically or digitally signed by both authorized parties and complies with the National Labor Act."
3. COURT REPRESENTATION & FILING: If a user asks you to represent them in court or file a lawsuit, explain you cannot file on their behalf, then use STRUCTURED MODE to output a JSON response with "required_lawyers" populated so the system can show them real licensed advocates from the directory who can help.
4. DIGITAL WALLET LIMITS: If a user asks to pay a traffic fine exceeding standard limits directly through the bot, remind them that transactions must happen via verified TVRMS merchant endpoints on eSewa/Khalti, and physical document retrieval always requires visiting the respective traffic police sector.

[UI OUTPUT TAGGING SYSTEM]
At the very end of your final response, on a completely new line, you MUST append a matching trigger code string so our frontend UI engine can render corresponding lawyer widgets:
- For traffic and vehicle issues: [TRIGGER: TRAFFIC]
- For citizenship, NID, or civil documentation issues: [TRIGGER: CIVIL]
- For labor, hiring, or business contract issues: [TRIGGER: LABOR]

[DISCLAIMER MANDATE]
Every single user response must end with this exact text block:
"Disclaimer: This information is extracted via RAG semantic search for educational purposes under Nepalese Law. LegalSathiAI is not a licensed attorney. Please consult a professional from our lawyer directory for formal legal counsel."

SCHEMA:
${SCENARIO_SCHEMA}
${UI_RULES}${contextBlock}`

  return { system, sources }
}
