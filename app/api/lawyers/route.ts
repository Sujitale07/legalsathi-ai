import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const specialties = searchParams.getAll('specialty') // ?specialty=tax_consultant&specialty=labor_lawyer

  const lawyers = await prisma.lawyer.findMany({
    where: {
      available: true,
      ...(specialties.length > 0
        ? { specialties: { hasSome: specialties } }
        : {}),
    },
    orderBy: { experience: 'desc' },
  })

  return Response.json(lawyers)
}
