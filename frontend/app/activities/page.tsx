import type { Metadata } from 'next'
import ActivitiesClient from './ActivitiesClient'

export const metadata: Metadata = {
  title:       'Explore Activities & Tours | TripSage',
  description: 'Discover and book world-class tours, adventures, cultural experiences, and local activities. Powered by Hotelbeds — real prices, instant confirmation.',
  keywords:    'activities, tours, adventures, excursions, booking, travel experiences, TripSage',
  openGraph: {
    title:       'Explore Activities & Tours | TripSage',
    description: 'Find and book authentic local experiences worldwide.',
    type:        'website',
  },
}

export default function ActivitiesPage() {
  return <ActivitiesClient />
}
