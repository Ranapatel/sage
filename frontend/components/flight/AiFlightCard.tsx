'use client'

import React, { useState } from 'react'
import {
  Share2, Heart, Sparkles, ExternalLink, Luggage,
  Briefcase, Info, Clock, ArrowRight, ShieldCheck, ChevronDown
} from 'lucide-react'
import { formatPrice } from '@/lib/currency'
import { buildKiwiAffiliateUrl, KiwiFlightParams } from '@/lib/kiwiAffiliate'

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

export default function AiFlightCard({
  flight,
  searchParams,
  currency = 'INR',
}: AiFlightCardProps) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [showDisclaimerTooltip, setShowDisclaimerTooltip] = useState(false)
  const [showBaggageDetails, setShowBaggageDetails] = useState(false)

  // Construct Kiwi affiliate link dynamically
  const kiwiUrl = flight.kiwiBookingUrl || buildKiwiAffiliateUrl(flight, searchParams)

  const handleBookWithKiwi = () => {
    window.open(kiwiUrl, '_blank', 'noopener,noreferrer')
  }

  // Format date display (e.g., "Sat 17 Oct")
  const formatDateDisplay = () => {
    if (!flight.departureDate) return 'Flexible Date'
    const d = new Date(flight.departureDate)
    if (isNaN(d.getTime())) return flight.departureDate
    return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  const confidenceScore = flight.aiConfidenceScore || 92

  return (
    <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 relative group flex flex-col md:flex-row items-stretch">
      
      {/* ── LEFT CONTAINER: Flight Details ── */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800/80">
        
        {/* Date header & Tag */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
          <span>{formatDateDisplay()}</span>
          {flight.tag && (
            <span className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider">
              {flight.tag}
            </span>
          )}
        </div>

        {/* Departure -> Route Timeline -> Arrival */}
        <div className="flex items-center justify-between gap-4">
          
          {/* Departure block */}
          <div className="text-left shrink-0">
            <div className="text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-none">
              {flight.departureTime}
            </div>
            <div className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
              {flight.origin}
            </div>
          </div>

          {/* Center Timeline Visual */}
          <div className="flex-1 flex flex-col items-center px-2">
            <div className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              {flight.duration}
            </div>

            {/* Line with Airline Logo */}
            <div className="relative w-full flex items-center justify-center my-1">
              <div className="h-[2px] bg-slate-200 dark:bg-slate-800 w-full rounded-full" />
              
              {/* Airline Logo in Center */}
              <div className="absolute bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full p-1 shadow-xs flex items-center justify-center w-7 h-7">
                {flight.logo ? (
                  <img
                    src={flight.logo}
                    alt={flight.name}
                    className="w-5 h-5 object-contain rounded-full"
                    onError={(e) => {
                      // Fallback text if logo image fails
                      (e.target as HTMLElement).style.display = 'none'
                    }}
                  />
                ) : (
                  <span className="text-[10px] font-black text-orange-500 uppercase">
                    {flight.airlineCode || flight.name.slice(0, 2)}
                  </span>
                )}
              </div>
            </div>

            {/* Stops & Layover Info */}
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 text-center">
              {flight.stops === 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Direct</span>
              ) : (
                <span className="underline underline-offset-2 decoration-slate-300 dark:decoration-slate-700">
                  {flight.stopDetails || `${flight.stops} stop • ${flight.layoverCities?.join(', ') || ''}`}
                </span>
              )}
            </div>
          </div>

          {/* Arrival block */}
          <div className="text-right shrink-0">
            <div className="text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-none flex items-start justify-end gap-0.5">
              <span>{flight.arrivalTime}</span>
              {flight.isOvernight && (
                <span className="text-xs font-extrabold text-orange-500 -top-1 relative">+1</span>
              )}
            </div>
            <div className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
              {flight.destination}
            </div>
          </div>

        </div>

        {/* Baggage info row */}
        <div className="flex items-center gap-3 pt-2 text-xs font-medium text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-900/60">
          <div
            onClick={() => setShowBaggageDetails(!showBaggageDetails)}
            className="flex items-center gap-2 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
          >
            <span className="flex items-center gap-1">
              <Briefcase size={13} className="text-slate-400" />
              <span>{flight.cabinBaggage || '1 x 7kg'}</span>
            </span>
            <span className="flex items-center gap-1">
              <Luggage size={13} className="text-slate-400" />
              <span>{flight.checkedBaggage || '1 x 20kg'}</span>
            </span>
            <ChevronDown size={12} className={`transition-transform ${showBaggageDetails ? 'rotate-180' : ''}`} />
          </div>

          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {flight.cabinClass || 'Economy'}
          </span>
        </div>

        {/* Expandable baggage details popup */}
        {showBaggageDetails && (
          <div className="p-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs space-y-1">
            <div className="font-bold text-slate-800 dark:text-slate-200">Included Baggage Allowance</div>
            <div className="text-slate-600 dark:text-slate-400">Cabin: {flight.cabinBaggage || '1 x 7kg personal item / cabin bag'}</div>
            <div className="text-slate-600 dark:text-slate-400">Checked: {flight.checkedBaggage || '1 x 20kg checked baggage'}</div>
          </div>
        )}

      </div>

      {/* ── RIGHT CONTAINER: Pricing & Action ── */}
      <div className="p-5 w-full md:w-56 shrink-0 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col justify-between items-end space-y-4">
        
        {/* Action icons: Share & Heart */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: `Flight ${flight.name}`, url: kiwiUrl })
              } else {
                navigator.clipboard.writeText(kiwiUrl)
              }
            }}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
            title="Share flight"
          >
            <Share2 size={16} />
          </button>
          <button
            type="button"
            onClick={() => setIsFavorited(!isFavorited)}
            className={`p-1.5 rounded-full transition-colors ${
              isFavorited ? 'text-red-500 bg-red-50 dark:bg-red-950/30' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800'
            }`}
            title="Save flight"
          >
            <Heart size={16} className={isFavorited ? 'fill-current' : ''} />
          </button>
        </div>

        {/* Pricing & AI Estimation Badge */}
        <div className="text-right space-y-1.5 w-full">
          {/* Price display */}
          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {formatPrice(flight.perPassengerPrice || flight.price, currency)}
          </div>
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            per person
            {flight.totalPrice && (flight.passengers ?? 1) > 1 && (
              <span className="block text-[10px] font-bold text-orange-600 dark:text-orange-400">
                ({formatPrice(flight.totalPrice, currency)} total for {flight.passengers} travelers)
              </span>
            )}
          </div>

          {/* AI Estimated Pill & Tooltip */}
          <div className="relative flex justify-end items-center gap-1.5">
            <div
              onMouseEnter={() => setShowDisclaimerTooltip(true)}
              onMouseLeave={() => setShowDisclaimerTooltip(false)}
              onClick={() => setShowDisclaimerTooltip(!showDisclaimerTooltip)}
              className="inline-flex items-center gap-1 bg-purple-100 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-extrabold text-[10px] px-2 py-0.5 rounded-full cursor-help shadow-2xs"
            >
              <Sparkles size={10} className="text-purple-500" />
              <span>AI Estimated • {confidenceScore}%</span>
              <Info size={10} className="text-purple-400" />
            </div>

            {/* Hover disclaimer tooltip */}
            {showDisclaimerTooltip && (
              <div className="absolute right-0 bottom-full mb-2 w-64 p-2.5 bg-slate-900 text-white text-[11px] rounded-xl shadow-xl z-30 leading-normal border border-slate-800">
                <p className="font-bold text-orange-400 mb-0.5">AI Price Estimation</p>
                {flight.disclaimer || 'Prices are estimated and may differ from the final booking price.'}
              </div>
            )}
          </div>
        </div>

        {/* Primary CTA: Book with Kiwi */}
        <button
          type="button"
          onClick={handleBookWithKiwi}
          className="w-full bg-[#00A698] hover:bg-[#008f83] text-white font-extrabold py-3 px-4 rounded-xl text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group/btn"
        >
          <span>Book with Kiwi</span>
          <ExternalLink size={15} className="group-hover/btn:translate-x-0.5 transition-transform" />
        </button>

      </div>

    </div>
  )
}
