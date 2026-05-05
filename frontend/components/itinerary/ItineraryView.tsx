'use client'
import React, { memo, useState } from 'react'
import { getOptimizedImageUrl } from '@/lib/imageUtils'
import { useIsMobile } from '@/hooks/useIsMobile'
import TripActions from '../actions/TripActions'

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

interface Props {
  itinerary: any[]
  loading: boolean
  destination?: string
}

function ItineraryView({ itinerary, loading, destination = '' }: Props) {
  const isMobile = useIsMobile()
  const [activeDay, setActiveDay] = useState(0)
  // Clean destination city name for image queries
  const destCity = destination.split(',')[0].trim()

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          {[1,2,3].map(i => (
            <div key={i} className="shimmer h-10 w-20 rounded-lg"></div>
          ))}
        </div>
        {[1,2,3].map(i => (
          <div key={i} className="card p-4 space-y-3">
            <div className="shimmer h-4 w-1/4 rounded"></div>
            <div className="shimmer h-3 w-3/4 rounded"></div>
            <div className="shimmer h-3 w-1/2 rounded"></div>
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
      <div className="flex items-center justify-between">
        <h2 className="section-title text-xl">📅 Smart Itinerary</h2>
        <div className="flex items-center gap-2">
          <span className="badge badge-green text-xs">AI Generated</span>
          <span className="badge badge-amber text-xs">{itinerary.length} Days</span>
        </div>
      </div>

      {/* Day selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {itinerary.map((day, i) => (
          <button
            key={i}
            onClick={() => setActiveDay(i)}
            className={`flex-shrink-0 px-5 py-3 rounded-xl text-sm font-semibold transition-all ${
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

      {/* Timeline */}
      {currentDay && (
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[var(--border)]"></div>
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
              <div key={i} className="relative flex gap-3 pl-10 sm:pl-14">
                {/* Timeline dot */}
                <div className="absolute left-3 sm:left-4 top-4 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 border-[var(--primary)] bg-[var(--bg-dark)] z-10"></div>

                <div className="card p-3 sm:p-4 flex-1 min-w-0 hover:border-[var(--primary)] hover:shadow-lg transition-all duration-300 ease-in-out overflow-hidden">
                  <div className="flex items-start gap-2 min-w-0">
                    <span className="text-xl sm:text-2xl flex-shrink-0 mt-0.5">{CATEGORY_ICONS[place.category] || '📍'}</span>
                    <div className="flex-1 min-w-0">
                      {/* Name + time in same row */}
                      <div className="flex items-start justify-between gap-2 min-w-0">
                        <h3 className="font-bold text-[var(--text-primary)] text-sm leading-tight break-words flex-1 min-w-0">
                          {place.name}
                        </h3>
                        <span className="font-mono text-xs font-bold text-[var(--primary)] flex-shrink-0 bg-[var(--primary)]/10 px-2 py-0.5 rounded-full">
                          {place.time}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed line-clamp-2">{place.description}</p>
                      {/* Badge + maps link inline */}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className={`badge ${CATEGORY_COLORS[place.category] || 'badge-green'} text-[0.6rem]`}>
                          {place.category}
                        </span>
                        <a
                          href={mapsHref}
                          target="_blank" rel="noopener noreferrer"
                          className="text-[0.65rem] text-[var(--primary)] hover:underline"
                        >
                          📍 Open Maps →
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Image Gallery — curated images by category */}
                  <div className="mt-4 overflow-x-auto pb-2 -mx-2 px-2 snap-x hide-scrollbar">
                    <div className="flex gap-2 min-w-max">
                      {(() => {
                        // Use place name + destination for real contextual images
                        // Unsplash's /s/photos/ endpoint is a stable redirect that works without API key
                        const placeSlug = encodeURIComponent(`${place.name} ${destCity}`.toLowerCase())
                        const catSlug   = encodeURIComponent(`${destCity} ${place.category || 'travel'}`.toLowerCase())
                        const imgUrls = [
                          `https://images.unsplash.com/search/photos?query=${placeSlug}&w=400&q=75&auto=format&fit=crop`,
                          `https://images.unsplash.com/search/photos?query=${catSlug}&w=400&q=75&auto=format&fit=crop`,
                        ]
                        // Deterministic category fallback pool
                        const CATEGORY_IMAGES: Record<string, string[]> = {
                          nature:    ['1476514525535-07fb3b4ed5f1','1501854140801-50d01698950b','1469474968028-56623f02e42e','1441974231531-c6227db76b6e'],
                          beach:     ['1507525428034-b723cf961d3e','1519046904884-53103b34b206','1471922694854-ff1b63b20054','1505118380757-91f5f5632de0'],
                          culture:   ['1539037116277-4db20889f2d4','1523906834658-6e24ef2386f9','1529260830199-42c24126f198','1558618666-fcd25c85cd64'],
                          dining:    ['1504674900247-0877df9cc836','1414235077428-338989a2e8c0','1482049016688-2d3e1b311543','1466637574441-749b8f19452f'],
                          transport: ['1436491865332-7a61a109cc05','1556388158-158ea5ccacbd','1474302770737-173ee21bab63','1464037866556-6812c9d1c72e'],
                          explore:   ['1501504905252-473c47e087f8','1469854523086-cc02fe5d8800','1513635269975-59663e0ac1ad','1533929736458-ca588d08c8be'],
                          shopping:  ['1441986300917-64674bd600d8','1555529669-e69e7aa0ba9a','1483985988355-763728e1f8e9','1472851294608-062f824d29cc'],
                          activity:  ['1506929562872-bb421503ef21','1499856871958-5b9627545d1a','1508672019048-58f3a73a47cc','1461896836373-425058792621'],
                          accommodation: ['1566073771259-6a8506099945','1551882547-ff40c0d51928','1520250497591-112f2f40a3f4','1582719478250-c89cae4dc85b'],
                          default:   ['1476514525535-07fb3b4ed5f1','1501504905252-473c47e087f8','1469854523086-cc02fe5d8800','1506929562872-bb421503ef21'],
                        }
                        const cat = (place.category || 'default').toLowerCase()
                        const pool = CATEGORY_IMAGES[cat] || CATEGORY_IMAGES.default
                        const hash = place.name.split('').reduce((a: number, b: string) => a + b.charCodeAt(0), 0)
                        return imgUrls.map((src, idx) => (
                          <div key={idx} className="h-28 w-40 rounded-lg overflow-hidden snap-start flex-shrink-0 relative group border border-[var(--border)] bg-slate-800">
                            <img
                              src={src}
                              alt={`${place.name} ${idx + 1}`}
                              className="w-full h-full object-cover group-hover:scale-110 group-hover:brightness-110 transition-all duration-500 ease-out"
                              loading="lazy"
                              decoding="async"
                              onError={(e) => {
                                // Fall back to curated photo ID
                                const fallbackId = pool[(hash + idx) % pool.length]
                                e.currentTarget.src = `https://images.unsplash.com/photo-${fallbackId}?auto=format&fit=crop&w=400&q=75`
                                e.currentTarget.onerror = null
                              }}
                            />
                          </div>
                        ))
                      })()}
                    </div>
                  </div>
                </div>
              </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Export button */}
      <div className="card p-4 flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm text-[var(--text-primary)]">Export Itinerary</p>
          <p className="text-xs text-[var(--text-muted)]">Download as PDF or share with your group</p>
        </div>
        <TripActions />
      </div>
    </div>
  )
}
export default memo(ItineraryView)
