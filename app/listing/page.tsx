import { prisma } from '@/lib/prisma'
import { LawyerListing } from '@/components/listing/LawyerListing'

export const metadata = {
  title: 'Find Lawyers in Nepal | LegalSathi AI',
  description: 'Browse verified lawyers in Nepal by specialization, location, and fee range.',
}

export default async function ListingPage() {
  let lawyers: Awaited<ReturnType<typeof prisma.lawyer.findMany>> = []
  let dbError: string | null = null

  try {
    lawyers = await prisma.lawyer.findMany({
      orderBy: [{ featured: 'desc' }, { rating: 'desc' }],
    })
  } catch (err) {
    dbError = err instanceof Error ? err.message : 'Database unavailable'
    console.error('[listing] DB error:', dbError)
  }

  return <LawyerListing initialLawyers={lawyers} dbError={dbError} />
}
