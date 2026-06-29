import { SearchTrainsInput, SearchTrainsOutput, TrainClass } from '../types/trains';
import { StationCodeResolver } from '../services/stationResolver';
import { MMTTrainProvider } from '../providers/makemytrip/MMTTrainProvider';
import { TrainCacheService } from '../services/trainCacheService';

/**
 * Validates that travelDate is today or a future date.
 */
function validateDate(travelDate: string): boolean {
  const inputDate = new Date(travelDate);
  if (isNaN(inputDate.getTime())) {
    return false;
  }
  
  // Set time of both dates to midnight to compare date only
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  inputDate.setHours(0, 0, 0, 0);

  return inputDate >= today;
}

/**
 * MCP tool schema definition for searchTrains.
 */
export const searchTrainsSchema = {
  name: 'searchTrains',
  description: 'Search train options between two Indian stations and generate a MakeMyTrip deep link.',
  inputSchema: {
    type: 'object',
    properties: {
      originStation: {
        type: 'string',
        description: 'Station name or code e.g. "Mumbai" or "CSTM"',
      },
      destinationStation: {
        type: 'string',
        description: 'Station name or code e.g. "Madgaon" or "MAO"',
      },
      travelDate: {
        type: 'string',
        description: 'ISO format: YYYY-MM-DD',
      },
      passengers: {
        type: 'number',
        description: 'Number of passengers (1-6). Default is 1.',
        minimum: 1,
        maximum: 6,
        default: 1,
      },
      preferredClass: {
        type: 'string',
        description: 'Preferred class code. Default is "3A".',
        enum: ['SL', '3A', '2A', '1A', 'CC', 'EC'],
        default: '3A',
      },
    },
    required: ['originStation', 'destinationStation', 'travelDate'],
  },
};

/**
 * Core handler to execute train search.
 * This handler catches all business exceptions and returns them as structured responses.
 */
export async function executeSearchTrains(
  input: SearchTrainsInput,
): Promise<SearchTrainsOutput | { status: string; code: string; message: string; suggestions?: any[]; searchUrl?: string }> {
  try {
    const passengers = input.passengers ?? 1;
    const preferredClass: TrainClass = input.preferredClass ?? '3A';
    
    // 1. Validate passenger bounds
    if (passengers < 1 || passengers > 6) {
      return {
        status: 'error',
        code: 'INVALID_PASSENGERS',
        message: 'Number of passengers must be between 1 and 6.',
      };
    }

    // 2. Validate Travel Date
    if (!validateDate(input.travelDate)) {
      return {
        status: 'error',
        code: 'INVALID_DATE',
        message: 'Travel date must be today or a future date.',
      };
    }

    // 3. Resolve stations
    let origin;
    try {
      origin = await StationCodeResolver.resolve(input.originStation);
    } catch (e: any) {
      if (e.code === 'STATION_NOT_FOUND') return e;
      throw e;
    }

    let destination;
    try {
      destination = await StationCodeResolver.resolve(input.destinationStation);
    } catch (e: any) {
      if (e.code === 'STATION_NOT_FOUND') return e;
      throw e;
    }

    // 4. Build MMT deep link url
    const provider = new MMTTrainProvider();
    const searchUrl = provider.buildSearchUrl(
      { ...input, passengers, preferredClass },
      origin,
      destination,
    );

    // 5. Caching lookup
    const cacheKey = TrainCacheService.getTrainCacheKey(
      origin.code,
      destination.code,
      input.travelDate,
      preferredClass,
    );

    const cachedResults = await TrainCacheService.getTrains(cacheKey);
    if (cachedResults) {
      return {
        provider: 'MakeMyTrip',
        strategy: 'scraped',
        origin,
        destination,
        travelDate: input.travelDate,
        searchUrl,
        results: cachedResults,
        totalResults: cachedResults.length,
        cacheHit: true,
        generatedAt: new Date().toISOString(),
      };
    }

    // 6. Search lookup
    try {
      const results = await provider.search({
        ...input,
        passengers,
        preferredClass,
      });

      await TrainCacheService.setTrains(cacheKey, results);

      return {
        provider: 'MakeMyTrip',
        strategy: results.length > 0 ? 'scraped' : 'deeplink',
        origin,
        destination,
        travelDate: input.travelDate,
        searchUrl,
        results,
        totalResults: results.length,
        cacheHit: false,
        generatedAt: new Date().toISOString(),
      };
    } catch (err: any) {
      console.error('[searchTrains Tool] Provider search failed:', err);
      // Fail gracefully: fallback to Strategy A and return searchUrl
      return {
        status: 'unavailable',
        code: 'PROVIDER_UNAVAILABLE',
        message: 'Train search is temporarily unavailable. Open MakeMyTrip to search manually.',
        searchUrl,
      };
    }
  } catch (err: any) {
    console.error('[searchTrains Tool] Unexpected exception:', err);
    return {
      status: 'error',
      code: 'UNEXPECTED_ERROR',
      message: err.message || 'An unexpected error occurred during train search.',
    };
  }
}
