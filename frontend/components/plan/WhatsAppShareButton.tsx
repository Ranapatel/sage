'use client'

/**
 * Isolated planner experiment (E2). Shares the plan page with WhatsApp click tracking.
 */
export default function WhatsAppShareButton({ destination }: { destination?: string }) {
  const place = destination?.trim() || 'my trip'
  const url = 'https://www.tripsage.in/plan?utm_source=whatsapp&utm_medium=share'
  const text = `Check out my ${place} plan on TripSage: ${url}`
  const href = `https://wa.me/?text=${encodeURIComponent(text)}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#16A34A] px-4 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-[#15803D]"
    >
      Send to WhatsApp
    </a>
  )
}
