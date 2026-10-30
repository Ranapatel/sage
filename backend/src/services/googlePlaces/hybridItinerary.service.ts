/**
 * Hybrid Itinerary Engine — TripSage
 *
 * Merges Google Places (New) real-world metadata with LLaMA 3.3 (Groq) reasoning
 * to generate optimized, personalized, and factually accurate travel itineraries.
 */

import axios from 'axios'
import { googleRequest, buildPhotoUrl } from './googleClient'
import { getPlaceDetails } from './placeDetails'
import { ImageService } from '../imageService'
import { RankingMatrixService } from './rankingMatrix.service'
import { SolarTimeService } from './solarTimeService'
import {
  TripSagePlace,
  HybridItinerary,
  HybridItineraryParams,
  PlaceCategory,
  CATEGORY_TO_GOOGLE_TYPES,
  PlaceReviewSummary,
  TripSagePlaceDetailsExtended,
} from './types'

const { cacheGet, cacheSet, generateCacheKey } = require('../../config/redis')

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
// One non-reasoning model for the itinerary. gpt-oss-120b is a reasoning model:
// three sequential calls to it were the 78–118s path. Ranking and review
// summaries no longer call a model. Override with GROQ_ITINERARY_MODEL.
const ITINERARY_MODEL = process.env.GROQ_ITINERARY_MODEL || 'llama-3.3-70b-versatile'
const LLM_MODEL = ITINERARY_MODEL

export class HybridItineraryService {
  /**
   * Main entry point to generate a premium optimized hybrid itinerary
   */
  static async generate(params: HybridItineraryParams): Promise<HybridItinerary> {
    const { destination, from, days, budget, style, members, preferences = [], startDate } = params

    // ── 0. Canonical Destination Context (Single Source of Truth) ────────────
    const { DestinationResolverService } = require('../destinationResolver.service')
    const destContext = await DestinationResolverService.resolve(destination)

    // Exact budget and start date made this key miss for almost every visitor.
    // Dates are stamped from the request on the way out. Budget is a 10k band.
    // Origin stays in the key so Delhi→Goa and Mumbai→Goa do not share a plan.
    const budgetBand = Math.round((Number(budget) || 0) / 10000) * 10000
    const { stampItineraryDates, reconcileTripCost, originCity } = require('../itineraryFacts')
    const cacheKey = generateCacheKey('hybrid_itinerary_v8', {
      destination: destContext.city,
      lat: destContext.latitude,
      lng: destContext.longitude,
      from: originCity(from),
      days,
      budgetBand,
      style,
      members,
      preferences: preferences.join(','),
    })
    const finish = (raw: any, aiStatus: string) => {
      const stamped = stampItineraryDates({ ...raw, destination, days, style, aiStatus }, startDate)
      return reconcileTripCost(stamped, { budget }) as HybridItinerary
    }

    try {
      const cached = await cacheGet(cacheKey)
      if (cached && (cached as any).aiStatus === 'live' && Array.isArray((cached as any).itinerary) && (cached as any).itinerary.length >= days) {
        console.log(`[HybridItinerary] ✅ Cache HIT for "${destContext.city}" (${(cached as any).itinerary.length} days)`)
        return finish(cached, 'live')
      }
    } catch { /* proceed without cache */ }

    console.log(`[HybridItinerary] 🚀 Generating hybrid itinerary for "${destContext.city}" (${days} days)...`)
    const phases: Record<string, number> = {}
    const startedAt = Date.now()
    let mark = startedAt
    const stop = () => {
      if (params.shouldAbort?.()) {
        const err = new Error('CLIENT_CLOSED')
        throw err
      }
    }

    // ── 1. Phase 1: Destination Intelligence (Candidates Discovery) ─────────
    stop()
    let candidates = await this.discoverCandidates(destContext.normalizedName, preferences, destContext)
    phases.discoverMs = Date.now() - mark
    mark = Date.now()
    console.log(`[HybridItinerary] Discovered ${candidates.length} candidate places in "${destContext.city}" in ${phases.discoverMs}ms`)

    const minRequiredCandidates = Math.max(20, days * 3)
    if (candidates.length < minRequiredCandidates) {
      console.warn(`[HybridItinerary] Candidates pool (${candidates.length}) is below optimal count (${minRequiredCandidates}) — augmenting with curated destination intelligence`)
      const { generateMockPlaces } = require('../aiService')
      const mockPlaces = generateMockPlaces(destContext.city)
      const existingNames = new Set(candidates.map(c => c.name.toLowerCase()))

      mockPlaces.forEach((p: any, i: number) => {
        if (!existingNames.has(p.name.toLowerCase())) {
          candidates.push(this.outlinePlace(p, i, destContext.city, destContext.latitude, destContext.longitude, 'curated_cand'))
        }
      })
    }

    // Local matrix only. The old Groq ranking call added up to 20s and
    // duplicated this score.
    stop()
    const sample = candidates[0]
    const solarTimes = SolarTimeService.calculateSolarTimes(
      sample?.latitude || destContext.latitude,
      sample?.longitude || destContext.longitude,
      startDate,
    )
    const rankedCandidates = RankingMatrixService.rankCandidates(candidates, params, solarTimes).map(sc => ({
      ...sc.place,
      score: Math.round(sc.totalScore * 100),
      reason: 'A fit for this trip.',
    }))
    phases.rankMs = Date.now() - mark
    mark = Date.now()

    stop()
    const itineraryData = await this.generateOptimizedItinerary(rankedCandidates, params)
    phases.llmMs = Date.now() - mark
    mark = Date.now()
    const aiStatus = itineraryData.aiStatus || 'live'
    if (aiStatus !== 'live') {
      console.warn(`[HybridItinerary] AI step ${aiStatus}. The response is a starter outline, not a full model plan.`)
    } else {
      console.log(`[HybridItinerary] Day-by-day itinerary structured in ${phases.llmMs}ms with ${ITINERARY_MODEL}.`)
    }

    // Photos and ratings already came back with discovery. A second Groq
    // review pass and a per-slot image lookup were serial and not required
    // for a usable plan.
    const enrichedItinerary = this.attachCandidateFacts(itineraryData, rankedCandidates)
    phases.enrichMs = Date.now() - mark
    phases.totalMs = Date.now() - startedAt
    console.log(`[HybridItinerary] phases ${JSON.stringify(phases)} aiStatus=${aiStatus}`)

    const finished = finish(enrichedItinerary, aiStatus) as any
    finished.generationPhases = phases

    if (aiStatus === 'live') {
      try {
        const { generationPhases, ...cacheable } = finished
        await cacheSet(cacheKey, cacheable, 86400)
      } catch { /* silent */ }
    } else {
      console.warn('[HybridItinerary] Starter outline was not cached.')
    }

    return finished as HybridItinerary
  }

