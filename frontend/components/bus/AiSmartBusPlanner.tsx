'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  Bus, Clock, MapPin, Sparkles,
  Zap, Award, PiggyBank, ArrowUpDown, CheckCircle2,
  Users, Info, ExternalLink, IndianRupee, Star, ChevronUp, ChevronDown, SlidersHorizontal, X
} from 'lucide-react'
import { useTripStore } from '@/store/tripStore'
import {
  generateSmartBusRoutes, SmartBusPlannerResult, SmartBusRoute, buildRedBusDeepLink
} from '@/lib/smartBusPlanner'
import RedBusBookingModal from './RedBusBookingModal'
import { SageScoreRing } from '@/components/ui/SageScoreBadge'
import TrainsSkeleton from '../train/TrainsSkeleton'

export default function AiSmartBusPlanner() {
  const { tripContext, buses, loading: storeLoading } = useTripStore()

  // Form State
  const [fromCity, setFromCity] = useState<string>(tripContext.startLocation || 'Hyderabad')
  const [toCity, setToCity] = useState<string>(tripContext.destination || 'Goa')
  const [journeyDate, setJourneyDate] = useState<string>(tripContext.startDate || '2026-06-25')
  const [passengers, setPassengers] = useState<number>(2)
  const [busType, setBusType] = useState<string>('ALL') // 'ALL', 'SLEEPER', 'VOLVO', 'SEATER', 'EV'
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'best' | 'fastest' | 'cheapest'>('all')
  const [showAllRoutes, setShowAllRoutes] = useState<boolean>(false)

  // Modal state
  const [selectedRouteForModal, setSelectedRouteForModal] = useState<SmartBusRoute | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isBusDrawerOpen, setIsBusDrawerOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  // Sync state if tripContext updates
  useEffect(() => {
    if (tripContext.startLocation) setFromCity(tripContext.startLocation)
    if (tripContext.destination) setToCity(tripContext.destination)
    if (tripContext.startDate) setJourneyDate(tripContext.startDate)
  }, [tripContext.startLocation, tripContext.destination, tripContext.startDate])

  // Swap locations
  const handleSwapLocations = () => {
    const temp = fromCity
    setFromCity(toCity)
    setToCity(temp)
  }

  // Generate AI Smart Bus Routes
  const plannerData: SmartBusPlannerResult = useMemo(() => {
    return generateSmartBusRoutes({
      origin: fromCity,
      destination: toCity,
      date: journeyDate,
      passengers,
      busType,
      rawBuses: buses,
    })
  }, [fromCity, toCity, journeyDate, passengers, busType, buses])

  const handleSearchRoutes = () => {
    setIsSearching(true)
    setTimeout(() => {
      setIsSearching(false)
    }, 400)
  }

  const handleOpenBookingModal = (route: SmartBusRoute) => {
    setSelectedRouteForModal(route)
    setIsModalOpen(true)
  }

  // Filter routes based on top tabs & show top 3 highlights by default
  const routesToDisplay = useMemo(() => {
    if (activeTabFilter === 'best') return [plannerData.routes.best]
    if (activeTabFilter === 'fastest') return [plannerData.routes.fastest]
    if (activeTabFilter === 'cheapest') return [plannerData.routes.cheapest]
    
    // Default view: Show Top 3 AI Decision Highlights unless user clicks Expand
    if (!showAllRoutes) {
      return [plannerData.routes.best, plannerData.routes.fastest, plannerData.routes.cheapest].filter(Boolean)
    }

    return [plannerData.routes.best, plannerData.routes.fastest, plannerData.routes.cheapest].filter(Boolean)
  }, [plannerData, activeTabFilter, showAllRoutes])

  if (storeLoading || isSearching) {
    return <TrainsSkeleton />
  }

  if (plannerData.isDomestic === false && (!buses || buses.length === 0)) {
    return (
      <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
        <div className="glass rounded-2xl border border-[#E8E0D8] p-8 text-center bg-white shadow-xs flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
            <Bus size={32} />
          </div>
          <div className="space-y-2">
            <h4 className="text-xl font-black text-[#1A1A1A] font-display">International Bus Services Not Available</h4>
            <p className="text-sm text-[#6B6B6B] leading-relaxed max-w-md mx-auto font-medium">
              International bus services are not available for this route.
            </p>
            <p className="text-xs text-[#9CA3AF] max-w-md mx-auto">
              Bus travel is only available for domestic routes within the same country or supported cross-border routes when live bus listings exist. Please check flight options for your trip to <span className="font-bold text-[#1A1A1A]">{toCity}</span>.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full text-[#1A1A1A] animate-fade-in">
      
      {/* ── Top Header Banner (TripSage Warm Light Theme) ── */}
      <div className="bg-white border border-[#E8E0D8] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-orange-50 text-[#EA580C] border border-orange-200 text-xs font-black px-2.5 py-0.5 rounded-md uppercase tracking-wide">
              AI Smart Bus Planner <span className="text-[10px] text-[#EA580C] font-extrabold ml-1">Beta</span>
            </span>
            <span className="text-xs text-[#6B6B6B] font-semibold">
              We find the smartest bus routes, even when there is no direct bus.
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-black text-[#1A1A1A] leading-tight font-display">
            {plannerData.origin.name} → {plannerData.destination.name}
          </h2>

          <div className="flex flex-wrap items-center gap-3 text-xs text-[#6B6B6B] font-semibold mt-1">
            <span className="inline-flex items-center gap-1">
              <MapPin size={13} className="text-[#EA580C]" />
              <span>Distance: ~{plannerData.distanceKm} km</span>
            </span>
            <span>•</span>
            <span className="text-emerald-600 font-bold inline-flex items-center gap-1">
              <Bus size={13} className="text-emerald-600" />
              <span>Smart Multi-Hop Connections Available</span>
            </span>
          </div>
        </div>

        {/* AI Powered Badge */}
        <div className="flex items-center gap-2 px-3.5 py-2 bg-orange-50/80 border border-orange-200 rounded-xl text-[#EA580C] font-extrabold text-xs shrink-0 shadow-2xs">
          <Sparkles size={14} className="animate-pulse text-[#EA580C]" />
          <span>Powered by AI & redBus</span>
        </div>
      </div>

      {/* ── Top Quick-Filter Toolbar & Filter Button ── */}
      <div className="bg-white border border-[#E8E0D8] rounded-2xl p-3 shadow-xs flex items-center justify-between gap-3 text-xs font-bold text-[#6B6B6B]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsBusDrawerOpen(true)}
            className="px-3.5 py-1.5 bg-[#FFFBF7] hover:bg-orange-50 text-[#1A1A1A] hover:text-[#EA580C] border border-[#E8E0D8] hover:border-orange-200 font-extrabold rounded-xl text-xs shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer font-display"
          >
            <SlidersHorizontal size={13} className="text-[#EA580C]" />
            <span>Search & Bus Filters</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-[#6B6B6B] font-semibold">
            Showing <strong className="text-[#1A1A1A] font-black">{routesToDisplay.length}</strong> Smart Bus Routes
          </span>
        </div>
      </div>

      {/* ── Main Full-Width Bus Routes Column (100% Widescreen Grid) ── */}
      <div className="w-full space-y-6">
          
          {/* Top Recommendation Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Best Route Button */}
            <button
              type="button"
              onClick={() => setActiveTabFilter(activeTabFilter === 'best' ? 'all' : 'best')}
              className={`p-2.5 md:p-3.5 rounded-2xl border transition-all text-left cursor-pointer flex flex-col justify-between ${
                activeTabFilter === 'best' || activeTabFilter === 'all'
                  ? 'bg-orange-50/90 border-[#EA580C] text-[#EA580C] shadow-xs ring-2 ring-[#EA580C]/20'
                  : 'bg-white border-[#E8E0D8] text-[#6B6B6B] hover:border-[#EA580C]/40'
              }`}
            >
              <div className="flex items-center justify-between gap-1 w-full">
                <span className="text-[10px] md:text-xs font-black text-[#EA580C] uppercase tracking-wider flex items-center gap-1 font-display whitespace-nowrap">
                  <Award size={12} className="shrink-0" />
                  <span>Best Route</span>
                </span>
                <span className="text-[8px] md:text-[9px] font-extrabold bg-orange-100 text-[#EA580C] px-1.5 py-0.5 rounded-full shrink-0">
                  Top Pick
                </span>
              </div>
              <div className="mt-2 space-y-0.5">
                <div className="text-xs font-extrabold text-[#1A1A1A] font-display">
                  {plannerData.routes.best.totalDurationStr}
                </div>
                <div className="text-sm font-black text-[#EA580C] font-display">
                  ₹{plannerData.routes.best.totalCostMin.toLocaleString()}
                </div>
              </div>
            </button>

            {/* Fastest Route Button */}
            <button
              type="button"
              onClick={() => setActiveTabFilter(activeTabFilter === 'fastest' ? 'all' : 'fastest')}
              className={`p-2.5 md:p-3.5 rounded-2xl border transition-all text-left cursor-pointer flex flex-col justify-between ${
                activeTabFilter === 'fastest'
                  ? 'bg-purple-50/90 border-purple-500 text-purple-900 shadow-xs ring-2 ring-purple-500/20'
                  : 'bg-white border-[#E8E0D8] text-[#6B6B6B] hover:border-purple-300'
              }`}
            >
              <div className="flex items-center justify-between gap-1 w-full">
                <span className="text-[10px] md:text-xs font-black text-purple-700 uppercase tracking-wider flex items-center gap-1 font-display whitespace-nowrap">
                  <Zap size={12} className="shrink-0" />
                  <span>Fastest</span>
                </span>
                <span className="text-[8px] md:text-[9px] font-extrabold bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full shrink-0">
                  Fast
                </span>
              </div>
              <div className="mt-2 space-y-0.5">
                <div className="text-xs font-extrabold text-[#1A1A1A] font-display">
                  {plannerData.routes.fastest.totalDurationStr}
                </div>
                <div className="text-sm font-black text-purple-800 font-display">
                  ₹{plannerData.routes.fastest.totalCostMin.toLocaleString()}
                </div>
              </div>
            </button>

            {/* Cheapest Route Button */}
            <button
              type="button"
              onClick={() => setActiveTabFilter(activeTabFilter === 'cheapest' ? 'all' : 'cheapest')}
              className={`p-2.5 md:p-3.5 rounded-2xl border transition-all text-left cursor-pointer flex flex-col justify-between ${
                activeTabFilter === 'cheapest'
                  ? 'bg-emerald-50/90 border-emerald-500 text-emerald-900 shadow-xs ring-2 ring-emerald-500/20'
                  : 'bg-white border-[#E8E0D8] text-[#6B6B6B] hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between gap-1 w-full">
                <span className="text-[10px] md:text-xs font-black text-emerald-700 uppercase tracking-wider flex items-center gap-1 font-display whitespace-nowrap">
                  <PiggyBank size={12} className="shrink-0" />
                  <span>Cheapest</span>
                </span>
                <span className="text-[8px] md:text-[9px] font-extrabold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full shrink-0">
                  Low Price
                </span>
              </div>
              <div className="mt-2 space-y-0.5">
                <div className="text-xs font-extrabold text-[#1A1A1A] font-display">
                  {plannerData.routes.cheapest.totalDurationStr}
                </div>
                <div className="text-sm font-black text-emerald-800 font-display">
                  ₹{plannerData.routes.cheapest.totalCostMin.toLocaleString()}
                </div>
              </div>
            </button>

          </div>

          {/* Route Cards List */}
          <div className="space-y-6">
            {routesToDisplay.map((route) => {
              const badgeHeaderBg =
                route.type === 'best'
                  ? 'bg-orange-50 text-[#EA580C] border-orange-200'
                  : route.type === 'fastest'
                  ? 'bg-purple-50 text-purple-800 border-purple-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'

              const cardOuterBorder =
                route.type === 'best'
                  ? 'border-orange-200'
                  : route.type === 'fastest'
                  ? 'border-purple-200'
                  : 'border-emerald-200'

              return (
                <div
                  key={route.id}
                  className={`bg-white border ${cardOuterBorder} rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 space-y-0`}
                >
                  
                  {/* Card Header: Route Badge & Overview Row */}
                  <div className="p-5 border-b border-[#E8E0D8] space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-3 py-1 rounded-lg border text-xs font-black uppercase tracking-wider ${badgeHeaderBg}`}>
                          {route.type === 'best' && <span className="inline-flex items-center gap-1"><Award size={13} /><span>BEST ROUTE</span></span>}
                          {route.type === 'fastest' && <span className="inline-flex items-center gap-1"><Zap size={13} /><span>FASTEST ROUTE</span></span>}
                          {route.type === 'cheapest' && <span className="inline-flex items-center gap-1"><IndianRupee size={13} /><span>CHEAPEST ROUTE</span></span>}
                        </span>

                        {route.comparisonLabel && (
                          <span className="bg-orange-50 border border-orange-200 text-[#EA580C] text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg">
                            {route.comparisonLabel}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <SageScoreRing item={route} allItems={routesToDisplay} size={38} />
                        <span className="text-xs font-extrabold text-[#EA580C] bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200">
                          redBus Live Rates
                        </span>
                      </div>
                    </div>

                    {/* Top Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-[#E8E0D8] text-[#1A1A1A]">
                      <div>
                        <div className="text-[10px] font-bold text-[#9CA3AF] uppercase">Total Duration</div>
                        <div className="text-base font-black text-[#1A1A1A] flex items-center gap-1 mt-0.5">
                          <Clock size={14} className="text-[#EA580C]" />
                          <span>{route.totalDurationStr}</span>
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] font-bold text-[#9CA3AF] uppercase">Transfers</div>
                        <div className="text-base font-black text-[#1A1A1A] mt-0.5">
                          {route.changesCount === 0 ? 'Direct Bus' : `${route.changesCount} Transfer`}
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] font-bold text-[#9CA3AF] uppercase">Est. Bus Fare</div>
                        <div className="text-base font-black text-[#1A1A1A] mt-0.5">
                          ₹{route.totalCostMin.toLocaleString()} – ₹{route.totalCostMax.toLocaleString()}
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] font-bold text-[#9CA3AF] uppercase">AI Confidence</div>
                        <div className="text-base font-black text-emerald-600 mt-0.5">
                          {route.aiConfidenceScore}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Multi-Leg Journey Breakdown */}
                  <div className="p-5 space-y-4 bg-[#FFFBF7]/60">
                    {route.legs.map((leg) => (
                      <div key={leg.id} className="bg-white border border-[#E8E0D8] rounded-2xl p-4 shadow-xs space-y-3">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#E8E0D8] pb-2.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 text-[#EA580C] flex items-center justify-center shrink-0">
                              <Bus size={16} />
                            </div>
                            <div>
                              <div className="text-sm font-black text-[#1A1A1A] flex items-center gap-2">
                                <span>{leg.departureTime}</span>
                                <span className="text-[#EA580C] font-bold">{leg.fromCity}</span>
                                <span className="text-[#9CA3AF]">→</span>
                                <span>{leg.toCity}</span>
                              </div>
                              <div className="text-xs text-[#6B6B6B] font-medium mt-0.5 flex items-center gap-2">
                                <span>{leg.operatorName}</span>
                                {leg.rating && (
                                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded text-[10px] font-bold inline-flex items-center gap-1">
                                    <Star size={11} className="fill-emerald-600 text-emerald-600" />
                                    <span>{leg.rating}/5</span>
                                  </span>
                                )}
                                <span>•</span>
                                <span>{leg.busType}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleOpenBookingModal(route)}
                              className="px-3.5 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-extrabold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <span>Book on redBus</span>
                              <ExternalLink size={13} />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-[#6B6B6B]">
                          <div>
                            <span className="text-[10px] text-[#9CA3AF] font-bold block uppercase">Duration</span>
                            <span className="font-bold text-[#1A1A1A]">{leg.durationStr} (~{leg.distanceKm} km)</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#9CA3AF] font-bold block uppercase">Bus Type</span>
                            <span className="font-bold text-[#1A1A1A]">{leg.busType}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#9CA3AF] font-bold block uppercase">Est. Fare</span>
                            <span className="font-bold text-[#EA580C]">
                              ₹{leg.fares?.sleeper?.min || leg.fares?.seater?.min || 600} – ₹{leg.fares?.sleeper?.max || leg.fares?.seater?.max || 1400}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#9CA3AF] font-bold block uppercase">Confirmation</span>
                            <span className="font-bold text-emerald-600">Instant</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Card Bottom Bar */}
                  <div className="p-4 bg-[#FFFBF7] border-t border-[#E8E0D8] flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-bold text-[#6B6B6B]">
                    <div className="flex items-center gap-4">
                      <span className="inline-flex items-center gap-1">
                        <span>Comfort:</span>
                        <strong className="text-[#1A1A1A] mr-1">{route.metrics.comfort}</strong>
                        <span className="inline-flex text-amber-500"><Star size={12} className="fill-amber-400" /><Star size={12} className="fill-amber-400" /><Star size={12} className="fill-amber-400" /><Star size={12} className="fill-amber-400" /><Star size={12} className="fill-amber-400" /></span>
                      </span>
                      <span>•</span>
                      <span>Reliability: <strong className="text-[#1A1A1A]">{route.metrics.reliability}</strong></span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenBookingModal(route)}
                      className="px-5 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>View Details & Book on redBus</span>
                    </button>
                  </div>

                </div>
              )
          })}

          {/* ── SHOW MORE / COLLAPSE BUTTON ── */}
          {activeTabFilter === 'all' && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setShowAllRoutes(!showAllRoutes)}
                className="px-6 py-3 bg-[#FFFBF7] hover:bg-orange-50 border border-[#E8E0D8] hover:border-orange-200 text-[#1A1A1A] hover:text-[#EA580C] text-xs font-black rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  {showAllRoutes ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  <span>{showAllRoutes ? 'Show Top 3 AI Decision Highlights Only' : 'View All Additional Bus Operators & Routes'}</span>
                </span>
              </button>
            </div>
          )}
        </div>

          {/* Footer Disclaimer */}
          <div className="bg-white border border-[#E8E0D8] rounded-xl p-3.5 text-[#6B6B6B] text-xs flex items-center gap-2 font-medium">
            <Info size={16} className="text-[#9CA3AF] shrink-0" />
            <span>Prices and seat availability are estimated and live on redBus. Check actual seat map at the time of booking.</span>
          </div>

        </div>

      {/* Slide-Out Bus Search & Filter Drawer Modal */}
      {isBusDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-fade-in">
          <div className="bg-white w-full max-w-md h-full p-6 overflow-y-auto space-y-6 shadow-2xl flex flex-col justify-between">
            
            {/* Header */}
            <div className="space-y-4 border-b border-[#E8E0D8] pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bus size={18} className="text-[#EA580C]" />
                  <h3 className="font-black text-lg text-[#1A1A1A] font-display">Search & Filter Buses</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBusDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#FFFBF7] border border-[#E8E0D8] text-[#6B6B6B] hover:text-[#1A1A1A] flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="text-xs text-[#6B6B6B] font-medium">
                Update origin, destination, travel date, passenger count, and bus type preferences.
              </p>
            </div>

            {/* Form Controls */}
            <div className="space-y-5 flex-1 overflow-y-auto pr-1">
              
              {/* From City */}
              <div className="relative">
                <label className="block text-xs font-extrabold text-[#1A1A1A] uppercase tracking-wider mb-1">
                  From Boarding Location
                </label>
                <input
                  type="text"
                  value={fromCity}
                  onChange={(e) => setFromCity(e.target.value)}
                  placeholder="Origin City / Boarding Point"
                  className="w-full bg-[#FFFBF7] border border-[#E8E0D8] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
                />
                <button
                  type="button"
                  onClick={handleSwapLocations}
                  className="absolute right-3 top-[28px] w-7 h-7 rounded-full bg-white border border-[#E8E0D8] shadow-xs flex items-center justify-center text-[#1A1A1A] hover:text-[#EA580C] transition-colors cursor-pointer"
                  title="Swap origin & destination"
                >
                  <ArrowUpDown size={14} />
                </button>
              </div>

              {/* To City */}
              <div>
                <label className="block text-xs font-extrabold text-[#1A1A1A] uppercase tracking-wider mb-1">
                  To Dropoff Location
                </label>
                <input
                  type="text"
                  value={toCity}
                  onChange={(e) => setToCity(e.target.value)}
                  placeholder="Destination City / Drop Point"
                  className="w-full bg-[#FFFBF7] border border-[#E8E0D8] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
                />
              </div>

              {/* Journey Date */}
              <div>
                <label className="block text-xs font-extrabold text-[#1A1A1A] uppercase tracking-wider mb-1">
                  Journey Date
                </label>
                <input
                  type="date"
                  value={journeyDate}
                  onChange={(e) => setJourneyDate(e.target.value)}
                  className="w-full bg-[#FFFBF7] border border-[#E8E0D8] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
                />
              </div>

              {/* Bus Type */}
              <div className="space-y-2 pt-2 border-t border-[#E8E0D8]">
                <label className="block text-xs font-extrabold text-[#1A1A1A] uppercase tracking-wider">
                  Bus Type Preference
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  {[
                    { key: 'ALL', label: 'All Types' },
                    { key: 'SLEEPER', label: 'AC Sleeper' },
                    { key: 'VOLVO', label: 'Volvo Multi-Axle' },
                    { key: 'SEATER', label: 'AC Seater' },
                    { key: 'EV', label: 'Electric Bus' },
                  ].map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setBusType(t.key)}
                      className={`py-2 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                        busType === t.key
                          ? 'bg-orange-50 text-[#EA580C] border-[#EA580C] font-black shadow-2xs'
                          : 'bg-[#FFFBF7] border-[#E8E0D8] text-[#6B6B6B] hover:border-[#EA580C]/40'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-[#E8E0D8]">
              <button
                type="button"
                onClick={() => {
                  handleSearchRoutes()
                  setIsBusDrawerOpen(false)
                }}
                className="w-full py-3 bg-[#EA580C] hover:bg-[#C2410C] text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer font-display"
              >
                Apply & Run Search
              </button>
            </div>

          </div>
        </div>
      )}
      <RedBusBookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        route={selectedRouteForModal}
        dateStr={journeyDate}
        passengers={passengers}
        fromCity={fromCity}
        toCity={toCity}
      />

    </div>
  )
}
