/**
 * Explore Service — Google Places API (New) Exploration Module
 *
 * Implements Text Search, Nearby Search, Place Details, Place Photos,
 * filtering, sorting, and geocoded destination queries.
 */

import { googleRequest, buildPhotoUrl } from './googleClient'
import { TripSagePlaceReview, TripSagePlacePhoto } from './types'
import { ImageService } from '../imageService'
import { getCategoryFallbackImage, getCategoryFallbackGallery } from '../../data/cuisineFallbacks'

const { generatePlaceDescription } = require('./aiDescriptionService')

// ── Google Place Types Mapping ──────────────────────────────────────────────

const GOOGLE_TYPES_MAP: Record<string, string[]> = {
  adventure: ['amusement_park', 'hiking_area', 'national_park', 'campground'],
  culture: ['art_gallery', 'museum', 'performing_arts_theater', 'cultural_center'],
  food: ['restaurant', 'cafe', 'bar', 'food'],
  nature: ['park', 'hiking_area', 'national_park', 'natural_feature'],
  water: ['aquarium', 'natural_feature'],
  nightlife: ['night_club', 'bar', 'pub'],
  shopping: ['shopping_mall', 'department_store', 'market'],
  museums: ['museum', 'art_gallery'],
  temples: ['hindu_temple', 'church', 'mosque', 'synagogue', 'place_of_worship'],
  parks: ['park', 'national_park', 'amusement_park'],
  historic: ['historical_landmark'],
  'tourist attractions': ['tourist_attraction', 'landmark']
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function parsePriceLevel(level: string | undefined): number | null {
  if (!level) return null
  const map: Record<string, number> = {
    PRICE_LEVEL_FREE: 0,
    PRICE_LEVEL_INEXPENSIVE: 1,
    PRICE_LEVEL_MODERATE: 2,
    PRICE_LEVEL_EXPENSIVE: 3,
    PRICE_LEVEL_VERY_EXPENSIVE: 4,
  }
  return map[level] ?? null
}

const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.location',
  'places.rating',
  'places.userRatingCount',
  'places.priceLevel',
  'places.primaryType',
  'places.types',
  'places.photos',
  'places.currentOpeningHours',
  'places.googleMapsUri',
  'places.editorialSummary'
].join(',')

// ── Interfaces ───────────────────────────────────────────────────────────────

export interface ExploreSearchParams {
  category?: string
  rating?: number
  price?: number
  openNow?: boolean
  sortBy?: 'distance' | 'popularity'
  page?: number
  limit?: number
}

// ── Activities Search ────────────────────────────────────────────────────────

