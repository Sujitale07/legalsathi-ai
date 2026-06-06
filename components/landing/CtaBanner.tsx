'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Rocket } from 'lucide-react'
import { fadeUp, stagger, inView, C } from './constants'

export function CtaBanner() {
  return (
    <section style={{ padding: '72px 24px', background: C.primary, textAlign: 'center' }}>
      <motion.div variants={stagger} {...inView()}>
        <motion.h2
          variants={fadeUp}
          style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: '12px' }}
        >
          Ready to understand your legal rights?
        </motion.h2>
        <motion.p
          variants={fadeUp}
          style={{ fontSize: '17px', color: 'rgba(255,255,255,0.82)', marginBottom: '32px', lineHeight: 1.6 }}
        >
          Ask your first question — free, instant, and in plain English.
        </motion.p>
        <motion.div variants={fadeUp} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} style={{ display: 'inline-block' }}>
          <Link
            href="/chat"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '16px 36px', background: '#fff', color: C.primaryDark, textDecoration: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 700, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
          >
            <Rocket size={18} /> Try LegalSathi Now
          </Link>
        </motion.div>
      </motion.div>
    </section>
  )
}
