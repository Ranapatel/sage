'use client'
import React, { memo, useState } from 'react'
import Image from 'next/image'
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
}

function ItineraryView({ itinerary, loading }: Props) {
  const isMobile = useIsMobile()
  const [activeDay, setActiveDay] = useState(0)

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
              <div key={i} className="relative flex gap-4 pl-14">
                {/* Timeline dot */}
                <div className="absolute left-4 top-4 w-4 h-4 rounded-full border-2 border-[var(--primary)] bg-[var(--bg-dark)] z-10"></div>

                <div className="card p-4 flex-1 hover:border-[var(--primary)] transition-colors cursor-pointer">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-2xl flex-shrink-0">{CATEGORY_ICONS[place.category] || '📍'}</span>
                      <div className="flex-1">
                        <h3 className="font-bold text-[var(--text-primary)] text-sm">{place.name}</h3>
                        <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">{place.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`badge ${CATEGORY_COLORS[place.category] || 'badge-green'} text-[0.65rem]`}>
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
                  <div className="mt-3 overflow-x-auto pb-2 -mx-2 px-2 snap-x hide-scrollbar">
                    <div className="flex gap-2 min-w-max">
                      {!place.images ? (
                        /* Placeholders while loading */
                        <>
                          <div className="shimmer h-28 w-40 rounded-lg snap-start"></div>
                          <div className="shimmer h-28 w-40 rounded-lg snap-start"></div>
                          <div className="shimmer h-28 w-40 rounded-lg snap-start"></div>
                        </>
                      ) : place.images.length > 0 ? (
                        /* Real images */
                        place.images.map((img: string, idx: number) => (
                          <div key={idx} className="h-28 w-40 rounded-lg overflow-hidden snap-start flex-shrink-0 relative group shadow-sm border border-[var(--border)]">
                            <Image 
                              src={getOptimizedImageUrl(img, isMobile)} 
                              alt={`${place.name} view ${idx + 1}`} 
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-500" 
                              sizes="160px"
                            />
                          </div>
                        ))
                      ) : null}
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
