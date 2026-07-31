const { validateCommercialAirport, findNearestCommercialAirport } = require('../services/airportDatabase');

const IATA_MAP = {
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
  secunderabad: 'HYD',
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
};

function resolveIata(cityOrCode) {
  if (!cityOrCode) return null;
  const clean = cityOrCode.trim().toLowerCase().split(',')[0];
  if (/^[a-z]{3}$/i.test(clean)) return clean.toUpperCase();
  if (IATA_MAP[clean]) return IATA_MAP[clean];
  const validation = validateCommercialAirport(cityOrCode);
  return validation.iataCode;
}

function validateCityAirport(query) {
  return validateCommercialAirport(query);
}

module.exports = {
  IATA_MAP,
  resolveIata,
  validateCityAirport,
  findNearestCommercialAirport,
};
