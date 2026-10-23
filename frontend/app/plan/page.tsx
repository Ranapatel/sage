import type { Metadata } from 'next'
import PlanClientWrapper from './PlanClientWrapper'

export const metadata: Metadata = {
  title: 'AI Trip Planner | Design Your Perfect Itinerary',
  description: 'Draft a one-route trip with TripSage: a day-by-day plan, rupee estimates, and visa notes for Indian passports.',
  keywords: ['AI travel planner', 'personalized itinerary', 'trip planning software', 'smart travel planning'],
  robots: {
    index: false,
    follow: true,
  },
}

export default function PlanPage() {
  return <PlanClientWrapper />
}
