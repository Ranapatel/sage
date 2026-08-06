'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import LocationAutocomplete from '@/components/ui/LocationAutocomplete'
import CustomDatePicker from '@/components/ui/CustomDatePicker'
import { trackEvent } from '@/lib/analytics'
import { tripAPI } from '@/lib/api'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Earth3DBackground from '@/components/home/Earth3DBackground'
import { useInView, motion } from 'framer-motion'
import { useIsMobile } from '@/hooks/useIsMobile'
import {
  MapPin, Calendar, ArrowRight, Plane, Shield, Sparkles, Plus, Minus, Info, ChevronRight, ChevronLeft, X, Search, SlidersHorizontal, Users, ShieldCheck, FileCheck, Globe
} from 'lucide-react'

// ─── Data ─────────────────────────────────────────────────────────────────────

const BLUEPRINT_DESTINATIONS = [
  {
    name: 'Bali, Indonesia',
    img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1000&q=85&auto=format&fit=crop',
    season: 'Apr – Oct',
    city: 'Bali',
    country: 'Indonesia',
    visa: 'Visa on Arrival',
    visaType: 'warning',
    budget: '₹45,000',
    duration: '6 nights',
    bestFor: 'Couples, Adventure',
    link: '/seo/budget-bali-trip',
  },
  {
    name: 'Dubai, UAE',
    img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1000&q=85&auto=format&fit=crop',
    season: 'Nov – Mar',
    city: 'Dubai',
    country: 'UAE',
    visa: 'E-Visa Required',
    visaType: 'warning',
    budget: '₹70,000',
    duration: '5 nights',
    bestFor: 'Luxury, Shopping',
    link: '',
  },
  {
    name: 'Bangkok, Thailand',
    img: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1000&q=85&auto=format&fit=crop',
    season: 'Nov – Feb',
    city: 'Bangkok',
    country: 'Thailand',
    visa: 'Visa Free',
    visaType: 'success',
    budget: '₹35,000',
    duration: '5 nights',
    bestFor: 'Food, Culture',
    link: '',
  },
  {
    name: 'Hanoi, Vietnam',
    img: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=1000&q=85&auto=format&fit=crop',
    season: 'Sep – Nov',
    city: 'Hanoi',
    country: 'Vietnam',
    visa: 'E-Visa Required',
    visaType: 'warning',
    budget: '₹30,000',
    duration: '5 nights',
    bestFor: 'History, Food',
    link: '',
  },
  {
    name: 'Maldives',
    img: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=1000&q=85&auto=format&fit=crop',
    season: 'Nov – Apr',
    city: 'Maldives',
    country: 'Maldives',
    visa: 'Visa Free',
    visaType: 'success',
    budget: '₹1,20,000',
    duration: '5 nights',
    bestFor: 'Honeymoon, Leisure',
    link: '/seo/best-honeymoon-destinations-india',
  },
  {
    name: 'Singapore',
    img: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1000&q=85&auto=format&fit=crop',
    season: 'Dec – Jun',
    city: 'Singapore',
    country: 'Singapore',
    visa: 'E-Visa Required',
    visaType: 'warning',
    budget: '₹55,000',
    duration: '4 nights',
    bestFor: 'Family, Urban',
    link: '',
  },
  {
    name: 'Tokyo, Japan',
    img: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1000&q=85&auto=format&fit=crop',
    season: 'Mar – May',
    city: 'Tokyo',
    country: 'Japan',
    visa: 'E-Visa Required',
    visaType: 'warning',
    budget: '₹95,000',
    duration: '6 nights',
    bestFor: 'Culture, Tech',
    link: '',
  },
  {
    name: 'Paris, France',
    img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1000&q=85&auto=format&fit=crop',
    season: 'Jun – Sep',
    city: 'Paris',
    country: 'France',
    visa: 'Schengen Visa',
    visaType: 'warning',
    budget: '₹1,10,000',
    duration: '5 nights',
    bestFor: 'Romance, Art',
    link: '',
  },
  {
    name: 'Kuala Lumpur, Malaysia',
    img: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1000&q=85&auto=format&fit=crop',
    season: 'May – Jul',
    city: 'Kuala Lumpur',
    country: 'Malaysia',
    visa: 'Visa Free',
    visaType: 'success',
    budget: '₹40,000',
    duration: '5 nights',
    bestFor: 'Shopping, Towers',
    link: '',
  },
  {
    name: 'Sri Lanka',
    img: 'https://images.unsplash.com/photo-1546708973-b339540b5162?w=1000&q=85&auto=format&fit=crop',
    season: 'Dec – Apr',
    city: 'Colombo',
    country: 'Sri Lanka',
    visa: 'Visa Free',
    visaType: 'success',
    budget: '₹30,000',
    duration: '5 nights',
    bestFor: 'Beaches, Heritage',
    link: '',
  },
  {
    name: 'Mauritius',
    img: 'https://images.unsplash.com/photo-1540206395-68808572332f?w=1000&q=85&auto=format&fit=crop',
    season: 'May – Dec',
    city: 'Mauritius',
    country: 'Mauritius',
    visa: 'Visa Free',
    visaType: 'success',
    budget: '₹85,000',
    duration: '6 nights',
    bestFor: 'Honeymoon, Beaches',
    link: '',
  },
  {
    name: 'Seychelles',
    img: 'https://images.unsplash.com/photo-1589979481223-deb893043163?w=1000&q=85&auto=format&fit=crop',
    season: 'Apr – Nov',
    city: 'Mahé',
    country: 'Seychelles',
    visa: 'Visa Free',
    visaType: 'success',
    budget: '₹95,000',
    duration: '6 nights',
    bestFor: 'Granite Beaches, Luxury',
    link: '',
  },
  {
    name: 'Kenya',
    img: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1000&q=85&auto=format&fit=crop',
    season: 'Jul – Oct',
    city: 'Nairobi',
    country: 'Kenya',
    visa: 'Visa Free',
    visaType: 'success',
    budget: '₹90,000',
    duration: '5 nights',
    bestFor: 'Masai Mara, Safari',
    link: '',
  },
  {
    name: 'Nepal',
    img: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1000&q=85&auto=format&fit=crop',
    season: 'Oct – Dec',
    city: 'Kathmandu',
    country: 'Nepal',
    visa: 'Visa Free',
    visaType: 'success',
    budget: '₹20,000',
    duration: '4 nights',
    bestFor: 'Himalayas, Temples',
    link: '',
  },
]

