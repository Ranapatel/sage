/**
 * TripSage — Geoapify Geocoding Service (Phase 2 compliance)
 *
 * Implements geocodePlace() mapping for itinerary items.
 */

import { GeocodingService } from './geocoding.service'

export class GeoapifyGeocodingService {
  /**
   * Geocode a place name with optional city and country context.
   *
   * @param placeName - The name of the attraction/place (e.g., "Eiffel Tower")
   * @param city - Optional city context (e.g., "Paris")
   * @param country - Optional country context (e.g., "France")
   * @returns Normalized coordinate and address payload
   */
  static async geocodePlace(
    placeName: string,
    city?: string,
    country?: string
  ): Promise<{
    name: string
    latitude: number
    longitude: number
    formatted_address: string
    placeId: string
  }> {
    // Collate query terms to ensure maximum accuracy
    const queryParts = [placeName]
    if (city) queryParts.push(city)
    if (country) queryParts.push(country)

    const query = queryParts.join(', ')

    // Delegate to the robust caching geocoder from Phase 1
    const result = await GeocodingService.geocodeDestination(query)

    return {
      name: placeName,
      latitude: result.latitude,
      longitude: result.longitude,
      formatted_address: result.formattedAddress,
      placeId: result.placeId || '',
    }
  }
}
