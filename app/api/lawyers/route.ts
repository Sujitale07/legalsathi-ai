import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q           = searchParams.get('q')?.trim() ?? ''
  const specialty   = searchParams.get('specialty') ?? ''
  const location    = searchParams.get('location') ?? ''
  const available   = searchParams.get('available')
  const limit       = parseInt(searchParams.get('limit') ?? '0') || undefined
  const offset      = parseInt(searchParams.get('offset') ?? '0') || 0

  const [lawyers, total] = await prisma.$transaction([
    prisma.lawyer.findMany({
      where: {
        ...(specialty && { specialties: { has: specialty } }),
        ...(location && { location }),
        ...(available === 'true' && { available: true }),
        ...(q && {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { bio: { contains: q, mode: 'insensitive' } },
            { location: { contains: q, mode: 'insensitive' } },
          ],
        }),
      },
      orderBy: [{ available: 'desc' }, { experience: 'desc' }],
      ...(limit && { take: limit }),
      ...(offset && { skip: offset }),
    }),
    prisma.lawyer.count(),
  ])

  return Response.json({ lawyers, total, offset, limit: limit ?? total })
}

export async function POST(request: NextRequest) {
  let body: unknown
  try { body = await request.json() } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const data = body as Record<string, unknown>
  const required = ['name', 'location', 'bio']
  const missing = required.filter(k => data[k] === undefined || data[k] === '')
  if (missing.length) {
    return Response.json({ error: `Missing fields: ${missing.join(', ')}` }, { status: 422 })
  }

  const lawyer = await prisma.lawyer.create({
    data: {
      name:        String(data.name),
      experience:  data.experience !== undefined ? Number(data.experience) : null,
      location:    String(data.location),
      languages:   Array.isArray(data.languages) ? data.languages.map(String) : [],
      fee:         data.fee !== undefined ? String(data.fee) : null,
      bio:         String(data.bio),
      phone:       data.phone !== undefined ? String(data.phone) : null,
      email:       data.email !== undefined ? String(data.email) : null,
      available:   data.available !== undefined ? Boolean(data.available) : true,
      specialties: Array.isArray(data.specialties) ? data.specialties.map(String) : [],
    },
  })

  return Response.json(lawyer, { status: 201 })
}