const DOMESTIC_DESTINATIONS = [
  {
    name: 'Goa',
    img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1000&q=85&auto=format&fit=crop',
    season: 'Nov – Feb',
    city: 'Goa',
    country: 'Goa',
    badge: 'Beach Favorite',
    budget: '₹12,000',
    duration: '4 nights',
    bestFor: 'Beaches, Nightlife',
    link: '/seo/goa-trip-under-10000',
  },
  {
    name: 'Manali',
    img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1000&q=85&auto=format&fit=crop',
    season: 'Oct – Jun',
    city: 'Manali',
    country: 'Himachal Pradesh',
    badge: 'Hill Retreat',
    budget: '₹18,000',
    duration: '5 nights',
    bestFor: 'Mountains, Adventure',
    link: '/seo/manali-trip-planner',
  },
  {
    name: 'Kerala',
    img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1000&q=85&auto=format&fit=crop',
    season: 'Sep – Mar',
    city: 'Kerala',
    country: 'Kerala',
    badge: 'Backwaters',
    budget: '₹22,000',
    duration: '5 nights',
    bestFor: 'Family, Nature',
    link: '/seo/budget-kerala-trip',
  },
  {
    name: 'Rishikesh',
    img: 'https://images.unsplash.com/photo-1603867106100-0d2039fc8757?w=1000&q=85&auto=format&fit=crop',
    season: 'Sep – Apr',
    city: 'Rishikesh',
    country: 'Uttarakhand',
    badge: 'Spiritual Hub',
    budget: '₹9,000',
    duration: '3 nights',
    bestFor: 'Rafting, Yoga',
    link: '',
  },
  {
    name: 'Jaipur',
    img: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1000&q=85&auto=format&fit=crop',
    season: 'Oct – Mar',
    city: 'Jaipur',
    country: 'Rajasthan',
    badge: 'Royal Heritage',
    budget: '₹10,000',
    duration: '3 nights',
    bestFor: 'Forts, Culture',
    link: '/seo/budget-rajasthan-trip',
  },
  {
    name: 'Kashmir',
    img: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=1000&q=85&auto=format&fit=crop',
    season: 'Mar – Oct',
    city: 'Kashmir',
    country: 'Jammu & Kashmir',
    badge: 'Paradise Valley',
    budget: '₹28,000',
    duration: '5 nights',
    bestFor: 'Snow, Valleys',
    link: '/seo/honeymoon-in-kashmir',
  },
  {
    name: 'Andaman',
    img: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=1000&q=85&auto=format&fit=crop',
    season: 'Oct – May',
    city: 'Andaman',
    country: 'Andaman Islands',
    badge: 'Tropical Islands',
    budget: '₹35,000',
    duration: '5 nights',
    bestFor: 'Scuba, Beaches',
    link: '/seo/honeymoon-in-andaman',
  },
  {
    name: 'Varanasi',
    img: 'https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=1000&q=85&auto=format&fit=crop',
    season: 'Oct – Mar',
    city: 'Varanasi',
    country: 'Uttar Pradesh',
    badge: 'Sacred Ghats',
    budget: '₹8,000',
    duration: '3 nights',
    bestFor: 'Ghats, Rituals',
    link: '',
  },
  {
    name: 'Munnar, Kerala',
    img: 'https://images.unsplash.com/photo-1598324789736-4861f89564a0?w=1000&q=85&auto=format&fit=crop',
    season: 'Sep – May',
    city: 'Munnar',
    country: 'Kerala',
    badge: 'Tea Gardens',
    budget: '₹14,000',
    duration: '4 nights',
    bestFor: 'Misty Hills, Tea Estates',
    link: '',
  },
  {
    name: 'Leh Ladakh',
    img: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=1000&q=85&auto=format&fit=crop',
    season: 'May – Sep',
    city: 'Ladakh',
    country: 'Jammu & Kashmir',
    badge: 'High Passes',
    budget: '₹32,000',
    duration: '6 nights',
    bestFor: 'Pangong Lake, Biking',
    link: '',
  },
  {
    name: 'Darjeeling',
    img: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1000&q=85&auto=format&fit=crop',
    season: 'Oct – May',
    city: 'Darjeeling',
    country: 'West Bengal',
    badge: 'Himalayan Views',
    budget: '₹16,000',
    duration: '4 nights',
    bestFor: 'Toy Train, Kanchenjunga',
    link: '',
  },
  {
    name: 'Ooty',
    img: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=1000&q=85&auto=format&fit=crop',
    season: 'Oct – Jun',
    city: 'Ooty',
    country: 'Tamil Nadu',
    badge: 'Nilgiri Hills',
    budget: '₹12,000',
    duration: '3 nights',
    bestFor: 'Botanical Gardens, Toy Train',
    link: '',
  },
]

