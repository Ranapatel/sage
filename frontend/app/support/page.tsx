import type { Metadata } from 'next'
import SupportClient from './SupportClient'

export const metadata: Metadata = {
  title: 'Support & FAQ | TripSage AI Travel Help Center',
  description: 'Need help with your travel plans? Access TripSage support center, explore FAQs on AI itineraries, flight and hotel bookings, refunds, or contact our support team.',
  keywords: ['TripSage support', 'travel help desk', 'AI itinerary assistance', 'booking refunds', 'flight support India'],
  alternates: {
    canonical: 'https://tripsage.in/support',
  },
  openGraph: {
    title: 'Support & FAQ | TripSage AI Travel Help Center',
    description: 'Need help with your travel plans? Access TripSage support, read FAQs, or get immediate travel planning assistance.',
    url: 'https://tripsage.in/support',
    siteName: 'TripSage',
    images: [
      {
        url: 'https://tripsage.in/logo.png',
        width: 1200,
        height: 630,
        alt: 'TripSage Support & Help Center',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Support & FAQ | TripSage AI Travel Help Center',
    description: 'Get immediate support and answers to common travel planning questions on TripSage.',
    images: ['https://tripsage.in/logo.png'],
  },
}

export default function SupportPage() {
  return <SupportClient />
}
