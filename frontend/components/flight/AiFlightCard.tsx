'use client'

import React, { useState } from 'react'
import {
  Share2, Heart, ExternalLink, Luggage, Briefcase,
  Info, Clock, ShieldCheck, ChevronDown, Zap, Award, CheckCircle2, Plane
} from 'lucide-react'
import { formatPrice } from '@/lib/currency'
import { buildKiwiAffiliateUrl, KiwiFlightParams } from '@/lib/kiwiAffiliate'
import { SageScoreRing } from '@/components/ui/SageScoreBadge'

export interface FlightOfferItem {
  id: string
  name: string
  airlineCode?: string
  logo?: string
  origin: string
  destination: string
  departure: string
  arrival: string
  departureTime: string
  arrivalTime: string
  isOvernight?: boolean
  departureDate?: string
  duration: string
  durationMinutes?: number
  stops: number
  layoverCities?: string[]
  stopDetails?: string
  price: number
  perPassengerPrice?: number
  totalPrice?: number
  passengers?: number
  currency?: string
  cabinClass?: string
  cabinBaggage?: string
  checkedBaggage?: string
  aiEstimated?: boolean
  aiConfidenceScore?: number
  disclaimer?: string
  tag?: string
  score?: number
  kiwiBookingUrl?: string
}

interface AiFlightCardProps {
  flight: FlightOfferItem
  searchParams?: KiwiFlightParams
  currency?: string
}

// ── Official Airline High-Res Logos (Kiwi CDN - 100% Reliable & CORS-Free) ──
const OFFICIAL_AIRLINE_LOGOS: Record<string, string> = {
  indigo: 'https://images.kiwi.com/airlines/64/6E.png',
  '6e': 'https://images.kiwi.com/airlines/64/6E.png',
  'air india': 'https://images.kiwi.com/airlines/64/AI.png',
  ai: 'https://images.kiwi.com/airlines/64/AI.png',
  spicejet: 'https://images.kiwi.com/airlines/64/SG.png',
  sg: 'https://images.kiwi.com/airlines/64/SG.png',
  vistara: 'https://images.kiwi.com/airlines/64/UK.png',
  uk: 'https://images.kiwi.com/airlines/64/UK.png',
  akasa: 'https://images.kiwi.com/airlines/64/QP.png',
  qp: 'https://images.kiwi.com/airlines/64/QP.png',
  airasia: 'https://images.kiwi.com/airlines/64/I5.png',
  i5: 'https://images.kiwi.com/airlines/64/I5.png',
  emirates: 'https://images.kiwi.com/airlines/64/EK.png',
  ek: 'https://images.kiwi.com/airlines/64/EK.png',
  qatar: 'https://images.kiwi.com/airlines/64/QR.png',
  qr: 'https://images.kiwi.com/airlines/64/QR.png',
  singapore: 'https://images.kiwi.com/airlines/64/SQ.png',
  sq: 'https://images.kiwi.com/airlines/64/SQ.png',
  etihad: 'https://images.kiwi.com/airlines/64/EY.png',
  ey: 'https://images.kiwi.com/airlines/64/EY.png',
  lufthansa: 'https://images.kiwi.com/airlines/64/LH.png',
  lh: 'https://images.kiwi.com/airlines/64/LH.png',
  british: 'https://images.kiwi.com/airlines/64/BA.png',
  ba: 'https://images.kiwi.com/airlines/64/BA.png',
}

function resolveAirlineLogo(name: string, code?: string, fallbackLogo?: string): string {
  if (fallbackLogo && !fallbackLogo.includes('placeholder') && !fallbackLogo.includes('wikimedia')) {
    return fallbackLogo
  }
  const lowerName = (name || '').toLowerCase()
  const lowerCode = (code || '').toLowerCase()

  for (const [key, url] of Object.entries(OFFICIAL_AIRLINE_LOGOS)) {
    if (lowerName.includes(key) || (lowerCode && lowerCode === key)) return url
  }
  if (code && code.length === 2) {
    return `https://images.kiwi.com/airlines/64/${code.toUpperCase()}.png`
  }
  return 'https://images.kiwi.com/airlines/64/6E.png'
}

