'use client'

import { useAuthStore } from '@/store/authStore'
import { formatPrice } from '@/lib/currency'
import { trackEvent } from '@/lib/analytics'
import React, { memo } from 'react'
import { Users, Tag } from 'lucide-react'

interface Props {
  item: any
}

// High-quality car images mapped by car type (case-insensitive matching)
const CAR_TYPE_IMAGES: Record<string, string> = {
  economy:
    'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80&auto=format&fit=crop',
  hatchback:
    'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&q=80&auto=format&fit=crop',
  sedan:
    'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80&auto=format&fit=crop',
  suv:
    'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80&auto=format&fit=crop',
  muv:
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80&auto=format&fit=crop',
  minivan:
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80&auto=format&fit=crop',
  van:
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80&auto=format&fit=crop',
  luxury:
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80&auto=format&fit=crop',
  premium:
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80&auto=format&fit=crop',
  tempo:
    'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?w=800&q=80&auto=format&fit=crop',
  bus:
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80&auto=format&fit=crop',
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80&auto=format&fit=crop'

function getCarImage(carType: string, itemImage?: string): string {
  if (itemImage && !itemImage.includes('photo-1549317661-bd32c8ce0db2')) return itemImage
  if (!carType) return FALLBACK_IMAGE
  const key = carType.toLowerCase()
  for (const [type, url] of Object.entries(CAR_TYPE_IMAGES)) {
    if (key.includes(type)) return url
  }
  return FALLBACK_IMAGE
}

function CarCard({ item }: Props) {
  const { user } = useAuthStore()
  const currency = user?.currency ?? 'INR'
  const displayPrice = formatPrice(item.price, currency)

  const bgImage = getCarImage(item.carType, item.image)
  const isAvailable = item.liveStatus === 'Available'

  const handleBook = () => {
    trackEvent('booking_click', { type: 'car', name: item.name, price: item.price })
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] hover:border-[var(--primary)] transition-all duration-300 hover:shadow-xl hover:shadow-[var(--primary)]/20 group cursor-pointer min-h-[200px] flex flex-col justify-end">

      {/* ── Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
        style={{ backgroundImage: `url(${bgImage})` }}
      />

      {/* ── Gradient overlay: dark at bottom, lighter at top */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/10" />

      {/* ── Availability badge: top-right */}
      <div className="absolute top-3 right-3">
        <span
          className={`text-[0.6rem] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm border ${
            isAvailable
              ? 'bg-green-500/20 text-green-300 border-green-500/40'
              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
          }`}
        >
          {item.liveStatus}
        </span>
      </div>

      {/* ── Car type badge: top-left */}
      <div className="absolute top-3 left-3 flex gap-1.5">
        <span className="text-[0.6rem] font-bold px-2.5 py-1 rounded-full bg-white/15 text-white border border-white/20 backdrop-blur-sm">
          {item.carType}
        </span>
        {item.capacity && (
          <span className="text-[0.6rem] font-bold px-2 py-1 rounded-full bg-white/15 text-white border border-white/20 backdrop-blur-sm flex items-center gap-1">
            <Users size={9} /> {item.capacity}
          </span>
        )}
      </div>

      {/* ── Card content: bottom */}
      <div className="relative z-10 p-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">

        {/* Left: name + offers */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-[1rem] leading-tight truncate drop-shadow">
            {item.name}
          </p>

          {item.offers?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {item.offers.map((o: string, i: number) => (
                <span
                  key={i}
                  className="text-[0.6rem] font-semibold px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-300 border border-amber-500/30 flex items-center gap-0.5 backdrop-blur-sm"
                >
                  <Tag size={8} /> {o}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right: price + CTA */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-end gap-3 shrink-0">
          <div className="text-right">
            <p className="text-[0.6rem] text-white/60 font-medium">per day</p>
            <p className="text-xl font-black text-white leading-tight drop-shadow">
              {displayPrice}
            </p>
          </div>

          <a
            href={item.bookingLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleBook}
            className="shrink-0 py-2 px-5 rounded-xl font-bold text-sm bg-gradient-to-r from-[var(--primary)] to-purple-600 text-white hover:opacity-90 transition-opacity shadow-lg shadow-orange-500/30 whitespace-nowrap"
          >
            Book Now
          </a>
        </div>
      </div>
    </div>
  )
}

export default memo(CarCard)
