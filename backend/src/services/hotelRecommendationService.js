/**
 * TripSage — Hotel Recommendation Engine
 *
 * Ranks hotels from the Hotelbeds API response using a 4-factor composite score.
 * STRICT DATA POLICY:
 *   - Uses ONLY data returned by the Hotelbeds Availability API / hotelbedsService.js
 *   - Never fabricates prices, ratings, images, or amenities
 *   - Missing data is explicitly labeled (e.g. "Price unavailable")
 *   - Hotelbeds CDN image URLs are used when available; otherwise a labeled placeholder is returned
 */

const hotelbedsService = require('./hotelbedsService')

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * Placeholder image shown when no Hotelbeds CDN image is available.
 * This is a Hotelbeds CDN image used ONLY as a visual placeholder.
 * image_source will be set to "placeholder" so consumers know.
 */
const PLACEHOLDER_IMAGE = 'https://photos.hotelbeds.com/giata/bigger/00/004200/004200a_hb_ro_001.jpg'

// Weights for the composite recommendation score (must sum to 1.0)
const WEIGHTS = {
  VALUE:      0.40,  // Price vs. user budget — core traveler concern
  BUDGET_FIT: 0.25,  // How well the price fits within the declared budget
  RATING:     0.20,  // Guest star rating (from Hotelbeds categoryCode/categoryName)
  CATEGORY:   0.15,  // Hotel star category from API (proxy for quality tier)
}

// ─── Scoring Helpers ──────────────────────────────────────────────────────────

/**
 * Scores how much "value for money" a hotel provides relative to the user's budget.
 * Budget = total trip spend cap. We assume hotel accommodation takes ~40% of total budget.
 * Score = 1.0 when price matches the sweet spot; drops linearly above.
 *
 * @param {number} pricePerNight  - From Hotelbeds API (INR)
 * @param {number} budget         - User's total trip budget (INR)
 * @returns {number} 0.0–1.0
 */
function scoreValue(pricePerNight, budget) {
  if (!pricePerNight || pricePerNight <= 0) return 0
  if (!budget || budget <= 0) return 0.5  // Neutral score when no budget specified

  // Sweet-spot = 40% of budget / 3 nights as a nightly benchmark
  const sweetSpot = (budget * 0.40) / 3
  if (pricePerNight <= sweetSpot) return 1.0

  // Linearly penalize: at 3× the sweet spot, score = 0
  const ratio = sweetSpot / pricePerNight
  return Math.max(0, Math.min(1, ratio))
}

/**
 * Scores budget fit: whether the per-night price falls within the user's accommodation budget.
 * Full score if within budget, graduated penalty if over.
 *
 * @param {number} pricePerNight - From Hotelbeds API (INR)
 * @param {number} budget        - User's total trip budget (INR)
 * @param {number} nights        - Number of nights
 * @returns {number} 0.0–1.0
 */
function scoreBudgetFit(pricePerNight, budget, nights) {
  if (!pricePerNight || pricePerNight <= 0) return 0
  if (!budget || budget <= 0) return 0.5

  const nightsStay = Math.max(1, nights || 1)
  const totalHotelBudget = budget * 0.40  // 40% of total budget for accommodation
  const totalHotelCost   = pricePerNight * nightsStay

  if (totalHotelCost <= totalHotelBudget) return 1.0

  // Penalty: 0.0 when cost is 2× the budget
  const overRatio = totalHotelBudget / totalHotelCost
  return Math.max(0, overRatio)
}

/**
 * Normalizes the hotel star rating from the API to a 0.0–1.0 score.
 * Hotelbeds returns a numeric rating (1–5 stars).
 *
 * @param {number} rating - Star rating from API (e.g. 4.0)
 * @returns {number} 0.0–1.0
 */
function scoreRating(rating) {
  if (!rating || rating <= 0) return 0.3  // Default neutral when no rating
  return Math.min(1.0, Math.max(0, rating / 5))
}

/**
 * Scores hotel category tier from the Hotelbeds categoryName field.
 * This serves as a proxy for "distance from city center" since the API
 * doesn't return a distance metric — higher-category hotels tend to be
 * in prime central locations.
 *
 * @param {string} categoryName - e.g. "4 STARS", "3 STARS GL", "APARTMENTS"
 * @param {number} rating       - Numeric star rating as fallback
 * @returns {number} 0.0–1.0
 */
function scoreCategory(categoryName, rating) {
  if (categoryName) {
    const match = categoryName.match(/(\d+)/)
    if (match) {
      const stars = parseInt(match[1], 10)
      return Math.min(1.0, stars / 5)
    }
  }
  // Fallback to rating-based estimate
  if (rating && rating > 0) return Math.min(1.0, rating / 5)
  return 0.4  // Neutral default
}

/**
 * Computes the composite recommendation score for a hotel.
 *
 * @param {object} hotel  - Normalized hotel object from hotelbedsService
 * @param {number} budget - User's total trip budget (INR)
 * @param {number} nights - Number of nights
 * @returns {number} 0.0–1.0 composite score
 */
