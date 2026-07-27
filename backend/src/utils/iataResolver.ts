/**
 * IATA City & Commercial Airport Code Resolver — TripSage
 * Maps city names to 3-letter IATA commercial airport codes and validates airport existence.
 */

import { validateCommercialAirport, findNearestCommercialAirport, AirportValidationResult } from '../services/airportDatabase';

const IATA_MAP: Record<string, string> = {
  // India
  delhi: 'DEL',
  newdelhi: 'DEL',
  'new delhi': 'DEL',
  goa: 'GOI',
  mumbai: 'BOM',
  bombay: 'BOM',
  bangalore: 'BLR',
  bengaluru: 'BLR',
  chennai: 'MAA',
  madras: 'MAA',
  kolkata: 'CCU',
  calcutta: 'CCU',
  hyderabad: 'HYD',
  ahmedabad: 'AMD',
  pune: 'PNQ',
  jaipur: 'JAI',
  kochi: 'COK',
  cochin: 'COK',
  goadabolim: 'GOI',
  mopa: 'GOX',
  varanasi: 'VNS',
  amritsar: 'ATQ',
  lucknow: 'LKO',

  // International
  london: 'LHR',
  paris: 'CDG',
  newyork: 'JFK',
  'new york': 'JFK',
  nyc: 'JFK',
  dubai: 'DXB',
  singapore: 'SIN',
  bangkok: 'BKK',
  tokyo: 'HND',
  sydney: 'SYD',
  rome: 'FCO',
  barcelona: 'BCN',
  madrid: 'MAD',
  amsterdam: 'AMS',
  frankfurt: 'FRA',
  hongkong: 'HKG',
  'hong kong': 'HKG',
  istanbul: 'IST',
  losangeles: 'LAX',
  'los angeles': 'LAX',
  sanfrancisco: 'SFO',
  'san francisco': 'SFO',
  chicago: 'ORD',
  toronto: 'YYZ',
  bali: 'DPS',
  phuket: 'HKT',
  maldives: 'MLE',
  male: 'MLE',
  zurch: 'ZRH',
  zurich: 'ZRH',
};

export function validateCityAirport(cityOrName: string | undefined): AirportValidationResult {
  return validateCommercialAirport(cityOrName);
}

export function resolveIataCode(cityOrName: string | undefined, defaultFallback: string | null = null): string | null {
  if (!cityOrName) return defaultFallback;

  const clean = cityOrName.trim().toLowerCase();

  // 1. Check if already a 3-letter uppercase IATA code
  if (/^[a-z]{3}$/i.test(clean)) {
    return clean.toUpperCase();
  }

  // 2. Commercial Airport Database Validation
  const validation = validateCommercialAirport(cityOrName);
  if (validation.hasCommercialAirport && validation.iataCode) {
    return validation.iataCode;
  }

  // 3. Fallback to direct map
  const cityKey = clean.split(',')[0].trim();
  if (IATA_MAP[cityKey]) {
    return IATA_MAP[cityKey];
  }

  return defaultFallback;
}

export { findNearestCommercialAirport };
