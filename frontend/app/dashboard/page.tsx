'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Calendar, Compass, ArrowRight, User as UserIcon, Sparkles, Loader2 } from 'lucide-react'

export default function DashboardPage() {
  const { user, isLoaded, isSignedIn } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace('/sign-in')
    }
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center gap-3 text-white">
        <Loader2 className="animate-spin text-blue-500" size={32} />
        <span>Authenticating...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="relative rounded-3xl overflow-hidden mb-10 border border-slate-800 bg-slate-900/50 p-8 sm:p-12">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-600/15 text-blue-400 border border-blue-600/30 mb-6">
              <Sparkles size={12} />
              AI-Powered Travel OS
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 text-white">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">{user?.firstName || 'Traveler'}</span>!
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl leading-relaxed mb-8">
              Your next adventure is waiting. Let's design a personalized itinerary, find the cheapest flights, and book the perfect stay.
            </p>
            <Link
              href="/plan"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02]"
            >
              Plan a New Trip
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {/* Quick Links / Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card border border-slate-800 bg-slate-900/40 p-6 rounded-2xl hover:border-blue-600/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-600/30 flex items-center justify-center mb-5 text-blue-400">
              <Compass size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2 text-white group-hover:text-blue-400 transition-colors">Explore Activities</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Browse top activities, restaurants, and guided tours in popular destinations across India and globally.
            </p>
            <Link href="/plan" className="text-blue-400 hover:text-blue-300 text-sm font-semibold flex items-center gap-1">
              Explore Now
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="card border border-slate-800 bg-slate-900/40 p-6 rounded-2xl hover:border-indigo-600/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-600/30 flex items-center justify-center mb-5 text-indigo-400">
              <Calendar size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2 text-white group-hover:text-indigo-400 transition-colors">My Saved Trips</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              View your itineraries, flight details, hotel bookings, and travel photos in your centralized repository.
            </p>
            <Link href="/trips" className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold flex items-center gap-1">
              View My Trips
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="card border border-slate-800 bg-slate-900/40 p-6 rounded-2xl hover:border-purple-600/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-purple-600/10 border border-purple-600/30 flex items-center justify-center mb-5 text-purple-400">
              <UserIcon size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2 text-white group-hover:text-purple-400 transition-colors">Profile & Preferences</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Manage your personal details, set currency preferences, and update security credentials.
            </p>
            <Link href="/profile" className="text-purple-400 hover:text-purple-300 text-sm font-semibold flex items-center gap-1">
              Manage Profile
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
