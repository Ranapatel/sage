import { Injectable, Logger } from '@nestjs/common';
import { TravelportHttpClient } from '../client/travelport-http.client';
import { SearchFlightsCriteriaDto } from '../../../application/dtos/search-flight.dto';

@Injectable()
export class TravelportSearchAdapter {
  private readonly logger = new Logger(TravelportSearchAdapter.name);

  constructor(private readonly httpClient: TravelportHttpClient) {}

  /**
   * Executes Air Search against Travelport 11.35.0 (/air/catalog/search/catalogproductofferings)
   * Polymorphic Request Type: CatalogProductOfferingsQueryRequest
   */
  async searchOffers(criteria: SearchFlightsCriteriaDto): Promise<any> {
    this.logger.log(
      `[Travelport v11 Search] Searching ${criteria.origin} → ${criteria.destination} (${criteria.departureDate})`,
    );

    const passengerCriteriaList: any[] = [];
    let paxIndex = 1;

    const addPaxType = (typeCode: string, count?: number) => {
      const num = count || 1;
      for (let i = 0; i < num; i++) {
        passengerCriteriaList.push({
          '@type': 'PassengerCriteria',
          number: 1,
          passengerTypeCode: typeCode,
          id: `pax_${paxIndex++}`,
        });
      }
    };

    if (criteria.adults && criteria.adults > 0) addPaxType('ADT', criteria.adults);
    if (criteria.children && criteria.children > 0) addPaxType('CNN', criteria.children);
    if (criteria.infants && criteria.infants > 0) addPaxType('INF', criteria.infants);
    if (passengerCriteriaList.length === 0) addPaxType('ADT', 1);

    const legList = [
      {
        departureDate: criteria.departureDate,
        From: {
          value: criteria.origin,
          cityOrAirport: 'City or Airport',
        },
        To: {
          value: criteria.destination,
          cityOrAirport: 'City or Airport',
        },
      },
    ];

    if (criteria.returnDate) {
      legList.push({
        departureDate: criteria.returnDate,
        From: {
          value: criteria.destination,
          cityOrAirport: 'City or Airport',
        },
        To: {
          value: criteria.origin,
          cityOrAirport: 'City or Airport',
        },
      });
    }

    const payload = {
      '@type': 'CatalogProductOfferingsQueryRequest',
      CatalogProductOfferingsRequest: {
        '@type': 'CatalogProductOfferingsRequestAir',
        SearchCriteriaFlight: legList,
        PassengerCriteria: passengerCriteriaList,
        SearchModifiersAir: {
          '@type': 'SearchModifiersAir',
          CabinPreference: [
            {
              '@type': 'CabinPreference',
              preferenceType: 'Preferred',
              cabins: [criteria.cabinClass || 'Economy'],
            },
          ],
        },
      },
    };

    const response = await this.httpClient.post('/air/catalog/search/catalogproductofferings', payload);
    return this.normalizeSearchResponse(response);
  }

  /**
   * Price offer from catalog offerings (/air/price/offers/buildfromcatalogproductofferings)
   */
  async priceOffer(catalogOfferingId: string): Promise<any> {
    const payload = {
      '@type': 'PriceOfferQueryBuildFromCatalogProductOfferings',
      BuildFromCatalogProductOfferings: {
        '@type': 'BuildFromCatalogProductOfferings',
        CatalogProductOfferingIdentifier: {
          id: catalogOfferingId,
        },
      },
    };

    return this.httpClient.post('/air/price/offers/buildfromcatalogproductofferings', payload);
  }

  /**
   * Fetches Fare Rules from offer (/air/farerule/farerules/fromoffer)
   */
  async getFareRules(offerId: string): Promise<any> {
    return this.httpClient.get(`/air/farerule/farerules/fromoffer?offerId=${encodeURIComponent(offerId)}`);
  }

  private normalizeSearchResponse(rawResponse: any): any {
    const catalogOfferings =
      rawResponse?.CatalogOfferingsResponse?.CatalogOfferings?.CatalogOffering ||
      rawResponse?.CatalogOfferings?.CatalogOffering ||
      [];

    const offers = catalogOfferings.map((offering: any, index: number) => {
      const price =
        offering.TotalPrice ||
        offering.Price?.TotalPrice ||
        offering.ProductOptions?.[0]?.TotalPrice ||
        0;

      const currency = offering.CurrencyCode || offering.Price?.CurrencyCode || 'INR';

      return {
        id: offering.id || offering.Identifier?.value || `tp_offering_${index}`,
        offerRef: offering.id || offering.Identifier?.value,
        price: typeof price === 'number' ? price : parseFloat(price),
        currency,
        isRefundable: offering.refundable === 'Yes' || false,
        validUntil: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        rawPayload: offering,
      };
    });

    return {
      transactionId: rawResponse?.CatalogOfferingsResponse?.transactionId || rawResponse?.transactionId || '',
      traceId: rawResponse?.CatalogOfferingsResponse?.traceId || rawResponse?.traceId || '',
      offersCount: offers.length,
      offers,
    };
  }
}
