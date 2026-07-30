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
    <div className="group bg-white border border-[#E8E0D8] hover:border-[#EA580C] transition-all duration-300 hover:shadow-xl flex flex-col justify-between rounded-3xl overflow-hidden relative">
      {/* AI Recommendation Banner */}
      {hasAiBadge && (
        <div className="bg-orange-50/90 border-b border-orange-200/80 px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Star size={13} className="text-[#EA580C] fill-[#EA580C] animate-pulse" />
            <span className="text-[10px] font-black text-[#EA580C] tracking-wide uppercase font-display">
              {bus.aiRank?.badge || 'AI Recommended'}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 justify-end">
            {(Array.isArray(bus.aiRank?.reasons) ? bus.aiRank.reasons : []).map((reason, idx) => (
              <span
                key={idx}
                className="text-[9px] font-extrabold bg-white text-[#EA580C] border border-orange-200 px-2 py-0.5 rounded-md"
              >
                {reason}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="p-5 md:p-6 flex flex-col gap-4 flex-1 relative z-10">
        {/* Header Row */}
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#EA580C] shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <Bus size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-black text-[#1A1A1A] text-base leading-snug font-display">
                  {bus.operator}
                </h4>
                {bus.rating != null && (
                  <div className="flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-lg text-[10px] font-black">
                    <Star size={10} className="fill-emerald-600 text-emerald-600" />
                    <span>{bus.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
              <span className="text-xs font-semibold text-[#6B6B6B] mt-0.5 block leading-tight">
                {bus.busType}
              </span>
            </div>
          </div>
          
          {bus.seatsLeft !== null && bus.seatsLeft > 0 && (
            <span className="text-[10px] font-black bg-orange-50 text-[#EA580C] border border-orange-200 px-2.5 py-1 rounded-xl uppercase tracking-wider shrink-0">
              {bus.seatsLeft} seats left
            </span>
          )}
        </div>

        {/* Timeline Row */}
        <div className="flex items-center justify-between bg-[#FFFBF7] border border-[#E8E0D8] p-4 rounded-2xl relative my-1 text-xs">
          <div className="text-left w-[30%]">
            <div className="font-black text-xl text-[#1A1A1A] tracking-tight font-display leading-none">
              {bus.departure}
            </div>
            <div className="font-black text-[10px] text-[#EA580C] uppercase tracking-wider mt-1">
              Depart
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center px-2">
            <span className="text-[10px] font-black text-[#6B6B6B] mb-1">
              {bus.duration}
            </span>
            <div className="w-full flex items-center justify-center relative">
              <div className="h-[2px] bg-[#E8E0D8] group-hover:bg-[#EA580C]/40 w-full rounded-full transition-colors" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 text-[#EA580C] font-mono text-[10px] bg-white rounded-full p-0.5 border border-[#E8E0D8]">›</div>
            </div>
          </div>

          <div className="text-right w-[30%]">
            <div className="font-black text-xl text-[#1A1A1A] tracking-tight font-display leading-none">
              {bus.arrival}
            </div>
            <div className="font-black text-[10px] text-[#1A1A1A] uppercase tracking-wider mt-1">
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
                className="text-[10px] font-bold bg-[#FFFBF7] text-[#6B6B6B] px-2.5 py-1 rounded-xl border border-[#E8E0D8]"
              >
                {amenity}
              </span>
            ))}
            {bus.amenities.length > 3 && (
              <span className="text-[10px] font-bold bg-[#FFFBF7] text-[#9CA3AF] px-2 py-1 rounded-xl border border-[#E8E0D8]">
                +{bus.amenities.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Pricing and Booking CTA */}
      <div className="flex items-center justify-between gap-3 p-5 pt-3 border-t border-[#E8E0D8]/80 bg-[#FFFBF7]/60 relative z-10">
        <div className="text-left">
          {bus.seatsLeft !== null && bus.seatsLeft > 0 && bus.seatsLeft <= 5 ? (
            <span className="text-[10px] font-black text-red-500 animate-pulse block mb-0.5">
              Only {bus.seatsLeft} seats left!
            </span>
          ) : bus.seatsLeft !== null && bus.seatsLeft > 0 ? (
            <span className="text-[10px] text-[#EA580C] font-black block mb-0.5 uppercase tracking-wide">
              {bus.seatsLeft} seats remaining
            </span>
          ) : null}
          <span className="text-[10px] text-[#9CA3AF] font-black block uppercase tracking-wider">
            Fare Estimate
          </span>
          <span className="text-xl md:text-2xl font-black text-[#1A1A1A] tracking-tight mt-0.5 block leading-none font-display">
            {bus.fare ? formatPrice(bus.fare, currency) : '—'}
          </span>
        </div>

        <button
          onClick={handleBook}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs md:text-sm bg-[#EA580C] hover:bg-[#C2410C] text-white transition-all whitespace-nowrap shadow-md hover:shadow-xl ml-auto cursor-pointer active:scale-95"
        >
          <span>Book on redBus</span>
          <ExternalLink size={14} />
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
          className="h-[44px] w-[44px] border border-[#E8E0D8] hover:border-[#EA580C]/50 text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#FFFBF7] rounded-2xl flex items-center justify-center transition-all shrink-0 active:scale-95 cursor-pointer shadow-2xs"
        >
          <Share2 size={18} />
        </button>
      </div>
    </div>
  )
}

export default memo(BusCard)
