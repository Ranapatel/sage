'use client'

import React, { useEffect, useState } from 'react'
import { useTripStore } from '@/store/tripStore'
import { tripAPI } from '@/lib/api'
import GuestInfoForm from './GuestInfoForm'
import CheckRateGate from './CheckRateGate'
import BookingConfirmationPanel from '../booking/BookingConfirmationPanel'
import VoucherPage from '../booking/VoucherPage'
import toast from 'react-hot-toast'

export default function HotelBookingFlow() {
  const { bookingFlow, setBookingFlowStep, closeBookingFlow, tripContext } = useTripStore()
  const [bookingMessage, setBookingMessage] = useState('Securing your reservation...')

  const isOpen = bookingFlow.isOpen
  const step = bookingFlow.step
  const hotel = bookingFlow.hotel
  const room = bookingFlow.room
  const guestData = bookingFlow.guestData
  const checkRateResult = bookingFlow.checkRateResult

  // Message loop during booking state for premium enterprise feel
  useEffect(() => {
    if (step !== 'booking') return
    
    const messages = [
      'Contacting accommodation supplier...',
      'Submitting passenger details...',
      'Securing rate lock...',
      'Generating reservation voucher...',
      'Finalizing booking confirmation...'
    ]
    let idx = 0
    const interval = setInterval(() => {
      idx = (idx + 1) % messages.length
      setBookingMessage(messages[idx])
    }, 2500)

    return () => clearInterval(interval)
  }, [step])

  // Triggers live booking call
  useEffect(() => {
    if (step !== 'booking') return
    if (!hotel || !room || !guestData) {
      toast.error('Missing booking data. Please try again.')
      setBookingFlowStep('guests')
      return
    }

    let isMounted = true
    const executeBooking = async () => {
      const activeRateKey = checkRateResult?.rateKey || room.rateKey
      const activePrice   = checkRateResult?.netInr || room.price
      const activeBoard   = checkRateResult?.boardName || room.boardName
      const nights        = hotel.nights || 1

      try {
        const payload = {
          type: 'hotel' as const,
          itemId: hotel.id,
          holder: guestData.holder,
          guests: guestData.guests,
          contact: guestData.contact,
          userDetails: {
            rateKey: activeRateKey,
            name: `${guestData.holder.firstName} ${guestData.holder.lastName}`,
            email: guestData.contact.email,
            phone: guestData.contact.phone,
            hotelCode: hotel.id.replace('hbd_', ''),
            hotelName: hotel.name,
            hotelAddress: hotel.location,
            checkIn: tripContext.startDate,
            checkOut: tripContext.endDate,
            roomType: room.name,
            boardType: activeBoard,
            totalPrice: activePrice * nights,
            requireCheckRate: false, // We already checked rate on frontend!
            rateComments: checkRateResult?.rateComments || ''
          }
        }

        const response = await tripAPI.initHotelBookingFull(payload)
        if (!isMounted) return

        if (response.success && response.data) {
          // Update store with final booking record
          useTripStore.setState(s => ({
            bookingFlow: {
              ...s.bookingFlow,
              bookingRecord: response.data,
              error: null
            },
            bookingStatus: {
              ...s.bookingStatus,
              hotelStatus: 'CONFIRMED',
              selectedHotel: {
                ...hotel,
                bookingReference: response.data.bookingReference
              },
              selectedRoom: {
                name: room.name,
                boardName: activeBoard,
                rateKey: activeRateKey,
                price: activePrice
              }
            }
          }))

          // Add official TripSage system notification
          useTripStore.getState().addNotification({
            id: Date.now().toString(),
            type: 'info',
            title: 'Booking Confirmed!',
            message: `Stay at ${hotel.name} confirmed. Ref: ${response.data.bookingReference}`,
            timestamp: new Date().toISOString(),
            read: false
          })

          toast.success('Room booked successfully! 🎉')
          setBookingFlowStep('confirmed')
        } else {
          throw new Error(response.error || 'Hotelbeds rejected the reservation.')
        }
      } catch (err: any) {
        if (!isMounted) return
        console.error('[BookingFlow] Execution failed:', err)
        const errMsg = err.message || 'Hotel booking failed. Please try again.'
        
        useTripStore.setState(s => ({
          bookingFlow: {
            ...s.bookingFlow,
            error: errMsg
          }
        }))
        
        toast.error(errMsg)
        setBookingFlowStep('guests')
      }
    }

    // Small timeout to allow user to see transition
    const timer = setTimeout(() => {
      executeBooking()
    }, 800)

    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [step, hotel, room, guestData, checkRateResult, tripContext, setBookingFlowStep])

  if (!isOpen || !hotel || !room) return null

  return (
    <div className="hotel-modal-overlay" onClick={closeBookingFlow} style={{ zIndex: 10000 }}>
      <div className="hotel-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        
        {/* Header */}
        <div className="hotel-modal-close" style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-card)' }}>
          <div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
              Booking Flow
            </span>
            <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginTop: '2px' }}>
              {hotel.name}
            </h3>
          </div>
          {step !== 'booking' && step !== 'verifying' && (
            <button onClick={closeBookingFlow} aria-label="Close">✕</button>
          )}
        </div>

        {/* Scrollable Container */}
        <div style={{ padding: '20px', maxHeight: '78vh', overflowY: 'auto' }}>
          
          {/* Progress Indicator */}
          {step !== 'confirmed' && step !== 'voucher' && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
              <div style={{ flex: 1, height: '4px', background: 'var(--primary)', borderRadius: '2px' }} />
              <div style={{ flex: 1, height: '4px', background: step !== 'guests' ? 'var(--primary)' : 'var(--border)', borderRadius: '2px', transition: 'background 0.3s' }} />
              <div style={{ flex: 1, height: '4px', background: step === 'booking' ? 'var(--primary)' : 'var(--border)', borderRadius: '2px', transition: 'background 0.3s' }} />
            </div>
          )}

          {/* Steps Switch */}
          {step === 'guests' && (
            <GuestInfoForm
              rooms={1}
              rateType={room.rateType}
              onSubmit={data => {
                useTripStore.setState(s => ({
                  bookingFlow: {
                    ...s.bookingFlow,
                    guestData: data
                  }
                }))
                if (room.rateType === 'RECHECK') {
                  setBookingFlowStep('verifying')
                } else {
                  setBookingFlowStep('booking')
                }
              }}
              onBack={closeBookingFlow}
            />
          )}

          {(step === 'verifying' || step === 'confirm-rate') && (
            <CheckRateGate />
          )}

          {step === 'booking' && (
            <div style={{ padding: '40px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <div style={{
                width: '40px', height: '40px',
                border: '3px solid var(--border)', borderTopColor: 'var(--accent)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <div>
                <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Confirming Reservation</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{bookingMessage}</p>
              </div>
            </div>
          )}

          {step === 'confirmed' && (
            <BookingConfirmationPanel />
          )}

          {step === 'voucher' && (
            <VoucherPage />
          )}

        </div>
      </div>
    </div>
  )
}
