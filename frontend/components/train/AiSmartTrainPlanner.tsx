'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  Train, Bus, Clock, MapPin, ShieldCheck, Sparkles,
  ArrowUpDown, ExternalLink, Compass,
  SlidersHorizontal, Activity, Star
} from 'lucide-react'
import { useTripStore } from '@/store/tripStore'
import { analytics } from '@/lib/analytics'
import {
  generateSmartTrainRoutes, SmartTrainPlannerResult, SmartTrainRoute, buildIrctcDeepLink
} from '@/lib/smartTrainPlanner'
import IrctcBookingModal from './IrctcBookingModal'
import TrainsSkeleton from './TrainsSkeleton'

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

  // Modal & Search State
  const [selectedRouteForModal, setSelectedRouteForModal] = useState<SmartTrainRoute | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
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
    }, 1100)
  }

  const handleOpenBookingModal = (route: SmartTrainRoute) => {
    setSelectedRouteForModal(route)
    setIsModalOpen(true)
  }

  // Filter routes based on top tabs
  const routesToDisplay = useMemo(() => {
    if (activeTabFilter === 'best') return [plannerData.routes.best]
    if (activeTabFilter === 'fastest') return [plannerData.routes.fastest]
    if (activeTabFilter === 'cheapest') return [plannerData.routes.cheapest]
    if (activeTabFilter === 'comfortable') return [plannerData.routes.comfortable]
    return [
      plannerData.routes.best,
      plannerData.routes.fastest,
      plannerData.routes.cheapest,
      plannerData.routes.comfortable,
    ]
  }, [plannerData, activeTabFilter])

  if (storeLoading || isSearching) {
    return <TrainsSkeleton />
  }

  if (plannerData.isDomestic === false) {
    return (
      <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
        <div className="glass rounded-2xl border border-slate-200/60 p-8 text-center bg-white dark:bg-slate-900 shadow-sm flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
            <Train size={32} />
          </div>
          <div className="space-y-2">
            <h4 className="text-xl font-black text-slate-800 dark:text-white">International Train Services Not Available</h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto font-medium">
              International train services are not available for this route.
            </p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Train travel is only available for domestic routes within the same country. Please check flight options for your international trip.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full text-[#1A1A1A] animate-fade-in">
      
      {/* ── Top Header Banner (TripSage Warm Light Theme) ── */}
      <div className="bg-white border border-[#E8E0D8] rounded-2xl p-5 shadow-xs space-y-4">
        
        {/* Title Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-teal-50 text-[#0D9488] border border-teal-200 text-xs font-black px-2.5 py-0.5 rounded-md uppercase tracking-wide">
                AI Smart Train Journey Planner
              </span>
              <span className="text-xs text-[#6B6B6B] font-semibold">
                {journeyDate} • {passengers} Passenger{passengers > 1 ? 's' : ''}
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-[#1A1A1A] leading-tight flex items-center gap-2 font-display">
              <span>{plannerData.origin.name}</span>
              <span className="text-[#0D9488]">→</span>
              <span>{plannerData.destination.name}</span>
            </h2>
          </div>

          {/* AI Powered Badge */}
          <div className="flex items-center gap-2 px-3.5 py-2 bg-teal-50/80 border border-teal-200/80 rounded-xl text-[#0D9488] font-extrabold text-xs shrink-0 shadow-2xs">
            <Sparkles size={15} className="animate-pulse text-[#0D9488]" />
            <span>AI Network Analysis Pipeline</span>
          </div>
        </div>

        {/* ── Top 4 Recommendation Header Cards (Best, Fastest, Cheapest, Comfortable) ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          
          {/* Best Route Card */}
          <button
            type="button"
            onClick={() => setActiveTabFilter(activeTabFilter === 'best' ? 'all' : 'best')}
            className={`p-3.5 rounded-2xl border transition-all text-left cursor-pointer ${
              activeTabFilter === 'best' || activeTabFilter === 'all'
                ? 'bg-teal-50/90 border-[#0D9488] text-[#0D9488] shadow-xs ring-2 ring-[#0D9488]/20'
                : 'bg-[#FFFBF7] border-[#E8E0D8] text-[#6B6B6B] hover:border-[#0D9488]/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-[#0D9488] uppercase tracking-wider">
                🥇 Best Route
              </span>
              <span className="text-[9px] font-extrabold bg-teal-100 text-[#0D9488] px-1.5 py-0.5 rounded-full">
                Recommended
              </span>
            </div>
            <div className="text-xs font-black mt-2 text-[#1A1A1A]">
              {plannerData.routes.best.totalDurationStr} • ₹{plannerData.routes.best.totalCostMin.toLocaleString()}
            </div>
          </button>

          {/* Fastest Route Card */}
          <button
            type="button"
            onClick={() => setActiveTabFilter(activeTabFilter === 'fastest' ? 'all' : 'fastest')}
            className={`p-3.5 rounded-2xl border transition-all text-left cursor-pointer ${
              activeTabFilter === 'fastest'
                ? 'bg-amber-50/90 border-amber-500 text-amber-900 shadow-xs ring-2 ring-amber-500/20'
                : 'bg-[#FFFBF7] border-[#E8E0D8] text-[#6B6B6B] hover:border-amber-400/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-amber-700 uppercase tracking-wider">
                ⚡ Fastest Route
              </span>
            </div>
            <div className="text-xs font-black mt-2 text-[#1A1A1A]">
              {plannerData.routes.fastest.totalDurationStr} • ₹{plannerData.routes.fastest.totalCostMin.toLocaleString()}
            </div>
          </button>

          {/* Cheapest Route Card */}
          <button
            type="button"
            onClick={() => setActiveTabFilter(activeTabFilter === 'cheapest' ? 'all' : 'cheapest')}
            className={`p-3.5 rounded-2xl border transition-all text-left cursor-pointer ${
              activeTabFilter === 'cheapest'
                ? 'bg-emerald-50/90 border-emerald-500 text-emerald-900 shadow-xs ring-2 ring-emerald-500/20'
                : 'bg-[#FFFBF7] border-[#E8E0D8] text-[#6B6B6B] hover:border-emerald-400/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-emerald-700 uppercase tracking-wider">
                💰 Cheapest Route
              </span>
            </div>
            <div className="text-xs font-black mt-2 text-[#1A1A1A]">
              {plannerData.routes.cheapest.totalDurationStr} • ₹{plannerData.routes.cheapest.totalCostMin.toLocaleString()}
            </div>
          </button>

          {/* Most Comfortable Route Card */}
          <button
            type="button"
            onClick={() => setActiveTabFilter(activeTabFilter === 'comfortable' ? 'all' : 'comfortable')}
            className={`p-3.5 rounded-2xl border transition-all text-left cursor-pointer ${
              activeTabFilter === 'comfortable'
                ? 'bg-blue-50/90 border-blue-500 text-blue-900 shadow-xs ring-2 ring-blue-500/20'
                : 'bg-[#FFFBF7] border-[#E8E0D8] text-[#6B6B6B] hover:border-blue-400/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-blue-700 uppercase tracking-wider flex items-center gap-0.5">
                ⭐ Comfortable
              </span>
            </div>
            <div className="text-xs font-black mt-2 text-[#1A1A1A]">
              {plannerData.routes.comfortable.totalDurationStr} • ₹{plannerData.routes.comfortable.totalCostMin.toLocaleString()}
            </div>
          </button>

        </div>

        {/* AI Analysis Pipeline Alert Banner */}
        <div className="bg-[#FFFBF7] border border-teal-200/80 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-[#1A1A1A] font-medium">
          <div className="w-6 h-6 rounded-full bg-[#0D9488] text-white flex items-center justify-center font-black text-[10px] shrink-0">
            AI
          </div>
          <div>
            <strong className="font-extrabold text-[#0D9488]">AI Analysis Pipeline: </strong>
            <span className="text-[#6B6B6B]">{plannerData.aiAnalysisText}</span>
          </div>
        </div>

      </div>

      {/* ── MAIN LAYOUT GRID: Left Form Controls + Right Journey Timelines ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* ── LEFT SIDEBAR: Search Form & Filters ── */}
        <div className="lg:col-span-1 space-y-4">
          
          {/* Plan Your Train Journey Card */}
          <div className="bg-white border border-[#E8E0D8] rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="font-black text-sm text-[#1A1A1A] flex items-center gap-2 font-display">
              <Train className="text-[#0D9488]" size={18} />
              <span>Plan Your Journey</span>
            </h3>

            {/* From Station */}
            <div className="relative">
              <label className="block text-[10px] font-extrabold text-[#6B6B6B] uppercase tracking-wider mb-1">
                From
              </label>
              <input
                type="text"
                value={fromCity}
                onChange={(e) => setFromCity(e.target.value)}
                placeholder="Origin City / Station Code"
                className="w-full bg-[#FFFBF7] border border-[#E8E0D8] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
              />
              <button
                type="button"
                onClick={handleSwapLocations}
                className="absolute right-3 top-[24px] w-7 h-7 rounded-full bg-white border border-[#E8E0D8] shadow-xs flex items-center justify-center text-[#1A1A1A] hover:text-[#0D9488] transition-colors cursor-pointer"
                title="Swap origin & destination"
              >
                <ArrowUpDown size={14} />
              </button>
            </div>

            {/* To Station */}
            <div>
              <label className="block text-[10px] font-extrabold text-[#6B6B6B] uppercase tracking-wider mb-1">
                To
              </label>
              <input
                type="text"
                value={toCity}
                onChange={(e) => setToCity(e.target.value)}
                placeholder="Destination City / Station Code"
                className="w-full bg-[#FFFBF7] border border-[#E8E0D8] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-[10px] font-extrabold text-[#6B6B6B] uppercase tracking-wider mb-1">
                Journey Date
              </label>
              <input
                type="date"
                value={journeyDate}
                onChange={(e) => setJourneyDate(e.target.value)}
                className="w-full bg-[#FFFBF7] border border-[#E8E0D8] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
              />
            </div>

            {/* Passengers & Class */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-extrabold text-[#6B6B6B] uppercase tracking-wider mb-1">
                  Passengers
                </label>
                <select
                  value={passengers}
                  onChange={(e) => setPassengers(Number(e.target.value))}
                  className="w-full bg-[#FFFBF7] border border-[#E8E0D8] rounded-xl px-2.5 py-2 text-xs font-bold text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#0D9488] cursor-pointer"
                >
                  <option value={1}>1 Passenger</option>
                  <option value={2}>2 Adults</option>
                  <option value={3}>3 Adults</option>
                  <option value={4}>4 Adults</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-[#6B6B6B] uppercase tracking-wider mb-1">
                  Class
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full bg-[#FFFBF7] border border-[#E8E0D8] rounded-xl px-2.5 py-2 text-xs font-bold text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#0D9488] cursor-pointer"
                >
                  <option value="SL">Sleeper (SL)</option>
                  <option value="3A">AC 3 Tier (3A)</option>
                  <option value="2A">AC 2 Tier (2A)</option>
                  <option value="1A">AC 1st Class (1A)</option>
                  <option value="ALL">All Classes</option>
                </select>
              </div>
            </div>

            {/* Search Routes CTA Button */}
            <button
              type="button"
              onClick={handleSearchRoutes}
              className="w-full py-3.5 bg-[#0D9488] hover:bg-[#0F766E] text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <Compass size={16} />
              <span>Run AI Journey Pipeline</span>
            </button>

          </div>

          {/* Filters Card */}
          <div className="bg-white border border-[#E8E0D8] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E0D8] pb-2.5">
              <h4 className="font-black text-xs uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5 font-display">
                <SlidersHorizontal size={14} className="text-[#0D9488]" /> Filters
              </h4>
              <button
                type="button"
                onClick={() => {
                  setSelectedClass('SL')
                  setQuota('GN')
                }}
                className="text-[11px] font-bold text-[#0D9488] hover:underline cursor-pointer"
              >
                Reset
              </button>
            </div>

            {/* Train Class Options */}
            <div className="space-y-1.5 text-xs font-bold text-[#6B6B6B]">
              <label className="block text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-1">
                Train Class
              </label>
              {[
                { key: 'SL', label: 'Sleeper (SL)' },
                { key: '3A', label: 'AC 3 Tier (3A)' },
                { key: '2A', label: 'AC 2 Tier (2A)' },
                { key: '1A', label: 'AC 1st Class (1A)' },
              ].map((c) => (
                <label key={c.key} className="flex items-center gap-2 p-1 hover:bg-[#FFFBF7] rounded-lg cursor-pointer">
                  <input
                    type="radio"
                    name="classFilter"
                    checked={selectedClass === c.key}
                    onChange={() => setSelectedClass(c.key)}
                    className="accent-[#0D9488]"
                  />
                  <span className="text-[#1A1A1A]">{c.label}</span>
                </label>
              ))}
            </div>

            {/* Quota Selector */}
            <div className="border-t border-[#E8E0D8] pt-3">
              <label className="block text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-1">
                Quota
              </label>
              <select
                value={quota}
                onChange={(e) => setQuota(e.target.value)}
                className="w-full bg-[#FFFBF7] border border-[#E8E0D8] rounded-xl px-3 py-2 text-xs font-bold text-[#1A1A1A]"
              >
                <option value="GN">General Quota (GN)</option>
                <option value="TQ">Tatkal Quota (TQ)</option>
                <option value="PT">Premium Tatkal (PT)</option>
                <option value="LD">Ladies Quota (LD)</option>
              </select>
            </div>

          </div>

          {/* Why Book With Us Box */}
          <div className="bg-white border border-[#E8E0D8] rounded-2xl p-5 shadow-xs space-y-3">
            <h4 className="font-black text-xs text-[#1A1A1A] uppercase tracking-wider font-display">
              Why Book With Us?
            </h4>
            <div className="space-y-2.5 text-xs text-[#6B6B6B] font-medium">
              <div className="flex items-center gap-2">
                <Sparkles size={15} className="text-[#0D9488] shrink-0" />
                <span>AI finds best multi-leg routes</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={15} className="text-emerald-600 shrink-0" />
                <span>Official IRCTC deep linking</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-blue-500 shrink-0" />
                <span>24/7 Travel & last-mile guidance</span>
              </div>
            </div>
          </div>

        </div>

        {/* ── RIGHT COLUMN: Journey Timelines ── */}
        <div className="lg:col-span-3 space-y-6">
          {routesToDisplay.map((route) => {
            const badgeHeaderBg =
              route.type === 'best'
                ? 'bg-teal-50 text-[#0D9488] border-teal-200'
                : route.type === 'fastest'
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : route.type === 'cheapest'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-blue-50 text-blue-800 border-blue-200'

            const cardOuterBorder =
              route.type === 'best'
                ? 'border-teal-200'
                : route.type === 'fastest'
                ? 'border-amber-200'
                : route.type === 'cheapest'
                ? 'border-emerald-200'
                : 'border-blue-200'

            return (
              <div
                key={route.id}
                className={`bg-white border ${cardOuterBorder} rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 space-y-0`}
              >
                
                {/* ── Card Top Header: Badge, Overview & Scores Bar ── */}
                <div className="p-5 border-b border-[#E8E0D8] space-y-4">
                  
                  {/* Badge & Scores Row */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-3 py-1 rounded-lg border text-xs font-black uppercase tracking-wider ${badgeHeaderBg}`}>
                        {route.type === 'best' && '🥇 BEST ROUTE'}
                        {route.type === 'fastest' && '⚡ FASTEST ROUTE'}
                        {route.type === 'cheapest' && '💰 CHEAPEST ROUTE'}
                        {route.type === 'comfortable' && '⭐ MOST COMFORTABLE'}
                      </span>

                      {route.comparisonLabel && (
                        <span className="bg-teal-50 border border-teal-200 text-[#0D9488] text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg">
                          {route.comparisonLabel}
                        </span>
                      )}
                    </div>

                    {/* AI Score Pills */}
                    <div className="flex items-center gap-2 text-xs font-extrabold">
                      <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <Activity size={13} /> Journey Score: 94/100
                      </span>
                      <span className="bg-blue-50 border border-blue-200 text-blue-800 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <Star size={13} /> Comfort: 4.6/5
                      </span>
                    </div>
                  </div>

                  {/* 5-Column Metrics Row */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2 border-t border-[#E8E0D8] text-[#1A1A1A]">
                    <div>
                      <div className="text-[10px] font-bold text-[#9CA3AF] uppercase">Total Duration</div>
                      <div className="text-base font-black text-[#1A1A1A] flex items-center gap-1 mt-0.5">
                        <Clock size={14} className="text-[#0D9488]" />
                        <span>{route.totalDurationStr}</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-bold text-[#9CA3AF] uppercase">Transfers</div>
                      <div className="text-base font-black text-[#1A1A1A] flex items-center gap-1 mt-0.5">
                        <span>⇄</span>
                        <span>{route.changesCount}</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-bold text-[#9CA3AF] uppercase">Total Est. Cost</div>
                      <div className="text-base font-black text-[#1A1A1A] mt-0.5">
                        ₹{route.totalCostMin.toLocaleString()} – ₹{route.totalCostMax.toLocaleString()}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-bold text-[#9CA3AF] uppercase">AI Confidence</div>
                      <div className="text-base font-black text-emerald-600 mt-0.5 flex items-center gap-1">
                        <span>📊</span>
                        <span>{route.aiConfidenceScore}%</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-bold text-[#9CA3AF] uppercase">Reliability</div>
                      <div className="text-base font-black text-[#1A1A1A] mt-0.5">
                        High (92%)
                      </div>
                    </div>
                  </div>

                </div>

                {/* ── JOURNEY TIMELINE ── */}
                <div className="p-5 space-y-4 bg-[#FFFBF7]/60">
                  
                  {/* Timeline Origin Node */}
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#0D9488] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                      1
                    </div>
                    <div>
                      <div className="text-xs font-black uppercase tracking-wider text-[#9CA3AF]">Origin Station</div>
                      <div className="text-sm font-black text-[#1A1A1A]">
                        {route.legs[0]?.departureTime} • {route.legs[0]?.fromName} ({route.legs[0]?.fromCode})
                      </div>
                    </div>
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
                          
                          {/* Single Train Leg Segment Box */}
                          <div className="ml-3.5 border-l-2 border-dashed border-teal-300 pl-5 py-2 space-y-3">
                            <div className="bg-white border border-[#E8E0D8] rounded-2xl p-4 shadow-xs space-y-3">
                              
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8E0D8] pb-2.5">
                                <div>
                                  <div className="text-sm font-black text-[#1A1A1A] flex items-center gap-2">
                                    <Train size={16} className="text-[#0D9488]" />
                                    <span>{leg.trainName || 'Express Train'}</span>
                                    <span className="text-xs font-bold text-[#0D9488] bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                                      {leg.trainNumber ? `#${leg.trainNumber}` : 'IRCTC Train'}
                                    </span>
                                  </div>
                                  <div className="text-xs text-[#6B6B6B] font-medium mt-0.5">
                                    {leg.fromName} → {leg.toName} • {leg.durationStr} (~{leg.distanceKm} km)
                                  </div>
                                </div>

                                {/* IRCTC Action Button */}
                                <div className="flex items-center gap-2 shrink-0">
                                  <a
                                    href={legIrctcUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3.5 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-extrabold rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                                  >
                                    <span>Book on IRCTC</span>
                                    <ExternalLink size={13} />
                                  </a>
                                </div>
                              </div>

                            {/* Class Fares Display */}
                            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
                              <div className="flex items-center gap-3">
                              </div>

                              <div className="text-[11px] text-slate-400 font-medium">
                                Running Days: Daily • Platform: 1 / 2 (Est.)
                              </div>
                            </div>

                            {/* Amenities Tag Row */}
                            <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-slate-500 pt-1">
                              <span className="bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-md flex items-center gap-1">
                                🔌 Charging Point
                              </span>
                              <span className="bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-md flex items-center gap-1">
                                🍱 Pantry / Food
                              </span>
                              <span className="bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-md flex items-center gap-1">
                                🛏 Bedding / Linen
                              </span>
                              <span className="bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-md flex items-center gap-1">
                                🚾 Clean Washroom
                              </span>
                            </div>

                          </div>
                        </div>

                        {/* Transfer Waiting Time Badge */}
                        {route.transfers && route.transfers[legIdx] && (
                          <div className="ml-3.5 border-l-2 border-dashed border-amber-400/60 dark:border-amber-700/60 pl-5 my-1">
                            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl px-4 py-2 text-xs font-extrabold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                              <Clock size={14} className="text-amber-600 shrink-0" />
                              <span>
                                {route.transfers[legIdx].waitingTimeStr} Transfer Waiting Time at {route.transfers[legIdx].stationName} ({route.transfers[legIdx].stationCode})
                              </span>
                            </div>
                          </div>
                        )}

                      </React.Fragment>
                    )
                  })}

                  {/* Last-Mile Transport Component */}
                  {route.lastMile && (
                    <div className="ml-3.5 border-l-2 border-dashed border-emerald-400/60 dark:border-emerald-700/60 pl-5 py-1">
                      <div className="bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 text-emerald-900 dark:text-emerald-200">
                          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                            <Bus size={18} />
                          </div>
                          <div>
                            <div className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                              🚖 Last-Mile Transport
                            </div>
                            <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                              Taxi / Bus from {route.lastMile.fromLocation.split(' ')[0]} → {toCity} Hotel
                            </div>
                          </div>
                        </div>

                        <div className="text-right text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
                          <span>{route.lastMile.distanceKm} km • {route.lastMile.durationStr} • ₹{route.lastMile.estimatedCostMin} - ₹{route.lastMile.estimatedCostMax}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Destination Arrival Node */}
                  <div className="flex items-center gap-3 pt-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                      <MapPin size={14} />
                    </div>
                    <div>
                      <div className="text-xs font-black uppercase tracking-wider text-slate-400">Final Destination</div>
                      <div className="text-sm font-black text-slate-900 dark:text-white">
                        {toCity} Hotel / Resort
                      </div>
                    </div>
                  </div>

                </div>

                {/* ── FARE BREAKDOWN & JOURNEY SUMMARY FOOTER ── */}
                <div className="p-5 bg-slate-100/80 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 space-y-4">
                  
                  {/* Fare Breakdown Row */}
                  <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 uppercase font-black">Fare Breakdown:</span>
                      {route.legs.map((leg, i) => (
                        <span key={leg.id} className="bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded-lg">
                          Train {i + 1}: ₹{leg.fares.sleeper ? leg.fares.sleeper.min : 520}
                        </span>
                      ))}
                      {route.lastMile && (
                        <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2.5 py-1 rounded-lg">
                          Taxi: ₹{route.lastMile.estimatedCostMin}
                        </span>
                      )}
                    </div>

                    <div className="text-sm font-black text-slate-900 dark:text-white">
                      Estimated Total: ₹{route.totalCostMin.toLocaleString()} – ₹{route.totalCostMax.toLocaleString()}
                    </div>
                  </div>

                  {/* Bottom Action Row */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500">
                      <span>Total Time: <strong className="text-slate-800 dark:text-slate-200">{route.totalDurationStr}</strong></span>
                      <span>•</span>
                      <span>Transfers: <strong className="text-slate-800 dark:text-slate-200">{route.changesCount}</strong></span>
                      <span>•</span>
                      <span>Last Mile: <strong className="text-slate-800 dark:text-slate-200">Taxi {route.lastMile?.distanceKm || 18} km</strong></span>
                    </div>

                    {/* Book Entire Journey CTA Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenBookingModal(route)}
                      className="px-6 py-3 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                    >
                      <span>Book Entire Journey on IRCTC</span>
                      <ExternalLink size={14} />
                    </button>
                  </div>

                </div>

              </div>
            )
          })}
        </div>

      </div>

      {/* IRCTC Deep Link Details Modal */}
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
