import Link from 'next/link'
import type { ReactNode } from 'react'
import { DOMAINS } from '@/lib/domains'
import { DomainIcons } from '@/lib/domain-icons'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-layout">

      {/* ── Left branding panel ── (lg+) */}
      <div className="listing-diagonal-grid-dark auth-panel-left hidden lg:flex lg:flex-col lg:justify-between">

        {/* Logo */}
        <Link href="/" className="auth-panel-logo">
          <div className="auth-panel-logo-mark">
            <span className="auth-panel-logo-mark-text">LS</span>
          </div>
          <span className="auth-panel-logo-wordmark">LegalSathi</span>
        </Link>

        {/* Middle content */}
        <div className="auth-panel-content">

          {/* Status badge */}
          <div className="auth-panel-badge">
            <span className="pulse-dot auth-panel-badge-dot" />
            <span className="auth-panel-badge-text">Available 24/7 · Always free</span>
          </div>

          <h1 className="auth-panel-heading">
            Nepal&apos;s AI Legal<br />Assistant for Every<br />Legal Journey
          </h1>

          {/* Domain cards grid */}
          <div className="auth-domain-grid">
            {DOMAINS.filter(d => d.slug !== 'general').map((domain) => {
              const Icon = DomainIcons[domain.slug]
              return (
                <Link key={domain.slug} href={`/chat?domain=${domain.slug}`} className="auth-domain-card">
                  {Icon && <span className="auth-domain-card-icon"><Icon /></span>}
                  <span className="auth-domain-card-label">{domain.label}</span>
                </Link>
              )
            })}
            {DOMAINS.filter(d => d.slug === 'general').map((domain) => {
              const Icon = DomainIcons[domain.slug]
              return (
                <Link key={domain.slug} href={`/chat?domain=${domain.slug}`} className="auth-domain-card auth-domain-card-wide">
                  {Icon && <span className="auth-domain-card-icon">{<Icon />}</span>}
                  <span className="auth-domain-card-label">{domain.label}</span>
                  <span className="auth-domain-card-all">All topics →</span>
                </Link>
              )
            })}
          </div>

          {/* Testimonial */}
          <div className="auth-testimonial">
            <div className="auth-testimonial-stars">
              {[...Array(5)].map((_, i) => (
                <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>
            <p className="auth-testimonial-quote">
              &ldquo;LegalSathi explained the entire business registration process clearly. I finally understood every step without visiting a single office.&rdquo;
            </p>
            <div className="auth-testimonial-author">
              <div className="auth-testimonial-avatar">F</div>
              <div>
                <div className="auth-testimonial-name">Founder</div>
                <div className="auth-testimonial-location">Kathmandu</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="auth-panel-right flex-1 flex flex-col items-center justify-center">

        {/* Mobile logo */}
        <Link href="/" className="auth-mobile-logo flex lg:hidden items-center">
          <div className="auth-mobile-logo-mark">
            <span className="auth-mobile-logo-mark-text">LS</span>
          </div>
          <span className="auth-mobile-logo-wordmark">LegalSathi</span>
        </Link>

        <div className="auth-form-wrapper">
          {children}
        </div>

        <Link href="/" className="auth-back-link">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back to home
        </Link>
      </div>

    </div>
  )
}
