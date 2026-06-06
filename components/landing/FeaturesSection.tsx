'use client'

import { motion } from 'framer-motion'
import { ListOrdered, Scale, ClipboardCheck, ShieldAlert, UserCheck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { SectionHead } from './SectionHead'
import { DashedGrid } from './DashedGrid'
import { fadeUp, stagger, inView, C } from './constants'

interface FeatureCard { icon: LucideIcon; title: string; desc: string }

const cards: FeatureCard[] = [
  { icon: ListOrdered,   title: 'Step-by-step legal guidance', desc: 'Clear procedures for any legal process, broken down into actionable steps.' },
  { icon: Scale,         title: 'Rights explanation',          desc: 'Know your rights as a citizen, tenant, employee, or business owner.' },
  { icon: ClipboardCheck,title: 'Document checklist',          desc: 'Never miss a required document again with our AI-generated checklists.' },
  { icon: ShieldAlert,   title: 'Mistake prevention',          desc: 'AI flags common errors before they cost you time, money, or your case.' },
  { icon: UserCheck,     title: 'Lawyer recommendations',      desc: 'Get referred to the right specialist when your case needs professional help.' },
]

export function FeaturesSection() {
  return (
    <section style={{ padding: '88px 24px', background: '#fff' }} className="relative">
      <DashedGrid />
      <div className="relative z-10" style={{ maxWidth: '1120px', margin: '0 auto' }}>
        <SectionHead eyebrow="Features" heading="Everything you need" />
        <motion.div variants={stagger} {...inView()} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {cards.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.07)' }}
              style={{ padding: '26px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #f1f5f9' }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: C.primaryTint, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                <Icon size={18} style={{ color: C.primary }} />
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>{title}</h3>
              <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.65 }}>{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
