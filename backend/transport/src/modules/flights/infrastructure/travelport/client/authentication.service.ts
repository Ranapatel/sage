import { Injectable, Logger } from '@nestjs/common';
import { TokenManager } from './token-manager';
import { TravelportConfigService } from './travelport-config.service';

export interface TravelportRequestHeaders {
  Authorization: string;
  'TVP-PCC-Core': string;
  'Travelport-Target-Branch': string;
  XAUTH_TRAVELPORT_ACCESSGROUP: string;
}

/**
 * Thin façade over the TokenManager. This is the seam the HTTP client and any
 * future callers use. The TokenManager and TokenCache are kept internal.
 */
@Injectable()
export class AuthenticationService {
  private readonly logger = new Logger(AuthenticationService.name);

  constructor(
    private readonly tokenManager: TokenManager,
    private readonly configService: TravelportConfigService,
  ) {}

  /** Returns a Bearer access token. Auto-refreshes if expired or near expiry. */
  async getAccessToken(): Promise<string> {
    return this.tokenManager.getToken();
  }

  /** Drops the cache and mints a new token. Used after a 401. */
  async forceRefresh(): Promise<string> {
    return this.tokenManager.forceRefresh();
  }

  /** Returns the headers every Travelport request must carry. */
  getRequestHeaders(): TravelportRequestHeaders {
    const pcc = this.configService.pcc || '';
    const targetBranch = this.configService.targetBranch || '';
    return {
      Authorization: 'Bearer ', // appended by the HTTP client after getAccessToken()
      'TVP-PCC-Core': pcc,
      'Travelport-Target-Branch': targetBranch,
      XAUTH_TRAVELPORT_ACCESSGROUP: this.configService.accessGroup,
    };
  }

  // ---------- passthroughs the existing TravelportOAuth2Manager (compat shim) needs ----------
  getPcc(): string {
    return this.configService.pcc;
  }
  getTargetBranch(): string {
    return this.configService.targetBranch;
  }
  getBaseUrl(): string {
    return this.configService.baseUrl;
  }
}
