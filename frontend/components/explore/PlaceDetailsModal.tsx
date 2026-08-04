'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import {
  X, Star, MapPin, Phone, Globe, Clock, ExternalLink,
  Heart, Share2, Compass, ChevronLeft, ChevronRight,
  ZoomIn, Users, Car, Sparkles, Timer, DollarSign,
  Navigation, Utensils, Hotel, CheckCircle2, Lightbulb
} from 'lucide-react'
import { tripAPI } from '@/lib/api'

interface PlaceDetailsModalProps {
  placeId: string | null
  onClose: () => void
  currency: string
}

// ── Lightbox Component ─────────────────────────────────────────────────────────

function Lightbox({ images, startIndex, onClose }: {
  images: { url: string; attributions?: string[] }[]
  startIndex: number
  onClose: () => void
}) {
  const [idx, setIdx] = useState(startIndex)
  const touchStartX = useRef(0)

  const prev = useCallback(() => setIdx(i => i > 0 ? i - 1 : images.length - 1), [images.length])
  const next = useCallback(() => setIdx(i => i < images.length - 1 ? i + 1 : 0), [images.length])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, prev, next])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 60) {
      if (diff > 0) next()
      else prev()
    }
  }

  const img = images[idx]
  if (!img) return null

  return (
    <div className="fixed inset-0 z-[10000] bg-black/95 flex items-center justify-center"
      onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {/* Close */}
      <button onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
        <X size={24} />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-4 z-10 text-white/80 text-sm font-mono bg-black/40 px-3 py-1 rounded-full">
        {idx + 1} / {images.length}
      </div>

      {/* Prev/Next */}
      {images.length > 1 && (
        <>
          <button onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
            <ChevronLeft size={28} />
          </button>
          <button onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
            <ChevronRight size={28} />
          </button>
        </>
      )}

      {/* Image */}
      <div className="relative w-full h-full max-w-5xl max-h-[85vh] mx-auto p-4">
        <Image
          src={img.url}
          alt={`Photo ${idx + 1}`}
          fill
          className="object-contain"
          sizes="100vw"
          priority
        />
      </div>

      {/* Attributions */}
      {img.attributions && img.attributions.length > 0 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/40 text-[10px] bg-black/50 px-3 py-1 rounded-full">
          Photo by {img.attributions.join(', ')}
        </div>
      )}
    </div>
  )
}

// ── Skeleton Loader ────────────────────────────────────────────────────────────

function DetailsSkeleton() {
  return (
    <div className="animate-pulse space-y-6 p-6">
      <div className="h-64 bg-slate-800 rounded-2xl" />
      <div className="space-y-3">
        <div className="h-6 bg-slate-800 rounded w-3/4" />
        <div className="h-4 bg-slate-800 rounded w-1/2" />
      </div>
      <div className="h-24 bg-slate-800 rounded-xl" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-32 bg-slate-800 rounded-xl" />
        <div className="h-32 bg-slate-800 rounded-xl" />
      </div>
      <div className="space-y-3">
        <div className="h-20 bg-slate-800 rounded-xl" />
        <div className="h-20 bg-slate-800 rounded-xl" />
      </div>
    </div>
  )
}

// ── Nearby Card ────────────────────────────────────────────────────────────────

