'use client';

import React, { memo, useState, useEffect } from 'react';
import Image from 'next/image';
import { MapPin, Navigation, Plane, Compass, Utensils, Landmark, Trees, Zap, ShoppingBag, Building2 } from 'lucide-react';
import { getOptimizedImageUrl } from '@/lib/imageUtils';
import { useIsMobile } from '@/hooks/useIsMobile';

const CATEGORY_COLORS: Record<string, string> = {
  transport: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30',
  explore: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30',
  dining: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30',
  culture: 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30',
  nature: 'bg-teal-50 text-teal-700 border-teal-100 dark:bg-teal-950/20 dark:text-teal-400 dark:border-teal-900/30',
  activity: 'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900/30',
  shopping: 'bg-violet-50 text-violet-700 border-violet-100 dark:bg-violet-950/20 dark:text-violet-400 dark:border-violet-900/30',
  accommodation: 'bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900/30',
};

function renderCategoryIcon(category: string) {
  const cat = category?.toLowerCase() || ''
  if (cat === 'transport') return <Plane size={20} className="text-emerald-600" />
  if (cat === 'explore') return <Compass size={20} className="text-amber-600" />
  if (cat === 'dining') return <Utensils size={20} className="text-rose-600" />
  if (cat === 'culture') return <Landmark size={20} className="text-indigo-600" />
  if (cat === 'nature') return <Trees size={20} className="text-teal-600" />
  if (cat === 'activity') return <Zap size={20} className="text-orange-600" />
  if (cat === 'shopping') return <ShoppingBag size={20} className="text-violet-600" />
  if (cat === 'accommodation') return <Building2 size={20} className="text-sky-600" />
  return <MapPin size={20} className="text-slate-500" />
}

const CATEGORY_QUERIES: Record<string, string> = {
  transport: 'airport travel journey',
  explore: 'travel adventure destination',
  dining: 'food restaurant meal',
  culture: 'museum temple culture heritage',
  nature: 'nature landscape scenery',
  activity: 'adventure outdoor activity',
  shopping: 'market shopping bazaar',
  accommodation: 'hotel resort room',
};

const imageCache: Record<string, string[]> = {};

async function fetchPlaceImages(placeName: string, category: string = 'dining', destination?: string): Promise<string[]> {
  const cat = (category || 'dining').toLowerCase();
  const cacheKey = `${placeName.toLowerCase()}|${(destination || '').toLowerCase()}|${cat}`;

  if (imageCache[cacheKey]) return imageCache[cacheKey];

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const params = new URLSearchParams();
    params.set('placeName', placeName);
    params.set('city', destination || '');
    params.set('category', cat);

    const res = await fetch(`${baseUrl}/api/explore/place-image?${params.toString()}`);
    const data = await res.json();
    if (data.success && data.data && Array.isArray(data.data.gallery)) {
      imageCache[cacheKey] = data.data.gallery;
      return imageCache[cacheKey];
    }
  } catch {}

  const fallbacks: Record<string, string[]> = {
    transport: [
      'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=600&q=80',
      'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&q=80',
    ],
    dining: [
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
    ],
    culture: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
      'https://images.unsplash.com/photo-1527856263669-12c3a0af2aa6?w=600&q=80',
    ],
    nature: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
      'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=600&q=80',
    ],
    accommodation: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80',
    ],
    activity: [
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80',
      'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=600&q=80',
    ],
    explore: [
      'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=600&q=80',
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80',
    ],
  };
  const result = fallbacks[category] || fallbacks.explore;
  imageCache[cacheKey] = result;
  return result;
}

