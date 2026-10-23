import type { Metadata } from 'next'
import LandingLayout from '@/components/layout/LandingLayout'
import SEOContent from '@/components/ui/SEOContent'
import HubNav from '@/components/seo/HubNav'
import Link from 'next/link'
import {
  FileCheck, ShieldCheck, AlertTriangle, ArrowRight,
  Calendar, Plane, Sparkles, UserCheck
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Thailand Visa for Indians 2026: 30-Day Visa Exemption',
  description: 'Indian passport holders can visit Thailand visa-free for tourism for up to 30 days from 15 Sep 2026, per the Royal Thai Embassy. Checked 23 Oct 2026.',
  keywords: [
    'Thailand visa for Indian citizens',
    'is Thailand visa free for Indians',
    'Thailand 30 day visa exemption India',
    'Thailand visa exemption from 15 September 2026',
    'Royal Thai Embassy New Delhi visa exemption',
    'Bangkok Phuket entry rules Indian passport'
  ],
  alternates: {
    canonical: 'https://www.tripsage.in/visa/thailand-visa-for-indian-citizens',
  },
  openGraph: {
    title: 'Thailand Visa for Indians 2026: 30-Day Visa Exemption',
    description: 'Indian passport holders can visit Thailand visa-free for tourism for up to 30 days from 15 Sep 2026, per the Royal Thai Embassy. Checked 23 Oct 2026.',
    url: 'https://www.tripsage.in/visa/thailand-visa-for-indian-citizens',
    siteName: 'TripSage',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1200&q=85',
        width: 1200,
        height: 630,
        alt: 'Thailand Visa for Indian Citizens Guide',
      },
    ],
    locale: 'en_IN',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Thailand Visa for Indians 2026: 30-Day Visa Exemption',
    description: 'Indian passport holders can visit Thailand visa-free for tourism for up to 30 days from 15 Sep 2026. Checked 23 Oct 2026.',
    images: ['https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1200&q=85'],
  },
}

