import type { Metadata } from 'next'
import LandingLayout from '@/components/layout/LandingLayout'
import SEOContent from '@/components/ui/SEOContent'
import HubNav from '@/components/seo/HubNav'
import Link from 'next/link'
import {
  Map, Clock, Sparkles, ArrowRight, Compass, ShieldCheck,
  Calendar, CheckCircle2, UserCheck, MapPin, Sun, Waves, Camera
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Bali 7-Day Itinerary from India (2026 Route Guide): Ubud, Beaches & Nusa Penida | TripSage',
  description: 'The definitive 7-day Bali itinerary for Indian travelers. Day-by-day route: Ubud jungle & waterfalls, Nusa Penida island speedboat trip, Mount Batur sunrise, Seminyak beach clubs, and Uluwatu Kecak dance.',
  keywords: [
    'Bali 7 day itinerary from India',
    'Bali one week itinerary',
    'Bali travel plan for Indians',
    'Ubud and Seminyak 7 days route',
    'Nusa Penida day trip itinerary',
    'Bali first time travel guide'
  ],
  alternates: {
    canonical: 'https://tripsage.in/itineraries/bali-7-day-itinerary-from-india',
  },
  openGraph: {
    title: 'Bali 7-Day Itinerary from India: The Complete Route Guide for First-Timers',
    description: 'Perfect 1-week day-by-day Bali travel plan from India. Structured route covering Ubud culture, Nusa Penida beaches, and Uluwatu sunsets.',
    url: 'https://tripsage.in/itineraries/bali-7-day-itinerary-from-india',
    siteName: 'TripSage',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=85',
        width: 1200,
        height: 630,
        alt: 'Bali 7-Day Itinerary Route Map',
      },
    ],
    locale: 'en_IN',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bali 7-Day Itinerary from India: Complete 1-Week Route Guide',
    description: 'Day-by-day 7-day travel schedule for Bali covering Ubud, Nusa Penida, Seminyak, and Uluwatu.',
    images: ['https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=85'],
  },
}

