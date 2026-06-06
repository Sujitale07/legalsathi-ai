import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.toLowerCase() ?? ''
  const specialization = searchParams.get('specialization') ?? ''
  const location = searchParams.get('location') ?? ''
  const minRating = parseFloat(searchParams.get('minRating') ?? '0') || 0

  const lawyers = await prisma.lawyer.findMany({
    where: {
      ...(specialization && { specialization }),
      ...(location && { location }),
      ...(minRating > 0 && { rating: { gte: minRating } }),
      ...(q && {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { specialization: { contains: q, mode: 'insensitive' } },
          { bio: { contains: q, mode: 'insensitive' } },
        ],
      }),
    },
    orderBy: [{ featured: 'desc' }, { rating: 'desc' }],
  })

  return Response.json(lawyers)
}
