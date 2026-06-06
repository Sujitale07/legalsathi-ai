'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Search, SlidersHorizontal, Scale, Users, Award, BookOpen,
  MessageCircle, UserSearch, PhoneCall, ChevronDown,
} from 'lucide-react'
import { ArrowRight } from 'lucide-react'
import { LawyerCard } from './LawyerCard'
import type { Lawyer } from './data'
import { RATINGS } from './data'

function Select({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: string[]; label: string }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        title={label}
        aria-label={label}
        className="appearance-none bg-white border border-slate-200 rounded-xl px-3.5 py-2 pr-8 text-[13px] text-[#0a0f1e] font-medium cursor-pointer outline-none focus:border-slate-300 transition-colors"
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
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
        className="appearance-none bg-white border border-slate-200 rounded-xl px-3.5 py-2 pr-8 text-[13px] text-[#0a0f1e] font-medium cursor-pointer outline-none focus:border-slate-300 transition-colors"
      >
        {RATINGS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
      </select>
      <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  )
}

const HOW_IT_WORKS = [
  { icon: UserSearch, step: '01', title: 'Search & Filter', desc: 'Find lawyers by specialization, location, or rating using the search bar and filters.' },
  { icon: Scale, step: '02', title: 'View Profile', desc: 'Read bios, check experience, case count, and fee ranges before reaching out.' },
  { icon: PhoneCall, step: '03', title: 'Contact Directly', desc: 'Call or email the lawyer directly — no middlemen, no hidden fees.' },
]


interface Props {
  initialLawyers: Lawyer[]
}

