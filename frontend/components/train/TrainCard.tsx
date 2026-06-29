'use client'

import React, { useState } from 'react'
import { Star, Calendar, Clock, ArrowRight, ChevronDown, ChevronUp, ExternalLink, MapPin, Shield } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'
import BookingButton from '../BookingButton'
import { useTripStore } from '@/store/tripStore'

interface TrainCardProps {
  train: any
}

export default function TrainCard({ train }: TrainCardProps) {
  const [expanded, setExpanded] = useState(false)
  const { trainSearchUrl } = useTripStore()

  const handleBookClick = () => {
    trackEvent('booking_click', {
      type: 'train',
      trainNumber: train.trainNumber,
      trainName: train.trainName,
      price: train.price,
    })
  }

  // Format price in Indian Rupees
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(train.price)

  const hasAiBadge = train.aiRecommendation && train.aiRecommendation.badge

  return (
    <div className="card overflow-hidden border border-slate-200/60 hover:border-[var(--primary)] transition-all duration-300 hover:shadow-md flex flex-col bg-white">
      {/* AI Recommendation Banner */}
      {hasAiBadge && (
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border-b border-amber-500/10 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Star size={14} className="text-amber-500 fill-amber-500" />
            <span className="text-xs font-black text-amber-700 tracking-wide">
              AI Recommended
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 justify-end">
            {train.aiRecommendation.reasons.map((reason: string, idx: number) => (
              <span
                key={idx}
                className="text-[10px] font-bold bg-amber-500/15 text-amber-800 px-2 py-0.5 rounded-full"
              >
                {reason}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Card Header & Main Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-start gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                {train.trainNumber}
              </span>
              <span className="text-xs font-extrabold text-[var(--primary)] uppercase tracking-wider">
                {train.trainType}
              </span>
            </div>
            <h4 className="font-extrabold text-[var(--text-primary)] text-lg mt-1">
              {train.trainName}
            </h4>
          </div>

          <div className="text-right">
            <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-orange-700 bg-orange-500/10 border border-orange-200/60 px-2 py-0.5 rounded-md mb-1.5">
              <Shield size={9} className="text-orange-600" />
              Indian Railways (IRCTC)
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Live Fare ({train.travelClass})
            </span>
            <div className="font-black text-2xl text-[var(--text-primary)] tracking-tight">
              {formattedPrice}
            </div>
          </div>
        </div>

        {/* Journey Timeline */}
        <div className="flex items-center justify-between bg-slate-50/50 border border-slate-100 p-4 rounded-2xl mb-4 relative">
          <div className="text-left w-[30%]">
            <div className="font-black text-xl text-[var(--text-primary)] tracking-tight">
              {train.departureTime}
            </div>
            <div className="font-extrabold text-xs text-slate-700 mt-1 uppercase truncate">
              {train.originCode}
            </div>
            <div className="text-[10px] text-[var(--text-muted)] truncate max-w-full">
              {train.originStation}
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center px-4 relative">
            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mb-1">
              <Clock size={10} />
              {train.duration}
            </span>
            <div className="w-full flex items-center justify-center relative">
              <div className="h-0.5 bg-slate-300 w-full rounded-full"></div>
              <div className="absolute w-2 h-2 rounded-full bg-[var(--primary)] shadow-sm"></div>
            </div>
            <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
              {train.transfers === 0 ? 'Direct Route' : `${train.transfers} stops`}
            </span>
          </div>

          <div className="text-right w-[30%]">
            <div className="font-black text-xl text-[var(--text-primary)] tracking-tight">
              {train.arrivalTime}
            </div>
            <div className="font-extrabold text-xs text-slate-700 mt-1 uppercase truncate">
              {train.destinationCode}
            </div>
            <div className="text-[10px] text-[var(--text-muted)] truncate max-w-full">
              {train.destinationStation}
            </div>
          </div>
        </div>

        {/* Action Row */}
        <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-[var(--primary)] transition-colors py-2 px-3 hover:bg-slate-50 rounded-xl"
          >
            {expanded ? (
              <>
                <ChevronUp size={14} /> Hide Details
              </>
            ) : (
              <>
                <ChevronDown size={14} /> View Details
              </>
            )}
          </button>

          <BookingButton
            label="Book on MakeMyTrip"
            icon="train"
            url={train.bookingUrl || trainSearchUrl || ''}
            provider="makemytrip"
            className="flex-1"
          />
        </div>
      </div>

      {/* Expandable Route Information */}
      {expanded && (
        <div className="bg-slate-50/50 border-t border-slate-100 p-4 text-xs text-slate-600 space-y-4 animate-fade-in">
          <div>
            <h5 className="font-extrabold text-[var(--text-primary)] mb-2 uppercase tracking-wide flex items-center gap-1">
              <MapPin size={12} className="text-[var(--primary)]" /> Detailed Route Information
            </h5>
            <div className="relative pl-4 border-l-2 border-slate-200 space-y-4 ml-1 mt-3">
              {/* Origin station */}
              <div className="relative">
                <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-slate-300 border-2 border-white"></span>
                <div className="font-bold text-[var(--text-primary)] flex items-center justify-between">
                  <span>{train.originStation} ({train.originCode})</span>
                  <span className="font-mono text-slate-500">{train.departureTime}</span>
                </div>
                <p className="text-[10px] text-slate-400">Journey start station</p>
              </div>

              {/* Transit Details */}
              <div className="relative">
                <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-[var(--primary)] border-2 border-white"></span>
                <div className="font-bold text-slate-700 flex items-center justify-between">
                  <span>Direct Express Transit</span>
                  <span className="font-mono text-slate-500">{train.duration} duration</span>
                </div>
                <p className="text-[10px] text-slate-400">Class: {train.travelClass} | Quota: General (GN)</p>
              </div>

              {/* Destination station */}
              <div className="relative">
                <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-slate-400 border-2 border-white"></span>
                <div className="font-bold text-[var(--text-primary)] flex items-center justify-between">
                  <span>{train.destinationStation} ({train.destinationCode})</span>
                  <span className="font-mono text-slate-500">{train.arrivalTime}</span>
                </div>
                <p className="text-[10px] text-slate-400">Journey arrival destination</p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-200/60 pt-2.5">
            <span>Last Updated: {new Date(train.lastUpdated).toLocaleString()}</span>
            <span>Provider: Indian Railways (IRCTC)</span>
          </div>
        </div>
      )}
    </div>
  )
}
