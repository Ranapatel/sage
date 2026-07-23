import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { SearchFlightsUseCase } from '../../application/use-cases/search-flights.use-case';
import { CreateWorkbenchBookingUseCase } from '../../application/use-cases/create-workbench-booking.use-case';
import { IssueTicketUseCase } from '../../application/use-cases/issue-ticket.use-case';
import { VoidTicketUseCase } from '../../application/use-cases/void-ticket.use-case';
import { ExchangeTicketUseCase } from '../../application/use-cases/exchange-ticket.use-case';
import { TravelportAncillariesAdapter } from '../../infrastructure/travelport/adapters/travelport-ancillaries.adapter';
import { TravelportTicketingAdapter } from '../../infrastructure/travelport/adapters/travelport-ticketing.adapter';
import { NDCRestrictionsEngine, FlightSegmentCriteria } from '../../domain/services/ndc-restrictions.engine';
import { CommissionEngine } from '../../domain/services/commission.engine';
import { ScheduleChangeService } from '../../domain/services/schedule-change.service';
import { ReportingService } from '../../application/services/reporting.service';
import { SearchFlightsCriteriaDto } from '../../application/dtos/search-flight.dto';
import { CreateBookingDto } from '../../application/dtos/create-booking.dto';
import { IssueTicketDto } from '../../application/dtos/issue-ticket.dto';
import { VoidTicketDto } from '../../application/dtos/void-ticket.dto';
import { ExchangeTicketDto } from '../../application/dtos/exchange-ticket.dto';
import { CommissionCalculationCriteriaDto } from '../../application/dtos/commission-calculation.dto';

@Controller('v1/flights')
export class FlightBookingController {
  constructor(
    private readonly searchUseCase: SearchFlightsUseCase,
    private readonly createBookingUseCase: CreateWorkbenchBookingUseCase,
    private readonly issueTicketUseCase: IssueTicketUseCase,
    private readonly voidTicketUseCase: VoidTicketUseCase,
    private readonly exchangeTicketUseCase: ExchangeTicketUseCase,
    private readonly ndcRestrictionsEngine: NDCRestrictionsEngine,
    private readonly commissionEngine: CommissionEngine,
    private readonly scheduleChangeService: ScheduleChangeService,
    private readonly reportingService: ReportingService,
    private readonly ancillariesAdapter: TravelportAncillariesAdapter,
    private readonly ticketingAdapter: TravelportTicketingAdapter,
  ) {}

  @Post('search')
  @HttpCode(HttpStatus.OK)
  async searchFlights(@Body() criteria: SearchFlightsCriteriaDto) {
    return this.searchUseCase.execute(criteria);
  }

  @Post('booking/create')
  @HttpCode(HttpStatus.CREATED)
  async createBooking(@Body() dto: CreateBookingDto) {
    return this.createBookingUseCase.execute(dto);
  }

  @Post('ticketing/issue')
  @HttpCode(HttpStatus.OK)
  async issueTicket(@Body() dto: IssueTicketDto) {
    return this.issueTicketUseCase.execute(dto);
  }

  @Post('seats/map')
  @HttpCode(HttpStatus.OK)
  async getSeatMap(@Body() body: { offerRef: string; segmentRef: string }) {
    return this.ancillariesAdapter.getSeatMap(body.offerRef, body.segmentRef);
  }

  @Post('aftersales/void')
  @HttpCode(HttpStatus.OK)
  async voidTicket(@Body() dto: VoidTicketDto) {
    return this.voidTicketUseCase.execute(dto);
  }

  @Post('aftersales/exchange')
  @HttpCode(HttpStatus.OK)
  async exchangeTicket(@Body() dto: ExchangeTicketDto) {
    return this.exchangeTicketUseCase.execute(dto);
  }

  @Post('aftersales/refund-quote')
  @HttpCode(HttpStatus.OK)
  async quoteRefund(@Body() body: { ticketNumber: string; pnrLocator: string }) {
    return this.ticketingAdapter.quoteRefund(body.ticketNumber, body.pnrLocator);
  }

  @Post('ndc/validate-restrictions')
  @HttpCode(HttpStatus.OK)
  async validateNdcRestrictions(@Body() body: { segments: FlightSegmentCriteria[]; paymentMethod?: string }) {
    return this.ndcRestrictionsEngine.evaluateItineraryRestrictions(body.segments, body.paymentMethod);
  }

  @Post('commission/calculate')
  @HttpCode(HttpStatus.OK)
  async calculateCommission(@Body() criteria: CommissionCalculationCriteriaDto) {
    return this.commissionEngine.calculateCommission(criteria);
  }

  @Get('servicing/schedule-change/:reservationId')
  @HttpCode(HttpStatus.OK)
  async getScheduleChange(@Param('reservationId') reservationId: string) {
    return this.scheduleChangeService.getPendingChange(reservationId);
  }

  @Post('servicing/schedule-change/:reservationId/action')
  @HttpCode(HttpStatus.OK)
  async actionScheduleChange(
    @Param('reservationId') reservationId: string,
    @Body() body: { action: 'ACCEPT' | 'REJECT' },
  ) {
    return this.scheduleChangeService.processPassengerAction(reservationId, body.action);
  }

  @Get('reporting/metrics')
  @HttpCode(HttpStatus.OK)
  async getOperationalMetrics() {
    return this.reportingService.getOperationalMetrics();
  }

  @Get('reporting/export-csv')
  async exportCsv(@Res() res: any) {
    const csvContent = await this.reportingService.exportOperationalReportCsv();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=operational_report.csv');
    return res.send(csvContent);
  }
}
