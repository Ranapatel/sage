'use client'

import { useTripStore } from '@/store/tripStore'
import { tripAPI } from '@/lib/api'
import { formatPrice } from '@/lib/currency'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import { useState } from 'react'

const STATUS_STEPS = ['INIT', 'SELECTED', 'PENDING', 'CONFIRMED']

export default function BookingStatus() {
  const { bookingStatus, setBookingStatus, addNotification } = useTripStore()
  const { user } = useAuthStore()
  const currency = user?.currency ?? 'INR'
  const [confirming, setConfirming] = useState(false)

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
      await new Promise(r => setTimeout(r, 1500)) // Simulate API
      setBookingStatus({ flightStatus: 'CONFIRMED' })
      addNotification({
        id: Date.now().toString(),
        type: 'info',
        title: '✅ Flight Confirmed',
        message: `${bookingStatus.selectedFlight?.name} booking confirmed!`,
        timestamp: new Date().toISOString(),
        read: false,
      })
      toast.success('Flight booking confirmed! 🎉')
    } catch {
      setBookingStatus({ flightStatus: 'SELECTED' })
      toast.error('Booking failed. Try again.')
    } finally {
      setConfirming(false)
    }
  }

  const handleConfirmHotel = async () => {
    if (!bookingStatus.selectedHotel) {
      toast.error('Select a hotel first from the Hotels tab')
      return
    }
    setConfirming(true)
    setBookingStatus({ hotelStatus: 'PENDING' })
    try {
      await new Promise(r => setTimeout(r, 1500))
      setBookingStatus({ hotelStatus: 'CONFIRMED' })
      addNotification({
        id: Date.now().toString(),
        type: 'info',
        title: '✅ Hotel Confirmed',
        message: `${bookingStatus.selectedHotel?.name} booking confirmed!`,
        timestamp: new Date().toISOString(),
        read: false,
      })
      toast.success('Hotel booking confirmed! 🎉')
    } catch {
      setBookingStatus({ hotelStatus: 'SELECTED' })
      toast.error('Booking failed. Try again.')
    } finally {
      setConfirming(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="section-title text-xl">📋 Booking Management</h2>

      {/* Booking state machines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Flight booking */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">✈️</span>
            <div>
              <h3 className="font-bold text-[var(--text-primary)]">Flight Booking</h3>
              <p className="text-xs text-[var(--text-muted)]">Status: <span className={`font-semibold ${bookingStatus.flightStatus === 'CONFIRMED' ? 'text-green-400' : 'text-yellow-400'}`}>{bookingStatus.flightStatus}</span></p>
            </div>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 mb-6">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex items-center gap-2 flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    i <= flightStep ? 'bg-[var(--primary)] text-white' : 'bg-[var(--border)] text-[var(--text-muted)]'
                  }`}>
                    {i < flightStep ? '✓' : i + 1}
                  </div>
                  <span className="text-[0.6rem] text-[var(--text-muted)] mt-1 text-center">{step}</span>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`h-0.5 flex-1 -mt-4 transition-all ${i < flightStep ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`}></div>
                )}
              </div>
            ))}
          </div>

          {bookingStatus.selectedFlight ? (
            <div className="glass rounded-xl p-4 mb-4">
              <p className="text-xs text-[var(--text-muted)] mb-1">Selected Flight</p>
              <p className="font-semibold text-sm text-[var(--text-primary)]">{bookingStatus.selectedFlight.name}</p>
              <p className="text-[var(--primary)] font-bold font-mono">{formatPrice(bookingStatus.selectedFlight.price, currency)} per person</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-[var(--text-muted)]">
                <span>🛫 {bookingStatus.selectedFlight.departure}</span>
                <span>🛬 {bookingStatus.selectedFlight.arrival}</span>
                <span>⏱ {bookingStatus.selectedFlight.duration}</span>
              </div>
            </div>
          ) : (
            <div className="glass rounded-xl p-4 mb-4 text-center">
              <p className="text-[var(--text-muted)] text-sm">No flight selected</p>
              <p className="text-xs text-[var(--text-muted)]">Go to Transport tab to select a flight</p>
            </div>
          )}

          {bookingStatus.flightStatus !== 'CONFIRMED' ? (
            <button
              onClick={handleConfirmFlight}
              disabled={!bookingStatus.selectedFlight || confirming}
              className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {confirming ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Processing...
                </span>
              ) : bookingStatus.flightStatus === 'SELECTED' ? 'Confirm Booking →' : 'Select a Flight First'}
            </button>
          ) : (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
              <p className="text-green-400 font-bold">✅ Flight Confirmed!</p>
              <a
                href={bookingStatus.selectedFlight?.bookingLink}
                target="_blank" rel="noopener noreferrer"
                className="text-xs text-[var(--primary)] hover:underline mt-1 block"
              >
                View booking details →
              </a>
            </div>
          )}
        </div>

        {/* Hotel booking */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">🏨</span>
            <div>
              <h3 className="font-bold text-[var(--text-primary)]">Hotel Booking</h3>
              <p className="text-xs text-[var(--text-muted)]">Status: <span className={`font-semibold ${bookingStatus.hotelStatus === 'CONFIRMED' ? 'text-green-400' : 'text-yellow-400'}`}>{bookingStatus.hotelStatus}</span></p>
            </div>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 mb-6">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex items-center gap-2 flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    i <= hotelStep ? 'bg-[var(--primary)] text-white' : 'bg-[var(--border)] text-[var(--text-muted)]'
                  }`}>
                    {i < hotelStep ? '✓' : i + 1}
                  </div>
                  <span className="text-[0.6rem] text-[var(--text-muted)] mt-1 text-center">{step}</span>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`h-0.5 flex-1 -mt-4 transition-all ${i < hotelStep ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`}></div>
                )}
              </div>
            ))}
          </div>

          {bookingStatus.selectedHotel ? (
            <div className="glass rounded-xl p-4 mb-4">
              <p className="text-xs text-[var(--text-muted)] mb-1">Selected Hotel</p>
              <p className="font-semibold text-sm text-[var(--text-primary)]">{bookingStatus.selectedHotel.name}</p>
              <p className="text-[var(--primary)] font-bold font-mono">{formatPrice(bookingStatus.selectedHotel.price, currency)}/night</p>
              <div className="flex items-center gap-2 mt-2 text-xs">
                <span className="text-yellow-400">{'★'.repeat(Math.floor(bookingStatus.selectedHotel.rating))}</span>
                <span className="text-[var(--text-muted)]">{bookingStatus.selectedHotel.location}</span>
              </div>
            </div>
          ) : (
            <div className="glass rounded-xl p-4 mb-4 text-center">
              <p className="text-[var(--text-muted)] text-sm">No hotel selected</p>
              <p className="text-xs text-[var(--text-muted)]">Go to Hotels tab to select</p>
            </div>
          )}

          {bookingStatus.hotelStatus !== 'CONFIRMED' ? (
            <button
              onClick={handleConfirmHotel}
              disabled={!bookingStatus.selectedHotel || confirming}
              className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {confirming ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Processing...
                </span>
              ) : bookingStatus.hotelStatus === 'SELECTED' ? 'Confirm Booking →' : 'Select a Hotel First'}
            </button>
          ) : (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
              <p className="text-green-400 font-bold">✅ Hotel Confirmed!</p>
              <a href={bookingStatus.selectedHotel?.bookingLink} target="_blank" rel="noopener noreferrer"
                className="text-xs text-[var(--primary)] hover:underline mt-1 block">
                View booking details →
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Terms */}
      <div className="glass rounded-xl p-4 text-xs text-[var(--text-muted)] leading-relaxed">
        <p className="font-semibold text-[var(--text-secondary)] mb-2">⚖️ Terms & Conditions</p>
        <p>Prices and availability may change in real time. TripSage does NOT guarantee final booking price. 
        Bookings are handled by third-party providers. TripSage is NOT responsible for cancellations or delays. 
        Affiliate links may generate commission. Users must verify travel documents and regulations.</p>
      </div>
    </div>
  )
}
