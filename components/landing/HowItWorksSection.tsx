'use client'

import { motion } from 'framer-motion'
import { MessageSquare, Cpu, ListChecks } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { SectionHead } from './SectionHead'
import { fadeUp, stagger, inView, C } from './constants'

interface Step { n: string; icon: LucideIcon; title: string; desc: string }

const steps: Step[] = [
  { n: '01', icon: MessageSquare, title: 'Ask your question',          desc: 'Type your legal question in plain English — no legal jargon required.' },
  { n: '02', icon: Cpu,           title: 'AI analyzes legal context',  desc: 'Our AI searches Nepali laws, acts, and procedures to find the right answer.' },
  { n: '03', icon: ListChecks,    title: 'Get structured guidance',    desc: 'Receive step-by-step guidance, required documents, and risk warnings.' },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" style={{ padding: '88px 24px', background: C.gradientHero }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <SectionHead eyebrow="Core Logic" heading="How It Works" light />
        <motion.div variants={stagger} {...inView()} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {steps.map(({ n, icon: Icon, title, desc }, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              style={{ padding: '36px 28px', background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: C.blue400, letterSpacing: '0.08em' }}>{n}</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: 'rgba(37,99,235,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} style={{ color: C.blue300 }} />
                </div>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f1f5f9', marginBottom: '10px' }}>{title}</h3>
              <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.7 }}>{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
