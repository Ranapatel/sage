'use client'

import React, { memo, useMemo, useState, useEffect } from 'react'
import {
  Plane, Building2, MapPin, Wallet, Sparkles,
  ArrowRight, Check, Home, Info, Share2, Bookmark,
  Sun, CloudRain, CloudSun, ShieldAlert, ChevronDown, ChevronUp,
  ExternalLink, Calendar, Clock, Briefcase, AlertTriangle, AlertCircle, X, FileDown
} from 'lucide-react'
import { SYMBOLS } from '@/lib/currency'
import { useAuthStore } from '@/store/authStore'
import { useTripStore } from '@/store/tripStore'
import { getDaysBetween, formatDate } from '@/lib/utils'
import { getVisaInfo } from '@/lib/visaData'
import toast from 'react-hot-toast'
import TransportCard from '../transport/TransportCard'
import HotelCard from '../hotel/HotelCard'
import HotelDetailModal from '../hotel/HotelDetailModal'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

// â”€â”€â”€ Destination background images â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€ Props â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ Skeleton shimmer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ Budget math â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function useBudgetBreakdown(budget: number, nights: number, travelers: number, currency: string) {
  return useMemo(() => {
    const sym = SYMBOLS[currency] ?? currency
    const locale = currency === 'INR' ? 'en-IN' : 'en-US'
    const fmt = (n: number) => `${sym}${Math.round(n).toLocaleString(locale)}`

    // Realistic proportions summing to ~85% â€” leaves a 15% buffer for incidentals
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

// â”€â”€â”€ Empty state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function EmptyState({ onTabChange }: { onTabChange: (t: string) => void }) {
  const POPULAR = ['Goa', 'Manali', 'Bali', 'Dubai', 'Singapore', 'Kerala', 'Jaipur', 'Bangkok']
  const FEATURES = [
    { icon: 'âœˆï¸', label: 'Live Flights' },
    { icon: 'ðŸ¨', label: 'Real Hotels' },
    { icon: 'ðŸ¤–', label: 'AI Itinerary' },
    { icon: 'ðŸŒ¤ï¸', label: 'Live Weather' },
    { icon: 'ðŸš‚', label: 'Trains & Buses' },
    { icon: 'ðŸ’°', label: 'Budget AI' },
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 text-center space-y-8">

      {/* Hero icon with pulse ring */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-orange-100 animate-ping opacity-30 scale-150" />
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-[#EA580C] to-[#F97316] flex items-center justify-center shadow-lg shadow-orange-200">
            <span className="text-4xl">ðŸŒ</span>
          </div>
        </div>
      </div>

      {/* Headline */}
      <div className="space-y-3">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] leading-tight">
          Where are you headed?
        </h2>
        <p className="text-[15px] text-[#6B6B6B] leading-relaxed max-w-md mx-auto">
          Fill in your <span className="text-[#EA580C] font-semibold">From</span>,{' '}
          <span className="text-[#EA580C] font-semibold">To</span>, dates, and budget above â€” then hit{' '}
          <span className="inline-flex items-center gap-1 text-[#EA580C] font-bold bg-orange-50 px-2 py-0.5 rounded-lg">
            ðŸ” Search
          </span>{' '}
          to generate your complete trip board.
        </p>
      </div>

      {/* Feature chips */}
      <div className="flex flex-wrap justify-center gap-2">
        {FEATURES.map(f => (
          <span
            key={f.label}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E8E0D8] rounded-full text-[13px] font-semibold text-[#4B4B4B] shadow-sm"
          >
            <span>{f.icon}</span> {f.label}
          </span>
        ))}
      </div>

      {/* Popular destinations */}
      <div className="space-y-3">
        <p className="text-[12px] font-black text-[#9CA3AF] uppercase tracking-widest">Popular destinations</p>
        <div className="flex flex-wrap justify-center gap-2">
          {POPULAR.map(city => (
            <button
              key={city}
              className="px-4 py-2 bg-[#FFFBF7] border border-[#E8E0D8] hover:border-[#EA580C] hover:bg-orange-50 hover:text-[#EA580C] rounded-xl text-[13px] font-semibold text-[#4B4B4B] transition-all active:scale-[0.97]"
              onClick={() => {
                // Scroll to search and hint the destination
                const toInput = document.querySelector<HTMLInputElement>('input[placeholder="To..."]')
                if (toInput) {
                  toInput.focus()
                  toInput.value = city
                  toInput.dispatchEvent(new Event('input', { bubbles: true }))
                }
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Arrow pointing up to search */}
      <div className="flex flex-col items-center gap-2 text-[#9CA3AF]">
        <div className="flex flex-col items-center gap-1 animate-bounce">
          <div className="w-px h-8 bg-gradient-to-t from-[#EA580C] to-transparent" />
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" className="rotate-180 text-[#EA580C]">
            <path d="M1 7L6 2L11 7" stroke="#EA580C" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <p className="text-[12px] font-medium">Search is up there ↑</p>
      </div>

    </div>
  )
}

// â”€â”€â”€ LEFT: Trip Mood Panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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


// â”€â”€â”€ LEFT: Journey Flow â€” vertical timeline â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ CENTER: Trip Story Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function TripStoryCard({
  loading, perPerson, budget, sym, fmt, travelers, destination, onFlights, onAdjust
}: {
  loading: boolean; perPerson: number; budget: number; sym: string; fmt: (n: number) => string
  travelers: number; destination: string; onFlights: () => void; onAdjust: () => void
}) {
  const locale = sym === 'â‚¹' ? 'en-IN' : 'en-US'
  const imgUrl = getDestinationImage(destination)

  return (
    <div className="bg-white border border-[#E8E0D8] rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.06)]">

      {/* â”€â”€ Destination hero image with dark gradient overlay (desktop) â”€â”€ */}
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
        {/* Dark gradient â€” bottom fade so content below is on white */}
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
          <p className="text-[14px] text-slate-600 font-medium italic leading-relaxed mb-5">
            Fast route with a well-located stay — leaves room for food, local travel, and activities.
          </p>
        )}

        {/* Budget subtitle on white */}
        {!loading && budget > 0 && (
          <p className="text-[12px] text-slate-400 font-semibold mb-5">of {fmt(budget)} total budget</p>
        )}

        {/* CTAs */}
        <div className="space-y-3">
          <button
            onClick={onFlights}
            className="w-full h-12 bg-[#EA580C] hover:bg-[#C2410C] text-white font-extrabold text-[15px] rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]"
          >
            See flight options <ArrowRight size={16} />
          </button>
          <button
            onClick={onAdjust}
            className="w-full h-11 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-extrabold text-[14px] rounded-xl flex items-center justify-center transition-all active:scale-[0.98]"
          >
            Adjust my plan
          </button>
        </div>
      </div>

      {/* â”€â”€ Mobile: image top panel â”€â”€ */}
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
                  {sym}{perPerson > 0 ? Math.round(perPerson).toLocaleString(locale) : 'â€”'}
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


// â”€â”€â”€ RIGHT: Budget Compass â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ MOBILE: Horizontal Mood Pills â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
            <span>Weather Forecast â€” {destinationCity}</span>
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
              <p className="text-3xl font-bold text-[#1A1A1A] font-mono">{weather.temperature}Â°C</p>
              <p className="text-sm font-semibold text-[#6B6B6B] mt-0.5">{weather.condition}</p>
              <p className="text-xs text-[#9CA3AF] mt-0.5">Feels like {weather.feelsLike || weather.temperature}Â°C</p>
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
                      <span className="text-red-500">{f.high}Â°</span> / <span className="text-blue-500">{f.low}Â°</span>
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
                âœ“
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
                <span>Visa Guidance â€” {visaConfig?.country}</span>
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
}: {
  weather: any
  datesText: string | null
  destination: string
  weatherConfig: any
  loading: boolean
  onAdjustClick: () => void
  onForecastClick: () => void
  packExpanded?: boolean
  setPackExpanded?: (val: boolean) => void
  isMobile?: boolean
}) {
  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3 h-[320px]">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (!weather || !weatherConfig) return null

  const destinationCity = destination ? destination.split(',')[0].replace(/[^a-zA-Z\s]/g, '').trim() : 'Destination'
  const displayDates = datesText ? datesText.replace(/[^\x00-\x7F]/g, ' ').replace(/\s+/g, ' ').trim() : ''

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between h-[320px] text-left relative overflow-hidden group">
      
      {/* Dynamic Background Ambient Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-sky-500/5 to-transparent pointer-events-none" />

      <div className="relative z-10 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100/80 p-2 flex items-center justify-center text-[#EA580C] shrink-0 border border-orange-200/60 shadow-xs">
              <CloudSun size={20} strokeWidth={2.2} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                Weather Readiness
              </h3>
              <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                {destinationCity} {displayDates ? `• ${displayDates}` : ''}
              </p>
            </div>
          </div>
          
          <span
            className="text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs shrink-0"
            style={{
              color: weatherConfig.badgeColor,
              background: weatherConfig.badgeBg,
              borderColor: weatherConfig.badgeBorder,
            }}
          >
            {weatherConfig.status}
          </span>
        </div>

        {/* Temperature & Rain Gauge Bar */}
        <div className="grid grid-cols-2 gap-2.5 bg-gradient-to-r from-orange-50/70 to-amber-50/70 border border-orange-200/50 rounded-xl p-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center text-[#EA580C] shrink-0">
              <Sun size={16} />
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Temp</span>
              <span className="text-base font-black text-slate-900 leading-none block mt-0.5 font-mono">
                {weather.temperature}°C
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 border-l border-orange-200/60 pl-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
              <CloudRain size={16} />
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Rain Chance</span>
              <span className="text-base font-black text-slate-900 leading-none block mt-0.5 font-mono">
                {weather.percentage}%
              </span>
            </div>
          </div>
        </div>

        {/* 5-Hour Forecast Strip */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-2 flex items-center justify-between text-center gap-1">
          <div className="flex-1">
            <span className="text-[8px] font-bold text-slate-400 block">09:00</span>
            <span className="text-xs block my-0.5">☀️</span>
            <span className="text-[11px] font-black text-slate-800 block">26°</span>
          </div>
          <div className="w-[1px] h-5 bg-slate-200" />
          <div className="flex-1">
            <span className="text-[8px] font-bold text-slate-400 block">12:00</span>
            <span className="text-xs block my-0.5">⛅</span>
            <span className="text-[11px] font-black text-slate-800 block">28°</span>
          </div>
          <div className="w-[1px] h-5 bg-slate-200" />
          <div className="flex-1 bg-orange-100/60 rounded-md py-0.5 border border-orange-200/50">
            <span className="text-[8px] font-extrabold text-[#EA580C] block">15:00</span>
            <span className="text-xs block my-0.5">⛈️</span>
            <span className="text-[11px] font-black text-[#EA580C] block">24°</span>
          </div>
          <div className="w-[1px] h-5 bg-slate-200" />
          <div className="flex-1">
            <span className="text-[8px] font-bold text-slate-400 block">18:00</span>
            <span className="text-xs block my-0.5">🌧️</span>
            <span className="text-[11px] font-black text-slate-800 block">23°</span>
          </div>
          <div className="w-[1px] h-5 bg-slate-200" />
          <div className="flex-1">
            <span className="text-[8px] font-bold text-slate-400 block">21:00</span>
            <span className="text-xs block my-0.5">🌤️</span>
            <span className="text-[11px] font-black text-slate-800 block">25°</span>
          </div>
        </div>

        {/* Outdoor Window & Packing */}
        <div className="flex items-center justify-between text-[11px] text-slate-700 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
          <span className="font-extrabold text-[#EA580C] flex items-center gap-1">
            <Clock size={13} /> {weatherConfig.bestWindow}
          </span>
          <span className="font-semibold text-slate-500">
            ☂️ Umbrella • Raincoat
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex gap-2 relative z-10">
        <button
          onClick={onAdjustClick}
          className="flex-1 py-2 text-xs font-extrabold text-white bg-gradient-to-r from-[#EA580C] to-[#F97316] hover:shadow-md hover:shadow-orange-500/20 rounded-xl transition-all text-center cursor-pointer active:scale-[0.98]"
        >
          Adjust Itinerary →
        </button>
        <button
          onClick={onForecastClick}
          className="flex-1 py-2 text-xs font-extrabold text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-xl transition-all text-center cursor-pointer active:scale-[0.98]"
        >
          View Forecast
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
}: {
  isInternational: boolean
  destination: string
  tripContext: any
  visaConfig: any
  loading: boolean
  onGuidanceClick: () => void
  onOfficialClick: () => void
  docsExpanded?: boolean
  setDocsExpanded?: (val: boolean) => void
  isMobile?: boolean
}) {
  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3 h-[320px]">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  // Domestic View
  if (!isInternational) {
    const destinationCity = destination ? destination.split(',')[0].replace(/[^a-zA-Z\s]/g, '').trim() : 'Destination'
    const startCity = tripContext.startLocation ? tripContext.startLocation.split(',')[0].replace(/[^a-zA-Z\s]/g, '').trim() : 'Origin'
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between h-[320px] text-left relative overflow-hidden group">
        
        {/* Dynamic Background Ambient Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-transparent pointer-events-none" />

        <div className="relative z-10 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100/80 p-2 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-200/60 shadow-xs">
                <Plane size={20} strokeWidth={2.2} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                  Travel Readiness
                </h3>
                <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                  {startCity} → {destinationCity}
                </p>
              </div>
            </div>
            
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-300 shadow-xs">
              READY
            </span>
          </div>

          {/* Guarantee Banner */}
          <div className="bg-emerald-50/80 border border-emerald-200/70 rounded-xl p-3 flex gap-2.5 items-center">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-700 flex items-center justify-center shrink-0">
              <Check size={16} strokeWidth={3} />
            </div>
            <div>
              <p className="text-xs font-black text-emerald-950">No Visa Required</p>
              <p className="text-[11px] text-emerald-800 font-medium leading-tight mt-0.5">
                Hassle-free domestic travel within India.
              </p>
            </div>
          </div>

          {/* Required Documents */}
          <div className="space-y-1.5 bg-slate-50 border border-slate-100 rounded-xl p-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Mandatory Travel IDs</span>
            <div className="space-y-1 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>Govt Issued Photo ID (Aadhaar / Passport / License)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>Airline Boarding Pass / Ticket Confirmation</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 relative z-10">
          <button
            onClick={onGuidanceClick}
            className="w-full py-2 text-xs font-extrabold text-emerald-700 border border-emerald-300 hover:bg-emerald-50 rounded-xl transition-all text-center cursor-pointer active:scale-[0.98]"
          >
            Check Domestic Guidelines →
          </button>
        </div>
      </div>
    )
  }

  // International View
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between h-[320px] text-left relative overflow-hidden group">
      
      <div className="relative z-10 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100/80 p-2 flex items-center justify-center text-[#EA580C] shrink-0 border border-orange-200/60 shadow-xs">
              <ShieldAlert size={20} strokeWidth={2.2} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                Visa Readiness
              </h3>
              <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                Passport → {visaConfig?.country || destination}
              </p>
            </div>
          </div>
          
          <span
            className="text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs shrink-0"
            style={{
              color: visaConfig?.badgeColor || '#EA580C',
              background: visaConfig?.badgeBg || '#FFF7ED',
              borderColor: visaConfig?.badgeBorder || '#FFEDD5',
            }}
          >
            {visaConfig?.badge || 'Visa Check'}
          </span>
        </div>

        {/* Visa Info Box */}
        <div className="bg-orange-50/60 border border-orange-100 rounded-xl p-3 space-y-1">
          <span className="text-[10px] font-black text-orange-600 uppercase tracking-wider block">Visa Status</span>
          <p className="text-xs font-black text-slate-900">{visaConfig?.visaStatus || 'Visa Required on Arrival'}</p>
        </div>

        {/* Required Documents */}
        <div className="space-y-1.5 bg-slate-50 border border-slate-100 rounded-xl p-3">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Required Documents</span>
          <p className="text-xs font-medium text-slate-700 leading-relaxed">
            Valid Passport (6 months validity), Return Flight Ticket, Proof of Hotel Booking.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex gap-2 relative z-10">
        <button
          onClick={onGuidanceClick}
          className="flex-1 py-2 text-xs font-extrabold text-[#EA580C] border border-[#EA580C] hover:bg-orange-50 rounded-xl transition-all text-center cursor-pointer active:scale-[0.98]"
        >
          View Guidance
        </button>
        <button
          onClick={onOfficialClick}
          className="flex-1 py-2 text-xs font-extrabold text-white bg-[#EA580C] hover:bg-[#C2410C] rounded-xl transition-all text-center cursor-pointer active:scale-[0.98]"
        >
          Official Portal
        </button>
      </div>
    </div>
  )
}

function TransitComparisonCard({
  transport,
  loading,
  onTabChange,
  fmt,
}: {
  transport: any[]
  loading: boolean
  onTabChange: (tab: string) => void
  fmt: (price: number) => string
}) {
  const comparisonData = useMemo(() => {
    if (!transport || transport.length === 0) return []

    const modes = ['flight', 'train', 'bus', 'car'] as const
    const labelMap = { flight: 'Flight', train: 'Train', bus: 'Bus', car: 'Cab/Car' }
    const iconMap = { flight: '✈️', train: '🚆', bus: '🚌', car: '🚗' }

    return modes.map(mode => {
      const options = transport.filter(t => t.type === mode)
      if (options.length === 0) return null

      // Cheapest option (min price)
      const cheapest = options.reduce((min, cur) => cur.price < min.price ? cur : min, options[0])
      
      // Fast duration parsed or calculated
      const getDurationMinutes = (durationStr: string) => {
        let mins = 0
        const hMatch = durationStr.match(/(\d+)\s*h/)
        const mMatch = durationStr.match(/(\d+)\s*m/)
        if (hMatch) mins += parseInt(hMatch[1]) * 60
        if (mMatch) mins += parseInt(mMatch[1])
        return mins || 99999
      }
      const fastest = options.reduce((fast, cur) => {
        const curMins = getDurationMinutes(cur.duration || '')
        const fastMins = getDurationMinutes(fast.duration || '')
        return curMins < fastMins ? cur : fast
      }, options[0])

      return {
        type: mode,
        label: labelMap[mode],
        icon: iconMap[mode],
        price: cheapest.price,
        duration: fastest.duration || 'N/A',
        cheapestOption: cheapest,
        fastestOption: fastest
      }
    }).filter(Boolean) as Array<{
      type: 'flight' | 'train' | 'bus' | 'car'
      label: string
      icon: string
      price: number
      duration: string
    }>
  }, [transport])

  if (loading) {
    return (
      <div className="bg-white border border-[#E8E0D8] rounded-xl p-5 shadow-sm space-y-3 text-left">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  if (comparisonData.length === 0) return null

  const cheapestPrice = Math.min(...comparisonData.map(d => d.price))
  const parseDuration = (dStr: string) => {
    let mins = 0
    const hMatch = dStr.match(/(\d+)\s*h/)
    const mMatch = dStr.match(/(\d+)\s*m/)
    if (hMatch) mins += parseInt(hMatch[1]) * 60
    if (mMatch) mins += parseInt(mMatch[1])
    return mins || 99999
  }
  const fastestDuration = Math.min(...comparisonData.map(d => parseDuration(d.duration)))

  return (
    <div className="bg-white border border-[#E8E0D8] rounded-xl p-5 shadow-sm text-left">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="text-[#EA580C]" size={20} />
        <div>
          <h3 className="text-[15px] font-bold text-[#1A1A1A] leading-tight">Transit Mode Comparison</h3>
          <p className="text-[11px] text-[#6B6B6B] mt-0.5">Cheapest & fastest transit options side-by-side</p>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {comparisonData.map((item) => {
          let badgeText = ''
          let badgeColor = 'text-slate-600 bg-slate-50 border-slate-200'
          if (item.price === cheapestPrice) {
            badgeText = 'Cheapest'
            badgeColor = 'text-[#16A34A] bg-[#F0FDF4] border-[#BBF7D0]'
          } else if (parseDuration(item.duration) === fastestDuration) {
            badgeText = 'Fastest'
            badgeColor = 'text-[#0284C7] bg-[#F0F9FF] border-[#BAE6FD]'
          } else if (item.type === 'train') {
            badgeText = 'Eco-Friendly'
            badgeColor = 'text-[#0D9488] bg-[#F0FDFA] border-[#CCFBF1]'
          }

          return (
            <div
              key={item.type}
              onClick={() => onTabChange(item.type === 'flight' ? 'transport' : item.type === 'train' ? 'trains' : item.type === 'bus' ? 'buses' : 'cars')}
              className="flex items-center justify-between py-2.5 hover:bg-slate-50/50 px-1 rounded-lg transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{item.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-[#1A1A1A]">{item.label}</p>
                  <p className="text-[11px] text-[#8E8E93]">{item.duration}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {badgeText && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor} uppercase tracking-wider`}>
                    {badgeText}
                  </span>
                )}
                <span className="text-sm font-bold text-[#1A1A1A]">{fmt(item.price)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}



// â”€â”€â”€ ROOT COMPONENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
  const [pdfGenerating, setPdfGenerating] = useState(false)

  const handleDownloadPDF = async () => {
    const element = document.getElementById('trip-board-overview')
    if (!element) {
      toast.error("Trip board contents not found for export.")
      return
    }

    setPdfGenerating(true)
    const loadToast = toast.loading("Generating your travel plan PDF...")

    try {
      // Setup high DPI options for crisp text rendering
      const options = {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FFFBF7',
        logging: false
      }

      const canvas = await html2canvas(element, options)
      const imgData = canvas.toDataURL('image/png')

      // Calculate A4 page dimensions
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgWidth = 210 // A4 width in mm
      const pageHeight = 295 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      const destName = (tripContext.destination || destination || 'MyTrip').split(',')[0].trim().replace(/\s+/g, '_')
      pdf.save(`${destName}_Itinerary_TripSage.pdf`)
      toast.dismiss(loadToast)
      toast.success("PDF downloaded successfully!")
    } catch (err) {
      console.error(err)
      toast.dismiss(loadToast)
      toast.error("Could not generate PDF.")
    } finally {
      setPdfGenerating(false)
    }
  }


  const destClean = (tripContext.destination || destination || '').toLowerCase()
  const domesticCities = [
    'goa', 'manali', 'kerala', 'rishikesh', 'jaipur', 'kashmir', 'andaman', 'delhi', 'mumbai', 'hyderabad', 'bangalore', 'bengaluru', 'agra', 'varanasi', 'kochi', 'udaipur', 'shimla', 'darjeeling', 'amritsar', 'mysuru', 'srinagar', 'ooty', 'visakhapatnam', 'coimbatore', 'bhopal', 'indore', 'chandigarh', 'nagpur', 'lucknow', 'patna'
  ]
  const isDestDomestic = domesticCities.some(city => destClean.includes(city)) || destClean.includes('india')
  const isInternational = !isDestDomestic && destClean.length > 0

  const visaConfig = useMemo(() => {
    if (!isInternational) return null
    return getVisaInfo(destClean)
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
  const routeText = useMemo(() => {
    if (tripContext.isMultiCity && tripContext.stops && tripContext.stops.length > 0) {
      const stopCities = tripContext.stops.map(s => s.city.split(',')[0].trim()).join(' → ')
      const origin = (tripContext.startLocation || 'Origin').split(',')[0].trim()
      return `${origin} → ${stopCities} → ${origin}`
    }
    return tripContext.startLocation && tripContext.destination
      ? `${tripContext.startLocation.split(',')[0].trim()} → ${tripContext.destination.split(',')[0].trim()}`
      : tripContext.destination || destination || 'Your Trip'
  }, [tripContext.isMultiCity, tripContext.stops, tripContext.startLocation, tripContext.destination, destination])

  const datesText = tripContext.startDate && tripContext.endDate
    ? `${formatDate(tripContext.startDate)} â€“ ${formatDate(tripContext.endDate)} Â· ${days}d`
    : null

  const budgetDisplay = budget > 0 ? `${sym}${Math.round(budget).toLocaleString(locale)}` : null

  return (
    <div id="trip-board-overview">
      {/* Shimmer keyframe */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) }
          100% { transform: translateX(100%) }
        }
        .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      {/* DESKTOP LAYOUT */}
      <div className="hidden lg:block">

        {/* Two-column Apple/Google Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* MAIN (LEFT 8 COLS) */}
          <div className="lg:col-span-8 space-y-6">
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

            {/* Transit Comparison Widget */}
            <TransitComparisonCard
              transport={transport}
              loading={loading}
              onTabChange={onTabChange}
              fmt={fmt}
            />

            {/* Premium Readiness Cards Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          {/* ASIDE (RIGHT 4 COLS) */}
          <div className="lg:col-span-4 space-y-5">
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
            <TripMoodPanel weather={weather} remaining={remaining} fmt={fmt} loading={loading} />
            <JourneyFlowVertical loading={loading} />
          </div>

        </div>
      </div>

      {/* â”€â”€ MOBILE LAYOUT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="lg:hidden pb-[140px]">

        {/* Compact mobile header */}
        <div className="px-4 mb-4">
          <div className="flex items-center justify-between">
            <p className="text-[18px] font-semibold text-[#1A1A1A] truncate flex-1 mr-3" style={{ fontFamily: 'var(--font-plus-jakarta, Inter, sans-serif)' }}>
              {routeText}
            </p>
            {budgetDisplay && (
              <span className="text-[15px] font-bold text-[#EA580C] shrink-0">{budgetDisplay}</span>
            )}
          </div>
          {(datesText || travelers) && (
            <p className="text-[13px] text-[#6B6B6B] mt-0.5">
              {datesText}{datesText && travelers ? ' Â· ' : ''}{travelers ? `${travelers} traveler${travelers > 1 ? 's' : ''}` : ''}
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

        {/* Mobile Transit Comparison Widget */}
        <div className="px-4 mb-4">
          <TransitComparisonCard
            transport={transport}
            loading={loading}
            onTabChange={onTabChange}
            fmt={fmt}
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

      {/* â”€â”€ MOBILE STICKY BOTTOM â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="lg:hidden fixed bottom-[60px] left-0 right-0 z-40 px-4 pb-3 pt-4 bg-gradient-to-t from-[#FFFBF7] via-[#FFFBF7]/95 to-transparent">
        <button
          onClick={() => onTabChange('transport')}
          className="w-full h-[52px] bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-[15px] rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-colors"
        >
          See transport options <ArrowRight size={16} />
        </button>
      </div>

      {/* â”€â”€ MOBILE BOTTOM NAV â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8E0D8] z-50 h-[60px] flex items-center"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {[
          { id: 'overview', label: 'Overview', Icon: Home },
          { id: 'transport', label: 'Transport', Icon: Plane },
          { id: 'hotels', label: 'Stay', Icon: Building2 },
          { id: 'itinerary', label: 'Plan', Icon: MapPin },
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
    </div>
  )
}

export default memo(OverviewTab)
