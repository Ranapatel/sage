import type { Metadata } from 'next'
import LandingLayout from '@/components/layout/LandingLayout'
import SEOContent from '@/components/ui/SEOContent'
import HubNav from '@/components/seo/HubNav'
import Link from 'next/link'
import {
  FileCheck, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight,
  ExternalLink, Calendar, CreditCard, Clock, Plane, Sparkles, UserCheck, Banknote
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Thailand Visa for Indian Citizens (2026 Guide): 60-Day Exemption, Rules & Checklist | TripSage',
  description: 'Official verified guide on Thailand visa for Indian passport holders. Check 60-day visa exemption scheme (Free/₹0), entry rules, 20,000 THB proof of funds requirement, 30-day extension process, and document checklist.',
  keywords: [
    'Thailand visa for Indian citizens',
    'is Thailand visa free for Indians',
    'Thailand 60 days visa exemption India',
    'Thailand visa on arrival fee for Indians',
    'Thailand immigration funds proof requirement',
    'Bangkok Phuket entry rules Indian passport'
  ],
  alternates: {
    canonical: 'https://tripsage.in/visa/thailand-visa-for-indian-citizens',
  },
  openGraph: {
    title: 'Thailand Visa for Indian Citizens (2026): 60-Day Visa Exemption & Official Rules',
    description: 'Official rules on Thailand 60-day visa exemption for Indian passport holders. Fee (Free), funds proof, return flight rules, and 30-day extensions.',
    url: 'https://tripsage.in/visa/thailand-visa-for-indian-citizens',
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
    title: 'Thailand Visa for Indian Citizens (2026): 60-Day Exemption & Checklist',
    description: 'Verified guidelines on Thailand visa-free entry, 60-day stay, extension rules, and document requirements for Indian travelers.',
    images: ['https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1200&q=85'],
  },
}

