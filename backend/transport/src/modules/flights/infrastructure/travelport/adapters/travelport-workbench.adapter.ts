import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { TravelportHttpClient } from '../client/travelport-http.client';

export interface TravelerDetails {
  passengerTypeCode: 'ADT' | 'CNN' | 'INF' | 'YTH';
  givenName: string;
  surname: string;
  gender: 'M' | 'F' | 'Undisclosed';
  birthDate: string; // YYYY-MM-DD
  passportNumber?: string;
  passportExpiration?: string; // YYYY-MM-DD
  nationality?: string;
}

@Injectable()
export class TravelportWorkbenchAdapter {
  private readonly logger = new Logger(TravelportWorkbenchAdapter.name);

  constructor(private readonly httpClient: TravelportHttpClient) {}

  /**
   * Step 1: Create Workbench Session (/air/book/session/reservationworkbench)
   */
  async createWorkbench(): Promise<{ workbenchId: string }> {
    this.logger.log(`[Travelport v11 Workbench] Creating new workbench session...`);
    const payload = {
      '@type': 'ReservationWorkbenchCreateRequest',
    };

    const response = await this.httpClient.post('/air/book/session/reservationworkbench', payload);

    const workbenchId =
      response?.ReservationWorkbenchResponse?.ReservationWorkbench?.Identifier?.value ||
      response?.ReservationWorkbench?.Identifier?.value ||
      response?.ReservationWorkbench?.id ||
      response?.id;

    if (!workbenchId) {
      this.logger.error(`[Travelport v11 Workbench] API did not return a valid ReservationWorkbench identifier.`);
      throw new BadRequestException('Travelport API failed to return a valid workbench session identifier.');
    }

    this.logger.log(`[Travelport v11 Workbench] ✅ Workbench session created: ${workbenchId}`);
    return { workbenchId };
  }

  /**
   * Step 2: Add Offer to Workbench (/air/book/airoffer/reservationworkbench/{workbenchId}/offers/buildfromcatalogproductofferings)
   */
  async addOffer(workbenchId: string, offerRef: string): Promise<any> {
    this.logger.log(`[Travelport v11 Workbench] Adding offer ${offerRef} to session ${workbenchId}...`);

    const payload = {
      '@type': 'OfferQueryBuildFromCatalogProductOfferings',
      BuildFromCatalogProductOfferings: {
        '@type': 'BuildFromCatalogProductOfferings',
        CatalogProductOfferingIdentifier: {
          id: offerRef,
          CatalogProductOfferingRef: offerRef,
        },
      },
    };

    return this.httpClient.post(
      `/air/book/airoffer/reservationworkbench/${encodeURIComponent(workbenchId)}/offers/buildfromcatalogproductofferings`,
      payload,
      workbenchId,
    );
  }

  /**
   * Step 3: Add Traveler Details to Workbench (/air/book/traveler/reservationworkbench/{workbenchId}/travelers)
   */
  async addTraveler(workbenchId: string, traveler: TravelerDetails): Promise<any> {
    this.logger.log(
      `[Travelport v11 Workbench] Adding traveler ${traveler.givenName} ${traveler.surname} to session ${workbenchId}...`,
    );

    const payload = {
      '@type': 'TravelerListRequest',
      Traveler: [
        {
          '@type': 'Traveler',
          passengerTypeCode: traveler.passengerTypeCode,
          PersonName: {
            given: traveler.givenName,
            surname: traveler.surname,
          },
          Gender: traveler.gender,
          birthDate: traveler.birthDate,
          ...(traveler.passportNumber && {
            TravelDocument: [
              {
                docType: 'Passport',
                docID: traveler.passportNumber,
                expireDate: traveler.passportExpiration,
                issueCountry: traveler.nationality || 'IND',
              },
            ],
          }),
        },
      ],
    };

    return this.httpClient.post(
      `/air/book/traveler/reservationworkbench/${encodeURIComponent(workbenchId)}/travelers`,
      payload,
      workbenchId,
    );
  }

  /**
   * Step 4: Commit Workbench -> Creates PNR Reservation (/air/book/reservation/reservations/{workbenchId})
   */
  async commitWorkbench(workbenchId: string): Promise<{ pnrLocator: string; reservationPayload: any }> {
    this.logger.log(`[Travelport v11 Workbench] Committing session ${workbenchId} to generate PNR Locator...`);

    const payload = {
      '@type': 'ReservationCommitRequest',
    };

    const response = await this.httpClient.post(
      `/air/book/reservation/reservations/${encodeURIComponent(workbenchId)}`,
      payload,
      workbenchId,
    );

    const pnrLocator =
      response?.ReservationResponse?.Reservation?.Locator?.value ||
      response?.Reservation?.Locator?.value;

    if (!pnrLocator) {
      this.logger.error(`[Travelport v11 Workbench] Reservation commit succeeded but no Locator value was returned.`);
      throw new BadRequestException('Travelport API did not return a valid PNR Locator.');
    }

    this.logger.log(`[Travelport v11 Workbench] ✅ PNR Locator created successfully: ${pnrLocator}`);
    return { pnrLocator, reservationPayload: response };
  }

  /**
   * Form of Payment Injection (/air/payment/reservationworkbench/{workbenchId}/formofpayment)
   */
  async addFormOfPayment(workbenchId: string, fopDetails: any): Promise<any> {
    const payload = {
      '@type': 'FormOfPaymentRequest',
      FormOfPayment: [fopDetails],
    };

    return this.httpClient.post(
      `/air/payment/reservationworkbench/${encodeURIComponent(workbenchId)}/formofpayment`,
      payload,
      workbenchId,
    );
  }
}