const FAQS = [
  {
    q: 'Is TripSage completely free to use?',
    a: 'Yes, generating itineraries and using our basic planning tools is completely free. We earn money through affiliate bookings with our flight and hotel partners, meaning you pay the exact same price.',
  },
  {
    q: 'Where does TripSage get flight and hotel rates?',
    a: 'We query aggregated travel APIs and partner networks to fetch live availability and baseline price estimations.',
  },
  {
    q: 'Can I customize the generated itineraries?',
    a: 'Absolutely. Every day is modular. You can add, edit, remove activities, swap hotels, or search for different transport connections.',
  },
  {
    q: 'What destinations does TripSage support?',
    a: 'While we support planning for global routes, our blueprint destinations are highly optimized for direct bookings, itineraries, and visa requirements.',
  },
  {
    q: 'Does TripSage handle booking cancellations?',
    a: 'TripSage is a planning assistant. Stays and partner options are booked directly with official providers (such as Hotelbeds, Booking.com, etc.), and cancellations are managed according to each provider’s terms.',
  },
]

export default function HomeClient() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const isDesktop = !isMobile
  const { user, updateCurrency } = useAuthStore()
  const [form, setForm] = useState({
    from: '',
    to: '',
    startDate: '',
    endDate: '',
    budget: '50000',
    travelers: '2',
    style: 'adventure',

    currency: (user?.currency || 'INR') as 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'JPY' | 'AUD' | 'CAD' | 'SGD' | 'THB' | 'MYR' | 'SAR',
  })
  const [loading, setLoading] = useState(false)
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const [showPrefModal, setShowPrefModal] = useState(false)
  const [showSearchDrawer, setShowSearchDrawer] = useState(false)
  const [destTab, setDestTab] = useState<'all' | 'intl' | 'domestic' | 'visafree'>('all')
  const [showAllDest, setShowAllDest] = useState(false)

  const intlCarouselRef = useRef<HTMLDivElement>(null)
  const domCarouselRef = useRef<HTMLDivElement>(null)

  const scrollCarousel = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -320 : 320
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  // Sync currency from auth store if user logs in after mount
  useEffect(() => {
    if (user?.currency && user.currency !== form.currency) {
      Promise.resolve().then(() => {
        setForm(p => ({ ...p, currency: user.currency as any }))
      })
    }
  }, [user?.currency, form.currency])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.from || !form.to || !form.startDate) return
    setShowPrefModal(true)
  }

  const [initialized, setInitialized] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const isFormInView = useInView(formRef, { amount: 0.1 })
  const showStickySearch = !isFormInView && !isDesktop && initialized

  // Clear old sessions on mount
  useEffect(() => {
    // Clear old trip so it doesn't auto-search on /plan if they navigated back to home
    sessionStorage.removeItem('tripContext')
  }, [])

  useEffect(() => {
    Promise.resolve().then(() => setInitialized(true))
  }, [])

  return (
    <div className="min-h-screen bg-[#FFFBF7] text-[#6B6B6B] font-body selection:bg-orange-500/20 selection:text-[#EA580C] antialiased w-full max-w-full overflow-x-hidden relative">
      <Navbar />

      {/* ─── HERO SECTION (Warm Light Cream Quiet Luxury Theme) ─────────────────── */}
      <section className="relative min-h-[82vh] flex flex-col items-center justify-center px-4 md:px-8 overflow-visible bg-[#FFFBF7] text-[#6B6B6B] pt-10 pb-14 md:pt-14 md:pb-20">
        {/* Photorealistic 3D Rotating Earth Background (Light Cream Theme) */}
        <Earth3DBackground />

        {/* Soft Ambient Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-[#FFEDD5]/40 to-transparent rounded-full blur-3xl pointer-events-none z-0" />

        <div className="relative z-10 text-center max-w-4xl mx-auto w-full space-y-6 md:space-y-8">

          {/* Main Headline & Subtitle Container (Minimal Clean Sizing) */}
          <div className="relative z-10 text-center max-w-2xl mx-auto space-y-2 pt-1">
            
            {/* Headline */}
            <h1
              className="font-display text-2xl sm:text-3xl md:text-[38px] font-semibold text-[#1A1A1A] tracking-tight leading-[1.18] text-center"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              The smartest way to{' '}
              <span className="font-bold text-[#EA580C]">
                explore the world.
              </span>
            </h1>
            
            {/* Subtitle - High Contrast Charcoal */}
            <p 
              className="text-xs sm:text-sm text-[#334155] font-medium leading-relaxed max-w-lg mx-auto"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              From flight tickets to daily schedules, TripSage organizes your entire journey with transparent costs and instant clarity.
            </p>

          </div>

          {/* Search Form (Desktop Floating Glassmorphism Bar) */}
          <form
            onSubmit={handleSubmit}
            suppressHydrationWarning
            className="hidden md:flex items-center w-full max-w-4xl bg-white border border-[#E8E0D8] rounded-2xl p-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] mx-auto text-left transition-all"
          >
            {/* FROM */}
            <div className="flex-[1.1] px-4 border-r border-[#E8E0D8]">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#6B6B6B] block mb-1">From</label>
              <LocationAutocomplete
                className="w-full bg-transparent border-none outline-none text-[#1A1A1A] font-semibold text-sm placeholder:text-[#A1A1AA]/70 p-0 focus:ring-0"
                placeholder="Where from?"
                value={form.from}
                onChange={(val: string) => setForm(p => ({ ...p, from: val }))}
              />
            </div>

            {/* TO */}
            <div className="flex-[1.3] px-4 border-r border-[#E8E0D8]">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#6B6B6B] block mb-1">To</label>
              <LocationAutocomplete
                className="w-full bg-transparent border-none outline-none text-[#1A1A1A] font-semibold text-sm placeholder:text-[#A1A1AA]/70 p-0 focus:ring-0"
                placeholder="Where to?"
                value={form.to}
                onChange={(val: string) => setForm(p => ({ ...p, to: val }))}
              />
            </div>

            {/* DEPART & RETURN */}
            <div className="flex-[1.6] px-4">
              <CustomDatePicker
                startDate={form.startDate}
                endDate={form.endDate}
                onChange={(start, end) => setForm(p => ({ ...p, startDate: start, endDate: end }))}
              />
            </div>

            {/* Primary CTA Button */}
            <button
              type="submit"
              disabled={loading}
              suppressHydrationWarning
              className="bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold px-8 h-[48px] rounded-xl text-sm flex items-center justify-center gap-2 transition-all whitespace-nowrap ml-2 shrink-0 shadow-md shadow-orange-500/20 active:scale-[0.98] cursor-pointer"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Plan My Trip</span>
                  <ArrowRight size={15} strokeWidth={2.2} />
                </>
              )}
            </button>
          </form>

          {/* Ultra-Premium Mobile Floating Search Bar Widget */}
          <div className="flex md:hidden flex-col w-full text-left">
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setShowSearchDrawer(true)}
              className="w-full bg-white/95 backdrop-blur-xl border border-[#EA580C]/30 rounded-2xl p-3.5 shadow-[0_12px_40px_rgba(234,88,12,0.12)] flex items-center justify-between transition-all active:scale-[0.98] cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FFF5ED] border border-[#FFEDD5] text-[#EA580C] flex items-center justify-center shrink-0 shadow-2xs">
                  <Search size={18} strokeWidth={2} className="text-[#EA580C]" />
                </div>
                <div className="text-left space-y-0.5">
                  <p className="text-sm font-bold text-[#1A1A1A] tracking-tight">Where to next?</p>
                  <p className="text-[11px] font-medium text-[#6B6B6B] flex items-center gap-1">
                    <span>{form.to ? form.to : 'Tap to search flights & itineraries'}</span>
                    <ArrowRight size={11} strokeWidth={2} className="text-[#EA580C]" />
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#F8F6F3] border border-[#E8E0D8] text-[#57534E] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <SlidersHorizontal size={14} strokeWidth={1.8} />
              </div>
            </button>
          </div>

          {/* Meaningful Itinerary Value Proposition Line (Positioned cleanly below the globe) */}
          <div className="relative z-10 text-[10px] sm:text-xs font-semibold tracking-wider sm:tracking-widest text-[#6B6B6B] pt-12 sm:pt-24 md:pt-44 uppercase">
            <span>Precision Day-by-Day Itineraries</span> &nbsp;·&nbsp;
            <span>Live Visa Guidance</span> &nbsp;·&nbsp;
            <span>Transparent Real-Time Fares</span>
          </div>

        </div>
      </section>

      {/* ─── HOW SIMPLE SECTION ────────────────────────────────────────────── */}
      <section className="py-10 bg-white border-t border-b border-[#E8E0D8]">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {/* Step 1 */}
            <div className="text-left space-y-1">
              <span className="text-sm font-bold text-[#EA580C] block mb-1">01</span>
              <h4 className="font-display font-semibold text-[#1A1A1A] text-lg">Step 1 — Tell us where</h4>
              <p className="text-xs md:text-sm text-[#6B6B6B] leading-relaxed">
                Input departure, destination, and dates in seconds.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-left space-y-1">
              <span className="text-sm font-bold text-[#EA580C] block mb-1">02</span>
              <h4 className="font-display font-semibold text-[#1A1A1A] text-lg">Step 2 — We build the plan</h4>
              <p className="text-xs md:text-sm text-[#6B6B6B] leading-relaxed">
                Our system fetches live connection options and hotels.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-left space-y-1">
              <span className="text-sm font-bold text-[#EA580C] block mb-1">03</span>
              <h4 className="font-display font-semibold text-[#1A1A1A] text-lg">Step 3 — Pick and book</h4>
              <p className="text-xs md:text-sm text-[#6B6B6B] leading-relaxed">
                Refine details and book directly with travel providers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── DESTINATIONS HUB SECTION ─────────────────────────────────────────── */}
      <section id="destinations" className="py-12 md:py-16 bg-[#FFFBF7]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-8">

          {/* Header & Filter Pill Tabs */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 text-left border-b border-[#E8E0D8] pb-6">
            <div>
              <span className="text-[11px] font-extrabold text-[#EA580C] uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full border border-orange-200 inline-block mb-2">
                Popular Routes
              </span>
              <h2 className="font-display text-2xl md:text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
                Trending Destinations
              </h2>
              <p className="text-xs md:text-sm text-[#6B6B6B] font-medium mt-1">
                Curated global routes and domestic getaways with live visa guidance and instant AI itineraries.
              </p>
            </div>

            {/* Premium Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar" suppressHydrationWarning>
              {[
                { id: 'all', label: 'All Destinations' },
                { id: 'intl', label: 'International' },
                { id: 'domestic', label: 'India Escapes' },
                { id: 'visafree', label: 'Visa Free' },
              ].map(tab => {
                const isActive = destTab === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    suppressHydrationWarning
                    onClick={() => {
                      setDestTab(tab.id as any)
                      setShowAllDest(false)
                    }}
                    className={`relative px-5 py-2.5 rounded-full text-xs font-extrabold transition-colors whitespace-nowrap cursor-pointer ${isActive ? 'text-white font-black' : 'bg-white text-[#6B6B6B] border border-[#E8E0D8] hover:border-[#EA580C] hover:text-[#1A1A1A]'
                      }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTabPill"
                        className="absolute inset-0 bg-[#EA580C] rounded-full shadow-md z-0"
                        transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Compact 4-Column Responsive Grid System (2-Column on Mobile) */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {(
              destTab === 'intl'
                ? BLUEPRINT_DESTINATIONS
                : destTab === 'domestic'
                  ? DOMESTIC_DESTINATIONS
                  : destTab === 'visafree'
                    ? [...BLUEPRINT_DESTINATIONS, ...DOMESTIC_DESTINATIONS].filter(d => (d as any).visaType === 'success' || (d as any).visa === 'Visa Free')
                    : [...BLUEPRINT_DESTINATIONS, ...DOMESTIC_DESTINATIONS]
            )
              .slice(0, showAllDest ? 16 : 4)
              .map((d, i) => (
                <div
                  key={i}
                  className="w-full h-[220px] sm:h-[260px] md:h-[280px] relative rounded-2xl overflow-hidden shadow-sm group cursor-pointer border border-[#E8E0D8] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-[#FED7AA]"
                  onClick={() => {
                    if (d.link) {
                      router.push(d.link)
                    } else {
                      setForm(p => ({ ...p, to: d.name }))
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }
                  }}
                >
                  {/* Full-bleed Ultra 4K Photo */}
                  <img
                    src={d.img}
                    alt={d.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />

                  {/* Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent transition-opacity duration-300" />

                  {/* Top Glassmorphism Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                    <span className={`backdrop-blur-md bg-black/60 border text-white text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1 ${(d as any).visaType === 'success' || (d as any).badge ? 'border-emerald-400/60 text-emerald-300' : 'border-sky-400/60 text-sky-300'
                      }`}>
                      {(d as any).visaType === 'success' ? <ShieldCheck size={11} className="text-emerald-400" /> : (d as any).badge ? <MapPin size={11} className="text-emerald-400" /> : <FileCheck size={11} className="text-sky-400" />}
                      <span>{(d as any).visa || (d as any).badge}</span>
                    </span>

                    <span className="backdrop-blur-md bg-black/60 border border-white/30 text-white/90 text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Calendar size={10} className="text-amber-300" />
                      <span>{d.season}</span>
                    </span>
                  </div>

                  {/* Bottom Information Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-10 text-left space-y-2">
                    <div>
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-300 block">
                        {d.bestFor}
                      </span>
                      <h3 className="font-display text-lg md:text-xl font-extrabold text-white leading-tight">
                        {d.city}, <span className="text-white/80 font-medium text-xs md:text-sm">{d.country}</span>
                      </h3>
                    </div>

                    <div className="pt-2 border-t border-white/20 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] text-white/70 block uppercase font-bold tracking-wider">Est. Budget</span>
                        <span className="text-xs md:text-sm font-extrabold text-amber-300">{d.budget} <span className="text-[10px] text-white/80 font-normal">• {d.duration}</span></span>
                      </div>

                      <span className="px-3 py-1.5 bg-[#EA580C] hover:bg-[#C2410C] text-white font-extrabold text-[11px] rounded-lg shadow-md flex items-center gap-1 transition-all active:scale-95">
                        <span>Plan</span>
                        <ChevronRight size={13} />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Expand / Collapse Button */}
          <div className="text-center pt-4">
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setShowAllDest(!showAllDest)}
              className="px-7 py-3.5 bg-white border border-[#E8E0D8] hover:border-[#EA580C] text-[#1A1A1A] hover:text-[#EA580C] font-extrabold text-xs tracking-wide rounded-full shadow-sm transition-all inline-flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>{showAllDest ? 'Show Fewer Destinations' : 'Explore More Destinations'}</span>
              <ChevronRight size={14} className={`transition-transform duration-300 ${showAllDest ? '-rotate-90' : 'rotate-90'}`} />
            </button>
          </div>

        </div>
      </section>

      {/* ─── FEATURES SECTION ────────────────────────────────────────────── */}
      <section className="py-12 md:py-16 bg-[#FFF4EE]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 text-left">
          <h2 className="font-display text-3xl font-bold text-[#1A1A1A] tracking-tight mb-10">
            Everything handled for you
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 w-full">
            {/* Flights and hotels */}
            <div className="p-6 bg-white rounded-2xl border border-[#E8E0D8] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[#FED7AA] flex flex-col gap-4 cursor-pointer">
              <div className="p-3 bg-[#FFF4EE] text-[#EA580C] rounded-xl w-fit shadow-sm border border-[#E8E0D8]">
                <Plane size={20} strokeWidth={1.5} />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-display font-semibold text-lg text-[#1A1A1A]">Flights and hotels</h4>
                <p className="text-sm text-[#6B6B6B] leading-relaxed">
                  Compare best-value flight connections and top rated hotel recommendations matching your profile.
                </p>
              </div>
            </div>

            {/* Visa guidance */}
            <div className="p-6 bg-white rounded-2xl border border-[#E8E0D8] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[#FED7AA] flex flex-col gap-4 cursor-pointer">
              <div className="p-3 bg-[#FFF4EE] text-[#EA580C] rounded-xl w-fit shadow-sm border border-[#E8E0D8]">
                <Shield size={20} strokeWidth={1.5} />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-display font-semibold text-lg text-[#1A1A1A]">Visa guidance</h4>
                <p className="text-sm text-[#6B6B6B] leading-relaxed">
                  Automatic visa requirements check and step-by-step guidance for Indian passport holders.
                </p>
              </div>
            </div>

            {/* Smart itineraries */}
            <div className="p-6 bg-white rounded-2xl border border-[#E8E0D8] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[#FED7AA] flex flex-col gap-4 cursor-pointer">
              <div className="p-3 bg-[#FFF4EE] text-[#EA580C] rounded-xl w-fit shadow-sm border border-[#E8E0D8]">
                <Sparkles size={20} strokeWidth={1.5} />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-display font-semibold text-lg text-[#1A1A1A]">Smart itineraries</h4>
                <p className="text-sm text-[#6B6B6B] leading-relaxed">
                  Tailored day-by-day travel plans, instant budget calculations, and curated local hidden gems.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ SECTION ─────────────────────────────────────────────────── */}
      <section className="py-12 md:py-16 bg-[#FFFBF7] border-t border-[#E8E0D8]">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold text-[#1A1A1A] tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = activeFaq === idx
              return (
                <div
                  key={idx}
                  className="bg-white border border-[#E8E0D8] rounded-[16px] overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    suppressHydrationWarning
                    className="w-full flex items-center justify-between p-5 text-left font-bold text-sm text-[#1A1A1A] focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <Minus size={16} className="text-[#EA580C]" strokeWidth={1.5} />
                    ) : (
                      <Plus size={16} className="text-[#6B6B6B]" strokeWidth={1.5} />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs md:text-sm text-[#6B6B6B] leading-relaxed border-t border-[#E8E0D8]/45 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── PREFERENCES MODAL ───────────────────────────────────────────── */}
      {showPrefModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-4 bg-[#1A1A1A]/35 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-[#E8E0D8] rounded-[24px] p-4 sm:p-6 md:p-8 max-w-md w-full max-h-[92vh] overflow-y-auto shadow-[0_4px_32px_rgba(0,0,0,0.12)] text-left relative space-y-4 sm:space-y-6 animate-scale-up">
            {/* Close button */}
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setShowPrefModal(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors p-1"
            >
              <X size={20} strokeWidth={1.5} />
            </button>

            <div>
              <h3 className="font-display font-bold text-lg sm:text-[20px] text-[#1A1A1A] leading-tight mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                One more step
              </h3>
              <p className="text-xs sm:text-[13px] text-[#6B6B6B] leading-relaxed">
                Customise travelers and budget to optimize your AI itinerary.
              </p>
            </div>

            {/* Travelers counter */}
            <div className="space-y-1.5">
              <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#6B6B6B]">Travelers</label>
              <div className="flex items-center gap-3 sm:gap-4 bg-[#FFFBF7] border border-[#E8E0D8] rounded-xl p-1.5 sm:p-2 w-fit">
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => {
                    const val = Math.max(1, parseInt(form.travelers) - 1)
                    setForm(p => ({ ...p, travelers: String(val) }))
                  }}
                  className="w-8 h-8 rounded-lg hover:bg-white flex items-center justify-center text-[#1A1A1A] hover:shadow-sm border border-transparent hover:border-[#E8E0D8] transition-all"
                >
                  <Minus size={15} strokeWidth={2} />
                </button>
                <span className="font-semibold text-[#1A1A1A] text-sm w-8 text-center">{form.travelers}</span>
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => {
                    const val = Math.min(10, parseInt(form.travelers) + 1)
                    setForm(p => ({ ...p, travelers: String(val) }))
                  }}
                  className="w-8 h-8 rounded-lg hover:bg-white flex items-center justify-center text-[#1A1A1A] hover:shadow-sm border border-transparent hover:border-[#E8E0D8] transition-all"
                >
                  <Plus size={15} strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Budget Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#6B6B6B]">Total Trip Budget</label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-xs sm:text-sm font-semibold text-[#6B6B6B]">
                  {form.currency === 'INR' ? '₹' : form.currency}
                </span>
                <input
                  type="number"
                  value={form.budget}
                  onChange={e => setForm(p => ({ ...p, budget: e.target.value }))}
                  className="w-full bg-[#FFFBF7] border border-[#E8E0D8] rounded-xl pl-8 pr-4 py-2.5 sm:py-3 outline-none text-[#1A1A1A] font-semibold text-xs sm:text-sm focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] transition-all"
                  placeholder="Enter total budget"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              disabled={loading}
              suppressHydrationWarning
              onClick={async () => {
                setLoading(true)
                trackEvent('plan_trip_click', { source: 'preference_modal' })
                if (form.currency) {
                  updateCurrency(form.currency as any)
                }
                sessionStorage.setItem('tripContext', JSON.stringify(form))
                setTimeout(() => {
                  setShowPrefModal(false)
                  router.push('/plan')
                }, 800)
              }}
              className="w-full bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs sm:text-[15px] h-[46px] sm:h-[52px] rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Plan my trip</span>
                  <ArrowRight size={16} strokeWidth={1.5} />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ─── AIRBNB-STYLE MOBILE SEARCH SHEET MODAL (Ultra-Clean & Responsive) ─── */}
      {showSearchDrawer && (
        <div className="fixed inset-0 z-[9999] bg-[#FFFBF7] flex flex-col md:hidden animate-fade-in overflow-y-auto w-full max-w-full">
          {/* Header */}
<<<<<<< HEAD
          <div className="sticky top-0 bg-[#FFFBF7]/95 backdrop-blur-md px-4 py-3 border-b border-[#E8E0D8] flex items-center justify-between z-10 shrink-0">
=======
          <div className="sticky top-0 bg-[#FFFBF7]/95 backdrop-blur-md px-4 py-3.5 border-b border-[#E8E0D8] flex items-center justify-between z-10 w-full shrink-0 min-h-[56px]">
>>>>>>> aa60022a504970fc431125356ef4a7fb8a5c5295
            <button
              type="button"
              onClick={() => setShowSearchDrawer(false)}
              className="w-10 h-10 rounded-full bg-white border border-[#E8E0D8] flex items-center justify-center text-[#1A1A1A] shadow-2xs cursor-pointer active:scale-95 shrink-0"
              aria-label="Close search"
            >
              <X size={20} strokeWidth={2} />
            </button>
            <span className="font-display font-extrabold text-base text-[#1A1A1A] truncate max-w-[200px] text-center">Search & Plan Trip</span>
            <button
              type="button"
              onClick={() => setForm(p => ({ ...p, from: '', to: '', startDate: '', endDate: '' }))}
              className="text-xs font-extrabold text-[#EA580C] hover:underline cursor-pointer min-h-[44px] px-2 flex items-center shrink-0"
            >
              Reset
            </button>
          </div>

<<<<<<< HEAD
          {/* Body Content - Tightly Organized Clean Cards */}
          <div className="p-3.5 flex-1 space-y-3 text-left overflow-y-auto">

            {/* CARD 1: DEPARTURE & DESTINATION COMBINED BOX */}
            <div className="bg-white border border-[#E8E0D8] rounded-2xl p-3.5 shadow-2xs space-y-3">
              {/* Flying From */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-[#EA580C] flex items-center gap-1.5 font-display">
                  <Plane size={14} className="text-[#EA580C]" />
                  <span>Flying From</span>
                </label>
                <LocationAutocomplete
                  className="w-full bg-[#FFFBF7] border border-[#E8E0D8] rounded-xl px-3 py-2 outline-none text-xs font-bold text-[#1A1A1A] placeholder:text-[#9CA3AF]"
                  placeholder="Departure city (e.g. Hyderabad, Delhi)"
                  value={form.from}
                  onChange={(val: string) => setForm(p => ({ ...p, from: val }))}
                />
              </div>

              <div className="h-[1px] bg-[#E8E0D8]/60 w-full" />

              {/* Where to */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-[#EA580C] flex items-center gap-1.5 font-display">
                  <MapPin size={14} className="text-[#EA580C]" />
                  <span>Where to?</span>
                </label>
                <LocationAutocomplete
                  className="w-full bg-[#FFFBF7] border border-[#E8E0D8] rounded-xl px-3 py-2 outline-none text-xs font-bold text-[#1A1A1A] placeholder:text-[#9CA3AF]"
=======
          {/* Body Content - Mobile-first responsive cards */}
          <div className="p-4 flex-1 space-y-4 text-left w-full max-w-full overflow-x-hidden">

            {/* CARD 1: DESTINATION & DEPARTURE COMBINED BOX */}
            <div className="bg-white border border-[#E8E0D8] rounded-2xl p-4 shadow-2xs space-y-4 w-full">
              {/* Where to */}
              <div className="space-y-2 w-full">
                <label className="text-[11px] font-black uppercase tracking-wider text-[#EA580C] flex items-center gap-1.5 font-display">
                  <MapPin size={14} className="text-[#EA580C] shrink-0" />
                  <span>Where to?</span>
                </label>
                <LocationAutocomplete
                  className="w-full bg-[#FFFBF7] border border-[#E8E0D8] rounded-xl px-3.5 py-3 outline-none text-sm font-bold text-[#1A1A1A] placeholder:text-[#9CA3AF] min-h-[48px]"
>>>>>>> aa60022a504970fc431125356ef4a7fb8a5c5295
                  placeholder="Search destination (e.g. Bali, Goa, Dubai)"
                  value={form.to}
                  onChange={(val: string) => setForm(p => ({ ...p, to: val }))}
                />
                {/* Popular Pill Chips - Wrap cleanly onto multiple lines */}
                <div className="flex flex-wrap items-center gap-2 pt-1.5 w-full">
                  {['Bali', 'Goa', 'Dubai', 'Ladakh', 'Thailand', 'Singapore'].map((place) => (
                    <button
                      key={place}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, to: place }))}
                      className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all shrink-0 cursor-pointer min-h-[36px] flex items-center justify-center ${
                        form.to === place ? 'bg-[#EA580C] text-white shadow-2xs' : 'bg-[#FFF4EE] text-[#EA580C] border border-[#FED7AA]'
                      }`}
                    >
                      {place}
                    </button>
                  ))}
                </div>
              </div>
<<<<<<< HEAD
            </div>

            {/* CARD 2: TRIP DATES (Modern Interactive Calendar) */}
            <div className="bg-white border border-[#E8E0D8] rounded-2xl p-3.5 shadow-2xs space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-[#EA580C] flex items-center gap-1.5 font-display">
                <Calendar size={14} className="text-[#EA580C]" />
=======

              <div className="h-[1px] bg-[#E8E0D8]/60 w-full" />

              {/* Flying From */}
              <div className="space-y-2 w-full">
                <label className="text-[11px] font-black uppercase tracking-wider text-[#EA580C] flex items-center gap-1.5 font-display">
                  <Plane size={14} className="text-[#EA580C] shrink-0" />
                  <span>Flying From</span>
                </label>
                <LocationAutocomplete
                  className="w-full bg-[#FFFBF7] border border-[#E8E0D8] rounded-xl px-3.5 py-3 outline-none text-sm font-bold text-[#1A1A1A] placeholder:text-[#9CA3AF] min-h-[48px]"
                  placeholder="Departure city (e.g. Bangalore, Delhi)"
                  value={form.from}
                  onChange={(val: string) => setForm(p => ({ ...p, from: val }))}
                />
              </div>
            </div>

            {/* CARD 2: TRIP DATES (Modern Interactive Calendar) */}
            <div className="bg-white border border-[#E8E0D8] rounded-2xl p-4 shadow-2xs space-y-3 w-full">
              <label className="text-[11px] font-black uppercase tracking-wider text-[#EA580C] flex items-center gap-1.5 font-display">
                <Calendar size={14} className="text-[#EA580C] shrink-0" />
>>>>>>> aa60022a504970fc431125356ef4a7fb8a5c5295
                <span>Trip Dates</span>
              </label>
              
              <CustomDatePicker
                startDate={form.startDate}
                endDate={form.endDate}
                onChange={(start, end) => setForm(p => ({ ...p, startDate: start, endDate: end }))}
                labelStart="Departure"
                labelEnd="Return"
              />
            </div>

          </div>

          {/* Sticky Bottom Search CTA */}
<<<<<<< HEAD
          <div className="sticky bottom-0 bg-white border-t border-[#E8E0D8] p-3.5 shadow-lg shrink-0">
=======
          <div className="sticky bottom-0 bg-white border-t border-[#E8E0D8] p-4 shadow-lg w-full shrink-0">
>>>>>>> aa60022a504970fc431125356ef4a7fb8a5c5295
            <button
              type="button"
              suppressHydrationWarning
              onClick={(e) => {
                setShowSearchDrawer(false)
                handleSubmit(e)
              }}
<<<<<<< HEAD
              className="w-full bg-gradient-to-r from-[#EA580C] via-[#F97316] to-[#EA580C] text-white font-extrabold text-xs sm:text-sm h-[46px] rounded-xl flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 active:scale-98 transition-transform cursor-pointer"
=======
              className="w-full bg-gradient-to-r from-[#EA580C] via-[#F97316] to-[#EA580C] text-white font-extrabold text-sm min-h-[48px] rounded-xl flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 active:scale-98 transition-transform cursor-pointer"
>>>>>>> aa60022a504970fc431125356ef4a7fb8a5c5295
            >
              <Search size={16} strokeWidth={2.5} />
              <span>Search & Plan Trip</span>
            </button>
          </div>
        </div>
      )}

      {/* ─── MOBILE FLOATING QUICK PLAN CTA FAB (Centred Bottom Capsule) ─── */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-max mx-auto">
        <button
          type="button"
          suppressHydrationWarning
          onClick={() => setShowSearchDrawer(true)}
          className="px-6 py-3 bg-gradient-to-r from-[#EA580C] via-[#F97316] to-[#EA580C] text-white font-extrabold text-xs rounded-full flex items-center justify-center gap-2 shadow-[0_12px_35px_rgba(234,88,12,0.42)] active:scale-95 transition-all border border-white/30 backdrop-blur-xl cursor-pointer whitespace-nowrap"
        >
          <Sparkles size={15} className="text-white animate-pulse" />
          <span>Plan Trip with AI</span>
          <ArrowRight size={14} />
        </button>
      </div>

      <Footer />
    </div>
  )
}