export default function AiFlightCard({
  flight,
  searchParams,
  currency = 'INR',
}: AiFlightCardProps) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [showBaggageDetails, setShowBaggageDetails] = useState(false)

  // Construct Kiwi affiliate link dynamically
  const kiwiUrl = flight.kiwiBookingUrl || buildKiwiAffiliateUrl(flight, searchParams)

  const handleBookWithKiwi = () => {
    window.open(kiwiUrl, '_blank', 'noopener,noreferrer')
  }

  // Format date display (e.g., "Fri, Jul 31")
  const formatDateDisplay = () => {
    if (!flight.departureDate) return 'Flexible Date'
    const d = new Date(flight.departureDate)
    if (isNaN(d.getTime())) return flight.departureDate
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  const logoUrl = resolveAirlineLogo(flight.name, flight.airlineCode, flight.logo)

  return (
    <div className="group bg-white border border-[#E8E0D8] hover:border-[#EA580C] rounded-[20px] p-4 sm:p-5 md:p-6 shadow-xs hover:shadow-xl transition-all duration-300 space-y-3.5 sm:space-y-4 relative overflow-hidden w-full min-w-0 box-border">
      
      {/* Subtle background glow on hover */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100/40 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* ── SECTION 1: AIRLINE & HEADER BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-3.5 border-b border-[#E8E0D8]/80 relative z-10">
        
        {/* Left: Carrier Identity & Emblem */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-white border border-[#E8E0D8] p-1.5 shadow-2xs flex items-center justify-center shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
            <img
              src={logoUrl}
              alt={flight.name}
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.kiwi.com/airlines/64/6E.png'
              }}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="font-black text-[#1A1A1A] text-sm sm:text-base leading-tight font-display flex items-center gap-2 flex-wrap">
              <span className="truncate">{flight.name}</span>
              {flight.airlineCode && (
                <span className="text-[10px] font-black text-[#6B6B6B] uppercase bg-[#FFFBF7] border border-[#E8E0D8] px-1.5 py-0.5 rounded-md tracking-wider shrink-0">
                  {flight.airlineCode}
                </span>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-[#6B6B6B] font-semibold mt-1 flex items-center gap-1.5 flex-wrap">
              <span>{formatDateDisplay()}</span>
              <span className="text-[#E8E0D8]">•</span>
              <span className="text-emerald-600 font-extrabold flex items-center gap-0.5">
                <Zap size={11} /> 98% On-Time
              </span>
            </p>
          </div>
        </div>

        {/* Right: Tag, SageScore & Share/Save Buttons */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-[#E8E0D8]/40">
          <div className="flex items-center gap-2">
            {flight.tag ? (
              <span className="bg-[#EA580C] text-white font-black px-2.5 py-1 rounded-xl text-[10px] uppercase tracking-wider shadow-xs inline-flex items-center gap-1">
                <Award size={12} />
                <span>{flight.tag}</span>
              </span>
            ) : (
              <span className="text-[10px] font-black text-[#EA580C] bg-orange-50/90 border border-orange-200 px-2.5 py-1 rounded-xl uppercase tracking-wider">
                {flight.cabinClass || 'Economy'}
              </span>
            )}

            <SageScoreRing item={flight} size={34} />
          </div>

          <div className="flex items-center gap-1 border-l border-[#E8E0D8]/80 pl-2">
            <button
              type="button"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: `Flight ${flight.name}`, url: kiwiUrl })
                } else {
                  navigator.clipboard.writeText(kiwiUrl)
                }
              }}
              className="p-2 min-h-[44px] min-w-[44px] text-[#9CA3AF] hover:text-[#1A1A1A] rounded-xl hover:bg-[#FFFBF7] border border-transparent hover:border-[#E8E0D8] transition-all cursor-pointer flex items-center justify-center"
              title="Share flight"
            >
              <Share2 size={15} />
            </button>
            <button
              type="button"
              onClick={() => setIsFavorited(!isFavorited)}
              className={`p-2 min-h-[44px] min-w-[44px] rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                isFavorited
                  ? 'text-red-500 bg-red-50 border-red-200'
                  : 'text-[#9CA3AF] hover:text-[#1A1A1A] hover:bg-[#FFFBF7] border-transparent hover:border-[#E8E0D8]'
              }`}
              title="Save flight"
            >
              <Heart size={15} className={isFavorited ? 'fill-current' : ''} />
            </button>
          </div>
        </div>

      </div>

      {/* ── SECTION 2: ROUTE & FLIGHT SCHEDULE TIMELINE ── */}
      <div className="bg-[#FFFBF7]/80 border border-[#E8E0D8]/90 rounded-2xl p-3 sm:p-4 space-y-2 relative z-10 min-w-0">
        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-[#9CA3AF] mb-1">
          <span>Flight Schedule & Track</span>
          <span className="text-[#EA580C]">{flight.stops === 0 ? 'Direct Non-stop' : `${flight.stops} Stop`}</span>
        </div>

        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-1.5 sm:gap-4 min-w-0">
          
          {/* Departure Block */}
          <div className="text-left shrink-0 min-w-[50px] sm:min-w-[75px]">
            <div className="text-base sm:text-2xl md:text-3xl font-black text-[#1A1A1A] leading-none font-display">
              {flight.departureTime}
            </div>
            <div className="text-[10px] sm:text-xs font-black text-[#EA580C] uppercase tracking-wider mt-1.5">
              {flight.origin}
            </div>
          </div>

          {/* Center Visual Timeline */}
          <div className="flex flex-col items-center justify-center px-0.5 sm:px-3 min-w-0">
            {/* Duration Badge */}
            <div className="text-[9px] sm:text-xs font-black text-[#6B6B6B] mb-1 flex items-center gap-1 bg-white border border-[#E8E0D8] px-2 py-0.5 rounded-full shadow-2xs">
              <Clock size={11} className="text-[#EA580C]" />
              <span>{flight.duration}</span>
            </div>

            {/* Line with Plane Node */}
            <div className="relative w-full flex items-center justify-center my-1.5">
              <div className="h-[2px] bg-[#E8E0D8] group-hover:bg-[#EA580C]/40 w-full rounded-full transition-colors" />
              
              {/* Endpoint Dots */}
              <div className="absolute inset-0 flex items-center justify-between">
                <div className="w-2 h-2 rounded-full bg-[#EA580C] ring-2 ring-orange-100" />
                <div className="w-2 h-2 rounded-full bg-[#1A1A1A] ring-2 ring-gray-100" />
              </div>

              {/* Center Plane Circle */}
              <div className="absolute bg-white border border-[#E8E0D8] rounded-full p-0.5 shadow-2xs flex items-center justify-center w-5 h-5 sm:w-7 sm:h-7 z-10">
                <Plane size={11} className="text-[#EA580C]" />
              </div>
            </div>

            {/* Stops / Layover Badge */}
            <div className="text-[9px] sm:text-[11px] font-bold text-center w-full min-w-0">
              {flight.stops === 0 ? (
                <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80 inline-flex items-center gap-1 shadow-2xs">
                  <CheckCircle2 size={10} className="text-emerald-600 shrink-0" />
                  <span>Direct</span>
                </span>
              ) : (
                <span className="bg-amber-50 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200/80 inline-flex items-center gap-1 shadow-2xs max-w-full truncate">
                  <Clock size={10} className="text-amber-700 shrink-0" />
                  <span className="truncate">{flight.stopDetails || `${flight.stops} Stop`}</span>
                </span>
              )}
            </div>
          </div>

          {/* Arrival Block */}
          <div className="text-right shrink-0 min-w-[50px] sm:min-w-[75px]">
            <div className="text-base sm:text-2xl md:text-3xl font-black text-[#1A1A1A] leading-none font-display flex items-start justify-end gap-0.5">
              <span>{flight.arrivalTime}</span>
              {flight.isOvernight && (
                <span className="text-[9px] sm:text-xs font-black text-[#EA580C] -top-1 relative">+1d</span>
              )}
            </div>
            <div className="text-[10px] sm:text-xs font-black text-[#1A1A1A] uppercase tracking-wider mt-1.5">
              {flight.destination}
            </div>
          </div>

        </div>
      </div>

      {/* ── SECTION 3: INCLUDED AMENITIES & BAGGAGE ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 relative z-10 pt-0.5">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowBaggageDetails(!showBaggageDetails)}
            className="flex items-center gap-1.5 cursor-pointer hover:border-[#EA580C]/50 transition-all bg-[#FFFBF7] border border-[#E8E0D8] px-3 py-1.5 rounded-xl text-xs font-bold text-[#6B6B6B] shadow-2xs min-h-[44px]"
          >
            <Briefcase size={13} className="text-[#EA580C]" />
            <span>{flight.cabinBaggage || '1 x 7kg'}</span>
            <span className="text-[#E8E0D8]">•</span>
            <Luggage size={13} className="text-[#EA580C]" />
            <span>{flight.checkedBaggage || '1 x 15kg'}</span>
            <ChevronDown size={12} className={`transition-transform duration-200 ${showBaggageDetails ? 'rotate-180' : ''}`} />
          </button>

          <div className="flex items-center gap-1 text-xs font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200 shadow-2xs min-h-[44px]">
            <Zap size={12} className="text-emerald-600" />
            <span>Instant E-Ticket</span>
          </div>
        </div>
      </div>

      {/* Expandable baggage details popup */}
      {showBaggageDetails && (
        <div className="p-3 bg-[#FFFBF7] border border-[#E8E0D8] rounded-2xl text-xs space-y-1.5 animate-fade-in relative z-10 shadow-inner">
          <div className="font-extrabold text-[#1A1A1A] font-display text-xs">Included Baggage Allowance</div>
          <div className="text-[#6B6B6B] font-medium flex items-center gap-2">
            <Briefcase size={13} className="text-[#EA580C]" />
            <span>Cabin Bag: {flight.cabinBaggage || '1 x 7kg personal item / overhead bag'}</span>
          </div>
          <div className="text-[#6B6B6B] font-medium flex items-center gap-2">
            <Luggage size={13} className="text-[#EA580C]" />
            <span>Check-in Luggage: {flight.checkedBaggage || '1 x 15kg checked baggage'}</span>
          </div>
        </div>
      )}

      {/* ── SECTION 4: PRICING & BOOKING CTA FOOTER ── */}
      <div className="pt-3 border-t border-[#E8E0D8]/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 relative z-10">
        <div className="text-left">
          <div className="text-xl sm:text-3xl font-black text-[#1A1A1A] leading-none font-display">
            {formatPrice(flight.perPassengerPrice || flight.price, currency)}
          </div>
          <p className="text-[11px] text-[#6B6B6B] font-semibold mt-1">
            per passenger
            {flight.totalPrice && (flight.passengers ?? 1) > 1 && (
              <span className="text-[#EA580C] font-bold block sm:inline sm:ml-1">
                ({formatPrice(flight.totalPrice, currency)} total for {flight.passengers} passengers)
              </span>
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={handleBookWithKiwi}
          className="w-full sm:w-auto px-6 py-3 min-h-[48px] bg-[#EA580C] hover:bg-[#C2410C] text-white font-black text-xs sm:text-sm rounded-2xl shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 active:scale-95"
        >
          <span>Book with Kiwi</span>
          <ExternalLink size={14} />
        </button>
      </div>

    </div>
  )
}

