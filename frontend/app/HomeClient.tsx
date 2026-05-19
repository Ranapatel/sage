'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence, useReducedMotion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { useAuthStore } from '@/store/authStore'
import LocationAutocomplete from '@/components/ui/LocationAutocomplete'
import { tripAPI } from '@/lib/api'
import { trackEvent } from '@/lib/analytics'
import LegalModal from '@/components/ui/LegalModal'
import { SYMBOLS, CURRENCY_NAMES } from '@/lib/currency'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { getOptimizedImageUrl } from '@/lib/imageUtils'
import { 
  MapPin, 
  Calendar, 
  Wallet, 
  Users, 
  Compass, 
  Zap, 
  Sparkles, 
  LogOut,
  X,
  Menu,
  ArrowRight,
  Search,
  Brain,
  Map,
  Headphones as HeadphonesIcon,
  PiggyBank,
  BellRing,
  Coins
} from 'lucide-react'

const POPULAR_DESTINATIONS = [
  { name: 'Bali, Indonesia', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80', tag: 'Tropical', link: '/seo/budget-bali-trip' },
  { name: 'Goa, India', img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&q=80', tag: 'Beach', link: '/seo/goa-trip-under-10000' },
  { name: 'Manali, India', img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&q=80', tag: 'Mountains', link: '/seo/manali-trip-planner' },
  { name: 'Hyderabad, India', img: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?w=400&q=80', tag: 'Cultural', link: '/weekend-trips-from-hyderabad' },
  { name: 'Best Beaches', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80', tag: 'Scenic', link: '/seo/best-beaches-in-india' },
  { name: 'Honeymoon', img: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400&q=80', tag: 'Romantic', link: '/seo/best-honeymoon-destinations-india' },
]

const FEATURES = [
  { icon: Brain, title: 'AI Planning', desc: 'AI planner generates personalized itineraries in seconds' },
  { icon: Zap, title: 'Real-time', desc: 'Live flight prices, hotel availability, and weather updates' },
  { icon: Map, title: 'Smart Maps', desc: 'Interactive maps with clickable places and route optimization' },
  { icon: HeadphonesIcon, title: 'Support', desc: 'Our AI and support team are here for you anytime, anywhere' },
  { icon: PiggyBank, title: 'Budget', desc: 'Score-based ranking: affordability × rating × relevance' },
  { icon: BellRing, title: 'Notifications', desc: 'Real-time updates, price drop alerts, and travel reminders' },
]

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=90",
  "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1920&q=90",
  "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1920&q=90",
  "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1920&q=90",
  "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=1920&q=90"
]

const STATS = [
  { label: 'Active Travelers', value: 12400, suffix: '+' },
  { label: 'Countries Covered', value: 50, suffix: '+' },
  { label: 'AI Itineraries', value: 85000, suffix: '+' },
  { label: 'Success Rate', value: 99, suffix: '%' },
]

function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  return <span>{to.toLocaleString()}{suffix}</span>
}

// Top 12 currencies for the landing page selector
const POPULAR_CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'JPY', 'AUD', 'CAD', 'SGD', 'THB', 'MYR', 'SAR']

export default function HomeClient() {
  const router = useRouter()
  const { user, isLoggedIn, logout, updateCurrency } = useAuthStore()
  const [currentImage, setCurrentImage] = useState(0)
  const [form, setForm] = useState({
    from: '',
    to: '',
    startDate: '',
    endDate: '',
    budget: '',
    travelers: '2',
    style: 'adventure',
    currency: user?.currency || 'INR',
  })
  const [loading, setLoading] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  // Sync currency from auth store if user logs in after mount
  useEffect(() => {
    if (user?.currency && user.currency !== form.currency) {
      setForm(p => ({ ...p, currency: user.currency }))
    }
  }, [user?.currency])

  // Handle responsive check
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768)
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  // Auto-rotate slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage(prev => (prev + 1) % HERO_IMAGES.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.from || !form.to || !form.startDate) return
    setLoading(true)
    trackEvent('plan_trip_click', { source: 'hero_form' })
    // Persist selected currency to auth store so plan page uses it
    if (form.currency) {
      updateCurrency(form.currency as any)
    }
    // Store in session and navigate
    sessionStorage.setItem('tripContext', JSON.stringify(form))
    setTimeout(() => router.push('/plan'), 800)
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
    setInitialized(true)
  }, [])

  return (
    <div className="min-h-screen bg-grid">
      <Navbar />

      {/* HERO */}
      <section className="relative min-h-[95vh] flex flex-col items-center justify-center px-4 md:px-6 overflow-hidden bg-white md:bg-[#0F172A]">
        {/* Background Slideshow */}
        <div className="absolute inset-0 z-0 hidden md:block">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0"
            >
              <Image 
                src={getOptimizedImageUrl(HERO_IMAGES[currentImage], false)} 
                alt="Travel Hero" 
                fill 
                className="object-cover object-center"
                priority
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-black/45" />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative z-10 text-center max-w-5xl mx-auto">

          <motion.h1 
            className="section-title text-[clamp(2.5rem,7vw,5rem)] mb-8 font-extrabold tracking-tight text-slate-900 md:text-white leading-[1.1] md:drop-shadow-lg"
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Your AI-Powered
            <br />
            <span className="text-blue-600 md:text-blue-400">Travel Operating</span> <span className="text-orange-600 md:text-orange-400">System</span>
          </motion.h1>

          <motion.p 
            className="text-slate-600 md:text-slate-100 text-xl max-w-3xl mx-auto mb-16 leading-relaxed font-medium md:drop-shadow-md"
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            TripSage orchestrates real-time flights, hotels, activities, and AI itineraries —
            all personalized to your budget, style, and group.
          </motion.p>

          {/* SEARCH FORM */}
          <motion.form 
            ref={formRef}
            onSubmit={handleSubmit} 
            className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-3xl rounded-[40px] px-4 py-8 md:p-12 shadow-[0_32px_120px_-20px_rgba(0,0,0,0.18)] border border-white/60 max-w-5xl mx-auto text-left relative overflow-hidden w-full"
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="relative group">
                <label className="text-[11px] text-slate-400 uppercase tracking-widest mb-3 block font-bold">From</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5 pointer-events-none transition-transform group-focus-within:scale-110" />
                  <LocationAutocomplete
                    className="input-field !pl-12 !bg-slate-50/50 !border-slate-200/60 focus:!bg-white focus:!border-blue-400 min-h-[52px] md:min-h-[60px] !rounded-2xl transition-all duration-300"
                    placeholder="Hyderabad, India"
                    value={form.from}
                    onChange={(val: string) => setForm(p => ({ ...p, from: val }))}
                  />
                </div>
              </div>
              <div className="relative group">
                <label className="text-[11px] text-slate-400 uppercase tracking-widest mb-3 block font-bold">To</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5 pointer-events-none transition-transform group-focus-within:scale-110" />
                  <LocationAutocomplete
                    className="input-field !pl-12 !bg-slate-50/50 !border-slate-200/60 focus:!bg-white focus:!border-blue-400 min-h-[52px] md:min-h-[60px] !rounded-2xl transition-all duration-300"
                    placeholder="Bali, Indonesia"
                    value={form.to}
                    onChange={(val: string) => setForm(p => ({ ...p, to: val }))}
                  />
                </div>
              </div>
              <div className="relative group">
                <label className="text-[11px] text-slate-400 uppercase tracking-widest mb-3 block font-bold">Budget</label>
                <div className="input-field flex items-center gap-2 !p-0 focus-within:!border-blue-400 focus-within:!bg-white focus-within:!ring-4 focus-within:!ring-blue-500/10 min-h-[52px] md:min-h-[60px] !rounded-2xl transition-all duration-300">
                  {/* Currency selector inside the box */}
                  <div className="relative flex items-center pl-4 pr-1">
                    <Coins className="text-blue-500 w-4 h-4 mr-1.5 pointer-events-none" />
                    <select
                      className="bg-transparent border-none outline-none text-sm font-bold text-slate-700 cursor-pointer appearance-none pr-4 focus:ring-0 focus:outline-none"
                      value={form.currency}
                      onChange={e => setForm(p => ({ ...p, currency: e.target.value as any }))}
                      style={{
                        backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2364748b'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E")`,
                        backgroundPosition: 'right center',
                        backgroundSize: '14px',
                        backgroundRepeat: 'no-repeat',
                        paddingRight: '16px'
                      }}
                    >
                      {POPULAR_CURRENCIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Vertical divider */}
                  <div className="w-px h-6 bg-slate-200"></div>

                  {/* Active currency symbol dynamically updated */}
                  <span className="text-[15px] font-bold text-slate-500 pl-2 select-none">
                    {SYMBOLS[form.currency]}
                  </span>

                  {/* Number entering budget input */}
                  <input
                    className="flex-1 bg-transparent border-none outline-none py-3 pr-4 text-[15px] font-semibold text-slate-800 placeholder-slate-400 focus:ring-0 focus:outline-none"
                    placeholder={`e.g. ${form.currency === 'INR' ? '50000' : form.currency === 'USD' ? '2000' : form.currency === 'EUR' ? '1800' : '2000'}`}
                    type="number"
                    value={form.budget}
                    onChange={e => setForm(p => ({ ...p, budget: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
              <div className="relative group">
                <label className="text-[11px] text-slate-400 uppercase tracking-widest mb-3 block font-bold">Depart</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5 pointer-events-none z-10 transition-transform group-focus-within:scale-110" />
                  <input
                    className="input-field !pl-12 !bg-slate-50/50 !border-slate-200/60 focus:!bg-white focus:!border-blue-400 min-h-[52px] md:min-h-[60px] !rounded-2xl transition-all duration-300 appearance-none"
                    type="date"
                    value={form.startDate}
                    onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="relative group">
                <label className="text-[11px] text-slate-400 uppercase tracking-widest mb-3 block font-bold">Return</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5 pointer-events-none z-10 transition-transform group-focus-within:scale-110" />
                  <input
                    className="input-field !pl-12 !bg-slate-50/50 !border-slate-200/60 focus:!bg-white focus:!border-blue-400 min-h-[52px] md:min-h-[60px] !rounded-2xl transition-all duration-300 appearance-none"
                    type="date"
                    value={form.endDate}
                    onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="relative group">
                <label className="text-[11px] text-slate-400 uppercase tracking-widest mb-3 block font-bold">Travelers</label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5 pointer-events-none transition-transform group-focus-within:scale-110" />
                  <select
                    className="input-field !pl-12 !bg-slate-50/50 !border-slate-200/60 focus:!bg-white focus:!border-blue-400 min-h-[52px] md:min-h-[60px] !rounded-2xl transition-all duration-300"
                    value={form.travelers}
                    onChange={e => setForm(p => ({ ...p, travelers: e.target.value }))}
                  >
                    {[1, 2, 3, 4, 5, 6].map(n => (
                      <option key={n} value={n}>{n} {n === 1 ? 'Person' : 'People'}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="relative group">
                <label className="text-[11px] text-slate-400 uppercase tracking-widest mb-3 block font-bold">Style</label>
                <div className="relative">
                  <Compass className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5 pointer-events-none transition-transform group-focus-within:scale-110" />
                  <select
                    className="input-field !pl-12 !bg-slate-50/50 !border-slate-200/60 focus:!bg-white focus:!border-blue-400 min-h-[52px] md:min-h-[60px] !rounded-2xl transition-all duration-300"
                    value={form.style}
                    onChange={e => setForm(p => ({ ...p, style: e.target.value }))}
                  >
                    {['adventure', 'luxury', 'budget', 'family', 'romantic', 'cultural', 'business'].map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full py-6 text-xl font-bold flex items-center justify-center gap-4 rounded-[24px] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-orange-500/30" disabled={loading}>
              {loading ? (
                <><span className="inline-block w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></span> Initializing AI Engine...</>
              ) : (
                <><Sparkles className="w-6 h-6" /> Generate AI Trip Plan</>
              )}
            </button>
          </motion.form>


          {/* Slideshow Indicators - Hidden on mobile */}
          {isDesktop && (
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 hidden md:flex gap-3 z-20">
              {HERO_IMAGES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImage(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    currentImage === i 
                      ? 'bg-blue-500 w-8' 
                      : 'bg-white/40 hover:bg-white/60'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          )}

          {/* Feature Badges below form */}
          <motion.div 
            className="flex flex-wrap items-center justify-center gap-12 mt-16"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {[
              { label: 'Real-time Results', icon: Zap },
              { label: 'AI Personalization', icon: Sparkles },
              { label: 'Best Prices', icon: PiggyBank },
              { label: '24/7 Support', icon: HeadphonesIcon },
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-4 text-sm font-semibold text-slate-600 group cursor-default">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm flex-shrink-0">
                  <b.icon size={32} className="transition-all hover:brightness-125 duration-300" />
                </div>
                <div className="text-left">
                  <div className="text-slate-900 font-bold text-[15px]">{b.label}</div>
                  <div className="text-[12px] text-slate-400 font-normal">
                    {i === 0 ? '500+ live sources' : i === 1 ? 'Smart itineraries' : i === 2 ? 'AI-powered deals' : "Global support"}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="section-title mb-4 text-slate-900 font-bold">The Complete <span className="text-blue-600">Travel OS</span></h2>
          <p className="text-slate-500 max-w-2xl mx-auto">Every module engineered for real-time, event-driven travel intelligence</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((f, i) => (
            <div 
              key={i} 
              className="bg-white/60 backdrop-blur-md border border-white/50 rounded-[32px] p-8 shadow-sm hover:shadow-xl hover:bg-white/80 transition-all duration-500 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform flex-shrink-0">
                <f.icon size={24} className="transition-all hover:brightness-125 duration-300" />
              </div>
              <h3 className="font-bold text-slate-900 text-xl mb-3">{f.title}</h3>
              <p className="text-slate-500 leading-relaxed text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LEARN MORE CTA */}
      <section className="py-10 px-6 max-w-7xl mx-auto text-center border-t border-slate-100">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Want to see how the magic happens?</h2>
          <Link 
            href="/learn-more" 
            className="inline-flex items-center justify-center gap-2 px-10 py-4 text-lg font-bold rounded-full transition-all hover:scale-[1.05] active:scale-[0.95] shadow-sm border-2 border-orange-500 text-orange-500 bg-white hover:bg-orange-50 hover:text-orange-600"
          >
            Learn More
          </Link>
        </div>
      </section>

      {/* DESTINATIONS */}
      <section id="destinations" className="pt-12 pb-16 px-6 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="section-title mb-4 text-slate-900 font-bold">Popular <span className="text-orange-500">Destinations</span></h2>
            <p className="text-slate-500 max-w-2xl mx-auto">AI-ranked by affordability, rating, and traveler preferences</p>
          </div>
          <div className="flex md:grid md:grid-cols-3 lg:grid-cols-6 gap-6 overflow-x-auto md:overflow-visible pb-8 md:pb-0 snap-x snap-mandatory hide-scrollbar -mx-6 px-6">
            {POPULAR_DESTINATIONS.map((d, i) => (
              <div
                key={i}
                className="relative rounded-[24px] overflow-hidden cursor-pointer group aspect-[3/4] shadow-md hover:shadow-2xl transition-all duration-500 min-w-[280px] md:min-w-0 snap-start"
                onClick={() => {
                  if (d.link) {
                    router.push(d.link)
                  } else {
                    setForm(p => ({ ...p, to: d.name }))
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }
                }}
              >
                <Image 
                  src={getOptimizedImageUrl(d.img, !isDesktop)} 
                  alt={d.name} 
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700" 
                  sizes="(max-width: 768px) 280px, (max-width: 1200px) 33vw, 16vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <span className="bg-orange-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 inline-block uppercase tracking-wider">{d.tag}</span>
                  <p className="text-white text-sm font-bold leading-tight">{d.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED GUIDES */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl text-left">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Curated <span className="text-blue-600">Travel Intelligence</span></h2>
              <p className="text-slate-500">Expert guides and AI-powered insights for the modern explorer.</p>
            </div>
            <Link href="/blog" className="text-blue-600 font-bold flex items-center gap-2 group whitespace-nowrap">
              View All Guides <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
<<<<<<< HEAD
              { title: 'AI Trip Planner India', desc: 'The definitive guide to planning your Indian holiday with AI.', link: '/seo/ai-trip-planner-india', img: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?w=400&q=80' },
              { title: 'Budget Bali Trip', desc: 'How to plan a budget-friendly trip to Bali from India.', link: '/seo/budget-bali-trip', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80' },
              { title: 'Solo Travel Guide', desc: 'Expert tips for exploring India safely and confidently.', link: '/seo/solo-travel-guide-india', img: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&q=80' }
=======
              { title: 'AI Trip Planner India', desc: 'The definitive guide to planning your Indian holiday with AI.', link: '/ai-trip-planner-india', img: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&q=80' },
              { title: 'Budget Bali Hacks', desc: 'How to see the best of Bali without breaking the bank.', link: '/budget-bali-trip', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80' },
              { title: 'Solo Travel Guide', desc: 'Expert tips for exploring India safely and confidently.', link: '/solo-travel-guide-india', img: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&q=80' }
>>>>>>> 97f35f5bb4479bf3f1e3d6a137a43ea4a51a5a75
            ].map((g, i) => (
              <Link key={i} href={g.link} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-slate-100 flex flex-col">
                <div className="relative h-48">
                  <Image src={g.img} alt={g.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{g.title}</h3>
                  <p className="text-slate-500 text-sm mb-4">{g.desc}</p>
                  <span className="text-blue-600 text-sm font-bold flex items-center gap-2">Explore Guide <ArrowRight size={14} /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {STATS.map((s, i) => (
              <div 
                key={i}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-2">
                  <CountUp to={s.value} suffix={s.suffix} />
                </div>
                <div className="text-sm font-semibold text-slate-500 uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="pt-16 pb-12 px-6 bg-dots">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="section-title mb-4 text-slate-900 font-bold">How <span className="text-blue-600">TripSage</span> Works</h2>
            <p className="text-slate-500">From concept to reality in four simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {[
              { step: '01', icon: Users, title: 'Profile', desc: 'Set your budget, style & group' },
              { step: '02', icon: Sparkles, title: 'AI Plans', desc: 'AI planner generates itinerary' },
              { step: '03', icon: Zap, title: 'Book', desc: 'Real-time flight & hotel options' },
              { step: '04', icon: Compass, title: 'Explore', desc: 'Live navigation & notifications' },
            ].map((s, i) => (
              <div 
                key={i} 
                className="bg-white/60 backdrop-blur-md border border-white/50 p-8 rounded-[32px] text-center relative shadow-sm hover:shadow-xl hover:bg-white/80 transition-all duration-500"
              >
                <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-6">
                  <s.icon className="w-8 h-8" />
                </div>
                <div className="font-bold text-xs text-blue-600 uppercase tracking-widest mb-3">{s.step}</div>
                <h3 className="font-bold text-slate-900 text-lg mb-3">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
                {i < 3 && (
                  <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 z-10 text-gray-200">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pt-10 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center bg-blue-600 rounded-[40px] p-16 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <h2 className="section-title mb-6 text-white font-bold text-4xl">Ready to Travel <span className="text-orange-300">Smarter?</span></h2>
          <p className="text-blue-100 mb-10 text-lg opacity-90">Join thousands using TripSage for AI-powered travel planning</p>
          <Link href="/plan" onClick={() => trackEvent('plan_trip_click', { source: 'cta_section' })} className="btn-primary text-base py-4 px-10 inline-block">
            Start Planning Free →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />

      {/* Sticky Mobile Search Button */}
      <AnimatePresence>
        {showStickySearch && (
          <motion.button
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
            className="fixed bottom-8 left-8 right-8 h-[52px] bg-orange-600 text-white font-bold rounded-2xl shadow-[0_20px_50px_rgba(234,88,12,0.3)] flex items-center justify-center gap-2 z-[9999] md:hidden border border-orange-400/20 active:scale-95 transition-transform"
          >
            <Search size={20} />
            Search Trips
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
