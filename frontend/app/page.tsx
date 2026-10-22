import type { Metadata } from 'next'
import HomeClient from './HomeClient'
import { HOME_FAQS } from '@/lib/homeFaqs'

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: HOME_FAQS.map((faq) => ({
    '@type': 'Question',
    name: faq.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.a,
    },
  })),
}

export const metadata: Metadata = {
  title: 'AI Trip Planner India | Plan Smart Travel with TripSage',
  description: 'Plan your trips instantly using AI. Compare the cheapest flights in India, book hotels, and generate smart itineraries with TripSage.',
  keywords: ['AI trip planner India', 'travel planner app', 'cheapest flights India', 'itinerary planner AI', 'TripSage', 'smart travel'],
  alternates: {
    canonical: 'https://www.tripsage.in',
  },
  openGraph: {
    title: 'AI Trip Planner India | Plan Smart Travel with TripSage',
    description: 'Plan your trips instantly using AI. Compare the cheapest flights in India, book hotels, and generate smart itineraries with TripSage.',
    url: 'https://www.tripsage.in',
    siteName: 'TripSage',
    images: [
      {
        url: 'https://www.tripsage.in/logo.png',
        width: 1200,
        height: 630,
        alt: 'TripSage - AI Trip Planner',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Trip Planner India | Plan Smart Travel with TripSage',
    description: 'Plan your trips instantly using AI. Compare the cheapest flights in India, book hotels, and generate smart itineraries with TripSage.',
    images: ['https://www.tripsage.in/logo.png'],
  },
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <HomeClient />
    </>
  )
}
