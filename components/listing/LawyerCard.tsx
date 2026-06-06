'use client'

import { MapPin, Briefcase, Star, Phone, Mail } from 'lucide-react'
import type { Lawyer } from './data'

export function LawyerCard({ lawyer }: { lawyer: Lawyer }) {
  const initials = lawyer.name
    .replace('Adv. ', '')
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)

  return (
    <div className={[
      'bg-white rounded-2xl flex flex-col relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5',
      lawyer.featured
        ? 'border-2 border-[#2563eb] shadow-[0_8px_24px_rgba(37,99,235,0.12)]'
        : 'border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300',
    ].join(' ')}>

      {lawyer.featured && (
        <div className="absolute top-4 right-4 px-2.5 py-0.5 bg-[#2563eb] rounded-full text-[9px] font-bold uppercase tracking-widest text-white">
          Featured
        </div>
      )}

      <div className="p-6 flex-1">
        {/* Avatar + name */}
        <div className="flex items-start gap-3 mb-5">
          <div className="w-11 h-11 rounded-xl bg-[#0a0f1e] flex items-center justify-center shrink-0">
            <span className="text-[13px] font-bold font-mono text-white">{initials}</span>
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <div className="text-[14px] font-semibold text-[#0a0f1e] truncate leading-snug mb-1.5">
              {lawyer.name}
            </div>
            <span className="inline-flex px-2.5 py-0.5 bg-[#eff6ff] text-[#2563eb] rounded-full text-[10px] font-semibold">
              {lawyer.specialization}
            </span>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-400 mb-4">
          <span className="flex items-center gap-1"><MapPin size={10} />{lawyer.location}</span>
          <span className="flex items-center gap-1"><Briefcase size={10} />{lawyer.experience}</span>
          <span className="flex items-center gap-1 text-[#0a0f1e] font-semibold">
            <Star size={10} className="fill-amber-400 text-amber-400" />
            {lawyer.rating.toFixed(1)}
          </span>
        </div>

        {/* Bio */}
        <p className="text-[12px] text-slate-500 leading-relaxed line-clamp-2 mb-5">
          {lawyer.bio}
        </p>

        {/* Stats tiles */}
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { label: 'Fee Range', value: lawyer.feeRange },
            { label: 'Cases',     value: `${lawyer.casesHandled}+` },
            { label: 'Languages', value: String(lawyer.languages.length) },
          ].map(({ label, value }) => (
            <div key={label} className="px-2 py-2.5 bg-[#fafbff] rounded-xl border border-slate-100">
              <div className="text-[9px] text-slate-400 mb-1 uppercase tracking-wide">{label}</div>
              <div className="text-[11px] font-semibold text-[#0a0f1e] leading-tight">{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="p-6 pt-3 flex gap-2">
        <a
          href={`mailto:${lawyer.email}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-slate-200 rounded-xl text-[12px] font-medium text-slate-500 no-underline hover:border-slate-300 hover:text-[#0a0f1e] transition-all"
        >
          <Mail size={12} /> Email
        </a>
        <a
          href={`tel:${lawyer.phone}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#0a0f1e] text-white rounded-xl text-[12px] font-semibold no-underline hover:bg-[#1e293b] transition-colors"
        >
          <Phone size={12} /> Call Now
        </a>
      </div>
    </div>
  )
}
