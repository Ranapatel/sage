import { ErrorCategory } from '../constants/travelport.constants';
import { TravelportException } from './travelport.error';
import { TravelportErrorResponse } from '../types/raw.types';
import { extractTransactionIdFromHeaders } from '../utils/trace.utils';

export class TravelportErrorHandler {
  /**
   * Parses raw error object or HTTP error response from Travelport and converts it into TravelportException.
   */
  public static handle(error: any, traceId: string): TravelportException {
    if (error instanceof TravelportException) {
      return error;
    }

    let statusCode = 500;
    let message = 'An unexpected Travelport API error occurred';
    let code = 'TRAVELPORT_UNKNOWN_ERROR';
    let category = ErrorCategory.SYSTEM;
    let sourceId: string | undefined;
    let sourceCode: string | undefined;
    let transactionId: string | undefined;
    let rawResponseBody: any;

    if (error.response) {
      statusCode = error.response.status || 500;
      rawResponseBody = error.response.data;
      transactionId = extractTransactionIdFromHeaders(error.response.headers);

      // Parse Travelport error structure
      if (rawResponseBody) {
        const tvpErr: TravelportErrorResponse = rawResponseBody;

        const mainStatusCode = tvpErr.StatusCode || tvpErr.Result?.Error?.[0]?.StatusCode;
        const mainMessage =
          tvpErr.Message ||
          tvpErr.Result?.Error?.[0]?.Message ||
          tvpErr.Result?.Error?.[0]?.description ||
          tvpErr.Error?.[0]?.Message ||
          tvpErr.errors?.[0]?.Message ||
          (typeof rawResponseBody === 'string' ? rawResponseBody : undefined);

        if (mainMessage) {
          message = mainMessage;
        }

        sourceId = tvpErr.SourceID || tvpErr.Result?.Error?.[0]?.SourceID;
        sourceCode = tvpErr.SourceCode || tvpErr.Result?.Error?.[0]?.SourceCode;
        const rawCategory = tvpErr.Category || tvpErr.Result?.Error?.[0]?.Category;

        if (rawCategory) {
          category = this.mapRawCategory(rawCategory);
        }

        if (tvpErr.Result?.Error?.[0]?.code) {
          code = tvpErr.Result?.Error?.[0]?.code;
        }
      }

      // Map status code categories if category not explicit
      if (category === ErrorCategory.SYSTEM) {
        if (statusCode === 401 || statusCode === 403) {
          category = ErrorCategory.AUTHORIZATION;
          code = 'TRAVELPORT_UNAUTHORIZED';
        } else if (statusCode === 400 || statusCode === 422) {
          category = ErrorCategory.VALIDATION;
          code = 'TRAVELPORT_VALIDATION_ERROR';
        } else if (statusCode === 404) {
          category = ErrorCategory.SEARCH;
          code = 'TRAVELPORT_RESOURCE_NOT_FOUND';
        } else if (statusCode >= 500) {
          category = ErrorCategory.COMMUNICATION;
          code = 'TRAVELPORT_SERVER_ERROR';
        }
      }
    } else if (error.request || error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      statusCode = 504;
      category = ErrorCategory.COMMUNICATION;
      code = 'TRAVELPORT_TIMEOUT';
      message = `Travelport API request timed out or network unreachable: ${error.message}`;
    } else if (error.message) {
      message = error.message;
    }

    return new TravelportException({
      code,
      message,
      category,
      statusCode,
      sourceId,
      sourceCode,
      traceId,
      transactionId,
      rawError: rawResponseBody || error.message,
    });
  }

  /**
   * Checks if response body contains internal Travelport error nodes even with HTTP 200.
   */
  public static checkForResponseErrors(data: any, headers?: any, traceId: string = 'ts-unknown'): void {
    if (!data) return;

    const transactionId = extractTransactionIdFromHeaders(headers);

    if (data.Result?.Error && Array.isArray(data.Result.Error) && data.Result.Error.length > 0) {
      const firstErr = data.Result.Error[0];
      throw new TravelportException({
        code: firstErr.code || 'TRAVELPORT_RESPONSE_ERROR',
        message: firstErr.Message || firstErr.description || 'Travelport API returned an error payload',
        category: this.mapRawCategory(firstErr.Category),
        statusCode: firstErr.StatusCode || 400,
        sourceId: firstErr.SourceID,
        sourceCode: firstErr.SourceCode,
        traceId,
        transactionId,
        rawError: data.Result.Error,
      });
    }

    if (data.Error && Array.isArray(data.Error) && data.Error.length > 0) {
      const firstErr = data.Error[0];
      throw new TravelportException({
        code: firstErr.code || 'TRAVELPORT_RESPONSE_ERROR',
        message: firstErr.Message || firstErr.description || 'Travelport API returned an error payload',
        category: this.mapRawCategory(firstErr.Category),
        statusCode: firstErr.StatusCode || 400,
        sourceId: firstErr.SourceID,
        sourceCode: firstErr.SourceCode,
        traceId,
        transactionId,
        rawError: data.Error,
      });
    }
  }

  private static mapRawCategory(cat?: string): ErrorCategory {
    if (!cat) return ErrorCategory.SYSTEM;
    const lower = cat.toLowerCase();
    if (lower.includes('auth') || lower.includes('credential')) return ErrorCategory.AUTHORIZATION;
    if (lower.includes('valid') || lower.includes('param') || lower.includes('request')) return ErrorCategory.VALIDATION;
    if (lower.includes('search') || lower.includes('avail') || lower.includes('catalog')) return ErrorCategory.SEARCH;
    if (lower.includes('comm') || lower.includes('net') || lower.includes('connect')) return ErrorCategory.COMMUNICATION;
    return ErrorCategory.SYSTEM;
  }
}
