'use client'

// ─── Types ────────────────────────────────────────────────────────────────────

type Item = Record<string, unknown>

interface Section {
  section_type: string
  title: string
  ui_variant: string
  priority: string
  content: { items: Item[] }
}

interface MapEntity {
  name: string
  type: string
  purpose: string
  location_hint: string
  image_url?: string
}

interface Lawyer {
  type: string
  reason: string
}

interface MatchedLawyer {
  id: string
  name: string
  specialties: string[]
  location: string
  phone?: string | null
  email?: string | null
  experience: number
  bio: string
  languages: string[]
  fee?: string | null
  available: boolean
}

interface ScenarioData {
  title: string
  user_intent: string
  business_type: string
  sections: Section[]
  map_entities: MapEntity[]
  required_lawyers: Lawyer[]
  matched_lawyers?: MatchedLawyer[]
  summary: { ui_variant: string; content: string }
  next_actions: { ui_variant: string; actions: Item[] }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function str(item: Item, ...keys: string[]): string {
  for (const k of keys) {
    if (item[k] && typeof item[k] === 'string') return item[k] as string
  }
  return ''
}

// ─── Section renderers ────────────────────────────────────────────────────────

function StepperSection({ title, items }: { title: string; items: Item[] }) {
  return (
    <div>
      <SectionHeader title={title} />
      <div className="space-y-0 mt-3">
        {items.map((item, i) => (
          <div key={i} className="flex gap-3">
            {/* Number + connecting line */}
            <div className="flex flex-col items-center shrink-0">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold leading-none shrink-0"
                style={{ backgroundColor: '#1E2E4F', color: '#EEE9DF' }}
              >
                {i + 1}
              </div>
              {i < items.length - 1 && (
                <div className="w-px flex-1 min-h-5 my-1.5" style={{ backgroundColor: '#C8D4E8' }} />
              )}
            </div>
            {/* Content */}
            <div className="pb-5 flex-1 min-w-0 pt-0.5">
              <div className="text-[13px] font-semibold" style={{ color: '#1A1A2E' }}>
                {str(item, 'title', 'step_title', 'name')}
              </div>
              {str(item, 'description', 'detail', 'info') && (
                <div className="text-[12.5px] mt-1 leading-[1.7]" style={{ color: '#5C5349' }}>
                  {str(item, 'description', 'detail', 'info')}
                </div>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                {str(item, 'cost', 'fee', 'amount') && (
                  <span
                    className="text-[11px] font-medium px-2.5 py-0.5 rounded-full"
                    style={{ backgroundColor: '#E8ECF4', color: '#1E2E4F' }}
                  >
                    {str(item, 'cost', 'fee', 'amount')}
                  </span>
                )}
                {str(item, 'duration', 'time', 'timeline') && (
                  <span
                    className="text-[11px] px-2.5 py-0.5 rounded-full"
                    style={{ backgroundColor: '#FAF0E0', color: '#7A5C00' }}
                  >
                    {str(item, 'duration', 'time', 'timeline')}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CardGridSection({ title, items }: { title: string; items: Item[] }) {
  return (
    <div>
      <SectionHeader title={title} />
      <div className="grid grid-cols-2 gap-2.5 mt-3">
        {items.map((item, i) => (
          <div
            key={i}
            className="p-3.5 rounded-lg border text-left"
            style={{ borderColor: '#E2D9CF', backgroundColor: '#FFFFFF' }}
          >
            {str(item, 'tag', 'type', 'category') && (
              <span
                className="inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded mb-2"
                style={{ backgroundColor: '#E8ECF4', color: '#1E2E4F' }}
              >
                {str(item, 'tag', 'type', 'category')}
              </span>
            )}
            <div className="text-[13px] font-semibold leading-snug" style={{ color: '#1A1A2E' }}>
              {str(item, 'title', 'name', 'label')}
            </div>
            {str(item, 'description', 'detail', 'info') && (
              <div className="text-[12px] mt-1 leading-[1.6]" style={{ color: '#5C5349' }}>
                {str(item, 'description', 'detail', 'info')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function TableSection({ title, items }: { title: string; items: Item[] }) {
  return (
    <div>
      <SectionHeader title={title} />
      <div className="mt-3 rounded-lg overflow-hidden border" style={{ borderColor: '#E2D9CF' }}>
        <table className="w-full text-[12.5px]">
          <thead>
            <tr style={{ backgroundColor: '#F3EFE8' }}>
              <th className="text-left px-4 py-2.5 font-semibold" style={{ color: '#1A1A2E' }}>Item</th>
              <th className="text-left px-4 py-2.5 font-semibold whitespace-nowrap" style={{ color: '#1A1A2E' }}>Cost</th>
              <th className="text-left px-4 py-2.5 font-semibold" style={{ color: '#5C5349' }}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row, i) => (
              <tr
                key={i}
                style={{ borderTop: '1px solid #E2D9CF', backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#FAF8F4' }}
              >
                <td className="px-4 py-2.5 leading-snug" style={{ color: '#1A1A2E' }}>
                  <div className="font-medium">{str(row, 'item', 'title', 'name')}</div>
                  {str(row, 'category') && (
                    <div className="text-[11px] mt-0.5" style={{ color: '#9A8E84' }}>{str(row, 'category')}</div>
                  )}
                </td>
                <td className="px-4 py-2.5 font-mono font-semibold whitespace-nowrap" style={{ color: '#1E2E4F' }}>
                  {str(row, 'cost', 'fee', 'amount')}
                </td>
                <td className="px-4 py-2.5 leading-snug" style={{ color: '#5C5349' }}>
                  {str(row, 'notes', 'note', 'remark', 'description')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ChecklistSection({ title, items }: { title: string; items: Item[] }) {
  return (
    <div>
      <SectionHeader title={title} />
      <div className="space-y-2 mt-3">
        {items.map((item, i) => (
          <div key={i} className="flex gap-3 items-start">
            <div
              className="shrink-0 w-4 h-4 rounded border-2 mt-0.5"
              style={{ borderColor: '#1E2E4F' }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-medium" style={{ color: '#1A1A2E' }}>
                  {str(item, 'label', 'title', 'name')}
                </span>
                {item.required === true && (
                  <span
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: '#FEE2E2', color: '#B91C1C' }}
                  >
                    Required
                  </span>
                )}
              </div>
              {str(item, 'description', 'detail', 'info') && (
                <div className="text-[12px] mt-0.5 leading-[1.6]" style={{ color: '#5C5349' }}>
                  {str(item, 'description', 'detail', 'info')}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AlertSection({ title, items }: { title: string; items: Item[] }) {
  const palette: Record<string, { bg: string; border: string; text: string; badge: string }> = {
    high:   { bg: '#FEF2F2', border: '#EF4444', text: '#7F1D1D', badge: '#FEE2E2' },
    medium: { bg: '#FFFBEB', border: '#F59E0B', text: '#78350F', badge: '#FEF3C7' },
    low:    { bg: '#F0FDF4', border: '#22C55E', text: '#14532D', badge: '#DCFCE7' },
  }
  return (
    <div>
      <SectionHeader title={title} />
      <div className="space-y-2.5 mt-3">
        {items.map((item, i) => {
          const sev = (str(item, 'severity', 'risk_level') || 'medium').toLowerCase()
          const p = palette[sev] ?? palette.medium
          return (
            <div
              key={i}
              className="p-3.5 rounded-lg border-l-[3px]"
              style={{ backgroundColor: p.bg, borderColor: p.border }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                  style={{ backgroundColor: p.badge, color: p.text }}
                >
                  {sev}
                </span>
                <span className="text-[13px] font-semibold" style={{ color: p.text }}>
                  {str(item, 'title', 'name', 'label')}
                </span>
              </div>
              {str(item, 'description', 'detail', 'info') && (
                <div className="text-[12.5px] leading-[1.7]" style={{ color: p.text }}>
                  {str(item, 'description', 'detail', 'info')}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TextSection({ title, items }: { title: string; items: Item[] }) {
  return (
    <div>
      {title && <SectionHeader title={title} />}
      <div className="mt-2 space-y-2">
        {items.map((item, i) => (
          <p key={i} className="text-[13.5px] leading-[1.85]" style={{ color: '#1A1A2E' }}>
            {str(item, 'text', 'content', 'description', 'detail')}
          </p>
        ))}
      </div>
    </div>
  )
}

function MapEntitiesSection({ entities }: { entities: MapEntity[] }) {
  if (!entities?.length) return null
  const typeColors: Record<string, { bg: string; color: string }> = {
    municipality:  { bg: '#E8ECF4', color: '#1E2E4F' },
    tax_office:    { bg: '#FEF3C7', color: '#78350F' },
    customs:       { bg: '#F3E8FF', color: '#581C87' },
    government:    { bg: '#DCFCE7', color: '#14532D' },
    legal_firm:    { bg: '#FEE2E2', color: '#7F1D1D' },
    other:         { bg: '#F3EFE8', color: '#5C5349' },
  }

  const defaultImages: Record<string, string> = {
    municipality:  'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=400&q=80',
    tax_office:    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=400&q=80',
    customs:       'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=400&q=80',
    government:    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=400&q=80',
    legal_firm:    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80',
    other:         'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80'
  }

  return (
    <div>
      <SectionHeader title="Where to Go" />
      <div className="grid grid-cols-2 gap-3 mt-3">
        {entities.map((e, i) => {
          const c = typeColors[e.type] ?? typeColors.other
          return (
            <div
              key={i}
              className="rounded-lg border overflow-hidden flex flex-col"
              style={{ borderColor: '#E2D9CF', backgroundColor: '#FFFFFF' }}
            >
              {/* Image of the place */}
              <img 
                src={e.image_url || defaultImages[e.type] || defaultImages.other} 
                alt={e.name}
                className="w-full h-28 object-cover"
              />
              
              {/* Body content */}
              <div className="p-3.5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start gap-2">
                    <span className="text-base mt-px shrink-0">📍</span>
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold leading-snug" style={{ color: '#1A1A2E' }}>
                        {e.name}
                      </div>
                      <span
                        className="inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded mt-1.5"
                        style={{ backgroundColor: c.bg, color: c.color }}
                      >
                        {e.type.replace(/_/g, ' ')}
                      </span>
                      {e.purpose && (
                        <div className="text-[12px] mt-2 leading-[1.6]" style={{ color: '#5C5349' }}>
                          {e.purpose}
                        </div>
                      )}
                      {e.location_hint && (
                        <div className="text-[11px] mt-1" style={{ color: '#9A8E84' }}>
                          {e.location_hint}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Map + Directions */}
                <div className="mt-3.5 border-t pt-3" style={{ borderColor: '#E2D9CF' }}>
                  {(() => {
                    const query = e.name + (e.location_hint ? ', ' + e.location_hint : ', Nepal')
                    const gmapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}`
                    return (
                      <a
                        href={gmapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 py-2.5 rounded-md text-[12px] font-semibold transition-all hover:opacity-90"
                        style={{ backgroundColor: '#1E2E4F', color: '#EEE9DF' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" fill="currentColor"/>
                        </svg>
                        Open in Google Maps
                        <svg width="10" height="10" viewBox="0 0 16 16" fill="none" className="shrink-0 opacity-60">
                          <path d="M5 3h8v8M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </a>
                    )
                  })()}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MatchedLawyersSection({ lawyers }: { lawyers: MatchedLawyer[] }) {
  if (!lawyers?.length) return null
  const specialtyIcons: Record<string, string> = {
    business_registration_lawyer: '🏢',
    corporate_lawyer:             '🏢',
    tax_consultant:               '💰',
    contract_lawyer:              '📝',
    ip_lawyer:                    '💡',
    labor_lawyer:                 '👷',
    property_lawyer:              '🏠',
    land_lawyer:                  '🌾',
    compliance_lawyer:            '⚖️',
    immigration_lawyer:           '✈️',
    criminal_lawyer:              '🔒',
    constitutional_lawyer:        '📜',
    civil_lawyer:                 '🏛️',
    family_lawyer:                '👨‍👩‍👧',
  }

  function initials(name: string) {
    return name
      .split(' ')
      .filter(w => /^[A-Za-z]/.test(w))
      .slice(0, 2)
      .map(w => w[0].toUpperCase())
      .join('')
  }

  return (
    <div>
      <SectionHeader title="Suggested Lawyers" />
      <div className="space-y-3 mt-3">
        {lawyers.map((l) => (
          <div
            key={l.id}
            className="rounded-xl border overflow-hidden"
            style={{ borderColor: '#C8D4E8', backgroundColor: '#FFFFFF' }}
          >
            {/* Header row */}
            <div className="flex items-center gap-3 p-4 pb-3" style={{ backgroundColor: '#F5F7FB' }}>
              {/* Avatar */}
              <div
                className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-[15px] font-bold"
                style={{ backgroundColor: '#1E2E4F', color: '#EEE9DF' }}
              >
                {initials(l.name)}
              </div>
              {/* Name + location */}
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold leading-snug" style={{ color: '#1A1A2E' }}>
                  {l.name}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[11px]">📍</span>
                  <span className="text-[11.5px]" style={{ color: '#5C5349' }}>{l.location}</span>
                </div>
              </div>
              {/* Experience badge */}
              <div
                className="shrink-0 text-center px-2.5 py-1.5 rounded-lg"
                style={{ backgroundColor: '#E8ECF4' }}
              >
                <div className="text-[16px] font-bold leading-none" style={{ color: '#1E2E4F' }}>{l.experience}</div>
                <div className="text-[9px] font-semibold uppercase tracking-wide mt-0.5" style={{ color: '#5C5349' }}>yrs exp</div>
              </div>
            </div>

            {/* Specialties */}
            <div className="px-4 pt-2.5 pb-2 flex flex-wrap gap-1.5">
              {l.specialties.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 text-[10.5px] font-medium px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: '#E8ECF4', color: '#1E2E4F' }}
                >
                  <span>{specialtyIcons[s] ?? '⚖️'}</span>
                  <span>{s.replace(/_/g, ' ')}</span>
                </span>
              ))}
            </div>

            {/* Bio */}
            <div className="px-4 pb-3">
              <p className="text-[12.5px] leading-[1.7]" style={{ color: '#5C5349' }}>
                {l.bio}
              </p>
            </div>

            {/* Footer: fee + languages + contact */}
            <div
              className="px-4 py-3 border-t flex items-center justify-between flex-wrap gap-2"
              style={{ borderColor: '#E2D9CF', backgroundColor: '#FAF8F4' }}
            >
              <div className="flex items-center gap-3 flex-wrap">
                {l.fee && (
                  <span className="text-[12px] font-semibold" style={{ color: '#1E2E4F' }}>
                    💵 {l.fee}
                  </span>
                )}
                {l.languages?.length > 0 && (
                  <span className="text-[11.5px]" style={{ color: '#5C5349' }}>
                    🗣 {l.languages.join(' · ')}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {l.phone && (
                  <a
                    href={`tel:${l.phone}`}
                    className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#1E2E4F', color: '#EEE9DF' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
                    </svg>
                    Call
                  </a>
                )}
                {l.email && (
                  <a
                    href={`mailto:${l.email}`}
                    className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg border transition-colors hover:bg-gray-50"
                    style={{ borderColor: '#C8D4E8', color: '#1E2E4F' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="4" width="20" height="16" rx="2"/>
                      <path d="M2 7l10 7 10-7"/>
                    </svg>
                    Email
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function LawyerCardsSection({ lawyers }: { lawyers: Lawyer[] }) {
  if (!lawyers?.length) return null
  const icons: Record<string, string> = {
    business_registration_lawyer: '🏢',
    corporate_lawyer:             '🏢',
    tax_consultant:               '💰',
    contract_lawyer:              '📝',
    ip_lawyer:                    '💡',
    labor_lawyer:                 '👷',
    property_lawyer:              '🏠',
    land_lawyer:                  '🌾',
    compliance_lawyer:            '⚖️',
    immigration_lawyer:           '✈️',
    criminal_lawyer:              '🔒',
    constitutional_lawyer:        '📜',
    civil_lawyer:                 '🏛️',
    family_lawyer:                '👨‍👩‍👧',
  }
  return (
    <div>
      <SectionHeader title="Recommended Legal Help" />
      <div className="grid grid-cols-2 gap-2.5 mt-3">
        {lawyers.map((l, i) => (
          <div
            key={i}
            className="p-3.5 rounded-lg border"
            style={{ borderColor: '#C8D4E8', backgroundColor: '#F5F7FB' }}
          >
            <div className="text-xl mb-2">{icons[l.type] ?? '⚖️'}</div>
            <div className="text-[12.5px] font-semibold capitalize leading-snug" style={{ color: '#1E2E4F' }}>
              {l.type.replace(/_/g, ' ')}
            </div>
            <div className="text-[12px] mt-1 leading-[1.6]" style={{ color: '#5C5349' }}>
              {l.reason}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SummaryCard({ summary }: { summary: ScenarioData['summary'] }) {
  if (!summary?.content) return null
  return (
    <div
      className="p-4 rounded-lg border-l-[3px]"
      style={{ borderColor: '#1E2E4F', backgroundColor: '#E8ECF4' }}
    >
      <div className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: '#1E2E4F' }}>
        Summary
      </div>
      <div className="text-[13.5px] leading-[1.8]" style={{ color: '#1A1A2E' }}>
        {summary.content}
      </div>
    </div>
  )
}

function NextActionsSection({ next_actions }: { next_actions: ScenarioData['next_actions'] }) {
  if (!next_actions?.actions?.length) return null
  return (
    <div>
      <SectionHeader title="Next Actions" />
      <div className="flex flex-wrap gap-2 mt-3">
        {next_actions.actions.map((action, i) => {
          const label = typeof action === 'string' ? action : str(action as Item, 'label', 'title', 'action', 'text')
          const desc  = typeof action === 'string' ? '' : str(action as Item, 'description', 'detail')
          return (
            <div
              key={i}
              className="flex items-start gap-2.5 w-full px-4 py-3 rounded-lg border cursor-pointer transition-colors"
              style={{ borderColor: '#E2D9CF', backgroundColor: '#FFFFFF' }}
            >
              <span
                className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5"
                style={{ backgroundColor: '#1E2E4F', color: '#EEE9DF' }}
              >
                {i + 1}
              </span>
              <div>
                <div className="text-[13px] font-medium" style={{ color: '#1A1A2E' }}>{label}</div>
                {desc && <div className="text-[12px] mt-0.5" style={{ color: '#5C5349' }}>{desc}</div>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <div
      className="text-[10.5px] font-bold uppercase tracking-widest pb-1.5 border-b"
      style={{ color: '#1E2E4F', borderColor: '#E2D9CF' }}
    >
      {title}
    </div>
  )
}

// ─── Section dispatcher ───────────────────────────────────────────────────────

function renderSection(section: Section, index: number) {
  const { ui_variant, title, content } = section
  const items = content?.items ?? []

  switch (ui_variant) {
    case 'stepper':
    case 'timeline':
      return <StepperSection key={index} title={title} items={items} />
    case 'card_grid':
      return <CardGridSection key={index} title={title} items={items} />
    case 'table':
      return <TableSection key={index} title={title} items={items} />
    case 'checklist':
      return <ChecklistSection key={index} title={title} items={items} />
    case 'alert_box':
      return <AlertSection key={index} title={title} items={items} />
    case 'minimal_text':
    case 'list':
    case 'compact_list':
    default:
      return <TextSection key={index} title={title} items={items} />
  }
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function ScenarioRenderer({ data }: { data: ScenarioData }) {
  const highSections = data.sections?.filter(s => s.priority === 'high') ?? []
  const otherSections = data.sections?.filter(s => s.priority !== 'high') ?? []

  return (
    <div className="space-y-6">
      {/* Summary at top if present */}
      {data.summary && <SummaryCard summary={data.summary} />}

      {/* High-priority sections first */}
      {highSections.map((s, i) => renderSection(s, i))}

      {/* Other sections */}
      {otherSections.map((s, i) => renderSection(s, highSections.length + i))}

      {/* Map entities */}
      {data.map_entities?.length > 0 && <MapEntitiesSection entities={data.map_entities} />}

      {/* Real matched lawyers from DB — shown instead of generic type cards when available */}
      {data.matched_lawyers?.length
        ? <MatchedLawyersSection lawyers={data.matched_lawyers} />
        : data.required_lawyers?.length > 0 && <LawyerCardsSection lawyers={data.required_lawyers} />
      }

      {/* Next actions */}
      {data.next_actions && <NextActionsSection next_actions={data.next_actions} />}
    </div>
  )
}
