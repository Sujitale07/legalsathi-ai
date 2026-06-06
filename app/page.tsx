'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { DOMAINS } from '@/lib/domains'

// ── Scroll reveal ─────────────────────────────────────────────────────────────
function useReveal(containerRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const root = containerRef.current
    if (!root) return

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            obs.unobserve(e.target)
          }
        })
      },
      { root, threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )

    const tid = setTimeout(() => {
      root.querySelectorAll('[data-reveal]').forEach((el) => obs.observe(el))
    }, 100)

    return () => { clearTimeout(tid); obs.disconnect() }
  }, [containerRef])
}

// ── Animated counter ──────────────────────────────────────────────────────────
function CountUp({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const duration = 1400
          const start = performance.now()
          const step = (now: number) => {
            const p = Math.min((now - start) / duration, 1)
            const eased = 1 - Math.pow(1 - p, 3)
            setVal(Math.round(eased * to))
            if (p < 1) requestAnimationFrame(step)
          }
          requestAnimationFrame(step)
          obs.disconnect()
        }
      },
      { threshold: 0.5 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [to])

  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>
}

// ── Icons ─────────────────────────────────────────────────────────────────────
const IconMsg = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)
const IconBrain = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>
    <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/>
  </svg>
)
const IconRoute = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="19" r="3"/>
    <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/>
    <circle cx="18" cy="5" r="3"/>
  </svg>
)
const IconCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <path d="m9 11 3 3L22 4"/>
  </svg>
)
const IconStar = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)
const IconArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
)
const IconAlertFlag = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 3 }}>
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
    <line x1="4" y1="22" x2="4" y2="15"/>
  </svg>
)
const IconTextLines = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/>
  </svg>
)
const IconLayers = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
  </svg>
)
const IconImage = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
  </svg>
)
const IconHexagon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/>
  </svg>
)

// ── Domain icons (replaces emoji in domain cards) ──────────────────────────
const DomainIcons: Record<string, () => JSX.Element> = {
  general: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  traffic: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="2" width="10" height="20" rx="2"/>
      <circle cx="12" cy="7" r="1.5" fill="currentColor" stroke="none"/>
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>
      <circle cx="12" cy="17" r="1.5" fill="currentColor" stroke="none"/>
    </svg>
  ),
  taxation: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="8" y1="13" x2="16" y2="13"/>
      <line x1="8" y1="17" x2="12" y2="17"/>
    </svg>
  ),
  divorce: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  labor: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/>
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
      <line x1="12" y1="12" x2="12" y2="16"/>
      <line x1="10" y1="14" x2="14" y2="14"/>
    </svg>
  ),
  property: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  business: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
      <line x1="10" y1="6" x2="10" y2="6.01"/>
      <line x1="14" y1="6" x2="14" y2="6.01"/>
      <line x1="10" y1="10" x2="10" y2="10.01"/>
      <line x1="14" y1="10" x2="14" y2="10.01"/>
      <line x1="10" y1="14" x2="10" y2="14.01"/>
      <line x1="14" y1="14" x2="14" y2="14.01"/>
    </svg>
  ),
}

function DomainIconSlug({ slug, center }: { slug: string; center?: boolean }) {
  const Icon = DomainIcons[slug]
  if (!Icon) return null
  return (
    <div style={{ color: 'var(--color-app-accent)', marginBottom: 10, display: 'flex', justifyContent: center ? 'center' : 'flex-start' }}>
      <Icon />
    </div>
  )
}

// ── Data ──────────────────────────────────────────────────────────────────────
const STEPS = [
  { icon: <IconMsg />,   num: '01', title: 'Ask Your Question',             body: 'Describe your legal issue in plain Nepali or English — no jargon required.' },
  { icon: <IconBrain />, num: '02', title: 'AI Understands Your Situation', body: 'LegalSathi analyzes your case and identifies relevant laws, procedures, and obligations.' },
  { icon: <IconRoute />, num: '03', title: 'Get a Personalized Roadmap',   body: 'Step-by-step guide: what to do, where to go, required documents, fees, and timelines.' },
  { icon: <IconCheck />, num: '04', title: 'Take Action Confidently',      body: 'Follow the roadmap, generate documents, connect with professionals, complete your journey.' },
]

