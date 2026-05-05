'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  itinerary: any[]
  hotels?: any[]
  tripContext?: any
}

export default function MapView({ itinerary, hotels = [], tripContext }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [stats, setStats] = useState({ total: 0, google: 0 })
  const [hotelCoords, setHotelCoords] = useState<any[]>([])
  const [destCoord, setDestCoord] = useState<any>(null)
  const [placeCoords, setPlaceCoords] = useState<Record<string, number[]>>({})

  useEffect(() => {
    let mounted = true
    if (hotels && hotels.length > 0) {
      const coords = hotels.filter(h => h.latitude && h.longitude).map(h => ({
        ...h,
        coordinates: [parseFloat(h.latitude), parseFloat(h.longitude)]
      }))
      if (mounted) setHotelCoords(coords)
    }
    return () => { mounted = false }
  }, [hotels])

  useEffect(() => {
    if (!mapRef.current || typeof window === 'undefined') return

    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    import('leaflet').then(L => {
      if (mapInstanceRef.current) mapInstanceRef.current.remove()

      const mappedItinerary = itinerary.map((day, dayIdx) => ({
        ...day,
        dayIdx,
        places: day.places.map((p: any, placeIdx: number) => {
          // Support new flat format (lat/lng) AND old coordinates[] array
          let rawLat = p.lat != null ? p.lat : (Array.isArray(p.coordinates) ? p.coordinates[0] : undefined)
          let rawLng = p.lng != null ? p.lng : (Array.isArray(p.coordinates) ? p.coordinates[1] : undefined)
          let coords: [number, number] | null = null

          if (rawLat != null && rawLng != null && !isNaN(Number(rawLat)) && !isNaN(Number(rawLng))) {
            coords = [Number(rawLat), Number(rawLng)]
          }

          return { ...p, coordinates: coords, placeIdx, isEstimated: p.isEstimated || false, dayIdx, dayNumber: day.day }
        })
      }))

      const allPlaces = mappedItinerary
        .flatMap(d => d.places)
        .filter((p: any) => Array.isArray(p.coordinates) && p.coordinates.length === 2 && !isNaN(p.coordinates[0]) && !isNaN(p.coordinates[1]))
      const total = allPlaces.length
      const google = allPlaces.filter(p => !p.isEstimated && (p.coordSource === 'google_places' || p.coordSource === 'google_geocode')).length
      setStats({ total, google })

      const center = allPlaces.length > 0
        ? [allPlaces[0].coordinates[0], allPlaces[0].coordinates[1]]
        : [20.5937, 78.9629] // Default to center of India

      const map = L.map(mapRef.current!, { center: center as [number, number], zoom: 12 })
      mapInstanceRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map)

      const createIcon = (color: string, isGoogle: boolean, content: string = '') => L.divIcon({
        html: `<div style="
          width:${isGoogle ? '34' : '28'}px; height:${isGoogle ? '34' : '28'}px;
          border-radius:50% 50% 50% 0; background:${color};
          border:3px solid ${isGoogle ? '#fff' : '#aaa'};
          transform:rotate(-45deg);
          box-shadow:0 2px ${isGoogle ? '10' : '4'}px rgba(0,0,0,${isGoogle ? '0.5' : '0.2'});
          display: flex; align-items: center; justify-content: center;
        "><span style="transform: rotate(45deg); color: white; font-weight: bold; font-size: ${content.length > 2 ? '10' : '14'}px; font-family: sans-serif; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; padding-top: 4px; padding-left: 4px;">${content}</span></div>`,
        iconSize: [isGoogle ? 34 : 28, isGoogle ? 34 : 28],
        iconAnchor: [isGoogle ? 17 : 14, isGoogle ? 34 : 28],
        className: '',
      })

      const colors = ['#00c27c', '#f5a623', '#3b82f6', '#ef4444', '#8b5cf6']

      mappedItinerary.forEach((day) => {
        day.places.forEach((place: any) => {
          if (!Array.isArray(place.coordinates) || place.coordinates.length !== 2 || isNaN(place.coordinates[0])) return;

          const isGoogle = !place.isEstimated && (place.coordSource === 'google_places' || place.coordSource === 'google_geocode')
          const color = colors[day.dayIdx % colors.length]
          const mapsUrl = place.googleMapsUrl ||
            `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}`

          const marker = L.marker(place.coordinates as [number, number], { icon: createIcon(color, isGoogle, String(place.placeIdx + 1)) })
          marker.bindPopup(`
            <div style="font-family:'Space Grotesk',sans-serif;min-width:200px;">
              <div style="font-weight:700;font-size:14px;color:#0f172a;margin-bottom:4px;">${place.name}</div>
              <div style="color:#64748b;font-size:12px;margin-bottom:6px;">Day ${day.dayNumber} · ${place.time}</div>
              <div style="display:inline-block;background:rgba(0,194,124,0.15);color:#00c27c;padding:2px 8px;border-radius:100px;font-size:11px;margin-bottom:6px;">${place.category}</div>
              ${place.formattedAddress ? `<p style="color:#475569;font-size:11px;margin:4px 0;">📍 ${place.formattedAddress}</p>` : ''}
              <p style="color:#475569;font-size:12px;margin-top:4px;">${place.description || ''}</p>
              <div style="display:flex;gap:8px;margin-top:8px;align-items:center;">
                <a href="${mapsUrl}" target="_blank" style="color:#00c27c;font-size:12px;text-decoration:none;">🗺️ Open in Google Maps →</a>
                <span style="font-size:10px;color:${isGoogle ? '#22c55e' : '#94a3b8'};margin-left:auto;">${isGoogle ? '✅ Google' : '⚠️ AI estimate'}</span>
              </div>
            </div>
          `)
          marker.addTo(map)
        })
      })

      mappedItinerary.forEach(day => {
        const validPlaces = day.places.filter((p: any) => Array.isArray(p.coordinates) && p.coordinates.length === 2 && !isNaN(p.coordinates[0]))
        if (validPlaces.length > 1) {
          L.polyline(validPlaces.map((p: any) => p.coordinates as [number, number]), {
            color: colors[day.dayIdx % colors.length], weight: 3, opacity: 0.8, dashArray: '6, 6',
          }).addTo(map)
        }
      })

      const allCoords = [
        ...allPlaces.map((p: any) => p.coordinates),
        ...hotelCoords.map(h => h.coordinates),
        ...(destCoord ? [destCoord.coordinates] : [])
      ]

      if (destCoord) {
        const marker = L.marker(destCoord.coordinates, { icon: createIcon('#3b82f6', true, '✈️') })
        marker.bindPopup(`
          <div style="font-family:'Space Grotesk',sans-serif;min-width:150px;">
            <div style="font-weight:700;font-size:14px;color:#0f172a;margin-bottom:4px;">Flight Destination</div>
            <div style="color:#64748b;font-size:12px;">${destCoord.name}</div>
          </div>
        `)
        marker.addTo(map)
      }

      hotelCoords.forEach((hotel: any) => {
        if (!hotel.coordinates) return
        const marker = L.marker(hotel.coordinates, { icon: createIcon('#00c27c', true, '🏨') })
        marker.bindPopup(`
          <div style="font-family:'Space Grotesk',sans-serif;min-width:150px;">
            <div style="font-weight:700;font-size:14px;color:#0f172a;margin-bottom:4px;">${hotel.name}</div>
            <div style="color:#64748b;font-size:12px;">${hotel.location || ''}</div>
          </div>
        `)
        marker.addTo(map)
      })

      if (allCoords.length > 0) {
        if (allCoords.length === 1) {
          map.setView(allCoords[0], 12)
        } else {
          map.fitBounds(L.latLngBounds(allCoords), { padding: [40, 40] })
        }
      }
    })

    return () => {
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null }
    }
  }, [itinerary, hotelCoords, destCoord, placeCoords])

  if (itinerary.length === 0 && hotelCoords.length === 0 && !destCoord) {
    return (
      <div className="card p-12 text-center">
        <div className="text-5xl mb-4">🗺️</div>
        <h3 className="font-bold text-[var(--text-primary)] mb-2">Map Not Available</h3>
        <p className="text-[var(--text-muted)] text-sm">Generate an itinerary first to see your trip on the map</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="section-title text-xl">🗺️ Journey Map</h2>
        <div className="flex items-center gap-4 text-xs flex-wrap">
          {stats.total > 0 && (
            <div className="glass px-3 py-1.5 rounded-full">
              {stats.google === stats.total
                ? <span className="text-green-400 font-semibold">✅ {stats.google}/{stats.total} Google-verified</span>
                : stats.google > 0
                ? <span className="text-yellow-400 font-semibold">⚡ {stats.google}/{stats.total} Google-verified</span>
                : <span className="text-[var(--text-muted)]">⚠️ AI-estimated (add GOOGLE_PLACES_API_KEY)</span>
              }
            </div>
          )}
          {itinerary.map((day, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[var(--text-muted)]">
              <div className="w-3 h-3 rounded-full" style={{ background: ['#00c27c','#f5a623','#3b82f6','#ef4444','#8b5cf6'][i % 5] }}></div>
              <span>Day {day.day}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div ref={mapRef} style={{ height: '500px', width: '100%' }}></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {itinerary.map(day => (
          <div key={day.day} className="card p-4">
            <h3 className="font-bold text-sm text-[var(--primary)] mb-3">Day {day.day}</h3>
            <div className="space-y-2">
              {day.places.map((p: any, i: number) => {
                const isGoogle = p.coordSource === 'google_places' || p.coordSource === 'google_geocode'
                const mapsUrl = p.googleMapsUrl ||
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name)}`
                return (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <span className="font-mono text-xs text-[var(--text-muted)] w-12">{p.time}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-[var(--text-primary)] truncate block">{p.name}</span>
                      {p.formattedAddress && (
                        <span className="text-[0.65rem] text-[var(--text-muted)] truncate block">{p.formattedAddress}</span>
                      )}
                    </div>
                    <span title={isGoogle ? 'Google-verified' : 'AI-estimated'} className="text-sm">
                      {isGoogle ? '✅' : '⚠️'}
                    </span>
                    <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-[var(--primary)] hover:underline flex-shrink-0">
                      Maps
                    </a>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
