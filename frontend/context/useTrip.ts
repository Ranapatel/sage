/**
 * useTrip — returns the active TripContext plus derived helpers.
 */

import { useContext } from './useContext'

export function useTrip() {
  const { context } = useContext()
  const trip = context?.trip ?? null

  return {
    trip,
    durationDays: trip?.durationDays ?? 0,
    travelers: trip?.travelers ?? 1,
    daysUntilStart: trip?.daysUntilStart ?? 0,
    destination: trip?.destination ?? null,
    startDate: trip?.startDate ?? null,
    endDate: trip?.endDate ?? null,
    title: trip?.title ?? null,
    status: trip?.status ?? null,
    isActive: trip !== null && trip.daysUntilStart >= 0,
  }
}

export default useTrip