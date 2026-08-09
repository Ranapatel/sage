import type { Metadata } from 'next'
import BlogClient from './BlogClient'

export const metadata: Metadata = {
  title: 'TripSage Travel Journal — AI Travel Guides, Tips & Insights',
  description: 'Discover expert travel guides, budget planning tips, AI itinerary ideas, and destination inspiration for Indian travelers on the TripSage Journal.',
  keywords: ['travel blog India', 'AI travel tips', 'budget travel guide', 'TripSage journal', 'itinerary guides'],
  alternates: {
    canonical: 'https://tripsage.in/blog',
  },
  openGraph: {
    title: 'TripSage Travel Journal — AI Travel Guides, Tips & Insights',
    description: 'Discover expert travel guides, budget planning tips, AI itinerary ideas, and destination inspiration for Indian travelers.',
    url: 'https://tripsage.in/blog',
    siteName: 'TripSage',
    images: [
      {
        url: 'https://tripsage.in/logo.png',
        width: 1200,
        height: 630,
        alt: 'TripSage Journal - AI Travel Insights',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TripSage Travel Journal — AI Travel Guides & Insights',
    description: 'Discover expert travel guides, budget planning tips, and AI itinerary ideas on the TripSage Journal.',
    images: ['https://tripsage.in/logo.png'],
  },
}

export default function BlogListingPage() {
  return <BlogClient />
}
