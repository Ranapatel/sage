'use client'

import React, { memo, useState, useEffect } from 'react'
import Image from 'next/image'
import { getOptimizedImageUrl } from '@/lib/imageUtils'
import { useIsMobile } from '@/hooks/useIsMobile'
import { tripAPI } from '@/lib/api'
import { formatPrice } from '@/lib/currency'
import { useAuthStore } from '@/store/authStore'
import { useTripStore } from '@/store/tripStore'
import CarCard from '@/components/transport/CarCard'
import { Star, MapPin, ExternalLink, Heart, Share2, Search, Compass, ImageIcon } from 'lucide-react'
import PlaceDetailsModal from './PlaceDetailsModal'

interface Props {
  destination: string
}

const CATEGORIES = [
  'All',
  'Adventure',
  'Culture',
  'Food',
  'Nature',
  'Water',
  'Nightlife',
  'Shopping',
  'Museums',
  'Temples',
  'Parks',
  'Historic',
  'Tourist Attractions'
]

const MOCK_CARS = [
  { id: 'c1', name: 'Maruti Swift', type: 'Hatchback', price: 1200, rating: 4.5, image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&q=80', seats: 5, discount: 20 },
  { id: 'c2', name: 'Toyota Innova', type: 'SUV', price: 2500, rating: 4.7, image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&q=80', seats: 7, discount: 15 },
  { id: 'c3', name: 'Honda City', type: 'Sedan', price: 1800, rating: 4.6, image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&q=80', seats: 5, discount: 25 },
]

// ── Skeleton Card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="border border-slate-800/80 bg-slate-950/20 rounded-2xl overflow-hidden animate-pulse">
      <div className="h-44 bg-slate-800" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-slate-800 rounded w-3/4" />
        <div className="h-3 bg-slate-800 rounded w-full" />
        <div className="h-3 bg-slate-800 rounded w-2/3" />
        <div className="flex gap-2 pt-2 border-t border-slate-900">
          <div className="h-8 bg-slate-800 rounded-lg w-8" />
          <div className="h-8 bg-slate-800 rounded-lg flex-1" />
        </div>
      </div>
    </div>
  )
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  )
}

// ── Place Card ───────────────────────────────────────────────────────────────

