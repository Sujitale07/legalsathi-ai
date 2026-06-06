// ─── Types ────────────────────────────────────────────────────────────────────

export type ExportSource = {
  documentId: string
  documentTitle: string
  pages?: number[]
}

type Item = Record<string, unknown>

function str(item: Item, ...keys: string[]): string {
  for (const k of keys) {
    const v = item[k]
    if (typeof v === 'string' && v.trim()) return v.trim()
  }
  return ''
}

// ─── Scenario JSON types (mirror ScenarioRenderer) ───────────────────────────

export interface ScenarioExport {
  title: string
  response_mode?: string
  sections?: Array<{ title: string; ui_variant: string; priority: string; content: { items: Item[] } }>
  map_entities?: Array<{ name: string; type: string; purpose?: string; location_hint?: string }>
  summary?: { content: string }
  citations?: string[]
}

// ─── Markdown Generator ───────────────────────────────────────────────────────

function sectionToMarkdown(title: string, variant: string, items: Item[]): string {
  const out: string[] = [`## ${title}`, '']

  switch (variant) {
    case 'stepper':
    case 'timeline':
      items.forEach((item, i) => {
        const t = str(item, 'title'); const d = str(item, 'description')
        const cost = str(item, 'cost'); const dur = str(item, 'duration')
        out.push(`${i + 1}. **${t}**`)
        if (d) out.push(`   ${d}`)
        const meta = [cost && `Cost: ${cost}`, dur && `Duration: ${dur}`].filter(Boolean).join(' · ')
        if (meta) out.push(`   _${meta}_`)
        out.push('')
      })
      break

    case 'checklist':
      items.forEach(item => {
        const label = str(item, 'label'); const d = str(item, 'description')
        out.push(`- [${item.required ? 'x' : ' '}] **${label}**`)
        if (d) out.push(`  ${d}`)
      })
      out.push('')
      break

    case 'table':
      if (!items.length) break
      {
        const keys = Object.keys(items[0])
        out.push('| ' + keys.map(k => k[0].toUpperCase() + k.slice(1)).join(' | ') + ' |')
        out.push('| ' + keys.map(() => '---').join(' | ') + ' |')
        items.forEach(item => out.push('| ' + keys.map(k => String(item[k] ?? '')).join(' | ') + ' |'))
        out.push('')
      }
      break

    case 'stat_grid':
      items.forEach(item => {
        const val = str(item, 'value'); const label = str(item, 'label'); const note = str(item, 'note')
        out.push(`- **${val}** — ${label}${note ? ` _(${note})_` : ''}`)
      })
      out.push('')
      break

    case 'card_grid':
      items.forEach(item => {
        const t = str(item, 'title'); const d = str(item, 'description'); const tag = str(item, 'tag')
        out.push(`**${t}**${tag ? ` \`${tag}\`` : ''}`)
        if (d) out.push(d)
        out.push('')
      })
      break

    case 'alert_box':
      items.forEach(item => {
        const t = str(item, 'title'); const d = str(item, 'description')
        const sev = str(item, 'severity')
        out.push(`> **${sev === 'high' ? '⚠ ' : ''}${t}**`)
        if (d) out.push(`> ${d}`)
        out.push('')
      })
      break

    case 'info_banner':
      items.forEach(item => {
        const h = str(item, 'headline'); const d = str(item, 'description')
        out.push(`> ### ${h}`)
        if (d) out.push(`> ${d}`)
        out.push('')
      })
      break

    case 'comparison':
      if (!items.length) break
      out.push('| Aspect | Option A | Option B |')
      out.push('| --- | --- | --- |')
      items.forEach(item => {
        const a = str(item, 'aspect'); const oa = str(item, 'option_a', 'value_a', 'a'); const ob = str(item, 'option_b', 'value_b', 'b')
        out.push(`| ${a} | ${oa} | ${ob} |`)
      })
      out.push('')
      break

    default:
      items.forEach(item => {
        const line = Object.values(item).filter(v => typeof v === 'string').join(' — ')
        if (line) out.push(`- ${line}`)
      })
      out.push('')
  }

  return out.join('\n')
}

