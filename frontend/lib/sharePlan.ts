/**
 * Compact plan payload for the share button.
 * The link opens /plan?trip=... and restores the days. The text lists them too.
 */

export interface SharedStop {
  name: string
  time?: string
  spend?: string
}

export interface SharedDay {
  day: number
  date?: string
  stops: SharedStop[]
}

export interface SharedPlan {
  destination: string
  startDate?: string
  endDate?: string
  days: SharedDay[]
}

function stopsFromDay(day: any): SharedStop[] {
  let places = day?.places
  if (!Array.isArray(places) || places.length === 0) {
    const slots = day?.slots || {}
    places = [slots.morning, slots.afternoon, slots.evening, slots.night].filter(Boolean)
  }
  return (places || [])
    .filter((place: any) => place && place.name)
    .slice(0, 6)
    .map((place: any) => ({
      name: String(place.name).slice(0, 80),
      time: place.time ? String(place.time).slice(0, 16) : undefined,
      spend: place.estimatedSpend
        ? String(place.estimatedSpend).slice(0, 24)
        : (typeof place.estimatedCost === 'number' ? `₹${place.estimatedCost}` : undefined),
    }))
}

export function planFromTrip(input: {
  destination?: string
  startDate?: string
  endDate?: string
  itinerary?: any[]
}): SharedPlan | null {
  const destination = (input.destination || '').trim()
  const days = (input.itinerary || [])
    .slice(0, 14)
    .map((day, index) => ({
      day: Number(day?.day) || index + 1,
      date: day?.date ? String(day.date).slice(0, 10) : undefined,
      stops: stopsFromDay(day),
    }))
    .filter(day => day.stops.length > 0)
  if (!destination || days.length === 0) return null
  return {
    destination: destination.slice(0, 80),
    startDate: input.startDate ? String(input.startDate).slice(0, 10) : undefined,
    endDate: input.endDate ? String(input.endDate).slice(0, 10) : undefined,
    days,
  }
}

function toBase64Url(json: string): string {
  const bytes = new TextEncoder().encode(json)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function fromBase64Url(encoded: string): string {
  const padded = encoded.replace(/-/g, '+').replace(/_/g, '/')
  const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4))
  const binary = atob(padded + pad)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new TextDecoder().decode(bytes)
}

export function encodePlan(plan: SharedPlan): string {
  return toBase64Url(JSON.stringify({
    d: plan.destination,
    s: plan.startDate || '',
    e: plan.endDate || '',
    days: plan.days.map(day => ({
      n: day.day,
      dt: day.date || '',
      p: day.stops.map(stop => [stop.time || '', stop.name, stop.spend || '']),
    })),
  }))
}

export function decodePlan(encoded: string): SharedPlan | null {
  if (!encoded || encoded.length > 6000) return null
  try {
    const raw = JSON.parse(fromBase64Url(encoded))
    const destination = String(raw?.d || '').trim()
    if (!destination || destination.length > 80) return null
    const days = (Array.isArray(raw?.days) ? raw.days : []).slice(0, 14).map((day: any, index: number) => ({
      day: Number(day?.n) || index + 1,
      date: day?.dt ? String(day.dt).slice(0, 10) : undefined,
      stops: (Array.isArray(day?.p) ? day.p : []).slice(0, 6).map((stop: any) => ({
        time: stop?.[0] ? String(stop[0]).slice(0, 16) : undefined,
        name: String(stop?.[1] || '').slice(0, 80),
        spend: stop?.[2] ? String(stop[2]).slice(0, 24) : undefined,
      })).filter((stop: SharedStop) => stop.name),
    })).filter((day: SharedDay) => day.stops.length > 0)
    if (days.length === 0) return null
    return {
      destination,
      startDate: raw?.s ? String(raw.s).slice(0, 10) : undefined,
      endDate: raw?.e ? String(raw.e).slice(0, 10) : undefined,
      days,
    }
  } catch {
    return null
  }
}

export function itineraryFromPlan(plan: SharedPlan) {
  return plan.days.map(day => ({
    day: day.day,
    date: day.date,
    places: day.stops.map(stop => ({
      name: stop.name,
      time: stop.time,
      estimatedSpend: stop.spend,
      category: 'Attraction',
    })),
  }))
}

export function formatPlanText(plan: SharedPlan): string {
  const dates = [plan.startDate, plan.endDate].filter(Boolean).join(' – ')
  const lines = [`${plan.destination}${dates ? ` · ${dates}` : ''}`, '']
  for (const day of plan.days) {
    lines.push(`Day ${day.day}${day.date ? ` (${day.date})` : ''}`)
    for (const stop of day.stops) {
      const time = stop.time ? `${stop.time} ` : ''
      const spend = stop.spend ? ` · ${stop.spend}` : ''
      lines.push(`• ${time}${stop.name}${spend}`)
    }
    lines.push('')
  }
  return lines.join('\n').trim()
}

export function buildSharePayload(plan: SharedPlan, origin = 'https://www.tripsage.in') {
  const encoded = encodePlan(plan)
  const url = `${origin.replace(/\/$/, '')}/plan?trip=${encoded}`
  const body = formatPlanText(plan)
  const title = `TripSage plan · ${plan.destination}`
  if (url.length <= 1800) {
    return { title, text: `${body}\n\nOpen this plan:\n${url}`, url }
  }
  return { title, text: body, url: '' }
}

export function planLooksLikeStarterOutline(itinerary: any[] | undefined): boolean {
  const text = JSON.stringify(itinerary || [])
  return text.includes('Morning exploration & sightseeing at')
    || text.includes('Central Square & Landmark Heritage')
    || text.includes('Local taxi or scenic walking recommended')
}
