import { v4 as uuidv4 } from 'uuid';
import { TRAVELPORT_HEADERS } from '../constants/travelport.constants';

export const getOrCreateTraceId = (existingTraceId?: string): string => {
  if (existingTraceId && existingTraceId.trim().length > 0) {
    return existingTraceId.trim();
  }
  return `ts-${uuidv4()}`;
};

export const extractTransactionIdFromHeaders = (headers?: Record<string, any>): string | undefined => {
  if (!headers) return undefined;
  
  // Case-insensitive header check
  for (const key of Object.keys(headers)) {
    const lowerKey = key.toLowerCase();
    if (
      lowerKey === TRAVELPORT_HEADERS.TRANSACTION_ID_HEADER.toLowerCase() ||
      lowerKey === TRAVELPORT_HEADERS.TRAVELPORT_TRANSACTION_ID.toLowerCase()
    ) {
      const val = headers[key];
      return Array.isArray(val) ? val[0] : String(val);
    }
  }

  return undefined;
};
