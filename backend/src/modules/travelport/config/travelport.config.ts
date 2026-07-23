import dotenv from 'dotenv';
dotenv.config();

export interface TravelportConfig {
  oauthUrl: string;
  apiBaseUrl: string;
  clientId: string;
  clientSecret: string;
  accessGroup: string;
  pcc: string;
  acceptVersion: string;
  contentVersion: string;
  timeoutMs: number;
  maxRetries: number;
  environment: 'development' | 'sandbox' | 'production';
}

export const getTravelportConfig = (): TravelportConfig => {
  const env = (process.env.TRAVELPORT_ENV || process.env.NODE_ENV || 'pre-production') as any;
  const isProd = env === 'production';

  const defaultOauthUrl = isProd
    ? 'https://auth.travelport.net/oauth/token'
    : 'https://auth.pp.travelport.net/oauth/token';

  const defaultApiBaseUrl = isProd
    ? 'https://api.travelport.net/11'
    : 'https://api.pp.travelport.net/11';

  const oauthUrl = process.env.TRAVELPORT_TOKEN_URL || process.env.TRAVELPORT_OAUTH_URL || defaultOauthUrl;
  const apiBaseUrl = process.env.TRAVELPORT_BASE_URL || process.env.TRAVELPORT_API_BASE_URL || defaultApiBaseUrl;
  const clientId = process.env.TRAVELPORT_CLIENT_ID || '';
  const clientSecret = process.env.TRAVELPORT_CLIENT_SECRET || '';
  const accessGroup = process.env.TRAVELPORT_ACCESS_GROUP || '';
  const pcc = process.env.TRAVELPORT_PCC || '';
  const acceptVersion = process.env.TRAVELPORT_ACCEPT_VERSION || '11.0.0';
  const contentVersion = process.env.TRAVELPORT_CONTENT_VERSION || '11.0.0';
  const timeoutMs = parseInt(process.env.TRAVELPORT_REQUEST_TIMEOUT_MS || process.env.TRAVELPORT_TIMEOUT_MS || '20000', 10);
  const maxRetries = parseInt(process.env.TRAVELPORT_MAX_RETRIES || '2', 10);
  const environment = isProd ? 'production' : (env === 'sandbox' ? 'sandbox' : 'development');

  return {
    oauthUrl,
    apiBaseUrl,
    clientId,
    clientSecret,
    accessGroup,
    pcc,
    acceptVersion,
    contentVersion,
    timeoutMs,
    maxRetries,
    environment,
  };
};
