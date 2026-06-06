import pg from 'pg'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { randomBytes } from 'crypto'

const createId = () => randomBytes(12).toString('hex')
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Map JSON specialization strings → our DB specialty keys
const SPECIALTY_MAP = {
  'Corporate Law':          'corporate_lawyer',
  'Criminal Law':           'criminal_lawyer',
  'Labour & Employment':    'labor_lawyer',
  'Constitutional Law':     'constitutional_lawyer',
  'Civil Litigation':       'civil_lawyer',
  'Administrative Law':     'compliance_lawyer',
  'Property & Real Estate': 'property_lawyer',
  'Tax Law':                'tax_consultant',
  'Land Revenue & Tenancy': 'land_lawyer',
  'Family & Matrimonial':   'family_lawyer',
  'Intellectual Property':  'ip_lawyer',
  'Immigration':            'immigration_lawyer',
}

function mapSpecialties(specializations) {
  return specializations.map(s => SPECIALTY_MAP[s] ?? s.toLowerCase().replace(/\s+&?\s*/g, '_'))
}

function buildBio(name, specializations, type) {
  const specs = specializations.join(', ')
  return `${type === 'अधिवक्ता' ? 'Advocate' : type} with expertise in ${specs}. Licensed by the Nepal Bar Association.`
}

// Estimate experience: lower licence number = registered earlier = more experience
// Rough heuristic: licence 1 ≈ 35 yrs, licence 50 ≈ 10 yrs
function estimateExperience(licenceNo) {
  const n = parseInt(String(licenceNo)) || 25
  const clamped = Math.max(1, Math.min(n, 50))
  return Math.round(35 - ((clamped - 1) / 49) * 25)
}

function formatPhone(phone) {
  if (!phone) return null
  const digits = String(phone).replace(/\D/g, '')
  if (digits.startsWith('977')) return `+${digits}`
  if (digits.startsWith('98') || digits.startsWith('97') || digits.startsWith('96')) return `+977-${digits}`
  return digits
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
await client.connect()

// Clear old placeholder lawyers
await client.query(`DELETE FROM "Lawyer"`)
console.log('Cleared existing lawyers')

const jsonPath = path.join(__dirname, '../public/nepal-lawyers.json')
const lawyers = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))

let inserted = 0
for (const l of lawyers) {
  const id = createId()
  const specialties = mapSpecialties(l.specializations ?? [])
  const bio = buildBio(l.name, l.specializations ?? [], l.type ?? 'Advocate')
  const experience = estimateExperience(l.licence_no)
  const phone = formatPhone(l.phone)

  await client.query(
    `INSERT INTO "Lawyer" (id, name, specialties, location, phone, email, experience, bio, languages, fee, available)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     ON CONFLICT DO NOTHING`,
    [
      id,
      l.name,
      specialties,
      l.address ?? '',
      phone,
      null,               // no email in source data
      experience,
      bio,
      ['Nepali'],         // default; can be extended later
      null,               // no fee data in source
      true,
    ]
  )
  inserted++
}

console.log(`Inserted ${inserted} lawyers from nepal-lawyers.json`)
await client.end()
