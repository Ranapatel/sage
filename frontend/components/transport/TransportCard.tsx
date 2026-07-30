'use client'
import React, { memo } from 'react'
import Image from 'next/image'

import { useTripStore } from '@/store/tripStore'
import { useAuthStore } from '@/store/authStore'
import { formatPrice } from '@/lib/currency'

import { trackEvent } from '@/lib/analytics'
import toast from 'react-hot-toast'
import { Plane } from 'lucide-react'
import { getOptimizedImageUrl, getLogoUrl } from '@/lib/imageUtils'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import SageScoreBadge from '../ui/SageScoreBadge'

interface Props {
  item: any
  showDetail?: boolean
}

function TransportCard({ item, showDetail }: Props) {
  const isMobile = useIsMobile()
  const { setBookingStatus, addNotification } = useTripStore()
  const { user } = useAuthStore()
  const currency = user?.currency ?? 'INR'
  const { requireAuth } = useRequireAuth()

  const displayPrice = item.price ? formatPrice(item.price, currency) : null

  const initialLogo = React.useMemo(() => getLogoUrl(item.logo || item.name), [item.logo, item.name])
  const [logoSrc, setLogoSrc] = React.useState(initialLogo)
  const [logoError, setLogoError] = React.useState(false)

  const handleSelect = () => {
    setBookingStatus({ flightStatus: 'SELECTED', selectedFlight: item })
    addNotification({
      id: Date.now().toString(),
      type: 'info',
      title: 'Transport Option Selected',
      message: `${item.name}${displayPrice ? ` - ${displayPrice}` : ''}`,
      timestamp: new Date().toISOString(),
      read: false,
    })
    toast.success('Option selected! Complete booking →')
  }

  const fallbackFlightImage = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&q=80'
  const initialBanner = React.useMemo(() => getOptimizedImageUrl(item.image || fallbackFlightImage, isMobile), [item.image, isMobile])
  const [bannerSrc, setBannerSrc] = React.useState(initialBanner)

  React.useEffect(() => {
    setBannerSrc(initialBanner)
  }, [initialBanner])

  return (
    <div className="group bg-white rounded-3xl border border-[#E8E0D8] hover:border-[#EA580C] shadow-xs hover:shadow-xl transition-all duration-300 p-4 sm:p-5 md:p-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 relative overflow-hidden">
      {/* Background hover accent glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100/30 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* SECTION 1: Carrier Logo & Airline Name */}
      <div className="flex items-center gap-3.5 w-full md:w-1/4 shrink-0 relative z-10 border-b md:border-b-0 pb-3 md:pb-0 border-[#E8E0D8]/80">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white border border-[#E8E0D8] p-1.5 md:p-2 flex items-center justify-center relative shadow-2xs shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
          <Image
            src={logoError ? '/logos/default-airline.svg' : logoSrc}
            alt={`${item.name} logo`}
            fill
            className="object-contain p-1"
            onError={() => {
              if (!logoError) {
                setLogoError(true)
                setLogoSrc('/logos/default-airline.svg')
              }
            }}
            unoptimized={!logoError && !logoSrc.startsWith('/')}
          />
        </div>
        <div>
          <h4 className="font-black text-[#1A1A1A] text-base leading-tight font-display group-hover:text-[#EA580C] transition-colors">
            {item.name?.split('—')[0]?.trim()}
          </h4>
          <p className="text-[#6B6B6B] text-xs font-semibold mt-0.5 flex items-center gap-1.5">
            <span>{item.location || 'Economy Class'}</span>
          </p>
        </div>
      </div>

      {/* SECTION 2: Flight Timeline & Duration Bar (Contained Card on Mobile) */}
      <div className="flex-1 w-full bg-[#FFFBF7]/80 md:bg-transparent border md:border-0 border-[#E8E0D8]/80 rounded-2xl p-3 md:p-0 flex items-center justify-between md:justify-center gap-2 sm:gap-4 px-2 relative z-10">
        <div className="text-left md:text-center shrink-0 min-w-[60px]">
          <span className="text-lg sm:text-xl md:text-2xl font-black text-[#1A1A1A] block leading-none font-display">
            {item.departure || item.departureTime || '--:--'}
          </span>
          <span className="text-[10px] font-black text-[#EA580C] uppercase tracking-widest mt-1 block">
            DEP
          </span>
        </div>

        {/* Duration Timeline Bar */}
        <div className="flex-1 max-w-[200px] flex flex-col items-center">
          <span className="text-[11px] sm:text-xs font-black text-[#6B6B6B] mb-1 flex items-center gap-1 bg-white md:bg-[#FFFBF7] border border-[#E8E0D8] px-2.5 py-0.5 rounded-full shadow-2xs">
            {item.duration ? (
              <span>{item.duration}</span>
            ) : null}
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            <span className="text-emerald-700 font-extrabold">{item.stops === 0 ? 'Direct' : `${item.stops || 1} stop`}</span>
          </span>
          <div className="w-full flex items-center gap-1 my-1">
            <div className="w-2.5 h-2.5 rounded-full border-2 border-[#EA580C] bg-white shrink-0 ring-4 ring-orange-50" />
            <div className="flex-1 h-[2px] bg-[#E8E0D8] group-hover:bg-[#EA580C]/40 relative transition-colors">
              <Plane size={14} className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[#EA580C]" />
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#1A1A1A] shrink-0 ring-4 ring-gray-100" />
          </div>
        </div>

        <div className="text-right md:text-center shrink-0 min-w-[60px]">
          <span className="text-lg sm:text-xl md:text-2xl font-black text-[#1A1A1A] block leading-none font-display">
            {item.arrival || item.arrivalTime || '--:--'}
          </span>
          <span className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-widest mt-1 block">
            ARR
          </span>
        </div>
      </div>

      {/* SECTION 3: SageScore + Price + CTA Button */}
      <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto justify-between md:justify-end shrink-0 border-t md:border-t-0 border-[#E8E0D8]/80 pt-3 md:pt-0 relative z-10">
        <SageScoreBadge item={item} type="flight" />

        <div className="text-right">
          {displayPrice ? (
            <>
              <span className="text-xl sm:text-2xl font-black text-[#1A1A1A] block leading-none font-display">
                {formatPrice(item.perPassengerPrice || item.price, currency)}
              </span>
              <span className="text-[11px] font-semibold text-[#6B6B6B] block mt-1">
                per person {item.totalPrice && item.passengers > 1 ? `(${formatPrice(item.totalPrice, currency)} total)` : ''}
              </span>
            </>
          ) : (
            <span className="text-xs font-bold text-[#9CA3AF] italic">Check Live</span>
          )}
        </div>

        <a
          href="#"
          onClick={(e) => {
            e.preventDefault()
            requireAuth(() => {
              trackEvent('booking_click', { type: 'flight', name: item.name, price: item.price })
              window.open(item.bookingLink, '_blank', 'noopener,noreferrer')
            })()
          }}
          className="px-4 sm:px-6 py-3.5 rounded-2xl font-black text-xs sm:text-sm bg-[#EA580C] hover:bg-[#C2410C] text-white shadow-md hover:shadow-xl transition-all duration-200 shrink-0 cursor-pointer active:scale-95"
        >
          {item.source === 'affiliate_redirect' ? 'Search Live →' : 'Book Option →'}
        </a>
      </div>
    </div>
  )
}
export default memo(TransportCard)
