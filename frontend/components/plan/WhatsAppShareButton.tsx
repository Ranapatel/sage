'use client'

import { analytics } from '@/lib/analytics'
import { buildSharePayload, planFromTrip } from '@/lib/sharePlan'

/**
 * Shares the generated days on WhatsApp, not the bare homepage.
 */
export default function WhatsAppShareButton({
  destination,
  startDate,
  endDate,
  itinerary,
}: {
  destination?: string
  startDate?: string
  endDate?: string
  itinerary?: any[]
}) {
  const plan = planFromTrip({ destination, startDate, endDate, itinerary })
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.tripsage.in'
  const payload = plan
    ? buildSharePayload(plan, origin)
    : { title: 'TripSage', text: 'Plan a trip on TripSage', url: `${origin}/plan` }
  const href = `https://wa.me/?text=${encodeURIComponent(payload.text)}`

  return (
    <a
      href={plan ? href : undefined}
      aria-disabled={plan ? undefined : true}
      onClick={(event) => {
        if (!plan) {
          event.preventDefault()
          return
        }
        analytics.tripShared({ method: 'whatsapp', trip_days: plan.days.length })
      }}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#16A34A] px-4 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-[#15803D] aria-disabled:opacity-50"
    >
      Send to WhatsApp
    </a>
  )
}
