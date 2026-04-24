'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuthStore } from '@/store/authStore'
import LocationAutocomplete from '@/components/ui/LocationAutocomplete'
import { tripAPI } from '@/lib/api'

const POPULAR_DESTINATIONS = [
  { name: 'Bali, Indonesia', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80', tag: 'Tropical' },
  { name: 'Paris, France', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80', tag: 'Cultural' },
  { name: 'Tokyo, Japan', img: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=400&q=80', tag: 'Urban' },
  { name: 'Santorini, Greece', img: 'https://images.unsplash.com/photo-1568454537842-d933259bb258?w=400&q=80', tag: 'Scenic' },
  { name: 'New York, USA', img: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&q=80', tag: 'Metropolitan' },
  { name: 'Maldives', img: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400&q=80', tag: 'Luxury' },
]

const FEATURES = [
  { icon: '🧠', title: 'AI-Powered Planning', desc: 'Groq LLaMA3 generates personalized itineraries in seconds' },
  { icon: '⚡', title: 'Real-Time Data', desc: 'Live flight prices, hotel availability, and weather updates' },
  { icon: '🗺️', title: 'Smart Navigation', desc: 'Interactive maps with clickable places and route optimization' },
  { icon: '🔔', title: 'Smart Notifications', desc: 'Location & time-based alerts for rain, crowds, and deals' },
  { icon: '💰', title: 'Budget Optimizer', desc: 'Score-based ranking: affordability × rating × relevance' },
  { icon: '📱', title: 'Travel OS', desc: 'From profile to booking — your complete travel operating system' },
]

export default function Home() {
  const router = useRouter()
  const { user, isLoggedIn, logout } = useAuthStore()
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.from || !form.to || !form.startDate) return
    setLoading(true)
    // Store in session and navigate
    sessionStorage.setItem('tripContext', JSON.stringify(form))
    setTimeout(() => router.push('/plan'), 800)
  }

  // Auto-detect location
  useEffect(() => {
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
      }).catch(() => {})
    }
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
      <nav className="glass-dark sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="https://res.cloudinary.com/dob5llmb2/image/upload/v1774999435/LOGO_xbwcwe.png"
            alt="TripSage"
            width={40}
            height={40}
            className="rounded-xl"
            unoptimized
          />
          <span className="font-display text-xl font-bold gradient-text-green">TripSage</span>
          <span className="badge badge-green ml-1">LIVE</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-[var(--text-secondary)]">
          <a href="#features" className="hover:text-[var(--primary)] transition-colors p-2">Features</a>
          <a href="#destinations" className="hover:text-[var(--primary)] transition-colors p-2">Destinations</a>
          <Link href="/support" className="hover:text-[var(--primary)] transition-colors p-2">Support</Link>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <span className="live-dot"></span>
            <span className="font-mono">Real-time Engine</span>
          </div>
          {isLoggedIn && user ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white text-xs font-bold">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-semibold text-[var(--text-primary)] hidden sm:block">{user.name}</span>
              <Link href="/plan" className="btn-primary text-sm py-2 px-4 flex items-center justify-center">Dashboard</Link>
              <button onClick={() => logout()} className="text-xs text-[var(--text-muted)] hover:text-red-400 transition-colors p-2" title="Logout">↩</button>
            </div>
          ) : (
            <>
              <Link href="/auth" className="hidden sm:flex btn-outline text-sm py-2 px-4 items-center justify-center">Sign In</Link>
              <Link href="/plan" className="btn-primary text-sm py-2 px-5 flex items-center justify-center">Plan Trip →</Link>
            </>
          )}
          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2 text-[var(--text-primary)] text-xl" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? '✖' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[72px] bg-black/95 backdrop-blur-xl z-[9999] p-6 flex flex-col gap-6 animate-fade-in overflow-y-auto border-t border-white/10">
          <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-lg font-semibold text-[var(--text-primary)]">Features</a>
          <a href="#destinations" onClick={() => setMobileMenuOpen(false)} className="text-lg font-semibold text-[var(--text-primary)]">Destinations</a>
          <Link href="/support" onClick={() => setMobileMenuOpen(false)} className="text-lg font-semibold text-[var(--text-primary)]">Support</Link>
          
          <div className="h-px bg-[var(--border)] my-2"></div>
          
          {isLoggedIn && user ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white font-bold">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="font-semibold text-[var(--text-primary)]">{user.name}</span>
              </div>
              <Link href="/plan" onClick={() => setMobileMenuOpen(false)} className="btn-primary w-full py-3 flex items-center justify-center">Dashboard</Link>
              <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="btn-outline text-red-400 border-red-500/30 w-full py-3">Logout</button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <Link href="/auth" onClick={() => setMobileMenuOpen(false)} className="btn-outline w-full py-3 flex items-center justify-center">Sign In</Link>
              <Link href="/plan" onClick={() => setMobileMenuOpen(false)} className="btn-primary w-full py-3 flex items-center justify-center">Plan Trip →</Link>
            </div>
          )}
        </div>
      )}

      {/* HERO */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,194,124,0.06) 0%, transparent 70%)' }} />

        <div className="relative z-10 text-center max-w-5xl mx-auto animate-slide-up">
          {/* Status badge */}
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-xs font-mono text-[var(--primary)] mb-8 border border-[var(--border)]">
            <span className="live-dot"></span>
            Powered by Groq LLaMA3 • Real-time AI Travel OS v2.0
          </div>

          <h1 className="section-title text-[clamp(2.5rem,7vw,5rem)] mb-6">
            Your AI-Powered
            <br />
            <span className="gradient-text">Travel Operating System</span>
          </h1>

          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto mb-12 leading-relaxed">
            TripSage orchestrates real-time flights, hotels, activities, and AI itineraries — 
            all personalized to your budget, style, and group. From planning to exploring.
          </p>

          {/* SEARCH FORM */}
          <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 max-w-4xl mx-auto text-left">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2 block font-mono">From</label>
                <LocationAutocomplete
                  className="input-field w-full"
                  placeholder="Hyderabad, India"
                  value={form.from}
                  onChange={val => setForm(p => ({ ...p, from: val }))}
                />
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2 block font-mono">To</label>
                <LocationAutocomplete
                  className="input-field w-full"
                  placeholder="Bali, Indonesia"
                  value={form.to}
                  onChange={val => setForm(p => ({ ...p, to: val }))}
                />
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2 block font-mono">Budget ({user?.currency || 'USD'})</label>
                <input
                  className="input-field"
                  placeholder="e.g. 2000"
                  type="number"
                  value={form.budget}
                  onChange={e => setForm(p => ({ ...p, budget: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2 block font-mono">Depart</label>
                <input
                  className="input-field"
                  type="date"
                  value={form.startDate}
                  onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2 block font-mono">Return</label>
                <input
                  className="input-field"
                  type="date"
                  value={form.endDate}
                  onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2 block font-mono">Travelers</label>
                <select
                  className="input-field"
                  value={form.travelers}
                  onChange={e => setForm(p => ({ ...p, travelers: e.target.value }))}
                >
                  {[1,2,3,4,5,6].map(n => (
                    <option key={n} value={n} style={{ background: 'var(--bg-card)' }}>{n} {n===1?'Person':'People'}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2 block font-mono">Style</label>
                <select
                  className="input-field"
                  value={form.style}
                  onChange={e => setForm(p => ({ ...p, style: e.target.value }))}
                >
                  {['adventure', 'luxury', 'budget', 'family', 'romantic', 'cultural', 'business'].map(s => (
                    <option key={s} value={s} style={{ background: 'var(--bg-card)' }}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full py-4 text-base flex items-center justify-center gap-3" disabled={loading}>
              {loading ? (
                <><span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Initializing AI Engine...</>
              ) : (
                <><span>🚀</span> Generate AI Trip Plan</>
              )}
            </button>
          </form>

          {/* Quick stats */}
          <div className="flex items-center justify-center gap-8 mt-8 text-sm text-[var(--text-muted)]">
            {[
              { n: '2M+', l: 'Hotels' },
              { n: '50K+', l: 'Flights' },
              { n: '100K+', l: 'Activities' },
              { n: '<3s', l: 'AI Response' },
            ].map(s => (
              <div key={s.l} className="text-center">
                <div className="text-[var(--primary)] font-bold text-lg font-mono">{s.n}</div>
                <div>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="section-title mb-3">The Complete <span className="gradient-text">Travel OS</span></h2>
          <p className="section-subtitle">Every module engineered for real-time, event-driven travel intelligence</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div key={i} className="card p-6" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-bold text-[var(--text-primary)] mb-2">{f.title}</h3>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DESTINATIONS */}
      <section id="destinations" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-title mb-3">Popular <span className="gradient-text">Destinations</span></h2>
            <p className="section-subtitle">AI-ranked by affordability, rating, and traveler preferences</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {POPULAR_DESTINATIONS.map((d, i) => (
              <div
                key={i}
                className="relative rounded-xl overflow-hidden cursor-pointer group aspect-[3/4]"
                onClick={() => {
                  setForm(p => ({ ...p, to: d.name }))
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              >
                <img src={d.img} alt={d.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <span className="badge badge-green text-[0.65rem] mb-1 block w-fit">{d.tag}</span>
                  <p className="text-white text-xs font-semibold leading-tight">{d.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 px-6 bg-dots">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-title mb-3">How <span className="gradient-text">TripSage</span> Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {[
              { step: '01', icon: '👤', title: 'Profile', desc: 'Set your budget, style & group' },
              { step: '02', icon: '🧠', title: 'AI Plans', desc: 'Groq AI generates itinerary' },
              { step: '03', icon: '✈️', title: 'Book', desc: 'Real-time flight & hotel options' },
              { step: '04', icon: '🌍', title: 'Explore', desc: 'Live navigation & notifications' },
            ].map((s, i) => (
              <div key={i} className="card p-6 text-center relative">
                <div className="text-3xl mb-4">{s.icon}</div>
                <div className="font-mono text-xs text-[var(--text-muted)] mb-2">{s.step}</div>
                <h3 className="font-bold text-[var(--primary)] mb-2">{s.title}</h3>
                <p className="text-[var(--text-muted)] text-sm">{s.desc}</p>
                {i < 3 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-[var(--text-muted)]">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center glass rounded-3xl p-12">
          <h2 className="section-title mb-4">Ready to Travel <span className="gradient-text">Smarter?</span></h2>
          <p className="text-[var(--text-secondary)] mb-8">Join thousands using TripSage for AI-powered travel planning</p>
          <Link href="/plan" className="btn-primary text-base py-4 px-10 inline-block">
            Start Planning Free →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[var(--border)] px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image
              src="https://res.cloudinary.com/dob5llmb2/image/upload/v1774999435/LOGO_xbwcwe.png"
              alt="TripSage"
              width={32}
              height={32}
              className="rounded-lg"
              unoptimized
            />
            <span className="font-bold text-[var(--primary)]">TripSage</span>
            <span className="text-[var(--text-muted)] text-xs">— AI Travel Operating System</span>
          </div>
          <p className="text-[var(--text-muted)] text-xs text-center">
            Prices subject to real-time change. Bookings handled by third-party providers. 
            TripSage is a recommendation system, not a travel operator.
          </p>
          <div className="text-[var(--text-muted)] text-xs font-mono">
            © {new Date().getFullYear()} TripSage
          </div>
        </div>
      </footer>
    </div>
  )
}
