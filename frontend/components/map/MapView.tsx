'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { useTripStore } from '@/store/tripStore'
import { Plus, Minus, Compass, Navigation, AlertTriangle, RefreshCw, X, Check, Plane, MapPin, Map } from 'lucide-react'
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

export default function MapView({
  itinerary: rawItinerary,
  tripContext,
  isActive = false,
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
  const originBadgeRef = useRef<any>(null)
  const destBadgeRef = useRef<any>(null)
  const animFrameRef = useRef<number | null>(null)
  const planeMarkerRef = useRef<any>(null)

  // State
  const [mapLoaded, setMapLoaded] = useState(false)
  const [destCoord, setDestCoord] = useState<{ name: string; coordinates: [number, number] } | null>(null)
  const [originCoord, setOriginCoord] = useState<{ name: string; coordinates: [number, number] } | null>(null)
  const [activeDay, setActiveDay] = useState(0)
  const [mapMode, setMapMode] = useState<'flight' | 'sightseeing'>('flight')
  const [selectedStop, setSelectedStop] = useState<any | null>(null)
  const [showQrCode, setShowQrCode] = useState(false)

  // Replace modal states
  const [showReplaceModal, setShowReplaceModal] = useState(false)
  const [replaceTarget, setReplaceTarget] = useState<{ dayIdx: number; placeIdx: number; placeName: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedResult, setSelectedResult] = useState<any | null>(null)

  const destination = tripContext?.destination || ''
  const origin = tripContext?.startLocation || ''

  // ── Resolve destination reference coordinate ──────────────────────────────
  const refCoords = useMemo((): [number, number] | null => {
    if (destCoord?.coordinates) return destCoord.coordinates
    const clean = destination.toLowerCase()
    for (const [key, coords] of Object.entries(FALLBACK_COORDS)) {
      if (clean.includes(key)) return coords
    }
    for (const day of itinerary) {
      for (const p of day?.places || []) {
        const rawLat = p.lat ?? (Array.isArray(p.coordinates) ? p.coordinates[0] : undefined)
        const rawLng = p.lng ?? (Array.isArray(p.coordinates) ? p.coordinates[1] : undefined)
        if (rawLat != null && rawLng != null && !isNaN(+rawLat) && !isNaN(+rawLng)) {
          const lat = +rawLat, lng = +rawLng
          if (Math.abs(lat - 20) > 2 || Math.abs(lng - 70) > 2) return [lat, lng]
        }
      }
    }
    return null
  }, [destCoord, destination, itinerary])

  // ── Map validated itinerary stops with full details ──────────────────────
  const allValidStops = useMemo(() => {
    const stops: { lat: number; lng: number; name: string; dayIdx: number; placeIdx: number; time?: string; description?: string }[] = []
    itinerary.forEach((day, dayIdx) => {
      ;(day?.places || []).forEach((p: any, placeIdx: number) => {
        const rawLat = p.lat ?? (Array.isArray(p.coordinates) ? p.coordinates[0] : p.latitude ?? undefined)
        const rawLng = p.lng ?? (Array.isArray(p.coordinates) ? p.coordinates[1] : p.longitude ?? undefined)
        if (rawLat == null || rawLng == null) return
        const lat = +rawLat, lng = +rawLng
        if (isNaN(lat) || isNaN(lng)) return
        if (!isValidLngLat([lng, lat])) return
        if (refCoords && (Math.abs(lat - refCoords[0]) > 1.5 || Math.abs(lng - refCoords[1]) > 1.5)) return
        stops.push({
          lat,
          lng,
          name: p.name || '',
          dayIdx,
          placeIdx,
          time: p.time,
          description: p.description,
        })
      })
    })
    return stops
  }, [itinerary, refCoords])

  // ── Nominatim: destination ────────────────────────────────────────────────
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

  // ── Nominatim: origin ─────────────────────────────────────────────────────
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

  // ── Initialize Map with Geoapify OSM-Carto tiles ──────────────────────────
  useEffect(() => {
    if (!isActive || !mapRef.current || typeof window === 'undefined') return

    let map: any = null
    import('maplibre-gl').then(maplibregl => {
      if (!mapRef.current) return
      maplibreglRef.current = maplibregl

      const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY ?? '3ffd189110c8416c8e2c733950e9d50d'
      const styleUrl = `https://maps.geoapify.com/v1/styles/osm-carto/style.json?apiKey=${apiKey || '3ffd189110c8416c8e2c733950e9d50d'}`

      map = new maplibregl.Map({
        container: mapRef.current,
        style: styleUrl,
        center: refCoords ? [refCoords[1], refCoords[0]] : [78.9629, 20.5937],
        zoom: refCoords ? 10 : 4,
        pitch: 0,
        bearing: 0,
        attributionControl: false,
      } as any)

      map.addControl(
        new maplibregl.AttributionControl({ compact: true }),
        'bottom-right'
      )

      mapInstanceRef.current = map
      map.on('load', () => setMapLoaded(true))
    })

    return () => {
      setMapLoaded(false)
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      if (planeMarkerRef.current) { planeMarkerRef.current.remove(); planeMarkerRef.current = null }
      if (originBadgeRef.current) { originBadgeRef.current.remove(); originBadgeRef.current = null }
      if (destBadgeRef.current) { destBadgeRef.current.remove(); destBadgeRef.current = null }
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [isActive, refCoords])

  // ── Flight arc + city badges + animated plane ─────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current
    const mgl = maplibreglRef.current
    if (!map || !mgl || !mapLoaded || !originCoord || !destCoord) return

    // Cleanup previous
    if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null }
    if (planeMarkerRef.current) { planeMarkerRef.current.remove(); planeMarkerRef.current = null }
    if (originBadgeRef.current) { originBadgeRef.current.remove(); originBadgeRef.current = null }
    if (destBadgeRef.current) { destBadgeRef.current.remove(); destBadgeRef.current = null }
    try {
      if (map.getLayer('flight-track-line')) map.removeLayer('flight-track-line')
      if (map.getLayer('flight-track-glow')) map.removeLayer('flight-track-glow')
      if (map.getSource('flight-track')) map.removeSource('flight-track')
    } catch (_) {}

    const sCoords = originCoord.coordinates  // [lat, lng]
    const eCoords = destCoord.coordinates    // [lat, lng]
    const arcPoints = buildFlightArc(sCoords, eCoords, 100)

    // Add source
    map.addSource('flight-track', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates: arcPoints },
      },
    })

    // Glow layer
    map.addLayer({
      id: 'flight-track-glow',
      type: 'line',
      source: 'flight-track',
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': '#93C5FD',
        'line-width': 6,
        'line-opacity': 0.35,
      },
    })

    // Main line
    map.addLayer({
      id: 'flight-track-line',
      type: 'line',
      source: 'flight-track',
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': '#2563EB',
        'line-width': 2.5,
        'line-dasharray': [4, 3],
      },
    })

    // Make badge chips
    const makeChip = (code: string): HTMLElement => {
      const el = document.createElement('div')
      el.style.cssText = 'display:flex;flex-direction:column;align-items:center;'
      el.innerHTML = `
        <div style="
          background:#1E3A8A;
          color:white;
          font-weight:800;
          font-size:11px;
          letter-spacing:0.08em;
          padding:5px 12px;
          border-radius:20px;
          box-shadow:0 4px 14px rgba(30,58,138,0.45);
          white-space:nowrap;
          font-family:Inter,ui-sans-serif,sans-serif;
          border:2px solid rgba(255,255,255,0.25);
        ">${code}</div>
        <div style="width:2px;height:8px;background:#1E3A8A;margin-top:0;"></div>
        <div style="width:7px;height:7px;background:#1E3A8A;border-radius:50%;margin-top:0;box-shadow:0 2px 6px rgba(30,58,138,0.4);"></div>
      `
      return el
    }

    const originCode = getCityCode(originCoord.name || origin)
    const destCode   = getCityCode(destCoord.name   || destination)

    originBadgeRef.current = new mgl.Marker({ element: makeChip(originCode), anchor: 'bottom' })
      .setLngLat([sCoords[1], sCoords[0]])
      .addTo(map)

    destBadgeRef.current = new mgl.Marker({ element: makeChip(destCode), anchor: 'bottom' })
      .setLngLat([eCoords[1], eCoords[0]])
      .addTo(map)

    // Plane animation removed — static arc line shown instead
    const t = setTimeout(() => {}, 0)

    // Trigger initial positioning view
    if (mapMode === 'flight') {
      map.fitBounds(
        [
          [Math.min(sCoords[1], eCoords[1]), Math.min(sCoords[0], eCoords[0])],
          [Math.max(sCoords[1], eCoords[1]), Math.max(sCoords[0], eCoords[0])],
        ],
        { padding: { top: 100, bottom: 100, left: 80, right: 80 }, maxZoom: 8, duration: 1000 }
      )
    }

    return () => {
      clearTimeout(t)
    }
  }, [mapLoaded, originCoord, destCoord, mapMode])

  // ── Render stops/pins dynamically based on activeDay/mapMode ─────────────
  useEffect(() => {
    const map = mapInstanceRef.current
    const mgl = maplibreglRef.current
    if (!map || !mgl || !mapLoaded) return

    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    // If in sightseeing mode, filter and display stops for current activeDay
    const visibleStops = mapMode === 'sightseeing'
      ? allValidStops.filter(s => s.dayIdx === activeDay)
      : []

    visibleStops.forEach(stop => {
      const el = document.createElement('div')
      el.style.cssText = 'display:flex;flex-direction:column;align-items:center;cursor:pointer;'
      el.innerHTML = `
        <div style="
          width:15px;height:15px;
          background:white;
          border:3px solid #2563EB;
          border-radius:50%;
          box-shadow:0 3px 10px rgba(37,99,235,0.45);
          transition:transform 0.15s;
        "></div>
      `
      el.addEventListener('mouseenter', () => {
        const dot = el.querySelector('div') as HTMLElement
        if (dot) dot.style.transform = 'scale(1.4)'
      })
      el.addEventListener('mouseleave', () => {
        const dot = el.querySelector('div') as HTMLElement
        if (dot) dot.style.transform = 'scale(1)'
      })

      // Click to open detailed glass card
      el.addEventListener('click', (e) => {
        e.stopPropagation()
        setSelectedStop(stop)
        map.flyTo({ center: [stop.lng, stop.lat], zoom: 14.5, duration: 800 })
      })

      const marker = new mgl.Marker({ element: el, anchor: 'center' })
        .setLngLat([stop.lng, stop.lat])
        .addTo(map)
      markersRef.current.push(marker)
    })

    // Fit sightseeing stops
    if (mapMode === 'sightseeing' && visibleStops.length > 0) {
      const coords = visibleStops.map(s => [s.lng, s.lat] as [number, number])
      if (coords.length === 1) {
        map.flyTo({ center: coords[0], zoom: 13, duration: 1000 })
      } else {
        const bounds = coords.reduce(
          (acc, c) => [
            [Math.min(acc[0][0], c[0]), Math.min(acc[0][1], c[1])],
            [Math.max(acc[1][0], c[0]), Math.max(acc[1][1], c[1])],
          ],
          [[coords[0][0], coords[0][1]], [coords[0][0], coords[0][1]]]
        )
        map.fitBounds(bounds, { padding: 80, maxZoom: 14, duration: 1000 })
      }
    }
  }, [mapLoaded, allValidStops, mapMode, activeDay])

  // ── Show/hide flight layer layers dynamically ────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !mapLoaded) return

    const showFlight = mapMode === 'flight' ? 'visible' : 'none'
    try {
      if (map.getLayer('flight-track-line')) map.setLayoutProperty('flight-track-line', 'visibility', showFlight)
      if (map.getLayer('flight-track-glow')) map.setLayoutProperty('flight-track-glow', 'visibility', showFlight)
    } catch (_) {}

    if (originBadgeRef.current) originBadgeRef.current.getElement().style.display = mapMode === 'flight' ? 'block' : 'none'
    if (destBadgeRef.current) destBadgeRef.current.getElement().style.display = mapMode === 'flight' ? 'block' : 'none'
    if (planeMarkerRef.current) planeMarkerRef.current.getElement().style.display = mapMode === 'flight' ? 'block' : 'none'
  }, [mapMode, mapLoaded])

  // ── Flight info pill data ─────────────────────────────────────────────────
  const flightInfo = useMemo(() => {
    if (!originCoord || !destCoord) return null
    const dist = getHaversineDistance(originCoord.coordinates, destCoord.coordinates)
    const totalMins = Math.round((dist / 700) * 60)
    const h = Math.floor(totalMins / 60)
    const m = totalMins % 60
    return {
      distKm: Math.round(dist),
      timeStr: h > 0 ? `${h}h ${m}m` : `${m}m`,
    }
  }, [originCoord, destCoord])

  // ── Google Maps multi-stop URL for QR Code ───────────────────────────────
  const googleMapsRouteUrl = useMemo(() => {
    const stops = allValidStops.filter(s => s.dayIdx === activeDay)
    if (stops.length === 0) return 'https://maps.google.com'
    if (stops.length === 1) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stops[0].name)}`
    }
    const org = encodeURIComponent(stops[0].name)
    const dst = encodeURIComponent(stops[stops.length - 1].name)
    const waypoints = stops.slice(1, -1).map(s => encodeURIComponent(s.name)).join('|')
    return `https://www.google.com/maps/dir/?api=1&origin=${org}&destination=${dst}${waypoints ? `&waypoints=${waypoints}` : ''}`
  }, [allValidStops, activeDay])

  // ── Zoom + reset handlers ─────────────────────────────────────────────────
  const handleZoomIn  = () => mapInstanceRef.current?.zoomIn({ duration: 300 })
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut({ duration: 300 })
  const handleReset   = () => {
    const map = mapInstanceRef.current
    if (!map) return
    setSelectedStop(null)
    if (mapMode === 'flight' && originCoord && destCoord) {
      const s = originCoord.coordinates
      const e = destCoord.coordinates
      map.fitBounds(
        [[Math.min(s[1], e[1]), Math.min(s[0], e[0])], [Math.max(s[1], e[1]), Math.max(s[0], e[0])]],
        { padding: { top: 100, bottom: 100, left: 80, right: 80 }, maxZoom: 8, duration: 1000 }
      )
    } else if (mapMode === 'sightseeing') {
      const dayStops = allValidStops.filter(s => s.dayIdx === activeDay)
      if (dayStops.length > 0) {
        const coords = dayStops.map(s => [s.lng, s.lat] as [number, number])
        const bounds = coords.reduce(
          (acc, c) => [
            [Math.min(acc[0][0], c[0]), Math.min(acc[0][1], c[1])],
            [Math.max(acc[1][0], c[0]), Math.max(acc[1][1], c[1])],
          ],
          [[coords[0][0], coords[0][1]], [coords[0][0], coords[0][1]]]
        )
        map.fitBounds(bounds, { padding: 80, maxZoom: 14, duration: 1000 })
      }
    } else if (refCoords) {
      map.flyTo({ center: [refCoords[1], refCoords[0]], zoom: 10, duration: 1000 })
    }
  }

  const handleDaySelect = (dayIdx: number) => {
    setActiveDay(dayIdx)
    setSelectedStop(null)
  }

  const originLabel = originCoord?.name || origin.split(',')[0] || ''
  const destLabel   = destCoord?.name   || destination.split(',')[0] || ''

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
            coordSource: 'user_resolved',
            formattedAddress: selectedResult.properties.formatted,
            googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery + ', ' + selectedResult.properties.formatted)}`
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

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border border-slate-200 shadow-sm bg-slate-100"
      style={{ height: 'calc(100vh - 200px)', minHeight: '480px', maxHeight: '580px' }}
      onClick={() => setSelectedStop(null)}
    >
      {/* Map canvas */}
      <div ref={mapRef} className="w-full h-full" />

      {/* ── Floating Map Mode Toggle (top-center) ───────────────────────── */}
      {destination && origin && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex p-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/50 shadow-lg pointer-events-auto">
          <button
            onClick={() => setMapMode('flight')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
              mapMode === 'flight'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Plane size={13} /> Flight Path
          </button>
          <button
            onClick={() => setMapMode('sightseeing')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
              mapMode === 'sightseeing'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <MapPin size={13} /> Sightseeing
          </button>
        </div>
      )}

      {/* ── Stop Details Popup Card (middle-left) ────────────────────────── */}
      {selectedStop && mapMode === 'sightseeing' && (
        <div
          className="absolute top-16 left-4 z-20 w-64 p-4 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/50 shadow-xl text-white text-left animate-fade-in pointer-events-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-start gap-2">
            <h4 className="text-sm font-bold truncate flex items-center gap-1">
              <MapPin size={14} className="text-red-400 shrink-0" />
              {selectedStop.name.split('—')[0].trim()}
            </h4>
            <button
              onClick={() => setSelectedStop(null)}
              className="text-slate-400 hover:text-white text-xs p-1"
            >
              <X size={14} />
            </button>
          </div>
          {selectedStop.time && (
            <p className="text-[10px] text-blue-400 mt-1 font-semibold font-mono">{selectedStop.time}</p>
          )}
          {selectedStop.description && (
            <p className="text-[11px] text-slate-300 mt-2 leading-relaxed line-clamp-3">
              {selectedStop.description}
            </p>
          )}
          <div className="flex gap-2 mt-3.5">
            <button
              onClick={() => {
                setReplaceTarget({
                  dayIdx: selectedStop.dayIdx,
                  placeIdx: selectedStop.placeIdx,
                  placeName: selectedStop.name
                })
                setSearchQuery(selectedStop.name.split('—')[0].trim())
                setShowReplaceModal(true)
              }}
              className="flex-1 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-200 text-[10px] font-semibold text-center transition-all flex items-center justify-center gap-1"
            >
              <RefreshCw size={11} /> Replace
            </button>
            <button
              onClick={() => {
                const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedStop.name)}`
                window.open(mapsUrl, '_blank')
              }}
              className="flex-1 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-semibold text-center transition-all flex items-center justify-center gap-1"
            >
              <Map size={11} /> Open Maps
            </button>
          </div>
        </div>
      )}

      {/* ── Zoom + Reset + QR controls (top-right) ──────────────────────── */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5 pointer-events-auto">
        <button
          onClick={handleZoomIn}
          className="w-9 h-9 bg-white rounded-xl shadow-md border border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center font-bold text-xl leading-none"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          className="w-9 h-9 bg-white rounded-xl shadow-md border border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center font-bold text-xl leading-none"
        >
          −
        </button>
        <button
          onClick={handleReset}
          title="Reset view"
          className="w-9 h-9 bg-white rounded-xl shadow-md border border-slate-200 text-blue-600 hover:bg-blue-50 active:scale-95 transition-all flex items-center justify-center"
        >
          <Compass size={16} />
        </button>

        {/* QR Code toggle */}
        {mapMode === 'sightseeing' && allValidStops.filter(s => s.dayIdx === activeDay).length > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); setShowQrCode(!showQrCode) }}
            className={`w-9 h-9 rounded-xl shadow-md border active:scale-95 transition-all flex items-center justify-center text-base ${
              showQrCode ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            title="Send route to phone"
          >
            📱
          </button>
        )}
      </div>

      {/* ── Floating QR Code popover ────────────────────────────────────── */}
      {showQrCode && mapMode === 'sightseeing' && (
        <div
          className="absolute top-16 right-16 z-20 w-44 p-3 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/50 shadow-xl flex flex-col items-center text-center animate-fade-in pointer-events-auto"
          onClick={e => e.stopPropagation()}
        >
          <p className="text-[9px] text-slate-300 font-medium leading-normal mb-2">Scan with phone camera to open Day {activeDay + 1} route in Google Maps app</p>
          <div className="bg-white p-1.5 rounded-xl">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(googleMapsRouteUrl)}`}
              alt="Route QR Code"
              className="w-24 h-24 select-none"
            />
          </div>
        </div>
      )}

      {/* ── Bottom Info Pill (Flight Path mode) ─────────────────────────── */}
      {mapMode === 'flight' && flightInfo && originLabel && destLabel && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-white whitespace-nowrap border border-white/10"
            style={{
              background: 'rgba(15,23,42,0.82)',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            }}
          >
            <span style={{ color: '#60A5FA' }}>✈</span>
            <span>{originLabel}</span>
            <span style={{ color: '#64748B' }}>→</span>
            <span>{destLabel}</span>
            <span style={{ color: '#475569', margin: '0 2px' }}>•</span>
            <span style={{ color: '#94A3B8' }}>{flightInfo.timeStr}</span>
            <span style={{ color: '#475569' }}>•</span>
            <span style={{ color: '#94A3B8' }}>{flightInfo.distKm.toLocaleString()} km</span>
          </div>
        </div>
      )}

      {/* ── Bottom Floating Day Slider (Sightseeing mode) ───────────────── */}
      {mapMode === 'sightseeing' && itinerary.length > 0 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 pointer-events-auto">
          <div className="flex gap-1.5 p-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/50 shadow-lg">
            {itinerary.map((day, idx) => (
              <button
                key={idx}
                onClick={() => handleDaySelect(idx)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                  activeDay === idx
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Day {day.day}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── No trip state overlay ────────────────────────────────────────── */}
      {!destination && !origin && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm">
          <Navigation className="text-blue-500 mb-3 animate-pulse" size={36} strokeWidth={1.5} />
          <p className="text-sm font-bold text-slate-700">Plan a trip to see your route</p>
          <p className="text-xs text-slate-500 mt-1.5">Enter your origin and destination to get started</p>
        </div>
      )}

      {/* ── Map loading shimmer ──────────────────────────────────────────── */}
      {!mapLoaded && (destination || origin) && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-100">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" style={{ borderWidth: '3px' }} />
            <p className="text-xs text-slate-500 font-medium">Loading map…</p>
          </div>
        </div>
      )}

      {/* ── Replace Stop Search Modal ────────────────────────────────────── */}
      {showReplaceModal && replaceTarget && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in pointer-events-auto"
          onClick={() => setShowReplaceModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-left"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-base">Replace Stop</h3>
              <button
                onClick={() => setShowReplaceModal(false)}
                className="p-1 hover:bg-slate-200 rounded-lg transition-colors text-slate-500"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-500">
                Replace <span className="font-bold text-slate-800">"{replaceTarget.placeName}"</span> with a new place.
              </p>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter new place name..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="flex-1 text-xs border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-blue-500 text-slate-700"
                  onKeyDown={e => e.key === 'Enter' && handleSearchPlaces()}
                />
                <button
                  onClick={handleSearchPlaces}
                  disabled={searching}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2.5 font-bold text-white rounded-lg text-xs shrink-0 flex items-center gap-1.5 active:scale-[0.98] transition-colors"
                >
                  {searching ? 'Searching...' : <><RefreshCw size={12} /> Search</>}
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-1.5 max-h-48 overflow-y-auto border border-slate-150 rounded-xl p-2 bg-slate-50">
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
                            : 'border-transparent hover:bg-white hover:border-slate-200 text-slate-750'
                        }`}
                      >
                        {res.properties.formatted}
                      </div>
                    )
                  })}
                </div>
              )}

              {selectedResult && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex gap-2 items-start text-emerald-800 text-xs">
                  <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" strokeWidth={3} />
                  <div>
                    <p className="font-bold">Location resolved successfully!</p>
                    <p className="text-[11px] text-emerald-700 mt-0.5">Coordinates: {parseFloat(selectedResult.properties.lat).toFixed(4)}, {parseFloat(selectedResult.properties.lon).toFixed(4)}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setShowReplaceModal(false)}
                className="border border-slate-200 px-4 py-2 rounded-lg text-xs hover:bg-white text-slate-500 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={!selectedResult}
                onClick={handleConfirmReplace}
                className={`px-5 py-2 font-bold text-white rounded-lg text-xs transition-colors ${
                  selectedResult ? 'bg-blue-600 hover:bg-blue-755 cursor-pointer' : 'bg-slate-200 cursor-not-allowed text-slate-400'
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
