import { ErrorCategory } from '../constants/travelport.constants';

export interface TravelportErrorDetails {
  code: string;
  message: string;
  category: ErrorCategory;
  statusCode: number;
  sourceId?: string;
  sourceCode?: string;
  traceId: string;
  transactionId?: string;
  rawError?: any;
}

export class TravelportException extends Error {
  public readonly code: string;
  public readonly category: ErrorCategory;
  public readonly statusCode: number;
  public readonly sourceId?: string;
  public readonly sourceCode?: string;
  public readonly traceId: string;
  public readonly transactionId?: string;
  public readonly rawError?: any;

  constructor(details: TravelportErrorDetails) {
    super(details.message);
    this.name = 'TravelportException';
    this.code = details.code;
    this.category = details.category;
    this.statusCode = details.statusCode;
    this.sourceId = details.sourceId;
    this.sourceCode = details.sourceCode;
    this.traceId = details.traceId;
    this.transactionId = details.transactionId;
    this.rawError = details.rawError;

    // Restore prototype chain
    Object.setPrototypeOf(this, new.target.prototype);
  }

  public toNormalizedDto() {
    return {
      success: false as const,
      error: {
        code: this.code,
        message: this.message,
        category: this.category,
        statusCode: this.statusCode,
        sourceId: this.sourceId,
        sourceCode: this.sourceCode,
        traceId: this.traceId,
        transactionId: this.transactionId,
      },
    };
  }
}
