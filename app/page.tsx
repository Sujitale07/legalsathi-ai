'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
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
        background: 'rgba(19,29,48,0.96)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 28px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 28, height: 28, borderRadius: 5, background: '#EEE9DF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#131D30', fontFamily: 'var(--font-mono)' }}>LS</span>
            </div>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#EEE9DF', letterSpacing: '-0.01em', fontFamily: 'var(--font-display)' }}>LegalSathi</span>
          </div>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            {[['#how-it-works', 'How it works'], ['#testimonials', 'Reviews']].map(([href, label]) => (
              <a key={href} href={href} style={{ fontSize: 13, color: 'rgba(238,233,223,0.6)', textDecoration: 'none' }}>{label}</a>
            ))}
            <Link href="/chat" style={{ fontSize: 13, fontWeight: 500, color: '#131D30', background: '#EEE9DF', padding: '7px 18px', borderRadius: 6, textDecoration: 'none' }}>
              Try Free
            </Link>
          </nav>
        </div>
      </header>

      {/* ══ HERO ═════════════════════════════════════════════════════════════ */}
      <section style={{ background: '#131D30', padding: '80px 28px 72px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center' }}>

          {/* Left: copy */}
          <div>
            <div className="hero-1" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '5px 14px', marginBottom: 28 }}>
              <span className="pulse-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block', flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: 'rgba(238,233,223,0.6)', letterSpacing: '0.01em' }}>Trained on Nepali law · Available 24/7</span>
            </div>

            <h1 className="hero-2" style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: 'clamp(36px, 4.2vw, 54px)',
              fontWeight: 600,
              lineHeight: 1.1,
              color: '#F0EDE6',
              letterSpacing: '-0.028em',
              marginBottom: 20,
            }}>
              Nepal&apos;s AI Legal Assistant for Every Legal Journey
            </h1>

            <p className="hero-3" style={{ fontSize: 16, lineHeight: 1.72, color: 'rgba(238,233,223,0.55)', marginBottom: 36, maxWidth: 420 }}>
              Ask any legal question in Nepali or English. Get a step-by-step roadmap — what to do, where to go, which documents to bring, and what it costs.
            </p>

            <div className="hero-4" style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              <Link href="/chat" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 500, color: '#131D30', background: '#F0EDE6', padding: '12px 24px', borderRadius: 7, textDecoration: 'none' }}>
                Try LegalSathi AI Free <IconArrow />
              </Link>
              <a href="#how-it-works" style={{ fontSize: 14, fontWeight: 500, color: 'rgba(238,233,223,0.7)', padding: '12px 24px', borderRadius: 7, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.13)' }}>
                See How It Works
              </a>
            </div>

            <p className="hero-5" style={{ fontSize: 12, color: 'rgba(238,233,223,0.28)' }}>
              Free to use · No sign-up required · Works in Nepali &amp; English
            </p>
          </div>

          {/* Right: app mockup */}
          <div className="hero-5" style={{ background: '#FAF8F4', borderRadius: 10, overflow: 'hidden', boxShadow: '0 32px 64px rgba(0,0,0,0.45), 0 4px 16px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {/* Window chrome */}
            <div style={{ padding: '10px 14px', background: '#F3EFE8', borderBottom: '1px solid #E2D9CF', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#EDBBBB', display: 'inline-block' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#EDD9BB', display: 'inline-block' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#C8EDBB', display: 'inline-block' }} />
              <span style={{ flex: 1, background: '#EAE4DC', borderRadius: 4, height: 18, marginLeft: 8, display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
                <span style={{ fontSize: 10, color: '#9A8E84' }}>legalsathi.ai</span>
              </span>
            </div>

            {/* App content: domain picker */}
            <div style={{ padding: '28px 24px 24px' }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: 5, background: '#1E2E4F', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#EEE9DF', fontFamily: 'var(--font-mono)' }}>LS</span>
                </div>
                <p style={{ fontSize: 12, color: '#5C5349', marginBottom: 0 }}>Select a legal domain to begin</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {DOMAINS.map((d) => (
                  <div
                    key={d.slug}
                    style={{
                      padding: '9px 11px',
                      background: '#FFFFFF',
                      border: '1px solid #E2D9CF',
                      borderRadius: 4,
                      gridColumn: d.slug === 'general' ? '1 / -1' : undefined,
                    }}
                  >
                    <div style={{ fontSize: 15, marginBottom: 3 }}>{d.icon}</div>
                    <div style={{ fontSize: 10.5, fontWeight: 600, color: '#1A1A2E', marginBottom: 2 }}>{d.label}</div>
                    <div style={{ fontSize: 9.5, color: '#9A8E84', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {d.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ══ DOMAIN PREVIEW ═══════════════════════════════════════════════════ */}
      <section style={{ background: 'var(--color-app-bg)', padding: '72px 28px 80px', borderBottom: '1px solid var(--color-app-border)' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div data-reveal style={{ textAlign: 'center', marginBottom: 32 }}>
            <div className="w-12 h-12 rounded-sm flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#1E2E4F' }}>
              <span className="text-[13px] font-bold font-mono" style={{ color: '#EEE9DF' }}>LS</span>
            </div>
            <p className="text-[14px] text-app-text-muted max-w-sm mx-auto">
              Select a legal domain to begin. Your session will be strictly locked to that topic.
            </p>
          </div>

          {/* Domain grid — exact markup + styles from chat app */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {DOMAINS.map((domain, i) => (
              <Link
                key={domain.slug}
                href={`/chat?domain=${domain.slug}`}
                data-reveal
                data-d={String(Math.min(i + 1, 7))}
                className={`domain-card text-left px-5 py-4 border border-app-border bg-app-surface rounded-sm cursor-pointer group no-underline ${
                  domain.slug === 'general' ? 'col-span-2 sm:col-span-3' : ''
                }`}
              >
                <div className="text-[22px] mb-2">{domain.icon}</div>
                <div className="text-[13px] font-semibold text-app-text group-hover:text-app-accent font-display mb-1">
                  {domain.label}
                </div>
                <div className="text-[11.5px] text-app-text-subtle leading-relaxed">
                  {domain.description}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══ MARQUEE ══════════════════════════════════════════════════════════ */}
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