export async function searchActivities(
  destination: string,
  coords: { latitude: number; longitude: number } | null,
  params: ExploreSearchParams = {}
): Promise<{ activities: any[]; total: number }> {
  const category = params.category || 'Tourist Attractions'
  const minRating = params.rating ?? 0
  const maxPrice = params.price ?? 4
  const openNowOnly = params.openNow ?? false
  const sortBy = params.sortBy || 'popularity'
  const page = params.page ?? 1
  const limit = params.limit ?? 20

  const queryTypes = GOOGLE_TYPES_MAP[category.toLowerCase()] || []
  const textQuery = `${category} in ${destination}`

  const requestBody: Record<string, any> = {
    textQuery,
    maxResultCount: 20,
    languageCode: 'en',
  }

  if (coords) {
    requestBody.locationBias = {
      circle: {
        center: { latitude: coords.latitude, longitude: coords.longitude },
        radius: 20000.0
      }
    }
  }

  if (queryTypes.length > 0) {
    requestBody.includedType = queryTypes[0]
  }

  const data = await googleRequest<any>({
    path: '/places:searchText',
    body: requestBody,
    fieldMask: FIELD_MASK,
    cachePrefix: `gp_explore_acts_${category}`,
    cacheTtl: 3600,
  })

  let places = data?.places || []

  // Post-filtering & normalization — each place gets its own unique photo
  const normalizedPromises = places.map(async (p: any) => {
    const photos = p.photos || []
    const priceVal = parsePriceLevel(p.priceLevel)
    const ratingVal = p.rating ?? null
    const reviewCount = p.userRatingCount ?? null
    const isOpen = p.currentOpeningHours?.openNow ?? null

    const dist = coords && p.location
      ? haversineDistance(coords.latitude, coords.longitude, p.location.latitude, p.location.longitude)
      : null

    // Fetch unique image if Google returns no photos
    const name = p.displayName?.text || ''
    const heroPhoto = photos[0]?.name
    let heroImage = ''
    let galleryImages: string[] = []
    let photoCount = photos.length

    if (heroPhoto) {
      heroImage = buildPhotoUrl(heroPhoto, 800)
      galleryImages = photos.slice(0, 5).map((img: any) => buildPhotoUrl(img.name, 800))
    } else {
      const resolved = await ImageService.resolvePlaceImages({
        placeId: p.id,
        placeName: name,
        city: destination,
        category: category
      })
      heroImage = resolved.imageUrl
      galleryImages = resolved.gallery
      photoCount = resolved.gallery.length
    }
    const thumbnail = heroPhoto ? buildPhotoUrl(heroPhoto, 400) : heroImage

    return {
      id: p.id || '',
      name,
      category,
      primaryType: p.primaryType || null,
      rating: ratingVal,
      userRatingsTotal: reviewCount,
      address: p.formattedAddress || '',
      description: p.editorialSummary?.text || null,
      isOpenNow: isOpen,
      googleMapsUrl: p.googleMapsUri || '',
      latitude: p.location?.latitude ?? 0,
      longitude: p.location?.longitude ?? 0,
      heroImage,
      thumbnail,
      galleryImages,
      photoCount,
      priceLevel: priceVal,
      distance: dist,
      source: 'google_places'
    }
  })

  let normalized = await Promise.all(normalizedPromises)

  // Apply filters
  normalized = normalized.filter((item: any) => {
    if (item.rating !== null && item.rating < minRating) return false
    if (item.priceLevel !== null && item.priceLevel > maxPrice) return false
    if (openNowOnly && item.isOpenNow === false) return false
    return true
  })

  // Apply sorting
  if (sortBy === 'distance' && coords) {
    normalized.sort((a: any, b: any) => (a.distance ?? 9999) - (b.distance ?? 9999))
  } else {
    normalized.sort((a: any, b: any) => {
      const aScore = (a.rating ?? 0) * Math.log10((a.userRatingsTotal ?? 0) + 1)
      const bScore = (b.rating ?? 0) * Math.log10((b.userRatingsTotal ?? 0) + 1)
      return bScore - aScore
    })
  }

  const startIndex = (page - 1) * limit
  const paginated = normalized.slice(startIndex, startIndex + limit)

  return {
    activities: paginated,
    total: normalized.length
  }
}

// ── Restaurants Search ────────────────────────────────────────────────────────

export async function searchRestaurants(
  destination: string,
  coords: { latitude: number; longitude: number } | null,
  params: ExploreSearchParams = {}
): Promise<{ restaurants: any[]; total: number }> {
  const minRating = params.rating ?? 0
  const maxPrice = params.price ?? 4
  const openNowOnly = params.openNow ?? false
  const sortBy = params.sortBy || 'popularity'
  const page = params.page ?? 1
  const limit = params.limit ?? 20

  const textQuery = `restaurants in ${destination}`

  const requestBody: Record<string, any> = {
    textQuery,
    maxResultCount: 20,
    languageCode: 'en',
  }

  if (coords) {
    requestBody.locationBias = {
      circle: {
        center: { latitude: coords.latitude, longitude: coords.longitude },
        radius: 15000.0
      }
    }
  }

  requestBody.includedType = 'restaurant'

  const data = await googleRequest<any>({
    path: '/places:searchText',
    body: requestBody,
    fieldMask: FIELD_MASK,
    cachePrefix: 'gp_explore_rests',
    cacheTtl: 3600,
  })

  let places = data?.places || []

  const normalizedPromises = places.map(async (p: any) => {
    const photos = p.photos || []
    const priceVal = parsePriceLevel(p.priceLevel)
    const ratingVal = p.rating ?? null
    const reviewCount = p.userRatingCount ?? null
    const isOpen = p.currentOpeningHours?.openNow ?? null

    const types = p.types || []
    let cuisine = 'Restaurant'
    const exclude = ['restaurant', 'food', 'point_of_interest', 'establishment']
    const cuisineType = types.find((t: string) => !exclude.includes(t))
    if (cuisineType) {
      cuisine = cuisineType.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
    }

    const dist = coords && p.location
      ? haversineDistance(coords.latitude, coords.longitude, p.location.latitude, p.location.longitude)
      : null

    const name = p.displayName?.text || ''
    const heroPhoto = photos[0]?.name
    let heroImage = ''
    let galleryImages: string[] = []
    let photoCount = photos.length

    if (heroPhoto) {
      heroImage = buildPhotoUrl(heroPhoto, 800)
      galleryImages = photos.slice(0, 5).map((img: any) => buildPhotoUrl(img.name, 800))
    } else {
      heroImage = getCategoryFallbackImage(cuisine, name, p.id)
      galleryImages = getCategoryFallbackGallery(cuisine, name, p.id)
      photoCount = galleryImages.length
    }
    const thumbnail = heroPhoto ? buildPhotoUrl(heroPhoto, 400) : heroImage

    return {
      id: p.id || '',
      name,
      cuisine,
      category: 'dining',
      primaryType: p.primaryType || 'restaurant',
      rating: ratingVal,
      userRatingsTotal: reviewCount,
      priceLevel: priceVal,
      isOpenNow: isOpen,
      address: p.formattedAddress || '',
      description: p.editorialSummary?.text || null,
      googleMapsUrl: p.googleMapsUri || '',
      latitude: p.location?.latitude ?? 0,
      longitude: p.location?.longitude ?? 0,
      heroImage,
      thumbnail,
      galleryImages,
      photoCount,
      distance: dist,
      source: 'google_places'
    }
  })

  let normalized = await Promise.all(normalizedPromises)

  normalized = normalized.filter((item: any) => {
    if (item.rating !== null && item.rating < minRating) return false
    if (item.priceLevel !== null && item.priceLevel > maxPrice) return false
    if (openNowOnly && item.isOpenNow === false) return false
    return true
  })

  if (sortBy === 'distance' && coords) {
    normalized.sort((a: any, b: any) => (a.distance ?? 9999) - (b.distance ?? 9999))
  } else {
    normalized.sort((a: any, b: any) => {
      const aScore = (a.rating ?? 0) * Math.log10((a.userRatingsTotal ?? 0) + 1)
      const bScore = (b.rating ?? 0) * Math.log10((b.userRatingsTotal ?? 0) + 1)
      return bScore - aScore
    })
  }

  const startIndex = (page - 1) * limit
  const paginated = normalized.slice(startIndex, startIndex + limit)

  return {
    restaurants: paginated,
    total: normalized.length
  }
}

