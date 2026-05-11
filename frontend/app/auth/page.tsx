import type { Metadata } from 'next'
import AuthClient from './AuthClient'

export const metadata: Metadata = {
  title: 'Sign In | Create Account - TripSage AI',
  description: 'Join TripSage to plan your AI-powered trips, save itineraries, and get real-time travel updates.',
  keywords: ['TripSage login', 'AI travel account', 'travel planner signup', 'trip sage auth'],
}

export default function AuthPage() {
  return <AuthClient />
}
