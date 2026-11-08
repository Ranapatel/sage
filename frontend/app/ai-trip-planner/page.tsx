import type { Metadata } from 'next'
import LandingLayout from '@/components/layout/LandingLayout'
import SEOContent from '@/components/ui/SEOContent'
import HubNav from '@/components/seo/HubNav'
import Link from 'next/link'
import { Sparkles, Compass, Search, Calendar, ShieldCheck, Zap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'AI Trip Planner for Indian Travellers | TripSage',
  description: 'Draft a day-by-day plan for one departure city and one destination, with rupee estimates and visa notes for Indian passports.',
  keywords: ['AI trip planner', 'personalized travel itinerary', 'AI itinerary generator', 'flight hotel price comparison', 'TripSage AI', 'smart travel planning'],
  alternates: {
    canonical: 'https://www.tripsage.in/ai-trip-planner',
  },
  openGraph: {
    title: 'AI Trip Planner for Indian Travellers | TripSage',
    description: 'Draft a day-by-day plan for one departure city and one destination, with rupee estimates and visa notes for Indian passports.',
    url: 'https://www.tripsage.in/ai-trip-planner',
    siteName: 'TripSage',
    images: [
      {
        url: 'https://www.tripsage.in/logo.png',
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
    title: 'AI Trip Planner for Indian Travellers | TripSage',
    description: 'Draft a day-by-day plan for one departure city and one destination, with rupee estimates and visa notes for Indian passports.',
    images: ['https://www.tripsage.in/logo.png'],
  },
}

export default function AITripPlannerPage() {
  return (
    <LandingLayout>
      <SEOContent
        title="AI trip planner for Indian travellers"
        subtitle="A day-by-day draft for one departure city and one destination, with rupee estimates and visa notes for Indian passports."
        heroImage="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=90"
        ctaText="Plan with TripSage"
        ctaLink="/plan"
        content={
          <>
            <h2>How the TripSage AI Trip Planner Works</h2>
            <p>
              Traditional travel planning requires juggling dozens of tabs—comparing flight prices, searching for hotels, mapping out local transport, and trying to estimate costs. <strong>TripSage</strong> simplifies this into a single, intelligent flow. Whether you want to plan a <Link href="/seo/goa-trip-under-10000">Goa budget trip under ₹10k</Link>, an exotic <Link href="/seo/budget-bali-trip">budget Bali getaway</Link>, a scenic <Link href="/seo/manali-trip-planner">Manali mountain tour</Link>, or a 5-day <Link href="/guides/dubai-trip-planner-from-india">Dubai holiday</Link>, our AI engine builds realistic day-by-day itineraries tailored to your dates and budget.
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
                  Review the day-by-day draft and its rupee estimate. Live fares are not included.
                </p>
              </div>
            </div>

            <h2>Core Capabilities of TripSage AI</h2>
            <ul>
              <li>
                <strong>Day-by-day draft:</strong> A schedule for one destination, with suggested times. It is not instant, and it is not a multi-city route.
              </li>
              <li>
                <strong>Rupee estimates:</strong> The draft includes a cost estimate in INR. It does not search live flights or hotels.
              </li>
              <li>
                <strong>One route:</strong> The planner takes one departure city and one destination. It does not build a multi-city route or book buses between cities.
              </li>
              <li>
                <strong>Cost estimate:</strong> See a rupee split across the draft before you check prices on your own.
              </li>
              <li>
                <strong>Editable draft:</strong> Change the day-by-day plan on screen. This page does not promise that the draft is stored on your profile.
              </li>
            </ul>

            <div className="my-8 bg-[#FFF4EE] p-8 rounded-3xl border border-[#EA580C]/30 text-center not-prose">
              <Zap className="w-8 h-8 text-[#EA580C] mx-auto mb-3" />
              <h3 className="text-xl font-extrabold text-[#1A1A1A] mb-2">Ready to create your custom itinerary?</h3>
              <p className="text-sm text-[#6B6B6B] max-w-xl mx-auto mb-6">
                TripSage is free to use. Generate a day-by-day draft for one route, with a rupee estimate and visa notes.
              </p>
              <Link
                href="/plan"
                rel="nofollow"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#EA580C] hover:bg-[#C2410C] text-white font-extrabold text-sm rounded-xl shadow-md transition-all cursor-pointer"
              >
                Plan with TripSage — Free <Sparkles className="w-4 h-4" />
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
                  <p className="text-xs text-[#6B6B6B]">A planning draft with a rupee estimate. You book on the airline or hotel site.</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white border border-[#E8E0D8] flex items-start gap-3">
                <Calendar className="w-5 h-5 text-[#EA580C] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-xs text-[#1A1A1A] mb-1">Not season-aware</h4>
                  <p className="text-xs text-[#6B6B6B]">The draft does not change for monsoon, winter, or heat. Written guides mention typical seasons separately.</p>
                </div>
              </div>
            </div>
          </>
        }
        faqs={[
          {
            question: "Is the TripSage AI Trip Planner free to use?",
            answer: "Yes. TripSage is free to use."
          },
          {
            question: "How does TripSage generate my itinerary?",
            answer: "TripSage uses artificial intelligence models to synthesize geographical data, points of interest, user preferences, and transit routes into an optimized day-by-day itinerary."
          },
          {
            question: "Can I customize the generated itinerary?",
            answer: "Yes. You can edit activities and dates on the draft. The planner does not filter live flights or hotels."
          },
          {
            question: "Does TripSage handle flight and hotel bookings?",
            answer: "The draft does not include live flight or hotel prices, and TripSage does not book travel. Check the airline or hotel before you pay."
          }
        ]}
      />
      <HubNav />
    </LandingLayout>
  )
}
