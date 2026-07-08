import { StationInfo } from '../types/trains';
import { STATION_CODES } from '../config/stations';

/**
 * Service to resolve station names/codes to Indian Railways station details.
 * Implements local seed database lookups, suggestions on failure, and fallback to the ERAIL public API.
 */
export class StationCodeResolver {
  /**
   * Resolves query to StationInfo.
   * If not found locally, queries the ERAIL API.
   * If both fail, throws a structured error with suggestions.
   */
  public static async resolve(query: string): Promise<StationInfo> {
    if (!query || query.trim().length === 0) {
      throw {
        status: 'error',
        code: 'STATION_NOT_FOUND',
        message: "Station name cannot be empty.",
        suggestions: this.getSuggestions(''),
      };
    }

    const normalized = query.toLowerCase().trim();

    // 1. Local seed check
    if (STATION_CODES[normalized]) {
      return STATION_CODES[normalized];
    }

    // Secondary local check (check if the query is a value in the STATION_CODES list by code, name, or city)
    for (const info of Object.values(STATION_CODES)) {
      if (
        info.code.toLowerCase() === normalized ||
        info.name.toLowerCase() === normalized ||
        info.city.toLowerCase() === normalized
      ) {
        return info;
      }
    }

    // 2. Fallback to ERAIL public API
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
        // Check if the response actually looks like JSON
        if (text.trim().startsWith('[') || text.trim().startsWith('{')) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Find a potential match in the returned array
            const first = parsed[0];
            const code = (first.code || first.stationCode || first.station_code || first.c || '').toUpperCase();
            const name = first.name || first.stationName || first.station_name || first.n || '';
            const city = first.city || first.cityName || first.city_name || first.l || name || '';

            if (code && name) {
              return { name, code, city };
            }
          }
        }
      }
    } catch (e) {
      console.warn('[StationCodeResolver] ERAIL API fallback failed:', e);
    }

    // 3. Fail and return suggestions
    const suggestions = this.getSuggestions(query);
    throw {
      status: 'error',
      code: 'STATION_NOT_FOUND',
      message: `Station '${query}' not found. Did you mean one of these?`,
      suggestions,
    };
  }

  /**
   * Returns suggestions for the user query based on string similarity (Levenshtein distance).
   */
  public static getSuggestions(query: string): StationInfo[] {
    const normalized = query.toLowerCase().trim();
    const uniqueStations = new Map<string, StationInfo>();

    // De-duplicate station info by code
    for (const info of Object.values(STATION_CODES)) {
      uniqueStations.set(info.code, info);
    }

    const list = Array.from(uniqueStations.values());
    if (normalized.length === 0) {
      // Return top 5 default stations if query is empty
      return list.slice(0, 5);
    }

    // Score and sort stations by similarity
    const scored = list.map((station) => {
      const codeDist = this.levenshtein(normalized, station.code.toLowerCase());
      const nameDist = this.levenshtein(normalized, station.name.toLowerCase());
      const cityDist = this.levenshtein(normalized, station.city.toLowerCase());

      // Check if substring match (gives extra weight)
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

  /**
   * Basic Levenshtein distance implementation.
   */
  private static levenshtein(a: string, b: string): number {
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
          matrix[i - 1][j] + 1,      // Deletion
          matrix[i][j - 1] + 1,      // Insertion
          matrix[i - 1][j - 1] + cost, // Substitution
        );
      }
    }

    return matrix[a.length][b.length];
  }
}
