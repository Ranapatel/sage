'use client'

import React, { memo } from 'react'
import { Bus, Star, ExternalLink, Shield, Share2 } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'
import { useAuthStore } from '@/store/authStore'
import { formatPrice } from '@/lib/currency'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { handleUniversalShare } from '../plan/TransportTab'

export interface BusClassResult {
  id: string
  operator: string
  busType: string
  rating: number | null
  amenities: string[]
  departure: string
  arrival: string
  duration: string
  fare: number | null
  seatsLeft: number | null
  bookingUrl: string
  aiRank?: { badge: string; reasons: string[] } | null
}

interface BusCardProps {
  bus: BusClassResult
}

function BusCard({ bus }: BusCardProps) {
  const { user } = useAuthStore()
  const currency = user?.currency ?? 'INR'
  const { requireAuth } = useRequireAuth()

  const handleBook = requireAuth(() => {
    trackEvent('booking_click', {
      type: 'bus',
      operator: bus.operator,
      price: bus.fare,
      url: bus.bookingUrl,
    })
    window.open(bus.bookingUrl, '_blank', 'noopener,noreferrer')
  })

  const hasAiBadge = bus.aiRank && bus.aiRank.badge

  return (
    <div className="card border border-slate-200/80 hover:border-[var(--primary)] transition-all duration-300 hover:shadow-lg flex flex-col justify-between bg-white rounded-2xl overflow-hidden">
      {/* AI Recommendation Banner */}
      {hasAiBadge && (
        <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent border-b border-blue-500/10 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star size={13} className="text-blue-600 fill-blue-600 animate-pulse" />
            <span className="text-[10px] font-black text-blue-700 tracking-wide uppercase">
              {bus.aiRank?.badge || 'AI Recommended'}
            </span>
          </div>
          <div className="flex flex-wrap gap-1 justify-end">
            {(Array.isArray(bus.aiRank?.reasons) ? bus.aiRank.reasons : []).map((reason, idx) => (
              <span
                key={idx}
                className="text-[9px] font-bold bg-blue-500/15 text-blue-800 px-2 py-0.5 rounded-full"
              >
                {reason}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Header Row */}
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 flex-shrink-0">
              <Bus size={18} />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="font-extrabold text-slate-800 text-sm leading-snug">
                  {bus.operator}
                </h4>
                {bus.rating != null && (
                  <div className="flex items-center gap-0.5 bg-green-500/10 text-green-600 px-1.5 py-0.5 rounded text-[10px] font-black">
                    <Star size={10} className="fill-green-600" />
                    {bus.rating.toFixed(1)}
                  </div>
                )}
              </div>
              <span className="text-[11px] font-semibold text-slate-400 mt-0.5 block leading-tight">
                {bus.busType}
              </span>
            </div>
          </div>
          
          {bus.seatsLeft !== null && bus.seatsLeft > 0 && (
            <span className="text-[9px] font-extrabold bg-orange-500/10 text-orange-600 px-2 py-0.5 rounded uppercase tracking-wider flex-shrink-0">
              {bus.seatsLeft} seats left
            </span>
          )}
        </div>

        {/* Timeline Row */}
        <div className="flex items-center justify-between bg-slate-50/50 border border-slate-100 p-4 rounded-2xl relative my-1 text-xs">
          <div className="text-left w-[30%]">
            <div className="font-black text-base text-slate-800 tracking-tight leading-none">
              {bus.departure}
            </div>
            <div className="font-extrabold text-[9px] text-slate-400 uppercase tracking-wider mt-1">
              Depart
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center px-2">
            <span className="text-[9px] font-bold text-slate-400 mb-1">
              {bus.duration}
            </span>
            <div className="w-full flex items-center justify-center relative">
              <div className="h-[1.5px] bg-slate-200 w-full rounded-full"></div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-[10px] bg-white leading-none px-0.5">›</div>
            </div>
          </div>

          <div className="text-right w-[30%]">
            <div className="font-black text-base text-slate-800 tracking-tight leading-none">
              {bus.arrival}
            </div>
            <div className="font-extrabold text-[9px] text-slate-400 uppercase tracking-wider mt-1">
              Arrive
            </div>
          </div>
        </div>

        {/* Amenities Row */}
        {bus.amenities && bus.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-0.5">
            {bus.amenities.slice(0, 3).map((amenity, idx) => (
              <span 
                key={idx} 
                className="text-[9px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200/40"
              >
                {amenity}
              </span>
            ))}
            {bus.amenities.length > 3 && (
              <span className="text-[9px] font-bold bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-full border border-slate-200/40">
                +{bus.amenities.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Pricing and Booking CTA */}
      <div className="flex items-center justify-between gap-3 p-5 pt-3 border-t border-slate-100 bg-[#FFFBF7]/60">
        <div className="text-left">
          {bus.seatsLeft !== null && bus.seatsLeft > 0 && bus.seatsLeft <= 5 ? (
            <span className="text-[10px] font-bold text-red-500 animate-pulse block mb-1">
              Only {bus.seatsLeft} seats left!
            </span>
          ) : bus.seatsLeft !== null && bus.seatsLeft > 0 ? (
            <span className="text-[9px] text-orange-600 font-bold block mb-1 uppercase tracking-wide">
              {bus.seatsLeft} seats remaining
            </span>
          ) : null}
          <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">
            Fare Estimate
          </span>
          <span className="text-lg font-black text-slate-800 tracking-tight mt-0.5 block leading-none">
            {bus.fare ? formatPrice(bus.fare, currency) : '—'}
          </span>
        </div>

        <button
          onClick={handleBook}
          className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl font-bold text-xs bg-[#EA580C] hover:bg-[#C2410C] text-white transition-all whitespace-nowrap shadow-md shadow-orange-500/10 ml-auto cursor-pointer active:scale-95 animate-fade-in"
        >
          Book Seat on MakeMyTrip <ExternalLink size={12} />
        </button>

        <button
          onClick={() => handleUniversalShare({
            name: bus.operator,
            price: bus.fare,
            departure: bus.departure,
            arrival: bus.arrival,
            duration: bus.duration,
            bookingLink: bus.bookingUrl
          })}
          title="Share option"
          className="h-[42px] w-[42px] border border-[#E8E0D8] hover:border-[#D0C8C0] text-[#6B6B6B] hover:bg-[#F5F5F4] rounded-xl flex items-center justify-center transition-all shrink-0 active:scale-95 cursor-pointer"
        >
          <Share2 size={18} />
        </button>
      </div>
    </div>
  )
}

export default memo(BusCard)
