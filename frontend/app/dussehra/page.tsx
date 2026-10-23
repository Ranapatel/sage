import type { Metadata } from 'next'
import DussehraClient from './DussehraClient'
import { DUSSEHRA_FAQS, DUSSEHRA_CAMPAIGN } from '@/lib/dussehraConfig'

export const metadata: Metadata = {
  title: 'TripSage Dussehra Escape | Plan Your Next Trip',
  description: 'Plan your next getaway with TripSage. Explore destinations and create a personalized travel itinerary around your dates and budget.',
  keywords: [
    'Dussehra travel deals',
    'Dussehra trip planner India',
    'autumn holidays India',
    'AI itinerary generator',
    'TripSage Dussehra',
    'budget travel India',
    'Goa trip planner',
    'Manali trip planner',
    'Kerala trip planner',
    'Pondicherry trip planner',
  ],
  alternates: {
    canonical: 'https://www.tripsage.in/dussehra',
  },
  openGraph: {
    title: 'TripSage Dussehra Escape | Plan Your Next Trip',
    description: 'Plan your next getaway with TripSage. Explore destinations and create a personalized travel itinerary around your dates and budget.',
    url: 'https://www.tripsage.in/dussehra',
    siteName: 'TripSage',
    images: [
      {
        url: 'https://www.tripsage.in/logo.png',
        width: 1200,
        height: 630,
        alt: 'TripSage Dussehra Campaign — The Great Dussehra Escape',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TripSage Dussehra Escape | Plan Your Next Trip',
    description: 'Plan your next getaway with TripSage. Explore destinations and create a personalized travel itinerary around your dates and budget.',
    images: ['https://www.tripsage.in/logo.png'],
    creator: '@tripsage',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function DussehraPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.tripsage.in',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'The Great Dussehra Escape',
        item: 'https://www.tripsage.in/dussehra',
      },
    ],
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: DUSSEHRA_FAQS.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  const eventSchema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: 'The Great Dussehra Escape',
    description: DUSSEHRA_CAMPAIGN.bannerBody,
    startDate: DUSSEHRA_CAMPAIGN.startDate,
    endDate: DUSSEHRA_CAMPAIGN.endDate,
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: {
      '@type': 'VirtualLocation',
      url: 'https://www.tripsage.in/dussehra',
    },
    organizer: {
      '@type': 'Organization',
      name: 'TripSage',
      url: 'https://www.tripsage.in',
      logo: 'https://www.tripsage.in/logo.png',
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      url: 'https://www.tripsage.in/dussehra',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />
      <DussehraClient />
    </>
  )
}
