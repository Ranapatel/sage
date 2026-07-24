'use client'

import React, { useState, useMemo } from 'react'
import { Filter, Sparkles, ExternalLink, ShieldCheck, HelpCircle, RefreshCw } from 'lucide-react'
import AiFlightTabsHeader, { TabOption, SortOption } from './AiFlightTabsHeader'
import AiFlightFilterSidebar, { FlightFilterState } from './AiFlightFilterSidebar'
import AiFlightCard, { FlightOfferItem } from './AiFlightCard'
import AiFlightSkeleton from './AiFlightSkeleton'
import { KiwiFlightParams } from '@/lib/kiwiAffiliate'

interface AiFlightSearchProps {
  flights: FlightOfferItem[]
  loading?: boolean
  tripContext?: {
    from?: string
    to?: string
    startDate?: string
    endDate?: string
    travelers?: number
    cabin?: string
  }
  currency?: string
}

const DEFAULT_FILTERS: FlightFilterState = {
  cabinBaggageCount: 0,
  checkedBaggageCount: 0,
  stops: 'any',
  allowOvernight: true,
  selectedAirlines: [],
  departureTimeSlot: 'any',
  cabinClass: 'any',
  maxPrice: 500000,
  maxDurationMinutes: 1440,
}

export default function AiFlightSearch({
  flights = [],
  loading = false,
  tripContext,
  currency = 'INR',
}: AiFlightSearchProps) {
  const [activeTab, setActiveTab] = useState<TabOption>('best')
  const [sortBy, setSortBy] = useState<SortOption>('earliest')
  const [filters, setFilters] = useState<FlightFilterState>(DEFAULT_FILTERS)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  // Extract available airlines from flight results
  const availableAirlines = useMemo(() => {
    const map = new Map<string, string>()
    flights.forEach(f => {
      if (f.name) map.set(f.name, f.airlineCode || f.name.slice(0, 2))
    })
    return Array.from(map.entries()).map(([name, code]) => ({ name, code }))
  }, [flights])

  // Compute price and duration limits for range sliders
  const { minPriceLimit, maxPriceLimit, maxDurationLimit } = useMemo(() => {
    if (!flights.length) return { minPriceLimit: 0, maxPriceLimit: 200000, maxDurationLimit: 1440 }
    const prices = flights.map(f => f.price)
    const maxP = Math.max(...prices)
    const minP = Math.min(...prices)
    const durations = flights.map(f => f.durationMinutes || 600)
    const maxD = Math.max(...durations)
    return {
      minPriceLimit: minP,
      maxPriceLimit: Math.ceil(maxP / 1000) * 1000 + 5000,
      maxDurationLimit: maxD,
    }
  }, [flights])

  // Filter flights based on active sidebar controls
  const filteredFlights = useMemo(() => {
    return flights.filter(flight => {
      // 1. Baggage filter
      if (filters.cabinBaggageCount > 0) {
        const bagNum = parseInt(flight.cabinBaggage || '1', 10)
        if (bagNum < filters.cabinBaggageCount) return false
      }
      if (filters.checkedBaggageCount > 0) {
        const bagNum = parseInt(flight.checkedBaggage || '0', 10)
        if (bagNum < filters.checkedBaggageCount) return false
      }

      // 2. Stops filter
      if (filters.stops === 'direct' && flight.stops > 0) return false
      if (filters.stops === '1stop' && flight.stops > 1) return false
      if (filters.stops === '2stops' && flight.stops > 2) return false
      if (!filters.allowOvernight && flight.isOvernight) return false

      // 3. Airline filter
      if (filters.selectedAirlines.length > 0 && !filters.selectedAirlines.includes(flight.name)) {
        return false
      }

      // 4. Time Slot filter
      if (filters.departureTimeSlot !== 'any') {
        const hour = parseInt((flight.departureTime || '12:00').split(':')[0], 10)
        if (filters.departureTimeSlot === 'morning' && (hour < 6 || hour >= 12)) return false
        if (filters.departureTimeSlot === 'afternoon' && (hour < 12 || hour >= 18)) return false
        if (filters.departureTimeSlot === 'evening' && (hour < 18 || hour >= 24)) return false
      }

      // 5. Max Price filter
      if (filters.maxPrice < maxPriceLimit && flight.price > filters.maxPrice) return false

      return true
    })
  }, [flights, filters, maxPriceLimit])

  // Summaries for Best, Cheapest, and Fastest tabs based on filtered flights
  const tabSummaries = useMemo(() => {
    if (!filteredFlights.length) {
      return {
        best: { price: 0, durationStr: '' },
        cheapest: { price: 0, durationStr: '' },
        fastest: { price: 0, durationStr: '' },
      }
    }

    const getPaxPrice = (f: FlightOfferItem) => f.perPassengerPrice || (f.totalPrice && f.passengers ? Math.round(f.totalPrice / f.passengers) : f.price)

    // Cheapest: lowest price
    const cheapestFlight = [...filteredFlights].sort((a, b) => getPaxPrice(a) - getPaxPrice(b))[0]

    // Fastest: lowest durationMinutes
    const fastestFlight = [...filteredFlights].sort((a, b) => (a.durationMinutes || 9999) - (b.durationMinutes || 9999))[0]

    // Best: composite score balancing price and duration
    const bestFlight = [...filteredFlights].sort((a, b) => {
      const scoreA = (a.score || 0.8) * 100000 - getPaxPrice(a) - (a.durationMinutes || 600) * 10
      const scoreB = (b.score || 0.8) * 100000 - getPaxPrice(b) - (b.durationMinutes || 600) * 10
      return scoreB - scoreA
    })[0] || cheapestFlight

    return {
      best: { price: getPaxPrice(bestFlight), durationStr: bestFlight.duration || '' },
      cheapest: { price: getPaxPrice(cheapestFlight), durationStr: cheapestFlight.duration || '' },
      fastest: { price: getPaxPrice(fastestFlight), durationStr: fastestFlight.duration || '' },
    }
  }, [filteredFlights])

  // Sort filtered flights based on active tab and sort dropdown
  const sortedFlights = useMemo(() => {
    const list = [...filteredFlights]

    // Apply main Tab sorting first
    if (activeTab === 'cheapest') {
      list.sort((a, b) => a.price - b.price)
    } else if (activeTab === 'fastest') {
      list.sort((a, b) => (a.durationMinutes || 9999) - (b.durationMinutes || 9999))
    } else if (activeTab === 'best') {
      list.sort((a, b) => (b.score || 0.8) - (a.score || 0.8))
    }

    // Apply secondary sort dropdown override if specified
    if (sortBy === 'earliest') {
      list.sort((a, b) => (a.departureTime || '').localeCompare(b.departureTime || ''))
    } else if (sortBy === 'latest') {
      list.sort((a, b) => (b.departureTime || '').localeCompare(a.departureTime || ''))
    } else if (sortBy === 'score') {
      list.sort((a, b) => (b.aiConfidenceScore || 0) - (a.aiConfidenceScore || 0))
    } else if (sortBy === 'stops') {
      list.sort((a, b) => a.stops - b.stops)
    }

    return list
  }, [filteredFlights, activeTab, sortBy])

  const searchParams: KiwiFlightParams = {
    origin: tripContext?.from,
    destination: tripContext?.to,
    departureDate: tripContext?.startDate,
    returnDate: tripContext?.endDate,
    passengers: tripContext?.travelers,
    cabinClass: tripContext?.cabin,
  }

  if (loading) {
    return <AiFlightSkeleton />
  }

  return (
    <div className="space-y-6 w-full text-slate-900 dark:text-slate-100">
      
      {/* ── Top Header Tabs & Sort ── */}
      <AiFlightTabsHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        sortBy={sortBy}
        onSortChange={setSortBy}
        summaries={tabSummaries}
        currency={currency}
      />

      {/* Mobile Filter Toggle Button */}
      <div className="block lg:hidden">
        <button
          type="button"
          onClick={() => setMobileFilterOpen(true)}
          className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3 text-sm font-extrabold text-slate-800 dark:text-slate-200"
        >
          <Filter size={16} className="text-orange-500" />
          <span>Filter Flights ({filteredFlights.length} available)</span>
        </button>
      </div>

      {/* ── Main Layout: Sidebar + Flight Cards ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block lg:col-span-1">
          <AiFlightFilterSidebar
            filters={filters}
            onChange={setFilters}
            onReset={() => setFilters(DEFAULT_FILTERS)}
            availableAirlines={availableAirlines}
            minPriceLimit={minPriceLimit}
            maxPriceLimit={maxPriceLimit}
            maxDurationLimit={maxDurationLimit}
          />
        </div>

        {/* Flight Cards Column */}
        <div className="lg:col-span-3 space-y-4">
          
          {sortedFlights.length > 0 ? (
            sortedFlights.map(flight => (
              <AiFlightCard
                key={flight.id}
                flight={flight}
                searchParams={searchParams}
                currency={currency}
              />
            ))
          ) : (
            /* Empty State */
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center space-y-4 shadow-sm">
              <div className="w-14 h-14 bg-orange-100 dark:bg-orange-950/40 text-orange-500 rounded-full flex items-center justify-center mx-auto">
                <Sparkles size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black">No flights match your filter criteria</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Try adjusting your bag preferences, stop limit, or price range.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition-colors inline-flex items-center gap-2"
              >
                <RefreshCw size={14} /> Reset All Filters
              </button>
            </div>
          )}

          {/* ── Kiwi.com Guarantee Banner (Matching reference image) ── */}
          <div className="bg-emerald-900 text-white border border-emerald-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-800 flex items-center justify-center text-emerald-300 shrink-0">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h4 className="text-sm font-extrabold">Kiwi.com Guarantee Included</h4>
                <p className="text-xs text-emerald-200/80">
                  Instant rebooking or refund coverage for flight delays & cancellations on all bookings.
                </p>
              </div>
            </div>
            <a
              href="https://www.kiwi.com/en/pages/guarantee"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs transition-colors shrink-0 flex items-center gap-1.5"
            >
              <span>Learn More</span>
              <ExternalLink size={13} />
            </a>
          </div>

        </div>
      </div>

      {/* Mobile Filter Modal Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end lg:hidden">
          <div className="bg-white dark:bg-slate-950 w-full max-w-sm h-full p-5 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-black text-base">Filters</h3>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-extrabold text-sm"
              >
                Close ✕
              </button>
            </div>
            <AiFlightFilterSidebar
              filters={filters}
              onChange={setFilters}
              onReset={() => setFilters(DEFAULT_FILTERS)}
              availableAirlines={availableAirlines}
              minPriceLimit={minPriceLimit}
              maxPriceLimit={maxPriceLimit}
              maxDurationLimit={maxDurationLimit}
            />
            <button
              type="button"
              onClick={() => setMobileFilterOpen(false)}
              className="w-full bg-orange-500 text-white font-extrabold py-3 rounded-xl text-sm shadow-md"
            >
              Apply Filters ({filteredFlights.length} Flights)
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
