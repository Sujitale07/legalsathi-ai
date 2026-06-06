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
      'bg-app-surface rounded-4xl flex flex-col relative overflow-hidden',
      'transition-all duration-200 hover:-translate-y-0.5',
      lawyer.featured
        ? 'border-2 border-app-accent shadow-sm'
        : 'border border-app-border hover:border-app-border-strong',
    ].join(' ')}>

      {lawyer.featured && (
        <div className="absolute top-5 right-5 px-2.5 py-0.5 bg-app-accent rounded-full text-[9px] font-semibold uppercase tracking-widest text-[#EEE9DF]">
          Featured
        </div>
      )}

      <div className="p-6 flex-1">
        {/* Avatar + name */}
        <div className="flex items-start gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-app-accent flex items-center justify-center shrink-0">
            <span className="text-[14px] font-bold font-mono text-[#EEE9DF]">{initials}</span>
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <div className="text-[14px] font-semibold text-app-text truncate leading-snug mb-1.5">
              {lawyer.name}
            </div>
            <span className="inline-flex px-2.5 py-0.5 bg-app-accent-light text-app-accent rounded-full text-[10px] font-semibold">
              {lawyer.specialization}
            </span>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[11px] text-app-text-subtle mb-4">
          <span className="flex items-center gap-1"><MapPin size={10} />{lawyer.location}</span>
          <span className="flex items-center gap-1"><Briefcase size={10} />{lawyer.experience}</span>
          <span className="flex items-center gap-1 text-app-text font-semibold">
            <Star size={10} className="fill-amber-400 text-amber-400" />
            {lawyer.rating.toFixed(1)}
          </span>
        </div>

        {/* Bio */}
        <p className="text-[12px] text-app-text-muted leading-relaxed line-clamp-2 mb-5">
          {lawyer.bio}
        </p>

        {/* Stats tiles */}
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { label: 'Fee Range', value: lawyer.feeRange },
            { label: 'Cases',     value: `${lawyer.casesHandled}+` },
            { label: 'Languages', value: String(lawyer.languages.length) },
          ].map(({ label, value }) => (
            <div key={label} className="px-2 py-2.5 bg-app-bg rounded-2xl">
              <div className="text-[9px] text-app-text-subtle mb-1 uppercase tracking-wide">{label}</div>
              <div className="text-[11px] font-semibold text-app-text leading-tight">{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="p-6 pt-3 flex gap-2">
        <a
          href={`mailto:${lawyer.email}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-app-border rounded-2xl text-[12px] font-medium text-app-text-muted no-underline hover:border-app-border-strong hover:text-app-text transition-all"
        >
          <Mail size={12} /> Contact
        </a>
        <a
          href={`tel:${lawyer.phone}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-app-accent text-[#EEE9DF] rounded-2xl text-[12px] font-medium no-underline hover:bg-app-accent-hover transition-colors"
        >
          <Phone size={12} /> Call Now
        </a>
      </div>
    </div>
  )
}
