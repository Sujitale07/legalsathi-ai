import { NextRequest } from 'next/server'
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, WidthType, ShadingType,
  AlignmentType, BorderStyle, convertInchesToTwip,
} from 'docx'
import type { ScenarioExport, ExportSource } from '@/lib/export'

// ─── DOCX helpers ─────────────────────────────────────────────────────────────

function heading1(text: string) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_1, spacing: { after: 120 } })
}

function heading2(text: string) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 100 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'E2D9CF' } },
  })
}

function heading3(text: string) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_3, spacing: { before: 160, after: 60 } })
}

function body(text: string) {
  return new Paragraph({ children: [new TextRun(text)], spacing: { after: 80 } })
}

function boldPara(text: string) {
  return new Paragraph({ children: [new TextRun({ text, bold: true })], spacing: { after: 80 } })
}

function meta(text: string) {
  return new Paragraph({
    children: [new TextRun({ text, italics: true, color: '9A8E84', size: 20 })],
    spacing: { after: 60 },
  })
}

function hr() {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'E2D9CF' } },
    spacing: { after: 160 },
  })
}

function bullet(text: string, indent = false) {
  return new Paragraph({
    children: [new TextRun(text)],
    bullet: { level: indent ? 1 : 0 },
    spacing: { after: 60 },
  })
}

function numberedPara(num: number, title: string, desc: string, cost?: string, dur?: string) {
  const children: TextRun[] = [
    new TextRun({ text: `${num}. `, bold: true }),
    new TextRun({ text: title, bold: true }),
  ]
  if (desc) children.push(new TextRun({ text: `\n    ${desc}` }))
  const metaParts = [cost && `Cost: ${cost}`, dur && `Duration: ${dur}`].filter(Boolean).join(' · ')
  if (metaParts) children.push(new TextRun({ text: `\n    ${metaParts}`, italics: true, color: '5C5349' }))
  return new Paragraph({ children, spacing: { after: 120 } })
}

function alertBox(title: string, description: string, isHigh: boolean) {
  return new Paragraph({
    children: [
      new TextRun({ text: `${isHigh ? '⚠ ' : ''}${title}`, bold: true }),
      ...(description ? [new TextRun({ text: `  ${description}` })] : []),
    ],
    shading: { type: ShadingType.SOLID, color: isHigh ? 'FEF3C7' : 'F3EFE8' },
    border: {
      left: { style: BorderStyle.THICK, size: 12, color: isHigh ? '78350F' : '1E2E4F' },
    },
    indent: { left: convertInchesToTwip(0.1) },
    spacing: { before: 80, after: 80 },
  })
}

function simpleTable(headers: string[], rows: string[][]): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: headers.map(h =>
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: 'EEE9DF' })], alignment: AlignmentType.LEFT })],
            shading: { type: ShadingType.SOLID, color: '1E2E4F' },
          })
        ),
        tableHeader: true,
      }),
      ...rows.map((row, i) =>
        new TableRow({
          children: row.map(cell =>
            new TableCell({
              children: [new Paragraph({ children: [new TextRun(cell)] })],
              shading: i % 2 === 1 ? { type: ShadingType.SOLID, color: 'FAF8F4' } : undefined,
            })
          ),
        })
      ),
    ],
  })
}

type Item = Record<string, unknown>
function s(item: Item, ...keys: string[]): string {
  for (const k of keys) {
    const v = item[k]
    if (typeof v === 'string' && v.trim()) return v.trim()
  }
  return ''
}

function sectionToDocx(title: string, variant: string, items: Item[]): (Paragraph | Table)[] {
  const out: (Paragraph | Table)[] = [heading2(title)]

  switch (variant) {
    case 'stepper':
    case 'timeline':
      items.forEach((item, i) => {
        out.push(numberedPara(i + 1, s(item, 'title'), s(item, 'description'), s(item, 'cost'), s(item, 'duration')))
      })
      break

    case 'checklist':
      items.forEach(item => {
        const label = s(item, 'label'); const d = s(item, 'description')
        const req = item.required === true ? ' (required)' : ''
        out.push(bullet(`${label}${req}`))
        if (d) out.push(bullet(d, true))
      })
      break

    case 'table': {
      if (!items.length) break
      const keys = Object.keys(items[0])
      const rows = items.map(item => keys.map(k => String(item[k] ?? '')))
      out.push(simpleTable(keys.map(k => k[0].toUpperCase() + k.slice(1)), rows))
      out.push(new Paragraph({ spacing: { after: 80 } }))
      break
    }

    case 'stat_grid':
      items.forEach(item => {
        const val = s(item, 'value'); const label = s(item, 'label'); const note = s(item, 'note')
        out.push(new Paragraph({
          children: [
            new TextRun({ text: val, bold: true }),
            new TextRun(` — ${label}${note ? ` (${note})` : ''}`),
          ],
          spacing: { after: 60 },
        }))
      })
      break

    case 'card_grid':
      items.forEach(item => {
        out.push(boldPara(s(item, 'title')))
        const d = s(item, 'description')
        if (d) out.push(body(d))
      })
      break

    case 'alert_box':
      items.forEach(item => {
        out.push(alertBox(s(item, 'title'), s(item, 'description'), s(item, 'severity') === 'high'))
      })
      break

    case 'info_banner':
      items.forEach(item => {
        out.push(new Paragraph({
          children: [new TextRun({ text: s(item, 'headline'), bold: true })],
          shading: { type: ShadingType.SOLID, color: 'E8ECF4' },
          spacing: { before: 80, after: 40 },
        }))
        const d = s(item, 'description')
        if (d) out.push(new Paragraph({ children: [new TextRun(d)], shading: { type: ShadingType.SOLID, color: 'E8ECF4' }, spacing: { after: 80 } }))
      })
      break

    case 'comparison': {
      if (!items.length) break
      const rows = items.map(item => [s(item, 'aspect'), s(item, 'option_a', 'value_a', 'a'), s(item, 'option_b', 'value_b', 'b')])
      out.push(simpleTable(['Aspect', 'Option A', 'Option B'], rows))
      out.push(new Paragraph({ spacing: { after: 80 } }))
      break
    }

    default:
      items.forEach(item => {
        const line = Object.values(item).filter(v => typeof v === 'string').join(' — ')
        if (line) out.push(bullet(line))
      })
  }

  return out
}

