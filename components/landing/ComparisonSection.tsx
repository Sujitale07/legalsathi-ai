'use client'

import { motion } from 'framer-motion'
import { X, Check } from 'lucide-react'
import { SectionHead } from './SectionHead'
import { DashedGrid } from './DashedGrid'
import { fadeIn, inView, C, comparisons } from './constants'

export function ComparisonSection() {
  return (
    <section className="relative" style={{ padding: '88px 24px', background: '#fff' }}>
      <DashedGrid />
      <div className="relative z-10" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <SectionHead eyebrow="Differentiation" heading="Not just another chatbot" />
        <motion.div variants={fadeIn} {...inView()} style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#080f1e' }}>
            <div style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Traditional Search
            </div>
            <div style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, color: C.blue400, textTransform: 'uppercase', letterSpacing: '0.08em', borderLeft: '1px solid rgba(255,255,255,0.08)' }}>
              LegalSathi AI
            </div>
          </div>
          {/* Rows */}
          {comparisons.map((row, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: i % 2 === 0 ? '#fff' : '#f8fafc', borderTop: '1px solid #f1f5f9' }}
            >
              <div style={{ padding: '16px 24px', fontSize: '14px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <X size={14} style={{ color: '#ef4444', flexShrink: 0 }} />
                {row.before}
              </div>
              <div style={{ padding: '16px 24px', fontSize: '14px', color: '#1e293b', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '10px', borderLeft: '1px solid #f1f5f9' }}>
                <Check size={14} style={{ color: '#10b981', flexShrink: 0 }} />
                {row.after}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
