'use client'

import React, { useState } from 'react'
import { Clock, Star, MapPin, ChevronDown, ChevronUp, ExternalLink, Shield, Share2 } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'
import { formatPrice } from '@/lib/currency'
import { useAuthStore } from '@/store/authStore'
import { handleUniversalShare } from '../plan/TransportTab'
import { buildIrctcDeepLink } from '@/lib/smartTrainPlanner'

interface TrainClassFare {
  classCode: string
  className: string
  fare: number
  availability?: 'AVAILABLE' | 'RAC' | 'WL' | null
}

interface TrainCardProps {
  train: {
    id: string
    trainNumber: string
    trainName: string
    trainType: string
    originStation: string
    originCode: string
    destinationStation: string
    destinationCode: string
    departureTime: string
    arrivalTime: string
    duration: string
    price: number
    travelClass: string
    classes?: TrainClassFare[]
    runsOn?: string[]
    lastUpdated?: string
    aiRecommendation?: {
      badge?: string
      reason?: string
      score?: number
      reasons?: string[]
    }
    bookingUrl: string
    transfers?: number
  }
}

const ALL_WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function TrainCard({ train }: TrainCardProps) {
  const [expanded, setExpanded] = useState(false)
  const currency = useAuthStore((state) => state.user?.currency || 'INR')

  // Manage which class is selected for booking
  const classesList = train.classes || []
  const [selectedClass, setSelectedClass] = useState<TrainClassFare | null>(
    classesList.length > 0
      ? (classesList.find((c) => c.classCode === train.travelClass) || classesList[0])
      : null
  )

  const activePrice = selectedClass ? selectedClass.fare : train.price
  const activeClassCode = selectedClass ? selectedClass.classCode : train.travelClass

  const handleBookClick = () => {
    trackEvent('booking_click', {
      type: 'train',
      trainNumber: train.trainNumber,
      trainName: train.trainName,
      class: activeClassCode,
      price: activePrice,
    })
    const irctcUrl = (train.bookingUrl && !train.bookingUrl.includes('makemytrip.com'))
      ? train.bookingUrl
      : buildIrctcDeepLink({
          srcStn: train.originCode,
          destStn: train.destinationCode,
          journeyClass: activeClassCode,
        })
    window.open(irctcUrl, '_blank', 'noopener,noreferrer')
  }

  const hasAiBadge = train.aiRecommendation && train.aiRecommendation.badge

  // Helper to check if train runs on a specific day
  const runsOnDay = (day: string) => {
    if (!train.runsOn) return true
    return train.runsOn.includes(day)
  }

  return (
    <div className="card overflow-hidden border border-slate-200/80 hover:border-[var(--primary)] transition-all duration-300 hover:shadow-md flex flex-col bg-white rounded-2xl">
      {/* AI Recommendation Banner */}
      {hasAiBadge && (
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border-b border-amber-500/10 px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Star size={14} className="text-amber-500 fill-amber-500" />
            <span className="text-xs font-black text-amber-700 tracking-wide uppercase">
              {train.aiRecommendation?.badge || 'AI Recommended'}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 justify-end">
            {train.aiRecommendation?.reasons?.map((reason: string, idx: number) => (
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

      {/* Main Row: Google Flights Layout */}
      <div 
        onClick={() => setExpanded(!expanded)}
        className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
      >
        {/* Left Col: Train Info & Times */}
        <div className="flex items-center gap-4 flex-1">
          {/* Logo/Icon */}
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex flex-col items-center justify-center border border-orange-100 flex-shrink-0">
            <span className="text-[10px] font-black text-orange-600 leading-none">IRCTC</span>
            <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{train.trainType}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-2 flex-1">
            {/* Timeline Departure / Arrival */}
            <div className="col-span-2 flex items-center gap-4">
              <div className="text-left">
                <div className="font-black text-lg text-slate-800 tracking-tight leading-none">
                  {train.departureTime}
                </div>
                <div className="text-[11px] font-bold text-slate-500 mt-1">
                  {train.originCode} &bull; {train.originStation.split(',')[0]}
                </div>
              </div>

              {/* Progress Line */}
              <div className="flex-1 flex flex-col items-center px-2">
                <span className="text-[10px] font-bold text-slate-400 mb-1 flex items-center gap-1">
                  <Clock size={10} />
                  {train.duration}
                </span>
                <div className="w-full flex items-center justify-center relative">
                  <div className="h-[2px] bg-slate-200 w-full rounded-full"></div>
                  <div className="absolute w-2 h-2 rounded-full bg-orange-500 border border-white"></div>
                </div>
                <span className="text-[9px] font-bold text-slate-400 mt-1 tracking-wider">
                  {train.transfers === 0 || !train.transfers ? 'Non-stop' : `${train.transfers} stops`}
                </span>
              </div>

              <div className="text-left">
                <div className="font-black text-lg text-slate-800 tracking-tight leading-none">
                  {train.arrivalTime}
                </div>
                <div className="text-[11px] font-bold text-slate-500 mt-1">
                  {train.destinationCode} &bull; {train.destinationStation.split(',')[0]}
                </div>
              </div>
            </div>

            {/* Train details */}
            <div className="flex flex-col justify-center">
              <h4 className="font-extrabold text-slate-800 text-sm leading-tight line-clamp-1">
                {train.trainName}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Train #{train.trainNumber}
              </p>
            </div>
          </div>
        </div>

        {/* Right Col: Price & Action */}
        <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
          <div className="text-left md:text-right">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
              From ({activeClassCode})
            </span>
            <div className="font-black text-xl text-slate-800 tracking-tight">
              {formatPrice(activePrice, currency)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
              {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Content Details */}
      {expanded && (
        <div className="bg-slate-50/50 border-t border-slate-100 p-5 space-y-5 animate-fade-in text-xs text-slate-600">
          {/* Top segment: Detailed Route & Running Days */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Route Map */}
            <div>
              <h5 className="font-extrabold text-slate-700 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin size={13} className="text-orange-500" /> Route & Stations
              </h5>
              <div className="relative pl-4 border-l-2 border-slate-200 space-y-4 ml-1.5 mt-2">
                <div className="relative">
                  <span className="absolute -left-[21.5px] top-1 w-2.5 h-2.5 rounded-full bg-slate-300 border-2 border-white"></span>
                  <div className="font-bold text-slate-800 flex justify-between">
                    <span>{train.originStation} ({train.originCode})</span>
                    <span className="font-mono text-slate-500">{train.departureTime}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Origin Departure</p>
                </div>
                <div className="relative">
                  <span className="absolute -left-[21.5px] top-1 w-2.5 h-2.5 rounded-full bg-orange-50 border-2 border-white"></span>
                  <div className="font-bold text-slate-700 flex justify-between">
                    <span>Direct Express Service</span>
                    <span className="font-mono text-slate-500">{train.duration} duration</span>
                  </div>
                </div>
                <div className="relative">
                  <span className="absolute -left-[21.5px] top-1 w-2.5 h-2.5 rounded-full bg-slate-400 border-2 border-white"></span>
                  <div className="font-bold text-slate-800 flex justify-between">
                    <span>{train.destinationStation} ({train.destinationCode})</span>
                    <span className="font-mono text-slate-500">{train.arrivalTime}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Destination Arrival</p>
                </div>
              </div>
            </div>

            {/* Running Days */}
            <div className="flex flex-col justify-between">
              <div>
                <h5 className="font-extrabold text-slate-700 mb-3 uppercase tracking-wider">
                  Weekly Schedule / Running Days
                </h5>
                <div className="flex gap-1.5 mt-2">
                  {ALL_WEEKDAYS.map((day) => {
                    const active = runsOnDay(day)
                    return (
                      <div
                        key={day}
                        className={`min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center font-bold text-xs border transition-all ${
                          active
                            ? 'bg-orange-500/10 text-orange-700 border-orange-200'
                            : 'bg-slate-100 text-slate-300 border-slate-200'
                        }`}
                        title={active ? `Runs on ${day}` : `Does not run on ${day}`}
                      >
                        {day[0]}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200/60 mt-4 flex items-center gap-2">
                <Shield size={16} className="text-green-600 flex-shrink-0" />
                <span className="text-[10px] font-medium text-slate-500">
                  Bookings are routed through IRCTC credentials on partner platforms.
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Segment: Interactive Class Fare Selection Grid */}
          <div className="border-t border-slate-200/60 pt-4">
            <h5 className="font-extrabold text-slate-700 mb-3 uppercase tracking-wider">
              Available Classes & Fares
            </h5>
            {classesList.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {classesList.map((cls) => {
                  const isSelected = selectedClass?.classCode === cls.classCode
                  return (
                    <div
                      key={cls.classCode}
                      onClick={() => setSelectedClass(cls)}
                      className={`cursor-pointer p-3 rounded-xl border transition-all flex flex-col justify-between gap-1.5 text-center ${
                        isSelected
                          ? 'bg-orange-500/10 border-orange-500 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="font-black text-sm text-slate-800 leading-none">
                          {cls.classCode}
                        </div>
                        <div className="text-[10px] text-slate-400 font-semibold mt-1">
                          {cls.className}
                        </div>
                      </div>
                      <div>
                        <div className="font-extrabold text-xs text-orange-600">
                          {formatPrice(cls.fare, currency)}
                        </div>
                        {cls.availability && (
                          <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-1.5 ${
                            cls.availability === 'AVAILABLE'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {cls.availability}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-slate-400 italic">No class details available for this train.</p>
            )}
          </div>

          {/* Booking CTA Bar */}
          <div className="flex items-center justify-between border-t border-slate-200/60 pt-4 mt-2">
            <div className="text-slate-400 text-[10px]">
              Last Checked: {train.lastUpdated ? new Date(train.lastUpdated).toLocaleTimeString() : new Date().toLocaleTimeString()} &bull; Official IRCTC Railways
            </div>
            <div className="flex gap-2.5 items-center">
              <button
                onClick={handleBookClick}
                className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl font-bold text-sm bg-[#001E62] hover:bg-[#00174c] text-white transition-all shadow-lg shadow-blue-900/10 cursor-pointer animate-fade-in active:scale-95"
              >
                Book {activeClassCode} on IRCTC <ExternalLink size={14} />
              </button>

              <button
                onClick={() => handleUniversalShare({
                  name: `${train.trainNumber} - ${train.trainName}`,
                  price: activePrice,
                  departure: train.departureTime,
                  arrival: train.arrivalTime,
                  duration: train.duration,
                  bookingLink: train.bookingUrl
                })}
                title="Share option"
                className="h-[46px] w-[46px] border border-[#E8E0D8] hover:border-[#D0C8C0] text-[#6B6B6B] hover:bg-[#F5F5F4] rounded-xl flex items-center justify-center transition-all shrink-0 active:scale-95 cursor-pointer"
              >
                <Share2 size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
