import { Injectable, Logger } from '@nestjs/common';
import { TravelportTicketingAdapter } from '../../infrastructure/travelport/adapters/travelport-ticketing.adapter';
import { BookingStateMachineService, BookingStatus } from '../../domain/services/booking-state-machine.service';

export interface IssueTicketDto {
  pnrLocator: string;
  fopToken: string;
}

@Injectable()
export class IssueTicketUseCase {
  private readonly logger = new Logger(IssueTicketUseCase.name);

  constructor(
    private readonly ticketingAdapter: TravelportTicketingAdapter,
    private readonly stateMachine: BookingStateMachineService,
  ) {}

  async execute(dto: IssueTicketDto): Promise<any> {
    this.logger.log(`Executing IssueTicketUseCase for PNR ${dto.pnrLocator}...`);

    // State validations
    this.stateMachine.validateTransition(BookingStatus.RESERVATION_CREATED, BookingStatus.PAYMENT_PENDING);
    this.stateMachine.validateTransition(BookingStatus.PAYMENT_PENDING, BookingStatus.PAYMENT_COMPLETED);
    this.stateMachine.validateTransition(BookingStatus.PAYMENT_COMPLETED, BookingStatus.TICKET_ISSUED);

    const ticketResult = await this.ticketingAdapter.issueTicket(dto.pnrLocator, dto.fopToken);

    return {
      success: true,
      pnrLocator: dto.pnrLocator,
      ticketNumber: ticketResult.ticketNumber,
      issuedAt: ticketResult.issuedAt,
      status: BookingStatus.TICKET_ISSUED,
    };
  }
}
