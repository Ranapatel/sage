import { TRAVELPORT_HEADERS } from '../constants/travelport.constants';
import { getTravelportConfig, TravelportConfig } from '../config/travelport.config';

export interface BuildHeadersOptions {
  bearerToken?: string;
  isPostRequest?: boolean;
  traceId?: string;
  configOverride?: Partial<TravelportConfig>;
}

export class TravelportHeaderBuilder {
  /**
   * Constructs the centralized Header object required for all Travelport API requests.
   * No API service or caller constructs headers manually.
   */
  public static build(options: BuildHeadersOptions = {}): Record<string, string> {
    const config = { ...getTravelportConfig(), ...options.configOverride };
    const pccValue = (config.pcc || process.env.TRAVELPORT_PCC || '').trim();
    const targetBranchValue = ((config as any).targetBranch || process.env.TRAVELPORT_TARGET_BRANCH || '').trim();
    const accessGroupValue = (config.accessGroup || process.env.TRAVELPORT_ACCESS_GROUP || '').trim();

    const headers: Record<string, string> = {
      [TRAVELPORT_HEADERS.ACCEPT]: 'application/json',
      [TRAVELPORT_HEADERS.ACCEPT_ENCODING]: 'gzip, deflate',
      [TRAVELPORT_HEADERS.CACHE_CONTROL]: 'no-cache',
      [TRAVELPORT_HEADERS.TVP_PCC_CORE]: pccValue,
      [TRAVELPORT_HEADERS.ACCEPT_VERSION]: config.acceptVersion || '11.0.0',
      [TRAVELPORT_HEADERS.CONTENT_VERSION]: config.contentVersion || '11.0.0',
    };

    if (targetBranchValue) {
      headers[TRAVELPORT_HEADERS.TRAVELPORT_TARGET_BRANCH] = targetBranchValue;
    }

    if (accessGroupValue) {
      headers[TRAVELPORT_HEADERS.XAUTH_ACCESSGROUP] = accessGroupValue;
    }

    if (options.bearerToken) {
      headers[TRAVELPORT_HEADERS.AUTHORIZATION] = options.bearerToken.startsWith('Bearer ')
        ? options.bearerToken
        : `Bearer ${options.bearerToken}`;
    }

    if (options.isPostRequest !== false) {
      headers[TRAVELPORT_HEADERS.CONTENT_TYPE] = 'application/json';
    }

    if (options.traceId) {
      headers[TRAVELPORT_HEADERS.TRACE_ID] = options.traceId;
    }

    return headers;
  }
}
