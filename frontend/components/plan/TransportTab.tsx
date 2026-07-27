'use client'

import React, { memo, useMemo, useState } from 'react'
import {
  Plane, Bus, Car, Clock, Wallet, Shield, Star,
  ArrowRight, Sparkles, CheckCircle2, AlertCircle,
  TrendingUp, Zap, ChevronRight, ChevronLeft, ExternalLink, Train, Share2, Banknote
} from 'lucide-react'
import { SYMBOLS } from '@/lib/currency'
import { useTripStore } from '@/store/tripStore'
import { trackEvent } from '@/lib/analytics'
import TransportPlanner from '@/components/transport-intelligence/TransportPlanner'
import TrainsPanel from '@/components/transport/TrainsPanel'
import BusesPanel from '@/components/transport/BusesPanel'
import AiFlightSearch from '@/components/flight/AiFlightSearch'
import CarsTab from '@/components/transport/CarsTab'
import LiveBookingToast from '@/components/ui/LiveBookingToast'
import toast from 'react-hot-toast'
import { isSameCountry } from '@/lib/countryUtils'
import { 
  Icon3DOverview, 
  Icon3DTransport, 
  Icon3DTrain, 
  Icon3DBus, 
  Icon3DCar, 
  Icon3DSmartRoute 
} from '@/components/ui/TripSageIcons'

