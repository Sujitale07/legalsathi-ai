'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Search, SlidersHorizontal, Scale, Users, Award, BookOpen,
  MessageCircle, UserSearch, PhoneCall, ChevronDown, Database,
} from 'lucide-react'
import { LawyerCard } from './LawyerCard'
import type { Lawyer } from './data'
import { RATINGS } from './data'

// ── Filter selects ─────────────────────────────────────────────────────────────

function Select({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: string[]; label: string }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        title={label}
        aria-label={label}
        className="appearance-none bg-app-bg border border-app-border rounded-xl px-3.5 py-2 pr-8 text-[13px] text-app-text font-medium cursor-pointer outline-none focus:border-app-border-strong transition-colors"
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-app-text-subtle pointer-events-none" />
    </div>
  )
}

function RatingSelect({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        title="Filter by minimum rating"
        aria-label="Filter by minimum rating"
        className="appearance-none bg-app-bg border border-app-border rounded-xl px-3.5 py-2 pr-8 text-[13px] text-app-text font-medium cursor-pointer outline-none focus:border-app-border-strong transition-colors"
      >
        {RATINGS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
      </select>
      <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-app-text-subtle pointer-events-none" />
    </div>
  )
}

// ── Static data ────────────────────────────────────────────────────────────────

const HOW_IT_WORKS = [
  { icon: UserSearch, step: '01', title: 'Search & Filter',  desc: 'Find lawyers by specialization, location, or rating using the search bar and filters.' },
  { icon: Scale,      step: '02', title: 'View Profile',     desc: 'Read bios, check experience, case count, and fee ranges before reaching out.' },
  { icon: PhoneCall,  step: '03', title: 'Contact Directly', desc: 'Call or email the lawyer directly — no middlemen, no hidden fees.' },
]

// ── Component ──────────────────────────────────────────────────────────────────

interface Props {
  initialLawyers: Lawyer[]
  dbError?: string | null
}

export function LawyerListing({ initialLawyers, dbError }: Props) {
  const [query,    setQuery]  = useState('')
  const [spec,     setSpec]   = useState('All')
  const [loc,      setLoc]    = useState('All')
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
    { icon: Award,    value: `${initialLawyers.filter(l => l.featured).length}`, label: 'Featured' },
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

  const hasFilter = query || spec !== 'All' || loc !== 'All' || minRating > 0
  const isEmpty   = initialLawyers.length === 0

  return (
    <div className="min-h-screen bg-app-bg text-app-text font-sans">

      {/* ══ 1. NAVBAR — flat cream strip ══════════════════════════════════════════ */}
      <nav className="sticky top-0 z-50 bg-app-bg/95 backdrop-blur-md border-b border-app-border">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-8 h-8 rounded-lg bg-app-accent flex items-center justify-center">
              <span className="text-[10px] font-bold font-mono text-[#EEE9DF]">LS</span>
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-app-text">LegalSathi AI</span>
          </Link>
          <Link
            href="/chat"
            className="flex items-center gap-1.5 px-4 py-1.5 bg-app-accent text-[#EEE9DF] rounded-lg text-[12px] font-medium no-underline hover:bg-app-accent-hover transition-colors"
          >
            <MessageCircle size={12} /> Ask AI
          </Link>
        </div>
      </nav>

      {/* ══ 2. HERO — cream + hollow circle motifs (editorial) ════════════════════ */}
      <section className="relative overflow-hidden bg-app-bg px-6 pt-20 pb-16 text-center">
        {/* decorative rings */}
        <div className="absolute -top-28 -right-28 w-96 h-96 rounded-full border border-app-border pointer-events-none" />
        <div className="absolute top-12 -right-8 w-40 h-40 rounded-full border border-app-border opacity-50 pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full border border-app-border opacity-40 pointer-events-none" />

        <div className="relative max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-app-border text-[10px] font-semibold uppercase tracking-widest text-app-text-subtle mb-8">
            <Scale size={9} /> Lawyer Directory
          </div>

          <h1 className="font-display text-[clamp(2.25rem,6vw,4rem)] font-bold text-app-text leading-[1.06] tracking-tight mb-5">
            Find Trusted Lawyers<br />in Nepal
          </h1>

          <p className="text-[15px] text-app-text-muted leading-relaxed mb-10 max-w-md mx-auto">
            Search by specialization, location, and expertise. Connect directly — no middlemen.
          </p>

          <div className="relative max-w-lg mx-auto">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-app-text-subtle pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, specialization, or keyword…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              disabled={isEmpty && !dbError}
              className="w-full pl-11 pr-5 py-4 text-[14px] bg-app-surface border border-app-border rounded-2xl outline-none focus:border-app-border-strong text-app-text placeholder:text-app-text-subtle shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </section>

      {/* ══ DB Error / Empty State (full-page empty) ══════════════════════════════ */}
      {(isEmpty || dbError) && (
        <section className="px-6 pb-24">
          <div className="max-w-md mx-auto bg-app-surface rounded-4xl border-2 border-dashed border-app-border p-12 text-center">
            <div className={`w-14 h-14 rounded-3xl flex items-center justify-center mx-auto mb-5 ${dbError ? 'bg-rose-50' : 'bg-app-accent-light'}`}>
              <Database size={24} className={dbError ? 'text-rose-500' : 'text-app-accent'} />
            </div>
            <h3 className="font-display text-[18px] font-bold text-app-text mb-3">
              {dbError ? 'Database unavailable' : 'No lawyers yet'}
            </h3>
            <p className="text-[13px] text-app-text-muted leading-relaxed mb-6">
              {dbError
                ? 'Cannot connect to the database. Check that DATABASE_URL is set and the database is running.'
                : 'The directory is empty. Seed it with demo data to get started.'}
            </p>
            {dbError && (
              <code className="block text-left text-[11px] text-rose-600 bg-rose-50 border border-rose-100 rounded-2xl px-4 py-3 mb-6 font-mono break-all">
                {dbError}
              </code>
            )}
            {!dbError && (
              <code className="block text-left text-[12px] text-app-text-muted bg-app-bg border border-app-border rounded-2xl px-4 py-3 mb-6 font-mono leading-relaxed">
                pnpm prisma db push<br />pnpm prisma db seed
              </code>
            )}
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-app-accent text-[#EEE9DF] rounded-2xl text-[13px] font-medium no-underline hover:bg-app-accent-hover transition-colors"
            >
              <MessageCircle size={13} /> Ask AI Instead
            </Link>
          </div>
        </section>
      )}

      {!isEmpty && !dbError && (
        <>
          {/* ══ 3. STATS — full-bleed white strip, gap-px dividers ══════════════════ */}
          <section className="bg-app-surface border-y border-app-border">
            <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-px bg-app-border">
              {stats.map(({ icon: Icon, value, label }, i) => (
                <div key={i} className="bg-app-surface flex items-center gap-3 py-5 px-6">
                  <div className="w-9 h-9 rounded-2xl bg-app-accent-light flex items-center justify-center shrink-0">
                    <Icon size={15} className="text-app-accent" />
                  </div>
                  <div>
                    <div className="text-[18px] font-bold font-display text-app-text leading-tight">{value}</div>
                    <div className="text-[10px] text-app-text-subtle mt-0.5">{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ══ 4. FILTER + GRID — cream bg, rounded-2xl bar, rounded-4xl cards ══════ */}
          <section className="px-6 py-12">
            <div className="max-w-6xl mx-auto">

              {/* Filter bar */}
              <div className="flex items-center gap-3 flex-wrap mb-8 px-5 py-3.5 bg-app-surface rounded-2xl border border-app-border">
                <div className="flex items-center gap-2 text-[12px] font-semibold text-app-text-subtle mr-1">
                  <SlidersHorizontal size={13} /> Filters
                </div>
                <Select value={spec}      onChange={setSpec}   options={specializations} label="Filter by specialization" />
                <Select value={loc}       onChange={setLoc}    options={locations}       label="Filter by location" />
                <RatingSelect value={minRating} onChange={setRating} />
                {hasFilter && (
                  <button
                    type="button"
                    onClick={() => { setQuery(''); setSpec('All'); setLoc('All'); setRating(0) }}
                    className="px-3 py-2 bg-app-bg border border-app-border rounded-xl text-[12px] font-medium text-app-text-subtle hover:text-app-text hover:border-app-border-strong transition-all cursor-pointer"
                  >
                    Clear
                  </button>
                )}
                <span className="ml-auto text-[12px] text-app-text-subtle">
                  {filtered.length} lawyer{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Cards grid */}
              {filtered.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filtered.map(lawyer => <LawyerCard key={lawyer.id} lawyer={lawyer} />)}
                </div>
              ) : (
                /* Filter-level empty state */
                <div className="py-24 bg-app-surface rounded-4xl border border-app-border text-center">
                  <div className="w-12 h-12 rounded-3xl bg-app-accent-light flex items-center justify-center mx-auto mb-4">
                    <Search size={20} className="text-app-accent" />
                  </div>
                  <div className="text-[16px] font-semibold font-display text-app-text mb-2">No lawyers found</div>
                  <div className="text-[13px] text-app-text-muted mb-6">Try adjusting your search or filters.</div>
                  <button
                    type="button"
                    onClick={() => { setQuery(''); setSpec('All'); setLoc('All'); setRating(0) }}
                    className="px-5 py-2 bg-app-accent-light text-app-accent rounded-xl text-[13px] font-medium border-none cursor-pointer hover:bg-app-accent hover:text-[#EEE9DF] transition-all"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* ══ 5. HOW IT WORKS — navy full-bleed, ghost-border cards ════════════════ */}
      <section className="bg-app-accent px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[10px] font-bold text-[#6B7D9A] uppercase tracking-widest mb-3">Simple Process</p>
            <h2 className="font-display text-[clamp(1.75rem,4vw,2.75rem)] font-bold text-[#EEE9DF] tracking-tight leading-tight">
              How It Works
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {HOW_IT_WORKS.map(({ icon: Icon, step, title, desc }, i) => (
              <div key={i} className="p-7 rounded-3xl border border-[#2D4070] bg-white/[0.04]">
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-[11px] font-bold text-[#6B7D9A] tracking-widest font-mono">{step}</span>
                  <div className="w-8 h-8 rounded-xl bg-[#2D4070] flex items-center justify-center">
                    <Icon size={14} className="text-[#A8B4C8]" />
                  </div>
                </div>
                <div className="text-[15px] font-semibold text-[#EEE9DF] mb-2">{title}</div>
                <div className="text-[12px] text-[#6B7D9A] leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 6. CTA — navy-bordered island box on cream ════════════════════════════ */}
      <section className="bg-app-bg px-6 py-20">
        <div className="max-w-lg mx-auto">
          <div className="rounded-4xl border-2 border-app-accent bg-app-surface p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-app-accent flex items-center justify-center mx-auto mb-6">
              <MessageCircle size={18} className="text-[#EEE9DF]" />
            </div>
            <h2 className="font-display text-[clamp(1.5rem,3vw,2.25rem)] font-bold text-app-text tracking-tight mb-3">
              Not sure who to choose?
            </h2>
            <p className="text-[14px] text-app-text-muted leading-relaxed mb-8 max-w-sm mx-auto">
              Describe your situation and LegalSathi AI will recommend the right specialist instantly.
            </p>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-7 py-3 bg-app-accent text-[#EEE9DF] rounded-2xl text-[14px] font-semibold no-underline hover:bg-app-accent-hover transition-colors"
            >
              <MessageCircle size={15} /> Ask AI Assistant
            </Link>
          </div>
        </div>
      </section>

      {/* ══ 7. FOOTER — navy bg ═══════════════════════════════════════════════════ */}
      <footer className="bg-app-accent border-t border-[#2D4070] px-6 py-7 text-center">
        <p className="text-[12px] text-[#6B7D9A]">
          © 2026 LegalSathi AI · Team Symentix ·{' '}
          <Link href="/" className="text-[#A8B4C8] no-underline hover:text-[#EEE9DF] transition-colors">
            Back to Home
          </Link>
        </p>
      </footer>

    </div>
  )
}
