'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, FileText } from 'lucide-react'
import { RiSparklingLine } from 'react-icons/ri'
import { C, EASE } from './constants'

const trustItems = ['Free to Use', 'Claude AI Powered', "Nepal's Legal Database", 'Plain English']

const steps = [
  '1. Choose your structure — Private Ltd, Partnership, or Sole Proprietorship',
  '2. Reserve company name at the Office of Company Registrar (OCR)',
  '3. Submit incorporation documents',
  '4. Register for PAN/VAT at Inland Revenue',
]

const trafficLightClasses = ['bg-red-300', 'bg-yellow-300', 'bg-green-300'] as const

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-[100px] px-6 pb-24 bg-[#fafbff] text-center">
      {/* Subtle radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-[radial-gradient(ellipse_70%_70%_at_50%_0%,rgba(37,99,235,0.06)_0%,transparent_65%)] pointer-events-none" />

      <div className="relative max-w-[900px] mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-1.5 px-3.5 py-[5px] rounded-full border border-blue-600/20 bg-blue-600/5 text-[#2563eb] text-xs font-bold tracking-[0.06em] uppercase mb-7"
        >
          <RiSparklingLine size={12} />
          Powered by Claude AI · Built for Nepal
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.1, ease: EASE }}
          className="text-[clamp(3rem,8vw,5.5rem)] font-extrabold text-[#0a0f1e] tracking-[-0.04em] leading-[1.05] mb-[22px]"
        >
          Legal. Clarity.<br />
          For every Nepali.
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.22 }}
          className="text-lg text-slate-500 leading-7 max-w-[500px] mx-auto mb-9"
        >
          Ask anything. Get step-by-step legal guidance, document checklists, and plain-English explanations — instantly.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.32 }}
          className="flex gap-3 justify-center flex-wrap mb-7"
        >
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-8 py-[15px] bg-[#0a0f1e] text-white no-underline rounded-xl text-base font-bold shadow-[0_4px_16px_rgba(0,0,0,0.15)]"
            >
              Try Demo <ArrowRight size={16} />
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <a
              href="#features"
              className="inline-flex items-center gap-2 px-8 py-[15px] bg-white text-[#0a0f1e] no-underline rounded-xl text-base font-semibold border-[1.5px] border-slate-200 shadow-[0_2px_6px_rgba(0,0,0,0.04)]"
            >
              <FileText size={16} /> Learn More
            </a>
          </motion.div>
        </motion.div>

        {/* Trust bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.44 }}
          className="flex items-center justify-center gap-5 flex-wrap mb-16"
        >
          {trustItems.map((t, i) => (
            <span key={i} className="flex items-center gap-1.5 text-[13px] text-slate-400 font-medium">
              <span className="w-1 h-1 rounded-full bg-slate-300 inline-block shrink-0" />
              {t}
            </span>
          ))}
        </motion.div>

        {/* Chat UI mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.52, ease: EASE }}
          className="max-w-[640px] mx-auto bg-white rounded-[20px] border border-slate-200 shadow-[0_24px_64px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.04)] overflow-hidden text-left"
        >
          {/* Window chrome */}
          <div className="px-[18px] py-[13px] border-b border-slate-100 flex items-center gap-[7px] bg-[#fafafa]">
            {trafficLightClasses.map((cls, i) => (
              <div key={i} className={`w-2.5 h-2.5 rounded-full ${cls}`} />
            ))}
            <div className="ml-2.5 flex-1 h-6 rounded-[5px] bg-slate-100 flex items-center px-3">
              <span className="text-[11px] text-slate-400">LegalSathi AI — Legal Assistant</span>
            </div>
          </div>

          {/* Conversation */}
          <div className="p-5 flex flex-col gap-[14px]">
            {/* User bubble */}
            <div className="self-end max-w-[72%] px-4 py-2.5 bg-[#0a0f1e] text-white rounded-[14px_14px_4px_14px] text-sm leading-[1.5]">
              How do I register a business in Nepal?
            </div>
            {/* AI response */}
            <div className="self-start max-w-[84%] p-4 bg-slate-50 border border-slate-200 rounded-[4px_14px_14px_14px]">
              <div className="font-bold mb-2 text-sm text-slate-900">To register a business in Nepal:</div>
              <div className="flex flex-col gap-1">
                {steps.map((s, i) => (
                  <div key={i} className="text-[13px] text-slate-600 leading-[1.55]">{s}</div>
                ))}
              </div>
              <div className="mt-3 flex gap-2 flex-wrap">
                <span className="inline-flex items-center gap-[5px] px-2.5 py-1 bg-[#eff6ff] rounded-md text-xs text-[#2563eb] font-semibold">📋 4 documents required</span>
                <span className="inline-flex items-center gap-[5px] px-2.5 py-1 bg-[#f0fdf4] rounded-md text-xs text-emerald-600 font-semibold">⏱ Est. 7–14 days</span>
              </div>
            </div>
          </div>

          {/* Input bar */}
          <div className="px-4 py-3 border-t border-slate-100 flex gap-2.5 items-center bg-[#fafafa]">
            <div className="flex-1 h-9 rounded-lg bg-slate-100 flex items-center px-3">
              <span className="text-[13px] text-slate-400">Ask your legal question…</span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-[#0a0f1e] flex items-center justify-center">
              <ArrowRight size={14} color="#fff" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