function PlaceCard({ place, isSaved, onToggleSave, onShare, onViewDetails, isMobile }: {
  place: any
  isSaved: boolean
  onToggleSave: () => void
  onShare: () => void
  onViewDetails: () => void
  isMobile: boolean
}) {
  const [imgError, setImgError] = useState(false)
  const imgSrc = imgError
    ? 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80'
    : place.heroImage

  return (
    <div className="relative group border border-slate-800/80 bg-slate-950/20 hover:border-[var(--primary)]/60 rounded-2xl overflow-hidden flex flex-col shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-indigo-900/10">

      {/* Hero Image */}
      <div className="relative h-44 overflow-hidden bg-slate-800">
        <Image
          src={imgSrc}
          alt={place.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, 300px"
          loading="lazy"
          onError={() => setImgError(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-slate-900/90 backdrop-blur border border-slate-700 text-slate-200 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            {place.category || place.cuisine || place.primaryType?.replace(/_/g, ' ') || 'Place'}
          </span>
        </div>

        {/* Save / Share */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleSave() }}
            className={`w-7 h-7 rounded-full bg-slate-900/90 backdrop-blur border border-slate-700/80 flex items-center justify-center transition-all ${isSaved ? 'text-rose-500 border-rose-500/20' : 'text-slate-400 hover:text-white'}`}
          >
            <Heart size={14} fill={isSaved ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onShare() }}
            className="w-7 h-7 rounded-full bg-slate-900/90 backdrop-blur border border-slate-700/80 flex items-center justify-center text-slate-400 hover:text-white transition-all"
          >
            <Share2 size={13} />
          </button>
        </div>

        {/* Open status */}
        {place.isOpenNow !== null && place.isOpenNow !== undefined && (
          <div className="absolute bottom-3 left-3">
            <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded-full backdrop-blur ${place.isOpenNow ? 'bg-green-500/20 text-green-400 border border-green-500/20' : 'bg-red-500/20 text-red-400 border border-red-500/20'}`}>
              {place.isOpenNow ? 'Open' : 'Closed'}
            </span>
          </div>
        )}

        {/* Rating */}
        {place.rating && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 text-[11px] font-black text-yellow-400 bg-slate-950/80 backdrop-blur px-2 py-0.5 rounded-lg border border-yellow-400/10">
            <Star size={11} fill="currentColor" />
            <span>{place.rating}</span>
            <span className="text-[9px] text-slate-400">({place.userRatingsTotal})</span>
          </div>
        )}

        {/* Photo count indicator */}
        {place.photoCount > 1 && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 text-[9px] text-white/60 bg-black/30 backdrop-blur px-1.5 py-0.5 rounded-full">
            <ImageIcon size={9} /> {place.photoCount}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-sm text-slate-200 group-hover:text-[var(--primary)] transition-colors leading-snug line-clamp-1 flex-1">
              {place.name}
            </h3>
            {place.priceLevel !== null && place.priceLevel !== undefined && (
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/5 border border-emerald-500/10 px-1.5 py-0.5 rounded flex-shrink-0">
                {'$'.repeat(Math.max(place.priceLevel, 1))}
              </span>
            )}
          </div>
          {place.description ? (
            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
              {place.description}
            </p>
          ) : (
            <p className="text-[11px] text-slate-500 italic">Tap &ldquo;View Details&rdquo; for more info</p>
          )}
          <div className="flex gap-1.5 text-[10px] text-slate-400">
            <MapPin size={12} className="text-slate-600 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-1">{place.address}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-900/80">
          {place.googleMapsUrl && (
            <a
              href={place.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={14} />
            </a>
          )}
          <button
            onClick={onViewDetails}
            className="flex-1 text-center py-1.5 rounded-lg bg-slate-900 hover:bg-[var(--primary)] border border-slate-800 hover:border-transparent text-slate-300 hover:text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/5"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────────────────

export function ExploreSection({ destination: initialDestination }: Props) {
  const isMobile = useIsMobile()
  const { user } = useAuthStore()
  const currency = user?.currency ?? 'INR'

  const [searchDest, setSearchDest] = useState(initialDestination || '')
  const [activeDest, setActiveDest] = useState(initialDestination || '')
  const [activeType, setActiveType] = useState<'activities' | 'restaurants' | 'rentals'>('activities')
  const [activeCategory, setActiveCategory] = useState('All')

  const [ratingFilter, setRatingFilter] = useState<number>(0)
  const [priceFilter, setPriceFilter] = useState<number>(4)
  const [openNowFilter, setOpenNowFilter] = useState(false)
  const [sortBy, setSortBy] = useState<'popularity' | 'distance'>('popularity')

  const [activities, setActivities] = useState<any[]>([])
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null)
  const [savedPlaces, setSavedPlaces] = useState<string[]>([])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('tripsage_saved_places')
        if (stored) setSavedPlaces(JSON.parse(stored))
      } catch {}
    }
  }, [])

  const toggleSavePlace = (placeId: string) => {
    const nextSaved = savedPlaces.includes(placeId)
      ? savedPlaces.filter(id => id !== placeId)
      : [...savedPlaces, placeId]
    setSavedPlaces(nextSaved)
    if (typeof window !== 'undefined') {
      localStorage.setItem('tripsage_saved_places', JSON.stringify(nextSaved))
    }
  }

  const handleSharePlace = (place: any) => {
    const url = place.googleMapsUrl || window.location.href
    if (navigator.share) {
      navigator.share({ title: place.name, text: place.description || `Explore ${place.name} on TripSage!`, url }).catch(() => {})
    } else {
      navigator.clipboard.writeText(url)
    }
  }

  useEffect(() => {
    if (!activeDest) return
    setLoading(true)
    setError(null)

    const params: Record<string, any> = {
      rating: ratingFilter > 0 ? ratingFilter : undefined,
      price: priceFilter < 4 ? priceFilter : undefined,
      openNow: openNowFilter ? 'true' : undefined,
      sortBy,
      category: activeCategory !== 'All' ? activeCategory : undefined
    }

    if (activeType === 'activities') {
      tripAPI.getActivities(activeDest, params)
        .then((res: any) => {
          const acts = res?.activities ?? res?.data?.activities
          setActivities(acts || [])
        })
        .catch((err: Error) => {
          setActivities([])
          setError(err.message || 'Failed to load activities')
        })
        .finally(() => setLoading(false))
    } else if (activeType === 'restaurants') {
      tripAPI.getRestaurants(activeDest, params)
        .then((res: any) => {
          const rests = res?.restaurants ?? res?.data?.restaurants
          setRestaurants(rests || [])
        })
        .catch((err: Error) => {
          setRestaurants([])
          setError(err.message || 'Failed to load restaurants')
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [activeDest, activeType, activeCategory, ratingFilter, priceFilter, openNowFilter, sortBy])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchDest.trim()) {
      setActiveDest(searchDest.trim())
    }
  }

  const currentItems = activeType === 'activities' ? activities : restaurants

  return (
    <div className="space-y-6">

      {/* Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/20 border border-slate-800/80 p-4 rounded-2xl">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--primary)] to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/15">
            <Compass size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Explore Destination</h2>
            <p className="text-[10px] text-slate-400">Discover top-rated activities and dining powered by Google Places</p>
          </div>
        </div>
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search city, e.g. Goa, Paris..."
            value={searchDest}
            onChange={(e) => setSearchDest(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-800 text-slate-100 rounded-xl py-2 pl-9 pr-20 text-xs focus:outline-none focus:border-[var(--primary)] transition-all font-medium"
          />
          <Search size={14} className="absolute left-3 top-3 text-slate-500" />
          <button type="submit"
            className="absolute right-1.5 top-1.5 bg-[var(--primary)] text-white text-[10px] font-bold px-3 py-1 rounded-lg hover:bg-opacity-95 transition-all shadow-md shadow-indigo-600/10">
            Search
          </button>
        </form>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-px">
        <div className="flex gap-2">
          {(['activities', 'restaurants'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setActiveType(t); setError(null) }}
              className={`px-4 py-2 text-xs font-bold capitalize border-b-2 transition-all ${activeType === t ? 'border-[var(--primary)] text-white' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
              {t === 'activities' ? '🏂 Activities' : '🍴 Restaurants'}
            </button>
          ))}
        </div>
      </div>

      {/* Filters (not for Rentals) */}
      {activeType !== 'rentals' && (
        <div className="bg-slate-950/10 border border-slate-800/40 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Min Rating</label>
              <select value={ratingFilter} onChange={(e) => setRatingFilter(parseFloat(e.target.value))}
                className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg py-1.5 px-2.5 outline-none focus:border-[var(--primary)]">
                <option value={0}>All Ratings</option>
                <option value={4.5}>4.5+ ★</option>
                <option value={4.0}>4.0+ ★</option>
                <option value={3.5}>3.5+ ★</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Max Price</label>
              <select value={priceFilter} onChange={(e) => setPriceFilter(parseInt(e.target.value, 10))}
                className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg py-1.5 px-2.5 outline-none focus:border-[var(--primary)]">
                <option value={4}>All Prices</option>
                <option value={1}>$ (Inexpensive)</option>
                <option value={2}>$$ (Moderate)</option>
                <option value={3}>$$$ (Expensive)</option>
              </select>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <input type="checkbox" id="openNow" checked={openNowFilter}
                onChange={(e) => setOpenNowFilter(e.target.checked)}
                className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-[var(--primary)] focus:ring-0 focus:ring-offset-0" />
              <label htmlFor="openNow" className="text-xs font-semibold text-slate-300 select-none cursor-pointer">Open Now Only</label>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Sort By</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg py-1.5 px-2.5 outline-none focus:border-[var(--primary)]">
              <option value="popularity">Popularity (Most Reviews)</option>
              <option value="distance">Distance (Closest)</option>
            </select>
          </div>
        </div>
      )}

      {/* ── ACTIVITIES TAB ── */}
      {activeType === 'activities' && (
        <div className="space-y-4">
          {/* Category chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${activeCategory === cat ? 'bg-[var(--primary)] text-white shadow-md shadow-indigo-600/10' : 'bg-slate-900 border border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'}`}>
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <SkeletonGrid />
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 border border-dashed border-red-500/20 rounded-2xl bg-red-500/5 text-center px-4 gap-2">
              <span className="text-red-400 text-xs font-bold">Activities search failed</span>
              <span className="text-slate-400 text-[11px] max-w-sm">{error}</span>
            </div>
          ) : activities.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {activities.map((a: any) => (
                <PlaceCard
                  key={a.id}
                  place={a}
                  isSaved={savedPlaces.includes(a.id)}
                  onToggleSave={() => toggleSavePlace(a.id)}
                  onShare={() => handleSharePlace(a)}
                  onViewDetails={() => setSelectedPlaceId(a.id)}
                  isMobile={isMobile}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-800 rounded-2xl bg-slate-950/20 text-center w-full">
              <span className="text-slate-400 text-xs font-semibold">No activities found matching your filters.</span>
            </div>
          )}
        </div>
      )}

      {/* ── RESTAURANTS TAB ── */}
      {activeType === 'restaurants' && (
        <div>
          {loading ? (
            <SkeletonGrid />
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 border border-dashed border-red-500/20 rounded-2xl bg-red-500/5 text-center px-4 gap-2">
              <span className="text-red-400 text-xs font-bold">Restaurants search failed</span>
              <span className="text-slate-400 text-[11px] max-w-sm">{error}</span>
            </div>
          ) : restaurants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {restaurants.map((r: any) => (
                <PlaceCard
                  key={r.id}
                  place={r}
                  isSaved={savedPlaces.includes(r.id)}
                  onToggleSave={() => toggleSavePlace(r.id)}
                  onShare={() => handleSharePlace(r)}
                  onViewDetails={() => setSelectedPlaceId(r.id)}
                  isMobile={isMobile}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-800 rounded-2xl bg-slate-950/20 text-center w-full">
              <span className="text-slate-400 text-xs font-semibold">No restaurants found matching your filters.</span>
            </div>
          )}
        </div>
      )}

      {/* Details Modal */}
      <PlaceDetailsModal
        placeId={selectedPlaceId}
        onClose={() => setSelectedPlaceId(null)}
        currency={currency}
      />
    </div>
  )
}

export default memo(ExploreSection)
