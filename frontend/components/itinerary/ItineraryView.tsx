'use client'
import React, { memo, useState, useEffect, useCallback, useRef, useMemo } from 'react'
import Image from 'next/image'
import { getOptimizedImageUrl } from '@/lib/imageUtils'
import { resolvePlaceImage, type PlaceImageResult } from '@/lib/placeImageResolver'
import { useIsMobile } from '@/hooks/useIsMobile'
import {
  MapPin, Clock, Wallet, Navigation, RefreshCw, Share2,
  BookmarkPlus, Plus, Zap, Coffee, Sunset, ChevronRight,
  ChevronLeft, Route, Cloud, Utensils, Info, ArrowRight,
  Timer, TrendingUp, Wind, Star, X, Check, AlertTriangle,
  Camera, Compass, ShoppingBag, Building2, TreePine, Landmark,
  Plane, UtensilsCrossed, Moon, Sun, Users, Heart,
  Waves, Leaf
} from 'lucide-react'
import PlaceCard from '@/components/PlaceCard'
import PlaceDetailsModal from '@/components/PlaceDetailsModal'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { useAuth } from '@clerk/nextjs'
import axios from 'axios'
import toast from 'react-hot-toast'

import { useTripStore } from '@/store/tripStore'
import { tripAPI } from '@/lib/api'
import TravelMemories from '@/components/photos/TravelMemories'
import { addBookmark } from '@/lib/bookmarkUtils'
import StoryCardModal from './StoryCardModal'
import CollaborativeInviteModal from './CollaborativeInviteModal'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Place {
  name: string
  description?: string
  category: string
  time?: string
  duration?: string
  estimatedSpend?: string
  travelTimeFromPrev?: string
  whyItFits?: string
  coordinates?: [number, number] | number[]
  image?: string
  photoUrl?: string
  isAiIllustration?: boolean
  smartLabels?: string[]
}

interface Day {
  day: number
  date?: string
  theme?: string
  places: Place[]
  weather?: { condition?: string; temp?: string; note?: string }
  foodNote?: string
  budgetNote?: string
  localTip?: string
  bestStartTime?: string
  slots?: any
}

interface Props {
  itinerary: Day[]
  loading: boolean
  destination?: string
  onRegenerate?: () => void
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_META: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  beach:         { icon: <Sun size={12} />,         color: '#0EA5E9', label: 'Beach' },
  nature:        { icon: <TreePine size={12} />,    color: '#22C55E', label: 'Nature' },
  culture:       { icon: <Landmark size={12} />,    color: '#A855F7', label: 'Culture' },
  explore:       { icon: <Compass size={12} />,     color: '#F59E0B', label: 'Explore' },
  transport:     { icon: <Plane size={12} />,       color: '#6B7280', label: 'Transport' },
  activity:      { icon: <Zap size={12} />,         color: '#EF4444', label: 'Activity' },
  shopping:      { icon: <ShoppingBag size={12} />, color: '#EC4899', label: 'Shopping' },
  accommodation: { icon: <Building2 size={12} />,   color: '#64748B', label: 'Stay' },
  food:          { icon: <UtensilsCrossed size={12} />, color: '#F97316', label: 'Food' },
  nightlife:     { icon: <Moon size={12} />,        color: '#7C3AED', label: 'Nightlife' },
}

// Large icon for category/none card watermark (80px)
const CATEGORY_META_LG: Record<string, React.ReactNode> = {
  beach:         <Sun size={80} />,
  nature:        <TreePine size={80} />,
  culture:       <Landmark size={80} />,
  explore:       <Compass size={80} />,
  transport:     <Plane size={80} />,
  activity:      <Zap size={80} />,
  shopping:      <ShoppingBag size={80} />,
  accommodation: <Building2 size={80} />,
  food:          <UtensilsCrossed size={80} />,
  nightlife:     <Moon size={80} />,
}

const SMART_LABEL_META: Record<string, { color: string; icon: React.ReactNode }> = {
  'Low travel time':    { color: '#22C55E', icon: <Timer size={10} /> },
  'Rain-aware':         { color: '#60A5FA', icon: <Cloud size={10} /> },
  'Budget fit':         { color: '#F59E0B', icon: <Wallet size={10} /> },
  'Veg-friendly nearby':{ color: '#84CC16', icon: <Utensils size={10} /> },
  'Family-friendly':    { color: '#A78BFA', icon: <Users size={10} /> },
  'Good for couples':   { color: '#F472B6', icon: <Heart size={10} /> },
  'Best before sunset': { color: '#F97316', icon: <Sunset size={10} /> },
  'Must-see':           { color: '#EA580C', icon: <Star size={10} /> },
  'Quick visit':        { color: '#94A3B8', icon: <Zap size={10} /> },
}

// Subtle dot-grid SVG used as pattern overlay on no-image cards
const DOT_GRID_SVG = `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='%23000' fill-opacity='0.04'/%3E%3C/svg%3E")`
const DOT_GRID_LIGHT_SVG = `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='%23FFF' fill-opacity='0.06'/%3E%3C/svg%3E")`

interface FallbackStyle {
  background: string
  textPrimary: string
  textSecondary: string
  textTertiary: string
  pillBg: string
  pillBorder: string
  icon: React.ReactNode
  accentColor: string
}

