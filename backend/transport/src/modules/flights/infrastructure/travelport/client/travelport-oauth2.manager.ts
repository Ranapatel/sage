import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { TravelportConfigService } from './travelport-config.service';

export interface TravelportTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

/**
 * Compatibility shim. Keeps the class name + public surface the existing
 * TravelportHttpClient and flights.module.ts depend on, while routing through
 * the new AuthenticationService → TokenManager → TokenCache pipeline.
 *
 * ponytail: this layer exists only so we don't churn DI across 6 files. It has
 * no logic of its own and can be removed once the HTTP client is updated to
 * depend on AuthenticationService directly.
 */
@Injectable()
export class TravelportOAuth2Manager implements OnModuleInit {
  private readonly logger = new Logger(TravelportOAuth2Manager.name);

  constructor(
    private readonly authService: AuthenticationService,
    private readonly configService: TravelportConfigService,
  ) {}

  onModuleInit(): void {
    this.configService.validateOrThrow();
  }

  async getAccessToken(): Promise<string> {
    return this.authService.getAccessToken();
  }

  /** Force-mint a new token. Used by TravelportHttpClient on 401. */
  async forceRefresh(): Promise<string> {
    return this.authService.forceRefresh();
  }

  getPcc(): string {
    return this.authService.getPcc();
  }

  getTargetBranch(): string {
    return this.authService.getTargetBranch();
  }

  getBaseUrl(): string {
    return this.authService.getBaseUrl();
  }
}