export default function ThailandVisaPage() {
  const publishedDate = '2026-08-15T00:00:00+05:30'
  const lastVerifiedDate = '2026-10-22T00:00:00+05:30'

  return (
    <LandingLayout>
      <SEOContent
        title="Thailand Visa for Indian Citizens: 30-Day Visa Exemption (from 15 Sep 2026)"
        subtitle="Heading to Bangkok, Phuket, or Krabi? Indian ordinary-passport holders can enter Thailand for tourism for up to 30 days from 15 September 2026, per the Royal Thai Embassy in New Delhi."
        heroImage="https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1920&q=90"
        ctaText="Plan Your Thailand Trip"
        ctaLink="/plan"
        articleData={{
          author: 'TripSage Travel Editorial Team',
          datePublished: publishedDate,
          dateModified: lastVerifiedDate,
          description: 'Indian passport holders can visit Thailand visa-free for tourism for up to 30 days from 15 Sep 2026, per the Royal Thai Embassy. Checked 23 Oct 2026.',
          image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1200&q=85'
        }}
        content={
          <>
            {/* Author & Verification Meta Box */}
            <div className="not-prose bg-[#FFFBF7] border border-[#E8E0D8] rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 text-[#EA580C] flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-extrabold text-[#1A1A1A]">Written by TripSage Travel Editorial Team</p>
                  <p className="text-[#6B6B6B]">Facts checked against the Royal Thai Embassy, New Delhi on 23 Oct 2026 by the TripSage team</p>
                </div>
              </div>
              <div className="flex sm:flex-col items-center sm:items-end gap-2 text-[#6B6B6B]">
                <span><strong>Published:</strong> August 2026</span>
                <span><strong>Last checked:</strong> 23 October 2026</span>
              </div>
            </div>

            {/* Direct Answer Summary Box */}
            <div className="my-6 p-6 rounded-3xl bg-[#FFF4EE] border border-[#EA580C]/30 not-prose">
              <div className="flex items-center gap-2 mb-2 text-[#EA580C] font-extrabold text-sm uppercase tracking-wider">
                <FileCheck className="w-4 h-4" /> Direct Answer: Do Indians Need a Visa for Thailand?
              </div>
              <p className="text-sm font-semibold text-[#1A1A1A] leading-relaxed mb-3">
                <strong>Do Indians need a visa for Thailand?</strong> No, not for a short tourist trip. Under the 30-day visa exemption scheme, Indian ordinary-passport holders entering Thailand for tourism can stay up to <strong>30 days</strong>. The scheme took effect on <strong>15 September 2026</strong> (Royal Thai Embassy, New Delhi). For a longer stay or another purpose, check the embassy&apos;s visa page before you travel. <em>Last checked: 23 October 2026. Source: newdelhi.thaiembassy.org.</em>
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-3 border-t border-[#EA580C]/20">
                <div>
                  <span className="text-[#6B6B6B] block">Visa Fee</span>
                  <strong className="text-green-600 font-extrabold text-sm">Free</strong>
                </div>
                <div>
                  <span className="text-[#6B6B6B] block">Permitted Stay</span>
                  <strong className="text-[#1A1A1A]">30 Days</strong>
                </div>
                <div>
                  <span className="text-[#6B6B6B] block">Entry Ports</span>
                  <strong className="text-[#1A1A1A]">All Int&apos;l Airports & Borders</strong>
                </div>
              </div>
            </div>

            <h2>1. Key Features of the 30-Day Thailand Visa Exemption</h2>
            <p>
              From 15 September 2026, the Royal Thai Embassy in New Delhi describes a 30-day visa exemption for Indian ordinary-passport holders entering for tourism. Here is how that works:
            </p>
            <ul>
              <li>
                <strong>No Advance Application:</strong> You do not need to visit a Thai embassy, apply on third-party websites, or pay any agent fees for this short tourist stay.
              </li>
              <li>
                <strong>Direct Immigration Clearance:</strong> Proceed directly to the main immigration counters at Bangkok (Suvarnabhumi BKK / Don Mueang DMK), Phuket (HKT), or Chiang Mai (CNX) airports. The permitted stay under this exemption is 30 days.
              </li>
              <li>
                <strong>Longer stays:</strong> For a longer stay or a purpose other than tourism, check the embassy&apos;s visa page before you travel. TripSage has not confirmed an in-country extension or a funds figure for this 30-day scheme.
              </li>
            </ul>

            <h2>2. Mandatory Document Checklist for Immigration Clearance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6 not-prose">
              <div className="p-4 rounded-2xl bg-[#FFFBF7] border border-[#E8E0D8] flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#EA580C] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-sm text-[#1A1A1A] mb-1">Passport Validity (6 Months Minimum)</h4>
                  <p className="text-xs text-[#6B6B6B]">Your Indian passport must be in good condition with at least 6 months validity from the arrival date and at least two blank visa pages.</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-[#FFFBF7] border border-[#E8E0D8] flex items-start gap-3">
                <Plane className="w-5 h-5 text-[#EA580C] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-sm text-[#1A1A1A] mb-1">Confirmed Return or Onward Ticket</h4>
                  <p className="text-xs text-[#6B6B6B]">A confirmed ticket out of Thailand. Airlines and Thai immigration can ask for it at boarding or on arrival. Checked 23 Oct 2026.</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-[#FFFBF7] border border-[#E8E0D8] flex items-start gap-3">
                <Calendar className="w-5 h-5 text-[#EA580C] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-sm text-[#1A1A1A] mb-1">Proof of Accommodation</h4>
                  <p className="text-xs text-[#6B6B6B]">Confirmed hotel or resort booking vouchers for your initial stay in Thailand.</p>
                </div>
              </div>
            </div>

            <h2>3. TM6 Arrival Card & Customs Rules</h2>
            <p>
              The physical paper TM6 Arrival/Departure Card has been <strong>temporarily suspended</strong> for foreign travelers entering Thailand via international airports (Bangkok, Phuket, Krabi, Chiang Mai). You only need your boarding pass and passport when presenting yourself at the immigration checkpoint.
            </p>

            <h2>4. Step-by-Step Airport Arrival Flow</h2>
            <ol>
              <li>
                <strong>Deplane & Follow Signs:</strong> Follow the signs for <em>Immigration / Arrivals</em> at the terminal.
              </li>
              <li>
                <strong>Bypass VoA Payment Counters:</strong> Do NOT join the old Visa-on-Arrival payment queue. Go straight to the standard <em>Foreign Passport Holders</em> immigration line.
              </li>
              <li>
                <strong>Biometric Verification:</strong> Present your passport and return boarding pass. The immigration officer will take your fingerprint scan and photograph.
              </li>
              <li>
                <strong>Check the Stay Date:</strong> The officer stamps the permitted date of stay. Under the exemption in force from 15 September 2026, that stay is 30 days. Verify the date before you leave the counter.
              </li>
              <li>
                <strong>Baggage & Customs:</strong> Collect your checked baggage and proceed through the Green Customs Channel (Nothing to Declare).
              </li>
            </ol>

            <h2>5. Critical Mistakes Indian Travelers Must Avoid</h2>
            <div className="space-y-3 my-6 not-prose">
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-xs">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-red-900 block font-bold mb-0.5">Paying Unnecessary Third-Party Fees:</strong>
                  <span className="text-red-800">Scam websites and rogue travel agents often charge ₹3,000–₹5,000 claiming to issue a "Thailand Tourist Visa". Entry under the exemption is completely free.</span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs">
                <AlertTriangle className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block font-bold mb-0.5">Strict Overstay Penalties:</strong>
                  <span className="text-slate-800">Overstaying in Thailand incurs a fine of 500 THB per day (up to a maximum of 20,000 THB) and risks blacklisting from future entry.</span>
                </div>
              </div>
            </div>

            {/* AI Trip Planner CTA */}
            <div className="my-10 bg-gradient-to-br from-[#FFF4EE] via-[#FFFBF7] to-[#FFF4EE] p-8 rounded-3xl border border-[#EA580C]/40 text-center not-prose shadow-sm">
              <Sparkles className="w-8 h-8 text-[#EA580C] mx-auto mb-3" />
              <h3 className="text-xl font-extrabold text-[#1A1A1A] mb-2">Ready to plan your Thailand vacation?</h3>
              <p className="text-sm text-[#6B6B6B] max-w-xl mx-auto mb-6">
                Generate an intelligent day-by-day plan for Bangkok, Phuket, Krabi, or Pattaya. Compare cheap flights and hotels within your budget on TripSage.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/plan"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#EA580C] hover:bg-[#C2410C] text-white font-extrabold text-sm rounded-xl shadow-md transition-all"
                >
                  Plan Thailand Trip with AI <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/destinations"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-white border border-[#E8E0D8] hover:bg-slate-50 text-[#1A1A1A] font-bold text-sm rounded-xl transition-all"
                >
                  Explore Destinations
                </Link>
              </div>
            </div>

            {/* Official Travel Disclaimer */}
            <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-[#6B6B6B] my-6 not-prose">
              <strong>Official Travel Information Disclaimer:</strong> Visa exemption regulations, duration of permitted stay, and entry criteria are determined exclusively by the Ministry of Foreign Affairs of Thailand and the Royal Thai Immigration Bureau. Policies may be revised by bilateral decree. Always verify documentation requirements on official government websites prior to your departure.
            </div>

            {/* Related Guides Links */}
            <h2>Related Visa & International Travel Guides</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6 not-prose">
              <Link href="/visa/bali-visa-for-indian-citizens" className="p-4 rounded-xl bg-white border border-[#E8E0D8] hover:border-[#EA580C] hover:shadow-xs transition-all flex flex-col justify-between">
                <span className="text-xs font-extrabold text-[#EA580C] uppercase">Visa Guide</span>
                <h4 className="font-extrabold text-sm text-[#1A1A1A] mt-1 mb-2">Bali Visa for Indian Citizens</h4>
                <span className="text-xs font-semibold text-[#6B6B6B] flex items-center gap-1">Read guide <ArrowRight className="w-3 h-3" /></span>
              </Link>
              <Link href="/budget/bali-trip-cost-from-india" className="p-4 rounded-xl bg-white border border-[#E8E0D8] hover:border-[#EA580C] hover:shadow-xs transition-all flex flex-col justify-between">
                <span className="text-xs font-extrabold text-[#EA580C] uppercase">Budget Guide</span>
                <h4 className="font-extrabold text-sm text-[#1A1A1A] mt-1 mb-2">Bali Trip Cost from India</h4>
                <span className="text-xs font-semibold text-[#6B6B6B] flex items-center gap-1">Read guide <ArrowRight className="w-3 h-3" /></span>
              </Link>
              <Link href="/guides/dubai-trip-planner-from-india" className="p-4 rounded-xl bg-white border border-[#E8E0D8] hover:border-[#EA580C] hover:shadow-xs transition-all flex flex-col justify-between">
                <span className="text-xs font-extrabold text-[#EA580C] uppercase">Trip Planner</span>
                <h4 className="font-extrabold text-sm text-[#1A1A1A] mt-1 mb-2">Dubai Trip Planner from India</h4>
                <span className="text-xs font-semibold text-[#6B6B6B] flex items-center gap-1">Read guide <ArrowRight className="w-3 h-3" /></span>
              </Link>
            </div>
          </>
        }
        faqs={[
          {
            question: "Do Indians need a visa for Thailand?",
            answer: "No, not for a short tourist trip. Under the 30-day visa exemption, Indian ordinary-passport holders can stay up to 30 days. The scheme took effect on 15 September 2026 (Royal Thai Embassy, New Delhi). Checked 23 October 2026."
          },
          {
            question: "How many days can Indian tourists stay in Thailand without a visa?",
            answer: "Up to 30 days for tourism under the exemption that took effect on 15 September 2026. For a longer stay or another purpose, check the Royal Thai Embassy visa page before you travel."
          },

          {
            question: "Do Indians need to fill out the TM6 paper arrival card at Thai airports?",
            answer: "No, the TM6 arrival card requirement is currently suspended for air arrivals at all major international airports in Thailand."
          },
          {
            question: "What if I need to stay in Thailand longer than 30 days?",
            answer: "For a longer stay or another purpose, check the Royal Thai Embassy visa page before you travel. An in-country extension and a funds figure were not confirmed for this 30-day scheme. Last checked 23 October 2026."
          }
        ]}
      />
      <HubNav />
    </LandingLayout>
  )
}
