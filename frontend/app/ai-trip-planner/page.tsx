import type { Metadata } from 'next'
import LandingLayout from '@/components/layout/LandingLayout'
import SEOContent from '@/components/ui/SEOContent'
import HubNav from '@/components/seo/HubNav'
import Link from 'next/link'
import { Sparkles, Compass, Search, Calendar, ShieldCheck, Zap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'AI Trip Planner | Instant Personalized Travel Itineraries | TripSage',
  description: 'Plan custom travel itineraries in seconds with TripSage\'s AI trip planner. Instant day-by-day plans, flight & hotel price comparisons, budget breakdowns, and smart recommendations.',
  keywords: ['AI trip planner', 'personalized travel itinerary', 'AI itinerary generator', 'flight hotel price comparison', 'TripSage AI', 'smart travel planning'],
  alternates: {
    canonical: 'https://tripsage.in/ai-trip-planner',
  },
  openGraph: {
    title: 'AI Trip Planner | Instant Personalized Travel Itineraries | TripSage',
    description: 'Plan custom travel itineraries in seconds with TripSage\'s AI trip planner. Instant day-by-day plans, flight & hotel price comparisons, and budget breakdowns.',
    url: 'https://tripsage.in/ai-trip-planner',
    siteName: 'TripSage',
    images: [
      {
        url: 'https://tripsage.in/logo.png',
        width: 1200,
        height: 630,
        alt: 'TripSage AI Trip Planner',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Trip Planner | Instant Personalized Travel Itineraries | TripSage',
    description: 'Plan custom travel itineraries in seconds with TripSage\'s AI trip planner. Instant day-by-day plans, flight & hotel comparisons.',
    images: ['https://tripsage.in/logo.png'],
  },
}

export default function AITripPlannerPage() {
  return (
    <LandingLayout>
      <SEOContent
        title="AI Trip Planner: Instant Personalized Travel Itineraries"
        subtitle="Turn your dream trip into a complete, day-by-day travel plan in seconds. TripSage combines AI itinerary creation, real-time flight and hotel price search, and transport intelligence into one seamless experience."
        heroImage="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=90"
        ctaText="Plan Your Trip Now"
        ctaLink="/plan"
        content={
          <>
            <h2>How the TripSage AI Trip Planner Works</h2>
            <p>
              Traditional travel planning requires juggling dozens of tabs—comparing flight prices, searching for hotels, mapping out local transport, and trying to estimate costs. <strong>TripSage</strong> simplifies this into a single, intelligent flow.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8 not-prose">
              <div className="bg-[#FFFBF7] p-6 rounded-2xl border border-[#E8E0D8]">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#EA580C] flex items-center justify-center mb-4">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-[#1A1A1A] mb-2">1. Input Preferences</h3>
                <p className="text-xs text-[#6B6B6B] leading-relaxed">
                  Enter your destination, departure location, trip duration, estimated budget, and preferred travel pace (relaxed, moderate, or fast-paced).
                </p>
              </div>

              <div className="bg-[#FFFBF7] p-6 rounded-2xl border border-[#E8E0D8]">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#EA580C] flex items-center justify-center mb-4">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-[#1A1A1A] mb-2">2. AI Synthesis</h3>
                <p className="text-xs text-[#6B6B6B] leading-relaxed">
                  Our AI algorithm constructs a customized day-by-day schedule with morning, afternoon, and evening activities optimized for geographical logic.
                </p>
              </div>

              <div className="bg-[#FFFBF7] p-6 rounded-2xl border border-[#E8E0D8]">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#EA580C] flex items-center justify-center mb-4">
                  <Search className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-[#1A1A1A] mb-2">3. Integrated Options</h3>
                <p className="text-xs text-[#6B6B6B] leading-relaxed">
                  Compare flight fares, hotel recommendations, train and bus options, and daily budget breakdowns directly within your plan.
                </p>
              </div>
            </div>

            <h2>Core Capabilities of TripSage AI</h2>
            <ul>
              <li>
                <strong>Instant Day-by-Day Itineraries:</strong> Get structured schedules tailored to your travel style, complete with timing recommendations and location mapping.
              </li>
              <li>
                <strong>Flight & Hotel Price Search:</strong> Discover real-time flight options and hotel recommendations with direct links to compare partner fares.
              </li>
              <li>
                <strong>Multi-Mode Transport Planning:</strong> Evaluate flights, trains (IRCTC route helpers), intercity buses, and rental cab choices for seamless transit between cities.
              </li>
              <li>
                <strong>Transparent Budget Tracking:</strong> View clear expense estimates across stays, transport, dining, and activities before you book.
              </li>
              <li>
                <strong>Customizable & Saved Trips:</strong> Edit itineraries on the fly, save trip plans to your personal profile, and access them anytime.
              </li>
            </ul>

            <div className="my-8 bg-[#FFF4EE] p-8 rounded-3xl border border-[#EA580C]/30 text-center not-prose">
              <Zap className="w-8 h-8 text-[#EA580C] mx-auto mb-3" />
              <h3 className="text-xl font-extrabold text-[#1A1A1A] mb-2">Ready to create your custom itinerary?</h3>
              <p className="text-sm text-[#6B6B6B] max-w-xl mx-auto mb-6">
                Start generating your personalized travel plan in under 60 seconds with our free AI engine.
              </p>
              <Link
                href="/plan"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#EA580C] hover:bg-[#C2410C] text-white font-extrabold text-sm rounded-xl shadow-md transition-all"
              >
                Launch AI Planner <Sparkles className="w-4 h-4" />
              </Link>
            </div>

            <h2>Why Travelers Choose AI-Powered Planning</h2>
            <p>
              Planning a complex trip manually often takes hours of research across fragmented websites. TripSage consolidates place research, route planning, logistics, and cost estimations into one interactive dashboard. Whether you are organizing a quick 3-day weekend escape or a 10-day international expedition, our engine ensures logical routes and balanced daily schedules.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 not-prose">
              <div className="p-4 rounded-xl bg-white border border-[#E8E0D8] flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#EA580C] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-xs text-[#1A1A1A] mb-1">No Distortions</h4>
                  <p className="text-xs text-[#6B6B6B]">Unbiased pricing and transparent search options with direct travel links.</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white border border-[#E8E0D8] flex items-start gap-3">
                <Calendar className="w-5 h-5 text-[#EA580C] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-xs text-[#1A1A1A] mb-1">Seasonal & Regional Logic</h4>
                  <p className="text-xs text-[#6B6B6B]">Itineraries tailored to local weather patterns and regional highlights.</p>
                </div>
              </div>
            </div>
          </>
        }
        faqs={[
          {
            question: "Is the TripSage AI Trip Planner free to use?",
            answer: "Yes, you can generate custom itineraries, compare flight/hotel options, and save trip plans for free on TripSage."
          },
          {
            question: "How does TripSage generate my itinerary?",
            answer: "TripSage uses artificial intelligence models to synthesize geographical data, points of interest, user preferences, and transit routes into an optimized day-by-day itinerary."
          },
          {
            question: "Can I customize the generated itinerary?",
            answer: "Yes, after generating a plan you can adjust activities, change travel dates, filter flights and hotels, and modify budget parameters."
          },
          {
            question: "Does TripSage handle flight and hotel bookings?",
            answer: "TripSage provides real-time search options and direct referral links to trusted booking partners for flights, hotels, trains, and buses."
          }
        ]}
      />
      <HubNav />
    </LandingLayout>
  )
}
