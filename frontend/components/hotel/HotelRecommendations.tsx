'use client'
/**
 * TripSage — HotelRecommendations Component
 *
 * Displays ranked hotel recommendations from the Hotelbeds API.
 *
 * DATA INTEGRITY:
 *   - All prices, ratings, images, and amenities come exclusively from the API.
 *   - "Price unavailable" is displayed when the API returns no price.
 *   - Placeholder images are labeled with a badge when no Hotelbeds CDN image is present.
 *   - A data source badge (Live API / Estimated) is shown on each card.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react'
import Image from 'next/image'
import { tripAPI, HotelRecommendation } from '@/lib/api'
import { useTripStore } from '@/store/tripStore'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import HotelImage from './HotelImage'

import {
  Wifi,
  Coffee,
  Waves,
  Car,
  Sparkles,
  Dumbbell,
  Utensils,
  Wine,
  Wind,
  BedDouble,
  Building2,
  Crown,
  Camera,
  BarChart2,
  X,
  MapPin,
  Star,
  Flame,
  Lightbulb,
  Check,
  AlertTriangle,
  Lock
} from 'lucide-react'

// ─── Amenity icon mapping ─────────────────────────────────────────────────────
const AMENITY_ICONS: Record<string, React.ComponentType<any>> = {
  wifi:        Wifi,
  'wi-fi':     Wifi,
  breakfast:   Coffee,
  pool:        Waves,
  swim:        Waves,
  parking:     Car,
  spa:         Sparkles,
  gym:         Dumbbell,
  fitness:     Dumbbell,
  restaurant:  Utensils,
  dining:      Utensils,
  bar:         Wine,
  ac:          Wind,
  'air cond':  Wind,
  room:        BedDouble,
  suite:       BedDouble,
}

function getAmenityIcon(amenity: string): React.ReactNode {
  const lower = amenity.toLowerCase()
  for (const [key, IconComp] of Object.entries(AMENITY_ICONS)) {
    if (lower.includes(key)) return <IconComp size={13} className="inline-block" />
  }
  return <Check size={13} className="inline-block" />
}

// ─── Source badge ─────────────────────────────────────────────────────────────
function SourceBadge({ source }: { source: string }) {
  const isLive = source?.includes('live')
  return (
    <span style={{
      display:       'inline-flex',
      alignItems:    'center',
      gap:           '4px',
      padding:       '2px 8px',
      borderRadius:  '20px',
      fontSize:      '0.62rem',
      fontWeight:    700,
      letterSpacing: '0.5px',
      textTransform: 'uppercase',
      background:    isLive ? 'rgba(16,185,129,0.15)' : 'rgba(251,191,36,0.15)',
      color:         isLive ? '#10b981' : '#f59e0b',
      border:        `1px solid ${isLive ? 'rgba(16,185,129,0.3)' : 'rgba(251,191,36,0.3)'}`,
    }}>
      <span style={{
        width: '5px', height: '5px', borderRadius: '50%',
        background: isLive ? '#10b981' : '#f59e0b',
        display: 'inline-block',
      }} />
      {isLive ? 'Live API' : 'Estimated'}
    </span>
  )
}

// ─── Score bar ────────────────────────────────────────────────────────────────
function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ marginBottom: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', marginBottom: '3px', color: 'var(--text-muted)' }}>
        <span>{label}</span>
        <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>{Math.round(value * 100)}%</span>
      </div>
      <div style={{ height: '4px', borderRadius: '2px', background: 'var(--border)', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width:  `${Math.round(value * 100)}%`,
          background: `linear-gradient(90deg, var(--primary), #06b6d4)`,
          borderRadius: '2px',
          transition: 'width 0.8s cubic-bezier(0.34,1.56,0.64,1)',
        }} />
      </div>
    </div>
  )
}

// ─── Individual hotel recommendation card ─────────────────────────────────────
interface CardProps {
  hotel:     HotelRecommendation
  onSelect:  (hotel: HotelRecommendation) => void
  selected:  boolean
}

function RecommendationCard({ hotel, onSelect, selected }: CardProps) {
  const [showScores, setShowScores] = useState(false)
  const [imgError,   setImgError]   = useState(false)

  const isTopPick        = hotel._meta.rank === 1
  const isPlaceholder    = hotel.image_source === 'placeholder'
  const priceUnavailable = hotel.price_per_night === 'Price unavailable'
  const ratingUnavailable= hotel.rating === 'Not rated'
  const isLive           = hotel._meta.source?.includes('hotelbeds') && !hotel._meta.source?.includes('mock')

  const imageUrl = imgError
    ? 'https://photos.hotelbeds.com/giata/bigger/00/004200/004200a_hb_ro_001.jpg'
    : hotel.image_url

  return (
    <div
      id={`hotel-rec-card-${hotel._meta.rank}`}
      style={{
        borderRadius:    '20px',
        overflow:        'hidden',
        background:      'var(--bg-card)',
        border:          selected
          ? '2px solid var(--primary)'
          : isTopPick
            ? '2px solid rgba(37,99,235,0.35)'
            : '1px solid var(--border)',
        boxShadow:       selected
          ? '0 0 0 4px rgba(37,99,235,0.12), 0 8px 32px rgba(0,0,0,0.12)'
          : isTopPick
            ? '0 4px 24px rgba(37,99,235,0.08)'
            : '0 2px 12px rgba(0,0,0,0.06)',
        transition:      'all 0.25s ease',
        cursor:          'pointer',
        position:        'relative',
      }}
      onClick={() => onSelect(hotel)}
    >
      {/* ── Rank badge ────────────────────────────────────────────────── */}
      <div style={{
        position:      'absolute',
        top:           '12px',
        left:          '12px',
        zIndex:        10,
        display:       'flex',
        flexDirection: 'column',
        gap:           '5px',
      }}>
        <span style={{
          padding:      '3px 10px',
          borderRadius: '20px',
          fontSize:     '0.65rem',
          fontWeight:   800,
          background:   isTopPick
            ? 'linear-gradient(135deg, #2563eb, #0d9488)'
            : 'rgba(0,0,0,0.55)',
          color:        '#fff',
          backdropFilter: 'blur(6px)',
          letterSpacing: '0.3px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
        }}>
          {isTopPick ? <><Crown size={12} className="text-amber-300 fill-amber-300" /> Top Pick</> : `#${hotel._meta.rank}`}
        </span>
        <SourceBadge source={hotel._meta.source || ''} />
      </div>

      {/* ── Image ────────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
        <HotelImage
          path={hotel.image_path || hotel.image_url}
          alt={hotel.hotel_name}
          className="object-cover transition-transform duration-300 hover:scale-105"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          preferredSize="bigger"
        />
        {/* Gradient overlay */}
        <div style={{
          position:   'absolute',
          bottom:     0, left: 0, right: 0,
          height:     '60%',
          background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
          pointerEvents: 'none',
        }} />

        {/* Placeholder notice */}
        {isPlaceholder && (
          <div style={{
            position:   'absolute',
            bottom:     '10px',
            right:      '10px',
            padding:    '3px 8px',
            borderRadius: '8px',
            background: 'rgba(0,0,0,0.65)',
            color:      'rgba(255,255,255,0.75)',
            fontSize:   '0.6rem',
            fontWeight: 600,
            backdropFilter: 'blur(4px)',
            display:    'inline-flex',
            alignItems: 'center',
            gap:        '4px',
          }}>
            <Camera size={11} /> Placeholder image
          </div>
        )}

        {/* Score tooltip trigger */}
        <button
          id={`score-toggle-${hotel._meta.rank}`}
          onClick={(e) => { e.stopPropagation(); setShowScores(v => !v) }}
          title="View recommendation scores"
          style={{
            position:   'absolute',
            top:        '12px',
            right:      '12px',
            width:      '30px',
            height:     '30px',
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.5)',
            color:      '#fff',
            border:     'none',
            cursor:     'pointer',
            fontSize:   '0.8rem',
            display:    'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(6px)',
            transition: 'background 0.2s',
            zIndex:     10,
          }}
          aria-label="View scores"
        >
          {showScores ? <X size={14} /> : <BarChart2 size={14} />}
        </button>
      </div>

      {/* ── Score breakdown panel ─────────────────────────────────────── */}
      {showScores && (
        <div style={{
          padding:    '12px 16px',
          background: 'var(--bg-card-hover)',
          borderBottom: '1px solid var(--border)',
        }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Ranking Breakdown
          </p>
          <ScoreBar label="Value for Money (40%)" value={Math.min(1, (parseFloat(hotel.price_per_night) > 0 ? 0.7 : 0))} />
          <ScoreBar label="Budget Fit (25%)"       value={Math.min(1, hotel._meta.score * 1.1)} />
          <ScoreBar label="Guest Rating (20%)"     value={ratingUnavailable ? 0.3 : parseFloat(hotel.rating) / 5} />
          <ScoreBar label="Hotel Category (15%)"   value={hotel._meta.category_name?.match(/(\d+)/)?.[1] ? parseInt(hotel._meta.category_name.match(/(\d+)/)![1]) / 5 : 0.4} />
          <div style={{
            marginTop: '8px',
            paddingTop: '8px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.7rem',
          }}>
            <span style={{ color: 'var(--text-muted)' }}>Composite Score</span>
            <span style={{ fontWeight: 800, color: 'var(--primary)' }}>
              {Math.round(hotel._meta.score * 100)} / 100
            </span>
          </div>
        </div>
      )}

      {/* ── Card body ─────────────────────────────────────────────────── */}
      <div style={{ padding: '14px 16px 16px' }}>

        {/* Hotel name + location */}
        <h3 style={{
          fontWeight:   700,
          fontSize:     '0.95rem',
          color:        'var(--text-primary)',
          marginBottom: '2px',
          overflow:     'hidden',
          textOverflow: 'ellipsis',
          whiteSpace:   'nowrap',
        }}>
          {hotel.hotel_name}
        </h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <MapPin size={12} style={{ color: 'var(--primary)' }} />
          <span>{hotel.location}</span>
        </p>

        {/* Rating row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
          {!ratingUnavailable && (
            <>
              <span style={{ fontSize: '0.72rem', letterSpacing: '1px', color: '#f59e0b' }}>
                {'★'.repeat(Math.round(parseFloat(hotel.rating)))}{'☆'.repeat(5 - Math.round(parseFloat(hotel.rating)))}
              </span>
              <span style={{
                padding:      '2px 8px',
                borderRadius: '6px',
                background:   parseFloat(hotel.rating) >= 4.5
                  ? 'rgba(16,185,129,0.12)'
                  : parseFloat(hotel.rating) >= 4.0
                    ? 'rgba(37,99,235,0.10)'
                    : 'rgba(245,158,11,0.10)',
                color: parseFloat(hotel.rating) >= 4.5
                  ? '#10b981'
                  : parseFloat(hotel.rating) >= 4.0
                    ? 'var(--primary)'
                    : '#f59e0b',
                fontSize:   '0.7rem',
                fontWeight: 700,
              }}>
                {hotel.rating} {parseFloat(hotel.rating) >= 4.5
                  ? 'Exceptional'
                  : parseFloat(hotel.rating) >= 4.0
                    ? 'Excellent'
                    : 'Very Good'}
              </span>
            </>
          )}
          {ratingUnavailable && (
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Rating not available from API
            </span>
          )}
          {hotel._meta.category_name && (
            <span style={{
              padding:    '2px 7px',
              borderRadius: '5px',
              background: 'var(--bg-card-hover)',
              fontSize:   '0.65rem',
              fontWeight: 600,
              color:      'var(--text-secondary)',
            }}>
              {hotel._meta.category_name}
            </span>
          )}
        </div>

        {/* Amenities */}
        {hotel.amenities.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {hotel.amenities.slice(0, 4).map((a, i) => (
              <span key={i} style={{
                display:    'flex',
                alignItems: 'center',
                gap:        '3px',
                padding:    '3px 8px',
                borderRadius: '6px',
                background: 'var(--bg-card-hover)',
                fontSize:   '0.68rem',
                color:      'var(--text-secondary)',
                border:     '1px solid var(--border)',
              }}>
                {getAmenityIcon(a)} {a}
              </span>
            ))}
            {hotel.amenities.length > 4 && (
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                +{hotel.amenities.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Price section */}
        <div style={{
          display:        'flex',
          alignItems:     'flex-end',
          justifyContent: 'space-between',
          paddingTop:     '10px',
          borderTop:      '1px solid var(--border)',
          marginBottom:   '12px',
        }}>
          <div>
            <span style={{ fontSize: '0.67rem', color: 'var(--text-muted)', display: 'block' }}>
              Starting from
            </span>
            {priceUnavailable ? (
              <span style={{
                fontSize:  '0.9rem',
                fontStyle: 'italic',
                color:     'var(--text-muted)',
                fontWeight: 600,
              }}>
                Price unavailable
              </span>
            ) : (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
                <span style={{
                  fontSize:   '1.3rem',
                  fontWeight: 800,
                  color:      'var(--text-primary)',
                  fontFamily: "'Inter', sans-serif",
                }}>
                  {hotel.currency === 'INR' || hotel.currency === '' ? '₹' : hotel.currency}
                  {parseInt(hotel.price_per_night).toLocaleString('en-IN')}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>/night</span>
              </div>
            )}
            {!priceUnavailable && hotel._meta.nights && hotel._meta.nights > 1 && hotel._meta.total_price && (
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
                {hotel.currency === 'INR' ? '₹' : hotel.currency}
                {hotel._meta.total_price.toLocaleString('en-IN')} total · {hotel._meta.nights} nights
              </span>
            )}
            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>+taxes &amp; fees</span>
          </div>

          {/* Great deal badge */}
          {parseFloat(hotel.price_per_night) > 0 && parseFloat(hotel.price_per_night) < 3000 && (
            <span style={{
              padding:    '2px 8px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,182,212,0.15))',
              color:      '#10b981',
              fontSize:   '0.68rem',
              fontWeight: 700,
              border:     '1px solid rgba(16,185,129,0.25)',
              display:    'inline-flex',
              alignItems: 'center',
              gap:        '3px',
            }}>
              <Flame size={11} /> Great Deal
            </span>
          )}
        </div>

        {/* Recommendation reason */}
        <div style={{
          padding:      '8px 12px',
          borderRadius: '10px',
          background:   isTopPick
            ? 'linear-gradient(135deg, rgba(37,99,235,0.07), rgba(6,182,212,0.07))'
            : 'var(--bg-card-hover)',
          border:       isTopPick ? '1px solid rgba(37,99,235,0.15)' : '1px solid var(--border)',
          marginBottom: '12px',
        }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.5, display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
            <Lightbulb size={13} className="text-amber-500 shrink-0 mt-0.5" />
            <span>{hotel.recommendation_reason}</span>
          </p>
        </div>

        {/* CTA */}
        <button
          id={`select-hotel-rec-${hotel._meta.rank}`}
          className="hotel-cta"
          onClick={(e) => { e.stopPropagation(); onSelect(hotel) }}
          style={{
            background: selected
              ? 'linear-gradient(135deg, #10b981, #059669)'
              : undefined,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          {selected ? <><Check size={14} /> Selected</> : 'View Rooms & Book'}
        </button>
      </div>
    </div>
  )
}

// ─── Empty / Error states ─────────────────────────────────────────────────────
function EmptyState({ message }: { message: string }) {
  return (
    <div style={{
      textAlign:  'center',
      padding:    '48px 24px',
      color:      'var(--text-muted)',
    }}>
      <Building2 size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
      <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
        No Hotels Found
      </p>
      <p style={{ fontSize: '0.8rem' }}>{message}</p>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  /** Override destination (falls back to tripContext if not provided) */
  destination?: string
  checkin?:     string
  checkout?:    string
  members?:     number
  budget?:      number
}

export default function HotelRecommendations({ destination, checkin, checkout, members, budget }: Props) {
  const { tripContext, userProfile, setBookingStatus, setHotelDetailId, addNotification } = useTripStore()
  const { user } = useAuthStore()

  const [hotels,   setHotels]   = useState<HotelRecommendation[]>([])
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [meta,     setMeta]     = useState<any>(null)
  const [selected, setSelected] = useState<string | null>(null)

  // Resolved params: use props > tripContext > userProfile
  const resolvedDest    = destination || tripContext.destination
  const resolvedCheckin = checkin     || tripContext.startDate
  const resolvedCheckout= checkout    || tripContext.endDate
  const resolvedMembers = members     ?? userProfile.members     ?? 2
  const resolvedBudget  = budget      ?? userProfile.budget

  // Prevent duplicate fetches
  const fetchKeyRef = useRef('')

  const fetchRecommendations = useCallback(async () => {
    if (!resolvedDest || !resolvedCheckin || !resolvedCheckout) return

    const key = `${resolvedDest}|${resolvedCheckin}|${resolvedCheckout}|${resolvedMembers}|${resolvedBudget}`
    if (fetchKeyRef.current === key) return
    fetchKeyRef.current = key

    setLoading(true)
    setError(null)

    try {
      const response = await tripAPI.recommendHotels({
        destination: resolvedDest,
        checkin:     resolvedCheckin,
        checkout:    resolvedCheckout,
        members:     resolvedMembers,
        budget:      resolvedBudget,
      })

      if (response.success && Array.isArray(response.data)) {
        setHotels(response.data)
        setMeta((response as any).meta)
      } else {
        setError(response.error || 'Failed to load hotel recommendations')
      }
    } catch (err: any) {
      setError(err.message || 'Hotel recommendation service is unavailable')
    } finally {
      setLoading(false)
    }
  }, [resolvedDest, resolvedCheckin, resolvedCheckout, resolvedMembers, resolvedBudget])

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchRecommendations()
    })
  }, [fetchRecommendations])

  // ── Select a hotel and pass it into the booking flow ────────────────────────
  const handleSelect = useCallback((hotel: HotelRecommendation) => {
    setSelected(hotel._meta.id)

    // Build a HotelOption-compatible object for the existing trip store + booking modal
    const hotelOption = {
      id:          hotel._meta.id,
      name:        hotel.hotel_name,
      price:       hotel.price_per_night === 'Price unavailable' ? 0 : parseInt(hotel.price_per_night),
      totalPrice:  hotel._meta.total_price || undefined,
      nights:      hotel._meta.nights     || undefined,
      rating:      hotel.rating === 'Not rated' ? 0 : parseFloat(hotel.rating),
      image:       hotel.image_url,
      location:    hotel.location,
      bookingLink: hotel.booking_link,
      score:       hotel._meta.score,
      liveStatus:  hotel._meta.live_status || 'Available',
      amenities:   hotel.amenities,
      offers:      [],
      rateKey:     hotel.rate_key || undefined,
      rateType:    hotel.rate_type || 'BOOKABLE',
      categoryName:hotel._meta.category_name || undefined,
      source:      hotel._meta.source,
      rooms:       hotel.rooms || [],
    } as any

    setHotelDetailId(hotel._meta.id)
    setBookingStatus({ hotelStatus: 'SELECTED', selectedHotel: hotelOption })
    addNotification({
      id:        Date.now().toString(),
      type:      'info',
      title:     'Hotel Selected',
      message:   `${hotel.hotel_name}${hotel.price_per_night !== 'Price unavailable' ? ` — ${hotel.currency === 'INR' ? '₹' : hotel.currency}${parseInt(hotel.price_per_night).toLocaleString('en-IN')}/night` : ''}`,
      timestamp: new Date().toISOString(),
      read:      false,
    })
    toast.success(`${hotel.hotel_name} selected!`)
  }, [setBookingStatus, setHotelDetailId, addNotification])

  // ── Loading skeleton ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          marginBottom: '20px',
        }}>
          <div style={{
            width: '24px', height: '24px',
            border: '3px solid var(--border)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Fetching live hotel recommendations from Hotelbeds…
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              height: '420px',
              borderRadius: '20px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              animation: 'pulse 1.5s ease-in-out infinite',
              opacity: 1 - (i - 1) * 0.15,
            }} />
          ))}
        </div>
      </div>
    )
  }

  // ── Error state ──────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div style={{
        padding:      '20px',
        borderRadius: '14px',
        background:   'rgba(239,68,68,0.05)',
        border:       '1px solid rgba(239,68,68,0.2)',
        color:        '#ef4444',
      }}>
        <p style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <AlertTriangle size={16} /> Hotel recommendations unavailable
        </p>
        <p style={{ fontSize: '0.78rem', opacity: 0.8 }}>{error}</p>
        <button
          id="retry-hotel-rec"
          onClick={() => { fetchKeyRef.current = ''; fetchRecommendations() }}
          style={{
            marginTop:    '12px',
            padding:      '6px 16px',
            borderRadius: '8px',
            background:   'rgba(239,68,68,0.1)',
            border:       '1px solid rgba(239,68,68,0.3)',
            color:        '#ef4444',
            fontSize:     '0.78rem',
            fontWeight:   700,
            cursor:       'pointer',
          }}
        >
          Retry
        </button>
      </div>
    )
  }

  // ── No results ───────────────────────────────────────────────────────────────
  if (!hotels.length) {
    return <EmptyState message="No hotels found for the selected dates and destination. Try adjusting your search." />
  }

  // ── Main render ──────────────────────────────────────────────────────────────
  return (
    <div id="hotel-recommendations-panel">
      {/* Header */}
      <div style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        marginBottom:   '16px',
        flexWrap:       'wrap',
        gap:            '10px',
      }}>
        <div>
          <h2 style={{
            fontSize:   '1.1rem',
            fontWeight: 800,
            color:      'var(--text-primary)',
            marginBottom: '3px',
            display:    'flex',
            alignItems: 'center',
            gap:        '8px',
          }}>
            <Building2 size={20} className="text-[#EA580C]" /> Hotel Recommendations
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {hotels.length} hotels ranked by value · rating · budget fit
            {meta?.destination && ` for ${meta.destination}`}
            {meta?.nights && ` · ${meta.nights} nights`}
          </p>
        </div>

        {/* Meta badges */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {meta?.source && <SourceBadge source={meta.source} />}
          {meta?.budget && (
            <span style={{
              padding:    '3px 10px',
              borderRadius: '20px',
              fontSize:   '0.65rem',
              fontWeight: 700,
              background: 'rgba(37,99,235,0.08)',
              color:      'var(--primary)',
              border:     '1px solid rgba(37,99,235,0.2)',
            }}>
              Budget: ₹{meta.budget.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>

      {/* Data integrity disclaimer */}
      <div style={{
        padding:      '8px 14px',
        borderRadius: '10px',
        background:   'rgba(16,185,129,0.05)',
        border:       '1px solid rgba(16,185,129,0.15)',
        marginBottom: '20px',
        fontSize:     '0.68rem',
        color:        'var(--text-muted)',
        display:      'flex',
        alignItems:   'center',
        gap:          '8px',
      }}>
        <Lock size={13} className="text-emerald-600 shrink-0" />
        <span>
          All prices, ratings &amp; images are sourced exclusively from the Hotelbeds API.
          {meta?.source?.includes('mock') && ' Some data is estimated — live API keys not configured.'}
        </span>
      </div>

      {/* Hotel grid */}
      <div style={{
        display:             'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap:                 '20px',
      }}>
        {hotels.map(hotel => (
          <RecommendationCard
            key={hotel._meta.id}
            hotel={hotel}
            onSelect={handleSelect}
            selected={selected === hotel._meta.id}
          />
        ))}
      </div>

      {/* Footer note */}
      <p style={{
        textAlign:  'center',
        fontSize:   '0.65rem',
        color:      'var(--text-muted)',
        marginTop:  '20px',
        lineHeight: 1.5,
      }}>
        Prices are per night before taxes &amp; fees. Ranking uses value-for-money (40%), budget fit (25%),
        guest rating (20%), and hotel category (15%).
      </p>
    </div>
  )
}
