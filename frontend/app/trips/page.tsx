'use client'

import { useEffect, useState } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import axios from 'axios'
import { Calendar, MapPin, DollarSign, Users, ChevronRight, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function TripsPage() {
  const { getToken } = useAuth()
  const { user, isLoaded, isSignedIn } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace('/sign-in')
    }
  }, [isLoaded, isSignedIn, router])

  const [trips, setTrips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTrips() {
      try {
        const token = await getToken()
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
        const response = await axios.get(`${apiUrl}/api/trips`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.data?.success) {
          setTrips(response.data.data || [])
        } else {
          setError(response.data?.message || 'Failed to fetch trips')
        }
      } catch (err: any) {
        console.error('Error fetching trips:', err.message)
        setError(err.response?.data?.message || err.message || 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchTrips()
    }
  }, [user, getToken])

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">My Saved Trips</h1>
            <p className="text-slate-400 text-sm mt-1">Manage and view all your planned itineraries</p>
          </div>
          <Link
            href="/plan"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-all"
          >
            Create a Trip
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="animate-spin text-blue-500" size={40} />
            <p className="text-slate-400 text-sm">Retrieving your journeys...</p>
          </div>
        ) : error ? (
          <div className="border border-red-900/30 bg-red-950/20 text-red-400 p-6 rounded-2xl text-center max-w-md mx-auto">
            <p className="font-bold mb-2">Error Loading Trips</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : trips.length === 0 ? (
          <div className="border border-slate-800 bg-slate-900/30 rounded-3xl p-16 text-center max-w-xl mx-auto">
            <div className="text-5xl mb-4">✈️</div>
            <h3 className="text-xl font-bold mb-2">No Saved Trips</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              You haven't saved any trips to your profile yet. Plan your first trip using our AI engine to get started!
            </p>
            <Link
              href="/plan"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all"
            >
              Start Planning
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <div
                key={trip.id}
                className="border border-slate-800 bg-slate-900/40 rounded-2xl overflow-hidden hover:border-blue-600/40 transition-all flex flex-col"
              >
                {/* Trip Card Top */}
                <div className="p-6 flex-grow">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-blue-600/15 text-blue-400 border border-blue-600/30">
                      {trip.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-4">{trip.title}</h3>

                  <div className="space-y-3 text-slate-300 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-slate-500" />
                      <span>{trip.destination}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-slate-500" />
                      <span>
                        {new Date(trip.startDate).toLocaleDateString()} -{' '}
                        {new Date(trip.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} className="text-slate-500" />
                      <span>Budget: ${trip.budget}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-slate-500" />
                      <span>Travelers: {trip.travelers}</span>
                    </div>
                  </div>
                </div>

                {/* Trip Card Bottom */}
                <div className="border-t border-slate-800/80 bg-slate-900/20 px-6 py-4 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    {trip.itineraryDays?.length || 0} Itinerary Days
                  </span>
                  <Link
                    href={`/plan?tripId=${trip.id}`}
                    className="text-blue-400 hover:text-blue-300 text-sm font-semibold flex items-center gap-0.5"
                  >
                    View Details
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
