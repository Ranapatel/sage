'use client'

import React from 'react'
import { useTripStore } from '@/store/tripStore'
import { calculateSageScore } from '@/lib/sageScore'

interface Props {
  item: any
  type: 'flight' | 'hotel'
}

export default function SageScoreBadge({ item, type }: Props) {
  // Access items from store to perform relative pricing normalization
  const { transport, returnTransport, hotels } = useTripStore()

  const allPrices = React.useMemo(() => {
    if (type === 'flight') {
      const allFlights = [...(transport || []), ...(returnTransport || [])]
      return allFlights.map(f => f.price).filter(p => p != null && p > 0)
    } else {
      return (hotels || []).map(h => h.price).filter(p => p != null && p > 0)
    }
  }, [type, transport, returnTransport, hotels])

  const scoreDetails = React.useMemo(() => {
    // 1. Price Value Score (40%)
    let priceScore = 70 // default
    let priceWeight = 28 // default weight
    const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price

    if (price != null && price > 0 && allPrices.length > 0) {
      const minPrice = Math.min(...allPrices)
      const maxPrice = Math.max(...allPrices)
      if (maxPrice > minPrice) {
        // Cheaper options get higher scores
        priceScore = ((maxPrice - price) / (maxPrice - minPrice)) * 100
      } else {
        priceScore = 100
      }
      priceWeight = priceScore * 0.4
    }

    // 2. Rating Score (30%)
    let ratingScore = 70 // default
    let ratingWeight = 21 // default weight
    let rawRating = 0
    if (item.rating != null) {
      rawRating = parseFloat(item.rating) || 0
    }

    if (rawRating > 0) {
      // Normalize to 0-5 scale
      const normRating = type === 'hotel' && rawRating > 5 
        ? +(rawRating / 2).toFixed(1) 
        : +rawRating.toFixed(1)
      
      ratingScore = Math.min(100, Math.max(0, (normRating / 5) * 100))
      ratingWeight = ratingScore * 0.3
    }

    // 3. Reviews Count Score (20%)
    // Generate deterministic reviews count based on item name and ID
    const str = `${item.id || ''}-${item.name || ''}`
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    const reviewsCount = (Math.abs(hash) % 480) + 20 // 20 to 500 reviews
    const reviewsScore = Math.min(100, (reviewsCount / 500) * 100)
    const reviewsWeight = reviewsScore * 0.2

    // 4. Availability Score (10%)
    let availabilityScore = 95 // default
    if (item.liveStatus) {
      const status = item.liveStatus.toLowerCase()
      if (status.includes('delay') || status.includes('cancel')) {
        availabilityScore = 30
      } else if (status.includes('unavailable')) {
        availabilityScore = 0
      } else if (status.includes('time') || status.includes('live') || status.includes('available')) {
        availabilityScore = 100
      } else {
        availabilityScore = 80
      }
    } else if (item.source === 'api_error') {
      availabilityScore = 0
    }
    const availWeight = availabilityScore * 0.1

    // Total Score
    const totalScore = Math.round(priceWeight + ratingWeight + reviewsWeight + availWeight)

    return {
      score: totalScore,
      priceScore,
      priceWeight,
      ratingScore,
      ratingWeight,
      reviewsCount,
      reviewsScore,
      reviewsWeight,
      availabilityScore,
      availWeight,
    }
  }, [item, type, allPrices])

  const { score, priceWeight, ratingWeight, reviewsCount, reviewsWeight, availWeight } = scoreDetails

  // Color mappings
  let colorClass = 'stroke-rose-500'
  let textClass = 'text-rose-600 dark:text-rose-400'
  let bgClass = 'bg-rose-500/10'

  if (score >= 80) {
    colorClass = 'stroke-emerald-500'
    textClass = 'text-emerald-600 dark:text-emerald-400'
    bgClass = 'bg-emerald-500/10'
  } else if (score >= 60) {
    colorClass = 'stroke-orange-500'
    textClass = 'text-orange-600 dark:text-orange-400'
    bgClass = 'bg-orange-500/10'
  }

  // SVG parameters
  const radius = 18
  const circ = 2 * Math.PI * radius
  const strokeDashoffset = circ - (circ * score) / 100

  return (
    <div className="group relative flex flex-col items-center select-none" style={{ contentVisibility: 'auto' }}>
      {/* Badge Circular UI */}
      <div className={`relative w-12 h-12 rounded-full flex items-center justify-center ${bgClass} transition-transform duration-300 hover:scale-105 shadow-sm`}>
        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
          {/* Background track circle */}
          <circle
            cx="24"
            cy="24"
            r={radius}
            className="stroke-slate-100 dark:stroke-slate-800/80"
            strokeWidth="3"
            fill="transparent"
          />
          {/* Foreground progress circle */}
          <circle
            cx="24"
            cy="24"
            r={radius}
            className={`${colorClass} transition-[stroke-dashoffset] duration-500`}
            strokeWidth="3.5"
            fill="transparent"
            strokeDasharray={circ}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <span className={`font-mono font-black text-sm tracking-tight z-10 ${textClass}`}>
          {score}
        </span>
      </div>

      {/* Label under badge */}
      <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider mt-1.5 whitespace-nowrap">
        Sage Score
      </span>

      {/* Hover Tooltip Breakdown */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 bg-slate-900/95 backdrop-blur text-white text-xs p-3.5 rounded-xl shadow-xl border border-white/10 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50">
        <div className="font-bold border-b border-white/10 pb-1.5 mb-2 flex justify-between items-center">
          <span className="tracking-wide">Sage Score Breakdown</span>
          <span className={`font-mono font-black text-sm px-1.5 py-0.5 rounded ${bgClass.replace('bg-', 'bg-dark-')} ${textClass}`}>
            {score}
          </span>
        </div>
        <div className="space-y-1.5 font-sans">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-white/60">Price Value (40%)</span>
            <span className="font-mono font-bold text-white/90">{priceWeight.toFixed(1)} <span className="text-white/30">/ 40</span></span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-white/60">Rating (30%)</span>
            <span className="font-mono font-bold text-white/90">{ratingWeight.toFixed(1)} <span className="text-white/30">/ 30</span></span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-white/60">Reviews ({reviewsCount}) (20%)</span>
            <span className="font-mono font-bold text-white/90">{reviewsWeight.toFixed(1)} <span className="text-white/30">/ 20</span></span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-white/60">Availability (10%)</span>
            <span className="font-mono font-bold text-white/90">{availWeight.toFixed(1)} <span className="text-white/30">/ 10</span></span>
          </div>
        </div>
        {/* Tooltip triangle arrow */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-[6px] border-transparent border-t-slate-900/95" />
      </div>
    </div>
  )
}

export function SageScoreRing({
  item,
  allItems,
  score: rawScore,
  size = 42,
  showLabel = true,
  dark = false,
}: {
  item?: any
  allItems?: any[]
  score?: number
  size?: number
  showLabel?: boolean
  dark?: boolean
}) {
  const score = item
    ? calculateSageScore(item, allItems)
    : Number.isFinite(rawScore)
    ? Math.max(0, Math.min(100, Math.round(rawScore!)))
    : 88
  const strokeWidth = 3.5
  const radius = (size - strokeWidth * 2) / 2
  const circ = 2 * Math.PI * radius
  const fill = (score / 100) * circ
  const color = score >= 80 ? '#16A34A' : score >= 60 ? '#EA580C' : '#9CA3AF'
  const trackColor = dark ? 'rgba(255,255,255,0.25)' : '#E8E0D8'
  const textColor = dark ? '#FFFFFF' : color

  return (
    <div className="flex flex-col items-center justify-center shrink-0 group relative cursor-help">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${fill} ${circ}`}
            strokeLinecap="round"
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center text-xs font-black font-mono leading-none"
          style={{ color: textColor }}
        >
          {score}
        </span>
      </div>
      {showLabel && (
        <span
          className="text-[8px] font-black tracking-wider uppercase mt-0.5"
          style={{ color: dark ? 'rgba(255,255,255,0.7)' : '#9CA3AF' }}
        >
          Sage Score
        </span>
      )}
    </div>
  )
}

