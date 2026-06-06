'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, FileText } from 'lucide-react'
import { RiSparklingLine } from 'react-icons/ri'
import { C, EASE } from './constants'

const trustItems = ['Free to Use', 'Claude AI Powered', "Nepal's Legal Database", 'Plain English']

const steps = [
  '1. Choose your structure — Private Ltd, Partnership, or Sole Proprietorship',
  '2. Reserve company name at the Office of Company Registrar (OCR)',
  '3. Submit incorporation documents',
  '4. Register for PAN/VAT at Inland Revenue',
]

export function HeroSection() {
  return (
    <section style={{ position: 'relative', overflow: 'hidden', padding: '100px 24px 96px', background: '#fafbff', textAlign: 'center' }}>
      {/* Subtle radial glow */}
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '900px', height: '600px', background: 'radial-gradient(ellipse 70% 70% at 50% 0%, rgba(37,99,235,0.06) 0%, transparent 65%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', maxWidth: '900px', margin: '0 auto' }}>
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 14px', borderRadius: '100px', border: '1px solid rgba(37,99,235,0.2)', background: 'rgba(37,99,235,0.05)', color: C.primary, fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginBottom: '28px' }}
        >
          <RiSparklingLine size={12} />
          Powered by Claude AI · Built for Nepal
        </motion.div>

        {/* Headline — editorial */}
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.1, ease: EASE }}
          style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)', fontWeight: 800, color: '#0a0f1e', letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: '22px' }}
        >
          Legal. Clarity.<br />
          For every Nepali.
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.22 }}
          style={{ fontSize: '18px', color: '#64748b', lineHeight: 1.75, maxWidth: '500px', margin: '0 auto 36px' }}
        >
          Ask anything. Get step-by-step legal guidance, document checklists, and plain-English explanations — instantly.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.32 }}
          style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '28px' }}
        >
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/chat"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '15px 32px', background: '#0a0f1e', color: '#fff', textDecoration: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 700, boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}
            >
              Try Demo <ArrowRight size={16} />
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <a
              href="#features"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '15px 32px', background: '#fff', color: '#0a0f1e', textDecoration: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 600, border: '1.5px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}
            >
              <FileText size={16} /> Learn More
            </a>
          </motion.div>
        </motion.div>

        {/* Trust bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.44 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', marginBottom: '64px' }}
        >
          {trustItems.map((t, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#94a3b8', fontWeight: 500 }}>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#cbd5e1', display: 'inline-block', flexShrink: 0 }} />
              {t}
            </span>
          ))}
        </motion.div>

        {/* Chat UI mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.52, ease: EASE }}
          style={{ maxWidth: '640px', margin: '0 auto', background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 24px 64px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)', overflow: 'hidden', textAlign: 'left' }}
        >
          {/* Window chrome */}
          <div style={{ padding: '13px 18px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '7px', background: '#fafafa' }}>
            {(['#fca5a5', '#fcd34d', '#86efac'] as const).map((c, i) => (
              <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c }} />
            ))}
            <div style={{ marginLeft: '10px', flex: 1, height: '24px', borderRadius: '5px', background: '#f1f5f9', display: 'flex', alignItems: 'center', padding: '0 12px' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>LegalSathi AI — Legal Assistant</span>
            </div>
          </div>

          {/* Conversation */}
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* User bubble */}
            <div style={{ alignSelf: 'flex-end', maxWidth: '72%', padding: '10px 16px', background: '#0a0f1e', color: '#fff', borderRadius: '14px 14px 4px 14px', fontSize: '14px', lineHeight: 1.5 }}>
              How do I register a business in Nepal?
            </div>
            {/* AI response */}
            <div style={{ alignSelf: 'flex-start', maxWidth: '84%', padding: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px 14px 14px 14px' }}>
              <div style={{ fontWeight: 700, marginBottom: '8px', fontSize: '14px', color: '#0f172a' }}>To register a business in Nepal:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {steps.map((s, i) => (
                  <div key={i} style={{ fontSize: '13px', color: '#475569', lineHeight: 1.55 }}>{s}</div>
                ))}
              </div>
              <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', background: C.primaryTint, borderRadius: '6px', fontSize: '12px', color: C.primary, fontWeight: 600 }}>📋 4 documents required</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', background: '#f0fdf4', borderRadius: '6px', fontSize: '12px', color: '#059669', fontWeight: 600 }}>⏱ Est. 7–14 days</span>
              </div>
            </div>
          </div>

          {/* Input bar */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '10px', alignItems: 'center', background: '#fafafa' }}>
            <div style={{ flex: 1, height: '36px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', padding: '0 12px' }}>
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>Ask your legal question…</span>
            </div>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#0a0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowRight size={14} color="#fff" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
