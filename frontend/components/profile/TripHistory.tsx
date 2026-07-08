'use client'

import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useAuth } from '@clerk/nextjs'
import { Calendar, Users, DollarSign, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface TripData {
  id: string
  destination: string
  title: string
  startDate: string
  endDate: string
  budget: number
  travelers: number
  status: string
}

export default function TripHistory() {
  const { getToken } = useAuth()
  const [trips, setTrips] = useState<TripData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const token = await getToken()
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        const response = await axios.get(`${apiUrl}/api/trips`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (response.data?.success) {
          setTrips(response.data.data)
        }
      } catch (err: any) {
        console.error('Error fetching trips:', err)
        toast.error('Failed to load trip history.')
      } finally {
        setLoading(false)
      }
    }
    fetchTrips()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'upcoming':
      case 'planned':
        return 'badge-amber'
      case 'completed':
        return 'badge-green'
      case 'cancelled':
        return 'badge-red'
      default:
        return 'badge-green'
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="shimmer h-24 w-full rounded-2xl"></div>
        ))}
      </div>
    )
  }

  if (trips.length === 0) {
    return (
      <div className="card p-12 text-center bg-slate-950/40 border border-slate-800 rounded-3xl">
        <div className="text-5xl mb-4">✈️</div>
        <h3 className="font-bold text-white mb-2">No trips planned yet</h3>
        <p className="text-slate-400 text-xs mb-6 max-w-sm mx-auto">
          Start your adventure with TripSage! Generate an AI itinerary, look up transport rates, and book hotels.
        </p>
        <Link
          href="/plan"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-[0.98]"
        >
          Plan a New Trip <ArrowRight size={14} />
        </Link>
      </div>
    )
  }

  return (
    <div className="card p-6 md:p-8 bg-slate-950/40 border border-slate-800 rounded-3xl relative overflow-hidden shadow-2xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            📅 Trip History
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Browse through your generated, current, and previous travel itineraries.
          </p>
        </div>
        <Link
          href="/plan"
          className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
        >
          + Plan Trip
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {trips.map((trip) => {
          const start = new Date(trip.startDate)
          const end = new Date(trip.endDate)
          const dateStr = `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
          
          return (
            <div
              key={trip.id}
              className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 hover:border-slate-700/80 transition-all duration-300 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-black text-white">{trip.title}</h3>
                  <span className={`badge ${getStatusBadge(trip.status)} text-[0.6rem] font-black uppercase tracking-wider`}>
                    {trip.status}
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-[0.7rem] text-slate-400 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-blue-500" />
                    <span>{dateStr}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users size={13} className="text-indigo-500" />
                    <span>{trip.travelers} Traveler{trip.travelers > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <DollarSign size={13} className="text-amber-500" />
                    <span>Budget: ${trip.budget}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end border-t border-slate-800 md:border-t-0 pt-3 md:pt-0">
                {/* For simulation, we link to /plan tab bookings to let them inspect */}
                <Link
                  href="/plan"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 font-bold text-xs rounded-xl border border-blue-500/20 hover:border-blue-500/30 transition-all active:scale-[0.98]"
                >
                  View Details <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
