import pg from 'pg'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { randomBytes } from 'crypto'
const createId = () => randomBytes(12).toString('hex')

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
await client.connect()

// Run migration first
const sql = fs.readFileSync(path.join(__dirname, '../sql/002_lawyers.sql'), 'utf8')
await client.query(sql)
console.log('Migration 002 applied')

const lawyers = [
  {
    name: 'Adv. Ramesh Kumar Shrestha',
    specialties: ['business_registration_lawyer', 'compliance_lawyer'],
    location: 'Kathmandu, Baneswor',
    phone: '+977-9801234567',
    email: 'ramesh.shrestha@legalnepal.com.np',
    experience: 12,
    bio: 'Specializes in company registration, OCR filings, and corporate compliance for startups and SMEs in Nepal. Has assisted 200+ businesses register with relevant government bodies.',
    languages: ['Nepali', 'English'],
    fee: 'NPR 3,000 - 8,000 / hour',
    available: true,
  },
  {
    name: 'Adv. Sunita Rai',
    specialties: ['labor_lawyer', 'contract_lawyer'],
    location: 'Kathmandu, New Baneshwor',
    phone: '+977-9851234568',
    email: 'sunita.rai@advocate.np',
    experience: 9,
    bio: 'Expert in Nepal Labour Act 2074, employment contract drafting, wrongful termination disputes, and HR compliance. Represented clients in the Labour Court, Kathmandu.',
    languages: ['Nepali', 'English', 'Hindi'],
    fee: 'NPR 2,500 - 6,000 / hour',
    available: true,
  },
  {
    name: 'Adv. Bikash Adhikari',
    specialties: ['tax_consultant', 'compliance_lawyer'],
    location: 'Kathmandu, Putalisadak',
    phone: '+977-9841234569',
    email: 'bikash.adhikari@taxnepal.com.np',
    experience: 15,
    bio: 'Senior tax consultant with deep expertise in IRD compliance, VAT registration, PAN filing, and corporate tax structuring. Former IRD officer with 15 years of combined experience.',
    languages: ['Nepali', 'English'],
    fee: 'NPR 4,000 - 10,000 / hour',
    available: true,
  },
  {
    name: 'Adv. Priya Manandhar',
    specialties: ['property_lawyer', 'contract_lawyer'],
    location: 'Lalitpur, Pulchowk',
    phone: '+977-9861234570',
    email: 'priya.manandhar@propertylegal.np',
    experience: 8,
    bio: 'Handles land registration, property transfer, lease agreements, and real estate disputes. Well-versed in Land Revenue Office procedures and the Nepal Land Act 2021.',
    languages: ['Nepali', 'English', 'Newari'],
    fee: 'NPR 3,000 - 7,000 / hour',
    available: true,
  },
  {
    name: 'Adv. Dipesh Thapa',
    specialties: ['ip_lawyer', 'business_registration_lawyer'],
    location: 'Kathmandu, Thamel',
    phone: '+977-9871234571',
    email: 'dipesh.thapa@ipnepal.com.np',
    experience: 7,
    bio: 'Nepal\'s emerging intellectual property specialist. Handles trademark registration, copyright protection, patent filing, and brand identity legal protection for tech and creative businesses.',
    languages: ['Nepali', 'English'],
    fee: 'NPR 2,500 - 5,000 / hour',
    available: true,
  },
  {
    name: 'Adv. Mina Gurung',
    specialties: ['immigration_lawyer', 'compliance_lawyer'],
    location: 'Kathmandu, Tratipati',
    phone: '+977-9811234572',
    email: 'mina.gurung@immigrationnepal.np',
    experience: 11,
    bio: 'Specializes in work permits, business visas, foreign investment compliance, and Department of Immigration procedures for expatriates and foreign-owned businesses operating in Nepal.',
    languages: ['Nepali', 'English', 'Tibetan'],
    fee: 'NPR 3,500 - 8,000 / hour',
    available: true,
  },
  {
    name: 'Adv. Nabin Khadka',
    specialties: ['contract_lawyer', 'labor_lawyer'],
    location: 'Bhaktapur, Suryabinayak',
    phone: '+977-9821234573',
    email: 'nabin.khadka@contractlaw.np',
    experience: 6,
    bio: 'Drafts and reviews commercial contracts, service agreements, MoUs, and joint venture agreements. Also handles employment law disputes and labor arbitration cases.',
    languages: ['Nepali', 'English'],
    fee: 'NPR 2,000 - 5,000 / hour',
    available: true,
  },
  {
    name: 'Adv. Sarita Bajracharya',
    specialties: ['property_lawyer', 'compliance_lawyer'],
    location: 'Lalitpur, Jawalakhel',
    phone: '+977-9831234574',
    email: 'sarita.bajracharya@legalhouse.np',
    experience: 13,
    bio: 'Senior advocate with extensive experience in housing loans, mortgage disputes, tenancy rights, and municipality compliance. Handles cases at Patan High Court regularly.',
    languages: ['Nepali', 'English', 'Newari'],
    fee: 'NPR 3,500 - 9,000 / hour',
    available: true,
  },
]

for (const l of lawyers) {
  const id = createId()
  await client.query(
    `INSERT INTO "Lawyer" (id, name, specialties, location, phone, email, experience, bio, languages, fee, available)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     ON CONFLICT DO NOTHING`,
    [id, l.name, l.specialties, l.location, l.phone, l.email, l.experience, l.bio, l.languages, l.fee, l.available]
  )
}

console.log(`Seeded ${lawyers.length} lawyers`)
await client.end()
