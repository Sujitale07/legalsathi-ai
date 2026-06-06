'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { RiUserHeartLine, RiGovernmentLine, RiScalesLine } from 'react-icons/ri'
import type { IconType } from 'react-icons'
import { SectionHead } from './SectionHead'
import { DashedGrid } from './DashedGrid'
import { fadeUp, stagger, inView, C } from './constants'

interface ImpactCol { title: string; icon: IconType; bg: string; iconColor: string; points: string[] }

const cols: ImpactCol[] = [
  {
    title: 'For Citizens',
    icon: RiUserHeartLine,
    bg: C.primaryTint, iconColor: C.primary,
    points: ['Save time and reduce confusion', 'Avoid costly legal mistakes', 'Understand your rights clearly'],
  },
  {
    title: 'For Government',
    icon: RiGovernmentLine,
    bg: '#ecfdf5', iconColor: '#059669',
    points: ['Fewer incorrect submissions', 'Reduced office workload', 'More efficient public service'],
  },
  {
    title: 'For Legal System',
    icon: RiScalesLine,
    bg: '#fef3c7', iconColor: '#d97706',
    points: ['Better access to justice', 'Reduced legal inequality', 'Empowered, informed citizens'],
  },
]

export function ImpactSection() {
  return (
    <section className="relative" style={{ padding: '88px 24px', background: '#f8fafc' }}>
      <DashedGrid />
      <div className="relative z-10" style={{ maxWidth: '960px', margin: '0 auto' }}>
        <SectionHead eyebrow="Impact" heading="Why It Matters" />
        <motion.div variants={stagger} {...inView()} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          {cols.map(({ title, icon: Icon, bg, iconColor, points }, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              style={{ padding: '32px', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Icon size={22} color={iconColor} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '18px' }}>{title}</h3>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {points.map((pt, j) => (
                  <li key={j} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '14px', color: '#475569', lineHeight: 1.55 }}>
                    <Check size={15} style={{ color: C.primary, flexShrink: 0, marginTop: '1px' }} />
                    {pt}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
