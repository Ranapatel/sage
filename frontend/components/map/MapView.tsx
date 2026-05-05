'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface Props {
  itinerary: any[]
  hotels?: any[]
  tripContext?: any
}

const DAY_COLORS = ['#00c27c', '#f5a623', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']

export default function MapView({ itinerary, hotels = [], tripContext }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [stats, setStats] = useState({ total: 0, google: 0 })
  // Use destination as a key to force full map recreation on new trip
  const destination = tripContext?.destination || ''

  const buildMap = useCallback(async () => {
    if (!mapRef.current || typeof window === 'undefined') return

    // Inject Leaflet CSS if missing
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    const L = (await import('leaflet')).default

    // Destroy any existing map instance first
    if (mapInstanceRef.current) {
      try { mapInstanceRef.current.remove() } catch {}
      mapInstanceRef.current = null
    }

    // ── Normalize itinerary places ─────────────────────────────────────────
    const mappedItinerary = itinerary.map((day, dayIdx) => ({
      ...day,
      dayIdx,
      places: day.places.map((p: any, placeIdx: number) => {
        let rawLat = p.lat != null ? p.lat : (Array.isArray(p.coordinates) ? p.coordinates[0] : undefined)
        let rawLng = p.lng != null ? p.lng : (Array.isArray(p.coordinates) ? p.coordinates[1] : undefined)
        const coords: [number, number] | null =
          rawLat != null && rawLng != null && !isNaN(Number(rawLat)) && !isNaN(Number(rawLng))
            ? [Number(rawLat), Number(rawLng)]
            : null
        return { ...p, coordinates: coords, placeIdx, dayIdx, dayNumber: day.day }
      }),
    }))

    const allPlaces = mappedItinerary
      .flatMap(d => d.places)
      .filter((p: any) => Array.isArray(p.coordinates) && p.coordinates.length === 2 && !isNaN(p.coordinates[0]))

    const googleCount = allPlaces.filter((p: any) =>
      p.coordSource === 'google_places' || p.coordSource === 'google_geocode'
    ).length
    setStats({ total: allPlaces.length, google: googleCount })

    // ── Hotel coords ───────────────────────────────────────────────────────
    const hotelCoords = hotels
      .filter(h => h.latitude && h.longitude)
      .map(h => ({ ...h, coordinates: [parseFloat(h.latitude), parseFloat(h.longitude)] as [number, number] }))

    // ── Determine initial center ───────────────────────────────────────────
    const center: [number, number] =
      allPlaces.length > 0
        ? allPlaces[0].coordinates
        : [20.5937, 78.9629] // Centre of India

    // ── Create map ─────────────────────────────────────────────────────────
    const map = L.map(mapRef.current!, {
      center,
      zoom: allPlaces.length > 0 ? 12 : 5,
      zoomControl: true,
      scrollWheelZoom: true,
    })
    mapInstanceRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    // ── Icon factory ───────────────────────────────────────────────────────
    const makeIcon = (color: string, label: string, isGoogle = false) => L.divIcon({
      html: `<div style="
        width:${isGoogle ? 34 : 30}px;height:${isGoogle ? 34 : 30}px;
        border-radius:50% 50% 50% 0;background:${color};
        border:3px solid white;transform:rotate(-45deg);
        box-shadow:0 2px 8px rgba(0,0,0,0.35);
        display:flex;align-items:center;justify-content:center;">
        <span style="transform:rotate(45deg);color:white;font-weight:700;
          font-size:${label.length > 1 ? 10 : 13}px;font-family:sans-serif;
          display:flex;align-items:center;justify-content:center;
          width:100%;height:100%;padding-top:4px;padding-left:4px;">${label}</span>
      </div>`,
      iconSize: [isGoogle ? 34 : 30, isGoogle ? 34 : 30],
      iconAnchor: [isGoogle ? 17 : 15, isGoogle ? 34 : 30],
      className: '',
    })

    // ── Place markers & route polylines ───────────────────────────────────
    mappedItinerary.forEach(day => {
      const validPlaces = day.places.filter((p: any) => Array.isArray(p.coordinates))
      const color = DAY_COLORS[day.dayIdx % DAY_COLORS.length]

      validPlaces.forEach((place: any) => {
        const isGoogle = place.coordSource === 'google_places' || place.coordSource === 'google_geocode'
        const mapsUrl = place.googleMapsUrl ||
          `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ', ' + destination)}`

        L.marker(place.coordinates as [number, number], {
          icon: makeIcon(color, String(place.placeIdx + 1), isGoogle),
        })
          .bindPopup(`
            <div style="font-family:'Space Grotesk',sans-serif;min-width:220px;max-width:280px;">
              <div style="font-weight:700;font-size:14px;color:#0f172a;margin-bottom:4px;">${place.name}</div>
              <div style="color:#64748b;font-size:12px;margin-bottom:6px;">Day ${day.dayNumber} · ${place.time || ''}</div>
              <div style="display:inline-block;background:rgba(0,194,124,0.15);color:#00c27c;padding:2px 8px;border-radius:100px;font-size:11px;margin-bottom:6px;">${place.category || ''}</div>
              ${place.formattedAddress ? `<p style="color:#475569;font-size:11px;margin:4px 0;">📍 ${place.formattedAddress}</p>` : ''}
              <p style="color:#475569;font-size:12px;margin-top:4px;line-height:1.4;">${(place.description || '').slice(0, 120)}</p>
              <div style="display:flex;gap:8px;margin-top:10px;align-items:center;">
                <a href="${mapsUrl}" target="_blank"
                  style="color:#00c27c;font-size:12px;text-decoration:none;font-weight:600;">
                  🗺️ Open in Maps →
                </a>
                <span style="font-size:10px;color:${isGoogle ? '#22c55e' : '#94a3b8'};margin-left:auto;">
                  ${isGoogle ? '✅ Google' : '⚠️ AI est.'}
                </span>
              </div>
            </div>
          `, { maxWidth: 300 })
          .addTo(map)
      })

      // Draw day route polyline
      if (validPlaces.length > 1) {
        L.polyline(
          validPlaces.map((p: any) => p.coordinates as [number, number]),
          { color, weight: 3, opacity: 0.7, dashArray: '8,6' }
        ).addTo(map)
      }
    })

    // ── Hotel markers ─────────────────────────────────────────────────────
    hotelCoords.forEach((hotel: any) => {
      L.marker(hotel.coordinates, { icon: makeIcon('#f59e0b', '🏨', true) })
        .bindPopup(`
          <div style="font-family:'Space Grotesk',sans-serif;min-width:180px;">
            <div style="font-weight:700;font-size:14px;color:#0f172a;">${hotel.name}</div>
            <div style="color:#64748b;font-size:12px;margin-top:4px;">${hotel.location || ''}</div>
            ${hotel.price ? `<div style="color:#00c27c;font-weight:700;margin-top:6px;">₹${hotel.price}/night</div>` : ''}
          </div>
        `)
        .addTo(map)
    })

    // ── Fit bounds to all markers ─────────────────────────────────────────
    const allCoords: [number, number][] = [
      ...allPlaces.map((p: any) => p.coordinates),
      ...hotelCoords.map((h: any) => h.coordinates),
    ]
    if (allCoords.length > 1) {
      map.fitBounds(L.latLngBounds(allCoords), { padding: [40, 40], maxZoom: 14 })
    } else if (allCoords.length === 1) {
      map.setView(allCoords[0], 13)
    }
  }, [itinerary, hotels, destination]) // eslint-disable-line

  useEffect(() => {
    buildMap()
    return () => {
      if (mapInstanceRef.current) {
        try { mapInstanceRef.current.remove() } catch {}
        mapInstanceRef.current = null
      }
    }
  }, [buildMap])

  // Empty state
  if (itinerary.length === 0) {
    return (
      <div className="card p-16 text-center flex flex-col items-center gap-4">
        <div className="text-6xl">🗺️</div>
        <h3 className="font-bold text-lg text-[var(--text-primary)]">Map Not Available</h3>
        <p className="text-[var(--text-muted)] text-sm max-w-xs">
          Generate an itinerary first to see your trip visualised on the map
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="section-title text-xl">🗺️ Journey Map</h2>
        <div className="flex items-center gap-3 flex-wrap">
          {stats.total > 0 && (
            <div className="glass px-3 py-1.5 rounded-full text-xs">
              {stats.google === stats.total
                ? <span className="text-green-400 font-semibold">✅ {stats.google}/{stats.total} Google-verified</span>
                : stats.google > 0
                ? <span className="text-yellow-400 font-semibold">⚡ {stats.google}/{stats.total} Google-verified</span>
                : <span className="text-[var(--text-muted)]">⚠️ AI-estimated locations</span>
              }
            </div>
          )}
          {itinerary.map((day, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: DAY_COLORS[i % DAY_COLORS.length] }} />
              <span>Day {day.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="card overflow-hidden rounded-2xl">
        <div ref={mapRef} style={{ height: '520px', width: '100%', background: '#1e293b' }} />
      </div>

      {/* Day-wise place list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {itinerary.map((day, dayIdx) => (
          <div key={day.day} className="card p-4">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: DAY_COLORS[dayIdx % DAY_COLORS.length] }} />
              <span style={{ color: DAY_COLORS[dayIdx % DAY_COLORS.length] }}>Day {day.day}</span>
              {day.date && <span className="text-[var(--text-muted)] font-normal">· {day.date}</span>}
            </h3>
            <div className="space-y-2">
              {(day.places || []).map((p: any, i: number) => {
                const isGoogle = p.coordSource === 'google_places' || p.coordSource === 'google_geocode'
                const mapsUrl = p.googleMapsUrl ||
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name + ', ' + destination)}`
                return (
                  <div key={i} className="flex items-center gap-3 text-sm group">
                    <span className="font-mono text-xs text-[var(--text-muted)] w-12 flex-shrink-0">{p.time}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-[var(--text-primary)] truncate block font-medium">{p.name}</span>
                      {p.formattedAddress && (
                        <span className="text-[0.65rem] text-[var(--text-muted)] truncate block">{p.formattedAddress}</span>
                      )}
                    </div>
                    <span title={isGoogle ? 'Google-verified' : 'AI-estimated'} className="text-sm flex-shrink-0">
                      {isGoogle ? '✅' : '⚠️'}
                    </span>
                    <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-[var(--primary)] hover:underline flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
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