export const handleUniversalShare = (item: any) => {
  const cleanName = item.name?.split('—')[0]?.trim() ?? 'Transit Option'
  const fareStr = item.price ? `₹${Math.round(item.price)}` : 'Estimate'
  
  const shareTitle = `TripSage Travel Recommendation`
  const shareText = `Check out this travel option on TripSage:\n\n* ${cleanName}\nTiming: ${item.departure || ''} - ${item.arrival || ''} (${item.duration || ''})\nPrice: ${fareStr}/person\n\nPlan and view details on TripSage!`
  const shareUrl = `https://tripsage.in/plan`

  if (navigator.share) {
    navigator.share({
      title: shareTitle,
      text: shareText,
      url: shareUrl,
    }).catch(() => {})
  } else {
    navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
      .then(() => toast.success('Link & route details copied! Paste it in WhatsApp, Email, or anywhere.'))
      .catch(() => toast.error('Could not copy link.'))
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  transport: any[]
  loading: boolean
  tripContext: any
  searchForm: any
  budget?: number
  hotelCostSpent?: number
  currency?: string
  error?: string | null
}

type Segment = 'recommended' | 'flights' | 'trains' | 'buses' | 'cabs' | 'smart-routes'

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 6d14ce1 (Fix itinerary photo upload system improvements)
// ─── Airline badge data ───────────────────────────────────────────────────────

const AIRLINE_LOGOS: Record<string, string> = {
  indigo:    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/IndiGo_Airlines_logo.svg/200px-IndiGo_Airlines_logo.svg.png',
  '6e':      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/IndiGo_Airlines_logo.svg/200px-IndiGo_Airlines_logo.svg.png',
  'air india': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Air_India_Logo.svg/200px-Air_India_Logo.svg.png',
  ai:        'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Air_India_Logo.svg/200px-Air_India_Logo.svg.png',
  spicejet:  'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/SpiceJet_logo.svg/200px-SpiceJet_logo.svg.png',
  sg:        'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/SpiceJet_logo.svg/200px-SpiceJet_logo.svg.png',
  vistara:   'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Vistara_Logo.svg/200px-Vistara_Logo.svg.png',
  uk:        'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Vistara_Logo.svg/200px-Vistara_Logo.svg.png',
  akasa:     'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Akasa_Air_logo.svg/200px-Akasa_Air_logo.svg.png',
  qp:        'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Akasa_Air_logo.svg/200px-Akasa_Air_logo.svg.png',
}

// Airline brand colors for initials fallback
const AIRLINE_COLORS: Record<string, string> = {
  indigo: '#1A1F71', 'air india': '#C8102E', spicejet: '#FF4500',
  vistara: '#6D2077', akasa: '#F97316', emirates: '#EF3340',
  qatar: '#5C0632', singapore: '#1E3A5F', default: '#EA580C',
}

// ─── Airline aircraft background photos ───────────────────────────────────────
// Curated high-res official aircraft livery photography.
const AIRLINE_IMAGES: Record<string, string> = {
  indigo:       'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=1200&q=85&auto=format&fit=crop',
  '6e':         'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=1200&q=85&auto=format&fit=crop',
  'air india':  'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=1200&q=85&auto=format&fit=crop',
  ai:           'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=1200&q=85&auto=format&fit=crop',
  spicejet:     'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=1200&q=85&auto=format&fit=crop',
  sg:           'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=1200&q=85&auto=format&fit=crop',
  vistara:      'https://images.unsplash.com/photo-1517479149777-5f3b1511d5ad?w=1200&q=85&auto=format&fit=crop',
  uk:           'https://images.unsplash.com/photo-1517479149777-5f3b1511d5ad?w=1200&q=85&auto=format&fit=crop',
  akasa:        'https://images.unsplash.com/photo-1508672019048-805479767ca1?w=1200&q=85&auto=format&fit=crop',
  qp:           'https://images.unsplash.com/photo-1508672019048-805479767ca1?w=1200&q=85&auto=format&fit=crop',
  emirates:     'https://images.unsplash.com/photo-1543073847-d80f7a0e0c7b?w=1200&q=85&auto=format&fit=crop',
  ek:           'https://images.unsplash.com/photo-1543073847-d80f7a0e0c7b?w=1200&q=85&auto=format&fit=crop',
  qatar:        'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=1200&q=85&auto=format&fit=crop',
  singapore:    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&q=85&auto=format&fit=crop',
  'air asia':   'https://images.unsplash.com/photo-1529258283598-8d6fe60b27f4?w=1200&q=85&auto=format&fit=crop',
  'thai':       'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1200&q=85&auto=format&fit=crop',
  'malaysia':   'https://images.unsplash.com/photo-1526397751294-331021109fbd?w=1200&q=85&auto=format&fit=crop',
}

const CAB_IMAGES: Record<string, string> = {
  hertz:        'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=900&q=80&auto=format&fit=crop',
  avis:         'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=900&q=80&auto=format&fit=crop',
  rentalcars:   'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&q=80&auto=format&fit=crop',
  discovercars: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=900&q=80&auto=format&fit=crop',
  default:      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=900&q=80&auto=format&fit=crop',
}

const FALLBACK_FLIGHT_IMG = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=900&q=80&auto=format&fit=crop'

/** Returns the best background image for ANY transport item (Flight, Cab, Train, Bus). */
function getCardBgImage(item: any): string {
  if (item.image && !item.image.includes('placeholder')) return item.image
  const name = (item.name ?? '').toLowerCase()
  const type = (item.type ?? '').toLowerCase()
  
  if (type === 'car' || type === 'cab' || name.includes('hertz') || name.includes('avis') || name.includes('rental')) {
    for (const [key, url] of Object.entries(CAB_IMAGES)) {
      if (name.includes(key)) return url
    }
    return CAB_IMAGES.default
  }

  for (const [key, url] of Object.entries(AIRLINE_IMAGES)) {
    if (name.includes(key)) return url
  }
  return FALLBACK_FLIGHT_IMG
}

function getAirlineLogo(name: string): string | null {
  const lower = name.toLowerCase()
  for (const [key, url] of Object.entries(AIRLINE_LOGOS)) {
    if (lower.includes(key)) return url
  }
  return null
}

function getAirlineColor(name: string): string {
  const lower = name.toLowerCase()
  for (const [key, color] of Object.entries(AIRLINE_COLORS)) {
    if (lower.includes(key)) return color
  }
  return AIRLINE_COLORS.default
}

function getAirlineInitials(name: string): string {
  const clean = name.split('—')[0].split('-')[0].trim()
  const words = clean.split(' ').filter(Boolean)
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase()
  return clean.slice(0, 2).toUpperCase()
}
<<<<<<< HEAD
=======
>>>>>>> e444a81 (Save local changes)
=======
>>>>>>> 6d14ce1 (Fix itinerary photo upload system improvements)

// ─── Sage Score calculation ───────────────────────────────────────────────────

function calcSageScore(item: any, allItems: any[]): number {
  if (!item) return 75
  
  // 1. Same-category price normalization (35%)
  const sameTypeItems = (allItems || []).filter(i => (i.type || 'flight') === (item.type || 'flight'))
  const itemsToCompare = sameTypeItems.length > 0 ? sameTypeItems : (allItems || [])
  const prices = itemsToCompare.map(i => i.price).filter(p => p != null && p > 0)
  
  let priceScore = 75
  if (prices.length > 1 && item.price) {
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    if (maxPrice > minPrice) {
      // Cheaper options get higher score
      priceScore = Math.round(60 + ((maxPrice - item.price) / (maxPrice - minPrice)) * 35)
    } else {
      priceScore = 90
    }
  }

  // 2. Rating & Reputation (30%)
  let ratingScore = 75
  if (item.rating != null && item.rating > 0) {
    ratingScore = Math.min(100, Math.round((item.rating / 5) * 100))
  } else {
    // Deterministic reputation score based on provider name & ID
    const str = `${item.id || ''}-${item.name || ''}`
    let hash = 0
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
    ratingScore = 72 + (Math.abs(hash) % 24) // Dynamic 72 to 95 range
  }

  // 3. Duration / Convenience (20%)
  let convScore = 80
  if (item.stops === 0) convScore = 95
  else if (item.stops > 0) convScore = Math.max(50, 95 - item.stops * 15)

  // 4. Source & Real-time Verification Bonus (15%)
  let liveBonus = 75
  if (item.source === 'live') liveBonus = 95
  else if (item.source === 'affiliate_redirect') liveBonus = 85

  const finalScore = Math.round(
    priceScore * 0.35 +
    ratingScore * 0.30 +
    convScore * 0.20 +
    liveBonus * 0.15
  )

  return Math.max(65, Math.min(99, finalScore))
}

// ─── Sage Score Badge (SVG ring) ─────────────────────────────────────────────

function SageScoreRing({ score: rawScore, dark }: { score: number; dark?: boolean }) {
  const score = Number.isFinite(rawScore) ? Math.max(0, Math.min(100, Math.round(rawScore))) : 70
  const r = 18
  const circ = 2 * Math.PI * r
  const fill = (score / 100) * circ
  const color = score >= 80 ? '#16A34A' : score >= 60 ? '#EA580C' : '#9CA3AF'
  const trackColor = dark ? 'rgba(255,255,255,0.25)' : '#E8E0D8'
  const textColor = dark ? '#FFFFFF' : color

  // Calculate simulated sub-scores based on the total score
  const priceScore = Math.min(100, Math.round(score * 1.03))
  const speedScore = Math.min(100, Math.round(score * 0.96))
  const safetyScore = Math.min(100, Math.round(score * 0.98))

  return (
    <div className="flex flex-col items-center gap-0.5 relative group cursor-help">
      {/* Tooltip Overlay */}
      <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col z-50 bg-[#1C1917] text-white border border-[#2E2A27] rounded-xl p-3 w-40 shadow-xl pointer-events-none transition-all duration-200 animate-fade-in text-left">
        <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1 mb-1.5">
          Sage Analysis
        </h5>
        <div className="space-y-1.5 text-[11px] font-bold">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 flex items-center gap-1"><Banknote size={11} /> Price:</span>
            <span className="text-green-400">{priceScore}/100</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 flex items-center gap-1"><Zap size={11} /> Speed:</span>
            <span className="text-blue-400">{speedScore}/100</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 flex items-center gap-1"><Shield size={11} /> Safety:</span>
            <span className="text-amber-400">{safetyScore}/100</span>
          </div>
        </div>
      </div>

      <div className="relative w-11 h-11">
        <svg width="44" height="44" viewBox="0 0 44 44" className="rotate-[-90deg]">
          <circle cx="22" cy="22" r={r} fill="none" stroke={trackColor} strokeWidth="3" />
          <circle
            cx="22" cy="22" r={r} fill="none"
            stroke={color} strokeWidth="3"
            strokeDasharray={`${fill} ${circ}`}
            strokeLinecap="round"
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center text-[13px] font-bold"
          style={{ color: textColor }}
        >
          {score}
        </span>
      </div>
      <span
        className="text-[9px] font-medium tracking-wide uppercase"
        style={{ color: dark ? 'rgba(255,255,255,0.65)' : '#9CA3AF' }}
      >
        Sage Score
      </span>
    </div>
  )
}



function Shimmer({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`rounded-lg overflow-hidden relative bg-[#F0ECE8] ${className}`}
      style={{ minHeight: 16, ...style }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.55) 50%,transparent 100%)',
          animation: 'shimmer 1.5s infinite',
          backgroundSize: '200% 100%',
        }}
      />
    </div>
  )
}

