'use client'

import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useAuth } from '@clerk/nextjs'
import { Calendar, Users, DollarSign, ArrowRight, Plane, History } from 'lucide-react'
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
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
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
        return 'text-amber-700 bg-amber-50 border border-amber-200'
      case 'completed':
        return 'text-green-700 bg-green-50 border border-green-200'
      case 'cancelled':
        return 'text-red-700 bg-red-50 border border-red-200'
      default:
        return 'text-green-700 bg-green-50 border border-green-200'
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
      <div className="card p-12 text-center bg-white border border-[#E8E0D8] rounded-3xl">
        <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center mx-auto mb-4 text-[#EA580C]">
          <Plane size={24} />
        </div>
        <h3 className="font-bold text-[#1A1A1A] mb-2">No trips planned yet</h3>
        <p className="text-slate-500 text-xs mb-6 max-w-sm mx-auto">
          Start your adventure with TripSage! Generate an AI itinerary, look up transport rates, and book hotels.
        </p>
        <Link
          href="/plan"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs rounded-xl shadow transition-transform active:scale-[0.98]"
        >
          Plan a New Trip <ArrowRight size={14} />
        </Link>
      </div>
    )
  }

  return (
    <div className="card p-6 md:p-8 bg-white border border-[#E8E0D8] rounded-3xl relative overflow-hidden shadow-sm space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-black text-[#1A1A1A] flex items-center gap-2">
            <History className="text-[#EA580C]" size={20} />
            <span>Trip History</span>
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Browse through your generated, current, and previous travel itineraries.
          </p>
        </div>
        <Link
          href="/plan"
          className="px-4 py-2 bg-[#FFFBF7] border border-[#E8E0D8] hover:bg-white text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
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
              className="p-5 rounded-2xl border border-[#E8E0D8] bg-[#FFFBF7]/40 hover:border-[#EA580C]/40 hover:bg-white transition-all duration-300 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-black text-[#1A1A1A]">{trip.title}</h3>
                  <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${getStatusBadge(trip.status)}`}>
                    {trip.status}
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-[0.7rem] text-slate-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-[#EA580C]" />
                    <span>{dateStr}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users size={13} className="text-[#EA580C]" />
                    <span>{trip.travelers} Traveler{trip.travelers > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <DollarSign size={13} className="text-[#EA580C]" />
                    <span>Budget: ${trip.budget}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end border-t border-slate-100 md:border-t-0 pt-3 md:pt-0">
                <Link
                  href="/trips"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-50 hover:bg-orange-100/80 text-[#EA580C] font-bold text-xs rounded-xl border border-orange-100 hover:border-orange-200 transition-all active:scale-[0.98]"
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
