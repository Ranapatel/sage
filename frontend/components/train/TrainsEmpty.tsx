'use client'

import React from 'react'
import { Train, Bus, MapPin, ArrowRight, Shield } from 'lucide-react'
import { useTripStore, TrainStationInfo } from '@/store/tripStore'

interface TrainsEmptyProps {
  origin?: string
  destination?: string
  trainStationInfo?: TrainStationInfo | null
}

export default function TrainsEmpty({
  origin = 'your origin',
  destination = 'your destination',
  trainStationInfo,
}: TrainsEmptyProps) {
  const { setActiveTab } = useTripStore()

  const hasSubstituteOrigin = trainStationInfo?.origin?.isSubstitute
  const hasSubstituteDest = trainStationInfo?.destination?.isSubstitute

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      {/* Visual Header */}
      <div className="glass rounded-2xl border border-slate-200/60 p-8 text-center bg-white shadow-sm flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-600">
          <Train size={32} />
        </div>
        <div className="space-y-2">
          <h4 className="text-xl font-black text-slate-800">No Direct Trains Found</h4>
          <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
            We couldn't find any direct trains running from <span className="font-extrabold text-slate-700">{origin}</span> to <span className="font-extrabold text-slate-700">{destination}</span> on your selected date.
          </p>
        </div>
      </div>

      {/* Station Suggestions */}
      {trainStationInfo && (hasSubstituteOrigin || hasSubstituteDest) && (
        <div className="glass p-6 rounded-2xl border border-slate-200/60 bg-white shadow-sm space-y-4">
          <h5 className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin size={16} className="text-orange-500" /> Nearest Stations Suggested
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hasSubstituteOrigin && trainStationInfo.origin && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Nearest Departure Station</span>
                <span className="font-extrabold text-slate-700 text-sm">
                  {trainStationInfo.origin.name} ({trainStationInfo.origin.code})
                </span>
                {trainStationInfo.origin.distanceKm && (
                  <span className="text-xs text-slate-500 mt-1 font-semibold">
                    ~ {trainStationInfo.origin.distanceKm} km from {trainStationInfo.origin.originalPlace || origin}
                  </span>
                )}
                {trainStationInfo.origin.reason && (
                  <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
                    {trainStationInfo.origin.reason}
                  </p>
                )}
              </div>
            )}
            {hasSubstituteDest && trainStationInfo.destination && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Nearest Arrival Station</span>
                <span className="font-extrabold text-slate-700 text-sm">
                  {trainStationInfo.destination.name} ({trainStationInfo.destination.code})
                </span>
                {trainStationInfo.destination.distanceKm && (
                  <span className="text-xs text-slate-500 mt-1 font-semibold">
                    ~ {trainStationInfo.destination.distanceKm} km to {trainStationInfo.destination.originalPlace || destination}
                  </span>
                )}
                {trainStationInfo.destination.reason && (
                  <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
                    {trainStationInfo.destination.reason}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Suggest Buses Option */}
      <div className="glass p-6 rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white to-blue-50/20 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 text-left">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 flex-shrink-0">
            <Bus size={22} />
          </div>
          <div>
            <h5 className="font-extrabold text-slate-800 text-sm">Check Available Buses</h5>
            <p className="text-[11px] text-slate-500 mt-0.5 max-w-sm">
              Buses might be running on this route or have better connectivity on your travel date.
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('buses')}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white transition-colors flex-shrink-0 cursor-pointer shadow-md shadow-blue-600/10"
        >
          View Bus Schedules <ArrowRight size={14} />
        </button>
      </div>
    </div>
  )
}
