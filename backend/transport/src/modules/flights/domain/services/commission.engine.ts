import { Injectable } from '@nestjs/common';
import { CommissionCalculationCriteriaDto } from '../../application/dtos/commission-calculation.dto';

export interface CommissionCalculationCriteria {
  carrierCode: string;
  baseFare: number;
  totalFare: number;
  providerType: 'GDS' | 'NDC';
  isPrivateFare?: boolean;
}

export interface CommissionBreakdown {
  agencyAmount: number;
  airlineAmount: number;
  bonusAmount: number;
  totalCommission: number;
  currency: string;
}

@Injectable()
export class CommissionEngine {
  /**
   * Calculates Agency, Airline, and Bonus Commissions for a flight offer
   */
  calculateCommission(criteria: CommissionCalculationCriteriaDto): CommissionBreakdown {
    const { baseFare, providerType, isPrivateFare } = criteria;

    // Standard Agency Commission: 3% on NDC base fare, 2% on GDS base fare
    const agencyRate = providerType === 'NDC' ? 0.03 : 0.02;
    const agencyAmount = Math.round(baseFare * agencyRate * 100) / 100;

    // Airline Carrier Incentive Override: 1% bonus on Private/Negotiated Fares
    const airlineRate = isPrivateFare ? 0.01 : 0.005;
    const airlineAmount = Math.round(baseFare * airlineRate * 100) / 100;

    // Bonus Commission Rule
    const bonusAmount = baseFare > 50000 ? 500 : 0;

    const totalCommission = Math.round((agencyAmount + airlineAmount + bonusAmount) * 100) / 100;

    return {
      agencyAmount,
      airlineAmount,
      bonusAmount,
      totalCommission,
      currency: 'INR',
    };
  }
}
