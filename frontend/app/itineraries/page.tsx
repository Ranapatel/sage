import type { Metadata } from 'next'
import LandingLayout from '@/components/layout/LandingLayout'
import SEOContent from '@/components/ui/SEOContent'
import HubNav from '@/components/seo/HubNav'
import Link from 'next/link'
import { Map, Clock, Sparkles, ArrowRight, Compass, ShieldCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Travel Itineraries & Route Guides | TripSage',
  description: 'Curated itineraries for weekends, honeymoons, solo trips and family holidays, plus a link to build your own plan.',
  keywords: ['travel itineraries', '3 day itinerary', '7 day trip plan', '10 day India tour', 'AI route planner', 'Golden Triangle itinerary', 'TripSage itineraries'],
  alternates: {
    canonical: 'https://www.tripsage.in/itineraries',
  },
  openGraph: {
    title: 'Travel Itineraries & Route Guides | TripSage',
    description: 'Browse curated travel itineraries for weekend getaways, honeymoon trips, solo adventures, and family holidays with TripSage AI.',
    url: 'https://www.tripsage.in/itineraries',
    siteName: 'TripSage',
    images: [
      {
        url: 'https://www.tripsage.in/logo.png',
        width: 1200,
        height: 630,
        alt: 'TripSage Travel Itineraries Hub',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Travel Itineraries & Route Guides | TripSage',
    description: 'Browse curated travel itineraries and custom route plans on TripSage.',
    images: ['https://www.tripsage.in/logo.png'],
  },
}

export default function ItinerariesHubPage() {
  const featuredRoutes = [
    {
      title: 'Golden Triangle India (6 Days)',
      subtitle: 'Delhi • Agra • Jaipur',
      desc: 'Explore India’s iconic historical circuit—Taj Mahal, Amber Fort, and Qutub Minar.',
      link: '/seo/golden-triangle-india-itinerary',
      img: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&q=80',
      badge: 'Heritage Classic'
    },
    {
      title: 'Kerala Backwaters & Hills (7 Days)',
      subtitle: 'Cochin • Munnar • Alleppey',
      desc: 'Misty tea gardens in Munnar combined with luxury houseboat cruises in Alleppey.',
      link: '/seo/kerala-backwaters-trip-planner',
      img: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=600&q=80',
      badge: 'Nature & Wellness'
    },
    {
      title: 'Ladakh High-Altitude Expedition (8 Days)',
      subtitle: 'Leh • Nubra Valley • Pangong Tso',
      desc: 'High mountain passes, ancient monasteries, and dramatic high-altitude lakes.',
      link: '/seo/ladakh-road-trip-planner',
      img: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=600&q=80',
      badge: 'Road Trip'
    },
    {
      title: 'Royal Rajasthan Heritage (10 Days)',
      subtitle: 'Jaipur • Jodhpur • Udaipur',
      desc: 'Step into royal history with grand desert forts, indigo streets, and lake palaces.',
      link: '/seo/rajasthan-heritage-trip-planner',
      img: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&q=80',
      badge: 'Royal Tour'
    },
    {
      title: 'Weekend Escape from Hyderabad (3 Days)',
      subtitle: 'Gandikota • Hampi • Srisailam options',
      desc: 'Quick weekend road trips and scenic escapes packed into 48-72 hours.',
      link: '/weekend-trips-from-hyderabad',
      img: '/charminar.jpg',
      badge: 'Weekend Special'
    },
    {
      title: 'Budget Bali Adventure (5 Days)',
      subtitle: 'Ubud • Seminyak • Nusa Penida',
      desc: 'Tropical waterfalls, beach clubs, temple heritage, and island day trips.',
      link: '/seo/budget-bali-trip',
      img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80',
      badge: 'International'
    }
  ]

  return (
    <LandingLayout>
      <SEOContent
        title="Curated Travel Itineraries & Smart Route Guides"
        subtitle="Written routes for weekends and one-week trips. The AI planner drafts one destination at a time."
        heroImage="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&q=90"
        ctaText="Plan with TripSage"
        ctaLink="/plan"
        content={
          <>
            <h2>Itineraries Structured for Ideal Travel Pacing</h2>
            <p>
              A great travel itinerary balances sightseeing with adequate rest, realistic travel times, and local dining. <strong>TripSage</strong> formats itineraries into structured morning, afternoon, and evening phases so you never waste time in transit. Explore our verified routes including our <Link href="/itineraries/bali-7-day-itinerary-from-india">7-Day Bali island itinerary</Link>, <Link href="/seo/golden-triangle-india-itinerary">6-Day Golden Triangle route</Link>, and <Link href="/seo/kerala-backwaters-trip-planner">7-Day Kerala Backwaters tour</Link>.
            </p>

            {/* Duration Filters Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8 not-prose">
              <div className="p-6 rounded-2xl bg-[#FFFBF7] border border-[#E8E0D8]">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#EA580C] flex items-center justify-center mb-4">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-base text-[#1A1A1A] mb-2">3-Day Weekend Itineraries</h3>
                <p className="text-xs text-[#6B6B6B] leading-relaxed">
                  Optimized for quick city breaks and nearby weekend road trips with minimal travel friction.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#FFFBF7] border border-[#E8E0D8]">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#EA580C] flex items-center justify-center mb-4">
                  <Map className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-base text-[#1A1A1A] mb-2">7-Day Classic Holidays</h3>
                <p className="text-xs text-[#6B6B6B] leading-relaxed">
                  A useful length for one destination, with a balanced pace.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#FFFBF7] border border-[#E8E0D8]">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#EA580C] flex items-center justify-center mb-4">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-base text-[#1A1A1A] mb-2">10+ Day Expeditions</h3>
                <p className="text-xs text-[#6B6B6B] leading-relaxed">
                  Longer written guides. The AI planner still drafts one destination at a time.
                </p>
              </div>
            </div>

            <h2>Featured Itineraries & Route Guides</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 my-8 not-prose">
              {featuredRoutes.map((route, i) => (
                <Link
                  key={i}
                  href={route.link}
                  className="group bg-white rounded-3xl overflow-hidden border border-[#E8E0D8] shadow-xs hover:shadow-xl hover:border-[#EA580C]/40 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="relative h-44 bg-[#E8E0D8] overflow-hidden">
                    <img
                      src={route.img}
                      alt={route.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-extrabold text-[#EA580C] shadow-xs">
                      {route.badge}
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-[#EA580C] uppercase tracking-wider block mb-1">
                        {route.subtitle}
                      </span>
                      <h3 className="text-base font-extrabold text-[#1A1A1A] group-hover:text-[#EA580C] transition-colors mb-2">
                        {route.title}
                      </h3>
                      <p className="text-xs text-[#6B6B6B] leading-relaxed line-clamp-2">
                        {route.desc}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#E8E0D8]/60 flex items-center justify-between text-xs font-bold text-[#EA580C]">
                      <span>Explore Route Plan</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <h2>What Makes a TripSage Itinerary Unique?</h2>
            <ul>
              <li>
                <strong>Geographical Efficiency:</strong> Places are ordered by physical proximity to minimize transit back-and-forth.
              </li>
              <li>
                <strong>One destination:</strong> The AI draft is a day-by-day plan with a rupee estimate. It does not show live flights, buses, or hotels.
              </li>
              <li>
                <strong>Season notes:</strong> Written guides mention typical seasons. The planner does not watch live weather.
              </li>
              <li>
                <strong>Editable draft:</strong> You can change activities on the plan. This page does not promise that edits are stored on your account.
              </li>
            </ul>

            <div className="my-10 bg-[#FFF4EE] p-8 rounded-3xl border border-[#EA580C]/30 text-center not-prose">
              <Sparkles className="w-8 h-8 text-[#EA580C] mx-auto mb-3" />
              <h3 className="text-xl font-extrabold text-[#1A1A1A] mb-2">Want a custom itinerary built specifically for you?</h3>
              <p className="text-sm text-[#6B6B6B] max-w-xl mx-auto mb-6">
                Tell our AI planner your dates, starting city, destination, and budget to generate a custom itinerary in seconds.
              </p>
              <Link
                href="/plan"
                rel="nofollow"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#EA580C] hover:bg-[#C2410C] text-white font-extrabold text-sm rounded-xl shadow-md transition-all cursor-pointer"
              >
                Plan with TripSage — Free <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        }
        faqs={[
          {
            question: "Can I edit an itinerary after it is generated?",
            answer: "Yes. You can edit the day-by-day draft. TripSage does not change live hotels or transport for you."
          },
          {
            question: "Are these itineraries suitable for family or solo travel?",
            answer: "The planner drafts one route. It does not change the plan based on traveller count."
          },
          {
            question: "How do I access my saved itineraries?",
            answer: "This page does not promise a saved library. You can download a PDF of the draft from the plan view. A share link does not send your personal itinerary to someone else."
          }
        ]}
      />
      <HubNav />
    </LandingLayout>
  )
}
