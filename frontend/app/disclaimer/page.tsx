import type { Metadata } from 'next'
import Link from 'next/link'
import LandingLayout from '@/components/layout/LandingLayout'

export const metadata: Metadata = {
  title: 'Disclaimer | TripSage',
  description: 'TripSage travel suggestions are informational. Prices, availability and third-party services are not guaranteed.',
  alternates: { canonical: 'https://www.tripsage.in/disclaimer' },
  openGraph: {
    title: 'Disclaimer | TripSage',
    url: 'https://www.tripsage.in/disclaimer',
  },
}

export default function DisclaimerPage() {
  return (
    <LandingLayout>
      <main className="mx-auto max-w-3xl px-6 py-16 text-[#1A1A1A]">
        <h1 className="font-display text-3xl font-bold">Disclaimer</h1>
        <div className="mt-8 space-y-4 text-sm leading-relaxed text-[#4A4A4A]">
          <p>TripSage provides travel suggestions and recommendations only. We are an AI-powered planning tool, not a travel agency.</p>
          <p><strong>No Guarantees:</strong> We do not guarantee accuracy of prices or availability. Use at your own risk.</p>
          <p><strong>No Responsibility:</strong> We are not responsible for any third-party services or providers, and we are not liable for travel disruptions, delays, or cancellations.</p>
        </div>
        <p className="mt-8 text-sm">
          <Link href="/" className="text-[#EA580C] font-semibold">Back to TripSage</Link>
        </p>
      </main>
    </LandingLayout>
  )
}