export function scenarioToMarkdown(
  scenario: ScenarioExport,
  sources: ExportSource[],
  mode: 'brief' | 'full' = 'full',
): string {
  const lines: string[] = []
  const date = new Date().toLocaleDateString('en-NP', { year: 'numeric', month: 'long', day: 'numeric' })

  lines.push(`# ${scenario.title}`)
  lines.push('')
  lines.push(`_LegalSathi AI — Educational Legal Information · Nepal · ${date}_`)
  lines.push('')
  lines.push('---')
  lines.push('')

  if (scenario.summary?.content) {
    lines.push('## Overview')
    lines.push('')
    lines.push(scenario.summary.content)
    lines.push('')
    lines.push('---')
    lines.push('')
  }

  const sections = scenario.sections ?? []
  const toRender = mode === 'brief'
    ? sections.filter(s => s.priority === 'high').slice(0, 2)
    : sections

  for (const sec of toRender) {
    lines.push(sectionToMarkdown(sec.title, sec.ui_variant, sec.content?.items ?? []))
    lines.push('---')
    lines.push('')
  }

  if (mode === 'full' && scenario.map_entities?.length) {
    lines.push('## Where to Go')
    lines.push('')
    for (const e of scenario.map_entities) {
      lines.push(`**${e.name}**`)
      if (e.purpose) lines.push(e.purpose)
      if (e.location_hint) lines.push(`_${e.location_hint}_`)
      lines.push('')
    }
    lines.push('---')
    lines.push('')
  }

  if (scenario.citations?.length) {
    lines.push('## Legal References')
    lines.push('')
    scenario.citations.forEach(c => lines.push(`- ${c}`))
    lines.push('')
    lines.push('---')
    lines.push('')
  }

  if (sources.length) {
    lines.push('## Knowledge Base Sources')
    lines.push('')
    const unique = [...new Map(sources.map(s => [s.documentId, s])).values()]
    unique.forEach(s => {
      const pg = s.pages?.length ? ` (PDF p. ${s.pages.join(', ')})` : ''
      lines.push(`- ${s.documentTitle}${pg}`)
    })
    lines.push('')
    lines.push('---')
    lines.push('')
  }

  lines.push('_Disclaimer: This information is provided by LegalSathi AI for educational purposes under Nepalese Law. LegalSathi AI is not a licensed attorney. Please consult a professional from our lawyer directory for formal legal counsel._')

  return lines.join('\n')
}

export function plainToMarkdown(content: string, sources: ExportSource[], title: string): string {
  const date = new Date().toLocaleDateString('en-NP', { year: 'numeric', month: 'long', day: 'numeric' })
  const clean = content.replace(/\[TRIGGER:[^\]]*\]/g, '').replace(/Disclaimer:[\s\S]*$/, '').trim()
  const srcBlock = sources.length
    ? `\n---\n\n## Knowledge Base Sources\n\n${[...new Map(sources.map(s => [s.documentId, s])).values()].map(s => `- ${s.documentTitle}${s.pages?.length ? ` (PDF p. ${s.pages.join(', ')})` : ''}`).join('\n')}\n`
    : ''
  return `# ${title}\n\n_LegalSathi AI — Educational Legal Information · Nepal · ${date}_\n\n---\n\n${clean}\n${srcBlock}\n---\n\n_Disclaimer: This information is provided by LegalSathi AI for educational purposes under Nepalese Law. LegalSathi AI is not a licensed attorney. Please consult a professional from our lawyer directory for formal legal counsel._\n`
}

// ─── HTML Generator (for PDF print) ──────────────────────────────────────────

