import type { Metadata } from 'next'
import LandingLayout from '@/components/layout/LandingLayout'
import SEOContent from '@/components/ui/SEOContent'
import Link from 'next/link'
import { Sparkles, ArrowRight, ShieldCheck, Mountain, Calendar, Compass, Sun, Snowflake } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Manali Trip Planner: 4-Day Itinerary | TripSage',
  description: 'Plan your Manali trip from Delhi or Chandigarh. 4-day itinerary, Rohtang Pass permits, Solang adventure costs, Volvo bus tips & instant AI route generator.',
  keywords: ['Manali trip planner', 'Manali itinerary AI', 'best time to visit Manali', 'Manali budget guide', 'Delhi to Manali 4 day trip', 'Rohtang pass permit cost'],
  alternates: { canonical: 'https://www.tripsage.in/seo/manali-trip-planner' },
  openGraph: {
    title: 'Manali Trip Planner: 4-Day Itinerary | TripSage',
    description: 'Expert verified Manali travel guide. 4-day day-by-day plan, Rohtang Pass tips, Atal Tunnel transit, and complete expense breakdown.',
    url: 'https://www.tripsage.in/seo/manali-trip-planner',
    siteName: 'TripSage',
    images: [{ url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&q=85', width: 1200, height: 630, alt: 'Manali Himalayan Trip Planner' }],
    locale: 'en_IN',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Manali Trip Planner: 4-Day Itinerary | TripSage',
    description: 'Complete 4-day Manali blueprint: Volvo buses from Delhi, Old Manali cafes, Solang Valley, and Rohtang permits.',
    images: ['https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&q=85'],
  },
}

export default function Page() {
  const publishedDate = '2026-08-01T00:00:00+05:30'
  const lastVerifiedDate = '2026-10-01T00:00:00+05:30'

  return (
    <LandingLayout>
      <SEOContent
        title="Manali Trip Planner: 4-Day Himalayan Itinerary & Cost Guide"
        subtitle="Experience snow-capped Himalayan peaks, pine forests, and riverside cafes. Explore our verified 4-day Manali plan with Volvo transit advice, Solang Valley costs, and Rohtang permit guidelines."
        heroImage="https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1920&q=90"
        ctaText="Plan with TripSage"
        ctaLink="/plan"
        articleData={{
          author: 'TripSage Mountain Travel Desk',
          datePublished: publishedDate,
          dateModified: lastVerifiedDate,
          description: 'A comprehensive 4-day Manali trip blueprint for Indian tourists covering Volvo transfers from Delhi, Atal Tunnel, Solang Valley, and budget breakdown.',
        }}
        destinationName="Manali"
        content={
          <>
            <h2>Planning Your Manali Getaway: Real Costs &amp; Pacing</h2>
            <p>
              Planning a Manali trip from Delhi or Chandigarh requires balancing high-altitude mountain transit with seasonal weather patterns. For a 4-day, 3-night holiday, your realistic per-person budget is: ₹2,200 for round-trip semi-sleeper Volvo bus tickets, ₹3,600 for boutique riverside or Old Manali guesthouses (₹1,200/night), ₹2,400 for local cafe dining and Himachali Dham meals, ₹1,800 for shared cab transfers to Solang Valley and Atal Tunnel, and ₹1,500 for snow activities. This brings the complete trip expense to approximately ₹9,500 to ₹12,000 per person.
            </p>
            <p>
              Whether you are chasing winter snowfall between late December and February or seeking cool summer respite in May and June, our <Link href="/ai-trip-planner">AI trip planner</Link> automatically matches your schedule with Atal Tunnel traffic rules and permit quotas. Also check out our specialized <Link href="/seo/solo-trip-manali">Solo Trip to Manali Guide</Link> for backpacker hostel insights.
            </p>

            {/* Cost Breakdown Table */}
            <div className="my-8 overflow-x-auto not-prose">
              <table className="w-full text-left border-collapse bg-white rounded-2xl overflow-hidden shadow-xs border border-[#E8E0D8]">
                <thead>
                  <tr className="bg-[#FFF4EE] border-b border-[#E8E0D8] text-[#1A1A1A] text-xs font-black uppercase tracking-wider">
                    <th className="py-3 px-4">Component</th>
                    <th className="py-3 px-4">Cost (INR)</th>
                    <th className="py-3 px-4">Practical Travel Insight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E0D8] text-xs text-[#57534E]">
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#1A1A1A]">Delhi/Chandigarh Volvo Bus</td>
                    <td className="py-3 px-4 font-bold text-[#EA580C]">₹1,800 – ₹2,400 round-trip</td>
                    <td className="py-3 px-4">HRTC Himsuta or private AC Volvos take 12–14 hours overnight from Kashmiri Gate (ISBT)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#1A1A1A]">Accommodation (3 Nights)</td>
                    <td className="py-3 px-4 font-bold text-[#EA580C]">₹3,000 – ₹4,500</td>
                    <td className="py-3 px-4">Old Manali or Vashisht homestays offer apple orchard views for ₹1,000–₹1,500/night</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#1A1A1A]">Local Sightseeing &amp; Cabs</td>
                    <td className="py-3 px-4 font-bold text-[#EA580C]">₹2,000 – ₹3,000</td>
                    <td className="py-3 px-4">Shared Alto/Bolero cabs to Solang Valley &amp; Sissu (Lahaul) via Atal Tunnel</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#1A1A1A]">Food &amp; Apple Orchard Cafes</td>
                    <td className="py-3 px-4 font-bold text-[#EA580C]">₹2,200 – ₹3,000</td>
                    <td className="py-3 px-4">Trout fish, Siddu (Himachali steamed bread), wood-fired pizzas, and mountain thalis</td>
                  </tr>
                  <tr className="bg-[#FFFBF7] font-black text-sm text-[#1A1A1A]">
                    <td className="py-3.5 px-4 font-black">Total Expected Budget</td>
                    <td className="py-3.5 px-4 text-[#EA580C]">₹9,000 – ₹12,900</td>
                    <td className="py-3.5 px-4 text-emerald-700">Exceptional value for a 4-day mountain holiday!</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>Day-by-Day 4-Day Manali Travel Plan</h2>

            <h3>Day 1: Arrival, Old Manali Cafes &amp; Hadimba Temple</h3>
            <p>
              Arrive at the Manali Private Bus Stand in the morning. Check in to your accommodation in Old Manali or across the river in Vashisht. Take a relaxed walk through the deodar cedar forests to the centuries-old wooden Hadimba Devi Temple. In the afternoon, explore Old Manali's vibrant cafe culture along Manu Temple road—try local apple pie and freshly brewed ginger-lemon-honey tea.
            </p>

            <h3>Day 2: Solang Valley &amp; Atal Tunnel to Sissu (Lahaul Valley)</h3>
            <p>
              Start at 7:30 AM to beat the morning tourist rush. Drive through the engineering marvel of the 9.02-km Atal Tunnel into Lahaul Valley. Stop at Sissu to marvel at the towering Sissu Waterfall surrounded by stark, snow-dusted mountains. On your way back, stop at Solang Valley for adventure activities such as paragliding, ropeway rides, or snow zorbing.
            </p>

            <h3>Day 3: Vashisht Hot Springs, Jogini Waterfall Trek &amp; Mall Road</h3>
            <p>
              Cross over to Vashisht village to soak in the natural sulfur hot springs (separate enclosures for men and women). Embark on the gentle 3-km forest trek to Jogini Waterfall, offering sweeping views of the Beas River and snow-capped peaks. In the evening, stroll along Mall Road, visit the Tibetan Monastery, and pick up local Kullu shawls and organic honey.
            </p>

            <h3>Day 4: Naggar Castle Heritage &amp; Evening Departure</h3>
            <p>
              Hire an auto-rickshaw or take a local bus 20 km south to the historic Naggar Castle, an ancient wooden palace with panoramic views over the Kullu Valley. Visit the Nicholas Roerich Art Gallery and the quaint Tripura Sundari Temple. Return to Manali by 4:30 PM to board your evening Volvo back to Delhi or Chandigarh.
            </p>

            {/* Call to Action Box */}
            <div className="my-10 bg-gradient-to-br from-[#FFF4EE] via-[#FFFBF7] to-[#FFF4EE] p-8 rounded-3xl border border-[#EA580C]/40 text-center not-prose shadow-sm">
              <Sparkles className="w-8 h-8 text-[#EA580C] mx-auto mb-3" />
              <h3 className="text-xl font-extrabold text-[#1A1A1A] mb-2">Generate your custom Manali itinerary</h3>
              <p className="text-sm text-[#6B6B6B] max-w-xl mx-auto mb-6">
                TripSage AI optimizes your route between Old Manali, Atal Tunnel, and Solang Valley, calculating live cab fares and weather forecasts.
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
                  href="/destinations"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-white border border-[#E8E0D8] hover:bg-slate-50 text-[#1A1A1A] font-bold text-sm rounded-xl transition-all"
                >
                  Explore Destinations Hub
                </Link>
              </div>
            </div>
          </>
        }
        faqs={[
          {
            question: "When is the best time to see snow in Manali?",
            answer: "The highest probability of fresh snowfall in Manali town is between late December and early February. For year-round snow, Rohtang Pass (open May to November) and Sissu/Koksar in winter provide guaranteed snow."
          },
          {
            question: "Do I need a permit for the Atal Tunnel?",
            answer: "No permit is required to drive through the Atal Tunnel into Sissu and Lahaul Valley. However, traveling up to Rohtang Pass requires an online permit issued by the Himachal Tourism administration."
          },
          {
            question: "How long is the Volvo bus journey from Delhi to Manali?",
            answer: "The bus ride typically takes 12 to 14 hours depending on mountain traffic. Buses usually depart Delhi ISBT Kashmiri Gate between 6:00 PM and 9:00 PM and arrive in Manali between 7:30 AM and 10:00 AM the following morning."
          },
          {
            question: "Where should I stay in Manali for a peaceful trip?",
            answer: "Old Manali, Vashisht village, and Aleo are far more scenic, peaceful, and budget-friendly than the crowded commercial hotels around the main Mall Road."
          }
        ]}
      />
    </LandingLayout>
  )
}
