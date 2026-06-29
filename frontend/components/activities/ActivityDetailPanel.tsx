'use client'

import { useState } from 'react'
import {
  X, Globe, Clock, Star, MapPin, ChevronDown, ChevronUp,
  Shield, AlertCircle, Loader2, ArrowRight, IndianRupee,
} from 'lucide-react'
import type { Activity, ActivityDetailsResult, ActivityModality } from '@/types/activities'

interface Props {
  activity:     Activity
  details:      ActivityDetailsResult | null
  loading:      boolean
  error:        string | null
  onProceed:    (modality: ActivityModality, amount: number, amountINR: number | null) => void
  onClose:      () => void
}

function formatINR(n: number | null) {
  if (!n) return null
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

export default function ActivityDetailPanel({ activity, details, loading, error, onProceed, onClose }: Props) {
  const [selectedModalityIdx, setSelectedModalityIdx] = useState(0)
  const [showAllImages, setShowAllImages]             = useState(false)
  const [expandDesc, setExpandDesc]                   = useState(false)

  const modalities       = details?.modalities || []
  const selectedModality = modalities[selectedModalityIdx] || null
  const images           = activity.images || (activity.image ? [activity.image] : [])
  const visibleImages    = showAllImages ? images : images.slice(0, 3)

  const price    = selectedModality?.amountsFrom || details
    ? { amount: details?.amount, amountINR: details?.amountINR, currency: details?.currency || 'EUR' }
    : activity.amountsFrom

  const policies  = selectedModality?.cancellationPolicies || details?.cancellationPolicies || []
  const sessions  = selectedModality?.sessions || details?.sessions || []

  function handleProceed() {
    if (!selectedModality && !details) return
    const m = selectedModality || modalities[0]
    onProceed(m, (details?.amount || 0), details?.amountINR || null)
  }

  return (
    <div className="detail-panel-overlay" role="dialog" aria-modal aria-label={`Details for ${activity.activityName}`}>
      <div className="detail-panel">
        {/* Header */}
        <div className="detail-panel__header">
          <h2 className="detail-panel__title">{activity.activityName}</h2>
          <button id="activity-detail-close" className="detail-panel__close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Gallery */}
        {images.length > 0 && (
          <div className="detail-gallery">
            {visibleImages.map((url, i) => (
              <div key={i} className={`detail-gallery__item ${i === 0 ? 'detail-gallery__item--main' : ''}`}>
                <img src={url} alt={`${activity.activityName} image ${i + 1}`} className="detail-gallery__img" />
              </div>
            ))}
            {images.length > 3 && (
              <button
                className="gallery-more-btn"
                onClick={() => setShowAllImages(v => !v)}
              >
                {showAllImages ? 'Show less' : `+${images.length - 3} more`}
              </button>
            )}
          </div>
        )}

        {/* Meta */}
        <div className="detail-meta-row">
          {activity.destination?.name && (
            <span className="detail-meta-pill">
              <MapPin size={13} />
              {activity.destination.name}
            </span>
          )}
          {activity.modality?.duration && (
            <span className="detail-meta-pill">
              <Clock size={13} />
              {activity.modality.duration}
            </span>
          )}
          {activity.averageRating && (
            <span className="detail-meta-pill">
              <Star size={13} fill="currentColor" />
              {activity.averageRating.toFixed(1)} ({activity.reviewCount} reviews)
            </span>
          )}
        </div>

        {/* Description */}
        {activity.description && (
          <div className="detail-desc-wrap">
            <p className={`detail-desc ${!expandDesc ? 'detail-desc--clamped' : ''}`}>
              {activity.description}
            </p>
            {activity.description.length > 200 && (
              <button className="detail-expand-btn" onClick={() => setExpandDesc(v => !v)}>
                {expandDesc ? <><ChevronUp size={13} /> Show less</> : <><ChevronDown size={13} /> Read more</>}
              </button>
            )}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="detail-loading">
            <Loader2 size={28} className="spin" />
            <p>Fetching availability &amp; rates…</p>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="detail-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Modalities / Options */}
        {!loading && modalities.length > 0 && (
          <section className="detail-section">
            <h3 className="detail-section-title">Select Option</h3>
            <div className="modality-list">
              {modalities.map((m, idx) => (
                <button
                  key={m.code || idx}
                  id={`modality-option-${idx}`}
                  className={`modality-item ${selectedModalityIdx === idx ? 'modality-item--selected' : ''}`}
                  onClick={() => setSelectedModalityIdx(idx)}
                >
                  <div className="modality-item__left">
                    <span className="modality-item__name">{m.name || `Option ${idx + 1}`}</span>
                    {m.duration && (
                      <span className="modality-item__detail"><Clock size={11} /> {m.duration}</span>
                    )}
                    {m.languages?.length > 0 && (
                      <span className="modality-item__detail">
                        <Globe size={11} /> {m.languages.map(l => l.name || l.code).join(', ')}
                      </span>
                    )}
                  </div>
                  {m.amountsFrom?.amount && (
                    <span className="modality-item__price">
                      from €{m.amountsFrom.amount.toFixed(2)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Sessions */}
        {!loading && sessions.length > 0 && (
          <section className="detail-section">
            <h3 className="detail-section-title">Available Sessions</h3>
            <div className="sessions-grid">
              {sessions.slice(0, 6).map((s, i) => (
                <div key={i} className="session-chip">
                  {s.startTime || s.name || `Session ${i + 1}`}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Cancellation Policies */}
        {!loading && policies.length > 0 && (
          <section className="detail-section">
            <h3 className="detail-section-title"><Shield size={14} /> Cancellation Policy</h3>
            <ul className="policy-list">
              {policies.map((p, i) => (
                <li key={i} className="policy-item">
                  {p.from ? `Before ${p.from}: ` : ''}
                  {p.amount === 0
                    ? 'Free cancellation'
                    : `Fee: €${p.amount.toFixed(2)}`}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Price + Book CTA */}
        <div className="detail-panel__footer">
          {details && (
            <div className="detail-price-block">
              <span className="detail-price__from">From</span>
              {details.amountINR && (
                <span className="detail-price__inr">
                  <IndianRupee size={18} />
                  {details.amountINR.toLocaleString('en-IN')}
                </span>
              )}
              {details.amount && (
                <span className="detail-price__eur">(€{details.amount.toFixed(2)})</span>
              )}
            </div>
          )}
          <button
            id="activity-book-now"
            className="detail-book-btn"
            onClick={handleProceed}
            disabled={loading || !!error || (!details && !loading)}
          >
            Book Now
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
