import { prisma } from '../prisma/prisma.client'

export class LocationService {
  // ── User Location ──────────────────────────────────────────────────────────

  /**
   * Saves a new location entry for the user.
   */
  static async saveUserLocation(userId: string, latitude: number, longitude: number) {
    return prisma.userLocation.create({
      data: {
        userId,
        latitude,
        longitude,
      },
    })
  }

  /**
   * Fetches the user's most recent location.
   */
  static async getUserLocation(userId: string) {
    return prisma.userLocation.findFirst({
      where: { userId },
      orderBy: { timestamp: 'desc' },
    })
  }

  // ── Map Preference ─────────────────────────────────────────────────────────

  /**
   * Upserts the user's map viewing preferences.
   */
  static async saveMapPreference(
    userId: string,
    layers: string[],
    transportMode: string,
    travelStyle: string
  ) {
    return prisma.mapPreference.upsert({
      where: { userId },
      create: {
        userId,
        layers,
        transportMode,
        travelStyle,
      },
      update: {
        layers,
        transportMode,
        travelStyle,
      },
    })
  }

  /**
   * Retrieves the map preferences for a user.
   */
  static async getMapPreference(userId: string) {
    return prisma.mapPreference.findUnique({
      where: { userId },
    })
  }

  // ── Place Visit Status ──────────────────────────────────────────────────────

  /**
   * Upserts the status of a specific place in the travel itinerary.
   */
  static async savePlaceVisitStatus(tripId: string, placeId: string, status: string) {
    return prisma.placeVisitStatus.upsert({
      where: {
        tripId_placeId: {
          tripId,
          placeId,
        },
      },
      create: {
        tripId,
        placeId,
        status,
      },
      update: {
        status,
      },
    })
  }

  /**
   * Retrieves all visit statuses for places in a given trip.
   */
  static async getPlaceVisitStatuses(tripId: string) {
    return prisma.placeVisitStatus.findMany({
      where: { tripId },
    })
  }
}
