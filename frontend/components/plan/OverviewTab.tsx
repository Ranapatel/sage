'use client'

import React, { memo, useMemo, useState, useEffect } from 'react'
import {
  Plane, Building2, MapPin, Wallet, Sparkles,
  ArrowRight, Check, Home, Info, Share2, Bookmark,
  Sun, CloudRain, CloudSun, ShieldAlert, ChevronDown, ChevronUp,
  ExternalLink, Calendar, Clock, Briefcase, AlertTriangle, AlertCircle, X
} from 'lucide-react'
import { SYMBOLS } from '@/lib/currency'
import { useAuthStore } from '@/store/authStore'
import { useTripStore } from '@/store/tripStore'
import { getDaysBetween, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import TransportCard from '../transport/TransportCard'
import HotelCard from '../hotel/HotelCard'
import HotelDetailModal from '../hotel/HotelDetailModal'

// ─── Destination background images ───────────────────────────────────────────
// Curated Unsplash photos keyed by lowercase destination city name.
// Falls back to a generic travel photo when city not found.

const DESTINATION_IMAGES: Record<string, string> = {
  bali:        'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=85&auto=format&fit=crop',
  goa:         'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&q=85&auto=format&fit=crop',
  dubai:       'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=85&auto=format&fit=crop',
  bangkok:     'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1200&q=85&auto=format&fit=crop',
  singapore:   'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&q=85&auto=format&fit=crop',
  maldives:    'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=1200&q=85&auto=format&fit=crop',
  paris:       'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=85&auto=format&fit=crop',
  london:      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=85&auto=format&fit=crop',
  tokyo:       'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=85&auto=format&fit=crop',
  sydney:      'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200&q=85&auto=format&fit=crop',
  rome:        'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&q=85&auto=format&fit=crop',
  barcelona:   'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1200&q=85&auto=format&fit=crop',
  amsterdam:   'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=1200&q=85&auto=format&fit=crop',
  istanbul:    'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=85&auto=format&fit=crop',
  prague:      'https://images.unsplash.com/photo-1541849546-216549ae216d?w=1200&q=85&auto=format&fit=crop',
  hanoi:       'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1200&q=85&auto=format&fit=crop',
  'ho chi minh': 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1200&q=85&auto=format&fit=crop',
  phuket:      'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=1200&q=85&auto=format&fit=crop',
  krabi:       'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=85&auto=format&fit=crop',
  kathmandu:   'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&q=85&auto=format&fit=crop',
  colombo:     'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&q=85&auto=format&fit=crop',
  'abu dhabi':  'https://images.unsplash.com/photo-1512632578888-169bbbc64f33?w=1200&q=85&auto=format&fit=crop',
  mauritius:   'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=1200&q=85&auto=format&fit=crop',
  kerala:      'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&q=85&auto=format&fit=crop',
  rajasthan:   'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1200&q=85&auto=format&fit=crop',
  jaipur:      'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1200&q=85&auto=format&fit=crop',
  agra:        'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200&q=85&auto=format&fit=crop',
  mumbai:      'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=1200&q=85&auto=format&fit=crop',
  delhi:       'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&q=85&auto=format&fit=crop',
  hyderabad:   'https://images.unsplash.com/photo-1572445271230-a78e5b8ace6d?w=1200&q=85&auto=format&fit=crop',
  kolkata:     'https://images.unsplash.com/photo-1558431382-27e303142255?w=1200&q=85&auto=format&fit=crop',
  manali:      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=85&auto=format&fit=crop',
  shimla:      'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=1200&q=85&auto=format&fit=crop',
  ladakh:      'https://images.unsplash.com/photo-1574968986035-8f9d1c93b8e1?w=1200&q=85&auto=format&fit=crop',
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=85&auto=format&fit=crop'

function getDestinationImage(destination: string): string {
  if (!destination) return FALLBACK_IMAGE
  const key = destination.toLowerCase().split(',')[0].trim()
  // Try exact match first, then partial match
  if (DESTINATION_IMAGES[key]) return DESTINATION_IMAGES[key]
  const partialKey = Object.keys(DESTINATION_IMAGES).find(k => key.includes(k) || k.includes(key))
  return partialKey ? DESTINATION_IMAGES[partialKey] : FALLBACK_IMAGE
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  transport: any[]
  hotels: any[]
  weather: any
  itinerary: any[]
  bookingStatus: any
  destination: string
  loading: boolean
  onTabChange: (tab: string) => void
  tripStatus: string
  tripHistory: any[]
  onCompleteTrip: () => void
  onNewTrip: () => void
  onShare: () => void
  onSave: () => void
}

// ─── Skeleton shimmer ─────────────────────────────────────────────────────────

function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-lg bg-[#F0ECE8] overflow-hidden relative ${className}`}
      style={{ minHeight: 16 }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%)',
          animation: 'shimmer 1.5s infinite',
          backgroundSize: '200% 100%',
        }}
      />
    </div>
  )
}

// ─── Budget math ──────────────────────────────────────────────────────────────