function SkeletonRouteCard() {
  return (
    <div className="bg-white border border-[#E8E0D8] rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
      <Shimmer className="w-full" style={{ height: 200 }} />
      <div className="p-6 space-y-4">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(i => <Shimmer key={i} className="h-6 w-20 rounded-full" />)}
        </div>
        <div className="flex items-end justify-between">
          <Shimmer className="h-9 w-32" />
          <Shimmer className="h-4 w-20" />
        </div>
        <Shimmer className="h-1.5 w-full rounded-full" />
        <div className="flex gap-3">
          <Shimmer className="h-12 flex-1 rounded-xl" />
          <Shimmer className="h-12 w-32 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

function SkeletonCompactCard() {
  return (
    <div className="bg-white border border-[#E8E0D8] rounded-xl overflow-hidden shadow-sm">
      <Shimmer className="w-full" style={{ height: 140 }} />
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Shimmer className="h-4 w-28" />
          <Shimmer className="h-11 w-11 rounded-full" />
        </div>
        <div className="flex gap-2">
          <Shimmer className="h-5 w-16 rounded-full" /><Shimmer className="h-5 w-16 rounded-full" />
        </div>
        <Shimmer className="h-1.5 w-full rounded-full" />
        <Shimmer className="h-10 w-full rounded-xl" />
      </div>
    </div>
  )
}

// ─── Route Match Indicator Pill ───────────────────────────────────────────────

function MatchPill({
  icon: Icon, label, value, color
}: { icon: any; label: string; value: string; color: 'green' | 'orange' | 'blue' | 'gray' }) {
  const styles = {
    green:  { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' },
    orange: { bg: '#FFF7ED', text: '#EA580C', border: '#FED7AA' },
    blue:   { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
    gray:   { bg: '#F5F5F4', text: '#6B6B6B', border: '#E8E0D8' },
  }
  const s = styles[color]
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border"
      style={{ background: s.bg, color: s.text, borderColor: s.border }}
    >
      <Icon size={10} strokeWidth={2.5} />
      {label}: <span className="font-bold">{value}</span>
    </span>
  )
}

// ─── Budget Fit Bar ───────────────────────────────────────────────────────────

function BudgetFitBar({ price, budget, label, totalPrice, passengers }: { price: number; budget: number; label?: string; totalPrice?: number; passengers?: number }) {
  const totalCost = totalPrice || (price * (passengers || 1))
  const pct = budget > 0 ? Math.min(100, Math.round((totalCost / budget) * 100)) : 0
  const color = pct <= 35 ? '#16A34A' : pct <= 55 ? '#EA580C' : '#DC2626'
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] text-[#9CA3AF] font-medium">{label ?? 'Budget fit'}</span>
        <span className="text-[11px] font-bold" style={{ color }}>{pct}% of trip budget</span>
      </div>
      <div className="h-1.5 rounded-full bg-[#E8E0D8] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  )
}

// ─── Best Value Route Card (hero) ─────────────────────────────────────────────

function BestValueCard({
  item, allItems, budget, symbol, locale, from, to, topPick
}: {
  item: any; allItems: any[]; budget: number; symbol: string; locale: string
  from: string; to: string; topPick?: boolean
}) {
  const score = useMemo(() => calcSageScore(item, allItems), [item, allItems])
  const isFlight = item.type === 'flight' || (!item.type && item.departure && item.type !== 'train' && item.type !== 'bus' && item.type !== 'car' && item.type !== 'cab')
  const isBus = item.type === 'bus'
  const isTrain = item.type === 'train'
  const Icon = isFlight ? Plane : isBus ? Bus : isTrain ? Train : Car
  const ctaText = isFlight ? 'Book Flight' : isBus ? 'Book Bus' : isTrain ? 'Book Train' : 'Book Rental'
  const comfortLabel = item.rating >= 4.5 ? 'Premium' : item.rating >= 4 ? 'Standard' : 'Economy'
  const comfortColor: 'blue' | 'green' | 'gray' = item.rating >= 4.5 ? 'blue' : item.rating >= 4 ? 'green' : 'gray'
  const cleanName = item.name?.split('—')[0]?.trim() ?? 'Best Route'
  const typeLabel = isFlight ? 'Flight' : isBus ? 'Bus' : isTrain ? 'Train' : 'Rental/Cab'
<<<<<<< HEAD
<<<<<<< HEAD
  const bgImg = getCardBgImage(item)
=======

  const bgImg = null
>>>>>>> e444a81 (Save local changes)
=======
  const bgImg = getCardBgImage(item)
>>>>>>> 6d14ce1 (Fix itinerary photo upload system improvements)

  return (
    <div className="bg-white border border-[#E8E0D8] rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.06)]">

      {/* ── Aircraft hero image ── */}
      {bgImg && (
        <div className="relative w-full h-52 overflow-hidden">
          <img
            src={bgImg}
            alt={cleanName}
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/30"
          />
          {/* Badges on image */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-[#F59E0B] text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow">
              <Sparkles size={10} /> Best Value
            </span>
            {topPick && (
              <span className="bg-[#EA580C] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shadow">
                Top Pick
              </span>
            )}
          </div>
          <span className="absolute top-4 right-4 text-[12px] text-white/90 font-bold bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">{typeLabel} · Recommended</span>
          
          {/* Route + Carrier logo bottom of image */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div>
              <p
                className="text-[22px] font-extrabold text-white leading-tight drop-shadow-sm"
                style={{ fontFamily: 'var(--font-plus-jakarta, Inter, sans-serif)' }}
              >
                {from?.split(',')[0]} → {to?.split(',')[0]}
              </p>
              <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1 rounded-xl shadow-md border border-white/40 mt-1.5 inline-flex">
                {getAirlineLogo(cleanName) ? (
                  <img src={getAirlineLogo(cleanName)!} alt={cleanName} className="w-4 h-4 object-contain shrink-0" />
                ) : (
                  <span className="w-4 h-4 rounded-md bg-orange-500 text-white font-black text-[9px] flex items-center justify-center shrink-0">
                    {getAirlineInitials(cleanName)}
                  </span>
                )}
                <span className="text-slate-900 font-extrabold text-xs leading-none">
                  {cleanName}
                </span>
              </div>
            </div>
            {item.duration && (
              <span className="text-[15px] font-extrabold text-white drop-shadow-sm bg-black/40 backdrop-blur-md px-3 py-1 rounded-full">{item.duration}</span>
            )}
          </div>
        </div>
      )}

      {/* ── White content area ── */}
      <div className="p-6 sm:p-7 flex flex-col justify-between">
        {/* If no image (bus/cab), show header row */}
        {!bgImg && (
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-[#F59E0B] text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-sm">
                <Sparkles size={10} /> Best Value
              </span>
              {topPick && (
                <span className="bg-[#EA580C] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide shadow-sm">
                  Top Pick
                </span>
              )}
            </div>
            <span className="text-[13px] text-slate-500 font-semibold">{typeLabel} · Recommended route</span>
          </div>
        )}

        {/* Route match pills */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {item.duration && <MatchPill icon={Clock} label="Duration" value={item.duration} color="green" />}
          {budget > 0 && item.price && (
            <MatchPill icon={Wallet} label="Budget Fit" value={`${Math.round((item.price / budget) * 100)}%`} color="orange" />
          )}
          <MatchPill icon={Star} label="Comfort" value={comfortLabel} color={comfortColor} />
          {item.score != null && (
            <MatchPill icon={Shield} label="Reliability" value={`${Math.round(item.score * 100)}%`} color="green" />
          )}
          {item.stops === 0 && <MatchPill icon={Zap} label="Route" value="Direct" color="green" />}
        </div>

        {/* Price + score block */}
        <div className="flex items-center justify-between gap-4 mb-5 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
          <div>
            <p
              className="text-[28px] sm:text-[34px] font-extrabold text-slate-900 leading-none"
              style={{ fontFamily: 'var(--font-plus-jakarta, Inter, sans-serif)' }}
            >
              {symbol}{Math.round(item.perPassengerPrice || item.price).toLocaleString(locale)}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[12px] font-semibold text-slate-500">per person · estimated</span>
              {item.totalPrice && item.passengers > 1 && (
                <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
                  {symbol}{Math.round(item.totalPrice).toLocaleString(locale)} total ({item.passengers} travelers)
                </span>
              )}
            </div>
          </div>
          <div className="shrink-0 flex items-center justify-end">
            <SageScoreRing score={score} />
          </div>
        </div>

        {/* Budget fit bar */}
        {budget > 0 && item.price && (
          <div className="mb-6">
            <BudgetFitBar price={item.price} budget={budget} totalPrice={item.totalPrice} passengers={item.passengers} />
          </div>
        )}

        {/* CTAs Row */}
        <div className="flex items-center gap-3 pt-2">
          <a
            href={item.bookingLink ?? '#'}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('booking_click', { type: item.type, name: item.name, price: item.price })}
            className="flex-1 h-12 bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-[14px] rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md shadow-orange-500/20 active:scale-95 cursor-pointer"
          >
            {ctaText} <ArrowRight size={16} />
          </a>
          <button
            onClick={() => handleUniversalShare(item)}
            title="Share with Co-Travelers"
            className="h-12 w-12 border border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50 rounded-2xl flex items-center justify-center transition-all shrink-0 active:scale-95 cursor-pointer"
          >
            <Share2 size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Compact Comparison Card ──────────────────────────────────────────────────

function ComparisonCard({
  item, allItems, budget, symbol, locale, isTopPick
}: {
  item: any; allItems: any[]; budget: number; symbol: string; locale: string; isTopPick: boolean
}) {
  const score = useMemo(() => calcSageScore(item, allItems), [item, allItems])
  const isFlight = item.type === 'flight' || (!item.type && item.departure && item.type !== 'train' && item.type !== 'bus' && item.type !== 'car' && item.type !== 'cab')
  const isBus = item.type === 'bus'
  const isTrain = item.type === 'train'
  const Icon = isFlight ? Plane : isBus ? Bus : isTrain ? Train : Car
  const ctaText = isFlight ? 'Book Flight' : isBus ? 'Book Bus' : isTrain ? 'Book Train' : 'Book Rental'
  const comfortLabel = item.rating >= 4.5 ? 'Premium' : item.rating >= 4 ? 'Standard' : 'Economy'
  const comfortColor = item.rating >= 4.5 ? 'bg-blue-100 text-blue-800' : item.rating >= 4 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
  const typeLabel = isFlight ? 'Flight' : isBus ? 'Bus' : isTrain ? 'Train' : 'Rental/Cab'
<<<<<<< HEAD
<<<<<<< HEAD
  const bgImg = getCardBgImage(item)
  const carrierName = item.name?.split('—')[0]?.trim() ?? typeLabel
  const logoUrl = getAirlineLogo(item.name ?? '')
=======

  const bgImg = null
>>>>>>> e444a81 (Save local changes)
=======
  const bgImg = getCardBgImage(item)
  const carrierName = item.name?.split('—')[0]?.trim() ?? typeLabel
  const logoUrl = getAirlineLogo(item.name ?? '')
>>>>>>> 6d14ce1 (Fix itinerary photo upload system improvements)

  return (
    <div
      className="bg-white border rounded-2xl overflow-hidden shadow-xs hover:shadow-lg hover:border-orange-400 transition-all duration-300 flex flex-col justify-between h-full group relative"
      style={{ borderColor: isTopPick ? '#EA580C' : '#E2E8F0' }}
    >
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 6d14ce1 (Fix itinerary photo upload system improvements)
      <div>
        {/* ── Photo strip if available ── */}
        {bgImg ? (
          <div className="relative w-full h-36 overflow-hidden">
            <img
              src={bgImg}
              alt={carrierName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />
            
            {/* Top Badges */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
              {isTopPick ? (
                <span className="bg-[#EA580C] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
<<<<<<< HEAD
=======
      {/* ── Aircraft photo strip ── */}
      {bgImg && (
        <div className="relative w-full" style={{ height: 140 }}>
          <img
            src={bgImg}
            alt={item.name?.split('—')[0]?.trim() ?? 'Flight'}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: 'brightness(0.60)' }}
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(160deg,rgba(0,0,0,0.10) 0%,rgba(0,0,0,0.65) 100%)' }}
          />
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-white drop-shadow-sm">{item.name?.split('—')[0]?.trim()}</span>
            </div>
            {isTopPick && (
              <span className="bg-[#EA580C] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shadow">
                Top Pick
              </span>
            )}
          </div>
          {/* Score top right */}
          <div className="absolute top-2 right-2">
            <SageScoreRing score={score} dark />
          </div>
        </div>
      )}

      {/* ── White content ── */}
      <div className="p-4 flex flex-col gap-3">
        {/* If no image, show airline/mode row */}
        {!bgImg && (
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg border border-[#E8E0D8] bg-[#F5F5F4] flex items-center justify-center shrink-0">
                <Icon size={18} strokeWidth={1.75} className="text-[#6B6B6B]" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-[#1A1A1A] leading-tight">{typeLabel}</p>
                <p className="text-[12px] text-[#6B6B6B]">{item.name?.split('—')[0]?.trim()}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              {isTopPick && (
                <span className="bg-[#EA580C] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
>>>>>>> e444a81 (Save local changes)
=======
>>>>>>> 6d14ce1 (Fix itinerary photo upload system improvements)
                  Top Pick
                </span>
              ) : (
                <span className="bg-white/25 backdrop-blur-md text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                  {typeLabel}
                </span>
              )}
              <SageScoreRing score={score} dark />
            </div>

            {/* Official Carrier Logo Badge Overlay */}
            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
              <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl shadow-md border border-white/40">
                {logoUrl ? (
                  <img src={logoUrl} alt={carrierName} className="w-4 h-4 object-contain shrink-0" />
                ) : (
                  <span className="w-4 h-4 rounded-md bg-orange-500 text-white font-black text-[9px] flex items-center justify-center shrink-0">
                    {getAirlineInitials(carrierName)}
                  </span>
                )}
                <span className="text-slate-900 font-extrabold text-xs leading-none">
                  {carrierName}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Header when no image */
          <div className="p-4 pb-2 border-b border-slate-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0 text-[#EA580C]">
                <Icon size={20} strokeWidth={2} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-extrabold text-slate-900 text-sm leading-tight">
                    {typeLabel}
                  </h4>
                  {isTopPick && (
                    <span className="bg-[#EA580C] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                      Top Pick
                    </span>
                  )}
                </div>
                <p className="text-slate-500 text-xs font-medium mt-0.5">
                  {item.name?.split('—')[0]?.trim()}
                </p>
              </div>
            </div>
            <SageScoreRing score={score} />
          </div>
        )}

        {/* ── Card Content Body ── */}
        <div className="p-4 flex flex-col gap-3">
          {/* Route info / Comfort pills */}
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${comfortColor}`}>
              {comfortLabel}
            </span>
            {item.departure && item.arrival && (
              <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                {item.departure} → {item.arrival}
              </span>
            )}
            {item.duration && (
              <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Clock size={10} /> {item.duration}
              </span>
            )}
          </div>

          {/* Price Stack (Zero Clipping) */}
          <div className="mt-1">
            <div className="text-2xl font-black text-slate-900 leading-none">
              {symbol}{Math.round(item.perPassengerPrice || item.price).toLocaleString(locale)}
            </div>
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              <span className="text-xs font-semibold text-slate-400">
                per person • estimated
              </span>
              {item.totalPrice && item.passengers > 1 && (
                <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                  ({symbol}{Math.round(item.totalPrice).toLocaleString(locale)} total for {item.passengers} travelers)
                </span>
              )}
            </div>
          </div>

          {/* Budget fit bar */}
          {budget > 0 && item.price && (
            <div className="mt-1">
              <BudgetFitBar price={item.price} budget={budget} totalPrice={item.totalPrice} passengers={item.passengers} />
            </div>
          )}
        </div>
      </div>

      {/* ── Fixed Bottom CTA Row ── */}
      <div className="p-4 pt-0 mt-auto flex items-center gap-2">
        <a
          href={item.bookingLink ?? '#'}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent('booking_click', { type: item.type, name: item.name, price: item.price })}
          className="flex-1 py-2.5 px-4 rounded-xl font-extrabold text-xs bg-gradient-to-r from-[#EA580C] to-[#F97316] text-white hover:shadow-md hover:shadow-orange-500/25 transition-all text-center"
        >
          {ctaText} →
        </a>
        <button
          onClick={() => handleUniversalShare(item)}
          title="Share route"
          className="p-2.5 border border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50 rounded-xl transition-all shrink-0 cursor-pointer"
        >
          <Share2 size={16} />
        </button>
      </div>
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ type, error, onSwitch }: { type: string; error?: string | null; onSwitch?: () => void }) {
  if (type === 'flights') {
    let parsedErr: any = null;
    if (error) {
      try {
        parsedErr = typeof error === 'string' && (error.startsWith('{') || error.startsWith('"')) ? JSON.parse(error) : error;
      } catch {
        parsedErr = error;
      }
    }

    return (
      <div className="bg-red-50/80 border border-red-200 rounded-2xl p-8 flex flex-col items-center gap-4 text-center my-4">
        <div className="w-14 h-14 rounded-2xl bg-red-100 border border-red-300 flex items-center justify-center text-red-700">
          <AlertCircle size={28} strokeWidth={1.5} />
        </div>
        <div className="w-full max-w-xl">
          <p className="text-[18px] font-bold text-red-900 mb-2">
            {error ? 'Travelport API Provider Error' : 'No Flights Found'}
          </p>
          {error ? (
            <div className="bg-white p-4 rounded-xl border border-red-200 text-left font-mono text-xs text-red-950 space-y-1.5 shadow-sm">
              <p><span className="font-bold text-red-700">Status:</span> 401 Unauthorized</p>
              <p><span className="font-bold text-red-700">Code:</span> {typeof parsedErr === 'object' && parsedErr?.code ? parsedErr.code : '1012100'}</p>
              <p><span className="font-bold text-red-700">Message:</span> {typeof parsedErr === 'object' ? (parsedErr?.message || parsedErr?.error_description || JSON.stringify(parsedErr)) : String(error)}</p>
              <p className="text-slate-500 text-[11px] pt-1 border-t border-slate-100">
                <span className="font-semibold text-slate-700">Trace ID:</span> {typeof parsedErr === 'object' && parsedErr?.traceId ? parsedErr.traceId : 'ts-9f43a3be-84b8-43fe-8b9f-a47243d8217c'}
              </p>
            </div>
          ) : (
            <p className="text-[14px] text-slate-600 leading-relaxed">
              No direct flights were found for your selected route and dates.
            </p>
          )}
          {onSwitch && (
            <div className="mt-5">
              <p className="text-[13px] text-slate-500 mb-3">You can use our Multi-Modal Smart Route Planner to compare ground transport options.</p>
              <button
                onClick={onSwitch}
                className="h-10 px-5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-[13px] rounded-xl transition-all shadow-sm flex items-center gap-1.5 mx-auto"
              >
                <Sparkles size={14} />
                Try Smart Route Planner
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }
  const Icon = type === 'buses' ? Bus : type === 'trains' ? Train : Car
  const labels = { trains: 'No trains found', buses: 'No buses found', cabs: 'No rental cars or cabs found' }
  return (
    <div className="bg-white border border-[#E8E0D8] rounded-2xl p-16 flex flex-col items-center gap-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[#FFF7ED] border border-[#FED7AA] flex items-center justify-center">
        <Icon size={24} className="text-[#EA580C]" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-[16px] font-bold text-[#1A1A1A] mb-1.5">{labels[type as keyof typeof labels] ?? 'No results'}</p>
        <p className="text-[13px] text-[#6B6B6B]">Try adjusting your route or dates.</p>
        {onSwitch && (
          <div className="mt-5">
            <p className="text-[13px] text-slate-500 mb-3">Or, use our Multi-Modal Smart Route Planner to plan door-to-door transportation.</p>
            <button
              onClick={onSwitch}
              className="h-10 px-5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-[13px] rounded-xl transition-all shadow-sm flex items-center gap-1.5 mx-auto"
            >
              <Sparkles size={14} />
              Try Smart Route Planner
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

function TransportTab({
  transport, loading, tripContext, searchForm, budget = 0, hotelCostSpent = 0, currency = 'INR', error
}: Props) {
  const [segment, setSegment] = useState<Segment>('recommended')
  const { userProfile } = useTripStore()
  const sym = SYMBOLS[currency] ?? currency
  const locale = currency === 'INR' ? 'en-IN' : 'en-US'
  const effectiveBudget = budget || userProfile?.budget || 0

  const dest = tripContext?.destination || searchForm?.to || ''
  const from = tripContext?.startLocation || searchForm?.from || ''
  const destCity = dest.split(',')[0].trim()

  // Split transport list by type — flights enabled
  const { flights, trains, buses, cabs } = useMemo(() => {
    const flights = transport.filter(t => t.type === 'flight' || (!t.type && t.departure && t.type !== 'train' && t.type !== 'bus' && t.type !== 'car' && t.type !== 'cab'))
    const trains = transport.filter(t => t.type === 'train')
    const buses = transport.filter(t => t.type === 'bus')
    const cabs = transport.filter(t => t.type === 'car' || t.type === 'cab')
    return { flights, trains, buses, cabs }
  }, [transport])

  // Sage scores for "Top Pick" detection
  const scoredFlights = useMemo(() =>
    flights.map(f => ({ ...f, _score: calcSageScore(f, flights) }))
      .sort((a, b) => b._score - a._score),
    [flights]
  )

  const scoredTrains = useMemo(() =>
    trains.map(t => ({ ...t, _score: calcSageScore(t, trains) }))
      .sort((a, b) => b._score - a._score),
    [trains]
  )

  const bestFlight = scoredFlights[0]
  const bestTrain = scoredTrains[0]
  const bestBus = buses[0]
  const bestCab = cabs[0]

  // Best value card for current segment
  const bestForSegment = useMemo(() => {
    if (segment === 'flights') return bestFlight
    if (segment === 'trains') return bestTrain
    if (segment === 'buses') return bestBus
    if (segment === 'cabs') return bestCab
    // Recommended: cross-compare best of each type
    return [bestFlight, bestTrain, bestBus, bestCab]
      .filter(Boolean)
      .sort((a, b) => (a?.price ?? Infinity) - (b?.price ?? Infinity))[0]
  }, [segment, bestFlight, bestTrain, bestBus, bestCab])

  // Cards for the comparison grid
  const gridItems = useMemo(() => {
    if (segment === 'flights') return scoredFlights.slice(1, 4)
    if (segment === 'trains') return scoredTrains.slice(1, 4)
    if (segment === 'buses') return buses.slice(1, 4)
    if (segment === 'cabs') return cabs.slice(1, 4)
    // Recommended: one of each type
    return [bestFlight, bestTrain, bestBus, bestCab].filter(Boolean)
  }, [segment, scoredFlights, scoredTrains, buses, cabs, bestFlight, bestTrain, bestBus, bestCab])

  const allForScore = useMemo(() =>
    segment === 'flights' ? flights : segment === 'trains' ? trains : segment === 'buses' ? buses : segment === 'cabs' ? cabs : transport,
    [segment, flights, trains, buses, cabs, transport]
  )

  const isDomesticRoute = useMemo(() => isSameCountry(from, dest), [from, dest])

  const segments: { id: Segment; label: string; icon: React.FC<any>; count?: number }[] = [
    { id: 'recommended', label: 'Recommended', icon: Icon3DOverview },
    { id: 'smart-routes', label: 'Smart Routes', icon: Icon3DSmartRoute },
    { id: 'flights', label: 'Flights', icon: Icon3DTransport, count: flights.length },
    { id: 'trains', label: 'Trains', icon: Icon3DTrain, count: isDomesticRoute ? trains.length : 0 },
    { id: 'buses', label: 'Buses', icon: Icon3DBus, count: isDomesticRoute ? buses.length : 0 },
    { id: 'cabs', label: 'Rental Cars / Cabs', icon: Icon3DCar, count: isDomesticRoute ? cabs.length : 0 },
  ]

  const ctaText = segment === 'flights' ? 'Book Flight'
    : segment === 'trains' ? 'Book Train'
    : segment === 'buses' ? 'Book Bus'
    : segment === 'cabs' ? 'Book Rental'
    : 'Book Now'

  return (
    <>
      {/* Shimmer keyframe */}
      <style>{`
        @keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
        .hide-scrollbar{scrollbar-width:none;-ms-overflow-style:none}
        .hide-scrollbar::-webkit-scrollbar{display:none}
      `}</style>

      <div className="space-y-6">

        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <div>
          <h1
            className="text-[24px] font-bold text-[#1A1A1A] leading-tight mb-1.5"
            style={{ fontFamily: 'var(--font-plus-jakarta, Inter, sans-serif)' }}
          >
            Travel to {destCity || 'your destination'}
          </h1>
          <p className="text-[15px] text-[#6B6B6B] leading-relaxed max-w-xl">
            Compare the best ways to reach your destination — time, comfort, and budget all in one view.
          </p>
        </div>

        {/* ── SEGMENT PILLS (3D Isometric Bar with Swipe Indicator) ───────── */}
        <div className="space-y-2">
          {/* Top Swipe Hint */}
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#EA580C] flex items-center gap-1.5">
              <Sparkles size={12} className="text-[#EA580C]" /> Select Transport Mode
            </span>
            <div className="md:hidden flex items-center gap-1.5 text-[11px] font-bold text-slate-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200/80 shadow-2xs">
              <span>Swipe for modes</span>
              <ArrowRight size={12} className="text-[#EA580C] animate-pulse" />
            </div>
          </div>

          {/* Pill Container with Fade Overlay */}
          <div className="relative group/pills">
            {/* Right Fade Gradient Overlay */}
            <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none z-10 rounded-r-2xl" />

            <div
              id="transport-segment-pills"
              className="flex gap-3 overflow-x-auto hide-scrollbar py-1.5 scroll-smooth pr-8"
            >
              {segments.map(s => {
                const isActive = segment === s.id
                const IconComp = s.icon
                return (
                  <button
                    key={s.id}
                    onClick={() => setSegment(s.id)}
                    className={`shrink-0 h-12 px-4 rounded-2xl text-[14px] font-bold flex items-center gap-2.5 transition-all duration-200 cursor-pointer border ${
                      isActive
                        ? 'bg-[#EA580C] text-white border-[#EA580C] shadow-lg shadow-orange-500/25 scale-[1.02]'
                        : 'bg-white text-slate-700 border-[#E8E0D8] hover:border-orange-300 hover:bg-orange-50/40 hover:shadow-sm'
                    }`}
                  >
                    <IconComp size={24} active={isActive} />
                    <span>{s.label}</span>
                    {s.count != null && s.count > 0 && !loading && (
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {s.count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── SMART ROUTES (Transport Intelligence) ───────────────────── */}
        {segment === 'smart-routes' && (
          <TransportPlanner
            defaultOrigin={from}
            defaultDestination={dest}
            defaultDate={searchForm?.startDate || ''}
          />
        )}

        {/* ── TRAINS PANEL ───────────────────────────────────────────── */}
        {segment === 'trains' && (
          isSameCountry(from, dest) ? (
            <TrainsPanel
              origin={from}
              destination={dest}
              date={searchForm?.startDate || ''}
              passengers={userProfile.members || 1}
            />
          ) : (
            <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-10 text-center space-y-3 my-4">
              <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/40 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
                <AlertCircle size={28} />
              </div>
              <h3 className="text-lg font-black text-amber-950 dark:text-amber-100">
                International Train Services Unavailable
              </h3>
              <p className="text-xs text-amber-800 dark:text-amber-300 max-w-md mx-auto leading-relaxed">
                International train services are not available for this route.
              </p>
            </div>
          )
        )}

        {/* ── BUSES PANEL ────────────────────────────────────────────── */}
        {segment === 'buses' && (
          isSameCountry(from, dest) ? (
            <BusesPanel
              origin={from}
              destination={dest}
              date={searchForm?.startDate || ''}
              passengers={userProfile.members || 1}
            />
          ) : (
            <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-10 text-center space-y-3 my-4">
              <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/40 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
                <AlertCircle size={28} />
              </div>
              <h3 className="text-lg font-black text-amber-950 dark:text-amber-100">
                International Bus Services Unavailable
              </h3>
              <p className="text-xs text-amber-800 dark:text-amber-300 max-w-md mx-auto leading-relaxed">
                International bus services are not available for this route.
              </p>
            </div>
          )
        )}

        {/* ── FLIGHTS PANEL (AI Flight Search & Kiwi Booking Interface) ───── */}
        {segment === 'flights' && (
          <AiFlightSearch
            flights={flights}
            loading={loading}
            tripContext={{
              from,
              to: dest,
              startDate: searchForm?.startDate || tripContext?.startDate,
              endDate: searchForm?.endDate || tripContext?.endDate,
              travelers: searchForm?.travelers || tripContext?.travelers || userProfile?.members || 1,
              cabin: searchForm?.cabin || 'Economy',
            }}
            currency={currency}
          />
        )}

        {/* ── CABS / RENTAL CARS PANEL ────────────────────────────────── */}
        {segment === 'cabs' && (
          <CarsTab />
        )}

        {/* ── BEST VALUE CARD (for Recommended Overview) ──────────────── */}
        {segment === 'recommended' && (loading ? (
          <SkeletonRouteCard />
        ) : bestForSegment ? (
          <BestValueCard
            item={bestForSegment}
            allItems={allForScore}
            budget={effectiveBudget}
            symbol={sym}
            locale={locale}
            from={from}
            to={dest}
            topPick
          />
        ) : (
          <EmptyState
            type="flights"
            error={error}
            onSwitch={() => setSegment('smart-routes')}
          />
        ))}

        {/* ── COMPARISON GRID (for Recommended Overview) ──────────────── */}
        {segment === 'recommended' && !loading && gridItems.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-[#1A1A1A]">
                {segment === 'recommended' ? 'All transport options' : `More ${segment}`}
              </h2>
              <span className="text-[12px] text-[#9CA3AF]">{gridItems.length} options</span>
            </div>

            {/* Desktop: 3-col grid / Mobile: stacked */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gridItems.map((item, i) => (
                <ComparisonCard
                  key={item.id ?? i}
                  item={item}
                  allItems={allForScore}
                  budget={effectiveBudget}
                  symbol={sym}
                  locale={locale}
                  isTopPick={i === 0 && segment !== 'recommended'}
                />
              ))}
              {/* Skeleton fill for loading states */}
            </div>
          </>
        )}

        {/* Skeleton grid while loading */}
        {segment !== 'trains' && segment !== 'buses' && segment !== 'flights' && loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <SkeletonCompactCard key={i} />)}
          </div>
        )}      </div>

      {/* ── MOBILE STICKY BOTTOM CTA ──────────────────────────────────── */}
      <div className="lg:hidden fixed bottom-[60px] left-0 right-0 z-40 px-4 pb-3 pt-3 bg-gradient-to-t from-[#FFFBF7] via-[#FFFBF7]/90 to-transparent">
        {bestForSegment ? (
          <a
            href={bestForSegment.bookingLink ?? '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-[52px] bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-[15px] rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-colors"
          >
            {ctaText} <ArrowRight size={16} />
          </a>
        ) : (
          <div className="w-full h-[52px] bg-[#E8E0D8] rounded-2xl flex items-center justify-center">
            <span className="text-[14px] text-[#9CA3AF]">Search to see options</span>
          </div>
        )}
      </div>
      <LiveBookingToast />
    </>
  )
}

export default memo(TransportTab)
