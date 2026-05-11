import type { Metadata } from 'next'
import SupportClient from './SupportClient'

export const metadata: Metadata = {
  title: 'Support & FAQ | TripSage AI Travel Help',
  description: 'Need help with your trip? Access TripSage support, read FAQs, or chat with our AI assistant for immediate travel planning assistance.',
  keywords: ['TripSage support', 'travel help', 'itinerary assistance', 'refund help', 'flight support'],
}

export default function SupportPage() {
  return <SupportClient />
}
