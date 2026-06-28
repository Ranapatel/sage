'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useTripStore, TripRecord } from '@/store/tripStore'
import { motion } from 'framer-motion'
import { 
  Compass, 
  Calendar, 
  MapPin, 
  ArrowRight, 
  Coins, 
  Users, 
  Trash2,
  Sparkles,
  Plane,
  Hotel
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function MyTripsClient() {
  const router = useRouter()
  const { tripHistory } = useTripStore()

  const handleResume = (record: TripRecord) => {
    // Restoring active store values from historical trip record
    useTripStore.setState({
      currentTripId: record.tripId,
      tripContext: {
        startLocation: record.startLocation,
        destination: record.destination,
        startDate: record.dates.start,
        endDate: record.dates.end,
        currentDay: 1
      },
      itinerary: record.itinerary,
      bookingStatus: {
        flightStatus: record.bookings.transport ? 'SELECTED' : 'INIT',
        hotelStatus: record.bookings.hotel ? 'SELECTED' : 'INIT',
        returnStatus: record.bookings.returnTransport ? 'SELECTED' : 'INIT',
        selectedFlight: record.bookings.transport,
        selectedHotel: record.bookings.hotel,
        selectedReturn: record.bookings.returnTransport
      },
      tripStatus: 'planning',
      activeTab: 'overview'
    })

    // Update sessionStorage parameters to match search inputs
    sessionStorage.setItem('tripContext', JSON.stringify({
      from: record.startLocation,
      to: record.destination,
      startDate: record.dates.start,
      endDate: record.dates.end,
      budget: record.budget ? record.budget.toString() : '75000',
      travelers: record.members ? record.members.toString() : '2',
      style: record.style || 'adventure',
      diet: 'any',
      currency: 'INR'
    }))

    toast.success(`Loaded itinerary for ${record.destination}!`)
    router.push('/plan')
  }

  const handleDelete = (tripId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    // Filter history in Zustand store
    const updatedHistory = tripHistory.filter(t => t.tripId !== tripId)
    useTripStore.setState({ tripHistory: updatedHistory })
    toast.success('Trip removed from history.')
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0F1E] text-slate-100 font-sans">
      <Navbar />

      <div 
        className="flex-grow pt-24 pb-20 px-6 max-w-5xl mx-auto w-full"
        style={{
          background: 'radial-gradient(circle 800px at 50% -100px, rgba(99, 102, 241, 0.05), transparent), #0A0F1E'
        }}
      >
        <div className="text-left mb-10">
          <h1 className="text-3xl font-display font-extrabold text-white tracking-tight flex items-center gap-3">
            <Compass className="text-orange-500 animate-spin-slow" size={32} /> My Trips
          </h1>
          <p className="text-slate-400 text-sm mt-1">Review saved itineraries, bookings, and active travel routes.</p>
        </div>

        {tripHistory && tripHistory.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tripHistory.map((trip) => (
              <motion.div
                key={trip.tripId}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-950/40 border border-slate-900 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden flex flex-col justify-between hover:border-slate-800 transition-colors group cursor-pointer"
                onClick={() => handleResume(trip)}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[9px] uppercase tracking-widest bg-orange-500/10 border border-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full font-bold">
                        {trip.style || 'Adventure'}
                      </span>
                      <h2 className="text-lg font-bold text-white mt-2 group-hover:text-orange-400 transition-colors">
                        {trip.destination}
                      </h2>
                      <p className="text-slate-400 text-xs mt-1 flex items-center gap-1">
                        <MapPin size={12} className="text-orange-500" /> Start: {trip.startLocation.split(',')[0]}
                      </p>
                    </div>
                    
                    <button 
                      onClick={(e) => handleDelete(trip.tripId, e)}
                      className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 text-slate-500 transition-all"
                      title="Delete Trip"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-900/60 text-xs mb-4">
                    <div className="space-y-1">
                      <span className="text-slate-500 block uppercase tracking-wider text-[9px] font-bold">Dates</span>
                      <span className="text-slate-300 font-semibold flex items-center gap-1">
                        <Calendar size={12} className="text-orange-500" /> {new Date(trip.dates.start).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-500 block uppercase tracking-wider text-[9px] font-bold">Travelers</span>
                      <span className="text-slate-300 font-semibold flex items-center gap-1">
                        <Users size={12} className="text-orange-500" /> {trip.members} {trip.members === 1 ? 'Guest' : 'Guests'}
                      </span>
                    </div>
                  </div>

                  {/* Booking details summaries */}
                  <div className="flex gap-2 mb-6">
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                      trip.bookings.transport 
                        ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' 
                        : 'bg-slate-900/40 border-slate-800 text-slate-500'
                    }`}>
                      <Plane size={11} /> Flights {trip.bookings.transport ? 'Selected' : 'None'}
                    </div>

                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                      trip.bookings.hotel 
                        ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' 
                        : 'bg-slate-900/40 border-slate-800 text-slate-500'
                    }`}>
                      <Hotel size={11} /> Hotel {trip.bookings.hotel ? 'Selected' : 'None'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-900/30">
                  <div className="flex items-center gap-1.5">
                    <Coins size={14} className="text-orange-500" />
                    <span className="text-sm font-extrabold text-white">₹{trip.budget?.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">Cap</span></span>
                  </div>
                  
                  <span className="flex items-center gap-1 text-xs font-bold text-orange-400 group-hover:translate-x-1 transition-transform">
                    Resume Plan <ArrowRight size={12} />
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-950/30 border-2 border-dashed border-slate-900 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-6">
            <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <Compass size={32} className="animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">No Trips Found</h3>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
                You haven't planned any trips yet. Create a custom AI itinerary in seconds.
              </p>
            </div>

            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 px-7 rounded-xl text-sm transition-all shadow-md shadow-orange-500/10"
            >
              <Sparkles size={16} /> Plan a New Trip
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