function computeScore(hotel, budget, nights) {
  const vValue      = scoreValue(hotel.price, budget)
  const vBudgetFit  = scoreBudgetFit(hotel.price, budget, nights)
  const vRating     = scoreRating(hotel.rating)
  const vCategory   = scoreCategory(hotel.categoryName, hotel.rating)

  return (
    WEIGHTS.VALUE      * vValue     +
    WEIGHTS.BUDGET_FIT * vBudgetFit +
    WEIGHTS.RATING     * vRating    +
    WEIGHTS.CATEGORY   * vCategory
  )
}

// ─── Recommendation Reason Builder ───────────────────────────────────────────

/**
 * Generates a human-readable recommendation reason based on actual API data.
 * NO invented claims — only references values derived from the API response.
 *
 * @param {object} hotel        - Normalized hotel object
 * @param {number} budget       - User's total trip budget
 * @param {number} compositeScore
 * @param {number} rank         - 1-indexed rank position
 * @returns {string}
 */
function buildRecommendationReason(hotel, budget, compositeScore, rank) {
  const parts = []

  // ── Lead reason by rank ──────────────────────────────────────────────────
  if (rank === 1) {
    parts.push('Top pick')
  } else if (rank === 2) {
    parts.push('Runner-up')
  } else if (rank === 3) {
    parts.push('Strong contender')
  } else {
    parts.push(`Ranked #${rank}`)
  }

  // ── Price context ────────────────────────────────────────────────────────
  // NOTE: hotelbedsService.js already converts EUR/USD prices to INR in hotel.price.
  // The hotel.currency field retains the original API currency (e.g. EUR) for reference.
  // We always display the price in INR (₹) since the conversion has already happened.
  if (hotel.price && hotel.price > 0) {
    const formattedPrice = hotel.price.toLocaleString('en-IN')
    parts.push(`at ₹${formattedPrice}/night`)

    if (budget && budget > 0) {
      const totalHotelBudget = budget * 0.40
      const nights = hotel.nights || 1
      if (hotel.price * nights <= totalHotelBudget) {
        parts.push('— fits within your accommodation budget')
      } else {
        const overage = Math.round(((hotel.price * nights) / totalHotelBudget - 1) * 100)
        parts.push(`— ${overage}% above accommodation budget`)
      }
    }
  } else {
    parts.push('— pricing not available from API')
  }

  // ── Rating context ───────────────────────────────────────────────────────
  if (hotel.rating && hotel.rating > 0) {
    const ratingLabel = hotel.rating >= 4.5 ? 'Exceptional'
      : hotel.rating >= 4.0 ? 'Excellent'
      : hotel.rating >= 3.0 ? 'Very Good'
      : 'Good'
    parts.push(`· ${hotel.rating.toFixed(1)}★ ${ratingLabel}`)
  }

  // ── Category context ─────────────────────────────────────────────────────
  if (hotel.categoryName && hotel.categoryName.trim()) {
    parts.push(`· ${hotel.categoryName}`)
  }

  return parts.join(' ')
}

// ─── Image URL Resolution ─────────────────────────────────────────────────────

/**
 * Determines the image URL and source label for a hotel.
 * Priority: Hotelbeds CDN URL → Unsplash fallback (labeled as placeholder).
 * Never fabricates a CDN URL.
 *
 * @param {object} hotel - Normalized hotel from hotelbedsService
 * @returns {{ url: string, source: 'hotelbeds-cdn' | 'placeholder' }}
 */
function resolveImage(hotel) {
  // A Hotelbeds CDN image begins with "http://photos.hotelbeds.com/giata/" or "https://photos.hotelbeds.com/giata/"
  if (
    hotel.image &&
    (hotel.image.startsWith('http://photos.hotelbeds.com/giata/') || hotel.image.startsWith('https://photos.hotelbeds.com/giata/'))
  ) {
    return { url: hotel.image, source: 'hotelbeds-cdn' }
  }

  // Any other image present (e.g. from Unsplash enrichment in imageService.js)
  // is treated as a fallback placeholder — we surface this transparently.
  return {
    url: hotel.image || PLACEHOLDER_IMAGE,
    source: 'placeholder'
  }
}

// ─── Output Formatter ─────────────────────────────────────────────────────────

/**
 * Transforms a ranked hotel object into the TripSage recommendation JSON format.
 *
 * @param {object} hotel    - Normalized hotel from hotelbedsService
 * @param {number} rank     - 1-indexed rank
 * @param {number} budget   - User's total budget
 * @param {number} score    - Composite recommendation score
 * @returns {object}        - Output in the specified JSON schema
 */
