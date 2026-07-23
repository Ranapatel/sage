import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getTravelportConfig, TravelportConfig } from '../config/travelport.config';
import { TravelportAuthService } from '../auth/travelportAuth.service';
import { TravelportHeaderBuilder } from '../headers/travelportHeader.builder';
import { TravelportErrorHandler } from '../errors/travelportError.handler';
import { getOrCreateTraceId, extractTransactionIdFromHeaders } from '../utils/trace.utils';

export interface RequestOptions {
  traceId?: string;
  timeoutMs?: number;
  maxRetries?: number;
}

export interface TravelportClientResponse<T = any> {
  data: T;
  headers: Record<string, any>;
  statusCode: number;
  traceId: string;
  transactionId?: string;
}

export class TravelportClient {
  private static instance: TravelportClient;
  private readonly config: TravelportConfig;
  private readonly authService: TravelportAuthService;
  private readonly http: AxiosInstance;

  private constructor() {
    this.config = getTravelportConfig();
    this.authService = TravelportAuthService.getInstance();
    this.http = axios.create({
      baseURL: this.config.apiBaseUrl,
      timeout: this.config.timeoutMs,
    });
  }

  public static getInstance(): TravelportClient {
    if (!TravelportClient.instance) {
      TravelportClient.instance = new TravelportClient();
    }
    return TravelportClient.instance;
  }

  /**
   * Centralized POST execution for all Travelport JSON REST APIs.
   */
  public async post<T = any>(
    endpoint: string,
    payload: any,
    options: RequestOptions = {}
  ): Promise<TravelportClientResponse<T>> {
    const traceId = getOrCreateTraceId(options.traceId);
    const maxRetries = options.maxRetries ?? this.config.maxRetries;
    const timeoutMs = options.timeoutMs ?? this.config.timeoutMs;

    let attempt = 0;

    while (attempt <= maxRetries) {
      attempt++;
      try {
        // Obtain OAuth Bearer Token
        const token = await this.authService.getAccessToken(traceId);

        // Build centralized headers automatically
        const headers = TravelportHeaderBuilder.build({
          bearerToken: token,
          isPostRequest: true,
          traceId,
        });

        this.logRequest('POST', endpoint, payload, headers, traceId, attempt);

        const response: AxiosResponse<T> = await this.http.post<T>(endpoint, payload, {
          headers,
          timeout: timeoutMs,
        });

        const transactionId = extractTransactionIdFromHeaders(response.headers);

        this.logResponse('POST', endpoint, response.status, response.headers, traceId, transactionId);

        // Verify response payload for internal error nodes
        TravelportErrorHandler.checkForResponseErrors(response.data, response.headers, traceId);

        return {
          data: response.data,
          headers: response.headers as Record<string, any>,
          statusCode: response.status,
          traceId,
          transactionId,
        };
      } catch (err: any) {
        const parsedException = TravelportErrorHandler.handle(err, traceId);

        const isRetryable =
          parsedException.statusCode >= 500 ||
          parsedException.code === 'TRAVELPORT_TIMEOUT' ||
          parsedException.code === 'TRAVELPORT_SERVER_ERROR';

        if (isRetryable && attempt <= maxRetries) {
          const delayMs = Math.pow(2, attempt) * 500; // Exponential backoff: 1s, 2s...
          console.warn(
            `[TravelportClient] ⚠️ Transient error on ${endpoint} (Attempt ${attempt}/${maxRetries + 1}). Retrying in ${delayMs}ms... TraceId: ${traceId}`
          );
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          continue;
        }

        // If 401 Unauthorized, invalidate token cache once
        if (parsedException.statusCode === 401 && attempt === 1) {
          console.warn(`[TravelportClient] 🔒 Received 401 Unauthorized. Invalidating token cache and retrying...`);
          this.authService.clearTokenCache();
          continue;
        }

        console.error(
          `[TravelportClient] ❌ Error executing POST ${endpoint}. Code: ${parsedException.code}, Category: ${parsedException.category}, Status: ${parsedException.statusCode}, TraceId: ${traceId}, TxId: ${parsedException.transactionId || 'none'}`
        );

        throw parsedException;
      }
    }

    throw TravelportErrorHandler.handle(new Error(`Failed request after ${maxRetries} retries`), traceId);
  }

  private logRequest(
    method: string,
    endpoint: string,
    payload: any,
    headers: Record<string, string>,
    traceId: string,
    attempt: number
  ): void {
    const safeHeaders = { ...headers };
    if (safeHeaders['Authorization']) {
      safeHeaders['Authorization'] = 'Bearer [REDACTED]';
    }

    console.log(`[TravelportClient Outbound Request] 🚀 ${method} ${this.config.apiBaseUrl}${endpoint} (Attempt ${attempt}) | TraceId: ${traceId}`);
    console.log(`[TravelportClient Request Headers]`, JSON.stringify(safeHeaders, null, 2));
    console.log(`[TravelportClient Request Body]`, JSON.stringify(payload, null, 2));
  }

  private logResponse(
    method: string,
    endpoint: string,
    statusCode: number,
    headers: any,
    traceId: string,
    transactionId?: string
  ): void {
    console.log(
      `[TravelportClient] 📥 ${method} ${endpoint} Status: ${statusCode} | TraceId: ${traceId} | TxId: ${transactionId || 'N/A'}`
    );
  }
}
