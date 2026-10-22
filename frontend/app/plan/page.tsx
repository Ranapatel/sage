import type { Metadata } from 'next'
import PlanClientWrapper from './PlanClientWrapper'

export const metadata: Metadata = {
  title: 'AI Trip Planner | Design Your Perfect Itinerary',
  description: 'Plan a trip with TripSage. Get a day-by-day itinerary and fare and hotel options with links to book directly with providers.',
  keywords: ['AI travel planner', 'personalized itinerary', 'trip planning software', 'smart travel planning'],
  robots: {
    index: false,
    follow: true,
  },
}

export default function PlanPage() {
  return <PlanClientWrapper />
}
