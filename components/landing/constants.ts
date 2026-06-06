import { type Variants } from 'framer-motion'

export const C = {
  primary:     '#2563eb',
  primaryDark: '#1d4ed8',
  primaryTint: '#eff6ff',
  primaryGlow: 'rgba(37,99,235,0.38)',
  blue400:     '#60a5fa',
  blue300:     '#93c5fd',
  darkBg:      '#080f1e',
  gradientHero:'linear-gradient(160deg, #080f1e 0%, #0c1a38 55%, #080f1e 100%)',
  gradientText:'linear-gradient(135deg, #93c5fd 0%, #60a5fa 50%, #3b82f6 100%)',
} as const

export const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
}
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
}
export const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
}
export const staggerFast: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

export function inView(margin = '-80px') {
  return { initial: 'hidden', whileInView: 'visible', viewport: { once: true, margin } } as const
}

export const samplePrompts = [
  'How do I register a business in Nepal?',
  'What are tenant rights in Nepal?',
  'How to apply for citizenship?',
]

export const comparisons = [
  { before: 'Scattered info across sites',       after: 'Structured, step-by-step guidance' },
  { before: "Legal jargon you can't understand", after: 'Plain English explanations' },
  { before: 'No clear next steps',               after: 'Actionable steps with document lists' },
  { before: 'Passive search results',            after: 'Active AI legal assistant' },
]
