// ─── Booking Link Builder ────────────────────────────────────────────────────
// Constructs MakeMyTrip deep-link URLs for train and bus booking.
// Reuses the same URL patterns as the existing TrainUrlBuilder and MMTBusProvider.

import { JourneyPlan, TransportLeg } from './types';

/**
 * Build a MakeMyTrip train search URL from station codes.
 * Pattern: https://www.makemytrip.com/railways/listing.html?from=CSTM&to=MAO&departDate=2026-07-25&pax=1&class=3A
 */
export function buildTrainBookingUrl(
  originCode: string,
  destCode: string,
  date: string,
  passengers: number = 1,
  trainClass: string = '3A',
): string {
  const base = 'https://www.makemytrip.com/railways/listing.html';
  const params = new URLSearchParams({
    from: originCode,
    to: destCode,
    departDate: date,
    pax: String(passengers),
    class: trainClass,
  });
  return `${base}?${params.toString()}`;
}

/**
 * Build a MakeMyTrip bus search URL from city slugs.
 * Pattern: https://www.makemytrip.com/bus-tickets/hyderabad-to-goa/?dd=25&mm=07&yy=2026
 */
export function buildBusBookingUrl(
  originSlug: string,
  destSlug: string,
  date: string,
): string {
  const from = originSlug.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const to = destSlug.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const dateParts = date.split('-');
  if (dateParts.length !== 3) {
    return `https://www.makemytrip.com/bus-tickets/`;
  }
  const [year, month, day] = dateParts;
  return `https://www.makemytrip.com/bus-tickets/${from}-to-${to}/?dd=${day}&mm=${month}&yy=${year}`;
}

/**
 * Build a generic MakeMyTrip homepage URL as fallback.
 */
export function buildFallbackUrl(): string {
  return 'https://www.makemytrip.com/';
}

/**
 * Pick the primary leg of a journey (the longest or most expensive) and
 * build a single MakeMyTrip booking URL for it.
 *
 * Per user requirement: "not each give link for every buses or train
 * just at button book with makemytrip" — one CTA per journey.
 */
export function buildJourneyBookingUrl(journey: JourneyPlan, date: string, passengers: number = 1): string {
  if (journey.legs.length === 0) return buildFallbackUrl();

  // If direct (single leg), use that leg's booking URL
  if (journey.legs.length === 1) {
    return journey.legs[0].bookingUrl || buildFallbackUrl();
  }

  // For multi-leg journeys, pick the primary (longest duration) leg
  let primaryLeg: TransportLeg = journey.legs[0];
  let maxDuration = 0;

  for (const leg of journey.legs) {
    const dur = parseDurationMinutes(leg.duration);
    if (dur > maxDuration) {
      maxDuration = dur;
      primaryLeg = leg;
    }
  }

  // Return the primary leg's booking URL
  if (primaryLeg.bookingUrl) return primaryLeg.bookingUrl;

  // Build from metadata if available
  if (primaryLeg.mode === 'train') {
    const originCode = extractStationCode(primaryLeg.origin);
    const destCode = extractStationCode(primaryLeg.destination);
    return buildTrainBookingUrl(originCode, destCode, date, passengers);
  }

  if (primaryLeg.mode === 'bus') {
    return buildBusBookingUrl(
      primaryLeg.origin,
      primaryLeg.destination,
      date,
    );
  }

  return buildFallbackUrl();
}

/**
 * Parse "8h 15m" → 495 (minutes)
 */
function parseDurationMinutes(duration: string): number {
  if (!duration) return 0;
  const hMatch = duration.match(/(\d+)\s*h/i);
  const mMatch = duration.match(/(\d+)\s*m/i);
  return (hMatch ? parseInt(hMatch[1], 10) * 60 : 0) + (mMatch ? parseInt(mMatch[1], 10) : 0);
}

/**
 * Extract a station code from a label like "Hubballi (UBL)" → "UBL"
 */
function extractStationCode(label: string): string {
  const match = label.match(/\(([A-Z]{2,5})\)/);
  return match ? match[1] : label.toUpperCase().slice(0, 4);
}