async function buildDocx(
  scenario: ScenarioExport,
  sources: ExportSource[],
  mode: 'brief' | 'full',
): Promise<Buffer> {
  const date = new Date().toLocaleDateString('en-NP', { year: 'numeric', month: 'long', day: 'numeric' })
  const children: (Paragraph | Table)[] = []

  // Header
  children.push(heading1(scenario.title))
  children.push(meta(`LegalSathi AI — Educational Legal Information · Nepal · ${date}`))
  children.push(hr())

  // Overview
  if (scenario.summary?.content) {
    children.push(heading2('Overview'))
    children.push(body(scenario.summary.content))
    children.push(hr())
  }

  // Sections
  const sections = scenario.sections ?? []
  const toRender = mode === 'brief'
    ? sections.filter(s => s.priority === 'high').slice(0, 2)
    : sections

  for (const sec of toRender) {
    children.push(...sectionToDocx(sec.title, sec.ui_variant, sec.content?.items ?? []))
    children.push(hr())
  }

  // Where to Go
  if (mode === 'full' && scenario.map_entities?.length) {
    children.push(heading2('Where to Go'))
    for (const e of scenario.map_entities) {
      children.push(boldPara(e.name))
      if (e.purpose) children.push(body(e.purpose))
      if (e.location_hint) children.push(meta(e.location_hint))
    }
    children.push(hr())
  }

  // Citations
  if (scenario.citations?.length) {
    children.push(heading2('Legal References'))
    scenario.citations.forEach(c => children.push(bullet(c)))
    children.push(hr())
  }

  // Sources
  if (sources.length) {
    children.push(heading2('Knowledge Base Sources'))
    const unique = [...new Map(sources.map(s => [s.documentId, s])).values()]
    unique.forEach(s => {
      const pg = s.pages?.length ? ` (PDF p. ${s.pages.join(', ')})` : ''
      children.push(bullet(`${s.documentTitle}${pg}`))
    })
    children.push(hr())
  }

  // Disclaimer
  children.push(meta('Disclaimer: This information is provided by LegalSathi AI for educational purposes under Nepalese Law. LegalSathi AI is not a licensed attorney. Please consult a professional from our lawyer directory for formal legal counsel.'))

  const doc = new Document({
    creator: 'LegalSathi AI',
    title: scenario.title,
    description: 'AI-generated legal information document for Nepal',
    styles: {
      default: {
        document: { run: { font: 'Calibri', size: 24 } },
      },
      paragraphStyles: [
        {
          id: 'Heading1',
          name: 'Heading 1',
          run: { color: '1E2E4F', size: 44, bold: true, font: 'Calibri' },
        },
        {
          id: 'Heading2',
          name: 'Heading 2',
          run: { color: '1E2E4F', size: 30, bold: true, font: 'Calibri' },
        },
        {
          id: 'Heading3',
          name: 'Heading 3',
          run: { color: '1E2E4F', size: 24, bold: true, font: 'Calibri' },
        },
      ],
    },
    sections: [{ children }],
  })

  return Packer.toBuffer(doc)
}

// ─── Route Handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  let body: {
    format: 'docx'
    scenario: ScenarioExport
    sources: ExportSource[]
    mode?: 'brief' | 'full'
  }

  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { format, scenario, sources = [], mode = 'full' } = body

  if (format !== 'docx' || !scenario?.title) {
    return Response.json({ error: 'format must be "docx" and scenario.title is required' }, { status: 400 })
  }

  try {
    const nodeBuffer = await buildDocx(scenario, sources, mode)
    const buffer = new Uint8Array(nodeBuffer)
    const filename = `${scenario.title.replace(/[^a-z0-9]+/gi, '_').toLowerCase()}.docx`

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(nodeBuffer.length),
      },
    })
  } catch (err) {
    console.error('DOCX export failed:', err)
    return Response.json({ error: 'Export failed' }, { status: 500 })
  }
}
