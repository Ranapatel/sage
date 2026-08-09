import type { Metadata } from 'next'
import MyTripsClient from './MyTripsClient'

export const metadata: Metadata = {
  title: 'My Saved Trips & Itineraries | TripSage AI Travel',
  description: 'Access your planned itineraries, saved flights & hotels, and resume your active travels with TripSage AI.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function MyTripsPage() {
  return <MyTripsClient />
}
