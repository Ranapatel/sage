/**
 * Google Places Service — Barrel Export
 *
 * Single import point for the entire module:
 *   import { searchPlaces, getPlaceDetails, nearbySearch, getPlacePhotos } from './googlePlaces'
 */

export { searchPlaces } from './searchPlaces'
export { getPlaceDetails } from './placeDetails'
export { nearbySearch } from './nearbySearch'
export { getPlacePhotos } from './placePhotos'
export { HybridItineraryService } from './hybridItinerary.service'

// Re-export types so consumers don't need to dig into types.ts
export type {
  TripSagePlace,
  TripSagePlaceDetails,
  TripSagePlaceReview,
  TripSagePlacePhoto,
  PlaceCategory,
  SearchPlacesParams,
  NearbySearchParams,
  PlaceDetailsParams,
  PlacePhotosParams,
} from './types'