const TESTIMONIALS = [
  { quote: 'LegalSathi saved me hours when registering my business. It explained every step, required document, and fee clearly.', name: 'Founder', location: 'Kathmandu' },
  { quote: 'I finally understood the driving license process without visiting multiple offices or asking around.', name: 'Student', location: 'Pokhara' },
  { quote: 'The compliance roadmap is incredible. It tells you exactly what to do next, no guessing involved.', name: 'Small Business Owner', location: 'Lalitpur' },
]

const MARQUEE_ITEMS = [
  'Citizens', 'Entrepreneurs', 'Students', 'Businesses', 'Landlords',
  'Drivers', 'Startups', 'Freelancers', 'Employees', 'Property Buyers',
  'Tax Filers', 'New Graduates', 'Employers', 'Lawyers',
]

const CYCLING_DOMAINS = ['Business Registration', 'Traffic Violations', 'Tax Filing', 'Property Law', 'Labor Disputes', 'Family Law']

const AI_RED_FLAGS: { title: string; icon: ReactNode; signals: string[] }[] = [
  {
    title: 'Text & Copywriting',
    icon: <IconTextLines />,
    signals: [
      'Overuse of words like "delve", "tapestry", "paramount", "navigate the landscape"',
      'Verbose but says very little — generalized statements, no original data or opinions',
      'Unedited AI responses left in copy ("As an AI language model, I cannot…")',
      'Awkward rigid structure: every section has exactly three bullet points and a closing summary',
    ],
  },
  {
    title: 'Site Structure',
    icon: <IconLayers />,
    signals: [
      'Hundreds of standalone pages with no logical internal linking',
      'Default CMS pages still live — "Hello World" posts, lorem ipsum in the footer',
      'Hundreds of articles all published on the exact same day',
      'Robotic URL slugs: /topic-feature-benefit-1, /topic-feature-benefit-2',
    ],
  },
  {
    title: 'Visuals & Media',
    icon: <IconImage />,
    signals: [
      'AI image artifacts — extra fingers, garbled background text, that over-smooth midjourney gloss',
      'No real human faces on the About page — generic stock models or obvious AI faces',
      'Images are tangentially related to the keyword but don\'t illustrate the actual content',
    ],
  },
  {
    title: 'Brand Cohesion',
    icon: <IconHexagon />,
    signals: [
      'Raw uncustomized template — no deliberate design choices, no consistent color palette',
      'Covers wildly disconnected topics on the same site (keyword chasing, not expertise)',
      'No clear identity — feels like an empty shell assembled by a script',
    ],
  },
]

