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
    <div className="relative overflow-hidden rounded-3xl border border-[#E8E0D8] hover:border-[#EA580C] transition-all duration-300 hover:shadow-2xl group cursor-pointer min-h-[220px] flex flex-col justify-end">

      {/* ── Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
        style={{ backgroundImage: `url(${bgImage})` }}
      />

      {/* ── Gradient overlay: dark at bottom, lighter at top */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 group-hover:from-black/95 transition-colors" />

      {/* ── Availability badge: top-right */}
      <div className="absolute top-3.5 right-3.5 z-10">
        <span
          className={`text-[10px] font-black px-3 py-1 rounded-xl backdrop-blur-md border uppercase tracking-wider shadow-2xs ${
            isAvailable
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
          }`}
        >
          {item.liveStatus}
        </span>
      </div>

      {/* ── Car type badge: top-left */}
      <div className="absolute top-3.5 left-3.5 flex gap-2 z-10">
        <span className="text-[10px] font-black px-3 py-1 rounded-xl bg-black/50 text-white border border-white/20 backdrop-blur-md uppercase tracking-wider">
          {item.carType}
        </span>
        {item.capacity && (
          <span className="text-[10px] font-black px-2.5 py-1 rounded-xl bg-black/50 text-white border border-white/20 backdrop-blur-md flex items-center gap-1">
            <Users size={11} className="text-[#EA580C]" /> {item.capacity} Seats
          </span>
        )}
      </div>

      {/* ── Card content: bottom */}
      <div className="relative z-10 p-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">

        {/* Left: name + offers */}
        <div className="flex-1 min-w-0">
          <p className="font-black text-white text-lg leading-tight truncate drop-shadow-md font-display">
            {item.name}
          </p>

          {item.offers?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {item.offers.map((o: string, i: number) => (
                <span
                  key={i}
                  className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg bg-orange-500/25 text-orange-200 border border-orange-500/40 flex items-center gap-1 backdrop-blur-md"
                >
                  <Tag size={10} /> {o}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right: price + CTA */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-end gap-3 shrink-0">
          <div className="text-right">
            <p className="text-[10px] text-gray-300 font-bold uppercase tracking-wider">per day</p>
            <p className="text-2xl font-black text-white leading-none drop-shadow-md font-display mt-0.5">
              {displayPrice}
            </p>
          </div>

          <a
            href={item.bookingLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleBook}
            className="shrink-0 py-2.5 px-5 rounded-2xl font-black text-xs bg-[#EA580C] hover:bg-[#C2410C] text-white transition-all shadow-md hover:shadow-xl whitespace-nowrap active:scale-95 cursor-pointer"
          >
            Book Rental
          </a>
        </div>
      </div>
    </div>
  )
}

export default memo(CarCard)
