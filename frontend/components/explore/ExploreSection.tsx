'use client'

import React, { memo, useState, useEffect } from 'react'
import { getPlaceImage } from '@/data/placeImages'
import { tripAPI } from '@/lib/api'
<<<<<<< Updated upstream
import { affiliateLinks } from '@/lib/utils'
import { formatPrice } from '@/lib/currency'
import { useAuthStore } from '@/store/authStore'
import { useUrgency } from '@/hooks/useUrgency'
import { trackEvent } from '@/lib/analytics'
import { useTripStore } from '@/store/tripStore'
=======
import { Compass, Info, MapPin } from 'lucide-react'

interface PlaceItem {
  name: string
  category: 'Must See' | 'Hidden Gems' | 'Outdoor'
  description: string
  cost: number
  bestTime: string
}
>>>>>>> Stashed changes

interface Props {
  destination: string
}

<<<<<<< Updated upstream
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

const ActivityCard = memo(({ a, destination, currency }: { a: any; destination: string; currency: string }) => {
  const isMobile = useIsMobile()
  const activityId = a.activityCode || a.id
  const name = a.activityName || a.name || 'Activity'
  const price = a.amountsFrom?.amountINR || a.price || 0
  const duration = a.modality?.duration || a.duration || 'Flexible'
  const rating = a.averageRating || a.rating || 4.5
  const image = a.image || (a.images && a.images[0]) || 'https://images.unsplash.com/photo-1527856263669-12c3a0af2aa6?w=400&q=80'

  const { discount, urgency, flightScarcity: spotsMsg, countdownLabel } = useUrgency(activityId)
  const origPrice = Math.round(price * (100 / (100 - discount)) / 100) * 100
  return (
    <div className="card overflow-hidden group border border-[var(--border)] hover:border-[var(--primary)] transition-all duration-300">
      <div className="relative h-40 overflow-hidden">
        <Image 
          src={getOptimizedImageUrl(image, isMobile)} 
          alt={name} 
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500" 
          sizes="(max-width: 768px) 100vw, 50vw"
          unoptimized={a.image.includes('unsplash.com')}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute top-2 left-2">
          <span className="bg-green-500 text-white text-[0.6rem] font-black px-1.5 py-0.5 rounded">{discount}% OFF</span>
        </div>
        <div className="absolute top-2 right-2">
          <span className="bg-red-500/90 text-white text-[0.6rem] font-bold px-1.5 py-0.5 rounded animate-pulse">{spotsMsg}</span>
        </div>
        <div className="absolute bottom-2 left-2 flex items-center gap-2">
          <span className="text-white text-[0.65rem] font-mono">{duration}</span>
          <span className="text-yellow-400 text-[0.65rem]">★ {rating}</span>
        </div>
      </div>
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between gap-1">
          <h3 className="font-bold text-sm text-[var(--text-primary)] leading-tight flex-1 line-clamp-1">{name}</h3>
          <span className="badge badge-amber text-[0.6rem] flex-shrink-0 uppercase">{a.category || 'NATURE'}</span>
        </div>
        <div className="flex items-end gap-2">
          <div>
            <div className="text-[0.65rem] text-[var(--text-muted)] line-through">{formatPrice(origPrice, currency)}</div>
            <div className="text-lg font-black font-mono text-[var(--primary)] leading-tight">{formatPrice(price, currency)}</div>
          </div>
          <span className="text-orange-400 text-[0.65rem] font-semibold mb-0.5">{urgency}</span>
        </div>
        <div className="text-[0.6rem] text-orange-300 font-mono text-center">{countdownLabel} left at this price</div>
      </div>
    </div>
  )
})

const CarCard = memo(({ car, destination, currency }: { car: any; destination: string; currency: string }) => {
  const isMobile = useIsMobile()
  const { discount, urgency, carScarcity, countdownLabel } = useUrgency(car.id)
  const origPrice = Math.round(car.price * (100 / (100 - discount)) / 100) * 100
  const savings = formatPrice(origPrice - car.price, currency)
  return (
    <div className="card overflow-hidden border border-[var(--border)] hover:border-[var(--primary)] transition-all duration-300">
      <div className="flex items-center justify-between px-3 py-1.5 bg-gradient-to-r from-orange-500/20 to-red-500/10 border-b border-orange-500/20">
 <span className="text-orange-400 text-[0.65rem] font-bold">{urgency}</span>
        <span className="text-red-400 text-[0.65rem] font-semibold animate-pulse">{carScarcity}</span>
      </div>
      <div className="relative h-36 overflow-hidden">
        <Image 
          src={getOptimizedImageUrl(car.image, isMobile)} 
          alt={car.name} 
          fill
          className="object-cover hover:scale-105 transition-transform duration-500" 
          sizes="(max-width: 768px) 100vw, 50vw"
          unoptimized={car.image.includes('unsplash.com')}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute top-2 left-2">
          <span className="bg-green-500 text-white text-[0.65rem] font-black px-2 py-0.5 rounded">{discount}% OFF</span>
        </div>
        <div className="absolute bottom-2 left-2 flex gap-2">
 <span className="text-white text-[0.65rem]">{car.type}</span>
 <span className="text-white text-[0.65rem]">{car.seats} seats</span>
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
 <div className="text-[0.6rem] text-orange-300 font-mono text-center">{countdownLabel} left at this price</div>
      </div>
    </div>
  )
})

