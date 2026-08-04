'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  Train, Bus, Clock, MapPin, ShieldCheck, Sparkles,
  ArrowUpDown, ExternalLink, Compass,
  SlidersHorizontal, Activity, Star, Award, Zap, IndianRupee,
  BarChart2, Plug, UtensilsCrossed, BedDouble, ShowerHead, Car, ChevronUp, ChevronDown, X
} from 'lucide-react'
import { useTripStore } from '@/store/tripStore'
import { analytics } from '@/lib/analytics'
import {
  generateSmartTrainRoutes, SmartTrainPlannerResult, SmartTrainRoute, buildIrctcDeepLink, resolveRealIrctcTrain
} from '@/lib/smartTrainPlanner'
import IrctcBookingModal from './IrctcBookingModal'
import TrainsSkeleton from './TrainsSkeleton'
import { SageScoreRing } from '@/components/ui/SageScoreBadge'

export default function AiSmartTrainPlanner() {
  const { tripContext, trains, loading: storeLoading } = useTripStore()

  // Form State
  const [fromCity, setFromCity] = useState<string>(tripContext.startLocation || 'Hyderabad (HYB)')
  const [toCity, setToCity] = useState<string>(tripContext.destination || 'Goa (GOA)')
  const [journeyDate, setJourneyDate] = useState<string>(tripContext.startDate || '2026-06-25')
  const [passengers, setPassengers] = useState<number>(2)
  const [selectedClass, setSelectedClass] = useState<string>('SL') // 'SL', '3A', '2A', '1A', 'ALL'
  const [quota, setQuota] = useState<string>('GN')
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'best' | 'fastest' | 'cheapest' | 'comfortable'>('all')
  const [showAllRoutes, setShowAllRoutes] = useState<boolean>(false)

  // Modal & Search State
  const [selectedRouteForModal, setSelectedRouteForModal] = useState<SmartTrainRoute | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [isTrainDrawerOpen, setIsTrainDrawerOpen] = useState(false)
  const [expandedRoutes, setExpandedRoutes] = useState<Record<string, boolean>>({})

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

  // Generate AI Smart Routes
  const plannerData: SmartTrainPlannerResult = useMemo(() => {
    return generateSmartTrainRoutes({
      origin: fromCity,
      destination: toCity,
      date: journeyDate,
      passengers,
      travelClass: selectedClass,
      rawTrains: trains,
    })
  }, [fromCity, toCity, journeyDate, passengers, selectedClass, trains])

  const handleSearchRoutes = () => {
    setIsSearching(true)
    analytics.trainSearch({
      origin: fromCity,
      destination: toCity,
      date: journeyDate,
      passengers,
    })
    setTimeout(() => {
      setIsSearching(false)
    }, 400)
  }

  const handleOpenBookingModal = (route: SmartTrainRoute) => {
    setSelectedRouteForModal(route)
    setIsModalOpen(true)
  }

  // Filter routes based on top tabs & show top 3 highlights by default
  const routesToDisplay = useMemo(() => {
    if (activeTabFilter === 'best') return [plannerData.routes.best]
    if (activeTabFilter === 'fastest') return [plannerData.routes.fastest]
    if (activeTabFilter === 'cheapest') return [plannerData.routes.cheapest]
    if (activeTabFilter === 'comfortable') return [plannerData.routes.comfortable]
    
    // Default view: Show Top 3 AI Decision Highlights unless user clicks Expand
    if (!showAllRoutes) {
      return [
        plannerData.routes.best,
        plannerData.routes.fastest,
        plannerData.routes.cheapest,
      ].filter(Boolean)
    }

    return [
      plannerData.routes.best,
      plannerData.routes.fastest,
      plannerData.routes.cheapest,
      plannerData.routes.comfortable,
    ].filter(Boolean)
  }, [plannerData, activeTabFilter, showAllRoutes])

  if (storeLoading || isSearching) {
    return <TrainsSkeleton />
  }

  if (plannerData.isDomestic === false) {
    return (
      <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
        <div className="glass rounded-2xl border border-[#E8E0D8] p-8 text-center bg-white shadow-xs flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
            <Train size={32} />
          </div>
          <div className="space-y-2">
            <h4 className="text-xl font-black text-[#1A1A1A] font-display">International Train Services Not Available</h4>
            <p className="text-sm text-[#6B6B6B] leading-relaxed max-w-md mx-auto font-medium">
              International train services are not available for this route.
            </p>
            <p className="text-xs text-[#9CA3AF] max-w-md mx-auto">
              Train travel is only available for domestic routes within the same country. Please check flight options for your international trip.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full text-[#1A1A1A] animate-fade-in">
      
      {/* ── Top Header Banner (TripSage Luxury Theme) ── */}
      <div className="bg-white border border-[#E8E0D8] rounded-3xl p-6 md:p-7 shadow-xs space-y-5 relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-100/30 rounded-full blur-3xl pointer-events-none" />

        {/* Title Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-orange-50 text-[#EA580C] border border-orange-200 text-xs font-black px-3 py-1 rounded-xl uppercase tracking-wider shadow-2xs">
                AI Smart Train Journey Planner
              </span>
              <span className="text-xs text-[#6B6B6B] font-extrabold flex items-center gap-1">
                <Clock size={12} className="text-[#EA580C]" />
                <span>{journeyDate} • {passengers} Passenger{passengers > 1 ? 's' : ''}</span>
              </span>
            </div>

            <h2 className="text-2xl md:text-4xl font-black text-[#1A1A1A] leading-tight flex items-center gap-3 font-display">
              <span>{plannerData.origin.name}</span>
              <span className="text-[#EA580C] font-mono">➔</span>
              <span>{plannerData.destination.name}</span>
            </h2>
          </div>

          {/* AI Powered Badge */}
          <div className="flex items-center gap-2.5 px-4 py-2.5 bg-orange-50/90 border border-orange-200 rounded-2xl text-[#EA580C] font-black text-xs shrink-0 shadow-2xs">
            <Sparkles size={16} className="animate-pulse text-[#EA580C]" />
            <span>AI IRCTC Pipeline</span>
          </div>
        </div>

        {/* Quick Selection Cards Grid (Mobile-Optimized Clean Cards - No Truncation) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          {/* Best Route Card */}
          <button
            type="button"
            onClick={() => setActiveTabFilter(activeTabFilter === 'best' ? 'all' : 'best')}
            className={`p-2.5 md:p-4 rounded-2xl border transition-all text-left cursor-pointer flex flex-col justify-between ${
              activeTabFilter === 'best' || activeTabFilter === 'all'
                ? 'bg-orange-50/90 border-[#EA580C] text-[#EA580C] shadow-xs ring-2 ring-[#EA580C]/20'
                : 'bg-white border-[#E8E0D8] text-[#6B6B6B] hover:border-[#EA580C]/40'
            }`}
          >
            <div className="flex items-center justify-between gap-1 w-full">
              <span className="text-[10px] md:text-xs font-black text-[#EA580C] uppercase tracking-wider inline-flex items-center gap-1 font-display whitespace-nowrap">
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

          {/* Fastest Route Card */}
          <button
            type="button"
            onClick={() => setActiveTabFilter(activeTabFilter === 'fastest' ? 'all' : 'fastest')}
            className={`p-2.5 md:p-4 rounded-2xl border transition-all text-left cursor-pointer flex flex-col justify-between ${
              activeTabFilter === 'fastest'
                ? 'bg-purple-50/90 border-purple-500 text-purple-900 shadow-xs ring-2 ring-purple-500/20'
                : 'bg-white border-[#E8E0D8] text-[#6B6B6B] hover:border-purple-300'
            }`}
          >
            <div className="flex items-center justify-between gap-1 w-full">
              <span className="text-[10px] md:text-xs font-black text-purple-700 uppercase tracking-wider inline-flex items-center gap-1 font-display whitespace-nowrap">
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

          {/* Cheapest Route Card */}
          <button
            type="button"
            onClick={() => setActiveTabFilter(activeTabFilter === 'cheapest' ? 'all' : 'cheapest')}
            className={`p-2.5 md:p-4 rounded-2xl border transition-all text-left cursor-pointer flex flex-col justify-between ${
              activeTabFilter === 'cheapest'
                ? 'bg-emerald-50/90 border-emerald-500 text-emerald-900 shadow-xs ring-2 ring-emerald-500/20'
                : 'bg-white border-[#E8E0D8] text-[#6B6B6B] hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center justify-between gap-1 w-full">
              <span className="text-[10px] md:text-xs font-black text-emerald-700 uppercase tracking-wider inline-flex items-center gap-1 font-display whitespace-nowrap">
                <IndianRupee size={12} className="shrink-0" />
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

          {/* Most Comfortable Route Card */}
          <button
            type="button"
            onClick={() => setActiveTabFilter(activeTabFilter === 'comfortable' ? 'all' : 'comfortable')}
            className={`p-2.5 md:p-4 rounded-2xl border transition-all text-left cursor-pointer flex flex-col justify-between ${
              activeTabFilter === 'comfortable'
                ? 'bg-blue-50/90 border-blue-500 text-blue-900 shadow-xs ring-2 ring-blue-500/20'
                : 'bg-white border-[#E8E0D8] text-[#6B6B6B] hover:border-blue-300'
            }`}
          >
            <div className="flex items-center justify-between gap-1 w-full">
              <span className="text-[10px] md:text-xs font-black text-blue-700 uppercase tracking-wider inline-flex items-center gap-1 font-display whitespace-nowrap">
                <Star size={12} className="shrink-0" />
                <span>Comfort</span>
              </span>
              <span className="text-[8px] md:text-[9px] font-extrabold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full shrink-0">
                Premium
              </span>
            </div>
            <div className="mt-2 space-y-0.5">
              <div className="text-xs font-extrabold text-[#1A1A1A] font-display">
                {plannerData.routes.comfortable.totalDurationStr}
              </div>
              <div className="text-sm font-black text-blue-800 font-display">
                ₹{plannerData.routes.comfortable.totalCostMin.toLocaleString()}
              </div>
            </div>
          </button>
        </div>

        {/* AI Analysis Pipeline Alert Banner */}
        <div className="bg-[#FFFBF7] border border-orange-200/80 rounded-2xl p-4 flex items-center gap-3 text-xs text-[#1A1A1A] font-medium relative z-10 shadow-inner">
          <div className="w-7 h-7 rounded-xl bg-[#EA580C] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs font-display">
            AI
          </div>
          <div>
            <strong className="font-extrabold text-[#EA580C] font-display">AI Analysis Pipeline: </strong>
            <span className="text-[#6B6B6B] font-semibold">{plannerData.aiAnalysisText}</span>
          </div>
        </div>

      </div>

      {/* ── 3. TOP QUICK-FILTER TOOLBAR & FILTER BUTTON ── */}
      <div className="bg-white border border-[#E8E0D8] rounded-2xl p-3 shadow-xs flex items-center justify-between gap-3 text-xs font-bold text-[#6B6B6B]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsTrainDrawerOpen(true)}
            className="px-3.5 py-1.5 bg-[#FFFBF7] hover:bg-orange-50 text-[#1A1A1A] hover:text-[#EA580C] border border-[#E8E0D8] hover:border-orange-200 font-extrabold rounded-xl text-xs shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer font-display"
          >
            <SlidersHorizontal size={13} className="text-[#EA580C]" />
            <span>Search & Class Filters</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-[#6B6B6B] font-semibold">
            Showing <strong className="text-[#1A1A1A] font-black">{routesToDisplay.length}</strong> IRCTC Train Connection Routes
          </span>
        </div>
      </div>

      {/* ── 4. FULL-WIDTH TRAIN JOURNEY TIMELINES (100% Widescreen Grid) ── */}
      <div className="w-full space-y-6">
          {routesToDisplay.map((route, routeIdx) => {
            const badgeHeaderBg =
              route.type === 'best'
                ? 'bg-orange-50 text-[#EA580C] border-orange-200'
                : route.type === 'fastest'
                ? 'bg-purple-50 text-purple-800 border-purple-200'
                : route.type === 'cheapest'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-blue-50 text-blue-800 border-blue-200'

            const cardOuterBorder =
              route.type === 'best'
                ? 'border-orange-200'
                : route.type === 'fastest'
                ? 'border-purple-200'
                : route.type === 'cheapest'
                ? 'border-emerald-200'
                : 'border-blue-200'

            const isExpanded = expandedRoutes[route.id] || false

            return (
              <div
                key={`${route.id}-${route.type || routeIdx}`}
                className={`bg-white border ${cardOuterBorder} hover:border-[#EA580C] rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 relative group`}
              >
                {/* ── 1. COMPACT TRAIN CARD HEADER (Slim Mobile-First View) ── */}
                <div className="p-4 space-y-3">
                  {/* Top Meta Row */}
                  <div className="flex items-center justify-between gap-2 text-xs font-bold">
                    <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                      <span className={`px-2.5 py-0.5 rounded-lg border text-[10px] font-black uppercase tracking-wider font-display truncate ${badgeHeaderBg}`}>
                        {route.type === 'best' && <span className="inline-flex items-center gap-1"><Award size={12} /><span>BEST AI ROUTE</span></span>}
                        {route.type === 'fastest' && <span className="inline-flex items-center gap-1"><Zap size={12} /><span>FASTEST ROUTE</span></span>}
                        {route.type === 'cheapest' && <span className="inline-flex items-center gap-1"><IndianRupee size={12} /><span>CHEAPEST ROUTE</span></span>}
                        {route.type === 'comfortable' && <span className="inline-flex items-center gap-1"><Star size={12} /><span>MOST COMFORTABLE</span></span>}
                      </span>

                      {route.comparisonLabel && (
                        <span className="bg-orange-50 border border-orange-200 text-[#EA580C] text-[10px] font-extrabold px-2 py-0.5 rounded-md truncate">
                          {route.comparisonLabel}
                        </span>
                      )}
                    </div>

                    <div className="shrink-0">
                      <SageScoreRing item={route} allItems={routesToDisplay} size={36} />
                    </div>
                  </div>

                  {/* Main Train Details Row */}
                  {(() => {
                    const mainLeg = route.legs[0]
                    const realTrain = resolveRealIrctcTrain(mainLeg?.trainName, mainLeg?.fromCode, mainLeg?.toCode, mainLeg?.trainNumber)
                    return (
                      <div className="space-y-3 pt-1">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 text-[#EA580C] flex items-center justify-center shrink-0 shadow-2xs">
                            <Train size={18} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-extrabold text-[#1A1A1A] flex items-center gap-2 font-display truncate">
                              <span className="truncate">{realTrain.trainName}</span>
                              <span className="text-[10px] font-black text-[#EA580C] bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200 font-mono shrink-0">
                                #{realTrain.trainNumber}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Mobile & Desktop Responsive Journey Timeline Bar */}
                        <div className="flex items-center justify-between bg-[#FFFBF7] border border-[#E8E0D8] p-2.5 md:p-3.5 rounded-xl text-xs">
                          <div className="text-left shrink-0">
                            <div className="font-black text-base md:text-lg text-[#1A1A1A] font-display leading-none">
                              {route.legs[0]?.departureTime}
                            </div>
                            <div className="font-extrabold text-[10px] text-[#EA580C] uppercase tracking-wider mt-1 truncate max-w-[90px]">
                              {plannerData.origin.name}
                            </div>
                          </div>

                          <div className="flex-1 flex flex-col items-center px-2 min-w-0">
                            <span className="text-[10px] md:text-[11px] font-bold text-[#6B6B6B] mb-0.5 flex items-center gap-1 truncate">
                              <Clock size={11} className="text-[#EA580C] shrink-0" />
                              <span>{route.totalDurationStr}</span>
                              <span>•</span>
                              <span className="text-[#EA580C] font-extrabold">{route.changesCount === 0 ? 'Direct' : `${route.changesCount} Transfer`}</span>
                            </span>
                            <div className="w-full flex items-center justify-center relative">
                              <div className="h-[2px] bg-[#E8E0D8] group-hover:bg-[#EA580C]/40 w-full rounded-full transition-colors" />
                              <div className="absolute right-0 top-1/2 -translate-y-1/2 text-[#EA580C] font-mono text-[9px] bg-white rounded-full px-0.5 border border-[#E8E0D8]">›</div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="font-black text-base md:text-lg text-[#1A1A1A] font-display leading-none">
                              {route.legs[route.legs.length - 1]?.arrivalTime}
                            </div>
                            <div className="font-extrabold text-[10px] text-[#1A1A1A] uppercase tracking-wider mt-1 truncate max-w-[90px]">
                              {plannerData.destination.name}
                            </div>
                          </div>
                        </div>

                        {/* Fare & Action Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                          <div className="flex items-center justify-between sm:justify-start gap-2">
                            <span className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">Est. Fare:</span>
                            <span className="text-base font-black text-[#1A1A1A] font-display">
                              ₹{route.totalCostMin.toLocaleString()} – ₹{route.totalCostMax.toLocaleString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <a
                              href={buildIrctcDeepLink({
                                srcStn: route.legs[0]?.fromCode || 'MAO',
                                destStn: route.legs[route.legs.length - 1]?.toCode || 'SBC',
                                dateStr: journeyDate,
                                journeyClass: selectedClass,
                                quota: quota,
                              })}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 sm:flex-initial justify-center px-4 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-extrabold rounded-xl flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer font-display active:scale-98"
                            >
                              <span>Book IRCTC</span>
                              <ExternalLink size={13} />
                            </a>

                            <button
                              type="button"
                              onClick={() => setExpandedRoutes(prev => ({ ...prev, [route.id]: !prev[route.id] }))}
                              className="px-3.5 py-2.5 bg-[#FFFBF7] hover:bg-orange-50 text-[#1A1A1A] hover:text-[#EA580C] border border-[#E8E0D8] text-xs font-extrabold rounded-xl transition-all flex items-center gap-1 cursor-pointer shrink-0 active:scale-98"
                            >
                              <span>{isExpanded ? 'Hide' : 'Timeline'}</span>
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </div>

                {/* ── 2. EXPANDABLE JOURNEY TIMELINE (Only Visible When Toggled) ── */}
                {isExpanded && (
                  <div className="p-5 space-y-4 bg-[#FFFBF7]/90 border-t border-[#E8E0D8] animate-fade-in relative z-10">
                    
                    {/* Timeline Origin Node */}
                    <div className="flex items-center gap-3 bg-white border border-[#E8E0D8] p-3 rounded-xl shadow-2xs">
                      <div className="w-8 h-8 rounded-lg bg-[#EA580C] text-white font-black text-xs flex items-center justify-center shrink-0 font-display">
                        1
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-black uppercase tracking-wider text-[#EA580C] font-display">Origin Station</div>
                        <div className="text-xs font-black text-[#1A1A1A] font-display truncate">
                          {route.legs[0]?.departureTime} • {plannerData.origin.name} ({route.legs[0]?.fromCode || 'MAO'})
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-[#6B6B6B] bg-[#FFFBF7] px-2.5 py-0.5 rounded-lg border border-[#E8E0D8]">
                        Boarding
                      </span>
                    </div>

                    {/* Segments Breakdown */}
                    {route.legs.map((leg, legIdx) => {
                      const legIrctcUrl = buildIrctcDeepLink({
                        srcStn: leg.fromCode,
                        destStn: leg.toCode,
                        dateStr: journeyDate,
                        journeyClass: selectedClass,
                        quota: quota,
                      })

                      return (
                        <React.Fragment key={leg.id}>
                          <div className="ml-4 border-l-2 border-dashed border-orange-300/90 pl-4 py-2 space-y-3">
                            <div className="bg-white border border-[#E8E0D8] rounded-2xl p-4 shadow-2xs space-y-3">
                              
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8E0D8] pb-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 text-[#EA580C] flex items-center justify-center shrink-0">
                                    <Train size={18} />
                                  </div>
                                  {(() => {
                                    const legRealTrain = resolveRealIrctcTrain(leg.trainName, leg.fromCode, leg.toCode, leg.trainNumber)
                                    return (
                                      <div>
                                        <div className="text-sm font-black text-[#1A1A1A] flex items-center gap-2 font-display">
                                          <span>{legRealTrain.trainName}</span>
                                          <span className="text-[10px] font-black text-[#EA580C] bg-orange-50 px-2 py-0.5 rounded border border-orange-200 font-mono">
                                            #{legRealTrain.trainNumber}
                                          </span>
                                        </div>
                                        <div className="text-xs text-[#6B6B6B] font-extrabold mt-0.5 flex items-center gap-2">
                                          <span>{leg.fromName} ➔ {leg.toName}</span>
                                          <span>•</span>
                                          <span className="text-[#EA580C]">{leg.durationStr} (~{leg.distanceKm} km)</span>
                                        </div>
                                      </div>
                                    )
                                  })()}
                                </div>

                                <a
                                  href={legIrctcUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3.5 py-1.5 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-black rounded-lg flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer shrink-0"
                                >
                                  <span>Book Leg on IRCTC</span>
                                  <ExternalLink size={12} />
                                </a>
                              </div>

                              {/* Class Availability Grid Pills */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                                <div className="bg-emerald-50/90 border border-emerald-200 p-2 rounded-lg text-left">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black text-emerald-800 uppercase font-display">Sleeper (SL)</span>
                                    <span className="text-[8px] font-black bg-emerald-200/80 text-emerald-900 px-1 py-0.2 rounded">AVBL</span>
                                  </div>
                                  <div className="text-xs font-black text-emerald-900 mt-0.5 font-mono">₹550</div>
                                </div>

                                <div className="bg-emerald-50/90 border border-emerald-200 p-2 rounded-lg text-left">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black text-emerald-800 uppercase font-display">AC 3 Tier (3A)</span>
                                    <span className="text-[8px] font-black bg-emerald-200/80 text-emerald-900 px-1 py-0.2 rounded">AVBL</span>
                                  </div>
                                  <div className="text-xs font-black text-emerald-900 mt-0.5 font-mono">₹1,200</div>
                                </div>

                                <div className="bg-amber-50/90 border border-amber-200 p-2 rounded-lg text-left">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black text-amber-800 uppercase font-display">AC 2 Tier (2A)</span>
                                    <span className="text-[8px] font-black bg-amber-200/80 text-amber-900 px-1 py-0.2 rounded">WL 12</span>
                                  </div>
                                  <div className="text-xs font-black text-amber-900 mt-0.5 font-mono">₹1,750</div>
                                </div>

                                <div className="bg-[#FFFBF7] border border-[#E8E0D8] p-2 rounded-lg text-left">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black text-[#6B6B6B] uppercase font-display">1st Class (1A)</span>
                                    <span className="text-[8px] font-black bg-slate-100 text-slate-600 px-1 py-0.2 rounded">REG</span>
                                  </div>
                                  <div className="text-xs font-black text-[#1A1A1A] mt-0.5 font-mono">₹2,450</div>
                                </div>
                              </div>

                              {/* Onboard Amenities Micro Chips */}
                              <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-extrabold text-[#6B6B6B] pt-2 border-t border-[#E8E0D8]/60">
                                <span className="bg-[#FFFBF7] border border-[#E8E0D8] px-2 py-0.5 rounded-md flex items-center gap-1">
                                  <Plug size={11} className="text-[#EA580C]" /> Charging
                                </span>
                                <span className="bg-[#FFFBF7] border border-[#E8E0D8] px-2 py-0.5 rounded-md flex items-center gap-1">
                                  <UtensilsCrossed size={11} className="text-[#EA580C]" /> Pantry
                                </span>
                                <span className="bg-[#FFFBF7] border border-[#E8E0D8] px-2 py-0.5 rounded-md flex items-center gap-1">
                                  <BedDouble size={11} className="text-[#EA580C]" /> Linen
                                </span>
                              </div>

                            </div>
                          </div>
                        </React.Fragment>
                      )
                    })}

                    {/* Destination Arrival Node */}
                    <div className="flex items-center gap-3 bg-white border border-[#E8E0D8] p-3 rounded-xl shadow-2xs">
                      <div className="w-8 h-8 rounded-lg bg-[#EA580C] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                        <MapPin size={15} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-black uppercase tracking-wider text-[#EA580C] font-display">Destination Arrival</div>
                        <div className="text-xs font-black text-[#1A1A1A] font-display truncate">
                          {route.legs[route.legs.length - 1]?.arrivalTime} • {plannerData.destination.name} ({route.legs[route.legs.length - 1]?.toCode || 'SBC'})
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                        Arrived
                      </span>
                    </div>

                  </div>
                )}

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
                  <span>{showAllRoutes ? 'Show Top 3 AI Decision Highlights Only' : 'View All Additional Train Options & Schedules'}</span>
                </span>
              </button>
            </div>
          )}
        </div>

      {/* Slide-Out Train Search & Filter Drawer Modal */}
      {isTrainDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-fade-in">
          <div className="bg-white w-full max-w-md h-full p-6 overflow-y-auto space-y-6 shadow-2xl flex flex-col justify-between">
            
            {/* Header */}
            <div className="space-y-4 border-b border-[#E8E0D8] pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Train size={18} className="text-[#EA580C]" />
                  <h3 className="font-black text-lg text-[#1A1A1A] font-display">Plan & Filter Trains</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTrainDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#FFFBF7] border border-[#E8E0D8] text-[#6B6B6B] hover:text-[#1A1A1A] flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="text-xs text-[#6B6B6B] font-medium">
                Update origin, destination, travel date, seating class, and booking quota.
              </p>
            </div>

            {/* Form Controls */}
            <div className="space-y-5 flex-1 overflow-y-auto pr-1">
              
              {/* From Station */}
              <div className="relative">
                <label className="block text-xs font-extrabold text-[#1A1A1A] uppercase tracking-wider mb-1">
                  From Origin Station
                </label>
                <input
                  type="text"
                  value={fromCity}
                  onChange={(e) => setFromCity(e.target.value)}
                  placeholder="Origin City / Station Code"
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

              {/* To Station */}
              <div>
                <label className="block text-xs font-extrabold text-[#1A1A1A] uppercase tracking-wider mb-1">
                  To Destination Station
                </label>
                <input
                  type="text"
                  value={toCity}
                  onChange={(e) => setToCity(e.target.value)}
                  placeholder="Destination City / Station Code"
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

              {/* Seating Class */}
              <div className="space-y-2 pt-2 border-t border-[#E8E0D8]">
                <label className="block text-xs font-extrabold text-[#1A1A1A] uppercase tracking-wider">
                  Seating Class
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  {[
                    { key: 'SL', label: 'Sleeper (SL)' },
                    { key: '3A', label: 'AC 3 Tier (3A)' },
                    { key: '2A', label: 'AC 2 Tier (2A)' },
                    { key: '1A', label: 'AC 1st Class (1A)' },
                  ].map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => setSelectedClass(c.key)}
                      className={`py-2 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                        selectedClass === c.key
                          ? 'bg-orange-50 text-[#EA580C] border-[#EA580C] font-black shadow-2xs'
                          : 'bg-[#FFFBF7] border-[#E8E0D8] text-[#6B6B6B] hover:border-[#EA580C]/40'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quota */}
              <div className="space-y-2 pt-2 border-t border-[#E8E0D8]">
                <label className="block text-xs font-extrabold text-[#1A1A1A] uppercase tracking-wider">
                  Booking Quota
                </label>
                <select
                  value={quota}
                  onChange={(e) => setQuota(e.target.value)}
                  className="w-full bg-[#FFFBF7] border border-[#E8E0D8] rounded-xl px-3 py-2.5 text-xs font-bold text-[#1A1A1A]"
                >
                  <option value="GN">General Quota (GN)</option>
                  <option value="TQ">Tatkal Quota (TQ)</option>
                  <option value="PT">Premium Tatkal (PT)</option>
                  <option value="LD">Ladies Quota (LD)</option>
                </select>
              </div>

            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-[#E8E0D8]">
              <button
                type="button"
                onClick={() => {
                  handleSearchRoutes()
                  setIsTrainDrawerOpen(false)
                }}
                className="w-full py-3 bg-[#EA580C] hover:bg-[#C2410C] text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer font-display"
              >
                Apply & Run Search
              </button>
            </div>

          </div>
        </div>
      )}
      <IrctcBookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        route={selectedRouteForModal}
        dateStr={journeyDate}
        passengers={passengers}
        selectedClass={selectedClass}
      />

    </div>
  )
}