export function LawyerListing({ initialLawyers }: Props) {
  const [query, setQuery] = useState('')
  const [spec, setSpec] = useState('All')
  const [loc, setLoc] = useState('All')
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
    { icon: Users, value: `${initialLawyers.length}+`, label: 'Verified Lawyers' },
    { icon: Award, value: `${initialLawyers.filter(l => l.featured).length}`, label: 'Featured' },
    { icon: BookOpen, value: `${specializations.length - 1}`, label: 'Specializations' },
    { icon: Scale, value: `${initialLawyers.reduce((s, l) => s + l.casesHandled, 0).toLocaleString()}+`, label: 'Cases Handled' },
  ], [initialLawyers, specializations])

  const filtered = useMemo(() => initialLawyers.filter(l => {
    const q = query.toLowerCase()
    const matchQ = !q || l.name.toLowerCase().includes(q) || l.specialization.toLowerCase().includes(q) || l.bio.toLowerCase().includes(q)
    const matchS = spec === 'All' || l.specialization === spec
    const matchL = loc === 'All' || l.location === loc
    const matchR = l.rating >= minRating
    return matchQ && matchS && matchL && matchR
  }), [query, spec, loc, minRating, initialLawyers])

  const hasFilter = query || spec !== 'All' || loc !== 'All' || minRating > 0

  return (
    <div className="min-h-screen bg-[#fafbff] text-[#0a0f1e]">

      {/* ── Navbar ─────────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-8 h-8 rounded-lg bg-[#2563eb] flex items-center justify-center">
              <Scale size={15} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[15px] font-bold tracking-tight text-[#0a0f1e]">LegalSathi AI</span>
          </Link>
          <Link
            href="/chat"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0a0f1e] text-white rounded-xl text-[13px] font-semibold no-underline hover:bg-[#1e293b] transition-colors"
          >
            <MessageCircle size={13} /> Ask AI
          </Link>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#fafbff] px-6 pt-20 pb-16 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_70%_70%_at_50%_0%,rgba(37,99,235,0.05)_0%,transparent_65%)] pointer-events-none" />

        <div className="relative max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.25 rounded-full border border-blue-600/20 bg-blue-600/5 text-[#2563eb] text-[11px] font-bold tracking-[0.06em] uppercase mb-8">
            <Scale size={10} /> Lawyer Directory
          </div>

          <h1 className="text-[clamp(2.25rem,6vw,4rem)] font-extrabold text-[#0a0f1e] leading-[1.06] tracking-[-0.04em] mb-5">
            Find Trusted Lawyers<br />in Nepal
          </h1>

          <p className="text-[16px] text-slate-500 leading-[1.75] mb-10 max-w-md mx-auto">
            Search by specialization, location, and expertise. Connect directly — no middlemen.
          </p>

          <div className="relative max-w-lg mx-auto">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, specialization, or keyword…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-11 pr-5 py-4 text-[14px] bg-white border border-slate-200 rounded-2xl outline-none focus:border-slate-300 text-[#0a0f1e] placeholder:text-slate-400 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-colors"
            />
          </div>
        </div>
      </section>

      {/* ── Stats strip ────────────────────────────────────────────────────────── */}
      <section className="bg-white border-y border-slate-200">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-200">
          {stats.map(({ icon: Icon, value, label }, i) => (
            <div key={i} className="flex items-center gap-3 py-5 px-6">
              <div className="w-9 h-9 rounded-xl bg-[#eff6ff] flex items-center justify-center shrink-0">
                <Icon size={15} className="text-[#2563eb]" />
              </div>
              <div>
                <div className="text-[18px] font-extrabold text-[#0a0f1e] leading-tight">{value}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wide">{label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Filter + Grid ──────────────────────────────────────────────────────── */}
      <section className="px-6 py-12">
        <div className="max-w-6xl mx-auto">

          {/* Filter bar */}
          <div className="flex items-center gap-3 flex-wrap mb-8 px-5 py-3.5 bg-white rounded-2xl border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-2 text-[12px] font-semibold text-slate-400 mr-1">
              <SlidersHorizontal size={13} /> Filters
            </div>
            <Select value={spec} onChange={setSpec} options={specializations} label="Filter by specialization" />
            <Select value={loc} onChange={setLoc} options={locations} label="Filter by location" />
            <RatingSelect value={minRating} onChange={setRating} />
            {hasFilter && (
              <button
                type="button"
                onClick={() => { setQuery(''); setSpec('All'); setLoc('All'); setRating(0) }}
                className="px-3 py-2 bg-[#fafbff] border border-slate-200 rounded-xl text-[12px] font-medium text-slate-400 hover:text-[#0a0f1e] hover:border-slate-300 transition-all cursor-pointer"
              >
                Clear
              </button>
            )}
            <span className="ml-auto text-[12px] text-slate-400">
              {filtered.length} lawyer{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Cards grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(lawyer => <LawyerCard key={lawyer.id} lawyer={lawyer} />)}
            </div>
          ) : (
            <div className="py-24 bg-white rounded-2xl border border-slate-200 text-center">
              <div className="w-12 h-12 rounded-xl bg-[#eff6ff] flex items-center justify-center mx-auto mb-4">
                <Search size={20} className="text-[#2563eb]" />
              </div>
              <div className="text-[16px] font-semibold text-[#0a0f1e] mb-2">No lawyers found</div>
              <div className="text-[13px] text-slate-500 mb-6">Try adjusting your search or filters.</div>
              <button
                type="button"
                onClick={() => { setQuery(''); setSpec('All'); setLoc('All'); setRating(0) }}
                className="px-5 py-2 bg-[#eff6ff] text-[#2563eb] rounded-xl text-[13px] font-semibold border-none cursor-pointer hover:bg-[#2563eb] hover:text-white transition-all"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────────────────────── */}
      <section className="listing-diagonal-grid relative overflow-hidden bg-white px-6 py-20 border-t border-slate-200">
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[11px] font-bold text-[#2563eb] uppercase tracking-[0.1em] mb-3">Simple Process</p>
            <h2 className="text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold text-[#0a0f1e] tracking-[-0.035em] leading-[1.1]">
              How It Works
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {HOW_IT_WORKS.map(({ icon: Icon, step, title, desc }, i) => (
              <div key={i} className="p-7 rounded-2xl border border-slate-200 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-[11px] font-bold text-slate-400 tracking-widest font-mono">{step}</span>
                  <div className="w-8 h-8 rounded-xl bg-[#eff6ff] flex items-center justify-center">
                    <Icon size={14} className="text-[#2563eb]" />
                  </div>
                </div>
                <div className="text-[15px] font-semibold text-[#0a0f1e] mb-2">{title}</div>
                <div className="text-[12px] text-slate-500 leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────────── */}
      <section className=" relative overflow-hidden bg-white px-6 py-20 border-t border-slate-200">
        <div className="relative z-10 max-w-lg mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.25 rounded-full border border-blue-600/20 bg-blue-600/5 text-[#2563eb] text-[11px] font-bold tracking-[0.06em] uppercase mb-7">
            <MessageCircle size={10} /> AI Assistant
          </div>
          <h2 className="text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold text-[#0a0f1e] tracking-[-0.035em] leading-[1.1] mb-4">
            Not sure who<br />to choose?
          </h2>
          <p className="text-[15px] text-slate-500 leading-[1.75] mb-9 max-w-sm mx-auto">
            Describe your situation and LegalSathi AI will recommend the right specialist instantly.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#0a0f1e] text-white rounded-xl text-[14px] font-bold no-underline hover:bg-[#1e293b] transition-colors shadow-[0_4px_16px_rgba(0,0,0,0.15)]"
            >
              Ask AI Assistant <ArrowRight size={15} />
            </Link>
            <Link
              href="/listing"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-[#0a0f1e] rounded-xl text-[14px] font-semibold no-underline border border-slate-200 hover:border-slate-300 transition-colors shadow-[0_2px_6px_rgba(0,0,0,0.04)]"
            >
              Browse All Lawyers
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────────── */}
      <footer className=" relative overflow-hidden bg-[#0a0f1e] border-t border-white/10 px-6 py-8 text-center">
        <div className="relative z-10">
          <p className="text-[12px] text-slate-500">
            © 2026 LegalSathi AI · Team Symentix ·{' '}
            <Link href="/" className="text-slate-400 no-underline hover:text-white transition-colors">
              Back to Home
            </Link>
          </p>
        </div>
      </footer>

    </div>
  )
}
