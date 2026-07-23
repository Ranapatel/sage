export const TRAVELPORT_HEADERS = {
  AUTHORIZATION: 'Authorization',
  ACCEPT: 'Accept',
  ACCEPT_ENCODING: 'Accept-Encoding',
  CACHE_CONTROL: 'Cache-Control',
  XAUTH_ACCESSGROUP: 'XAUTH_TRAVELPORT_ACCESSGROUP',
  TVP_PCC_CORE: 'TVP-PCC-Core',
  TRAVELPORT_TARGET_BRANCH: 'Travelport-Target-Branch',
  ACCEPT_VERSION: 'Accept-Version',
  CONTENT_VERSION: 'Content-Version',
  CONTENT_TYPE: 'Content-Type',
  TRACE_ID: 'TraceId',
  X_CORRELATION_ID: 'X-Correlation-ID',
  TRANSACTION_ID_HEADER: 'transactionid',
  TRAVELPORT_TRANSACTION_ID: 'Travelport-Transaction-Id',
} as const;

export const PASSENGER_TYPES = {
  ADULT: 'ADT',
  CHILD: 'CHD',
  INFANT_LAP: 'INF',
  INFANT_SEAT: 'INS',
  YOUTH: 'YTH',
  SENIOR: 'SRC',
} as const;

export const CABIN_CLASSES = {
  ECONOMY: 'Economy',
  PREMIUM_ECONOMY: 'PremiumEconomy',
  BUSINESS: 'Business',
  FIRST: 'First',
} as const;

export enum ErrorCategory {
  AUTHORIZATION = 'AuthorizationError',
  VALIDATION = 'ValidationError',
  COMMUNICATION = 'CommunicationError',
  SEARCH = 'SearchError',
  SYSTEM = 'SystemError',
}

export const TRAVELPORT_ENDPOINTS = {
  OAUTH_TOKEN: '/oauth/token',
  CATALOG_OFFERINGS: '/air/catalog/search/catalogproductofferings',
  AIR_PRICE_BUILD_FROM_CATALOG: '/air/price/offers/buildfromcatalogproductofferings',
  FARE_RULES_BUILD_FROM_CATALOG: '/air/farerules/buildfromcatalogoffering',
} as const;
