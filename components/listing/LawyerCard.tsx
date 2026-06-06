'use client'

import { MapPin, Briefcase, Star, Phone, Mail } from 'lucide-react'
import type { Lawyer } from './data'

const PRIMARY = '#2563eb'
const PRIMARY_TINT = '#eff6ff'

interface LawyerCardProps {
  lawyer: Lawyer
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      <Star size={13} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
      <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{rating.toFixed(1)}</span>
    </span>
  )
}

export function LawyerCard({ lawyer }: LawyerCardProps) {
  const initials = lawyer.name
    .replace('Adv. ', '')
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)

  return (
    <div style={{ background: '#fff', borderRadius: '16px', border: lawyer.featured ? `1.5px solid ${PRIMARY}` : '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Featured badge */}
      {lawyer.featured && (
        <div style={{ position: 'absolute', top: '14px', right: '14px', padding: '2px 9px', background: PRIMARY, borderRadius: '100px', fontSize: '10px', fontWeight: 700, color: '#fff', letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>
          Featured
        </div>
      )}

      {/* Card body */}
      <div style={{ padding: '22px 22px 18px' }}>
        {/* Avatar + name row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '14px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: PRIMARY_TINT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '16px', fontWeight: 800, color: PRIMARY }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lawyer.name}</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 9px', background: PRIMARY_TINT, borderRadius: '100px', fontSize: '11px', fontWeight: 600, color: PRIMARY }}>
              {lawyer.specialization}
            </div>
          </div>
        </div>

        {/* Meta row */}
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '12px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#64748b' }}>
            <MapPin size={12} style={{ color: '#94a3b8' }} />
            {lawyer.location}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#64748b' }}>
            <Briefcase size={12} style={{ color: '#94a3b8' }} />
            {lawyer.experience}
          </span>
          <StarRating rating={lawyer.rating} />
        </div>

        {/* Bio */}
        <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, marginBottom: '14px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
          {lawyer.bio}
        </p>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1, padding: '9px 12px', background: '#f8fafc', borderRadius: '9px', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>Fee Range</div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>{lawyer.feeRange}</div>
          </div>
          <div style={{ flex: 1, padding: '9px 12px', background: '#f8fafc', borderRadius: '9px', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>Cases</div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>{lawyer.casesHandled}+</div>
          </div>
          <div style={{ flex: 1, padding: '9px 12px', background: '#f8fafc', borderRadius: '9px', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>Languages</div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>{lawyer.languages.length}</div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ padding: '0 22px 20px', marginTop: 'auto', display: 'flex', gap: '8px' }}>
        <a
          href={`mailto:${lawyer.email}`}
          style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', background: '#f8fafc', color: '#475569', textDecoration: 'none', borderRadius: '9px', fontSize: '13px', fontWeight: 600, border: '1px solid #e2e8f0' }}
        >
          <Mail size={13} /> Contact
        </a>
        <a
          href={`tel:${lawyer.phone}`}
          style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', background: PRIMARY, color: '#fff', textDecoration: 'none', borderRadius: '9px', fontSize: '13px', fontWeight: 600 }}
        >
          <Phone size={13} /> Call Now
        </a>
      </div>
    </div>
  )
}
