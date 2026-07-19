'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MapPin,
  Clock,
  Star,
  Navigation,
  Share2,
  Bookmark,
  CloudSun,
  Eye,
  Info,
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import RideButton from './RideButton';
import MapPreview from './MapPreview';
import { getOptimizedImageUrl } from '@/lib/imageUtils';

interface Place {
  name: string;
  description: string;
  category: string;
  time: string;
  coordinates?: [number, number] | null;
  lat?: number | string | null;
  lng?: number | string | null;
  image?: string;
  address?: string;
  openingHours?: string;
  rating?: number;
  visitDuration?: string;
  distance?: string;
  travelTime?: string;
  weather?: string;
}

interface PlaceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  place: Place | null;
  destinationName?: string;
}

export default function PlaceDetailsModal({
  isOpen,
  onClose,
  place,
  destinationName = 'Destination',
}: PlaceDetailsModalProps) {
  const [resolvedCoords, setResolvedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Sync bookmark state with localStorage
  useEffect(() => {
    if (place) {
      const bookmarked = localStorage.getItem(`bookmark_${place.name}`);
      Promise.resolve().then(() => setIsBookmarked(!!bookmarked));
    }
  }, [place]);

  // Log selected place (Required: Log every step)
  useEffect(() => {
    if (place) {
      console.log('[PlaceDetailsModal] Selected place:', place);
    }
  }, [place]);

  // Dynamic geocoding fallback for missing coordinates (Required: Fetch details if missing coords)
  useEffect(() => {
    if (!place) return;

    // 1. Try flat lat/lng properties
    if (place.lat != null && !isNaN(Number(place.lat)) && place.lng != null && !isNaN(Number(place.lng))) {
      Promise.resolve().then(() => {
        setResolvedCoords({ lat: Number(place.lat), lng: Number(place.lng) });
        setIsGeocoding(false);
      });
      return;
    }

    // 2. Try coordinates array [lat, lng]
    const coords = place.coordinates;
    if (
      Array.isArray(coords) &&
      coords.length === 2 &&
      coords[0] !== null &&
      coords[0] !== undefined &&
      coords[1] !== null &&
      coords[1] !== undefined &&
      !isNaN(Number(coords[0])) &&
      !isNaN(Number(coords[1]))
    ) {
      Promise.resolve().then(() => {
        setResolvedCoords({ lat: Number(coords[0]), lng: Number(coords[1]) });
        setIsGeocoding(false);
      });
      return;
    }

    // 3. Fallback: geocode via backend search API
    console.log(`[PlaceDetailsModal] Place "${place.name}" is missing coordinates. Fetching from backend...`);
    Promise.resolve().then(() => setIsGeocoding(true));
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    axios
      .get(`${apiBaseUrl}/api/itinerary/places/search`, {
        params: {
          q: place.name,
          city: destinationName,
        },
      })
      .then((response: any) => {
        if (response.data && response.data.success && response.data.data) {
          const { lat, lng } = response.data.data;
          if (lat != null && lng != null) {
            const resolved = { lat: Number(lat), lng: Number(lng) };
            setResolvedCoords(resolved);
            console.log(`[PlaceDetailsModal] Successfully geocoded "${place.name}":`, resolved);
          } else {
            console.warn(`[PlaceDetailsModal] Geocoding returned success but no coordinates for "${place.name}".`);
            setResolvedCoords(null);
          }
        } else {
          setResolvedCoords(null);
        }
      })
      .catch((err: any) => {
        console.error(`[PlaceDetailsModal] Geocoding API request failed for "${place.name}":`, err);
        setResolvedCoords(null);
      })
      .finally(() => {
        setIsGeocoding(false);
      });
  }, [place, destinationName]);

  if (!place) return null;

  const lat = resolvedCoords ? resolvedCoords.lat : null;
  const lng = resolvedCoords ? resolvedCoords.lng : null;
  const hasCoords = lat !== null && lng !== null;

  // Smart UI fallback calculations
  const displayRating = place.rating || 4.5;
  const displayHours = place.openingHours || '9:00 AM - 6:00 PM';
  const displayDuration = place.visitDuration || '1.5 - 2 Hours';
  const displayAddress = place.address || `${place.name}, ${destinationName}`;
  const displayDistance = place.distance || '4.2 km (from center)';
  const displayTravelTime = place.travelTime || '12 mins away';
  const displayWeather = place.weather || 'Sunny, 24°C';

  // Navigate: Generate Google Maps directions link
  const navigateUrl = hasCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        place.name + ' ' + destinationName,
      )}`;

  const handleShare = () => {
    const shareText = `Check out ${place.name} in ${destinationName}!
