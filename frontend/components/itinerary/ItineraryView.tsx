'use client'
import React, { memo, useState, useEffect } from 'react'
import Image from 'next/image'
import { getOptimizedImageUrl } from '@/lib/imageUtils'
import { useIsMobile } from '@/hooks/useIsMobile'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const CATEGORY_COLORS: Record<string, string> = {
  transport: 'badge-green', explore: 'badge-amber', dining: 'badge-red',
  culture: 'badge-green', nature: 'badge-green', activity: 'badge-amber',
  shopping: 'badge-amber', accommodation: 'badge-green',
}

const CATEGORY_ICONS: Record<string, string> = {
  transport: '🚀', explore: '🗺️', dining: '🍽️',
  culture: '🏛️', nature: '🌿', activity: '⚡',
  shopping: '🛍️', accommodation: '🏨',
}

// Unsplash search terms per category for varied images
const CATEGORY_QUERIES: Record<string, string> = {
  transport: 'airport travel journey',
  explore: 'travel adventure destination',
  dining: 'food restaurant meal',
  culture: 'museum temple culture heritage',
  nature: 'nature landscape scenery',
  activity: 'adventure outdoor activity',
  shopping: 'market shopping bazaar',
  accommodation: 'hotel resort room',
}

const UNSPLASH_KEY = process.env.NEXT_PUBLIC_UNSPLASH_KEY

// Per-session image cache to avoid duplicate Unsplash calls
const imageCache: Record<string, string[]> = {}