function ExploreSection({ destination }: Props) {
  const isMobile = useIsMobile()
  const { user } = useAuthStore()
  const { tripContext, userProfile } = useTripStore()
  const currency = user?.currency ?? 'INR'
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeType, setActiveType] = useState<'activities' | 'restaurants' | 'rentals'>('activities')
  const [activities, setActivities] = useState<any[]>([])
  const [restaurants] = useState(MOCK_RESTAURANTS)
=======
const CATEGORIES = ['All', 'Must See', 'Hidden Gems', 'Outdoor'] as const

function ExploreSection({ destination }: Props) {
  const [places, setPlaces] = useState<PlaceItem[]>([])
  const [activeCategory, setActiveCategory] = useState<typeof CATEGORIES[number]>('All')
>>>>>>> Stashed changes
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!destination) return
<<<<<<< Updated upstream
    Promise.resolve().then(() => setLoading(true))
    
    const params = {
      startDate: tripContext?.startDate || undefined,
      endDate: tripContext?.endDate || undefined,
      travelers: userProfile?.members || undefined,
      budget: userProfile?.budget || undefined,
      style: userProfile?.travelStyle || undefined,
      interests: userProfile?.preferences?.join(',') || undefined
    }

    tripAPI.getActivities(destination, params).then((res: any) => {
      const acts = res?.activities ?? res?.data?.activities
      setActivities(acts || [])
    }).catch(() => {
      setActivities([])
    }).finally(() => setLoading(false))
  }, [destination, tripContext?.startDate, tripContext?.endDate, userProfile?.members, userProfile?.budget, userProfile?.travelStyle, userProfile?.preferences])

  const filteredActivities = activeCategory === 'All'
    ? activities
    : activities.filter(a => a.category && a.category.toLowerCase() === activeCategory.toLowerCase())
