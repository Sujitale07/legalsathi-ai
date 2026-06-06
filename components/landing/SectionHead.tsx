'use client'

import { motion } from 'framer-motion'
import { C, fadeUp, stagger, inView } from './constants'

interface SectionHeadProps {
  eyebrow: string
  heading: string
  sub?: string
  light?: boolean
  align?: 'center' | 'left'
}

export function SectionHead({ eyebrow, heading, sub, light = false, align = 'center' }: SectionHeadProps) {
  const isLeft = align === 'left'
  return (
    <motion.div variants={stagger} {...inView()} style={{ textAlign: align, marginBottom: '60px' }}>
      <motion.p
        variants={fadeUp}
        style={{ fontSize: '11px', fontWeight: 700, color: light ? C.blue300 : C.primary, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}
      >
        {eyebrow}
      </motion.p>
      <motion.h2
        variants={fadeUp}
        style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 800, color: light ? '#f1f5f9' : '#0a0f1e', letterSpacing: '-0.035em', lineHeight: 1.1, marginBottom: sub ? '14px' : 0 }}
      >
        {heading}
      </motion.h2>
      {sub && (
        <motion.p
          variants={fadeUp}
          style={{ fontSize: '17px', color: light ? '#94a3b8' : '#64748b', maxWidth: isLeft ? '460px' : '520px', margin: isLeft ? '0' : '0 auto', lineHeight: 1.7 }}
        >
          {sub}
        </motion.p>
      )}
    </motion.div>
  )
}
