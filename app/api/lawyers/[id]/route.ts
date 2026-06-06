import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const lawyer = await prisma.lawyer.findUnique({ where: { id: Number(id) } })
  if (!lawyer) return Response.json({ error: 'Lawyer not found' }, { status: 404 })
  return Response.json(lawyer)
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  const { id } = await params

  const existing = await prisma.lawyer.findUnique({ where: { id: Number(id) } })
  if (!existing) return Response.json({ error: 'Lawyer not found' }, { status: 404 })

  let body: unknown
  try { body = await request.json() } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const data = body as Record<string, unknown>

  const lawyer = await prisma.lawyer.update({
    where: { id: Number(id) },
    data: {
      ...(data.name           !== undefined && { name: String(data.name) }),
      ...(data.specialization !== undefined && { specialization: String(data.specialization) }),
      ...(data.experience     !== undefined && { experience: String(data.experience) }),
      ...(data.location       !== undefined && { location: String(data.location) }),
      ...(data.languages      !== undefined && { languages: (data.languages as string[]).map(String) }),
      ...(data.feeRange       !== undefined && { feeRange: String(data.feeRange) }),
      ...(data.rating         !== undefined && { rating: Number(data.rating) }),
      ...(data.casesHandled   !== undefined && { casesHandled: Number(data.casesHandled) }),
      ...(data.bio            !== undefined && { bio: String(data.bio) }),
      ...(data.phone          !== undefined && { phone: String(data.phone) }),
      ...(data.email          !== undefined && { email: String(data.email) }),
      ...(data.featured       !== undefined && { featured: Boolean(data.featured) }),
    },
  })

  return Response.json(lawyer)
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params

  const existing = await prisma.lawyer.findUnique({ where: { id: Number(id) } })
  if (!existing) return Response.json({ error: 'Lawyer not found' }, { status: 404 })

  await prisma.lawyer.delete({ where: { id: Number(id) } })
  return Response.json({ deleted: true, id: Number(id) })
}