export default function ThailandVisaPage() {
  const publishedDate = '2026-08-15T00:00:00+05:30'
  const lastVerifiedDate = '2026-08-20T00:00:00+05:30'

  return (
    <LandingLayout>
      <SEOContent
        title="Thailand Visa for Indian Citizens: 60-Day Visa Exemption, Rules & Checklist"
        subtitle="Heading to Bangkok, Phuket, or Krabi? Learn all about the official 60-day visa exemption scheme for Indian passport holders, airport entry procedures, proof of funds requirements, and extension rules."
        heroImage="https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1920&q=90"
        ctaText="Plan Your Thailand Trip"
        ctaLink="/plan"
        articleData={{
          author: 'TripSage Travel Editorial Team',
          datePublished: publishedDate,
          dateModified: lastVerifiedDate,
          description: 'Official rules on Thailand 60-day visa exemption for Indian passport holders, fee, document checklist, and funds proof.',
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
                  <p className="text-[#6B6B6B]">Reviewed & Fact-Checked by International Immigration Specialists</p>
                </div>
              </div>
              <div className="flex sm:flex-col items-center sm:items-end gap-2 text-[#6B6B6B]">
                <span><strong>Published:</strong> August 2026</span>
                <span><strong>Last Verified:</strong> August 2026</span>
              </div>
            </div>

            {/* Direct Answer Summary Box */}
            <div className="my-6 p-6 rounded-3xl bg-[#FFF4EE] border border-[#EA580C]/30 not-prose">
              <div className="flex items-center gap-2 mb-2 text-[#EA580C] font-extrabold text-sm uppercase tracking-wider">
                <FileCheck className="w-4 h-4" /> Direct Answer: Do Indians Need a Visa for Thailand?
              </div>
              <p className="text-sm font-semibold text-[#1A1A1A] leading-relaxed mb-3">
                <strong>No visa application is required prior to travel.</strong> Under the official <strong>Visa Exemption Scheme</strong>, Indian passport holders can enter Thailand for tourism for up to <strong>60 days without paying any visa fee (Free / ₹0)</strong>. It can also be extended once in Thailand for an additional 30 days.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-3 border-t border-[#EA580C]/20">
                <div>
                  <span className="text-[#6B6B6B] block">Visa Fee</span>
                  <strong className="text-green-600 font-extrabold text-sm">₹0 (Free Exemption)</strong>
                </div>
                <div>
                  <span className="text-[#6B6B6B] block">Permitted Stay</span>
                  <strong className="text-[#1A1A1A]">60 Days (Extendable)</strong>
                </div>
                <div>
                  <span className="text-[#6B6B6B] block">Entry Ports</span>
                  <strong className="text-[#1A1A1A]">All Int'l Airports & Borders</strong>
                </div>
                <div>
                  <span className="text-[#6B6B6B] block">Funds Requirement</span>
                  <strong className="text-[#1A1A1A]">20,000 THB / Person</strong>
                </div>
              </div>
            </div>

            <h2>1. Key Features of the 60-Day Thailand Visa Exemption</h2>
            <p>
              The Royal Thai Government established the expanded 60-day visa exemption policy to boost international tourism. Here is how it functions for Indian travelers:
            </p>
            <ul>
              <li>
                <strong>No Advance Application:</strong> You do not need to visit a Thai embassy, apply on third-party websites, or pay any agent fees.
              </li>
              <li>
                <strong>Direct Immigration Clearance:</strong> Proceed directly to the main immigration counters at Bangkok (Suvarnabhumi BKK / Don Mueang DMK), Phuket (HKT), or Chiang Mai (CNX) airports. The immigration officer will stamp an entry permit valid for 60 days in your passport.
              </li>
              <li>
                <strong>Extendable for 30 Days:</strong> If you wish to extend your stay beyond 60 days, you can apply at any local Thai Immigration Office for 1,900 THB (~₹4,500), granting a total stay of up to 90 days.
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
                  <p className="text-xs text-[#6B6B6B]">A confirmed commercial flight ticket exiting Thailand within 60 days of entry. Required by both airlines at boarding and Thai immigration.</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-[#FFFBF7] border border-[#E8E0D8] flex items-start gap-3">
                <Calendar className="w-5 h-5 text-[#EA580C] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-sm text-[#1A1A1A] mb-1">Proof of Accommodation</h4>
                  <p className="text-xs text-[#6B6B6B]">Confirmed hotel or resort booking vouchers for your initial stay in Thailand.</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-[#FFFBF7] border border-[#E8E0D8] flex items-start gap-3">
                <Banknote className="w-5 h-5 text-[#EA580C] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-sm text-[#1A1A1A] mb-1">Proof of Adequate Living Funds</h4>
                  <p className="text-xs text-[#6B6B6B]">Minimum of <strong>20,000 THB per person</strong> (~₹47,000) or <strong>40,000 THB per family</strong> (~₹94,000) in cash, traveler's cheques, or bank statements upon spot-check.</p>
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
                <strong>Receive 60-Day Stamp:</strong> The officer will stamp your passport with your permitted date of stay (60 days from arrival). Verify the date stamped before leaving the counter.
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
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-900 block font-bold mb-0.5">Carrying Insufficient Living Expenses:</strong>
                  <span className="text-amber-800">While spot-checks are random, Thai immigration regulations mandate proof of 20,000 THB in cash or equivalent currency per solo traveler.</span>
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
            question: "Is Thailand visa-free for Indian passport holders?",
            answer: "Yes, Indian passport holders can enter Thailand without applying for a visa in advance under the 60-Day Visa Exemption Scheme. Entry is free (₹0 visa fee) at all international airports and checkpoints."
          },
          {
            question: "How many days can Indian tourists stay in Thailand without a visa?",
            answer: "Indian citizens receive a stamp permitting up to 60 days upon arrival. This can be extended once for an additional 30 days at a local Thai immigration office for 1,900 THB (~₹4,500)."
          },
          {
            question: "Is proof of funds (20,000 THB) mandatory for Indians entering Thailand?",
            answer: "Yes, Thai immigration law requires each foreign tourist to have proof of adequate funds—at least 20,000 THB per solo traveler or 40,000 THB per family (or equivalent in USD/INR/credit cards)—in case of random immigration spot-checks."
          },
          {
            question: "Do Indians need to fill out the TM6 paper arrival card at Thai airports?",
            answer: "No, the TM6 arrival card requirement is currently suspended for air arrivals at all major international airports in Thailand."
          },
          {
            question: "Can I extend my 60-day Thailand visa exemption while in Thailand?",
            answer: "Yes, you can extend your stay by an additional 30 days before your initial 60 days expire by visiting any Thai Immigration Bureau office (such as in Bangkok, Phuket, Pattaya, or Chiang Mai) and paying the 1,900 THB processing fee."
          }
        ]}
      />
      <HubNav />
    </LandingLayout>
  )
}
