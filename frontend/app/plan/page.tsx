import type { Metadata } from 'next'
import PlanClient from './PlanClient'

export const metadata: Metadata = {
  title: 'AI Trip Planner | Design Your Perfect Itinerary',
  description: 'Use TripSage AI to plan your next adventure. Get personalized itineraries, real-time flight and hotel options, and smart travel recommendations based on your budget.',
  keywords: ['AI travel planner', 'personalized itinerary', 'trip planning software', 'smart travel planning'],
}

export default function PlanPage() {
  return <PlanClient />
}
