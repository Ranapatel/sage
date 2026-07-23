import { Injectable, Logger } from '@nestjs/common';
import { TravelportHttpClient } from '../client/travelport-http.client';

@Injectable()
export class TravelportAncillariesAdapter {
  private readonly logger = new Logger(TravelportAncillariesAdapter.name);

  constructor(private readonly httpClient: TravelportHttpClient) {}

  /**
   * Retrieves interactive Seat Map / Availability (/air/search/seat/catalogofferingsancillaries/seatavailabilities)
   */
  async getSeatMap(offerRef: string, segmentRef: string): Promise<any> {
    this.logger.log(`[Travelport v11 SeatMap] Requesting seat map for Offer ${offerRef}, Segment ${segmentRef}`);

    const payload = {
      '@type': 'SeatAvailabilityQueryRequest',
      CatalogOfferingIdentifier: {
        id: offerRef,
      },
    };

    const response = await this.httpClient.post(
      '/air/search/seat/catalogofferingsancillaries/seatavailabilities',
      payload,
    );
    return this.normalizeSeatMap(response);
  }

  /**
   * Shops for Ancillary Catalog items like Baggage, Meals, Wifi, Lounge (/air/ancillaryshop/catalogofferingsancillaries)
   */
  async shopAncillaries(offerRef: string): Promise<any> {
    this.logger.log(`[Travelport v11 Ancillaries] Shopping ancillary catalog for Offer ${offerRef}`);

    const payload = {
      '@type': 'CatalogOfferingsAncillaryQueryRequest',
      CatalogOfferingIdentifier: {
        id: offerRef,
      },
    };

    return this.httpClient.post('/air/ancillaryshop/catalogofferingsancillaries', payload);
  }

  /**
   * Retrieves EMDs by locator (/air/emds/getbylocator)
   */
  async getEmdsByLocator(locator: string): Promise<any> {
    this.logger.log(`[Travelport v11 EMD] Retrieving EMDs for PNR ${locator}`);
    return this.httpClient.get(`/air/emds/getbylocator?locator=${encodeURIComponent(locator)}`);
  }

  private normalizeSeatMap(rawResponse: any): any {
    const seatMap =
      rawResponse?.SeatMapResponse?.SeatMap ||
      rawResponse?.SeatAvailabilityResponse?.SeatMap ||
      [];

    return {
      totalRows: 30,
      columns: ['A', 'B', 'C', 'D', 'E', 'F'],
      seats: seatMap,
    };
  }
}
