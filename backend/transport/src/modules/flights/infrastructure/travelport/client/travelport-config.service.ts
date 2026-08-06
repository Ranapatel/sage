import { Injectable, Logger } from '@nestjs/common';

export type TravelportEnvironment = 'development' | 'sandbox' | 'pre-production' | 'production';

@Injectable()
export class TravelportConfigService {
  private readonly logger = new Logger(TravelportConfigService.name);

  readonly env: TravelportEnvironment;
  readonly clientId: string;
  readonly clientSecret: string;
  readonly customerId: string;
  readonly pcc: string;
  readonly targetBranch: string;
  readonly accessGroup: string;
  readonly baseUrl: string;
  readonly tokenEndpoint: string;

  constructor() {
    this.env = (process.env.TRAVELPORT_ENV as TravelportEnvironment) || 'pre-production';
    this.clientId = process.env.TRAVELPORT_CLIENT_ID || '';
    this.clientSecret = process.env.TRAVELPORT_CLIENT_SECRET || '';
    this.customerId = process.env.TRAVELPORT_CUSTOMER_ID || '';
    this.pcc = process.env.TRAVELPORT_PCC || '';
    this.targetBranch = process.env.TRAVELPORT_TARGET_BRANCH || '';
    this.accessGroup = process.env.TRAVELPORT_ACCESS_GROUP || '';

    if (this.env === 'production') {
      this.baseUrl = process.env.TRAVELPORT_BASE_URL || 'https://api.travelport.net/11';
      this.tokenEndpoint = process.env.TRAVELPORT_TOKEN_URL || 'https://auth.travelport.net/oauth/token';
    } else {
      this.baseUrl = process.env.TRAVELPORT_BASE_URL || 'https://api.pp.travelport.net/11';
      this.tokenEndpoint = process.env.TRAVELPORT_TOKEN_URL || 'https://auth.pp.travelport.net/oauth/token';
    }
  }

  /**
   * Validates credentials on application startup (Fail-Fast)
   */
  validateOrThrow(): void {
    this.logger.log(`[Travelport Config] Initializing credentials for environment: [${this.env.toUpperCase()}]`);

    const missing: string[] = [];
    if (!this.clientId) missing.push('TRAVELPORT_CLIENT_ID');
    if (!this.clientSecret) missing.push('TRAVELPORT_CLIENT_SECRET');
    if (!this.pcc) missing.push('TRAVELPORT_PCC');

    if (missing.length > 0) {
      const errorMsg = `[Travelport Startup Error] Missing Travelport credentials: ${missing.join(', ')}. Live Travelport API requests will use mock fallback.`;
      this.logger.warn(errorMsg);
      if (process.env.NODE_ENV === 'production') {
        throw new Error(errorMsg);
      }
      return;
    }

    this.logger.log(
      `[Travelport Config] ✅ Validated credentials. Target Base URL: ${this.baseUrl} | PCC: ${this.pcc} | Target Branch: ${this.targetBranch} | Client ID: ${this.maskSecret(this.clientId)}`,
    );
  }

  maskSecret(secret: string): string {
    if (!secret) return '***';
    if (secret.length <= 6) return '***';
    return `${secret.substring(0, 3)}***${secret.substring(secret.length - 3)}`;
  }
}
