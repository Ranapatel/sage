import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CityInfo } from '../types/transport';
import { CITY_SLUG_MAP } from '../config/cities';

@Injectable()
export class CitySlugService {
  // Permanent in-memory cache with no TTL
  private readonly cache = new Map<string, CityInfo>();

  /**
   * Resolves a city name to CityInfo.
   * Checks local seed map first, then cache. Throws CITY_NOT_FOUND if not matching supported cities.
   */
  async resolve(query: string): Promise<CityInfo> {
    await Promise.resolve();
    if (!query || query.trim().length === 0) {
      throw new HttpException(
        {
          status: 'error',
          code: 'CITY_NOT_FOUND',
          message: 'City name cannot be empty.',
          suggestions: this.getSuggestions(''),
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const normalized = query.toLowerCase().trim();

    // 1. Check local seed map
    if (CITY_SLUG_MAP[normalized]) {
      return CITY_SLUG_MAP[normalized];
    }

    // Secondary local check (check values by name or slug)
    for (const info of Object.values(CITY_SLUG_MAP)) {
      if (info.slug === normalized || info.name.toLowerCase() === normalized) {
        return info;
      }
    }

    // 2. Check permanent cache
    if (this.cache.has(normalized)) {
      return this.cache.get(normalized)!;
    }

    // If it's not in the supported seed map, throw CITY_NOT_FOUND with suggestions
    const suggestions = this.getSuggestions(query);
    throw new HttpException(
      {
        status: 'error',
        code: 'CITY_NOT_FOUND',
        message: `City '${query}' is not supported for bus booking. Did you mean one of these?`,
        suggestions,
      },
      HttpStatus.NOT_FOUND,
    );
  }

  /**
   * Synchronously resolves a query to a city slug (used by getBusBookingUrl).
   * Falls back to dynamic slug generation if not found in the seed map.
   */
  resolveSlugSync(query: string): string {
    if (!query) return 'delhi';

    const normalized = query.toLowerCase().trim();

    // Check seed map
    if (CITY_SLUG_MAP[normalized]) {
      return CITY_SLUG_MAP[normalized].slug;
    }

    for (const info of Object.values(CITY_SLUG_MAP)) {
      if (info.slug === normalized || info.name.toLowerCase() === normalized) {
        return info.slug;
      }
    }

    // Check cache
    if (this.cache.has(normalized)) {
      return this.cache.get(normalized)!.slug;
    }

    // Dynamic slug generation rule: lowercase, spaces -> hyphens, remove special characters
    return normalized.replace(/\s+/g, '-').replace(/[^\w-]/g, '');
  }

  /**
   * Generates suggestions based on Levenshtein distance
   */
  getSuggestions(query: string): CityInfo[] {
    const normalized = query.toLowerCase().trim();
    const uniqueCities = new Map<string, CityInfo>();

    for (const info of Object.values(CITY_SLUG_MAP)) {
      uniqueCities.set(info.slug, info);
    }

    const list = Array.from(uniqueCities.values());
    if (normalized.length === 0) {
      return list.slice(0, 5);
    }

    const scored = list.map((city) => {
      const slugDist = this.levenshtein(normalized, city.slug);
      const nameDist = this.levenshtein(normalized, city.name.toLowerCase());

      let bonus = 0;
      if (city.slug.includes(normalized)) bonus += 10;
      if (city.name.toLowerCase().includes(normalized)) bonus += 5;

      const minDistance = Math.min(slugDist, nameDist);
      const score = minDistance - bonus;

      return { city, score };
    });

    scored.sort((a, b) => a.score - b.score);
    return scored.slice(0, 5).map((item) => item.city);
  }

  private levenshtein(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= a.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= b.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost,
        );
      }
    }

    return matrix[a.length][b.length];
  }
}
