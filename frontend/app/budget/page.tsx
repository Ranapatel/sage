import type { Metadata } from 'next'
import LandingLayout from '@/components/layout/LandingLayout'
import SEOContent from '@/components/ui/SEOContent'
import HubNav from '@/components/seo/HubNav'
import Link from 'next/link'
import { Wallet, DollarSign, PiggyBank, TrendingDown, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Travel Budget Calculator & Cost Estimator | TripSage',
  description: 'Estimate travel costs, plan trip budgets, and find money-saving tips for domestic and international trips. Compare cheap flights, budget hotels, and daily expenses with TripSage.',
  keywords: ['travel budget calculator', 'trip cost estimator', 'budget travel India', 'cheap international trips', 'Goa trip under 10000', 'budget Bali trip', 'TripSage budget tool'],
  alternates: {
    canonical: 'https://tripsage.in/budget',
  },
  openGraph: {
    title: 'Travel Budget Calculator & Cost Estimator | TripSage',
    description: 'Estimate travel costs, plan trip budgets, and find money-saving tips for domestic and international trips with TripSage.',
    url: 'https://tripsage.in/budget',
    siteName: 'TripSage',
    images: [
      {
        url: 'https://tripsage.in/logo.png',
        width: 1200,
        height: 630,
        alt: 'TripSage Travel Budget & Cost Calculator',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Travel Budget Calculator & Cost Estimator | TripSage',
    description: 'Estimate travel costs, compare budget stays, flights, and daily expenses on TripSage.',
    images: ['https://tripsage.in/logo.png'],
  },
}

export default function BudgetHubPage() {
  const budgetTiers = [
    {
      tier: 'Backpacker / Budget',
      dailyCost: '₹1,200 - ₹2,500 / day',
      stay: 'Hostels, homestays & budget guesthouses',
      food: 'Local street food & casual eateries',
      transit: 'Public buses, shared autos & trains'
    },
    {
      tier: 'Smart Value / Mid-Range',
      dailyCost: '₹3,500 - ₹7,000 / day',
      stay: '3-star boutique hotels & private rentals',
      food: 'Mix of cafes & full-service restaurants',
      transit: 'Taxis, app cabs & express trains/flights'
    },
    {
      tier: 'Premium / Luxury',
      dailyCost: '₹10,000+ / day',
      stay: '5-star resorts & heritage palaces',
      food: 'Fine dining & curated culinary tours',
      transit: 'Private cabs, chauffeur transfers & flights'
    }
  ]

  const budgetGuides = [
    {
      title: 'Goa Under ₹10,000',
      desc: 'Complete 4-day budget guide covering stays, scooty rentals, and beach shacks.',
      link: '/seo/goa-trip-under-10000',
      tag: 'Domestic Favorite'
    },
    {
      title: 'Budget Bali Trip',
      desc: 'How to experience Bali on a smart budget without compromising comfort.',
      link: '/seo/budget-bali-trip',
      tag: 'International'
    },
    {
      title: 'Cheapest International Trips from India',
      desc: 'Compare low-cost international destinations including Vietnam, Thailand, and Sri Lanka.',
      link: '/seo/cheapest-international-trips-from-india',
      tag: 'Global Search'
    }
  ]

  return (
    <LandingLayout>
      <SEOContent
        title="Travel Budget Planner & Expense Estimator"
        subtitle="Take the guesswork out of vacation spending. Plan, calculate, and optimize your travel costs across flights, hotels, daily food, and activities with TripSage."
        heroImage="https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1920&q=90"
        ctaText="Calculate Trip Budget"
        ctaLink="/plan"
        content={
          <>
            <h2>Understanding Travel Expense Allocation</h2>
            <p>
              An accurate trip budget requires breaking expenses down into core buckets. <strong>TripSage</strong> helps you estimate costs prior to departure so you can travel with confidence without overspending.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-8 not-prose">
              <div className="p-5 rounded-2xl bg-[#FFFBF7] border border-[#E8E0D8]">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#EA580C] flex items-center justify-center mb-3">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-sm text-[#1A1A1A] mb-1">1. Transport (35-40%)</h3>
                <p className="text-xs text-[#6B6B6B]">Flights, train tickets, intercity buses, and local cabs/rentals.</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FFFBF7] border border-[#E8E0D8]">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#EA580C] flex items-center justify-center mb-3">
                  <PiggyBank className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-sm text-[#1A1A1A] mb-1">2. Accommodation (30-35%)</h3>
                <p className="text-xs text-[#6B6B6B]">Hotels, resorts, homestays, and vacation rentals.</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FFFBF7] border border-[#E8E0D8]">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#EA580C] flex items-center justify-center mb-3">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-sm text-[#1A1A1A] mb-1">3. Dining & Meals (15-20%)</h3>
                <p className="text-xs text-[#6B6B6B]">Daily meals, street food, drinks, and local specialty dining.</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FFFBF7] border border-[#E8E0D8]">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#EA580C] flex items-center justify-center mb-3">
                  <Wallet className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-sm text-[#1A1A1A] mb-1">4. Activities & Entry (10-15%)</h3>
                <p className="text-xs text-[#6B6B6B]">Monument tickets, adventure tours, and local experiences.</p>
              </div>
            </div>

            <h2>Travel Budget Tier Comparison</h2>
            <div className="my-8 overflow-x-auto not-prose rounded-2xl border border-[#E8E0D8] bg-white shadow-xs">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="bg-[#FFFBF7] border-b border-[#E8E0D8] text-[#1A1A1A] font-extrabold">
                    <th className="p-4">Budget Tier</th>
                    <th className="p-4">Est. Daily Budget</th>
                    <th className="p-4">Accommodation</th>
                    <th className="p-4">Food & Dining</th>
                    <th className="p-4">Transit Style</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E0D8]/60 text-[#4A4A4A]">
                  {budgetTiers.map((b, i) => (
                    <tr key={i} className="hover:bg-[#FFFBF7]/80 transition-colors">
                      <td className="p-4 font-bold text-[#1A1A1A]">{b.tier}</td>
                      <td className="p-4 text-[#EA580C] font-extrabold">{b.dailyCost}</td>
                      <td className="p-4">{b.stay}</td>
                      <td className="p-4">{b.food}</td>
                      <td className="p-4">{b.transit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2>Popular Budget Travel Guides</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8 not-prose">
              {budgetGuides.map((guide, i) => (
                <Link
                  key={i}
                  href={guide.link}
                  className="group bg-white p-6 rounded-2xl border border-[#E8E0D8] shadow-xs hover:shadow-md hover:border-[#EA580C]/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-orange-50 text-[#EA580C] border border-[#EA580C]/20 inline-block mb-3">
                      {guide.tag}
                    </span>
                    <h3 className="font-extrabold text-base text-[#1A1A1A] group-hover:text-[#EA580C] transition-colors mb-2">
                      {guide.title}
                    </h3>
                    <p className="text-xs text-[#6B6B6B] leading-relaxed">
                      {guide.desc}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#E8E0D8]/60 flex items-center justify-between text-xs font-bold text-[#EA580C]">
                    <span>Read Guide</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>

            <h2>Smart Budget Hacks for Your Next Trip</h2>
            <ul>
              <li>
                <strong>Fly During Mid-Week Windows:</strong> Flights on Tuesdays and Wednesdays are often cheaper than weekend peak departures.
              </li>
              <li>
                <strong>Book Stays Near Transit Hubs:</strong> Staying close to metro or bus lines reduces local taxi expenses significantly.
              </li>
              <li>
                <strong>Use Integrated Fares Search:</strong> Compare flight, train, and bus options on TripSage to select the most cost-effective transit mode.
              </li>
              <li>
                <strong>Leverage Shoulder Seasons:</strong> Traveling during shoulder months (e.g. September-October or February-March) yields hotel savings of up to 40%.
              </li>
            </ul>

            <div className="my-10 bg-[#FFF4EE] p-8 rounded-3xl border border-[#EA580C]/30 text-center not-prose">
              <Wallet className="w-8 h-8 text-[#EA580C] mx-auto mb-3" />
              <h3 className="text-xl font-extrabold text-[#1A1A1A] mb-2">Plan a trip tailored to your exact budget</h3>
              <p className="text-sm text-[#6B6B6B] max-w-xl mx-auto mb-6">
                Specify your total spending limit in TripSage AI to generate an itinerary matched to your financial range.
              </p>
              <Link
                href="/plan"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#EA580C] hover:bg-[#C2410C] text-white font-extrabold text-sm rounded-xl shadow-md transition-all"
              >
                Start Budget Planning <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        }
        faqs={[
          {
            question: "How does TripSage help me stay within budget?",
            answer: "TripSage lets you input your target trip budget during planning. It suggests stays, flight choices, and daily activities that align with your financial goals."
          },
          {
            question: "Are flight and hotel prices shown on TripSage accurate?",
            answer: "Yes, TripSage provides price insights based on integrated search APIs and direct link comparisons to major booking providers."
          },
          {
            question: "Can I filter itineraries by budget tier?",
            answer: "Yes, generated plans can be customized based on Budget/Backpacker, Smart Value, or Premium preferences."
          }
        ]}
      />
      <HubNav />
    </LandingLayout>
  )
}