function escape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function inlineFormat(text: string): string {
  return escape(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/_([^_]+)_/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
}

function markdownToBodyHtml(md: string): string {
  const lines = md.split('\n')
  const out: string[] = []
  let tableRows: string[] = []
  let inBq = false

  const flushTable = () => {
    if (!tableRows.length) return
    const rows = tableRows.filter(r => !/^\|[\s\-:|]+\|$/.test(r))
    out.push('<table>')
    rows.forEach((row, i) => {
      const cells = row.split('|').slice(1, -1)
      const tag = i === 0 ? 'th' : 'td'
      out.push(`<tr>${cells.map(c => `<${tag}>${inlineFormat(c.trim())}</${tag}>`).join('')}</tr>`)
    })
    out.push('</table>')
    tableRows = []
  }

  for (const raw of lines) {
    if (raw.startsWith('|')) { tableRows.push(raw); continue }
    else flushTable()

    if (raw.startsWith('> ')) {
      if (!inBq) { out.push('<blockquote>'); inBq = true }
      out.push(`<p>${inlineFormat(raw.slice(2))}</p>`)
    } else {
      if (inBq) { out.push('</blockquote>'); inBq = false }
      if (raw.startsWith('### ')) out.push(`<h3>${inlineFormat(raw.slice(4))}</h3>`)
      else if (raw.startsWith('## ')) out.push(`<h2>${inlineFormat(raw.slice(3))}</h2>`)
      else if (raw.startsWith('# ')) out.push(`<h1>${inlineFormat(raw.slice(2))}</h1>`)
      else if (/^---+$/.test(raw)) out.push('<hr/>')
      else if (raw.startsWith('- [')) {
        const checked = raw[3] !== ' '
        out.push(`<div class="check-item${checked ? ' done' : ''}">${inlineFormat(raw.slice(6))}</div>`)
      }
      else if (raw.startsWith('- ') || raw.startsWith('* ')) out.push(`<li>${inlineFormat(raw.slice(2))}</li>`)
      else if (/^\d+\. /.test(raw)) out.push(`<li class="num">${inlineFormat(raw.replace(/^\d+\. /, ''))}</li>`)
      else if (raw.trim() === '') out.push('')
      else out.push(`<p>${inlineFormat(raw)}</p>`)
    }
  }
  if (inBq) out.push('</blockquote>')
  flushTable()
  return out.join('\n')
}

const PDF_CSS = `
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Georgia',serif;font-size:12.5pt;line-height:1.75;color:#1A1A2E;max-width:700px;margin:0 auto;padding:36px 32px}
h1{font-size:20pt;font-weight:700;color:#1E2E4F;margin-bottom:6px}
h2{font-size:14pt;font-weight:600;color:#1E2E4F;margin:24px 0 10px;border-bottom:1px solid #E2D9CF;padding-bottom:4px}
h3{font-size:12pt;font-weight:600;margin:14px 0 6px}
p{margin:7px 0}
li{margin:5px 0 5px 22px}
li.num{list-style:decimal;margin-left:24px}
hr{border:none;border-top:1px solid #E2D9CF;margin:18px 0}
blockquote{background:#F3EFE8;border-left:3px solid #1E2E4F;padding:10px 14px;margin:12px 0;border-radius:2px}
table{width:100%;border-collapse:collapse;margin:12px 0;font-size:10.5pt}
th{background:#1E2E4F;color:#EEE9DF;padding:7px 10px;text-align:left;font-weight:600}
td{padding:7px 10px;border-bottom:1px solid #E2D9CF}
tr:nth-child(even) td{background:#FAF8F4}
code{background:#F3EFE8;padding:1px 4px;border-radius:3px;font-size:10pt;font-family:monospace}
.check-item{padding:3px 0 3px 22px;position:relative}.check-item::before{content:'☐';position:absolute;left:0}.check-item.done::before{content:'☑'}
em{font-style:italic;color:#5C5349}
.doc-hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;padding-bottom:14px;border-bottom:2px solid #1E2E4F}
.brand{font-size:11pt;font-weight:700;color:#1E2E4F;letter-spacing:.02em}
.meta{font-size:9pt;color:#9A8E84;text-align:right;line-height:1.5}
@media print{body{padding:16px 20px}h2{page-break-before:auto}table,blockquote{page-break-inside:avoid}}
`

export function scenarioToHtml(
  scenario: ScenarioExport,
  sources: ExportSource[],
  mode: 'brief' | 'full' = 'full',
): string {
  const md = scenarioToMarkdown(scenario, sources, mode)
  return buildHtmlDocument(scenario.title, md)
}

export function plainToHtml(content: string, sources: ExportSource[], title: string): string {
  const md = plainToMarkdown(content, sources, title)
  return buildHtmlDocument(title, md)
}

function buildHtmlDocument(title: string, md: string): string {
  const date = new Date().toLocaleDateString('en-NP', { year: 'numeric', month: 'long', day: 'numeric' })
  const body = markdownToBodyHtml(md)
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${escape(title)}</title><style>${PDF_CSS}</style></head><body>
<div class="doc-hdr">
  <div class="brand">LegalSathi AI</div>
  <div class="meta">Legal Information Document<br/>Nepal &nbsp;·&nbsp; ${escape(date)}</div>
</div>
${body}
<script>window.onload=()=>{window.print()}</script>
</body></html>`
}
