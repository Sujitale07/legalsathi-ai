'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Bot, FileSearch, ShieldCheck, Scale, ArrowRight, Check } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { DashedGrid } from './DashedGrid'
import { fadeUp, stagger, inView, EASE, C } from './constants'

interface FeatureItem { icon: LucideIcon; title: string; desc: string }

const features: FeatureItem[] = [
  { icon: Bot,         title: 'AI Legal Chat',      desc: 'Instant answers grounded in Nepali law' },
  { icon: FileSearch,  title: 'Document Guidance',  desc: 'Contracts analyzed in plain English' },
  { icon: ShieldCheck, title: 'Rights Explanation', desc: 'Know your rights as citizen or employee' },
  { icon: Scale,       title: 'Lawyer Connection',  desc: 'Verified lawyers by specialization' },
]

const riskItems = [
  { label: 'Salary clause',       status: 'ok',   note: 'Meets minimum wage requirements' },
  { label: 'Notice period',       status: 'warn', note: '7 days — below standard 30' },
  { label: 'Non-compete clause',  status: 'ok',   note: 'Reasonable duration & scope' },
  { label: 'Termination terms',   status: 'ok',   note: 'Compliant with Labour Act 2074' },
]

export function SolutionSection() {
  return (
    <section id="features" className="relative" style={{ padding: '96px 24px', background: '#fff' }}>
      <DashedGrid />
      <div className="relative z-10" style={{ maxWidth: '1120px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 'clamp(40px, 6vw, 80px)', alignItems: 'center' }}>

        {/* Left: Editorial copy */}
        <motion.div variants={stagger} {...inView()}>
          <motion.p variants={fadeUp} style={{ fontSize: '11px', fontWeight: 700, color: C.primary, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>
            What We Built
          </motion.p>
          <motion.h2
            variants={fadeUp}
            style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', fontWeight: 800, color: '#0a0f1e', letterSpacing: '-0.035em', lineHeight: 1.1, marginBottom: '16px' }}
          >
            AI that works<br />the way you need.
          </motion.h2>
          <motion.p variants={fadeUp} style={{ fontSize: '16px', color: '#64748b', lineHeight: 1.75, marginBottom: '32px', maxWidth: '420px' }}>
            Everything you need to navigate Nepal's legal system — ask questions, review documents, and connect with lawyers.
          </motion.p>

          {/* Feature list */}
          <motion.div variants={stagger} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '36px' }}>
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={i} variants={fadeUp} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: C.primaryTint, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={17} style={{ color: C.primary }} />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>{title}</div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>{desc}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} style={{ display: 'inline-block' }}>
            <Link
              href="/chat"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 26px', background: '#0a0f1e', color: '#fff', textDecoration: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 700, boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}
            >
              Try It Now <ArrowRight size={15} />
            </Link>
          </motion.div>
        </motion.div>

        {/* Right: Document analysis mockup */}
        <motion.div
          initial={{ opacity: 0, x: 32 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.65, ease: EASE }}
        >
          <div style={{ background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 16px 48px rgba(0,0,0,0.06)' }}>
            {/* Card header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Scale size={16} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Legal Analysis</div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Employment Contract · Analyzed</div>
              </div>
              <div style={{ marginLeft: 'auto', padding: '3px 10px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '100px', fontSize: '11px', color: '#059669', fontWeight: 700 }}>LOW RISK</div>
            </div>

            {/* Risk items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {riskItems.map(({ label, status, note }, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 12px', background: '#fff', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '5px', background: status === 'ok' ? '#f0fdf4' : '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                    <Check size={11} color={status === 'ok' ? '#10b981' : '#f59e0b'} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{label}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{note}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recommendation */}
            <div style={{ padding: '12px 14px', background: C.primaryTint, borderRadius: '10px', border: '1px solid rgba(37,99,235,0.12)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: C.primary, marginBottom: '4px' }}>Recommendation</div>
              <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.6 }}>Negotiate the notice period to at least 30 days before signing. All other clauses are compliant with Nepal Labour Act 2074.</div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
