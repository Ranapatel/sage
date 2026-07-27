'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  Car, ShieldCheck, CheckCircle2, Sparkles, Filter, ChevronLeft, ChevronRight,
  ExternalLink, Share2, Heart, Star, Users, Briefcase, Zap, Info, Clock, ArrowUpDown,
  MapPin, Calendar, Award, PiggyBank, RefreshCw, X, AlertCircle, Fuel, Gauge, SlidersHorizontal
} from 'lucide-react'
import { useTripStore } from '@/store/tripStore'
import { formatPrice } from '@/lib/currency'
import { isSameCountry } from '@/lib/countryUtils'
import {
  generateSmartCarPlanner, SmartCarPlannerResult, CarVehicle, getSupplierLogo, VehicleCategory
} from '@/lib/smartCarPlanner'

export default function AiDiscoverCarsPlanner() {
  const { tripContext } = useTripStore()

  // Form State
  const [destination, setDestination] = useState<string>(tripContext.destination || 'Goa')
  const [pickupDate, setPickupDate] = useState<string>(tripContext.startDate || '2026-06-25')
  const [dropoffDate, setDropoffDate] = useState<string>(tripContext.endDate || '2026-06-28')

  // Filter States (Matching Screenshot Layout)
  const [rentalType, setRentalType] = useState<'day' | 'hour'>('day')
  const [minPrice, setMinPrice] = useState<number>(500)
  const [maxPrice, setMaxPrice] = useState<number>(15000)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedTransmission, setSelectedTransmission] = useState<string>('all')
  const [selectedFuel, setSelectedFuel] = useState<string>('all')
  const [selectedBrand, setSelectedBrand] = useState<string>('all')
  const [selectedSeats, setSelectedSeats] = useState<string>('all')
  const [freeCancellationOnly, setFreeCancellationOnly] = useState<boolean>(false)
  const [unlimitedKmOnly, setUnlimitedKmOnly] = useState<boolean>(false)

  // Smart Sorting State
  const [activeSort, setActiveSort] = useState<'recommended' | 'lowest' | 'rated' | 'popular' | 'efficient' | 'family'>('recommended')

  // Favorites & Carousel index state per car ID
  const [imageIndices, setImageIndices] = useState<Record<string, number>>({})
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
      origin: originCity,
      destination,
      pickupDate,
      dropoffDate,
      passengers: passengersCount,
    })
  }, [originCity, destination, pickupDate, dropoffDate, tripContext])

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

  // Reset Filters
  const resetFilters = () => {
    setMinPrice(500)
    setMaxPrice(15000)
    setSelectedCategory('all')
    setSelectedTransmission('all')
    setSelectedFuel('all')
    setSelectedBrand('all')
    setSelectedSeats('all')
    setFreeCancellationOnly(false)
    setUnlimitedKmOnly(false)
  }

  // Filter Vehicles
  const filteredCars = useMemo(() => {
    return plannerData.cars.filter(car => {
      // Rental price filter
      if (car.pricePerDay < minPrice || car.pricePerDay > maxPrice) return false

      // Category filter
      if (selectedCategory !== 'all' && car.category.toLowerCase() !== selectedCategory.toLowerCase()) return false

      // Transmission filter
      if (selectedTransmission !== 'all' && car.transmission.toLowerCase() !== selectedTransmission.toLowerCase()) return false

      // Fuel type filter
      if (selectedFuel !== 'all' && car.fuelType.toLowerCase() !== selectedFuel.toLowerCase()) return false

      // Brand filter
      if (selectedBrand !== 'all' && car.brand.toLowerCase() !== selectedBrand.toLowerCase()) return false

      // Seats filter
      if (selectedSeats !== 'all') {
        const minS = parseInt(selectedSeats, 10)
        if (car.seats < minS) return false
      }

      // Free cancellation
      if (freeCancellationOnly && car.cancellationPolicy !== 'Free Cancellation') return false

      // Unlimited KM
      if (unlimitedKmOnly && car.mileagePolicy !== 'Unlimited Kilometres') return false

      return true
    })
  }, [plannerData.cars, minPrice, maxPrice, selectedCategory, selectedTransmission, selectedFuel, selectedBrand, selectedSeats, freeCancellationOnly, unlimitedKmOnly])

  // Sorted Vehicles
  const sortedCars = useMemo(() => {
    const list = [...filteredCars]
    switch (activeSort) {
      case 'lowest':
        return list.sort((a, b) => a.pricePerDay - b.pricePerDay)
      case 'rated':
        return list.sort((a, b) => b.rating - a.rating)
      case 'popular':
        return list.sort((a, b) => (b.badge === 'Popular' ? 1 : 0) - (a.badge === 'Popular' ? 1 : 0))
      case 'efficient':
        return list.sort((a, b) => (a.fuelType === 'Hybrid' || a.fuelType === 'Electric' ? -1 : 1))
      case 'family':
        return list.sort((a, b) => b.seats - a.seats)
      case 'recommended':
      default:
        return list.sort((a, b) => b.score - a.score)
    }
  }, [filteredCars, activeSort])

  // Domestic Only Guard
  if (!isDomesticRoute) {
    return (
      <div className="bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-10 text-center space-y-4 my-6 shadow-sm">
        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/40 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200 shadow-inner">
          <AlertCircle size={32} />
        </div>
        <div className="space-y-1.5 max-w-md mx-auto">
          <h3 className="text-xl font-black text-amber-950 dark:text-amber-100">
            Domestic Only Service
          </h3>
          <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed font-medium">
            Rental cars are available only for domestic travel. Please use Flights or local transport at your destination.
          </p>
        </div>
      </div>
    )
  }

  const heroCar = plannerData.heroVehicle || sortedCars[0] || plannerData.cars[0]

  return (
    <div className="space-y-8 w-full text-slate-900 dark:text-slate-100 animate-fade-in pb-12">
      
      {/* ── HERO BANNER (Responsive & Dynamic matching screenshot) ── */}
      {heroCar && (
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent z-10" />
          
          <img
            src={heroCar.image}
            alt={heroCar.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-40 scale-105 transition-transform duration-1000 ease-out"
          />

          <div className="relative z-20 p-6 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={13} />
                  Top Pick in {plannerData.destination}
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  Free Cancellation
                </span>
                <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  Unlimited KM
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
                Experience Your Drive in {plannerData.destination}
              </h1>

              <p className="text-xs md:text-sm text-slate-300 font-medium leading-relaxed">
                Featured Deal: <strong className="text-white font-bold">{heroCar.name}</strong> ({heroCar.category}) with {heroCar.transmission} drive & {heroCar.fuelType} efficiency.
              </p>
            </div>

            {/* Price & CTA Badge */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-center space-y-3 min-w-[220px]">
              <span className="text-xs font-bold text-purple-200 uppercase tracking-wider block">Starting from</span>
              <div className="text-3xl font-black text-white">
                {formatPrice(heroCar.pricePerDay)}
                <span className="text-xs font-normal text-slate-300"> / day</span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">
                Est. {formatPrice(heroCar.totalPrice)} for {plannerData.daysCount} days
              </p>
              <a
                href={heroCar.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold px-5 py-3 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Reserve Featured Car</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT LAYOUT (Sidebar Filters + Vehicle Grid matching screenshot) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">

        {/* ── LEFT SIDEBAR FILTERS ── */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 sticky top-6">
          
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white text-base">
              <SlidersHorizontal size={18} className="text-purple-600 dark:text-purple-400" />
              <span>Filter by</span>
            </div>
            <button
              onClick={resetFilters}
              className="text-xs text-purple-600 dark:text-purple-400 font-bold hover:underline"
            >
              Reset all
            </button>
          </div>

          {/* Rental Type (Per Day / Per Hour) */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Rental Rate</label>
            <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                onClick={() => setRentalType('day')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${rentalType === 'day' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Per day
              </button>
              <button
                onClick={() => setRentalType('hour')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${rentalType === 'hour' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Per hour
              </button>
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-extrabold text-slate-700 dark:text-slate-300">
              <span>Price Range</span>
              <span className="text-purple-600 dark:text-purple-400">{formatPrice(maxPrice)}/day</span>
            </div>
            <input
              type="range"
              min="1000"
              max="15000"
              step="500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-purple-600 bg-slate-200 dark:bg-slate-800 rounded-lg h-2 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-medium">
              <span>₹1,000</span>
              <span>₹15,000</span>
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-2.5">
            <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wide block">Body / Category</label>
            <div className="flex flex-wrap gap-1.5">
              {['all', 'Economy', 'Budget', 'Compact', 'Sedan', 'SUV', 'Family', 'Premium'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${selectedCategory.toLowerCase() === cat.toLowerCase() ? 'bg-purple-600 text-white border-purple-600 shadow-sm' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'}`}
                >
                  {cat === 'all' ? 'All' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Transmission Filter */}
          <div className="space-y-2.5">
            <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wide block">Transmission</label>
            <div className="grid grid-cols-3 gap-1.5">
              {['all', 'Automatic', 'Manual'].map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedTransmission(t)}
                  className={`py-1.5 rounded-lg text-xs font-bold border text-center transition-all ${selectedTransmission.toLowerCase() === t.toLowerCase() ? 'bg-purple-600 text-white border-purple-600 shadow-sm' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
                >
                  {t === 'all' ? 'Any' : t}
                </button>
              ))}
            </div>
          </div>

          {/* Fuel Type */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wide block">Fuel Type</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {['all', 'Petrol', 'Diesel', 'Hybrid', 'Electric'].map(fuel => (
                <label key={fuel} className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-300 font-medium">
                  <input
                    type="radio"
                    name="fuelFilter"
                    checked={selectedFuel.toLowerCase() === fuel.toLowerCase()}
                    onChange={() => setSelectedFuel(fuel)}
                    className="accent-purple-600"
                  />
                  <span>{fuel === 'all' ? 'All Fuels' : fuel}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Brand Filter */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wide block">Vehicle Brand</label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Brands</option>
              <option value="Maruti Suzuki">Maruti Suzuki</option>
              <option value="Tata">Tata Motors</option>
              <option value="Hyundai">Hyundai</option>
              <option value="Kia">Kia</option>
              <option value="Toyota">Toyota</option>
              <option value="Honda">Honda</option>
              <option value="Mahindra">Mahindra</option>
              <option value="Renault">Renault</option>
              <option value="Nissan">Nissan</option>
            </select>
          </div>

          {/* Toggles */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-medium">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-700 dark:text-slate-300 font-semibold">Free Cancellation</span>
              <input
                type="checkbox"
                checked={freeCancellationOnly}
                onChange={(e) => setFreeCancellationOnly(e.target.checked)}
                className="accent-purple-600 rounded w-4 h-4"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-700 dark:text-slate-300 font-semibold">Unlimited KM</span>
              <input
                type="checkbox"
                checked={unlimitedKmOnly}
                onChange={(e) => setUnlimitedKmOnly(e.target.checked)}
                className="accent-purple-600 rounded w-4 h-4"
              />
            </label>
          </div>

        </div>

        {/* ── RIGHT VEHICLE GRID & CONTROLS ── */}
        <div className="lg:col-span-3 space-y-6">

          {/* Header Row with Sort Dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {sortedCars.length} Vehicles Available for Rent in {plannerData.destination}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pick-up & Drop-off: {plannerData.pickupDate} – {plannerData.dropoffDate} ({plannerData.daysCount} days)
              </p>
            </div>

            {/* Smart Sort */}
            <div className="flex items-center gap-2">
              <ArrowUpDown size={15} className="text-slate-400" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Sort by:</span>
              <select
                value={activeSort}
                onChange={(e: any) => setActiveSort(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="recommended">Recommended</option>
                <option value="lowest">Lowest Price</option>
                <option value="rated">Best Rated</option>
                <option value="popular">Most Popular</option>
                <option value="efficient">Fuel Efficient</option>
                <option value="family">Family Friendly</option>
              </select>
            </div>
          </div>

          {/* 3-Column Vehicle Grid Matching Screenshot */}
          {sortedCars.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedCars.map((car) => {
                const isFav = favorites[car.id] || false

                return (
                  <div
                    key={car.id}
                    className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    {/* Top Image Container */}
                    <div className="relative aspect-[16/10] bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <img
                        src={car.image}
                        alt={car.name}
                        loading="lazy"
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                      />

                      {/* Rating Badge (Top-Left) */}
                      <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-black text-slate-900 dark:text-white flex items-center gap-1 shadow-md border border-slate-200/50">
                        <Star size={13} className="fill-amber-400 text-amber-400" />
                        <span>{car.rating}</span>
                      </div>

                      {/* Badge / Availability (Top-Right) */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        {car.badge && (
                          <span className="bg-purple-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
                            {car.badge}
                          </span>
                        )}
                        <button
                          onClick={(e) => toggleFavorite(car.id, e)}
                          className="p-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-300 hover:text-red-500 transition-colors shadow-md"
                        >
                          <Heart size={14} className={isFav ? 'fill-red-500 text-red-500' : ''} />
                        </button>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Title & Brand */}
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-snug group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            {car.name}
                          </h3>
                        </div>

                        {/* Specs Line: Transmission • Fuel • Seats */}
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2 flex-wrap">
                          <span>{car.transmission}</span>
                          <span>•</span>
                          <span>{car.fuelType}</span>
                          <span>•</span>
                          <span>{car.seats} Seats</span>
                          <span>•</span>
                          <span>{car.bags} Bags</span>
                        </p>
                      </div>

                      {/* Highlights / Policies */}
                      <div className="flex flex-wrap gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                        <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-900/40">
                          ✓ Free Cancellation
                        </span>
                        <span className="bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-md border border-blue-200/60 dark:border-blue-900/40">
                          ✓ Unlimited KM
                        </span>
                      </div>

                      {/* Price & Booking Footer */}
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 mt-auto">
                        <div>
                          <div className="text-lg font-black text-slate-900 dark:text-white leading-none">
                            {formatPrice(rentalType === 'day' ? car.pricePerDay : Math.round(car.pricePerDay / 10))}
                            <span className="text-[11px] font-normal text-slate-400">/{rentalType === 'day' ? 'day' : 'hr'}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                            Est. {formatPrice(car.totalPrice)} for {car.daysCount} days
                          </span>
                        </div>

                        <a
                          href={car.bookingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 transform active:scale-95"
                        >
                          <span>Book Now</span>
                          <ExternalLink size={13} />
                        </a>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4 shadow-sm">
              <Car size={40} className="mx-auto text-slate-300 dark:text-slate-600" />
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                No vehicles match your active filters
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try widening your price slider or clearing selected body categories.
              </p>
              <button
                onClick={resetFilters}
                className="bg-purple-600 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl shadow-md"
              >
                Reset All Filters
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  )
}