const PlaceGallery = memo(({ place, destination, isMobile }: { place: any; destination?: string; isMobile: boolean }) => {
  const [images, setImages] = useState<string[] | null>(null);

  useEffect(() => {
    // Reuse pre-resolved gallery and hero image from the backend if available
    if (place.galleryImages && place.galleryImages.length > 0) {
      setImages(place.galleryImages.slice(0, 4));
      return;
    }
    if (place.heroImage) {
      setImages([place.heroImage]);
      return;
    }

    const initial = place.image ? [place.image] : [];
    const cat = place.category || 'dining';
    fetchPlaceImages(place.name, cat, destination)
      .then((imgs) => {
        const merged = [...new Set([...initial, ...imgs])].filter(Boolean).slice(0, 4);
        setImages(merged.length > 0 ? merged : initial);
      })
      .catch(() => {
        setImages(initial);
      });
  }, [place.name, place.category, place.image, place.heroImage, place.galleryImages, destination]);

  if (!images) {
    return (
      <div className="mt-3 overflow-x-auto pb-2 -mx-2 px-2 snap-x hide-scrollbar">
        <div className="flex gap-2 min-w-max">
          <div className="shimmer h-24 w-36 rounded-xl snap-start"></div>
          <div className="shimmer h-24 w-36 rounded-xl snap-start"></div>
        </div>
      </div>
    );
  }

  if (images.length === 0) return null;

  return (
    <div className="mt-3 overflow-x-auto pb-2 -mx-2 px-2 snap-x hide-scrollbar">
      <div className="flex gap-2 min-w-max">
        {images.map((img: string, idx: number) => (
          <div
            key={idx}
            className="rounded-xl overflow-hidden snap-start flex-shrink-0 relative group shadow-sm border border-[var(--border)] bg-zinc-100"
            style={{ width: isMobile ? '120px' : '136px', height: isMobile ? '80px' : '90px' }}
          >
            <Image
              src={getOptimizedImageUrl(img, isMobile)}
              alt={`${place.name} view ${idx + 1}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 120px, 136px"
              unoptimized={img.includes('unsplash.com')}
            />
          </div>
        ))}
      </div>
    </div>
  );
});
PlaceGallery.displayName = 'PlaceGallery';

interface PlaceCardProps {
  place: any;
  destinationName?: string;
  onClick: () => void;
}

function PlaceCard({ place, destinationName, onClick }: PlaceCardProps) {
  const isMobile = useIsMobile();

  const hasCoords =
    Array.isArray(place.coordinates) &&
    place.coordinates.length === 2 &&
    !isNaN(Number(place.coordinates[0])) &&
    !isNaN(Number(place.coordinates[1]));

  const lat = hasCoords ? Number(place.coordinates[0]) : null;
  const lng = hasCoords ? Number(place.coordinates[1]) : null;

  return (
    <div
      onClick={onClick}
      className="card p-4 flex-1 hover:border-[var(--primary)] hover:shadow-md transition-all duration-300 min-w-0 overflow-hidden cursor-pointer active:scale-[0.99] group border border-[var(--border)] bg-white dark:bg-zinc-900 rounded-[20px] relative w-full box-border"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="flex-shrink-0 bg-zinc-50 dark:bg-zinc-800 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800/80 transition-transform group-hover:scale-105 flex items-center justify-center">
            {renderCategoryIcon(place.category)}
          </span>
          <div className="flex-1 min-w-0 mt-0.5">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm leading-tight group-hover:text-[var(--primary)] transition-colors">
              {place.name}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed line-clamp-2">
              {place.description}
            </p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${CATEGORY_COLORS[place.category] || 'bg-zinc-50 text-zinc-700 border-zinc-100'}`}>
                {place.category}
              </span>
              {hasCoords ? (
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 shrink-0" />
                  {lat!.toFixed(3)}, {lng!.toFixed(3)}
                </span>
              ) : (
                <span className="text-[10px] text-amber-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 shrink-0 animate-pulse" /> Coordinates loading...
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right flex-shrink-0 flex flex-col items-end justify-between self-stretch">
          <div className="font-mono text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-[var(--primary)] px-2.5 py-1 rounded-lg">
            {place.time}
          </div>
          {/* Subtle click indicator */}
          <span className="text-[10px] text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity font-semibold flex items-center gap-0.5">
            Details <Navigation className="w-2.5 h-2.5 rotate-45" />
          </span>
        </div>
      </div>

      {/* Image Gallery */}
      <PlaceGallery place={place} destination={destinationName} isMobile={isMobile} />
    </div>
  );
}

export default memo(PlaceCard);
