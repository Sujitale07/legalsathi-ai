import { prisma } from '@/lib/prisma'
import { LawyerListing } from '@/components/listing/LawyerListing'

export const metadata = {
  title: 'Find Lawyers in Nepal | LegalSathi AI',
  description: 'Browse verified lawyers in Nepal by specialization, location, and fee range.',
}

export default async function ListingPage() {
  const lawyers = await prisma.lawyer.findMany({
    orderBy: [{ featured: 'desc' }, { rating: 'desc' }],
  })

  return <LawyerListing initialLawyers={lawyers} />
}