function getFallbackStyle(categoryStr: string): FallbackStyle {
  const c = categoryStr.toLowerCase()
  if (c.includes('food') || c.includes('cafe') || c.includes('restaurant') || c.includes('dining')) {
    return {
      background: '#FAF6F0', // warm cream
      textPrimary: '#2D2D2D',
      textSecondary: '#5A5A5A',
      textTertiary: '#8E8E93',
      pillBg: 'rgba(0, 0, 0, 0.03)',
      pillBorder: 'rgba(0, 0, 0, 0.05)',
      icon: <UtensilsCrossed size={16} className="text-[#EA580C]" />,
      accentColor: '#EA580C',
    }
  }
  if (c.includes('shopping') || c.includes('market') || c.includes('bazaar') || c.includes('mall') || c.includes('store')) {
    return {
      background: '#F4EFE6', // soft sand
      textPrimary: '#2D2D2D',
      textSecondary: '#5A5A5A',
      textTertiary: '#8E8E93',
      pillBg: 'rgba(0, 0, 0, 0.03)',
      pillBorder: 'rgba(0, 0, 0, 0.05)',
      icon: <ShoppingBag size={16} className="text-[#8B5CF6]" />,
      accentColor: '#8B5CF6',
    }
  }
  if (c.includes('beach') || c.includes('sea') || c.includes('coast') || c.includes('water')) {
    return {
      background: '#EBF5FA', // pale blue
      textPrimary: '#2D2D2D',
      textSecondary: '#5A5A5A',
      textTertiary: '#8E8E93',
      pillBg: 'rgba(0, 0, 0, 0.03)',
      pillBorder: 'rgba(0, 0, 0, 0.05)',
      icon: <Waves size={16} className="text-[#0EA5E9]" />,
      accentColor: '#0EA5E9',
    }
  }
  if (c.includes('culture') || c.includes('heritage') || c.includes('temple') || c.includes('monument') || c.includes('church') || c.includes('landmark')) {
    return {
      background: '#F2F1EC', // stone/off-white
      textPrimary: '#2D2D2D',
      textSecondary: '#5A5A5A',
      textTertiary: '#8E8E93',
      pillBg: 'rgba(0, 0, 0, 0.03)',
      pillBorder: 'rgba(0, 0, 0, 0.05)',
      icon: <Landmark size={16} className="text-[#A855F7]" />,
      accentColor: '#A855F7',
    }
  }
  if (c.includes('nature') || c.includes('park') || c.includes('garden') || c.includes('forest') || c.includes('lake') || c.includes('waterfall')) {
    return {
      background: '#EDF1E7', // soft green-gray
      textPrimary: '#2D2D2D',
      textSecondary: '#5A5A5A',
      textTertiary: '#8E8E93',
      pillBg: 'rgba(0, 0, 0, 0.03)',
      pillBorder: 'rgba(0, 0, 0, 0.05)',
      icon: <Leaf size={16} className="text-[#10B981]" />,
      accentColor: '#10B981',
    }
  }
  if (c.includes('nightlife') || c.includes('bar') || c.includes('club') || c.includes('pub')) {
    return {
      background: '#1F2022', // charcoal
      textPrimary: '#F4F4F5',
      textSecondary: '#A1A1AA',
      textTertiary: '#71717A',
      pillBg: 'rgba(255, 255, 255, 0.08)',
      pillBorder: 'rgba(255, 255, 255, 0.12)',
      icon: <Moon size={16} className="text-[#F59E0B]" />,
      accentColor: '#F59E0B',
    }
  }
  return {
    background: '#FAF9F6', // light stone/white
    textPrimary: '#2D2D2D',
    textSecondary: '#5A5A5A',
    textTertiary: '#8E8E93',
    pillBg: 'rgba(0, 0, 0, 0.03)',
    pillBorder: 'rgba(0, 0, 0, 0.05)',
    icon: <Compass size={16} className="text-[#6B7280]" />,
    accentColor: '#6B7280',
  }
}

// ─── Derive smart labels from place data ─────────────────────────────────────

function deriveSmartLabels(place: Place, index: number): string[] {
  const labels: string[] = []
  if (place.smartLabels?.length) return place.smartLabels

  const time = place.time || ''
  const travelTime = place.travelTimeFromPrev || ''
  const travelMins = parseInt(travelTime) || 0

  if (travelMins <= 15 || travelTime.includes('walk')) labels.push('Low travel time')
  if (time.toLowerCase().includes('pm') && parseInt(time) < 7) labels.push('Best before sunset')
  if (['nature', 'beach', 'explore'].includes(place.category?.toLowerCase())) labels.push('Best before sunset')
  if (place.description?.toLowerCase().includes('veg') || place.description?.toLowerCase().includes('food')) labels.push('Veg-friendly nearby')
  if (place.category === 'food') labels.push('Veg-friendly nearby')

  const spend = place.estimatedSpend || ''
  const spendNum = parseInt(spend.replace(/[^\d]/g, '')) || 0
  if (spendNum < 500 || spend.toLowerCase().includes('free') || spend === '₹0') labels.push('Budget fit')

  return labels.slice(0, 3)
}

// ─── Derive day pace from number of places ───────────────────────────────────

function deriveDayPace(places: Place[]): { label: string; color: string; desc: string } {
  const n = places.length
  if (n <= 3) return { label: 'Light', color: '#22C55E', desc: 'Easy pace with room to breathe' }
  if (n <= 5) return { label: 'Balanced', color: '#F59E0B', desc: 'Well-paced day with variety' }
  return { label: 'Packed', color: '#EF4444', desc: 'Action-filled day — start early' }
}

// ─── Build Google Maps route URL ─────────────────────────────────────────────

function buildRouteUrl(places: Place[], destination?: string): string {
  if (!places || !Array.isArray(places)) return ''
  const waypoints = places
    .map((p: Place) => {
      if (p && Array.isArray(p.coordinates) && p.coordinates.length === 2 && !isNaN(Number(p.coordinates[0]))) {
        return `${Number(p.coordinates[0])},${Number(p.coordinates[1])}`
      }
      return encodeURIComponent(p.name + (destination ? ` ${destination}` : ''))
    })
  if (waypoints.length === 0) return `https://www.google.com/maps/search/${encodeURIComponent(destination || 'travel')}`
  if (waypoints.length === 1) return `https://maps.google.com/?q=${waypoints[0]}`
  const origin = waypoints[0]
  const dest = waypoints[waypoints.length - 1]
  const middle = waypoints.slice(1, -1).join('|')
  return `https://www.google.com/maps/dir/${origin}/${middle ? middle + '/' : ''}${dest}`
}

// ─── Stop Card ────────────────────────────────────────────────────────────────

