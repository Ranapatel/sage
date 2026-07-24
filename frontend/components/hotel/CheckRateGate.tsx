'use client'

import React, { useEffect, useState } from 'react'
import { useTripStore, BookingFlowStep } from '@/store/tripStore'
import { tripAPI } from '@/lib/api'
import { formatPrice } from '@/lib/currency'
import { AlertTriangle, Bell, CheckCircle2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

export default function CheckRateGate() {
  const { bookingFlow, setBookingFlowStep } = useTripStore()
  const { user } = useAuthStore()
  const currency = user?.currency ?? 'INR'
  const [checking, setChecking] = useState(true)

  const hotel = bookingFlow.hotel
  const room = bookingFlow.room
  const result = bookingFlow.checkRateResult

  useEffect(() => {
    // Only verify if we are in 'verifying' step
    if (bookingFlow.step !== 'verifying') return
    if (!room || !hotel) {
      setBookingFlowStep('guests')
      return
    }

    let isMounted = true
    const verifyRate = async () => {
      setChecking(true)
      try {
        const hotelCode = hotel.id.replace('hbd_', '')
        const response = await tripAPI.checkRate(room.rateKey, room.price, room.rateType, hotelCode)
        if (!isMounted) return

        // Update store with checkRate result
        useTripStore.setState(s => ({
          bookingFlow: {
            ...s.bookingFlow,
            checkRateResult: response,
            error: null
          }
        }))

        // Always route to confirm-rate so the user can review rate comments and policies before booking
        setBookingFlowStep('confirm-rate')
      } catch (err: any) {
        if (!isMounted) return
        console.error('[CheckRateGate] Error checking rate:', err)
        const errMsg = err.message || 'Unable to verify rates. Room may no longer be available.'
        
        useTripStore.setState(s => ({
          bookingFlow: {
            ...s.bookingFlow,
            error: errMsg
          }
        }))
        
        toast.error(errMsg)
        setBookingFlowStep('guests')
      } finally {
        if (isMounted) setChecking(false)
      }
    }

    verifyRate()
    return () => { isMounted = false }
  }, [bookingFlow.step, room, hotel, setBookingFlowStep])

  if (bookingFlow.step === 'verifying') {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <div style={{
          width: '40px', height: '40px',
          border: '3px solid var(--border)', borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <div>
          <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Verifying Room Availability</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Checking live rates and reservation status with Hotelbeds...</p>
        </div>
      </div>
    )
  }

  if (bookingFlow.step === 'confirm-rate' && result) {
    const isIncrease = result.priceDiff > 0
    const diffText = `${isIncrease ? '+' : ''}${result.priceDiff}%`
    const isLargeIncrease = result.priceDiff > 5

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px' }}>
        
        {/* Warning / Success Panel */}
        {result.priceChanged ? (
          <div style={{
            padding: '16px',
            borderRadius: '12px',
            background: isLargeIncrease ? 'rgba(239, 68, 68, 0.08)' : 'rgba(245, 158, 11, 0.08)',
            border: `1px solid ${isLargeIncrease ? '#ef4444' : '#f59e0b'}`,
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start'
          }}>
            {isLargeIncrease ? (
              <AlertTriangle className="text-red-500 shrink-0" size={22} />
            ) : (
              <Bell className="text-amber-500 shrink-0" size={22} />
            )}
            <div>
              <h4 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.88rem', marginBottom: '4px' }}>
                Room Rate Updated
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                The partner rate has changed by <strong style={{ color: isLargeIncrease ? '#ef4444' : '#f59e0b' }}>{diffText}</strong> since your search. 
                Hotelbeds requires re-verifying rates prior to confirmation.
              </p>
            </div>
          </div>
        ) : (
          <div style={{
            padding: '16px',
            borderRadius: '12px',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid #10b981',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start'
          }}>
            <CheckCircle2 className="text-emerald-500 shrink-0" size={22} />
            <div>
              <h4 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.88rem', marginBottom: '4px' }}>
                Rate Confirmed
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Rate verification succeeded. Please review the stay details and policies below before completing reservation.
              </p>
            </div>
          </div>
        )}

        {/* Comparison Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: 'var(--bg-card-hover)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Original Price</p>
            <p style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-secondary)', textDecoration: 'line-through', marginTop: '6px' }}>
              {room ? formatPrice(room.price, currency) : ''}
            </p>
            <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>per night</p>
          </div>

          <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>→</span>

          <div style={{
            background: 'var(--bg-card)',
            border: `2px solid ${isIncrease ? 'var(--accent)' : 'var(--primary)'}`,
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <p style={{ fontSize: '0.7rem', color: isIncrease ? 'var(--accent)' : 'var(--primary)', textTransform: 'uppercase', fontWeight: 700 }}>New Price</p>
            <p style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
              {formatPrice(result.netInr, currency)}
            </p>
            <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>per night</p>
          </div>
        </div>

        {/* Details Panel */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          padding: '16px',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Board Type:</span> {result.boardName || 'Room Only'}
          </div>
          
          {result.cancellationPolicies && result.cancellationPolicies.length > 0 && (
            <div>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                Cancellation Policy:
              </span>
              <ul style={{ paddingLeft: '16px', margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {result.cancellationPolicies.map((p, i) => {
                  const amt = parseFloat(p.amount)
                  const date = p.from 
                    ? new Date(p.from).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
                    : 'arrival'
                  return (
                    <li key={i} style={{ color: amt === 0 ? 'var(--primary-light)' : 'var(--text-secondary)' }}>
                      {amt === 0 ? 'Free cancellation' : `Cancellation fee: ${formatPrice(Math.round(amt * 90), currency)}`} starting {date}
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {result.rateComments && (
            <div style={{
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              borderTop: '1px solid var(--border)',
              paddingTop: '12px',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.5,
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              {result.rateComments}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button
            onClick={() => setBookingFlowStep('guests')}
            style={{
              flex: 1, padding: '14px',
              background: 'var(--bg-card-hover)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              color: 'var(--text-secondary)',
              fontWeight: 600, fontSize: '0.88rem',
              cursor: 'pointer',
            }}
          >
            ✕ Reject & Edit
          </button>
          
          <button
            onClick={() => setBookingFlowStep('booking')}
            className="hotel-cta"
            style={{ flex: 2, background: 'var(--accent)' }}
          >
            Accept & Continue →
          </button>
        </div>
      </div>
    )
  }

  return null
}
