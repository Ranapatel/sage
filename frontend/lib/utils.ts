// ─── Affiliate Booking Links ──────────────────────────────────────────────────
// All links include the destination/dates AND the affiliate/partner ID.
// These open directly to a relevant search page — not a homepage.

function cityName(str: string) {
  return (str || '').split(',')[0].trim()
}

export const affiliateLinks = {

  /** ✈️ Skyscanner — flight search deep-link */
  flight: (from: string, to: string, date: string) => {
    const f = encodeURIComponent(cityName(from).replace(/\s+/g, '-').toLowerCase())
    const t = encodeURIComponent(cityName(to).replace(/\s+/g, '-').toLowerCase())
    const d = (date || '').replace(/-/g, '')
    const base = d
      ? `https://www.skyscanner.net/transport/flights/${f}/${t}/${d}/`
      : `https://www.skyscanner.net/transport/flights/${f}/${t}/`
    return `${base}?adults=1&cabinclass=economy&ref=home&rtn=0`
  },

  /** 🏨 Agoda — hotel search deep-link with affiliate ID */
  hotel: (destination: string, checkin: string, checkout: string, members = 2) => {
    const dest = encodeURIComponent(cityName(destination))
    let url = `https://www.agoda.com/search?city=${dest}&adults=${members}&rooms=1&cid=1962536`
    if (checkin) url += `&checkIn=${checkin}`
    if (checkout) url += `&checkOut=${checkout}`
    return url
  },

  /** ⚡ GetYourGuide — activities search with partner ID */
  activity: (destination: string) => {
    const dest = encodeURIComponent(cityName(destination))
    return `https://www.getyourguide.com/s/?q=${dest}&partner_id=Z3ATOYC&cmp=share_to_earn`
  },

  /** 🚌 Redbus — bus search deep-link */
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

  /** 🚗 Rental cars — User's specific affiliate link */
  car: (destination?: string) => {
    return `https://naiawork.com/g/wqjhitsyjqbd777ee50d5ea594bb46/`
  },

  /** 🍽️ Restaurants — Google Maps Search for restaurants */
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
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - half)
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
