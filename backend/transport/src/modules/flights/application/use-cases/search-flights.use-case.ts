import { Injectable, Logger } from '@nestjs/common';
import { TravelportSearchAdapter } from '../../infrastructure/travelport/adapters/travelport-search.adapter';
import { RedisSearchSessionStore } from '../../infrastructure/redis/redis-search-session.store';
import { SearchFlightsCriteriaDto } from '../dtos/search-flight.dto';

@Injectable()
export class SearchFlightsUseCase {
  private readonly logger = new Logger(SearchFlightsUseCase.name);

  constructor(
    private readonly searchAdapter: TravelportSearchAdapter,
    private readonly sessionStore: RedisSearchSessionStore,
  ) {}

  async execute(criteria: SearchFlightsCriteriaDto): Promise<any> {
    this.logger.log(`Executing SearchFlightsUseCase for ${criteria.origin} → ${criteria.destination}`);

    // Call Travelport Search Adapter
    const result = await this.searchAdapter.searchOffers(criteria);

    // Save session in Redis
    if (result && result.offers) {
      const sessionId = await this.sessionStore.saveSession(criteria, result.offers);
      result.sessionId = sessionId;
    }

    return result;
  }
}