=======
    setLoading(true)
    setError(null)
    tripAPI.getExplorePlaces(destination)
      .then((res: any) => {
        // Interceptor unwraps to ApiResponse, data contains actual payload
        const list = res.data || res
        if (Array.isArray(list)) {
          setPlaces(list)
        } else if (res.success && Array.isArray(res.data)) {
          setPlaces(res.data)
        } else {
          setPlaces([])
        }
      })
      .catch((err) => {
        console.error('Failed to load explore places:', err)
        setError('Unable to fetch recommendations. Please try again.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [destination])

  const filteredPlaces = activeCategory === 'All'
    ? places
    : places.filter(p => p.category.toLowerCase() === activeCategory.toLowerCase())

  const destCity = destination.split(',')[0].trim()

  const getCategoryBadgeStyles = (cat: string) => {
    switch (cat) {
      case 'Must See':
        return 'bg-indigo-50 text-indigo-700 border-indigo-100'
      case 'Hidden Gems':
        return 'bg-purple-50 text-purple-700 border-purple-100'
      case 'Outdoor':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-100'
    }
  }
>>>>>>> Stashed changes

  return (
    <div className="space-y-8">
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className="text-left">
        <h1
          className="text-[24px] font-bold text-[#1A1A1A] leading-tight mb-1.5 flex items-center gap-2"
          style={{ fontFamily: 'var(--font-plus-jakarta, Inter, sans-serif)' }}
        >
          <Compass size={24} className="text-[#EA580C]" strokeWidth={2} />
          Explore {destCity || 'Destination'}
        </h1>
        <p className="text-[15px] text-[#6B6B6B] leading-relaxed max-w-xl">
          Pick the category that matches your mood — find iconic landmarks, hidden gems, and outdoor adventures.
        </p>
      </div>

      {/* ── FILTER TABS ─────────────────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
        {CATEGORIES.map(cat => {
          const isActive = activeCategory === cat
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="shrink-0 h-9 px-4 rounded-xl text-[14px] font-medium flex items-center justify-center transition-all border font-sans"
              style={{
                background: isActive ? '#EA580C' : '#FFFFFF',
                color: isActive ? '#FFFFFF' : '#6B6B6B',
                borderColor: isActive ? '#EA580C' : '#E8E0D8',
              }}
            >
              {cat}
            </button>
          )
        })}
      </div>

<<<<<<< Updated upstream
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

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs text-[var(--text-muted)] font-medium">Fetching live Hotelbeds activities...</span>
            </div>
          ) : filteredActivities.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {filteredActivities.map(a => (
                <ActivityCard key={a.activityCode || a.id} a={a} destination={destination} currency={currency} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 border border-dashed border-slate-800 rounded-2xl bg-slate-950/20 text-center w-full">
              <span className="text-slate-400 text-xs font-semibold">No activities found matching your preferences.</span>
            </div>
          )}
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
                  <Image 
                    src={getOptimizedImageUrl(r.image, isMobile)} 
                    alt={r.name} 
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500" 
                    sizes="(max-width: 768px) 100vw, 50vw"
                    unoptimized={r.image.includes('unsplash.com')}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute top-2 right-2">
                    <span className="badge badge-green text-[0.65rem]">{r.priceRange}</span>
                  </div>
                  <div className="absolute bottom-2 left-2">
 <span className="text-yellow-400 text-xs">{r.rating}</span>
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
=======
      {/* ── Loading Skeleton ── */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border border-[#E8E0D8] rounded-[12px] overflow-hidden space-y-3 p-4">
              <div className="w-full h-48 bg-[#F0ECE8] animate-pulse rounded-lg" />
              <div className="h-4 bg-[#F0ECE8] animate-pulse rounded w-2/3" />
              <div className="h-3 bg-[#F0ECE8] animate-pulse rounded w-1/3" />
              <div className="h-10 bg-[#F0ECE8] animate-pulse rounded" />
            </div>
>>>>>>> Stashed changes
          ))}
        </div>
      )}

      {/* ── Error state ── */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm text-left">
          {error}
        </div>
      )}

      {/* ── EMPTY STATE ── */}
      {!loading && !error && filteredPlaces.length === 0 && (
        <div className="bg-white border border-[#E8E0D8] rounded-[16px] p-16 flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#FFF7ED] border border-[#FED7AA] flex items-center justify-center">
            <MapPin size={24} className="text-[#EA580C]" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[16px] font-bold text-[#1A1A1A] mb-1.5">No recommendations found</p>
            <p className="text-[13px] text-[#6B6B6B]">Try switching categories or check back later.</p>
          </div>
        </div>
      )}

      {/* ── PLACES GRID ── */}
      {!loading && !error && filteredPlaces.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredPlaces.map((place, idx) => {
            const image = getPlaceImage(place.name, place.category)
            return (
              <div
                key={idx}
                className="bg-white border border-[#E8E0D8] rounded-[12px] overflow-hidden shadow-sm flex flex-col hover:border-[#EA580C] transition-all duration-200"
              >
                {/* Photo Header */}
                <div className="h-48 w-full relative bg-[#F5F5F4]">
                  <img
                    src={image}
                    alt={place.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getCategoryBadgeStyles(place.category)}`}>
                      {place.category}
                    </span>
                  </div>
                </div>

                {/* Details Body */}
                <div className="p-4 flex flex-col flex-1 justify-between text-left space-y-3">
                  <div className="space-y-1.5">
                    <h3 className="text-[16px] font-semibold text-[#1A1A1A] leading-snug font-sans">
                      {place.name}
                    </h3>
                    <p className="text-[14px] text-[#6B6B6B] leading-relaxed font-sans">
                      {place.description}
                    </p>
                  </div>

                  <div className="border-t border-[#E8E0D8] pt-3 flex items-center justify-between font-sans">
                    <div>
                      <p className="text-[9px] text-[#9CA3AF] uppercase font-bold tracking-wider leading-none">Est. Cost</p>
                      <p className="text-[14px] font-bold text-[#EA580C] mt-0.5 leading-none">
                        {place.cost === 0 ? 'Free Entry' : `₹${place.cost.toLocaleString('en-IN')}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-[#9CA3AF] uppercase font-bold tracking-wider leading-none">Best Visit</p>
                      <p className="text-[12px] text-[#6B6B6B] mt-0.5 leading-none font-medium">
                        {place.bestTime}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── AFFILIATE DISCLOSURE ── */}
      <div className="p-4 bg-[#FFF4EE] border border-[#FED7AA] rounded-xl flex items-start gap-3 text-left">
        <Info size={16} className="text-[#EA580C] mt-0.5 shrink-0" strokeWidth={1.5} />
        <p className="text-[12px] text-[#6B6B6B] italic leading-relaxed font-sans">
          <strong>Affiliate disclosure:</strong> TripSage recommends curated local places and experiences. Booking related activities, transfers, or dining reservations through partner links may earn us a small referral commission at no additional cost to you.
        </p>
      </div>
    </div>
  )
}

export default memo(ExploreSection)
