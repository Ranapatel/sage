import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up | TripSage AI Travel OS',
  description: 'Create an account to start planning your trips with TripSage AI.',
  robots: {
    index: false,
    follow: true,
  },
}

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
