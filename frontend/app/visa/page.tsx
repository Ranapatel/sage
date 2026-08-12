import type { Metadata } from 'next'
import LandingLayout from '@/components/layout/LandingLayout'
import SEOContent from '@/components/ui/SEOContent'
import HubNav from '@/components/seo/HubNav'
import Link from 'next/link'
import { FileCheck, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, ExternalLink } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Global Visa Requirements & Travel Entry Guides | TripSage',
  description: 'Check visa requirements, Visa on Arrival (VoA) rules, e-Visa application processes, and entry guidelines for Indian travelers heading to Thailand, Bali, Dubai, Singapore, Vietnam, and more.',
  keywords: ['visa guide for Indian passport', 'Thailand visa on arrival', 'Bali eVisa cost', 'Dubai tourist visa rules', 'Singapore visa requirements', 'Vietnam eVisa application', 'TripSage visa hub'],
  alternates: {
    canonical: 'https://tripsage.in/visa',
  },
  openGraph: {
    title: 'Global Visa Requirements & Travel Entry Guides | TripSage',
    description: 'Check visa requirements, Visa on Arrival (VoA) rules, e-Visa application processes, and official entry guidelines with TripSage.',
    url: 'https://tripsage.in/visa',
    siteName: 'TripSage',
    images: [
      {
        url: 'https://tripsage.in/logo.png',
        width: 1200,
        height: 630,
        alt: 'TripSage Visa Requirements & Entry Guides',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Global Visa Requirements & Travel Entry Guides | TripSage',
    description: 'Check visa rules, VoA fees, e-Visa forms, and document checklists on TripSage.',
    images: ['https://tripsage.in/logo.png'],
  },
}

export default function VisaHubPage() {
  const visaDestinations = [
    { country: 'Thailand', type: 'Visa-Free / VoA', fee: 'Free / 2,000 THB', stay: '30 Days', processing: 'Instant / Online' },
    { country: 'Bali (Indonesia)', type: 'Visa on Arrival (e-VoA)', fee: '500,000 IDR (~$35)', stay: '30 Days', processing: 'Instant at airport' },
    { country: 'Dubai (UAE)', type: 'Pre-arranged eVisa', fee: '~$90 - $110', stay: '30 Days', processing: '2 - 4 Working Days' },
    { country: 'Singapore', type: 'Paper eVisa via Agent', fee: '30 SGD + Agent fee', stay: '30 Days', processing: '3 - 5 Working Days' },
    { country: 'Vietnam', type: 'Online e-Visa', fee: '25 USD', stay: '30 - 90 Days', processing: '3 Working Days' },
    { country: 'Sri Lanka', type: 'ETA (Online)', fee: '~$20 - $50', stay: '30 Days', processing: '24 - 48 Hours' },
  ]

  return (
    <LandingLayout>
      <SEOContent
        title="Global Visa Requirements & Entry Guides for Travelers"
        subtitle="Navigate international travel requirements with confidence. Access verified guidelines on e-Visas, Visa-on-Arrival, entry forms, passport validity, and mandatory travel documents."
        heroImage="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1920&q=90"
        ctaText="Explore Complete Visa Guide"
        ctaLink="/visa-guide"
        content={
          <>
            <h2>Essential International Visa Categories</h2>
            <p>
              Understanding entry policies before booking international flights is essential for hassle-free travel. <strong>TripSage</strong> outlines verified entry rules and processing times for top destination countries.
            </p>

            {/* Destination Visa Overview Table */}
            <div className="my-8 overflow-x-auto not-prose rounded-2xl border border-[#E8E0D8] bg-white shadow-xs">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="bg-[#FFFBF7] border-b border-[#E8E0D8] text-[#1A1A1A] font-extrabold">
                    <th className="p-4">Destination</th>
                    <th className="p-4">Visa Category</th>
                    <th className="p-4">Approx. Fee</th>
                    <th className="p-4">Allowed Stay</th>
                    <th className="p-4">Processing Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E0D8]/60 text-[#4A4A4A]">
                  {visaDestinations.map((v, i) => (
                    <tr key={i} className="hover:bg-[#FFFBF7]/80 transition-colors">
                      <td className="p-4 font-bold text-[#1A1A1A]">{v.country}</td>
                      <td className="p-4">
                        <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-orange-50 text-[#EA580C] border border-[#EA580C]/20">
                          {v.type}
                        </span>
                      </td>
                      <td className="p-4 font-medium">{v.fee}</td>
                      <td className="p-4">{v.stay}</td>
                      <td className="p-4">{v.processing}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2>Mandatory Entry Checklists for International Travelers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6 not-prose">
              <div className="p-5 rounded-2xl bg-[#FFFBF7] border border-[#E8E0D8] flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#EA580C] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-extrabold text-sm text-[#1A1A1A] mb-1">Passport Validity</h3>
                  <p className="text-xs text-[#6B6B6B]">Your passport must have at least 6 months validity remaining from your scheduled date of return, plus at least 2 blank pages.</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#FFFBF7] border border-[#E8E0D8] flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#EA580C] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-extrabold text-sm text-[#1A1A1A] mb-1">Confirmed Return Tickets</h3>
                  <p className="text-xs text-[#6B6B6B]">Immigration authorities require proof of return or onward travel tickets prior to boarding international flights.</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#FFFBF7] border border-[#E8E0D8] flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#EA580C] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-extrabold text-sm text-[#1A1A1A] mb-1">Accommodation Booking</h3>
                  <p className="text-xs text-[#6B6B6B]">A confirmed hotel voucher or host invitation letter is required for visa applications and immigration clearance.</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#FFFBF7] border border-[#E8E0D8] flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#EA580C] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-extrabold text-sm text-[#1A1A1A] mb-1">Sufficient Means of Subsistence</h3>
                  <p className="text-xs text-[#6B6B6B]">Immigration officers may request proof of adequate funds (cash, credit cards, or bank statements) for the duration of stay.</p>
                </div>
              </div>
            </div>

            <h2>Detailed Visa Breakdown & Regulations</h2>
            <p>
              To view step-by-step instructions, official portal links, photo specifications, and detailed entry documentation for specific countries, visit our dedicated <Link href="/visa-guide">Visa Guide Portal</Link>.
            </p>

            <div className="my-8 bg-[#FFF4EE] p-8 rounded-3xl border border-[#EA580C]/30 text-center not-prose">
              <FileCheck className="w-8 h-8 text-[#EA580C] mx-auto mb-3" />
              <h3 className="text-xl font-extrabold text-[#1A1A1A] mb-2">Check destination visa rules & plan your trip</h3>
              <p className="text-sm text-[#6B6B6B] max-w-xl mx-auto mb-6">
                Use TripSage to plan your itinerary while keeping track of visa deadlines and entry documentation.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/visa-guide"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#EA580C] hover:bg-[#C2410C] text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
                >
                  View Full Visa Guide <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/plan"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#1A1A1A] hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
                >
                  Plan Trip Now <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </>
        }
        faqs={[
          {
            question: "What is the difference between Visa on Arrival and e-Visa?",
            answer: "Visa on Arrival (VoA) is processed at the airport upon arrival in the destination country. An e-Visa is applied for online prior to departure and issued electronically."
          },
          {
            question: "Does TripSage apply for visas directly on my behalf?",
            answer: "TripSage provides up-to-date entry rules, document checklists, and direct links to official government application portals. We do not charge processing markups or act as a visa agency."
          },
          {
            question: "How long should my passport be valid when traveling internationally?",
            answer: "Almost all international destinations require your passport to have at least 6 months validity remaining beyond your intended return date."
          }
        ]}
      />
      <HubNav />
    </LandingLayout>
  )
}
