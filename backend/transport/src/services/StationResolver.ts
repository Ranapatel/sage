import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { StationInfo } from '../types/transport';
import { STATION_SEED_MAP } from '../config/stations';

@Injectable()
export class StationResolver {
  // In-memory 24-hour cache for station resolution
  private readonly cache = new Map<
    string,
    { info: StationInfo; expiry: number }
  >();
  private readonly CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Resolves a station query to StationInfo asynchronously.
   * Checks local seed map, then cache, then ERAIL API, and throws structured error if all fail.
   */
  async resolve(query: string): Promise<StationInfo> {
    if (!query || query.trim().length === 0) {
      throw new HttpException(
        {
          status: 'error',
          code: 'STATION_NOT_FOUND',
          message: 'Station name cannot be empty.',
          suggestions: this.getSuggestions(''),
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const normalized = query.toLowerCase().trim();

    // 1. Check local seed map first
    if (STATION_SEED_MAP[normalized]) {
      return STATION_SEED_MAP[normalized];
    }

    // Secondary local check (check if the query is a value in the STATION_SEED_MAP by code, name, or city)
    for (const info of Object.values(STATION_SEED_MAP)) {
      if (
        info.code.toLowerCase() === normalized ||
        info.name.toLowerCase() === normalized ||
        info.city.toLowerCase() === normalized
      ) {
        return info;
      }
    }

    // 2. Check 24-hour cache
    const cached = this.cache.get(normalized);
    if (cached && Date.now() < cached.expiry) {
      return cached.info;
    }

    // 3. Fallback to ERAIL public API
    try {
      const url = `https://erail.in/rail/getStations.aspx?StationCode=${encodeURIComponent(
        query,
      )}&DataSource=0&ApiVer=1&UserId=2&Response=JsonString`;

      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'application/json, text/plain, */*',
        },
      });

      if (response.ok) {
        const text = await response.text();
        if (text.trim().startsWith('[') || text.trim().startsWith('{')) {
          const parsed = JSON.parse(text) as Record<string, any>[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            const first = parsed[0];
            const code = String(
              first.code ||
                first.stationCode ||
                first.station_code ||
                first.c ||
                '',
            ).toUpperCase();
            const name = String(
              first.name ||
                first.stationName ||
                first.station_name ||
                first.n ||
                '',
            );
            const city = String(
              first.city ||
                first.cityName ||
                first.city_name ||
                first.l ||
                name ||
                '',
            );

            if (code && name) {
              const stationInfo: StationInfo = { name, code, city };
              // Store in 24-hour cache
              this.cache.set(normalized, {
                info: stationInfo,
                expiry: Date.now() + this.CACHE_TTL_MS,
              });
              return stationInfo;
            }
          }
        }
      }
    } catch (e) {
      console.warn('[StationResolver] ERAIL API fallback failed:', e);
    }

    // 4. Fail and return suggestions
    const suggestions = this.getSuggestions(query);
    throw new HttpException(
      {
        status: 'error',
        code: 'STATION_NOT_FOUND',
        message: `Station '${query}' not found. Did you mean one of these?`,
        suggestions,
      },
      HttpStatus.NOT_FOUND,
    );
  }

  /**
   * Synchronously resolves a query to a station code (used by getTrainBookingUrl).
   * Does not perform external network calls.
   */
  resolveCodeSync(query: string): string {
    if (!query) return 'CSTM'; // Default fallback

    const normalized = query.toLowerCase().trim();

    // If query is already a valid code format, return it
    if (/^[A-Z]{3,4}$/.test(query)) {
      return query;
    }

    // Check local seed map
    if (STATION_SEED_MAP[normalized]) {
      return STATION_SEED_MAP[normalized].code;
    }

    // Check local values
    for (const info of Object.values(STATION_SEED_MAP)) {
      if (
        info.code.toLowerCase() === normalized ||
        info.name.toLowerCase() === normalized ||
        info.city.toLowerCase() === normalized
      ) {
        return info.code;
      }
    }

    // Check 24-hour cache
    const cached = this.cache.get(normalized);
    if (cached) {
      return cached.info.code;
    }

    // Fallback: return uppercase query
    return query.toUpperCase();
  }

  /**
   * Generates suggestions based on Levenshtein distance
   */
  getSuggestions(query: string): StationInfo[] {
    const normalized = query.toLowerCase().trim();
    const uniqueStations = new Map<string, StationInfo>();

    for (const info of Object.values(STATION_SEED_MAP)) {
      uniqueStations.set(info.code, info);
    }

    const list = Array.from(uniqueStations.values());
    if (normalized.length === 0) {
      return list.slice(0, 5);
    }

    const scored = list.map((station) => {
      const codeDist = this.levenshtein(normalized, station.code.toLowerCase());
      const nameDist = this.levenshtein(normalized, station.name.toLowerCase());
      const cityDist = this.levenshtein(normalized, station.city.toLowerCase());

      let bonus = 0;
      if (station.code.toLowerCase().includes(normalized)) bonus += 10;
      if (station.name.toLowerCase().includes(normalized)) bonus += 5;
      if (station.city.toLowerCase().includes(normalized)) bonus += 5;

      const minDistance = Math.min(codeDist, nameDist, cityDist);
      const score = minDistance - bonus;

      return { station, score };
    });

    scored.sort((a, b) => a.score - b.score);
    return scored.slice(0, 5).map((item) => item.station);
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
