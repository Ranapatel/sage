import type { Metadata } from 'next'
import VisaGuideClient from './VisaGuideClient'

export const metadata: Metadata = {
  title: 'Visa & Compliance Guide | TripSage AI Travel',
  description: 'Mandatory visa requirements, fees in INR, processing times, and pre-departure checklists for Indian citizens traveling to Bali, Dubai, Thailand, Vietnam, Maldives, and Singapore.',
  keywords: [
    'Indian passport visa requirements',
    'visa fee in INR',
    'Bali visa checklist',
    'Thailand visa free entry',
    'Singapore SG arrival card',
    'Vietnam eVisa link',
    'Maldives IMUGA declaration'
  ],
}

export default function VisaGuidePage() {
  return <VisaGuideClient />
}
