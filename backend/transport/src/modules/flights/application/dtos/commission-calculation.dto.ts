export class CommissionCalculationCriteriaDto {
  carrierCode: string;
  baseFare: number;
  totalFare: number;
  providerType: 'GDS' | 'NDC';
  isPrivateFare?: boolean;
}
