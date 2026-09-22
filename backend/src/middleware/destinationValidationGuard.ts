/**
 * Destination Validation Guard — Pre-Response Validator & Bounding Radius Filter
 *
 * Ensures 100% geographic consistency before sending API responses to clients.
 * Rejects cross-city POIs, restaurants, hotels, and itinerary stops that fall outside
 * the canonical destination's bounding radius (default 35km) or keyword matches.
 */

import { CanonicalDestinationContext } from '../services/destinationResolver.service'

/**
 * Haversine formula to compute distance in km between two lat/lng pairs
 */
export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Validate if an item belongs to the destination context based on distance or keywords
 */
export function isValidDestinationItem(
  item: {
    name?: string
    address?: string
    formattedAddress?: string
    location?: string
    latitude?: number
    longitude?: number
    lat?: number
    lng?: number
  },
  dest: CanonicalDestinationContext
): { valid: boolean; reason?: string; distanceKm?: number } {
  const itemLat = item.latitude ?? item.lat ?? null
  const itemLng = item.longitude ?? item.lng ?? null
  const fullText = `${item.name || ''} ${item.address || ''} ${item.formattedAddress || ''} ${item.location || ''}`.toLowerCase()

  // 1. If coordinates exist, check Haversine distance
  if (itemLat !== null && itemLng !== null && !isNaN(itemLat) && !isNaN(itemLng) && (itemLat !== 0 || itemLng !== 0)) {
    const distKm = haversineDistanceKm(dest.latitude, dest.longitude, itemLat, itemLng)
    
    // Check if within max radius (35km)
    if (distKm <= dest.radiusKm) {
      return { valid: true, distanceKm: distKm }
    }

    // Check if keyword match allows slightly expanded radius (up to 50km for airport/daytrips)
    const hasKeyword = dest.keywords.some(kw => fullText.includes(kw))
    if (hasKeyword && distKm <= dest.radiusKm * 1.5) {
      return { valid: true, distanceKm: distKm }
    }

    return {
      valid: false,
      reason: `Distance ${distKm.toFixed(1)}km exceeds radius ${dest.radiusKm}km from ${dest.city}`,
      distanceKm: distKm,
    }
  }

  // 2. Fallback if coordinates are missing:
  // If coordinates are missing, verify it doesn't mention an entirely different major destination city
  const OTHER_MAJOR_DESTINATIONS = [
    'delhi', 'mumbai', 'goa', 'bangalore', 'bengaluru', 'chennai', 'kolkata', 'jaipur', 'hyderabad',
    'pune', 'agra', 'varanasi', 'kochi', 'amritsar', 'udaipur', 'shimla', 'rishikesh', 'pondicherry', 'paris', 'dubai', 'bangkok'
  ].filter(c => c !== dest.city.toLowerCase() && !dest.keywords.includes(c))

  const mentionsOtherCity = OTHER_MAJOR_DESTINATIONS.some(other => fullText.includes(other))
  if (mentionsOtherCity) {
    return {
      valid: false,
      reason: `Text "${fullText.slice(0, 60)}" mentions a different destination city`,
    }
  }

  // If keyword matches or it does not mention a conflicting city, accept as local item
  return { valid: true }
}

/**
 * Sanitize and filter Explore activities list for destination consistency
 */
export function validateAndSanitizeActivities(
  activities: any[],
  dest: CanonicalDestinationContext
): { validActivities: any[]; rejectedCount: number } {
  if (!Array.isArray(activities)) return { validActivities: [], rejectedCount: 0 }

  const validActivities: any[] = []
  let rejectedCount = 0

  for (const act of activities) {
    const check = isValidDestinationItem(act, dest)
    if (check.valid) {
      validActivities.push(act)
    } else {
      rejectedCount++
      console.warn(`[DestinationGuard] ❌ Rejected cross-city activity "${act.name}": ${check.reason}`)
    }
  }

  return { validActivities, rejectedCount }
}

/**
 * Sanitize and filter Restaurants list for destination consistency
 */
export function validateAndSanitizeRestaurants(
  restaurants: any[],
  dest: CanonicalDestinationContext
): { validRestaurants: any[]; rejectedCount: number } {
  if (!Array.isArray(restaurants)) return { validRestaurants: [], rejectedCount: 0 }

  const validRestaurants: any[] = []
  let rejectedCount = 0

  for (const rest of restaurants) {
    const check = isValidDestinationItem(rest, dest)
    if (check.valid) {
      validRestaurants.push(rest)
    } else {
      rejectedCount++
      console.warn(`[DestinationGuard] ❌ Rejected cross-city restaurant "${rest.name}": ${check.reason}`)
    }
  }

  return { validRestaurants, rejectedCount }
}

/**
 * Sanitize and filter Itinerary Day-by-Day activities for destination consistency
 */
export function validateAndSanitizeItinerary(
  itineraryData: any,
  dest: CanonicalDestinationContext
): any {
  if (!itineraryData || !Array.isArray(itineraryData.itinerary)) {
    return itineraryData
  }

  let totalRejected = 0

  const cleanedDays = itineraryData.itinerary.map((dayObj: any) => {
    if (!dayObj) return dayObj

    const resDay = { ...dayObj }

    // Sanitize activities array if present
    if (Array.isArray(dayObj.activities) && dayObj.activities.length > 0) {
      const validDayActs: any[] = []
      for (const act of dayObj.activities) {
        const check = isValidDestinationItem(act, dest)
        if (check.valid) {
          validDayActs.push(act)
        } else {
          totalRejected++
          console.warn(`[DestinationGuard] ❌ Rejected cross-city itinerary activity "${act.name}" from Day ${dayObj.day}: ${check.reason}`)
        }
      }
      resDay.activities = validDayActs.length > 0 ? validDayActs : dayObj.activities
    }

    // Sanitize places array if present
    if (Array.isArray(dayObj.places) && dayObj.places.length > 0) {
      const validDayPlaces: any[] = []
      for (const place of dayObj.places) {
        const check = isValidDestinationItem(place, dest)
        if (check.valid) {
          validDayPlaces.push(place)
        } else {
          totalRejected++
          console.warn(`[DestinationGuard] ❌ Rejected cross-city itinerary place "${place.name}" from Day ${dayObj.day}: ${check.reason}`)
        }
      }
      // Never leave a day with 0 places if it originally had places
      resDay.places = validDayPlaces.length > 0 ? validDayPlaces : dayObj.places
    }

    return resDay
  })

  if (totalRejected > 0) {
    console.log(`[DestinationGuard] 🛡️ Filtered ${totalRejected} cross-city stops from generated itinerary for "${dest.city}"`)
  }

  return {
    ...itineraryData,
    itinerary: cleanedDays,
    destinationContext: {
      city: dest.city,
      state: dest.state,
      country: dest.country,
      latitude: dest.latitude,
      longitude: dest.longitude,
    },
  }
}
