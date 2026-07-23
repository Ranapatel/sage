import { TravelportClient } from '../client/travelport.client';
import { TRAVELPORT_ENDPOINTS } from '../constants/travelport.constants';
import { FareRulesRequestDto, FareRulesResponseDto } from '../types/dto.types';
import { RawFareRulesRequest, RawFareRulesResponse } from '../types/raw.types';
import { FareRulesParser } from '../parsers/fareRules.parser';
import { getOrCreateTraceId } from '../utils/trace.utils';

export class FareRulesService {
  private client: TravelportClient;

  constructor() {
    this.client = TravelportClient.getInstance();
  }

  /**
   * Retrieves Standalone Fare Rules for a selected offer after Search / AirPrice.
   */
  public async getFareRules(requestDto: FareRulesRequestDto): Promise<FareRulesResponseDto> {
    const traceId = getOrCreateTraceId(requestDto.traceId);
    const startTime = Date.now();

    const rawPayload: RawFareRulesRequest = {
      FareRulesQueryBuildFromCatalogOffering: {
        '@type': 'FareRulesQueryBuildFromCatalogOffering',
        CatalogOfferingIdentifier: {
          '@type': 'CatalogOfferingIdentifier',
          Identifier: {
            value: requestDto.rawIdentifierValue || requestDto.catalogOfferingId,
          },
        },
      },
    };

    const clientResponse = await this.client.post<RawFareRulesResponse>(
      TRAVELPORT_ENDPOINTS.FARE_RULES_BUILD_FROM_CATALOG,
      rawPayload,
      { traceId }
    );

    const processingTimeMs = Date.now() - startTime;

    return FareRulesParser.parse(clientResponse.data, requestDto.catalogOfferingId, traceId, processingTimeMs);
  }
}
