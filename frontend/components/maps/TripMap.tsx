'use client'

import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import {
  Navigation,
  Compass,
  Loader2,
  Locate,
  Layers,
  Sparkles,
  CheckCircle2,
  Circle,
  MapPin,
  Send,
  X,
  Plus
} from 'lucide-react'
import RouteLayer from '@/components/maps/RouteLayer'
import { useTripStore } from '@/store/tripStore'

// Emojis for categories as per spec
const CATEGORY_EMOJIS: Record<string, string> = {
  accommodation: '🏨',
  hotel: '🏨',
  activity: '🎭',
  dining: '🍽',
  restaurant: '🍽',
  transport: '🚉',
  cafe: '☕',
  shopping: '🛍'
}

const getCategoryEmoji = (category: string) => {
  const clean = category?.toLowerCase() || ''
  return CATEGORY_EMOJIS[clean] || '📍'
}

interface Place {
  id?: string
  name: string
  category?: string
  coordinates?: number[] | [number, number] | null // [latitude, longitude]
  time?: string
  durationText?: string
  description?: string
}

interface TripMapProps {
  places: Place[]
  activeDay: number
}

// Retrieve auth token from state store in localStorage
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('tripsage-auth')
    if (raw) {
      const parsed = JSON.parse(raw)
      return parsed?.state?.token || null
    }
  } catch {}
  return null
}

