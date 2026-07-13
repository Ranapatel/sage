'use client'

import React, { memo, useMemo, useState } from 'react'
import {
  Plane, Bus, Car, Clock, Wallet, Shield, Star,
  ArrowRight, Sparkles, CheckCircle2, AlertCircle,
  TrendingUp, Zap, ChevronRight, ExternalLink, Train
} from 'lucide-react'
import { SYMBOLS } from '@/lib/currency'
import { useTripStore } from '@/store/tripStore'
import { trackEvent } from '@/lib/analytics'
import TransportPlanner from '@/components/transport-intelligence/TransportPlanner'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  transport: any[]
  loading: boolean
  tripContext: any
  searchForm: any
  budget?: number
  hotelCostSpent?: number
  currency?: string
}

type Segment = 'recommended' | 'flights' | 'trains' | 'buses' | 'cabs' | 'smart-routes'

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
// Curated Unsplash photos showing each airline's livery / aircraft.
const AIRLINE_IMAGES: Record<string, string> = {
  indigo:       'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=900&q=80&auto=format&fit=crop',
  'air india':  'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=900&q=80&auto=format&fit=crop',
  spicejet:     'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=900&q=80&auto=format&fit=crop',
  vistara:      'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=900&q=80&auto=format&fit=crop',
  akasa:        'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=900&q=80&auto=format&fit=crop',
  emirates:     'https://images.unsplash.com/photo-1543073847-d80f7a0e0c7b?w=900&q=80&auto=format&fit=crop',
  qatar:        'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=900&q=80&auto=format&fit=crop',
  singapore:    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=900&q=80&auto=format&fit=crop',
  'air asia':   'https://images.unsplash.com/photo-1529258283598-8d6fe60b27f4?w=900&q=80&auto=format&fit=crop',
  'thai':       'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=900&q=80&auto=format&fit=crop',
  'malaysia':   'https://images.unsplash.com/photo-1526397751294-331021109fbd?w=900&q=80&auto=format&fit=crop',
}

const FALLBACK_FLIGHT_IMG = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=900&q=80&auto=format&fit=crop'

/** Returns the best background image for a flight item.
 *  Priority: item.image (backend) → airline match → generic fallback */
