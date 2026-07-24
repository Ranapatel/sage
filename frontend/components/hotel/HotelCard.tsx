import React, { memo, useState, useCallback } from 'react'
import { useTripStore } from '@/store/tripStore'
import HotelImage from './HotelImage'
import { useAuthStore } from '@/store/authStore'
import { formatPrice } from '@/lib/currency'
import toast from 'react-hot-toast'
import { getOptimizedImageUrl } from '@/lib/imageUtils'
import { useIsMobile } from '@/hooks/useIsMobile'
import SageScoreBadge from '../ui/SageScoreBadge'
import { Wifi, Coffee, Waves, Car, Sparkles, Dumbbell, Utensils, Wine, Wind, Flame, Star, Heart } from 'lucide-react'

// ── Amenity detection from raw data ──────────────────────────────────────────
const AMENITY_MAP: Record<string, { icon: React.ComponentType<any>; label: string }> = {
  wifi: { icon: Wifi, label: 'Free WiFi' },
  breakfast: { icon: Coffee, label: 'Breakfast' },
  pool: { icon: Waves, label: 'Pool' },
  parking: { icon: Car, label: 'Parking' },
  spa: { icon: Sparkles, label: 'Spa' },
  gym: { icon: Dumbbell, label: 'Gym' },
  restaurant: { icon: Utensils, label: 'Restaurant' },
  bar: { icon: Wine, label: 'Bar' },
  ac: { icon: Wind, label: 'A/C' },
}

function detectAmenities(amenities?: string[], offers?: string[]): { icon: React.ComponentType<any>; label: string }[] {
  const all = [...(amenities || []), ...(offers || [])].join(' ').toLowerCase()
  const found: { icon: React.ComponentType<any>; label: string }[] = []

  // Breakfast detection
  if (all.includes('breakfast') || all.includes('bed and breakfast') || all.includes('b&b')) {
    found.push(AMENITY_MAP.breakfast)
  }
  if (all.includes('wifi') || all.includes('wi-fi')) found.push(AMENITY_MAP.wifi)
  if (all.includes('pool') || all.includes('swim')) found.push(AMENITY_MAP.pool)
  if (all.includes('parking') || all.includes('valet')) found.push(AMENITY_MAP.parking)
  if (all.includes('spa') || all.includes('massage')) found.push(AMENITY_MAP.spa)
  if (all.includes('gym') || all.includes('fitness')) found.push(AMENITY_MAP.gym)
  if (all.includes('restaurant') || all.includes('dining')) found.push(AMENITY_MAP.restaurant)

  // Default amenities if none detected
  if (found.length === 0) {
    found.push(AMENITY_MAP.wifi, AMENITY_MAP.ac)
  }

  return found.slice(0, 4) // Max 4
}

// ── Hotel type from name/category ────────────────────────────────────────────
function getHotelType(name: string, categoryName?: string): string {
  const n = (name + ' ' + (categoryName || '')).toLowerCase()
  if (n.includes('resort')) return 'Resort'
  if (n.includes('villa')) return 'Villa'
  if (n.includes('boutique')) return 'Boutique'
  if (n.includes('beach')) return 'Beach Hotel'
  if (n.includes('palace') || n.includes('heritage')) return 'Heritage'
  if (n.includes('hostel')) return 'Hostel'
  if (n.includes('apartment') || n.includes('suite')) return 'Suites'
  if (n.includes('lodge')) return 'Lodge'
  return 'Hotel'
}

// ── Rating label ─────────────────────────────────────────────────────────────
function getRatingInfo(rating: number): { label: string; cls: string } {
  if (rating >= 4.5) return { label: 'Exceptional', cls: 'excellent' }
  if (rating >= 4) return { label: 'Excellent', cls: 'very-good' }
  if (rating >= 3) return { label: 'Very Good', cls: 'good' }
  return { label: 'Good', cls: 'fair' }
}

interface Props {
  item: any
  showDetail?: boolean
}

