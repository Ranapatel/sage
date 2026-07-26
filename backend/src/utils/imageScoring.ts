export interface RawImageCandidate {
  url: string
  width?: number
  height?: number
  title?: string
  description?: string
  provider: 'hotelbeds' | 'google' | 'pexels' | 'unsplash' | 'placeholder'
  category?: string
  placeId?: string
  photographer?: string
  photographerUrl?: string
  attribution?: string
  /** Higher is better when known (e.g. Google widthPx ranking) */
  qualityHint?: number
  variants?: {
    hero?: string
    card?: string
    mobile?: string
    thumb?: string
  }
}

export interface ScoredImageCandidate extends RawImageCandidate {
  score: number // 0 to 100
}

/**
 * Scores an image candidate for travel UI use.
 * Factors: resolution, landscape orientation, quality signals,
 * provider fitness, travel relevance, watermark/text penalties.
 */
export function scoreImageCandidate(
  candidate: RawImageCandidate,
  targetCategory?: string
): ScoredImageCandidate {
  let score = 40 // Base score

  const width = candidate.width || 0
  const height = candidate.height || 0
  const title = (candidate.title || '').toLowerCase()
  const description = (candidate.description || '').toLowerCase()
  const textBlob = `${title} ${description}`

  // 1. Resolution (max +25)
  if (width >= 2400 || height >= 1600) {
    score += 25
  } else if (width >= 1920 || height >= 1080) {
    score += 22
  } else if (width >= 1200) {
    score += 18
  } else if (width >= 800) {
    score += 12
  } else if (width >= 400) {
    score += 5
  } else if (width > 0) {
    score += 1
  } else {
    // Unknown dimensions — assume decent CDN size
    score += 10
  }

  // 2. Landscape orientation preferred for travel cards/heroes (max +20)
  if (width > 0 && height > 0) {
    const aspectRatio = width / height
    if (aspectRatio >= 1.3 && aspectRatio <= 1.9) {
      score += 20 // Ideal landscape
    } else if (aspectRatio > 1.0 && aspectRatio < 1.3) {
      score += 12
    } else if (aspectRatio >= 0.9 && aspectRatio <= 1.1) {
      score += 6 // Square
    } else if (aspectRatio < 0.9) {
      score -= 8 // Portrait penalty for most travel surfaces
    } else {
      score += 8 // Ultra-wide still usable
    }
  } else {
    score += 10 // Assume landscape from API orientation filters
  }

  // 3. Provider fitness by category (max +18)
  score += providerCategoryBonus(candidate.provider, targetCategory)

  // 4. Quality hint from source metadata (max +8)
  if (typeof candidate.qualityHint === 'number') {
    score += Math.min(8, Math.max(0, candidate.qualityHint))
  }

  // 5. Travel relevance keywords (max +10)
  const travelTerms =
    /\b(travel|city|skyline|beach|mountain|hotel|resort|restaurant|dining|landmark|museum|park|temple|palace|airport|car|road|adventure|nature|island|ocean|sunset|architecture|interior|suite|pool)\b/i
  if (travelTerms.test(textBlob)) {
    score += 10
  }

  // 6. Watermark / text overlay / stock spam penalties
  if (/\b(watermark|stock photo|logo|banner|advertisement|promo|text overlay)\b/i.test(textBlob)) {
    score -= 20
  }

  // 7. Modern appearance: prefer higher-res CDN URLs and non-placeholder sources
  if (candidate.provider !== 'placeholder' && candidate.url?.startsWith('https://')) {
    score += 5
  }

  // 8. Invalid URL hard-fail
  if (!candidate.url || !/^https?:\/\//i.test(candidate.url)) {
    score = 0
  }

  // Reject tiny / broken dimension combos when known
  if (width > 0 && height > 0 && (width < 200 || height < 150)) {
    score = Math.min(score, 15)
  }

  const finalScore = Math.min(100, Math.max(0, Math.round(score)))

  return {
    ...candidate,
    score: finalScore,
  }
}

function providerCategoryBonus(
  provider: RawImageCandidate['provider'],
  category?: string
): number {
  const cat = (category || '').toLowerCase()

  if (provider === 'hotelbeds') {
    return cat === 'hotels' ? 18 : 8
  }

  if (provider === 'google') {
    if (['hotels', 'restaurants', 'attractions', 'activities'].includes(cat)) return 16
    if (cat === 'destinations') return 8
    return 10
  }

  if (provider === 'unsplash') {
    if (['destinations', 'hero'].includes(cat)) return 16
    if (cat === 'cars') return 10
    // Secondary fallback only for place-specific entities
    if (['hotels', 'restaurants', 'attractions'].includes(cat)) return 6
    return 12
  }

  if (provider === 'pexels') {
    if (['cars', 'activities', 'destinations', 'hero'].includes(cat)) return 15
    return 10
  }

  return 0
}

/**
 * Ranks candidates descending by score and returns the best one.
 */
export function rankAndSelectBestImage(
  candidates: RawImageCandidate[],
  targetCategory?: string
): ScoredImageCandidate | null {
  if (!candidates || candidates.length === 0) return null

  const scored = candidates
    .map((c) => scoreImageCandidate(c, targetCategory))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)

  return scored[0] || null
}
