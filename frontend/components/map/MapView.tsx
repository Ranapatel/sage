'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  itinerary: any[]
}

export default function MapView({ itinerary }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [stats, setStats] = useState({ total: 0, google: 0 })

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

      const allPlaces = itinerary.flatMap(d => d.places)
      const total = allPlaces.length
      const google = allPlaces.filter(p => p.coordSource === 'google_places' || p.coordSource === 'google_geocode').length
      setStats({ total, google })

      const center = allPlaces.length > 0
        ? [allPlaces[0].coordinates[0], allPlaces[0].coordinates[1]]
        : [20.5937, 78.9629]

      const map = L.map(mapRef.current!, { center: center as [number, number], zoom: 12 })
      mapInstanceRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map)

      const createIcon = (color: string, isGoogle: boolean) => L.divIcon({
        html: `<div style="
          width:${isGoogle ? '34' : '28'}px; height:${isGoogle ? '34' : '28'}px;
          border-radius:50% 50% 50% 0; background:${color};
          border:3px solid ${isGoogle ? '#fff' : '#aaa'};
          transform:rotate(-45deg);
          box-shadow:0 2px ${isGoogle ? '10' : '4'}px rgba(0,0,0,${isGoogle ? '0.5' : '0.2'});
        "></div>`,
        iconSize: [isGoogle ? 34 : 28, isGoogle ? 34 : 28],
        iconAnchor: [isGoogle ? 17 : 14, isGoogle ? 34 : 28],
        className: '',
      })

      const colors = ['#00c27c', '#f5a623', '#3b82f6', '#ef4444', '#8b5cf6']

      itinerary.forEach((day, dayIdx) => {
        day.places.forEach((place: any) => {
          const isGoogle = place.coordSource === 'google_places' || place.coordSource === 'google_geocode'
          const color = colors[dayIdx % colors.length]
          const mapsUrl = place.googleMapsUrl ||
            `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}`

          const marker = L.marker(place.coordinates, { icon: createIcon(color, isGoogle) })
          marker.bindPopup(`
            <div style="font-family:'Space Grotesk',sans-serif;min-width:200px;">
              <div style="font-weight:700;font-size:14px;color:#0f172a;margin-bottom:4px;">${place.name}</div>
              <div style="color:#64748b;font-size:12px;margin-bottom:6px;">Day ${day.day} · ${place.time}</div>
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

      itinerary.forEach(day => {
        if (day.places.length > 1) {
          L.polyline(day.places.map((p: any) => p.coordinates as [number, number]), {
            color: '#00c27c', weight: 2, opacity: 0.5, dashArray: '6, 6',
          }).addTo(map)
        }
      })

      if (allPlaces.length > 1) {
        map.fitBounds(L.latLngBounds(allPlaces.map((p: any) => p.coordinates)), { padding: [40, 40] })
      }
    })

    return () => {
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null }
    }
  }, [itinerary])

  if (itinerary.length === 0) {
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