const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371 // radius of earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export default function TripMap({ places, activeDay }: TripMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  const tripId = useTripStore((s) => s.currentTripId)
  const userProfile = useTripStore((s) => s.userProfile)
  const weather = useTripStore((s) => s.weather)

  const [mapLoaded, setMapLoaded] = useState(false)
  const [loadingRoute, setLoadingRoute] = useState(false)
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null)
  const [routeGeometry, setRouteGeometry] = useState<any>(null)

  // ── upgraded Location Navigation States ────────────────────────────────────
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null) // [lat, lng]
  const [isTrackingUser, setIsTrackingUser] = useState(false)
  const geolocationWatchId = useRef<number | null>(null)
  const userMarkerRef = useRef<any>(null)

  // ── upgraded Advanced Map Layers States ───────────────────────────────────
  const [activeLayers, setActiveLayers] = useState<string[]>([]) // "hotels", "restaurants", "cafes", "activities", "shopping"
  const [nearbyMarkers, setNearbyMarkers] = useState<any[]>([])
  const nearbyMarkersRefs = useRef<any[]>([])

  // ── upgraded Itinerary Progress Statuses States ────────────────────────────
  const [visitStatuses, setVisitStatuses] = useState<Record<string, 'completed' | 'current' | 'upcoming'>>({})

  // ── upgraded AI Travel Assistant States ───────────────────────────────────
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: "Hello! I am your AI Travel Navigator. Ask me anything about your current day's plan or where to go next!"
    }
  ])
  const [assistantInput, setAssistantInput] = useState('')
  const [assistantLoading, setAssistantLoading] = useState(false)
  const [recommendedMarker, setRecommendedMarker] = useState<any>(null)
  const recommendedMarkerRef = useRef<any>(null)

  // ── upgraded UI Panel Tab State ───────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'itinerary' | 'layers' | 'assistant'>('itinerary')

  // Collapse consecutive duplicate coordinates to avoid Routing API errors
  const validPlaces = (places || [])
    .filter(
      (p): p is Place & { coordinates: [number, number] } =>
        Array.isArray(p.coordinates) &&
        p.coordinates.length === 2 &&
        !isNaN(p.coordinates[0]) &&
        !isNaN(p.coordinates[1])
    )
    .filter((p, idx, arr) => {
      if (idx === 0) return true
      const prev = arr[idx - 1]
      const latDiff = Math.abs(p.coordinates[0] - prev.coordinates[0])
      const lngDiff = Math.abs(p.coordinates[1] - prev.coordinates[1])
      return latDiff > 0.0001 || lngDiff > 0.0001
    })

  // Load MapLibre CSS dynamically
  useEffect(() => {
    if (!document.getElementById('maplibre-css-sheet')) {
      const link = document.createElement('link')
      link.id = 'maplibre-css-sheet'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css'
      document.head.appendChild(link)
    }
  }, [])

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return

    let mapInstance: any = null
    const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || '3ffd189110c8416c8e2c733950e9d50d'
    const styleUrl = `https://maps.geoapify.com/v1/styles/osm-bright/style.json?apiKey=${apiKey}`

    import('maplibre-gl').then((maplibregl) => {
      mapInstance = new maplibregl.Map({
        container: mapContainerRef.current!,
        style: styleUrl,
        center:
          validPlaces.length > 0
            ? [validPlaces[0].coordinates[1], validPlaces[0].coordinates[0]]
            : [78.9629, 20.5937],
        zoom: validPlaces.length > 0 ? 12 : 4,
        pitch: 0,
        bearing: 0,
      })

      mapRef.current = mapInstance

      // Add navigation controls
      mapInstance.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right')

      mapInstance.on('load', () => {
        setMapLoaded(true)
      })
    })

    return () => {
      if (mapInstance) {
        mapInstance.remove()
      }
      mapRef.current = null
      setMapLoaded(false)
    }
  }, [])

  // ── Geolocation tracking logic ──────────────────────────────────────────────
  useEffect(() => {
    if (isTrackingUser) {
      if (typeof window !== 'undefined' && navigator.geolocation) {
        geolocationWatchId.current = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords
            setUserCoords([latitude, longitude])

            // Save user location to backend
            const token = getAuthToken()
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
            axios
              .post(
                `${apiBaseUrl}/api/location/user-location`,
                { latitude, longitude },
                { headers: token ? { Authorization: `Bearer ${token}` } : {} }
              )
              .catch((err) => console.warn('Failed to save user location:', err.message))
          },
          (error) => {
            console.warn('Geolocation tracking error:', error)
            setIsTrackingUser(false)
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        )
      } else {
        console.warn('Geolocation is not supported by this browser.')
        setIsTrackingUser(false)
      }
    } else {
      if (geolocationWatchId.current !== null) {
        navigator.geolocation.clearWatch(geolocationWatchId.current)
        geolocationWatchId.current = null
      }
      if (userMarkerRef.current) {
        userMarkerRef.current.remove()
        userMarkerRef.current = null
      }
      setUserCoords(null)
    }

    return () => {
      if (geolocationWatchId.current !== null) {
        navigator.geolocation.clearWatch(geolocationWatchId.current)
      }
    }
  }, [isTrackingUser])

  // Draw user blue dot location marker on map
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapLoaded || !userCoords) return

    import('maplibre-gl').then((maplibregl) => {
      if (userMarkerRef.current) {
        userMarkerRef.current.setLngLat([userCoords[1], userCoords[0]])
      } else {
        const el = document.createElement('div')
        el.className = 'relative w-6 h-6 flex items-center justify-center'
        el.innerHTML = `
          <span class="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75 animate-ping"></span>
          <span class="relative rounded-full h-3.5 w-3.5 bg-blue-600 border-2 border-white shadow-md"></span>
        `

        userMarkerRef.current = new maplibregl.Marker({ element: el })
          .setLngLat([userCoords[1], userCoords[0]])
          .addTo(map)

        // Fly map to user location on initial lock
        map.flyTo({ center: [userCoords[1], userCoords[0]], zoom: 14, duration: 1500 })
      }
    })
  }, [userCoords, mapLoaded])

  // ── Load & save place visit statuses ────────────────────────────────────────
  useEffect(() => {
    if (!tripId) return

    const loadStatuses = async () => {
      const localKey = `tripsage_statuses_${tripId}`
      try {
        const cached = localStorage.getItem(localKey)
        if (cached) {
          setVisitStatuses(JSON.parse(cached))
        }
      } catch {}

      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
        const response = await axios.get(`${apiBaseUrl}/api/location/visit-status/${tripId}`)
        if (response.data?.success && Array.isArray(response.data?.data)) {
          const fetchedStatuses: Record<string, 'completed' | 'current' | 'upcoming'> = {}
          response.data.data.forEach((item: any) => {
            fetchedStatuses[item.placeId] = item.status
          })
          setVisitStatuses(fetchedStatuses)
          try {
            localStorage.setItem(localKey, JSON.stringify(fetchedStatuses))
          } catch {}
        }
      } catch (err: any) {
        console.warn('Failed to load visit statuses from backend:', err.message)
      }
    }

    loadStatuses()
  }, [tripId])

  const updatePlaceStatus = async (placeId: string, status: 'completed' | 'current' | 'upcoming') => {
    setVisitStatuses((prev) => ({ ...prev, [placeId]: status }))

    if (tripId) {
      const localKey = `tripsage_statuses_${tripId}`
      try {
        const stored = localStorage.getItem(localKey)
        const parsed = stored ? JSON.parse(stored) : {}
        parsed[placeId] = status
        localStorage.setItem(localKey, JSON.stringify(parsed))
      } catch {}

      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
        await axios.post(`${apiBaseUrl}/api/location/visit-status`, {
          tripId,
          placeId,
          status,
        })
      } catch (err: any) {
        console.warn('Failed to save visit status:', err.message)
      }
    }
  }

  // Geolocation auto-progress check
  useEffect(() => {
    if (!userCoords || !validPlaces.length) return

    validPlaces.forEach((place, idx) => {
      const placeId = place.id || `${activeDay}-${idx}`
      const currentStatus = visitStatuses[placeId] || 'upcoming'
      if (currentStatus === 'completed') return

      const dist = haversineDistance(
        userCoords[0],
        userCoords[1],
        place.coordinates[0],
        place.coordinates[1]
      )

      // Auto-complete if user is within 100 meters
      if (dist <= 0.1) {
        updatePlaceStatus(placeId, 'completed')
      }
    })
  }, [userCoords, validPlaces, visitStatuses])

  // ── Load & save Map Layers Recommendations ────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapLoaded) return

    // Clear previous nearby layer markers
    nearbyMarkersRefs.current.forEach((m) => m.remove())
    nearbyMarkersRefs.current = []

    if (activeLayers.length === 0 || (!userCoords && !validPlaces.length)) {
      setNearbyMarkers([])
      return
    }

    const searchCoords: [number, number] = userCoords
      ? [userCoords[0], userCoords[1]]
      : [validPlaces[0].coordinates[0], validPlaces[0].coordinates[1]]

    import('maplibre-gl').then(async (maplibregl) => {
      const allFetched: any[] = []

      for (const layer of activeLayers) {
        try {
          const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
          const res = await axios.post(`${apiBaseUrl}/api/location/nearby`, {
            latitude: searchCoords[0],
            longitude: searchCoords[1],
            category: layer,
            radius: 2000,
            travelStyle: userProfile?.travelStyle || 'adventure',
          })

          if (res.data?.success && Array.isArray(res.data?.data)) {
            const placesFound = res.data.data.slice(0, 10)
            placesFound.forEach((place: any) => {
              const emoji =
                layer === 'hotels'
                  ? '🏨'
                  : layer === 'restaurants'
                  ? '🍽'
                  : layer === 'cafes'
                  ? '☕'
                  : layer === 'activities'
                  ? '🎭'
                  : layer === 'shopping'
                  ? '🛍'
                  : '📍'

              const el = document.createElement('div')
              el.className =
                'w-8 h-8 flex items-center justify-center bg-slate-900 border border-slate-700 rounded-full shadow-lg cursor-pointer hover:scale-110 hover:border-blue-500 transition-all font-sans text-base z-20'
              el.innerHTML = emoji

              const popupContent = `
                <div class="p-2.5 font-sans text-slate-200 bg-slate-950 border border-slate-800 rounded-lg max-w-[200px]">
                  <h4 class="font-bold text-xs text-white leading-snug">${place.name}</h4>
                  <p class="text-[10px] text-slate-400 mt-1">${place.address}</p>
                  <div class="flex items-center gap-1.5 mt-2 text-[10px] font-semibold text-blue-400">
                    <span>⭐ ${place.details?.rating || '4.0'}</span>
                    <span class="text-slate-600">•</span>
                    <span class="capitalize">${place.details?.budget || 'medium'} cost</span>
                  </div>
                </div>
              `

              const popup = new maplibregl.Popup({ offset: 10, closeButton: false }).setHTML(
                popupContent
              )

              const marker = new maplibregl.Marker({ element: el })
                .setLngLat([place.longitude, place.latitude])
                .setPopup(popup)
                .addTo(map)

              nearbyMarkersRefs.current.push(marker)
              allFetched.push({ ...place, layer })
            })
          }
        } catch (err: any) {
          console.warn(`Failed to fetch nearby ${layer}:`, err.message)
        }
      }

      setNearbyMarkers(allFetched)
    })
  }, [activeLayers, userCoords, validPlaces, mapLoaded])

  const toggleLayer = (layer: string) => {
    setActiveLayers((prev) =>
      prev.includes(layer) ? prev.filter((l) => l !== layer) : [...prev, layer]
    )
  }

  // ── AI Travel Assistant Interaction ────────────────────────────────────────
  const handleAssistantSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!assistantInput.trim()) return

    const userMsg = assistantInput
    setChatMessages((prev) => [...prev, { role: 'user', text: userMsg }])
    setAssistantInput('')
    setAssistantLoading(true)

    const searchCoords = userCoords || (validPlaces.length > 0 ? validPlaces[0].coordinates : null)

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
      const response = await axios.post(`${apiBaseUrl}/api/location/assistant`, {
        message: userMsg,
        latitude: searchCoords ? searchCoords[0] : 0,
        longitude: searchCoords ? searchCoords[1] : 0,
        weather: weather || null,
        itinerary: validPlaces.map((p, idx) => ({
          id: p.id || `${activeDay}-${idx}`,
          name: p.name,
          latitude: p.coordinates[0],
          longitude: p.coordinates[1],
          visitTime: p.time,
          status: visitStatuses[p.id || `${activeDay}-${idx}`] || 'upcoming',
        })),
        preferences: {
          travelStyle: userProfile?.travelStyle || 'adventure',
          interests: userProfile?.preferences || [],
        },
      })

      if (response.data?.success && response.data?.data) {
        const { reply, recommendedPlace, coordinates, reason } = response.data.data
        setChatMessages((prev) => [...prev, { role: 'assistant', text: reply }])

        if (recommendedPlace && Array.isArray(coordinates) && coordinates.length === 2) {
          const [lat, lon] = coordinates
          const map = mapRef.current

          if (map && mapLoaded) {
            import('maplibre-gl').then((maplibregl) => {
              if (recommendedMarkerRef.current) {
                recommendedMarkerRef.current.remove()
              }

              const el = document.createElement('div')
              el.className =
                'w-10 h-10 flex items-center justify-center bg-amber-900 border-2 border-amber-500 rounded-full shadow-2xl cursor-pointer hover:scale-110 transition-all z-50 animate-bounce'
              el.innerHTML = '🌟'

              const popup = new maplibregl.Popup({ offset: 12, closeButton: false }).setHTML(`
                <div class="p-3 font-sans text-slate-200 bg-slate-950 border border-slate-800 rounded-lg max-w-[200px]">
                  <h4 class="font-bold text-xs text-amber-400 uppercase tracking-wide">⭐ Assistant Recommendation</h4>
                  <h4 class="font-bold text-sm text-white mt-1 leading-snug">${recommendedPlace}</h4>
                  <p class="text-[10px] text-slate-400 border-t border-slate-800 pt-1.5 mt-2 leading-relaxed">${reason}</p>
                </div>
              `)

              const marker = new maplibregl.Marker({ element: el })
                .setLngLat([lon, lat])
                .setPopup(popup)
                .addTo(map)

              recommendedMarkerRef.current = marker
              setRecommendedMarker({ name: recommendedPlace, lat, lon, reason })

              map.flyTo({ center: [lon, lat], zoom: 14, duration: 1500 })
            })
          }
        }
      } else {
        throw new Error('Invalid response structure')
      }
    } catch (err: any) {
      console.warn('AI Assistant failed:', err.message)
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: "I couldn't reach the AI server. However, based on your current day's itinerary, I suggest heading to your next planned attraction."
        }
      ])
    } finally {
      setAssistantLoading(false)
    }
  }

  // Update Markers, Route and FlyTo bounds
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapLoaded) return

    // Clear previous itinerary markers
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    if (validPlaces.length === 0) {
      setRouteGeometry(null)
      setRouteInfo(null)
      return
    }

    // Save itinerary to localStorage for offline access
    if (tripId) {
      try {
        localStorage.setItem(`tripsage_itinerary_${tripId}`, JSON.stringify(places))
      } catch {}
    }

    // Load offline cached routes if available as local fallback
    let cachedRoute: any = null
    if (tripId) {
      try {
        const raw = localStorage.getItem(`tripsage_routes_${tripId}_${activeDay}`)
        if (raw) cachedRoute = JSON.parse(raw)
      } catch {}
    }

    import('maplibre-gl').then(async (maplibregl) => {
      // 1. Plot Custom Markers with Popup
      validPlaces.forEach((place, index) => {
        const coords: [number, number] = [place.coordinates[1], place.coordinates[0]] // [lon, lat]
        const emoji = getCategoryEmoji(place.category || '')

        const el = document.createElement('div')
        el.className =
          'w-9 h-9 flex items-center justify-center bg-slate-900 rounded-full border-2 border-blue-500 shadow-xl cursor-pointer hover:scale-110 hover:border-blue-600 transition-all font-sans text-base z-10'
        el.innerHTML = emoji

        const placeId = place.id || `${activeDay}-${index}`
        const statusText = visitStatuses[placeId] || 'upcoming'
        const statusColors = {
          completed: 'text-emerald-400 bg-emerald-950/40 border-emerald-800',
          current: 'text-amber-400 bg-amber-950/40 border-amber-800 animate-pulse',
          upcoming: 'text-slate-400 bg-slate-900 border-slate-800',
        }

        const popupContent = `
          <div class="p-3 font-sans text-slate-200 bg-slate-950 border border-slate-800 rounded-lg max-w-[220px]">
            <h4 class="font-bold text-sm text-white leading-tight mb-1">${place.name}</h4>
            <div class="flex items-center gap-1.5 text-[10px] font-semibold text-blue-400 mb-1.5 uppercase tracking-wider">
              <span>${emoji}</span>
              <span>${place.category || 'Sightseeing'}</span>
            </div>
            <div class="px-2 py-0.5 inline-block text-[9px] font-bold rounded border uppercase tracking-wider mb-2 ${
              statusColors[statusText]
            }">
              Status: ${statusText}
            </div>
            ${place.time ? `<p class="text-xs text-slate-400 mb-0.5">⏱ <b>Time:</b> ${place.time}</p>` : ''}
            ${place.description ? `<p class="text-[10px] text-slate-400 border-t border-slate-800 pt-1.5 leading-relaxed mt-1.5">${place.description}</p>` : ''}
          </div>
        `

        const popup = new maplibregl.Popup({ offset: 12, closeButton: false }).setHTML(popupContent)

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat(coords)
          .setPopup(popup)
          .addTo(map)

        markersRef.current.push(marker)
      })

      // 2. Fetch and Draw Road Route
      if (validPlaces.length >= 2) {
        setLoadingRoute(true)
        try {
          const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
          const waypoints = validPlaces.map((p) => ({
            latitude: p.coordinates[0],
            longitude: p.coordinates[1],
          }))

          const response = await axios.post(`${apiBaseUrl}/api/location/route`, {
            waypoints,
            mode: 'walk',
          })

          if (response.data?.success && response.data?.route) {
            const { coordinates, distanceKm, durationSeconds } = response.data.route

            const geom = {
              type: 'LineString',
              coordinates,
            }
            const info = {
              distance: `${distanceKm.toFixed(1)} km`,
              duration:
                Math.floor(durationSeconds / 3600) > 0
                  ? `${Math.floor(durationSeconds / 3600)}h ${Math.round((durationSeconds % 3600) / 60)}m`
                  : `${Math.round(durationSeconds / 60)}m`,
            }

            setRouteGeometry(geom)
            setRouteInfo(info)

            // Cache route geometry offline
            if (tripId) {
              try {
                localStorage.setItem(
                  `tripsage_routes_${tripId}_${activeDay}`,
                  JSON.stringify({ geometry: geom, info })
                )
              } catch {}
            }
          }
        } catch (err) {
          console.warn('[TripMap] Route fetching failed. Using cache or straight-line fallback.')
          if (cachedRoute) {
            setRouteGeometry(cachedRoute.geometry)
            setRouteInfo(cachedRoute.info)
          } else {
            // Straight-line haversine estimate fallback
            let totalDist = 0
            for (let i = 0; i < validPlaces.length - 1; i++) {
              const p1 = validPlaces[i]
              const p2 = validPlaces[i + 1]
              totalDist += haversineDistance(
                p1.coordinates[0],
                p1.coordinates[1],
                p2.coordinates[0],
                p2.coordinates[1]
              )
            }
            const durationSec = Math.round(totalDist * 12 * 60)
            setRouteGeometry({
              type: 'LineString',
              coordinates: validPlaces.map((w) => [w.coordinates[1], w.coordinates[0]]),
            })
            setRouteInfo({
              distance: `${totalDist.toFixed(1)} km (approx)`,
              duration: `${Math.round(durationSec / 60)}m`,
            })
          }
        } finally {
          setLoadingRoute(false)
        }
      } else {
        // Only 1 marker: Clear route path
        setRouteGeometry(null)
        setRouteInfo(null)
      }

      // 3. Fit Bounds safely
      const lats = validPlaces.map((p) => p.coordinates[0])
      const lngs = validPlaces.map((p) => p.coordinates[1])
      const minLat = Math.min(...lats)
      const maxLat = Math.max(...lats)
      const minLng = Math.min(...lngs)
      const maxLng = Math.max(...lngs)

      if (validPlaces.length === 1) {
        map.flyTo({ center: [lngs[0], lats[0]], zoom: 14, duration: 1000 })
      } else {
        map.fitBounds(
          [
            [minLng, minLat], // southWest
            [maxLng, maxLat], // northEast
          ],
          { padding: 50, maxZoom: 15, duration: 1200 }
        )
      }
    })
  }, [places, mapLoaded, activeDay])

  return (
    <div className="relative w-full h-full min-h-[500px] md:min-h-[580px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col md:flex-row font-sans text-slate-200">
      {/* Map Content Box */}
      <div className="relative flex-grow h-[350px] md:h-auto">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating Tracking Button */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          <button
            onClick={() => setIsTrackingUser((prev) => !prev)}
            className={`p-2.5 rounded-xl border backdrop-blur-md shadow-2xl transition-all ${
              isTrackingUser
                ? 'bg-blue-600 border-blue-500 text-white animate-pulse'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Toggle Live Location Tracking"
          >
            <Locate size={18} />
          </button>
        </div>

        {mapRef.current && (
          <RouteLayer map={mapRef.current} geometry={routeGeometry} />
        )}

        {/* Loading Overlay */}
        {loadingRoute && (
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] flex items-center justify-center gap-2 text-white z-20">
            <Loader2 className="animate-spin text-blue-500" size={24} />
            <span className="text-xs font-semibold">Updating route path...</span>
          </div>
        )}

        {/* No coords warning fallback */}
        {!validPlaces.length && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-slate-400 z-10 bg-slate-950/90">
            <Compass size={36} className="text-slate-600 mb-2" />
            <h4 className="font-bold text-sm text-slate-300">No coords found for today</h4>
            <p className="text-xs max-w-xs mt-1 text-slate-500">
              Stops must contain valid coordinates in order to render maps and compute routes.
            </p>
          </div>
        )}
      </div>

      {/* Control Navigator Panel */}
      <div className="w-full md:w-[360px] flex-shrink-0 border-t md:border-t-0 md:border-l border-slate-800 bg-slate-950 flex flex-col h-[350px] md:h-auto overflow-hidden">
        {/* Header Tab Toggles */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 select-none text-xs font-bold uppercase tracking-wider text-slate-400">
          <button
            onClick={() => setActiveTab('itinerary')}
            className={`flex-1 py-3.5 text-center flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'itinerary' ? 'text-blue-400 border-b-2 border-blue-500 bg-slate-950' : 'hover:text-slate-200'
            }`}
          >
            <CheckCircle2 size={13} />
            <span>Itinerary</span>
          </button>
          <button
            onClick={() => setActiveTab('layers')}
            className={`flex-1 py-3.5 text-center flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'layers' ? 'text-blue-400 border-b-2 border-blue-500 bg-slate-950' : 'hover:text-slate-200'
            }`}
          >
            <Layers size={13} />
            <span>Layers</span>
          </button>
          <button
            onClick={() => setActiveTab('assistant')}
            className={`flex-1 py-3.5 text-center flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'assistant' ? 'text-blue-400 border-b-2 border-blue-500 bg-slate-950' : 'hover:text-slate-200'
            }`}
          >
            <Sparkles size={13} />
            <span>Navigator</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-grow overflow-y-auto p-4 custom-scrollbar">
          {/* Tab 1: Itinerary Progress Checklists */}
          {activeTab === 'itinerary' && (
            <div className="space-y-4">
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3 flex flex-col gap-1 text-[11px] text-slate-400 font-medium">
                <span className="text-white font-bold text-xs mb-1 flex items-center gap-1">
                  <Navigation size={13} className="text-blue-400" />
                  <span>Road Route Details</span>
                </span>
                {routeInfo ? (
                  <>
                    <span>Total Distance: <b className="text-slate-200">{routeInfo.distance}</b></span>
                    <span>Est. Walking Duration: <b className="text-slate-200">{routeInfo.duration}</b></span>
                  </>
                ) : (
                  <span>Add coordinates and route connections will calculate here.</span>
                )}
                {userCoords && (
                  <div className="border-t border-slate-800/60 pt-2 mt-1">
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Locate size={11} />
                      <span>Live tracking active</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Stop Progress Cards */}
              <div className="space-y-2">
                {validPlaces.map((place, idx) => {
                  const placeId = place.id || `${activeDay}-${idx}`
                  const status = visitStatuses[placeId] || 'upcoming'
                  const emoji = getCategoryEmoji(place.category || '')

                  // Distance from user to this place
                  let distText = null
                  if (userCoords) {
                    const km = haversineDistance(
                      userCoords[0],
                      userCoords[1],
                      place.coordinates[0],
                      place.coordinates[1]
                    )
                    distText = km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`
                  }

                  return (
                    <div
                      key={placeId}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                        status === 'completed'
                          ? 'bg-slate-900/30 border-slate-900/80 opacity-70'
                          : status === 'current'
                          ? 'bg-slate-900/90 border-blue-900/50 shadow-md ring-1 ring-blue-500/10'
                          : 'bg-slate-900/60 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <span className="text-lg flex-shrink-0 select-none">{emoji}</span>
                        <div className="overflow-hidden">
                          <h5 className="text-xs font-bold text-slate-100 truncate leading-tight">
                            {place.name.split(' — ')[0]}
                          </h5>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1 font-medium">
                            {place.time && <span>🕒 {place.time}</span>}
                            {distText && (
                              <span className="text-blue-400 font-semibold">📍 {distText} away</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status select/toggle button */}
                      <button
                        onClick={() =>
                          updatePlaceStatus(
                            placeId,
                            status === 'completed'
                              ? 'current'
                              : status === 'current'
                              ? 'upcoming'
                              : 'completed'
                          )
                        }
                        className={`flex-shrink-0 p-1.5 rounded-lg border transition-all ${
                          status === 'completed'
                            ? 'bg-emerald-950/30 border-emerald-800 text-emerald-400 hover:bg-slate-800 hover:border-slate-700'
                            : status === 'current'
                            ? 'bg-amber-950/30 border-amber-800 text-amber-400 hover:bg-slate-800 hover:border-slate-700'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                        title={`Status: ${status} (Click to toggle)`}
                      >
                        {status === 'completed' ? (
                          <CheckCircle2 size={14} className="fill-emerald-400/20" />
                        ) : status === 'current' ? (
                          <Circle size={14} className="fill-amber-400 text-amber-400" />
                        ) : (
                          <Circle size={14} />
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Tab 2: Map Layers & Smart Nearby Recommendations */}
          {activeTab === 'layers' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide">Map Filters</h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'hotels', label: '🏨 Hotels' },
                  { id: 'restaurants', label: '🍽 Restaurants' },
                  { id: 'cafes', label: '☕ Cafes' },
                  { id: 'activities', label: '🎭 Activities' },
                  { id: 'shopping', label: '🛍 Shopping' },
                ].map((layer) => {
                  const isActive = activeLayers.includes(layer.id)
                  return (
                    <button
                      key={layer.id}
                      onClick={() => toggleLayer(layer.id)}
                      className={`py-2 px-3 text-[11px] font-bold rounded-xl border text-left flex items-center justify-between transition-all ${
                        isActive
                          ? 'bg-blue-600/90 border-blue-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <span>{layer.label}</span>
                      {isActive && <span className="h-1.5 w-1.5 rounded-full bg-white"></span>}
                    </button>
                  )}
                )}
              </div>

              {/* Recommendations list */}
              {activeLayers.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-slate-800">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                    <span>Nearby Suggestions</span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                      {nearbyMarkers.length} found
                    </span>
                  </h4>

                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {nearbyMarkers.map((place, idx) => (
                      <div
                        key={`${place.placeId}-${idx}`}
                        className="bg-slate-900/50 border border-slate-800 p-2.5 rounded-xl flex flex-col gap-1 text-[11px] hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="font-bold text-slate-100 leading-tight truncate">
                            {place.name}
                          </h5>
                          <span className="text-[10px] flex-shrink-0 text-slate-400 font-semibold bg-slate-800 px-1.5 rounded-full">
                            ⭐ {place.details?.rating || '4.0'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate leading-snug">{place.address}</p>
                        <div className="flex items-center gap-2 mt-1 text-[9px] font-bold text-blue-400 uppercase tracking-wider">
                          <span>{place.layer}</span>
                          <span>•</span>
                          <span className="capitalize">{place.details?.budget || 'medium'} cost</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: AI Assistant Navigator */}
          {activeTab === 'assistant' && (
            <div className="flex flex-col h-[280px] md:h-[420px] overflow-hidden">
              {/* Message Log */}
              <div className="flex-grow overflow-y-auto space-y-3 pr-1 text-xs mb-3 custom-scrollbar flex flex-col">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl max-w-[85%] border leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-blue-600/10 border-blue-500/20 text-slate-200 self-end ml-auto'
                        : 'bg-slate-900 border-slate-800 text-slate-300 self-start mr-auto'
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
                {assistantLoading && (
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 self-start mr-auto flex items-center gap-2">
                    <Loader2 size={12} className="animate-spin text-blue-500" />
                    <span>Navigator is navigating...</span>
                  </div>
                )}
              </div>

              {/* Suggestion action card */}
              {recommendedMarker && (
                <div className="bg-amber-950/20 border border-amber-900/40 p-2.5 rounded-xl mb-3 flex items-center justify-between text-[11px]">
                  <div className="overflow-hidden">
                    <span className="font-bold text-amber-400 block truncate">📍 {recommendedMarker.name}</span>
                    <span className="text-slate-400 truncate block mt-0.5">{recommendedMarker.reason}</span>
                  </div>
                  <button
                    onClick={() => {
                      const map = mapRef.current
                      if (map) {
                        map.flyTo({ center: [recommendedMarker.lon, recommendedMarker.lat], zoom: 14 })
                      }
                    }}
                    className="flex-shrink-0 bg-amber-600 hover:bg-amber-500 text-white font-bold py-1 px-2.5 rounded-lg ml-2"
                  >
                    Fly
                  </button>
                </div>
              )}

              {/* Chat Input form */}
              <form onSubmit={handleAssistantSubmit} className="flex gap-2 mt-auto">
                <input
                  type="text"
                  value={assistantInput}
                  onChange={(e) => setAssistantInput(e.target.value)}
                  placeholder="Ask Navigator: Where should I go now?"
                  className="flex-grow bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-700 transition-colors"
                />
                <button
                  type="submit"
                  disabled={assistantLoading || !assistantInput.trim()}
                  className="bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-xl disabled:opacity-40 disabled:hover:bg-blue-600 transition-colors"
                >
                  <Send size={14} />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
