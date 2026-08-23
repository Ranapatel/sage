import type { Metadata } from 'next'
import LandingLayout from '@/components/layout/LandingLayout'
import SEOContent from '@/components/ui/SEOContent'
import HubNav from '@/components/seo/HubNav'
import Link from 'next/link'
import {
  FileCheck, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight,
  ExternalLink, Calendar, CreditCard, Clock, Plane, Sparkles, UserCheck
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Bali Visa for Indian Citizens (2026 Guide): e-VOA Cost, Requirements & Rules | TripSage',
  description: 'Complete verified guide on Bali visa for Indian passport holders. Check official e-VOA (IDR 500,000), Tourist Levy (IDR 150,000), ECD customs declaration, 30-day stay rules, and extension process.',
  keywords: [
    'Bali visa for Indian citizens',
    'Bali visa on arrival for Indians',
    'Bali e-VOA cost for Indians',
    'Indonesia tourist visa for Indian passport',
    'Bali tourist tax Indian travelers',
    'Bali entry requirements 2026'
  ],
  alternates: {
    canonical: 'https://tripsage.in/visa/bali-visa-for-indian-citizens',
  },
  openGraph: {
    title: 'Bali Visa for Indian Citizens (2026): e-VOA Cost, Requirements & Application Guide',
    description: 'Verified official guidelines on Bali e-VOA fee (IDR 500,000), 30-day validity, tourist levy, and document checklist for Indian travelers.',
    url: 'https://tripsage.in/visa/bali-visa-for-indian-citizens',
    siteName: 'TripSage',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=85',
        width: 1200,
        height: 630,
        alt: 'Bali Visa for Indian Citizens Guide',
      },
    ],
    locale: 'en_IN',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bali Visa for Indian Citizens (2026 Guide): e-VOA Fees & Rules',
    description: 'Official rules on Bali e-VOA, tourist levy, customs form, and 30-day extension rules for Indian travelers.',
    images: ['https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=85'],
  },
}

