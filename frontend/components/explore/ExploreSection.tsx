'use client'

import { useState, useEffect } from 'react'
import { tripAPI } from '@/lib/api'
import { affiliateLinks } from '@/lib/utils'
import { formatPrice } from '@/lib/currency'
import { useAuthStore } from '@/store/authStore'
import { useUrgency } from '@/hooks/useUrgency'

interface Props {
  destination: string
}

const MOCK_ACTIVITIES = [
  { id: 'a1', name: 'Sunset Boat Tour', category: 'Water', price: 3750, rating: 4.8, image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&q=80', duration: '3 hours', discount: 20, spotsLeft: 3 },
  { id: 'a2', name: 'Temple Hopping Tour', category: 'Culture', price: 2100, rating: 4.6, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', duration: '6 hours', discount: 15, spotsLeft: 5 },
  { id: 'a3', name: 'Cooking Masterclass', category: 'Food', price: 2925, rating: 4.9, image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&q=80', duration: '4 hours', discount: 25, spotsLeft: 2 },
  { id: 'a4', name: 'Mountain Trek', category: 'Adventure', price: 4590, rating: 4.7, image: 'https://images.unsplash.com/photo-1527856263669-12c3a0af2aa6?w=400&q=80', duration: '8 hours', discount: 30, spotsLeft: 4 },
]

const MOCK_RESTAURANTS = [
  { id: 'r1', name: 'Spice Garden', cuisine: 'Local', price: 450, rating: 4.8, image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80', priceRange: '₹' },
  { id: 'r2', name: 'The Rooftop Bistro', cuisine: 'International', price: 1200, rating: 4.6, image: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=400&q=80', priceRange: '₹₹₹' },
  { id: 'r3', name: 'Street Food Market', cuisine: 'Street Food', price: 250, rating: 4.5, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80', priceRange: '₹' },
]

const MOCK_CARS = [
  { id: 'c1', name: 'Maruti Swift', type: 'Hatchback', price: 1200, rating: 4.5, image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&q=80', seats: 5, discount: 20 },
  { id: 'c2', name: 'Toyota Innova', type: 'SUV', price: 2500, rating: 4.7, image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&q=80', seats: 7, discount: 15 },
  { id: 'c3', name: 'Honda City', type: 'Sedan', price: 1800, rating: 4.6, image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&q=80', seats: 5, discount: 25 },
]

const CATEGORIES = ['All', 'Adventure', 'Culture', 'Food', 'Water', 'Nature', 'Nightlife']

// ─── Sub-components (hooks must be at component level) ─────────────────────

function ActivityCard({ a, destination, currency }: { a: any; destination: string; currency: string }) {
  const { discount, urgency, flightScarcity: spotsMsg, countdownLabel } = useUrgency(a.id)
  const origPrice = Math.round(a.price * (100 / (100 - discount)) / 100) * 100
  return (
    <div className="card overflow-hidden group border border-[var(--border)] hover:border-[var(--primary)] transition-all duration-300">
      <div className="relative h-40 overflow-hidden">
        <img src={a.image} alt={a.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute top-2 left-2">
          <span className="bg-green-500 text-white text-[0.6rem] font-black px-1.5 py-0.5 rounded">{discount}% OFF</span>
        </div>
        <div className="absolute top-2 right-2">
          <span className="bg-red-500/90 text-white text-[0.6rem] font-bold px-1.5 py-0.5 rounded animate-pulse">{spotsMsg}</span>
        </div>
        <div className="absolute bottom-2 left-2 flex items-center gap-2">
          <span className="text-white text-[0.65rem] font-mono">⏱ {a.duration}</span>
          <span className="text-yellow-400 text-[0.65rem]">★ {a.rating}</span>
        </div>
      </div>
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between gap-1">
          <h3 className="font-bold text-sm text-[var(--text-primary)] leading-tight flex-1">{a.name}</h3>
          <span className="badge badge-amber text-[0.6rem] flex-shrink-0">{a.category}</span>
        </div>
        <div className="flex items-end gap-2">
          <div>
            <div className="text-[0.65rem] text-[var(--text-muted)] line-through">{formatPrice(origPrice, currency)}</div>
            <div className="text-lg font-black font-mono text-[var(--primary)] leading-tight">{formatPrice(a.price, currency)}</div>
          </div>
          <span className="text-orange-400 text-[0.65rem] font-semibold mb-0.5">🔥 {urgency}</span>
        </div>
        <div className="text-[0.6rem] text-orange-300 font-mono text-center">⏳ {countdownLabel} left at this price</div>
        <a href={affiliateLinks.activity(destination || a.name)} target="_blank" rel="noopener noreferrer"
          className="block w-full text-center py-2 px-3 rounded-xl font-bold text-xs bg-gradient-to-r from-[var(--primary)] to-purple-600 text-white hover:opacity-90 transition-opacity">
          Book Now — Save {discount}% →
        </a>
      </div>
    </div>
  )
}

function CarCard({ car, destination, currency }: { car: any; destination: string; currency: string }) {
  const { discount, urgency, carScarcity, countdownLabel } = useUrgency(car.id)
  const origPrice = Math.round(car.price * (100 / (100 - discount)) / 100) * 100
  const savings = formatPrice(origPrice - car.price, currency)
  return (
    <div className="card overflow-hidden border border-[var(--border)] hover:border-[var(--primary)] transition-all duration-300">
      <div className="flex items-center justify-between px-3 py-1.5 bg-gradient-to-r from-orange-500/20 to-red-500/10 border-b border-orange-500/20">
        <span className="text-orange-400 text-[0.65rem] font-bold">🔥 {urgency}</span>
        <span className="text-red-400 text-[0.65rem] font-semibold animate-pulse">{carScarcity}</span>
      </div>
      <div className="relative h-36 overflow-hidden">
        <img src={car.image} alt={car.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute top-2 left-2">
          <span className="bg-green-500 text-white text-[0.65rem] font-black px-2 py-0.5 rounded">{discount}% OFF</span>
        </div>
        <div className="absolute bottom-2 left-2 flex gap-2">
          <span className="text-white text-[0.65rem]">🚗 {car.type}</span>
          <span className="text-white text-[0.65rem]">👥 {car.seats} seats</span>
        </div>
      </div>
      <div className="p-3 space-y-2">
        <h3 className="font-bold text-sm text-[var(--text-primary)]">{car.name}</h3>
        <div className="flex items-end gap-2">
          <div>
            <div className="text-[0.65rem] text-[var(--text-muted)] line-through">{formatPrice(origPrice, currency)}/day</div>
            <div className="text-xl font-black font-mono text-[var(--primary)] leading-tight">
              {formatPrice(car.price, currency)}<span className="text-xs font-normal text-[var(--text-muted)]">/day</span>
            </div>
          </div>
          <div className="mb-0.5 text-green-400 text-xs font-semibold">Save {savings}!</div>
        </div>
        <div className="text-[0.6rem] text-orange-300 font-mono text-center">⏳ {countdownLabel} left at this price</div>
        <a href={affiliateLinks.car(destination)} target="_blank" rel="noopener noreferrer"
          className="block w-full text-center py-2.5 px-3 rounded-xl font-bold text-sm bg-gradient-to-r from-[var(--primary)] to-purple-600 text-white hover:opacity-90 transition-opacity">
          Book Car — {discount}% OFF →
        </a>
      </div>
    </div>
  )
}

export default function ExploreSection({ destination }: Props) {
  const { user } = useAuthStore()
  const currency = user?.currency ?? 'INR'
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeType, setActiveType] = useState<'activities' | 'restaurants' | 'rentals'>('activities')
  const [activities, setActivities] = useState(MOCK_ACTIVITIES)
  const [restaurants] = useState(MOCK_RESTAURANTS)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!destination) return
    setLoading(true)
    tripAPI.getActivities(destination).then((res: any) => {
      if (res?.data?.activities?.length > 0) setActivities(res.data.activities)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [destination])

  const filteredActivities = activeCategory === 'All'
    ? activities
    : activities.filter(a => a.category.toLowerCase() === activeCategory.toLowerCase())

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="section-title text-xl">🌍 Explore {destination || 'Destination'}</h2>
        <a href={affiliateLinks.activity(destination || 'popular')} target="_blank" rel="noopener noreferrer"
          className="btn-outline text-xs py-1.5 px-3">
          All Activities →
        </a>
      </div>

      {/* Type tabs */}
      <div className="flex gap-2">
        {(['activities', 'restaurants', 'rentals'] as const).map(t => (
          <button key={t} onClick={() => setActiveType(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              activeType === t ? 'bg-[var(--primary)] text-white' : 'glass text-[var(--text-secondary)]'
            }`}>
            {t === 'activities' ? '⚡' : t === 'restaurants' ? '🍽️' : '🚗'} {t}
          </button>
        ))}
      </div>

      {/* ─── ACTIVITIES ─── */}
      {activeType === 'activities' && (
        <>
          {/* Category filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setActiveCategory(c)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeCategory === c ? 'bg-[var(--primary)] text-white' : 'glass text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}>
                {c}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredActivities.map(a => (
              <ActivityCard key={a.id} a={a} destination={destination} currency={currency} />
            ))}
          </div>
        </>
      )}

      {/* ─── RESTAURANTS ─── */}
      {activeType === 'restaurants' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <a href={affiliateLinks.restaurant(destination || 'popular')} target="_blank" rel="noopener noreferrer"
               className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1">
               Search All Restaurants on Google Maps →
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {restaurants.map(r => (
              <a key={r.id} href={affiliateLinks.restaurant(destination ? `${r.name} near ${destination}` : r.name)} target="_blank" rel="noopener noreferrer" 
                 className="card overflow-hidden group border border-[var(--border)] hover:border-[var(--primary)] transition-all block">
                <div className="relative h-40 overflow-hidden">
                  <img src={r.image} alt={r.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute top-2 right-2">
                    <span className="badge badge-green text-[0.65rem]">{r.priceRange}</span>
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <span className="text-yellow-400 text-xs">★ {r.rating}</span>
                  </div>
                </div>
                <div className="p-3 space-y-1">
                  <h3 className="font-bold text-sm text-[var(--text-primary)]">{r.name}</h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-[var(--text-muted)]">{r.cuisine}</span>
                    <span className="text-[var(--primary)] font-bold text-sm">~{formatPrice(r.price, currency)}/person</span>
                  </div>
                  <div className="mt-2 py-1.5 text-center text-xs font-bold bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg group-hover:bg-[var(--primary)] group-hover:text-white transition-colors">
                    Search on Google Maps →
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ─── CAR RENTALS ─── */}
      {activeType === 'rentals' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MOCK_CARS.map(car => (
            <CarCard key={car.id} car={car} destination={destination} currency={currency} />
          ))}
        </div>
      )}
    </div>
  )
}