const StopCard = memo(({ place, index, dayIndex, destination, isLast, onReplace }: {
  place: Place
  index: number
  dayIndex: number
  destination?: string
  isLast: boolean
  onReplace?: (dayIdx: number, placeIdx: number) => void
}) => {
  const isMobile = useIsMobile()
  const [imageResult, setImageResult] = useState<PlaceImageResult | null>(null)
  const [imgLoaded, setImgLoaded]     = useState(false)
  const [imgError, setImgError]       = useState(false)
  const resolvedRef = useRef(false)

  // Kick off resolver once per card.
  // If backend already enriched place.image (Wikipedia/Flickr), use it directly
  // and skip the expensive frontend resolver entirely.
  useEffect(() => {
    if (resolvedRef.current) return
    resolvedRef.current = true

    // ── Fast path: backend pre-fetched image ─────────────────────────────────
    const imgUrl = (typeof place.image === 'string' && place.image.startsWith('http')) ? place.image : (place.photoUrl || (typeof place.image === 'string' ? place.image : null))
    if (imgUrl) {
      setImgLoaded(false)
      setImgError(false)
      setImageResult({
        imageUrl: imgUrl,
        source: 'curated',
        confidence: 'exact',
        attribution: place.isAiIllustration ? 'AI Illustration' : null,
        attributionUrl: null,
        license: null,
        altText: place.name,
        showAsBackground: true,
      })
      return
    }

    // ── Slow path: frontend resolver (legacy fallback) ────────────────────────
    const hasCoords =
      Array.isArray(place.coordinates) &&
      place.coordinates.length === 2 &&
      !isNaN(Number(place.coordinates[0])) &&
      !isNaN(Number(place.coordinates[1]))

    resolvePlaceImage({
      placeName: place.name,
      city:      destination ?? '',
      country:   '',
      lat:       hasCoords ? Number(place.coordinates![0]) : undefined,
      lng:       hasCoords ? Number(place.coordinates![1]) : undefined,
      category:  place.category,
    }).then(result => {
      setImgLoaded(false)
      setImgError(false)
      setImageResult(result)
    }).catch(() => {
      setImageResult({
        imageUrl: null, source: 'none', confidence: 'none',
        attribution: null, attributionUrl: null, license: null,
        altText: place.name, showAsBackground: false,
      })
    })
  }, [place.name, place.image, place.photoUrl, place.isAiIllustration, place.category, destination, place.coordinates])

  const hasCoords = Array.isArray(place.coordinates)
    && place.coordinates.length === 2
    && !isNaN(Number(place.coordinates[0]))
    && !isNaN(Number(place.coordinates[1]))

  const mapsHref = hasCoords
    ? `https://maps.google.com/?q=${Number(place.coordinates![0])},${Number(place.coordinates![1])}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + (destination ? ` ${destination}` : ''))}`

  const cat       = (place.category || 'explore').toLowerCase()
  const meta      = CATEGORY_META[cat] || CATEGORY_META.explore
  const smartLabels = deriveSmartLabels(place, index)

  // Derived display flags
  const confidence    = imageResult?.confidence ?? null
  const showImage     = !imgError && imageResult?.showAsBackground && !!imageResult.imageUrl
  const isAreaImage   = confidence === 'area'
  const isResolving   = imageResult === null                     // still loading
  const hasAttribution = showImage && !!imageResult?.attribution

  // Category specific premium editorial styling config
  const fallbackStyle = getFallbackStyle(cat)
  const isDarkCard    = !showImage && (cat.includes('nightlife') || cat.includes('bar') || cat.includes('club') || cat.includes('pub'))

  // Theme-sensitive styles
  const textPrimary   = showImage ? '#FFFFFF' : fallbackStyle.textPrimary
  const textSecondary = showImage ? 'rgba(255,255,255,0.80)' : fallbackStyle.textSecondary
  const textTertiary  = showImage ? 'rgba(255,255,255,0.60)' : fallbackStyle.textTertiary
  const pillBg        = showImage ? 'rgba(255,255,255,0.12)' : fallbackStyle.pillBg
  const pillBorder    = showImage ? 'rgba(255,255,255,0.15)' : fallbackStyle.pillBorder

  const handleImgError = () => setImgError(true)

  // ─── Background layer ──────────────────────────────────────────────────────
  const renderBackground = () => {
    // 1. Skeleton while resolving
    if (isResolving) {
      return (
        <div
          className="absolute inset-0 animate-pulse"
          style={{ background: 'linear-gradient(135deg, #F0EBE4 0%, #E8E0D8 100%)' }}
        />
      )
    }
    // 2. Photo background (exact or area)
    if (showImage) {
      return (
        <>
          {!imgLoaded && (
            <div className="absolute inset-0 animate-pulse"
              style={{ background: 'linear-gradient(135deg, #F0EBE4 0%, #E8E0D8 100%)' }} />
          )}
          <Image
            src={getOptimizedImageUrl(imageResult!.imageUrl!, isMobile)}
            alt={imageResult!.altText}
            fill
            className={`object-cover transition-all duration-700 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            sizes="(max-width: 768px) 100vw, 60vw"
            unoptimized
            onLoad={() => setImgLoaded(true)}
            onError={handleImgError}
            loading="lazy"
          />
        </>
      )
    }
    // 3. Fallback editorial card
    return (
      <div
        className="absolute inset-0"
        style={{
          background: fallbackStyle.background,
          backgroundImage: isDarkCard ? DOT_GRID_LIGHT_SVG : DOT_GRID_SVG,
          backgroundSize: '20px 20px',
        }}
      >
        {/* Subtle top color highlight strip */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl opacity-90"
          style={{ background: fallbackStyle.accentColor }}
        />
      </div>
    )
  }

  // ─── Overlay gradient (only for photo cards) ───────────────────────────────
  const renderOverlay = () => {
    if (!showImage || isResolving) return null
    return (
      <div
        className="absolute inset-0"
        style={{
          background: isAreaImage
            ? 'linear-gradient(to top, rgba(20,20,20,0.82) 0%, rgba(20,20,20,0.48) 50%, rgba(20,20,20,0.15) 100%)'
            : 'linear-gradient(to top, rgba(10,10,10,0.92) 0%, rgba(10,10,10,0.55) 45%, rgba(0,0,0,0.15) 100%)',
          backdropFilter: isAreaImage ? 'grayscale(35%) contrast(95%)' : 'none',
        }}
      />
    )
  }

  return (
    <div className="relative flex gap-0 sm:gap-4">
      {/* Timeline spine */}
      <div className="hidden sm:flex flex-col items-center w-10 flex-shrink-0 pt-5">
        <div
          className="w-4 h-4 rounded-full border-2 border-white flex-shrink-0 z-10 shadow-sm"
          style={{ background: meta.color }}
        />
        {!isLast && <div className="w-0.5 flex-1 mt-1" style={{ background: 'linear-gradient(to bottom, #E8E0D8 0%, transparent 100%)' }} />}
      </div>

      {/* Card */}
      <div className="flex-1 mb-4 group" style={{ minWidth: 0 }}>
        {/* Time label above card */}
        {place.time && (
          <div className="flex items-center gap-2 mb-2 pl-1 sm:pl-0">
            <span className="sm:hidden w-2 h-2 rounded-full flex-shrink-0" style={{ background: meta.color }} />
            <span className="font-mono text-xs font-bold" style={{ color: '#EA580C' }}>{place.time}</span>
            {place.travelTimeFromPrev && (
              <span className="text-xs text-[#A1A1AA] flex items-center gap-1">
                <Navigation size={10} className="inline" />
                {place.travelTimeFromPrev} from prev
              </span>
            )}
          </div>
        )}

        {/* Card shell */}
        <div
          className="relative rounded-2xl overflow-hidden cursor-pointer transition-transform duration-300 group-hover:-translate-y-1"
          style={{
            minHeight: 220,
            boxShadow: showImage
              ? '0 4px 24px rgba(0,0,0,0.18)'
              : isDarkCard
                ? '0 4px 24px rgba(0,0,0,0.25)'
                : '0 2px 16px rgba(0,0,0,0.04)',
            border: showImage
              ? '1px solid rgba(255,255,255,0.08)'
              : isDarkCard
                ? '1px solid rgba(255,255,255,0.05)'
                : '1px solid rgba(232,224,216,0.6)',
          }}
        >
          {/* Background */}
          {renderBackground()}

          {/* Photo dark overlay / muting */}
          {renderOverlay()}

          {/* ── Top bar ── */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
            {/* Category badge */}
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold text-[10px] uppercase tracking-wider backdrop-blur-sm"
              style={{
                background: showImage ? `${meta.color}CC` : `${fallbackStyle.accentColor}12`,
                color: showImage ? '#FFFFFF' : fallbackStyle.accentColor,
                border: showImage ? 'none' : `1px solid ${fallbackStyle.accentColor}25`,
              }}
            >
              {React.cloneElement(fallbackStyle.icon as React.ReactElement, { size: 10, className: 'mr-0.5' })} {meta.label}
            </span>

            {/* Right badge: Illustration label OR area chip OR smart label OR verified image notice */}
            {place.isAiIllustration || (imageResult as any)?.isAiIllustration ? (
              <span
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-semibold backdrop-blur-sm"
                style={{
                  background: 'rgba(234,88,12,0.85)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                🔮 Illustration
              </span>
            ) : isAreaImage ? (
              <span
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-semibold backdrop-blur-sm"
                style={{
                  background: 'rgba(0,0,0,0.35)',
                  color: 'rgba(255,255,255,0.75)',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                <MapPin size={8} /> Area image
              </span>
            ) : smartLabels.length > 0 ? (
              <div className="flex items-center gap-2">
                {!showImage && !isResolving && (
                  <span className="text-[9px] font-medium opacity-60 mr-1" style={{ color: textTertiary }}>
                    No verified image available
                  </span>
                )}
                <span
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold backdrop-blur-sm"
                  style={{
                    background: pillBg,
                    color: textSecondary,
                    border: `1px solid ${pillBorder}`,
                  }}
                >
                  {SMART_LABEL_META[smartLabels[0]]?.icon}
                  {smartLabels[0]}
                </span>
              </div>
            ) : (
              !showImage && !isResolving && (
                <span className="text-[9px] font-medium opacity-60" style={{ color: textTertiary }}>
                  No verified image available
                </span>
              )
            )}
          </div>

          {/* ── Main content (bottom of card) ── */}
          <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
            {/* Place name */}
            <h3
              className="font-bold text-lg leading-tight mb-1"
              style={{
                color: textPrimary,
                textShadow: showImage ? '0 1px 4px rgba(0,0,0,0.5)' : 'none',
              }}
            >
              {place.name}
            </h3>

            {/* Description */}
            {place.description && (
              <p className="text-xs leading-relaxed mb-3 line-clamp-2" style={{ color: textSecondary }}>
                {place.description}
              </p>
            )}

            {/* Meta pills */}
            <div className="flex flex-wrap gap-2 mb-3">
              {place.duration && (
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold backdrop-blur-sm border"
                  style={{ background: pillBg, color: textSecondary, borderColor: pillBorder }}
                >
                  <Timer size={9} /> {place.duration}
                </span>
              )}
              {place.estimatedSpend && (
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold backdrop-blur-sm border"
                  style={{ background: pillBg, color: textSecondary, borderColor: pillBorder }}
                >
                  <Wallet size={9} /> {place.estimatedSpend}
                </span>
              )}
              {smartLabels.slice(1).map(label => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold backdrop-blur-sm border"
                  style={{ background: pillBg, color: textSecondary, borderColor: pillBorder }}
                >
                  {SMART_LABEL_META[label]?.icon} {label}
                </span>
              ))}
            </div>

            {/* Why it fits */}
            {place.whyItFits && (
              <div
                className="flex items-start gap-1.5 mb-3 px-2 py-1.5 rounded-lg border backdrop-blur-sm"
                style={{ background: pillBg, borderColor: pillBorder }}
              >
                <Info size={10} className="mt-0.5 flex-shrink-0" style={{ color: textTertiary }} />
                <p className="text-[10px] leading-relaxed" style={{ color: textSecondary }}>{place.whyItFits}</p>
              </div>
            )}

            {/* Actions row */}
            <div className="flex items-center gap-2">
              <a
                href={mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:scale-105 active:scale-95"
                style={{ background: '#EA580C', boxShadow: '0 2px 8px rgba(234,88,12,0.4)' }}
                onClick={e => e.stopPropagation()}
              >
                <MapPin size={11} /> Open Maps
              </a>
              <button
                onClick={() => onReplace?.(dayIndex, index)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80 border"
                style={{ background: pillBg, color: textSecondary, borderColor: pillBorder }}
                title="Replace this stop"
              >
                <RefreshCw size={10} /> Replace
              </button>
            </div>

            {/* Attribution strip (Wikimedia sources only) */}
            {hasAttribution && (
              <div className="flex justify-end mt-2">
                <a
                  href={imageResult!.attributionUrl ?? '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[9px] rounded px-1.5 py-0.5 transition-opacity hover:opacity-80"
                  style={{
                    background: 'rgba(0,0,0,0.35)',
                    color: 'rgba(255,255,255,0.65)',
                  }}
                  onClick={e => e.stopPropagation()}
                >
                  {imageResult!.attribution}
                  {imageResult!.license && <> · {imageResult!.license}</>}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})
StopCard.displayName = 'StopCard'

const DayIntelligencePanel = memo(({
  day,
  dayIndex,
  destination,
  onRegenerate,
  onRelaxDay,
  onAddFood,
  onLocalExp,
  onSaveDay,
  onShareDay,
  onOptimizeRoute,
  isOptimizing = false
}: {
  day: Day
  dayIndex: number
  destination?: string
  onRegenerate?: () => void
  onRelaxDay?: (idx: number) => void
  onAddFood?: (idx: number) => void
  onLocalExp?: (idx: number) => void
  onSaveDay?: (idx: number) => void
  onShareDay?: () => void
  onOptimizeRoute?: (idx: number) => void
  isOptimizing?: boolean
}) => {
  const pace = deriveDayPace(day.places)

  // Estimate total daily spend from places
  const totalSpend = day.places.reduce((acc, p) => {
    if (!p.estimatedSpend) return acc
    const nums = p.estimatedSpend.match(/\d+/g)
    if (nums) {
      const avg = nums.length === 2
        ? (parseInt(nums[0]) + parseInt(nums[1])) / 2
        : parseInt(nums[0])
      return acc + avg
    }
    return acc
  }, 0)

  // Estimate total travel time
  const totalTravel = day.places.reduce((acc, p) => {
    if (!p.travelTimeFromPrev) return acc
    const mins = parseInt(p.travelTimeFromPrev.match(/\d+/)?.[0] || '0')
    return acc + mins
  }, 0)

  const routeUrl = buildRouteUrl(day.places, destination)

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: '#FFFFFF',
        border: '1px solid #E8E0D8',
        boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
      }}
    >
      {/* Panel header */}
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid #F0EBE4' }}
      >
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#A1A1AA] mb-0.5">Day Intelligence</p>
          <h4 className="font-bold text-[#1A1A1A] text-sm">Day {day.day} Snapshot</h4>
        </div>
        <div
          className="px-3 py-1 rounded-full text-xs font-bold"
          style={{ background: `${pace.color}18`, color: pace.color, border: `1px solid ${pace.color}30` }}
        >
          {pace.label}
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Pace description */}
        <p className="text-xs text-[#6B6B6B] leading-relaxed">{pace.desc}</p>

        {/* Stat grid */}
        <div className="grid grid-cols-2 gap-3">
          {totalSpend > 0 && (
            <div className="rounded-xl p-3" style={{ background: '#FFFBF7', border: '1px solid #F0EBE4' }}>
              <p className="text-[9px] font-bold uppercase tracking-wider text-[#A1A1AA] mb-1">Est. Day Spend</p>
              <p className="font-bold text-sm text-[#1A1A1A]">₹{Math.round(totalSpend).toLocaleString('en-IN')}</p>
            </div>
          )}
          {totalTravel > 0 && (
            <div className="rounded-xl p-3" style={{ background: '#FFFBF7', border: '1px solid #F0EBE4' }}>
              <p className="text-[9px] font-bold uppercase tracking-wider text-[#A1A1AA] mb-1">Total Travel</p>
              <p className="font-bold text-sm text-[#1A1A1A]">{totalTravel} min</p>
            </div>
          )}
          <div className="rounded-xl p-3" style={{ background: '#FFFBF7', border: '1px solid #F0EBE4' }}>
            <p className="text-[9px] font-bold uppercase tracking-wider text-[#A1A1AA] mb-1">Stops</p>
            <p className="font-bold text-sm text-[#1A1A1A]">{day.places.length} places</p>
          </div>
          <div className="rounded-xl p-3" style={{ background: '#FFFBF7', border: '1px solid #F0EBE4' }}>
            <p className="text-[9px] font-bold uppercase tracking-wider text-[#A1A1AA] mb-1">Best Start</p>
            <p className="font-bold text-sm text-[#1A1A1A]">{day.bestStartTime || day.places[0]?.time || '8:00 AM'}</p>
          </div>
        </div>

        {/* Contextual notes */}
        <div className="space-y-2">
          {day.weather?.note && (
            <div className="flex items-start gap-2 p-2.5 rounded-xl" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
              <Cloud size={12} className="text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-[#1E40AF] leading-relaxed">{day.weather.note}</p>
            </div>
          )}
          {day.foodNote && (
            <div className="flex items-start gap-2 p-2.5 rounded-xl" style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}>
              <Utensils size={12} className="text-orange-400 mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-[#9A3412] leading-relaxed">{day.foodNote}</p>
            </div>
          )}
          {day.localTip && (
            <div className="flex items-start gap-2 p-2.5 rounded-xl" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
              <Info size={12} className="text-green-500 mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-[#166534] leading-relaxed">{day.localTip}</p>
            </div>
          )}
          {day.budgetNote && (
            <div className="flex items-start gap-2 p-2.5 rounded-xl" style={{ background: '#FEFCE8', border: '1px solid #FEF08A' }}>
              <Wallet size={12} className="text-yellow-500 mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-[#854D0E] leading-relaxed">{day.budgetNote}</p>
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: '#F0EBE4' }} />

        {/* Action buttons */}
        <div className="space-y-2">
          <button
            onClick={() => onOptimizeRoute?.(dayIndex)}
            disabled={isOptimizing || day.places.length <= 2}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: '#0284C7', boxShadow: '0 2px 10px rgba(2,132,199,0.25)' }}
          >
            {isOptimizing ? (
              <>
                <RefreshCw size={14} className="animate-spin" /> Optimizing...
              </>
            ) : (
              <>
                <Zap size={14} /> Optimize Stop Order
              </>
            )}
          </button>

          <a
            href={routeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: '#EA580C', boxShadow: '0 2px 10px rgba(234,88,12,0.25)' }}
          >
            <Route size={14} /> Open Full Route
          </a>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onRegenerate}
              className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-[#F5F0EA] active:scale-95"
              style={{ background: '#FFFBF7', border: '1px solid #E8E0D8', color: '#6B6B6B' }}
            >
              <RefreshCw size={11} /> Regenerate
            </button>
            <button
              onClick={() => onRelaxDay?.(dayIndex)}
              className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-[#F5F0EA] active:scale-95"
              style={{ background: '#FFFBF7', border: '1px solid #E8E0D8', color: '#6B6B6B' }}
            >
              <Wind size={11} /> Relax day
            </button>
            <button
              onClick={() => onAddFood?.(dayIndex)}
              className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-[#F5F0EA] active:scale-95"
              style={{ background: '#FFFBF7', border: '1px solid #E8E0D8', color: '#6B6B6B' }}
            >
              <UtensilsCrossed size={11} /> Add food
            </button>
            <button
              onClick={() => onLocalExp?.(dayIndex)}
              className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-[#F5F0EA] active:scale-95"
              style={{ background: '#FFFBF7', border: '1px solid #E8E0D8', color: '#6B6B6B' }}
            >
              <Compass size={11} /> Local exp.
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onSaveDay?.(dayIndex)}
              className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-[#F5F0EA] active:scale-95"
              style={{ background: '#FFFBF7', border: '1px solid #E8E0D8', color: '#6B6B6B' }}
            >
              <BookmarkPlus size={11} /> Save day
            </button>
            <button
              onClick={onShareDay}
              className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-[#F5F0EA] active:scale-95"
              style={{ background: '#FFFBF7', border: '1px solid #E8E0D8', color: '#6B6B6B' }}
            >
              <Share2 size={11} /> Share day
            </button>
          </div>
        </div>
      </div>
    </div>
  )
})
DayIntelligencePanel.displayName = 'DayIntelligencePanel'

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function ItineraryLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-6 w-52 bg-[#E8E0D8] rounded-lg" />
          <div className="h-4 w-36 bg-[#F0EBE4] rounded-lg" />
        </div>
        <div className="h-8 w-20 bg-[#F0EBE4] rounded-xl" />
      </div>
      {/* Day selector */}
      <div className="flex gap-2">
        {[1,2,3].map(i => (
          <div key={i} className="h-10 w-20 rounded-xl flex-shrink-0" style={{ background: i === 1 ? '#EA580C22' : '#F0EBE4' }} />
        ))}
      </div>
      {/* Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="rounded-2xl overflow-hidden" style={{ height: 240, background: 'linear-gradient(135deg, #F0EBE4, #E8E0D8)' }}>
              <div className="h-full flex flex-col justify-end p-5 space-y-2">
                <div className="h-4 w-1/2 bg-white/30 rounded" />
                <div className="h-3 w-3/4 bg-white/20 rounded" />
                <div className="h-3 w-2/3 bg-white/20 rounded" />
              </div>
            </div>
          ))}
        </div>
        <div className="hidden lg:block h-64 rounded-2xl" style={{ background: '#F0EBE4' }} />
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

function ItineraryView({ itinerary: rawItinerary, loading, destination, onRegenerate }: Props) {
  const itinerary = useMemo(() => {
    if (!Array.isArray(rawItinerary)) return []
    return rawItinerary.map((day: any) => {
      if (!day) return day
      let places = day.places
      if (!places || !Array.isArray(places)) {
        const slots = day.slots || {}
        places = [slots.morning, slots.afternoon, slots.evening, slots.night].filter(Boolean)
      }
      return {
        ...day,
        places: places || []
      }
    })
  }, [rawItinerary])

  const [activeDay, setActiveDay] = useState(0)
  const [showStoryModal, setShowStoryModal] = useState(false)
  const [showCollabModal, setShowCollabModal] = useState(false)
  const isMobile = useIsMobile()
  const daySelectorRef = useRef<HTMLDivElement>(null)
  
  const { setItinerary, currentTripId: storeTripId } = useTripStore()
  const effectiveTripId = storeTripId || 'active_trip_session'
  const [isOptimizing, setIsOptimizing] = useState(false)

  const handleOptimizeRoute = useCallback(async (dayIndex: number) => {
    const currentDay = itinerary[dayIndex]
    if (!currentDay) return
    if (currentDay.places.length <= 2) {
      toast.error("At least 3 stops are required to run route optimization.")
      return
    }

    setIsOptimizing(true)
    const toastId = toast.loading("Optimizing itinerary route...")

    try {
      const tripId = useTripStore.getState().currentTripId || 'temp-trip'
      const userProfile = useTripStore.getState().userProfile
      
      const requestPlaces = currentDay.places.map((p: any, idx: number) => ({
        name: p.name,
        latitude: p.coordinates ? p.coordinates[0] : 0,
        longitude: p.coordinates ? p.coordinates[1] : 0,
        orderIndex: idx,
        category: p.category
      }))

      const response = await tripAPI.optimizeRoute({
        places: requestPlaces,
        preferences: userProfile?.preferences || [],
        travelStyle: userProfile?.travelStyle || 'relaxed',
        tripId,
        dayNumber: dayIndex + 1,
        trigger: 'user_requested'
      })

      if (response?.success && response?.data) {
        const { optimizedPlaces, wasOptimized, totalDistanceKm, estimatedTimeMinutes, reason } = response.data
        
        if (wasOptimized) {
          const placeMap = new Map(currentDay.places.map((p: any) => [p.name.toLowerCase(), p]))
          
          const reorderedPlaces = optimizedPlaces.map(opt => {
            const original = placeMap.get(opt.name.toLowerCase())
            return {
              ...(original || {} as any),
              name: opt.name,
              category: opt.category || (original as any)?.category || '',
              coordinates: [opt.latitude, opt.longitude],
              orderIndex: opt.orderIndex
            } as Place
          })

          const newItinerary = itinerary.map((d, idx) => 
            idx === dayIndex ? { ...d, places: reorderedPlaces } : d
          )
          setItinerary(newItinerary as any)
          
          let successMsg = "Route optimized successfully!"
          if (totalDistanceKm > 0) {
            successMsg += ` (Distance: ${totalDistanceKm} km)`
          }
          toast.success(successMsg, { id: toastId })
        } else {
          toast.success(reason || "Route is already fully optimized.", { id: toastId })
        }
      } else {
        throw new Error("Invalid optimization response")
      }
    } catch (err: any) {
      console.error("Optimization failed:", err)
      toast.error(err.message || "Failed to optimize route. Please try again.", { id: toastId })
    } finally {
      setIsOptimizing(false)
    }
  }, [itinerary, setItinerary])

  // Clamp activeDay within bounds whenever itinerary changes
  useEffect(() => {
    if (activeDay >= itinerary.length && itinerary.length > 0) {
      setActiveDay(0)
    }
  }, [itinerary.length, activeDay])

  // Scroll active day chip into view
  useEffect(() => {
    const container = daySelectorRef.current
    if (!container) return
    const btn = container.querySelectorAll('button')[activeDay] as HTMLElement
    if (btn) btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [activeDay])

  // ─── Adjust Day Actions ────────────────────────────────────────────────────

  const handleRelaxDay = useCallback((dayIndex: number) => {
    const currentDay = itinerary[dayIndex]
    if (!currentDay) return
    if (currentDay.places.length <= 2) {
      toast.error("Day is already relaxed. Minimum 2 stops required.")
      return
    }
    const updatedPlaces = [...currentDay.places]
    const removed = updatedPlaces.pop()
    const newItinerary = itinerary.map((d, idx) => 
      idx === dayIndex ? { ...d, places: updatedPlaces } : d
    )
    setItinerary(newItinerary as any)
    toast.success(`Removed "${removed?.name}" to relax the schedule.`)
  }, [itinerary, setItinerary])

  const handleAddFood = useCallback((dayIndex: number) => {
    const currentDay = itinerary[dayIndex]
    if (!currentDay) return
    
    const foodStop = {
      name: "Authentic Local Dining & Bistro",
      time: "13:30",
      category: "food",
      description: "Taste local specialties, organic farm-to-table recipes, and regional desserts in a cosy, highly rated neighbourhood bistro.",
      estimatedSpend: "₹300 - ₹700",
      whyItFits: "Fits your group size and budget preference.",
      coordinates: currentDay.places[0]?.coordinates || [12.9716, 77.5946]
    }
    
    const updatedPlaces = [...currentDay.places]
    const insertIdx = Math.max(1, Math.floor(updatedPlaces.length / 2))
    updatedPlaces.splice(insertIdx, 0, foodStop)

    const newItinerary = itinerary.map((d, idx) => 
      idx === dayIndex ? { ...d, places: updatedPlaces } : d
    )
    setItinerary(newItinerary as any)
    toast.success("Added local dining stop!")
  }, [itinerary, setItinerary])

  const handleAddLocalExp = useCallback((dayIndex: number) => {
    const currentDay = itinerary[dayIndex]
    if (!currentDay) return
    
    const localExp = {
      name: `Off-Beat Guided Activity in ${destination || "the city"}`,
      time: "16:30",
      category: "explore",
      description: "Discover hidden historic alleyways, interact with local artisans, and view scenic vistas away from usual tourist crowds.",
      estimatedSpend: "₹250 - ₹500",
      whyItFits: "Recommended by our local culture intelligence.",
      coordinates: currentDay.places[0]?.coordinates || [12.9716, 77.5946]
    }
    
    const updatedPlaces = [...currentDay.places]
    updatedPlaces.push(localExp)

    const newItinerary = itinerary.map((d, idx) => 
      idx === dayIndex ? { ...d, places: updatedPlaces } : d
    )
    setItinerary(newItinerary as any)
    toast.success("Added a unique local experience!")
  }, [itinerary, setItinerary, destination])

  const handleReplaceStop = useCallback(async (dayIndex: number, placeIndex: number) => {
    const currentDay = itinerary[dayIndex]
    const stopToReplace = currentDay?.places[placeIndex]
    if (!stopToReplace) return

    const toastId = toast.loading(`Finding alternatives for "${stopToReplace.name}"...`)
    
    try {
      const res = await tripAPI.getActivities(destination || '', stopToReplace.category)
      const alternatives = res?.data || []
      
      const existingNames = new Set(currentDay.places.map((p: any) => p.name.toLowerCase()))
      const candidates = alternatives.filter(alt => !existingNames.has(alt.name?.toLowerCase()))
      
      if (candidates.length === 0) {
        throw new Error("No unused alternatives found")
      }
      
      const selected = candidates[Math.floor(Math.random() * candidates.length)]
      
      const newPlace = {
        name: selected.name || stopToReplace.name,
        time: stopToReplace.time,
        category: stopToReplace.category,
        description: selected.description || stopToReplace.description || "A wonderful local spot recommended by our travel guide.",
        estimatedSpend: selected.price || stopToReplace.estimatedSpend || "₹200 - ₹500",
        whyItFits: "Custom swap replacement based on your preferences.",
        coordinates: selected.coordinates || stopToReplace.coordinates,
        duration: selected.duration || stopToReplace.duration || "1.5 hours",
      }
      
      const updatedPlaces = [...currentDay.places]
      updatedPlaces[placeIndex] = newPlace
      
      const newItinerary = itinerary.map((d, idx) => 
        idx === dayIndex ? { ...d, places: updatedPlaces } : d
      )
      setItinerary(newItinerary as any)
      toast.success(`Replaced with "${newPlace.name}"!`, { id: toastId })
      
    } catch (err) {
      const fallbackNames: Record<string, string[]> = {
        food: ["Traditional Local Bistro", "Hidden Garden Cafe", "Famous Street Food Hub"],
        explore: ["Historic Neighborhood Alleyways", "Local Viewpoint & Lookout", "Cultural Landmark Walk"],
        shopping: ["Bustling Artisanal Market", "Traditional Bazaar Street", "Local Boutique Stores"],
        beach: ["Scenic Secluded Cove Beach", "Vibrant Sunset Beach Spot"],
        nature: ["Lush Botanical Reserve", "Scenic River Viewpoint"],
      }
      
      const names = fallbackNames[stopToReplace.category.toLowerCase()] || ["Curated Spot Recommendations"]
      const selectedName = names[Math.floor(Math.random() * names.length)]
      
      const newPlace = {
        ...stopToReplace,
        name: selectedName,
        description: `Enjoy a curated experience at this highly-rated local ${stopToReplace.category} spot.`,
        whyItFits: "Swapped replacement suggestion."
      }
      
      const updatedPlaces = [...currentDay.places]
      updatedPlaces[placeIndex] = newPlace
      
      const newItinerary = itinerary.map((d, idx) => 
        idx === dayIndex ? { ...d, places: updatedPlaces } : d
      )
      setItinerary(newItinerary as any)
      toast.success(`Swapped with alternative local ${stopToReplace.category} stop!`, { id: toastId })
    }
  }, [itinerary, setItinerary, destination])

  const handleSaveDay = useCallback(async (dayIndex: number) => {
    const dayTitle = `${destination || 'Trip'} Day ${dayIndex + 1}`
    await addBookmark('itinerary', dayTitle)
    toast.success(`Day ${dayIndex + 1} bookmark saved successfully!`)
  }, [destination])

  const handleShareDay = useCallback(() => {
    const url = typeof window !== 'undefined' ? window.location.href : 'https://tripsage.in'
    const brandedMessage = `TripSage AI — Smart Travel Plan\nCheck out my AI-planned itinerary for ${destination || 'my trip'}!\n\nPlan your own custom trip at: ${url}`

    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: `TripSage AI Plan — ${destination || 'My Trip'}`,
        text: brandedMessage,
        url: url,
      }).then(() => toast.success("Shared via TripSage!"))
      .catch(() => {
        navigator.clipboard.writeText(brandedMessage)
        toast.success("TripSage branded link copied!")
      })
    } else {
      navigator.clipboard.writeText(brandedMessage)
      toast.success("TripSage branded link copied to clipboard!")
    }
  }, [destination])

  if (loading) return <ItineraryLoadingSkeleton />

  if (itinerary.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-20 rounded-2xl text-center"
        style={{ background: '#FFFFFF', border: '1px solid #E8E0D8' }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}
        >
          <MapPin size={28} className="text-[#EA580C]" />
        </div>
        <h3 className="font-bold text-[#1A1A1A] text-lg mb-2">Your Day Story starts here</h3>
        <p className="text-[#6B6B6B] text-sm max-w-xs">
          Search for a destination to generate your personalised day-by-day plan.
        </p>
      </div>
    )
  }

  const currentDay = itinerary[activeDay] || itinerary[0]
  const sortedCurrentDayPlaces = currentDay?.places
    ? [...currentDay.places].sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00'))
    : []
  const routeUrl = buildRouteUrl(sortedCurrentDayPlaces, destination)

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-bold text-[#1A1A1A] text-2xl leading-tight">
            Your{' '}
            <span style={{ color: '#EA580C' }}>
              {itinerary.length} {itinerary.length === 1 ? 'Day' : 'Days'}
            </span>
            ,{' '}
            <span style={{ color: '#EA580C' }}>
              {itinerary.reduce((acc, d) => acc + d.places.length, 0)} Places
            </span>{' '}
            Plan
          </h2>
          {destination && (
            <p className="text-[#6B6B6B] text-sm mt-0.5 flex items-center gap-1.5">
              <MapPin size={12} className="text-[#EA580C]" />
              {destination}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowCollabModal(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-[#FFF4EE] hover:bg-orange-100 text-[#EA580C] border border-[#FED7AA] flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
          >
            <Users size={14} />
            <span>Invite Co-Travelers (+200 Pts)</span>
          </button>

          <button
            type="button"
            onClick={() => setShowStoryModal(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-[#1A1A1A] hover:bg-black text-white flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
          >
            <Camera size={14} className="text-orange-400" />
            <span>Story Card Exporter</span>
          </button>
        </div>
      </div>

      {/* ── Day selector ────────────────────────────────────────────────────── */}
      <div ref={daySelectorRef} className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
        {itinerary.map((day, i) => {
          const isActive = activeDay === i
          const pace = deriveDayPace(day.places)
          return (
            <button
              key={i}
              onClick={() => setActiveDay(i)}
              className="flex-shrink-0 flex flex-col items-start px-4 py-2.5 rounded-xl transition-all"
              style={{
                background: isActive ? '#EA580C' : '#FFFFFF',
                border: isActive ? '1.5px solid #EA580C' : '1.5px solid #E8E0D8',
                boxShadow: isActive ? '0 4px 12px rgba(234,88,12,0.25)' : '0 1px 4px rgba(0,0,0,0.04)',
                color: isActive ? 'white' : '#1A1A1A',
              }}
            >
              <span className="font-bold text-sm">Day {day.day}</span>
              {day.date && (
                <span className="text-[10px] mt-0.5" style={{ color: isActive ? 'rgba(255,255,255,0.75)' : '#A1A1AA' }}>
                  {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              )}
              {!day.date && (
                <span
                  className="text-[9px] mt-0.5 font-semibold"
                  style={{ color: isActive ? 'rgba(255,255,255,0.75)' : pace.color }}
                >
                  {pace.label}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Day theme / subtitle ─────────────────────────────────────────────── */}
      {currentDay.theme && (
        <div
          className="px-4 py-3 rounded-xl flex items-center gap-2"
          style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}
        >
          <Star size={14} className="text-[#EA580C] flex-shrink-0" />
          <p className="text-sm font-semibold text-[#9A3412]">{currentDay.theme}</p>
        </div>
      )}

      {/* ── Main two-column layout ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">

        {/* Left: timeline */}
        <div>
          {sortedCurrentDayPlaces.length === 0 ? (
            <div
              className="flex items-center justify-center py-16 rounded-2xl text-center"
              style={{ background: '#FFFFFF', border: '1px dashed #E8E0D8' }}
            >
              <p className="text-[#A1A1AA] text-sm">No stops planned for this day yet.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {sortedCurrentDayPlaces.map((place: any, i: number) => (
                <StopCard
                  key={`${activeDay}-${i}-${place.name}`}
                  place={place}
                  index={i}
                  dayIndex={activeDay}
                  destination={destination}
                  isLast={i === sortedCurrentDayPlaces.length - 1}
                  onReplace={handleReplaceStop}
                />
              ))}
            </div>
          )}

          {/* ── Travel Memories (Photo Upload) ───────────────────────────────── */}
          <TravelMemories
            tripId={effectiveTripId}
            dayNumber={currentDay.day}
          />

          {/* Mobile: inline quick actions */}
          {isMobile && currentDay.places.length > 0 && (
            <div
              className="mt-4 p-4 rounded-2xl space-y-3"
              style={{ background: '#FFFFFF', border: '1px solid #E8E0D8' }}
            >
              <p className="text-xs font-bold uppercase tracking-widest text-[#A1A1AA]">Quick Actions</p>
              <button
                onClick={() => handleOptimizeRoute(activeDay)}
                disabled={isOptimizing || currentDay.places.length <= 2}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: '#0284C7' }}
              >
                {isOptimizing ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" /> Optimizing...
                  </>
                ) : (
                  <>
                    <Zap size={15} /> Optimize Stop Order
                  </>
                )}
              </button>

              <a
                href={routeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white"
                style={{ background: '#EA580C' }}
              >
                <Route size={15} /> Open Full Route in Maps
              </a>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={onRegenerate}
                  className="flex flex-col items-center gap-1 py-2.5 rounded-xl text-[10px] font-semibold active:scale-95"
                  style={{ background: '#FFFBF7', border: '1px solid #E8E0D8', color: '#6B6B6B' }}
                >
                  <RefreshCw size={14} className="text-[#EA580C]" /> Regenerate
                </button>
                <button
                  onClick={() => handleSaveDay(activeDay)}
                  className="flex flex-col items-center gap-1 py-2.5 rounded-xl text-[10px] font-semibold active:scale-95"
                  style={{ background: '#FFFBF7', border: '1px solid #E8E0D8', color: '#6B6B6B' }}
                >
                  <BookmarkPlus size={14} className="text-[#EA580C]" /> Save
                </button>
                <button
                  onClick={handleShareDay}
                  className="flex flex-col items-center gap-1 py-2.5 rounded-xl text-[10px] font-semibold active:scale-95"
                  style={{ background: '#FFFBF7', border: '1px solid #E8E0D8', color: '#6B6B6B' }}
                >
                  <Share2 size={14} className="text-[#EA580C]" /> Share
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: sticky Day Intelligence panel (desktop only) */}
        <div className="hidden lg:block sticky top-[124px]">
          <DayIntelligencePanel
            day={currentDay}
            dayIndex={activeDay}
            destination={destination}
            onRegenerate={onRegenerate}
            onRelaxDay={handleRelaxDay}
            onAddFood={handleAddFood}
            onLocalExp={handleAddLocalExp}
            onSaveDay={handleSaveDay}
            onShareDay={handleShareDay}
            onOptimizeRoute={handleOptimizeRoute}
            isOptimizing={isOptimizing}
          />
        </div>
      </div>

      {/* ── Mobile sticky bottom bar ─────────────────────────────────────────── */}
      {isMobile && currentDay.places.length > 0 && (
        <div
          className="fixed bottom-[60px] left-0 right-0 z-40 px-4 py-3 flex items-center gap-3"
          style={{
            background: 'rgba(255,251,247,0.97)',
            borderTop: '1px solid #E8E0D8',
            backdropFilter: 'blur(12px)',
          }}
        >
          <a
            href={routeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: '#EA580C' }}
          >
            <Route size={14} /> Open Route
          </a>
          <button
            onClick={onRegenerate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold active:scale-95"
            style={{ background: '#FFFFFF', border: '1px solid #E8E0D8', color: '#6B6B6B' }}
          >
            <RefreshCw size={14} /> Regenerate day
          </button>
        </div>
      )}

      {/* ── Story Card Modal ── */}
      <StoryCardModal
        isOpen={showStoryModal}
        onClose={() => setShowStoryModal(false)}
        destination={destination || 'Trip'}
        durationDays={itinerary.length}
        places={itinerary.flatMap((d: any) => d.places || []).map((p: any) => p.name).filter(Boolean)}
      />

      {/* ── Collaborative Invite Modal ── */}
      <CollaborativeInviteModal
        isOpen={showCollabModal}
        onClose={() => setShowCollabModal(false)}
        destination={destination || 'Trip'}
      />
    </div>
  )
}

export default memo(ItineraryView)
