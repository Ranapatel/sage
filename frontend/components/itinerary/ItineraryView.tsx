'use client'

import { useState } from 'react'
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

export default function ItineraryView({ itinerary, loading }: Props) {
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
            {currentDay.places.map((place: any, i: number) => (
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
                          <span className="text-xs text-[var(--text-muted)]">
                            📍 {place.coordinates[0].toFixed(3)}, {place.coordinates[1].toFixed(3)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="font-mono text-sm font-bold text-[var(--primary)]">{place.time}</div>
                      <a
                        href={`https://maps.google.com/?q=${place.coordinates[0]},${place.coordinates[1]}`}
                        target="_blank" rel="noopener noreferrer"
                        className="text-xs text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors mt-1 block"
                      >
                        Open Maps →
                      </a>
                    </div>
                  </div>

                  {place.image && (
                    <div className="mt-3 h-24 rounded-lg overflow-hidden">
                      <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            ))}
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
