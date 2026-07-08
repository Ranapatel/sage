'use client'

import React, { useEffect, useState, useMemo, useRef, useCallback, memo } from 'react'
import { useTripStore } from '@/store/tripStore'
import { tripAPI } from '@/lib/api'
import { RefreshCw, Shield, Clock, Bus, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import BusCard from './BusCard'
import BusesSkeleton from './BusesSkeleton'
import BusesEmpty from './BusesEmpty'

// Helper: Parse duration string "12h 30m" -> mins
const getDurationMins = (durStr: string): number => {
  if (!durStr) return 0
  const match = durStr.match(/(\d+)h\s*(\d*)m?/)
  if (!match) return 0
  const h = parseInt(match[1], 10) || 0
  const m = parseInt(match[2], 10) || 0
  return h * 60 + m
}

export function BusesTab() {
  const {
    buses,
    setBuses,
    busSearchUrl,
    setBusSearchUrl,
    tripContext,
    activeTab,
  } = useTripStore()

  const [loading, setLoading] = useState(false)
  const [errorState, setErrorState] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState('ai') // 'ai', 'price_low', 'duration_low', 'rating_high'

  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch function for buses
  const handleRefresh = useCallback(async (silent = false) => {
    if (!tripContext.startLocation || !tripContext.destination || !tripContext.startDate) {
      return
    }

    if (!silent) setLoading(true)
    setErrorState(null)

    try {
      // Direct call to local frontend endpoint or tripAPI
      const response = await fetch('/api/transport/buses/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin: tripContext.startLocation,
          destination: tripContext.destination,
          travelDate: tripContext.startDate,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP status ${response.status}`)
      }

      const data = await response.json()
      const busesList = data.results || []
      const searchUrl = data.searchUrl || ''

      if (Array.isArray(busesList)) {
        setBuses(busesList)
        setBusSearchUrl(searchUrl)
        if (!silent) {
          toast.success('Bus listings updated!', { id: 'bus-refresh-success' })
        }
      } else {
        throw new Error('Invalid bus search response payload')
      }
    } catch (err: any) {
      console.error('[BusesTab] Fetch failed:', err.message)
      setErrorState('Bus schedules are currently unavailable for this route.')
      toast.error('Unable to fetch live bus schedules.')
    } finally {
      if (!silent) setLoading(false)
    }
  }, [tripContext.startLocation, tripContext.destination, tripContext.startDate, setBuses, setBusSearchUrl])

  // Active Tab 10-Minute Polling Strategy
  useEffect(() => {
    const startPolling = () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
      refreshIntervalRef.current = setInterval(() => {
        console.log('[BusesTab] Running 10-minute active tab background refresh...')
        handleRefresh(true)
      }, 600000)
    }

    const stopPolling = () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
        refreshIntervalRef.current = null
      }
    }

    if (activeTab === 'buses') {
      startPolling()
    } else {
      stopPolling()
    }

    return () => stopPolling()
  }, [activeTab, handleRefresh])

  // Pre-calculate AI Rankings on the buses list before filters/sorting
  const busesWithAiBadges = useMemo(() => {
    if (!buses || buses.length === 0) return []

    // 1. Sort versions to assign ranks
    const sortedByPrice = [...buses].sort((a, b) => (a.price || 0) - (b.price || 0))
    const sortedByDuration = [...buses].sort((a, b) => getDurationMins(a.duration) - getDurationMins(b.duration))
    const sortedByRating = [...buses].sort((a, b) => (b.rating || 0) - (a.rating || 0))

    const priceRanks = new Map<string, number>()
    const durationRanks = new Map<string, number>()
    const ratingRanks = new Map<string, number>()

    sortedByPrice.forEach((b, i) => priceRanks.set(b.id, i + 1))
    sortedByDuration.forEach((b, i) => durationRanks.set(b.id, i + 1))
    sortedByRating.forEach((b, i) => ratingRanks.set(b.id, i + 1))

    // Determine absolute winners
    const cheapestId = sortedByPrice[0]?.id
    const fastestId = sortedByDuration[0]?.id
    const bestRatedId = sortedByRating[0]?.id

    // Score = 0.4*price_rank + 0.3*duration_rank + 0.3*rating_rank
    const scores = buses.map((b) => {
      const pR = priceRanks.get(b.id) || 1
      const dR = durationRanks.get(b.id) || 1
      const rR = ratingRanks.get(b.id) || 1
      const score = 0.4 * pR + 0.3 * dR + 0.3 * rR
      return { id: b.id, score }
    })
    const bestOverallId = [...scores].sort((a, b) => a.score - b.score)[0]?.id

    return buses.map((b) => {
      let badge = ''
      let reasons: string[] = []

      if (b.id === bestOverallId) {
        badge = 'Best Overall'
        reasons = ['Optimal price, rating, & speed balance']
      } else if (b.id === cheapestId) {
        badge = 'Cheapest'
        reasons = ['Lowest fare on this route']
      } else if (b.id === fastestId) {
        badge = 'Fastest'
        reasons = ['Shortest travel time']
      } else if (b.id === bestRatedId && b.rating && b.rating >= 4.0) {
        badge = 'Top Rated'
        reasons = ['Highly rated by passengers']
      }

      return {
        ...b,
        aiRank: badge ? { badge, reasons } : null,
      }
    })
  }, [buses])

  // Filtered & Sorted Buses
  const processedBuses = useMemo(() => {
    let result = [...busesWithAiBadges]

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'ai') {
        const aVal = a.aiRank?.badge === 'Best Overall' ? 2 : a.aiRank ? 1 : 0
        const bVal = b.aiRank?.badge === 'Best Overall' ? 2 : b.aiRank ? 1 : 0
        if (aVal !== bVal) return bVal - aVal
        return (a.price || 0) - (b.price || 0) // tie-breaker: cheapest
      }
      if (sortBy === 'price_low') {
        return (a.price || 0) - (b.price || 0)
      }
      if (sortBy === 'duration_low') {
        return getDurationMins(a.duration) - getDurationMins(b.duration)
      }
      if (sortBy === 'rating_high') {
        return (b.rating || 0) - (a.rating || 0)
      }
      return 0
    })

    return result
  }, [busesWithAiBadges, sortBy])

  if (loading && buses.length === 0) {
    return <BusesSkeleton />
  }

  if (errorState) {
    return (
      <div className="glass border border-red-200 rounded-2xl p-8 text-center max-w-lg mx-auto mt-10 space-y-4 bg-white shadow-sm animate-fade-in">
        <AlertCircle size={40} className="text-red-500 mx-auto" />
        <h3 className="font-extrabold text-lg text-slate-800">Connection Interrupted</h3>
        <p className="text-sm text-slate-500 leading-relaxed">{errorState}</p>
        <button
          onClick={() => handleRefresh()}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer shadow-md shadow-blue-600/10"
        >
          <RefreshCw size={12} /> Retry Search
        </button>
      </div>
    )
  }

  if (buses.length === 0) {
    return (
      <BusesEmpty
        origin={tripContext.startLocation}
        destination={tripContext.destination}
        searchUrl={busSearchUrl}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Branded Header */}
      <div className="glass rounded-2xl border border-blue-200 overflow-hidden bg-white shadow-sm">
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-white p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-700 to-red-500 flex items-center justify-center shadow-md shadow-blue-600/20">
                  <Bus size={18} className="text-white" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-800">
                  Bus Routes & Schedules
                </h3>
              </div>
              <p className="text-xs font-semibold text-blue-700/80 mt-2 flex items-center gap-1.5">
                <Shield size={11} className="text-blue-600" />
                Routed via MakeMyTrip
              </p>
            </div>

            <button
              onClick={() => handleRefresh()}
              disabled={loading}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:bg-blue-50 bg-blue-500/10 border border-blue-200/40 px-3.5 py-2 rounded-xl transition-all cursor-pointer w-fit"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Syncing...' : 'Refresh Listings'}
            </button>
          </div>
        </div>

        {/* Trust Strip */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 px-5 py-2.5 bg-slate-50/50 border-t border-slate-100 text-[10px] font-bold text-slate-500">
          <span className="flex items-center gap-1">
            <Shield size={10} className="text-green-600" />
            Vetted Bus Operators Only
          </span>
          <span className="flex items-center gap-1">
            <Clock size={10} className="text-blue-500" />
            Live Seat Capacity Estimates
          </span>
        </div>
      </div>

      {/* Sorting bar & Quick Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-500">Sort by:</span>
          {[
            { id: 'ai', label: 'AI Recommended' },
            { id: 'price_low', label: 'Cheapest' },
            { id: 'duration_low', label: 'Fastest' },
            { id: 'rating_high', label: 'Top Rated' },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSortBy(opt.id)}
              className={`text-xs py-1.5 px-3 rounded-lg font-bold transition-all border ${
                sortBy === opt.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <span className="text-xs font-bold text-slate-500">
          {processedBuses.length} options found
        </span>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {processedBuses.map((bus) => (
          <BusCard key={bus.id} bus={bus as any} />
        ))}
      </div>
    </div>
  )
}

export default memo(BusesTab)
