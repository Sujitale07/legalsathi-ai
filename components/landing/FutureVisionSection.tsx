'use client'

import { motion } from 'framer-motion'
import { Globe, ScanLine, Store, Mic, Smartphone } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { SectionHead } from './SectionHead'
import { fadeUp, stagger, inView, C } from './constants'

interface FutureItem { icon: LucideIcon; label: string }

const items: FutureItem[] = [
  { icon: Globe,       label: 'Nepali language (Devanagari) support' },
  { icon: ScanLine,    label: 'Document scanning with AI OCR' },
  { icon: Store,       label: 'Lawyer marketplace with verified profiles' },
  { icon: Mic,         label: 'Voice assistant for rural citizens' },
  { icon: Smartphone,  label: 'Mobile app for iOS and Android' },
]

export function FutureVisionSection() {
  return (
    <section style={{ padding: '88px 24px', background: C.gradientHero }}>
      <div style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
        <SectionHead eyebrow="Roadmap" heading="Future Vision" sub="We are just getting started. Here's where LegalSathi is heading." light />
        <motion.div variants={stagger} {...inView()} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {items.map(({ icon: Icon, label }, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              whileHover={{ x: 6, background: 'rgba(255,255,255,0.07)' }}
              style={{ padding: '18px 24px', background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '14px' }}
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: 'rgba(37,99,235,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={17} style={{ color: C.blue300 }} />
              </div>
              <span style={{ fontSize: '15px', color: '#e2e8f0', fontWeight: 500 }}>{label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
