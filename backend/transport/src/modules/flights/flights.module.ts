import { Module } from '@nestjs/common';
import { TravelportConfigService } from './infrastructure/travelport/client/travelport-config.service';
import { TravelportOAuth2Manager } from './infrastructure/travelport/client/travelport-oauth2.manager';
import { TravelportHttpClient } from './infrastructure/travelport/client/travelport-http.client';
import { AuthenticationService } from './infrastructure/travelport/client/authentication.service';
import { TokenManager } from './infrastructure/travelport/client/token-manager';
import { TravelportSearchAdapter } from './infrastructure/travelport/adapters/travelport-search.adapter';
import { TravelportWorkbenchAdapter } from './infrastructure/travelport/adapters/travelport-workbench.adapter';
import { TravelportTicketingAdapter } from './infrastructure/travelport/adapters/travelport-ticketing.adapter';
import { TravelportAncillariesAdapter } from './infrastructure/travelport/adapters/travelport-ancillaries.adapter';
import { RedisSearchSessionStore } from './infrastructure/redis/redis-search-session.store';
import { BookingStateMachineService } from './domain/services/booking-state-machine.service';
import { TravelerValidationService } from './domain/services/traveler-validation.service';
import { NDCRestrictionsEngine } from './domain/services/ndc-restrictions.engine';
import { CommissionEngine } from './domain/services/commission.engine';
import { ScheduleChangeService } from './domain/services/schedule-change.service';
import { ReportingService } from './application/services/reporting.service';
import { SearchFlightsUseCase } from './application/use-cases/search-flights.use-case';
import { CreateWorkbenchBookingUseCase } from './application/use-cases/create-workbench-booking.use-case';
import { IssueTicketUseCase } from './application/use-cases/issue-ticket.use-case';
import { VoidTicketUseCase } from './application/use-cases/void-ticket.use-case';
import { ExchangeTicketUseCase } from './application/use-cases/exchange-ticket.use-case';
import { FlightBookingController } from './presentation/controllers/flight-booking.controller';

@Module({
  controllers: [FlightBookingController],
  providers: [
    TravelportConfigService,
    TokenManager,
    AuthenticationService,
    TravelportOAuth2Manager,
    TravelportHttpClient,
    TravelportSearchAdapter,
    TravelportWorkbenchAdapter,
    TravelportTicketingAdapter,
    TravelportAncillariesAdapter,
    RedisSearchSessionStore,
    BookingStateMachineService,
    TravelerValidationService,
    NDCRestrictionsEngine,
    CommissionEngine,
    ScheduleChangeService,
    ReportingService,
    SearchFlightsUseCase,
    CreateWorkbenchBookingUseCase,
    IssueTicketUseCase,
    VoidTicketUseCase,
    ExchangeTicketUseCase,
  ],
  exports: [
    SearchFlightsUseCase,
    CreateWorkbenchBookingUseCase,
    IssueTicketUseCase,
    VoidTicketUseCase,
    ExchangeTicketUseCase,
    NDCRestrictionsEngine,
    CommissionEngine,
    ScheduleChangeService,
    ReportingService,
    TravelportConfigService,
    TokenManager,
    AuthenticationService,
    TravelportOAuth2Manager,
    TravelportHttpClient,
  ],
})
export class FlightsModule {}
