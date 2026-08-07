'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  Car, ShieldCheck, CheckCircle2, Sparkles, ChevronLeft, ChevronRight,
  ExternalLink, Heart, Star, Users, Briefcase, Zap,
  MapPin, Fuel, Sliders, Compass, ChevronUp, ChevronDown, X
} from 'lucide-react'
import { useTripStore } from '@/store/tripStore'
import { formatPrice } from '@/lib/currency'
import { isSameCountry } from '@/lib/countryUtils'
import {
  generateSmartCarPlanner, SmartCarPlannerResult, CarVehicle, getSupplierLogo
} from '@/lib/smartCarPlanner'
import { SageScoreRing } from '@/components/ui/SageScoreBadge'

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
  const [showAllVehicles, setShowAllVehicles] = useState<boolean>(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false)

  // Carousel index state per car ID
  const [imageIndices, setImageIndices] = useState<Record<string, number>>({})

  // Favorites state
  const [favorites, setFavorites] = useState<Record<string, boolean>>({})

  // Active Filter Count calculation
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (activeCategory !== 'all') count++
    if (activeBrand !== 'all') count++
    if (activeTransmission !== 'all') count++
    if (activeFuel !== 'all') count++
    if (activeSeats !== 'all') count++
    if (maxPrice < 15000) count++
    if (freeCancellationOnly) count++
    if (unlimitedKmOnly) count++
    return count
  }, [activeCategory, activeBrand, activeTransmission, activeFuel, activeSeats, maxPrice, freeCancellationOnly, unlimitedKmOnly])

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
      <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
        <div className="glass rounded-2xl border border-[#E8E0D8] p-8 text-center bg-white shadow-xs flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
            <Car size={32} />
          </div>
          <div className="space-y-2">
            <h4 className="text-xl font-black text-[#1A1A1A] font-display">Domestic Travel Only</h4>
            <p className="text-sm text-[#6B6B6B] leading-relaxed max-w-md mx-auto font-medium">
              Cab and rental car options are supported for trips within the same country.
            </p>
            <p className="text-xs text-[#9CA3AF] max-w-md mx-auto">
              You can check flight or train options for your journey to <span className="font-bold text-[#1A1A1A]">{destination}</span>.
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
    if (maxIdx <= 0) return
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
      if (activeCategory !== 'all' && car.category.toLowerCase() !== activeCategory.toLowerCase()) return false
      if (activeBrand !== 'all' && car.brand.toLowerCase() !== activeBrand.toLowerCase()) return false
      if (activeTransmission !== 'all' && car.transmission.toLowerCase() !== activeTransmission.toLowerCase()) return false
      if (activeFuel !== 'all' && car.fuelType.toLowerCase() !== activeFuel.toLowerCase()) return false
      if (activeSeats !== 'all') {
        const numSeats = parseInt(activeSeats, 10)
        if (numSeats === 7 && car.seats < 7) return false
        if (numSeats < 7 && car.seats !== numSeats) return false
      }
      if (car.pricePerDay < minPrice || car.pricePerDay > maxPrice) return false
      if (freeCancellationOnly && car.cancellationPolicy !== 'Free Cancellation') return false
      if (unlimitedKmOnly && car.mileagePolicy !== 'Unlimited Kilometres') return false
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
      case 'fuel_efficient': {
        const fuelRank = (f: string) => f === 'Electric' ? 0 : f === 'Hybrid' ? 1 : f === 'CNG' ? 2 : f === 'Diesel' ? 3 : 4
        return list.sort((a, b) => fuelRank(a.fuelType) - fuelRank(b.fuelType))
      }
      case 'family':
        return list.sort((a, b) => b.seats - a.seats)
      case 'recommended':
      default:
        return list.sort((a, b) => (b.badge === 'Recommended' || b.badge === 'Top Pick' ? 1 : 0) - (a.badge === 'Recommended' || a.badge === 'Top Pick' ? 1 : 0))
    }
  }, [filteredCars, activeSort])

  const heroCar = plannerData.heroVehicle || sortedCars[0]

  if (!plannerData.cars || plannerData.cars.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
        <div className="glass rounded-2xl border border-[#E8E0D8] p-8 text-center bg-white shadow-xs flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-orange-50 text-[#EA580C] flex items-center justify-center border border-orange-200 animate-pulse">
            <Car size={32} />
          </div>
          <div className="space-y-2">
            <h4 className="text-xl font-black text-[#1A1A1A] font-display">Loading Vehicles...</h4>
            <p className="text-sm text-[#6B6B6B] leading-relaxed max-w-md mx-auto font-medium">
              Searching for the best rental options in {destination}.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full text-[#1A1A1A] animate-fade-in pb-12">

      {/* ── 1. HERO BANNER (TripSage Luxury Theme) ── */}
      {heroCar && (
        <div className="relative overflow-hidden rounded-3xl bg-white border border-[#E8E0D8] p-6 md:p-8 shadow-xs flex flex-col md:flex-row items-center justify-between gap-8 group">
          {/* Ambient background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-orange-100/30 rounded-full blur-3xl pointer-events-none" />

          {/* Left Text & Content */}
          <div className="relative z-10 space-y-4 max-w-xl text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="bg-orange-50 text-[#EA580C] border border-orange-200 text-xs font-black px-3 py-1 rounded-xl uppercase tracking-wider shadow-2xs">
                Premium Self-Drive & Rental Cabs
              </span>
              <span className="text-xs text-[#6B6B6B] font-extrabold flex items-center gap-1 bg-[#FFFBF7] px-3 py-1 rounded-xl border border-[#E8E0D8]">
                <Compass size={13} className="text-[#EA580C]" />
                Verified Fleet • Zero Hidden Costs
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-[#1A1A1A] leading-tight tracking-tight font-display">
              Drive <span className="text-[#EA580C]">{heroCar.name.split(' or ')[0]}</span> in {plannerData.destination}
            </h1>

            <p className="text-xs md:text-sm text-[#6B6B6B] leading-relaxed font-semibold">
              Enjoy 100% verified vehicle fleets with Free Cancellation up to 48 hours, Unlimited Kilometres, and Full-to-Full fuel policy.
            </p>

            {/* Badges & Dynamic Price Row */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
              <div className="bg-[#FFFBF7] border border-[#E8E0D8] rounded-2xl px-5 py-2.5 text-left shadow-2xs">
                <span className="text-[10px] text-[#9CA3AF] uppercase font-black tracking-wider block">Rate From</span>
                <span className="text-2xl md:text-3xl font-black text-[#EA580C] font-display">
                  {formatPrice(heroCar.pricePerDay, 'INR')} <span className="text-xs font-bold text-[#6B6B6B]">/ day</span>
                </span>
              </div>

              <div className="flex flex-col items-start gap-1 text-xs font-black text-emerald-600">
                <span className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
                  <CheckCircle2 size={14} /> Free Cancellation (48h)
                </span>
                <span className="flex items-center gap-1.5 bg-purple-50 border border-purple-200 text-purple-700 px-3 py-1 rounded-xl">
                  <Zap size={14} /> Unlimited Kilometres
                </span>
              </div>
            </div>
          </div>

          {/* Right Hero Vehicle Image */}
          <div className="relative z-10 w-full md:w-1/2 flex items-center justify-center">
            <div className="relative w-full max-w-lg aspect-video rounded-3xl overflow-hidden shadow-lg border border-[#E8E0D8] group-hover:shadow-2xl transition-all duration-500">
              <img
                src={heroCar.image}
                alt={heroCar.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/85 via-transparent to-transparent flex items-end p-5">
                <div className="flex items-center justify-between w-full text-white">
                  <div>
                    <p className="font-black text-base drop-shadow-md font-display">{heroCar.name}</p>
                    <p className="text-xs text-gray-200 font-medium drop-shadow">{heroCar.brand} Fleet • {heroCar.transmission} • {heroCar.fuelType}</p>
                  </div>
                  <a
                    href={heroCar.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white font-black rounded-2xl text-xs shadow-md transition-all cursor-pointer active:scale-95 font-display"
                  >
                    Reserve Fleet ↗
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. SMART CATEGORY PILLS BAR ── */}
      {/* ── 3. SINGLE CLEAN TOOLBAR: CATEGORY TABS + FILTER BUTTON ── */}
      <div className="bg-white border border-[#E8E0D8] rounded-2xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          {['all', 'Economy', 'Sedan', 'SUV', 'Family', 'Premium'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all border cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#EA580C] text-white border-[#EA580C] shadow-2xs'
                  : 'bg-[#FFFBF7] text-[#6B6B6B] border-[#E8E0D8] hover:text-[#1A1A1A] hover:border-[#EA580C]/40'
              }`}
            >
              {cat === 'all' ? 'All Vehicles' : cat}
            </button>
          ))}
        </div>

        {/* Action Controls: Filter Vehicles Drawer Toggle + Sort */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsFilterModalOpen(true)}
            className="px-3.5 py-1.5 bg-[#FFFBF7] hover:bg-orange-50 text-[#1A1A1A] hover:text-[#EA580C] border border-[#E8E0D8] hover:border-orange-200 font-extrabold rounded-xl text-xs shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer font-display"
          >
            <Sliders size={13} className="text-[#EA580C]" />
            <span>Filter Vehicles</span>
            {activeFilterCount > 0 && (
              <span className="bg-[#EA580C] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>

          <select
            value={activeSort}
            onChange={(e) => setActiveSort(e.target.value as any)}
            className="bg-[#FFFBF7] border border-[#E8E0D8] rounded-xl px-3 py-1.5 text-xs font-extrabold text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#EA580C] cursor-pointer"
          >
            <option value="recommended">Recommended</option>
            <option value="cheapest">Price: Low to High</option>
            <option value="best_rated">Highest Rated</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {/* ── 4. FULL-WIDTH VEHICLES GRID (3 Columns Showcase) ── */}
      {sortedCars.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(showAllVehicles ? sortedCars : sortedCars.slice(0, 6)).map((car) => {
                  const currentImgIdx = imageIndices[car.id] || 0
                  const displayImage = car.gallery && car.gallery.length > 0 ? car.gallery[currentImgIdx] : car.image
                  const isFav = favorites[car.id] || false
                  const displayRate = rentalType === 'perHour' ? Math.round(car.pricePerDay / 12) : car.pricePerDay

                  return (
                    <div
                      key={car.id}
                      className="group bg-white border border-[#E8E0D8] hover:border-[#EA580C] rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative"
                    >
                      {/* Top Image Box (Compact Widescreen) */}
                      <div className="relative h-44 w-full overflow-hidden bg-[#FFFBF7]">
                        <img
                          src={displayImage}
                          alt={car.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />

                        {/* Top Overlay Badges */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                          <span className="bg-[#1A1A1A]/85 backdrop-blur-md text-amber-400 text-xs font-black px-2.5 py-0.5 rounded-lg flex items-center gap-1 shadow-2xs">
                            <Star size={11} className="fill-amber-400" /> {car.rating}
                          </span>
                          {car.badge && (
                            <span className="bg-[#EA580C] text-white text-[10px] font-black px-2.5 py-0.5 rounded-lg uppercase tracking-wider shadow-2xs font-display">
                              {car.badge}
                            </span>
                          )}
                        </div>

                        {/* Favorite Button */}
                        <button
                          onClick={(e) => toggleFavorite(car.id, e)}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#6B6B6B] hover:text-red-500 transition-colors z-10 shadow-xs cursor-pointer"
                        >
                          <Heart size={15} className={isFav ? 'fill-red-500 text-red-500' : ''} />
                        </button>

                        {/* Image Carousel Controls */}
                        {car.gallery && car.gallery.length > 1 && (
                          <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                            <button
                              onClick={(e) => handlePrevImage(car.id, car.gallery.length, e)}
                              className="w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center pointer-events-auto hover:bg-black cursor-pointer shadow-md"
                            >
                              <ChevronLeft size={16} />
                            </button>
                            <button
                              onClick={(e) => handleNextImage(car.id, car.gallery.length, e)}
                              className="w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center pointer-events-auto hover:bg-black cursor-pointer shadow-md"
                            >
                              <ChevronRight size={16} />
                            </button>
                          </div>
                        )}

                        {/* Availability Tag */}
                        <div className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-md text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg">
                          Instant Booking
                        </div>
                      </div>

                      {/* Content Section (Compact Padding) */}
                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <div>
                          {/* Title & Category Badge */}
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-black text-[#1A1A1A] text-base leading-snug truncate font-display">
                                {car.name}
                              </h3>
                              <p className="text-[11px] text-[#6B6B6B] font-extrabold flex items-center gap-1.5 mt-0.5">
                                <span>{car.brand} Fleet</span>
                                <span>•</span>
                                <span className="text-[#EA580C] font-black inline-flex items-center gap-1">
                                  <Car size={12} />
                                  <span>Self-Drive</span>
                                </span>
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <SageScoreRing item={car} allItems={sortedCars} size={36} />
                              <span className="text-[10px] font-black text-[#EA580C] uppercase tracking-wider shrink-0 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-md font-display">
                                {car.category}
                              </span>
                            </div>
                          </div>

                          {/* Specs Chips Row */}
                          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-black text-[#6B6B6B] mt-2">
                            <span className="bg-[#FFFBF7] border border-[#E8E0D8] px-2 py-0.5 rounded-lg flex items-center gap-1">
                              <Sliders size={11} className="text-[#EA580C]" /> {car.transmission}
                            </span>
                            <span className="bg-[#FFFBF7] border border-[#E8E0D8] px-2 py-0.5 rounded-lg flex items-center gap-1">
                              <Fuel size={11} className="text-[#EA580C]" /> {car.fuelType}
                            </span>
                            <span className="bg-[#FFFBF7] border border-[#E8E0D8] px-2 py-0.5 rounded-lg flex items-center gap-1">
                              <Users size={11} className="text-[#EA580C]" /> {car.seats} Seats
                            </span>
                            {car.bags > 0 && (
                              <span className="bg-[#FFFBF7] border border-[#E8E0D8] px-2 py-0.5 rounded-lg flex items-center gap-1">
                                <Briefcase size={11} className="text-[#EA580C]" /> {car.bags} Bags
                              </span>
                            )}
                          </div>

                          {/* Policies & Perks Row */}
                          <div className="flex flex-wrap gap-1.5 mt-2 text-[10px] font-bold">
                            <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 size={11} className="text-emerald-600" /> {car.cancellationPolicy}
                            </span>
                            <span className="text-purple-800 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-200 flex items-center gap-1">
                              <Zap size={11} className="text-purple-600" /> {car.mileagePolicy}
                            </span>
                          </div>
                        </div>

                        {/* Pricing & CTA Row */}
                        <div className="pt-3 border-t border-[#E8E0D8] flex items-center justify-between gap-2">
                          <div>
                            <p className="text-[10px] text-[#9CA3AF] font-black uppercase tracking-wider">
                              {rentalType === 'perHour' ? 'Per Hour' : 'Per Day'}
                            </p>
                            <p className="text-xl font-black text-[#1A1A1A] leading-none font-display">
                              {formatPrice(displayRate, 'INR')}
                            </p>
                            <p className="text-[10px] text-[#6B6B6B] font-semibold mt-0.5">
                              Total: <strong className="text-[#1A1A1A] font-black">{formatPrice(car.totalPrice, 'INR')}</strong> ({car.daysCount} days)
                            </p>
                          </div>

                          {/* CTA Button (Brand Sunset Orange) */}
                          <a
                            href={car.bookingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2.5 rounded-xl font-black text-xs bg-[#EA580C] hover:bg-[#C2410C] text-white shadow-xs hover:shadow-md transition-all shrink-0 flex items-center gap-1 cursor-pointer active:scale-95 font-display"
                          >
                            <span>Book Rental</span>
                            <ExternalLink size={13} />
                          </a>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Show More / Collapse Button */}
              {sortedCars.length > 6 && (
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setShowAllVehicles(!showAllVehicles)}
                    className="px-6 py-3 bg-[#FFFBF7] hover:bg-orange-50 border border-[#E8E0D8] hover:border-orange-200 text-[#1A1A1A] hover:text-[#EA580C] text-xs font-black rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      {showAllVehicles ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      <span>
                        {showAllVehicles
                          ? 'Show Featured Vehicles (Top Picks)'
                          : `View All ${sortedCars.length} Available Vehicles & Fleet Options`}
                      </span>
                    </span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-[#E8E0D8] rounded-2xl p-12 text-center space-y-3">
              <Car size={36} className="mx-auto text-[#9CA3AF]" />
              <h3 className="font-extrabold text-base text-[#1A1A1A] font-display">
                No vehicles match your active filters
              </h3>
              <p className="text-xs text-[#6B6B6B] max-w-sm mx-auto">
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
                className="px-4 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          )}

      {/* ── 5. SLIDE-OUT FILTER DRAWER MODAL ── */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-fade-in">
          <div className="bg-white w-full max-w-md h-full p-6 overflow-y-auto space-y-6 shadow-2xl flex flex-col justify-between">
            
            {/* Drawer Header */}
            <div className="space-y-4 border-b border-[#E8E0D8] pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders size={18} className="text-[#EA580C]" />
                  <h3 className="font-black text-lg text-[#1A1A1A] font-display">Filter Vehicles</h3>
                  {activeFilterCount > 0 && (
                    <span className="bg-orange-50 text-[#EA580C] border border-orange-200 text-xs font-black px-2.5 py-0.5 rounded-full">
                      {activeFilterCount} Active
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsFilterModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#FFFBF7] border border-[#E8E0D8] text-[#6B6B6B] hover:text-[#1A1A1A] flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="text-xs text-[#6B6B6B] font-medium">
                Refine vehicle search by transmission, fuel type, price, and policies.
              </p>
            </div>

            {/* Filter Controls Body */}
            <div className="space-y-6 flex-1 overflow-y-auto pr-1">
              
              {/* Rental Duration Mode */}
              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-[#1A1A1A] uppercase tracking-wider">
                  Rental Duration Mode
                </label>
                <div className="grid grid-cols-2 gap-2 bg-[#FFFBF7] p-1.5 rounded-xl border border-[#E8E0D8]">
                  <button
                    type="button"
                    onClick={() => setRentalType('perDay')}
                    className={`py-2 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                      rentalType === 'perDay'
                        ? 'bg-[#EA580C] text-white shadow-xs'
                        : 'text-[#6B6B6B] hover:text-[#1A1A1A]'
                    }`}
                  >
                    Daily Rate
                  </button>
                  <button
                    type="button"
                    onClick={() => setRentalType('perHour')}
                    className={`py-2 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                      rentalType === 'perHour'
                        ? 'bg-[#EA580C] text-white shadow-xs'
                        : 'text-[#6B6B6B] hover:text-[#1A1A1A]'
                    }`}
                  >
                    Hourly Rate
                  </button>
                </div>
              </div>

              {/* Transmission */}
              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-[#1A1A1A] uppercase tracking-wider">
                  Transmission
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                  {['all', 'Automatic', 'Manual'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setActiveTransmission(t)}
                      className={`py-2 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                        activeTransmission === t
                          ? 'bg-orange-50 text-[#EA580C] border-[#EA580C] font-black shadow-2xs'
                          : 'bg-[#FFFBF7] border-[#E8E0D8] text-[#6B6B6B] hover:border-[#EA580C]/40'
                      }`}
                    >
                      {t === 'all' ? 'Any' : t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fuel Type */}
              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-[#1A1A1A] uppercase tracking-wider">
                  Fuel Type
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  {['all', 'Petrol', 'Diesel', 'Electric', 'Hybrid'].map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setActiveFuel(f)}
                      className={`py-2 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                        activeFuel === f
                          ? 'bg-orange-50 text-[#EA580C] border-[#EA580C] font-black shadow-2xs'
                          : 'bg-[#FFFBF7] border-[#E8E0D8] text-[#6B6B6B] hover:border-[#EA580C]/40'
                      }`}
                    >
                      {f === 'all' ? 'Any Fuel' : f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Seating Capacity */}
              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-[#1A1A1A] uppercase tracking-wider">
                  Seating Capacity
                </label>
                <div className="grid grid-cols-4 gap-2 text-xs font-bold">
                  {['all', '4', '5', '7'].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setActiveSeats(s)}
                      className={`py-2 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                        activeSeats === s
                          ? 'bg-orange-50 text-[#EA580C] border-[#EA580C] font-black shadow-2xs'
                          : 'bg-[#FFFBF7] border-[#E8E0D8] text-[#6B6B6B] hover:border-[#EA580C]/40'
                      }`}
                    >
                      {s === 'all' ? 'Any' : s === '7' ? '7+ Seats' : `${s} Seats`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Slider */}
              <div className="space-y-3 pt-3 border-t border-[#E8E0D8]">
                <div className="flex justify-between items-center text-xs font-black text-[#1A1A1A]">
                  <span>Max Price Per Day</span>
                  <span className="text-[#EA580C] text-sm">₹{maxPrice.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min={500}
                  max={15000}
                  step={500}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-2.5 bg-[#E8E0D8] rounded-lg appearance-none cursor-pointer accent-[#EA580C]"
                />
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-3 border-t border-[#E8E0D8]">
                <label className="flex items-center justify-between text-xs font-bold text-[#1A1A1A] cursor-pointer">
                  <span>Free Cancellation Only</span>
                  <input
                    type="checkbox"
                    checked={freeCancellationOnly}
                    onChange={(e) => setFreeCancellationOnly(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#EA580C] cursor-pointer"
                  />
                </label>
                <label className="flex items-center justify-between text-xs font-bold text-[#1A1A1A] cursor-pointer">
                  <span>Unlimited Kilometres Only</span>
                  <input
                    type="checkbox"
                    checked={unlimitedKmOnly}
                    onChange={(e) => setUnlimitedKmOnly(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#EA580C] cursor-pointer"
                  />
                </label>
              </div>

            </div>

            {/* Drawer Footer Actions */}
            <div className="pt-4 border-t border-[#E8E0D8] space-y-2">
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                className="w-full py-3 bg-[#EA580C] hover:bg-[#C2410C] text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer font-display"
              >
                Apply Filters ({sortedCars.length} Vehicles)
              </button>
              
              {activeFilterCount > 0 && (
                <button
                  type="button"
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
                  className="w-full py-2 text-xs font-extrabold text-[#6B6B6B] hover:text-[#EA580C] transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
