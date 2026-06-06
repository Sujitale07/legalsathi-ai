import { LawyerListing } from '@/components/listing/LawyerListing'
import { lawyers } from '@/components/listing/data'

export const metadata = {
  title: 'Find Lawyers in Nepal | LegalSathi AI',
  description: 'Browse verified lawyers in Nepal by specialization, location, and fee range.',
}

export default function ListingPage() {
  return <LawyerListing initialLawyers={lawyers} />
}
