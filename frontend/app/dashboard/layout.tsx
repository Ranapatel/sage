import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard | TripSage AI Travel OS',
  description: 'Manage your travel plans, saved itineraries, and user preferences.',
  robots: {
    index: false,
    follow: true,
  },
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
