export class ExchangeTicketDto {
  pnrLocator: string;
  ticketNumber: string;
  newOrigin: string;
  newDestination: string;
  newDepartureDate: string;
  providerType: 'GDS' | 'NDC';
}
