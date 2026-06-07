import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const lawyer = await prisma.lawyer.findUnique({ where: { id } })
  if (!lawyer) return Response.json({ error: 'Lawyer not found' }, { status: 404 })
  return Response.json(lawyer)
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  const { id } = await params

  const existing = await prisma.lawyer.findUnique({ where: { id } })
  if (!existing) return Response.json({ error: 'Lawyer not found' }, { status: 404 })

  let body: unknown
  try { body = await request.json() } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const data = body as Record<string, unknown>

  const lawyer = await prisma.lawyer.update({
    where: { id },
    data: {
      ...(data.name        !== undefined && { name: String(data.name) }),
      ...(data.experience  !== undefined && { experience: Number(data.experience) }),
      ...(data.location    !== undefined && { location: String(data.location) }),
      ...(data.languages   !== undefined && { languages: (data.languages as string[]).map(String) }),
      ...(data.fee         !== undefined && { fee: String(data.fee) }),
      ...(data.bio         !== undefined && { bio: String(data.bio) }),
      ...(data.phone       !== undefined && { phone: String(data.phone) }),
      ...(data.email       !== undefined && { email: String(data.email) }),
      ...(data.available   !== undefined && { available: Boolean(data.available) }),
      ...(data.specialties !== undefined && { specialties: (data.specialties as string[]).map(String) }),
    },
  })

  return Response.json(lawyer)
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params

  const existing = await prisma.lawyer.findUnique({ where: { id } })
  if (!existing) return Response.json({ error: 'Lawyer not found' }, { status: 404 })

  await prisma.lawyer.delete({ where: { id } })
  return Response.json({ deleted: true, id })
}
