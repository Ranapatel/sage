import { Injectable, Logger } from '@nestjs/common';
import { TravelportHttpClient } from '../../infrastructure/travelport/client/travelport-http.client';
import { BookingStateMachineService, BookingStatus } from '../../domain/services/booking-state-machine.service';
import { ExchangeTicketDto } from '../dtos/exchange-ticket.dto';

@Injectable()
export class ExchangeTicketUseCase {
  private readonly logger = new Logger(ExchangeTicketUseCase.name);

  constructor(
    private readonly httpClient: TravelportHttpClient,
    private readonly stateMachine: BookingStateMachineService,
  ) {}

  async execute(dto: ExchangeTicketDto): Promise<any> {
    this.logger.log(`Executing ${dto.providerType} Exchange via /air/change/catalogofferingsairchange for Ticket ${dto.ticketNumber}...`);

    this.stateMachine.validateTransition(BookingStatus.TICKET_ISSUED, BookingStatus.EXCHANGED);

    const payload = {
      '@type': 'CatalogOfferingsQueryAirChange',
      CatalogOfferingsAirChangeRequest: {
        '@type': 'CatalogOfferingsAirChangeRequestReservation',
        catalogOfferingsPerPage: 5,
        SearchCriteriaFlight: [
          {
            departureDate: dto.newDepartureDate,
            From: {
              value: dto.newOrigin,
              cityOrAirport: 'City or Airport',
            },
            To: {
              value: dto.newDestination,
              cityOrAirport: 'City or Airport',
            },
          },
        ],
        PassengerCriteria: [
          {
            '@type': 'PassengerCriteria',
            number: 1,
            passengerTypeCode: 'ADT',
            id: 'passengercriteria_001',
          },
        ],
        BuildFromReservationWorkbench: {
          '@type': 'BuildFromReservationWorkbench',
          ReservationIdentifier: {
            value: dto.pnrLocator,
          },
        },
      },
    };

    const response = await this.httpClient.post('/air/change/catalogofferingsairchange', payload, dto.pnrLocator);
    const newTicketNo =
      response?.CatalogOfferingsAirChangeResponse?.Ticket?.[0]?.ticketNumber ||
      response?.Ticket?.[0]?.ticketNumber ||
      response?.newTicketNumber ||
      dto.ticketNumber;

    return {
      success: true,
      oldTicketNo: dto.ticketNumber,
      newTicketNo,
      pnrLocator: dto.pnrLocator,
      status: BookingStatus.EXCHANGED,
      exchangeResponse: response,
    };
  }
}
