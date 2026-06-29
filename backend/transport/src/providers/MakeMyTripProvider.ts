import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { ITransportProvider } from './interfaces/ITransportProvider';
import {
  SearchTrainsInput,
  SearchTrainsResult,
  SearchBusesInput,
  SearchBusesResult,
  TrainResult,
  BusResult,
} from '../types/transport';
import { StationResolver } from '../services/StationResolver';
import { CitySlugService } from '../services/CitySlugService';
import { MMTTrainScraper } from './makemytrip/MMTTrainScraper';
import { MMTBusScraper } from './makemytrip/MMTBusScraper';

@Injectable()
export class MakeMyTripProvider implements ITransportProvider {
  public readonly name = 'MakeMyTrip';

  constructor(
    @Inject(forwardRef(() => StationResolver))
    private readonly stationResolver: StationResolver,
    @Inject(forwardRef(() => CitySlugService))
    private readonly citySlugService: CitySlugService,
    private readonly trainScraper: MMTTrainScraper,
    private readonly busScraper: MMTBusScraper,
  ) {}

  /**
   * Generates official MakeMyTrip train search URL.
   * Expects pre-resolved station codes, or resolves them synchronously from seed map if possible.
   */
  getTrainBookingUrl(input: SearchTrainsInput): string {
    const {
      departureCity,
      destinationCity,
      departureDate,
      passengers = 1,
      travelClass = '3A',
    } = input;

    // Resolve station codes. If they look like codes, use them directly, else try synchronous lookup.
    const fromCode = this.stationResolver.resolveCodeSync(departureCity);
    const toCode = this.stationResolver.resolveCodeSync(destinationCity);

    // Map ALL or empty class to standard 3A class
    const finalClass =
      travelClass === 'ALL' || !travelClass ? '3A' : travelClass;

    return `https://www.makemytrip.com/railways/listing.html?from=${fromCode}&to=${toCode}&departDate=${departureDate}&pax=${passengers}&class=${finalClass}`;
  }

  /**
   * Generates official MakeMyTrip bus search URL.
   * Expects pre-resolved slugs, or computes them synchronously.
   */
  getBusBookingUrl(input: SearchBusesInput): string {
    const { departureCity, destinationCity, departureDate } = input;

    const fromSlug = this.citySlugService.resolveSlugSync(departureCity);
    const toSlug = this.citySlugService.resolveSlugSync(destinationCity);

    // Parse YYYY-MM-DD
    const dateParts = departureDate.split('-');
    if (dateParts.length !== 3) {
      throw new Error(
        `Invalid date format: ${departureDate}. Expected YYYY-MM-DD.`,
      );
    }
    const [year, month, day] = dateParts;

    return `https://www.makemytrip.com/bus-tickets/${fromSlug}-to-${toSlug}/?dd=${day}&mm=${month}&yy=${year}`;
  }

  /**
   * Executes MMT train search. Resolves station details asynchronously,
   * generates listing URL, and queries the train scraper stub.
   */
  async searchTrains(input: SearchTrainsInput): Promise<SearchTrainsResult> {
    // Asynchronously resolve stations to ensure accuracy (calls erail fallback if necessary)
    const originStation = await this.stationResolver.resolve(
      input.departureCity,
    );
    const destinationStation = await this.stationResolver.resolve(
      input.destinationCity,
    );

    const resolvedInput: SearchTrainsInput = {
      ...input,
      departureCity: originStation.code,
      destinationCity: destinationStation.code,
    };

    const searchUrl = this.getTrainBookingUrl(resolvedInput);

    // Execute scraper stub
    let results: TrainResult[] = [];
    try {
      results = await this.trainScraper.scrape(
        originStation.code,
        destinationStation.code,
        input.departureDate,
      );
    } catch (e) {
      console.warn('[MakeMyTripProvider] Train scraper failed:', e);
    }

    return {
      provider: 'MakeMyTrip',
      origin: {
        name: originStation.name,
        code: originStation.code,
        city: originStation.city,
      },
      destination: {
        name: destinationStation.name,
        code: destinationStation.code,
        city: destinationStation.city,
      },
      travelDate: input.departureDate,
      preferredClass: input.travelClass || 'ALL',
      searchUrl,
      results,
      cacheHit: false,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Executes MMT bus search. Resolves city slugs asynchronously,
   * generates listing URL, and queries the bus scraper stub.
   */
  async searchBuses(input: SearchBusesInput): Promise<SearchBusesResult> {
    const originCity = await this.citySlugService.resolve(input.departureCity);
    const destinationCity = await this.citySlugService.resolve(
      input.destinationCity,
    );

    const resolvedInput: SearchBusesInput = {
      ...input,
      departureCity: originCity.slug,
      destinationCity: destinationCity.slug,
    };

    const searchUrl = this.getBusBookingUrl(resolvedInput);

    // Execute scraper stub
    let results: BusResult[] = [];
    try {
      results = await this.busScraper.scrape(
        originCity.slug,
        destinationCity.slug,
        input.departureDate,
      );
    } catch (e) {
      console.warn('[MakeMyTripProvider] Bus scraper failed:', e);
    }

    return {
      provider: 'MakeMyTrip',
      origin: {
        name: originCity.name,
        slug: originCity.slug,
      },
      destination: {
        name: destinationCity.name,
        slug: destinationCity.slug,
      },
      travelDate: input.departureDate,
      searchUrl,
      results,
      cacheHit: false,
      generatedAt: new Date().toISOString(),
    };
  }
}