// Fetch 3-5 real images for a specific place at a destination
async function fetchPlaceImages(placeName: string, category: string, destination?: string): Promise<string[]> {
  // Build a specific query: "Fort Aguada Goa culture heritage"
  const baseQuery = destination
    ? `${placeName} ${destination} ${CATEGORY_QUERIES[category] || 'travel'}`
    : `${placeName} ${CATEGORY_QUERIES[category] || 'travel'}`
  const cacheKey = baseQuery.toLowerCase()

  if (imageCache[cacheKey]) return imageCache[cacheKey]

  const query = encodeURIComponent(baseQuery)
  try {
    if (!UNSPLASH_KEY) throw new Error('no key')
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${query}&per_page=5&orientation=landscape&content_filter=high`,
      { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } }
    )
    const data = await res.json()
    const urls = (data.results || []).map((r: any) => `${r.urls.raw}&w=600&q=80&auto=format&fit=crop`)
    if (urls.length >= 2) {
      imageCache[cacheKey] = urls.slice(0, 5)
      return imageCache[cacheKey]
    }
  } catch {}

  // Curated fallbacks by category
  const fallbacks: Record<string, string[]> = {
    transport: [
      'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=600&q=80',
      'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=600&q=80',
      'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&q=80',
    ],
    dining: [
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80',
    ],
    culture: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
      'https://images.unsplash.com/photo-1527856263669-12c3a0af2aa6?w=600&q=80',
      'https://images.unsplash.com/photo-1580974852861-7a3fc63dfbe3?w=600&q=80',
    ],
    nature: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
      'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=600&q=80',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80',
    ],
    accommodation: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80',
    ],
    activity: [
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80',
      'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=600&q=80',
      'https://images.unsplash.com/photo-1527856263669-12c3a0af2aa6?w=600&q=80',
    ],
    explore: [
      'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=600&q=80',
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80',
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&q=80',
    ],
  }
  const result = fallbacks[category] || fallbacks.explore
  imageCache[cacheKey] = result
  return result
}

// Horizontal Image Gallery for a place
const PlaceGallery = memo(({ place, destination, isMobile }: { place: any; destination?: string; isMobile: boolean }) => {
  const [images, setImages] = useState<string[] | null>(null)

  useEffect(() => {
    const initial = place.image ? [place.image] : []
    fetchPlaceImages(place.name, place.category, destination).then(imgs => {
      const merged = [...new Set([...initial, ...imgs])].filter(Boolean).slice(0, 5)
      setImages(merged.length > 0 ? merged : initial)
    }).catch(() => {
      setImages(initial)
    })
  }, [place.name, place.category, place.image, destination])

  if (!images) {
    return (
      <div className="mt-3 overflow-x-auto pb-2 -mx-2 px-2 snap-x hide-scrollbar">
        <div className="flex gap-2 min-w-max">
          <div className="shimmer h-28 w-40 rounded-lg snap-start"></div>
          <div className="shimmer h-28 w-40 rounded-lg snap-start"></div>
          <div className="shimmer h-28 w-40 rounded-lg snap-start"></div>
        </div>
      </div>
    )
  }

  if (images.length === 0) return null;

  return (
    <div className="mt-3 overflow-x-auto pb-2 -mx-2 px-2 snap-x hide-scrollbar">
      <div className="flex gap-2 min-w-max">
        {images.map((img: string, idx: number) => (
          <div key={idx} className="h-28 w-40 rounded-lg overflow-hidden snap-start flex-shrink-0 relative group shadow-sm border border-[var(--border)] bg-slate-100">
            <Image 
              src={getOptimizedImageUrl(img, isMobile)} 
              alt={`${place.name} view ${idx + 1}`} 
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500" 
              sizes="160px"
              unoptimized={img.includes('unsplash.com')}
            />
          </div>
        ))}
      </div>
    </div>
  )
})
PlaceGallery.displayName = 'PlaceGallery'

interface Props {
  itinerary: any[]
  loading: boolean
  destination?: string
}

function ItineraryView({ itinerary, loading, destination }: Props) {
  const [activeDay, setActiveDay] = useState(0)
  const isMobile = useIsMobile()

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[1,2,3].map(i => (
            <div key={i} className="shimmer h-10 w-20 rounded-lg flex-shrink-0"></div>
          ))}
        </div>
        {[1,2,3].map(i => (
          <div key={i} className="card p-4 space-y-3">
            <div className="shimmer h-4 w-1/4 rounded"></div>
            <div className="shimmer h-3 w-3/4 rounded"></div>
            <div className="shimmer h-24 w-full rounded-xl"></div>
          </div>
        ))}
      </div>
    )
  }

  if (itinerary.length === 0) {
    return (
      <div className="card p-12 text-center">
        <div className="text-5xl mb-4">📅</div>
        <h3 className="font-bold text-[var(--text-primary)] mb-2">No itinerary yet</h3>
        <p className="text-[var(--text-muted)] text-sm">Search for a destination to generate your AI itinerary</p>
      </div>
    )
  }

  const currentDay = itinerary[activeDay]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="section-title text-xl">📅 Smart Itinerary</h2>
        <div className="flex items-center gap-2">
          <span className="badge badge-green text-xs">AI Generated</span>
          <span className="badge badge-amber text-xs">{itinerary.length} Days</span>
        </div>
      </div>

      {/* Day selector — horizontally scrollable */}
      <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
        {itinerary.map((day, i) => (
          <button
            key={i}
            onClick={() => setActiveDay(i)}
            className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeDay === i
                ? 'bg-[var(--primary)] text-white shadow-lg'
                : 'glass text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <div className="font-bold">Day {day.day}</div>
            {day.date && (
              <div className={`text-[0.65rem] mt-0.5 ${activeDay === i ? 'text-white/70' : 'text-[var(--text-muted)]'}`}>
                {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Timeline of places for the active day */}
      <div className="relative">
          <div className="absolute left-3 sm:left-5 top-0 bottom-0 w-0.5 bg-[var(--border)]"></div>
          <div className="space-y-4">
            {currentDay.places.map((place: any, i: number) => {
              const hasCoords = Array.isArray(place.coordinates)
                && place.coordinates.length === 2
                && !isNaN(Number(place.coordinates[0]))
                && !isNaN(Number(place.coordinates[1]))
              const lat = hasCoords ? Number(place.coordinates[0]) : null
              const lng = hasCoords ? Number(place.coordinates[1]) : null
              const mapsHref = hasCoords
                ? `https://maps.google.com/?q=${lat},${lng}`
                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}`

              return (
              <div key={i} className="relative flex gap-3 sm:gap-4 pl-9 sm:pl-14">
                {/* Timeline dot */}
                <div className="absolute left-[5px] sm:left-3.5 top-4 w-3.5 h-3.5 rounded-full border-2 border-[var(--primary)] bg-[var(--bg-dark)] z-10"></div>

                <div className="card p-3 sm:p-4 flex-1 hover:border-[var(--primary)] transition-colors min-w-0 overflow-hidden">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                      <span className="text-xl sm:text-2xl flex-shrink-0">{CATEGORY_ICONS[place.category] || '📍'}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-[var(--text-primary)] text-sm leading-tight">{place.name}</h3>
                        <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed line-clamp-2">{place.description}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className={`badge ${CATEGORY_COLORS[place.category] || 'badge-green'} text-[0.6rem]`}>
                            {place.category}
                          </span>
                          {hasCoords ? (
                            <span className="text-xs text-[var(--text-muted)]">
                              📍 {lat!.toFixed(3)}, {lng!.toFixed(3)}
                            </span>
                          ) : (
                            <span className="text-xs text-yellow-500">📍 Coordinates loading...</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-mono text-sm font-bold text-[var(--primary)]">{place.time}</div>
                      <a
                        href={mapsHref}
                        target="_blank" rel="noopener noreferrer"
                        className="text-xs text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors mt-1 block"
                      >
                        Open Maps →
                      </a>
                    </div>
                  </div>

                  {/* Image Gallery */}
                  <PlaceGallery place={place} destination={destination} isMobile={isMobile} />
                </div>
              </div>
              )
            })}
          </div>
        </div>
    </div>
  )
}

export default memo(ItineraryView)
