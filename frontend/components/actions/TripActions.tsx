'use client'

import { useState } from 'react'
import { useTripStore } from '@/store/tripStore'
import { useAuthStore } from '@/store/authStore'
import { formatPrice } from '@/lib/currency'
import toast from 'react-hot-toast'

export default function TripActions() {
  const { tripContext, transport, hotels, itinerary, bookingStatus, userProfile } = useTripStore()
  const { user } = useAuthStore()
  const [sharing, setSharing] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const currency = user?.currency ?? 'INR'

  // ── SHARE ────────────────────────────────────────────────────────────────────
  const handleShare = async () => {
    setSharing(true)
    const tripId = tripContext.destination
      ? encodeURIComponent(tripContext.destination.toLowerCase().replace(/\s+/g, '-'))
      : 'my-trip'

    const shareUrl = `${window.location.origin}/trip/${tripId}`
    const shareData = {
      title: `TripSage — ${tripContext.destination || 'My Trip'}`,
      text: `Check out my AI-planned trip to ${tripContext.destination}! ✈️`,
      url: shareUrl,
    }

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData)
        toast.success('Trip shared! 🔗')
      } else {
        await navigator.clipboard.writeText(shareUrl)
        toast.success('Link copied to clipboard! 📋')
      }
    } catch {
      await navigator.clipboard.writeText(shareUrl).catch(() => {})
      toast.success('Link copied! 📋')
    } finally {
      setSharing(false)
    }
  }

  // ── DOWNLOAD PDF ─────────────────────────────────────────────────────────────
  const handleDownload = () => {
    setDownloading(true)

    const bookedFlight = bookingStatus.selectedFlight
    const bookedHotel = bookingStatus.selectedHotel
    const destination = tripContext.destination || 'Your Trip'
    const dates = [tripContext.startDate, tripContext.endDate].filter(Boolean).join(' → ')

    const styles = `
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #111; padding: 40px; max-width: 800px; margin: 0 auto; }
        h1 { color: #00c27c; border-bottom: 3px solid #00c27c; padding-bottom: 12px; }
        h2 { color: #333; margin-top: 32px; border-left: 4px solid #00c27c; padding-left: 12px; }
        .meta { background: #f4f9f7; border-radius: 8px; padding: 16px; margin: 16px 0; }
        .meta p { margin: 4px 0; font-size: 14px; }
        .day { background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 16px; margin: 12px 0; }
        .day h3 { color: #00c27c; margin: 0 0 12px; }
        .place { display: flex; gap: 12px; padding: 8px 0; border-bottom: 1px solid #eee; font-size: 13px; }
        .time { font-weight: bold; min-width: 50px; color: #555; font-family: monospace; }
        .booking-box { background: #e8f8f2; border: 1px solid #00c27c; border-radius: 8px; padding: 16px; margin: 8px 0; }
        .badge { display: inline-block; background: #00c27c; color: white; border-radius: 20px; padding: 2px 10px; font-size: 12px; }
        footer { margin-top: 40px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 20px; }
      </style>
    `

    const flightSection = bookedFlight ? `
      <div class="booking-box">
        <span class="badge">✈️ FLIGHT BOOKED</span>
        <p><strong>${bookedFlight.name}</strong></p>
        <p>🕐 ${bookedFlight.departure} → ${bookedFlight.arrival} &nbsp;|&nbsp; ⏱ ${bookedFlight.duration}</p>
        <p>💰 ${formatPrice(bookedFlight.price, currency)} per person</p>
      </div>` : '<p style="color:#888">No flight booked</p>'

    const hotelSection = bookedHotel ? `
      <div class="booking-box">
        <span class="badge">🏨 HOTEL BOOKED</span>
        <p><strong>${bookedHotel.name}</strong></p>
        <p>📍 ${bookedHotel.location} &nbsp;|&nbsp; ⭐ ${bookedHotel.rating}/5</p>
        <p>💰 ${formatPrice(bookedHotel.price, currency)}/night</p>
      </div>` : '<p style="color:#888">No hotel booked</p>'

    const itinerarySection = itinerary.map(day => `
      <div class="day">
        <h3>Day ${day.day}${day.date ? ` — ${day.date}` : ''}</h3>
        ${day.places.map((p: any) => `
          <div class="place">
            <span class="time">${p.time}</span>
            <div>
              <strong>${p.name}</strong><br/>
              <span style="color:#666;font-size:12px">${p.category} · ${p.description || ''}</span>
            </div>
          </div>`).join('')}
      </div>`).join('')

    const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>TripSage — ${destination}</title>${styles}</head>
<body>
  <h1>✈️ TripSage AI Travel Plan</h1>
  <div class="meta">
    <p><strong>Destination:</strong> ${destination}</p>
    ${dates ? `<p><strong>Dates:</strong> ${dates}</p>` : ''}
    ${userProfile?.members ? `<p><strong>Travelers:</strong> ${userProfile.members}</p>` : ''}
    ${userProfile?.travelStyle ? `<p><strong>Style:</strong> ${userProfile.travelStyle}</p>` : ''}
    <p><strong>Currency:</strong> ${currency}</p>
    <p><strong>Generated:</strong> ${new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
  </div>

  <h2>✈️ Flight</h2>
  ${flightSection}

  <h2>🏨 Hotel</h2>
  ${hotelSection}

  ${itinerary.length > 0 ? `<h2>📅 Day-by-Day Itinerary</h2>${itinerarySection}` : ''}

  <footer>
    Generated by TripSage AI Travel OS · ${window.location.origin}
  </footer>
</body>
</html>`

    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const win = window.open(url, '_blank')

    if (win) {
      win.onload = () => {
        win.print()
        setTimeout(() => URL.revokeObjectURL(url), 3000)
      }
    } else {
      // Fallback: direct download
      const a = document.createElement('a')
      a.href = url
      a.download = `TripSage-${destination.replace(/\s+/g, '-')}-${Date.now()}.html`
      a.click()
      URL.revokeObjectURL(url)
    }

    toast.success('📄 Opening PDF preview — use Print → Save as PDF')
    setDownloading(false)
  }

  return (
    <div className="flex items-center gap-2">
      {/* Download */}
      <button
        onClick={handleDownload}
        disabled={downloading || itinerary.length === 0}
        title={itinerary.length === 0 ? 'Generate an itinerary first' : 'Download trip as PDF'}
        className="flex items-center gap-2 px-3 py-2 rounded-lg glass border border-[var(--border)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {downloading ? (
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : '📥'}
        <span className="hidden sm:block">Download</span>
      </button>

      {/* Share */}
      <button
        onClick={handleShare}
        disabled={sharing || !tripContext.destination}
        title={!tripContext.destination ? 'Search a trip first' : 'Share your trip'}
        className="flex items-center gap-2 px-3 py-2 rounded-lg glass border border-[var(--border)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {sharing ? (
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : '🔗'}
        <span className="hidden sm:block">Share</span>
      </button>
    </div>
  )
}
