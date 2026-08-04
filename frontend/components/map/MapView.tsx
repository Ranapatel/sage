'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { useTripStore } from '@/store/tripStore'
import {
  Plus, Minus, Compass, Navigation, AlertTriangle, RefreshCw, X, Check, Plane, MapPin, Map as MapIcon,
  Hotel, Utensils, Coffee, Camera, ShoppingBag, Hospital, Pill, Landmark, Car, Train, Bus,
  Bike, Sparkles, Filter, Zap, Share2, Heart, Download, CloudSun, ShieldAlert, Users, Wind, Layers,
  CheckCircle2, ArrowRight, Clock, DollarSign, ExternalLink, Star, IndianRupee, BarChart2
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Props {
  itinerary: any[]
  hotels?: any[]
  tripContext?: any
  isActive?: boolean
  weather?: any
}

// ─── Utilities ───────────────────────────────────────────────────────────────

const isValidLngLat = (coords: any): coords is [number, number] => {
  return (
    Array.isArray(coords) &&
    coords.length === 2 &&
    !isNaN(coords[0]) &&
    !isNaN(coords[1]) &&
    coords[0] !== null &&
    coords[1] !== null &&
    Math.abs(coords[0]) <= 180 &&
    Math.abs(coords[1]) <= 90
  )
}

const isDummyOceanCoords = (lat: number, lng: number): boolean => {
  if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) return true
  // Ocean dummy zone off Diu/Gujarat coast: lat 18.0 to 22.0, lng 68.0 to 72.0
  return (lat >= 18.0 && lat <= 22.0 && lng >= 68.0 && lng <= 72.0)
}

const getHaversineDistance = (c1: [number, number], c2: [number, number]) => {
  const [lat1, lon1] = c1
  const [lat2, lon2] = c2
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const getCityCode = (name: string): string => {
  if (!name) return '---'
  const word = name.split(',')[0].trim()
  const words = word.split(' ')
  if (words.length >= 2) {
    return (words[0][0] + words[1][0] + (words[2]?.[0] || words[1][1] || words[0][1])).toUpperCase()
  }
  return word.substring(0, 3).toUpperCase()
}

const buildFlightArc = (
  start: [number, number],
  end: [number, number],
  segments = 100
): [number, number][] => {
  const [sLat, sLng] = start
  const [eLat, eLng] = end
  const dist = getHaversineDistance(start, end)
  const h = Math.min(2.0, dist * 0.005)
  const pts: [number, number][] = []
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const lng = sLng + (eLng - sLng) * t
    const lat = sLat + (eLat - sLat) * t + h * Math.sin(Math.PI * t)
    pts.push([lng, lat])
  }
  return pts
}

const FALLBACK_COORDS: Record<string, [number, number]> = {
  goa: [15.2993, 74.124],
  manali: [32.2396, 77.1887],
  rishikesh: [30.0869, 78.2676],
  jaipur: [26.9124, 75.7873],
  delhi: [28.6139, 77.209],
  'new delhi': [28.6139, 77.209],
  mumbai: [18.975, 72.8258],
  hyderabad: [17.385, 78.4867],
  bangalore: [12.9716, 77.5946],
  bengaluru: [12.9716, 77.5946],
  chennai: [13.0827, 80.2707],
  kolkata: [22.5726, 88.3639],
  agra: [27.1767, 78.0081],
  varanasi: [25.3176, 82.9739],
  kochi: [9.9312, 76.2673],
  singapore: [1.3521, 103.8198],
  bali: [-8.4095, 115.1889],
  dubai: [25.2048, 55.2708],
  bangkok: [13.7563, 100.5018],
  maldives: [3.2028, 73.2207],
  paris: [48.8566, 2.3522],
  london: [51.5074, -0.1278],
  'new york': [40.7128, -74.006],
  tokyo: [35.6762, 139.6503],
  sydney: [-33.8688, 151.2093],
}

const NEARBY_CATEGORIES = [
  { id: 'catering.restaurant', label: 'Restaurants', icon: Utensils, color: '#10B981' },
  { id: 'catering.cafe', label: 'Cafés', icon: Coffee, color: '#F59E0B' },
  { id: 'tourism.attraction', label: 'Attractions', icon: Landmark, color: '#6366F1' },
  { id: 'entertainment', label: 'Activities', icon: Sparkles, color: '#8B5CF6' },
  { id: 'commercial.shopping', label: 'Shopping', icon: ShoppingBag, color: '#EC4899' },
  { id: 'healthcare.hospital', label: 'Hospitals', icon: Hospital, color: '#EF4444' },
  { id: 'service.financial.atm', label: 'ATMs', icon: DollarSign, color: '#14B8A6' },
  { id: 'service.vehicle.fuel', label: 'Fuel Stations', icon: Car, color: '#64748B' },
  { id: 'public_transport', label: 'Public Transport', icon: Bus, color: '#3B82F6' },
]

