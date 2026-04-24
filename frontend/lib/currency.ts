// All prices in backend are returned in INR.
// This module formats INR amounts directly — no USD conversion applied.

export const RATES: Record<string, number> = {
  USD: 1,
  INR: 83.5,
  EUR: 0.92,
  GBP: 0.79,
  AED: 3.67,
}

export const SYMBOLS: Record<string, string> = {
  USD: '$',
  INR: '₹',
  EUR: '€',
  GBP: '£',
  AED: 'د.إ',
}

export const CURRENCY_NAMES: Record<string, string> = {
  USD: 'US Dollar',
  INR: 'Indian Rupee',
  EUR: 'Euro',
  GBP: 'British Pound',
  AED: 'UAE Dirham',
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
    amount = Math.round(inUSD * (RATES[currency] ?? 1))
  }

  const symbol = SYMBOLS[currency] ?? currency
  if (currency === 'INR') {
    return `${symbol}${Math.round(amount).toLocaleString('en-IN')}`
  }
  return `${symbol}${Math.round(amount).toLocaleString('en-US')}`
}

/** Legacy helper kept for compatibility — same as formatPrice */
export function convertPrice(inrAmount: number, toCurrency: string): number {
  if (toCurrency === 'INR') return Math.round(inrAmount)
  const inUSD = inrAmount / RATES['INR']
  return Math.round(inUSD * (RATES[toCurrency] ?? 1))
}

export const ALL_CURRENCIES = Object.keys(RATES) as (keyof typeof RATES)[]
