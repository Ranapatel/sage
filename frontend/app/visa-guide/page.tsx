import type { Metadata } from 'next'
import VisaGuideClient from './VisaGuideClient'

export const metadata: Metadata = {
  title: 'Visa Guide for Indians — Bali Dubai Thailand Singapore Maldives Vietnam',
  description: 'Everything you need to know about visa requirements, costs, processing times, and links for Indians traveling to Bali, Dubai, Thailand, Vietnam, Maldives, and Singapore.',
}

export default function VisaGuidePage() {
  return <VisaGuideClient />
}
