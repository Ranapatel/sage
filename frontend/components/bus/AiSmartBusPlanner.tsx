'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  Bus, Clock, MapPin, ArrowRight, ShieldCheck, Sparkles,
  Zap, Award, PiggyBank, ArrowUpDown, ChevronDown, CheckCircle2,
  Calendar, Users, Info, ExternalLink, RefreshCw, Star, AlertCircle
} from 'lucide-react'
import { useTripStore } from '@/store/tripStore'
import { isSameCountry } from '@/lib/countryUtils'
import {
  generateSmartBusRoutes, SmartBusPlannerResult, SmartBusRoute, buildRedBusDeepLink
} from '@/lib/smartBusPlanner'
import RedBusBookingModal from './RedBusBookingModal'
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

  // Modal state
  const [selectedRouteForModal, setSelectedRouteForModal] = useState<SmartBusRoute | null>(null)
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

  if (!isSameCountry(fromCity, toCity)) {
    return (
      <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-10 text-center space-y-3 my-4">
        <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/40 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
          <AlertCircle size={28} />
        </div>
        <h3 className="text-lg font-black text-amber-950 dark:text-amber-100">
          International Bus Services Unavailable
        </h3>
        <p className="text-xs text-amber-800 dark:text-amber-300 max-w-md mx-auto leading-relaxed">
          International bus services are not available for this route.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full text-slate-900 dark:text-slate-100 animate-fade-in">
      
      {/* ── Top Header Banner (redBus Accent) ── */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-xs font-black px-2.5 py-0.5 rounded-md uppercase tracking-wide">
              AI Smart Bus Planner <span className="text-[10px] text-red-500 font-extrabold ml-1">Beta</span>
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              We find the smartest bus routes, even when there is no direct bus.
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight">
            {plannerData.origin.name} → {plannerData.destination.name}
          </h2>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
            <span>📍 Distance: ~{plannerData.distanceKm} km</span>
            <span>•</span>
            <span className="text-emerald-600 font-bold">
              🚌 Smart Multi-Hop Connections Available
            </span>
          </div>
        </div>

        {/* AI Powered Badge */}
        <div className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-red-500/10 via-rose-500/10 to-amber-500/10 border border-red-500/20 rounded-xl text-red-700 dark:text-red-300 font-extrabold text-xs shrink-0 shadow-2xs">
          <Sparkles size={14} className="animate-pulse text-red-500" />
          <span>Powered by AI & redBus ✨</span>
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
                placeholder="Origin City"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
              />
              
              {/* Swap Button */}
              <button
                type="button"
                onClick={handleSwapLocations}
                className="absolute right-3 top-[26px] w-7 h-7 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-red-600 transition-colors cursor-pointer"
                title="Swap cities"
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
                placeholder="Destination City"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            {/* Journey Date & Add Return */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Journey Date
                </label>
                <button type="button" className="text-[10px] font-extrabold text-red-600 dark:text-red-400 hover:underline">
                  + Add Return
                </button>
              </div>
              <div className="relative">
                <input
                  type="date"
                  value={journeyDate}
                  onChange={(e) => setJourneyDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
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
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600 cursor-pointer"
              >
                <option value={1}>👥 1 Passenger</option>
                <option value={2}>👥 2 Passengers</option>
                <option value={3}>👥 3 Passengers</option>
                <option value={4}>👥 4 Passengers</option>
                <option value={5}>👥 5 Passengers</option>
              </select>
            </div>

            {/* Bus Type Dropdown */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                Bus Type
              </label>
              <select
                value={busType}
                onChange={(e) => setBusType(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600 cursor-pointer"
              >
                <option value="ALL">🚌 All Bus Types</option>
                <option value="SLEEPER">🛌 AC Sleeper (2+1)</option>
                <option value="VOLVO">✨ Volvo Multi-Axle</option>
                <option value="EV">⚡ EV Luxury Bus</option>
                <option value="SEATER">💺 AC Seater / Executive</option>
              </select>
            </div>

            {/* Search Routes Button (Brand Orange) */}
            <button
              type="button"
              onClick={handleSearchRoutes}
              className="w-full py-3.5 bg-[#EA580C] hover:bg-[#c2410c] text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <Bus size={15} />
              <span>Search Smart Bus Routes</span>
            </button>

          </div>

          {/* AI Route Analysis Box */}
          <div className="bg-rose-50/60 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 font-black text-xs text-rose-900 dark:text-rose-300 uppercase tracking-wider">
              <Sparkles size={14} className="text-red-600" />
              <span>AI Bus Route Analysis</span>
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
              <div className="flex items-center gap-2 text-red-600">
                <Bus size={14} /> <span>Bus Journey</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-600">
                <MapPin size={14} /> <span>Taxi / Local Bus</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <Users size={14} /> <span>Transfer Point</span>
              </div>
              <div className="flex items-center gap-2 text-amber-600">
                <Clock size={14} /> <span>Waiting Time</span>
              </div>
            </div>
          </div>

          {/* Travel Tips Box */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2.5">
            <h4 className="text-xs font-black text-slate-900 dark:text-slate-200 uppercase tracking-wider">
              Bus Travel Tips
            </h4>
            <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-2 font-medium">
              <li className="flex items-start gap-1.5">
                <span className="text-red-600 font-bold">✓</span>
                <span>Arrive at the boarding point 15-20 min before departure.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-red-600 font-bold">✓</span>
                <span>Keep your M-ticket (SMS/WhatsApp) and Govt photo ID ready.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-red-600 font-bold">✓</span>
                <span>Check last-mile taxi / local bus fares to your hotel.</span>
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
                  ? 'bg-rose-50/80 dark:bg-rose-950/50 border-red-500 text-red-700 dark:text-red-300 font-extrabold shadow-2xs'
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
            <span>AI Recommendation: These bus routes are optimized for operator rating, journey time, sleeper comfort, and cost.</span>
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
                          <span className="bg-red-100 dark:bg-red-950/80 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 font-extrabold text-[11px] px-2.5 py-0.5 rounded-lg">
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
                        <div className="text-[11px] font-bold text-slate-400 uppercase">Transfers</div>
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
                              className="text-red-500"
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
                        
                        {/* Single Bus Leg Component */}
                        <div className="bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 space-y-3">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                            
                            {/* Departure -> Terminal -> Arrival */}
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0">
                                <Bus size={16} />
                              </div>

                              <div>
                                <div className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                  <span>{leg.departureTime}</span>
                                  <span className="text-xs font-black text-red-600 dark:text-red-400">{leg.fromCity}</span>
                                  <span className="text-slate-400">→</span>
                                  <span className="text-slate-900 dark:text-white">{leg.toCity}</span>
                                </div>
                                <div className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
                                  <span>{leg.operatorName}</span>
                                  {leg.rating && (
                                    <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.2 rounded text-[10px] font-bold flex items-center gap-0.5">
                                      {leg.rating} <Star size={9} fill="currentColor" />
                                    </span>
                                  )}
                                  <span>•</span>
                                  <span>{leg.busType}</span>
                                </div>
                              </div>
                            </div>

                            {/* Duration & Fares Pill */}
                            <div className="flex flex-col md:items-end gap-1 shrink-0">
                              <div className="text-xs font-bold text-slate-500">
                                {leg.durationStr} <span className="text-slate-400">• ~{leg.distanceKm} km</span>
                              </div>

                              {/* Fares Box */}
                              <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 rounded-lg px-2.5 py-1 text-[11px] font-bold text-rose-900 dark:text-rose-300">
                                {leg.fares.sleeper && (
                                  <span>Sleeper: ₹{leg.fares.sleeper.min} – ₹{leg.fares.sleeper.max}</span>
                                )}
                                {leg.fares.seater && (
                                  <span className="ml-2 pl-2 border-l border-rose-300 dark:border-rose-700">
                                    Seater: ₹{leg.fares.seater.min} – ₹{leg.fares.seater.max}
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
                              {route.transfers[legIdx].waitingTimeStr} Waiting Time at {route.transfers[legIdx].cityName} ({route.transfers[legIdx].terminalName})
                            </span>
                          </div>
                        )}

                      </React.Fragment>
                    ))}

                    {/* Last-Mile Transport Component (Green Box) */}
                    {route.lastMile && (
                      <div className="bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl p-3.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-extrabold text-xs">
                          <MapPin size={15} className="text-emerald-600" />
                          <div>
                            <div>{route.lastMile.fromLocation} → {route.lastMile.toLocation}</div>
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

                    {/* View Details & Book Button (redBus theme) */}
                    <button
                      type="button"
                      onClick={() => handleOpenBookingModal(route)}
                      className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <span>View Details & Book on redBus</span>
                    </button>

                  </div>

                </div>
              )
            })}
          </div>

          {/* Footer Disclaimer */}
          <div className="bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-slate-500 dark:text-slate-400 text-xs flex items-center gap-2 font-medium">
            <Info size={16} className="text-slate-400 shrink-0" />
            <span>Prices and seat availability are estimated and live on redBus. Check actual seat map at the time of booking.</span>
          </div>

        </div>

      </div>

      {/* redBus Deep Link Details Modal */}
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
