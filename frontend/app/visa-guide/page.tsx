import type { Metadata } from 'next'
import VisaGuideClient from './VisaGuideClient'

export const metadata: Metadata = {
  title: 'Visa Guide for Indians — Bali, Dubai, Thailand, Singapore, Maldives & Vietnam',
  description: 'Complete 2026 visa guide for Indian passport holders. Check visa-on-arrival rules, eVisa applications, costs, processing times, and official entry requirements for top destinations.',
  keywords: ['visa guide for Indians', 'eVisa Thailand', 'Bali visa on arrival', 'Dubai tourist visa Indian', 'Singapore visa requirements', 'Vietnam eVisa'],
  alternates: {
    canonical: 'https://tripsage.in/visa-guide',
  },
  openGraph: {
    title: 'Visa Guide for Indians — Bali, Dubai, Thailand, Singapore, Maldives & Vietnam',
    description: 'Complete visa guide for Indian passport holders. Check rules, costs, and processing times for top destinations.',
    url: 'https://tripsage.in/visa-guide',
    siteName: 'TripSage',
    images: [
      {
        url: 'https://tripsage.in/logo.png',
        width: 1200,
        height: 630,
        alt: 'TripSage Visa Guide for Indians',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Visa Guide for Indians | TripSage Travel OS',
    description: 'Complete 2026 visa guide for Indian passport holders traveling to Bali, Dubai, Thailand, Singapore, and more.',
    images: ['https://tripsage.in/logo.png'],
  },
}

export default function VisaGuidePage() {
  return <VisaGuideClient />
}
