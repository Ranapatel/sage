import {
  RawImageCandidate,
  ScoredImageCandidate,
  scoreImageCandidate,
} from '../../utils/imageScoring'
import { ImageCategory } from '../../utils/imageSearch'

/** Branded TripSage placeholder — never leave broken/empty images */
const TRIPSAGE_PLACEHOLDER =
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&q=80&auto=format&fit=crop'

const CATEGORY_PLACEHOLDERS: Partial<Record<ImageCategory, string>> = {
  hotels:
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80&auto=format&fit=crop',
  restaurants:
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80&auto=format&fit=crop',
  attractions:
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600&q=80&auto=format&fit=crop',
  cars:
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1600&q=80&auto=format&fit=crop',
  activities:
    'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1600&q=80&auto=format&fit=crop',
  destinations: TRIPSAGE_PLACEHOLDER,
  hero: TRIPSAGE_PLACEHOLDER,
}

export class ImageRankingService {
  /**
   * Rank all candidate photos and select the highest-scoring one.
   */
  public static selectBestImage(
    candidates: RawImageCandidate[],
    category: ImageCategory
  ): ScoredImageCandidate {
    if (!candidates || candidates.length === 0) {
      return this.getFallbackPlaceholder(category)
    }

    const scored = candidates
      .map((c) => scoreImageCandidate(c, category))
      .filter((c) => c.score > 0)
      .sort((a, b) => b.score - a.score)

    if (scored.length > 0) {
      return scored[0]
    }

    return this.getFallbackPlaceholder(category)
  }

  /**
   * Rank and return top N candidates (for galleries / search).
   */
  public static rankCandidates(
    candidates: RawImageCandidate[],
    category: ImageCategory,
    limit = 5
  ): ScoredImageCandidate[] {
    if (!candidates || candidates.length === 0) {
      return [this.getFallbackPlaceholder(category)]
    }

    const scored = candidates
      .map((c) => scoreImageCandidate(c, category))
      .filter((c) => c.score > 0)
      .sort((a, b) => b.score - a.score)

    if (scored.length === 0) {
      return [this.getFallbackPlaceholder(category)]
    }

    return scored.slice(0, Math.max(1, limit))
  }

  /**
   * TripSage branded failover placeholder — always returns a valid HTTPS image.
   */
  public static getFallbackPlaceholder(category: ImageCategory): ScoredImageCandidate {
    const defaultUrl = CATEGORY_PLACEHOLDERS[category] || TRIPSAGE_PLACEHOLDER
    return {
      url: defaultUrl,
      width: 1600,
      height: 1066,
      title: 'TripSage Travel',
      provider: 'placeholder',
      score: 40,
      variants: {
        hero: defaultUrl.includes('w=')
          ? defaultUrl.replace(/w=\d+/, 'w=1920')
          : `${defaultUrl}&w=1920`,
        card: defaultUrl.includes('w=')
          ? defaultUrl.replace(/w=\d+/, 'w=800')
          : `${defaultUrl}&w=800`,
        mobile: defaultUrl.includes('w=')
          ? defaultUrl.replace(/w=\d+/, 'w=640')
          : `${defaultUrl}&w=640`,
        thumb: defaultUrl.includes('w=')
          ? defaultUrl.replace(/w=\d+/, 'w=400')
          : `${defaultUrl}&w=400`,
      },
    }
  }
}