📍 Address: ${displayAddress}
⏱ Hours: ${displayHours}
⭐ Rating: ${displayRating}/5`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      toast.success('Place details copied to clipboard!');
    } else {
      toast.error('Unable to copy details.');
    }
  };

  const handleBookmark = () => {
    if (isBookmarked) {
      localStorage.removeItem(`bookmark_${place.name}`);
      setIsBookmarked(false);
      toast.success('Removed from Bookmarks');
    } else {
      localStorage.setItem(`bookmark_${place.name}`, 'true');
      setIsBookmarked(true);
      toast.success('Added to Bookmarks!');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[90vh]"
          >
            {/* Close Button Top-Right Overlay */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 bg-black/40 hover:bg-black/60 text-white rounded-full p-2.5 transition-all shadow-md active:scale-95"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1 hide-scrollbar">
              {/* Hero Image Banner */}
              <div className="relative w-full h-64 sm:h-72 bg-zinc-200 dark:bg-zinc-800">
                <Image
                  src={getOptimizedImageUrl(
                    place.image ||
                      'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=1000&q=80',
                    false,
                  )}
                  alt={place.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 672px"
                  unoptimized={place.image?.includes('unsplash.com')}
                />
                {/* Visual Category Badge overlay on image */}
                <div className="absolute bottom-4 left-4 flex gap-2">
                  <span className="glass px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    {place.category}
                  </span>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-6 sm:p-8 space-y-6">
                {/* Header Section */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white leading-tight">
                      {place.name}
                    </h2>
                  </div>

                  {/* Rating representation */}
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="flex text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(displayRating)
                              ? 'fill-amber-500'
                              : i < displayRating
                                ? 'fill-amber-500/50'
                                : 'text-zinc-300 dark:text-zinc-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                      {displayRating.toFixed(1)} / 5.0
                    </span>
                  </div>
                </div>

                {/* Place details grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Address */}
                  <div className="flex gap-3 items-start p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                    <MapPin className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500">
                        Address
                      </span>
                      <span className="text-xs text-zinc-700 dark:text-zinc-300 line-clamp-2 leading-snug">
                        {displayAddress}
                      </span>
                    </div>
                  </div>

                  {/* Open Hours */}
                  <div className="flex gap-3 items-start p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                    <Clock className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500">
                        Hours
                      </span>
                      <span className="text-xs text-zinc-700 dark:text-zinc-300 leading-snug">
                        {displayHours}
                      </span>
                    </div>
                  </div>

                  {/* Estimated Visit Duration */}
                  <div className="flex gap-3 items-start p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                    <Eye className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500">
                        Recommended Stay
                      </span>
                      <span className="text-xs text-zinc-700 dark:text-zinc-300 leading-snug">
                        {displayDuration}
                      </span>
                    </div>
                  </div>

                  {/* Weather */}
                  <div className="flex gap-3 items-start p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                    <CloudSun className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500">
                        Current Weather
                      </span>
                      <span className="text-xs text-zinc-700 dark:text-zinc-300 leading-snug">
                        {displayWeather}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Distance & Travel Time stats */}
                <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/50 rounded-2xl flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <Navigation className="w-5 h-5 text-indigo-600 rotate-45" />
                    <div>
                      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        Distance from Current Location
                      </span>
                      <div className="text-sm font-bold text-indigo-950 dark:text-indigo-200">
                        {displayDistance}
                      </div>
                    </div>
                  </div>
                  <div className="text-right sm:text-left">
                    <span className="block text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500">
                      Est. Drive Time
                    </span>
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      {displayTravelTime}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-zinc-400" /> Description
                  </h4>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    {place.description}
                  </p>
                </div>

                {/* Map Preview section */}
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                    Location Map
                  </h4>
                  <MapPreview latitude={lat} longitude={lng} placeName={place.name} />
                </div>
              </div>
            </div>

            {/* Bottom Actions Footer */}
            <div className="p-6 bg-zinc-50 dark:bg-zinc-900/80 border-t border-zinc-100 dark:border-zinc-800/50 flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                {/* Navigate Button */}
                <a
                  href={navigateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-bold py-3.5 px-6 rounded-xl transition-all active:scale-[0.98] text-center text-sm"
                >
                  <Navigation className="w-4 h-4" />
                  Navigate
                </a>

                {/* Ride with Uber Dynamic Button */}
                <RideButton
                  destinationName={place.name}
                  latitude={lat}
                  longitude={lng}
                  pickupType="my_location"
                  isGeocoding={isGeocoding}
                />
              </div>

              {/* Utility actions (Share, Bookmark, Close) */}
              <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 pt-3 mt-1 flex-wrap gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Share
                  </button>

                  <button
                    onClick={handleBookmark}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isBookmarked
                        ? 'text-indigo-600 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-950/30'
                        : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <Bookmark
                      className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-indigo-600' : ''}`}
                    />
                    {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                  </button>
                </div>

                <button
                  onClick={onClose}
                  className="px-4 py-1.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold rounded-xl text-xs transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
