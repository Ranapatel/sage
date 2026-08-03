import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// ─── Affiliate Booking Links ──────────────────────────────────────────────────
// All links include the destination/dates AND the affiliate/partner ID.
// These open directly to a relevant search page — not a homepage.

function cityName(str: string) {
  return (str || '').split(',')[0].trim()
}

export const affiliateLinks = {


 /** GetYourGuide — activities search with partner ID */
  activity: (destination: string) => {
    const dest = encodeURIComponent(cityName(destination))
    return `https://www.getyourguide.com/s/?q=${dest}&partner_id=Z3ATOYC&cmp=share_to_earn`
  },

 /** Redbus — bus search deep-link */
  bus: (from: string, to: string, date: string) => {
    const f = encodeURIComponent(cityName(from))
    const t = encodeURIComponent(cityName(to))
    // Redbus expects date in format DD-Mon-YYYY e.g. 01-May-2026
    let doj = ''
    if (date) {
      const d = new Date(date)
      if (!isNaN(d.getTime())) {
        doj = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')
      }
    }
    return doj
      ? `https://www.redbus.in/search?fromCityName=${f}&toCityName=${t}&doj=${encodeURIComponent(doj)}`
      : `https://www.redbus.in/`
  },

 /** Rental cars — User's specific affiliate link */
  car: (destination?: string) => {
    return `https://naiawork.com/g/wqjhitsyjqbd777ee50d5ea594bb46/`
  },

 /**️ Restaurants — Google Maps Search for restaurants */
  restaurant: (destination: string) => {
    const dest = encodeURIComponent(cityName(destination))
    return `https://www.google.com/maps/search/?api=1&query=restaurants+in+${dest}`
  },
}

// ─── Utility Helpers ──────────────────────────────────────────────────────────

export function calculateScore(affordability: number, rating: number, relevance: number): number {
  return (0.4 * affordability) + (0.3 * rating) + (0.3 * relevance)
}

export function formatCurrency(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export function renderStars(rating: number): string {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5 ? 1 : 0
 return ''.repeat(full) + (half ? '½' : '') + ''.repeat(5 - full - half)
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'short', month: 'short', day: 'numeric'
  })
}

export function getDaysBetween(start: string, end: string): number {
  const s = new Date(start)
  const e = new Date(end)
  return Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24))
}

/**
 * Single source of truth for the number of itinerary days in a trip.
 *
 * Returns the *inclusive* day count for a date range — i.e. a trip from
 * 4 Aug → 10 Aug is 7 days (Day 1, Day 2, …, Day 7), not 6.
 *
 * This is the ONLY function the rest of the app should use when it
 * needs to know "how many days is this trip?". It guarantees:
 *   - startDate is a valid date and ≤ endDate
 *   - same-day trips still return at least 1
 *   - dates are parsed in *local* time (avoids UTC off-by-one)
 *   - the result is always ≥ 1 and is an integer
 */
export function getDayCount(startDate?: string | null, endDate?: string | null): number {
  if (!startDate || !endDate) return 0
  const s = new Date(startDate)
  const e = new Date(endDate)
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return 0
  if (e.getTime() < s.getTime()) return 0
  // Inclusive day diff: 4 Aug → 4 Aug = 1 day, 4 Aug → 10 Aug = 7 days
  const MS_PER_DAY = 1000 * 60 * 60 * 24
  const diff = Math.round((e.getTime() - s.getTime()) / MS_PER_DAY) + 1
  return Math.max(1, diff)
}

/**
 * Returns the calendar date (YYYY-MM-DD) for the Nth day of the trip,
 * given the trip's start date. Day 1 = startDate, Day 2 = startDate + 1, etc.
 * Returns null when the inputs are invalid.
 */
export function getDateForDay(startDate: string | null | undefined, dayNumber: number): string | null {
  if (!startDate || !dayNumber || dayNumber < 1) return null
  const s = new Date(startDate)
  if (isNaN(s.getTime())) return null
  const d = new Date(s.getTime())
  d.setDate(d.getDate() + (dayNumber - 1))
  // Use local-time formatting to avoid UTC off-by-one
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
