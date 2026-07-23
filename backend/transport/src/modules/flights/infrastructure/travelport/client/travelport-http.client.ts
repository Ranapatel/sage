import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { TravelportOAuth2Manager } from './travelport-oauth2.manager';
import { TravelportConfigService } from './travelport-config.service';

export interface TravelportApiError {
  code: string;
  message: string;
  status: number;
  details?: any;
}

@Injectable()
export class TravelportHttpClient {
  private readonly logger = new Logger(TravelportHttpClient.name);
  private readonly client: AxiosInstance;

  constructor(
    private readonly authManager: TravelportOAuth2Manager,
    private readonly configService: TravelportConfigService,
  ) {
    this.client = axios.create({
      baseURL: this.authManager.getBaseUrl(),
      timeout: Number(process.env.TRAVELPORT_REQUEST_TIMEOUT_MS) || 20000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
  }

  async request<T = any>(
    config: AxiosRequestConfig,
    retries = 2,
    backoffMs = 1000,
    sessionIdentifier?: string,
  ): Promise<T> {
    const token = await this.authManager.getAccessToken();
    const traceId = `TraceID_${uuidv4().replace(/-/g, '').substring(0, 12)}`;
    const correlationId = uuidv4();
    const pcc = this.authManager.getPcc() || 'DU7_1G';
    const targetBranch = this.authManager.getTargetBranch() || 'P7051234';

    const headers: any = {
      ...(config.headers || {}),
      Authorization: `Bearer ${token}`,
      'TVP-PCC-Core': pcc,
      'Travelport-Target-Branch': targetBranch,
      TraceId: traceId,
      'X-Correlation-ID': correlationId,
      XAUTH_TRAVELPORT_ACCESSGROUP: this.configService.accessGroup,
      'Accept-Version': '11.0.0',
      'Content-Version': '11.0.0',
    };

    if (sessionIdentifier) {
      headers['travelportPlusSessionIdentifier'] = sessionIdentifier;
    }

    const requestConfig: AxiosRequestConfig = {
      ...config,
      headers,
    };

    try {
      this.logger.debug(
        `[Travelport HTTP Request] ${requestConfig.method?.toUpperCase()} ${requestConfig.url} [TraceId: ${traceId}] [PCC: ${pcc}]`,
      );

      const response: AxiosResponse<T> = await this.client.request(requestConfig);
      return response.data;
    } catch (err: any) {
      const status = err.response?.status;
      const data = err.response?.data;

      // Handle 429 Too Many Requests (Rate Limiting) with Exponential Backoff
      if (status === 429 && retries > 0) {
        this.logger.warn(
          `[Travelport HTTP] Rate limited (429). Retrying in ${backoffMs}ms... (${retries} retries left)`,
        );
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
        return this.request<T>(config, retries - 1, backoffMs * 2, sessionIdentifier);
      }

      // Handle 401 Unauthorized (Expired token edge-case). forceRefresh() drops
      // the cached entry before re-minting; getAccessToken() would return the
      // same expired token and we'd loop forever.
      if (status === 401 && retries > 0) {
        this.logger.warn(`[Travelport HTTP] 401 Unauthorized. Force refreshing OAuth token...`);
        await this.authManager.forceRefresh();
        return this.request<T>(config, retries - 1, backoffMs, sessionIdentifier);
      }

      const sanitizedErrorLog = this.sanitizeSensitiveData(JSON.stringify(data || err.message));
      this.logger.error(
        `[Travelport HTTP Error] ${requestConfig.method?.toUpperCase()} ${requestConfig.url} (${status}): ${sanitizedErrorLog}`,
      );

      throw {
        code: data?.code || 'TRAVELPORT_API_ERROR',
        message: data?.description || data?.message || err.message,
        status: status || 500,
        details: data,
      } as TravelportApiError;
    }
  }

  async post<T = any>(url: string, data?: any, sessionIdentifier?: string): Promise<T> {
    return this.request<T>({ method: 'POST', url, data }, 2, 1000, sessionIdentifier);
  }

  async get<T = any>(url: string, sessionIdentifier?: string): Promise<T> {
    return this.request<T>({ method: 'GET', url }, 2, 1000, sessionIdentifier);
  }

  async put<T = any>(url: string, data?: any, sessionIdentifier?: string): Promise<T> {
    return this.request<T>({ method: 'PUT', url, data }, 2, 1000, sessionIdentifier);
  }

  async delete<T = any>(url: string, sessionIdentifier?: string): Promise<T> {
    return this.request<T>({ method: 'DELETE', url }, 2, 1000, sessionIdentifier);
  }

  /**
   * Sanitizes PII and PCI sensitive data in structured error logs
   */
  private sanitizeSensitiveData(logString: string): string {
    return logString
      .replace(/"passportNumber"\s*:\s*"[^"]+"/gi, '"passportNumber":"[REDACTED]"')
      .replace(/"docID"\s*:\s*"[^"]+"/gi, '"docID":"[REDACTED]"')
      .replace(/"cardNumber"\s*:\s*"[^"]+"/gi, '"cardNumber":"[REDACTED]"')
      .replace(/"cvv"\s*:\s*"[^"]+"/gi, '"cvv":"[REDACTED]"')
      .replace(/"client_secret"\s*:\s*"[^"]+"/gi, '"client_secret":"[REDACTED]"')
      .replace(/Bearer\s+[A-Za-z0-9\-\._~\+\/]+=*/gi, 'Bearer [REDACTED_TOKEN]');
  }
}