export default function BaliVisaPage() {
  const publishedDate = '2026-08-15T00:00:00+05:30'
  const lastVerifiedDate = '2026-08-20T00:00:00+05:30'

  return (
    <LandingLayout>
      <SEOContent
        title="Bali Visa for Indian Citizens: Official Requirements, Cost & e-VOA Guide"
        subtitle="Planning your trip to the Island of the Gods? Get up-to-date, verified guidelines on Indonesia e-VOA, on-arrival queues, official government fees, the Bali Tourist Levy, and mandatory customs forms."
        heroImage="https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1920&q=90"
        ctaText="Plan Your Bali Trip Now"
        ctaLink="/plan"
        articleData={{
          author: 'TripSage Travel Editorial Team',
          datePublished: publishedDate,
          dateModified: lastVerifiedDate,
          description: 'Verified guidelines on Indonesia e-VOA for Indian citizens, Bali tourist levy, customs form, and entry rules.',
          image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=85'
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
                  <p className="text-[#6B6B6B]">Reviewed & Fact-Checked by International Travel Specialists</p>
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
                <FileCheck className="w-4 h-4" /> Direct Answer: Do Indians Need a Visa for Bali?
              </div>
              <p className="text-sm font-semibold text-[#1A1A1A] leading-relaxed mb-3">
                <strong>Yes.</strong> Indian passport holders visiting Bali (Indonesia) require a <strong>Tourist Visa on Arrival (VoA)</strong> or an <strong>electronic Visa on Arrival (e-VOA / B1/B213)</strong>. It allows a stay of up to <strong>30 days</strong> and can be extended once for an additional 30 days.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-3 border-t border-[#EA580C]/20">
                <div>
                  <span className="text-[#6B6B6B] block">Official Visa Fee</span>
                  <strong className="text-[#1A1A1A]">IDR 500,000 (~₹2,750)</strong>
                </div>
                <div>
                  <span className="text-[#6B6B6B] block">Bali Tourist Levy</span>
                  <strong className="text-[#1A1A1A]">IDR 150,000 (~₹825)</strong>
                </div>
                <div>
                  <span className="text-[#6B6B6B] block">Allowed Stay</span>
                  <strong className="text-[#1A1A1A]">30 Days (Extendable)</strong>
                </div>
                <div>
                  <span className="text-[#6B6B6B] block">Application Mode</span>
                  <strong className="text-[#1A1A1A]">Online e-VOA / Airport VoA</strong>
                </div>
              </div>
            </div>

            <h2>1. e-VOA vs. Physical VoA at Airport: Which is Better?</h2>
            <p>
              Indian travelers can obtain their Indonesian visa through two official channels:
            </p>
            <ul>
              <li>
                <strong>e-VOA (Recommended):</strong> Applied online via the official Indonesian Immigration portal (<code>molina.imigrasi.go.id</code>) before traveling. You pay online with a credit card, skip the payment counters upon arrival at Denpasar (DPS) airport, and proceed straight through automated e-gates or dedicated immigration lines.
              </li>
              <li>
                <strong>Physical VoA at Airport:</strong> Pay at the designated bank counter inside Denpasar International Airport arrival hall in cash (USD, IDR) or credit card, then join the main immigration queue.
              </li>
            </ul>

            <h2>2. Complete Official Fee Breakdown</h2>
            <div className="overflow-x-auto not-prose my-6 rounded-2xl border border-[#E8E0D8] bg-white shadow-xs">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="bg-[#FFFBF7] border-b border-[#E8E0D8] text-[#1A1A1A] font-extrabold">
                    <th className="p-4">Item</th>
                    <th className="p-4">Official Amount (IDR)</th>
                    <th className="p-4">Approx. Cost (INR)</th>
                    <th className="p-4">Where to Pay</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E0D8]/60 text-[#4A4A4A]">
                  <tr>
                    <td className="p-4 font-bold text-[#1A1A1A]">Tourist Visa on Arrival (30 Days)</td>
                    <td className="p-4">IDR 500,000</td>
                    <td className="p-4 font-semibold text-[#EA580C]">~₹2,750</td>
                    <td className="p-4">Official e-VOA Portal or DPS Airport Counter</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-[#1A1A1A]">Bali Provincial Tourist Levy</td>
                    <td className="p-4">IDR 150,000</td>
                    <td className="p-4 font-semibold text-[#EA580C]">~₹825</td>
                    <td className="p-4">Official Love Bali portal (<code>lovebali.baliprov.go.id</code>)</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-[#1A1A1A]">Electronic Customs Declaration (e-CD)</td>
                    <td className="p-4">Free ($0)</td>
                    <td className="p-4 font-semibold text-green-600">₹0 (Free)</td>
                    <td className="p-4">Official Customs website (<code>ecd.beacukai.go.id</code>)</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-[#1A1A1A]">30-Day Extension Fee (Optional)</td>
                    <td className="p-4">IDR 500,000</td>
                    <td className="p-4 font-semibold text-[#EA580C]">~₹2,750</td>
                    <td className="p-4">Online via Molina portal or local Immigration Office</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>3. Mandatory Document Checklist for Indian Passport Holders</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6 not-prose">
              <div className="p-4 rounded-2xl bg-[#FFFBF7] border border-[#E8E0D8] flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#EA580C] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-sm text-[#1A1A1A] mb-1">Passport Validity (Strict 6 Months)</h4>
                  <p className="text-xs text-[#6B6B6B]">Your Indian passport must have at least 6 months validity from your arrival date and at least two blank pages.</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-[#FFFBF7] border border-[#E8E0D8] flex items-start gap-3">
                <Plane className="w-5 h-5 text-[#EA580C] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-sm text-[#1A1A1A] mb-1">Confirmed Return or Onward Flight</h4>
                  <p className="text-xs text-[#6B6B6B]">A confirmed ticket exiting Indonesia within the 30-day period is required for airline check-in and immigration clearance.</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-[#FFFBF7] border border-[#E8E0D8] flex items-start gap-3">
                <Calendar className="w-5 h-5 text-[#EA580C] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-sm text-[#1A1A1A] mb-1">Confirmed Hotel Booking</h4>
                  <p className="text-xs text-[#6B6B6B]">Proof of stay accommodation in Bali (villas, resorts, or homestays) for your initial days.</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-[#FFFBF7] border border-[#E8E0D8] flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-[#EA580C] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-sm text-[#1A1A1A] mb-1">Electronic Customs QR Code</h4>
                  <p className="text-xs text-[#6B6B6B]">Fill out the e-CD online within 3 days before flight departure to receive a QR code scanned at airport customs.</p>
                </div>
              </div>
            </div>

            <h2>4. Step-by-Step Guide: How to Apply for Bali e-VOA Online</h2>
            <ol>
              <li>
                <strong>Access the Official Website:</strong> Visit only the official Indonesian Immigration website at <code>molina.imigrasi.go.id</code> (avoid unofficial third-party visa agents).
              </li>
              <li>
                <strong>Register Account & Select Visa:</strong> Choose <em>Tourism / Vacation</em> and select <em>B1 - Tourist (Visa on Arrival)</em> for 30 days.
              </li>
              <li>
                <strong>Upload Documents:</strong> Upload a clear digital scan of your passport bio page (PDF/JPEG) and a recent passport-sized photograph.
              </li>
              <li>
                <strong>Pay the Fee:</strong> Pay IDR 500,000 (plus small credit card processing fee) using Visa, Mastercard, or JCB.
              </li>
              <li>
                <strong>Download & Print e-VOA:</strong> Once approved (usually in minutes to 24 hours), download the PDF grant and save a copy on your mobile device.
              </li>
            </ol>

            <h2>5. Common Mistakes Indian Travelers Must Avoid</h2>
            <div className="space-y-3 my-6 not-prose">
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-xs">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-red-900 block font-bold mb-0.5">Fake Visa Websites:</strong>
                  <span className="text-red-800">Only use <code>molina.imigrasi.go.id</code>. Do not pay on third-party sites charging $80-$120 for the $32 visa.</span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-900 block font-bold mb-0.5">Overstay Penalties:</strong>
                  <span className="text-amber-800">Indonesia strictly fines IDR 1,000,000 (~₹5,500) per day for overstaying. Always apply for an extension before day 30.</span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs">
                <AlertTriangle className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block font-bold mb-0.5">Forgetting the Bali Tourist Levy:</strong>
                  <span className="text-slate-800">Pay the IDR 150,000 levy online at <code>lovebali.baliprov.go.id</code> to avoid payment lines upon arrival.</span>
                </div>
              </div>
            </div>

            {/* AI Trip Planner CTA */}
            <div className="my-10 bg-gradient-to-br from-[#FFF4EE] via-[#FFFBF7] to-[#FFF4EE] p-8 rounded-3xl border border-[#EA580C]/40 text-center not-prose shadow-sm">
              <Sparkles className="w-8 h-8 text-[#EA580C] mx-auto mb-3" />
              <h3 className="text-xl font-extrabold text-[#1A1A1A] mb-2">Ready to plan your Bali itinerary?</h3>
              <p className="text-sm text-[#6B6B6B] max-w-xl mx-auto mb-6">
                Use TripSage's AI planner to generate a complete day-by-day Bali travel plan, compare flights from India, and find top villas within your budget.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/plan"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#EA580C] hover:bg-[#C2410C] text-white font-extrabold text-sm rounded-xl shadow-md transition-all"
                >
                  Generate AI Bali Itinerary <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/budget/bali-trip-cost-from-india"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-white border border-[#E8E0D8] hover:bg-slate-50 text-[#1A1A1A] font-bold text-sm rounded-xl transition-all"
                >
                  View Bali Cost Breakdown
                </Link>
              </div>
            </div>

            {/* Official Travel Disclaimer */}
            <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-[#6B6B6B] my-6 not-prose">
              <strong>Official Travel Information Disclaimer:</strong> Visa regulations, government levies, and entry policies are established by the Directorate General of Immigration of Indonesia and provincial authorities. While TripSage verifies information with official sources regularly, rules may change without prior notice. Always verify your entry documents with the official <a href="https://molina.imigrasi.go.id" target="_blank" rel="noopener noreferrer" className="text-[#EA580C] font-semibold underline">Indonesian Immigration portal</a> prior to travel.
            </div>

            {/* Related Guides Links */}
            <h2>Related Bali & International Travel Guides</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6 not-prose">
              <Link href="/budget/bali-trip-cost-from-india" className="p-4 rounded-xl bg-white border border-[#E8E0D8] hover:border-[#EA580C] hover:shadow-xs transition-all flex flex-col justify-between">
                <span className="text-xs font-extrabold text-[#EA580C] uppercase">Budget Guide</span>
                <h4 className="font-extrabold text-sm text-[#1A1A1A] mt-1 mb-2">Bali Trip Cost from India</h4>
                <span className="text-xs font-semibold text-[#6B6B6B] flex items-center gap-1">Read guide <ArrowRight className="w-3 h-3" /></span>
              </Link>
              <Link href="/itineraries/bali-7-day-itinerary-from-india" className="p-4 rounded-xl bg-white border border-[#E8E0D8] hover:border-[#EA580C] hover:shadow-xs transition-all flex flex-col justify-between">
                <span className="text-xs font-extrabold text-[#EA580C] uppercase">Itinerary Guide</span>
                <h4 className="font-extrabold text-sm text-[#1A1A1A] mt-1 mb-2">Bali 7-Day Itinerary from India</h4>
                <span className="text-xs font-semibold text-[#6B6B6B] flex items-center gap-1">Read guide <ArrowRight className="w-3 h-3" /></span>
              </Link>
              <Link href="/visa/thailand-visa-for-indian-citizens" className="p-4 rounded-xl bg-white border border-[#E8E0D8] hover:border-[#EA580C] hover:shadow-xs transition-all flex flex-col justify-between">
                <span className="text-xs font-extrabold text-[#EA580C] uppercase">Visa Guide</span>
                <h4 className="font-extrabold text-sm text-[#1A1A1A] mt-1 mb-2">Thailand Visa for Indians</h4>
                <span className="text-xs font-semibold text-[#6B6B6B] flex items-center gap-1">Read guide <ArrowRight className="w-3 h-3" /></span>
              </Link>
            </div>
          </>
        }
        faqs={[
          {
            question: "Is Bali visa-free for Indian passport holders?",
            answer: "No, Bali is not completely visa-free for Indians. Indian passport holders are eligible for a Visa on Arrival (VoA) or electronic Visa on Arrival (e-VOA) which costs IDR 500,000 (~₹2,750) and permits a 30-day stay."
          },
          {
            question: "How much is the Bali visa fee for Indians in INR?",
            answer: "The official e-VOA fee is IDR 500,000, which is approximately ₹2,700 - ₹2,800 INR (subject to currency exchange rate fluctuations), plus a nominal credit card transaction fee."
          },
          {
            question: "What is the official website to apply for Bali e-VOA?",
            answer: "The only official Indonesian government website for applying for an e-VOA is molina.imigrasi.go.id. Avoid third-party commercial portals that charge inflated fees."
          },
          {
            question: "Can I extend my Bali 30-day tourist visa?",
            answer: "Yes, the 30-day e-VOA/VoA can be extended once for an additional 30 days (total 60 days) either online through the official Molina portal or in person at a local Indonesian immigration office for IDR 500,000."
          },
          {
            question: "What is the Bali Tourist Tax (Levy) and do Indians need to pay it?",
            answer: "Yes, all international tourists entering Bali must pay the provincial tourist levy of IDR 150,000 (~₹825 INR) per person. It can be paid online prior to departure on the official lovebali.baliprov.go.id website."
          }
        ]}
      />
      <HubNav />
    </LandingLayout>
  )
}
