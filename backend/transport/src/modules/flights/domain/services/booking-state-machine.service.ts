import { Injectable, BadRequestException } from '@nestjs/common';

export enum BookingStatus {
  SEARCHED = 'SEARCHED',
  PRICED = 'PRICED',
  WORKBENCH_CREATED = 'WORKBENCH_CREATED',
  OFFER_ADDED = 'OFFER_ADDED',
  TRAVELERS_ADDED = 'TRAVELERS_ADDED',
  BOOKED = 'BOOKED',
  RESERVATION_CREATED = 'RESERVATION_CREATED',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  PAYMENT_COMPLETED = 'PAYMENT_COMPLETED',
  TICKET_ISSUED = 'TICKET_ISSUED',
  TRAVEL_COMPLETED = 'TRAVEL_COMPLETED',
  VOIDED = 'VOIDED',
  REFUNDED = 'REFUNDED',
  EXCHANGED = 'EXCHANGED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
}

@Injectable()
export class BookingStateMachineService {
  private readonly allowedTransitions: Record<BookingStatus, BookingStatus[]> = {
    [BookingStatus.SEARCHED]: [BookingStatus.PRICED, BookingStatus.EXPIRED],
    [BookingStatus.PRICED]: [BookingStatus.WORKBENCH_CREATED, BookingStatus.EXPIRED],
    [BookingStatus.WORKBENCH_CREATED]: [BookingStatus.OFFER_ADDED, BookingStatus.CANCELLED, BookingStatus.EXPIRED],
    [BookingStatus.OFFER_ADDED]: [BookingStatus.TRAVELERS_ADDED, BookingStatus.CANCELLED, BookingStatus.EXPIRED],
    [BookingStatus.TRAVELERS_ADDED]: [BookingStatus.BOOKED, BookingStatus.CANCELLED, BookingStatus.EXPIRED],
    [BookingStatus.BOOKED]: [BookingStatus.RESERVATION_CREATED, BookingStatus.CANCELLED, BookingStatus.FAILED],
    [BookingStatus.RESERVATION_CREATED]: [BookingStatus.PAYMENT_PENDING, BookingStatus.CANCELLED, BookingStatus.EXPIRED],
    [BookingStatus.PAYMENT_PENDING]: [BookingStatus.PAYMENT_COMPLETED, BookingStatus.FAILED, BookingStatus.CANCELLED],
    [BookingStatus.PAYMENT_COMPLETED]: [BookingStatus.TICKET_ISSUED, BookingStatus.FAILED],
    [BookingStatus.TICKET_ISSUED]: [
      BookingStatus.TRAVEL_COMPLETED,
      BookingStatus.VOIDED,
      BookingStatus.EXCHANGED,
      BookingStatus.REFUNDED,
    ],
    [BookingStatus.TRAVEL_COMPLETED]: [],
    [BookingStatus.VOIDED]: [BookingStatus.REFUNDED],
    [BookingStatus.REFUNDED]: [],
    [BookingStatus.EXCHANGED]: [BookingStatus.TICKET_ISSUED, BookingStatus.TRAVEL_COMPLETED],
    [BookingStatus.CANCELLED]: [],
    [BookingStatus.FAILED]: [],
    [BookingStatus.EXPIRED]: [],
  };

  validateTransition(currentState: BookingStatus, newState: BookingStatus): boolean {
    const allowed = this.allowedTransitions[currentState] || [];
    if (!allowed.includes(newState)) {
      throw new BadRequestException(
        `Invalid Booking State Transition: Cannot transition from ${currentState} to ${newState}.`,
      );
    }
    return true;
  }

  isTerminalState(state: BookingStatus): boolean {
    return [
      BookingStatus.TRAVEL_COMPLETED,
      BookingStatus.REFUNDED,
      BookingStatus.CANCELLED,
      BookingStatus.FAILED,
      BookingStatus.EXPIRED,
    ].includes(state);
  }
}
