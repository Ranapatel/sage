import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { TravelportHttpClient } from '../client/travelport-http.client';

@Injectable()
export class TravelportTicketingAdapter {
  private readonly logger = new Logger(TravelportTicketingAdapter.name);

  constructor(private readonly httpClient: TravelportHttpClient) {}

  /**
   * Executes payment & ticket issuance for a committed workbench session (/air/paymentoffer/reservationworkbench/{workbenchId}/payments)
   */
  async issueTicket(reservationLocator: string, fopToken: string): Promise<any> {
    this.logger.log(`[Travelport v11 Ticketing] Requesting payment and ticket issuance for PNR: ${reservationLocator}`);

    const payload = {
      '@type': 'PaymentOfferRequest',
      Payment: [
        {
          '@type': 'Payment',
          amount: {
            currencyCode: 'INR',
          },
          FormOfPaymentRef: fopToken,
        },
      ],
    };

    const response = await this.httpClient.post(
      `/air/paymentoffer/reservationworkbench/${encodeURIComponent(reservationLocator)}/payments`,
      payload,
      reservationLocator,
    );

    const ticketNumber =
      response?.TicketResponse?.Ticket?.[0]?.ticketNumber ||
      response?.Ticket?.[0]?.ticketNumber;

    if (!ticketNumber) {
      this.logger.error(`[Travelport v11 Ticketing] Payment response succeeded but no ticketNumber was returned.`);
      throw new BadRequestException('Travelport API failed to issue a valid e-ticket number.');
    }

    this.logger.log(`[Travelport v11 Ticketing] ✅ Ticket Issued: ${ticketNumber} for PNR ${reservationLocator}`);
    return {
      ticketNumber,
      issuedAt: new Date().toISOString(),
      rawPayload: response,
    };
  }

  /**
   * Executes 24-hour instant ticket void / NDC Cancel Offer (/air/book/airoffer/reservationworkbench/{workbenchId}/offers/canceloffer)
   * Polymorphic Request Type: OfferQueryCancelOffer
   */
  async voidTicket(ticketNumber: string, reservationLocator: string): Promise<any> {
    this.logger.log(`[Travelport v11 Void] Processing void/cancel request for Ticket ${ticketNumber} (PNR ${reservationLocator})`);

    const payload = {
      '@type': 'OfferQueryCancelOffer',
      BuildFromOffer: {
        '@type': 'BuildFromOffer',
        OfferIdentifier: {
          id: 'offer_1',
          offerRef: 'offer_1',
        },
      },
      cancelAtCommitWorkbenchInd: true,
    };

    const response = await this.httpClient.post(
      `/air/book/airoffer/reservationworkbench/${encodeURIComponent(reservationLocator)}/offers/canceloffer`,
      payload,
      reservationLocator,
    );

    this.logger.log(`[Travelport v11 Void] ✅ Ticket ${ticketNumber} voided/cancelled successfully.`);
    return response;
  }

  /**
   * Calculates NDC / GDS Refund Quote (/air/book/airoffer/reservationworkbench/{workbenchId}/offers/canceloffer with cancelAtCommitWorkbenchInd: false)
   */
  async quoteRefund(ticketNumber: string, reservationLocator: string): Promise<{ refundAmount: number; penaltyAmount: number }> {
    if (!reservationLocator) {
      throw new BadRequestException('reservationLocator is required to calculate a refund quote.');
    }

    this.logger.log(`[Travelport v11 Refund] Calculating refund quote for Ticket ${ticketNumber} (PNR ${reservationLocator})...`);

    const payload = {
      '@type': 'OfferQueryCancelOffer',
      BuildFromOffer: {
        '@type': 'BuildFromOffer',
        OfferIdentifier: {
          id: 'offer_1',
          offerRef: 'offer_1',
        },
      },
      cancelAtCommitWorkbenchInd: false,
    };

    const response = await this.httpClient.post(
      `/air/book/airoffer/reservationworkbench/${encodeURIComponent(reservationLocator)}/offers/canceloffer`,
      payload,
      reservationLocator,
    );

    const refundAmount = response?.OfferListResponse?.TotalPrice?.value || response?.RefundAmount || 0;
    const penaltyAmount = response?.PenaltyAmount || 0;

    return { refundAmount, penaltyAmount };
  }

  /**
   * Processes voluntary refund
   */
  async processRefund(ticketNumber: string, refundAmount: number, reservationLocator: string): Promise<any> {
    if (!reservationLocator) {
      throw new BadRequestException('reservationLocator is required to process a refund.');
    }
    return this.voidTicket(ticketNumber, reservationLocator);
  }
}
