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
    <div className="group bg-white border border-[#E8E0D8] hover:border-[#EA580C] transition-all duration-300 hover:shadow-xl rounded-[20px] p-4 sm:p-5 md:p-6 space-y-3.5 sm:space-y-4 relative overflow-hidden flex flex-col justify-between w-full min-w-0 box-border">
      
      {/* AI Recommendation Banner */}
      {hasAiBadge && (
        <div className="bg-orange-50/90 border-b border-orange-200/80 px-4 py-2 -mx-4 -mt-4 sm:-mx-5 sm:-mt-5 md:-mx-6 md:-mt-6 flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <Star size={13} className="text-[#EA580C] fill-[#EA580C] animate-pulse shrink-0" />
            <span className="text-[10px] font-black text-[#EA580C] tracking-wide uppercase font-display truncate">
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

      {/* ── SECTION 1: OPERATOR & HEADER BAR ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#EA580C] shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
            <Bus size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-black text-[#1A1A1A] text-sm sm:text-base leading-tight font-display truncate">
                {bus.operator}
              </h4>
              {bus.rating != null && (
                <div className="flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-lg text-[10px] font-black shrink-0">
                  <Star size={10} className="fill-emerald-600 text-emerald-600" />
                  <span>{bus.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
            <span className="text-xs font-semibold text-[#6B6B6B] mt-0.5 block leading-tight truncate">
              {bus.busType}
            </span>
          </div>
        </div>

        {bus.seatsLeft !== null && bus.seatsLeft > 0 && (
          <span className="text-[10px] font-black bg-orange-50 text-[#EA580C] border border-orange-200 px-2.5 py-1 rounded-xl uppercase tracking-wider shrink-0 ml-auto sm:ml-0">
            {bus.seatsLeft} seats left
          </span>
        )}
      </div>

      {/* ── SECTION 2: BUS SCHEDULE & TIMELINE (Contained Card) ── */}
      <div className="bg-[#FFFBF7]/80 border border-[#E8E0D8]/90 rounded-2xl p-3 sm:p-4 space-y-1.5 relative z-10 min-w-0">
        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-[#9CA3AF] mb-0.5">
          <span>Bus Schedule & Track</span>
          <span className="text-[#EA580C]">Direct Express</span>
        </div>

        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-1.5 sm:gap-4 min-w-0">
          
          {/* Departure */}
          <div className="text-left shrink-0 min-w-[50px] sm:min-w-[75px]">
            <div className="text-base sm:text-2xl font-black text-[#1A1A1A] leading-none font-display">
              {bus.departure}
            </div>
            <div className="text-[10px] sm:text-xs font-black text-[#EA580C] uppercase tracking-wider mt-1">
              Depart
            </div>
          </div>

          {/* Center Timeline Track */}
          <div className="flex flex-col items-center justify-center px-0.5 sm:px-3 min-w-0">
            <span className="text-[9px] sm:text-xs font-black text-[#6B6B6B] mb-1 bg-white border border-[#E8E0D8] px-2 py-0.5 rounded-full shadow-2xs">
              {bus.duration}
            </span>
            <div className="w-full flex items-center justify-center relative my-1">
              <div className="h-[2px] bg-[#E8E0D8] group-hover:bg-[#EA580C]/40 w-full rounded-full transition-colors" />
              <div className="absolute inset-0 flex items-center justify-between">
                <div className="w-2 h-2 rounded-full bg-[#EA580C] ring-2 ring-orange-100" />
                <div className="w-2 h-2 rounded-full bg-[#1A1A1A] ring-2 ring-gray-100" />
              </div>
              <div className="absolute bg-white border border-[#E8E0D8] rounded-full p-0.5 shadow-2xs flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 z-10 text-[#EA580C]">
                <Bus size={11} />
              </div>
            </div>
          </div>

          {/* Arrival */}
          <div className="text-right shrink-0 min-w-[50px] sm:min-w-[75px]">
            <div className="text-base sm:text-2xl font-black text-[#1A1A1A] leading-none font-display">
              {bus.arrival}
            </div>
            <div className="text-[10px] sm:text-xs font-black text-[#1A1A1A] uppercase tracking-wider mt-1">
              Arrive
            </div>
          </div>

        </div>
      </div>

      {/* ── SECTION 3: INCLUDED AMENITIES CHIPS ── */}
      {bus.amenities && bus.amenities.length > 0 && (
        <div className="flex flex-wrap gap-1.5 relative z-10 pt-0.5">
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

      {/* ── SECTION 4: PRICING & BOOKING CTA FOOTER ── */}
      <div className="pt-3 border-t border-[#E8E0D8]/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 relative z-10">
        <div className="text-left">
          <span className="text-[10px] text-[#9CA3AF] font-bold block uppercase tracking-wider">
            Fare Estimate
          </span>
          <span className="text-xl sm:text-2xl font-black text-[#1A1A1A] tracking-tight leading-none font-display block mt-0.5">
            {bus.fare ? formatPrice(bus.fare, currency) : '—'}
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleBook}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[48px] rounded-2xl font-black text-xs sm:text-sm bg-[#EA580C] hover:bg-[#C2410C] text-white transition-all whitespace-nowrap shadow-md hover:shadow-xl cursor-pointer active:scale-95"
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
            className="h-[48px] w-[48px] min-h-[44px] min-w-[44px] border border-[#E8E0D8] hover:border-[#EA580C]/50 text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#FFFBF7] rounded-2xl flex items-center justify-center transition-all shrink-0 active:scale-95 cursor-pointer shadow-2xs"
          >
            <Share2 size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default memo(BusCard)
