'use client'

import { useUser } from '@clerk/nextjs'
import { useAuthStore } from '@/store/authStore'
import { useTripStore, type TripRecord } from '@/store/tripStore'
import { tripAPI } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import toast from 'react-hot-toast'
import {
  Calendar, Compass, ArrowRight, User as UserIcon, Sparkles, Loader2,
  Bookmark, Image as ImageIcon, Wallet, Users, MapPin, Globe,
  Zap, Shield, Clock, Plus, Trash2, ExternalLink
} from 'lucide-react'

const quickCards = [
  {
    icon: Compass,
    title: 'Explore Activities',
    desc: 'Browse top activities, restaurants, and guided tours in popular destinations worldwide.',
    link: '/plan',
    label: 'Explore Now',
  },
  {
    icon: Calendar,
    title: 'My Saved Trips',
    desc: 'View your itineraries, flight details, hotel bookings, and travel photos in one place.',
    link: '/trips',
    label: 'View My Trips',
  },
  {
    icon: UserIcon,
    title: 'Profile & Preferences',
    desc: 'Update personal details, set currency preferences, and manage security credentials.',
    link: '/profile',
    label: 'Manage Profile',
  },
  {
    icon: Bookmark,
    title: 'Saved Content',
    desc: 'Access your bookmarked flights, hotels, and activities ready to book anytime.',
    link: '/profile?tab=saved',
    label: 'View Saved',
  },
  {
    icon: Wallet,
    title: 'Sage Wallet',
    desc: 'Check your Sage Points balance and transaction history. Earn more by referring friends.',
    link: '/profile?tab=wallet',
    label: 'View Wallet',
  },
  {
    icon: Users,
    title: 'Refer & Earn',
    desc: 'Invite friends to TripSage and earn 100 Sage Points for every successful referral.',
    link: '/profile?tab=referrals',
    label: 'Refer Friends',
  },
]

const features = [
  { icon: Zap, label: 'AI Itinerary', desc: 'Instant day-by-day plans' },
  { icon: Globe, label: 'Global Search', desc: 'Flights, hotels, trains, buses' },
  { icon: Shield, label: 'Secure Booking', desc: 'End-to-end encrypted payments' },
  { icon: MapPin, label: 'Smart Maps', desc: 'Live weather & place insights' },
]

