/**
 * IATA City & Airport Code Resolver
 * Maps city names to 3-letter IATA airport codes required by Travelport API.
 */

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

export function resolveIataCode(cityOrName: string | undefined, defaultFallback = 'DEL'): string {
  if (!cityOrName) return defaultFallback;

  const clean = cityOrName.trim().toLowerCase();

  // 1. Check if already a 3-letter uppercase IATA code
  if (/^[a-z]{3}$/i.test(clean)) {
    return clean.toUpperCase();
  }

  // 2. Direct map match
  const cityKey = clean.split(',')[0].trim();
  if (IATA_MAP[cityKey]) {
    return IATA_MAP[cityKey];
  }

  // 3. Partial key match
  for (const [name, code] of Object.entries(IATA_MAP)) {
    if (cityKey.includes(name) || name.includes(cityKey)) {
      return code;
    }
  }

  return defaultFallback;
}
