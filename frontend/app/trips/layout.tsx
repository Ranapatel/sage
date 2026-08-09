import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Saved Trips | TripSage AI Travel',
  description: 'View your saved trips and itineraries.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function TripsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
