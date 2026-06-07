import { defineConfig } from 'prisma/config'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load .env.local so `prisma migrate dev` can reach DATABASE_URL
try {
  const raw = readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8')
  for (const line of raw.split('\n')) {
    const m = line.match(/^([^#=\s]+)\s*=\s*(.*)$/)
    if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, '')
  }
} catch { /* file absent — rely on env already being set */ }

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
})
