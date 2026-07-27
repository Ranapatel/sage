/**
 * TripSage — Country & International Route Utility
 */

const CITY_TO_COUNTRY = {
  // India
  hyderabad: 'India',
  secunderabad: 'India',
  bangalore: 'India',
  bengaluru: 'India',
  delhi: 'India',
  'new delhi': 'India',
  mumbai: 'India',
  cst: 'India',
  chennai: 'India',
  kochi: 'India',
  ernakulam: 'India',
  pune: 'India',
  kolkata: 'India',
  howrah: 'India',
  ahmedabad: 'India',
  goa: 'India',
  madgaon: 'India',
  jaipur: 'India',
  varanasi: 'India',
  amritsar: 'India',
  surat: 'India',
  bhopal: 'India',
  agra: 'India',
  patna: 'India',
  lucknow: 'India',
  lonavala: 'India',
  mysuru: 'India',
  mysore: 'India',
  trivandrum: 'India',
  thiruvananthapuram: 'India',
  visakhapatnam: 'India',
  vizag: 'India',
  chandigarh: 'India',
  gurgaon: 'India',
  gurugram: 'India',
  noida: 'India',
  vadodara: 'India',
  indore: 'India',
  coimbatore: 'India',
  mangalore: 'India',
  shimla: 'India',
  manali: 'India',
  darjeeling: 'India',
  munnar: 'India',
  ooty: 'India',
  rishikesh: 'India',
  haridwar: 'India',
  udaipur: 'India',

  // Indonesia
  bali: 'Indonesia',
  denpasar: 'Indonesia',
  ubud: 'Indonesia',
  kuta: 'Indonesia',
  seminyak: 'Indonesia',
  jakarta: 'Indonesia',
  surabaya: 'Indonesia',

  // UAE
  dubai: 'United Arab Emirates',
  'abu dhabi': 'United Arab Emirates',
  sharjah: 'United Arab Emirates',

  // UK
  london: 'United Kingdom',
  manchester: 'United Kingdom',
  edinburgh: 'United Kingdom',
  birmingham: 'United Kingdom',

  // Singapore
  singapore: 'Singapore',

  // Thailand
  bangkok: 'Thailand',
  phuket: 'Thailand',
  'chiang mai': 'Thailand',
  pattaya: 'Thailand',
  'koh samui': 'Thailand',

  // Japan
  tokyo: 'Japan',
  osaka: 'Japan',
  kyoto: 'Japan',
  yokohama: 'Japan',

  // France
  paris: 'France',
  nice: 'France',
  lyon: 'France',

  // Italy
  rome: 'Italy',
  milan: 'Italy',
  venice: 'Italy',
  florence: 'Italy',

  // USA
  'new york': 'United States',
  'los angeles': 'United States',
  'san francisco': 'United States',
  chicago: 'United States',
  miami: 'United States',
  'las vegas': 'United States',
  washington: 'United States',
  boston: 'United States',
  seattle: 'United States',

  // Australia
  sydney: 'Australia',
  melbourne: 'Australia',
  brisbane: 'Australia',
  perth: 'Australia',

  // Malaysia
  'kuala lumpur': 'Malaysia',
  penang: 'Malaysia',
  langkawi: 'Malaysia',

  // Others
  male: 'Maldives',
  colombo: 'Sri Lanka',
  kandy: 'Sri Lanka',
  kathmandu: 'Nepal',
  pokhara: 'Nepal',
  doha: 'Qatar',
  toronto: 'Canada',
  vancouver: 'Canada',
  zurich: 'Switzerland',
  geneva: 'Switzerland',
  amsterdam: 'Netherlands',
  istanbul: 'Turkey',
  cairo: 'Egypt',
  hanoi: 'Vietnam',
  'ho chi minh': 'Vietnam',
  'da nang': 'Vietnam',
}

const COUNTRY_ALIASES = {
  india: 'India',
  in: 'India',
  bharat: 'India',

  indonesia: 'Indonesia',
  id: 'Indonesia',
  bali: 'Indonesia',

  uae: 'United Arab Emirates',
  'united arab emirates': 'United Arab Emirates',
  dubai: 'United Arab Emirates',
  ae: 'United Arab Emirates',

  uk: 'United Kingdom',
  'united kingdom': 'United Kingdom',
  england: 'United Kingdom',
  britain: 'United Kingdom',
  gb: 'United Kingdom',

  singapore: 'Singapore',
  sg: 'Singapore',

  thailand: 'Thailand',
  th: 'Thailand',

  usa: 'United States',
  'united states': 'United States',
  us: 'United States',
  america: 'United States',

  japan: 'Japan',
  jp: 'Japan',

  france: 'France',
  fr: 'France',

  germany: 'Germany',
  de: 'Germany',

  australia: 'Australia',
  au: 'Australia',

  malaysia: 'Malaysia',
  my: 'Malaysia',

  italy: 'Italy',
  it: 'Italy',

  spain: 'Spain',
  es: 'Spain',

  maldives: 'Maldives',
  mv: 'Maldives',

  'sri lanka': 'Sri Lanka',
  lk: 'Sri Lanka',

  nepal: 'Nepal',
  np: 'Nepal',

  qatar: 'Qatar',
  qa: 'Qatar',

  canada: 'Canada',
  ca: 'Canada',

  switzerland: 'Switzerland',
  ch: 'Switzerland',

  netherlands: 'Netherlands',
  nl: 'Netherlands',

  turkey: 'Turkey',
  tr: 'Turkey',
  turkiye: 'Turkey',

  vietnam: 'Vietnam',
  vn: 'Vietnam',

  egypt: 'Egypt',
  eg: 'Egypt',
}

function getCountry(location) {
  if (!location) return 'India'
  const loc = location.trim()

  if (loc.includes(',')) {
    const parts = loc.split(',').map((p) => p.trim())
    const lastPart = parts[parts.length - 1].toLowerCase()
    if (COUNTRY_ALIASES[lastPart]) {
      return COUNTRY_ALIASES[lastPart]
    }
    const firstPart = parts[0].toLowerCase()
    if (CITY_TO_COUNTRY[firstPart]) {
      return CITY_TO_COUNTRY[firstPart]
    }
    return parts[parts.length - 1]
  }

  const lower = loc.toLowerCase()
  if (CITY_TO_COUNTRY[lower]) {
    return CITY_TO_COUNTRY[lower]
  }
  if (COUNTRY_ALIASES[lower]) {
    return COUNTRY_ALIASES[lower]
  }

  for (const [key, country] of Object.entries(CITY_TO_COUNTRY)) {
    if (lower.includes(key)) return country
  }
  for (const [key, country] of Object.entries(COUNTRY_ALIASES)) {
    if (lower.includes(key)) return country
  }

  return 'India'
}

function isSameCountry(origin, destination) {
  if (!origin || !destination) return true
  const c1 = getCountry(origin)
  const c2 = getCountry(destination)
  return c1.toLowerCase() === c2.toLowerCase()
}

module.exports = {
  getCountry,
  isSameCountry,
}
