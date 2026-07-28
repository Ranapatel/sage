'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  Car, ShieldCheck, CheckCircle2, Sparkles, Filter, ChevronLeft, ChevronRight,
  ExternalLink, Share2, Heart, Star, Users, Briefcase, Zap, Info, Clock, ArrowUpDown,
  MapPin, Calendar, Award, PiggyBank, RefreshCw, X, Fuel, Sliders, Compass
} from 'lucide-react'
import { useTripStore } from '@/store/tripStore'
import { formatPrice } from '@/lib/currency'
import { isSameCountry } from '@/lib/countryUtils'
import {
  generateSmartCarPlanner, SmartCarPlannerResult, CarVehicle, getSupplierLogo
} from '@/lib/smartCarPlanner'
import TrainsSkeleton from '../train/TrainsSkeleton'

export default function AiDiscoverCarsPlanner() {
  const { tripContext } = useTripStore()

  // Form State
  const [destination, setDestination] = useState<string>(tripContext.destination || 'Goa')
  const [pickupDate, setPickupDate] = useState<string>(tripContext.startDate || '2026-06-25')
  const [dropoffDate, setDropoffDate] = useState<string>(tripContext.endDate || '2026-06-28')

  // Filter States
  const [rentalType, setRentalType] = useState<'perDay' | 'perHour'>('perDay')
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [activeBrand, setActiveBrand] = useState<string>('all')
  const [activeTransmission, setActiveTransmission] = useState<string>('all')
  const [activeFuel, setActiveFuel] = useState<string>('all')
  const [activeSeats, setActiveSeats] = useState<string>('all')
  const [minPrice, setMinPrice] = useState<number>(500)
  const [maxPrice, setMaxPrice] = useState<number>(15000)
  const [activeSort, setActiveSort] = useState<'recommended' | 'cheapest' | 'best_rated' | 'popular' | 'fuel_efficient' | 'family'>('recommended')
  const [freeCancellationOnly, setFreeCancellationOnly] = useState<boolean>(false)
  const [unlimitedKmOnly, setUnlimitedKmOnly] = useState<boolean>(false)

  // Favorites & Carousel index state per car ID
  const [imageIndices, setImageIndices] = useState<Record<string, number>>({})

  // Favorites state
  const [favorites, setFavorites] = useState<Record<string, boolean>>({})

  // Sync state if tripContext updates
  useEffect(() => {
    if (tripContext.destination) setDestination(tripContext.destination)
    if (tripContext.startDate) setPickupDate(tripContext.startDate)
    if (tripContext.endDate) setDropoffDate(tripContext.endDate)
  }, [tripContext.destination, tripContext.startDate, tripContext.endDate])

  // Domestic route validation check
  const originCity = tripContext.startLocation || searchFromCity(tripContext) || ''
  const isDomesticRoute = useMemo(() => {
    if (!originCity || !destination) return true
    return isSameCountry(originCity, destination)
  }, [originCity, destination])

  function searchFromCity(ctx: any): string {
    return ctx?.from || ctx?.startCity || ctx?.origin || ''
  }

  // Generate Smart Car Planner Data
  const plannerData: SmartCarPlannerResult = useMemo(() => {
    const passengersCount = (tripContext as any)?.travelers || (tripContext as any)?.groupSize || 2
    return generateSmartCarPlanner({
      origin: tripContext.startLocation,
      destination,
      pickupDate,
      dropoffDate,
      passengers: passengersCount,
    })
  }, [destination, pickupDate, dropoffDate, tripContext])

  // Domestic only check
  if (plannerData.isDomestic === false) {
    return (
      <div className="space-y-6 animate-fade-in max-w-3xl mx-auto py-8">
        <div className="glass rounded-2xl border border-slate-200/60 dark:border-slate-800 p-8 text-center bg-white dark:bg-slate-950 shadow-sm flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
            <Car size={32} />
          </div>
          <div className="space-y-2">
            <h4 className="text-xl font-black text-slate-800 dark:text-white">Domestic Travel Only</h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto font-medium">
              Rental cars are available only for domestic travel. Please use Flights or local transport at your destination.
            </p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Cab and rental car options are supported for trips within the same country. You can check flight or train options for your journey to <span className="font-bold text-slate-700 dark:text-slate-200">{destination}</span>.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Handle Image Navigation
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

  // Filter cars based on controls
  const filteredCars = useMemo(() => {
    return plannerData.cars.filter(car => {
      // 1. Category Filter
      if (activeCategory !== 'all' && car.category.toLowerCase() !== activeCategory.toLowerCase()) {
        return false
      }
      // 2. Brand Filter
      if (activeBrand !== 'all' && car.brand.toLowerCase() !== activeBrand.toLowerCase()) {
        return false
      }
      // 3. Transmission Filter
      if (activeTransmission !== 'all' && car.transmission.toLowerCase() !== activeTransmission.toLowerCase()) {
        return false
      }
      // 4. Fuel Filter
      if (activeFuel !== 'all' && car.fuelType.toLowerCase() !== activeFuel.toLowerCase()) {
        return false
      }
      // 5. Seats Filter
      if (activeSeats !== 'all') {
        const numSeats = parseInt(activeSeats, 10)
        if (numSeats === 7 && car.seats < 7) return false
        if (numSeats < 7 && car.seats !== numSeats) return false
      }
      // 6. Price Limit
      if (car.pricePerDay < minPrice || car.pricePerDay > maxPrice) {
        return false
      }
      // 7. Badges / Policies
      if (freeCancellationOnly && car.cancellationPolicy !== 'Free Cancellation') {
        return false
      }
      if (unlimitedKmOnly && car.mileagePolicy !== 'Unlimited Kilometres') {
        return false
      }
      return true
    })
  }, [plannerData.cars, activeCategory, activeBrand, activeTransmission, activeFuel, activeSeats, minPrice, maxPrice, freeCancellationOnly, unlimitedKmOnly])

  // Sorted Vehicles
  const sortedCars = useMemo(() => {
    const list = [...filteredCars]
    switch (activeSort) {
      case 'cheapest':
        return list.sort((a, b) => a.pricePerDay - b.pricePerDay)
      case 'best_rated':
        return list.sort((a, b) => b.rating - a.rating)
      case 'popular':
        return list.sort((a, b) => b.score - a.score)
      case 'fuel_efficient':
        return list.sort((a, b) => (a.fuelType === 'Hybrid' || a.fuelType === 'Electric' ? -1 : 1))
      case 'family':
        return list.sort((a, b) => b.seats - a.seats)
      case 'recommended':
      default:
        return list.sort((a, b) => (b.badge === 'Recommended' || b.badge === 'Top Pick' ? 1 : 0) - (a.badge === 'Recommended' || a.badge === 'Top Pick' ? 1 : 0))
    }
  }, [filteredCars, activeSort])

  const heroCar = plannerData.heroVehicle || sortedCars[0]

  if (!plannerData.cars || plannerData.cars.length === 0) {
    return <TrainsSkeleton />
  }

  return (
    <div className="space-y-6 w-full text-slate-900 dark:text-slate-100 animate-fade-in pb-12">

      {/* ── 1. HERO BANNER (Matching reference mockup style) ── */}
      {heroCar && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border border-slate-800 p-6 md:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          
          {/* Subtle background glow */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

          {/* Left Text & Slogan Content */}
          <div className="relative z-10 space-y-4 max-w-xl text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                Experience Your Dream Drive Today
              </span>
              <span className="text-xs text-slate-400 font-semibold flex items-center gap-1 bg-white/10 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-white/10">
                <Compass size={12} className="text-orange-400" />
                Affordable • Convenient • Flexible
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
              Rent <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400">{heroCar.name.split('or')[0]}</span> in {plannerData.destination}
            </h1>

            <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-medium">
              Enjoy 100% verified vehicle fleets with Free Cancellation, Unlimited Kilometres, and Full-to-Full fuel policies.
            </p>

            {/* Badges & Dynamic Price Row */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl px-4 py-2 text-left">
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Estimated Price</span>
                <span className="text-xl md:text-2xl font-black text-amber-400">
                  {formatPrice(heroCar.pricePerDay, 'INR')} <span className="text-xs font-normal text-slate-300">/ day</span>
                </span>
              </div>

              <div className="flex flex-col items-start gap-1">
                <span className="text-xs font-extrabold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={14} /> Free Cancellation (up to 48h)
                </span>
                <span className="text-xs font-extrabold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={14} /> Unlimited Kilometres
                </span>
              </div>
            </div>
          </div>

          {/* Right Hero Vehicle Image */}
          <div className="relative z-10 w-full md:w-1/2 flex items-center justify-center">
            <div className="relative w-full max-w-lg aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
              <img
                src={heroCar.image}
                alt={heroCar.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                <div className="flex items-center justify-between w-full text-white">
                  <div>
                    <p className="font-extrabold text-sm drop-shadow-md">{heroCar.name}</p>
                    <p className="text-[11px] text-slate-300 drop-shadow">{heroCar.brand} • {heroCar.transmission} • {heroCar.fuelType}</p>
                  </div>
                  <a
                    href={heroCar.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold rounded-xl text-xs shadow-lg transition-all transform hover:scale-105"
                  >
                    Reserve Now ↗
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. SMART CATEGORY PILLS BAR ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {['all', 'Economy', 'Budget', 'Compact', 'Sedan', 'SUV', 'Family', 'Premium'].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all border ${
              activeCategory === cat
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400'
            }`}
          >
            {cat === 'all' ? '🚗 All Categories' : cat}
          </button>
        ))}
      </div>

      {/* ── 3. MAIN LAYOUT: LEFT SIDEBAR FILTERS + RIGHT VEHICLES GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">

        {/* ── LEFT SIDEBAR FILTERS PANEL (Matching reference layout) ── */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-6 lg:sticky lg:top-24">
          
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders size={16} className="text-orange-500" /> Filter Vehicles
            </h3>
            <button
              onClick={() => {
                setActiveCategory('all')
                setActiveBrand('all')
                setActiveTransmission('all')
                setActiveFuel('all')
                setActiveSeats('all')
                setMinPrice(500)
                setMaxPrice(15000)
                setFreeCancellationOnly(false)
                setUnlimitedKmOnly(false)
              }}
              className="text-[11px] text-slate-500 hover:text-orange-500 font-bold transition-colors"
            >
              Reset All ↺
            </button>
          </div>

          {/* Rental Type (Per Day / Per Hour) */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Rental Rate Type
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
              <button
                onClick={() => setRentalType('perDay')}
                className={`py-1.5 text-xs font-extrabold rounded-lg transition-all ${
                  rentalType === 'perDay'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Per Day
              </button>
              <button
                onClick={() => setRentalType('perHour')}
                className={`py-1.5 text-xs font-extrabold rounded-lg transition-all ${
                  rentalType === 'perHour'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Per Hour
              </button>
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Price Range</span>
              <span className="text-orange-500 font-extrabold">
                {rentalType === 'perHour' ? formatPrice(Math.round(maxPrice / 12), 'INR') : formatPrice(maxPrice, 'INR')}
              </span>
            </div>
            <input
              type="range"
              min="500"
              max="15000"
              step="500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-orange-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
              <span>₹500</span>
              <span>₹15,000+</span>
            </div>
          </div>

          {/* Brand Filter */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Vehicle Brand
            </label>
            <select
              value={activeBrand}
              onChange={(e) => setActiveBrand(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs font-bold outline-none focus:border-orange-500"
            >
              <option value="all">All Brands</option>
              <option value="Tata">Tata</option>
              <option value="Maruti Suzuki">Maruti Suzuki</option>
              <option value="Hyundai">Hyundai</option>
              <option value="Kia">Kia</option>
              <option value="Toyota">Toyota</option>
              <option value="Honda">Honda</option>
              <option value="Mahindra">Mahindra</option>
              <option value="Renault">Renault</option>
            </select>
          </div>

          {/* Fuel Type Filter */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Fuel Type
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {['all', 'Petrol', 'Diesel', 'Hybrid', 'Electric'].map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFuel(f)}
                  className={`py-1.5 px-2 rounded-xl font-bold border transition-all text-left truncate ${
                    activeFuel === f
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                  }`}
                >
                  {f === 'all' ? 'All Fuels' : f}
                </button>
              ))}
            </div>
          </div>

          {/* Transmission Filter */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Transmission
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {['all', 'Automatic', 'Manual'].map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTransmission(t)}
                  className={`py-1.5 px-2 rounded-xl font-bold border transition-all text-center ${
                    activeTransmission === t
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {t === 'all' ? 'Any' : t}
                </button>
              ))}
            </div>
          </div>

          {/* Seats Filter */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Seats Capacity
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {['all', '4', '5', '7'].map(s => (
                <button
                  key={s}
                  onClick={() => setActiveSeats(s)}
                  className={`py-1.5 px-2 rounded-xl font-bold border transition-all text-center ${
                    activeSeats === s
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {s === 'all' ? 'Any' : `${s} Seats`}
                </button>
              ))}
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={freeCancellationOnly}
                onChange={(e) => setFreeCancellationOnly(e.target.checked)}
                className="accent-orange-500 rounded-sm"
              />
              Free Cancellation Only
            </label>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={unlimitedKmOnly}
                onChange={(e) => setUnlimitedKmOnly(e.target.checked)}
                className="accent-orange-500 rounded-sm"
              />
              Unlimited Kilometres Only
            </label>
          </div>

        </div>

        {/* ── RIGHT VEHICLES LISTING & CONTROLS AREA ── */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Header Row: Count + Sort Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {sortedCars.length} Vehicles Available for Rent
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Verified fleets in {plannerData.destination} ({plannerData.daysCount} Days trip)
              </p>
            </div>

            {/* Smart Sort Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-slate-500 shrink-0">Sort By:</span>
              <select
                value={activeSort}
                onChange={(e) => setActiveSort(e.target.value as any)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-black text-slate-900 dark:text-white outline-none focus:border-orange-500"
              >
                <option value="recommended">⭐ Recommended</option>
                <option value="cheapest">💰 Lowest Price</option>
                <option value="best_rated">🏆 Best Rated</option>
                <option value="popular">🔥 Most Popular</option>
                <option value="fuel_efficient">🍃 Fuel Efficient</option>
                <option value="family">👨‍👩‍👧‍👦 Family Friendly (7-Seater)</option>
              </select>
            </div>
          </div>

          {/* ── VEHICLE CARDS GRID (Matching reference mockup style) ── */}
          {sortedCars.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {sortedCars.map((car) => {
                const currentImgIdx = imageIndices[car.id] || 0
                const displayImage = car.gallery && car.gallery.length > 0 ? car.gallery[currentImgIdx] : car.image
                const isFav = favorites[car.id] || false
                const displayRate = rentalType === 'perHour' ? Math.round(car.pricePerDay / 12) : car.pricePerDay

                return (
                  <div
                    key={car.id}
                    className="group bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-orange-500/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    {/* Top Image Box */}
                    <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-900">
                      <img
                        src={displayImage}
                        alt={car.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                        <span className="bg-slate-900/80 backdrop-blur-md text-amber-400 text-[10px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1">
                          <Star size={11} className="fill-amber-400" /> {car.rating}
                        </span>
                        {car.badge && (
                          <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider">
                            {car.badge}
                          </span>
                        )}
                      </div>

                      {/* Favorite Button */}
                      <button
                        onClick={(e) => toggleFavorite(car.id, e)}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-red-500 transition-colors z-10 shadow-sm"
                      >
                        <Heart size={15} className={isFav ? 'fill-red-500 text-red-500' : ''} />
                      </button>

                      {/* Image Carousel Controls */}
                      {car.gallery && car.gallery.length > 1 && (
                        <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                          <button
                            onClick={(e) => handlePrevImage(car.id, car.gallery.length, e)}
                            className="w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center pointer-events-auto hover:bg-black"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <button
                            onClick={(e) => handleNextImage(car.id, car.gallery.length, e)}
                            className="w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center pointer-events-auto hover:bg-black"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      )}

                      {/* Distance / Availability Tag */}
                      <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                        Available • Instant
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Title & Brand */}
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-extrabold text-slate-900 dark:text-white text-base leading-snug truncate">
                            {car.name}
                          </h3>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider shrink-0 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-md">
                            {car.category}
                          </span>
                        </div>

                        {/* Specs Chips Row */}
                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-extrabold text-slate-600 dark:text-slate-400 mt-2">
                          <span className="bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-md flex items-center gap-1">
                            <Sliders size={11} className="text-slate-400" /> {car.transmission}
                          </span>
                          <span className="bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-md flex items-center gap-1">
                            <Fuel size={11} className="text-slate-400" /> {car.fuelType}
                          </span>
                          <span className="bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-md flex items-center gap-1">
                            <Users size={11} className="text-slate-400" /> {car.seats} Seats
                          </span>
                          {car.bags > 0 && (
                            <span className="bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-md flex items-center gap-1">
                              <Briefcase size={11} className="text-slate-400" /> {car.bags} Bags
                            </span>
                          )}
                        </div>

                        {/* Policies Row */}
                        <div className="flex flex-wrap gap-1.5 mt-3 text-[10px] font-bold">
                          <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900/60">
                            ✓ {car.cancellationPolicy}
                          </span>
                          <span className="text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-900/60">
                            ✓ {car.mileagePolicy}
                          </span>
                        </div>
                      </div>

                      {/* Pricing & CTA Row */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            {rentalType === 'perHour' ? 'Per Hour' : 'Per Day'}
                          </p>
                          <p className="text-xl font-black text-slate-900 dark:text-white leading-none">
                            {formatPrice(displayRate, 'INR')}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                            Trip Total: {formatPrice(car.totalPrice, 'INR')} ({car.daysCount} days)
                          </p>
                        </div>

                        <a
                          href={car.bookingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2.5 rounded-xl font-extrabold text-xs bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md transition-all transform hover:scale-105 shrink-0 flex items-center gap-1"
                        >
                          <span>Book Now</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-3">
              <Car size={36} className="mx-auto text-slate-400" />
              <h3 className="font-extrabold text-base text-slate-800 dark:text-white">
                No vehicles match your active filters
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try widening your price range or clearing transmission/brand filters to view available vehicles.
              </p>
              <button
                onClick={() => {
                  setActiveCategory('all')
                  setActiveBrand('all')
                  setActiveTransmission('all')
                  setActiveFuel('all')
                  setActiveSeats('all')
                  setMaxPrice(15000)
                }}
                className="px-4 py-2 bg-orange-500 text-white font-extrabold text-xs rounded-xl shadow-md"
              >
                Clear Filters
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  )
}
