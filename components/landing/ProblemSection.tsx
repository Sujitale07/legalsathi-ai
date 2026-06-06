'use client'

import { motion } from 'framer-motion'
import { Languages, Building2, FileX, Banknote } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { SectionHead } from './SectionHead'
import { DashedGrid } from './DashedGrid'
import { fadeUp, stagger, inView, C } from './constants'

interface ProblemCard { icon: LucideIcon; title: string; desc: string }

const cards: ProblemCard[] = [
  { icon: Languages, title: 'Confusing legal language',  desc: 'Citizens cannot understand laws written in complex legal jargon.' },
  { icon: Building2, title: 'Multiple office visits',    desc: 'Confusion leads to repeated trips due to missing or wrong documents.' },
  { icon: FileX,     title: 'Missing documents',          desc: 'One missing paper can delay a process by weeks or months.' },
  { icon: Banknote,  title: 'Expensive legal help',       desc: 'Quality legal advice costs NPR 2,000–20,000 per session — inaccessible to most.' },
]

export function ProblemSection() {
  return (
    <section className="relative" style={{ padding: '88px 24px', background: '#f8fafc' }}>
      <DashedGrid />
      <div className="relative z-10" style={{ maxWidth: '1120px', margin: '0 auto' }}>
        <SectionHead
          eyebrow="The Problem"
          heading="Legal systems fail not because laws are complex"
          sub="— but because they are not explained clearly."
        />
        <motion.div variants={stagger} {...inView()} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          {cards.map(({ icon: Icon, title, desc }, i) => (
            <motion.div key={i} variants={fadeUp} style={{ padding: '28px', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '11px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Icon size={20} style={{ color: '#ef4444' }} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>{title}</h3>
              <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.65 }}>{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
