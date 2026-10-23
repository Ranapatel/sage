import type { Metadata } from 'next'
import ProfileClient from './ProfileClient'

export const metadata: Metadata = {
  title: 'My Profile | TripSage',
  description: 'Manage your TripSage travel profile, update dietary options, select preferred currencies, and view your accumulated booking cashback rewards.',
  robots: {
    index: false,
    follow: true,
  },
}

export default function ProfilePage() {
  return <ProfileClient />
}
