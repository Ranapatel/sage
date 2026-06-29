'use client'

import { useState, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import {
  Check, Loader2, AlertCircle, ExternalLink,
  IndianRupee, CreditCard, User, Users, ArrowLeft,
} from 'lucide-react'
import type {
  Activity, ActivityModality, ActivityDetailsResult,
  Passenger, BookingHolder, PreconfirmResult,
  RazorpayOrderResult, ReconfirmResult, BookingStep,
} from '@/types/activities'
import { activitiesAPI, paymentsAPI } from '@/lib/activitiesApi'

declare global {
  interface Window { Razorpay: any }
}

interface Props {
  activity:       Activity
  detailsResult:  ActivityDetailsResult
  selectedModality: ActivityModality | null
  fromDate:       string
  toDate:         string
  onComplete:     (booking: ReconfirmResult) => void
  onBack:         () => void
}

type Step = 'passengers' | 'payment' | 'confirmed'

// ── Step indicator ────────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: 'passengers', label: 'Passengers' },
    { key: 'payment',    label: 'Payment' },
    { key: 'confirmed',  label: 'Confirmed' },
  ]
  const idx = steps.findIndex(s => s.key === current)
  return (
    <ol className="booking-steps">
      {steps.map((s, i) => (
        <li key={s.key} className={`booking-step ${i <= idx ? 'booking-step--done' : ''} ${i === idx ? 'booking-step--active' : ''}`}>
          <span className="booking-step__num">
            {i < idx ? <Check size={12} /> : i + 1}
          </span>
          <span className="booking-step__label">{s.label}</span>
          {i < steps.length - 1 && <span className="booking-step__line" />}
        </li>
      ))}
    </ol>
  )
}

// ── Passenger form ────────────────────────────────────────────────────────────

interface PassengerFormProps {
  passengers: Passenger[]
  holder:     BookingHolder
  onChange:   (passengers: Passenger[], holder: BookingHolder) => void
  onNext:     () => void
  loading:    boolean
}

function PassengerForm({ passengers, holder, onChange, onNext, loading }: PassengerFormProps) {
  function updatePassenger(idx: number, field: keyof Passenger, value: string | number) {
    const updated = passengers.map((p, i) =>
      i === idx ? { ...p, [field]: value } : p
    )
    onChange(updated, holder)
  }

  function updateHolder(field: keyof BookingHolder, value: string) {
    onChange(passengers, { ...holder, [field]: value })
  }

  const isValid = passengers.every(p => p.firstName && p.lastName && p.age >= 0)
    && holder.firstName && holder.lastName && holder.email && holder.phone

  return (
    <div className="bf-section">
      <h3 className="bf-section-title"><Users size={16} /> Passenger Details</h3>
      {passengers.map((p, idx) => (
        <div key={idx} className="passenger-block">
          <p className="passenger-block__label">
            {p.type === 'ADULT' ? `Adult ${idx + 1}` : `Child ${idx + 1}`}
          </p>
          <div className="passenger-fields">
            <div className="form-field">
              <label>First Name</label>
              <input
                id={`pax-first-${idx}`}
                type="text"
                value={p.firstName}
                onChange={e => updatePassenger(idx, 'firstName', e.target.value)}
                placeholder="First name"
                required
              />
            </div>
            <div className="form-field">
              <label>Last Name</label>
              <input
                id={`pax-last-${idx}`}
                type="text"
                value={p.lastName}
                onChange={e => updatePassenger(idx, 'lastName', e.target.value)}
                placeholder="Last name"
                required
              />
            </div>
            <div className="form-field">
              <label>Age</label>
              <input
                id={`pax-age-${idx}`}
                type="number"
                value={p.age}
                onChange={e => updatePassenger(idx, 'age', parseInt(e.target.value) || 0)}
                min={0} max={120}
                required
              />
            </div>
          </div>
        </div>
      ))}

      <h3 className="bf-section-title mt-6"><User size={16} /> Lead Holder &amp; Contact</h3>
      <div className="passenger-fields">
        <div className="form-field">
          <label>First Name</label>
          <input id="holder-first" type="text" value={holder.firstName} onChange={e => updateHolder('firstName', e.target.value)} placeholder="First name" required />
        </div>
        <div className="form-field">
          <label>Last Name</label>
          <input id="holder-last" type="text" value={holder.lastName} onChange={e => updateHolder('lastName', e.target.value)} placeholder="Last name" required />
        </div>
        <div className="form-field form-field--full">
          <label>Email</label>
          <input id="holder-email" type="email" value={holder.email} onChange={e => updateHolder('email', e.target.value)} placeholder="email@example.com" required />
        </div>
        <div className="form-field form-field--full">
          <label>Phone</label>
          <input id="holder-phone" type="tel" value={holder.phone} onChange={e => updateHolder('phone', e.target.value)} placeholder="+91 99999 99999" required />
        </div>
      </div>

      <button
        id="bf-next-to-payment"
        className="bf-primary-btn"
        onClick={onNext}
        disabled={!isValid || loading}
      >
        {loading ? <Loader2 size={16} className="spin" /> : <CreditCard size={16} />}
        Continue to Payment
      </button>
    </div>
  )
}

