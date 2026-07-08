'use client'

import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import { useTripStore } from '@/store/tripStore'
import { tripAPI } from '@/lib/api'
import { RefreshCw, Shield, Signal, Clock, Train, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import TrainCard from './TrainCard'
import TrainFilters from './TrainFilters'
import TrainsEmpty from './TrainsEmpty'
import TrainsSkeleton from './TrainsSkeleton'

// Helper: Parse duration string "15h 40m" -> mins
const getDurationMins = (durStr: string): number => {
  if (!durStr) return 0
  const match = durStr.match(/(\d+)h\s*(\d*)m?/)
  if (!match) return 0
  const h = parseInt(match[1], 10) || 0
  const m = parseInt(match[2], 10) || 0
  return h * 60 + m
}

// Helper: Convert time "HH:MM" to minutes since midnight
const timeToMins = (timeStr: string): number => {
  if (!timeStr) return 0
  const [h, m] = timeStr.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

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

  // Fetch function for refreshes
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

  // Active Tab 10-Minute Polling Strategy
  useEffect(() => {
    const startPolling = () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
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
      if (t.classes && Array.isArray(t.classes)) {
        t.classes.forEach((c) => classesSet.add(c.classCode))
      } else if (t.travelClass) {
        classesSet.add(t.travelClass)
      }
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

  // Pre-calculate AI Rankings on the raw trains list before applying filters
  const trainsWithAiBadges = useMemo(() => {
    if (!trains || trains.length === 0) return []

    // 1. Calculate ranks
    const sortedByPrice = [...trains].sort((a, b) => a.price - b.price)
    const sortedByDuration = [...trains].sort((a, b) => getDurationMins(a.duration) - getDurationMins(b.duration))
    const sortedByArrival = [...trains].sort((a, b) => timeToMins(a.arrivalTime) - timeToMins(b.arrivalTime))

    const priceRanks = new Map<string, number>()
    const durationRanks = new Map<string, number>()
    const arrivalRanks = new Map<string, number>()

    sortedByPrice.forEach((t, i) => priceRanks.set(t.id, i + 1))
    sortedByDuration.forEach((t, i) => durationRanks.set(t.id, i + 1))
    sortedByArrival.forEach((t, i) => arrivalRanks.set(t.id, i + 1))

    // Determine absolute winners
    const cheapestId = sortedByPrice[0]?.id
    const fastestId = sortedByDuration[0]?.id
    const bestArrivalId = sortedByArrival[0]?.id

    // Compute composite score: 0.4*price_rank + 0.3*duration_rank + 0.3*arrival_rank
    const scores = trains.map((t) => {
      const pR = priceRanks.get(t.id) || 1
      const dR = durationRanks.get(t.id) || 1
      const aR = arrivalRanks.get(t.id) || 1
      const score = 0.4 * pR + 0.3 * dR + 0.3 * aR
      return { id: t.id, score }
    })
    const bestOverallId = [...scores].sort((a, b) => a.score - b.score)[0]?.id

    return trains.map((t) => {
      let badge = ''
      let reasons: string[] = []

      if (t.id === bestOverallId) {
        badge = 'Best Overall'
        reasons = ['Optimal speed, cost, & schedule combination']
      } else if (t.id === cheapestId) {
        badge = 'Cheapest'
        reasons = ['Lowest fare available']
      } else if (t.id === fastestId) {
        badge = 'Fastest'
        reasons = ['Shortest journey time']
      } else if (t.id === bestArrivalId) {
        badge = 'Best Arrival'
        reasons = ['Earliest/most convenient arrival time']
      }

      return {
        ...t,
        aiRecommendation: badge ? { badge, reasons } : null,
      }
    })
  }, [trains])

  // Filtered & Sorted Trains
  const processedTrains = useMemo(() => {
    let result = [...trainsWithAiBadges]

    // 1. Filtering
    if (filters.selectedClasses.length > 0) {
      result = result.filter((t) => {
        const clsCodes = t.classes?.map((c) => c.classCode) || [t.travelClass]
        return filters.selectedClasses.some((c) => clsCodes.includes(c))
      })
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

    // 2. Sorting
    result.sort((a, b) => {
      if (sortBy === 'ai') {
        const aVal = a.aiRecommendation?.badge === 'Best Overall' ? 2 : a.aiRecommendation ? 1 : 0
        const bVal = b.aiRecommendation?.badge === 'Best Overall' ? 2 : b.aiRecommendation ? 1 : 0
        if (aVal !== bVal) return bVal - aVal
        return a.price - b.price // tie-breaker: cheapest first
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
  }, [trainsWithAiBadges, filters, sortBy])

  // Loading States
  const showLoading = storeLoading || localLoading

  if (showLoading && trains.length === 0) {
    return <TrainsSkeleton />
  }

  // Error state display
  if (errorState) {
    return (
      <div className="glass border border-red-200 rounded-2xl p-8 text-center max-w-lg mx-auto mt-10 space-y-4 bg-white shadow-sm">
        <AlertCircle size={40} className="text-red-500 mx-auto" />
        <h3 className="font-extrabold text-lg text-slate-800">Connection Failed</h3>
        <p className="text-sm text-slate-500 leading-relaxed">{errorState}</p>
        <button
          onClick={() => handleRefresh()}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs bg-orange-600 hover:bg-orange-700 text-white transition-colors cursor-pointer shadow-md shadow-orange-600/10"
        >
          <RefreshCw size={12} /> Retry Search
        </button>
      </div>
    )
  }

  // If no trains found at all
  if (trains.length === 0) {
    return (
      <TrainsEmpty
        origin={tripContext.startLocation}
        destination={tripContext.destination}
        trainStationInfo={trainStationInfo}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Branded Header */}
      <div className="glass rounded-2xl border border-orange-200/60 overflow-hidden bg-white shadow-sm">
        <div className="bg-gradient-to-r from-orange-50 via-amber-50/50 to-white p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-600 to-amber-500 flex items-center justify-center shadow-md shadow-orange-600/20">
                  <Train size={18} className="text-white" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-800">
                  Train Availability
                </h3>
              </div>
              <p className="text-xs font-semibold text-orange-700/80 mt-2 flex items-center gap-1.5">
                <Shield size={11} className="text-orange-600" />
                Indian Railways (IRCTC) Live Search
              </p>
            </div>

            <button
              onClick={() => handleRefresh()}
              disabled={showLoading}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-700 hover:bg-orange-50 bg-orange-500/10 border border-orange-200/40 px-3.5 py-2 rounded-xl transition-all cursor-pointer w-fit"
            >
              <RefreshCw size={13} className={showLoading ? 'animate-spin' : ''} />
              {showLoading ? 'Syncing...' : 'Refresh Schedules'}
            </button>
          </div>
        </div>

        {/* Trust Indicators Strip */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 px-5 py-2.5 bg-slate-50/50 border-t border-slate-100 text-[10px] font-bold text-slate-500">
          <span className="flex items-center gap-1">
            <Shield size={10} className="text-green-600" />
            Official IRCTC Routes & Fares
          </span>
          <span className="flex items-center gap-1">
            <Signal size={10} className="text-blue-500" />
            Real-Time Train Schedules
          </span>
          <span className="flex items-center gap-1 ml-auto text-slate-400">
            <Clock size={10} />
            Updated just now
          </span>
        </div>
      </div>

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
            <div className="glass p-8 text-center text-slate-500 rounded-2xl border border-slate-100 bg-white shadow-sm flex flex-col items-center justify-center space-y-2">
              <Clock size={28} className="text-slate-400" />
              <p className="font-extrabold text-sm text-slate-800">No trains match your filters</p>
              <p className="text-xs text-slate-400">Try adjusting your active class or timing filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
