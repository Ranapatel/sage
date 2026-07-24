import { Injectable, Logger, NotFoundException } from '@nestjs/common';

export interface ScheduleChangeNotification {
  reservationId: string;
  pnrLocator: string;
  previousFlight: {
    flightNumber: string;
    departureDate: string;
    origin: string;
    destination: string;
  };
  newFlight: {
    flightNumber: string;
    departureDate: string;
    origin: string;
    destination: string;
  };
  changeType: 'TIME_SHIFT' | 'AIRCRAFT_SWAP' | 'AIRPORT_CHANGE' | 'FLIGHT_CANCELLATION';
  status: 'PENDING_ACCEPTANCE' | 'ACCEPTED' | 'REJECTED';
}

@Injectable()
export class ScheduleChangeService {
  private readonly logger = new Logger(ScheduleChangeService.name);
  private readonly mockScheduleChanges = new Map<string, ScheduleChangeNotification>();

  /**
   * Registers a newly detected carrier schedule change
   */
  registerScheduleChange(change: ScheduleChangeNotification): ScheduleChangeNotification {
    this.logger.log(`[ScheduleChange] Registering carrier schedule change for PNR ${change.pnrLocator}`);
    this.mockScheduleChanges.set(change.reservationId, change);
    return change;
  }

  /**
   * Retrieves pending schedule changes for a reservation
   */
  getPendingChange(reservationId: string): ScheduleChangeNotification {
    const change = this.mockScheduleChanges.get(reservationId);
    if (!change) {
      throw new NotFoundException(`No pending schedule changes found for reservation ${reservationId}`);
    }
    return change;
  }

  /**
   * Processes passenger acceptance or rejection of a schedule change
   */
  processPassengerAction(reservationId: string, action: 'ACCEPT' | 'REJECT'): ScheduleChangeNotification {
    const change = this.getPendingChange(reservationId);
    change.status = action === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED';
    this.logger.log(`[ScheduleChange] Passenger ${action}ED schedule change for reservation ${reservationId}`);
    this.mockScheduleChanges.set(reservationId, change);
    return change;
  }
}
