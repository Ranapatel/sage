// All prices in backend are returned in INR.
// This module formats INR amounts directly — no USD conversion applied.

export const RATES: Record<string, number> = {
  USD: 1,
  INR: 83.5,
  EUR: 0.92,
  GBP: 0.79,
  AED: 3.67,
  JPY: 151.6,
  CNY: 7.23,
  AUD: 1.52,
  CAD: 1.36,
  CHF: 0.90,
  HKD: 7.83,
  SGD: 1.35,
  NZD: 1.66,
  KRW: 1350,
  MXN: 16.5,
  BRL: 5.05,
  RUB: 92.5,
  TRY: 32.2,
  ZAR: 18.7,
  THB: 36.6,
  IDR: 15900,
  MYR: 4.74,
  PHP: 56.2,
  VND: 24900,
  SAR: 3.75,
  QAR: 3.64,
  KWD: 0.31,
  OMR: 0.38,
  BHD: 0.38,
  EGP: 47.4,
  ARS: 860,
  CLP: 940,
  COP: 3800,
  PEN: 3.7,
  UAH: 39.2,
  PLN: 3.96,
  SEK: 10.6,
  NOK: 10.7,
  DKK: 6.85,
  TWD: 32.1,
}

export const SYMBOLS: Record<string, string> = {
  USD: '$',
  INR: '₹',
  EUR: '€',
  GBP: '£',
  AED: 'د.إ',
  JPY: '¥',
  CNY: '¥',
  AUD: 'A$',
  CAD: 'C$',
  CHF: 'Fr',
  HKD: 'HK$',
  SGD: 'S$',
  NZD: 'NZ$',
  KRW: '₩',
  MXN: '$',
  BRL: 'R$',
  RUB: '₽',
  TRY: '₺',
  ZAR: 'R',
  THB: '฿',
  IDR: 'Rp',
  MYR: 'RM',
  PHP: '₱',
  VND: '₫',
  SAR: 'SR',
  QAR: 'QR',
  KWD: 'KD',
  OMR: 'RO',
  BHD: 'BD',
  EGP: 'E£',
  ARS: '$',
  CLP: '$',
  COP: '$',
  PEN: 'S/',
  UAH: '₴',
  PLN: 'zł',
  SEK: 'kr',
  NOK: 'kr',
  DKK: 'kr',
  TWD: 'NT$',
}

export const CURRENCY_NAMES: Record<string, string> = {
  USD: 'US Dollar',
  INR: 'Indian Rupee',
  EUR: 'Euro',
  GBP: 'British Pound',
  AED: 'UAE Dirham',
  JPY: 'Japanese Yen',
  CNY: 'Chinese Yuan',
  AUD: 'Australian Dollar',
  CAD: 'Canadian Dollar',
  CHF: 'Swiss Franc',
  HKD: 'Hong Kong Dollar',
  SGD: 'Singapore Dollar',
  NZD: 'New Zealand Dollar',
  KRW: 'South Korean Won',
  MXN: 'Mexican Peso',
  BRL: 'Brazilian Real',
  RUB: 'Russian Ruble',
  TRY: 'Turkish Lira',
  ZAR: 'South African Rand',
  THB: 'Thai Baht',
  IDR: 'Indonesian Rupiah',
  MYR: 'Malaysian Ringgit',
  PHP: 'Philippine Peso',
  VND: 'Vietnamese Dong',
  SAR: 'Saudi Riyal',
  QAR: 'Qatari Riyal',
  KWD: 'Kuwaiti Dinar',
  OMR: 'Omani Rial',
  BHD: 'Bahraini Dinar',
  EGP: 'Egyptian Pound',
  ARS: 'Argentine Peso',
  CLP: 'Chilean Peso',
  COP: 'Colombian Peso',
  PEN: 'Peruvian Sol',
  UAH: 'Ukrainian Hryvnia',
  PLN: 'Polish Zloty',
  SEK: 'Swedish Krona',
  NOK: 'Norwegian Krone',
  DKK: 'Danish Krone',
  TWD: 'New Taiwan Dollar',
}

/**
 * Format a price that is ALREADY in INR (backend always returns INR).
 * If the user's display currency is not INR, convert INR → target.
 */
export function formatPrice(inrAmount: number, currency: string = 'INR'): string {
  if (!inrAmount || isNaN(inrAmount)) return '₹0'

  let amount = inrAmount

  if (currency !== 'INR') {
    // Convert INR → USD → target currency
    const inUSD = inrAmount / RATES['INR']
    amount = inUSD * (RATES[currency] ?? 1)
  }

  const symbol = SYMBOLS[currency] ?? currency
  const locale = currency === 'INR' ? 'en-IN' : 'en-US'
  
  return `${symbol}${Math.round(amount).toLocaleString(locale)}`
}

/** Legacy helper kept for compatibility — same as formatPrice */
export function convertPrice(inrAmount: number, toCurrency: string): number {
  if (toCurrency === 'INR') return Math.round(inrAmount)
  const inUSD = inrAmount / RATES['INR']
  return Math.round(inUSD * (RATES[toCurrency] ?? 1))
}

export const ALL_CURRENCIES = Object.keys(RATES) as (keyof typeof RATES)[]