// ── Place Details with Nearby ─────────────────────────────────────────────────

const DETAIL_FIELD_MASK = [
  'id',
  'displayName',
  'formattedAddress',
  'location',
  'rating',
  'userRatingCount',
  'priceLevel',
  'primaryType',
  'types',
  'nationalPhoneNumber',
  'websiteUri',
  'editorialSummary',
  'currentOpeningHours',
  'regularOpeningHours',
  'reviews',
  'photos',
  'googleMapsUri',
].join(',')

const NEARBY_FIELD_MASK = 'places.id,places.displayName,places.rating,places.photos,places.formattedAddress,places.location,places.primaryType'

export async function getPlaceDetailsWithNearby(placeId: string): Promise<any> {
  const data = await googleRequest<any>({
    method: 'GET',
    path: `/places/${placeId}`,
    fieldMask: DETAIL_FIELD_MASK,
    cachePrefix: 'gp_explore_detail',
    cacheTtl: 86400,
  })

  if (!data || !data.id) {
    return null
  }

  const name = data.displayName?.text || ''
  const address = data.formattedAddress || ''
  const photos = data.photos || []
  const priceVal = parsePriceLevel(data.priceLevel)
  const ratingVal = data.rating ?? null
  const reviewCount = data.userRatingCount ?? null
  const isOpen = data.currentOpeningHours?.openNow ?? null

  // Build gallery: up to 10 unique photos, hero is first
  let galleryPhotos = photos.slice(0, 10).map((p: any) => ({
    url: buildPhotoUrl(p.name, 1200),
    thumbnail: buildPhotoUrl(p.name, 400),
    width: p.widthPx || 0,
    height: p.heightPx || 0,
    attributions: (p.authorAttributions || []).map((a: any) => a.displayName || '')
  }))

  // If no photos returned by Google, fetch a gallery of unique images from ImageService
  if (galleryPhotos.length === 0) {
    const resolved = await ImageService.resolvePlaceImages({
      placeId,
      placeName: name,
      city: address,
      category: data.primaryType || ''
    })
    galleryPhotos = resolved.gallery.map(url => ({
      url,
      thumbnail: url,
      width: 1200,
      height: 800,
      attributions: []
    }))
  }

  // Extract review snippets for AI description
  const reviewSnippets = (data.reviews || []).slice(0, 3).map((r: any) =>
    (r.text?.text || '').slice(0, 200)
  ).filter(Boolean)

  // Generate AI description if Google editorial summary is missing
  let description = data.editorialSummary?.text || null
  if (!description) {
    try {
      description = await generatePlaceDescription({
        name,
        address,
        primaryType: data.primaryType || '',
        rating: ratingVal,
        userRatingsTotal: reviewCount,
        reviewSnippets,
      })
    } catch (err: any) {
      console.warn('[ExploreService] AI description generation failed:', err.message)
      description = null
    }
  }

  const details: any = {
    id: data.id || '',
    name,
    primaryType: data.primaryType || null,
    address,
    latitude: data.location?.latitude ?? 0,
    longitude: data.location?.longitude ?? 0,
    rating: ratingVal,
    userRatingsTotal: reviewCount,
    priceLevel: priceVal,
    isOpenNow: isOpen,
    phone: data.nationalPhoneNumber || null,
    website: data.websiteUri || null,
    description,
    descriptionSource: data.editorialSummary?.text ? 'google' : 'ai',
    openingHours: data.regularOpeningHours?.weekdayDescriptions
      || data.currentOpeningHours?.weekdayDescriptions
      || null,
    googleMapsUrl: data.googleMapsUri || '',
    heroImage: galleryPhotos[0]?.url || '',
    galleryImages: galleryPhotos.slice(0, 5).map((p: any) => p.url),
    photos: galleryPhotos,
    photoCount: galleryPhotos.length,
    reviews: (data.reviews || []).slice(0, 5).map((r: any) => ({
      author: r.authorAttribution?.displayName || 'Anonymous',
      rating: r.rating ?? 0,
      text: r.text?.text || '',
      relativeTime: r.relativePublishTimeDescription || '',
      profilePhotoUrl: r.authorAttribution?.photoUri || null,
    })),
    nearbyAttractions: [],
    nearbyRestaurants: [],
    nearbyHotels: [],
  }

  // Fetch nearby places in parallel
  if (details.latitude && details.longitude) {
    const center = { latitude: details.latitude, longitude: details.longitude }

    const [attractionsRes, restaurantsRes, hotelsRes] = await Promise.allSettled([
      // Nearby attractions
      googleRequest<any>({
        path: '/places:searchNearby',
        body: {
          includedTypes: ['tourist_attraction', 'amusement_park', 'park', 'museum'],
          maxResultCount: 6,
          locationRestriction: { circle: { center, radius: 3000.0 } },
          languageCode: 'en'
        },
        fieldMask: NEARBY_FIELD_MASK,
        cachePrefix: 'gp_nearby_attr',
        cacheTtl: 86400,
      }),
      // Nearby restaurants
      googleRequest<any>({
        path: '/places:searchNearby',
        body: {
          includedTypes: ['restaurant', 'cafe'],
          maxResultCount: 6,
          locationRestriction: { circle: { center, radius: 2000.0 } },
          languageCode: 'en'
        },
        fieldMask: NEARBY_FIELD_MASK,
        cachePrefix: 'gp_nearby_rest',
        cacheTtl: 86400,
      }),
      // Nearby hotels
      googleRequest<any>({
        path: '/places:searchNearby',
        body: {
          includedTypes: ['hotel', 'lodging'],
          maxResultCount: 4,
          locationRestriction: { circle: { center, radius: 3000.0 } },
          languageCode: 'en'
        },
        fieldMask: NEARBY_FIELD_MASK,
        cachePrefix: 'gp_nearby_hotel',
        cacheTtl: 86400,
      }),
    ])

    const mapNearby = (result: PromiseSettledResult<any>) => {
      if (result.status !== 'fulfilled') return []
      return (result.value?.places || [])
        .filter((p: any) => p.id !== placeId)
        .map((p: any) => ({
          id: p.id || '',
          name: p.displayName?.text || '',
          primaryType: p.primaryType || null,
          rating: p.rating ?? null,
          address: p.formattedAddress || '',
          latitude: p.location?.latitude ?? 0,
          longitude: p.location?.longitude ?? 0,
          photoUrl: p.photos?.[0]?.name ? buildPhotoUrl(p.photos[0].name, 400) : '',
        }))
    }

    details.nearbyAttractions = mapNearby(attractionsRes)
    details.nearbyRestaurants = mapNearby(restaurantsRes)
    details.nearbyHotels = mapNearby(hotelsRes)

    // For any nearby items that have empty photos, get a fallback unique image
    const enrichNearby = async (items: any[], category: string) => {
      const promises = items.map(async (item) => {
        if (!item.photoUrl) {
          const resolved = await ImageService.resolvePlaceImages({
            placeId: item.id,
            placeName: item.name,
            city: address,
            category
          })
          item.photoUrl = resolved.imageUrl
        }
        return item
      })
      return Promise.all(promises)
    }

    details.nearbyAttractions = await enrichNearby(details.nearbyAttractions, 'attractions')
    details.nearbyRestaurants = await enrichNearby(details.nearbyRestaurants, 'restaurants')
    details.nearbyHotels = await enrichNearby(details.nearbyHotels, 'hotels')
  }

  return details
}
