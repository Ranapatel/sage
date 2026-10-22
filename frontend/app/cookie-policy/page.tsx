import type { Metadata } from 'next'
import Link from 'next/link'
import LandingLayout from '@/components/layout/LandingLayout'

export const metadata: Metadata = {
  title: 'Cookie Policy | TripSage',
  description: 'TripSage uses functionality, analytics and session cookies. You can disable cookies in your browser.',
  alternates: { canonical: 'https://www.tripsage.in/cookie-policy' },
  openGraph: {
    title: 'Cookie Policy | TripSage',
    url: 'https://www.tripsage.in/cookie-policy',
  },
}

export default function CookiePolicyPage() {
  return (
    <LandingLayout>
      <main className="mx-auto max-w-3xl px-6 py-16 text-[#1A1A1A]">
        <h1 className="font-display text-3xl font-bold">Cookie Policy</h1>
        <div className="mt-8 space-y-4 text-sm leading-relaxed text-[#4A4A4A]">
          <p>TripSage uses cookies to enhance your experience.</p>
          <p><strong>What Cookies We Use:</strong></p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Functionality cookies - to remember your preferences and settings</li>
            <li>Analytics cookies - to understand how users interact with the platform</li>
            <li>Session cookies - to keep you logged in during your visit</li>
          </ul>
          <p><strong>Your Choice:</strong> You can disable cookies at any time through your browser settings. Disabling cookies may affect some features of the platform.</p>
        </div>
        <p className="mt-8 text-sm">
          <Link href="/" className="text-[#EA580C] font-semibold">Back to TripSage</Link>
        </p>
      </main>
    </LandingLayout>
  )
}
