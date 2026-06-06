'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Scale, ArrowRight } from 'lucide-react'
import { C } from './constants'

const navLinks = [
  { href: '#features',     label: 'Features' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#demo',         label: 'Demo' },
]

export function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e2e8f0',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: C.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Scale size={16} strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.3px' }}>LegalSathi AI</span>
        </Link>

        {/* Links + CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {navLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              style={{ padding: '8px 14px', fontSize: '14px', color: '#64748b', textDecoration: 'none', fontWeight: 500, borderRadius: '8px' }}
            >
              {label}
            </a>
          ))}
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} style={{ marginLeft: '8px' }}>
            <Link
              href="/chat"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', background: C.primary, color: '#fff', textDecoration: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600 }}
            >
              Try Demo <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.nav>
  )
}
