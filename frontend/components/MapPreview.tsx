'use client';

import { useEffect, useRef, useState } from 'react';

interface MapPreviewProps {
  latitude: number | null;
  longitude: number | null;
  placeName: string;
}

export default function MapPreview({ latitude, longitude, placeName }: MapPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (latitude == null || longitude == null || isNaN(latitude) || isNaN(longitude)) {
      Promise.resolve().then(() => setHasError(true));
      return;
    }

    if (typeof window === 'undefined' || !containerRef.current) return;

    // Inject leaflet stylesheet if not present
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted) return;

      // Clean up previous instance if any
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      try {
        const centerCoords: [number, number] = [latitude, longitude];

        // Locked map configuration to mimic a static map preview
        const map = L.map(containerRef.current!, {
          center: centerCoords,
          zoom: 14,
          zoomControl: false,
          dragging: false,
          scrollWheelZoom: false,
          doubleClickZoom: false,
          touchZoom: false,
          boxZoom: false,
          keyboard: false,
        });

        mapInstanceRef.current = map;

        const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || '3ffd189110c8416c8e2c733950e9d50d';
        L.tileLayer(`https://maps.geoapify.com/v1/tile/osm-carto/{z}/{x}/{y}.png?apiKey=${apiKey}`, {
          attribution: 'Powered by Geoapify | © OpenStreetMap contributors',
        }).addTo(map);

        // Custom marker icon
        const markerIcon = L.divIcon({
          html: `<div style="
            width: 32px; height: 32px;
            border-radius: 50% 50% 50% 0; background: #6d28d9;
            border: 3px solid #fff;
            transform: rotate(-45deg);
            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
            display: flex; align-items: center; justify-content: center;
          "><span style="transform: rotate(45deg); color: white; font-size: 14px;">📍</span></div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          className: '',
        });

        L.marker(centerCoords, { icon: markerIcon })
          .addTo(map)
          .bindPopup(`<b>${placeName}</b>`, { closeButton: false })
          .openPopup();
      } catch (err) {
        console.error('Error rendering static leaflet map:', err);
        setHasError(true);
      }
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, placeName]);

  if (hasError) {
    return (
      <div className="w-full h-48 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex flex-col items-center justify-center text-center p-4 border border-[var(--border)]">
        <span className="text-2xl mb-2">🗺️</span>
        <p className="text-sm font-semibold text-[var(--text-secondary)]">Map Preview Unavailable</p>
        <p className="text-xs text-[var(--text-muted)] mt-1">Coordinates not found or invalid.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-xl overflow-hidden shadow-sm border border-[var(--border)]">
      <div ref={containerRef} className="w-full h-48 z-0 bg-zinc-100" />
      <div className="absolute bottom-2 left-2 z-10 glass px-2.5 py-1 rounded-md text-[10px] font-bold text-[var(--text-primary)] shadow-sm">
        🗺️ Map Preview
      </div>
    </div>
  );
}