function HeroSection() {
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIdx((i) => (i + 1) % CYCLING_DOMAINS.length)
        setVisible(true)
      }, 320)
    }, 2200)
    return () => clearInterval(id)
  }, [])

  return (
    <section style={{ background: 'var(--color-app-bg)', padding: '88px 28px 0', borderBottom: '1px solid var(--color-app-border)' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>

        {/* Badge */}
        <div className="hero-1" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--color-app-surface)', border: '1px solid var(--color-app-border)', borderRadius: 6, padding: '5px 14px', marginBottom: 28 }}>
          <span className="pulse-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block', flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: 'var(--color-app-text-muted)' }}>Trained on Nepali law · Available 24/7</span>
        </div>

        {/* Headline */}
        <h1 className="hero-2" style={{ fontFamily: 'var(--font-display), Georgia, serif', fontSize: 'clamp(36px, 5.5vw, 58px)', fontWeight: 600, lineHeight: 1.1, color: 'var(--color-app-text)', letterSpacing: '-0.028em', marginBottom: 16 }}>
          Nepal&apos;s AI Legal Assistant for Every Legal Journey
        </h1>

        {/* Cycling subtext */}
        <p className="hero-3" style={{ fontSize: 16, lineHeight: 1.72, color: 'var(--color-app-text-muted)', marginBottom: 36 }}>
          Ask about{' '}
          <span
            key={idx}
            className="word-cycle"
            style={{
              fontWeight: 600,
              color: 'var(--color-app-accent)',
              opacity: visible ? 1 : 0,
              transition: 'opacity 0.3s ease',
            }}
          >
            {CYCLING_DOMAINS[idx]}
          </span>
          {' '}— get a step-by-step roadmap in plain Nepali or English.
        </p>

        {/* CTAs */}
        <div className="hero-4" style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 14 }}>
          <Link href="/chat" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 500, color: '#EEE9DF', background: '#1E2E4F', padding: '12px 24px', borderRadius: 7, textDecoration: 'none' }}>
            Try LegalSathi AI Free <IconArrow />
          </Link>
          <a href="#how-it-works" style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-app-text)', padding: '12px 24px', borderRadius: 7, textDecoration: 'none', border: '1px solid var(--color-app-border-strong)' }}>
            See How It Works
          </a>
        </div>

        <p className="hero-5" style={{ fontSize: 12, color: 'var(--color-app-text-subtle)', marginBottom: 56 }}>
          Free to use · No sign-up required · Works in Nepali &amp; English
        </p>      

      </div>

      {/* Interactive domain grid */}
      <div style={{ maxWidth: 640, margin: '64px auto 0', paddingBottom: 80 }}>
        <p style={{ fontSize: 13, color: 'var(--color-app-text-muted)', textAlign: 'center', marginBottom: 20 }}>
          Select a domain below to start your session
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {DOMAINS.map((domain, i) => (
            <Link
              key={domain.slug}
              href={`/chat?domain=${domain.slug}`}
              data-reveal
              data-d={String(Math.min(i + 1, 7))}
              className={`domain-card px-5 py-4 border border-app-border bg-app-surface rounded-sm cursor-pointer group no-underline ${domain.slug === 'general' ? 'col-span-2 sm:col-span-3 text-center' : 'text-left'}`}
            >
              <DomainIconSlug slug={domain.slug} center={domain.slug === 'general'} />
              <div className="text-[13px] font-semibold text-app-text group-hover:text-app-accent font-display mb-1">{domain.label}</div>
              <div className="text-[11.5px] text-app-text-subtle leading-relaxed">{domain.description}</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  useReveal(containerRef)

  return (
    <div
      ref={containerRef}
      style={{
        height: '100vh',
        overflowY: 'auto',
        background: 'var(--color-app-bg)',
        color: 'var(--color-app-text)',
        fontFamily: 'var(--font-sans), ui-sans-serif, system-ui, sans-serif',
      }}
    >

      {/* ══ NAV ══════════════════════════════════════════════════════════════ */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(250,248,244,0.94)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-app-border)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 28px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 28, height: 28, borderRadius: 5, background: '#1E2E4F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#EEE9DF', fontFamily: 'var(--font-mono)' }}>LS</span>
            </div>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-app-text)', letterSpacing: '-0.01em', fontFamily: 'var(--font-display)' }}>LegalSathi</span>
          </div>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            {[['#how-it-works', 'How it works'], ['#testimonials', 'Reviews']].map(([href, label]) => (
              <a key={href} href={href} style={{ fontSize: 13, color: 'var(--color-app-text-muted)', textDecoration: 'none' }}>{label}</a>
            ))}
            <Link href="/chat" style={{ fontSize: 13, fontWeight: 500, color: '#EEE9DF', background: '#1E2E4F', padding: '7px 18px', borderRadius: 6, textDecoration: 'none' }}>
              Try Free
            </Link>
          </nav>
        </div>
      </header>

      {/* ══ HERO ═════════════════════════════════════════════════════════════ */}
      <HeroSection />

      <section style={{ background: 'var(--color-app-surface)', borderBottom: '1px solid var(--color-app-border)', padding: '18px 0' }}>
        <div className="marquee-wrap">
          <div className="marquee-track">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 22, padding: '0 22px', flexShrink: 0 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-app-text-subtle)', whiteSpace: 'nowrap' }}>{item}</span>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--color-app-border-strong)', display: 'inline-block', flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ═════════════════════════════════════════════════════ */}
      <section id="how-it-works" style={{ padding: '100px 28px', background: 'var(--color-app-bg)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div data-reveal style={{ marginBottom: 60, maxWidth: 480 }}>
            <h2 style={{ fontFamily: 'var(--font-display), Georgia, serif', fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 600, letterSpacing: '-0.025em', color: 'var(--color-app-text)', marginBottom: 12, lineHeight: 1.18 }}>
              Legal Guidance in Minutes
            </h2>
            <p style={{ fontSize: 15, color: 'var(--color-app-text-muted)', lineHeight: 1.6 }}>
              No legal jargon. No endless searching. Just clear, actionable steps.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', border: '1px solid var(--color-app-border)', borderRadius: 8, overflow: 'hidden' }}>
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                data-reveal
                data-d={String(i + 1)}
                style={{
                  padding: '32px 28px',
                  background: 'var(--color-app-surface)',
                  borderRight: i < STEPS.length - 1 ? '1px solid var(--color-app-border)' : 'none',
                  position: 'relative',
                }}
              >
                <div style={{ position: 'absolute', top: 20, right: 20, fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--color-app-border-strong)', letterSpacing: '0.06em' }}>
                  {step.num}
                </div>
                <div style={{ width: 38, height: 38, borderRadius: 8, background: 'var(--color-app-accent-light)', color: 'var(--color-app-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>
                  {step.icon}
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-app-text)', marginBottom: 9, letterSpacing: '-0.01em', lineHeight: 1.4 }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--color-app-text-muted)', lineHeight: 1.65 }}>
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ WHY LEGALSATHI ═══════════════════════════════════════════════════ */}
      <section style={{ background: 'var(--color-app-surface)', borderTop: '1px solid var(--color-app-border)', borderBottom: '1px solid var(--color-app-border)', padding: '100px 28px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          <div data-reveal style={{ marginBottom: 64 }}>
            <h2 style={{ fontFamily: 'var(--font-display), Georgia, serif', fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 600, letterSpacing: '-0.025em', color: 'var(--color-app-text)', marginBottom: 16, lineHeight: 1.18 }}>
              ChatGPT says &ldquo;consult a lawyer.&rdquo;<br />Google returns a 2019 blog post.
            </h2>
            <p style={{ fontSize: 15, color: 'var(--color-app-text-muted)', lineHeight: 1.7, maxWidth: 580 }}>
              Neither knows which counter at Bagmati Province Transport Office handles your case. Neither knows the fee changed last year, or that the clerk will reject your application if you don&apos;t bring a notarized copy — not a photocopy. LegalSathi knows.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 1, background: 'var(--color-app-border)', border: '1px solid var(--color-app-border)', borderRadius: 8, overflow: 'hidden' }}>
            {[
              {
                situation: 'You ask Google how to register a Private Limited Company.',
                problem: 'You get a blog from 2021 with outdated OCR requirements and no mention of the mandatory PAN registration that happens within 3 days.',
                fix: 'LegalSathi gives you the current step-by-step flow: name reservation → MoA/AoA → OCR submission → PAN at IRD — with fees and days for each.',
              },
              {
                situation: 'You ask ChatGPT about renewing your driving licence.',
                problem: 'It tells you to "visit your nearest transport office" and brings up renewal periods that apply to India. It cannot tell you whether to go to Ekantakuna or Minbhawan.',
                fix: 'LegalSathi tells you exactly which office handles your zone, what biometric process to expect, and which documents go in which form.',
              },
              {
                situation: 'You search for how to file a labour complaint.',
                problem: 'You find a general answer about labour law. No mention of the Department of Labour, the complaint form number, the 35-day limitation window, or that you need your appointment letter.',
                fix: 'LegalSathi walks you through the exact filing steps, the limitation period, the documents required, and what to expect at the hearing.',
              },
            ].map((card, i) => (
              <div
                key={i}
                data-reveal
                data-d={String(i + 1)}
                style={{ padding: '32px 28px', background: 'var(--color-app-surface)' }}
              >
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-app-text)', marginBottom: 12, lineHeight: 1.5 }}>
                  {card.situation}
                </p>
                <p style={{ fontSize: 13, color: 'var(--color-app-text-muted)', lineHeight: 1.65, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--color-app-border)' }}>
                  {card.problem}
                </p>
                <p style={{ fontSize: 13, color: 'var(--color-app-accent)', lineHeight: 1.65, fontWeight: 500, margin: 0 }}>
                  {card.fix}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ══ STATS ════════════════════════════════════════════════════════════ */}
      <section style={{ background: '#131D30', padding: '80px 28px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40 }}>
          {[
            { to: 10000, suffix: '+', label: 'Questions Answered' },
            { to: 500,   suffix: '+', label: 'Legal Processes Covered' },
            { to: 100,   suffix: '+', label: 'Government Procedures Simplified' },
            { to: 24,    suffix: '/7', label: 'AI Assistance' },
          ].map((s, i) => (
            <div key={s.label} data-reveal data-d={String(i + 1)} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display), Georgia, serif', fontSize: 'clamp(36px, 4.5vw, 52px)', fontWeight: 600, color: '#F0EDE6', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 10 }}>
                <CountUp to={s.to} suffix={s.suffix} />
              </div>
              <div style={{ fontSize: 13, color: 'rgba(240,237,230,0.42)', letterSpacing: '0.02em' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

     

      {/* ══ TESTIMONIALS ═════════════════════════════════════════════════════ */}
      <section id="testimonials" style={{ padding: '100px 28px', background: 'var(--color-app-surface)', borderTop: '1px solid var(--color-app-border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div data-reveal style={{ marginBottom: 56 }}>
            <h2 style={{ fontFamily: 'var(--font-display), Georgia, serif', fontSize: 'clamp(26px, 3.2vw, 38px)', fontWeight: 600, letterSpacing: '-0.022em', color: 'var(--color-app-text)', marginBottom: 10, lineHeight: 1.2 }}>
              People across Nepal trust LegalSathi
            </h2>
            <p style={{ fontSize: 15, color: 'var(--color-app-text-muted)' }}>
              From first-time entrepreneurs to students navigating everyday legal challenges.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                data-reveal
                data-d={String(i + 1)}
                style={{ padding: '28px', background: 'var(--color-app-bg)', border: '1px solid var(--color-app-border)', borderRadius: 8 }}
              >
                <div style={{ display: 'flex', gap: 2, color: '#d97706', marginBottom: 18 }}>
                  {[...Array(5)].map((_, si) => <IconStar key={si} />)}
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--color-app-text)', marginBottom: 24 }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 20, borderTop: '1px solid var(--color-app-border)' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 5, background: 'var(--color-app-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#1E2E4F', flexShrink: 0 }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-app-text)' }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-app-text-subtle)' }}>{t.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ════════════════════════════════════════════════════════ */}
      <section style={{ background: '#131D30', padding: '100px 28px', textAlign: 'center' }}>
        <div data-reveal style={{ maxWidth: 540, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-display), Georgia, serif', fontSize: 'clamp(30px, 4vw, 44px)', fontWeight: 600, letterSpacing: '-0.025em', color: '#F0EDE6', marginBottom: 18, lineHeight: 1.15 }}>
            Stop Guessing. Start Understanding Your Legal Rights.
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: 'rgba(240,237,230,0.52)', marginBottom: 40 }}>
            Whether you&apos;re starting a business, registering a vehicle, filing taxes, or handling paperwork — LegalSathi AI helps you move forward with confidence.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
            <Link href="/chat" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 500, color: '#131D30', background: '#F0EDE6', padding: '13px 30px', borderRadius: 7, textDecoration: 'none' }}>
              Get Started Free <IconArrow />
            </Link>
            <a href="#how-it-works" style={{ fontSize: 14, fontWeight: 500, color: 'rgba(238,233,223,0.65)', padding: '13px 28px', borderRadius: 7, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.13)' }}>
              See How It Works
            </a>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(238,233,223,0.26)' }}>Free to use · No sign-up required</p>
        </div>
      </section>

      {/* ══ FOOTER ═══════════════════════════════════════════════════════════ */}
      <footer style={{ background: '#0E1623', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '52px 28px 36px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 32, marginBottom: 48 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 24, height: 24, borderRadius: 4, background: '#EEE9DF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#0E1623', fontFamily: 'var(--font-mono)' }}>LS</span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#EEE9DF', fontFamily: 'var(--font-display)' }}>LegalSathi</span>
              </div>
              <p style={{ fontSize: 12, color: 'rgba(238,233,223,0.32)', lineHeight: 1.6, maxWidth: 180 }}>Simplifying law for everyone in Nepal.</p>
            </div>
            {[
              { heading: 'Product', links: ['Features', 'Pricing', 'Legal Resources'] },
              { heading: 'Legal', links: ['Privacy Policy', 'Terms of Service'] },
              { heading: 'Contact', links: ['hello@legalsathi.ai'] },
            ].map((col) => (
              <div key={col.heading}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(238,233,223,0.35)', marginBottom: 14, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{col.heading}</div>
                {col.links.map((l) => (
                  <div key={l} style={{ marginBottom: 9 }}>
                    <a style={{ fontSize: 13, color: 'rgba(238,233,223,0.45)', textDecoration: 'none' }}>{l}</a>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ fontSize: 12, color: 'rgba(238,233,223,0.25)' }}>© 2026 LegalSathi AI. Simplifying Law for Everyone in Nepal.</span>
            <span style={{ fontSize: 12, color: 'rgba(238,233,223,0.25)' }}>Made in Nepal 🇳🇵</span>
          </div>
        </div>
      </footer>

    </div>
  )
}
