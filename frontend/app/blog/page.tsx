import type { Metadata } from 'next'
import BlogClient from './BlogClient'

export const metadata: Metadata = {
  title: 'TripSage Travel Journal | TripSage',
  description: 'Discover expert travel guides, budget planning tips, AI itinerary ideas, and destination inspiration for Indian travelers on the TripSage Journal.',
  keywords: ['travel blog India', 'AI travel tips', 'budget travel guide', 'TripSage journal', 'itinerary guides'],
  alternates: {
    canonical: 'https://www.tripsage.in/blog',
  },
  openGraph: {
    title: 'TripSage Travel Journal | TripSage',
    description: 'Discover expert travel guides, budget planning tips, AI itinerary ideas, and destination inspiration for Indian travelers.',
    url: 'https://www.tripsage.in/blog',
    siteName: 'TripSage',
    images: [
      {
        url: 'https://www.tripsage.in/logo.png',
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
    title: 'TripSage Travel Journal | TripSage',
    description: 'Discover expert travel guides, budget planning tips, and AI itinerary ideas on the TripSage Journal.',
    images: ['https://www.tripsage.in/logo.png'],
  },
}

export default function BlogListingPage() {
  return <BlogClient />
}
