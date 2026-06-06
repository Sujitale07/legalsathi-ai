'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ClipboardList, ListOrdered, FileStack, AlertTriangle, ArrowRight, Send } from 'lucide-react'
import { SectionHead } from './SectionHead'
import { DashedGrid } from './DashedGrid'
import { fadeUp, staggerFast, inView, C, samplePrompts } from './constants'

const responseTags = [
  { icon: ClipboardList, label: 'Summary' },
  { icon: ListOrdered,   label: 'Step-by-step' },
  { icon: FileStack,     label: 'Documents needed' },
  { icon: AlertTriangle, label: 'Common mistakes' },
]

export function DemoSection() {
  const [demoInput, setDemoInput] = useState('')
  const [prompted, setPrompted]   = useState(false)

  return (
    <section id="demo" className="relative" style={{ padding: '88px 24px', background: '#f8fafc' }}>
      <DashedGrid />
      <div className="relative z-10" style={{ maxWidth: '720px', margin: '0 auto' }}>
        <SectionHead
          eyebrow="Live Demo"
          heading="Try it yourself"
          sub="Click a sample question and see the kind of structured guidance LegalSathi provides."
        />

        {/* Sample prompts */}
        <motion.div variants={staggerFast} {...inView()} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginBottom: '24px' }}>
          {samplePrompts.map((p, i) => (
            <motion.button
              key={i}
              variants={fadeUp}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setDemoInput(p); setPrompted(true) }}
              style={{
                padding: '10px 18px', borderRadius: '100px', cursor: 'pointer',
                border: demoInput === p ? `1.5px solid ${C.primary}` : '1.5px solid #e2e8f0',
                background: demoInput === p ? C.primaryTint : '#fff',
                color: demoInput === p ? C.primaryDark : '#475569',
                fontSize: '13px', fontWeight: 500,
              }}
            >
              {p}
            </motion.button>
          ))}
        </motion.div>

        {/* Chat box */}
        <motion.div
          variants={fadeUp}
          {...inView()}
          style={{ background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 8px 32px rgba(0,0,0,0.07)', overflow: 'hidden' }}
        >
          {/* Response preview */}
          {prompted && demoInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              style={{ padding: '24px', borderBottom: '1px solid #f1f5f9' }}
            >
              {/* User bubble */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                <div style={{ maxWidth: '70%', background: C.primary, color: '#fff', borderRadius: '16px 16px 4px 16px', padding: '12px 16px', fontSize: '14px', lineHeight: 1.6 }}>
                  {demoInput}
                </div>
              </div>
              {/* AI response */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: C.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '-0.5px' }}>LS</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: C.primary, marginBottom: '10px', letterSpacing: '0.06em' }}>LEGALSATHI</div>
                  <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.7, marginBottom: '16px' }}>
                    Here's a structured breakdown to guide you through this legal process in Nepal:
                  </p>
                  <motion.div variants={staggerFast} initial="hidden" animate="visible" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {responseTags.map(({ icon: Icon, label }, j) => (
                      <motion.div
                        key={j}
                        variants={fadeUp}
                        style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '11px 14px', fontSize: '13px', color: '#374151', fontWeight: 500, display: 'flex', gap: '8px', alignItems: 'center' }}
                      >
                        <Icon size={14} style={{ color: C.primary, flexShrink: 0 }} />
                        {label}
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Input row */}
          <div style={{ padding: '16px', display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
            <textarea
              value={demoInput}
              onChange={(e) => { setDemoInput(e.target.value); setPrompted(false) }}
              placeholder="Ask your legal question…"
              rows={2}
              style={{ flex: 1, border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', color: '#0f172a', outline: 'none', resize: 'none', fontFamily: 'inherit', lineHeight: 1.55, background: '#fff' }}
            />
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/chat"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '13px 18px', background: C.primary, color: '#fff', textDecoration: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 600, lineHeight: 1 }}
              >
                <Send size={14} /> Ask
              </Link>
            </motion.div>
          </div>
          <p style={{ textAlign: 'center', fontSize: '12px', color: '#94a3b8', paddingBottom: '14px' }}>
            AI responses are for informational purposes only, not professional legal advice.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