function getFlightBgImage(item: any): string {
  if (item.image && !item.image.includes('placeholder')) return item.image
  const name = (item.name ?? '').toLowerCase()
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

// ─── Sage Score calculation ───────────────────────────────────────────────────

function calcSageScore(item: any, allItems: any[]): number {
  if (!allItems.length) return 70
  const prices = allItems.map(i => i.price).filter(Boolean)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const priceRange = maxPrice - minPrice || 1

  // Price value: lower = better (35%)
  const priceScore = item.price
    ? Math.round(((maxPrice - item.price) / priceRange) * 100)
    : 60

  // Duration: shorter = better (25%)
  const parseDur = (d: string) => {
    if (!d) return 600
    const hMatch = d.match(/(\d+)h/)
    const mMatch = d.match(/(\d+)m/)
    return (hMatch ? +hMatch[1] * 60 : 0) + (mMatch ? +mMatch[1] : 0)
  }
  const durations = allItems.map(i => parseDur(i.duration)).filter(Boolean)
  const minDur = Math.min(...durations) || 1
  const maxDur = Math.max(...durations) || 1
  const itemDur = parseDur(item.duration)
  const durScore = durations.length > 1
    ? Math.round(((maxDur - itemDur) / (maxDur - minDur)) * 100)
    : 70

  // Rating / comfort (20%)
  const comfortScore = item.rating ? Math.min(100, Math.round(item.rating * 20)) : 70

  // Departure time convenience 6-9am = 100, midnight = 30 (10%)
  const depHour = item.departure ? parseInt(item.departure.split(':')[0]) : 8
  const timeScore = depHour >= 6 && depHour <= 10 ? 100
    : depHour >= 10 && depHour <= 14 ? 80
    : depHour >= 14 && depHour <= 18 ? 65
    : 40

  // Reliability from score field or derive from stops (10%)
  const reliabilityScore = item.score != null ? Math.round(item.score * 100)
    : item.stops === 0 ? 90 : 70

  const raw = (
    priceScore * 0.35 +
    durScore * 0.25 +
    comfortScore * 0.20 +
    timeScore * 0.10 +
    reliabilityScore * 0.10
  )
  const result = Math.round(raw)
  return Number.isFinite(result) ? Math.max(0, Math.min(100, result)) : 70
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

  return (
    <div className="flex flex-col items-center gap-0.5">
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

// ─── Airline Badge ────────────────────────────────────────────────────────────

function AirlineBadge({ name }: { name: string }) {
  const [imgError, setImgError] = useState(false)
  const logo = getAirlineLogo(name)
  const initials = getAirlineInitials(name)
  const color = getAirlineColor(name)
  const cleanName = name.split('—')[0].split('-')[0].trim()

  // Extract flight number hint (e.g. "IndiGo 6E 123")
  const parts = cleanName.split(' ')
  const airlineName = parts.slice(0, parts.length > 2 ? -1 : undefined).join(' ')

  return (
    <div className="flex items-center gap-2.5">
      {/* Logo or initials */}
      <div
        className="w-10 h-10 rounded-lg border border-[#E8E0D8] bg-white flex items-center justify-center shrink-0 overflow-hidden"
        style={{ minWidth: 40, minHeight: 40 }}
      >
        {logo && !imgError ? (
          <img
            src={logo}
            alt={airlineName}
            className="w-full h-full object-contain p-1"
            onError={() => setImgError(true)}
          />
        ) : (
          <span
            className="text-[13px] font-bold text-white rounded-lg w-full h-full flex items-center justify-center"
            style={{ background: color }}
          >
            {initials}
          </span>
        )}
      </div>
      {/* Name + sub info */}
      <div className="min-w-0">
        <p className="text-[14px] font-semibold text-[#1A1A1A] leading-tight truncate">{airlineName}</p>
      </div>
    </div>
  )
}

// Small airline badge for dark image overlays
function AirlineBadgeMini({ name }: { name: string }) {
  const [imgError, setImgError] = useState(false)
  const logo = getAirlineLogo(name)
  const initials = getAirlineInitials(name)
  const color = getAirlineColor(name)
  const cleanName = name.split('—')[0].split('-')[0].trim().split(' ').slice(0, 2).join(' ')

  return (
    <div className="flex items-center gap-2">
      <div
        className="w-8 h-8 rounded-lg border border-white/30 bg-white/10 flex items-center justify-center shrink-0 overflow-hidden"
      >
        {logo && !imgError ? (
          <img src={logo} alt={cleanName} className="w-full h-full object-contain p-0.5"
            onError={() => setImgError(true)} />
        ) : (
          <span className="text-[11px] font-bold text-white">{initials}</span>
        )}
      </div>
      <span className="text-[13px] font-semibold text-white drop-shadow-sm">{cleanName}</span>
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

function BudgetFitBar({ price, budget, label }: { price: number; budget: number; label?: string }) {
  const pct = budget > 0 ? Math.min(100, Math.round((price / budget) * 100)) : 0
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
  const ctaText = isFlight ? 'See flight options' : isBus ? 'See bus options' : isTrain ? 'See train options' : 'See rental options'
  const comfortLabel = item.rating >= 4.5 ? 'Premium' : item.rating >= 4 ? 'Standard' : 'Economy'
  const comfortColor: 'blue' | 'green' | 'gray' = item.rating >= 4.5 ? 'blue' : item.rating >= 4 ? 'green' : 'gray'
  const cleanName = item.name?.split('—')[0]?.trim() ?? 'Best Route'
  const typeLabel = isFlight ? 'Flight' : isBus ? 'Bus' : isTrain ? 'Train' : 'Rental/Cab'

  const bgImg = isFlight ? getFlightBgImage(item) : null

  return (
    <div className="bg-white border border-[#E8E0D8] rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.06)]">

      {/* ── Aircraft hero image ── */}
      {bgImg && (
        <div className="relative w-full" style={{ height: 200 }}>
          <img
            src={bgImg}
            alt={cleanName}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: 'brightness(0.65)' }}
          />
          {/* Gradient overlay */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(160deg,rgba(0,0,0,0.15) 0%,rgba(0,0,0,0.55) 70%,rgba(0,0,0,0.80) 100%)' }}
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
          <span className="absolute top-4 right-4 text-[12px] text-white/75 font-medium">{typeLabel} · Recommended</span>
          {/* Route + duration bottom of image */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div>
              <p
                className="text-[22px] font-bold text-white leading-tight drop-shadow"
                style={{ fontFamily: 'var(--font-plus-jakarta, Inter, sans-serif)' }}
              >
                {from?.split(',')[0]} → {to?.split(',')[0]}
              </p>
              <p className="text-[12px] text-white/70 mt-0.5">{cleanName}</p>
            </div>
            {item.duration && (
              <span className="text-[15px] font-bold text-white drop-shadow">{item.duration}</span>
            )}
          </div>
        </div>
      )}

      {/* ── White content area ── */}
      <div className="p-6">
        {/* If no image (bus/cab), show header row */}
        {!bgImg && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-[#F59E0B] text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                <Sparkles size={10} /> Best Value
              </span>
              {topPick && (
                <span className="bg-[#EA580C] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                  Top Pick
                </span>
              )}
            </div>
            <span className="text-[13px] text-[#6B6B6B] font-medium">{typeLabel} · Recommended route</span>
          </div>
        )}

        {/* Route match pills */}
        <div className="flex flex-wrap gap-2 mb-5">
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

        {/* Price + score */}
        <div className="flex items-end justify-between mb-2">
          <div>
            <p
              className="text-[30px] font-bold text-[#1A1A1A] leading-none"
              style={{ fontFamily: 'var(--font-plus-jakarta, Inter, sans-serif)' }}
            >
              {symbol}{Math.round(item.price).toLocaleString(locale)}
            </p>
            <p className="text-[13px] text-[#6B6B6B] mt-1">per person · estimated</p>
          </div>
          <SageScoreRing score={score} />
        </div>

        {/* Budget fit bar */}
        {budget > 0 && item.price && (
          <div className="mb-5">
            <BudgetFitBar price={item.price} budget={budget} />
          </div>
        )}

        {/* CTAs */}
        <div className="flex items-center gap-3">
          <a
            href={item.bookingLink ?? '#'}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('booking_click', { type: item.type, name: item.name, price: item.price })}
            className="flex-1 h-12 bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-[14px] rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            {ctaText} <ArrowRight size={15} />
          </a>
          <button className="h-12 px-5 border border-[#E8E0D8] hover:border-[#D0C8C0] text-[#6B6B6B] font-semibold text-[14px] rounded-xl transition-colors whitespace-nowrap">
            Adjust my plan
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
  const ctaText = isFlight ? 'See flight options' : isBus ? 'See bus options' : isTrain ? 'See train options' : 'See rental options'
  const comfortLabel = item.rating >= 4.5 ? 'Premium' : item.rating >= 4 ? 'Standard' : 'Economy'
  const comfortColor = item.rating >= 4.5 ? 'text-[#2563EB]' : item.rating >= 4 ? 'text-[#16A34A]' : 'text-[#6B6B6B]'
  const typeLabel = isFlight ? 'Flight' : isBus ? 'Bus' : isTrain ? 'Train' : 'Rental/Cab'

  const bgImg = isFlight ? getFlightBgImage(item) : null

  return (
    <div
      className="bg-white border rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md"
      style={{ borderColor: isTopPick ? '#EA580C' : '#E8E0D8', boxShadow: isTopPick ? '0 0 0 3px rgba(234,88,12,0.06)' : undefined }}
    >
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
          {/* Airline name + Top Pick on image */}
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
            <div className="flex items-center gap-2">
              <AirlineBadgeMini name={item.name ?? ''} />
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
                  Top Pick
                </span>
              )}
              <SageScoreRing score={score} />
            </div>
          </div>
        )}

        {/* Route pills */}
        <div className="flex flex-wrap gap-1.5">
          {item.departure && item.arrival && (
            <span className="text-[11px] text-[#6B6B6B] bg-[#F5F5F4] px-2 py-0.5 rounded-full">
              {item.departure} → {item.arrival}
            </span>
          )}
          {item.duration && (
            <span className="text-[11px] text-[#6B6B6B] bg-[#F5F5F4] px-2 py-0.5 rounded-full flex items-center gap-1">
              <Clock size={9} /> {item.duration}
            </span>
          )}
          <span className={`text-[11px] font-semibold bg-[#F5F5F4] px-2 py-0.5 rounded-full ${comfortColor}`}>
            {comfortLabel}
          </span>
          {item.stops != null && (
            <span className="text-[11px] text-[#6B6B6B] bg-[#F5F5F4] px-2 py-0.5 rounded-full">
              {item.stops === 0 ? 'Direct' : `${item.stops} stop${item.stops > 1 ? 's' : ''}`}
            </span>
          )}
        </div>

        {/* Price */}
        <p className="text-[22px] font-bold text-[#1A1A1A] leading-none" style={{ fontFamily: 'var(--font-plus-jakarta, Inter, sans-serif)' }}>
          {symbol}{Math.round(item.price).toLocaleString(locale)}
          <span className="text-[11px] text-[#9CA3AF] font-normal ml-1">/person est.</span>
        </p>

        {/* Budget fit bar */}
        {budget > 0 && item.price && <BudgetFitBar price={item.price} budget={budget} />}

        {/* CTA */}
        <a
          href={item.bookingLink ?? '#'}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent('booking_click', { type: item.type, name: item.name, price: item.price })}
          className="w-full h-10 border-2 border-[#EA580C] text-[#EA580C] hover:bg-[#FFF7ED] font-bold text-[13px] rounded-xl flex items-center justify-center gap-1.5 transition-colors"
        >
          {ctaText} <ArrowRight size={13} />
        </a>
      </div>
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ type, onSwitch }: { type: string; onSwitch?: () => void }) {
  const Icon = type === 'flights' ? Plane : type === 'buses' ? Bus : type === 'trains' ? Train : Car
  const labels = { flights: 'No flights found', trains: 'No trains found', buses: 'No buses found', cabs: 'No rental cars or cabs found' }
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
  transport, loading, tripContext, searchForm, budget = 0, hotelCostSpent = 0, currency = 'INR'
}: Props) {
  const [segment, setSegment] = useState<Segment>('recommended')
  const { userProfile } = useTripStore()
  const sym = SYMBOLS[currency] ?? currency
  const locale = currency === 'INR' ? 'en-IN' : 'en-US'
  const effectiveBudget = budget || userProfile?.budget || 0

  const dest = tripContext?.destination || searchForm?.to || ''
  const from = tripContext?.startLocation || searchForm?.from || ''
  const destCity = dest.split(',')[0].trim()

  // Split transport list by type
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

  const segments: { id: Segment; label: string; count?: number }[] = [
    { id: 'recommended', label: 'Recommended' },
    { id: 'smart-routes', label: 'Smart Routes' },
    { id: 'flights', label: 'Flights', count: flights.length },
    { id: 'trains', label: 'Trains', count: trains.length },
    { id: 'buses', label: 'Buses', count: buses.length },
    { id: 'cabs', label: 'Rental Cars / Cabs', count: cabs.length },
  ]

  const ctaText = segment === 'flights' ? 'See flight options'
    : segment === 'trains' ? 'See train options'
    : segment === 'buses' ? 'See bus options'
    : segment === 'cabs' ? 'See rental options'
    : 'See all options'

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

        {/* ── SEGMENT PILLS ──────────────────────────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-0.5">
          {segments.map(s => {
            const isActive = segment === s.id
            return (
              <button
                key={s.id}
                onClick={() => setSegment(s.id)}
                className="shrink-0 h-9 px-4 rounded-xl text-[14px] font-medium flex items-center gap-1.5 transition-all border"
                style={{
                  background: isActive ? '#EA580C' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#6B6B6B',
                  borderColor: isActive ? '#EA580C' : '#E8E0D8',
                }}
              >
                {s.label}
                {s.count != null && s.count > 0 && !loading && (
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{
                      background: isActive ? 'rgba(255,255,255,0.25)' : '#F0ECE8',
                      color: isActive ? '#fff' : '#6B6B6B',
                    }}
                  >
                    {s.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* ── SMART ROUTES (Transport Intelligence) ───────────────────── */}
        {segment === 'smart-routes' && (
          <TransportPlanner
            defaultOrigin={from}
            defaultDestination={dest}
            defaultDate={searchForm?.startDate || ''}
          />
        )}

        {/* ── BEST VALUE CARD ────────────────────────────────────────────── */}
        {segment !== 'smart-routes' && (loading ? (
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
            type={segment === 'recommended' ? 'flights' : segment}
            onSwitch={segment === 'recommended' ? () => setSegment('smart-routes') : undefined}
          />
        ))}

        {/* ── COMPARISON GRID ────────────────────────────────────────────── */}
        {!loading && gridItems.length > 0 && (
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
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <SkeletonCompactCard key={i} />)}
          </div>
        )}

        {/* ── AFFILIATE DISCLOSURE ──────────────────────────────────────── */}
        <p className="text-[12px] text-[#9CA3AF] italic text-center">
          Prices are estimated. Clicking options opens partner sites.
          TripSage earns a referral when you book.
        </p>
      </div>

      {/* ── MOBILE STICKY BOTTOM CTA ──────────────────────────────────── */}
      <div className="lg:hidden fixed bottom-[60px] left-0 right-0 z-40 px-4 pb-3 pt-3 bg-gradient-to-t from-[#FFFBF7] via-[#FFFBF7]/90 to-transparent">
        <p className="text-[11px] text-[#9CA3AF] italic text-center mb-2">
          Prices estimated. Partner links earn TripSage a referral.
        </p>
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
    </>
  )
}

export default memo(TransportTab)
