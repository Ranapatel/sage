import React, { useState, useCallback, useEffect } from 'react'
import { useTripStore, HotelOption } from '@/store/tripStore'
import { useAuthStore } from '@/store/authStore'
import { formatPrice } from '@/lib/currency'
import { tripAPI, HotelContent } from '@/lib/api'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import HotelImage from './HotelImage'
import toast from 'react-hot-toast'
import { getOptimizedImageUrl } from '@/lib/imageUtils'
import { Wifi, Coffee, Waves, Car, Sparkles, Dumbbell, Utensils, Wind, Calendar, Check, X, Building2, MapPin, Ticket, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'

// ── Amenity grid icons ───────────────────────────────────────────────────────
const AMENITY_GRID = [
  { key: 'wifi', icon: Wifi, label: 'Free WiFi' },
  { key: 'breakfast', icon: Coffee, label: 'Breakfast Included' },
  { key: 'pool', icon: Waves, label: 'Swimming Pool' },
  { key: 'parking', icon: Car, label: 'Free Parking' },
  { key: 'spa', icon: Sparkles, label: 'Spa & Wellness' },
  { key: 'gym', icon: Dumbbell, label: 'Fitness Center' },
  { key: 'restaurant', icon: Utensils, label: 'Restaurant' },
  { key: 'ac', icon: Wind, label: 'Air Conditioning' },
]

// ── Clean room name ──────────────────────────────────────────────────────────
function cleanRoomName(raw: string): string {
  return raw
    .replace(/DOUBLE|TWIN|TRIPLE|QUADRUPLE/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
    .replace(/^\s*$/, 'Standard Room')
}

// ── Board type display ───────────────────────────────────────────────────────
function formatBoardName(board?: string): string {
  if (!board) return 'Room Only'
  const b = board.toUpperCase()
  if (b.includes('ALL INCLUSIVE')) return 'All Inclusive'
  if (b.includes('FULL BOARD')) return 'Full Board'
  if (b.includes('HALF BOARD')) return 'Half Board'
  if (b.includes('BED AND BREAKFAST') || b.includes('B&B')) return 'Breakfast Included'
  if (b.includes('ROOM ONLY') || b === 'RO') return 'Room Only'
  return board.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
}

export default function HotelDetailModal() {
  const { hotelDetailId, setHotelDetailId, hotels, openBookingFlow } = useTripStore()
  const { user } = useAuthStore()
  const currency = user?.currency ?? 'INR'
  const { requireAuth } = useRequireAuth()

  const [galleryIdx, setGalleryIdx] = useState(0)
  
  // live content state
  const [content, setContent] = useState<HotelContent | null>(null)
  const [loadingContent, setLoadingContent] = useState(false)

  const hotel = hotels.find((h: HotelOption) => h.id === hotelDetailId)

  // Fetch live Content API data on modal open
  useEffect(() => {
    if (!hotelDetailId || !hotel) {
      Promise.resolve().then(() => setContent(null))
      return
    }

    // Skip for mock codes
    if (hotelDetailId.startsWith('hbd_mock_rk') || String(hotel.id).startsWith('hbd_10')) {
      return
    }

    let isMounted = true
    const fetchContent = async () => {
      setLoadingContent(true)
      try {
        const code = hotel.id.replace('hbd_', '')
        const response = await tripAPI.getHotelContent(code)
        if (isMounted && response.success && response.data) {
          setContent(response.data)
        }
      } catch (err) {
        console.warn('[HotelDetailModal] Content fetch failed:', err)
      } finally {
        if (isMounted) setLoadingContent(false)
      }
    }

    Promise.resolve().then(() => {
      fetchContent()
    })
    return () => { isMounted = false }
  }, [hotelDetailId, hotel])

  // Close on escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setHotelDetailId(null) }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [setHotelDetailId])

  // Lock body scroll
  useEffect(() => {
    if (hotelDetailId) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [hotelDetailId])

  const rooms = React.useMemo(() => hotel?.rooms || [], [hotel?.rooms])
  const nights = hotel?.nights || 1

  // Group rooms by room code / name
  const groupedRooms = React.useMemo(() => {
    const groups: Record<string, any[]> = {}
    rooms.forEach((room: any) => {
      const key = room.roomCode || room.roomName || 'STANDARD ROOM'
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(room)
    })
    // Sort each group's rates by price ascending
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => a.price - b.price)
    })
    return Object.values(groups)
  }, [rooms])

  if (!hotelDetailId || !hotel) return null

  // Gather image paths
  const contentPaths = content?.images?.map(img => img.path).filter(Boolean) || []
  const images = contentPaths.length > 0 
    ? contentPaths 
    : (hotel.gallery_paths?.length 
        ? hotel.gallery_paths 
        : (hotel.image_path 
            ? [hotel.image_path] 
            : (hotel.image ? [hotel.image] : [])))

  // ── Rating ─────────────────────────────────────────────────────────────────
  const starCount = Math.min(5, Math.max(1, Math.round(hotel.rating || 3)))
  const ratingLabel = hotel.rating >= 4.5 ? 'Exceptional' : hotel.rating >= 4 ? 'Excellent' : hotel.rating >= 3 ? 'Very Good' : 'Good'

  // ── Amenity detection / override ──────────────────────────────────────────
  const allText = [...(hotel.amenities || []), ...(hotel.offers || [])].join(' ').toLowerCase()
  const detectedAmenities = AMENITY_GRID.filter(a => {
    if (a.key === 'wifi') return true
    if (a.key === 'ac') return true
    if (a.key === 'breakfast') return allText.includes('breakfast') || allText.includes('bed and breakfast')
    if (a.key === 'pool') return allText.includes('pool') || allText.includes('swim')
    if (a.key === 'parking') return allText.includes('parking')
    if (a.key === 'spa') return allText.includes('spa')
    if (a.key === 'gym') return allText.includes('gym') || allText.includes('fitness')
    if (a.key === 'restaurant') return allText.includes('restaurant') || allText.includes('dining')
    return false
  })

  const facilitiesToDisplay = content?.facilities?.length
    ? content.facilities.map((f, idx) => ({ icon: Check, label: f.name }))
    : detectedAmenities.map(a => ({ icon: a.icon, label: a.label }))



  return (
    <div className="hotel-modal-overlay" onClick={() => setHotelDetailId(null)}>
      <div className="hotel-modal" onClick={e => e.stopPropagation()}>

        {/* ── Sticky Header ────────────────────────────────────────────── */}
        <div className="hotel-modal-close">
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
            Hotel Details
          </span>
          <button onClick={() => setHotelDetailId(null)} aria-label="Close"><X size={18} /></button>
        </div>

        {/* ── Image Gallery ────────────────────────────────────────────── */}
        <div style={{ position: 'relative', aspectRatio: '16/10', overflow: 'hidden' }}>
          {images.length > 0 ? (
            <HotelImage
              path={images[galleryIdx % images.length]}
              alt={`${hotel.name} gallery`}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              preferredSize="bigger"
            />
          ) : (
            <HotelImage
              path={null}
              alt={hotel.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              preferredSize="bigger"
            />
          )}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)',
            pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute', bottom: '16px', left: '20px', color: '#fff', zIndex: 5
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '4px' }}>
              {hotel.name}
            </h2>
            <p style={{ fontSize: '0.85rem', opacity: 0.9 }}>{content?.address || hotel.location}</p>
          </div>

          {/* Gallery nav */}
          {images.length > 1 && (
            <div style={{
              position: 'absolute', bottom: '16px', right: '20px',
              display: 'flex', gap: '6px', zIndex: 5
            }}>
              {images.slice(0, 5).map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setGalleryIdx(i)}
                  style={{
                    width: '44px', height: '30px', borderRadius: '6px',
                    overflow: 'hidden', border: i === galleryIdx ? '2px solid #fff' : '2px solid transparent',
                    cursor: 'pointer', opacity: i === galleryIdx ? 1 : 0.7,
                    transition: 'all 0.2s ease', padding: 0
                  }}
                >
                  <HotelImage path={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} preferredSize="thumbnail" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Content ──────────────────────────────────────────────────── */}
        <div style={{ padding: '20px' }}>

          {/* Overview */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            marginBottom: '20px', flexWrap: 'wrap'
          }}>
            <span style={{ fontSize: '0.85rem', letterSpacing: '1px' }}>
              {'★'.repeat(starCount)}{'☆'.repeat(5 - starCount)}
            </span>
            <span className={`hotel-rating-pill ${hotel.rating >= 4.5 ? 'excellent' : hotel.rating >= 4 ? 'very-good' : hotel.rating >= 3 ? 'good' : 'fair'}`}>
              {(hotel.rating || 0).toFixed(1)} {ratingLabel}
            </span>
            <span style={{
              padding: '3px 10px', borderRadius: '6px',
              background: 'var(--bg-card-hover)', fontSize: '0.72rem',
              fontWeight: 600, color: 'var(--text-secondary)'
            }}>
              {content?.categoryName || hotel.categoryName || 'Hotel'}
            </span>
            
            {content && (
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                ⏰ Check-in: {content.checkInTime} · Check-out: {content.checkOutTime}
                {content.latitude && content.longitude && (
                  <span className="inline-flex items-center gap-0.5 ml-1">
                    <MapPin size={11} className="text-slate-400" />
                    <span>Coords: {content.latitude.toFixed(4)}, {content.longitude.toFixed(4)}</span>
                  </span>
                )}
              </span>
            )}
          </div>

          {/* Hotel Description (Content API) */}
          {content?.description && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '8px', color: 'var(--text-primary)' }}>
                About the Accommodation
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {content.description}
              </p>
            </div>
          )}

          {/* Divider */}
          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0 0 20px' }} />

          {/* Amenities Grid */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '12px', color: 'var(--text-primary)' }}>
              What this place offers
            </h3>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '10px'
            }}>
              {facilitiesToDisplay.slice(0, 16).map((a: any, idx: number) => {
                const IconComp = typeof a.icon === 'function' ? a.icon : Check
                return (
                  <div key={idx} style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 12px', borderRadius: '10px',
                    border: '1px solid var(--border)', fontSize: '0.8rem',
                    color: 'var(--text-secondary)'
                  }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--primary)' }}>
                      <IconComp size={16} />
                    </span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {a.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Divider */}
          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0 0 20px' }} />

          {/* Room Options */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '12px', color: 'var(--text-primary)' }}>
              Available Rooms
            </h3>
            
            {/* Empty States */}
            {(!rooms || rooms.length === 0) ? (
              <div style={{
                padding: '30px 20px',
                textAlign: 'center',
                background: 'rgba(239, 68, 68, 0.04)',
                border: '1px dashed rgba(239, 68, 68, 0.2)',
                borderRadius: '16px',
                margin: '10px 0 20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                  <Building2 size={40} className="text-slate-400" />
                </div>
                <h4 style={{ fontWeight: 700, fontSize: '1rem', color: '#ef4444', marginBottom: '6px' }}>
                  No rooms available for selected dates
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Please try adjusting your search dates or guest counts to check other options.
                </p>
              </div>
            ) : !rooms.some((r: any) => r.rateKey) ? (
              <div style={{
                padding: '30px 20px',
                textAlign: 'center',
                background: 'rgba(245, 158, 11, 0.04)',
                border: '1px dashed rgba(245, 158, 11, 0.2)',
                borderRadius: '16px',
                margin: '10px 0 20px'
              }}>
                <Ticket size={40} style={{ color: '#d97706', margin: '0 auto 12px' }} />
                <h4 style={{ fontWeight: 700, fontSize: '1rem', color: '#d97706', marginBottom: '6px' }}>
                  No bookable rates available
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  All rooms for this property are currently sold out or do not have bookable rates.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {groupedRooms.map((group: any[], i: number) => {
                  const roomName = group[0].roomName || 'STANDARD ROOM'
                  
                  return (
                    <div
                      key={i}
                      style={{
                        border: '1px solid var(--border)',
                        borderRadius: '16px',
                        background: 'var(--bg-card)',
                        boxShadow: 'var(--shadow-card)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                      }}
                      className="room-group-card"
                    >
                      {/* Room Header */}
                      <div style={{
                        padding: '16px 20px',
                        background: 'var(--bg-card-hover)',
                        borderBottom: '1px solid var(--border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '10px'
                      }}>
                        <h4 style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', margin: 0, letterSpacing: '0.3px' }}>
                          {roomName.toUpperCase()}
                        </h4>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '8px',
                          background: 'rgba(37, 99, 235, 0.1)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: 'var(--primary)'
                        }}>
                          {group.length} {group.length === 1 ? 'Rate Option' : 'Rate Options'}
                        </span>
                      </div>

                      {/* Rates List */}
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {group.map((roomRate: any, idx: number) => {
                          const isSoldOut = roomRate.allotment === 0
                          const isRecheck = roomRate.rateType === 'RECHECK'
                          const displayInrPrice = formatPrice(roomRate.price, currency)
                          const displayTotalInr = formatPrice(roomRate.price * nights, currency)

                          return (
                            <div
                              key={idx}
                              style={{
                                padding: '20px',
                                borderTop: idx > 0 ? '1px solid var(--border)' : 'none',
                                background: isSoldOut ? 'var(--bg-dark)' : 'var(--bg-card)',
                                opacity: isSoldOut ? 0.75 : 1,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: '20px',
                                flexWrap: 'wrap'
                              }}
                              className="room-rate-option-row"
                            >
                              {/* Rate Details (left side) */}
                              <div style={{ flex: '1 1 250px' }}>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                                  {/* Board Type Badge */}
                                  <span style={{
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    background: 'var(--bg-card-hover)',
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                    color: 'var(--text-secondary)'
                                  }}>
                                    🍳 Board: {formatBoardName(roomRate.boardName).toUpperCase()}
                                  </span>
                                  
                                  {/* Occupancy Badge */}
                                  <span style={{
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    background: 'var(--bg-card-hover)',
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                    color: 'var(--text-secondary)'
                                  }}>
                                    👤 {roomRate.adults} {roomRate.adults === 1 ? 'Adult' : 'Adults'}
                                    {roomRate.children > 0 && ` · 👶 ${roomRate.children}`}
                                  </span>

                                  {/* Allotment Badge */}
                                  {isSoldOut ? (
                                    <span style={{
                                      padding: '3px 8px',
                                      borderRadius: '6px',
                                      background: 'rgba(239, 68, 68, 0.1)',
                                      fontSize: '0.72rem',
                                      fontWeight: 700,
                                      color: '#ef4444',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}>
                                      <XCircle size={12} />
                                      <span>Sold Out</span>
                                    </span>
                                  ) : (
                                    <span style={{
                                      padding: '3px 8px',
                                      borderRadius: '6px',
                                      background: 'rgba(16, 185, 129, 0.1)',
                                      fontSize: '0.72rem',
                                      fontWeight: 700,
                                      color: '#10b981',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}>
                                      <CheckCircle2 size={12} />
                                      <span>Available ({roomRate.allotment} left)</span>
                                    </span>
                                  )}
                                </div>

                                {/* Cancellation Policy */}
                                <p style={{
                                  fontSize: '0.75rem',
                                  color: roomRate.cancellationPolicy?.toLowerCase().includes('non-refundable') ? '#ef4444' : '#10b981',
                                  fontWeight: 600,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  margin: 0
                                }}>
                                  📅 {roomRate.cancellationPolicy}
                                </p>
                              </div>

                              {/* Price + CTA Button (right side) */}
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '20px',
                                flexWrap: 'wrap',
                                textAlign: 'right',
                                justifyContent: 'flex-end',
                                flex: '0 1 auto',
                                minWidth: '280px'
                              }}>
                                <div>
                                  {roomRate.netPrice && (
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '2px' }}>
                                      Original Net: {roomRate.netPrice} {roomRate.currency}
                                    </div>
                                  )}
                                  <div style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--text-primary)', lineHeight: 1.1 }}>
                                    {displayInrPrice}
                                  </div>
                                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
                                    per night
                                  </div>
                                  {nights > 1 && (
                                    <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                      Total: {displayTotalInr} ({nights} nights)
                                    </div>
                                  )}
                                </div>

                                <div>
                                  {isSoldOut ? (
                                    <button
                                      disabled
                                      style={{
                                        padding: '10px 18px',
                                        borderRadius: '10px',
                                        background: '#e2e8f0',
                                        color: '#94a3b8',
                                        fontSize: '0.82rem',
                                        fontWeight: 700,
                                        border: 'none',
                                        cursor: 'not-allowed',
                                        width: '130px'
                                      }}
                                    >
                                      Sold Out
                                    </button>
                                  ) : isRecheck ? (
                                    <button
                                      onClick={requireAuth(() => {
                                        openBookingFlow(hotel, {
                                          name: roomRate.roomName,
                                          boardName: roomRate.boardName,
                                          rateKey: roomRate.rateKey,
                                          price: roomRate.price,
                                          rateType: 'RECHECK'
                                        })
                                        setHotelDetailId(null)
                                      })}
                                      style={{
                                        padding: '10px 18px',
                                        borderRadius: '10px',
                                        background: 'rgba(37, 99, 235, 0.08)',
                                        color: 'var(--primary)',
                                        fontSize: '0.82rem',
                                        fontWeight: 700,
                                        border: '1.5px solid var(--primary)',
                                        cursor: 'pointer',
                                        width: '130px',
                                        transition: 'all 0.2s ease',
                                      }}
                                    >
                                      Check Rate
                                    </button>
                                  ) : (
                                    <button
                                      onClick={requireAuth(() => {
                                        openBookingFlow(hotel, {
                                          name: roomRate.roomName,
                                          boardName: roomRate.boardName,
                                          rateKey: roomRate.rateKey,
                                          price: roomRate.price,
                                          rateType: 'BOOKABLE'
                                        })
                                        setHotelDetailId(null)
                                      })}
                                      style={{
                                        padding: '10px 18px',
                                        borderRadius: '10px',
                                        background: 'var(--primary)',
                                        color: '#fff',
                                        fontSize: '0.82rem',
                                        fontWeight: 700,
                                        border: 'none',
                                        cursor: 'pointer',
                                        width: '130px',
                                        transition: 'all 0.2s ease'
                                      }}
                                    >
                                      Book Now
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Issues and Alerts */}
          {content?.issues && content.issues.length > 0 && (
            <div style={{
              padding: '12px 14px', borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.15)',
              marginBottom: '16px', fontSize: '0.75rem'
            }}>
              <p style={{ fontWeight: 700, color: '#ef4444', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertTriangle size={14} />
                <span>Special Alerts / Issues</span>
              </p>
              <ul style={{ paddingLeft: '14px', margin: 0, color: 'var(--text-secondary)' }}>
                {content.issues.map((iss: any, idx: number) => (
                  <li key={idx}>Alert: Code {iss.code} (Active: {new Date(iss.dateFrom).toLocaleDateString()} to {new Date(iss.dateTo).toLocaleDateString()})</li>
                ))}
              </ul>
            </div>
          )}

          {/* Mandatory Services Alerts */}
          {content?.facilities && content.facilities.some(f => f.hotelMandatory || f.voucher) && (
            <div style={{
              padding: '12px 14px', borderRadius: '10px',
              background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.15)',
              marginBottom: '16px', fontSize: '0.75rem'
            }}>
              <p style={{ fontWeight: 700, color: '#d97706', marginBottom: '4px' }}>
                📢 Mandatory Services & Fees
              </p>
              <ul style={{ paddingLeft: '14px', margin: 0, color: 'var(--text-secondary)' }}>
                {content.facilities
                  .filter(f => f.hotelMandatory || f.voucher)
                  .map((f, idx) => (
                    <li key={idx}>{f.name} (Mandatory Property policy)</li>
                  ))
                }
              </ul>
            </div>
          )}

          {/* Cancellation Policy */}
          <div style={{
            padding: '14px 16px', borderRadius: '12px',
            background: 'var(--bg-card-hover)', marginBottom: '20px'
          }}>
            <p style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)', marginBottom: '6px' }}>
              Cancellation Policy
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Free cancellation up to 48 hours before check-in. Detailed rate-specific policies will be fetched and displayed for verification during the booking confirmation process.
            </p>
          </div>



        </div>
      </div>
    </div>
  )
}
