import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { TravelportTicketingAdapter } from '../../infrastructure/travelport/adapters/travelport-ticketing.adapter';
import { BookingStateMachineService, BookingStatus } from '../../domain/services/booking-state-machine.service';
import { VoidTicketDto } from '../dtos/void-ticket.dto';

@Injectable()
export class VoidTicketUseCase {
  private readonly logger = new Logger(VoidTicketUseCase.name);

  constructor(
    private readonly ticketingAdapter: TravelportTicketingAdapter,
    private readonly stateMachine: BookingStateMachineService,
  ) {}

  async execute(dto: VoidTicketDto): Promise<any> {
    this.logger.log(`Executing VoidTicketUseCase for Ticket ${dto.ticketNumber}...`);

    // Enforce 24-hour Void Eligibility Window
    const issuedTime = new Date(dto.issuedAt).getTime();
    const now = Date.now();
    const hoursElapsed = (now - issuedTime) / (1000 * 60 * 60);

    if (hoursElapsed > 24) {
      throw new BadRequestException(
        `Ticket ${dto.ticketNumber} was issued ${hoursElapsed.toFixed(1)} hours ago and is outside the 24-hour void window. Please process a voluntary refund instead.`,
      );
    }

    // Validate State Transition
    this.stateMachine.validateTransition(BookingStatus.TICKET_ISSUED, BookingStatus.VOIDED);

    const result = await this.ticketingAdapter.voidTicket(dto.ticketNumber, dto.pnrLocator);

    return {
      success: true,
      ticketNumber: dto.ticketNumber,
      pnrLocator: dto.pnrLocator,
      status: BookingStatus.VOIDED,
      voidedAt: new Date().toISOString(),
      rawPayload: result,
    };
  }
}
