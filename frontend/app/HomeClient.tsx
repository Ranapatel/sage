'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import LocationAutocomplete from '@/components/ui/LocationAutocomplete'
import { trackEvent } from '@/lib/analytics'
import { tripAPI } from '@/lib/api'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useInView } from 'framer-motion'
import { useIsMobile } from '@/hooks/useIsMobile'
import {
  MapPin, Calendar, ArrowRight, Plane, Shield, Sparkles, Plus, Minus, Info, ChevronRight, X, Search, SlidersHorizontal, Users
} from 'lucide-react'

// ─── Data ─────────────────────────────────────────────────────────────────────

const BLUEPRINT_DESTINATIONS = [
  {
    name: 'Bali, Indonesia',
    img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80&auto=format&fit=crop',
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
    img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80&auto=format&fit=crop',
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
    img: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&q=80&auto=format&fit=crop',
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
    img: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&q=80&auto=format&fit=crop',
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
    img: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=600&q=80&auto=format&fit=crop',
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
    img: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&q=80&auto=format&fit=crop',
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
]

const DOMESTIC_DESTINATIONS = [
  {
    name: 'Goa',
    img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&q=80&auto=format&fit=crop',
    season: 'Nov – Feb',
    city: 'Goa',
    country: 'Goa',
    badge: 'Beach favorite',
    budget: '₹12,000',
    duration: '4 nights',
    bestFor: 'Beaches, Friends',
    link: '/seo/goa-trip-under-10000',
  },
  {
    name: 'Manali',
    img: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=600&q=80&auto=format&fit=crop',
    season: 'Oct – Jun',
    city: 'Manali',
    country: 'Himachal Pradesh',
    badge: 'Hill escape',
    budget: '₹18,000',
    duration: '5 nights',
    bestFor: 'Mountains, Adventure',
    link: '/seo/manali-trip-planner',
  },
  {
    name: 'Kerala',
    img: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=600&q=80&auto=format&fit=crop',
    season: 'Sep – Mar',
    city: 'Kerala',
    country: 'Kerala',
    badge: 'Family favorite',
    budget: '₹22,000',
    duration: '5 nights',
    bestFor: 'Family, Nature',
    link: '/seo/budget-kerala-trip',
  },
  {
    name: 'Rishikesh',
    img: 'https://images.unsplash.com/photo-1603867106100-0d2039fc8757?w=600&q=80&auto=format&fit=crop',
    season: 'Sep – Apr',
    city: 'Rishikesh',
    country: 'Uttarakhand',
    badge: 'Weekend friendly',
    budget: '₹9,000',
    duration: '3 nights',
    bestFor: 'Adventure, Spiritual',
    link: '',
  },
  {
    name: 'Jaipur',
    img: 'https://images.unsplash.com/photo-1524230507669-5ff97982bb5e?w=600&q=80&auto=format&fit=crop',
    season: 'Oct – Mar',
    city: 'Jaipur',
    country: 'Rajasthan',
    badge: 'Heritage trip',
    budget: '₹10,000',
    duration: '3 nights',
    bestFor: 'Culture, Heritage',
    link: '/seo/budget-rajasthan-trip',
  },
  {
    name: 'Kashmir',
    img: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=600&q=80&auto=format&fit=crop',
    season: 'Mar – Oct',
    city: 'Kashmir',
    country: 'Jammu & Kashmir',
    badge: 'Honeymoon pick',
    budget: '₹28,000',
    duration: '5 nights',
    bestFor: 'Honeymoon, Nature',
    link: '/seo/honeymoon-in-kashmir',
  },
  {
    name: 'Andaman',
    img: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=600&q=80&auto=format&fit=crop',
    season: 'Oct – May',
    city: 'Andaman',
    country: 'Andaman Islands',
    badge: 'Island escape',
    budget: '₹35,000',
    duration: '5 nights',
    bestFor: 'Beaches, Couples',
    link: '/seo/honeymoon-in-andaman',
  },
  {
    name: 'Varanasi',
    img: 'https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=600&q=80&auto=format&fit=crop',
    season: 'Oct – Mar',
    city: 'Varanasi',
    country: 'Uttar Pradesh',
    badge: 'Spiritual trip',
    budget: '₹8,000',
    duration: '3 nights',
    bestFor: 'Spiritual, Culture',
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
    q: 'Does TripSage handle flight booking cancellations?',
    a: 'TripSage is a planning assistant. All flights and stays are booked directly with partners (like Skyscanner, Booking.com, etc.), and cancellations are handled by those platforms.',
  },
]

export default function HomeClient() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const isDesktop = !isMobile
  const [reviews, setReviews] = useState<any[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
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

  useEffect(() => {
    let active = true
    const fetchReviews = async () => {
      try {
        const res = await tripAPI.getReviews()
        if (active && res.success && Array.isArray(res.data)) {
          setReviews(res.data)
        }
      } catch (err) {
        console.error('Error fetching reviews:', err)
      } finally {
        if (active) setReviewsLoading(false)
      }
    }
    fetchReviews()
    return () => { active = false }
  }, [])

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

    // Disabled auto-detect location as it was automatically typing the user's IP city (e.g. Hyderabad)
    /*
    if (!form.from) {
      tripAPI.getIpLocation().then((res: any) => {
        if (res.success && res.data) {
          const d = res.data
          const city = d.city?.name || d.city || d.area?.name
          const country = d.country?.name || d.country_name || d.location?.country?.name || d.country
          if (city && country) {
            setForm(p => ({ ...p, from: `${city}, ${country}` }))
          }
        }
      }).catch(() => { })
    }
    */
  }, [])

  useEffect(() => {
    Promise.resolve().then(() => setInitialized(true))
  }, [])

  return (
    <div className="min-h-screen bg-[#FFFBF7] text-[#6B6B6B] font-body selection:bg-orange-500/20 selection:text-[#EA580C] antialiased">
      <Navbar />

      {/* ─── HERO SECTION ─────────────────────────────────────────────────── */}
      <section className="relative min-h-[50vh] flex flex-col items-center justify-center px-4 md:px-6 overflow-hidden bg-[#FFFBF7]">
        {/* Ambient Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-[#FFEDD5]/40 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="relative z-10 text-center max-w-5xl mx-auto w-full py-8 md:py-14">
          
          {/* Main Headline & Subtitle */}
          <div className="text-center mb-6 md:mb-10">
            <h1
              className="font-display text-[32px] md:text-[64px] font-bold text-[#1A1A1A] tracking-tight leading-tight md:leading-none text-center mb-2 md:mb-4"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Where to next?
            </h1>
            <p
              className="text-[14px] md:text-[18px] text-[#6B6B6B] font-normal leading-relaxed text-center max-w-xl mx-auto"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Tell us where you want to go — we plan everything else.
            </p>
          </div>

          {/* Mobile Airbnb-Style Floating Search Pill Trigger */}
          <div className="flex md:hidden flex-col w-full mb-6 text-left">
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setShowSearchDrawer(true)}
              className="w-full bg-white border border-[#E8E0D8] rounded-full py-3.5 px-4 shadow-[0_4px_16px_rgba(0,0,0,0.08)] flex items-center justify-between transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#FFF4EE] flex items-center justify-center text-[#EA580C]">
                  <Search size={18} strokeWidth={2.5} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-extrabold text-[#1A1A1A]">Where to next?</p>
                  <p className="text-[11px] font-semibold text-[#6B6B6B]">
                    {form.to ? form.to : 'Anywhere'} • {form.startDate ? form.startDate : 'Any dates'} • {form.travelers} travelers
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full border border-[#E8E0D8] flex items-center justify-center text-[#1A1A1A] bg-[#FFFBF7]">
                <SlidersHorizontal size={14} strokeWidth={2} />
              </div>
            </button>
          </div>

          {/* Search Form (Desktop Horizontal) */}
          <form
            onSubmit={handleSubmit}
            className="hidden md:flex items-center w-full max-w-4xl bg-white border-[1.5px] border-[#E8E0D8] rounded-[16px] p-2.5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] mx-auto text-left"
          >
            {/* From */}
            <div className="flex-[1.2] px-4 border-r border-[#E8E0D8]">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#6B6B6B] block mb-1">From</label>
              <LocationAutocomplete
                className="w-full bg-transparent border-none outline-none text-[#1A1A1A] font-semibold text-sm placeholder:text-[#A1A1AA]/60 p-0 focus:ring-0"
                placeholder="Departure city"
                value={form.from}
                onChange={(val: string) => setForm(p => ({ ...p, from: val }))}
              />
            </div>

            {/* To */}
            <div className="flex-[1.2] px-4 border-r border-[#E8E0D8]">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#6B6B6B] block mb-1">To</label>
              <LocationAutocomplete
                className="w-full bg-transparent border-none outline-none text-[#1A1A1A] font-semibold text-sm placeholder:text-[#A1A1AA]/60 p-0 focus:ring-0"
                placeholder="Destination"
                value={form.to}
                onChange={(val: string) => setForm(p => ({ ...p, to: val }))}
              />
            </div>

            {/* When (Depart & Return) */}
            <div className="flex-[1.6] px-4 flex items-center gap-2">
              <div className="flex-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#6B6B6B] block mb-1">Depart</label>
                <input
                  type="date"
                  required
                  suppressHydrationWarning
                  value={form.startDate}
                  onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                  className="w-full bg-transparent border-none outline-none text-[#1A1A1A] font-semibold text-xs p-0 focus:ring-0 cursor-pointer"
                />
              </div>
              <div className="w-px bg-[#E8E0D8] h-8 self-center"></div>
              <div className="flex-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#6B6B6B] block mb-1">Return</label>
                <input
                  type="date"
                  suppressHydrationWarning
                  value={form.endDate}
                  min={form.startDate || undefined}
                  onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
                  className="w-full bg-transparent border-none outline-none text-[#1A1A1A] font-semibold text-xs p-0 focus:ring-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              suppressHydrationWarning
              className="bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold px-8 h-[48px] rounded-xl text-sm flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ml-2 shrink-0"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Plan my trip</span>
                  <ArrowRight size={15} strokeWidth={1.5} />
                </>
              )}
            </button>
          </form>

          {/* Micro-copy below search */}
          <p className="text-[13px] text-[#6B6B6B] italic font-normal text-center mt-6">
            ₹ Budget and travelers — just one more step
          </p>
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

      {/* ─── DESTINATIONS SECTION ─────────────────────────────────────────── */}
      <section id="destinations" className="py-12 md:py-16 bg-[#FFFBF7]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-12">
          
          {/* Row 1: Popular international trips */}
          <div className="space-y-6">
            <div className="text-left">
              <h2 className="font-display text-2xl font-bold text-[#1A1A1A] tracking-tight">
                Popular international trips
              </h2>
            </div>
            
            {/* Horizontal Scroll row with snap alignment */}
            <div className="flex gap-6 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory hide-scrollbar">
              {BLUEPRINT_DESTINATIONS.map((d, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-[220px] h-[300px] snap-center bg-white border border-[#E8E0D8] rounded-[16px] overflow-hidden shadow-sm flex flex-col group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[#FED7AA]"
                  onClick={() => {
                    if (d.link) {
                      router.push(d.link)
                    } else {
                      setForm(p => ({ ...p, to: d.name }))
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }
                  }}
                >
                  {/* Photo Top 55% */}
                  <div className="h-[55%] w-full relative overflow-hidden">
                    <img
                      src={d.img}
                      alt={d.name}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300 rounded-t-[16px]"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3">
                      <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        d.visaType === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-orange-50 text-orange-700 border border-orange-100'
                      }`}>
                        {d.visa}
                      </span>
                    </div>
                  </div>

                  {/* Details Bottom 45% */}
                  <div className="h-[45%] p-3.5 bg-white flex flex-col justify-between text-left">
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between">
                        <h4 className="font-display font-semibold text-[#1A1A1A] text-sm leading-tight truncate mr-2">{d.city}</h4>
                        <span className="text-[10px] text-[#EA580C] font-semibold whitespace-nowrap">Best: {d.season}</span>
                      </div>
                      <p className="text-[11px] text-[#6B6B6B]">{d.country}</p>
                      <p className="text-[10px] text-[#9CA3AF] truncate">Best for: {d.bestFor}</p>
                    </div>
                    <div className="border-t border-[#E8E0D8] pt-2 flex items-center justify-between">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#FFF4EE] text-[#EA580C] border border-[#FED7AA]">
                        {d.budget} • {d.duration}
                      </span>
                      <span className="text-[#EA580C] text-[12px] font-bold flex items-center gap-0.5 hover:underline">
                        Plan <ChevronRight size={11} />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 2: Popular domestic getaways */}
          <div className="space-y-6">
            <div className="text-left">
              <h2 className="font-display text-2xl font-bold text-[#1A1A1A] tracking-tight">
                Popular domestic getaways
              </h2>
            </div>
            
            {/* Horizontal Scroll row with snap alignment */}
            <div className="flex gap-6 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory hide-scrollbar">
              {DOMESTIC_DESTINATIONS.map((d, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-[220px] h-[300px] snap-center bg-white border border-[#E8E0D8] rounded-[16px] overflow-hidden shadow-sm flex flex-col group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[#FED7AA]"
                  onClick={() => {
                    if (d.link) {
                      router.push(d.link)
                    } else {
                      setForm(p => ({ ...p, to: d.name }))
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }
                  }}
                >
                  {/* Photo Top 55% */}
                  <div className="h-[55%] w-full relative overflow-hidden">
                    <img
                      src={d.img}
                      alt={d.name}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300 rounded-t-[16px]"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-100">
                        {d.badge}
                      </span>
                    </div>
                  </div>

                  {/* Details Bottom 45% */}
                  <div className="h-[45%] p-3.5 bg-white flex flex-col justify-between text-left">
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between">
                        <h4 className="font-display font-semibold text-[#1A1A1A] text-sm leading-tight truncate mr-2">{d.city}</h4>
                        <span className="text-[10px] text-[#EA580C] font-semibold whitespace-nowrap">Best: {d.season}</span>
                      </div>
                      <p className="text-[11px] text-[#6B6B6B]">{d.country}</p>
                      <p className="text-[10px] text-[#9CA3AF] truncate">Best for: {d.bestFor}</p>
                    </div>
                    <div className="border-t border-[#E8E0D8] pt-2 flex items-center justify-between">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#FFF4EE] text-[#EA580C] border border-[#FED7AA]">
                        {d.budget} • {d.duration}
                      </span>
                      <span className="text-[#EA580C] text-[12px] font-bold flex items-center gap-0.5 hover:underline">
                        Plan <ChevronRight size={11} />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-[#1A1A1A]/35 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-[#E8E0D8] rounded-[24px] p-6 md:p-8 max-w-md w-full shadow-[0_4px_32px_rgba(0,0,0,0.12)] text-left relative space-y-6 animate-scale-up">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowPrefModal(false)}
              className="absolute top-4 right-4 text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors"
            >
              <X size={20} strokeWidth={1.5} />
            </button>

            <div>
              <h3 className="font-display font-bold text-[20px] text-[#1A1A1A] leading-tight mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                One more step
              </h3>
              <p className="text-[13px] text-[#6B6B6B] leading-relaxed">
                Customise travelers and budget to optimize your AI itinerary.
              </p>
            </div>

            {/* Travelers counter */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#6B6B6B]">Travelers</label>
              <div className="flex items-center gap-4 bg-[#FFFBF7] border border-[#E8E0D8] rounded-xl p-2 w-fit">
                <button
                  type="button"
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
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#6B6B6B]">Total Trip Budget</label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-sm font-semibold text-[#6B6B6B]">
                  {form.currency === 'INR' ? '₹' : form.currency}
                </span>
                <input
                  type="number"
                  value={form.budget}
                  onChange={e => setForm(p => ({ ...p, budget: e.target.value }))}
                  className="w-full bg-[#FFFBF7] border border-[#E8E0D8] rounded-xl pl-8 pr-4 py-3 outline-none text-[#1A1A1A] font-semibold text-sm focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] transition-all"
                  placeholder="Enter total budget"
                />
              </div>
            </div>



            {/* Submit Button */}
            <button
              type="button"
              disabled={loading}
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
              className="w-full bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-[15px] h-[52px] rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Generate My Itinerary</span>
                  <ArrowRight size={16} strokeWidth={1.5} />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ─── AIRBNB-STYLE MOBILE SEARCH SHEET MODAL ────────────────────────────── */}
      {showSearchDrawer && (
        <div className="fixed inset-0 z-[9999] bg-[#FFFBF7] flex flex-col md:hidden animate-fade-in overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-[#FFFBF7]/95 backdrop-blur-md px-4 py-3.5 border-b border-[#E8E0D8] flex items-center justify-between z-10">
            <button
              type="button"
              onClick={() => setShowSearchDrawer(false)}
              className="w-8 h-8 rounded-full bg-white border border-[#E8E0D8] flex items-center justify-center text-[#1A1A1A] shadow-2xs"
            >
              <X size={18} strokeWidth={2} />
            </button>
            <span className="font-display font-extrabold text-base text-[#1A1A1A]">Where to next?</span>
            <button
              type="button"
              onClick={() => setForm(p => ({ ...p, from: '', to: '', startDate: '', endDate: '' }))}
              className="text-xs font-bold text-[#EA580C] hover:underline"
            >
              Clear
            </button>
          </div>

          {/* Body content */}
          <div className="p-4 flex-1 space-y-5 text-left">
            {/* Where to? */}
            <div className="bg-white border border-[#E8E0D8] rounded-[20px] p-4 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-[#EA580C]">
                <MapPin size={18} strokeWidth={2} />
                <h3 className="font-display font-extrabold text-sm text-[#1A1A1A] uppercase tracking-wider">Where to?</h3>
              </div>
              <LocationAutocomplete
                className="w-full bg-[#FFFBF7] border border-[#E8E0D8] rounded-xl px-3 py-2.5 outline-none text-sm text-[#1A1A1A] font-semibold"
                placeholder="Search destination (e.g. Bali, Goa, Dubai)"
                value={form.to}
                onChange={(val: string) => setForm(p => ({ ...p, to: val }))}
              />
              <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
                {['Bali', 'Goa', 'Dubai', 'Ladakh', 'Thailand', 'Singapore'].map((place) => (
                  <button
                    key={place}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, to: place }))}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      form.to === place ? 'bg-[#EA580C] text-white' : 'bg-[#FFF4EE] text-[#EA580C] border border-[#FED7AA]'
                    }`}
                  >
                    {place}
                  </button>
                ))}
              </div>
            </div>

            {/* Departure City */}
            <div className="bg-white border border-[#E8E0D8] rounded-[20px] p-4 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-[#EA580C]">
                <Plane size={18} strokeWidth={2} />
                <h3 className="font-display font-extrabold text-sm text-[#1A1A1A] uppercase tracking-wider">Departure City</h3>
              </div>
              <LocationAutocomplete
                className="w-full bg-[#FFFBF7] border border-[#E8E0D8] rounded-xl px-3 py-2.5 outline-none text-sm text-[#1A1A1A] font-semibold"
                placeholder="Flying from (e.g. Bangalore, Delhi)"
                value={form.from}
                onChange={(val: string) => setForm(p => ({ ...p, from: val }))}
              />
            </div>

            {/* Trip Dates */}
            <div className="bg-white border border-[#E8E0D8] rounded-[20px] p-4 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-[#EA580C]">
                <Calendar size={18} strokeWidth={2} />
                <h3 className="font-display font-extrabold text-sm text-[#1A1A1A] uppercase tracking-wider">When?</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B6B] block mb-1">Departure</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                    className="w-full bg-[#FFFBF7] border border-[#E8E0D8] rounded-xl px-2.5 py-2 text-xs font-bold text-[#1A1A1A] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B6B] block mb-1">Return</label>
                  <input
                    type="date"
                    value={form.endDate}
                    min={form.startDate || undefined}
                    onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
                    className="w-full bg-[#FFFBF7] border border-[#E8E0D8] rounded-xl px-2.5 py-2 text-xs font-bold text-[#1A1A1A] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Travelers & Budget */}
            <div className="bg-white border border-[#E8E0D8] rounded-[20px] p-4 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-[#EA580C]">
                <Users size={18} strokeWidth={2} />
                <h3 className="font-display font-extrabold text-sm text-[#1A1A1A] uppercase tracking-wider">Travelers & Budget</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B6B] block mb-1">Travelers</label>
                  <select
                    value={form.travelers}
                    onChange={e => setForm(p => ({ ...p, travelers: e.target.value }))}
                    className="w-full bg-[#FFFBF7] border border-[#E8E0D8] rounded-xl px-2.5 py-2 text-xs font-bold text-[#1A1A1A] outline-none"
                  >
                    <option value="1">Solo (1)</option>
                    <option value="2">Couple (2)</option>
                    <option value="4">Group (4+)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B6B] block mb-1">Max Budget</label>
                  <select
                    value={form.budget}
                    onChange={e => setForm(p => ({ ...p, budget: e.target.value }))}
                    className="w-full bg-[#FFFBF7] border border-[#E8E0D8] rounded-xl px-2.5 py-2 text-xs font-bold text-[#1A1A1A] outline-none"
                  >
                    <option value="30000">₹30,000</option>
                    <option value="50000">₹50,000</option>
                    <option value="100000">₹1,00,000</option>
                    <option value="200000">₹2,00,000+</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Bottom Search CTA */}
          <div className="sticky bottom-0 bg-white border-t border-[#E8E0D8] p-4">
            <button
              type="button"
              onClick={(e) => {
                setShowSearchDrawer(false)
                handleSubmit(e)
              }}
              className="w-full bg-gradient-to-r from-[#EA580C] to-[#F97316] text-white font-extrabold text-base h-[52px] rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 active:scale-98 transition-transform"
            >
              <Search size={18} strokeWidth={2.5} />
              <span>Search & Plan Trip</span>
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
