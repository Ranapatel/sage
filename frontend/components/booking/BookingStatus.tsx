'use client'

import { useTripStore } from '@/store/tripStore'
import { tripAPI } from '@/lib/api'
import { formatPrice } from '@/lib/currency'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import { useState } from 'react'
import { trackEvent } from '@/lib/analytics'
import { Plane, Building2, PlaneTakeoff, PlaneLanding, Clock, Info, FileText, XCircle, CheckCircle2 } from 'lucide-react'

const STATUS_STEPS = ['INIT', 'SELECTED', 'PENDING', 'CONFIRMED']

const ProgressBar = ({ step }: { step: number }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px' }}>
    {STATUS_STEPS.map((s, i) => (
      <div key={s} style={{ display: 'flex', alignItems: 'center', flex: 1, gap: '6px' }}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center'
        }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.72rem', fontWeight: 700,
            background: i <= step ? 'var(--primary)' : 'var(--bg-card-hover)',
            color: i <= step ? '#fff' : 'var(--text-muted)',
            transition: 'all 0.3s ease'
          }}>
            {i < step ? '✓' : i + 1}
          </div>
          <span style={{
            fontSize: '0.58rem', color: 'var(--text-muted)',
            marginTop: '4px', textAlign: 'center'
          }}>
            {s}
          </span>
        </div>
        {i < STATUS_STEPS.length - 1 && (
          <div style={{
            height: '2px', flex: 1, marginTop: '-14px',
            background: i < step ? 'var(--primary)' : 'var(--border)',
            transition: 'all 0.3s ease', borderRadius: '1px'
          }} />
        )}
      </div>
    ))}
  </div>
)