export default function BaliSevenDayItineraryPage() {
  const publishedDate = '2026-08-15T00:00:00+05:30'
  const lastVerifiedDate = '2026-08-20T00:00:00+05:30'

  return (
    <LandingLayout>
      <SEOContent
        title="Bali 7-Day Itinerary from India: The Ultimate First-Timer Route Guide"
        subtitle="Experience the best of Bali without rushing. Discover an expertly paced, geographically optimized 1-week route balancing Ubud's serene jungles and waterfalls with the lively beach clubs, island day trips, and dramatic cliffs of the south."
        heroImage="https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=1920&q=90"
        ctaText="Customize This 7-Day Itinerary"
        ctaLink="/plan"
        articleData={{
          author: 'TripSage Travel Editorial Team',
          datePublished: publishedDate,
          dateModified: lastVerifiedDate,
          description: 'A comprehensive 7-day day-by-day Bali travel itinerary for Indian travelers covering Ubud, Nusa Penida, and Seminyak.',
          image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=85'
        }}
        content={
          <>
            {/* Editorial Metadata Box */}
            <div className="not-prose bg-[#FFFBF7] border border-[#E8E0D8] rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 text-[#EA580C] flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-extrabold text-[#1A1A1A]">Written by TripSage Travel Editorial Team</p>
                  <p className="text-[#6B6B6B]">Reviewed & Fact-Checked by Senior Itinerary Specialists</p>
                </div>
              </div>
              <div className="flex sm:flex-col items-center sm:items-end gap-2 text-[#6B6B6B]">
                <span><strong>Published:</strong> August 2026</span>
                <span><strong>Last Verified:</strong> August 2026</span>
              </div>
            </div>

            {/* Direct Answer Route Overview */}
            <div className="my-6 p-6 rounded-3xl bg-[#FFF4EE] border border-[#EA580C]/30 not-prose">
              <div className="flex items-center gap-2 mb-2 text-[#EA580C] font-extrabold text-sm uppercase tracking-wider">
                <Map className="w-4 h-4" /> Route Blueprint: The 3 + 3 Split Strategy
              </div>
              <p className="text-sm font-semibold text-[#1A1A1A] leading-relaxed mb-4">
                To minimize traffic fatigue, split your 7-day stay across two strategic bases: <strong>3 Nights in Ubud</strong> (central jungle, culture, rice terraces & waterfalls) and <strong>3 Nights in Seminyak or Canggu</strong> (beaches, beach clubs, Nusa Penida island trip, and Uluwatu cliff temple).
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-3 border-t border-[#EA580C]/20">
                <div>
                  <span className="text-[#6B6B6B] block">Total Duration</span>
                  <strong className="text-[#1A1A1A]">7 Days / 6 Nights</strong>
                </div>
                <div>
                  <span className="text-[#6B6B6B] block">Best Travel Base</span>
                  <strong className="text-[#1A1A1A]">Ubud (3N) + Seminyak (3N)</strong>
                </div>
                <div>
                  <span className="text-[#6B6B6B] block">Ideal Season</span>
                  <strong className="text-[#1A1A1A]">April to October (Dry)</strong>
                </div>
                <div>
                  <span className="text-[#6B6B6B] block">Target Budget</span>
                  <strong className="text-[#1A1A1A]">₹55,000 – ₹75,000 / person</strong>
                </div>
              </div>
            </div>

            <h2>Day-by-Day Detailed Schedule</h2>

            {/* Day 1 */}
            <div className="p-6 rounded-2xl bg-white border border-[#E8E0D8] my-6 not-prose shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-[#EA580C] uppercase tracking-wider mb-1">
                <Clock className="w-4 h-4" /> Day 1 • Arrival in Denpasar & Ubud Transfer
              </div>
              <h3 className="text-lg font-extrabold text-[#1A1A1A] mb-2">Touchdown in Bali, Jungle Villa Check-in & Ubud Art Market</h3>
              <p className="text-xs text-[#6B6B6B] leading-relaxed mb-3">
                Arrive at Ngurah Rai International Airport (DPS) in Denpasar. Complete immigration via e-VOA gates and clear customs with your e-CD QR code. Take a pre-arranged private transfer to your villa in Ubud (~1.5 hours).
              </p>
              <ul className="text-xs text-[#4A4A4A] space-y-1.5 list-disc pl-4 mb-3">
                <li><strong>Afternoon:</strong> Check into your Ubud private pool villa. Unpack, unwind, and enjoy a tropical welcome drink.</li>
                <li><strong>Late Afternoon:</strong> Walk through the vibrant <em>Ubud Traditional Art Market</em> and visit the royal <em>Ubud Palace</em>.</li>
                <li><strong>Evening:</strong> Relish authentic Indonesian dinner at a garden cafe (try <em>Nasi Campur</em> or vegetarian <em>Gado-Gado</em>).</li>
              </ul>
              <span className="text-[11px] font-bold text-[#EA580C] bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
                Pace: Relaxed • Travel Time: 1.5 hrs airport transit
              </span>
            </div>

            {/* Day 2 */}
            <div className="p-6 rounded-2xl bg-white border border-[#E8E0D8] my-6 not-prose shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-[#EA580C] uppercase tracking-wider mb-1">
                <Clock className="w-4 h-4" /> Day 2 • Cultural Ubud, Rice Terraces & Waterfalls
              </div>
              <h3 className="text-lg font-extrabold text-[#1A1A1A] mb-2">Tegalalang Rice Terraces, Tirta Empul & Tegenungan Waterfall</h3>
              <p className="text-xs text-[#6B6B6B] leading-relaxed mb-3">
                Immerse yourself in Bali’s spiritual and natural wonders on a full-day private tour with an AC car.
              </p>
              <ul className="text-xs text-[#4A4A4A] space-y-1.5 list-disc pl-4 mb-3">
                <li><strong>08:30 AM:</strong> Explore the cascading emerald green <em>Tegalalang Rice Terraces</em> and take iconic photos on the Bali giant swing.</li>
                <li><strong>11:30 AM:</strong> Visit the sacred water temple <em>Tirta Empul</em> and witness traditional holy spring purification rituals.</li>
                <li><strong>01:30 PM:</strong> Lunch overlooking the jungle ravines, followed by a Luwak coffee plantation tasting tour.</li>
                <li><strong>03:30 PM:</strong> Cool down at <em>Tegenungan</em> or <em>Kanto Lampo Waterfall</em>.</li>
                <li><strong>07:00 PM:</strong> Traditional Balinese massage and spa session in central Ubud.</li>
              </ul>
              <span className="text-[11px] font-bold text-[#EA580C] bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
                Pace: Active Sightseeing • Key Entries: ~IDR 150,000 (~₹825)
              </span>
            </div>

            {/* Day 3 */}
            <div className="p-6 rounded-2xl bg-white border border-[#E8E0D8] my-6 not-prose shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-[#EA580C] uppercase tracking-wider mb-1">
                <Clock className="w-4 h-4" /> Day 3 • Sunrise Volcanic Adventure or Nature Walk
              </div>
              <h3 className="text-lg font-extrabold text-[#1A1A1A] mb-2">Mount Batur Sunrise Trek OR Campuhan Ridge Walk</h3>
              <p className="text-xs text-[#6B6B6B] leading-relaxed mb-3">
                Choose between an energetic volcano hike or a gentle morning ridge stroll.
              </p>
              <ul className="text-xs text-[#4A4A4A] space-y-1.5 list-disc pl-4 mb-3">
                <li><strong>Option A (Adventure):</strong> 03:00 AM pickup for the guided <em>Mount Batur Sunrise Trek</em>. Watch the sun rise above clouds with breakfast cooked over volcanic steam.</li>
                <li><strong>Option B (Leisure):</strong> 07:00 AM leisurely walk along the picturesque <em>Campuhan Ridge Trail</em>, followed by brunch at a hilltop organic cafe.</li>
                <li><strong>Afternoon:</strong> Stroll through the lush canopies of the sacred <em>Ubud Monkey Forest Sanctuary</em>.</li>
                <li><strong>Evening:</strong> Dinner at a local warung serving freshly grilled specialties.</li>
              </ul>
              <span className="text-[11px] font-bold text-[#EA580C] bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
                Pace: High Energy Morning • Afternoon Leisure
              </span>
            </div>

            {/* Day 4 */}
            <div className="p-6 rounded-2xl bg-white border border-[#E8E0D8] my-6 not-prose shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-[#EA580C] uppercase tracking-wider mb-1">
                <Clock className="w-4 h-4" /> Day 4 • Bedugul Lake Temple & Beachside Relocation
              </div>
              <h3 className="text-lg font-extrabold text-[#1A1A1A] mb-2">Ulun Danu Beratan Temple, Handara Gate & Seminyak Check-in</h3>
              <p className="text-xs text-[#6B6B6B] leading-relaxed mb-3">
                Relocate from Ubud to the southern coast via scenic mountain landmarks.
              </p>
              <ul className="text-xs text-[#4A4A4A] space-y-1.5 list-disc pl-4 mb-3">
                <li><strong>09:00 AM:</strong> Check out from Ubud. Drive north to the floating <em>Ulun Danu Beratan Lake Temple</em> in the cool highlands.</li>
                <li><strong>11:30 AM:</strong> Stop at the iconic <em>Handara Gate</em> for photographs.</li>
                <li><strong>03:30 PM:</strong> Check into your resort/hotel in <em>Seminyak or Canggu</em>.</li>
                <li><strong>05:30 PM:</strong> Sunset cocktails and music at renowned beach clubs (Potato Head Beach Club or La Brisa in Canggu).</li>
              </ul>
              <span className="text-[11px] font-bold text-[#EA580C] bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
                Pace: Transit + Scenic Highlights • Evening Sunset Vibes
              </span>
            </div>

            {/* Day 5 */}
            <div className="p-6 rounded-2xl bg-white border border-[#E8E0D8] my-6 not-prose shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-[#EA580C] uppercase tracking-wider mb-1">
                <Clock className="w-4 h-4" /> Day 5 • Nusa Penida Island Speedboat Day Trip
              </div>
              <h3 className="text-lg font-extrabold text-[#1A1A1A] mb-2">Kelingking 'T-Rex' Cliff, Broken Beach & Angel's Billabong</h3>
              <p className="text-xs text-[#6B6B6B] leading-relaxed mb-3">
                Take a 40-minute fast boat from Sanur harbour to the dramatic island of Nusa Penida.
              </p>
              <ul className="text-xs text-[#4A4A4A] space-y-1.5 list-disc pl-4 mb-3">
                <li><strong>07:00 AM:</strong> Fast boat transfer from Sanur Port to Nusa Penida.</li>
                <li><strong>09:30 AM:</strong> Gaze upon the world-famous T-Rex shaped cliff at <em>Kelingking Beach</em>.</li>
                <li><strong>12:00 PM:</strong> Visit the natural arch at <em>Broken Beach</em> and swim in the emerald tidal pool at <em>Angel's Billabong</em>.</li>
                <li><strong>02:30 PM:</strong> Snorkeling and relaxation at <em>Crystal Bay</em>.</li>
                <li><strong>04:30 PM:</strong> Speedboat return to mainland Bali and dinner in Seminyak.</li>
              </ul>
              <span className="text-[11px] font-bold text-[#EA580C] bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
                Pace: Full-Day Island Tour • Fast Boat Return (~IDR 300,000)
              </span>
            </div>

            {/* Day 6 */}
            <div className="p-6 rounded-2xl bg-white border border-[#E8E0D8] my-6 not-prose shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-[#EA580C] uppercase tracking-wider mb-1">
                <Clock className="w-4 h-4" /> Day 6 • Uluwatu Cliffs, Kecak Fire Dance & Jimbaran Dinner
              </div>
              <h3 className="text-lg font-extrabold text-[#1A1A1A] mb-2">Padang Padang Beach, Uluwatu Temple Sunset & Candlelit Beach Feast</h3>
              <p className="text-xs text-[#6B6B6B] leading-relaxed mb-3">
                Explore the southern Bukit peninsula with turquoise surf beaches and dramatic ocean cliffs.
              </p>
              <ul className="text-xs text-[#4A4A4A] space-y-1.5 list-disc pl-4 mb-3">
                <li><strong>11:00 AM:</strong> Relax and swim at <em>Padang Padang Beach</em> or <em>Melasti Beach</em>.</li>
                <li><strong>04:30 PM:</strong> Visit <em>Uluwatu Temple</em> perched 70 meters above crashing waves.</li>
                <li><strong>06:00 PM:</strong> Watch the hypnotic <em>Kecak Fire Dance</em> amphitheatre performance against a fiery sunset.</li>
                <li><strong>08:00 PM:</strong> Candlelit fresh seafood dinner on the sand at <em>Jimbaran Bay</em>.</li>
              </ul>
              <span className="text-[11px] font-bold text-[#EA580C] bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
                Pace: Leisure + Spectacular Sunset Show
              </span>
            </div>

            {/* Day 7 */}
            <div className="p-6 rounded-2xl bg-white border border-[#E8E0D8] my-6 not-prose shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-[#EA580C] uppercase tracking-wider mb-1">
                <Clock className="w-4 h-4" /> Day 7 • Souvenir Shopping & Departure to India
              </div>
              <h3 className="text-lg font-extrabold text-[#1A1A1A] mb-2">Krisna Oleh Oleh Shopping, Cafe Brunch & Airport Transfer</h3>
              <p className="text-xs text-[#6B6B6B] leading-relaxed mb-3">
                Wrap up your holiday with local shopping and comfortable transit to DPS airport.
              </p>
              <ul className="text-xs text-[#4A4A4A] space-y-1.5 list-disc pl-4 mb-3">
                <li><strong>10:00 AM:</strong> Buy fixed-price Balinese coffee, handmade batik, aromatherapy oils, and souvenirs at <em>Krisna Oleh Oleh</em>.</li>
                <li><strong>12:30 PM:</strong> Enjoy a farewell brunch in Seminyak or Kuta.</li>
                <li><strong>03:00 PM:</strong> Transfer to Denpasar (DPS) Airport for your evening return flight to India.</li>
              </ul>
              <span className="text-[11px] font-bold text-[#EA580C] bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
                Pace: Relaxed Departure
              </span>
            </div>

            {/* AI Trip Planner CTA */}
            <div className="my-10 bg-gradient-to-br from-[#FFF4EE] via-[#FFFBF7] to-[#FFF4EE] p-8 rounded-3xl border border-[#EA580C]/40 text-center not-prose shadow-sm">
              <Sparkles className="w-8 h-8 text-[#EA580C] mx-auto mb-3" />
              <h3 className="text-xl font-extrabold text-[#1A1A1A] mb-2">Want to customize this 7-day plan?</h3>
              <p className="text-sm text-[#6B6B6B] max-w-xl mx-auto mb-6">
                Adjust dates, swap activities, find budget-friendly villas, and get live flight comparisons directly inside the TripSage AI Travel OS.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/plan"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#EA580C] hover:bg-[#C2410C] text-white font-extrabold text-sm rounded-xl shadow-md transition-all"
                >
                  Launch Interactive Planner <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/budget/bali-trip-cost-from-india"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-white border border-[#E8E0D8] hover:bg-slate-50 text-[#1A1A1A] font-bold text-sm rounded-xl transition-all"
                >
                  View Bali Cost Breakdown
                </Link>
              </div>
            </div>

            {/* Related Guides Links */}
            <h2>Related Bali & International Itineraries</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6 not-prose">
              <Link href="/budget/bali-trip-cost-from-india" className="p-4 rounded-xl bg-white border border-[#E8E0D8] hover:border-[#EA580C] hover:shadow-xs transition-all flex flex-col justify-between">
                <span className="text-xs font-extrabold text-[#EA580C] uppercase">Budget Guide</span>
                <h4 className="font-extrabold text-sm text-[#1A1A1A] mt-1 mb-2">Bali Trip Cost from India</h4>
                <span className="text-xs font-semibold text-[#6B6B6B] flex items-center gap-1">Read guide <ArrowRight className="w-3 h-3" /></span>
              </Link>
              <Link href="/visa/bali-visa-for-indian-citizens" className="p-4 rounded-xl bg-white border border-[#E8E0D8] hover:border-[#EA580C] hover:shadow-xs transition-all flex flex-col justify-between">
                <span className="text-xs font-extrabold text-[#EA580C] uppercase">Visa Guide</span>
                <h4 className="font-extrabold text-sm text-[#1A1A1A] mt-1 mb-2">Bali Visa for Indian Citizens</h4>
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
            question: "Is 7 days enough for a first-time Bali trip from India?",
            answer: "Yes, 7 days is the ideal sweet spot for a first trip. It allows you to spend 3 full days exploring Ubud's cultural sights and waterfalls, plus 3 days enjoying Seminyak/Canggu beach clubs, Nusa Penida island, and Uluwatu cliff sunsets."
          },
          {
            question: "Why should I split my stay between Ubud and Seminyak?",
            answer: "Bali traffic can be congested, taking 1.5 to 2.5 hours to travel between the southern coast and central highlands. Splitting your stay saves hours of daily transit and lets you experience both jungle and beach lifestyles."
          },
          {
            question: "How do I get to Nusa Penida from Bali for a day trip?",
            answer: "Take a fast speedboat from Sanur Harbour to Nusa Penida (takes ~40 minutes, costing approx. IDR 150,000–300,000 return). Upon arrival, hire a local driver to visit Kelingking Beach, Broken Beach, and Angel's Billabong."
          },
          {
            question: "What should I wear when visiting Balinese Hindu temples?",
            answer: "Both men and women must wear a sarong and waist sash covering knees and shoulders. Sarongs are usually available for free rental or for a small fee at temple ticket booths."
          },
          {
            question: "Can I customize this 7-day itinerary on TripSage?",
            answer: "Yes, clicking 'Customize This 7-Day Itinerary' launches TripSage's interactive planner where you can adjust travel dates, add or remove cities, and match flights and hotels to your exact budget."
          }
        ]}
      />
      <HubNav />
    </LandingLayout>
  )
}
