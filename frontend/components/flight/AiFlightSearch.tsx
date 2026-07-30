'use client'

import React, { useState, useMemo } from 'react'
import { Filter, Sparkles, ExternalLink, ShieldCheck, HelpCircle, RefreshCw, Plane, Calendar, Users, MapPin, X, Sliders } from 'lucide-react'
import toast from 'react-hot-toast'
import AiFlightTabsHeader, { TabOption, SortOption } from './AiFlightTabsHeader'
import AiFlightFilterSidebar, { FlightFilterState } from './AiFlightFilterSidebar'
import AiFlightCard, { FlightOfferItem } from './AiFlightCard'
import AiFlightSkeleton from './AiFlightSkeleton'
import { KiwiFlightParams } from '@/lib/kiwiAffiliate'

interface AiFlightSearchProps {
  flights: FlightOfferItem[]
  loading?: boolean
  flightValidation?: {
    hasCommercialAirport?: boolean
    reason?: string
    noAirportCity?: string
    nearestAirport?: {
      iata: string
      name: string
      city: string
      distanceKm: number
    }
    alternativeModes?: string[]
    message?: string
  }
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
  flightValidation,
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

  // Comprehensive reset handler
  const handleResetFilters = () => {
    setFilters({
      cabinBaggageCount: 0,
      checkedBaggageCount: 0,
      stops: 'any',
      allowOvernight: true,
      selectedAirlines: [],
      departureTimeSlot: 'any',
      cabinClass: 'any',
      maxPrice: maxPriceLimit || 500000,
      maxDurationMinutes: maxDurationLimit || 1440,
    })
    setActiveTab('best')
    setSortBy('earliest')
    toast.success('Filters reset to default')
  }

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
      if (filters.stops === '1stop' && flight.stops !== 1) return false
      if (filters.stops === '2stops' && flight.stops > 2) return false

      // 3. Overnight filter
      if (!filters.allowOvernight && flight.isOvernight) return false

      // 4. Airline filter
      if (filters.selectedAirlines.length > 0) {
        const airCode = flight.airlineCode || flight.name
        if (!filters.selectedAirlines.includes(airCode) && !filters.selectedAirlines.includes(flight.name)) {
          return false
        }
      }

      // 5. Price filter
      if (flight.price > filters.maxPrice) return false

      // 6. Duration filter
      if (flight.durationMinutes && flight.durationMinutes > filters.maxDurationMinutes) return false