function formatHotelRecommendation(hotel, rank, budget, score) {
  const { url: imageUrl, source: imageSource } = resolveImage(hotel)

  // Price — show "Price unavailable" if missing, never invent a value
  const pricePerNight = (hotel.price && hotel.price > 0)
    ? hotel.price.toString()
    : 'Price unavailable'

  // Currency — prices are converted to INR by hotelbedsService; always output INR.
  // The original API currency (hotel.currency) is preserved for audit/reference only.
  const currency = 'INR'

  // Rating — use API value or "Not rated"
  const rating = (hotel.rating && hotel.rating > 0)
    ? hotel.rating.toFixed(1)
    : 'Not rated'

  // Location — use API-provided zoneName/destinationName
  const location = hotel.location || 'Location data unavailable'

  // Amenities — ONLY from API amenities[] + offers[] arrays, no invention
  const amenities = [
    ...(hotel.amenities || []),
    ...(hotel.offers   || []),
  ].filter(Boolean).slice(0, 8)

  // Booking link — internal rateKey-based flow (empty for mock data)
  // The booking modal at /plan handles the full booking flow via rateKey
  const bookingLink = hotel.rateKey
    ? `/api/booking/init` // rateKey must be passed in the POST body
    : ''

  const reason = buildRecommendationReason(hotel, budget, score, rank)

  return {
    hotel_name:           hotel.name || 'Hotel name unavailable',
    price_per_night:      pricePerNight,
    currency,
    rating,
    image_url:            imageUrl,
    image_source:         imageSource,      // 'hotelbeds-cdn' | 'placeholder'
    location,
    amenities,
    booking_link:         bookingLink,
    rate_key:             hotel.rateKey || null,
    rate_type:            hotel.rateType || 'BOOKABLE',
    recommendation_reason: reason,
    image_path:           hotel.image_path || null,
    gallery_paths:        hotel.gallery_paths || [],
    rooms:                hotel.rooms || [],

    // ── Extended metadata (useful for the UI) ────────────────────────────
    _meta: {
      id:            hotel.id,
      rank,
      score:         parseFloat(score.toFixed(4)),
      source:        hotel.source || 'unknown',        // 'hotelbeds' | 'hotelbeds-mock'
      nights:        hotel.nights || null,
      total_price:   hotel.totalPrice || null,
      category_name: hotel.categoryName || null,
      live_status:   hotel.liveStatus || null,
      rate_type:     hotel.rateType || 'BOOKABLE',
    },
  }
}

// ─── Main Recommendation Function ─────────────────────────────────────────────

/**
 * Fetches hotels from Hotelbeds and returns them ranked by composite score.
 *
 * @param {object} params
 * @param {string} params.destination  - City/destination name
 * @param {string} params.checkin      - ISO date string (YYYY-MM-DD)
 * @param {string} params.checkout     - ISO date string (YYYY-MM-DD)
 * @param {number} [params.members=2]  - Number of guests
 * @param {number} [params.budget]     - Total trip budget in INR
 * @returns {Promise<{ success: boolean, data: object[], meta: object }>}
 */
async function recommendHotels({ destination, checkin, checkout, members = 2, budget, rooms = 1, adults = 2, children = 0 }) {
  console.log(`[HotelRec] 🏨 Recommending hotels for "${destination}" | budget: ₹${budget || 'unset'} | ${checkin} → ${checkout}`)

  // ── 1. Fetch from Hotelbeds (live API or mock fallback) ────────────────
  const result = await hotelbedsService.searchHotels({
    destination, checkin, checkout, members, budget, rooms, adults, children
  })

  if (!result?.success || !Array.isArray(result.data)) {
    throw new Error('Hotel data service returned an invalid response')
  }

  const rawHotels = result.data
  if (rawHotels.length === 0) {
    return {
      success: true,
      data: [],
      meta: {
        source: result.meta?.source || 'hotelbeds',
        ranked: 0,
        destination,
        budget: budget || null,
        message: 'No hotels found for the specified criteria'
      }
    }
  }

  // ── 2. Compute nights ──────────────────────────────────────────────────
  let nights = 1
  if (checkin && checkout) {
    const ci = new Date(checkin)
    const co = new Date(checkout)
    nights = Math.max(1, Math.round((co - ci) / (1000 * 60 * 60 * 24)))
  }

  // ── 3. Score and rank each hotel ───────────────────────────────────────
  const scored = rawHotels.map(hotel => ({
    hotel,
    score: computeScore(hotel, budget, nights)
  }))

  // Sort descending by composite score
  scored.sort((a, b) => b.score - a.score)

  // ── 4. Format output ───────────────────────────────────────────────────
  const recommendations = scored.map(({ hotel, score }, index) =>
    formatHotelRecommendation(hotel, index + 1, budget, score)
  )

  console.log(`[HotelRec] ✅ Ranked ${recommendations.length} hotels | top: "${recommendations[0]?.hotel_name}" (score: ${recommendations[0]?._meta?.score})`)

  return {
    success: true,
    data: recommendations,
    meta: {
      source:      result.meta?.source || 'hotelbeds',
      ranked:      recommendations.length,
      liveCount:   result.meta?.liveCount  ?? null,
      mockCount:   result.meta?.mockCount  ?? null,
      destination,
      budget:      budget || null,
      nights,
      checkin,
      checkout,
      weights: WEIGHTS,
    }
  }
}

module.exports = { recommendHotels }
