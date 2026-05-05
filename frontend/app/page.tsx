'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence, useReducedMotion, useInView } from 'framer-motion'
import { useRef, useEffect as useLayoutEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import LocationAutocomplete from '@/components/ui/LocationAutocomplete'
import { tripAPI } from '@/lib/api'
import { trackEvent } from '@/lib/analytics'
import LegalModal from '@/components/ui/LegalModal'
import { getOptimizedImageUrl } from '@/lib/imageUtils'
import { 
  MapPin, 
  Calendar, 
  Wallet, 
  Users, 
  Compass, 
  Zap, 
  Sparkles, 
  Banknote, 
  Headphones,
  LogOut,
  X,
  Menu,
  ArrowRight,
  Search
} from 'lucide-react'

const POPULAR_DESTINATIONS = [
  { name: 'Bali, Indonesia', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80', tag: 'Tropical' },
  { name: 'Paris, France', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80', tag: 'Cultural' },
  { name: 'Tokyo, Japan', img: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=400&q=80', tag: 'Urban' },
  { name: 'Santorini, Greece', img: 'https://images.unsplash.com/photo-1568454537842-d933259bb258?w=400&q=80', tag: 'Scenic' },
  { name: 'New York, USA', img: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&q=80', tag: 'Metropolitan' },
  { name: 'Maldives', img: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400&q=80', tag: 'Luxury' },
]

const FEATURES = [
  { icon: Sparkles, title: 'AI-Powered Planning', desc: 'Groq LLaMA3 generates personalized itineraries in seconds' },
  { icon: Zap, title: 'Real-Time Data', desc: 'Live flight prices, hotel availability, and weather updates' },
  { icon: Compass, title: 'Smart Navigation', desc: 'Interactive maps with clickable places and route optimization' },
  { icon: Headphones, title: '24/7 Support', desc: 'Our AI and support team are here for you anytime, anywhere' },
  { icon: Banknote, title: 'Budget Optimizer', desc: 'Score-based ranking: affordability × rating × relevance' },
  { icon: Users, title: 'Travel OS', desc: 'From profile to booking — your complete travel operating system' },
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
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    if (inView && !shouldReduceMotion) {
      let start = 0
      const end = to
      const duration = 2000
      const increment = end / (duration / 16)
      
      const timer = setInterval(() => {
        start += increment
        if (start >= end) {
          setCount(end)
          clearInterval(timer)
        } else {
          setCount(Math.floor(start))
        }
      }, 16)
      return () => clearInterval(timer)
    } else if (inView && shouldReduceMotion) {
      setCount(to)
    }
  }, [inView, to, shouldReduceMotion])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

export default function Home() {
  const router = useRouter()
  const { user, isLoggedIn, logout } = useAuthStore()
  const [currentImage, setCurrentImage] = useState(0)
  const [form, setForm] = useState({
    from: '',
    to: '',
    startDate: '',
    endDate: '',
    budget: '',
    travelers: '2',
    style: 'adventure',
  })
  const [loading, setLoading] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeLegal, setActiveLegal] = useState<{ title: string; content: React.ReactNode } | null>(null)
  const [isDesktop, setIsDesktop] = useState(false)

  // Handle responsive check
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768)
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  // Auto-rotate slideshow (only on desktop)
  useEffect(() => {
    if (!isDesktop) return
    const timer = setInterval(() => {
      setCurrentImage(prev => (prev + 1) % HERO_IMAGES.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [isDesktop])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.from || !form.to || !form.startDate) return
    setLoading(true)
    trackEvent('plan_trip_click', { source: 'hero_form' })
    // Store in session and navigate
    sessionStorage.setItem('tripContext', JSON.stringify(form))
    setTimeout(() => router.push('/plan'), 800)
  }

  const [initialized, setInitialized] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const isFormInView = useInView(formRef, { amount: 0.1 })
  const showStickySearch = !isFormInView && !isDesktop && initialized

  // Auto-detect location and Clear old sessions on mount
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
      {/* Schema Markup for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "name": "TripSage",
                "url": "https://tripsage.ai",
                "logo": "https://res.cloudinary.com/dob5llmb2/image/upload/v1774999435/LOGO_xbwcwe.png"
              },
              {
                "@type": "WebSite",
                "name": "TripSage",
                "url": "https://tripsage.ai",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": "https://tripsage.ai/plan?q={search_term_string}",
                  "query-input": "required name=search_term_string"
                }
              }
            ]
          })
        }}
      />

      {/* NAV */}
      {/* NAV */}
      <nav className="glass sticky top-0 z-[100] px-3 sm:px-6 py-4 flex items-center justify-between border-b border-gray-100/50 shadow-sm">
        <div className="flex items-center gap-3">
          <Image
            src="https://res.cloudinary.com/dob5llmb2/image/upload/v1774999435/LOGO_xbwcwe.png"
            alt="TripSage"
            width={38}
            height={38}
            className="rounded-xl shadow-sm"
            unoptimized
          />
          <span className="font-display text-xl font-extrabold text-slate-900 tracking-tight hidden md:block">TripSage</span>
          <span className="badge bg-blue-50 text-blue-600 border border-blue-100 ml-2 hidden md:inline-flex px-2 py-0.5 rounded-lg text-[10px] font-bold">LIVE</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-[13px] font-semibold text-slate-500">
          <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
          <a href="#destinations" className="hover:text-blue-600 transition-colors">Destinations</a>
          <Link href="/support" className="hover:text-blue-600 transition-colors">Support</Link>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-blue-600 font-medium">
            <span className="live-dot bg-blue-600"></span>
            <span>Real-time Engine</span>
          </div>
          {isLoggedIn && user ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="hidden sm:flex w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] items-center justify-center text-white text-xs font-bold">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-semibold text-[var(--text-primary)] hidden sm:block">{user.name}</span>
              <Link href="/plan" className="hidden md:flex btn-primary whitespace-nowrap flex-shrink-0 text-sm py-2 px-4 items-center justify-center">Dashboard</Link>
              <button onClick={() => logout()} className="hidden sm:block text-[var(--text-muted)] hover:text-red-400 transition-colors p-2" title="Logout"><LogOut size={18} /></button>
            </div>
          ) : (
            <>
              <Link href="/auth" className="hidden sm:flex btn-outline text-sm py-2 px-4 items-center justify-center">Sign In</Link>
              <Link href="/plan" onClick={() => trackEvent('plan_trip_click', { source: 'navbar' })} className="hidden md:flex btn-primary whitespace-nowrap flex-shrink-0 text-sm py-2 px-5 items-center justify-center gap-2">Plan Trip <ArrowRight size={14} /></Link>
            </>
          )}
          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-1.5 sm:p-2 text-slate-900" onClick={() => setMobileMenuOpen(true)}>
            <Menu size={28} />
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Dark Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 z-[9998] md:hidden"
            />
            
            {/* Slide-in Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[75%] bg-white z-[9999] shadow-2xl p-6 flex flex-col md:hidden"
            >
              {/* Close Button */}
              <div className="flex justify-end mb-8">
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <X size={28} />
                </button>
              </div>
              {/* Links */}
              <div className="flex flex-col gap-2">
                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center h-[52px] px-4 text-lg font-semibold text-slate-900 hover:bg-slate-50 rounded-xl transition-colors">Home</Link>
                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="flex items-center h-[52px] px-4 text-lg font-semibold text-slate-900 hover:bg-slate-50 rounded-xl transition-colors">Features</a>
                <a href="#destinations" onClick={() => setMobileMenuOpen(false)} className="flex items-center h-[52px] px-4 text-lg font-semibold text-slate-900 hover:bg-slate-50 rounded-xl transition-colors">Destinations</a>
                <Link href="/support" onClick={() => setMobileMenuOpen(false)} className="flex items-center h-[52px] px-4 text-lg font-semibold text-slate-900 hover:bg-slate-50 rounded-xl transition-colors">Support</Link>
                
                <div className="h-px bg-slate-100 my-4 mx-4"></div>

                {isLoggedIn && user ? (
                  <div className="flex flex-col gap-2">
                    <Link href="/plan" onClick={() => setMobileMenuOpen(false)} className="flex items-center h-[52px] px-4 text-lg font-semibold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">Dashboard</Link>
                    <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="flex items-center h-[52px] px-4 text-lg font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-colors text-left w-full">Logout</button>
                  </div>
                ) : (
                  <Link href="/auth" onClick={() => setMobileMenuOpen(false)} className="flex items-center h-[52px] px-4 text-lg font-semibold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">Sign In</Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* HERO */}
      <section className="relative min-h-[95vh] flex flex-col items-center justify-center px-4 md:px-6 overflow-hidden bg-white md:bg-[#0F172A]">
        {/* Background Slideshow - Conditionally rendered to prevent image loading on mobile */}
        {isDesktop && (
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
                  src={getOptimizedImageUrl(HERO_IMAGES[currentImage], !isDesktop)} 
                  alt="Travel Hero" 
                  fill 
                  className="object-cover object-center"
                  priority
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  unoptimized
                />
                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-black/45" />
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          {/* Status badge */}
          <motion.div 
            className="inline-flex items-center gap-2 bg-blue-50/90 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold text-blue-600 mb-8 border border-blue-100 shadow-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="live-dot bg-blue-600"></span>
            Powered by Groq LLaMA3 • Real-time AI Travel OS v2.4
          </motion.div>

          <motion.h1 
            className="section-title text-[clamp(2.5rem,7vw,5rem)] mb-8 font-extrabold tracking-tight text-slate-900 md:text-white leading-[1.1] md:drop-shadow-lg"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Your AI-Powered
            <br />
            <span className="text-blue-600 md:text-blue-400">Travel Operating</span> <span className="text-orange-600 md:text-orange-400">System</span>
          </motion.h1>

          <motion.p 
            className="text-slate-600 md:text-slate-100 text-xl max-w-3xl mx-auto mb-16 leading-relaxed font-medium md:drop-shadow-md"
            initial={{ opacity: 0, y: 30 }}
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
            initial={{ opacity: 0, y: 40 }}
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
                    onChange={val => setForm(p => ({ ...p, from: val }))}
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
                    onChange={val => setForm(p => ({ ...p, to: val }))}
                  />
                </div>
              </div>
              <div className="relative group">
                <label className="text-[11px] text-slate-400 uppercase tracking-widest mb-3 block font-bold">Budget ({user?.currency || 'USD'})</label>
                <div className="relative">
                  <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5 pointer-events-none transition-transform group-focus-within:scale-110" />
                  <input
                    className="input-field !pl-12 !bg-slate-50/50 !border-slate-200/60 focus:!bg-white focus:!border-blue-400 min-h-[52px] md:min-h-[60px] !rounded-2xl transition-all duration-300"
                    placeholder="e.g. 2000"
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {[
              { label: 'Real-time Results', icon: Zap },
              { label: 'AI Personalization', icon: Sparkles },
              { label: 'Best Prices', icon: Banknote },
              { label: '24/7 Support', icon: Headphones },
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-4 text-sm font-semibold text-slate-600 group cursor-default">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                  <b.icon className="w-6 h-6" />
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
            <motion.div 
              key={i} 
              className="bg-white/60 backdrop-blur-md border border-white/50 rounded-[32px] p-8 shadow-sm hover:shadow-xl hover:bg-white/80 transition-all duration-500 group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <f.icon className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-900 text-xl mb-3">{f.title}</h3>
              <p className="text-slate-500 leading-relaxed text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* DESTINATIONS */}
      <section id="destinations" className="py-32 px-6 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="section-title mb-4 text-slate-900 font-bold">Popular <span className="text-orange-500">Destinations</span></h2>
            <p className="text-slate-500 max-w-2xl mx-auto">AI-ranked by affordability, rating, and traveler preferences</p>
          </div>
          <div className="flex md:grid md:grid-cols-3 lg:grid-cols-6 gap-6 overflow-x-auto md:overflow-visible pb-8 md:pb-0 snap-x snap-mandatory hide-scrollbar -mx-6 px-6">
            {POPULAR_DESTINATIONS.map((d, i) => (
              <motion.div
                key={i}
                className="relative rounded-[24px] overflow-hidden cursor-pointer group aspect-[3/4] shadow-md hover:shadow-2xl transition-all duration-500 min-w-[280px] md:min-w-0 snap-start"
                onClick={() => {
                  setForm(p => ({ ...p, to: d.name }))
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <img 
                  src={getOptimizedImageUrl(d.img, !isDesktop)} 
                  alt={d.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <span className="bg-orange-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 inline-block uppercase tracking-wider">{d.tag}</span>
                  <p className="text-white text-sm font-bold leading-tight">{d.name}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {STATS.map((s, i) => (
              <motion.div 
                key={i}
                className="text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-2">
                  <CountUp to={s.value} suffix={s.suffix} />
                </div>
                <div className="text-sm font-semibold text-slate-500 uppercase tracking-widest">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-32 px-6 bg-dots">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="section-title mb-4 text-slate-900 font-bold">How <span className="text-blue-600">TripSage</span> Works</h2>
            <p className="text-slate-500">From concept to reality in four simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {[
              { step: '01', icon: Users, title: 'Profile', desc: 'Set your budget, style & group' },
              { step: '02', icon: Sparkles, title: 'AI Plans', desc: 'Groq AI generates itinerary' },
              { step: '03', icon: Zap, title: 'Book', desc: 'Real-time flight & hotel options' },
              { step: '04', icon: Compass, title: 'Explore', desc: 'Live navigation & notifications' },
            ].map((s, i) => (
              <motion.div 
                key={i} 
                className="bg-white/60 backdrop-blur-md border border-white/50 p-8 rounded-[32px] text-center relative shadow-sm hover:shadow-xl hover:bg-white/80 transition-all duration-500"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
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
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6">
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
      <footer className="bg-slate-900 text-white px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-12 mb-16">
            <div className="max-w-sm">
              <div className="flex items-center gap-3 mb-6">
                <Image
                  src="https://res.cloudinary.com/dob5llmb2/image/upload/v1774999435/LOGO_xbwcwe.png"
                  alt="TripSage"
                  width={40}
                  height={40}
                  className="rounded-xl"
                  unoptimized
                />
                <span className="font-display text-2xl font-bold text-white">TripSage</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                The world's first AI-powered Travel Operating System. We orchestrate real-time travel intelligence for the modern explorer.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
              <div>
                <h4 className="font-bold mb-6 text-sm uppercase tracking-widest">Platform</h4>
                <div className="flex flex-col gap-4 text-slate-400 text-sm">
                  <a href="#features" className="hover:text-blue-400 transition-colors">Features</a>
                  <a href="#destinations" className="hover:text-blue-400 transition-colors">Destinations</a>
                  <Link href="/plan" className="hover:text-blue-400 transition-colors">Planner</Link>
                </div>
              </div>
              <div>
                <h4 className="font-bold mb-6 text-sm uppercase tracking-widest">Company</h4>
                <div className="flex flex-col gap-4 text-slate-400 text-sm">
                  <Link href="/support" className="hover:text-blue-400 transition-colors">Support</Link>
                  <button 
                    onClick={() => setActiveLegal({
                      title: "Terms & Conditions",
                      content: (
                        <div className="space-y-4">
                          <p><strong>Effective Date:</strong> 01 April 2026</p>
                          <p>Welcome to TripSage. By accessing or using this platform, you agree to comply with these Terms & Conditions.</p>
                          <p><strong>Service:</strong> TripSage provides AI-powered travel planning, personalized recommendations, and third-party booking links.</p>
                          <div>
                            <p><strong>User Responsibilities:</strong></p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                              <li>Provide accurate and truthful information when using the platform</li>
                              <li>Do not misuse the platform for any illegal or unauthorized activity</li>
                              <li>Do not attempt to reverse engineer or harm the platform in any way</li>
                            </ul>
                          </div>
                          <p><strong>Third-Party Services:</strong> We are not responsible for bookings, pricing, availability, or services provided by third parties.</p>
                          <p><strong>Liability:</strong> TripSage is not liable for any travel disruptions, losses, damages, or errors arising from use of this platform.</p>
                          <p><strong>Governing Law:</strong> Governed by Indian law under the jurisdiction of Andhra Pradesh.</p>
                          <p><strong>Contact:</strong> <a href="mailto:rana@tripsage.in" className="text-[var(--primary)] hover:underline inline-block cursor-pointer relative z-10">rana@tripsage.in</a></p>
                        </div>
                      )
                    })} 
                    className="hover:text-blue-400 transition-colors text-left"
                  >
                    Terms & Conditions
                  </button>
                  <button 
                    onClick={() => setActiveLegal({
                      title: "Privacy Policy",
                      content: (
                        <div className="space-y-4">
                          <p><strong>Effective Date:</strong> 01 April 2026</p>
                          <div>
                            <p><strong>What We Collect:</strong></p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                              <li>Name and email address</li>
                              <li>Location and travel preferences</li>
                              <li>Usage data and analytics</li>
                            </ul>
                          </div>
                          <div>
                            <p><strong>How We Use Your Data:</strong></p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                              <li>To personalize your travel planning experience</li>
                              <li>For platform analytics and improvement</li>
                              <li>To communicate important updates and offers</li>
                            </ul>
                          </div>
                          <p className="font-bold">We do NOT sell your personal data to any third party.</p>
                          <p><strong>Data Sharing:</strong> We may share anonymized data with trusted APIs and analytics tools solely to improve the service.</p>
                          <div>
                            <p><strong>Your Rights:</strong></p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                              <li>Access your personal data at any time</li>
                              <li>Request correction of inaccurate data</li>
                              <li>Request deletion of your account and data</li>
                            </ul>
                          </div>
                          <p><strong>Contact:</strong> <a href="mailto:rana@tripsage.in" className="text-[var(--primary)] hover:underline inline-block cursor-pointer relative z-10">rana@tripsage.in</a></p>
                        </div>
                      )
                    })} 
                    className="hover:text-blue-400 transition-colors text-left"
                  >
                    Privacy Policy
                  </button>
                  <button 
                    onClick={() => setActiveLegal({
                      title: "Disclaimer",
                      content: (
                        <div className="space-y-4">
                          <p>TripSage provides travel suggestions and recommendations only. We are an AI-powered planning tool, not a travel agency.</p>
                          <div>
                            <p><strong>No Guarantees:</strong></p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                              <li>We do not guarantee accuracy of prices or availability</li>
                              <li>Travel information may change without notice</li>
                              <li>AI-generated itineraries are suggestions, not professional advice</li>
                            </ul>
                          </div>
                          <div>
                            <p><strong>No Responsibility:</strong></p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                              <li>We are not responsible for any third-party services or providers</li>
                              <li>We are not liable for travel disruptions, delays, or cancellations</li>
                              <li>Use of this platform is entirely at your own risk</li>
                            </ul>
                          </div>
                        </div>
                      )
                    })} 
                    className="hover:text-blue-400 transition-colors text-left"
                  >
                    Disclaimer
                  </button>
                </div>
              </div>
              <div>
                <h4 className="font-bold mb-6 text-sm uppercase tracking-widest">Legal</h4>
                <div className="flex flex-col gap-4 text-slate-400 text-sm">
                  <button 
                    onClick={() => setActiveLegal({
                      title: "Cookie Policy",
                      content: (
                        <div className="space-y-4">
                          <p>TripSage uses cookies to enhance your experience.</p>
                          <div>
                            <p><strong>What Cookies We Use:</strong></p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                              <li>Functionality cookies - to remember your preferences and settings</li>
                              <li>Analytics cookies - to understand how users interact with the platform</li>
                              <li>Session cookies - to keep you logged in during your visit</li>
                            </ul>
                          </div>
                          <p><strong>Your Choice:</strong> You can disable cookies at any time through your browser settings. Disabling cookies may affect some features of the platform.</p>
                        </div>
                      )
                    })} 
                    className="hover:text-blue-400 transition-colors text-left"
                  >
                    Cookie Policy
                  </button>
                  <button 
                    onClick={() => setActiveLegal({
                      title: "Refund Policy",
                      content: (
                        <div className="space-y-4">
                          <p>For paid features or subscriptions on TripSage, refund requests must be submitted within 7 days of purchase to <a href="mailto:rana@tripsage.in" className="text-[var(--primary)] hover:underline inline-block cursor-pointer relative z-10">rana@tripsage.in</a></p>
                          <p><strong>Third-Party Bookings:</strong> TripSage does not handle bookings directly. Refunds for flights, hotels, buses, or cabs are subject to each provider's own refund and cancellation policies.</p>
                        </div>
                      )
                    })} 
                    className="hover:text-blue-400 transition-colors text-left"
                  >
                    Refund Policy
                  </button>
                  <button 
                    onClick={() => setActiveLegal({
                      title: "Grievance Redressal",
                      content: (
                        <div className="space-y-4">
                          <p>In accordance with the Information Technology Act 2000, TripSage has appointed a Grievance Officer to address user complaints.</p>
                          <div>
                            <p><strong>Grievance Officer:</strong></p>
                            <ul className="list-none space-y-1">
                              <li><strong>Name:</strong> Rana</li>
                              <li><strong>Email:</strong> <a href="mailto:rana@tripsage.in" className="text-[var(--primary)] hover:underline inline-block cursor-pointer relative z-10">rana@tripsage.in</a></li>
                            </ul>
                          </div>
                          <p><strong>Response Time:</strong> All grievances will be responded to within 7 business days.</p>
                          <p><strong>How to Submit:</strong> Email <a href="mailto:rana@tripsage.in" className="text-[var(--primary)] hover:underline inline-block cursor-pointer relative z-10">rana@tripsage.in</a> with subject: "Grievance - [Your Issue]". Include your registered email and description of your concern.</p>
                        </div>
                      )
                    })} 
                    className="hover:text-blue-400 transition-colors text-left"
                  >
                    Grievance Redressal
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <p className="text-slate-500 text-xs">
                © {new Date().getFullYear()} TripSage · Governed by Indian Law · Andhra Pradesh Jurisdiction
              </p>
              <p className="text-slate-600 text-[10px] mt-1">
                AI-generated suggestions. Prices subject to real-time change.
              </p>
            </div>
            <div className="flex items-center gap-6 text-slate-500 text-xs font-mono">
              <button 
                onClick={() => setActiveLegal({
                  title: "Affiliate Disclosure",
                  content: (
                    <div className="space-y-4">
                      <p>TripSage may earn commissions when you click on links to third-party travel providers such as hotels, flights, or activity booking platforms.</p>
                      <div>
                        <p><strong>Important:</strong></p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                          <li>Affiliate links do not cost you anything extra</li>
                          <li>Our recommendations are based on relevance and quality, not commissions</li>
                          <li>We are transparent about our affiliate relationships</li>
                        </ul>
                      </div>
                    </div>
                  )
                })}
                className="hover:text-white transition-colors"
              >
                Affiliate Disclosure
              </button>
              <span>v2.4.0-release</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Legal Modal */}
      <LegalModal 
        isOpen={!!activeLegal} 
        onClose={() => setActiveLegal(null)}
        title={activeLegal?.title || ''}
        content={activeLegal?.content}
      />

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
