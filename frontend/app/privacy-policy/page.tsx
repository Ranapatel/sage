import type { Metadata } from 'next'
import Link from 'next/link'
import LandingLayout from '@/components/layout/LandingLayout'

export const metadata: Metadata = {
  title: 'Privacy Policy | TripSage',
  description: 'Short privacy summary previously shown in the TripSage footer. A full policy is still pending founder review.',
  alternates: { canonical: 'https://www.tripsage.in/privacy-policy' },
  openGraph: {
    title: 'Privacy Policy | TripSage',
    url: 'https://www.tripsage.in/privacy-policy',
  },
}

export default function PrivacyPolicyPage() {
  return (
    <LandingLayout>
      <main className="mx-auto max-w-3xl px-6 py-16 text-[#1A1A1A]">
        <h1 className="font-display text-3xl font-bold">Privacy Policy</h1>
        <p className="mt-4 text-sm text-[#6B6B6B]">
          Needs founder content. The summary below is the text that was already in the site footer. It is not a full privacy policy.
        </p>
        <div className="mt-8 space-y-4 text-sm leading-relaxed text-[#4A4A4A]">
          <p><strong>Effective Date:</strong> 01 April 2026</p>
          <p><strong>What We Collect:</strong> Name, email, location, and travel preferences. We do NOT sell your personal data.</p>
          <p><strong>How We Use Data:</strong> To personalize your experience and improve our platform analytics.</p>
          <p className="font-bold">We do NOT sell your personal data to any third party.</p>
          <p><strong>Data Sharing:</strong> We may share anonymized data with trusted APIs and analytics tools solely to improve the service.</p>
          <p><strong>Your Rights:</strong></p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Access your personal data at any time</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your account and data</li>
          </ul>
        </div>
        <p className="mt-8 text-sm">
          <Link href="/" className="text-[#EA580C] font-semibold">Back to TripSage</Link>
        </p>
      </main>
    </LandingLayout>
  )
}