// ── Main booking flow ─────────────────────────────────────────────────────────

export default function ActivityBookingFlow({
  activity, detailsResult, selectedModality,
  fromDate, toDate, onComplete, onBack,
}: Props) {
  const [step, setStep]         = useState<Step>('passengers')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  // Booking IDs (stable for this flow instance)
  const [bookingId]             = useState(() => uuidv4())
  const [idempotencyKey]        = useState(() => uuidv4())

  // Form state
  const totalAdults   = detailsResult.activity.modality?.languages?.length || 1
  const initPassengers = (): Passenger[] => {
    const adults   = detailsResult ? Math.max(1, (detailsResult.activity as any)._paxAdults || 1) : 1
    return Array.from({ length: adults }, (_, i) => ({
      firstName: '', lastName: '', age: 30, type: 'ADULT',
    }))
  }
  const [passengers, setPassengers] = useState<Passenger[]>(initPassengers)
  const [holder, setHolder]         = useState<BookingHolder>({ firstName: '', lastName: '', email: '', phone: '' })

  // Booking results
  const [preconfirmResult, setPreconfirmResult] = useState<PreconfirmResult | null>(null)
  const [razorpayOrder, setRazorpayOrder]       = useState<RazorpayOrderResult | null>(null)
  const [confirmedBooking, setConfirmedBooking] = useState<ReconfirmResult | null>(null)

  // Razorpay payment state
  const [razorpayPaymentId, setRazorpayPaymentId] = useState<string | null>(null)
  const [razorpaySignature, setRazorpaySignature] = useState<string | null>(null)

  // ── Step 1: Preconfirm + Create Order ──────────────────────────────────────

  async function handleProceedToPayment() {
    setLoading(true)
    setError(null)
    try {
      // Preconfirm
      const preRes = await activitiesAPI.preconfirm({
        bookingId,
        activityCode: activity.activityCode,
        activityName: activity.activityName,
        rateKey:      selectedModality?.rateKey || detailsResult.modalities[0]?.rateKey || '',
        modalityCode: selectedModality?.code || null || undefined,
        modalityName: selectedModality?.name || null || undefined,
        language:     'en',
        fromDate,
        toDate,
        passengers,
        holder,
        amount:       detailsResult.amount || 0,
        currency:     detailsResult.currency || 'EUR',
      })
      if (!preRes.success) throw new Error((preRes as any).error || 'Preconfirm failed')
      setPreconfirmResult(preRes.data)

      // Create Razorpay order
      const amountINR = detailsResult.amountINR || Math.round((detailsResult.amount || 0) * 90)
      const orderRes  = await paymentsAPI.createOrder({
        bookingId,
        idempotencyKey,
        amountINR,
        currency: 'INR',
      })
      if (!orderRes.success) throw new Error((orderRes as any).error || 'Payment order failed')
      setRazorpayOrder(orderRes.data)
      setStep('payment')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ── Step 2: Open Razorpay modal ────────────────────────────────────────────

  function openRazorpay() {
    if (!razorpayOrder) return
    if (typeof window === 'undefined' || !window.Razorpay) {
      setError('Razorpay SDK not loaded. Please refresh and try again.')
      return
    }

    const options = {
      key:          razorpayOrder.keyId,
      amount:       razorpayOrder.amount,
      currency:     razorpayOrder.currency,
      order_id:     razorpayOrder.razorpayOrderId,
      name:         'TripSage',
      description:  activity.activityName,
      prefill: {
        name:  `${holder.firstName} ${holder.lastName}`,
        email: holder.email,
        contact: holder.phone,
      },
      theme: { color: '#6d28d9' },
      handler: async (response: {
        razorpay_payment_id: string
        razorpay_order_id:   string
        razorpay_signature:  string
      }) => {
        setRazorpayPaymentId(response.razorpay_payment_id)
        setRazorpaySignature(response.razorpay_signature)
        await finalizeReconfirm(response.razorpay_payment_id, response.razorpay_signature)
      },
      modal: {
        ondismiss: () => setError('Payment was dismissed. Please try again.'),
      },
    }

    const rzp = new window.Razorpay(options)
    rzp.on('payment.failed', (resp: any) => {
      setError(`Payment failed: ${resp.error?.description || 'Unknown error'}`)
    })
    rzp.open()
  }

  // ── Step 3: Reconfirm ──────────────────────────────────────────────────────

  async function finalizeReconfirm(paymentId: string, signature: string) {
    setLoading(true)
    setError(null)
    try {
      const res = await activitiesAPI.reconfirm({
        bookingId,
        razorpayOrderId:   razorpayOrder!.razorpayOrderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
      })
      if (!res.success) throw new Error((res as any).error || 'Reconfirm failed')
      setConfirmedBooking(res.data)
      setStep('confirmed')
      onComplete(res.data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const amountINR = detailsResult.amountINR || Math.round((detailsResult.amount || 0) * 90)

  return (
    <div className="booking-flow">
      {/* Back button */}
      {step === 'passengers' && (
        <button className="bf-back-btn" onClick={onBack}>
          <ArrowLeft size={16} /> Back to details
        </button>
      )}

      <StepIndicator current={step} />

      {/* Summary pill */}
      <div className="bf-summary-pill">
        <span className="bf-summary__name">{activity.activityName}</span>
        <span className="bf-summary__dates">{fromDate} → {toDate}</span>
        <span className="bf-summary__price">
          <IndianRupee size={13} />{amountINR.toLocaleString('en-IN')}
        </span>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bf-error">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button className="bf-error__dismiss" onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Step: Passengers */}
      {step === 'passengers' && (
        <PassengerForm
          passengers={passengers}
          holder={holder}
          onChange={(p, h) => { setPassengers(p); setHolder(h) }}
          onNext={handleProceedToPayment}
          loading={loading}
        />
      )}

      {/* Step: Payment */}
      {step === 'payment' && razorpayOrder && (
        <div className="bf-section">
          <h3 className="bf-section-title"><CreditCard size={16} /> Payment</h3>
          <div className="payment-summary-card">
            <div className="payment-summary-row">
              <span>Activity</span>
              <span>{activity.activityName}</span>
            </div>
            <div className="payment-summary-row">
              <span>Dates</span>
              <span>{fromDate} → {toDate}</span>
            </div>
            <div className="payment-summary-row payment-summary-row--total">
              <span>Total</span>
              <span className="payment-total">
                <IndianRupee size={16} />
                {amountINR.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
          <p className="payment-notice">
            You will be redirected to Razorpay secure checkout. Your booking is reserved for 30 minutes.
          </p>
          <button
            id="bf-open-razorpay"
            className="bf-primary-btn"
            onClick={openRazorpay}
            disabled={loading}
          >
            {loading ? <Loader2 size={16} className="spin" /> : <CreditCard size={16} />}
            Pay ₹{amountINR.toLocaleString('en-IN')}
          </button>
        </div>
      )}

      {/* Step: Confirmed */}
      {step === 'confirmed' && confirmedBooking && (
        <div className="bf-section bf-section--success">
          <div className="bf-success-icon">
            <Check size={32} />
          </div>
          <h3 className="bf-success-title">Booking Confirmed! 🎉</h3>
          <p className="bf-success-ref">
            Reference: <strong>{confirmedBooking.hotelbedsReference || bookingId}</strong>
          </p>
          {confirmedBooking.voucherUrl && (
            <a
              id="bf-voucher-link"
              href={confirmedBooking.voucherUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bf-voucher-btn"
            >
              <ExternalLink size={16} /> Download Voucher
            </a>
          )}
          <div className="bf-confirmed-details">
            <div className="bf-confirmed-row">
              <span>Activity</span><span>{confirmedBooking.activityName}</span>
            </div>
            <div className="bf-confirmed-row">
              <span>Dates</span><span>{confirmedBooking.fromDate} → {confirmedBooking.toDate}</span>
            </div>
            <div className="bf-confirmed-row">
              <span>Amount Paid</span>
              <span>₹{(confirmedBooking.amountINR || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