function HotelCard({ item, showDetail }: Props) {
  const isMobile = useIsMobile()
  const { setBookingStatus, addNotification, savedHotels, toggleSaveHotel, setHotelDetailId } = useTripStore()
  const { user } = useAuthStore()
  const currency = user?.currency ?? 'INR'

  const [imgIdx, setImgIdx] = useState(0)
  const [saving, setSaving] = useState(false)

  const images = item.gallery_paths?.length ? item.gallery_paths : (item.image_path ? [item.image_path] : (item.image ? [item.image] : []))
  const isSaved = savedHotels.includes(item.id)
  const displayPrice = item.price ? formatPrice(item.price, currency) : null
  const totalDisplay = item.totalPrice ? formatPrice(item.totalPrice, currency) : null
  const hotelType = getHotelType(item.name, item.categoryName)
  const amenities = detectAmenities(item.amenities, item.offers)
  const ratingInfo = getRatingInfo(item.rating || 0)
  const starCount = Math.min(5, Math.max(1, Math.round(item.rating || 3)))

  // ── Carousel navigation ────────────────────────────────────────────────────
  const goNext = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setImgIdx(prev => (prev + 1) % images.length)
  }, [images.length])

  const goPrev = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setImgIdx(prev => (prev - 1 + images.length) % images.length)
  }, [images.length])

  // ── Save hotel ─────────────────────────────────────────────────────────────
  const handleSave = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setSaving(true)
    toggleSaveHotel(item.id)
    toast.success(isSaved ? 'Removed from saved' : 'Saved!', { icon: isSaved ? '💔' : '❤️' })
    setTimeout(() => setSaving(false), 400)
  }, [item.id, isSaved, toggleSaveHotel])

  const handleViewRooms = useCallback(() => {
    setHotelDetailId(item.id)
    setBookingStatus({ hotelStatus: 'SELECTED', selectedHotel: item })
    addNotification({
      id: Date.now().toString(),
      type: 'info',
      title: 'Hotel Selected',
      message: `${item.name}${displayPrice ? ` — ${displayPrice}/night` : ''}`,
      timestamp: new Date().toISOString(),
      read: false,
    })
    toast.success('Hotel selected! Complete booking →')
  }, [item, displayPrice, setHotelDetailId, setBookingStatus, addNotification])

  // ── Source badge config ────────────────────────────────────────────────────
  const sourceBadge = (() => {
 if (item.source === 'live') return { label: 'Live Price', cls: 'badge-green' }
 if (item.source === 'affiliate_redirect') return { label: 'Search Live', cls: 'badge-amber' }
 if (item.source === 'api_error') return { label: '️ Unavailable', cls: 'badge-red' }
    return null
  })()

  return (
    <div className="hotel-card" id={`hotel-card-${item.id}`}>
      {/* ── Image Carousel ──────────────────────────────────────────────── */}
      <div className="hotel-carousel">
        <div
          className="hotel-carousel-track"
          style={{ transform: `translateX(-${imgIdx * 100}%)` }}
        >
          {images.length > 0 ? (
            images.map((path: string, i: number) => (
              <HotelImage
                key={i}
                path={path}
                alt={`${item.name} — photo ${i + 1}`}
                className="hotel-carousel-track-img"
                style={{ minWidth: '100%', height: '100%', objectFit: 'cover' }}
                preferredSize="bigger"
              />
            ))
          ) : (
            <HotelImage
              path={null}
              alt={item.name}
              className="hotel-carousel-track-img"
              style={{ minWidth: '100%', height: '100%', objectFit: 'cover' }}
              preferredSize="bigger"
            />
          )}
        </div>

        {/* Nav arrows */}
        {images.length > 1 && (
          <>
            <button className="hotel-carousel-btn prev" onClick={goPrev} aria-label="Previous image">‹</button>
            <button className="hotel-carousel-btn next" onClick={goNext} aria-label="Next image">›</button>
          </>
        )}

        {/* Dot indicators */}
        {images.length > 1 && (
          <div className="hotel-carousel-dots">
            {images.map((_: string, i: number) => (
              <button
                key={i}
                className={`hotel-carousel-dot ${i === imgIdx ? 'active' : ''}`}
                onClick={(e) => { e.stopPropagation(); setImgIdx(i) }}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Save / Heart */}
        <button
          className={`hotel-save-btn ${isSaved ? 'saved' : ''} ${saving ? 'saving' : ''}`}
          onClick={handleSave}
          aria-label={isSaved ? 'Remove from saved' : 'Save hotel'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>

        {/* Hotel type badge */}
        <div className="hotel-type-badge">{hotelType}</div>

        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%',
          background: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)',
          pointerEvents: 'none', zIndex: 5
        }} />
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div style={{ padding: '14px 16px 16px' }}>

        {/* Hotel Name + Location */}
        <div style={{ marginBottom: '6px' }}>
          <h3 style={{
            fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.3,
            color: 'var(--text-primary)',
            overflow: 'hidden'
          }}>
            {item.name}
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {item.location}
          </p>
        </div>

        {/* Star Rating + Review Score */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <span style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
            {'★'.repeat(starCount)}{'☆'.repeat(5 - starCount)}
          </span>
          {item.rating > 0 && (
            <span className={`hotel-rating-pill ${ratingInfo.cls}`}>
              {item.rating.toFixed(1)} {ratingInfo.label}
            </span>
          )}
        </div>

        {/* Amenities Row */}
        {showDetail && amenities.length > 0 && (
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {amenities.map((a, i) => {
              const IconComp = a.icon
              return (
                <span key={i} className="hotel-amenity" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <IconComp size={13} />
                  {a.label}
                </span>
              )
            })}
          </div>
        )}

        {/* Pricing Section */}
        <div style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          marginBottom: '12px', paddingTop: showDetail ? '0' : '4px',
          borderTop: showDetail ? 'none' : '1px solid var(--border)', marginTop: showDetail ? '0' : '8px'
        }}>
          <div>
            <span className="hotel-price-from">Starting from</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span className="hotel-price-amount">{displayPrice || '—'}</span>
              <span className="hotel-price-unit">/ night</span>
            </div>
            {totalDisplay && item.nights && item.nights > 1 && (
              <span className="hotel-price-total">
                {totalDisplay} total · {item.nights} nights
              </span>
            )}
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              +taxes & fees
            </div>
          </div>

          {/* Deal badge */}
          {item.score > 0.7 && (
            <span className="hotel-deal-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Flame size={12} /> Great Deal
            </span>
          )}
        </div>

        {/* CTA */}
        <button className="hotel-cta" onClick={handleViewRooms}>
          View Rooms
        </button>
      </div>
    </div>
  )
}
export default memo(HotelCard)
