import type { Metadata } from 'next'
import LandingLayout from '@/components/layout/LandingLayout'
import SEOContent from '@/components/ui/SEOContent'
import Link from 'next/link'
import ScooterIdpNote from '@/components/content/ScooterIdpNote'
import { Sparkles, ArrowRight, ShieldCheck, Globe, Plane, Wallet, FileText, CheckCircle2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Cheapest International Trips from India | TripSage',
  description: 'Lower-cost international trips from India, including Vietnam, Thailand, Bali, Sri Lanka, Nepal and Malaysia, with visa notes.',
  keywords: ['cheapest international trips from India', 'budget foreign trips', 'low cost foreign travel', 'cheap countries to visit from India', 'international trips under 50000', 'budget international holidays from India'],
  alternates: { canonical: 'https://www.tripsage.in/seo/cheapest-international-trips-from-india' },
  openGraph: {
    title: 'Cheapest International Trips from India | TripSage',
    description: 'Expert verified guide to the most affordable foreign holidays for Indian travelers. Itemized costs, cheap flights, visa rules, and day plans.',
    url: 'https://www.tripsage.in/seo/cheapest-international-trips-from-india',
    siteName: 'TripSage',
    images: [{ url: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=1200&q=85', width: 1200, height: 630, alt: 'Cheapest International Trips from India' }],
    locale: 'en_IN',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cheapest International Trips from India | TripSage',
    description: 'Complete 2026 guide: Vietnam, Thailand, Bali, Sri Lanka, Nepal, Malaysia under ₹45k all-inclusive.',
    images: ['https://images.unsplash.com/photo-1528127269322-539801943592?w=1200&q=85'],
  },
}

export default function Page() {
  const publishedDate = '2026-08-01T00:00:00+05:30'
  const lastVerifiedDate = '2026-10-01T00:00:00+05:30'

  return (
    <LandingLayout>
      <SEOContent
        title="Cheapest International Trips from India: 6 Countries Under ₹40,000–₹50,000"
        subtitle="Think you cannot afford a foreign vacation? Think again. Discover the top 6 international countries where the Indian Rupee goes further, complete with round-trip flight prices, visa rules, and daily budgets."
        heroImage="https://images.unsplash.com/photo-1528127269322-539801943592?w=1920&q=90"
        ctaText="Plan with TripSage"
        ctaLink="/plan"
        articleData={{
          author: 'TripSage International Budget Desk',
          datePublished: publishedDate,
          dateModified: lastVerifiedDate,
          description: 'A comprehensive 2026 cost comparison of the 6 cheapest international travel destinations for Indian tourists with flight hacks and visa guidance.',
        }}
        destinationName="International"
        content={
          <>
            <h2>The Top 6 Budget-Friendly International Destinations for Indians</h2>
            <p>
              Planning an international holiday from India does not require lakhs of rupees. In 2026, multiple neighboring destinations in Southeast Asia and South Asia offer all-inclusive 5-to-7 day vacations for under ₹40,000 to ₹50,000 per person, including round-trip flights. The top 6 cheapest international destinations for Indian travelers are: Vietnam (flights from ₹15k, daily cost ₹1,800), Thailand (30-day visa exemption from 15 Sep 2026, flights from ₹14k, daily cost ₹2,200), Bali (flights from ₹20k, daily cost ₹2,500), Sri Lanka (flights from ₹12k, daily cost ₹2,000), Nepal (no passport/visa required for Indians, budget from ₹15k), and Malaysia (visa-free for up to 30 days until 31 Dec 2026, with MDAC before arrival; flights from ₹16k).
            </p>
            <p>
              With our <Link href="/ai-trip-planner">AI trip planner</Link>, you can draft a day-by-day plan for one destination, with a rupee estimate and visa notes. It does not compare live airfares or book hotels.
            </p>

            {/* Comparison Table */}
            <div className="my-8 overflow-x-auto not-prose">
              <table className="w-full text-left border-collapse bg-white rounded-2xl overflow-hidden shadow-xs border border-[#E8E0D8]">
                <thead>
                  <tr className="bg-[#FFF4EE] border-b border-[#E8E0D8] text-[#1A1A1A] text-xs font-black uppercase tracking-wider">
                    <th className="py-3 px-4">Country</th>
                    <th className="py-3 px-4">Return Flight Range</th>
                    <th className="py-3 px-4">Daily Expense (Stay + Food)</th>
                    <th className="py-3 px-4">Visa Status for Indians</th>
                    <th className="py-3 px-4">5-Day All-Inclusive Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E0D8] text-xs text-[#57534E]">
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#1A1A1A]">Vietnam (Hanoi &amp; Da Nang)</td>
                    <td className="py-3 px-4 font-bold text-[#EA580C]">₹14,000 – ₹18,000</td>
                    <td className="py-3 px-4">₹1,500 – ₹2,200 / day</td>
                    <td className="py-3 px-4">Simple eVisa ($25 / ~₹2,100)</td>
                    <td className="py-3 px-4 font-bold text-emerald-700">₹32,000 – ₹42,000</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#1A1A1A]">Thailand (Bangkok &amp; Phuket)</td>
                    <td className="py-3 px-4 font-bold text-[#EA580C]">₹13,000 – ₹17,000</td>
                    <td className="py-3 px-4">₹2,000 – ₹2,800 / day</td>
                    <td className="py-3 px-4">Visa exemption, up to 30 days from 15 Sep 2026 (check <Link href="/visa/thailand-visa-for-indian-citizens" className="text-[#EA580C] underline">rules</Link>)</td>
                    <td className="py-3 px-4 font-bold text-emerald-700">₹30,000 – ₹40,000</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#1A1A1A]">Sri Lanka (Colombo &amp; Galle)</td>
                    <td className="py-3 px-4 font-bold text-[#EA580C]">₹11,000 – ₹15,000</td>
                    <td className="py-3 px-4">₹1,600 – ₹2,400 / day</td>
                    <td className="py-3 px-4">Free 30-day tourist ETA since 25 May 2026; apply at eta.gov.lk before travel. Last checked 23 Oct 2026.</td>
                    <td className="py-3 px-4 font-bold text-emerald-700">₹28,000 – ₹38,000</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#1A1A1A]">Bali, Indonesia</td>
                    <td className="py-3 px-4 font-bold text-[#EA580C]">₹19,000 – ₹24,000</td>
                    <td className="py-3 px-4">₹1,800 – ₹2,600 / day</td>
                    <td className="py-3 px-4">VoA at airport (~₹2,700)</td>
                    <td className="py-3 px-4 font-bold text-emerald-700">₹38,000 – ₹48,000</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#1A1A1A]">Nepal (Kathmandu &amp; Pokhara)</td>
                    <td className="py-3 px-4 font-bold text-[#EA580C]">₹8,000 – ₹12,000 (or train/bus)</td>
                    <td className="py-3 px-4">₹1,200 – ₹1,800 / day</td>
                    <td className="py-3 px-4">No Visa (Voter ID or Passport)</td>
                    <td className="py-3 px-4 font-bold text-emerald-700">₹18,000 – ₹28,000</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#1A1A1A]">Malaysia (Kuala Lumpur &amp; Penang)</td>
                    <td className="py-3 px-4 font-bold text-[#EA580C]">₹15,000 – ₹19,000</td>
                    <td className="py-3 px-4">₹2,200 – ₹3,000 / day</td>
                    <td className="py-3 px-4">Visa-free for up to 30 days until 31 Dec 2026 (check kln.gov.my for any extension); submit the MDAC before arrival.</td>
                    <td className="py-3 px-4 font-bold text-emerald-700">₹35,000 – ₹45,000</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>Deep-Dive Breakdown of the Top Budget Countries</h2>

            <h3>1. Vietnam: Unmatched Street Food &amp; Low Living Costs</h3>
            <p>
              Vietnam is arguably the best value destination worldwide for Indian travelers. Fresh street dishes like Pho noodle soup, Banh Mi sandwiches, and traditional egg coffee cost between ₹80 and ₹180. Internal high-speed sleeper trains and budget flights between Hanoi and Da Nang cost around ₹1,500 to ₹2,500. Don't miss a day cruise through the limestone karsts of Ha Long Bay or lanterns along the river in Hoi An.
            </p>

            <h3>2. Thailand: The Premier Beginner International Trip</h3>
            <p>
              Direct flights from Kolkata, Chennai, Kochi, Mumbai, and Delhi frequently drop below ₹7,500 one-way on low-cost carriers like AirAsia, Thai Lion Air, and IndiGo. With excellent infrastructure, 7-Eleven convenience meals for ₹100, cheap Grab bike taxis, and vibrant night markets in Chiang Mai and Bangkok, Thailand remains effortlessly affordable. Read our full <Link href="/visa/thailand-visa-for-indian-citizens">Thailand Visa Guide for Indians</Link>.
            </p>

            <h3>3. Bali, Indonesia: Tropical Paradise on a Budget</h3>
            <p>
              While flight tickets are slightly higher due to flight duration, living costs in Bali are surprisingly modest. Clean private pool homestays in Ubud cost as little as ₹1,200 to ₹1,500 per night. Renting a scooter for ₹350 per day allows you to explore waterfalls, rice terraces, and cliffside temples on your own schedule. Read our <Link href="/seo/budget-bali-trip">Budget Bali Trip Guide</Link> and <Link href="/budget/bali-trip-cost-from-india">Itemized Bali Cost Breakdown</Link>.
              <ScooterIdpNote />
            </p>

            {/* Call to Action Box */}
            <div className="my-10 bg-gradient-to-br from-[#FFF4EE] via-[#FFFBF7] to-[#FFF4EE] p-8 rounded-3xl border border-[#EA580C]/40 text-center not-prose shadow-sm">
              <Sparkles className="w-8 h-8 text-[#EA580C] mx-auto mb-3" />
              <h3 className="text-xl font-extrabold text-[#1A1A1A] mb-2">Find the cheapest flight and country for your dates</h3>
              <p className="text-sm text-[#6B6B6B] max-w-xl mx-auto mb-6">
                TripSage searches across Southeast Asia and the Middle East simultaneously to show you which international destination fits your ₹35,000–₹50,000 budget.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/plan"
                  rel="nofollow"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#EA580C] hover:bg-[#C2410C] text-white font-extrabold text-sm rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Plan with TripSage <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/budget"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-white border border-[#E8E0D8] hover:bg-slate-50 text-[#1A1A1A] font-bold text-sm rounded-xl transition-all"
                >
                  Explore Budget Hub
                </Link>
              </div>
            </div>
          </>
        }
        faqs={[
          {
            question: "Which international country is cheapest to travel to from India overall?",
            answer: "Nepal is the cheapest overall because Indians do not need a passport (Voter ID card is valid) and can travel by road or budget flight, with daily living expenses under ₹1,500. For countries requiring flights, Vietnam and Sri Lanka offer the lowest total expenses."
          },
          {
            question: "How far in advance should I book international flights for low rates?",
            answer: "For Southeast Asia (Thailand, Vietnam, Malaysia), the optimal booking window is 6 to 9 weeks before departure. Mid-week flights (Tuesdays and Wednesdays) are consistently ₹2,000–₹4,000 cheaper than weekend departures."
          },
          {
            question: "Do I need a credit card with high limits for these trips?",
            answer: "No, a debit forex card (like Niyo Global or Fi Money) with zero forex markup is ideal for cash withdrawals at local ATMs and card swipes with no hidden conversion fees."
          },
          {
            question: "What travel insurance should I get for international trips?",
            answer: "Basic international travel insurance covering medical emergencies up to $50,000 typically costs only ₹600 to ₹1,200 for a 7-day trip and is strongly recommended."
          }
        ]}
      />
    </LandingLayout>
  )
}
