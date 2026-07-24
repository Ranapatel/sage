'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  Train, Bus, Clock, MapPin, ArrowRight, ShieldCheck, Sparkles,
  Zap, Award, PiggyBank, ArrowUpDown, ChevronDown, CheckCircle2,
  Calendar, Users, Info, ExternalLink, RefreshCw, AlertCircle
} from 'lucide-react'
import { useTripStore } from '@/store/tripStore'
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
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'best' | 'fastest' | 'cheapest'>('all')

  // Modal state
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
    setTimeout(() => {
      setIsSearching(false)
    }, 400)
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
    return [plannerData.routes.best, plannerData.routes.fastest, plannerData.routes.cheapest]
  }, [plannerData, activeTabFilter])

  if (storeLoading || isSearching) {
    return <TrainsSkeleton />
  }

  return (
    <div className="space-y-6 w-full text-slate-900 dark:text-slate-100 animate-fade-in">
      
      {/* ── Top Header Banner ── */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-black px-2.5 py-0.5 rounded-md uppercase tracking-wide">
              AI Smart Train Planner <span className="text-[10px] text-blue-500 font-extrabold ml-1">Beta</span>
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              We find the best routes, even when there is no direct train.
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight">
            {plannerData.origin.name} → {plannerData.destination.name}
          </h2>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
            <span>📍 Total Distance: ~{plannerData.distanceKm} km</span>
            <span>•</span>
            <span className={plannerData.hasDirectTrains ? 'text-emerald-600 font-bold' : 'text-orange-600 font-bold'}>
              {plannerData.hasDirectTrains ? '✅ Direct Trains Available' : '🚫 No Direct Trains Available'}
            </span>
          </div>
        </div>

        {/* AI Powered Badge */}
        <div className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-emerald-500/10 border border-blue-500/20 rounded-xl text-blue-700 dark:text-blue-300 font-extrabold text-xs shrink-0 shadow-2xs">
          <Sparkles size={14} className="animate-pulse text-blue-500" />
          <span>Powered by AI ✨</span>
        </div>
      </div>

      {/* ── Main Layout Grid: Left Sidebar + Right Routes Column ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* ── LEFT SIDEBAR: Controls & Tips ── */}
        <div className="lg:col-span-1 space-y-4">
          
          {/* Search Inputs Card */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            
            {/* From Input */}
            <div className="relative">
              <label className="block text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                From
              </label>
              <input
                type="text"
                value={fromCity}
                onChange={(e) => setFromCity(e.target.value)}
                placeholder="Origin City / Station"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              
              {/* Swap Button */}
              <button
                type="button"
                onClick={handleSwapLocations}
                className="absolute right-3 top-[26px] w-7 h-7 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors cursor-pointer"
                title="Swap stations"
              >
                <ArrowUpDown size={14} />
              </button>
            </div>

            {/* To Input */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                To
              </label>
              <input
                type="text"
                value={toCity}
                onChange={(e) => setToCity(e.target.value)}
                placeholder="Destination City / Station"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Journey Date & Add Return */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Journey Date
                </label>
                <button type="button" className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 hover:underline">
                  + Add Return
                </button>
              </div>
              <div className="relative">
                <input
                  type="date"
                  value={journeyDate}
                  onChange={(e) => setJourneyDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Passengers Dropdown */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                Passengers
              </label>
              <select
                value={passengers}
                onChange={(e) => setPassengers(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
              >
                <option value={1}>👥 1 Adult</option>
                <option value={2}>👥 2 Adults</option>
                <option value={3}>👥 3 Adults</option>
                <option value={4}>👥 4 Adults</option>
                <option value={5}>👥 5 Adults</option>
              </select>
            </div>

            {/* Class Dropdown */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                Class
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
              >
                <option value="SL">🚃 Sleeper (SL)</option>
                <option value="3A">❄️ AC 3 Tier (3A)</option>
                <option value="2A">✨ AC 2 Tier (2A)</option>
                <option value="1A">👑 AC 1st Class (1A)</option>
                <option value="ALL">🌐 All Classes</option>
              </select>
            </div>

            {/* Search Routes Button (Dark Blue Theme as shown in Image) */}
            <button
              type="button"
              onClick={handleSearchRoutes}
              className="w-full py-3 bg-[#001E62] hover:bg-[#00174c] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Train size={15} />
              <span>Search Routes</span>
            </button>

          </div>

          {/* AI Route Analysis Box */}
          <div className="bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 font-black text-xs text-blue-900 dark:text-blue-300 uppercase tracking-wider">
              <Sparkles size={14} className="text-blue-600" />
              <span>AI Route Analysis</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {plannerData.aiAnalysisText}
            </p>
          </div>

          {/* Legend Box */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2.5">
            <h4 className="text-xs font-black text-slate-900 dark:text-slate-200 uppercase tracking-wider">
              Legend
            </h4>
            <div className="space-y-2 text-xs font-bold">
              <div className="flex items-center gap-2 text-blue-600">
                <Train size={14} /> <span>Train Journey</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-600">
                <Bus size={14} /> <span>Bus / Taxi</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <MapPin size={14} /> <span>Walking / Transfer</span>
              </div>
              <div className="flex items-center gap-2 text-amber-600">
                <Clock size={14} /> <span>Waiting Time</span>
              </div>
            </div>
          </div>

          {/* Travel Tips Box */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2.5">
            <h4 className="text-xs font-black text-slate-900 dark:text-slate-200 uppercase tracking-wider">
              Travel Tips
            </h4>
            <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-2 font-medium">
              <li className="flex items-start gap-1.5">
                <span className="text-blue-600 font-bold">✓</span>
                <span>Book train tickets in advance for better availability and prices.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-blue-600 font-bold">✓</span>
                <span>Carry a printout or screenshot of all tickets.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-blue-600 font-bold">✓</span>
                <span>Check last-mile transport availability in advance.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-blue-600 font-bold">✓</span>
                <span>Arrival and departure times are estimates and may vary.</span>
              </li>
            </ul>
          </div>

        </div>

        {/* ── RIGHT COLUMN: Top Tabs & Smart Route Cards ── */}
        <div className="lg:col-span-3 space-y-5">
          
          {/* Top Recommendation Route Tabs (Best, Fastest, Cheapest) */}
          <div className="grid grid-cols-3 gap-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-1.5 rounded-2xl shadow-xs">
            
            {/* Best Route Tab */}
            <button
              type="button"
              onClick={() => setActiveTabFilter(activeTabFilter === 'best' ? 'all' : 'best')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                activeTabFilter === 'best' || activeTabFilter === 'all'
                  ? 'bg-blue-50/80 dark:bg-blue-950/50 border-blue-500 text-blue-700 dark:text-blue-300 font-extrabold shadow-2xs'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-1 text-xs font-black uppercase tracking-wide">
                <span>🥇 Best Route</span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-0.5">Recommended</span>
            </button>

            {/* Fastest Route Tab */}
            <button
              type="button"
              onClick={() => setActiveTabFilter(activeTabFilter === 'fastest' ? 'all' : 'fastest')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                activeTabFilter === 'fastest'
                  ? 'bg-purple-50/80 dark:bg-purple-950/50 border-purple-500 text-purple-700 dark:text-purple-300 font-extrabold shadow-2xs'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-1 text-xs font-black uppercase tracking-wide text-purple-600 dark:text-purple-400">
                <Zap size={13} />
                <span>Fastest Route</span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-0.5">Shortest Time</span>
            </button>

            {/* Cheapest Route Tab */}
            <button
              type="button"
              onClick={() => setActiveTabFilter(activeTabFilter === 'cheapest' ? 'all' : 'cheapest')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                activeTabFilter === 'cheapest'
                  ? 'bg-emerald-50/80 dark:bg-emerald-950/50 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-extrabold shadow-2xs'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-1 text-xs font-black uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                <PiggyBank size={13} />
                <span>Cheapest Route</span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-0.5">Lowest Cost</span>
            </button>

          </div>

          {/* AI Recommendation Alert Bar */}
          <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 rounded-xl px-4 py-2.5 flex items-center gap-2 text-amber-900 dark:text-amber-300 text-xs font-bold">
            <Award size={16} className="text-amber-600 shrink-0" />
            <span>AI Recommendation: These routes are based on connectivity, travel time, comfort and cost.</span>
          </div>

          {/* ── SMART ROUTE CARDS LIST ── */}
          <div className="space-y-6">
            {routesToDisplay.map((route) => {
              const badgeBg =
                route.type === 'best'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                  : route.type === 'fastest'
                  ? 'bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400'

              const cardBorder =
                route.type === 'best'
                  ? 'border-emerald-500/40 dark:border-emerald-900/60'
                  : route.type === 'fastest'
                  ? 'border-purple-500/40 dark:border-purple-900/60'
                  : 'border-amber-500/40 dark:border-amber-900/60'

              return (
                <div
                  key={route.id}
                  className={`bg-white dark:bg-slate-950 border ${cardBorder} rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 space-y-4`}
                >
                  
                  {/* Card Header: Route Badge & Overview Row */}
                  <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 space-y-3">
                    
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className={`px-3 py-1 rounded-lg border text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${badgeBg}`}>
                          {route.type === 'best' && <span>🥇 BEST ROUTE</span>}
                          {route.type === 'fastest' && <span>⚡ FASTEST ROUTE</span>}
                          {route.type === 'cheapest' && <span>💰 CHEAPEST ROUTE</span>}
                        </div>

                        {route.changesCount === 0 && (
                          <span className="bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-extrabold text-[11px] px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                            <CheckCircle2 size={12} /> Direct Route
                          </span>
                        )}

                        {route.comparisonLabel && (
                          <span className="bg-blue-100 dark:bg-blue-950/80 border border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-300 font-extrabold text-[11px] px-2.5 py-0.5 rounded-lg">
                            {route.comparisonLabel}
                          </span>
                        )}
                      </div>

                      {route.isRecommended && (
                        <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 size={13} /> Recommended
                        </span>
                      )}
                    </div>

                    {/* Top Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center pt-1">
                      <div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase">Total Duration</div>
                        <div className="text-lg font-black text-slate-900 dark:text-white">{route.totalDurationStr}</div>
                      </div>

                      <div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase">Changes</div>
                        <div className="text-lg font-black text-slate-900 dark:text-white">{route.changesCount}</div>
                      </div>

                      <div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase">Total Est. Cost</div>
                        <div className="text-lg font-black text-slate-900 dark:text-white">
                          ₹{route.totalCostMin.toLocaleString()} – ₹{route.totalCostMax.toLocaleString()}
                        </div>
                      </div>

                      {/* AI Confidence Circular Score */}
                      <div className="flex items-center justify-end gap-2">
                        <div className="text-right">
                          <div className="text-[10px] font-bold text-slate-400 uppercase">AI Confidence</div>
                          <div className="text-sm font-black text-slate-900 dark:text-white">{route.aiConfidenceScore}%</div>
                        </div>

                        <div className="relative w-9 h-9 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path
                              className="text-slate-200 dark:text-slate-800"
                              strokeWidth="3.5"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                              className="text-emerald-500"
                              strokeDasharray={`${route.aiConfidenceScore}, 100`}
                              strokeWidth="3.5"
                              strokeLinecap="round"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Multi-Leg Journey Timeline Body */}
                  <div className="px-5 space-y-4">
                    
                    {route.legs.map((leg, legIdx) => (
                      <React.Fragment key={leg.id}>
                        
                        {/* Single Train Leg Component */}
                        <div className="bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 space-y-3">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                            
                            {/* Departure -> Station -> Arrival */}
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                                <Train size={16} />
                              </div>

                              <div>
                                <div className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                  <span>{leg.departureTime}</span>
                                  <span className="text-xs font-black text-blue-600 dark:text-blue-400">{leg.fromCode}</span>
                                  <span className="text-slate-400">→</span>
                                  <span className="text-slate-900 dark:text-white">{leg.toName}</span>
                                </div>
                                <div className="text-xs text-slate-500 font-medium mt-0.5">
                                  {leg.trainNumber ? `${leg.trainNumber} ` : ''}{leg.trainName}
                                </div>
                              </div>
                            </div>

                            {/* Duration & Fares Pill */}
                            <div className="flex flex-col md:items-end gap-1 shrink-0">
                              <div className="text-xs font-bold text-slate-500">
                                {leg.durationStr} <span className="text-slate-400">• ~{leg.distanceKm} km</span>
                              </div>

                              {/* Class Fares Box */}
                              <div className="bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 rounded-lg px-2.5 py-1 text-[11px] font-bold text-blue-900 dark:text-blue-300">
                                {leg.fares.sleeper && (
                                  <span>Sleeper: ₹{leg.fares.sleeper.min} – ₹{leg.fares.sleeper.max}</span>
                                )}
                                {leg.fares.thirdAC && (
                                  <span className="ml-2 pl-2 border-l border-blue-300 dark:border-blue-700">
                                    AC 3 Tier: ₹{leg.fares.thirdAC.min} – ₹{leg.fares.thirdAC.max}
                                  </span>
                                )}
                              </div>
                            </div>

                          </div>
                        </div>

                        {/* Waiting Time Indicator between legs */}
                        {route.transfers && route.transfers[legIdx] && (
                          <div className="flex items-center gap-2 pl-4 text-xs font-extrabold text-amber-700 dark:text-amber-400">
                            <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950/80 flex items-center justify-center shrink-0">
                              <Clock size={13} className="text-amber-600" />
                            </div>
                            <span>
                              {route.transfers[legIdx].waitingTimeStr} Waiting Time at {route.transfers[legIdx].stationName}
                            </span>
                          </div>
                        )}

                      </React.Fragment>
                    ))}

                    {/* Last-Mile Transport Component (Green Box as shown in reference image) */}
                    {route.lastMile && (
                      <div className="bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl p-3.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-extrabold text-xs">
                          <Bus size={15} className="text-emerald-600" />
                          <div>
                            <div>From {route.lastMile.fromLocation.split(' ')[0]} to {toCity}</div>
                            <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                              {route.lastMile.details}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Card Bottom Bar: Comfort, Crowd, Reliability & Action Button */}
                  <div className="p-4 bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                    
                    {/* Metrics Row */}
                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-600 dark:text-slate-300">
                      <span>Comfort: <strong className="text-slate-900 dark:text-white">{route.metrics.comfort}</strong> ⭐⭐⭐⭐⭐</span>
                      <span>•</span>
                      <span>Crowd: <strong className="text-slate-900 dark:text-white">{route.metrics.crowd}</strong></span>
                      <span>•</span>
                      <span>Reliability: <strong className="text-slate-900 dark:text-white">{route.metrics.reliability}</strong></span>
                    </div>

                    {/* View Details & Book Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenBookingModal(route)}
                      className="px-6 py-2.5 bg-[#001E62] hover:bg-[#00174c] text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <span>View Details & Book</span>
                    </button>

                  </div>

                </div>
              )
            })}
          </div>

          {/* Footer Disclaimer */}
          <div className="bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-slate-500 dark:text-slate-400 text-xs flex items-center gap-2 font-medium">
            <Info size={16} className="text-slate-400 shrink-0" />
            <span>Prices are estimated and may vary. Please check actual availability and fares on IRCTC or at the time of booking.</span>
          </div>

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