export default function DashboardPage() {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser()
  const { isLoggedIn: isStoreLoggedIn, user: storeUser } = useAuthStore()
  const { tripHistory, startNewTrip, setTrip, setItinerary, addTripToHistory } = useTripStore()
  const router = useRouter()

  const [dbTrips, setDbTrips] = useState<any[]>([])
  const [dbLoading, setDbLoading] = useState(true)

  const isAuthenticated = isSignedIn || isStoreLoggedIn
  const firstName = clerkUser?.firstName || storeUser?.name?.split(' ')[0] || 'Traveler'

  // Fetch trips from database if authenticated
  useEffect(() => {
    async function loadTrips() {
      if (!isAuthenticated) {
        setDbLoading(false)
        return
      }
      try {
        const response = await tripAPI.getUserTrips()
        if (response.success && response.data) {
          setDbTrips(response.data)
        }
      } catch (err) {
        console.error('Error fetching database trips:', err)
      } finally {
        setDbLoading(false)
      }
    }
    loadTrips()
  }, [isAuthenticated])

  useEffect(() => {
    if (isLoaded && !isAuthenticated) {
      router.replace('/sign-in')
    }
  }, [isLoaded, isAuthenticated, router])

  if (!isLoaded || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FFFBF7] flex items-center justify-center gap-3 text-[#1A1A1A]">
        <Loader2 className="animate-spin text-[#EA580C]" size={32} />
        <span className="text-slate-600 font-semibold">Authenticating...</span>
      </div>
    )
  }

  // Combine database trips with local storage trips (removing duplicates by ID or destination)
  const allTrips = [
    ...dbTrips.map(t => ({
      tripId: t.id,
      destination: t.destination,
      startDate: t.startDate,
      endDate: t.endDate,
      budget: t.budget,
      members: t.travelers,
      status: t.status,
      isDb: true,
      itinerary: t.itineraryDays || [],
    })),
    ...tripHistory.map(t => ({
      tripId: t.tripId,
      destination: t.destination,
      startDate: t.dates.start,
      endDate: t.dates.end,
      budget: t.budget,
      members: t.members,
      status: t.status || 'PLANNED',
      isDb: false,
      itinerary: t.itinerary || [],
    }))
  ]

  // Filter out duplicate destinations or IDs to keep dashboard clean
  const uniqueTrips = allTrips.filter((trip, idx, self) =>
    self.findIndex(t => t.tripId === trip.tripId || (t.destination === trip.destination && t.startDate === trip.startDate)) === idx
  )

  const handleReplan = (trip: any) => {
    // Fill state in store to plan a similar trip
    setTrip({
      destination: trip.destination,
      startDate: trip.startDate ? new Date(trip.startDate).toISOString().split('T')[0] : '',
      endDate: trip.endDate ? new Date(trip.endDate).toISOString().split('T')[0] : '',
      startLocation: '',
      currentDay: 1,
    })
    setItinerary(trip.itinerary)
    router.push('/plan')
    toast.success(`Restored trip to ${trip.destination}!`)
  }

  return (
    <div className="min-h-screen bg-[#FFFBF7] text-[#1A1A1A] flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

        {/* ── Welcome Hero ── */}
        <div className="relative rounded-3xl overflow-hidden border border-[#E8E0D8] bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-white p-8 sm:p-12 shadow-sm">
          {/* Warm background glows */}
          <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-[#EA580C] border border-orange-100 mb-5">
                <Sparkles size={11} className="text-[#EA580C]" />
                AI-Powered Travel OS
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 text-[#1A1A1A] leading-tight">
                Welcome back,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EA580C] to-[#C2410C]">
                  {firstName}
                </span>
                !
              </h1>
              <p className="text-slate-600 text-base max-w-xl leading-relaxed mb-7">
                Your next adventure is waiting. Generate a personalized itinerary, compare flights, and book the perfect stay — all powered by AI.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/plan"
                  className="inline-flex items-center gap-2 bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-orange-500/15 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-sm"
                >
                  <MapPin size={16} />
                  Plan a New Trip
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-2 bg-white hover:bg-[#FFFBF7] border border-[#E8E0D8] text-slate-700 font-bold px-6 py-3 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-sm shadow-sm"
                >
                  <UserIcon size={16} className="text-[#EA580C]" />
                  My Profile
                </Link>
              </div>
            </div>

            {/* Feature pills */}
            <div className="grid grid-cols-2 gap-3 shrink-0">
              {features.map(({ icon: Icon, label, desc }) => (
                <div
                  key={label}
                  className="flex flex-col gap-1.5 p-4 rounded-2xl border border-[#E8E0D8] bg-white hover:border-[#EA580C]/40 transition-colors shadow-sm"
                >
                  <Icon size={18} className="text-[#EA580C]" />
                  <p className="text-xs font-bold text-[#1A1A1A]">{label}</p>
                  <p className="text-[11px] text-slate-500 leading-tight">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Upcoming & Saved Trips Section ── */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-black text-[#1A1A1A]">My Travel Plans</h2>
              <p className="text-xs text-slate-500 mt-0.5">Your active itineraries, saved stays, and past plans</p>
            </div>
            <Link
              href="/plan"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#EA580C] hover:text-[#C2410C]"
            >
              Plan New Trip <Plus size={14} />
            </Link>
          </div>

          {dbLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map(n => (
                <div key={n} className="border border-[#E8E0D8] bg-white rounded-2xl p-5 h-44 animate-pulse space-y-4">
                  <div className="h-6 w-1/3 bg-slate-100 rounded" />
                  <div className="h-4 w-2/3 bg-slate-100 rounded" />
                  <div className="h-10 w-full bg-slate-100 rounded-xl" />
                </div>
              ))}
            </div>
          ) : uniqueTrips.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {uniqueTrips.map((trip) => {
                const dateText = trip.startDate
                  ? `${new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(trip.endDate || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                  : 'Dates pending'
                return (
                  <div
                    key={trip.tripId}
                    className="border border-[#E8E0D8] bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:border-[#EA580C]/40 transition-all duration-200 group"
                  >
                    <div className="p-5 space-y-3 text-left">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-[#1A1A1A] group-hover:text-[#EA580C] transition-colors leading-snug">
                            {trip.destination}
                          </h3>
                          <p className="text-[11px] text-slate-500 font-medium mt-1 flex items-center gap-1">
                            <Clock size={11} /> {dateText}
                          </p>
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                          trip.isDb
                            ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                            : 'text-amber-700 bg-amber-50 border-amber-200'
                        }`}>
                          {trip.isDb ? 'Synced' : 'Local'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 py-2 border-y border-[#F5F0EA] text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 font-medium">Budget Limit</span>
                          <p className="font-bold font-mono text-[#1A1A1A] mt-0.5">₹{Math.round(trip.budget).toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-medium">Travelers</span>
                          <p className="font-bold text-[#1A1A1A] mt-0.5">{trip.members} {trip.members === 1 ? 'Person' : 'People'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="px-5 pb-5 flex gap-2">
                      <button
                        onClick={() => handleReplan(trip)}
                        className="flex-1 py-3 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#EA580C] font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
                      >
                        <ExternalLink size={12} /> View Full Itinerary
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="border-2 border-dashed border-[#E8E0D8] rounded-3xl p-10 text-center space-y-4 max-w-md mx-auto">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-[#EA580C] mx-auto">
                <MapPin size={22} />
              </div>
              <div>
                <h3 className="font-bold text-[#1A1A1A]">No trip plans yet</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Start by entering your route, dates, and budget. Our AI will build your perfect travel board instantly.
                </p>
              </div>
              <Link
                href="/plan"
                className="inline-flex items-center gap-2 bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold px-6 py-2.5 rounded-xl transition-all cursor-pointer text-xs shadow-sm shadow-orange-500/10 active:scale-[0.98]"
              >
                Create Your First Trip
              </Link>
            </div>
          )}
        </div>

        {/* ── Quick Access Grid ── */}

        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-black text-[#1A1A1A]">Quick Access</h2>
            <Link href="/profile" className="text-xs text-[#EA580C] hover:text-[#C2410C] font-semibold flex items-center gap-1">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {quickCards.map((card) => {
              const Icon = card.icon
              return (
                <div
                  key={card.title}
                  className="group flex flex-col border border-[#E8E0D8] bg-white p-6 rounded-2xl hover:border-[#EA580C]/40 hover:bg-[#FFFBF7]/40 transition-all duration-200 shadow-sm"
                >
                  <div className="w-11 h-11 rounded-xl border border-orange-100 bg-orange-50 text-[#EA580C] flex items-center justify-center mb-5 shrink-0">
                    <Icon size={22} />
                  </div>
                  <h3 className="text-base font-black mb-2 text-[#1A1A1A] group-hover:text-[#EA580C] transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed mb-5 flex-grow">
                    {card.desc}
                  </p>
                  <Link
                    href={card.link}
                    className="text-[#EA580C] hover:text-[#C2410C] text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    {card.label}
                    <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              )
            })}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  )
}
