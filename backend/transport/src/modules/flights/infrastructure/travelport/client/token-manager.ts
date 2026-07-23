import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import { TravelportConfigService } from './travelport-config.service';
import { CachedToken, TokenCache } from './token-cache';

export type TravelportAuthErrorCode =
  | 'INVALID_CLIENT_ID'
  | 'INVALID_CLIENT_SECRET'
  | 'EXPIRED_TOKEN'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'MISSING_PCC'
  | 'MISSING_TARGET_BRANCH'
  | 'NETWORK_TIMEOUT'
  | 'AUTH_FAILED';

export class TravelportAuthError extends Error {
  constructor(
    public readonly code: TravelportAuthErrorCode,
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'TravelportAuthError';
  }
}

interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number; // seconds
  scope?: string;
}

/**
 * Owns the OAuth2 token lifecycle for Travelport TripServices.
 *  - Reads creds from TravelportConfigService
 *  - Mints new tokens from the configured token endpoint
 *  - Caches them (with optional encryption) and reuses until expiry
 *  - forceRefresh() is called by the HTTP client on 401 so the next request uses a brand-new token
 */
@Injectable()
export class TokenManager {
  private readonly logger = new Logger(TokenManager.name);
  private readonly cache: TokenCache;
  private inFlight: Promise<string> | null = null;

  constructor(private readonly configService: TravelportConfigService) {
    this.cache = new TokenCache(
      this.configService.env,
      process.env.TRAVELPORT_TOKEN_ENCRYPTION_KEY,
    );
  }

  /** Returns a valid access token, minting a new one if needed. */
  async getToken(): Promise<string> {
    const cached = this.cache.get();
    if (cached) return cached.accessToken;

    // Coalesce concurrent requests so we only ever mint one token at a time.
    if (this.inFlight) return this.inFlight;
    this.inFlight = this.refreshAccessToken().finally(() => {
      this.inFlight = null;
    });
    return this.inFlight;
  }

  /** Drops the cache and mints a new token. Used by the HTTP client's 401-retry branch. */
  async forceRefresh(): Promise<string> {
    this.cache.clear();
    if (this.inFlight) return this.inFlight;
    this.inFlight = this.refreshAccessToken().finally(() => {
      this.inFlight = null;
    });
    return this.inFlight;
  }

  /** True when a usable token is already cached. */
  hasToken(): boolean {
    return this.cache.has();
  }

  /** Internal cache handle. Only used by tests and the self-check. */
  cacheForTest(): TokenCache {
    return this.cache;
  }

  private async refreshAccessToken(): Promise<string> {
    this.configService.validateOrThrow();

    const endpoint = this.configService.tokenEndpoint;
    this.logger.log(`[Travelport Auth] Requesting OAuth token from ${endpoint}`);

    const authHeader = Buffer.from(
      `${this.configService.clientId}:${this.configService.clientSecret}`,
    ).toString('base64');

    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');

    try {
      const { data } = await axios.post<OAuthTokenResponse>(endpoint, params.toString(), {
        headers: {
          Authorization: `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        timeout: 10_000,
      });

      const entry: CachedToken = {
        accessToken: data.access_token,
        expiresAt: Date.now() + data.expires_in * 1000,
        scope: data.scope,
      };
      this.cache.set(entry);

      this.logger.log(
        `[Travelport Auth] ✅ Access token retrieved (expires_in=${data.expires_in}s, masked=${this.configService.maskSecret(
          data.access_token,
        )})`,
      );
      return entry.accessToken;
    } catch (err) {
      throw this.mapError(err);
    }
  }

  private mapError(err: unknown): TravelportAuthError {
    if (err instanceof TravelportAuthError) return err;
    const ax = err as AxiosError<any>;
    const status = ax?.response?.status;
    const body = ax?.response?.data;
    const code: string | undefined = body?.error || body?.code;
    const description: string = body?.error_description || body?.description || ax?.message || 'Unknown';

    if (ax?.code === 'ECONNABORTED' || ax?.code === 'ETIMEDOUT') {
      return new TravelportAuthError('NETWORK_TIMEOUT', `Travelport auth timed out: ${description}`, status);
    }
    if (!this.configService.pcc) {
      return new TravelportAuthError('MISSING_PCC', 'PCC is not configured.', status);
    }
    if (!this.configService.targetBranch) {
      return new TravelportAuthError('MISSING_TARGET_BRANCH', 'Target Branch is not configured.', status);
    }
    if (status === 401) {
      if (code === 'invalid_client') {
        return new TravelportAuthError('INVALID_CLIENT_SECRET', `Invalid client credentials: ${description}`, 401);
      }
      return new TravelportAuthError('UNAUTHORIZED', `Unauthorized: ${description}`, 401);
    }
    if (status === 403) {
      return new TravelportAuthError('FORBIDDEN', `Forbidden: ${description}`, 403);
    }
    return new TravelportAuthError('AUTH_FAILED', `Travelport auth failed: ${description}`, status);
  }
}

// ponytail:__main__ self-check — runs only when invoked directly with `node token-manager.js`.
// Confirms the cache encrypts at rest and decrypts on get().
if (require.main === module) {
  (() => {
    const fakeConfig: any = {
      env: 'pre-production',
      clientId: 'cid_demo',
      clientSecret: 'sec_demo',
      pcc: 'DU7_1G',
      targetBranch: 'P7051234',
      tokenEndpoint: 'http://localhost:0/never',
      accessGroup: '',
      maskSecret: (s: string) => (s ? `${s.slice(0, 2)}***` : '***'),
      validateOrThrow: () => undefined,
    };
    const m = new TokenManager(fakeConfig);
    (m as any).cache = new TokenCache('pre-production', 'a'.repeat(64));
    // Use 5 minutes of validity so the 60s safety window doesn't kick in.
    (m as any).cache.set({ accessToken: 'ABC.DEF.GHI', expiresAt: Date.now() + 5 * 60_000 });
    const atRest: string | null = (m as any).cache.inspectAtRest();
    if (!atRest || atRest.includes('ABC.DEF.GHI')) {
      throw new Error('at-rest form must not contain raw token');
    }
    const got = (m as any).cache.get();
    if (got?.accessToken !== 'ABC.DEF.GHI') {
      throw new Error('cache must decrypt and return token on get()');
    }
    console.log('[token-manager self-check] OK — encryption round-trip + cache hit work.');
  })();
}
