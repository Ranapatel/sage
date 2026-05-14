import type { Metadata } from 'next'
import HomeClient from './HomeClient'

export const metadata: Metadata = {
  title: 'AI Trip Planner India | Plan Smart Travel with TripSage',
  description: 'Plan your trips instantly using AI. Compare the cheapest flights in India, book hotels, and generate smart itineraries with TripSage.',
  keywords: ['AI trip planner India', 'travel planner app', 'cheapest flights India', 'itinerary planner AI', 'TripSage', 'smart travel'],
  alternates: {
    canonical: 'https://tripsage.in',
  },
}

export default function HomePage() {
  return <HomeClient />
}
