'use client'

import React from 'react'
import { Train, ExternalLink, Clock, ShieldCheck } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'
import { useAuthStore } from '@/store/authStore'
import { formatPrice } from '@/lib/currency'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { buildIrctcDeepLink } from '@/lib/smartTrainPlanner'

export interface ClassAvailability {
  class: string
  className: string
  available: boolean
  price?: number
  availability?: string
}

export interface TrainResult {
  trainNumber: string
  trainName: string
  departure: string
  arrival: string
  duration: string
  runsOn?: string[]
  availableClasses: ClassAvailability[]
  bookingUrl: string
  originCode: string
  destinationCode: string
}

interface TrainCardProps {
  train: TrainResult
}

const CLASS_LABELS: Record<string, string> = {
  SL: 'Sleeper',
  '3A': 'AC 3 Tier',
  '2A': 'AC 2 Tier',
  '1A': 'First AC',
  CC: 'Chair Car',
  EC: 'Exec. Chair',
  '2S': '2nd Sitting',
}

export function TrainCard({ train }: TrainCardProps) {
  const { user } = useAuthStore()
  const currency = user?.currency ?? 'INR'
  const { requireAuth } = useRequireAuth()

  const handleBook = requireAuth((e?: React.MouseEvent) => {
    trackEvent('booking_click', {
      type: 'train',
      trainNumber: train.trainNumber,
      trainName: train.trainName,
      url: train.bookingUrl,
    })
    const url = (train.bookingUrl && !train.bookingUrl.includes('makemytrip.com'))
      ? train.bookingUrl
      : buildIrctcDeepLink({ srcStn: train.originCode, destStn: train.destinationCode })
    window.open(url, '_blank', 'noopener,noreferrer')
  })

  // Helper to determine availability badge styles
  const getAvailabilityBadge = (cls: ClassAvailability) => {
    if (!cls.availability) return null
    const status = cls.availability.toUpperCase()
    if (status.includes('AVAILABLE') || status.includes('AVBL')) {
      return (
        <span className="text-[8px] font-extrabold bg-emerald-500/10 text-emerald-600 px-1 py-0.2 rounded uppercase tracking-wider">
          Avbl
        </span>
      )
    }
    if (status.includes('WL')) {
      return (
        <span className="text-[8px] font-extrabold bg-amber-500/10 text-amber-600 px-1 py-0.2 rounded uppercase tracking-wider">
          WL
        </span>
      )
    }
    if (status.includes('RAC')) {
      return (
        <span className="text-[8px] font-extrabold bg-blue-500/10 text-blue-600 px-1 py-0.2 rounded uppercase tracking-wider">
          RAC
        </span>
      )
    }
    return null
  }

  const runsText = Array.isArray(train.runsOn)
    ? train.runsOn.join(' · ')
    : (train.runsOn || 'Daily')

  return (
    <div className="group bg-white border border-[#E8E0D8] hover:border-[#EA580C] transition-all duration-300 hover:shadow-xl rounded-[20px] p-4 sm:p-5 md:p-6 flex flex-col gap-3 md:gap-4 relative overflow-hidden text-left w-full min-w-0 box-border">
      {/* Background hover accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100/30 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* Header Row - Fully Responsive & Mobile Clean */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 relative z-10">
        <div className="flex items-center gap-2.5 min-w-0 w-full sm:w-auto">
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#EA580C] shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
            <Train size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-extrabold text-[#1A1A1A] text-sm md:text-base leading-tight truncate font-display">
              {train.trainName}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span className="text-[10px] md:text-xs font-black text-[#EA580C] bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200 shrink-0">
                #{train.trainNumber}
              </span>
              <span className="text-[10px] md:text-xs text-[#6B6B6B] font-medium truncate">IRCTC Express</span>
            </div>
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto text-right border-t sm:border-t-0 border-[#E8E0D8]/60 pt-1.5 sm:pt-0">
          <span className="text-[9px] font-black text-[#9CA3AF] uppercase tracking-wider block">Runs On</span>
          <span className="text-[11px] md:text-xs font-bold text-[#1A1A1A] truncate max-w-[180px] sm:max-w-none">
            {runsText}
          </span>
        </div>
      </div>

      {/* Timeline Row */}
      <div className="flex items-center justify-between bg-[#FFFBF7] border border-[#E8E0D8] p-3 md:p-4 rounded-2xl relative my-0.5 text-xs z-10 min-w-0">
        <div className="text-left shrink-0 min-w-[50px]">
          <div className="font-black text-base md:text-xl text-[#1A1A1A] tracking-tight font-display leading-none">
            {train.departure || '08:00'}
          </div>
          <div className="font-extrabold text-[10px] md:text-xs text-[#EA580C] uppercase tracking-wider mt-1">
            {train.originCode || 'DEP'}
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center px-1 sm:px-2 min-w-0">
          <span className="text-[9px] md:text-[11px] font-extrabold text-[#6B6B6B] mb-1 flex items-center gap-1">
            <Clock size={11} className="text-[#EA580C] shrink-0" />
            <span>{train.duration || '6h 30m'}</span>
          </span>
          <div className="w-full flex items-center justify-center relative">
            <div className="h-[2px] bg-[#E8E0D8] group-hover:bg-[#EA580C]/40 w-full rounded-full transition-colors" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 text-[#EA580C] font-mono text-[9px] bg-white rounded-full px-0.5 border border-[#E8E0D8]">›</div>
          </div>
        </div>

        <div className="text-right shrink-0 min-w-[50px]">
          <div className="font-black text-base md:text-xl text-[#1A1A1A] tracking-tight font-display leading-none">
            {train.arrival || '14:30'}
          </div>
          <div className="font-extrabold text-[10px] md:text-xs text-[#1A1A1A] uppercase tracking-wider mt-1">
            {train.destinationCode || 'ARR'}
          </div>
        </div>
      </div>

      {/* Available Classes Grid & Booking CTA */}
      <div className="flex flex-col space-y-3 pt-2 border-t border-[#E8E0D8]/80 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
          {(Array.isArray(train.availableClasses) ? train.availableClasses : []).map((cls) => (
            <div
              key={cls.class}
              className={`flex flex-col justify-between p-2 md:p-2.5 rounded-xl border text-left transition-all duration-200 min-h-[52px] ${
                cls.available
                  ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900 shadow-2xs'
                  : 'bg-[#FFFBF7] border-[#E8E0D8] text-[#6B6B6B]'
              }`}
            >
              <div className="flex items-center justify-between w-full gap-1">
                <span className="text-[9px] md:text-[10px] font-black uppercase truncate">
                  {CLASS_LABELS[cls.class] ?? cls.class}
                </span>
                {getAvailabilityBadge(cls)}
              </div>
              <span className="text-[11px] md:text-xs font-black font-mono mt-1 text-[#1A1A1A]">
                {cls.price ? formatPrice(cls.price, currency) : '—'}
              </span>
            </div>
          ))}
        </div>

        <a
          href="#"
          onClick={(e) => {
            e.preventDefault()
            handleBook(e)
          }}
          className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-extrabold text-xs md:text-sm bg-[#EA580C] hover:bg-[#C2410C] text-white transition-all shadow-md active:scale-98 cursor-pointer sm:ml-auto"
        >
          <span>Book on IRCTC</span>
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  )
}
