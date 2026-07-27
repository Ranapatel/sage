import {
  Injectable,
  HttpException,
  HttpStatus,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { MakeMyTripProvider } from '../providers/MakeMyTripProvider';
import { UberProvider } from '../providers/UberProvider';
import { StationResolver } from './StationResolver';
import { CitySlugService } from './CitySlugService';
import { TransportCacheService } from './TransportCacheService';
import {
  SearchTrainsInput,
  SearchTrainsResult,
  SearchBusesInput,
  SearchBusesResult,
  CreateUberLinkDto,
} from '../types/transport';
import { isSameCountry } from '../utils/countryUtils';

@Injectable()
export class TransportService {
  constructor(
    private readonly mmtProvider: MakeMyTripProvider,
    private readonly uberProvider: UberProvider,
    @Inject(forwardRef(() => StationResolver))
    private readonly stationResolver: StationResolver,
    @Inject(forwardRef(() => CitySlugService))
    private readonly citySlugService: CitySlugService,
    private readonly cacheService: TransportCacheService,
  ) {}

  /**
   * Generates Uber deep links. Kept for legacy compatibility.
   */
  generateLink(
    providerName: string,
    dto: CreateUberLinkDto,
  ): {
    provider: string;
    url: string;
    destination: string;
    latitude: number;
    longitude: number;
  } {
    if (providerName.toLowerCase() !== 'uber') {
      throw new HttpException(
        `Transport provider '${providerName}' is not supported via generateLink.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const url = this.uberProvider.generateLink(dto);
    return {
      provider: 'Uber',
      url,
      destination: dto.destinationName,
      latitude: dto.latitude,
      longitude: dto.longitude,
    };
  }

  /**
   * Searches train itineraries via MakeMyTrip
   */
  async searchTrains(input: SearchTrainsInput): Promise<SearchTrainsResult> {
    const {
      departureCity,
      destinationCity,
      departureDate,
      passengers = 1,
      travelClass = '3A',
    } = input;

    // 1. Validate date
    this.validateDate(departureDate);

    // International Route Check: Do not search for international train routes
    if (!isSameCountry(departureCity, destinationCity)) {
      return {
        provider: 'MakeMyTrip',
        origin: { name: departureCity, code: departureCity, city: departureCity },
        destination: { name: destinationCity, code: destinationCity, city: destinationCity },
        travelDate: departureDate,
        preferredClass: travelClass || 'ALL',
        searchUrl: '',
        results: [],
        cacheHit: false,
        generatedAt: new Date().toISOString(),
        message: 'International train services are not available for this route.',
        isDomestic: false,
      } as any;
    }

    // 2. Resolve stations asynchronously
    const origin = await this.stationResolver.resolve(departureCity);
    const destination = await this.stationResolver.resolve(destinationCity);

    // 3. Check Cache
    const cacheKey = this.cacheService.generateKey(
      'train',
      origin.code,
      destination.code,
      departureDate,
    );
    const cached = await this.cacheService.get<SearchTrainsResult>(cacheKey);
    if (cached) {
      return {
        ...cached,
        cacheHit: true,
      };
    }

    // Prepare inputs with pre-resolved station codes for MMT Url generation on failure
    const resolvedInput: SearchTrainsInput = {
      departureCity: origin.code,
      destinationCity: destination.code,
      departureDate,
      passengers,
      travelClass,
    };

    const searchUrl = this.mmtProvider.getTrainBookingUrl(resolvedInput);

    try {
      // 4. Call MakeMyTrip provider
      const result = await this.mmtProvider.searchTrains(resolvedInput);

      // Restore full resolved names & cities for response
      result.origin.name = origin.name;
      result.origin.city = origin.city;
      result.destination.name = destination.name;
      result.destination.city = destination.city;

      // 5. Save in cache
      await this.cacheService.set(cacheKey, result);

      return result;
    } catch (err) {
      const error = err as Error;
      console.error(
        '[TransportService] MakeMyTrip train search failed:',
        error.message,
      );

      // Provider Unavailable Envelope — always includes searchUrl
      throw new HttpException(
        {
          status: 'unavailable',
          code: 'PROVIDER_UNAVAILABLE',
          message: `Train booking search failed: ${error.message}`,
          searchUrl,
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Searches bus itineraries via MakeMyTrip
   */
  async searchBuses(input: SearchBusesInput): Promise<SearchBusesResult> {
    const { departureCity, destinationCity, departureDate } = input;

    // 1. Validate date
    this.validateDate(departureDate);

    // 2. Resolve slugs asynchronously (catch resolution errors for unmapped international cities)
    let origin;
    let destination;
    try {
      origin = await this.citySlugService.resolve(departureCity);
      destination = await this.citySlugService.resolve(destinationCity);
    } catch (err) {
      if (!isSameCountry(departureCity, destinationCity)) {
        return {
          provider: 'MakeMyTrip',
          origin: { name: departureCity, slug: departureCity },
          destination: { name: destinationCity, slug: destinationCity },
          travelDate: departureDate,
          searchUrl: '',
          results: [],
          cacheHit: false,
          generatedAt: new Date().toISOString(),
          message: 'International bus services are not available for this route.',
          isDomestic: false,
        } as any;
      }
      throw err;
    }

    // 3. Check Cache
    const cacheKey = this.cacheService.generateKey(
      'bus',
      origin.slug,
      destination.slug,
      departureDate,
    );
    const cached = await this.cacheService.get<SearchBusesResult>(cacheKey);
    if (cached) {
      return {
        ...cached,
        cacheHit: true,
      };
    }

    // Prepare inputs with pre-resolved slugs for MMT Url generation on failure
    const resolvedInput: SearchBusesInput = {
      departureCity: origin.slug,
      destinationCity: destination.slug,
      departureDate,
    };

    const searchUrl = this.mmtProvider.getBusBookingUrl(resolvedInput);

    try {
      // 4. Call MakeMyTrip provider
      const result = await this.mmtProvider.searchBuses(resolvedInput);

      // Restore full resolved names for response
      result.origin.name = origin.name;
      result.destination.name = destination.name;

      if (!isSameCountry(departureCity, destinationCity)) {
        (result as any).isDomestic = false;
        if (!result.results || result.results.length === 0) {
          (result as any).message = 'International bus services are not available for this route.';
        }
      }

      // 5. Save in cache
      await this.cacheService.set(cacheKey, result);

      return result;
    } catch (err) {
      if (!isSameCountry(departureCity, destinationCity)) {
        return {
          provider: 'MakeMyTrip',
          origin: { name: origin.name, slug: origin.slug },
          destination: { name: destination.name, slug: destination.slug },
          travelDate: departureDate,
          searchUrl,
          results: [],
          cacheHit: false,
          generatedAt: new Date().toISOString(),
          message: 'International bus services are not available for this route.',
          isDomestic: false,
        } as any;
      }

      const error = err as Error;
      console.error(
        '[TransportService] MakeMyTrip bus search failed:',
        error.message,
      );

      throw new HttpException(
        {
          status: 'unavailable',
          code: 'PROVIDER_UNAVAILABLE',
          message: `Bus booking search failed: ${error.message}`,
          searchUrl,
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Common date validation helper
   */
  private validateDate(dateStr: string): void {
    const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local
    if (dateStr < todayStr) {
      throw new HttpException(
        {
          status: 'error',
          code: 'INVALID_DATE',
          message: `Departure date ${dateStr} is in the past. Today is ${todayStr}.`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
