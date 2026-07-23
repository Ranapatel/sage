import { Injectable, Logger } from '@nestjs/common';
import { TravelportWorkbenchAdapter, TravelerDetails } from '../../infrastructure/travelport/adapters/travelport-workbench.adapter';
import { BookingStateMachineService, BookingStatus } from '../../domain/services/booking-state-machine.service';

export interface CreateBookingDto {
  offerRef: string;
  travelers: TravelerDetails[];
  userId?: string;
}

@Injectable()
export class CreateWorkbenchBookingUseCase {
  private readonly logger = new Logger(CreateWorkbenchBookingUseCase.name);

  constructor(
    private readonly workbenchAdapter: TravelportWorkbenchAdapter,
    private readonly stateMachine: BookingStateMachineService,
  ) {}

  async execute(dto: CreateBookingDto): Promise<any> {
    this.logger.log(`Starting atomic Workbench booking lifecycle for Offer ${dto.offerRef}...`);

    // 1. Create Workbench
    this.stateMachine.validateTransition(BookingStatus.SEARCHED, BookingStatus.PRICED);
    this.stateMachine.validateTransition(BookingStatus.PRICED, BookingStatus.WORKBENCH_CREATED);
    const { workbenchId } = await this.workbenchAdapter.createWorkbench();

    // 2. Add Offer
    this.stateMachine.validateTransition(BookingStatus.WORKBENCH_CREATED, BookingStatus.OFFER_ADDED);
    await this.workbenchAdapter.addOffer(workbenchId, dto.offerRef);

    // 3. Add Travelers
    this.stateMachine.validateTransition(BookingStatus.OFFER_ADDED, BookingStatus.TRAVELERS_ADDED);
    for (const traveler of dto.travelers) {
      await this.workbenchAdapter.addTraveler(workbenchId, traveler);
    }

    // 4. Commit Workbench
    this.stateMachine.validateTransition(BookingStatus.TRAVELERS_ADDED, BookingStatus.BOOKED);
    this.stateMachine.validateTransition(BookingStatus.BOOKED, BookingStatus.RESERVATION_CREATED);
    const { pnrLocator, reservationPayload } = await this.workbenchAdapter.commitWorkbench(workbenchId);

    this.logger.log(`[CreateBookingUseCase] ✅ Booking complete. PNR: ${pnrLocator}`);

    return {
      success: true,
      workbenchId,
      pnrLocator,
      status: BookingStatus.RESERVATION_CREATED,
      reservationPayload,
    };
  }
}
