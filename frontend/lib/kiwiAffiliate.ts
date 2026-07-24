/**
 * Kiwi.com Affiliate Deep Link Builder
 * Dynamically constructs Travelpayouts affiliate URLs for flight bookings.
 */

export interface KiwiFlightParams {
  origin?: string
  destination?: string
  departureDate?: string
  returnDate?: string
  passengers?: number | string
  adults?: number | string
  children?: number | string
  cabinClass?: string
  affiliateId?: string
  affiliateBaseUrl?: string
}

export function buildKiwiAffiliateUrl(
  flight?: any,
  searchParams?: KiwiFlightParams
): string {
  const baseUrl = process.env.NEXT_PUBLIC_KIWI_AFFILIATE_URL || searchParams?.affiliateBaseUrl || 'https://kiwi.tpx.lv/bOjqIFkg'

  // Extract route details
  const origin = (flight?.origin || searchParams?.origin || 'HYD').trim().toLowerCase()
  const dest = (flight?.destination || searchParams?.destination || 'DPS').trim().toLowerCase()
  const depDate = flight?.departureDate || searchParams?.departureDate || new Date().toISOString().split('T')[0]
  const retDate = searchParams?.returnDate || ''
  
  const pax = searchParams?.passengers || searchParams?.adults || 1
  const cabin = (flight?.cabinClass || searchParams?.cabinClass || 'economy').toLowerCase()

  // Target Kiwi Direct Search URL
  const targetPath = `${origin}-${dest}/${depDate}${retDate ? `/${retDate}` : ''}`
  const targetQuery = new URLSearchParams({
    passengers: String(pax),
    cabinClass: cabin.includes('business') ? 'business' : cabin.includes('premium') ? 'economy_premium' : cabin.includes('first') ? 'first' : 'economy',
    utm_source: 'tripsage',
    utm_medium: 'referral'
  })
  const targetUrl = `https://www.kiwi.com/en/search/results/${targetPath}?${targetQuery.toString()}`

  // Append deep link & parameters to Travelpayouts Kiwi affiliate link
  const affiliateParams = new URLSearchParams({
    origin: origin.toUpperCase(),
    destination: dest.toUpperCase(),
    departureDate: depDate,
    passengers: String(pax),
    cabinClass: cabin,
    dl: targetUrl
  })
  if (retDate) affiliateParams.append('returnDate', retDate)

  return `${baseUrl}?${affiliateParams.toString()}`
}
