'use client'

import React, { useState } from 'react'
import { useTripStore } from '@/store/tripStore'
import { formatPrice } from '@/lib/currency'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

export default function BookingConfirmationPanel() {
  const { bookingFlow, setBookingFlowStep, closeBookingFlow } = useTripStore()
  const { user } = useAuthStore()
  const currency = user?.currency ?? 'INR'
  const record = bookingFlow.bookingRecord
  const [copied, setCopied] = useState(false)

  if (!record) return null

  const handleCopyRef = () => {
    navigator.clipboard.writeText(record.bookingReference)
    setCopied(true)
    toast.success('Booking reference copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const formatCancellation = (policies: any[]) => {
    if (!policies || policies.length === 0) {
      return 'Free cancellation up to 24 hours before check-in.'
    }
    return policies.map((p, i) => {
      const amt = parseFloat(p.amount || 0)
      const date = p.from 
        ? new Date(p.from).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : 'arrival'
      if (amt === 0) return `Free cancellation until ${date}.`
      return `Cancellation after ${date}: ${formatPrice(Math.round(amt * 90), currency)} charge applies.`
    }).join(' ')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px' }}>
      
      {/* Success Hero */}
      <div style={{
        textAlign: 'center',
        padding: '30px 20px',
        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(0, 194, 124, 0.05) 100%)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'rgba(0, 194, 124, 0.15)',
          color: '#10b981',
          fontSize: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)'
        }}>
          ✓
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Booking Confirmed!
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Your room is locked and confirmed with Hotelbeds.
          </p>
        </div>

        {/* Copy Reference code */}
        <div style={{
          marginTop: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--bg-card)',
          padding: '8px 14px',
          borderRadius: '10px',
          border: '1px solid var(--border)'
        }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Booking Ref:
          </span>
          <code style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)' }}>
            {record.bookingReference}
          </code>
          <button
            onClick={handleCopyRef}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
              padding: '2px',
              marginLeft: '4px'
            }}
            title="Copy Reference"
          >
            {copied ? '✅' : '📋'}
          </button>
        </div>
      </div>

      {/* Hotel & Room Details */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            {record.hotelName}
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            📍 {record.hotelAddress}
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          padding: '10px 0',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)'
        }}>
          <div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Check-In</span>
            <p style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {new Date(record.checkIn).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Check-Out</span>
            <p style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {new Date(record.checkOut).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Room:</span> <strong style={{ color: 'var(--text-primary)' }}>{record.roomType}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Board Type:</span> <strong style={{ color: 'var(--text-primary)' }}>{record.boardType}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Guests:</span>{' '}
            <strong style={{ color: 'var(--text-primary)' }}>
              {record.guests.map((g: any) => g.name).join(', ')}
            </strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Total Cost:</span>{' '}
            <strong style={{ color: 'var(--text-primary)' }}>
              {formatPrice(record.totalPrice, currency)}
            </strong>
          </div>
        </div>
      </div>

      {/* Cancellation Policy */}
      <div style={{
        background: 'var(--bg-card-hover)',
        borderRadius: '12px',
        padding: '14px',
        fontSize: '0.78rem',
        color: 'var(--text-secondary)',
        border: '1px solid var(--border)'
      }}>
        <h4 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>Cancellation Policy</h4>
        <p style={{ lineHeight: 1.4 }}>
          {formatCancellation(record.cancellationPolicies)}
        </p>
      </div>

      {/* Voucher Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setBookingFlowStep('voucher')}
            className="hotel-cta"
            style={{
              flex: 1,
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)'
            }}
          >
            📄 View & Print Voucher
          </button>
        </div>
        
        <button
          onClick={closeBookingFlow}
          style={{
            padding: '14px',
            background: 'var(--bg-card-hover)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            color: 'var(--text-primary)',
            fontWeight: 600,
            fontSize: '0.88rem',
            cursor: 'pointer'
          }}
        >
          Close Workflow
        </button>
      </div>
    </div>
  )
}
