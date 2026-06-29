'use client'

import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import { useTripStore } from '@/store/tripStore'
import { tripAPI } from '@/lib/api'
import { RefreshCw, Info, AlertCircle, Shield, Signal, Clock, Train, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import TrainCard from './TrainCard'
import TrainFilters from './TrainFilters'
import BookingButton from '../BookingButton'

export default function TrainsTab() {
  const {
    trains,
    setTrains,
    trainSearchUrl,
    trainStationInfo,
    setTrainStationInfo,
    tripContext,
    userProfile,
    loading: storeLoading,
    activeTab,
  } = useTripStore()

  const [localLoading, setLocalLoading] = useState(false)
  const [errorState, setErrorState] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState('ai') // 'ai', 'price_low', 'duration_low', 'dep_early', 'arr_early'
  const [filters, setFilters] = useState({
    selectedClasses: [] as string[],
    selectedTypes: [] as string[],
    maxPrice: 0,
    depTime: 'any', // 'any', 'morning', 'midday', 'afternoon', 'night'
    arrTime: 'any',
  })

  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // 1. Fetch function for refreshes
  const handleRefresh = useCallback(async (silent = false) => {
    if (!tripContext.startLocation || !tripContext.destination || !tripContext.startDate) {
      return
    }

    if (!silent) setLocalLoading(true)
    setErrorState(null)

    try {
      const result = await tripAPI.searchTrains({
        departureCity: tripContext.startLocation,
        destinationCity: tripContext.destination,
        departureDate: tripContext.startDate,
        passengers: userProfile.members || 1,
        travelClass: 'ALL',
      })

      // Unwrap the envelope response
      const trainsList = result?.trains ?? (Array.isArray(result) ? result : [])
      const stationInfo = result?.stationInfo ?? null

      if (Array.isArray(trainsList)) {
        setTrains(trainsList)
        if (stationInfo) setTrainStationInfo(stationInfo)
        if (!silent) {
          toast.success('Train schedules refreshed!', { id: 'train-refresh-success' })
        }
      } else {
        throw new Error('Invalid train search payload')
      }
    } catch (err: any) {
      console.error('[TrainsTab] Refresh failed:', err.message)
      setErrorState('Train information is temporarily unavailable.')
      toast.error('Unable to fetch live train schedules.')
    } finally {
      if (!silent) setLocalLoading(false)
    }
  }, [tripContext.startLocation, tripContext.destination, tripContext.startDate, userProfile.members, setTrains, setTrainStationInfo])

  // 2. Active Tab 10-Minute Polling Strategy
  useEffect(() => {
    const startPolling = () => {
      // Clear any pre-existing timer
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }

      // Schedule refresh every 10 minutes (600,000 ms)
      refreshIntervalRef.current = setInterval(() => {
        console.log('[TrainsTab] Running 10-minute active tab background refresh...')
        handleRefresh(true)
      }, 600000)
    }

    const stopPolling = () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
        refreshIntervalRef.current = null
      }
    }

    if (activeTab === 'trains') {
      startPolling()
    } else {
      stopPolling()
    }

    return () => stopPolling()
  }, [activeTab, handleRefresh])

  // Extract unique classes and train types for filters
  const { availableClasses, trainTypes, minPrice, maxPrice } = useMemo(() => {
    const classesSet = new Set<string>()
    const typesSet = new Set<string>()
    const prices: number[] = []

    trains.forEach((t) => {
      if (t.travelClass) classesSet.add(t.travelClass)
      if (t.trainType) typesSet.add(t.trainType)
      if (t.price) prices.push(t.price)
    })

    const min = prices.length > 0 ? Math.min(...prices) : 0
    const max = prices.length > 0 ? Math.max(...prices) : 0

    return {
      availableClasses: Array.from(classesSet),
      trainTypes: Array.from(typesSet),
      minPrice: min,
      maxPrice: max,
    }
  }, [trains])

  // Initialize maxPrice filter when data loads
  useEffect(() => {
    if (maxPrice > 0 && filters.maxPrice === 0) {
      Promise.resolve().then(() => {
        setFilters((f) => ({ ...f, maxPrice }))
      })
    }
  }, [maxPrice, filters.maxPrice])

  // Helper to match time segments
  const matchTimeSegment = (timeStr: string, segment: string): boolean => {
    if (segment === 'any') return true
    const [hour] = timeStr.split(':').map(Number)
    if (segment === 'morning') return hour >= 0 && hour < 6
    if (segment === 'midday') return hour >= 6 && hour < 12
    if (segment === 'afternoon') return hour >= 12 && hour < 18
    if (segment === 'night') return hour >= 18 && hour < 24
    return true
  }

  // Filtered & Sorted Trains
  const processedTrains = useMemo(() => {
    let result = [...trains]

    // 1. Filtering
    if (filters.selectedClasses.length > 0) {
      result = result.filter((t) => filters.selectedClasses.includes(t.travelClass))
    }
    if (filters.selectedTypes.length > 0) {
      result = result.filter((t) => filters.selectedTypes.includes(t.trainType))
    }
    if (filters.maxPrice > 0) {
      result = result.filter((t) => t.price <= filters.maxPrice)
    }
    if (filters.depTime !== 'any') {
      result = result.filter((t) => matchTimeSegment(t.departureTime, filters.depTime))
    }
    if (filters.arrTime !== 'any') {
      result = result.filter((t) => matchTimeSegment(t.arrivalTime, filters.arrTime))
    }

    // Helper: Parse duration string "15h 40m" -> mins
    const getDurationMins = (durStr: string): number => {
      const match = durStr.match(/(\d+)h\s*(\d*)m?/)
      if (!match) return 0
      const h = parseInt(match[1], 10) || 0
      const m = parseInt(match[2], 10) || 0
      return h * 60 + m
    }

    // 2. Sorting
    result.sort((a, b) => {
      if (sortBy === 'ai') {
        const aScore = a.aiRecommendation ? a.aiRecommendation.reasons.length : 0
        const bScore = b.aiRecommendation ? b.aiRecommendation.reasons.length : 0
        return bScore - aScore // highest recommendations first
      }
      if (sortBy === 'price_low') {
        return a.price - b.price
      }
      if (sortBy === 'duration_low') {
        return getDurationMins(a.duration) - getDurationMins(b.duration)
      }
      if (sortBy === 'dep_early') {
        return a.departureTime.localeCompare(b.departureTime)
      }
      if (sortBy === 'arr_early') {
        return a.arrivalTime.localeCompare(b.arrivalTime)
      }
      return 0
    })

    return result
  }, [trains, filters, sortBy])

  // Loading States
  const showLoading = storeLoading || localLoading

  if (showLoading && trains.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-36 bg-slate-200 animate-pulse rounded-md"></div>
          <div className="h-6 w-16 bg-slate-200 animate-pulse rounded-md"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 h-[400px] bg-slate-100 rounded-2xl animate-pulse"></div>
          <div className="lg:col-span-3 space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-44 bg-slate-100 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Error state display
  if (errorState) {
    return (
      <div className="glass border border-red-200 rounded-2xl p-6 text-center max-w-lg mx-auto mt-10 space-y-3">
        <AlertCircle size={40} className="text-red-500 mx-auto" />
        <h3 className="font-extrabold text-lg text-slate-800">Connection Interrupted</h3>
        <p className="text-sm text-slate-500">{errorState}</p>
        <button
          onClick={() => handleRefresh()}
          className="btn-primary py-2 px-4 text-xs font-bold inline-flex items-center gap-1.5"
        >
          <RefreshCw size={12} /> Retry Search
        </button>
      </div>
    )
  }

  // If no trains found at all, display MakeMyTrip deep link card.
  if (trains.length === 0) {
    const fallbackUrl = trainSearchUrl || "https://www.makemytrip.com/railways/";
    return (
      <div className="space-y-6">
        {/* Branded Header */}
        <div className="glass rounded-2xl border border-blue-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-700 to-red-500 flex items-center justify-center shadow-md shadow-blue-600/20">
                    <Train size={18} className="text-white" />
                  </div>
                  <h3 className="text-xl font-extrabold text-[var(--text-primary)]">
                    Train Bookings
                  </h3>
                </div>
                <p className="text-xs font-bold text-blue-700/80 mt-2 flex items-center gap-1.5">
                  <Shield size={11} className="text-blue-600" />
                  Routed via MakeMyTrip
                </p>
                <p className="text-[11px] text-[var(--text-muted)] mt-1">
                  Live routes &bull; Instant availability &bull; Official Deep Links
                </p>
              </div>

              <button
                onClick={() => handleRefresh()}
                disabled={showLoading}
                className="flex items-center gap-1.5 text-xs font-bold text-[var(--primary)] hover:underline bg-[var(--primary)]/10 px-3.5 py-2 rounded-xl transition-all"
              >
                <RefreshCw size={13} className={showLoading ? 'animate-spin' : ''} />
                {showLoading ? 'Syncing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        {/* Prominent MMT Card */}
        <div className="glass p-8 border border-slate-200/60 rounded-2xl bg-white shadow-md text-center max-w-2xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto text-blue-600">
            <Train size={32} />
          </div>
          <div className="space-y-2">
            <h4 className="text-lg font-black text-slate-800">Book Trains on MakeMyTrip</h4>
            <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              We have generated a direct listing search for your route from <span className="font-extrabold text-slate-700">{tripContext.startLocation || 'your origin'}</span> to <span className="font-extrabold text-slate-700">{tripContext.destination || 'your destination'}</span> on MakeMyTrip.
            </p>
          </div>
          <div className="max-w-xs mx-auto">
            <BookingButton
              label="Book on MakeMyTrip"
              icon="train"
              url={fallbackUrl}
              provider="makemytrip"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Branded Header */}
      <div className="glass rounded-2xl border border-orange-200/60 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-50 via-amber-50/50 to-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-600 to-amber-500 flex items-center justify-center shadow-md shadow-orange-600/20">
                  <Train size={18} className="text-white" />
                </div>
                <h3 className="text-xl font-extrabold text-[var(--text-primary)]">
                  Trains
                </h3>
              </div>
              <p className="text-xs font-bold text-orange-700/80 mt-2 flex items-center gap-1.5">
                <Shield size={11} className="text-orange-600" />
                Powered by Indian Railways (IRCTC)
              </p>
              <p className="text-[11px] text-[var(--text-muted)] mt-1">
                Live schedules &bull; Real-time fares &bull; Secure booking
              </p>
            </div>

            <button
              onClick={() => handleRefresh()}
              disabled={showLoading}
              className="flex items-center gap-1.5 text-xs font-bold text-[var(--primary)] hover:underline bg-[var(--primary)]/10 px-3.5 py-2 rounded-xl transition-all"
            >
              <RefreshCw size={13} className={showLoading ? 'animate-spin' : ''} />
              {showLoading ? 'Syncing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Trust Indicators Strip */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 px-5 py-2.5 bg-white/60 border-t border-orange-100/60 text-[10px] font-bold text-slate-500">
          <span className="flex items-center gap-1">
            <Shield size={10} className="text-green-600" />
            Official Indian Railways Booking
          </span>
          <span className="flex items-center gap-1">
            <Signal size={10} className="text-blue-500" />
            Live Train Information
          </span>
          <span className="flex items-center gap-1">
            <RefreshCw size={10} className="text-amber-500" />
            Real-Time Fare Updates
          </span>
          <span className="flex items-center gap-1 ml-auto text-slate-400">
            <Clock size={10} />
            Last Updated: {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
          </span>
        </div>
      </div>

      {/* Station Substitution Banners */}
      {trainStationInfo && (trainStationInfo.origin.isSubstitute || trainStationInfo.destination.isSubstitute) && (
        <div className="space-y-2">
          {trainStationInfo.destination.isSubstitute && (
            <div className="glass rounded-2xl border border-blue-200/60 p-4 bg-blue-50/30">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin size={16} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-extrabold text-[var(--text-primary)]">
                    Nearest Railway Station
                  </h4>
                  <div className="mt-1.5 space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-slate-500">Destination:</span>
                      <span className="font-extrabold text-[var(--text-primary)]">
                        {trainStationInfo.destination.originalPlace}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-slate-500">Using:</span>
                      <span className="font-extrabold text-blue-700">
                        {trainStationInfo.destination.name} ({trainStationInfo.destination.code})
                      </span>
                    </div>
                    {trainStationInfo.destination.distanceKm && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-slate-500">Distance to destination:</span>
                        <span className="text-slate-600">Approximately {trainStationInfo.destination.distanceKm} km</span>
                      </div>
                    )}
                  </div>
                  {trainStationInfo.destination.reason && (
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                      {trainStationInfo.destination.reason}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          {trainStationInfo.origin.isSubstitute && (
            <div className="glass rounded-2xl border border-indigo-200/60 p-4 bg-indigo-50/30">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin size={16} className="text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-extrabold text-[var(--text-primary)]">
                    Nearest Departure Station
                  </h4>
                  <div className="mt-1.5 space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-slate-500">Departure:</span>
                      <span className="font-extrabold text-[var(--text-primary)]">
                        {trainStationInfo.origin.originalPlace}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-slate-500">Using:</span>
                      <span className="font-extrabold text-indigo-700">
                        {trainStationInfo.origin.name} ({trainStationInfo.origin.code})
                      </span>
                    </div>
                    {trainStationInfo.origin.distanceKm && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-slate-500">Distance:</span>
                        <span className="text-slate-600">Approximately {trainStationInfo.origin.distanceKm} km</span>
                      </div>
                    )}
                  </div>
                  {trainStationInfo.origin.reason && (
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                      {trainStationInfo.origin.reason}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Filters Sidebar */}
        <div className="lg:col-span-1">
          <TrainFilters
            classes={availableClasses}
            trainTypes={trainTypes}
            minPrice={minPrice}
            maxPrice={maxPrice}
            filters={filters}
            setFilters={setFilters}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
        </div>

        {/* Right Train Cards List */}
        <div className="lg:col-span-3 space-y-4">
          {processedTrains.length > 0 ? (
            processedTrains.map((train) => <TrainCard key={train.id} train={train} />)
          ) : (
            <div className="glass p-8 text-center text-slate-500 rounded-2xl border border-slate-100 flex flex-col items-center justify-center space-y-2">
              <Info size={28} className="text-slate-400" />
              <p className="font-extrabold text-sm text-slate-800">No trains match your filters</p>
              <p className="text-xs text-slate-400">Try adjusting your active class or timing filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
