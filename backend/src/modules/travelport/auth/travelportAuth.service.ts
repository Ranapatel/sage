import axios from 'axios';
import { getTravelportConfig, TravelportConfig } from '../config/travelport.config';
import { TravelportOAuthResponse } from '../types/raw.types';
import { TravelportException } from '../errors/travelport.error';
import { ErrorCategory } from '../constants/travelport.constants';

export class TravelportAuthService {
  private static instance: TravelportAuthService;
  private cachedAccessToken: string | null = null;
  private tokenExpiresAt: number = 0; // Timestamp in milliseconds
  private readonly SAFETY_BUFFER_MS = 60 * 1000; // 60 seconds buffer before expiry

  private constructor() {}

  public static getInstance(): TravelportAuthService {
    if (!TravelportAuthService.instance) {
      TravelportAuthService.instance = new TravelportAuthService();
    }
    return TravelportAuthService.instance;
  }

  /**
   * Retrieves a valid Bearer token. Auto-refreshes if missing or near expiration.
   */
  public async getAccessToken(traceId: string = 'ts-auth'): Promise<string> {
    const now = Date.now();
    if (this.cachedAccessToken && this.tokenExpiresAt > now + this.SAFETY_BUFFER_MS) {
      return this.cachedAccessToken;
    }

    return await this.authenticate(traceId);
  }

  /**
   * Performs OAuth 2.0 Client Credentials authentication against Travelport.
   */
  public async authenticate(traceId: string = 'ts-auth'): Promise<string> {
    const config: TravelportConfig = getTravelportConfig();

    const maskedClientId = config.clientId ? `${config.clientId.substring(0, 5)}...${config.clientId.substring(config.clientId.length - 4)}` : 'NONE';
    const secretLen = config.clientSecret ? config.clientSecret.length : 0;

    console.log(`[TravelportAuth Debug] Environment: ${config.environment} | Token URL: ${config.oauthUrl}`);
    console.log(`[TravelportAuth Debug] Client ID: ${maskedClientId} | Secret Length: ${secretLen}`);

    if (!config.clientId || !config.clientSecret) {
      throw new TravelportException({
        code: 'TRAVELPORT_MISSING_CREDENTIALS',
        message: 'TRAVELPORT_CLIENT_ID and TRAVELPORT_CLIENT_SECRET environment variables are required to authenticate with Travelport.',
        category: ErrorCategory.AUTHORIZATION,
        statusCode: 401,
        traceId,
      });
    }

    try {
      const payload = new URLSearchParams();
      payload.append('grant_type', 'client_credentials');

      const basicAuthHeader = `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')}`;

      console.log(`[TravelportAuth Outbound] POST ${config.oauthUrl} | Headers: Content-Type=application/x-www-form-urlencoded, Authorization=Basic [REDACTED_${secretLen}] | Body: ${payload.toString()} | TraceId: ${traceId}`);

      const response = await axios.post<TravelportOAuthResponse>(
        config.oauthUrl,
        payload.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'Authorization': basicAuthHeader,
          },
          timeout: config.timeoutMs,
        }
      );

      console.log(`[TravelportAuth Inbound] HTTP Status: ${response.status} | Response Body:`, JSON.stringify(response.data));

      if (!response.data || !response.data.access_token) {
        throw new TravelportException({
          code: 'TRAVELPORT_INVALID_OAUTH_RESPONSE',
          message: 'OAuth endpoint did not return an access_token',
          category: ErrorCategory.AUTHORIZATION,
          statusCode: 401,
          traceId,
          rawError: response.data,
        });
      }

      this.cachedAccessToken = response.data.access_token;
      const expiresInSec = response.data.expires_in || 3600;
      this.tokenExpiresAt = Date.now() + expiresInSec * 1000;

      console.log(`[TravelportAuth] ✅ Successfully authenticated. Token valid for ${expiresInSec}s.`);
      return this.cachedAccessToken;
    } catch (err: any) {
      if (err instanceof TravelportException) {
        throw err;
      }

      const status = err.response?.status || 401;
      const responseData = err.response?.data;
      const errMsg = responseData?.error_description || responseData?.message || err.message;

      console.error(`[TravelportAuth Failure] HTTP ${status} from ${config.oauthUrl} | Response Data:`, JSON.stringify(responseData || err.message));

      throw new TravelportException({
        code: 'TRAVELPORT_OAUTH_FAILED',
        message: `OAuth authentication failed: ${errMsg}`,
        category: ErrorCategory.AUTHORIZATION,
        statusCode: status,
        traceId,
        rawError: responseData || err.message,
      });
    }
  }

  /**
   * Clears cached token forcing next request to re-authenticate.
   */
  public clearTokenCache(): void {
    this.cachedAccessToken = null;
    this.tokenExpiresAt = 0;
  }
}
