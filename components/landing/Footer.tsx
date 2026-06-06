import { Scale } from 'lucide-react'
import { RiGithubLine, RiCodeSSlashLine } from 'react-icons/ri'
import { C } from './constants'

export function Footer() {
  return (
    <footer style={{ padding: '40px 24px', background: '#080f1e', textAlign: 'center' }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '14px' }}>
        <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: C.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Scale size={14} strokeWidth={2.5} />
        </div>
        <span style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.2px' }}>LegalSathi AI</span>
      </div>

      {/* Meta */}
      <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '10px' }}>
        Team Symentix · Hackathon Edition · June 2026
      </p>

      {/* Tech stack pills */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {['Next.js', 'Claude AI', 'PostgreSQL', 'Framer Motion'].map((t) => (
          <span
            key={t}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '100px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', fontSize: '12px', color: '#64748b' }}
          >
            <RiCodeSSlashLine size={11} />
            {t}
          </span>
        ))}
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '100px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', fontSize: '12px', color: '#64748b', textDecoration: 'none' }}
        >
          <RiGithubLine size={12} /> GitHub
        </a>
      </div>
    </footer>
  )
}