function NearbyCard({ place, onClick }: { place: any; onClick?: () => void }) {
  return (
    <div onClick={onClick}
      className="flex gap-3 items-center p-2.5 rounded-xl bg-slate-950/30 border border-slate-800/40 hover:border-[var(--primary)]/40 transition-all cursor-pointer group">
      <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
        <Image src={place.photoUrl} alt={place.name} fill className="object-cover group-hover:scale-110 transition-transform duration-300" sizes="56px" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-bold text-slate-200 truncate group-hover:text-[var(--primary)] transition-colors">{place.name}</div>
        {place.primaryType && (
          <div className="text-[9px] text-slate-500 capitalize mt-0.5">{place.primaryType.replace(/_/g, ' ')}</div>
        )}
        <div className="flex items-center gap-2 mt-1">
          {place.rating && (
            <span className="text-[10px] text-yellow-400 font-semibold flex items-center gap-0.5">
              <Star size={9} fill="currentColor" /> {place.rating}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Travel Intelligence Widget ──────────────────────────────────────────────────

interface StructuredSummary {
  summary: string | null
  highlights: string[]
  bestTime: string | null
  practicalTip: string | null
}

function getStructuredSummary(details: any): StructuredSummary {
  if (details.aiSummary && typeof details.aiSummary === 'object') {
    return {
      summary: details.aiSummary.summary || null,
      highlights: Array.isArray(details.aiSummary.highlights) ? details.aiSummary.highlights : [],
      bestTime: details.aiSummary.bestTime || null,
      practicalTip: details.aiSummary.practicalTip || null,
    }
  }

  if (typeof details.description === 'string' && details.description.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(details.description)
      return {
        summary: parsed.summary || null,
        highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [],
        bestTime: parsed.bestTime || null,
        practicalTip: parsed.practicalTip || null,
      }
    } catch { /* fallback */ }
  }

  if (typeof details.description === 'string' && details.description.trim()) {
    const raw = details.description.trim()
    let tip: string | null = null
    let mainText = raw

    const tipMatch = raw.match(/(?:Practical tip|Tip|Visitor tip):\s*(.+)$/i)
    if (tipMatch) {
      tip = tipMatch[1].trim()
      mainText = raw.replace(tipMatch[0], '').trim()
    }

    const sentences = mainText.split(/(?<=[.!?])\s+/).filter(Boolean)
    const summary = sentences[0] || mainText
    const highlights = sentences.slice(1).map((s: string) => s.trim()).filter(Boolean)

    return {
      summary,
      highlights: highlights.slice(0, 3),
      bestTime: null,
      practicalTip: tip,
    }
  }

  return { summary: null, highlights: [], bestTime: null, practicalTip: null }
}

function TravelIntelligenceWidget({ details }: { details: any }) {
  const summary = getStructuredSummary(details)
  if (!summary.summary && summary.highlights.length === 0 && !summary.bestTime && !summary.practicalTip) {
    return null
  }

  const isAi = details.descriptionSource === 'ai' || details.aiSummary

  return (
    <div className="px-6">
      <div className="rounded-2xl border border-[#E8E0D8] bg-gradient-to-b from-[#FAF8F5] to-white shadow-sm overflow-hidden text-[#1A1A1A]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#F4EFEA]/80 border-b border-[#E8E0D8]">
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-amber-600 animate-pulse" />
            <span className="text-xs font-black tracking-wide uppercase text-slate-800">
              {isAi ? 'AI Travel Intelligence' : 'Place Overview'}
            </span>
          </div>
          <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase bg-white/90 px-2.5 py-0.5 rounded-full border border-slate-200 shadow-2xs">
            Structured Insights
          </span>
        </div>

        <div className="p-4 space-y-3.5">
          {/* Core Summary (1-2 sentences) */}
          {summary.summary && (
            <p className="text-xs font-medium text-slate-800 leading-relaxed">
              {summary.summary}
            </p>
          )}

          {/* Key Highlights */}
          {summary.highlights.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                Key Highlights
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {summary.highlights.map((h: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
                    <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="font-normal leading-normal">{h}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Best Visit Window & Practical Tip Grid */}
          {(summary.bestTime || summary.practicalTip) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {/* Best Time / Duration */}
              {summary.bestTime && (
                <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-800 text-[10px] font-black uppercase tracking-wide">
                    <Clock size={12} className="text-amber-600" />
                    <span>Best Time & Duration</span>
                  </div>
                  <p className="text-xs text-slate-800 font-medium leading-snug">
                    {summary.bestTime}
                  </p>
                </div>
              )}

              {/* Practical Tip */}
              {summary.practicalTip && (
                <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/20 space-y-1">
                  <div className="flex items-center gap-1.5 text-indigo-800 text-[10px] font-black uppercase tracking-wide">
                    <Lightbulb size={12} className="text-indigo-600" />
                    <span>Insider Tip</span>
                  </div>
                  <p className="text-xs text-slate-800 font-medium leading-snug">
                    {summary.practicalTip}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function PlaceDetailsModal({ placeId, onClose, currency }: PlaceDetailsModalProps) {
  const [details, setDetails] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)

  useEffect(() => {
    if (!placeId) return
    setLoading(true)
    setError(null)
    setDetails(null)

    tripAPI.getPlaceDetails(placeId)
      .then((res: any) => {
        const d = res?.data?.data ?? res?.data ?? res
        if (d && d.id) {
          setDetails(d)
        } else {
          setError('Failed to load details')
        }
      })
      .catch((err: Error) => {
        setError(err.message || 'Unable to load place details. Please try again.')
      })
      .finally(() => setLoading(false))
  }, [placeId])

  useEffect(() => {
    if (placeId) {
      document.body.style.overflow = 'hidden'
    }
    return () => { document.body.style.overflow = '' }
  }, [placeId])

  if (!placeId) return null

  const handleShare = () => {
    if (!details) return
    const url = details.googleMapsUrl || window.location.href
    if (navigator.share) {
      navigator.share({ title: details.name, text: details.description || `Check out ${details.name}!`, url }).catch(() => { })
    } else {
      navigator.clipboard.writeText(url)
    }
  }

  const galleryPhotos = details?.photos || []
  const displayGallery = galleryPhotos.slice(0, 5)
  const remainingCount = galleryPhotos.length - 5

  return (
    <>
      {/* Lightbox */}
      {lightboxIdx !== null && galleryPhotos.length > 0 && (
        <Lightbox
          images={galleryPhotos}
          startIndex={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
        />
      )}

      <div className="fixed inset-0 z-[9999] flex items-center justify-end bg-black/60 backdrop-blur-sm">
        <div className="absolute inset-0" onClick={onClose} />

        <div className="relative w-full max-w-2xl h-full bg-white border-l border-[#E8E0D8] text-[#1A1A1A] flex flex-col shadow-2xl overflow-hidden" style={{ animation: 'slideInRight 0.3s ease-out' }}>

          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#E8E0D8] bg-white/95 backdrop-blur sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <button onClick={onClose} className="p-2 hover:bg-[#FFFBF7] rounded-full transition-colors text-[#1A1A1A]">
                <X size={20} />
              </button>
              <span className="text-sm font-bold tracking-wider uppercase text-[#6B6B6B]">Place Details</span>
            </div>
            {details && (
              <div className="flex items-center gap-2">
                <button onClick={() => setIsSaved(!isSaved)}
                  className={`p-2 rounded-full transition-all ${isSaved ? 'text-rose-500 bg-rose-500/10' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                  <Heart size={20} fill={isSaved ? 'currentColor' : 'none'} />
                </button>
                <button onClick={handleShare} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors">
                  <Share2 size={20} />
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {loading && <DetailsSkeleton />}

            {error && !loading && (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-3 px-6">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                  <X size={24} className="text-red-400" />
                </div>
                <p className="text-red-400 text-sm font-bold">Unable to load place details</p>
                <p className="text-xs text-slate-400 max-w-sm">{error}</p>
                <button onClick={() => { setError(null); setLoading(true); tripAPI.getPlaceDetails(placeId).then((res: any) => { setDetails(res?.data?.data ?? res?.data ?? res); }).catch(() => setError('Still unable to load. Try again later.')).finally(() => setLoading(false)) }}
                  className="mt-2 px-6 py-2 bg-[var(--primary)] text-white text-xs font-bold rounded-xl hover:opacity-90 transition-opacity">
                  Try Again
                </button>
              </div>
            )}

            {details && !loading && (
              <div className="space-y-6 pb-8">

                {/* ── Photo Gallery ── */}
                {displayGallery.length > 0 ? (
                  <div className="p-4 pb-0">
                    {/* Desktop: Hero + grid */}
                    <div className="hidden sm:block">
                      {/* Large hero */}
                      <div className="relative h-72 rounded-t-2xl overflow-hidden cursor-pointer group"
                        onClick={() => setLightboxIdx(0)}>
                        <Image src={displayGallery[0].url} alt={details.name} fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="600px" priority />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                        <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1 backdrop-blur">
                          <ZoomIn size={12} /> View
                        </div>
                      </div>
                      {/* Thumbnail row */}
                      {displayGallery.length > 1 && (
                        <div className="grid gap-1 mt-1 rounded-b-2xl overflow-hidden" style={{ gridTemplateColumns: `repeat(${Math.min(displayGallery.length - 1, 4)}, 1fr)` }}>
                          {displayGallery.slice(1).map((p: any, i: number) => (
                            <div key={i} className="relative h-20 cursor-pointer group overflow-hidden"
                              onClick={() => setLightboxIdx(i + 1)}>
                              <Image src={p.thumbnail || p.url} alt={`${details.name} photo ${i + 2}`} fill
                                className="object-cover group-hover:scale-110 transition-transform duration-300" sizes="150px" loading="lazy" />
                              {/* +More overlay on last thumbnail if more exist */}
                              {i === displayGallery.length - 2 && remainingCount > 0 && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                  <span className="text-white text-sm font-bold">+{remainingCount} more</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Mobile: Swipeable carousel */}
                    <div className="sm:hidden">
                      <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-none rounded-2xl">
                        {displayGallery.map((p: any, i: number) => (
                          <div key={i} className="relative flex-shrink-0 w-[85vw] h-56 snap-center rounded-2xl overflow-hidden cursor-pointer"
                            onClick={() => setLightboxIdx(i)}>
                            <Image src={p.url} alt={`${details.name} photo ${i + 1}`} fill
                              className="object-cover" sizes="85vw" priority={i === 0} loading={i > 0 ? 'lazy' : undefined} />
                            <div className="absolute bottom-2 right-2 bg-black/50 text-white/80 text-[10px] px-2 py-0.5 rounded-full font-mono">
                              {i + 1}/{displayGallery.length}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Fallback hero when no photos */
                  <div className="p-4 pb-0">
                    <div className="relative h-56 rounded-2xl overflow-hidden">
                      <Image src={details.heroImage} alt={details.name} fill className="object-cover" sizes="600px" priority />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                    </div>
                  </div>
                )}

                {/* ── Title & Meta ── */}
                <div className="px-6 space-y-3">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">{details.name}</h2>
                    {details.primaryType && (
                      <span className="inline-block mt-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--primary)] bg-[var(--primary)]/10 px-2 py-0.5 rounded-full border border-[var(--primary)]/20">
                        {details.primaryType.replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>

                  {/* Quick stats row */}
                  <div className="flex flex-wrap items-center gap-3">
                    {details.rating && (
                      <div className="flex items-center gap-1.5 bg-yellow-400/10 text-yellow-400 px-2.5 py-1 rounded-lg border border-yellow-400/10">
                        <Star size={14} fill="currentColor" />
                        <span className="text-sm font-black">{details.rating}</span>
                        <span className="text-[10px] text-yellow-400/70">({details.userRatingsTotal?.toLocaleString()} reviews)</span>
                      </div>
                    )}
                    {details.priceLevel !== null && details.priceLevel !== undefined && (
                      <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/10 px-2 py-1 rounded-lg">
                        {'$'.repeat(Math.max(details.priceLevel, 1))}
                      </span>
                    )}
                    {details.isOpenNow !== null && (
                      <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg border ${details.isOpenNow ? 'bg-green-500/10 text-green-400 border-green-500/10' : 'bg-red-500/10 text-red-400 border-red-500/10'}`}>
                        {details.isOpenNow ? '● Open Now' : '● Closed'}
                      </span>
                    )}
                  </div>
                </div>

                {/* ── AI Description / Travel Intelligence Widget ── */}
                <TravelIntelligenceWidget details={details} />

                {/* ── Info Grid ── */}
                <div className="px-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Contact */}
                  <div className="p-4 rounded-xl bg-slate-950/25 border border-slate-800/50 space-y-3">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact & Location</h4>
                    <div className="space-y-2.5 text-xs text-slate-300">
                      <div className="flex gap-2 items-start">
                        <MapPin size={14} className="text-slate-500 flex-shrink-0 mt-0.5" />
                        <span>{details.address}</span>
                      </div>
                      {details.phone && (
                        <div className="flex items-center gap-2">
                          <Phone size={14} className="text-slate-500" />
                          <a href={`tel:${details.phone}`} className="hover:underline text-[var(--primary)]">{details.phone}</a>
                        </div>
                      )}
                      {details.website && (
                        <div className="flex items-center gap-2">
                          <Globe size={14} className="text-slate-500" />
                          <a href={details.website} target="_blank" rel="noopener noreferrer"
                            className="hover:underline text-[var(--primary)] truncate max-w-[200px]">
                            Visit Website
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Opening Hours */}
                  {details.openingHours && (
                    <div className="p-4 rounded-xl bg-slate-950/25 border border-slate-800/50 space-y-3">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Opening Hours</h4>
                      <div className="space-y-1.5">
                        {details.openingHours.map((day: string, idx: number) => (
                          <div key={idx} className="flex gap-2 items-start text-xs text-slate-300">
                            <Clock size={12} className="text-slate-500 mt-0.5 flex-shrink-0" />
                            <span>{day}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Travel Tips Section ── */}
                <div className="px-6">
                  <div className="p-4 rounded-xl bg-slate-950/25 border border-slate-800/50">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Visitor Information</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-xs text-slate-300">
                        <Timer size={13} className="text-slate-500" />
                        <span>1-2 hours recommended</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-300">
                        <Navigation size={13} className="text-slate-500" />
                        <span>GPS: {details.latitude?.toFixed(4)}, {details.longitude?.toFixed(4)}</span>
                      </div>
                      {details.priceLevel !== null && details.priceLevel !== undefined && (
                        <div className="flex items-center gap-2 text-xs text-slate-300">
                          <DollarSign size={13} className="text-slate-500" />
                          <span>{['Free', 'Inexpensive', 'Moderate', 'Expensive', 'Very Expensive'][details.priceLevel] || 'Varies'}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-slate-300">
                        <Car size={13} className="text-slate-500" />
                        <span>Parking nearby</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Photo Attributions ── */}
                {galleryPhotos.some((p: any) => p.attributions?.length > 0) && (
                  <div className="px-6">
                    <div className="text-[9px] text-slate-500 bg-slate-950/20 p-3 rounded-xl border border-slate-800/30">
                      <span className="font-bold block mb-1">Photo Credits</span>
                      {galleryPhotos.map((p: any, i: number) =>
                        p.attributions?.length > 0 && <span key={i} className="mr-2">{p.attributions.join(', ')}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Reviews ── */}
                {details.reviews && details.reviews.length > 0 && (
                  <div className="px-6 space-y-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Star size={16} className="text-yellow-400" /> Guest Reviews
                    </h3>
                    {details.reviews.map((rev: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-950/30 border border-slate-800/40 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {rev.profilePhotoUrl ? (
                              <div className="relative w-8 h-8 rounded-full overflow-hidden">
                                <Image src={rev.profilePhotoUrl} alt={rev.author} fill sizes="32px" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                                {rev.author?.[0] || '?'}
                              </div>
                            )}
                            <div>
                              <div className="text-xs font-bold text-slate-200">{rev.author}</div>
                              <div className="text-[10px] text-slate-500">{rev.relativeTime}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5 text-yellow-400 text-xs font-mono bg-yellow-400/5 px-2 py-0.5 rounded-full border border-yellow-400/10">
                            {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                          </div>
                        </div>
                        {rev.text && (
                          <p className="text-xs text-slate-300 leading-relaxed line-clamp-4">
                            &ldquo;{rev.text}&rdquo;
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Nearby Attractions ── */}
                {details.nearbyAttractions?.length > 0 && (
                  <div className="px-6 space-y-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Compass size={16} className="text-[var(--primary)]" /> Nearby Attractions
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {details.nearbyAttractions.map((p: any) => (
                        <NearbyCard key={p.id} place={p} />
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Nearby Restaurants ── */}
                {details.nearbyRestaurants?.length > 0 && (
                  <div className="px-6 space-y-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Utensils size={16} className="text-orange-400" /> Nearby Restaurants
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {details.nearbyRestaurants.map((p: any) => (
                        <NearbyCard key={p.id} place={p} />
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Nearby Hotels ── */}
                {details.nearbyHotels?.length > 0 && (
                  <div className="px-6 space-y-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Hotel size={16} className="text-blue-400" /> Nearby Hotels
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {details.nearbyHotels.map((p: any) => (
                        <NearbyCard key={p.id} place={p} />
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Google Maps CTA ── */}
                {details.googleMapsUrl && (
                  <div className="px-6 pb-6">
                    <a href={details.googleMapsUrl} target="_blank" rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[var(--primary)] to-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 transition-all">
                      Open on Google Maps
                      <ExternalLink size={16} />
                    </a>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      </div>

      {/* Slide-in animation */}
      <style jsx global>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </>
  )
}
