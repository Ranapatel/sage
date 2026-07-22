'use client'
import React, { memo } from 'react'
import Image from 'next/image'

import { useTripStore } from '@/store/tripStore'
import { useAuthStore } from '@/store/authStore'
import { formatPrice } from '@/lib/currency'

import { trackEvent } from '@/lib/analytics'
import toast from 'react-hot-toast'
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
 title: '️ Flight Selected',
      message: `${item.name}${displayPrice ? ` - ${displayPrice}` : ''}`,
      timestamp: new Date().toISOString(),
      read: false,
    })
    toast.success('Flight selected! Complete booking →')
  }

  const fallbackFlightImage = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&q=80'
  const initialBanner = React.useMemo(() => getOptimizedImageUrl(item.image || fallbackFlightImage, isMobile), [item.image, isMobile])
  const [bannerSrc, setBannerSrc] = React.useState(initialBanner)

  React.useEffect(() => {
    setBannerSrc(initialBanner)
  }, [initialBanner])

  return (
    <div className="bg-white rounded-2xl border border-slate-200 hover:border-orange-500/50 hover:shadow-lg transition-all duration-300 p-4 md:p-5 flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden group">

      {/* LEFT: Carrier Logo & Airline Name */}
      <div className="flex items-center gap-3.5 w-full md:w-1/4 shrink-0">
        <div className="w-12 h-12 rounded-xl bg-slate-50 p-2 flex items-center justify-center relative border border-slate-200/60 shrink-0">
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
          <h4 className="font-extrabold text-slate-900 text-sm leading-tight group-hover:text-[#EA580C] transition-colors">
            {item.name?.split('—')[0]?.trim()}
          </h4>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            {item.location || 'Economy Class'}
          </p>
        </div>
      </div>

      {/* CENTER: Flight Timeline & Duration Bar */}
      <div className="flex-1 w-full flex items-center justify-center gap-4 px-2">
        <div className="text-center min-w-[55px]">
          <span className="text-base font-black text-slate-900 block leading-tight">
            {item.departure || '06:00'}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            DEP
          </span>
        </div>

        {/* Duration Timeline Bar */}
        <div className="flex-1 max-w-[180px] flex flex-col items-center">
          <span className="text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
            <span>{item.duration || '2h 15m'}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            <span className="text-emerald-700 font-extrabold">{item.stops === 0 ? 'Non-stop' : `${item.stops} stop`}</span>
          </span>
          <div className="w-full flex items-center gap-1">
            <div className="w-2 h-2 rounded-full border-2 border-[#EA580C] bg-white shrink-0" />
            <div className="flex-1 h-[2px] bg-gradient-to-r from-orange-400 via-amber-400 to-orange-400 relative">
              <span className="text-[10px] absolute -top-3 left-1/2 -translate-x-1/2 text-[#EA580C]">✈</span>
            </div>
            <div className="w-2 h-2 rounded-full bg-[#EA580C] shrink-0" />
          </div>
        </div>

        <div className="text-center min-w-[55px]">
          <span className="text-base font-black text-slate-900 block leading-tight">
            {item.arrival || '08:15'}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            ARR
          </span>
        </div>
      </div>

      {/* RIGHT: SageScore + Price + CTA Button */}
      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end shrink-0 border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
        <SageScoreBadge item={item} type="flight" />

        <div className="text-right">
          {displayPrice ? (
            <>
              <span className="text-xl font-black text-[#EA580C] block leading-tight">
                {displayPrice}
              </span>
              <span className="text-[11px] font-medium text-slate-400 block">
                per person
              </span>
            </>
          ) : (
            <span className="text-xs font-semibold text-slate-400 italic">Check Live</span>
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
          className="px-5 py-2.5 rounded-xl font-extrabold text-xs bg-gradient-to-r from-[#EA580C] to-[#F97316] text-white hover:shadow-md hover:shadow-orange-500/25 transition-all duration-200 shrink-0"
        >
          {item.source === 'affiliate_redirect' ? 'Search Live →' : 'Book Flight →'}
        </a>
      </div>
    </div>
  )
}
export default memo(TransportCard)
