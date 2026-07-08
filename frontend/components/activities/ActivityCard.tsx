'use client'

import { useState } from 'react'
import { MapPin, Clock, Star, Users, ChevronRight, Tag, Globe } from 'lucide-react'
import type { Activity } from '@/types/activities'

interface Props {
  activity:   Activity
  onSelect:   (activity: Activity) => void
  fromDate:   string
  toDate:     string
}

function formatINR(amount: number | null) {
  if (!amount) return null
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

function formatEUR(amount: number | null) {
  if (!amount) return null
  return `€${amount.toFixed(2)}`
}

export default function ActivityCard({ activity, onSelect, fromDate, toDate }: Props) {
  const [imgError, setImgError] = useState(false)

  const price    = activity.amountsFrom
  const inrStr   = formatINR(price?.amountINR)
  const eurStr   = formatEUR(price?.amount)
  const duration = activity.modality?.duration
  const langs    = activity.modality?.languages?.slice(0, 3) || []

  const placeholderBg = [
    'from-violet-600 to-indigo-700',
    'from-emerald-600 to-teal-700',
    'from-orange-500 to-red-600',
    'from-pink-600 to-rose-700',
    'from-sky-500 to-blue-700',
  ]
  const colorIndex = activity.activityCode.charCodeAt(0) % placeholderBg.length
  const bgGradient = placeholderBg[colorIndex]

  return (
    <article
      className="activity-card"
      onClick={() => onSelect(activity)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onSelect(activity)}
      aria-label={`View details for ${activity.activityName}`}
    >
      {/* Image */}
      <div className="activity-card__image-wrap">
        {activity.image && !imgError ? (
          <img
            src={activity.image}
            alt={activity.activityName}
            className="activity-card__image"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={`activity-card__placeholder bg-gradient-to-br ${bgGradient}`}>
            <Globe size={40} className="opacity-30" />
            <span className="activity-card__placeholder-text">{activity.activityName.slice(0, 2)}</span>
          </div>
        )}

        {/* Type badge */}
        {activity.type && (
          <span className="activity-card__badge">
            <Tag size={10} />
            {activity.type}
          </span>
        )}

        {/* Rating */}
        {activity.averageRating && (
          <span className="activity-card__rating">
            <Star size={12} fill="currentColor" />
            {activity.averageRating.toFixed(1)}
            {activity.reviewCount > 0 && (
              <span className="activity-card__reviews">({activity.reviewCount})</span>
            )}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="activity-card__body">
        <h3 className="activity-card__title">{activity.activityName}</h3>

        {/* Destination */}
        {activity.destination?.name && (
          <p className="activity-card__location">
            <MapPin size={13} />
            {activity.destination.name}
            {activity.destination.country && `, ${activity.destination.country}`}
          </p>
        )}

        {/* Description */}
        {activity.description && (
          <p className="activity-card__desc">
            {activity.description.slice(0, 110)}{activity.description.length > 110 ? '…' : ''}
          </p>
        )}

        {/* Meta row */}
        <div className="activity-card__meta">
          {duration && (
            <span className="activity-meta-pill">
              <Clock size={12} /> {duration}
            </span>
          )}
          {langs.length > 0 && (
            <span className="activity-meta-pill">
              <Globe size={12} /> {langs.join(', ')}
            </span>
          )}
        </div>

        {/* Price + CTA */}
        <div className="activity-card__footer">
          <div className="activity-card__price">
            {inrStr ? (
              <>
                <span className="price-inr">From {inrStr}</span>
                {eurStr && <span className="price-eur">({eurStr})</span>}
              </>
            ) : eurStr ? (
              <span className="price-inr">From {eurStr}</span>
            ) : (
              <span className="price-on-request">Price on request</span>
            )}
          </div>
          <button
            className="activity-card__cta"
            onClick={e => { e.stopPropagation(); onSelect(activity) }}
            aria-label={`View details for ${activity.activityName}`}
          >
            View
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </article>
  )
}