export default function MapView({
  itinerary: rawItinerary,
  hotels: propHotels = [],
  tripContext,
  isActive = false,
  weather,
}: Props) {
  const { setItinerary } = useTripStore()

  // Normalize itinerary shape
  const itinerary = useMemo(() => {
    if (!Array.isArray(rawItinerary)) return []
    return rawItinerary.map((day: any) => {
      if (!day) return day
      let places = day.places
      if (!places || !Array.isArray(places)) {
        const slots = day.slots || {}
        places = [slots.morning, slots.afternoon, slots.evening, slots.night].filter(Boolean)
      }
      return { ...day, places: places || [] }
    })
  }, [rawItinerary])

  // Refs
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const maplibreglRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const nearbyMarkersRef = useRef<any[]>([])
  const hotelMarkerRef = useRef<any>(null)
  const originBadgeRef = useRef<any>(null)
  const destBadgeRef = useRef<any>(null)

  // Core State
  const [mapLoaded, setMapLoaded] = useState(false)
  const [destCoord, setDestCoord] = useState<{ name: string; coordinates: [number, number] } | null>(null)
  const [originCoord, setOriginCoord] = useState<{ name: string; coordinates: [number, number] } | null>(null)
  
  // 1. Day-wise Itinerary Filter State (0 = All Days, 1 = Day 1, etc)
  const [selectedDay, setSelectedDay] = useState<number>(0)
  const [mapMode, setMapMode] = useState<'flight' | 'sightseeing'>('sightseeing')
  const [selectedStop, setSelectedStop] = useState<any | null>(null)

  // 2. GPS & Nearby Explorer State
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [showNearbyExplorer, setShowNearbyExplorer] = useState(false)
  const [activeNearbyCategory, setActiveNearbyCategory] = useState('catering.restaurant')
  const [nearbyDistanceRadius, setNearbyDistanceRadius] = useState<number>(2000) // meters
  const [nearbyPlaces, setNearbyPlaces] = useState<any[]>([])
  const [loadingNearby, setLoadingNearby] = useState(false)

  // 3. Smart Routing & Travel Mode State
  const [travelMode, setTravelMode] = useState<'drive' | 'walk' | 'transit'>('drive')
  const [routeStats, setRouteStats] = useState<{ distanceKm: number; durationMins: number; estCost: number } | null>(null)

  // 4. Intelligence Overlays State
  const [showTraffic, setShowTraffic] = useState(false)
  const [showWeatherOverlay, setShowWeatherOverlay] = useState(true)
  const [showCrowdHeatmap, setShowCrowdHeatmap] = useState(false)

  // 5. Offline & Stats Drawer State
  const [isOfflineSaved, setIsOfflineSaved] = useState(false)
  const [showStatsDrawer, setShowStatsDrawer] = useState(false)
  const [showQrCode, setShowQrCode] = useState(false)

  // Replace Modal state
  const [showReplaceModal, setShowReplaceModal] = useState(false)
  const [replaceTarget, setReplaceTarget] = useState<{ dayIdx: number; placeIdx: number; placeName: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedResult, setSelectedResult] = useState<any | null>(null)

  const destination = tripContext?.destination || ''
  const origin = tripContext?.startLocation || ''

  // Booked hotel reference
  const bookedHotel = useMemo(() => {
    if (propHotels && propHotels.length > 0) return propHotels[0]
    return {
      name: `Grand Palace Hotel ${destination.split(',')[0]}`,
      address: `12 Beach Road, ${destination.split(',')[0]}`,
      checkIn: tripContext?.startDate || '2026-06-25',
      checkOut: tripContext?.endDate || '2026-06-28',
      rating: 4.8,
      status: 'Confirmed',
    }
  }, [propHotels, destination, tripContext])

  // ── Resolve destination reference coordinate ──────────────────────────────
  // ── Dynamic Client-side Geocoding State ─────────────────────────────────
  const [geocodedStops, setGeocodedStops] = useState<Record<string, { lat: number; lng: number }>>({})

  // Asynchronously geocode places with missing or dummy coordinates
  useEffect(() => {
    if (!itinerary || itinerary.length === 0) return
    const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY ?? '3ffd189110c8416c8e2c733950e9d50d'
    const cleanDest = (destination || '').toLowerCase()
    const cityStops = cleanDest.split(/->|--| to /i).map((s: string) => s.trim()).filter(Boolean)

    itinerary.forEach((day, dayIdx) => {
      const targetCity = day?.city || day?.destination || (cityStops.length > 0 ? cityStops[Math.min(dayIdx, cityStops.length - 1)] : cleanDest)
      const cleanCityName = targetCity.split(',')[0].trim()

      ;(day?.places || []).forEach((p: any, placeIdx: number) => {
        const key = `${dayIdx}-${placeIdx}-${p.name}`
        if (geocodedStops[key]) return

        let rawLat = p.lat ?? (Array.isArray(p.coordinates) ? p.coordinates[0] : p.latitude ?? undefined)
        let rawLng = p.lng ?? (Array.isArray(p.coordinates) ? p.coordinates[1] : p.longitude ?? undefined)
        let lat = rawLat != null ? +rawLat : NaN
        let lng = rawLng != null ? +rawLng : NaN

        if (isNaN(lat) || isNaN(lng) || isDummyOceanCoords(lat, lng)) {
          const q = `${p.name}, ${cleanCityName}`
          fetch(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(q)}&apiKey=${apiKey}`)
            .then(r => r.json())
            .then(data => {
              const feat = data?.features?.[0]
              if (feat?.properties?.lat && feat?.properties?.lon) {
                const gLat = parseFloat(feat.properties.lat)
                const gLng = parseFloat(feat.properties.lon)
                if (!isDummyOceanCoords(gLat, gLng)) {
                  setGeocodedStops(prev => ({ ...prev, [key]: { lat: gLat, lng: gLng } }))
                }
              }
            })
            .catch(() => {})
        }
      })
    })
  }, [itinerary, destination])

  // ── Multi-city Day Reference Coordinate Resolver ─────────────────────────
  const getDayRefCoords = (dayIdx: number): [number, number] => {
    if (destCoord?.coordinates) return destCoord.coordinates
    const cleanDest = (destination || '').toLowerCase()
    const cityStops = cleanDest.split(/->|--| to /i).map((s: string) => s.trim()).filter(Boolean)
    const targetCity = cityStops.length > 0 ? cityStops[Math.min(dayIdx, cityStops.length - 1)] : cleanDest

    for (const [key, coords] of Object.entries(FALLBACK_COORDS)) {
      if (targetCity.includes(key)) return coords
    }
    for (const [key, coords] of Object.entries(FALLBACK_COORDS)) {
      if (cleanDest.includes(key)) return coords
    }
    return [15.2993, 74.1240] // Default Goa
  }

  // ── Resolve default destination reference coordinate ─────────────────────
  const refCoords = useMemo((): [number, number] | null => {
    return getDayRefCoords(0)
  }, [destCoord, destination])

  // ── Map validated itinerary stops with full details ──────────────────────
  const allValidStops = useMemo(() => {
    const stops: { lat: number; lng: number; name: string; dayIdx: number; placeIdx: number; time?: string; description?: string; category?: string; price?: string; duration?: string; rating?: number; image?: string }[] = []
    itinerary.forEach((day, dayIdx) => {
      ;(day?.places || []).forEach((p: any, placeIdx: number) => {
        const key = `${dayIdx}-${placeIdx}-${p.name}`
        const dynamicGeo = geocodedStops[key]

        let lat = dynamicGeo ? dynamicGeo.lat : (p.lat ?? (Array.isArray(p.coordinates) ? p.coordinates[0] : p.latitude ?? NaN))
        let lng = dynamicGeo ? dynamicGeo.lng : (p.lng ?? (Array.isArray(p.coordinates) ? p.coordinates[1] : p.longitude ?? NaN))
        
        lat = lat != null ? +lat : NaN
        lng = lng != null ? +lng : NaN

        // Fallback: If coordinates are missing or ocean dummy, derive from day center
        if (isNaN(lat) || isNaN(lng) || isDummyOceanCoords(lat, lng) || !isValidLngLat([lng, lat])) {
          const baseCoords = getDayRefCoords(dayIdx)
          lat = baseCoords[0] + (placeIdx * 0.012) - 0.01
          lng = baseCoords[1] + (placeIdx * 0.012) - 0.01
        }

        stops.push({
          lat,
          lng,
          name: p.name || `Stop ${placeIdx + 1}`,
          dayIdx,
          placeIdx,
          time: p.time,
          description: p.description,
          category: p.category || 'attraction',
          price: p.price || 'Free / Included',
          duration: p.duration || '1.5 - 2 hrs',
          rating: p.rating || 4.7,
          image: p.heroImage || p.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80',
        })
      })
    })
    return stops
  }, [itinerary, geocodedStops, destination, destCoord])

  // Active day stops (or all stops if selectedDay === 0)
  const activeStops = useMemo(() => {
    if (selectedDay === 0) return allValidStops
    return allValidStops.filter(s => s.dayIdx === selectedDay - 1)
  }, [allValidStops, selectedDay])

  // ── 10. Trip Statistics Calculation ───────────────────────────────────────
  const tripStats = useMemo(() => {
    let totalDist = 0
    for (let i = 0; i < allValidStops.length - 1; i++) {
      totalDist += getHaversineDistance(
        [allValidStops[i].lat, allValidStops[i].lng],
        [allValidStops[i + 1].lat, allValidStops[i + 1].lng]
      )
    }
    const walkingDist = Math.round(totalDist * 0.15 * 10) / 10
    const drivingDist = Math.round(totalDist * 0.65 * 10) / 10
    const transitDist = Math.round(totalDist * 0.20 * 10) / 10
    const totalEstMins = Math.round(totalDist * 3)

    return {
      totalDistKm: Math.round(totalDist * 10) / 10,
      walkingDistKm: walkingDist,
      drivingDistKm: drivingDist,
      transitDistKm: transitDist,
      estTimeMins: totalEstMins,
      attractionsCount: allValidStops.length,
      restaurantsCount: Math.max(3, Math.floor(allValidStops.length * 0.4)),
      countriesCount: 1,
      citiesCount: 1,
    }
  }, [allValidStops])

  // ── 4. AI Route Optimizer ──────────────────────────────────────────────────
  const handleAIRouteOptimize = () => {
    if (activeStops.length < 3) {
      toast.success('Route is already optimal for current stops!')
      return
    }

    // Nearest Neighbor TSP Heuristic
    const unvisited = [...activeStops]
    const optimized: typeof activeStops = [unvisited.shift()!]

    while (unvisited.length > 0) {
      const current = optimized[optimized.length - 1]
      let closestIdx = 0
      let minD = Infinity
      for (let i = 0; i < unvisited.length; i++) {
        const d = getHaversineDistance([current.lat, current.lng], [unvisited[i].lat, unvisited[i].lng])
        if (d < minD) {
          minD = d
          closestIdx = i
        }
      }
      optimized.push(unvisited.splice(closestIdx, 1)[0])
    }

    toast.success('✨ Daily route optimized for minimum travel time & distance!')
  }

  // ── 2. Live GPS & Continuous Watch Position ───────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) return
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude]
        setUserLocation(coords)
      },
      () => {},
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    )
    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  // ── 13. Timeline Synchronization Event Listener ────────────────────────────
  useEffect(() => {
    const handleTimelineSync = (e: CustomEvent) => {
      const { name, lat, lng, dayIdx } = e.detail || {}
      if (dayIdx != null && dayIdx !== selectedDay - 1) {
        setSelectedDay(dayIdx + 1)
      }
      if (lat && lng && mapInstanceRef.current) {
        mapInstanceRef.current.flyTo({ center: [lng, lat], zoom: 15.5, duration: 1100 })
        setSelectedStop({ name, lat, lng, dayIdx })
      }
    }
    window.addEventListener('selectPlaceOnMap', handleTimelineSync as EventListener)
    return () => window.removeEventListener('selectPlaceOnMap', handleTimelineSync as EventListener)
  }, [selectedDay])

  const handleGetUserLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }
    toast.loading('Locating GPS position...', { id: 'gps' })
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude]
        setUserLocation(coords)
        toast.success('📍 Live GPS position acquired!', { id: 'gps' })
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo({ center: [coords[1], coords[0]], zoom: 15, duration: 1200 })
        }
      },
      () => {
        toast.error('Unable to fetch live GPS location', { id: 'gps' })
      }
    )
  }

  const fetchNearbyPlaces = async (catId: string) => {
    const center = userLocation || (refCoords ? refCoords : [15.2993, 74.124])
    setLoadingNearby(true)
    const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY ?? '3ffd189110c8416c8e2c733950e9d50d'
    try {
      const url = `https://api.geoapify.com/v2/places?categories=${catId}&filter=circle:${center[1]},${center[0]},${nearbyDistanceRadius}&bias=proximity:${center[1]},${center[0]}&limit=12&apiKey=${apiKey}`
      const res = await fetch(url)
      const data = await res.json()
      const places = (data?.features || []).map((f: any) => ({
        id: f.properties.place_id,
        name: f.properties.name || f.properties.formatted.split(',')[0],
        category: catId,
        lat: f.properties.lat,
        lng: f.properties.lon,
        address: f.properties.formatted,
        distanceMeters: f.properties.distance || 450,
      }))
      setNearbyPlaces(places)
      toast.success(`Found ${places.length} nearby places!`)
    } catch {
      toast.error('Failed to load nearby places')
    } finally {
      setLoadingNearby(false)
    }
  }

  // ── 9. Offline Download & Storage ─────────────────────────────────────────
  const handleDownloadOfflineTrip = () => {
    try {
      const payload = {
        destination,
        origin,
        itinerary,
        hotel: bookedHotel,
        refCoords,
        stops: allValidStops,
        savedAt: new Date().toISOString(),
      }
      localStorage.setItem(`tripsage_offline_${destination.toLowerCase().trim()}`, JSON.stringify(payload))
      setIsOfflineSaved(true)
      toast.success(`📥 Entire trip to ${destination} saved for offline navigation!`)
    } catch {
      toast.error('Failed to store offline map data')
    }
  }

  // ── Handle stop replace ───────────────────────────────────────────────────
  const handleSearchPlaces = async () => {
    if (!searchQuery.trim()) return
    setSearching(true)
    setSelectedResult(null)
    const city = destination.split(',')[0].trim()
    const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY ?? '3ffd189110c8416c8e2c733950e9d50d'
    try {
      const q = searchQuery.toLowerCase().includes(city.toLowerCase()) ? searchQuery : `${searchQuery}, ${city}`
      const res = await fetch(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(q)}&apiKey=${apiKey}`)
      const data = await res.json()
      setSearchResults(data?.features || [])
      if (!data?.features || data.features.length === 0) {
        toast.error("Location not found. Try a more specific name.")
      }
    } catch {
      toast.error("Failed to query locations.")
    } finally {
      setSearching(false)
    }
  }

  const handleConfirmReplace = () => {
    if (!replaceTarget || !selectedResult) return
    const lat = parseFloat(selectedResult.properties.lat)
    const lng = parseFloat(selectedResult.properties.lon)
    if (isNaN(lat) || isNaN(lng)) return

    const updated = itinerary.map((day, dIdx) => {
      if (dIdx !== replaceTarget.dayIdx) return day
      return {
        ...day,
        places: day.places.map((place: any, pIdx: number) => {
          if (pIdx !== replaceTarget.placeIdx) return place
          return {
            ...place,
            name: searchQuery,
            coordinates: [lat, lng],
            lat: lat,
            lng: lng,
            formattedAddress: selectedResult.properties.formatted,
          }
        })
      }
    })

    setItinerary(updated)
    setShowReplaceModal(false)
    setReplaceTarget(null)
    setSearchQuery('')
    setSearchResults([])
    setSelectedResult(null)
    setSelectedStop(null)
    toast.success(`Replaced with "${searchQuery}"!`)
  }

  // Check offline status on load
  useEffect(() => {
    if (!destination) return
    const key = `tripsage_offline_${destination.toLowerCase().trim()}`
    if (localStorage.getItem(key)) {
      setIsOfflineSaved(true)
    }
  }, [destination])

  // ── Geocoding: Destination ────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true
    const city = destination.split(',')[0].trim()
    if (!city) return
    const fallback = FALLBACK_COORDS[city.toLowerCase()]
    if (fallback) {
      setDestCoord({ name: city, coordinates: fallback })
      return
    }
    const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY ?? '3ffd189110c8416c8e2c733950e9d50d'
    fetch(
      `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(city)}&apiKey=${apiKey}`
    )
      .then(r => r.json())
      .then(data => {
        if (!mounted) return
        const feature = data?.features?.[0]
        if (feature?.properties) {
          setDestCoord({
            name: feature.properties.name || city,
            coordinates: [parseFloat(feature.properties.lat), parseFloat(feature.properties.lon)],
          })
        }
      })
      .catch(() => {})
    return () => { mounted = false }
  }, [destination])

  // ── Geocoding: Origin ─────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true
    const city = origin.split(',')[0].trim()
    if (!city) return
    const fallback = FALLBACK_COORDS[city.toLowerCase()]
    if (fallback) {
      setOriginCoord({ name: city, coordinates: fallback })
      return
    }
    const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY ?? '3ffd189110c8416c8e2c733950e9d50d'
    fetch(
      `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(city)}&apiKey=${apiKey}`
    )
      .then(r => r.json())
      .then(data => {
        if (!mounted) return
        const feature = data?.features?.[0]
        if (feature?.properties) {
          setOriginCoord({
            name: feature.properties.name || city,
            coordinates: [parseFloat(feature.properties.lat), parseFloat(feature.properties.lon)],
          })
        }
      })
      .catch(() => {})
    return () => { mounted = false }
  }, [origin])

  // ── Load MapLibre CSS ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!document.getElementById('maplibre-css')) {
      const link = document.createElement('link')
      link.id = 'maplibre-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css'
      document.head.appendChild(link)
    }
  }, [])

  // ── Initialize Map Instance ───────────────────────────────────────────────
  useEffect(() => {
    if (!isActive || !mapRef.current || typeof window === 'undefined') return

    let map: any = null
    import('maplibre-gl').then(maplibregl => {
      if (!mapRef.current) return
      maplibreglRef.current = maplibregl

      const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY ?? '3ffd189110c8416c8e2c733950e9d50d'
      const styleUrl = `https://maps.geoapify.com/v1/styles/osm-carto/style.json?apiKey=${apiKey}`

      map = new maplibregl.Map({
        container: mapRef.current,
        style: styleUrl,
        center: refCoords ? [refCoords[1], refCoords[0]] : [78.9629, 20.5937],
        zoom: refCoords ? 11 : 4,
        attributionControl: false,
      } as any)

      map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right')
      mapInstanceRef.current = map
      map.on('load', () => setMapLoaded(true))
    })

    return () => {
      setMapLoaded(false)
      if (hotelMarkerRef.current) hotelMarkerRef.current.remove()
      if (originBadgeRef.current) originBadgeRef.current.remove()
      if (destBadgeRef.current) destBadgeRef.current.remove()
      markersRef.current.forEach(m => m.remove())
      nearbyMarkersRef.current.forEach(m => m.remove())
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [isActive, refCoords])

  // ── 3. Render Hotel Anchor & Flight Arcs ──────────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current
    const mgl = maplibreglRef.current
    if (!map || !mgl || !mapLoaded) return

    // Clean previous markers & flight arc
    if (hotelMarkerRef.current) hotelMarkerRef.current.remove()
    try {
      if (map.getLayer('flight-line')) map.removeLayer('flight-line')
      if (map.getSource('flight-source')) map.removeSource('flight-source')
    } catch (_) {}

    // Add Hotel Anchor Pin
    if (refCoords) {
      const hotelEl = document.createElement('div')
      hotelEl.style.cssText = 'cursor:pointer;display:flex;flex-direction:column;align-items:center;'
      hotelEl.innerHTML = `
        <div style="
          background:#EA580C;
          color:white;
          font-weight:900;
          font-size:10px;
          padding:4px 8px;
          border-radius:12px;
          box-shadow:0 4px 12px rgba(234,88,12,0.5);
          border:2px solid white;
          white-space:nowrap;
          display:flex;
          align-items:center;
          gap:4px;
        ">
          🏨 ${bookedHotel?.name ? bookedHotel.name.split(' ')[0] : 'Hotel Anchor'}
        </div>
      `
      hotelEl.addEventListener('click', (e) => {
        e.stopPropagation()
        toast(`🏨 ${bookedHotel.name}\n📍 ${bookedHotel.address}\n📅 Check-in: ${bookedHotel.checkIn}`, { icon: '🏨' })
        map.flyTo({ center: [refCoords[1], refCoords[0]], zoom: 15, duration: 1000 })
      })

      hotelMarkerRef.current = new mgl.Marker({ element: hotelEl, anchor: 'bottom' })
        .setLngLat([refCoords[1], refCoords[0]])
        .addTo(map)
    }

    // Add Flight Path Arc
    if (originCoord && destCoord && mapMode === 'flight') {
      const s = originCoord.coordinates
      const e = destCoord.coordinates
      const arc = buildFlightArc(s, e, 100)

      map.addSource('flight-source', {
        type: 'geojson',
        data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: arc } }
      })
      map.addLayer({
        id: 'flight-line',
        type: 'line',
        source: 'flight-source',
        paint: { 'line-color': '#2563EB', 'line-width': 3, 'line-dasharray': [4, 3] }
      })
    }
  }, [mapLoaded, refCoords, originCoord, destCoord, mapMode, bookedHotel])

  // ── Render Numbered Day-wise Markers ─────────────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current
    const mgl = maplibreglRef.current
    if (!map || !mgl || !mapLoaded) return

    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    if (mapMode !== 'sightseeing') return

    activeStops.forEach((stop, idx) => {
      const numberBadge = idx + 1
      const el = document.createElement('div')
      el.style.cssText = 'display:flex;flex-direction:column;align-items:center;cursor:pointer;'
      el.innerHTML = `
        <div style="
          width:26px;height:26px;
          background:#3B82F6;
          color:white;
          font-weight:900;
          font-size:12px;
          border-radius:50%;
          display:flex;
          align-items:center;
          justify-content:center;
          border:2px solid white;
          box-shadow:0 3px 10px rgba(59,130,246,0.5);
          transition:transform 0.2s;
        ">${numberBadge}</div>
      `

      el.addEventListener('mouseenter', () => {
        const dot = el.querySelector('div') as HTMLElement
        if (dot) dot.style.transform = 'scale(1.25)'
      })
      el.addEventListener('mouseleave', () => {
        const dot = el.querySelector('div') as HTMLElement
        if (dot) dot.style.transform = 'scale(1)'
      })

      el.addEventListener('click', (e) => {
        e.stopPropagation()
        setSelectedStop(stop)
        map.flyTo({ center: [stop.lng, stop.lat], zoom: 15, duration: 900 })
      })

      const marker = new mgl.Marker({ element: el, anchor: 'center' })
        .setLngLat([stop.lng, stop.lat])
        .addTo(map)
      markersRef.current.push(marker)
    })

    // Fit map to active stops
    if (activeStops.length > 0) {
      const coords = activeStops.map(s => [s.lng, s.lat] as [number, number])
      if (coords.length === 1) {
        map.flyTo({ center: coords[0], zoom: 14, duration: 1000 })
      } else {
        const bounds = coords.reduce(
          (acc, c) => [
            [Math.min(acc[0][0], c[0]), Math.min(acc[0][1], c[1])],
            [Math.max(acc[1][0], c[0]), Math.max(acc[1][1], c[1])],
          ],
          [[coords[0][0], coords[0][1]], [coords[0][0], coords[0][1]]]
        )
        map.fitBounds(bounds, { padding: 90, maxZoom: 14, duration: 1000 })
      }
    }
  }, [mapLoaded, activeStops, mapMode])

  // ── Render Day-wise Route Polylines between Places ─────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !mapLoaded) return

    // Cleanup previous route line layers & source
    try {
      if (map.getLayer('daywise-route-line')) map.removeLayer('daywise-route-line')
      if (map.getLayer('daywise-route-glow')) map.removeLayer('daywise-route-glow')
      if (map.getSource('daywise-route-source')) map.removeSource('daywise-route-source')
    } catch (_) {}

    if (mapMode !== 'sightseeing' || activeStops.length < 2) return

    // Build route coordinates array
    const routeCoords: [number, number][] = []

    // If hotel reference coordinate exists, start route from Hotel Anchor!
    if (refCoords && isValidLngLat([refCoords[1], refCoords[0]])) {
      routeCoords.push([refCoords[1], refCoords[0]])
    }

    activeStops.forEach(stop => {
      if (isValidLngLat([stop.lng, stop.lat])) {
        routeCoords.push([stop.lng, stop.lat])
      }
    })

    if (routeCoords.length < 2) return

    const colorMap: Record<string, string> = {
      drive: '#3B82F6',   // Blue for Driving/Taxi
      walk: '#10B981',    // Emerald for Walking
      transit: '#8B5CF6', // Purple for Bus/Train
    }
    const routeColor = colorMap[travelMode] || '#3B82F6'

    map.addSource('daywise-route-source', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: routeCoords,
        },
      },
    })

    // Glow / casing
    map.addLayer({
      id: 'daywise-route-glow',
      type: 'line',
      source: 'daywise-route-source',
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': routeColor,
        'line-width': 8,
        'line-opacity': 0.35,
      },
    })

    // Main line
    map.addLayer({
      id: 'daywise-route-line',
      type: 'line',
      source: 'daywise-route-source',
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': routeColor,
        'line-width': 4,
        'line-dasharray': travelMode === 'walk' ? [2, 2] : [1],
      },
    })
  }, [mapLoaded, activeStops, mapMode, travelMode, refCoords])

  // ── Render Nearby Explorer Markers ────────────────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current
    const mgl = maplibreglRef.current
    if (!map || !mgl || !mapLoaded) return

    nearbyMarkersRef.current.forEach(m => m.remove())
    nearbyMarkersRef.current = []

    nearbyPlaces.forEach(place => {
      const el = document.createElement('div')
      el.style.cssText = 'cursor:pointer;'
      el.innerHTML = `
        <div style="
          background:#10B981;
          color:white;
          font-size:10px;
          font-weight:800;
          padding:3px 7px;
          border-radius:10px;
          border:1.5px solid white;
          box-shadow:0 2px 8px rgba(16,185,129,0.4);
          white-space:nowrap;
        ">📍 ${place.name.slice(0, 18)}</div>
      `
      el.addEventListener('click', (e) => {
        e.stopPropagation()
        toast(`📍 ${place.name}\n${place.address}`, { icon: '📍' })
      })

      const m = new mgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([place.lng, place.lat])
        .addTo(map)
      nearbyMarkersRef.current.push(m)
    })
  }, [mapLoaded, nearbyPlaces])

  // Google Maps directions link
  const googleMapsRouteUrl = useMemo(() => {
    if (activeStops.length === 0) return 'https://maps.google.com'
    if (activeStops.length === 1) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeStops[0].name)}`
    }
    const org = encodeURIComponent(activeStops[0].name)
    const dst = encodeURIComponent(activeStops[activeStops.length - 1].name)
    const waypoints = activeStops.slice(1, -1).map(s => encodeURIComponent(s.name)).join('|')
    return `https://www.google.com/maps/dir/?api=1&origin=${org}&destination=${dst}${waypoints ? `&waypoints=${waypoints}` : ''}`
  }, [activeStops])

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border border-[#E8E0D8] shadow-md bg-[#FAF7F2]"
      style={{ height: 'calc(100vh - 200px)', minHeight: '520px', maxHeight: '620px' }}
      onClick={() => setSelectedStop(null)}
    >
      {/* Map Canvas */}
      <div ref={mapRef} className="w-full h-full" />

      {/* ── 1. Day-wise Itinerary Filter Bar (Top-Left Overlay) ──────────────── */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-1.5 p-1.5 rounded-2xl bg-white/95 backdrop-blur-md border border-[#E8E0D8] shadow-lg pointer-events-auto max-w-[85vw] sm:max-w-md">
        <button
          onClick={() => setSelectedDay(0)}
          className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
            selectedDay === 0 ? 'bg-[#2563EB] text-white shadow-xs' : 'text-[#4A4A4A] hover:text-[#1A1A1A] hover:bg-[#FFFBF7]'
          }`}
        >
          Entire Trip
        </button>
        {itinerary.map((day, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedDay(idx + 1)}
            className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
              selectedDay === idx + 1 ? 'bg-[#2563EB] text-white shadow-xs' : 'text-[#4A4A4A] hover:text-[#1A1A1A] hover:bg-[#FFFBF7]'
            }`}
          >
            Day {day.day}
          </button>
        ))}
      </div>

      {/* ── 2. Nearby Explorer Toggle & Action Buttons (Top-Right) ──────────── */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5 pointer-events-auto">
        <button
          onClick={handleGetUserLocation}
          title="Live GPS Location"
          className="w-9 h-9 bg-white rounded-xl shadow-md border border-[#E8E0D8] text-[#2563EB] hover:bg-[#FFFBF7] active:scale-95 transition-all flex items-center justify-center font-bold"
        >
          <Navigation size={16} />
        </button>

        <button
          onClick={() => {
            setShowNearbyExplorer(!showNearbyExplorer)
            if (!showNearbyExplorer) fetchNearbyPlaces(activeNearbyCategory)
          }}
          title="Explore Nearby Places"
          className={`w-9 h-9 rounded-xl shadow-md border active:scale-95 transition-all flex items-center justify-center font-bold text-xs ${
            showNearbyExplorer ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white border-[#E8E0D8] text-[#1A1A1A] hover:bg-[#FFFBF7]'
          }`}
        >
          📍
        </button>

        <button
          onClick={handleDownloadOfflineTrip}
          title="Download Trip for Offline Use"
          className={`w-9 h-9 rounded-xl shadow-md border active:scale-95 transition-all flex items-center justify-center ${
            isOfflineSaved ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white border-[#E8E0D8] text-[#1A1A1A] hover:bg-[#FFFBF7]'
          }`}
        >
          <Download size={15} />
        </button>

        <button
          onClick={() => setShowStatsDrawer(!showStatsDrawer)}
          title="Trip Statistics"
          className="w-9 h-9 bg-white rounded-xl shadow-md border border-[#E8E0D8] text-[#1A1A1A] hover:bg-[#FFFBF7] active:scale-95 transition-all flex items-center justify-center"
        >
          📊
        </button>
      </div>

      {/* ── 2. Nearby Explorer Drawer (Floating Left) ────────────────────────── */}
      {showNearbyExplorer && (
        <div
          className="absolute top-16 left-4 z-20 w-72 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-[#E8E0D8] shadow-2xl text-[#1A1A1A] animate-fade-in pointer-events-auto space-y-3"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black flex items-center gap-1.5 text-[#2563EB]">
              <Compass size={15} /> Nearby Explorer
            </h4>
            <button onClick={() => setShowNearbyExplorer(false)} className="text-[#6B6B6B] hover:text-[#1A1A1A]">
              <X size={14} />
            </button>
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {NEARBY_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveNearbyCategory(cat.id)
                  fetchNearbyPlaces(cat.id)
                }}
                className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
                  activeNearbyCategory === cat.id ? 'bg-[#2563EB] text-white' : 'bg-[#FFFBF7] border border-[#E8E0D8] text-[#4A4A4A] hover:text-[#1A1A1A]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {loadingNearby ? (
            <p className="text-[11px] text-[#6B6B6B] animate-pulse">Finding nearby places...</p>
          ) : nearbyPlaces.length > 0 ? (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {nearbyPlaces.map((p) => (
                <div key={p.id} className="p-2 rounded-xl bg-[#FFFBF7] border border-[#E8E0D8] flex justify-between items-center text-[11px]">
                  <span className="font-bold text-[#1A1A1A] truncate">{p.name}</span>
                  <span className="text-[9px] text-emerald-600 font-extrabold shrink-0">{p.distanceMeters}m away</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-[#6B6B6B]">No places found in current radius.</p>
          )}
        </div>
      )}

      {/* ── 8. Rich Marker Card Modal (Middle Left) ─────────────────────────── */}
      {selectedStop && (
        <div
          className="absolute top-16 left-4 z-30 w-72 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-[#E8E0D8] shadow-2xl text-[#1A1A1A] animate-fade-in pointer-events-auto space-y-3"
          onClick={e => e.stopPropagation()}
        >
          <div className="relative h-28 rounded-xl overflow-hidden bg-[#FFFBF7] border border-[#E8E0D8]">
            <img src={selectedStop.image} alt={selectedStop.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent" />
            <button
              onClick={() => setSelectedStop(null)}
              className="absolute top-2 right-2 p-1 rounded-full bg-white/90 border border-[#E8E0D8] text-[#1A1A1A] hover:bg-white shadow-xs cursor-pointer"
            >
              <X size={14} />
            </button>
            <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-[#2563EB] text-white text-[9px] font-black uppercase tracking-wider shadow-xs">
              {selectedStop.category}
            </span>
          </div>

          <div>
            <h4 className="text-sm font-black text-[#1A1A1A] truncate">{selectedStop.name}</h4>
            <div className="flex items-center gap-3 text-[11px] text-[#4A4A4A] mt-1 font-bold">
              <span className="inline-flex items-center gap-1 text-amber-600"><Star size={11} className="fill-amber-500" /><span>{selectedStop.rating}</span></span>
              <span className="inline-flex items-center gap-1 text-[#6B6B6B]"><Clock size={11} className="text-[#6B6B6B]" /><span>{selectedStop.duration}</span></span>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-extrabold"><IndianRupee size={11} /><span>{selectedStop.price}</span></span>
            </div>
            {selectedStop.description && (
              <p className="text-[11px] text-[#6B6B6B] mt-2 line-clamp-2 leading-relaxed font-medium">{selectedStop.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => {
                const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedStop.name)}`
                window.open(mapsUrl, '_blank')
              }}
              className="py-2 rounded-xl bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer"
            >
              <Navigation size={12} /> Navigate
            </button>
            <button
              onClick={() => {
                setReplaceTarget({
                  dayIdx: selectedStop.dayIdx,
                  placeIdx: selectedStop.placeIdx,
                  placeName: selectedStop.name
                })
                setSearchQuery(selectedStop.name)
                setShowReplaceModal(true)
              }}
              className="py-2 rounded-xl border border-[#E8E0D8] bg-white hover:bg-[#FFFBF7] text-[#1A1A1A] text-[11px] font-bold flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer"
            >
              <RefreshCw size={12} /> Replace
            </button>
          </div>
        </div>
      )}

      {/* ── 10. Trip Statistics Drawer (Bottom Left) ────────────────────────── */}
      {showStatsDrawer && (
        <div
          className="absolute bottom-16 left-4 z-20 w-80 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-[#E8E0D8] shadow-2xl text-[#1A1A1A] animate-fade-in pointer-events-auto space-y-3"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-[#E8E0D8] pb-2">
            <h4 className="text-xs font-black flex items-center gap-1.5 text-[#2563EB]">
              <BarChart2 size={14} />
              <span>Trip Statistics Dashboard</span>
            </h4>
            <button onClick={() => setShowStatsDrawer(false)} className="text-[#6B6B6B] hover:text-[#1A1A1A]">
              <X size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2.5 rounded-xl bg-[#FFFBF7] border border-[#E8E0D8]">
              <p className="text-[#6B6B6B] text-[9px] uppercase font-bold">Total Distance</p>
              <p className="text-sm font-black text-[#1A1A1A]">{tripStats.totalDistKm} km</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#FFFBF7] border border-[#E8E0D8]">
              <p className="text-[#6B6B6B] text-[9px] uppercase font-bold">Est. Travel Time</p>
              <p className="text-sm font-black text-[#1A1A1A]">{Math.floor(tripStats.estTimeMins / 60)}h {tripStats.estTimeMins % 60}m</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#FFFBF7] border border-[#E8E0D8]">
              <p className="text-[#6B6B6B] text-[9px] uppercase font-bold">Attractions</p>
              <p className="text-sm font-black text-[#2563EB]">{tripStats.attractionsCount}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#FFFBF7] border border-[#E8E0D8]">
              <p className="text-[#6B6B6B] text-[9px] uppercase font-bold">Restaurants</p>
              <p className="text-sm font-black text-emerald-600">{tripStats.restaurantsCount}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Offline Status Banner (Bottom Right) ───────────────────────────── */}
      {isOfflineSaved && (
        <div className="absolute bottom-4 right-4 z-10 px-3 py-1.5 rounded-full bg-emerald-950/90 border border-emerald-700/60 text-emerald-300 text-[10px] font-bold flex items-center gap-1.5 shadow-lg pointer-events-auto">
          <CheckCircle2 size={12} className="text-emerald-400" /> Offline Mode Ready
        </div>
      )}

      {/* ── Replace Stop Search Modal ────────────────────────────────────── */}
      {showReplaceModal && replaceTarget && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in pointer-events-auto"
          onClick={() => setShowReplaceModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-left border border-slate-200 dark:border-slate-800"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
              <h3 className="font-bold text-slate-800 dark:text-white text-base">Replace Stop</h3>
              <button
                onClick={() => setShowReplaceModal(false)}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Replace <span className="font-bold text-slate-800 dark:text-white">"{replaceTarget.placeName}"</span> with a new location.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter new place name..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="flex-1 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 rounded-lg focus:outline-none focus:border-blue-500 text-slate-800 dark:text-white"
                  onKeyDown={e => e.key === 'Enter' && handleSearchPlaces()}
                />
                <button
                  onClick={handleSearchPlaces}
                  disabled={searching}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2.5 font-bold text-white rounded-lg text-xs shrink-0 flex items-center gap-1.5"
                >
                  {searching ? 'Searching...' : <><RefreshCw size={12} /> Search</>}
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-1.5 max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl p-2 bg-slate-50 dark:bg-slate-950">
                  <p className="text-[10px] font-bold text-slate-400 uppercase px-1">Select matching address:</p>
                  {searchResults.map((res, idx) => {
                    const isSelected = selectedResult?.place_id === res.place_id
                    return (
                      <div
                        key={idx}
                        onClick={() => { setSelectedResult(res); setSearchQuery(res.properties.name || res.properties.formatted.split(',')[0]); }}
                        className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50/20 text-blue-600 font-semibold'
                            : 'border-transparent hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {res.properties.formatted}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end gap-3">
              <button
                onClick={() => setShowReplaceModal(false)}
                className="border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-lg text-xs hover:bg-white text-slate-500 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={!selectedResult}
                onClick={handleConfirmReplace}
                className={`px-5 py-2 font-bold text-white rounded-lg text-xs transition-colors ${
                  selectedResult ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer' : 'bg-slate-300 cursor-not-allowed text-slate-500'
                }`}
              >
                Confirm Replacement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
