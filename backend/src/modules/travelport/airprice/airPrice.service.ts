import { TravelportClient } from '../client/travelport.client';
import { TRAVELPORT_ENDPOINTS } from '../constants/travelport.constants';
import { AirPriceRequestDto, AirPriceResponseDto } from '../types/dto.types';
import { RawAirPriceReferencePayloadRequest, RawAirPriceResponse } from '../types/raw.types';
import { AirPriceParser } from '../parsers/airPrice.parser';
import { getOrCreateTraceId } from '../utils/trace.utils';

export class AirPriceService {
  private client: TravelportClient;

  constructor() {
    this.client = TravelportClient.getInstance();
  }

  /**
   * Confirms price and details for a selected offer using Reference Payload workflow ONLY.
   */
  public async priceOffer(requestDto: AirPriceRequestDto): Promise<AirPriceResponseDto> {
    const traceId = getOrCreateTraceId(requestDto.traceId);
    const startTime = Date.now();

    const rawPayload: RawAirPriceReferencePayloadRequest = {
      AirPriceQueryBuildFromCatalogOffering: {
        '@type': 'AirPriceQueryBuildFromCatalogOffering',
        CatalogOfferingIdentifier: {
          '@type': 'CatalogOfferingIdentifier',
          Identifier: {
            value: requestDto.rawIdentifierValue || requestDto.catalogOfferingId,
          },
          CatalogOfferingRef: requestDto.catalogOfferingId,
        },
      },
    };

    const clientResponse = await this.client.post<RawAirPriceResponse>(
      TRAVELPORT_ENDPOINTS.AIR_PRICE_BUILD_FROM_CATALOG,
      rawPayload,
      { traceId }
    );

    const processingTimeMs = Date.now() - startTime;

    return AirPriceParser.parse(clientResponse.data, traceId, processingTimeMs);
  }
}