      return true
    })
  }, [flights, filters])

  // Tab summaries calculations (Best, Cheapest, Fastest)
  const tabSummaries = useMemo(() => {
    const defaultItem = { price: 0, durationStr: '' }
    if (!filteredFlights.length) return { best: defaultItem, cheapest: defaultItem, fastest: defaultItem }

    const cheapestItem = [...filteredFlights].sort((a, b) => a.price - b.price)[0]
    const fastestItem = [...filteredFlights].sort((a, b) => (a.durationMinutes || 9999) - (b.durationMinutes || 9999))[0]
    const bestItem = [...filteredFlights].sort((a, b) => (b.score || 0) - (a.score || 0))[0]

    return {
      cheapest: cheapestItem ? { price: cheapestItem.price, durationStr: cheapestItem.duration || '' } : defaultItem,
      fastest: fastestItem ? { price: fastestItem.price, durationStr: fastestItem.duration || '' } : defaultItem,
      best: bestItem ? { price: bestItem.price, durationStr: bestItem.duration || '' } : defaultItem,
    }
  }, [filteredFlights])

  // Sort filtered flights based on active tab and dropdown
  const sortedFlights = useMemo(() => {
    let list = [...filteredFlights]

    // Apply active tab priority
    if (activeTab === 'cheapest') {
      list.sort((a, b) => a.price - b.price)
    } else if (activeTab === 'fastest') {
      list.sort((a, b) => (a.durationMinutes || 9999) - (b.durationMinutes || 9999))
    } else if (activeTab === 'best') {
      list.sort((a, b) => (b.score || 0) - (a.score || 0))
    }

    // Secondary dropdown sorting
    if (sortBy === 'earliest') list.sort((a, b) => (a.departureTime || '').localeCompare(b.departureTime || ''))
    if (sortBy === 'latest') list.sort((a, b) => (b.departureTime || '').localeCompare(a.departureTime || ''))
    if (sortBy === 'score') list.sort((a, b) => (b.aiConfidenceScore || 0) - (a.aiConfidenceScore || 0))
    if (sortBy === 'stops') list.sort((a, b) => a.stops - b.stops)

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
    <div className="space-y-6 w-full text-[#1A1A1A]">
      
      {/* ── Quick Flight Context Bar ── */}
      <div className="bg-[#FFFBF7] border border-[#E8E0D8] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-[#1A1A1A] shadow-2xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 bg-white border border-[#E8E0D8] px-3 py-1.5 rounded-lg shadow-2xs">
            <Plane size={14} className="text-[#EA580C]" />
            <span>{tripContext?.from || 'Origin'} → {tripContext?.to || 'Destination'}</span>
          </span>
          <span className="flex items-center gap-1.5 bg-white border border-[#E8E0D8] px-3 py-1.5 rounded-lg shadow-2xs">
            <Calendar size={14} className="text-[#EA580C]" />
            <span>{tripContext?.startDate || 'Date'}</span>
          </span>
          <span className="flex items-center gap-1.5 bg-white border border-[#E8E0D8] px-3 py-1.5 rounded-lg shadow-2xs">
            <Users size={14} className="text-[#EA580C]" />
            <span>{tripContext?.travelers || 1} Travelers</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-[#6B6B6B] font-medium">
            Showing <strong className="text-[#1A1A1A] font-bold">{sortedFlights.length}</strong> verified fares
          </span>
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs text-[#EA580C] hover:underline font-extrabold cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* ── Top Header Tabs & Sort ── */}
      <AiFlightTabsHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        sortBy={sortBy}
        onSortChange={setSortBy}
        summaries={tabSummaries}
        currency={currency}
      />

      {/* ── Top Quick-Filter Toolbar & Filter Flights Button ── */}
      <div className="bg-white border border-[#E8E0D8] rounded-2xl p-3 shadow-xs flex items-center justify-between gap-3 text-xs font-bold text-[#6B6B6B]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="px-3.5 py-1.5 bg-[#FFFBF7] hover:bg-orange-50 text-[#1A1A1A] hover:text-[#EA580C] border border-[#E8E0D8] hover:border-orange-200 font-extrabold rounded-xl text-xs shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer font-display"
          >
            <Sliders size={13} className="text-[#EA580C]" />
            <span>Filter Flights</span>
            {(filters.stops !== 'any' || filters.selectedAirlines.length > 0 || filters.maxPrice < maxPriceLimit || filters.departureTimeSlot !== 'any') && (
              <span className="bg-[#EA580C] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                Active
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-[#6B6B6B] font-semibold">
            Showing <strong className="text-[#1A1A1A] font-black">{sortedFlights.length}</strong> verified flights
          </span>
          {(filters.stops !== 'any' || filters.selectedAirlines.length > 0 || filters.maxPrice < maxPriceLimit) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-[#EA580C] hover:underline font-black cursor-pointer"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* ── Main Full-Width Flight Cards Container ── */}
      <div className="w-full space-y-4">
          
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
            /* Smart Empty State — Non-airport city or no operating flights */
            <div className="bg-white border border-[#E8E0D8] rounded-2xl p-8 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
                <HelpCircle size={28} />
              </div>
              
              {flightValidation && flightValidation.hasCommercialAirport === false ? (
                <div className="space-y-3 max-w-md mx-auto">
                  <h3 className="text-lg font-black text-[#1A1A1A] font-display">
                    No Direct Flights Available
                  </h3>
                  <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-xl text-xs text-amber-900 text-left space-y-2">
                    <p className="font-bold text-sm text-amber-950 flex items-center gap-1.5">
                      <MapPin size={16} className="text-amber-700 shrink-0" />
                      <span>{flightValidation.noAirportCity || tripContext?.to || 'Selected location'} has no commercial airport</span>
                    </p>
                    {flightValidation.nearestAirport && (
                      <div className="pt-2 border-t border-amber-200/60">
                        <p className="font-semibold">Nearest Commercial Airport:</p>
                        <p className="font-black text-amber-900 text-sm mt-0.5 font-display">
                          {flightValidation.nearestAirport.name} ({flightValidation.nearestAirport.iata})
                        </p>
                        <p className="text-[11px] text-amber-700 mt-0.5">
                          Location: {flightValidation.nearestAirport.city} • ~{flightValidation.nearestAirport.distanceKm} km distance
                        </p>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-[#6B6B6B] pt-1">
                    We recommend taking a train, bus, or rental cab to reach {flightValidation.noAirportCity || tripContext?.to}.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-w-md mx-auto">
                  <h3 className="text-lg font-black text-[#1A1A1A] font-display">
                    No Operating Flights Found
                  </h3>
                  <p className="text-xs text-[#6B6B6B] leading-relaxed font-medium">
                    {flightValidation?.message || `No commercial airlines operate live flights between ${tripContext?.from || 'origin'} and ${tripContext?.to || 'destination'} on the selected date.`}
                  </p>
                  {flights.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setFilters(DEFAULT_FILTERS)}
                      className="mt-3 px-5 py-2.5 bg-[#EA580C] hover:bg-[#c2410c] text-white font-bold rounded-xl text-xs transition-colors inline-flex items-center gap-2 cursor-pointer"
                    >
                      <RefreshCw size={14} /> Reset Filters
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Kiwi.com Guarantee Banner ── */}
          <div className="bg-emerald-900 text-white border border-emerald-800 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-800 flex items-center justify-center text-emerald-300 shrink-0">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h4 className="text-sm font-extrabold font-display">Kiwi.com Guarantee Included</h4>
                <p className="text-xs text-emerald-200/90 font-medium">
                  Instant rebooking or refund coverage for flight delays & cancellations on all bookings.
                </p>
              </div>
            </div>
            <a
              href="https://www.kiwi.com/en/pages/guarantee"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Learn More</span>
              <ExternalLink size={13} />
            </a>
          </div>

        </div>

      {/* Filter Modal Drawer (Slide-Out) */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-fade-in">
          <div className="bg-white w-full max-w-sm h-[100dvh] max-h-[100dvh] p-5 overflow-y-auto space-y-4 flex flex-col justify-between relative">
            <div className="space-y-4 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#E8E0D8] pb-3 sticky top-0 bg-white z-10">
                <h3 className="font-black text-base text-[#1A1A1A] font-display">Filters</h3>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="text-[#6B6B6B] hover:text-[#1A1A1A] font-extrabold text-sm cursor-pointer flex items-center gap-1 min-h-[44px] min-w-[44px] justify-end"
                >
                  <span>Close</span>
                  <X size={16} />
                </button>
              </div>
              <AiFlightFilterSidebar
                filters={filters}
                onChange={setFilters}
                onReset={handleResetFilters}
                availableAirlines={availableAirlines}
                minPriceLimit={minPriceLimit}
                maxPriceLimit={maxPriceLimit}
                maxDurationLimit={maxDurationLimit}
              />
            </div>
            <div className="sticky bottom-0 bg-white pt-3 border-t border-[#E8E0D8] pb-2 z-10">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="w-full bg-[#EA580C] text-white font-extrabold py-3.5 rounded-xl text-sm shadow-md cursor-pointer min-h-[44px] active:scale-95 transition-transform"
              >
                Apply Filters ({filteredFlights.length} Flights)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
