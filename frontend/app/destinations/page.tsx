import type { Metadata } from 'next'
import LandingLayout from '@/components/layout/LandingLayout'
import SEOContent from '@/components/ui/SEOContent'
import HubNav from '@/components/seo/HubNav'
import Link from 'next/link'
import { MapPin, Compass, ArrowRight, Sun, Mountain, Building, Heart, User } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Explore Travel Destinations | AI Travel Guides & Itineraries | TripSage',
  description: 'Discover top domestic and international travel destinations. Explore curated travel guides, seasonal insights, and AI-generated trip plans for India, Southeast Asia, Middle East, and beyond.',
  keywords: ['travel destinations', 'India tourist places', 'international travel guides', 'top places to visit in India', 'Southeast Asia travel', 'TripSage destinations'],
  alternates: {
    canonical: 'https://tripsage.in/destinations',
  },
  openGraph: {
    title: 'Explore Travel Destinations | AI Travel Guides & Itineraries | TripSage',
    description: 'Discover top domestic and international travel destinations. Explore curated travel guides, seasonal insights, and AI-generated trip plans with TripSage.',
    url: 'https://tripsage.in/destinations',
    siteName: 'TripSage',
    images: [
      {
        url: 'https://tripsage.in/logo.png',
        width: 1200,
        height: 630,
        alt: 'TripSage Travel Destinations Hub',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Explore Travel Destinations | AI Travel Guides & Itineraries | TripSage',
    description: 'Discover top domestic and international travel destinations with AI travel guides on TripSage.',
    images: ['https://tripsage.in/logo.png'],
  },
}

export default function DestinationsHubPage() {
  const popularDestinations = [
    {
      name: 'Goa',
      region: 'West India',
      category: 'Beaches & Nightlife',
      img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&q=80',
      link: '/seo/goa-trip-under-10000',
      tag: 'Budget Favorite'
    },
    {
      name: 'Bali',
      region: 'Indonesia',
      category: 'Tropical & Culture',
      img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80',
      link: '/seo/budget-bali-trip',
      tag: 'International'
    },
    {
      name: 'Manali',
      region: 'Himachal Pradesh',
      category: 'Mountains & Snow',
      img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&q=80',
      link: '/seo/manali-trip-planner',
      tag: 'Adventure'
    },
    {
      name: 'Kerala Backwaters',
      region: 'South India',
      category: 'Nature & Houseboats',
      img: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=600&q=80',
      link: '/seo/kerala-backwaters-trip-planner',
      tag: 'Relaxation'
    },
    {
      name: 'Rajasthan Heritage',
      region: 'North India',
      category: 'Forts & Palaces',
      img: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&q=80',
      link: '/seo/rajasthan-heritage-trip-planner',
      tag: 'Culture'
    },
    {
      name: 'Dubai',
      region: 'UAE',
      category: 'Modern & Desert',
      img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80',
      link: '/seo/bangalore-to-dubai-trip-planner',
      tag: 'International'
    }
  ]

  const categories = [
    { title: 'Beach Escapes', icon: Sun, desc: 'Sun, sand, and coastal relaxation', count: '10+ Guides' },
    { title: 'Mountain & Hill Stations', icon: Mountain, desc: 'Scenic peaks, tea estates, and cool mountain air', count: '12+ Guides' },
    { title: 'Heritage & Forts', icon: Building, desc: 'Royal palaces, UNESCO sites, and ancient monuments', count: '8+ Guides' },
    { title: 'Honeymoon Special', icon: Heart, desc: 'Romantic getaways and tranquil luxury retreats', count: '9+ Guides' },
    { title: 'Solo Travel', icon: User, desc: 'Safe, budget-friendly destinations for independent travelers', count: '15+ Guides' }
  ]

  return (
    <LandingLayout>
      <SEOContent
        title="Explore Domestic & International Travel Destinations"
        subtitle="Discover incredible travel destinations across India, Southeast Asia, the Middle East, and beyond. Explore localized guides, seasonal tips, and plan your trip with TripSage AI."
        heroImage="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=90"
        ctaText="Plan Destination Trip"
        ctaLink="/plan"
        content={
          <>
            <h2>Discover Popular Travel Regions</h2>
            <p>
              Whether you are craving serene beaches, high-altitude mountain trails, royal palaces, or vibrant global metropolises, <strong>TripSage</strong> helps you find the ideal destination and builds a customized day-by-day plan tailored to your preferences.
            </p>

            {/* Popular Destination Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 my-8 not-prose">
              {popularDestinations.map((dest, i) => (
                <Link
                  key={i}
                  href={dest.link}
                  className="group bg-white rounded-3xl overflow-hidden border border-[#E8E0D8] shadow-xs hover:shadow-xl hover:border-[#EA580C]/40 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="relative h-44 bg-[#E8E0D8] overflow-hidden">
                    <img
                      src={dest.img}
                      alt={dest.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-extrabold text-[#EA580C] shadow-xs">
                      {dest.tag}
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-[#EA580C] uppercase tracking-wider block mb-1">
                        {dest.region} • {dest.category}
                      </span>
                      <h3 className="text-lg font-extrabold text-[#1A1A1A] group-hover:text-[#EA580C] transition-colors">
                        {dest.name}
                      </h3>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#E8E0D8]/60 flex items-center justify-between text-xs font-bold text-[#EA580C]">
                      <span>View Destination Guide</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <h2>Travel Destinations by Category</h2>
            <p>
              Explore destinations grouped by travel experience to match your mood and trip goals:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-8 not-prose">
              {categories.map((cat, i) => {
                const IconComponent = cat.icon
                return (
                  <div key={i} className="p-5 rounded-2xl bg-[#FFFBF7] border border-[#E8E0D8] flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#EA580C] flex items-center justify-center shrink-0">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-[#1A1A1A] mb-1">{cat.title}</h3>
                      <p className="text-xs text-[#6B6B6B] leading-relaxed mb-2">{cat.desc}</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8E0D8]/60 text-[#6B6B6B]">
                        {cat.count}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            <h2>How TripSage Simplifies Destination Choice</h2>
            <ul>
              <li>
                <strong>Seasonal Weather Alignment:</strong> Discover which destinations offer peak experiences based on your travel dates.
              </li>
              <li>
                <strong>Realistic Travel Durations:</strong> Determine how many days you need for a destination, avoiding rushed itineraries.
              </li>
              <li>
                <strong>Logistical Accessibility:</strong> Check flight routes, train connectivity, and road access directly on your trip timeline.
              </li>
              <li>
                <strong>Budget Transparency:</strong> View estimated accommodation costs, food expenses, and transport fares before committing to a trip.
              </li>
            </ul>

            <div className="my-10 bg-[#FFF4EE] p-8 rounded-3xl border border-[#EA580C]/30 text-center not-prose">
              <Compass className="w-8 h-8 text-[#EA580C] mx-auto mb-3" />
              <h3 className="text-xl font-extrabold text-[#1A1A1A] mb-2">Have a destination in mind?</h3>
              <p className="text-sm text-[#6B6B6B] max-w-xl mx-auto mb-6">
                Type any city or country into TripSage AI and generate a personalized travel itinerary instantly.
              </p>
              <Link
                href="/plan"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#EA580C] hover:bg-[#C2410C] text-white font-extrabold text-sm rounded-xl shadow-md transition-all"
              >
                Plan Destination Itinerary <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        }
        faqs={[
          {
            question: "What destinations are covered by TripSage?",
            answer: "TripSage covers domestic destinations across India (all states and union territories) as well as popular international destinations in Southeast Asia, the Middle East, Europe, and beyond."
          },
          {
            question: "Can TripSage plan multi-city destination tours?",
            answer: "Yes, you can input multiple destination cities (e.g. Jaipur-Jodhpur-Udaipur or Delhi-Singapore-Bali) and TripSage AI will construct an optimized route with transport links."
          },
          {
            question: "How do I choose the best destination for my budget?",
            answer: "Explore our Destination Hub or use the TripSage AI planner where you can filter locations by budget preference—from backpacker friendly to luxury retreats."
          }
        ]}
      />
      <HubNav />
    </LandingLayout>
  )
}
