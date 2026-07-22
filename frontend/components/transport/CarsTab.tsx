'use client'

import React, { memo } from 'react'
import { useTripStore } from '@/store/tripStore'
import Image from 'next/image'
import { trackEvent } from '@/lib/analytics'
import { Car, ShieldCheck } from 'lucide-react'

function CarsTab() {
  const { cars, loading, tripContext } = useTripStore()

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => (
          <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  const affiliateEntry = cars?.find((c: any) => c.source === 'affiliate_redirect')
  const destination    = tripContext?.destination || ''
  const redirectUrl    = affiliateEntry?.bookingLink ||
    `https://naiawork.com/g/wqjhitsyjqbd777ee50d5ea594bb46/?dest=${encodeURIComponent(destination)}&source=tripsage`

  return (
    <div className="space-y-4 animate-fade-in">
      {/* DiscoverCars Horizontal Sleek Card */}
      <div className="bg-white rounded-2xl border border-slate-200 hover:border-orange-500/50 hover:shadow-lg transition-all duration-300 p-4 md:p-5 flex flex-col md:flex-row items-center justify-between gap-4 group">
        
        {/* LEFT: Car Icon & Destination */}
        <div className="flex items-center gap-4 w-full md:w-1/3 shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-orange-100/70 p-3 flex items-center justify-center text-[#EA580C] shrink-0 border border-orange-200/50">
            <Car size={28} strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-slate-900 text-base leading-tight group-hover:text-[#EA580C] transition-colors">
                Rental Cabs & Self-Drive
              </h4>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                DiscoverCars
              </span>
            </div>
            <p className="text-slate-500 text-xs font-medium mt-1">
              {destination ? `Available in ${destination.split(',')[0]}` : 'Live Real-time Cab & Car Search'}
            </p>
          </div>
        </div>

        {/* CENTER: Features & Free Cancellation */}
        <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap justify-center">
          <span className="bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-600" /> Free Cancellation
          </span>
          <span className="bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded-full">
            No Hidden Fees
          </span>
        </div>

        {/* RIGHT: Action CTA Button */}
        <div className="shrink-0 w-full md:w-auto">
          <a
            href={redirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('booking_click', { type: 'car', name: 'DiscoverCars', source: 'affiliate_redirect' })}
            className="w-full md:w-auto block text-center px-6 py-3 rounded-xl font-extrabold text-xs bg-gradient-to-r from-[#EA580C] to-[#F97316] text-white hover:shadow-md hover:shadow-orange-500/25 transition-all duration-200"
          >
            Search Rental Cabs →
          </a>
        </div>
      </div>
    </div>
  )
}

export default memo(CarsTab)
