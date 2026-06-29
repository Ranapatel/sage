'use client'

import { useState } from 'react'
import {
  AlertTriangle, X, Trash2, IndianRupee, Loader2, CheckCircle,
} from 'lucide-react'
import type { CancelSimulationResult, CancelResult } from '@/types/activities'
import { bookingsAPI } from '@/lib/activitiesApi'

interface Props {
  reference:   string               // bookingId or HB reference
  activityName: string
  onCancelled: (result: CancelResult) => void
  onClose:     () => void
}

type Phase = 'idle' | 'simulating' | 'confirming' | 'cancelling' | 'done' | 'error'

export default function ActivityCancellationModal({ reference, activityName, onCancelled, onClose }: Props) {
  const [phase, setPhase]     = useState<Phase>('idle')
  const [sim, setSim]         = useState<CancelSimulationResult | null>(null)
  const [result, setResult]   = useState<CancelResult | null>(null)
  const [error, setError]     = useState<string | null>(null)

  function formatINR(n: number) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
  }

  async function runSimulation() {
    setPhase('simulating')
    setError(null)
    try {
      const res = await bookingsAPI.cancelSimulation(reference, 'en')
      if (!res.success) throw new Error((res as any).error || 'Simulation failed')
      setSim(res.data)
      setPhase('confirming')
    } catch (err: any) {
      setError(err.message)
      setPhase('error')
    }
  }

  async function executeCancellation() {
    setPhase('cancelling')
    setError(null)
    try {
      const res = await bookingsAPI.cancel(reference, 'en', true)
      if (!res.success) throw new Error((res as any).error || 'Cancellation failed')
      setResult(res.data)
      setPhase('done')
      onCancelled(res.data)
    } catch (err: any) {
      setError(err.message)
      setPhase('error')
    }
  }

  return (
    <div className="cancel-modal-overlay" role="dialog" aria-modal aria-label="Cancel booking">
      <div className="cancel-modal">
        {/* Header */}
        <div className="cancel-modal__header">
          <div className="cancel-modal__icon-wrap">
            {phase === 'done'
              ? <CheckCircle size={22} className="text-emerald-400" />
              : <AlertTriangle size={22} className="text-amber-400" />
            }
          </div>
          <h2 className="cancel-modal__title">
            {phase === 'done' ? 'Booking Cancelled' : 'Cancel Booking'}
          </h2>
          <button className="cancel-modal__close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="cancel-modal__body">
          {/* Idle — first screen */}
          {phase === 'idle' && (
            <>
              <p className="cancel-modal__text">
                You are about to cancel your booking for:
              </p>
              <p className="cancel-modal__activity-name">{activityName}</p>
              <p className="cancel-modal__warn">
                Cancellation fees may apply depending on the policy.
                We&apos;ll show you the exact fee before confirming.
              </p>
            </>
          )}

          {/* Simulating */}
          {phase === 'simulating' && (
            <div className="cancel-modal__loading">
              <Loader2 size={28} className="spin" />
              <p>Checking cancellation fee…</p>
            </div>
          )}

          {/* Confirming — show fee */}
          {phase === 'confirming' && sim && (
            <>
              <p className="cancel-modal__text">Cancellation fee breakdown:</p>
              <div className="cancel-fee-card">
                <div className="cancel-fee-row">
                  <span>Cancellation fee</span>
                  <span className="text-red-400 font-semibold">
                    €{sim.cancellationFee.toFixed(2)}
                  </span>
                </div>
                <div className="cancel-fee-row">
                  <span>Refund amount</span>
                  <span className="text-emerald-400 font-semibold">
                    €{sim.refundAmount.toFixed(2)}
                  </span>
                </div>
              </div>
              {sim.cancellationPolicies.length > 0 && (
                <ul className="cancel-policy-list">
                  {sim.cancellationPolicies.map((p, i) => (
                    <li key={i} className="cancel-policy-item">
                      {p.from ? `Before ${p.from}: ` : ''}
                      {p.amount === 0 ? 'Free cancellation' : `Fee: €${p.amount.toFixed(2)}`}
                    </li>
                  ))}
                </ul>
              )}
              <p className="cancel-modal__warn">
                This action <strong>cannot be undone</strong>. Confirm to proceed.
              </p>
            </>
          )}

          {/* Cancelling */}
          {phase === 'cancelling' && (
            <div className="cancel-modal__loading">
              <Loader2 size={28} className="spin" />
              <p>Cancelling your booking…</p>
            </div>
          )}

          {/* Done */}
          {phase === 'done' && result && (
            <>
              <p className="cancel-modal__text cancel-modal__text--success">
                Your booking has been successfully cancelled.
              </p>
              <div className="cancel-fee-card">
                <div className="cancel-fee-row">
                  <span>Cancellation fee</span>
                  <span className="text-red-400">€{result.cancellationFee.toFixed(2)}</span>
                </div>
                <div className="cancel-fee-row">
                  <span>Refund</span>
                  <span className="text-emerald-400">€{result.refundAmount.toFixed(2)}</span>
                </div>
              </div>
              <p className="cancel-ref">Reference: {result.hotelbedsReference || result.bookingId}</p>
            </>
          )}

          {/* Error */}
          {phase === 'error' && error && (
            <div className="cancel-modal__error">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="cancel-modal__actions">
          {phase === 'idle' && (
            <>
              <button className="cancel-modal__btn cancel-modal__btn--secondary" onClick={onClose}>
                Keep booking
              </button>
              <button
                id="cancel-simulation-btn"
                className="cancel-modal__btn cancel-modal__btn--danger"
                onClick={runSimulation}
              >
                <Trash2 size={15} /> Check cancellation fee
              </button>
            </>
          )}

          {phase === 'confirming' && (
            <>
              <button className="cancel-modal__btn cancel-modal__btn--secondary" onClick={onClose}>
                Keep booking
              </button>
              <button
                id="confirm-cancel-btn"
                className="cancel-modal__btn cancel-modal__btn--danger"
                onClick={executeCancellation}
              >
                <Trash2 size={15} /> Confirm cancellation
              </button>
            </>
          )}

          {(phase === 'done' || phase === 'error') && (
            <button className="cancel-modal__btn cancel-modal__btn--primary" onClick={onClose}>
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
