import type { Metadata } from 'next'
import LandingLayout from '@/components/layout/LandingLayout'
import SEOContent from '@/components/ui/SEOContent'
import Link from 'next/link'
import { Sparkles, ArrowRight, ShieldCheck, Compass, Map, Calendar, Train, Zap, CheckCircle2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'AI Trip Planner India: Free Instant Travel Itineraries (2026)',
  description: 'Build custom India travel itineraries in seconds with TripSage AI. Free route optimizer for Goa, Kerala, Rajasthan, Manali & Ladakh with train & flight intelligence.',
  keywords: ['AI trip planner India', 'automated itinerary India', 'plan trip India AI', 'India travel guide', 'smart travel planner India', 'best AI travel planner for Indian trips'],
  alternates: { canonical: 'https://tripsage.in/seo/ai-trip-planner-india' },
  openGraph: {
    title: 'AI Trip Planner India: Smart Day-by-Day Travel Itineraries | TripSage',
    description: 'Experience India travel planning powered by AI. Personalized itineraries, multi-city route optimization, and live transit comparisons.',
    url: 'https://tripsage.in/seo/ai-trip-planner-india',
    siteName: 'TripSage',
    images: [{ url: 'https://tripsage.in/logo.png', width: 1200, height: 630, alt: 'TripSage AI Trip Planner India' }],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Trip Planner India: Free Instant Travel Itineraries (2026)',
    description: 'Instant customized itineraries across India with TripSage AI. Compare trains, flights, hotels, and local activities.',
    images: ['https://tripsage.in/logo.png'],
  },
}

