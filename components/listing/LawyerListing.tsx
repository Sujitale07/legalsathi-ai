'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, SlidersHorizontal, Scale, Users, Award, BookOpen, MessageCircle, UserSearch, PhoneCall, ChevronDown, Database } from 'lucide-react'
import { LawyerCard } from './LawyerCard'
import type { Lawyer } from './data'
import { RATINGS } from './data'

const PRIMARY = '#2563eb'
const PRIMARY_TINT = '#eff6ff'
const DARK = '#0a0f1e'

const selectStyle: React.CSSProperties = {
  appearance: 'none', background: '#fff', border: '1px solid #e2e8f0',
  borderRadius: '10px', padding: '10px 36px 10px 14px', fontSize: '14px',
  color: '#0f172a', fontWeight: 500, cursor: 'pointer', outline: 'none', fontFamily: 'inherit',
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <select value={value} onChange={e => onChange(e.target.value)} style={selectStyle}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
    </div>
  )
}

function RatingSelect({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <select value={value} onChange={e => onChange(Number(e.target.value))} style={selectStyle}>
        {RATINGS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
      </select>
      <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
    </div>
  )
}

const howItWorks = [
  { icon: UserSearch, step: '01', title: 'Search & Filter',  desc: 'Use the search bar and filters to find lawyers by specialization, location, or rating.' },
  { icon: Scale,      step: '02', title: 'View Profile',     desc: 'Read lawyer bios, check experience, case count, and fee ranges before reaching out.' },
  { icon: PhoneCall,  step: '03', title: 'Contact Directly', desc: 'Call or email the lawyer directly — no middlemen, no hidden fees.' },
]

interface Props {
  initialLawyers: Lawyer[]
}

export function LawyerListing({ initialLawyers }: Props) {
  const [query, setQuery]      = useState('')
  const [spec, setSpec]        = useState('All')
  const [loc, setLoc]          = useState('All')
  const [minRating, setRating] = useState(0)

  const specializations = useMemo(
    () => ['All', ...Array.from(new Set(initialLawyers.map(l => l.specialization))).sort()],
    [initialLawyers],
  )
  const locations = useMemo(
    () => ['All', ...Array.from(new Set(initialLawyers.map(l => l.location))).sort()],
    [initialLawyers],
  )

  const stats = useMemo(() => [
    { icon: Users,    value: `${initialLawyers.length}+`,  label: 'Verified Lawyers' },
    { icon: Award,    value: `${initialLawyers.filter(l => l.featured).length}`, label: 'Featured Profiles' },
    { icon: BookOpen, value: `${specializations.length - 1}`, label: 'Specializations' },
    { icon: Scale,    value: `${initialLawyers.reduce((s, l) => s + l.casesHandled, 0).toLocaleString()}+`, label: 'Cases Handled' },
  ], [initialLawyers, specializations])

  const filtered = useMemo(() => initialLawyers.filter(l => {
    const q = query.toLowerCase()
    const matchQ = !q || l.name.toLowerCase().includes(q) || l.specialization.toLowerCase().includes(q) || l.bio.toLowerCase().includes(q)
    const matchS = spec === 'All' || l.specialization === spec
    const matchL = loc  === 'All' || l.location === loc
    const matchR = l.rating >= minRating
    return matchQ && matchS && matchL && matchR
  }), [query, spec, loc, minRating, initialLawyers])

  const hasActiveFilter = query || spec !== 'All' || loc !== 'All' || minRating > 0
  const isEmpty = initialLawyers.length === 0

  return (
    <div style={{ fontFamily: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif', color: '#0f172a', background: '#fafbff', minHeight: '100vh' }}>

      {/* ── Navbar ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '9px', textDecoration: 'none' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: PRIMARY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Scale size={15} color="#fff" strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>LegalSathi AI</span>
          </Link>
          <Link href="/chat" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: PRIMARY, color: '#fff', textDecoration: 'none', borderRadius: '9px', fontSize: '13px', fontWeight: 600 }}>
            <MessageCircle size={13} /> Ask AI
          </Link>
        </div>
      </nav>

      {/* ── Hero / Search ── */}
      <section style={{ padding: '72px 24px 56px', textAlign: 'center', background: '#fafbff' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '100px', border: '1px solid rgba(37,99,235,0.2)', background: 'rgba(37,99,235,0.05)', color: PRIMARY, fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '20px' }}>
          <Scale size={11} /> Lawyer Directory
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, color: DARK, letterSpacing: '-0.04em', lineHeight: 1.08, marginBottom: '14px' }}>
          Find Trusted Lawyers<br />in Nepal
        </h1>
        <p style={{ fontSize: '17px', color: '#64748b', lineHeight: 1.7, marginBottom: '36px' }}>
          Search by specialization, location, and expertise.
        </p>
        <div style={{ maxWidth: '560px', margin: '0 auto', position: 'relative' }}>
          <Search size={17} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search by name, specialization, or keyword…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            disabled={isEmpty}
            style={{ width: '100%', padding: '15px 16px 15px 46px', fontSize: '15px', border: '1.5px solid #e2e8f0', borderRadius: '12px', background: isEmpty ? '#f8fafc' : '#fff', color: '#0f172a', outline: 'none', boxSizing: 'border-box', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', fontFamily: 'inherit', cursor: isEmpty ? 'not-allowed' : 'text' }}
          />
        </div>
      </section>

      {/* ── DB Empty State ── */}
      {isEmpty ? (
        <section style={{ padding: '0 24px 80px' }}>
          <div style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center', padding: '64px 32px', background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: PRIMARY_TINT, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Database size={26} style={{ color: PRIMARY }} />
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: DARK, marginBottom: '10px' }}>No lawyers in the database</div>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.7, marginBottom: '24px' }}>
              The lawyer directory is empty. Run the seed command to populate it with demo data, or add lawyers through the admin panel.
            </p>
            <code style={{ display: 'block', padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', color: '#475569', fontFamily: 'monospace', marginBottom: '20px', textAlign: 'left' }}>
              pnpm prisma db push<br />pnpm prisma db seed
            </code>
            <Link href="/chat" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px', background: PRIMARY, color: '#fff', textDecoration: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600 }}>
              <MessageCircle size={14} /> Ask AI Instead
            </Link>
          </div>
        </section>
      ) : (
        <>
          {/* ── Stats ── */}
          <section style={{ padding: '0 24px 48px' }}>
            <div style={{ maxWidth: '960px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
              {stats.map(({ icon: Icon, value, label }, i) => (
                <div key={i} style={{ padding: '18px 20px', background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: PRIMARY_TINT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={18} style={{ color: PRIMARY }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: DARK, lineHeight: 1 }}>{value}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Filters + Grid ── */}
          <section style={{ padding: '0 24px 80px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '28px', padding: '16px 20px', background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px', fontWeight: 600, marginRight: '4px' }}>
                  <SlidersHorizontal size={14} /> Filters
                </div>
                <Select value={spec}      onChange={setSpec}   options={specializations} />
                <Select value={loc}       onChange={setLoc}    options={locations} />
                <RatingSelect value={minRating} onChange={setRating} />
                {hasActiveFilter && (
                  <button
                    onClick={() => { setQuery(''); setSpec('All'); setLoc('All'); setRating(0) }}
                    style={{ padding: '10px 14px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    Clear
                  </button>
                )}
                <span style={{ marginLeft: 'auto', fontSize: '13px', color: '#94a3b8' }}>
                  {filtered.length} lawyer{filtered.length !== 1 ? 's' : ''} found
                </span>
              </div>

              {filtered.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                  {filtered.map(lawyer => (
                    <LawyerCard key={lawyer.id} lawyer={lawyer} />
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '64px 24px', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: PRIMARY_TINT, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <Search size={22} style={{ color: PRIMARY }} />
                  </div>
                  <div style={{ fontSize: '17px', fontWeight: 700, color: DARK, marginBottom: '8px' }}>No lawyers found</div>
                  <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>Try adjusting your filters or search terms.</div>
                  <button
                    onClick={() => { setQuery(''); setSpec('All'); setLoc('All'); setRating(0) }}
                    style={{ padding: '9px 18px', background: PRIMARY_TINT, color: PRIMARY, border: 'none', borderRadius: '9px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* ── How It Works ── */}
      <section style={{ padding: '72px 24px', background: DARK }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>Simple Process</p>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.035em', lineHeight: 1.1, marginBottom: '48px' }}>How It Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {howItWorks.map(({ icon: Icon, step, title, desc }, i) => (
              <div key={i} style={{ padding: '30px 24px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#60a5fa', letterSpacing: '0.08em' }}>{step}</span>
                  <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'rgba(37,99,235,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={16} style={{ color: '#93c5fd' }} />
                  </div>
                </div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9', marginBottom: '8px' }}>{title}</div>
                <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.65 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '72px 24px', background: PRIMARY, textAlign: 'center' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: '12px' }}>
            Not sure who to choose?
          </h2>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, marginBottom: '28px' }}>
            Ask LegalSathi AI for personalized guidance — describe your situation and get a recommended specialist instantly.
          </p>
          <Link href="/chat" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 32px', background: '#fff', color: '#1d4ed8', textDecoration: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 700, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
            <MessageCircle size={17} /> Ask AI Assistant
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ padding: '28px 24px', background: DARK, textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <p style={{ fontSize: '13px', color: '#475569' }}>
          © 2026 LegalSathi AI · Team Symentix ·{' '}
          <Link href="/" style={{ color: '#60a5fa', textDecoration: 'none' }}>Back to Home</Link>
        </p>
      </footer>

    </div>
  )
}
