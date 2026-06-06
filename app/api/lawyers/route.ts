import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q              = searchParams.get('q')?.trim() ?? ''
  const specialization = searchParams.get('specialization') ?? ''
  const location       = searchParams.get('location') ?? ''
  const minRating      = parseFloat(searchParams.get('minRating') ?? '0') || 0
  const featured       = searchParams.get('featured')
  const limit          = parseInt(searchParams.get('limit') ?? '0') || undefined
  const offset         = parseInt(searchParams.get('offset') ?? '0') || 0

  const [lawyers, total] = await prisma.$transaction([
    prisma.lawyer.findMany({
      where: {
        ...(specialization && { specialization }),
        ...(location && { location }),
        ...(minRating > 0 && { rating: { gte: minRating } }),
        ...(featured === 'true' && { featured: true }),
        ...(q && {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { specialization: { contains: q, mode: 'insensitive' } },
            { bio: { contains: q, mode: 'insensitive' } },
            { location: { contains: q, mode: 'insensitive' } },
          ],
        }),
      },
      orderBy: [{ featured: 'desc' }, { rating: 'desc' }],
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
  const required = ['name', 'specialization', 'experience', 'location', 'feeRange', 'rating', 'casesHandled', 'bio', 'phone', 'email']
  const missing = required.filter(k => data[k] === undefined || data[k] === '')
  if (missing.length) {
    return Response.json({ error: `Missing fields: ${missing.join(', ')}` }, { status: 422 })
  }

  const lawyer = await prisma.lawyer.create({
    data: {
      name:           String(data.name),
      specialization: String(data.specialization),
      experience:     String(data.experience),
      location:       String(data.location),
      languages:      Array.isArray(data.languages) ? data.languages.map(String) : [],
      feeRange:       String(data.feeRange),
      rating:         Number(data.rating),
      casesHandled:   Number(data.casesHandled),
      bio:            String(data.bio),
      phone:          String(data.phone),
      email:          String(data.email),
      featured:       Boolean(data.featured ?? false),
    },
  })

  return Response.json(lawyer, { status: 201 })
}
