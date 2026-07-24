'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  Car, ShieldCheck, CheckCircle2, Sparkles, Filter, ChevronLeft, ChevronRight,
  ExternalLink, Share2, Heart, Star, Users, Briefcase, Zap, Info, Clock, ArrowUpDown,
  MapPin, Calendar, Award, PiggyBank, RefreshCw, X
} from 'lucide-react'
import { useTripStore } from '@/store/tripStore'
import { formatPrice } from '@/lib/currency'
import {
  generateSmartCarPlanner, SmartCarPlannerResult, CarVehicle, getSupplierLogo
} from '@/lib/smartCarPlanner'

export default function AiDiscoverCarsPlanner() {
  const { tripContext, loading: storeLoading } = useTripStore()

  // Form State
  const [destination, setDestination] = useState<string>(tripContext.destination || 'Goa')
  const [pickupDate, setPickupDate] = useState<string>(tripContext.startDate || '2026-06-25')
  const [dropoffDate, setDropoffDate] = useState<string>(tripContext.endDate || '2026-06-28')

  // Filter States
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [activeTransmission, setActiveTransmission] = useState<string>('all')
  const [activeFuel, setActiveFuel] = useState<string>('all')
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all')
  const [maxPriceLimit, setMaxPriceLimit] = useState<number>(10000)
  const [activeSort, setActiveSort] = useState<'recommended' | 'cheapest' | 'value' | 'premium' | 'instant'>('recommended')

  // Carousel & Image index state per car ID
  const [imageIndices, setImageIndices] = useState<Record<string, number>>({})

  // Favorites & Comparison state
  const [favorites, setFavorites] = useState<Record<string, boolean>>({})
  const [comparedCarIds, setComparedCarIds] = useState<string[]>([])
  const [isCompareOpen, setIsCompareOpen] = useState(false)

  // Sync state if tripContext updates
  useEffect(() => {
    if (tripContext.destination) setDestination(tripContext.destination)
    if (tripContext.startDate) setPickupDate(tripContext.startDate)
    if (tripContext.endDate) setDropoffDate(tripContext.endDate)
  }, [tripContext.destination, tripContext.startDate, tripContext.endDate])

  // Generate Smart DiscoverCars Data
  const plannerData: SmartCarPlannerResult = useMemo(() => {
    const passengersCount = (tripContext as any)?.travelers || (tripContext as any)?.groupSize || 2
    return generateSmartCarPlanner({
      destination,
      pickupDate,
      dropoffDate,
      passengers: passengersCount,
    })
  }, [destination, pickupDate, dropoffDate, tripContext])

  // Image Navigation Handler
  const handlePrevImage = (carId: string, maxIdx: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setImageIndices(prev => {
      const curr = prev[carId] || 0
      return { ...prev, [carId]: curr === 0 ? maxIdx - 1 : curr - 1 }
    })
  }

  const handleNextImage = (carId: string, maxIdx: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setImageIndices(prev => {
      const curr = prev[carId] || 0
      return { ...prev, [carId]: (curr + 1) % maxIdx }
    })
  }

  // Toggle Favorite
  const toggleFavorite = (carId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setFavorites(prev => ({ ...prev, [carId]: !prev[carId] }))
  }

  // Toggle Compare
  const toggleCompare = (carId: string) => {
    setComparedCarIds(prev => {
      if (prev.includes(carId)) {
        return prev.filter(id => id !== carId)
      }
      if (prev.length >= 3) return prev
      return [...prev, carId]
    })
  }

  // Filter cars based on left sidebar & controls
  const filteredCars = useMemo(() => {
    return plannerData.cars.filter(car => {
      // 1. Category Filter
      if (activeCategory !== 'all' && car.category.toLowerCase() !== activeCategory.toLowerCase()) {
        return false
      }
      // 2. Transmission Filter
      if (activeTransmission !== 'all' && car.transmission.toLowerCase() !== activeTransmission.toLowerCase()) {
        return false
      }
      // 3. Fuel Filter
      if (activeFuel !== 'all' && car.fuelType.toLowerCase() !== activeFuel.toLowerCase()) {
        return false
      }
      // 4. Supplier Filter
      if (selectedSupplier !== 'all' && car.supplier.name.toLowerCase() !== selectedSupplier.toLowerCase()) {
        return false
      }
      // 5. Price Limit Filter
      if (car.pricePerDay > maxPriceLimit) {
        return false
      }
      return true
    })
  }, [plannerData.cars, activeCategory, activeTransmission, activeFuel, selectedSupplier, maxPriceLimit])

  // Sort filtered cars
  const sortedCars = useMemo(() => {
    const list = [...filteredCars]
    switch (activeSort) {
      case 'cheapest':
        return list.sort((a, b) => a.pricePerDay - b.pricePerDay)
      case 'value':
        return list.sort((a, b) => b.score - a.score)
      case 'premium':
        return list.sort((a, b) => b.pricePerDay - a.pricePerDay)
      case 'instant':
        return list.filter(c => c.instantConfirmation).concat(list.filter(c => !c.instantConfirmation))
      case 'recommended':
      default:
        return list.sort((a, b) => (b.badge === 'Top Pick' || b.badge === 'Best Value' ? 1 : 0) - (a.badge === 'Top Pick' || a.badge === 'Best Value' ? 1 : 0))
    }
  }, [filteredCars, activeSort])

  const comparedVehicles = useMemo(() => {
    return plannerData.cars.filter(c => comparedCarIds.includes(c.id))
  }, [plannerData.cars, comparedCarIds])

  return (
    <div className="space-y-6 w-full text-slate-900 dark:text-slate-100 animate-fade-in">
      
      {/* ── TOP HEADER BANNER (DiscoverCars Branding) ── */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        
        {/* Title & Dates Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-black px-2.5 py-0.5 rounded-md uppercase tracking-wide">
                Rental Cars in {plannerData.destination}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {plannerData.pickupDate} – {plannerData.dropoffDate} ({plannerData.daysCount} Days)
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight">
              Compare 500+ Car Hire Brands in {plannerData.destination}
            </h2>
          </div>

          {/* DiscoverCars Official Affiliate Partner Badge */}
          <div className="flex items-center gap-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 px-4 py-2.5 rounded-xl shrink-0">
            <div className="text-right">
              <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider block">Official Partner</span>
              <span className="text-xs font-extrabold text-slate-900 dark:text-white">DiscoverCars.com ↗</span>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <ShieldCheck size={16} className="text-purple-600 shrink-0" />
            <span>Best Price Guarantee</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>Free Cancellation (Up to 48h)</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Sparkles size={16} className="text-amber-500 shrink-0" />
            <span>No Hidden Charges</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Clock size={16} className="text-blue-500 shrink-0" />
            <span>24/7 Customer Support</span>
          </div>
        </div>

      </div>

      {/* ── MAIN LAYOUT GRID: Left Sidebar + Right Car Cards Column ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* ── LEFT SIDEBAR: Search Controls & Filters ── */}
        <div className="lg:col-span-1 space-y-5">
          
          {/* Your Search Details Box */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm uppercase tracking-wider text-purple-400">Your Search</h3>
              <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded text-slate-300">Edit</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pick-up Location</label>
                <div className="font-extrabold text-white flex items-center gap-1.5 mt-0.5">
                  <MapPin size={13} className="text-purple-400" />
                  <span>{destination} Airport / City Center</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pick-up Date & Time</label>
                <div className="font-extrabold text-white flex items-center gap-1.5 mt-0.5">
                  <Calendar size={13} className="text-purple-400" />
                  <span>{pickupDate} • 10:00 AM</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Drop-off Date & Time</label>
                <div className="font-extrabold text-white flex items-center gap-1.5 mt-0.5">
                  <Calendar size={13} className="text-purple-400" />
                  <span>{dropoffDate} • 10:00 AM</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Driver's Age</label>
                <span className="font-extrabold text-white">25 – 70 years</span>
              </div>
            </div>
          </div>

          {/* Filters Card */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                <Filter size={14} className="text-purple-600" /> Filters
              </h3>
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('all')
                  setActiveTransmission('all')
                  setActiveFuel('all')
                  setSelectedSupplier('all')
                  setMaxPriceLimit(10000)
                }}
                className="text-[11px] font-bold text-purple-600 hover:underline cursor-pointer"
              >
                Reset All
              </button>
            </div>

            {/* Car Type Filter */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Car Type
              </label>
              <div className="space-y-1.5 text-xs font-bold">
                {[
                  { key: 'all', label: 'All Cars', count: plannerData.cars.length },
                  { key: 'economy', label: 'Economy', count: plannerData.cars.filter(c => c.category === 'Economy').length },
                  { key: 'hatchback', label: 'Hatchback', count: plannerData.cars.filter(c => c.category === 'Hatchback').length },
                  { key: 'suv', label: 'SUV', count: plannerData.cars.filter(c => c.category === 'SUV').length },
                  { key: 'compact', label: 'Compact / Sedan', count: plannerData.cars.filter(c => c.category === 'Compact' || c.category === 'Sedan').length },
                  { key: 'luxury', label: 'Luxury', count: plannerData.cars.filter(c => c.category === 'Luxury').length },
                  { key: 'ev', label: 'Electric (EV)', count: plannerData.cars.filter(c => c.category === 'EV').length },
                  { key: 'van', label: 'Van / Minivan', count: plannerData.cars.filter(c => c.category === 'Van').length },
                ].map(cat => (
                  <label key={cat.key} className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="carCategory"
                        checked={activeCategory === cat.key}
                        onChange={() => setActiveCategory(cat.key)}
                        className="accent-purple-600"
                      />
                      <span>{cat.label}</span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400">{cat.count}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Transmission Filter */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
              <label className="block text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Transmission
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl text-center text-xs font-extrabold">
                {['all', 'manual', 'automatic'].map(tr => (
                  <button
                    key={tr}
                    type="button"
                    onClick={() => setActiveTransmission(tr)}
                    className={`py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                      activeTransmission === tr
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {tr}
                  </button>
                ))}
              </div>
            </div>

            {/* Fuel Type Filter */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
              <label className="block text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Fuel Type
              </label>
              <div className="space-y-1 text-xs font-bold">
                {[
                  { key: 'all', label: 'All Fuel Types' },
                  { key: 'petrol', label: 'Petrol' },
                  { key: 'diesel', label: 'Diesel' },
                  { key: 'electric', label: 'Electric (EV)' },
                ].map(f => (
                  <label key={f.key} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer">
                    <input
                      type="radio"
                      name="fuelType"
                      checked={activeFuel === f.key}
                      onChange={() => setActiveFuel(f.key)}
                      className="accent-purple-600"
                    />
                    <span>{f.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Supplier Filter */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
              <label className="block text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Supplier
              </label>
              <select
                value={selectedSupplier}
                onChange={e => setSelectedSupplier(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer"
              >
                <option value="all">🚗 All Suppliers (500+)</option>
                <option value="discovercars">DiscoverCars Partner</option>
                <option value="hertz">Hertz</option>
                <option value="avis">Avis</option>
                <option value="europcar">Europcar</option>
                <option value="sixt">Sixt</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>

          </div>

        </div>

        {/* ── RIGHT COLUMN: Sort Tabs & Vehicle Cards List ── */}
        <div className="lg:col-span-3 space-y-5">
          
          {/* Quick Sort Tabs Header */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-2">
            
            <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar">
              {[
                { key: 'recommended', label: '⭐ Recommended' },
                { key: 'cheapest', label: '💰 Cheapest' },
                { key: 'value', label: '🚗 Best Value' },
                { key: 'premium', label: '🏆 Premium' },
                { key: 'instant', label: '⚡ Instant Pickup' },
              ].map(tab => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveSort(tab.key as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                    activeSort === tab.key
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="text-xs font-bold text-slate-500 px-3">
              <span>{sortedCars.length} Cars Available</span>
            </div>

          </div>

          {/* AI Recommendation Alert Banner */}
          <div className="bg-gradient-to-r from-purple-50/80 via-indigo-50/80 to-blue-50/80 dark:from-purple-950/40 dark:via-indigo-950/40 dark:to-blue-950/40 border border-purple-200 dark:border-purple-800/60 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles size={18} />
            </div>
            <div className="text-xs text-slate-800 dark:text-slate-200 font-medium">
              <strong className="font-extrabold text-purple-900 dark:text-purple-300">AI Recommendation for {plannerData.destination}: </strong>
              <span>
                All cars include <strong>Free Cancellation up to 48 hours</strong>, <strong>Full to Full Fuel Policy</strong>, and <strong>Unlimited Kilometres</strong> with instant voucher confirmation.
              </span>
            </div>
          </div>

          {/* ── VEHICLE CARDS LIST (Matching Image 2 Reference) ── */}
          <div className="space-y-6">
            {sortedCars.map(car => {
              const currImgIdx = imageIndices[car.id] || 0
              const currentPhotoUrl = car.gallery[currImgIdx] || car.image
              const isFav = !!favorites[car.id]
              const isCompared = comparedCarIds.includes(car.id)

              return (
                <div
                  key={car.id}
                  className="bg-white dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 grid grid-cols-1 md:grid-cols-12 gap-0 relative group"
                >
                  
                  {/* LEFT: 16:9 Vehicle Image & Photo Carousel (md:col-span-4) */}
                  <div className="md:col-span-4 bg-slate-50 dark:bg-slate-900 relative min-h-[220px] flex items-center justify-center p-3">
                    
                    {/* Category / Badge Overlay Top-Left */}
                    <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 items-start">
                      {car.badge && (
                        <span className="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider shadow-xs">
                          {car.badge}
                        </span>
                      )}
                    </div>

                    {/* Vehicle Photo Display */}
                    <img
                      src={currentPhotoUrl}
                      alt={car.name}
                      className="w-full h-44 object-contain transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Photo Navigation Buttons (< 1/6 >) */}
                    {car.gallery.length > 1 && (
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10">
                        <button
                          type="button"
                          onClick={e => handlePrevImage(car.id, car.gallery.length, e)}
                          className="w-7 h-7 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer"
                          title="Previous photo"
                        >
                          <ChevronLeft size={16} />
                        </button>

                        <span className="bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                          View Photos ({currImgIdx + 1}/{car.gallery.length})
                        </span>

                        <button
                          type="button"
                          onClick={e => handleNextImage(car.id, car.gallery.length, e)}
                          className="w-7 h-7 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer"
                          title="Next photo"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    )}

                  </div>

                  {/* CENTER: Specs & Features Details (md:col-span-5) */}
                  <div className="md:col-span-5 p-5 border-t md:border-t-0 md:border-r border-slate-100 dark:border-slate-800 flex flex-col justify-between space-y-3">
                    
                    <div>
                      {/* Car Name & Category Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                            {car.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase">
                              {car.category}
                            </span>
                            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                              <span>Supplier:</span>
                              <strong className="text-slate-800 dark:text-slate-200">{car.supplier.name}</strong>
                              <Star size={11} className="text-amber-500 fill-amber-500" />
                              <span>{car.supplier.rating}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Specs Icons Grid (Seats, Bags, Doors, A/C, Transmission, Fuel) */}
                      <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                        <div className="flex items-center gap-1.5">
                          <Users size={14} className="text-purple-600" />
                          <span>{car.seats} Seats</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Briefcase size={14} className="text-purple-600" />
                          <span>{car.bags} Bags</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Car size={14} className="text-purple-600" />
                          <span>{car.doors} Doors</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-purple-600">❄️</span>
                          <span>{car.airConditioning ? 'Air Conditioning' : 'No A/C'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-purple-600">⚙️</span>
                          <span>{car.transmission}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-purple-600">⛽</span>
                          <span>{car.fuelType}</span>
                        </div>
                      </div>

                      {/* Green Included Features List (Matching Reference Image 2) */}
                      <div className="mt-3 space-y-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                          <span>{car.cancellationPolicy} (Up to 48 hours before pick-up)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                          <span>{car.fuelPolicy} Fuel Policy</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                          <span>{car.mileagePolicy}</span>
                        </div>
                      </div>

                      {/* AI Explanation Callout */}
                      {car.aiExplanation && (
                        <div className="mt-3 bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/40 rounded-xl p-2.5 text-[11px] text-purple-900 dark:text-purple-300 font-medium">
                          <span className="font-extrabold text-purple-700 dark:text-purple-400">AI Note: </span>
                          {car.aiExplanation}
                        </div>
                      )}
                    </div>

                  </div>

                  {/* RIGHT: Price & DiscoverCars Affiliate CTA (md:col-span-3) */}
                  <div className="md:col-span-3 p-5 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col justify-between space-y-4">
                    
                    {/* Top Action Icons (Share & Favorite & Compare Checkbox) */}
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isCompared}
                          onChange={() => toggleCompare(car.id)}
                          className="accent-purple-600 rounded"
                        />
                        <span>Compare</span>
                      </label>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={e => toggleFavorite(car.id, e)}
                          className={`p-1.5 rounded-full transition-colors ${
                            isFav ? 'text-red-500 bg-red-50 dark:bg-red-950/40' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50'
                          }`}
                          title="Save to favorites"
                        >
                          <Heart size={16} className={isFav ? 'fill-current' : ''} />
                        </button>
                      </div>
                    </div>

                    {/* Price Block */}
                    <div>
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Price for {car.daysCount} days
                      </div>
                      <div className="text-2xl font-black text-slate-900 dark:text-white leading-none mt-0.5">
                        {formatPrice(car.totalPrice, car.currency)}
                      </div>
                      <div className="text-xs font-extrabold text-purple-600 dark:text-purple-400 mt-1">
                        {formatPrice(car.pricePerDay, car.currency)} / day
                      </div>
                      <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
                        <CheckCircle2 size={11} /> Includes taxes and fees
                      </div>
                    </div>

                    {/* CTA Button: View on DiscoverCars ↗ */}
                    <div className="space-y-1.5">
                      <a
                        href={car.bookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 text-center cursor-pointer"
                      >
                        <span>View on DiscoverCars</span>
                        <ExternalLink size={14} />
                      </a>
                      
                      <div className="text-[9.5px] font-medium text-slate-400 text-center leading-tight">
                        You will be redirected to our affiliate partner DiscoverCars.com
                      </div>
                    </div>

                  </div>

                </div>
              )
            })}
          </div>

        </div>

      </div>

      {/* ── FLOATING VEHICLE COMPARISON DRAWER ── */}
      {comparedVehicles.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 flex items-center justify-between gap-6 max-w-2xl w-full mx-auto animate-bounce-short">
          <div className="flex items-center gap-3">
            <span className="bg-purple-600 text-white font-black text-xs px-2.5 py-1 rounded-lg">
              {comparedVehicles.length} / 3
            </span>
            <div className="text-xs font-bold">
              <div>Comparing Selected Vehicles</div>
              <div className="text-[10px] text-slate-400">
                {comparedVehicles.map(c => c.name.split('or')[0]).join(', ')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCompareOpen(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 font-extrabold text-xs rounded-xl transition-all cursor-pointer"
            >
              Compare Cars
            </button>
            <button
              type="button"
              onClick={() => setComparedCarIds([])}
              className="p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* COMPARISON MODAL */}
      {isCompareOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Car size={20} className="text-purple-600" /> Vehicle Specs Comparison
              </h3>
              <button
                type="button"
                onClick={() => setIsCompareOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={20} />
              </button>
            </div>

            {/* Comparison Table Grid */}
            <div className="grid grid-cols-3 gap-4">
              {comparedVehicles.map(car => (
                <div key={car.id} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
                  <img src={car.image} alt={car.name} className="w-full h-28 object-contain" />
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{car.name}</h4>
                  
                  <div className="space-y-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                    <div className="flex justify-between"><span>Daily Price:</span> <strong className="text-purple-600">{formatPrice(car.pricePerDay, car.currency)}</strong></div>
                    <div className="flex justify-between"><span>Supplier:</span> <span>{car.supplier.name}</span></div>
                    <div className="flex justify-between"><span>Category:</span> <span>{car.category}</span></div>
                    <div className="flex justify-between"><span>Transmission:</span> <span>{car.transmission}</span></div>
                    <div className="flex justify-between"><span>Fuel:</span> <span>{car.fuelType}</span></div>
                    <div className="flex justify-between"><span>Seats:</span> <span>{car.seats} Seats</span></div>
                    <div className="flex justify-between"><span>Bags:</span> <span>{car.bags} Bags</span></div>
                    <div className="flex justify-between"><span>Cancellation:</span> <span className="text-emerald-600">{car.cancellationPolicy}</span></div>
                  </div>

                  <a
                    href={car.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-2 bg-purple-600 text-white font-extrabold text-xs rounded-xl text-center"
                  >
                    Book on DiscoverCars ↗
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