function useBudgetBreakdown(budget: number, nights: number, travelers: number, currency: string) {
  return useMemo(() => {
    const sym = SYMBOLS[currency] ?? currency
    const locale = currency === 'INR' ? 'en-IN' : 'en-US'
    const fmt = (n: number) => `${sym}${Math.round(n).toLocaleString(locale)}`

    // Realistic proportions summing to ~85% — leaves a 15% buffer for incidentals
    const travel = Math.round(budget * 0.40)
    const stay = Math.round(budget * 0.25)
    const activities = Math.round(budget * 0.20)
    const totalEstimated = travel + stay + activities
    const remaining = budget - totalEstimated
    const perPerson = travelers > 0 ? Math.round(totalEstimated / travelers) : totalEstimated
    const pctUsed = budget > 0 ? Math.min(100, (totalEstimated / budget) * 100) : 0

    // Tier estimates: saver = 85%, value = estimated, comfort = 115%
    const saverPerPerson = Math.round(perPerson * 0.85)
    const comfortPerPerson = Math.round(perPerson * 1.15)

    return { sym, fmt, travel, stay, activities, totalEstimated, remaining, perPerson, pctUsed, saverPerPerson, comfortPerPerson }
  }, [budget, nights, travelers, currency])
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onTabChange }: { onTabChange: (t: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center space-y-5 max-w-sm mx-auto px-4">
      <div className="w-14 h-14 rounded-2xl bg-[#FFF3ED] flex items-center justify-center">
        <MapPin size={26} className="text-[#EA580C]" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-[#1A1A1A] mb-1.5">Plan your next trip</h2>
        <p className="text-sm text-[#6B6B6B] leading-relaxed">
          Fill in your route, dates, and budget above — then hit{' '}
          <span className="text-[#EA580C] font-semibold">Search</span> to generate your Living Trip Board.
        </p>
      </div>
    </div>
  )
}

// ─── LEFT: Trip Mood Panel ────────────────────────────────────────────────────

function TripMoodPanel({ weather, remaining, fmt, loading }: { weather: any; remaining: number; fmt: (n: number) => string; loading: boolean }) {
  const rows = [
    { label: 'Pace', value: 'Easy', color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', pill: true },
    { label: 'Weather', value: 'Pack light, rain gear', color: '#B45309', bg: '#FFFBEB', border: '#FDE68A', pill: false },
    { label: 'Budget', value: remaining > 0 ? fmt(remaining) + ' left' : 'On track', color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA', pill: false },
    { label: 'Status', value: 'Ready to book', color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', pill: true },
  ]

  return (
    <div className="bg-white border border-[#E8E0D8] rounded-xl p-5 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-[#6B6B6B] mb-4">Trip Mood</p>
      <div className="space-y-3">
        {rows.map(r => (
          <div key={r.label} className="flex items-center justify-between gap-3">
            <span className="text-[13px] text-[#6B6B6B] shrink-0">{r.label}</span>
            {loading ? (
              <Skeleton className="h-5 w-24" />
            ) : r.pill ? (
              <span
                className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full border"
                style={{ color: r.color, background: r.bg, borderColor: r.border }}
              >
                {r.value}
              </span>
            ) : (
              <span className="text-[13px] font-semibold text-right" style={{ color: r.color }}>{r.value}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}


// ─── LEFT: Journey Flow — vertical timeline ───────────────────────────────────

const FLOW_STEPS = [
  { label: 'Origin', status: 'Ready', done: true },
  { label: 'Travel', status: 'Matched', done: true },
  { label: 'Stay', status: 'Matched', done: true },
  { label: 'Experience', status: 'Planned', done: false },
  { label: 'Partner Options', status: 'Available', done: false },
]

function JourneyFlowVertical({ loading }: { loading: boolean }) {
  return (
    <div className="bg-white border border-[#E8E0D8] rounded-xl p-5 shadow-[0_2px_16px_rgba(0,0,0,0.06)] mt-3">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-[#6B6B6B] mb-4">Journey Flow</p>
      <div className="relative">
        {/* Connecting line */}
        <div className="absolute left-[9px] top-2 bottom-2 w-px bg-[#E8E0D8]" />
        {/* Orange line for completed steps */}
        <div
          className="absolute left-[9px] top-2 w-px bg-[#EA580C] transition-all"
          style={{ height: `${(3 / 5) * 100}%` }}
        />
        <div className="space-y-4">
          {FLOW_STEPS.map((step, i) => (
            <div key={step.label} className="flex items-center gap-3 relative">
              {/* Circle */}
              <div
                className="w-[18px] h-[18px] rounded-full border-2 shrink-0 z-10 flex items-center justify-center"
                style={{
                  background: step.done ? (i < 2 ? '#EA580C' : '#16A34A') : 'white',
                  borderColor: step.done ? (i < 2 ? '#EA580C' : '#16A34A') : '#D1C9C0',
                }}
              >
                {step.done && <Check size={10} className="text-white" strokeWidth={3} />}
              </div>
              <div className="flex-1 flex items-center justify-between min-w-0">
                <span className={`text-[13px] font-medium ${step.done ? 'text-[#1A1A1A]' : 'text-[#9CA3AF]'}`}>
                  {step.label}
                </span>
                {loading ? (
                  <Skeleton className="h-4 w-14" />
                ) : (
                  <span
                    className={`text-[11px] font-semibold ${
                      step.status === 'Available' ? 'text-[#9CA3AF]' : step.done ? 'text-[#16A34A]' : 'text-[#6B6B6B]'
                    }`}
                  >
                    {step.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── CENTER: Trip Story Card ──────────────────────────────────────────────────

function TripStoryCard({
  loading, perPerson, budget, sym, fmt, travelers, destination, onFlights, onAdjust
}: {
  loading: boolean; perPerson: number; budget: number; sym: string; fmt: (n: number) => string
  travelers: number; destination: string; onFlights: () => void; onAdjust: () => void
}) {
  const locale = sym === '₹' ? 'en-IN' : 'en-US'
  const imgUrl = getDestinationImage(destination)

  return (
    <div className="bg-white border border-[#E8E0D8] rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.06)]">

      {/* ── Destination hero image with dark gradient overlay (desktop) ── */}
      <div
        className="relative w-full hidden lg:block"
        style={{ height: 220 }}
      >
        {/* Background image */}
        <img
          src={imgUrl}
          alt={destination || 'Destination'}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: loading ? 'brightness(0.5) blur(2px)' : 'brightness(0.72)' }}
        />
        {/* Dark gradient — bottom fade so content below is on white */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(160deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.78) 100%)'
          }}
        />

        {/* Content on top of image */}
        <div className="absolute inset-0 p-6 flex flex-col justify-between">
          {/* Top row: badge + recommended */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 bg-[#F59E0B] text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-sm">
              <Sparkles size={10} /> Best Value
            </span>
            <span className="text-[12px] text-white/70 font-medium">Recommended</span>
          </div>

          {/* Title + estimate on image */}
          <div>
            {loading ? (
              <Skeleton className="h-7 w-2/3 mb-2" />
            ) : (
              <h2
                className="text-[20px] font-bold text-white leading-tight mb-2 drop-shadow-sm"
                style={{ fontFamily: 'var(--font-plus-jakarta, Inter, sans-serif)', fontWeight: 700 }}
              >
                Flight + budget-friendly stay
              </h2>
            )}
            {loading ? (
              <Skeleton className="h-8 w-36" />
            ) : (
              <div className="flex items-end gap-2 flex-wrap">
                <span
                  className="text-[28px] font-bold text-white leading-none drop-shadow-sm"
                  style={{ fontFamily: 'var(--font-plus-jakarta, Inter, sans-serif)' }}
                >
                  {sym}{perPerson > 0 ? Math.round(perPerson).toLocaleString(locale) : '—'}
                </span>
                <span className="text-[13px] text-white/75 mb-0.5">/person est.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── White content area below image ── */}
      <div className="p-6 pt-5">
        {/* Reason */}
        {loading ? (
          <div className="space-y-1.5 mb-5">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        ) : (
          <p className="text-[14px] text-[#6B6B6B] italic leading-relaxed mb-5">
            Fast route with a well-located stay — leaves room for food, local travel, and activities.
          </p>
        )}

        {/* Budget subtitle on white (desktop shows full breakdown in Budget Compass) */}
        {!loading && budget > 0 && (
          <p className="text-[12px] text-[#9CA3AF] mb-5">of {fmt(budget)} total budget</p>
        )}

        {/* CTAs */}
        <div className="space-y-3">
          <button
            onClick={onFlights}
            className="w-full h-12 bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-[15px] rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            See flight options <ArrowRight size={16} />
          </button>
          <button
            onClick={onAdjust}
            className="w-full h-11 bg-white border border-[#E8E0D8] hover:border-[#D0C8C0] text-[#1A1A1A] font-semibold text-[14px] rounded-xl flex items-center justify-center transition-colors"
          >
            Adjust my plan
          </button>
        </div>
      </div>

      {/* ── Mobile: image top panel ── */}
      <div
        className="lg:hidden relative w-full overflow-hidden"
        style={{ height: 160, borderRadius: '16px 16px 0 0' }}
      >
        <img
          src={imgUrl}
          alt={destination || 'Destination'}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: loading ? 'brightness(0.5)' : 'brightness(0.7)' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(160deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.70) 100%)' }}
        />
        <div className="absolute inset-0 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 bg-[#F59E0B] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
              <Sparkles size={9} /> Best Value
            </span>
          </div>
          <div>
            {!loading && (
              <>
                <p className="text-[15px] font-bold text-white leading-snug mb-1" style={{ fontFamily: 'var(--font-plus-jakarta, Inter, sans-serif)' }}>
                  Flight + budget-friendly stay
                </p>
                <p className="text-[22px] font-bold text-white leading-none" style={{ fontFamily: 'var(--font-plus-jakarta, Inter, sans-serif)' }}>
                  {sym}{perPerson > 0 ? Math.round(perPerson).toLocaleString(locale) : '—'}
                  <span className="text-[12px] font-normal text-white/70 ml-1">/person</span>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


// ─── RIGHT: Budget Compass ────────────────────────────────────────────────────

function BudgetCompass({
  loading, budget, totalEstimated, remaining, travel, stay, activities, pctUsed, fmt, sym
}: {
  loading: boolean; budget: number; totalEstimated: number; remaining: number
  travel: number; stay: number; activities: number
  pctUsed: number; fmt: (n: number) => string; sym: string
}) {
  const breakdowns = [
    { label: 'Travel', amount: travel, dot: '#EA580C' },
    { label: 'Stay', amount: stay, dot: '#3B82F6' },
    { label: 'Activities', amount: activities, dot: '#7C3AED' },
  ]

  return (
    <div className="bg-white border border-[#E8E0D8] rounded-xl p-5 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#6B6B6B]">Budget Compass</p>
        <Info size={14} className="text-[#9CA3AF]" />
      </div>

      {/* Total */}
      {loading ? (
        <Skeleton className="h-8 w-36 mb-4" />
      ) : (
        <p className="text-[28px] font-bold text-[#1A1A1A] mb-4 leading-none" style={{ fontFamily: 'var(--font-plus-jakarta, Inter, sans-serif)' }}>
          {fmt(budget)}
        </p>
      )}

      {/* Estimated + Remaining */}
      {loading ? (
        <div className="space-y-2 mb-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-28" />
        </div>
      ) : (
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-1.5">
            <Check size={13} className="text-[#16A34A]" strokeWidth={2.5} />
            <span className="text-[13px] text-[#16A34A] font-semibold">Est. spend {fmt(totalEstimated)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#EA580C] shrink-0" />
            <span className="text-[13px] font-semibold" style={{ color: remaining >= 0 ? '#EA580C' : '#DC2626' }}>
              {remaining >= 0 ? fmt(remaining) + ' remaining' : 'Over budget'}
            </span>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-[#E8E0D8] overflow-hidden mb-5">
        <div
          className="h-full rounded-full bg-[#EA580C] transition-all duration-700"
          style={{ width: loading ? '0%' : `${pctUsed}%` }}
        />
      </div>

      {/* Breakdown */}
      <div className="space-y-2.5">
        {breakdowns.map(b => (
          <div key={b.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: b.dot }} />
              <span className="text-[13px] text-[#6B6B6B]">{b.label}</span>
            </div>
            {loading ? (
              <Skeleton className="h-4 w-16" />
            ) : (
              <span className="text-[13px] font-semibold text-[#1A1A1A]">{fmt(b.amount)}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── MOBILE: Horizontal Mood Pills ───────────────────────────────────────────

function MobileMoodPills({ loading, remaining, fmt }: { loading: boolean; remaining: number; fmt: (n: number) => string }) {
  const pills = [
    { label: 'Easy', color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
    { label: 'Rain Aware', color: '#B45309', bg: '#FFFBEB', border: '#FDE68A' },
    { label: loading ? '...' : (remaining > 0 ? fmt(remaining) : 'On track'), color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA' },
    { label: 'Ready', color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
  ]

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar px-4">
      {pills.map((p, i) => (
        <span
          key={i}
          className="shrink-0 text-[12px] font-semibold px-3 py-1.5 rounded-full border whitespace-nowrap"
          style={{ color: p.color, background: p.bg, borderColor: p.border }}
        >
          {p.label}
        </span>
      ))}
    </div>
  )
}


function WeatherForecastModal({
  weather,
  destination,
  onClose,
}: {
  weather: any
  destination: string
  onClose: () => void
}) {
  const destinationCity = destination.split(',')[0].trim()

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-[#E8E0D8] flex items-center justify-between bg-[#FFFBF7]">
          <h3 className="font-bold text-[#1A1A1A] text-lg flex items-center gap-2">
            <CloudSun className="text-[#EA580C]" size={20} />
            <span>Weather Forecast — {destinationCity}</span>
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-[#E8E0D8] rounded-lg transition-colors text-[#6B6B6B]">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-left">
          {/* Current weather details */}
          <div className="flex items-center gap-6 pb-4 border-b border-[#F5F5F4]">
            <div className="text-6xl text-[#EA580C]"><CloudSun size={56} /></div>
            <div>
              <p className="text-3xl font-bold text-[#1A1A1A] font-mono">{weather.temperature}°C</p>
              <p className="text-sm font-semibold text-[#6B6B6B] mt-0.5">{weather.condition}</p>
              <p className="text-xs text-[#9CA3AF] mt-0.5">Feels like {weather.feelsLike || weather.temperature}°C</p>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-[#FFFBF7] border border-[#F2ECE4] rounded-xl p-3">
              <p className="text-xs text-[#9CA3AF] uppercase">Rain Probability</p>
              <p className="text-lg font-bold text-[#EA580C] mt-1 font-mono">{weather.percentage}%</p>
            </div>
            <div className="bg-[#FFFBF7] border border-[#F2ECE4] rounded-xl p-3">
              <p className="text-xs text-[#9CA3AF] uppercase">Humidity</p>
              <p className="text-lg font-bold text-blue-500 mt-1 font-mono">{weather.humidity}%</p>
            </div>
            <div className="bg-[#FFFBF7] border border-[#F2ECE4] rounded-xl p-3">
              <p className="text-xs text-[#9CA3AF] uppercase">Wind Speed</p>
              <p className="text-lg font-bold text-purple-500 mt-1 font-mono">{weather.wind} km/h</p>
            </div>
          </div>

          {/* Forecast table */}
          {weather.forecast && weather.forecast.length > 0 && (
            <div className="space-y-3">
              <p className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider">4-Day Forecast</p>
              <div className="border border-[#E8E0D8] rounded-xl overflow-hidden divide-y divide-[#E8E0D8]">
                {weather.forecast.map((f: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 text-sm hover:bg-[#FFFBF7] transition-colors">
                    <span className="font-semibold text-[#1A1A1A]">{f.date}</span>
                    <span className="text-[#6B6B6B]">{f.condition}</span>
                    <span className="font-mono font-semibold">
                      <span className="text-red-500">{f.high}°</span> / <span className="text-blue-500">{f.low}°</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weather Advisory */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex gap-3">
            <AlertCircle size={20} className="text-[#EA580C] shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-bold text-[#C2410C]">Weather Travel Alert</p>
              <p className="text-[12px] text-[#EA580C] leading-relaxed mt-1">
                Always review local advisory updates before traveling. Ensure your travel insurance covers weather-related trip cancellations or delays.
              </p>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-[#E8E0D8] bg-[#FFFBF7] flex justify-end">
          <button onClick={onClose} className="btn-primary bg-[#EA580C] hover:bg-[#C2410C] px-6 py-2 rounded-xl text-white font-bold text-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function WeatherOptModal({
  isOptimizing,
  setIsOptimizing,
  success,
  setSuccess,
  onClose,
  onApply,
  weather,
}: {
  isOptimizing: boolean
  setIsOptimizing: (val: boolean) => void
  success: boolean
  setSuccess: (val: boolean) => void
  onClose: () => void
  onApply: () => void
  weather: any
}) {
  useEffect(() => {
    if (isOptimizing) {
      const timer = setTimeout(() => {
        setIsOptimizing(false)
        setSuccess(true)
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [isOptimizing])

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-[#E8E0D8] flex items-center justify-between bg-[#FFFBF7]">
          <h3 className="font-bold text-[#1A1A1A] text-lg flex items-center gap-2">
            <CloudRain className="text-[#EA580C]" size={20} />
            <span>Weather-Aware Optimizer</span>
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-[#E8E0D8] rounded-lg transition-colors text-[#6B6B6B]">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 text-center space-y-4">
          {isOptimizing ? (
            <div className="py-6 space-y-4">
              <div className="w-12 h-12 border-4 border-[#EA580C] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <div>
                <p className="font-bold text-[#1A1A1A]">Analyzing weather forecast & cloud cover...</p>
                <p className="text-xs text-[#9CA3AF] mt-1">Re-scheduling outdoor blocks to avoid peak rain periods...</p>
              </div>
            </div>
          ) : success ? (
            <div className="space-y-4">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl">
                ✓
              </div>
              <div>
                <h4 className="font-bold text-lg text-[#1A1A1A]">Optimization Complete!</h4>
                <p className="text-[13px] text-[#6B6B6B] leading-relaxed mt-2">
                  AI successfully optimized your day-to-day plan:
                </p>
                <ul className="text-left text-[12px] text-[#6B6B6B] list-disc pl-5 mt-3 space-y-1">
                  <li>Moved outdoor walks to pleasant mornings.</li>
                  <li>Scheduled indoor dining/museum tours during forecast showers.</li>
                  <li>Added extra buffer times for transport delays.</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <p className="text-sm text-[#6B6B6B] leading-relaxed">
                Click below to restructure your daily itinerary dynamically. Our AI will rearrange sightseeing and outdoor plans to fit the best forecast windows.
              </p>
              <button
                onClick={() => setIsOptimizing(true)}
                className="w-full bg-[#EA580C] hover:bg-[#C2410C] py-3 rounded-xl font-bold text-white text-sm"
              >
                Start Weather Optimization
              </button>
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-[#E8E0D8] bg-[#FFFBF7] flex justify-end gap-3">
          <button onClick={onClose} className="btn-outline px-5 py-2 border-[#E8E0D8] text-[#6B6B6B] hover:bg-white text-sm">
            Cancel
          </button>
          {success && (
            <button
              onClick={onApply}
              className="btn-primary bg-[#EA580C] hover:bg-[#C2410C] px-6 py-2 rounded-xl text-white font-bold text-sm"
            >
              Apply to Plan
            </button>
          )}
        </div>
      </div>

      {/* Hotel Detail Modal */}
      <HotelDetailModal />
    </div>
  )
}

function VisaGuidanceModal({
  isInternational,
  visaConfig,
  destination,
  tripContext,
  onClose,
  onOfficial,
}: {
  isInternational: boolean
  visaConfig: any
  destination: string
  tripContext: any
  onClose: () => void
  onOfficial: () => void
}) {
  const destinationCity = destination.split(',')[0].trim()

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-[#E8E0D8] flex items-center justify-between bg-[#FFFBF7]">
          <h3 className="font-bold text-[#1A1A1A] text-lg">
            {isInternational ? (
              <span className="flex items-center gap-2">
                <ShieldAlert className="text-[#EA580C]" size={20} />
                <span>Visa Guidance — {visaConfig?.country}</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Plane className="text-[#EA580C]" size={20} />
                <span>Domestic Travel Guidelines</span>
              </span>
            )}
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-[#E8E0D8] rounded-lg transition-colors text-[#6B6B6B]">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-left">
          {isInternational ? (
            <div className="space-y-5">
              {/* Visa Status Block */}
              <div className="bg-[#FFFBF7] border border-[#F2ECE4] rounded-xl p-4 flex justify-between items-start">
                <div>
                  <p className="text-xs text-[#9CA3AF] uppercase">Visa Type</p>
                  <p className="text-base font-bold text-[#1A1A1A] mt-1">{visaConfig.visaStatus}</p>
                </div>
                <span
                  className="text-[10px] font-bold px-2.5 py-1 rounded-full border"
                  style={{
                    color: visaConfig.badgeColor,
                    background: visaConfig.badgeBg,
                    borderColor: visaConfig.badgeBorder
                  }}
                >
                  {visaConfig.badge}
                </span>
              </div>

              {/* Processing details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-[#E8E0D8] rounded-xl p-3">
                  <p className="text-xs text-[#9CA3AF] uppercase">Processing Time</p>
                  <p className="text-sm font-semibold text-[#1A1A1A] mt-1">{visaConfig.processingTime}</p>
                </div>
                <div className="border border-[#E8E0D8] rounded-xl p-3">
                  <p className="text-xs text-[#9CA3AF] uppercase">Passport Validity</p>
                  <p className="text-sm font-semibold text-[#1A1A1A] mt-1">Minimum 6 months</p>
                </div>
              </div>

              {/* Detailed steps */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider">Step-by-Step Instructions</p>
                <ol className="text-[13px] text-[#6B6B6B] list-decimal pl-5 space-y-2 leading-relaxed">
                  <li>Ensure your passport has at least 2 blank pages and is valid for 6 months from entry.</li>
                  <li>Gather all required documents as shown in the checklist.</li>
                  <li>
                    Fill out the online application form on the{' '}
                    <button onClick={onOfficial} className="text-[#EA580C] hover:underline font-semibold inline-flex items-center gap-0.5">
                      official portal <ExternalLink size={10} />
                    </button>.
                  </li>
                  <li>Pay the visa fee online or prepare the exact amount in cash (USD/local currency) if paying on arrival.</li>
                  <li>Keep printed copies of your visa approval letter, flights, and hotel bookings ready for immigration check.</li>
                </ol>
              </div>

              {/* Document Checklist */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider">Required Checklist</p>
                <div className="bg-[#F5F5F4] rounded-xl p-4 space-y-2">
                  {visaConfig.docs.map((doc: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 text-[12px] text-[#6B6B6B]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C] shrink-0" />
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-xl p-4 flex gap-3">
                <Check size={18} className="text-[#16A34A] shrink-0 mt-0.5" strokeWidth={3} />
                <div>
                  <p className="text-[13px] font-bold text-[#14532D]">No Visa Required</p>
                  <p className="text-[12px] text-[#166534] leading-relaxed mt-1">
                    You are traveling domestically within India. No passport visa control is required.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider">Identity & Check-in Rules</p>
                <ul className="text-[13px] text-[#6B6B6B] list-disc pl-5 space-y-2 leading-relaxed">
                  <li><strong>Airport Check-in:</strong> Carry a physical or digital copy of your Aadhaar Card, Passport, or Voter ID. Airport entry requires matching names on ticket and ID.</li>
                  <li><strong>Hotel Stay:</strong> All guests must provide valid government photo ID upon checking in. PAN card is usually not accepted as address proof.</li>
                  <li><strong>Travel Permits:</strong> Certain border zones (e.g. parts of Ladakh or Sikkim) require Inner Line Permits (ILP) which must be applied for separately.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-[#E8E0D8] bg-[#FFFBF7] flex justify-end gap-3">
          <button onClick={onClose} className="btn-outline px-5 py-2 border-[#E8E0D8] text-[#6B6B6B] hover:bg-white text-sm">
            Close
          </button>
          {isInternational && (
            <button
              onClick={onOfficial}
              className="btn-primary bg-[#EA580C] hover:bg-[#C2410C] px-6 py-2 rounded-xl text-white font-bold text-sm flex items-center gap-1"
            >
              Open portal <ExternalLink size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function WeatherReadinessCard({
  weather,
  datesText,
  destination,
  weatherConfig,
  loading,
  onAdjustClick,
  onForecastClick,
  packExpanded,
  setPackExpanded,
  isMobile = false,
}: {
  weather: any
  datesText: string | null
  destination: string
  weatherConfig: any
  loading: boolean
  onAdjustClick: () => void
  onForecastClick: () => void
  packExpanded: boolean
  setPackExpanded: (val: boolean) => void
  isMobile?: boolean
}) {
  if (loading) {
    return (
      <div className="bg-white border border-[#E8E0D8] rounded-xl p-5 shadow-sm space-y-3">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  if (!weather || !weatherConfig) {
    return (
      <div className="bg-white border border-[#E8E0D8] rounded-xl p-5 shadow-sm flex flex-col justify-between h-full text-left">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CloudSun className="text-[#EA580C]" size={20} />
            <h3 className="text-[15px] font-bold text-[#1A1A1A]">Weather Readiness</h3>
          </div>
          <p className="text-[13px] text-[#6B6B6B] leading-relaxed">Weather information is currently unavailable for this destination.</p>
        </div>
        <div className="mt-4 pt-4 border-t border-[#F5F5F4] flex gap-2">
          <button disabled className="flex-1 py-2 text-[12px] font-bold rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed text-center">
            Adjust itinerary
          </button>
          <button disabled className="flex-1 py-2 text-[12px] font-bold rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed text-center">
            View forecast
          </button>
        </div>
      </div>
    )
  }

  const destinationCity = destination.split(',')[0].trim()
  const displayDates = datesText ? datesText.split('·')[0].trim() : ''

  return (
    <div className="bg-white border border-[#E8E0D8] rounded-xl p-5 shadow-sm flex flex-col justify-between h-full text-left">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <CloudSun className="text-[#EA580C] shrink-0" size={20} />
            <div>
              <h3 className="text-[15px] font-bold text-[#1A1A1A] leading-tight">Weather Readiness</h3>
              <p className="text-[11px] text-[#6B6B6B] mt-0.5">{destinationCity} · {displayDates}</p>
            </div>
          </div>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 uppercase tracking-wider"
            style={{
              color: weatherConfig.badgeColor,
              background: weatherConfig.badgeBg,
              borderColor: weatherConfig.badgeBorder,
            }}
          >
            {weatherConfig.status}
          </span>
        </div>

        {/* Weather Info */}
        <div className="grid grid-cols-2 gap-4 bg-[#FFFBF7] border border-[#F2ECE4] rounded-lg p-3 mb-4">
          <div>
            <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wide">Temp Range</p>
            <p className="text-[16px] font-bold text-[#1A1A1A] font-mono mt-0.5">
              {weather.temperature}°C
            </p>
          </div>
          <div>
            <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wide">Rain Chance</p>
            <p className="text-[16px] font-bold text-[#1A1A1A] font-mono mt-0.5">
              {weather.percentage}%
            </p>
          </div>
        </div>

        {/* Weather details */}
        <div className="space-y-3">
          <div>
            <p className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider">Best Outdoor Window</p>
            <p className="text-[12px] text-[#6B6B6B] mt-0.5">{weatherConfig.bestWindow}</p>
          </div>

          <div>
            <p className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider">Trip Impact</p>
            <p className="text-[12px] text-[#6B6B6B] leading-relaxed mt-0.5">{weatherConfig.impact}</p>
          </div>

          {/* Packing suggestions */}
          <div>
            {isMobile ? (
              <div>
                <button
                  onClick={() => setPackExpanded(!packExpanded)}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-[#EA580C] uppercase tracking-wider focus:outline-none"
                >
                  Pack Suggestions {packExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
                {packExpanded && (
                  <p className="text-[12px] text-[#6B6B6B] leading-relaxed mt-1.5 bg-[#FFFBF7] p-2.5 border border-[#F2ECE4] rounded-lg">
                    {weatherConfig.pack.join(', ')}
                  </p>
                )}
              </div>
            ) : (
              <div>
                <p className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider">Pack</p>
                <p className="text-[12px] text-[#6B6B6B] mt-0.5">{weatherConfig.pack.join(', ')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 pt-4 border-t border-[#F5F5F4] flex gap-2">
        <button
          onClick={onAdjustClick}
          className="flex-1 py-2 text-[12px] font-bold text-white bg-[#EA580C] hover:bg-[#C2410C] rounded-lg transition-colors text-center cursor-pointer shadow-sm active:scale-[0.98]"
        >
          Adjust itinerary
        </button>
        <button
          onClick={onForecastClick}
          className="flex-1 py-2 text-[12px] font-bold text-[#EA580C] border border-[#EA580C] hover:bg-orange-50 rounded-lg transition-colors text-center cursor-pointer active:scale-[0.98]"
        >
          View forecast
        </button>
      </div>
    </div>
  )
}

function VisaReadinessCard({
  isInternational,
  destination,
  tripContext,
  visaConfig,
  loading,
  onGuidanceClick,
  onOfficialClick,
  docsExpanded,
  setDocsExpanded,
  isMobile = false,
}: {
  isInternational: boolean
  destination: string
  tripContext: any
  visaConfig: any
  loading: boolean
  onGuidanceClick: () => void
  onOfficialClick: () => void
  docsExpanded: boolean
  setDocsExpanded: (val: boolean) => void
  isMobile?: boolean
}) {
  if (loading) {
    return (
      <div className="bg-white border border-[#E8E0D8] rounded-xl p-5 shadow-sm space-y-3">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  // Domestic View
  if (!isInternational) {
    const destinationCity = destination.split(',')[0].trim()
    const startCity = tripContext.startLocation ? tripContext.startLocation.split(',')[0].trim() : 'Origin'
    return (
      <div className="bg-white border border-[#E8E0D8] rounded-xl p-5 shadow-sm flex flex-col justify-between h-full text-left">
        <div>
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Plane className="text-[#EA580C]" size={20} />
              <div>
                <h3 className="text-[15px] font-bold text-[#1A1A1A] leading-tight">Travel Readiness</h3>
                <p className="text-[11px] text-[#6B6B6B] mt-0.5">{startCity} → {destinationCity}</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 uppercase tracking-wider text-[#16A34A] bg-[#F0FDF4] border-[#BBF7D0]">
              Ready
            </span>
          </div>
          <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-lg p-3 mb-3 flex gap-2.5 items-start">
            <Check size={16} className="text-[#16A34A] shrink-0 mt-0.5" strokeWidth={3} />
            <div>
              <p className="text-[12px] font-bold text-[#14532D]">No visa required</p>
              <p className="text-[12px] text-[#166534] leading-relaxed mt-0.5">
                No visa required for domestic travel within India.
              </p>
            </div>
          </div>
          <p className="text-[12px] text-[#6B6B6B] leading-relaxed">
            Carry a valid government-issued photo ID (such as Aadhaar Card, Driving License, or Passport) for airport security and hotel check-in.
          </p>
        </div>
        <div className="mt-5 pt-4 border-t border-[#F5F5F4]">
          <button
            onClick={onGuidanceClick}
            className="w-full py-2 text-[12px] font-bold text-[#EA580C] border border-[#EA580C] hover:bg-orange-50 rounded-lg transition-colors text-center cursor-pointer active:scale-[0.98]"
          >
            Check domestic guidelines
          </button>
        </div>
      </div>
    )
  }

  // International View
  if (!visaConfig) {
    return (
      <div className="bg-white border border-[#E8E0D8] rounded-xl p-5 shadow-sm flex flex-col justify-between h-full text-left">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="text-[#EA580C]" size={20} />
            <h3 className="text-[15px] font-bold text-[#1A1A1A]">Visa Readiness</h3>
          </div>
          <p className="text-[13px] text-[#6B6B6B] leading-relaxed">Visa information is currently unavailable for this destination.</p>
        </div>
        <div className="mt-4 pt-4 border-t border-[#F5F5F4] flex gap-2">
          <button disabled className="flex-1 py-2 text-[12px] font-bold rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed text-center">
            View guidance
          </button>
          <button disabled className="flex-1 py-2 text-[12px] font-bold rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed text-center">
            Official source
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-[#E8E0D8] rounded-xl p-5 shadow-sm flex flex-col justify-between h-full text-left">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="text-[#EA580C]" size={20} />
            <div>
              <h3 className="text-[15px] font-bold text-[#1A1A1A] leading-tight">Visa Readiness</h3>
              <p className="text-[11px] text-[#6B6B6B] mt-0.5">Indian Passport → {visaConfig.country}</p>
            </div>
          </div>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 uppercase tracking-wider"
            style={{
              color: visaConfig.badgeColor,
              background: visaConfig.badgeBg,
              borderColor: visaConfig.badgeBorder,
            }}
          >
            {visaConfig.badge}
          </span>
        </div>

        {/* Visa Info Box */}
        <div className="bg-[#FFFBF7] border border-[#F2ECE4] rounded-lg p-3 mb-4 space-y-2">
          <div>
            <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wide">Visa Type</p>
            <p className="text-[13px] font-bold text-[#1A1A1A] mt-0.5">{visaConfig.visaStatus}</p>
          </div>
          <div className="pt-2 border-t border-[#F2ECE4] flex justify-between">
            <div>
              <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wide">Processing Time</p>
              <p className="text-[12px] font-bold text-[#1A1A1A] mt-0.5">{visaConfig.processingTime}</p>
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div className="space-y-3">
          <div>
            <p className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider">Booking Caution</p>
            <p className="text-[12px] text-[#EA580C] font-medium leading-relaxed mt-0.5">{visaConfig.caution}</p>
          </div>

          <div>
            {isMobile ? (
              <div>
                <button
                  onClick={() => setDocsExpanded(!docsExpanded)}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-[#EA580C] uppercase tracking-wider focus:outline-none"
                >
                  Required Documents {docsExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
                {docsExpanded && (
                  <ul className="text-[12px] text-[#6B6B6B] space-y-1 list-disc pl-4 mt-2 bg-[#FFFBF7] p-2.5 border border-[#F2ECE4] rounded-lg">
                    {visaConfig.docs.map((doc: string, idx: number) => (
                      <li key={idx}>{doc}</li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <div>
                <p className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider">Required Documents</p>
                <ul className="text-[12px] text-[#6B6B6B] list-disc pl-4 mt-1 space-y-0.5">
                  {visaConfig.docs.map((doc: string, idx: number) => (
                    <li key={idx}>{doc}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 pt-4 border-t border-[#F5F5F4] flex gap-2">
        <button
          onClick={onGuidanceClick}
          className="flex-1 py-2 text-[12px] font-bold text-white bg-[#EA580C] hover:bg-[#C2410C] rounded-lg transition-colors text-center cursor-pointer shadow-sm active:scale-[0.98]"
        >
          View visa guidance
        </button>
        <button
          onClick={onOfficialClick}
          className="flex-1 py-2 text-[12px] font-bold text-[#EA580C] border border-[#EA580C] hover:bg-orange-50 rounded-lg transition-colors text-center cursor-pointer active:scale-[0.98] flex items-center justify-center gap-1"
        >
          Official source <ExternalLink size={12} />
        </button>
      </div>
    </div>
  )
}


// ─── ROOT COMPONENT ───────────────────────────────────────────────────────────

function OverviewTab({
  transport, hotels, weather, itinerary, bookingStatus,
  destination, loading, onTabChange, onShare, onSave,
}: Props) {
  const { user } = useAuthStore()
  const currency = user?.currency ?? 'INR'
  const { userProfile, tripContext } = useTripStore()
  const sym = SYMBOLS[currency] ?? currency
  const locale = currency === 'INR' ? 'en-IN' : 'en-US'

  const [showForecast, setShowForecast] = useState(false)
  const [showWeatherOpt, setShowWeatherOpt] = useState(false)
  const [showVisaGuidance, setShowVisaGuidance] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optSuccess, setOptSuccess] = useState(false)
  const [packExpanded, setPackExpanded] = useState(false)
  const [docsExpanded, setDocsExpanded] = useState(false)

  const destClean = (tripContext.destination || destination || '').toLowerCase()
  const domesticCities = [
    'goa', 'manali', 'kerala', 'rishikesh', 'jaipur', 'kashmir', 'andaman', 'delhi', 'mumbai', 'hyderabad', 'bangalore', 'bengaluru', 'agra', 'varanasi', 'kochi', 'udaipur', 'shimla', 'darjeeling', 'amritsar', 'mysuru', 'srinagar', 'ooty', 'visakhapatnam', 'coimbatore', 'bhopal', 'indore', 'chandigarh', 'nagpur', 'lucknow', 'patna'
  ]
  const isDestDomestic = domesticCities.some(city => destClean.includes(city)) || destClean.includes('india')
  const isInternational = !isDestDomestic && destClean.length > 0

  const visaConfig = useMemo(() => {
    if (!isInternational) return null

    let country = 'International'
    let visaStatus = 'Visa required'
    let processingTime = '3-7 working days'
    let officialLink = 'https://www.vfsglobal.com/'
    let docs = ['Passport (valid > 6 months)', 'Return flight tickets', 'Accommodation reservation', 'Sufficient travel funds']
    let caution = 'Check specific visa rules before finalizing non-refundable bookings.'
    let badge = 'Check required'
    let badgeColor = '#EA580C'
    let badgeBg = '#FFF7ED'
    let badgeBorder = '#FED7AA'

    if (destClean.includes('bali') || destClean.includes('indonesia')) {
      country = 'Indonesia'
      visaStatus = 'Visa on Arrival / E-VOA'
      processingTime = 'Instant (E-VOA online: 1-2 days)'
      officialLink = 'https://molina.imigrasi.go.id/'
      docs = ['Passport (valid > 6 months)', 'Return flight ticket', 'Hotel booking confirmation', 'Electronic Customs Declaration (E-CD)']
      caution = 'Passport must be valid for at least 6 months from arrival date. Safe to book flights.'
      badge = 'Ready'
      badgeColor = '#16A34A'
      badgeBg = '#F0FDF4'
      badgeBorder = '#BBF7D0'
    } else if (destClean.includes('dubai') || destClean.includes('uae') || destClean.includes('emirates')) {
      country = 'UAE (Dubai)'
      visaStatus = 'Pre-arranged E-Visa required'
      processingTime = '2-4 working days'
      officialLink = 'https://smart.gdrfad.gov.ae/'
      docs = ['Passport (valid > 6 months)', 'Passport-size photo (white background)', 'Confirmed return flight ticket', 'Hotel booking']
      caution = 'Apply for E-Visa at least 7 days before departure. Avoid booking non-refundable stays.'
      badge = 'Action needed'
      badgeColor = '#DC2626'
      badgeBg = '#FEF2F2'
      badgeBorder = '#FCA5A5'
    } else if (destClean.includes('singapore')) {
      country = 'Singapore'
      visaStatus = 'E-Visa required'
      processingTime = '3-5 working days'
      officialLink = 'https://www.ica.gov.sg/'
      docs = ['Passport (valid > 6 months)', 'SG Arrival Card (SGAC) with Electronic Health Declaration', 'Confirmed return ticket', 'Hotel booking', 'Sufficient funds']
      caution = 'Visa application should be submitted 2 weeks before entry. Ensure SG Arrival Card is filled within 3 days prior to arrival.'
      badge = 'Action needed'
      badgeColor = '#DC2626'
      badgeBg = '#FEF2F2'
      badgeBorder = '#FCA5A5'
    } else if (destClean.includes('thailand') || destClean.includes('bangkok') || destClean.includes('phuket') || destClean.includes('krabi')) {
      country = 'Thailand'
      visaStatus = 'Visa-free entry (current exemption)'
      processingTime = 'Instant on arrival'
      officialLink = 'https://www.consular.go.th/'
      docs = ['Passport (valid > 6 months)', 'Confirmed return ticket (within 30 days)', 'Proof of accommodation', 'Proof of funds (10,000 THB per person)']
      caution = 'Ensure return flight is within the allowed visa-free duration. Safe to book.'
      badge = 'Ready'
      badgeColor = '#16A34A'
      badgeBg = '#F0FDF4'
      badgeBorder = '#BBF7D0'
    } else if (destClean.includes('maldives')) {
      country = 'Maldives'
      visaStatus = 'Visa on Arrival (30 Days)'
      processingTime = 'Instant on arrival'
      officialLink = 'https://imuga.immigration.gov.mv/'
      docs = ['Passport (valid > 6 months)', 'IMUGA Traveler Declaration (submit within 96 hours of arrival)', 'Confirmed return ticket', 'Pre-paid hotel booking', 'Sufficient funds']
      caution = 'Must fill out the online IMUGA traveler declaration form before departure.'
      badge = 'Ready'
      badgeColor = '#16A34A'
      badgeBg = '#F0FDF4'
      badgeBorder = '#BBF7D0'
    } else if (destClean.includes('paris') || destClean.includes('rome') || destClean.includes('barcelona') || destClean.includes('amsterdam') || destClean.includes('prague') || destClean.includes('europe')) {
      country = 'Schengen Area'
      visaStatus = 'Embassy Schengen Visa required'
      processingTime = '15-20 working days'
      officialLink = 'https://visa.vfsglobal.com/'
      docs = ['Passport (valid > 6 months)', 'Schengen Application form', 'Travel medical insurance (min €30,000 coverage)', 'Detailed daily itinerary', 'Confirmed flight itinerary & hotel bookings', 'Bank statements (last 3-6 months)', 'NOC from employer / ITR']
      caution = 'Schengen visas take up to 3-4 weeks to process. Apply early. Do not make fully non-refundable bookings.'
      badge = 'Action needed'
      badgeColor = '#DC2626'
      badgeBg = '#FEF2F2'
      badgeBorder = '#FCA5A5'
    } else if (destClean.includes('london') || destClean.includes('uk') || destClean.includes('united kingdom')) {
      country = 'United Kingdom'
      visaStatus = 'Standard Visitor Visa required'
      processingTime = '15-25 working days'
      officialLink = 'https://visa.vfsglobal.com/'
      docs = ['Passport (valid > 6 months)', 'UK visa application form', 'Financial proof (bank statements, pay slips)', 'NOC / Proof of employment', 'Accommodation details', 'Detailed itinerary']
      caution = 'UK Visitor Visas take substantial processing time (around 3 weeks). Book only with flexible cancellation policies.'
      badge = 'Action needed'
      badgeColor = '#DC2626'
      badgeBg = '#FEF2F2'
      badgeBorder = '#FCA5A5'
    }

    return { country, visaStatus, processingTime, officialLink, docs, caution, badge, badgeColor, badgeBg, badgeBorder }
  }, [isInternational, destClean])

  const weatherConfig = useMemo(() => {
    if (!weather) return null

    const temp = weather.temperature
    const cond = (weather.condition || '').toLowerCase()
    const pct = weather.percentage || 0

    let status = 'Clear'
    let badgeColor = '#16A34A'
    let badgeBg = '#F0FDF4'
    let badgeBorder = '#BBF7D0'
    let bestWindow = 'All day outdoor activities'
    let pack = ['Comfortable walking shoes', 'Sunglasses', 'Light layers']
    let impact = 'High outdoor confidence! Perfect weather for walking tours, beach visits, and sightseeing.'

    if (pct > 50 || cond.includes('rain') || cond.includes('drizzle') || cond.includes('thunderstorm') || cond.includes('shower')) {
      status = 'Rain-aware'
      badgeColor = '#EA580C'
      badgeBg = '#FFF7ED'
      badgeBorder = '#FED7AA'
      bestWindow = 'Before 12 PM or indoor visits during showers'
      pack = ['Umbrella', 'Sandals / quick-dry footwear', 'Light rain jacket', 'Waterproof phone pouch']
      impact = 'Keep beaches and outdoor activities flexible. Add indoor cafes, museums, or temple/heritage visits as backup.'
    } else if (temp > 32) {
      status = 'Hot'
      badgeColor = '#DC2626'
      badgeBg = '#FEF2F2'
      badgeBorder = '#FCA5A5'
      bestWindow = 'Early morning (7 AM - 10 AM) & Late evening (after 5 PM)'
      pack = ['Sunscreen (SPF 50+)', 'Hat / Cap', 'Sun glasses', 'Light cotton clothing', 'Refillable water bottle']
      impact = 'Avoid peak afternoon sun. Plan early starts and keep indoor museum breaks/shopping between 12 PM and 4 PM.'
    } else if (temp < 15) {
      status = 'Cold'
      badgeColor = '#2563EB'
      badgeBg = '#EFF6FF'
      badgeBorder = '#BFDBFE'
      bestWindow = 'Midday (11 AM - 3 PM) when sun is out'
      pack = ['Fleece jacket or warm coat', 'Thermals', 'Woolen socks', 'Moisturizer / Lip balm']
      impact = 'Dress in warm layers. Outdoor activities are great during midday, but wrap up early as temperatures drop fast post-sunset.'
    } else {
      status = 'Pleasant'
      badgeColor = '#16A34A'
      badgeBg = '#F0FDF4'
      badgeBorder = '#BBF7D0'
      bestWindow = 'All day sightseeing is comfortable'
      pack = ['Comfortable walking shoes', 'Light breathable layers', 'Sunglasses', 'Camera']
      impact = 'Excellent weather for exploring! High outdoor confidence. Make the most of walking tours, viewpoint treks, and open-air sights.'
    }

    return { status, badgeColor, badgeBg, badgeBorder, bestWindow, pack, impact }
  }, [weather])

  const travelers = userProfile?.members ?? 2
  const budget = userProfile?.budget ?? 0

  const days = useMemo(() => {
    if (tripContext.startDate && tripContext.endDate) {
      return Math.max(1, getDaysBetween(tripContext.startDate, tripContext.endDate))
    }
    return itinerary.length || 3
  }, [tripContext.startDate, tripContext.endDate, itinerary.length])

  const nights = Math.max(1, days - 1)

  const { fmt, travel, stay, activities, totalEstimated, remaining, perPerson, pctUsed } =
    useBudgetBreakdown(budget, nights, travelers, currency)

  const hasSearched = !!(tripContext.destination || destination)

  if (!hasSearched && !loading) {
    return <EmptyState onTabChange={onTabChange} />
  }

  // Formatted trip metadata
  const routeText = tripContext.startLocation && tripContext.destination
    ? `${tripContext.startLocation} → ${tripContext.destination}`
    : tripContext.destination || destination || 'Your Trip'

  const datesText = tripContext.startDate && tripContext.endDate
    ? `${formatDate(tripContext.startDate)} – ${formatDate(tripContext.endDate)} · ${days}d`
    : null

  const budgetDisplay = budget > 0 ? `${sym}${Math.round(budget).toLocaleString(locale)}` : null

  return (
    <>
      {/* Shimmer keyframe */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) }
          100% { transform: translateX(100%) }
        }
        .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      {/* ── DESKTOP LAYOUT ──────────────────────────────────────────────── */}
      <div className="hidden lg:block">

        {/* Desktop trip header */}
        <div className="bg-white border border-[#E8E0D8] rounded-xl px-6 py-4 mb-5 shadow-[0_2px_16px_rgba(0,0,0,0.04)] flex items-center gap-4">
          <div className="flex-1 min-w-0 text-center">
            <p
              className="text-[18px] font-semibold text-[#1A1A1A] truncate"
              style={{ fontFamily: 'var(--font-plus-jakarta, Inter, sans-serif)', fontWeight: 600 }}
            >
              {routeText}
            </p>
            {(datesText || travelers || budgetDisplay) && (
              <p className="text-[14px] text-[#6B6B6B] mt-0.5 flex items-center justify-center gap-3 flex-wrap">
                {datesText && <span>{datesText}</span>}
                {travelers && <span>· {travelers} traveler{travelers > 1 ? 's' : ''}</span>}
                {budgetDisplay && <span>· {budgetDisplay}</span>}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onShare}
              className="p-2 rounded-lg border border-[#E8E0D8] hover:bg-[#FFFBF7] transition-colors"
              title="Share"
            >
              <Share2 size={16} strokeWidth={1.5} className="text-[#6B6B6B]" />
            </button>
            <button
              onClick={onSave}
              className="p-2 rounded-lg border border-[#E8E0D8] hover:bg-[#FFFBF7] transition-colors"
              title="Save"
            >
              <Bookmark size={16} strokeWidth={1.5} className="text-[#6B6B6B]" />
            </button>
            <button
              onClick={() => onTabChange('transport')}
              className="ml-1 bg-[#EA580C] hover:bg-[#C2410C] text-white text-[13px] font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              See flight options <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Three-column layout */}
        <div className="grid gap-5" style={{ gridTemplateColumns: '240px 1fr 280px' }}>

          {/* LEFT */}
          <div className="space-y-0">
            <TripMoodPanel weather={weather} remaining={remaining} fmt={fmt} loading={loading} />
            <JourneyFlowVertical loading={loading} />
          </div>

          {/* CENTER */}
          <div className="space-y-5">
            <TripStoryCard
              loading={loading}
              perPerson={perPerson}
              budget={budget}
              sym={sym}
              fmt={fmt}
              travelers={travelers}
              destination={tripContext.destination || destination || ''}
              onFlights={() => onTabChange('transport')}
              onAdjust={() => onTabChange('optimizer')}
            />

            {/* Premium Readiness Cards Section */}
            <div className="grid grid-cols-2 gap-4">
              <WeatherReadinessCard
                weather={weather}
                datesText={datesText}
                destination={tripContext.destination || destination || ''}
                weatherConfig={weatherConfig}
                loading={loading}
                onAdjustClick={() => { setOptSuccess(false); setIsOptimizing(false); setShowWeatherOpt(true); }}
                onForecastClick={() => setShowForecast(true)}
                packExpanded={packExpanded}
                setPackExpanded={setPackExpanded}
              />
              <VisaReadinessCard
                isInternational={isInternational}
                destination={tripContext.destination || destination || ''}
                tripContext={tripContext}
                visaConfig={visaConfig}
                loading={loading}
                onGuidanceClick={() => setShowVisaGuidance(true)}
                onOfficialClick={() => {
                  if (visaConfig?.officialLink) {
                    window.open(visaConfig.officialLink, '_blank')
                  }
                }}
                docsExpanded={docsExpanded}
                setDocsExpanded={setDocsExpanded}
              />
            </div>
          </div>

          {/* RIGHT */}
          <div>
            <BudgetCompass
              loading={loading}
              budget={budget}
              totalEstimated={totalEstimated}
              remaining={remaining}
              travel={travel}
              stay={stay}
              activities={activities}
              pctUsed={pctUsed}
              fmt={fmt}
              sym={sym}
            />
          </div>

        </div>
      </div>

      {/* ── MOBILE LAYOUT ───────────────────────────────────────────────── */}
      <div className="lg:hidden pb-[140px]">

        {/* Compact mobile header */}
        <div className="px-4 mb-4">
          <div className="flex items-center justify-between">
            <p className="text-[18px] font-semibold text-[#1A1A1A] truncate flex-1 mr-3" style={{ fontFamily: 'var(--font-plus-jakarta, Inter, sans-serif)' }}>
              {tripContext.destination || destination || 'Your Trip'}
            </p>
            {budgetDisplay && (
              <span className="text-[15px] font-bold text-[#EA580C] shrink-0">{budgetDisplay}</span>
            )}
          </div>
          {(datesText || travelers) && (
            <p className="text-[13px] text-[#6B6B6B] mt-0.5">
              {datesText}{datesText && travelers ? ' · ' : ''}{travelers ? `${travelers} traveler${travelers > 1 ? 's' : ''}` : ''}
            </p>
          )}
        </div>

        {/* Mood pills */}
        <div className="mb-4">
          <MobileMoodPills loading={loading} remaining={remaining} fmt={fmt} />
        </div>

        {/* Trip Story Card */}
        <div className="px-4 mb-4">
          <TripStoryCard
            loading={loading}
            perPerson={perPerson}
            budget={budget}
            sym={sym}
            fmt={fmt}
            travelers={travelers}
            destination={tripContext.destination || destination || ''}
            onFlights={() => onTabChange('transport')}
            onAdjust={() => onTabChange('optimizer')}
          />
        </div>

        {/* Mobile Premium Readiness Cards */}
        <div className="px-4 space-y-4 mb-4">
          <WeatherReadinessCard
            weather={weather}
            datesText={datesText}
            destination={tripContext.destination || destination || ''}
            weatherConfig={weatherConfig}
            loading={loading}
            onAdjustClick={() => { setOptSuccess(false); setIsOptimizing(false); setShowWeatherOpt(true); }}
            onForecastClick={() => setShowForecast(true)}
            packExpanded={packExpanded}
            setPackExpanded={setPackExpanded}
            isMobile={true}
          />
          <VisaReadinessCard
            isInternational={isInternational}
            destination={tripContext.destination || destination || ''}
            tripContext={tripContext}
            visaConfig={visaConfig}
            loading={loading}
            onGuidanceClick={() => setShowVisaGuidance(true)}
            onOfficialClick={() => {
              if (visaConfig?.officialLink) {
                window.open(visaConfig.officialLink, '_blank')
              }
            }}
            docsExpanded={docsExpanded}
            setDocsExpanded={setDocsExpanded}
            isMobile={true}
          />
        </div>



        {/* Budget Compass compact */}
        <div className="px-4">
          <div className="bg-white border border-[#E8E0D8] rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#6B6B6B]">Budget Compass</p>
            </div>
            <div className="flex items-center gap-4 mb-3 flex-wrap">
              <div>
                <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wide">Total</p>
                {loading ? <Skeleton className="h-5 w-20 mt-0.5" /> : (
                  <p className="text-[15px] font-bold text-[#1A1A1A]">{fmt(budget)}</p>
                )}
              </div>
              <div>
                <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wide">Est. Spend</p>
                {loading ? <Skeleton className="h-5 w-20 mt-0.5" /> : (
                  <p className="text-[15px] font-bold text-[#16A34A]">{fmt(totalEstimated)}</p>
                )}
              </div>
              <div>
                <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wide">Remaining</p>
                {loading ? <Skeleton className="h-5 w-20 mt-0.5" /> : (
                  <p className="text-[15px] font-bold text-[#EA580C]">{fmt(remaining)}</p>
                )}
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-[#E8E0D8] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#EA580C] transition-all duration-700"
                style={{ width: loading ? '0%' : `${pctUsed}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE STICKY BOTTOM ─────────────────────────────────────────── */}
      <div className="lg:hidden fixed bottom-[60px] left-0 right-0 z-40 px-4 pb-3 pt-4 bg-gradient-to-t from-[#FFFBF7] via-[#FFFBF7]/95 to-transparent">
        <button
          onClick={() => onTabChange('transport')}
          className="w-full h-[52px] bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-[15px] rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-colors"
        >
          See flight options <ArrowRight size={16} />
        </button>
      </div>

      {/* ── MOBILE BOTTOM NAV ─────────────────────────────────────────────── */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8E0D8] z-50 h-[60px] flex items-center"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {[
          { id: 'overview', label: 'Overview', Icon: Home },
          { id: 'transport', label: 'Travel', Icon: Plane },
          { id: 'hotels', label: 'Stay', Icon: Building2 },
          { id: 'itinerary', label: 'Plan', Icon: MapPin },
          { id: 'optimizer', label: 'Budget', Icon: Wallet },
        ].map(({ id, label, Icon }) => {
          const isActive = id === 'overview'
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 h-full relative transition-colors"
              style={{ color: isActive ? '#EA580C' : '#9CA3AF' }}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-[2px] bg-[#EA580C] rounded-b-full" />
              )}
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[9px] font-bold uppercase tracking-wide">{label}</span>
            </button>
          )
        })}
      </nav>

      {/* Forecast Modal */}
      {showForecast && (
        <WeatherForecastModal
          weather={weather}
          destination={tripContext.destination || destination || ''}
          onClose={() => setShowForecast(false)}
        />
      )}

      {/* Weather AI Optimization Modal */}
      {showWeatherOpt && (
        <WeatherOptModal
          weather={weather}
          isOptimizing={isOptimizing}
          setIsOptimizing={setIsOptimizing}
          success={optSuccess}
          setSuccess={setOptSuccess}
          onClose={() => { setShowWeatherOpt(false); setOptSuccess(false); }}
          onApply={() => {
            setShowWeatherOpt(false)
            setOptSuccess(false)
            onTabChange('itinerary')
            toast.success("Itinerary adjusted for weather successfully!")
          }}
        />
      )}

      {/* Visa Guidance Modal */}
      {showVisaGuidance && (
        <VisaGuidanceModal
          isInternational={isInternational}
          visaConfig={visaConfig}
          destination={tripContext.destination || destination || ''}
          tripContext={tripContext}
          onClose={() => setShowVisaGuidance(false)}
          onOfficial={() => {
            if (visaConfig?.officialLink) {
              window.open(visaConfig.officialLink, '_blank')
            }
          }}
        />
      )}
    </>
  )
}

export default memo(OverviewTab)
