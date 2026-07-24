'use client';

import { useEffect, useRef, useState } from 'react';
import { Map, MapPin } from 'lucide-react';

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
    const centerCoords: [number, number] = [latitude, longitude];

    import('leaflet').then((L) => {
      if (!isMounted || !containerRef.current) return;

      // Clean up previous instance if any
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      try {
        // Locked map configuration to mimic a static map preview
        const map = L.map(containerRef.current!, {
          center: centerCoords,
          zoom: 13,
          zoomControl: false,
          dragging: false,
          scrollWheelZoom: false,
          doubleClickZoom: false,
          touchZoom: false,
          boxZoom: false,
          keyboard: false,
          attributionControl: false,
        });

        mapInstanceRef.current = map;

        // Add minimalist tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
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
          "><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(45deg);"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
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
        <Map size={24} className="text-[var(--text-muted)] mb-2" />
        <p className="text-sm font-semibold text-[var(--text-secondary)]">Map Preview Unavailable</p>
        <p className="text-xs text-[var(--text-muted)] mt-1">Coordinates not found or invalid.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-xl overflow-hidden shadow-sm border border-[var(--border)]">
      <div ref={containerRef} className="w-full h-48 z-0 bg-zinc-100" />
      <div className="absolute bottom-2 left-2 z-10 glass px-2.5 py-1 rounded-md text-[10px] font-bold text-[var(--text-primary)] shadow-sm flex items-center gap-1.5">
        <Map size={12} className="text-purple-600" /> Map Preview
      </div>
    </div>
  );
}