export default function BookingStatus() {
  const {
    bookingStatus,
    setBookingStatus,
    addNotification,
    tripContext,
    openBookingFlow,
    bookingFlow,
    cancelHotelBooking
  } = useTripStore()
  const { user } = useAuthStore()
  const currency = user?.currency ?? 'INR'
  const [confirming, setConfirming] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const flightStep = STATUS_STEPS.indexOf(bookingStatus.flightStatus)
  const hotelStep = STATUS_STEPS.indexOf(bookingStatus.hotelStatus)

  const handleConfirmFlight = async () => {
    if (!bookingStatus.selectedFlight) {
      toast.error('Select a flight first from the Transport tab')
      return
    }
    setConfirming(true)
    setBookingStatus({ flightStatus: 'PENDING' })
    try {
      await new Promise(r => setTimeout(r, 1500))
      setBookingStatus({ flightStatus: 'CONFIRMED' })
      addNotification({
        id: Date.now().toString(),
        type: 'info',
        title: 'Flight Confirmed',
        message: `${bookingStatus.selectedFlight?.name} booking confirmed!`,
        timestamp: new Date().toISOString(),
        read: false,
      })
      toast.success('Flight booking confirmed!')
    } catch {
      setBookingStatus({ flightStatus: 'SELECTED' })
      toast.error('Booking failed. Try again.')
    } finally {
      setConfirming(false)
    }
  }

  const handleCancelHotel = async () => {
    if (!window.confirm('Are you sure you want to cancel this hotel booking? This action cannot be undone.')) {
      return
    }
    setCancelling(true)
    try {
      const bookingId = bookingFlow.bookingRecord?.bookingId || bookingStatus.selectedHotel?.id
      if (!bookingId) {
        toast.error('Booking ID not found')
        return
      }
      await cancelHotelBooking(bookingId)
      toast.success('Hotel booking cancelled successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel hotel booking')
    } finally {
      setCancelling(false)
    }
  }

  const handleConfirmHotelClick = () => {
    const hotel = bookingStatus.selectedHotel
    const room = bookingStatus.selectedRoom
    if (!hotel) {
      toast.error('Select a hotel first from the Hotels tab')
      return
    }
    openBookingFlow(hotel, room ? {
      name: room.name,
      boardName: room.boardName,
      rateKey: room.rateKey,
      price: room.price
    } : null)
  }

  const handleViewVoucher = () => {
    if (bookingFlow.bookingRecord) {
      useTripStore.setState(s => ({
        bookingFlow: {
          ...s.bookingFlow,
          isOpen: true,
          step: 'voucher'
        }
      }))
    } else {
      const hotel = bookingStatus.selectedHotel
      const room = bookingStatus.selectedRoom
      if (!hotel) return
      
      const simulatedRecord = {
        bookingId: hotel.id,
        status: 'CONFIRMED' as const,
        bookingReference: hotel.bookingReference || 'N/A',
        clientReference: 'N/A',
        hotelName: hotel.name,
        hotelAddress: hotel.location,
        checkIn: tripContext.startDate,
        checkOut: tripContext.endDate,
        roomType: room?.name || 'Standard Room',
        boardType: room?.boardName || 'Room Only',
        totalPrice: hotel.price * (hotel.nights || 1),
        currency: hotel.currency || 'INR',
        guests: [{ name: user?.name || 'Guest Traveler', type: 'AD', role: 'Lead' }],
        cancellationPolicies: [],
        bookingDate: new Date().toISOString()
      }
      
      useTripStore.setState(s => ({
        bookingFlow: {
          isOpen: true,
          step: 'voucher',
          hotel,
          room: room ? { ...room, rateType: 'BOOKABLE' } : null,
          guestData: null,
          checkRateResult: null,
          bookingRecord: simulatedRecord,
          error: null
        }
      }))
    }
  }

  // ── Voucher download ─────────────────────────────────────────────────────
  const handleDownloadVoucher = () => {
    const hotel = bookingStatus.selectedHotel
    const room = bookingStatus.selectedRoom
    if (!hotel) return

    const voucher = [
      '═══════════════════════════════════════════',
      '           TripSage Booking Voucher        ',
      '═══════════════════════════════════════════',
      '',
      `Booking Reference: ${hotel.bookingReference || 'N/A'}`,
      `Hotel: ${hotel.name}`,
      `Location: ${hotel.location}`,
      room ? `Room: ${room.name}` : '',
      room ? `Board: ${room.boardName}` : '',
      `Check-in: ${tripContext.startDate || 'N/A'}`,
      `Check-out: ${tripContext.endDate || 'N/A'}`,
      `Guest: ${user?.name || 'Guest Traveler'}`,
      `Amount: ${formatPrice(hotel.price, currency)}/night`,
      '',
      '───────────────────────────────────────────',
      'This voucher must be presented at check-in.',
      'Free cancellation up to 24 hours before.',
      '═══════════════════════════════════════════',
    ].filter(Boolean).join('\n')

    const blob = new Blob([voucher], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `TripSage-Voucher-${hotel.bookingReference || 'booking'}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Voucher downloaded!')
  }



  return (
    <div className="space-y-6">
      <h2 style={{
        fontFamily: 'var(--font-display)', fontWeight: 700,
        fontSize: '1.5rem', color: 'var(--text-primary)'
      }}>
        Booking Management
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ── Flight Booking ──────────────────────────────────────────── */}
        <div style={{
          background: 'var(--bg-card)', borderRadius: '16px',
          border: '1px solid var(--border)', padding: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
              <Plane size={22} />
            </div>
            <div>
              <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>Flight</h3>
              <p style={{
                fontSize: '0.72rem', color: bookingStatus.flightStatus === 'CONFIRMED' ? '#16a34a' : 'var(--text-muted)',
                fontWeight: 600
              }}>
                {bookingStatus.flightStatus === 'CONFIRMED' ? '✓ Confirmed' : bookingStatus.flightStatus}
              </p>
            </div>
          </div>

          <ProgressBar step={flightStep} />

          {bookingStatus.selectedFlight ? (
            <div style={{
              padding: '14px 16px', borderRadius: '12px',
              background: 'var(--bg-card-hover)', marginBottom: '16px'
            }}>
              <p style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                {bookingStatus.selectedFlight.name}
              </p>
              <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>
                {formatPrice(bookingStatus.selectedFlight.price, currency)} per person
              </p>
              <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span className="inline-flex items-center gap-1.5"><PlaneTakeoff size={14} className="text-sky-500" /> {bookingStatus.selectedFlight.departure}</span>
                <span className="inline-flex items-center gap-1.5"><PlaneLanding size={14} className="text-sky-500" /> {bookingStatus.selectedFlight.arrival}</span>
                <span className="inline-flex items-center gap-1.5"><Clock size={14} className="text-slate-400" /> {bookingStatus.selectedFlight.duration}</span>
              </div>
            </div>
          ) : (
            <div style={{
              padding: '20px', borderRadius: '12px', background: 'var(--bg-card-hover)',
              marginBottom: '16px', textAlign: 'center'
            }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No flight selected</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '4px' }}>
                Go to Transport tab to select a flight
              </p>
            </div>
          )}

          {bookingStatus.flightStatus !== 'CONFIRMED' ? (
            <button
              onClick={handleConfirmFlight}
              disabled={!bookingStatus.selectedFlight || confirming}
              className="hotel-cta"
              style={{ opacity: !bookingStatus.selectedFlight || confirming ? 0.5 : 1 }}
            >
              {confirming ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span style={{
                    width: '14px', height: '14px', border: '2px solid #fff',
                    borderTopColor: 'transparent', borderRadius: '50%',
                    display: 'inline-block', animation: 'spin 1s linear infinite'
                  }} />
                  Processing...
                </span>
              ) : bookingStatus.flightStatus === 'SELECTED' ? 'Confirm Booking' : 'Select a Flight First'}
            </button>
          ) : (
            <div style={{
              background: 'rgba(22, 163, 74, 0.08)', border: '1px solid rgba(22, 163, 74, 0.2)',
              borderRadius: '12px', padding: '16px', textAlign: 'center'
            }}>
              <p style={{ color: '#16a34a', fontWeight: 700, fontSize: '0.9rem' }}>✓ Flight Confirmed</p>
              <a
                href={bookingStatus.selectedFlight?.bookingLink || '#'}
                target="_blank" rel="noopener noreferrer"
                onClick={() => trackEvent('booking_click', { type: 'flight', name: bookingStatus.selectedFlight?.name, price: bookingStatus.selectedFlight?.price })}
                style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '6px', display: 'block' }}
              >
                View booking details →
              </a>
            </div>
          )}
        </div>

        {/* ── Hotel Booking ───────────────────────────────────────────── */}
        <div style={{
          background: 'var(--bg-card)', borderRadius: '16px',
          border: '1px solid var(--border)', padding: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-100">
              <Building2 size={22} />
            </div>
            <div>
              <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>Hotel</h3>
              <p style={{
                fontSize: '0.72rem', color: bookingStatus.hotelStatus === 'CONFIRMED' ? '#16a34a' : 'var(--text-muted)',
                fontWeight: 600
              }}>
                {bookingStatus.hotelStatus === 'CONFIRMED' ? '✓ Confirmed' : bookingStatus.hotelStatus}
              </p>
            </div>
          </div>

          <ProgressBar step={hotelStep} />

          {bookingStatus.selectedHotel ? (
            <div style={{
              padding: '14px 16px', borderRadius: '12px',
              background: 'var(--bg-card-hover)', marginBottom: '16px'
            }}>
              <p style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                {bookingStatus.selectedHotel.name}
              </p>
              <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>
                {formatPrice(bookingStatus.selectedHotel.price, currency)}/night
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                <span style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
                  {'★'.repeat(Math.floor(bookingStatus.selectedHotel.rating))}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {bookingStatus.selectedHotel.location}
                </span>
              </div>
              {bookingStatus.selectedRoom && (
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                  Room: {bookingStatus.selectedRoom.name} · {bookingStatus.selectedRoom.boardName}
                </p>
              )}
            </div>
          ) : (
            <div style={{
              padding: '20px', borderRadius: '12px', background: 'var(--bg-card-hover)',
              marginBottom: '16px', textAlign: 'center'
            }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No hotel selected</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '4px' }}>
                Go to Hotels tab to browse and select
              </p>
            </div>
          )}

          {bookingStatus.hotelStatus !== 'CONFIRMED' ? (
            <button
              onClick={handleConfirmHotelClick}
              disabled={!bookingStatus.selectedHotel}
              className="hotel-cta"
              style={{ opacity: !bookingStatus.selectedHotel ? 0.5 : 1 }}
            >
              {bookingStatus.hotelStatus === 'SELECTED' ? 'Confirm Booking' : 'Select a Hotel First'}
            </button>
          ) : (
            <div style={{
              background: 'rgba(22, 163, 74, 0.08)', border: '1px solid rgba(22, 163, 74, 0.2)',
              borderRadius: '14px', padding: '20px'
            }}>
              {/* Confirmed state — clean booking card */}
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✅</div>
                <p style={{ color: '#16a34a', fontWeight: 800, fontSize: '1rem' }}>Booking Confirmed</p>
              </div>

              <div style={{
                background: 'var(--bg-card)', borderRadius: '12px',
                padding: '16px', border: '1px solid var(--border)'
              }}>
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px',
                  fontSize: '0.78rem'
                }}>
                  <div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.65rem', marginBottom: '2px' }}>Booking Ref</p>
                    <p style={{ fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                      {bookingStatus.selectedHotel?.bookingReference || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.65rem', marginBottom: '2px' }}>Hotel</p>
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {bookingStatus.selectedHotel?.name}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.65rem', marginBottom: '2px' }}>Check-in</p>
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {tripContext.startDate || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.65rem', marginBottom: '2px' }}>Check-out</p>
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {tripContext.endDate || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.65rem', marginBottom: '2px' }}>Guest</p>
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {user?.name || 'Guest'}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.65rem', marginBottom: '2px' }}>Amount</p>
                    <p style={{ fontWeight: 700, color: 'var(--primary)' }}>
                      {bookingStatus.selectedHotel ? formatPrice(bookingStatus.selectedHotel.price, currency) : '—'}/night
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleViewVoucher}
                className="hotel-cta"
                style={{ marginTop: '12px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <FileText size={16} /> View & Print Voucher
              </button>

              <button
                onClick={handleCancelHotel}
                disabled={cancelling}
                className="hotel-cta"
                style={{
                  marginTop: '8px',
                  background: 'transparent',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <XCircle size={16} /> {cancelling ? 'Cancelling...' : 'Cancel Hotel Booking'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Terms ──────────────────────────────────────────────────────── */}
      <div style={{
        padding: '14px 18px', borderRadius: '12px',
        background: 'var(--bg-card-hover)', fontSize: '0.72rem',
        color: 'var(--text-muted)', lineHeight: 1.6
      }}>
        <p style={{ fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Info size={16} className="text-[#EA580C]" /> Terms & Conditions
        </p>
        <p>
          Prices and availability may change in real time. Final booking price is confirmed at checkout.
          Free cancellation is available up to 24 hours before check-in for most properties.
          Users must verify travel documents and regulations before departure.
        </p>
      </div>
    </div>
  )
}
