export interface RawImageCandidate {
  id?: string
  url: string
  width?: number
  height?: number
  title?: string
  description?: string
  provider?: string
  qualityHint?: number
  [key: string]: any
}

export interface ScoredImageCandidate extends RawImageCandidate {
  score: number
}

/**
 * Scores an image candidate for travel UI use.
 */
export function scoreImageCandidate(
  candidate: RawImageCandidate,
  targetCategory?: string
): ScoredImageCandidate {
  let score = 40

  const width = candidate.width || 0
  const height = candidate.height || 0
  const title = (candidate.title || '').toLowerCase()
  const description = (candidate.description || '').toLowerCase()
  const textBlob = `${title} ${description}`

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
    score += 10
  }

  if (width > 0 && height > 0) {
    const aspectRatio = width / height
    if (aspectRatio >= 1.3 && aspectRatio <= 1.9) {
      score += 20
    } else if (aspectRatio > 1.0 && aspectRatio < 1.3) {
      score += 12
    } else if (aspectRatio >= 0.9 && aspectRatio <= 1.1) {
      score += 6
    } else if (aspectRatio < 0.9) {
      score -= 8
    } else {
      score += 8
    }
  } else {
    score += 10
  }

  score += providerCategoryBonus(candidate.provider, targetCategory)

  if (typeof candidate.qualityHint === 'number') {
    score += Math.min(8, Math.max(0, candidate.qualityHint))
  }

  const travelTerms =
    /\b(travel|city|skyline|beach|mountain|hotel|resort|restaurant|dining|landmark|museum|park|temple|palace|airport|car|road|adventure|nature|island|ocean|sunset|architecture|interior|suite|pool)\b/i
  if (travelTerms.test(textBlob)) {
    score += 10
  }

  if (/\b(watermark|stock photo|logo|banner|advertisement|promo|text overlay)\b/i.test(textBlob)) {
    score -= 20
  }

  if (candidate.provider !== 'placeholder' && candidate.url?.startsWith('https://')) {
    score += 5
  }

  if (!candidate.url || !/^https?:\/\//i.test(candidate.url)) {
    score = 0
  }

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
  provider?: string,
  category?: string
): number {
  const cat = (category || '').toLowerCase()

  if (provider === 'hotelbeds') {
    return cat === 'hotels' ? 20 : 8
  }

  if (provider === 'google') {
    if (['hotels', 'restaurants', 'attractions'].includes(cat)) return 18
    if (cat === 'activities') return 18
    if (cat === 'destinations') return 10
    return 0
  }

  if (provider === 'unsplash') {
    if (['destinations', 'hero'].includes(cat)) return 18
    if (['hotels', 'restaurants', 'attractions'].includes(cat)) return 14
    if (cat === 'cars') return 14
    if (cat === 'activities') return 12
    return 10
  }

  if (provider === 'pexels') {
    if (cat === 'cars') return 18
    if (['activities', 'destinations', 'hero'].includes(cat)) return 15
    if (['hotels', 'restaurants', 'attractions'].includes(cat)) return 10
    return 10
  }

  return 0
}

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

module.exports = { scoreImageCandidate, rankAndSelectBestImage }
module.exports.scoreImageCandidate = scoreImageCandidate
module.exports.rankAndSelectBestImage = rankAndSelectBestImage
