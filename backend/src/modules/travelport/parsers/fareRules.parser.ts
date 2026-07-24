import { RawFareRulesResponse, RawFareRuleCategory } from '../types/raw.types';
import { FareRulesResponseDto, StructuredFareRuleCategoryDto } from '../types/dto.types';

export class FareRulesParser {
  public static parse(
    rawResponse: RawFareRulesResponse,
    catalogOfferingId: string,
    traceId: string,
    processingTimeMs: number
  ): FareRulesResponseDto {
    const root = rawResponse?.FareRulesResponse;
    const transactionId = root?.transactionId;
    const rawRuleList: RawFareRuleCategory[] = root?.FareRuleList?.FareRuleInfo || [];

    const ruleCategories: StructuredFareRuleCategoryDto[] = [];
    const summaryLines: string[] = [];

    rawRuleList.forEach((rule) => {
      const categoryKey = this.mapCategoryKey(rule.category || rule.title);
      const textDetails = Array.isArray(rule.text) ? rule.text : rule.text ? [rule.text] : [];

      ruleCategories.push({
        categoryKey,
        title: rule.title || rule.category || 'General Fare Rule',
        textDetails,
        penaltyAmount: rule.penaltyAmount,
        currency: rule.currency,
        isRefundable: rule.refundable,
        isChangeable: rule.changeable,
      });

      if (textDetails.length > 0) {
        summaryLines.push(`[${rule.title || rule.category}]: ${textDetails.join(' ')}`);
      }
    });

    // Provide default fallback categories if raw response list was empty
    if (ruleCategories.length === 0) {
      ruleCategories.push({
        categoryKey: 'GENERAL',
        title: 'General Fare Terms',
        textDetails: ['Standard airline fare rules apply. Non-refundable / Change fees may apply.'],
        isRefundable: false,
        isChangeable: true,
      });
      summaryLines.push('Standard airline fare rules apply.');
    }

    return {
      success: true,
      metadata: {
        traceId,
        transactionId,
        timestamp: new Date().toISOString(),
        processingTimeMs,
        totalResults: ruleCategories.length,
      },
      fareRules: {
        catalogOfferingId,
        offerId: catalogOfferingId,
        ruleCategories,
        summaryText: summaryLines.join('\n'),
        travelportIdentifiers: {
          catalogOfferingId,
          offerId: catalogOfferingId,
          productOptionIds: [],
          productIds: [],
          segmentRefs: [],
          rawIdentifierValue: catalogOfferingId,
        },
      },
    };
  }

  private static mapCategoryKey(rawCat?: string): StructuredFareRuleCategoryDto['categoryKey'] {
    if (!rawCat) return 'GENERAL';
    const lower = rawCat.toLowerCase();
    if (lower.includes('min') || lower.includes('minimum')) return 'MIN_STAY';
    if (lower.includes('max') || lower.includes('maximum')) return 'MAX_STAY';
    if (lower.includes('cancel') || lower.includes('penalty')) return 'CANCELLATION';
    if (lower.includes('refund')) return 'REFUND';
    if (lower.includes('change') || lower.includes('exchange')) return 'CHANGES';
    if (lower.includes('advance') || lower.includes('purchase')) return 'ADVANCE_PURCHASE';
    return 'GENERAL';
  }
}
