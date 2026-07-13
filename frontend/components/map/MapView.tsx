'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useTripStore } from '@/store/tripStore'
import { formatPrice } from '@/lib/currency'
import { 
  Plus, Minus, Compass, MapPin, AlertTriangle, ExternalLink, 
  RefreshCw, X, Check, Navigation, Utensils, Landmark, 
  Trees, ShoppingBag, Hotel, Plane, Map as MapIcon, 
  ChevronDown, ChevronUp, Clock, Coins, Eye, Footprints
} from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'
import RouteLayer from '@/components/maps/RouteLayer'

interface Props {
  itinerary: any[]
  hotels?: any[]
  tripContext?: any
  isActive?: boolean
  weather?: any
}

const isValidLngLat = (coords: any): coords is [number, number] => {
  return Array.isArray(coords) && 
         coords.length === 2 && 
         !isNaN(coords[0]) && 
         !isNaN(coords[1]) && 
         coords[0] !== null && 
         coords[1] !== null &&
         Math.abs(coords[0]) <= 180 &&
         Math.abs(coords[1]) <= 90;
}

// Haversine distance calculator in kilometers
const getHaversineDistance = (coords1: [number, number], coords2: [number, number]) => {
  const [lat1, lon1] = coords1
  const [lat2, lon2] = coords2
  const R = 6371 // radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Category Lucide Icon Resolver
const renderCategoryIcon = (category: string, size = 16, className = '') => {
  switch (category?.toLowerCase()) {
    case 'dining': return <Utensils size={size} className={className} />
    case 'culture': return <Landmark size={size} className={className} />
    case 'nature': return <Trees size={size} className={className} />
    case 'activity': return <Compass size={size} className={className} />
    case 'shopping': return <ShoppingBag size={size} className={className} />
    case 'accommodation': return <Hotel size={size} className={className} />
    case 'transport': return <Plane size={size} className={className} />
    default: return <MapPin size={size} className={className} />
  }
}

// Category SVG Pin Icon Resolver for MapLibre HTML Markers
const getSvgIconMarkup = (category: string, stroke = 'currentColor', size = 14) => {
  switch (category?.toLowerCase()) {
    case 'dining':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>`
    case 'culture':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><path d="M12 2L2 7h20L12 2z"/></svg>`
    case 'nature':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 22v-6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v6"/><path d="M14 22v-4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v6"/><path d="M12 2a4 4 0 0 0-4 4v4h8V6a4 4 0 0 0-4-4z"/></svg>`
    case 'activity':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`
    case 'shopping':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`
    case 'accommodation':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/><path d="M9 21v-4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4"/><path d="M10 7h4"/><path d="M10 11h4"/></svg>`
    case 'transport':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2L16 11l3.5-3.5C20 7 20 6.4 19.6 6c-.4-.4-1-.4-1.4 0L14.7 9.5 6.5 7.7 5 9.2l6.5 3.3L8 16l-3.3-1.2-1.5 1.5 3.5 1.8 1.8 3.5 1.5-1.5L8.8 17.8l3.5-3.5 3.3 6.5z"/></svg>`
    default:
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`
  }
}

// Curated coordinate fallback for popular destination cities
const DOMESTIC_COORDS: Record<string, [number, number]> = {
  'goa': [15.2993, 74.1240],
  'manali': [32.2396, 77.1887],
  'rishikesh': [30.0869, 78.2676],
  'jaipur': [26.9124, 75.7873],
  'delhi': [28.6139, 77.2090],
  'mumbai': [18.9750, 72.8258],
  'hyderabad': [17.3850, 78.4867],
  'bangalore': [12.9716, 77.5946],
  'bengaluru': [12.9716, 77.5946],
  'chennai': [13.0827, 80.2707],
  'kolkata': [22.5726, 88.3639],
  'singapore': [1.3521, 103.8198],
  'bali': [-8.4095, 115.1889],
  'indonesia': [-8.4095, 115.1889],
  'dubai': [25.2048, 55.2708],
  'thailand': [13.7563, 100.5018],
  'bangkok': [13.7563, 100.5018],
  'maldives': [3.2028, 73.2207],
  'paris': [48.8566, 2.3522],
  'london': [51.5074, -0.1278],
}

export default function MapView({ itinerary: rawItinerary, hotels = [], tripContext, isActive = false, weather }: Props) {
  const itinerary = useMemo(() => {
    if (!Array.isArray(rawItinerary)) return []
    return rawItinerary.map(day => {
      if (!day) return day
      let places = day.places
      if (!places || !Array.isArray(places)) {
        const slots = day.slots || {}
        places = [slots.morning, slots.afternoon, slots.evening, slots.night].filter(Boolean)
      }
      return {
        ...day,
        places: places || []
      }
    })
  }, [rawItinerary])

  const { setItinerary } = useTripStore()
  
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const maplibreglRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const routeLineRef = useRef<any>(null)

  const [mapLoaded, setMapLoaded] = useState(false)
  const [activeDay, setActiveDay] = useState(0)
  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null)
  const [destCoord, setDestCoord] = useState<any>(null)
  const [hotelCoords, setHotelCoords] = useState<any[]>([])

  // Replace stop states
  const [showReplaceModal, setShowReplaceModal] = useState(false)
  const [replaceTarget, setReplaceTarget] = useState<{ dayIdx: number; placeIdx: number; placeName: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedResult, setSelectedResult] = useState<any | null>(null)
  const [routeGeometry, setRouteGeometry] = useState<any>(null)

  const currency = useAuthStore(state => state.user?.currency) || 'INR'
  const destination = tripContext?.destination || ''

  // 1. Resolve true destination reference coordinates safely (fallbacks on local/OSM error)
  const refCoords = useMemo(() => {
    if (destCoord?.coordinates) return destCoord.coordinates
    const cityClean = destination.toLowerCase()
    for (const [key, coords] of Object.entries(DOMESTIC_COORDS)) {
      if (cityClean.includes(key)) return coords
    }
    // Fallback to first non-empty itinerary place coordinate if it exists
    for (const day of itinerary) {
      for (const p of day.places) {
        let rawLat = p.lat != null ? p.lat : (Array.isArray(p.coordinates) ? p.coordinates[0] : undefined)
        let rawLng = p.lng != null ? p.lng : (Array.isArray(p.coordinates) ? p.coordinates[1] : undefined)
        if (rawLat != null && rawLng != null && !isNaN(Number(rawLat)) && !isNaN(Number(rawLng))) {
          const latVal = Number(rawLat)
          const lngVal = Number(rawLng)
          // Exclude random fallbacks like [20, 70]
          if (Math.abs(latVal - 20) > 2 || Math.abs(lngVal - 70) > 2) {
            return [latVal, lngVal] as [number, number]
          }
        }
      }
    }
    return null
  }, [destCoord, destination, itinerary])

  // 2. Map and validate itinerary stops against destination bounds
  const mappedItinerary = useMemo(() => {
    return itinerary.map((day, dayIdx) => ({
      ...day,
      dayIdx,
      places: day.places.map((p: any, placeIdx: number) => {
        let rawLat = p.lat != null ? p.lat : (Array.isArray(p.coordinates) ? p.coordinates[0] : p.latitude != null ? p.latitude : undefined)
        let rawLng = p.lng != null ? p.lng : (Array.isArray(p.coordinates) ? p.coordinates[1] : p.longitude != null ? p.longitude : undefined)
        let coords: [number, number] | null = null

        if (rawLat != null && rawLng != null && !isNaN(Number(rawLat)) && !isNaN(Number(rawLng))) {
          coords = [Number(rawLat), Number(rawLng)]
        }

        // Validate coordinates: must exist, and be within 1.5 degrees (~160km) of refCoords
        const hasValidCoords = coords !== null && isValidLngLat([coords[1], coords[0]])
        const isInsideBounds = hasValidCoords && (!refCoords || (Math.abs(coords![0] - refCoords[0]) < 1.5 && Math.abs(coords![1] - refCoords[1]) < 1.5))

        let confidence: 'exact' | 'area' | 'unresolved' = 'unresolved'
        if (isInsideBounds) {
          confidence = (p.coordSource?.includes('google') || p.coordSource?.includes('rapid') || p.coordSource === 'user_resolved') ? 'exact' : 'area'
        }

        const city = destination.split(',')[0].trim()
        const country = destination.split(',')[1]?.trim() || 'India'

        // Recommended stop duration based on category
        let durationText = '2 hours'
        if (p.category === 'dining') durationText = '1.5 hours'
        else if (p.category === 'activity') durationText = '2.5 hours'
        else if (p.category === 'culture') durationText = '2 hours'

        return {
          ...p,
          placeName: p.name,
          city,
          country,
          latitude: isInsideBounds ? coords![0] : null,
          longitude: isInsideBounds ? coords![1] : null,
          coordinates: isInsideBounds ? coords : null,
          day: day.day,
          time: p.time,
          category: p.category,
          description: p.description,
          durationText,
          mapsUrl: p.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name + ', ' + city)}`,
          locationConfidence: confidence,
          placeIdx,
          dayIdx,
        }
      })
    }))
  }, [itinerary, refCoords, destination])

  // Resolve hotel coordinates and validate
  useEffect(() => {
    if (hotels && hotels.length > 0) {
      const coords = hotels
        .map(h => {
          const lat = parseFloat(h.latitude)
          const lng = parseFloat(h.longitude)
          if (!isNaN(lat) && !isNaN(lng)) {
            const hCoords = [lat, lng] as [number, number]
            const isInside = !refCoords || (Math.abs(lat - refCoords[0]) < 1.5 && Math.abs(lng - refCoords[1]) < 1.5)
            if (isInside) {
              return {
                ...h,
                coordinates: hCoords
              }
            }
          }
          return null
        })
        .filter((h): h is any => h !== null)
      setHotelCoords(coords)
    }
  }, [hotels, refCoords])

  // Fetch destination coordinates from Nominatim
  useEffect(() => {
    let mounted = true
    const city = destination ? destination.split(',')[0].trim() : ''
    if (!city) return

    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`, {
      headers: { 'User-Agent': 'TripSage-AI-Travel-OS/2.0' }
    })
      .then(res => res.json())
      .then(data => {
        if (!mounted) return
        if (data && data[0] && !isNaN(parseFloat(data[0].lat)) && !isNaN(parseFloat(data[0].lon))) {
          setDestCoord({
            name: data[0].display_name.split(',')[0],
            coordinates: [parseFloat(data[0].lat), parseFloat(data[0].lon)]
          })
        }
      })
      .catch(() => { /* ignore */ })
    return () => { mounted = false }
  }, [destination])

  // Load MapLibre GL CSS once
  useEffect(() => {
    if (!document.getElementById('maplibre-css')) {
      const link = document.createElement('link')
      link.id = 'maplibre-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css'
      document.head.appendChild(link)
    }
  }, [])

  // Helper to re-add sources and layers on style switches/fallbacks
  const addMapLayers = (mapInstance: any) => {
    // Layer management delegated to RouteLayer component
  }

  // Initialize mini preview map (Simple, accurate 2D map first)
  useEffect(() => {
    if (!isActive || !mapRef.current || typeof window === 'undefined') return

    let map: any = null
    import('maplibre-gl').then(maplibregl => {
      maplibreglRef.current = maplibregl

      const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || '3ffd189110c8416c8e2c733950e9d50d'
      const styleUrl = `https://maps.geoapify.com/v1/styles/osm-bright/style.json?apiKey=${apiKey}`

      map = new maplibregl.Map({
        container: mapRef.current!,
        style: styleUrl,
        center: refCoords ? [refCoords[1], refCoords[0]] : [78.9629, 20.5937],
        zoom: refCoords ? 11 : 4,
        pitch: 0,
        bearing: 0,
        antialias: true
      } as any)
      mapInstanceRef.current = map

      map.on('styledata', () => {
        addMapLayers(map)
      })

      map.on('load', () => {
        addMapLayers(map)
        setMapLoaded(true)
      })
    })

    return () => {
      setMapLoaded(false)
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [isActive, refCoords])

  // Center/Fit Bounds for active stops on day change
  const handleResetView = () => {
    const map = mapInstanceRef.current
    if (!map || !mapLoaded) return

    const activePlaces = mappedItinerary[activeDay]?.places || []
    const validCoords = activePlaces
      .filter((p: any) => p.coordinates)
      .map((p: any) => [p.coordinates[1], p.coordinates[0]] as [number, number]) // [lng, lat]

    if (validCoords.length > 0) {
      if (validCoords.length === 1) {
        map.flyTo({ center: validCoords[0], zoom: 13, duration: 1000 })
      } else {
        const bounds = validCoords.reduce(
          (acc: [[number, number], [number, number]], c: [number, number]) => [
            [Math.min(acc[0][0], c[0]), Math.min(acc[0][1], c[1])],
            [Math.max(acc[1][0], c[0]), Math.max(acc[1][1], c[1])],
          ],
          [[validCoords[0][0], validCoords[0][1]], [validCoords[0][0], validCoords[0][1]]]
        )
        map.fitBounds(bounds, { padding: 40, maxZoom: 14, duration: 1000 })
      }
    } else if (refCoords) {
      map.flyTo({ center: [refCoords[1], refCoords[0]], zoom: 11, duration: 1000 })
    }
  }

  // Day Tab Click
  const handleDaySelect = (dayIdx: number) => {
    setActiveDay(dayIdx)
    setSelectedPlaceId(null)

    const map = mapInstanceRef.current
    if (!map || !mapLoaded) return

    const dayPlaces = mappedItinerary[dayIdx]?.places || []
    const firstPlace = dayPlaces.find((p: any) => p.coordinates)
    if (firstPlace && firstPlace.coordinates) {
      const pinCoords = [firstPlace.coordinates[1], firstPlace.coordinates[0]] as [number, number]
      map.flyTo({
        center: pinCoords,
        zoom: 13,
        duration: 1200
      })
    }
  }

  // Update route path and markers on day selection
  useEffect(() => {
    const map = mapInstanceRef.current
    const maplibregl = maplibreglRef.current
    if (!map || !maplibregl || !mapLoaded) return

    // Clear existing markers
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    const dayPlaces = mappedItinerary[activeDay]?.places || []
    const coords = dayPlaces
      .filter((p: any) => p.coordinates)
      .map((p: any) => [p.coordinates[1], p.coordinates[0]] as [number, number]) // [lng, lat]

    // Set route path line
    const validStops = dayPlaces.filter((p: any) => 
      Array.isArray(p.coordinates) && 
      p.coordinates.length === 2 && 
      !isNaN(p.coordinates[0]) && 
      !isNaN(p.coordinates[1])
    ).filter((p: any, idx: number, arr: any[]) => {
      if (idx === 0) return true
      const prev = arr[idx - 1]
      const latDiff = Math.abs(p.coordinates[0] - prev.coordinates[0])
      const lngDiff = Math.abs(p.coordinates[1] - prev.coordinates[1])
      return latDiff > 0.0001 || lngDiff > 0.0001
    })

    if (validStops.length >= 2) {
      const waypoints = validStops.map((p: any) => ({
        latitude: p.coordinates[0],
        longitude: p.coordinates[1]
      }))
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      
      axios.post(`${apiBaseUrl}/api/location/route`, {
        waypoints,
        mode: 'walk'
      })
      .then(response => {
        if (response.data?.success && response.data?.route?.coordinates) {
          setRouteGeometry({
            type: 'LineString',
            coordinates: response.data.route.coordinates
          })
        }
      })
      .catch(err => {
        console.warn('[MapView] Routing API failed, falling back to straight line path:', err.message)
        setRouteGeometry({
          type: 'LineString',
          coordinates: coords
        })
      })
    } else {
      setRouteGeometry(null)
    }

    // Add marker pins
    dayPlaces.forEach((place: any) => {
      const pinCoords = place.coordinates ? [place.coordinates[1], place.coordinates[0]] as [number, number] : null
      if (!pinCoords) return

      const isSelected = selectedPlaceId === place.placeIdx
      const color = isSelected ? '#EA580C' : '#9CA3AF'
      const svgIcon = getSvgIconMarkup(place.category, color, 14)

      const el = document.createElement('div')
      el.className = 'custom-map-pin'
      el.style.cursor = 'pointer'
      el.style.zIndex = isSelected ? '100' : '10'
      el.style.transform = isSelected ? 'scale(1.08)' : 'scale(0.95)'
      el.style.transition = 'transform 0.2s ease, z-index 0.2s ease'
      
      el.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; filter: drop-shadow(${isSelected ? '0 8px 16px rgba(234, 88, 12, 0.25)' : '0 4px 6px rgba(0,0,0,0.1)'});">
          <div style="background: white; border-radius: 12px; padding: 4px 8px; border: 2.5px solid ${color}; display: flex; align-items: center; gap: 4px; white-space: nowrap; max-width: 130px; box-shadow: 0 2px 6px rgba(0,0,0,0.06);">
            <span style="display: flex; align-items: center; justify-content: center; width: 14px; height: 14px;">${svgIcon}</span>
            <span style="font-size: 10px; font-weight: 700; color: ${isSelected ? '#EA580C' : '#374151'}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${place.placeName.split('—')[0].trim()}</span>
          </div>
          <div style="width: 2.5px; height: 8px; background: ${color};"></div>
          <div style="width: 6px; height: 6px; background: ${color}; border-radius: 50%;"></div>
        </div>
      `

      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat(pinCoords)
        .addTo(map)

      el.addEventListener('click', () => {
        setSelectedPlaceId(place.placeIdx)
        map.flyTo({ center: pinCoords, zoom: 15, duration: 800 })
        const itemEl = document.getElementById(`stop-card-${place.placeIdx}`)
        if (itemEl) {
          itemEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }
      })

      markersRef.current.push(marker)
    })

    // Fit view on first load of the day
    handleResetView()

  }, [activeDay, mapLoaded, selectedPlaceId, mappedItinerary])

  // 3. Compute Travel Segments and Metrics dynamically
  const currentDayPlaces = mappedItinerary[activeDay]?.places || []
  
  const hotelOption = hotelCoords.length > 0 ? hotelCoords[0] : null
  const hotelCoordsPair = hotelOption?.coordinates as [number, number] | null

  // Compute daily segments
  const dailySegments = useMemo(() => {
    const segments: Array<{
      type: 'stop' | 'travel'
      data?: any
      segmentIndex?: number
    }> = []

    if (currentDayPlaces.length === 0) return segments

    // Start Node (either Hotel or generic Start Area)
    segments.push({
      type: 'stop',
      data: {
        isStartNode: true,
        placeName: hotelOption ? hotelOption.name : 'Departure Point',
        category: 'accommodation',
        time: '09:30 AM',
        coordinates: hotelCoordsPair
      }
    })

    // Travel from start area to first stop
    let firstPlace = currentDayPlaces[0]
    let startToFirstDistance = (hotelCoordsPair && firstPlace.coordinates) 
      ? getHaversineDistance(hotelCoordsPair, firstPlace.coordinates)
      : null
    
    segments.push({
      type: 'travel',
      segmentIndex: 0,
      data: getTravelStats(startToFirstDistance)
    })

    // Stops and travel segments in between
    for (let i = 0; i < currentDayPlaces.length; i++) {
      const p = currentDayPlaces[i]
      segments.push({
        type: 'stop',
        data: p
      })

      if (i < currentDayPlaces.length - 1) {
        const nextP = currentDayPlaces[i + 1]
        const dist = (p.coordinates && nextP.coordinates)
          ? getHaversineDistance(p.coordinates, nextP.coordinates)
          : null
        
        segments.push({
          type: 'travel',
          segmentIndex: i + 1,
          data: getTravelStats(dist)
        })
      }
    }

    // Travel from last stop back to Hotel / end area
    let lastPlace = currentDayPlaces[currentDayPlaces.length - 1]
    let lastToEndDistance = (hotelCoordsPair && lastPlace.coordinates)
      ? getHaversineDistance(lastPlace.coordinates, hotelCoordsPair)
      : null

    segments.push({
      type: 'travel',
      segmentIndex: currentDayPlaces.length,
      data: getTravelStats(lastToEndDistance)
    })

    // End Node
    segments.push({
      type: 'stop',
      data: {
        isEndNode: true,
        placeName: hotelOption ? hotelOption.name : 'Return Point',
        category: 'accommodation',
        time: '08:30 PM',
        coordinates: hotelCoordsPair
      }
    })

    return segments
  }, [currentDayPlaces, hotelOption, hotelCoordsPair])

  // Travel Stats Calculator
  function getTravelStats(dist: number | null) {
    if (dist === null) {
      return {
        mode: 'Cab',
        time: 15,
        cost: 150,
        distanceText: 'N/A',
        note: 'Coordinates pending validation. Cab estimated.'
      }
    }

    if (dist < 0.8) {
      return {
        mode: 'Walk',
        time: Math.round(dist * 12 + 1),
        cost: 0,
        distanceText: `${dist.toFixed(1)} km`,
        note: 'Short hop — perfect for a morning walk.'
      }
    } else if (dist < 3.5) {
      return {
        mode: 'Auto',
        time: Math.round(dist * 3.5 + 4),
        cost: Math.round(30 + dist * 12),
        distanceText: `${dist.toFixed(1)} km`,
        note: 'Quick auto ride — best to negotiate fare.'
      }
    } else {
      return {
        mode: 'Cab',
        time: Math.round(dist * 3.0 + 5),
        cost: Math.round(80 + dist * 20),
        distanceText: `${dist.toFixed(1)} km`,
        note: 'Avoid peak traffic — cab is most comfortable.'
      }
    }
  }

  // Calculate Intelligence Statistics
  const routeIntelligence = useMemo(() => {
    let travelTime = 0
    let travelCost = 0
    let walkingDist = 0
    
    dailySegments.forEach(seg => {
      if (seg.type === 'travel' && seg.data) {
        travelTime += seg.data.time
        travelCost += seg.data.cost
        if (seg.data.mode === 'Walk' && seg.data.distanceText !== 'N/A') {
          walkingDist += parseFloat(seg.data.distanceText)
        }
      }
    })

    // Duration of stop stays
    let stopDurationMin = 0
    currentDayPlaces.forEach((p: any) => {
      if (p.category === 'dining') stopDurationMin += 90
      else if (p.category === 'activity') stopDurationMin += 150
      else stopDurationMin += 120
    })

    const totalTimeHours = ((travelTime + stopDurationMin) / 60).toFixed(1)
    const formattedCost = formatPrice(travelCost, currency)

    // Walking load
    const walkingLoad = walkingDist < 1.0 ? 'Low' : walkingDist < 2.5 ? 'Medium' : 'High'
    const routeDifficulty = walkingLoad === 'High' ? 'Moderate' : 'Easy'

    // Best start time
    const startHour = currentDayPlaces.length > 0 ? currentDayPlaces[0].time : '10:00 AM'

    // Weather impact
    let weatherNote = 'Pleasant — perfect weather for walking segments.'
    if (weather?.temperature > 32) {
      weatherNote = 'High heat — stay hydrated. Cabs recommended over walking during peak hours.'
    } else if (weather?.percentage > 50) {
      weatherNote = 'Rain expected — minor delays expected. Carry umbrella.'
    }

    // Budget Fit
    const budgetNote = travelCost < 300 ? 'Excellent fit — highly economical route layout.' : 'Optimal fit — standard city transit budget.'

    return {
      totalTimeHours,
      formattedCost,
      walkingLoad,
      routeDifficulty,
      bestStartHour: startHour,
      weatherNote,
      budgetNote
    }
  }, [dailySegments, currentDayPlaces, weather, currency])

  // Open multi-stop route on Google Maps
  const handleOpenFullRoute = () => {
    const verifiedStops = currentDayPlaces.filter((p: any) => p.coordinates)
    if (verifiedStops.length < 2) return

    const origin = encodeURIComponent(verifiedStops[0].placeName)
    const dest = encodeURIComponent(verifiedStops[verifiedStops.length - 1].placeName)
    const waypoints = verifiedStops
      .slice(1, -1)
      .map((p: any) => encodeURIComponent(p.placeName))
      .join('|')

    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}${waypoints ? `&waypoints=${waypoints}` : ''}`
    window.open(url, '_blank')
  }

  // Handle stop replace
  const handleSearchPlaces = async () => {
    if (!searchQuery.trim()) return
    setSearching(true)
    setSelectedResult(null)
    const city = destination.split(',')[0].trim()
    try {
      const q = searchQuery.toLowerCase().includes(city.toLowerCase()) ? searchQuery : `${searchQuery}, ${city}`
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5`, {
        headers: { 'User-Agent': 'TripSage-AI-Travel-OS/2.0' }
      })
      const data = await res.json()
      setSearchResults(data || [])
      if (!data || data.length === 0) {
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
    const lat = parseFloat(selectedResult.lat)
    const lng = parseFloat(selectedResult.lon)
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
            coordSource: 'user_resolved',
            formattedAddress: selectedResult.display_name,
            googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery + ', ' + selectedResult.display_name)}`
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
    toast.success(`Replaced with "${searchQuery}"!`)
  }

  const verifiedStopsCount = currentDayPlaces.filter((p: any) => p.coordinates).length
  const unresolvedStopsCount = currentDayPlaces.filter((p: any) => p.locationConfidence === 'unresolved').length

  return (
    <div className="space-y-5 bg-[#FBFBFA] p-4 sm:p-6 rounded-2xl border border-[#E8E0D8] text-left">
      
      {/* Header & Days Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#F2ECE4] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
            <Navigation className="text-[#EA580C]" size={20} strokeWidth={2.5} />
            <span>Route Board</span>
          </h2>
          <p className="text-xs text-[#6B6B6B] mt-1">Daily movement, local travel times, and Google Maps handoff</p>
        </div>

        {/* Day Selectors */}
        <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar max-w-full">
          {mappedItinerary.map((day, i) => {
            const isDayActive = activeDay === i
            return (
              <button
                key={i}
                onClick={() => handleDaySelect(i)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isDayActive
                    ? 'bg-[#EA580C] text-white shadow-sm'
                    : 'bg-white text-[#6B6B6B] border border-[#E8E0D8] hover:bg-[#FFFBF7]'
                }`}
              >
                Day {day.day}
              </button>
            )
          })}
        </div>
      </div>

      {/* Desktop / Responsive Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start font-sans">
        
        {/* Left Column: Full-Height Map */}
        <div className="w-full lg:sticky lg:top-[124px] space-y-5">
          <div className="card p-3 overflow-hidden border border-[#E8E0D8] rounded-2xl bg-white shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#A1A1A1]">Route Map</span>
              <button 
                onClick={handleResetView}
                className="text-[10px] font-bold text-[#EA580C] hover:underline flex items-center gap-0.5"
              >
                Reset view
              </button>
            </div>
            
            <div className="relative h-[550px] w-full bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
              <div ref={mapRef} className="w-full h-full z-10"></div>
              {mapInstanceRef.current && (
                <RouteLayer map={mapInstanceRef.current} geometry={routeGeometry} />
              )}
              {verifiedStopsCount === 0 && (
                <div className="absolute inset-0 bg-slate-50/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-4 text-center">
                  <AlertTriangle className="text-red-500 mb-2 animate-bounce" size={24} />
                  <p className="text-xs font-bold text-[#1A1A1A]">Location review needed</p>
                  <p className="text-[10px] text-[#6B6B6B] mt-1 max-w-[200px]">Stops lack valid coordinates. Map preview hidden.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Timeline & Route Intelligence */}
        <div className="w-full space-y-5">
          {/* Daily Route Timeline */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#A1A1A1] px-1">Daily Route Timeline</h3>

            <div className="relative pl-6 border-l-2 border-[#E8E0D8] space-y-6 ml-4 py-2">
              {dailySegments.map((segment, idx) => {
                
                if (segment.type === 'stop') {
                  const stop = segment.data
                  const isStartOrEnd = stop.isStartNode || stop.isEndNode
                  const isSelected = selectedPlaceId === stop.placeIdx

                  return (
                    <div 
                      key={idx} 
                      id={stop.placeIdx != null ? `stop-card-${stop.placeIdx}` : undefined}
                      onClick={() => {
                        if (stop.placeIdx != null && stop.coordinates) {
                          setSelectedPlaceId(stop.placeIdx)
                          mapInstanceRef.current?.flyTo({
                            center: [stop.coordinates[1], stop.coordinates[0]],
                            zoom: 15,
                            duration: 800
                          })
                        }
                      }}
                      className={`relative p-4 rounded-xl border transition-all ${
                        isStartOrEnd 
                          ? 'bg-slate-50 border-slate-200' 
                          : isSelected 
                          ? 'bg-orange-50/10 border-[#EA580C] shadow-sm ring-1 ring-[#EA580C]/20' 
                          : 'bg-white border-[#E8E0D8] hover:border-[#CBD5E1] cursor-pointer'
                      }`}
                    >
                      {/* Circle Node Indicator */}
                      <div className={`absolute -left-[33px] top-5 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                        isStartOrEnd ? 'border-slate-400' : isSelected ? 'border-[#EA580C]' : 'border-[#CBD5E1]'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          isStartOrEnd ? 'bg-slate-400' : isSelected ? 'bg-[#EA580C]' : 'bg-[#CBD5E1]'
                        }`} />
                      </div>

                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg border shrink-0 ${
                            isStartOrEnd ? 'bg-slate-100 border-slate-200 text-slate-500' : 'bg-orange-50/10 border-orange-100 text-[#EA580C]'
                          }`}>
                            {renderCategoryIcon(stop.category, 16)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold text-[#A1A1A1] font-mono">{stop.time}</span>
                              {!isStartOrEnd && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-50 text-slate-400 border uppercase font-mono tracking-wider">
                                  {stop.durationText}
                                </span>
                              )}
                            </div>
                            <h4 className={`text-xs font-bold mt-1 ${isStartOrEnd ? 'text-slate-500' : 'text-[#1A1A1A]'}`}>
                              {stop.placeName.split('—')[0].trim()}
                            </h4>
                            {!isStartOrEnd && stop.description && (
                              <p className="text-[10px] text-[#6B6B6B] mt-1 leading-relaxed line-clamp-2">
                                {stop.description}
                              </p>
                            )}
                            {!isStartOrEnd && stop.estimatedCost != null && (
                              <p className="text-[10px] font-bold text-[#EA580C] mt-1.5 font-mono">
                                Est. spend: {formatPrice(stop.estimatedCost, currency)}
                              </p>
                            )}

                            {/* Warnings / Badges */}
                            {!isStartOrEnd && stop.locationConfidence === 'unresolved' && (
                              <div className="flex items-center gap-1 text-[9px] font-bold text-red-500 bg-red-50 border border-red-200 rounded px-1.5 py-0.5 mt-2.5 w-max">
                                <AlertTriangle size={10} /> Location needs review
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Card Actions */}
                        {!isStartOrEnd && (
                          <div className="flex flex-col gap-1.5 shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                if (stop.locationConfidence !== 'unresolved') {
                                  window.open(stop.mapsUrl, '_blank')
                                } else {
                                  toast.error("Coordinate resolution required.")
                                }
                              }}
                              disabled={stop.locationConfidence === 'unresolved'}
                              className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold flex items-center gap-1 transition-colors ${
                                stop.locationConfidence !== 'unresolved'
                                  ? 'text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200'
                                  : 'text-slate-300 bg-slate-50 border border-slate-100 cursor-not-allowed'
                              }`}
                            >
                              Open place <ExternalLink size={10} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setReplaceTarget({
                                  dayIdx: stop.dayIdx,
                                  placeIdx: stop.placeIdx,
                                  placeName: stop.placeName
                                })
                                setSearchQuery(stop.placeName.split('—')[0].trim())
                                setShowReplaceModal(true)
                              }}
                              className="px-2.5 py-1.5 rounded-lg text-[9px] font-bold text-[#EA580C] bg-orange-50/50 hover:bg-orange-50 border border-orange-100 text-center"
                            >
                              Replace
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                } else {
                  // Render Travel Segment
                  const travel = segment.data
                  if (!travel) return null

                  return (
                    <div key={idx} className="my-2 py-1 pl-4 relative group">
                      {/* Tiny connector line highlight */}
                      <div className="absolute -left-[25px] top-0 bottom-0 w-0.5 bg-orange-500/10 group-hover:bg-orange-500/40 transition-colors" />
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px]">
                        <div className="flex items-center gap-1.5 text-slate-700 font-semibold bg-white border border-slate-100 shadow-sm rounded-lg px-2.5 py-1">
                          <Footprints size={12} className="text-[#EA580C]" />
                          <span>{travel.mode} ({travel.distanceText})</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-500 font-medium">
                          <Clock size={12} />
                          <span>{travel.time} mins</span>
                        </div>
                        {travel.cost > 0 && (
                          <div className="flex items-center gap-1 text-[#EA580C] font-semibold">
                            <Coins size={12} />
                            <span>{formatPrice(travel.cost, currency)}</span>
                          </div>
                        )}
                        <span className="text-[10px] text-slate-400 italic font-medium">{travel.note}</span>
                      </div>
                    </div>
                  )
                }
              })}
            </div>
          </div>

          {/* Route Intelligence Statistics Panel */}
          <div className="card p-5 border border-[#E8E0D8] rounded-2xl bg-white shadow-sm space-y-4 text-xs">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#A1A1A1] border-b pb-2.5 border-slate-100">
              Route Intelligence
            </h3>

            {/* Metrics List */}
            <div className="space-y-3">
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-medium">Total Local Travel Time</span>
                <span className="font-bold text-[#1A1A1A]">{routeIntelligence.totalTimeHours} hours</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-medium">Est. Local Transport Cost</span>
                <span className="font-bold text-[#EA580C]">{routeIntelligence.formattedCost}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-medium">Walking Load</span>
                <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                  routeIntelligence.walkingLoad === 'Low' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                  routeIntelligence.walkingLoad === 'Medium' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                  'bg-red-50 text-red-600 border border-red-100'
                }`}>{routeIntelligence.walkingLoad}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-medium">Route Difficulty</span>
                <span className="font-bold text-[#1A1A1A]">{routeIntelligence.routeDifficulty}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-medium">Best Start Time</span>
                <span className="font-bold text-[#1A1A1A] font-mono">{routeIntelligence.bestStartHour}</span>
              </div>
            </div>

            {/* Insights & Warnings */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5 text-[11px] leading-relaxed">
              {unresolvedStopsCount > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex gap-2 text-red-800">
                  <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">{unresolvedStopsCount} locations need review</p>
                    <p className="text-red-600 text-[10px] mt-0.5">Please update stops with missing coordinates using Replace to enable route calculation.</p>
                  </div>
                </div>
              )}
              
              <div className="p-2.5 bg-orange-50/40 border border-orange-100/50 rounded-xl text-[#C2410C]">
                <p className="font-bold">Weather Advisory</p>
                <p className="text-[10px] mt-0.5">{routeIntelligence.weatherNote}</p>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-150 rounded-xl text-slate-600">
                <p className="font-bold">Budget Insight</p>
                <p className="text-[10px] mt-0.5">{routeIntelligence.budgetNote}</p>
              </div>
            </div>

            {/* Large Maps Directions Button */}
            <div className="pt-2">
              <button
                onClick={handleOpenFullRoute}
                disabled={verifiedStopsCount < 2}
                className={`w-full py-3 rounded-xl font-bold text-white text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] ${
                  verifiedStopsCount >= 2 ? 'bg-[#EA580C] hover:bg-[#C2410C] shadow-sm' : 'bg-slate-150 text-slate-400 cursor-not-allowed border border-slate-200'
                }`}
              >
                <Navigation size={14} /> Open full route in Google Maps
              </button>
              {verifiedStopsCount < 2 && (
                <p className="text-[9px] text-slate-400 text-center font-medium mt-1.5">
                  Add at least two verified places to open directions.
                </p>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Replace Stop Search Modal */}
      {showReplaceModal && replaceTarget && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowReplaceModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-[#E8E0D8] flex items-center justify-between bg-[#FFFBF7]">
              <h3 className="font-bold text-[#1A1A1A] text-base">Replace Stop</h3>
              <button onClick={() => setShowReplaceModal(false)} className="p-1 hover:bg-[#E8E0D8] rounded-lg transition-colors text-[#6B6B6B]">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4 text-left">
              <p className="text-xs text-[#6B6B6B]">
                Replace <span className="font-bold text-[#1A1A1A]">"{replaceTarget.placeName}"</span> with a new place at your destination.
              </p>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter new place name..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="input-field flex-1 text-xs border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-[#EA580C]"
                  onKeyDown={e => e.key === 'Enter' && handleSearchPlaces()}
                />
                <button
                  onClick={handleSearchPlaces}
                  disabled={searching}
                  className="btn-primary bg-[#EA580C] hover:bg-[#C2410C] px-4 py-2.5 font-bold text-white rounded-lg text-xs shrink-0 flex items-center gap-1.5 active:scale-[0.98]"
                >
                  {searching ? 'Searching...' : <><RefreshCw size={12} /> Search</>}
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-1.5 max-h-48 overflow-y-auto border border-[#E8E0D8] rounded-xl p-2 bg-[#FFFBF7]">
                  <p className="text-[10px] font-bold text-[#9CA3AF] uppercase px-1">Select matching address:</p>
                  {searchResults.map((res, idx) => {
                    const isSelected = selectedResult?.place_id === res.place_id
                    return (
                      <div
                        key={idx}
                        onClick={() => { setSelectedResult(res); setSearchQuery(res.display_name.split(',')[0]); }}
                        className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#EA580C] bg-orange-50/20 text-[#EA580C] font-semibold'
                            : 'border-transparent hover:bg-white hover:border-slate-200 text-slate-700'
                        }`}
                      >
                        {res.display_name}
                      </div>
                    )
                  })}
                </div>
              )}

              {selectedResult && (
                <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-xl p-3 flex gap-2 items-start text-emerald-800 text-xs">
                  <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" strokeWidth={3} />
                  <div>
                    <p className="font-bold">Location resolved successfully!</p>
                    <p className="text-[11px] text-emerald-700 mt-0.5">Coordinates: {parseFloat(selectedResult.lat).toFixed(4)}, {parseFloat(selectedResult.lon).toFixed(4)}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-[#E8E0D8] bg-[#FFFBF7] flex justify-end gap-3">
              <button
                onClick={() => setShowReplaceModal(false)}
                className="btn-outline border-[#E8E0D8] px-4 py-2 rounded-lg text-xs hover:bg-white text-slate-600"
              >
                Cancel
              </button>
              <button
                disabled={!selectedResult}
                onClick={handleConfirmReplace}
                className={`px-5 py-2 font-bold text-white rounded-lg text-xs ${
                  selectedResult ? 'bg-[#EA580C] hover:bg-[#C2410C] cursor-pointer' : 'bg-slate-200 cursor-not-allowed text-slate-400'
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