export default function Page() {
  const publishedDate = '2026-08-01T00:00:00+05:30'
  const lastVerifiedDate = '2026-10-01T00:00:00+05:30'

  return (
    <LandingLayout>
      <SEOContent
        title="AI Trip Planner India: Smart Day-by-Day Travel Itineraries"
        subtitle="Turn your dream Indian vacation into an actionable, day-by-day blueprint in seconds. TripSage combines AI route intelligence, rail connectivity, live flight search, and hyper-local insights."
        heroImage="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1920&q=90"
        ctaText="Plan with TripSage"
        ctaLink="/plan"
        articleData={{
          author: 'TripSage Product Engineering Team',
          datePublished: publishedDate,
          dateModified: lastVerifiedDate,
          description: 'A comprehensive guide on planning Indian travel using TripSage AI, featuring regional circuits, rail logistics, and budget optimization.',
        }}
        destinationName="India"
        content={
          <>
            <h2>Why Traditional India Travel Planning is Broken</h2>
            <p>
              Planning travel across India involves managing intricate rail schedules, seasonal climates, regional distances, and fluctuating accommodation rates. TripSage is the first specialized AI trip planner for India that unifies domestic route optimization, IRCTC train timing awareness, real-time flight search, and localized daily activity scheduling into one interactive dashboard. Whether you are mapping a 4-day budget Goa getaway, a 6-day royal Rajasthan circuit, or a 7-day serene Kerala backwater cruise, our engine builds realistic, hour-by-hour itineraries tailored to your budget and travel preferences.
            </p>
            <p>
              Rather than scrolling through conflicting travel blogs and outdated forum threads, TripSage analyzes thousands of travel parameters—from monsoon weather windows in the Western Ghats to peak tourist seasons in the Himalayas—to deliver an optimized route plan instantly.
            </p>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8 not-prose">
              <div className="bg-[#FFFBF7] p-6 rounded-2xl border border-[#E8E0D8]">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#EA580C] flex items-center justify-center mb-4">
                  <Train className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-[#1A1A1A] mb-2">Indian Transit Intelligence</h3>
                <p className="text-xs text-[#6B6B6B] leading-relaxed">
                  Integrates express rail links (Vande Bharat, Rajdhani) and intercity road connectivity to avoid impossible transfer schedules.
                </p>
              </div>
              <div className="bg-[#FFFBF7] p-6 rounded-2xl border border-[#E8E0D8]">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#EA580C] flex items-center justify-center mb-4">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-[#1A1A1A] mb-2">Seasonal Accuracy</h3>
                <p className="text-xs text-[#6B6B6B] leading-relaxed">
                  Automatically adjusts outdoor sightseeing schedules for North Indian summer heat waves and coastal monsoon downpours.
                </p>
              </div>
              <div className="bg-[#FFFBF7] p-6 rounded-2xl border border-[#E8E0D8]">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#EA580C] flex items-center justify-center mb-4">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-[#1A1A1A] mb-2">Rupee Budget Tracking</h3>
                <p className="text-xs text-[#6B6B6B] leading-relaxed">
                  Generates realistic cost estimates across student backpacker, smart mid-range, and luxury heritage palace tiers.
                </p>
              </div>
            </div>

            <h2>Top Popular Indian Travel Circuits Planned with TripSage</h2>
            <p>
              Explore our verified, pre-built route blueprints or customize them using our <Link href="/ai-trip-planner">AI trip planner core tool</Link>:
            </p>

            <div className="space-y-4 my-6 not-prose">
              <div className="p-5 rounded-2xl bg-white border border-[#E8E0D8] flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#EA580C]/40 transition-all">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Budget Favorite</span>
                    <h4 className="font-bold text-sm text-[#1A1A1A]">Goa Beach &amp; Heritage Circuit (4 Days)</h4>
                  </div>
                  <p className="text-xs text-[#6B6B6B]">North Goa backpacker hostels, coastal scooter rides, Palolem kayaking, and Old Goa churches under ₹10,000.</p>
                </div>
                <Link href="/seo/goa-trip-under-10000" className="inline-flex items-center gap-1 text-xs font-extrabold text-[#EA580C] hover:underline shrink-0">
                  View Guide <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#E8E0D8] flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#EA580C]/40 transition-all">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">Heritage Classic</span>
                    <h4 className="font-bold text-sm text-[#1A1A1A]">The Golden Triangle: Delhi, Agra &amp; Jaipur (6 Days)</h4>
                  </div>
                  <p className="text-xs text-[#6B6B6B]">Taj Mahal sunrise, Amber Fort palace exploration, and Qutub Minar with Gatimaan Express train connections.</p>
                </div>
                <Link href="/seo/golden-triangle-india-itinerary" className="inline-flex items-center gap-1 text-xs font-extrabold text-[#EA580C] hover:underline shrink-0">
                  View Guide <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#E8E0D8] flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#EA580C]/40 transition-all">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">Nature &amp; Hills</span>
                    <h4 className="font-bold text-sm text-[#1A1A1A]">Kerala Backwaters &amp; Munnar Tea Gardens (7 Days)</h4>
                  </div>
                  <p className="text-xs text-[#6B6B6B]">Alleppey houseboat cruises, Munnar high-altitude tea plantations, and Fort Kochi colonial spice trails.</p>
                </div>
                <Link href="/seo/kerala-backwaters-trip-planner" className="inline-flex items-center gap-1 text-xs font-extrabold text-[#EA580C] hover:underline shrink-0">
                  View Guide <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#E8E0D8] flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#EA580C]/40 transition-all">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">Mountain Adventure</span>
                    <h4 className="font-bold text-sm text-[#1A1A1A]">Manali &amp; Solang Valley Mountain Escape (4 Days)</h4>
                  </div>
                  <p className="text-xs text-[#6B6B6B]">Overnight Volvo from Delhi, Old Manali cafes, Solang paragliding, and Rohtang Pass snow viewpoints.</p>
                </div>
                <Link href="/seo/manali-trip-planner" className="inline-flex items-center gap-1 text-xs font-extrabold text-[#EA580C] hover:underline shrink-0">
                  View Guide <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Call to Action Box */}
            <div className="my-10 bg-gradient-to-br from-[#FFF4EE] via-[#FFFBF7] to-[#FFF4EE] p-8 rounded-3xl border border-[#EA580C]/40 text-center not-prose shadow-sm">
              <Sparkles className="w-8 h-8 text-[#EA580C] mx-auto mb-3" />
              <h3 className="text-xl font-extrabold text-[#1A1A1A] mb-2">Create your India travel plan right now</h3>
              <p className="text-sm text-[#6B6B6B] max-w-xl mx-auto mb-6">
                Tell our AI your departure city, destination, and budget, and get a customized day-by-day travel plan in under 60 seconds.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/plan"
                  rel="nofollow"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#EA580C] hover:bg-[#C2410C] text-white font-extrabold text-sm rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Plan with TripSage — Free <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/itineraries"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-white border border-[#E8E0D8] hover:bg-slate-50 text-[#1A1A1A] font-bold text-sm rounded-xl transition-all"
                >
                  Browse All Itineraries
                </Link>
              </div>
            </div>
          </>
        }
        faqs={[
          {
            question: "Is the TripSage AI Trip Planner free for Indian destinations?",
            answer: "Yes, you can generate full day-by-day itineraries, compare flight and train options, and calculate budgets completely free on TripSage."
          },
          {
            question: "Does TripSage calculate real train and road travel times across India?",
            answer: "Yes, TripSage estimates transit times using Indian Railways express speeds and national highway distances to ensure your sightseeing schedule is realistic."
          },
          {
            question: "Can I customize the generated Indian itinerary?",
            answer: "Absolutely. Once the plan is created, you can swap out activities, modify daily pacing, change travel dates, and save the plan to your profile."
          },
          {
            question: "Does TripSage cover weekend trips from Indian metro cities?",
            answer: "Yes, TripSage has dedicated intelligence for weekend escapes from Hyderabad, Bangalore, Mumbai, Delhi, and Chennai with direct travel connections."
          }
        ]}
      />
    </LandingLayout>
  )
}
