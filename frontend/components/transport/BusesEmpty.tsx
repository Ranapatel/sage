'use client'

import React from 'react'
import { Bus, Train, ArrowRight, AlertCircle } from 'lucide-react'
import { useTripStore } from '@/store/tripStore'
import BookingButton from '../BookingButton'
import { isSameCountry } from '@/lib/countryUtils'

interface BusesEmptyProps {
  origin?: string
  destination?: string
  searchUrl?: string | null
}

export default function BusesEmpty({
  origin = 'your origin',
  destination = 'your destination',
  searchUrl,
}: BusesEmptyProps) {
  const { setActiveTab } = useTripStore()
  const fallbackUrl = searchUrl || 'https://www.makemytrip.com/bus-tickets/'
  const isDomestic = isSameCountry(origin, destination)

  if (!isDomestic) {
    return (
      <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
        <div className="glass rounded-2xl border border-slate-200/60 p-8 text-center bg-white shadow-sm flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
            <Bus size={32} />
          </div>
          <div className="space-y-2">
            <h4 className="text-xl font-black text-slate-800">International Bus Services Not Available</h4>
            <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto font-medium">
              International bus services are not available for this route.
            </p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Bus travel is only available for domestic routes within the same country. Please check flight options for your international trip to <span className="font-bold text-slate-700">{destination}</span>.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      {/* Visual Header */}
      <div className="glass rounded-2xl border border-slate-200/60 p-8 text-center bg-white shadow-sm flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
          <Bus size={32} />
        </div>
        <div className="space-y-2">
          <h4 className="text-xl font-black text-slate-800">No Buses Found</h4>
          <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
            We couldn't find any direct bus services scheduled from <span className="font-extrabold text-slate-700">{origin}</span> to <span className="font-extrabold text-slate-700">{destination}</span> on your selected date.
          </p>
        </div>
      </div>

      {/* Suggest Trains Option */}
      <div className="glass p-6 rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white to-orange-50/20 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 text-left">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600 flex-shrink-0">
            <Train size={22} />
          </div>
          <div>
            <h5 className="font-extrabold text-slate-800 text-sm">Check Available Trains</h5>
            <p className="text-[11px] text-slate-500 mt-0.5 max-w-sm">
              Trains run frequently between major hubs and might offer comfortable travel classes.
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('trains')}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs bg-orange-600 hover:bg-orange-700 text-white transition-colors flex-shrink-0 cursor-pointer shadow-md shadow-orange-600/10"
        >
          View Train Schedules <ArrowRight size={14} />
        </button>
      </div>

      {/* External Redirect Card */}
      <div className="glass p-8 border border-slate-200/60 rounded-2xl bg-white shadow-sm text-center max-w-2xl mx-auto space-y-4">
        <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Search Live Partners</h4>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          Open MakeMyTrip directly to search for regional or unlisted local operators on this route.
        </p>
        <div className="max-w-xs mx-auto pt-2">
          <BookingButton
            label="Search on MakeMyTrip"
            icon="bus"
            url={fallbackUrl}
            provider="makemytrip"
          />
        </div>
      </div>
    </div>
  )
}