  /**
   * Discovers 30-50 candidate places in the destination based on user preferences/interests
   */
  private static async discoverCandidates(
    destination: string,
    preferences: string[],
    destContext?: any
  ): Promise<TripSagePlace[]> {
    const destinationCity = destination.split(',')[0].trim()

    // Always query these core categories for rich candidate coverage
    // Four searches, not nine. More categories added serial wait when Google was slow.
    const categoriesToQuery: PlaceCategory[] = ['attractions', 'restaurants']

    const prefLower = preferences.map(p => p.toLowerCase())
    if (prefLower.some(p => p.includes('nature') || p.includes('outdoor') || p.includes('scenic') || p.includes('view'))) {
      categoriesToQuery.push('beaches')
    }
    if (prefLower.some(p => p.includes('history') || p.includes('culture') || p.includes('museum') || p.includes('art'))) {
      categoriesToQuery.push('temples')
    }
    if (prefLower.some(p => p.includes('shop') || p.includes('market') || p.includes('mall'))) {
      categoriesToQuery.push('shopping')
    }

    // Deduplicate categories, query in parallel
    const uniqueCategories = Array.from(new Set(categoriesToQuery)).slice(0, 2)

    const locationBias = destContext && destContext.latitude && destContext.longitude ? {
      circle: {
        center: { latitude: destContext.latitude, longitude: destContext.longitude },
        radius: 25000.0 // 25km radius centered at canonical destination
      }
    } : undefined

    // Execute queries in parallel
    const promises = uniqueCategories.map(async (category) => {
      const includedTypes = CATEGORY_TO_GOOGLE_TYPES[category] || CATEGORY_TO_GOOGLE_TYPES.general
      const textQuery = category === 'beaches'
        ? `beaches in ${destinationCity}`
        : `${category} in ${destinationCity}`

      try {
        const data = await googleRequest<any>({
          path: '/places:searchText',
          body: {
            textQuery,
            includedType: category !== 'beaches' && includedTypes.length > 0 ? includedTypes[0] : undefined,
            locationBias,
            maxResultCount: 15,
            languageCode: 'en',
          },
          fieldMask: [
            'places.id',
            'places.displayName',
            'places.formattedAddress',
            'places.location',
            'places.rating',
            'places.userRatingCount',
            'places.priceLevel',
            'places.types',
            'places.photos',
            'places.googleMapsUri',
            'places.currentOpeningHours',
          ].join(','),
          cachePrefix: `gp_search_${destinationCity.toLowerCase()}`,
          cacheTtl: 86400, // 24 hours
        })

        const places = data?.places || []
        return places.map((p: any) => ({
          id: p.id || '',
          name: p.displayName?.text || '',
          address: p.formattedAddress || '',
          latitude: p.location?.latitude ?? 0,
          longitude: p.location?.longitude ?? 0,
          rating: p.rating ?? null,
          userRatingsTotal: p.userRatingCount ?? null,
          priceLevel: this.parsePriceLevel(p.priceLevel),
          category,
          types: p.types || [],
          photoUrl: p.photos?.[0]?.name ? buildPhotoUrl(p.photos[0].name) : null,
          googleMapsUrl: p.googleMapsUri || '',
          isOpenNow: p.currentOpeningHours?.openNow ?? null,
          source: 'google_places' as const,
        }))
      } catch (err: any) {
        console.warn(`[HybridItinerary/Discovery] Error fetching category "${category}":`, err.message)
        return []
      }
    })

    // Also run a custom "hidden gems", "viewpoints" or generic "things to do" query to discover offbeat places
    const extraQueries = ['viewpoints', 'things to do']
    const extraPromises = extraQueries.map(async (extra) => {
      try {
        const data = await googleRequest<any>({
          path: '/places:searchText',
          body: {
            textQuery: `${extra} in ${destinationCity}`,
            maxResultCount: extra === 'things to do' ? 15 : 8,
            languageCode: 'en',
          },
          fieldMask: [
            'places.id',
            'places.displayName',
            'places.formattedAddress',
            'places.location',
            'places.rating',
            'places.userRatingCount',
            'places.priceLevel',
            'places.types',
            'places.photos',
            'places.googleMapsUri',
            'places.currentOpeningHours',
          ].join(','),
          cachePrefix: `gp_search_${destinationCity.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
          cacheTtl: 86400,
        })
        const places = data?.places || []
        return places.map((p: any) => ({
          id: p.id || '',
          name: p.displayName?.text || '',
          address: p.formattedAddress || '',
          latitude: p.location?.latitude ?? 0,
          longitude: p.location?.longitude ?? 0,
          rating: p.rating ?? null,
          userRatingsTotal: p.userRatingCount ?? null,
          priceLevel: this.parsePriceLevel(p.priceLevel),
          category: 'general' as PlaceCategory,
          types: p.types || [],
          photoUrl: p.photos?.[0]?.name ? buildPhotoUrl(p.photos[0].name) : null,
          googleMapsUrl: p.googleMapsUri || '',
          isOpenNow: p.currentOpeningHours?.openNow ?? null,
          source: 'google_places' as const,
        }))
      } catch (err: any) {
        console.warn(`[HybridItinerary/Discovery] Error fetching query "${extra}":`, err.message)
        return []
      }
    })

    const results = await Promise.all([...promises, ...extraPromises])
    const flat = results.flat()

    // Deduplicate by Place ID
    const seen = new Set<string>()
    return flat.filter(p => {
      if (!p.id || seen.has(p.id)) return false
      seen.add(p.id)
      return true
    })
  }

  /**
   * Scores and ranks candidates using Groq LLaMA model based on user travel preferences
   */
  private static async rankCandidates(candidates: TripSagePlace[], params: HybridItineraryParams): Promise<any[]> {
    const { style, preferences = [], budget, days, members, startDate } = params
    const apiKey = process.env.GROQ_API_KEY

    // Calculate solar times for target destination
    const sampleLat = candidates[0]?.latitude || 15.2993
    const sampleLng = candidates[0]?.longitude || 74.1240
    const solarTimes = SolarTimeService.calculateSolarTimes(sampleLat, sampleLng, startDate)

    // Pre-rank candidates using multi-factor scoring matrix
    const scoredCandidates = RankingMatrixService.rankCandidates(candidates, params, solarTimes)
    const sortedCandidatePlaces = scoredCandidates.map(sc => sc.place)

    if (!apiKey) {
      return sortedCandidatePlaces
    }

    // Limit candidate details sent to LLM to top 35 to prevent 413 Payload Too Large
    const candidateSubset = sortedCandidatePlaces.slice(0, 35)
    const candidateListStr = candidateSubset.map((c, idx) => `
Index: ${idx}
ID: ${c.id}
Name: ${c.name}
Rating: ${c.rating} (${c.userRatingsTotal} reviews)
Category: ${c.category}
Types: ${c.types.slice(0, 3).join(', ')}
Coords: [${c.latitude}, ${c.longitude}]
Price Level: ${c.priceLevel !== null ? c.priceLevel : 'unspecified'}
`).join('\n')

    const systemPrompt = `You are a Travel Ranker for TripSage.
Your task: Score each candidate place from 0 to 100 based on how well it fits the user profile.
Consider:
- Travel style: "${style}"
- Preferences: "${preferences.join(', ')}"
- Budget: ${budget} INR for ${days} days (${members} people)
- Local uniqueness: prioritize high ratings, hidden gems, viewpoints
- Minimize travel distances (score places clustered together higher)

You must return ONLY a valid JSON object of this format:
{
  "ranked": [
    {
      "index": 0,
      "placeId": "ChIJ...",
      "score": 95,
      "reason": "Short 1-sentence reason explaining why it fits"
    }
  ]
}`

    const userPrompt = `Score these candidate places for the travel profile:
Style: ${style}
Preferences: ${preferences.join(', ')}
Total Budget: ${budget} INR

Candidates:
${candidateListStr}`

    try {
      const res = await axios.post(GROQ_API_URL, {
        model: LLM_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 1500,
        temperature: 0.2,
        response_format: { type: 'json_object' }
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 20000,
      })

      const content = res.data.choices[0]?.message?.content
      const parsed = JSON.parse(content || '{}')
      const scores = parsed.ranked || []

      // Map scores back to candidate place objects
      const scoredCandidates = scores.map((s: any) => {
        const place = candidates.find(c => c.id === s.placeId) || candidates[s.index]
        if (!place) return null
        return {
          ...place,
          score: s.score || 50,
          reason: s.reason || '',
        }
      }).filter(Boolean)

      // Sort by score descending
      return scoredCandidates.sort((a: any, b: any) => b.score - a.score)
    } catch (err: any) {
      console.warn(`[HybridItinerary/Ranking] LLM ranking failed: ${err.message}. Keeping the candidate order.`)
      return candidates.map(c => ({ ...c, score: 80, reason: 'Kept in discovery order.' }))
    }
  }

  /**
   * Arranges the top candidates into a sequential, geographical, optimized itinerary
   */
  private static async generateOptimizedItinerary(rankedCandidates: any[], params: HybridItineraryParams): Promise<any> {
    const { destination, days, budget, currency = 'INR', style, members, preferences = [], startDate } = params
    const apiKey = process.env.GROQ_API_KEY
    const destinationCity = destination.split(',')[0].trim()

    // Select candidate pool proportional to the trip length (4 slots per day)
    const topCandidatesCount = Math.min(16, Math.max(12, days * 4))
    const topCandidates = rankedCandidates.slice(0, topCandidatesCount)

    const candidatesListStr = topCandidates.map((c, i) =>
      `${i}. ${c.name} | ${c.category} | rating ${c.rating ?? '-'} | id ${c.id}`
    ).join('\n')

    const systemPrompt = `You are TripSage, an expert local travel planner.
Your job: Generate a premium, highly optimized ${days}-day itinerary for ${destinationCity} using ONLY the provided candidates pool.

CORE RULES:
1. GEOGRAPHICAL CLUSTERING: Group nearby coordinates on the same day to minimize travel time.
2. SEQUENTIAL SLOTS: Allocate exactly 4 slots per day (morning, afternoon, evening, night).
   - "morning" (e.g. 09:00): Outdoor/temple/walking tour
   - "afternoon" (e.g. 13:00): Indoor/museum/dining/shopping
   - "evening" (e.g. 17:00): Golden hour viewpoint/sunset spot
   - "night" (e.g. 20:00): Dinner/markets/cultural shows
3. STRICT DUPLICATE REMOVAL: Every single slot in the entire itinerary MUST be a unique place. DO NOT repeat the same Place ID or the same name on different days or different slots. Do not recommend the same attraction (e.g. Vashisht Village) more than once in the entire trip. If the candidate pool is too small to fill all slots, use your own internal knowledge to suggest unique local attractions, spots, or restaurants in ${destinationCity} and set their placeId to null.
4. MEAL BREAKS: Suggest actual dining/cafes from candidates (or custom names if candidates have few restaurants) in the "afternoon" or "night" slots.
5. BUDGET LIMITS: Total estimated activities budget must fit the user's budget.
6. WEATHER/RAIN ALTERNATIVES: For each day, list 2 indoor alternative activities.

You must return ONLY valid JSON matching this schema:
{
  "itinerary": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "slots": {
        "morning": {
          "placeId": "ChIJ...",
          "name": "${destinationCity} Central Monument — ${destinationCity}",
          "time": "09:00",
          "category": "attractions",
          "activity": "Explore the landmark attraction",
          "visitDurationMinutes": 60,
          "estimatedCost": 0,
          "tip": "Visit early to avoid heat"
        },
        "afternoon": { ... },
        "evening": { ... },
        "night": { ... }
      },
      "travelTimeMinutes": 35,
      "walkingDistanceMeters": 1500,
      "transportation": "Auto-rickshaw or walking recommended",
      "rainyDayAlternatives": ["Indoor Art Gallery in ${destinationCity}", "Cultural Center in ${destinationCity}"]
    }
  ],
  "totalEstimatedCost": 1500,
  "budgetBreakdown": {
    "flightsEstimate": 0,
    "hotelsEstimate": 6000,
    "foodEstimate": 4000,
    "activitiesEstimate": 3000,
    "remainingBudget": 7000
  },
  "budgetWarning": null,
  "tips": ["Tip 1", "Tip 2"]
}`

    const userPrompt = `Destination: ${destinationCity}
Duration: ${days} days
Style: ${style}
Members: ${members}
Budget: ${budget} ${currency}
Preferences: ${preferences.join(', ')}
Starting date: ${startDate || 'unspecified'}
Day 1 date MUST be ${startDate || 'the start date'}. Each next day is the next calendar date. Do not use today's date.

Candidate Places:
${candidatesListStr}`

    if (!apiKey) {
      console.warn('[HybridItinerary/Generation] GROQ_API_KEY missing. Returning a starter outline.')
      const missing = this.buildFallbackHybridItinerary(rankedCandidates, params)
      missing.aiStatus = 'fallback'
      return missing
    }

    try {
      const res = await axios.post(GROQ_API_URL, {
        model: ITINERARY_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: Math.min(4000, 600 + days * 450),
        temperature: 0.2,
        response_format: { type: 'json_object' }
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 18000,
      })

      const content = res.data.choices[0]?.message?.content
      const parsed = JSON.parse(content || '{}')
      if (parsed.itinerary && Array.isArray(parsed.itinerary) && parsed.itinerary.length > 0) {
        // Guarantee all requested days are present
        if (parsed.itinerary.length < days) {
          console.warn(`[HybridItinerary/Generation] LLM returned ${parsed.itinerary.length}/${days} days. Backfilling missing days...`)
          const fallback = this.buildFallbackHybridItinerary(rankedCandidates, params)
          const existingDayNums = new Set(parsed.itinerary.map((d: any) => d.day))
          for (let d = 1; d <= days; d++) {
            if (!existingDayNums.has(d)) {
              const fbDay = fallback.itinerary.find((f: any) => f.day === d) || fallback.itinerary[d - 1]
              if (fbDay) {
                parsed.itinerary.push({ ...fbDay, day: d })
              }
            }
          }
          parsed.itinerary.sort((a: any, b: any) => a.day - b.day)
          parsed.aiStatus = 'partial'
          console.warn('[HybridItinerary/Generation] AI step incomplete. Missing days were filled from the starter outline.')
        } else {
          parsed.aiStatus = 'live'
        }
        return parsed
      }
      console.warn('[HybridItinerary/Generation] AI step returned no days. Using the starter outline.')
      const empty = this.buildFallbackHybridItinerary(rankedCandidates, params)
      empty.aiStatus = 'fallback'
      return empty
    } catch (err: any) {
      console.warn(`[HybridItinerary/Generation] AI step failed (${err.message}). Using the starter outline.`)
      const failed = this.buildFallbackHybridItinerary(rankedCandidates, params)
      failed.aiStatus = 'fallback'
      return failed
    }
  }

  /**
   * Constructs a high-quality fallback day-by-day itinerary directly from candidate places if LLM fails or is rate limited
   */
  private static buildFallbackHybridItinerary(
    candidates: TripSagePlace[],
    params: HybridItineraryParams
  ): any {
    const { days = 3, budget = 50000, currency = 'INR', destination } = params
    const destCity = destination.split(',')[0].trim()

    let candList = [...candidates]
    if (candList.length < Math.max(15, days * 3)) {
      const { generateMockPlaces } = require('../aiService')
      const mockPlaces = generateMockPlaces(destCity)
      const existingNames = new Set(candList.map(c => c.name.toLowerCase()))
      mockPlaces.forEach((p: any, i: number) => {
        if (!existingNames.has(p.name.toLowerCase())) {
          candList.push(this.outlinePlace(p, i, destCity, 0, 0, 'fb_cand'))
        }
      })
    }

    if (candList.length === 0) {
      candList = [
        this.outlinePlace({ name: `Central Landmark — ${destCity}`, category: 'attractions' }, 1, destCity, 0, 0, 'fb')
      ]
    }

    const itinerary: any[] = []
    let candIdx = 0
    for (let d = 1; d <= days; d++) {
      const morningCand = candList[candIdx % candList.length]
      candIdx++
      const afternoonCand = candList[candIdx % candList.length]
      candIdx++
      const eveningCand = candList[candIdx % candList.length]
      candIdx++
      const nightCand = candList[candIdx % candList.length]
      candIdx++

      itinerary.push({
        day: d,
        date: require('../itineraryFacts').dateForDay(params.startDate, d),
        slots: {
          morning: {
            placeId: morningCand.id,
            name: morningCand.name,
            time: '09:00',
            category: morningCand.category || 'attractions',
            activity: `Morning exploration & sightseeing at ${morningCand.name}`,
            visitDurationMinutes: 90,
            estimatedCost: 100,
            tip: 'Visit in the morning for crisp views and fewer crowds'
          },
          afternoon: {
            placeId: afternoonCand.id,
            name: afternoonCand.name,
            time: '13:00',
            category: afternoonCand.category || 'dining',
            activity: `Lunch and heritage visit at ${afternoonCand.name}`,
            visitDurationMinutes: 90,
            estimatedCost: 250,
            tip: 'Try authentic local cuisine and specialties'
          },
          evening: {
            placeId: eveningCand.id,
            name: eveningCand.name,
            time: '17:00',
            category: eveningCand.category || 'attractions',
            activity: `Golden hour stroll and photography around ${eveningCand.name}`,
            visitDurationMinutes: 120,
            estimatedCost: 150,
            tip: 'Great spot for scenic photography and sunset vibes'
          },
          night: {
            placeId: nightCand.id,
            name: nightCand.name,
            time: '20:00',
            category: nightCand.category || 'dining',
            activity: `Dinner, local bazaar stroll and cafe experience at ${nightCand.name}`,
            visitDurationMinutes: 90,
            estimatedCost: 350,
            tip: 'Enjoy the vibrant evening atmosphere and local desserts'
          }
        },
        travelTimeMinutes: 30,
        walkingDistanceMeters: 1200,
        transportation: 'Local taxi or scenic walking recommended',
        rainyDayAlternatives: [`${destCity} Art Gallery & Cultural Museum`, `${destCity} Local Crafts Bazaar`]
      })
    }

    return {
      itinerary,
      totalEstimatedCost: Math.min(budget, 500 * days),
      budgetBreakdown: {
        flightsEstimate: 0,
        hotelsEstimate: Math.floor(budget * 0.4),
        foodEstimate: Math.floor(budget * 0.3),
        activitiesEstimate: Math.floor(budget * 0.2),
        remainingBudget: Math.floor(budget * 0.1)
      },
      tips: [
        `Plan your morning visits early to avoid crowds in ${destCity}.`,
        `Carry water, comfortable footwear, and a light jacket.`,
        `Check local weather and road conditions in advance.`
      ]
    }
  }

  /**
   * Copies ratings, photos, and map links already collected during discovery.
   * Does not call Groq or image providers.
   */
  private static attachCandidateFacts(itineraryData: any, candidates: TripSagePlace[] = []): any {
    const byId = new Map<string, TripSagePlace>()
    for (const candidate of candidates) {
      if (candidate?.id) byId.set(candidate.id, candidate)
    }

    const days: any[] = itineraryData.itinerary || []
    const destinationCity = itineraryData.destination || ''
    const enrichedDays: any[] = []

    for (const day of days) {
      const slots = day.slots || {}
      const enrichedSlots: any = {}

      for (const key of Object.keys(slots)) {
        const slot = slots[key]
        if (!slot) {
          enrichedSlots[key] = null
          continue
        }
        const known = slot.placeId ? byId.get(slot.placeId) : undefined
        const cost = Number(slot.estimatedCost)
        const estimatedCost = Number.isFinite(cost) ? Math.max(0, Math.round(cost)) : 0
        const photo = known?.photoUrl || slot.photoUrl || null
        enrichedSlots[key] = {
          ...slot,
          estimatedCost,
          estimatedSpend: `₹${estimatedCost.toLocaleString('en-IN')}`,
          rating: known?.rating ?? null,
          reviewsCount: known?.userRatingsTotal ?? null,
          photoUrl: photo,
          image: photo || slot.image || null,
          googleMapsUrl: known?.googleMapsUrl || slot.googleMapsUrl || (
            slot.name
              ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${slot.name} ${destinationCity}`)}`
              : ''
          ),
          coordinates: known ? [known.latitude, known.longitude] : (slot.coordinates || null),
          reviewSummary: null,
        }
      }

      const placesList = [
        enrichedSlots.morning,
        enrichedSlots.afternoon,
        enrichedSlots.evening,
        enrichedSlots.night,
      ].filter(Boolean)

      enrichedDays.push({
        ...day,
        slots: enrichedSlots,
        places: placesList.length > 0 ? placesList : (Array.isArray(day.places) ? day.places : []),
      })
    }

    return {
      ...itineraryData,
      itinerary: enrichedDays,
    }
  }

  /**
   * Kept for callers that still ask for the old enrichment entry point.
   * It no longer makes Groq or image requests.
   */
  private static async enrichItineraryPlaces(itineraryData: any, candidates: TripSagePlace[] = []): Promise<any> {
    return this.attachCandidateFacts(itineraryData, candidates)
  }


  /**
   * A catalog or starter place. It has no Google rating, review count, phone, or hours.
   * Those fields stay null so the plan does not show invented numbers.
   */
  private static outlinePlace(
    place: { name: string; category?: string },
    index: number,
    city: string,
    latitude: number,
    longitude: number,
    idPrefix: string,
  ): TripSagePlace {
    return {
      id: `${idPrefix}_${index}`,
      name: place.name,
      address: place.name ? `${place.name}, ${city}` : city,
      latitude: Number.isFinite(latitude) ? latitude : 0,
      longitude: Number.isFinite(longitude) ? longitude : 0,
      rating: null,
      userRatingsTotal: null,
      priceLevel: null,
      category: ((place.category || 'attractions').toLowerCase() as PlaceCategory),
      types: ['tourist_attraction'],
      photoUrl: null,
      googleMapsUrl: '',
      isOpenNow: null,
      source: 'google_places',
    }
  }

  /**
   * Resolves price level string/number
   */
  private static parsePriceLevel(level: string | undefined): number | null {
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
}

