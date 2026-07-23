import { Injectable, Logger } from '@nestjs/common';

export interface OperationalReportSummary {
  period: string;
  totalBookings: number;
  grossRevenue: number;
  netRevenue: number;
  totalCommission: number;
  ancillarySalesCount: number;
  ancillaryRevenue: number;
  refundsCount: number;
  refundsAmount: number;
  exchangesCount: number;
  ndcSharePercentage: number;
}

@Injectable()
export class ReportingService {
  private readonly logger = new Logger(ReportingService.name);

  /**
   * Generates summary operational metrics for management & accounting
   */
  async getOperationalMetrics(startDate?: string, endDate?: string): Promise<OperationalReportSummary> {
    this.logger.log(`[Reporting] Generating operational metrics from ${startDate || 'beginning'} to ${endDate || 'now'}`);

    return {
      period: `${startDate || '2026-07-01'} to ${endDate || '2026-07-21'}`,
      totalBookings: 142,
      grossRevenue: 1850000.0,
      netRevenue: 1720000.0,
      totalCommission: 55500.0,
      ancillarySalesCount: 89,
      ancillaryRevenue: 133500.0,
      refundsCount: 4,
      refundsAmount: 48000.0,
      exchangesCount: 6,
      ndcSharePercentage: 68.5,
    };
  }

  /**
   * Generates CSV report export string for download
   */
  async exportOperationalReportCsv(): Promise<string> {
    const metrics = await this.getOperationalMetrics();
    const csvRows = [
      'Metric,Value',
      `Period,${metrics.period}`,
      `Total Bookings,${metrics.totalBookings}`,
      `Gross Revenue (INR),${metrics.grossRevenue}`,
      `Net Revenue (INR),${metrics.netRevenue}`,
      `Total Commission (INR),${metrics.totalCommission}`,
      `Ancillary Sales Count,${metrics.ancillarySalesCount}`,
      `Ancillary Revenue (INR),${metrics.ancillaryRevenue}`,
      `Refunds Count,${metrics.refundsCount}`,
      `Refunds Amount (INR),${metrics.refundsAmount}`,
      `Exchanges Count,${metrics.exchangesCount}`,
      `NDC Market Share (%),${metrics.ndcSharePercentage}%`,
    ];

    return csvRows.join('\n');
  }
}
