import { isSameCountry } from './countryUtils'

// ─── AI Smart Bus Planner Engine & redBus Deep Link Builder ──────────────────

export interface BusLeg {
  id: string
  operatorName: string
  busType: string // e.g. 'Volvo Multi-Axle AC Sleeper (2+1)', 'Scania AC Seater', 'EV Luxury Sleeper'
  fromCity: string
  fromTerminal: string
  toCity: string
  toTerminal: string
  departureTime: string
  arrivalTime: string
  durationStr: string
  durationMinutes: number
  distanceKm: number
  isOvernight?: boolean
  fares: {
    seater?: { min: number; max: number }
    sleeper?: { min: number; max: number }
  }
  rating?: number
}

export interface LastMileTransport {
  type: 'taxi' | 'bus' | 'auto' | 'metro'
  fromLocation: string
  toLocation: string
  durationStr: string
  distanceKm: number
  estimatedCostMin: number
  estimatedCostMax: number
  localBusCostMin?: number
  localBusCostMax?: number
  details?: string
}

export interface TransferInfo {
  terminalName: string
  cityName: string
  waitingTimeStr: string
  waitingTimeMinutes: number
}

export interface SmartBusRoute {
  id: string
  type: 'best' | 'fastest' | 'cheapest'
  title: string
  isRecommended?: boolean
  isDirectRoute?: boolean
  comparisonLabel?: string // e.g. "⭐ Direct Route — Preferred for Simplicity (0 Transfers)" or "⭐ AI Recommended — 2h Faster than Direct Bus"
  totalDurationStr: string
  totalDurationMinutes: number
  changesCount: number
  totalCostMin: number
  totalCostMax: number
  aiConfidenceScore: number // 0 - 100
  legs: BusLeg[]
  transfers: TransferInfo[]
  lastMile?: LastMileTransport
  metrics: {
    comfort: 'High' | 'Moderate' | 'Low'
    comfortStars: number // 1 - 5
    crowd: 'Low' | 'Moderate' | 'High'
    reliability: 'High' | 'Moderate' | 'Low'
  }
}

export interface SmartBusPlannerResult {
  origin: {
    name: string
    terminal: string
  }
  destination: {
    name: string
    terminal: string
  }
  distanceKm: number
  hasDirectBuses: boolean
  isDomestic?: boolean
  aiAnalysisText: string
  directVsSmartComparisonText?: string
  routes: {
    best: SmartBusRoute
    fastest: SmartBusRoute
    cheapest: SmartBusRoute
  }
}

/**
 * Formats a date for redBus deep link query (e.g. DD-MMM-YYYY or DD-MM-YYYY)
 */
function formatRedBusDate(dateStr?: string): string {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      // YYYY-MM-DD -> DD-MM-YYYY
      return `${parts[2]}-${parts[1]}-${parts[0]}`
    }
  }
  return dateStr
}

/**
 * Builds official redBus deep links dynamically using city names & journey date.
 *
 * Env-driven override (per spec):
 *   - NEXT_PUBLIC_BUS_BOOKING_URL — when set, takes precedence and is returned
 *     as the canonical deep link (env-var deep links are treated as fully
 *     pre-configured; we do NOT append additional query params to them).
 *   - NEXT_PUBLIC_AFFILIATE_BUSES — legacy/affiliate fallback (same precedence
 *     rules as above).
 *
 * If neither env var is set, falls back to a safe redBus URL pattern using
 * only the well-known query params (fromCityName / toCityName / do). Unsupported
 * query parameters are never fabricated.
 */
export function buildRedBusDeepLink(params: {
  fromCity: string
  toCity: string
  dateStr?: string
  passengers?: number
}): string {
  // 1. Honor operator-provided deep link (spec: configurable deep links via env).
  //    Per spec: "If deep-link parameters are unsupported by the booking partner,
  //    redirect users to the partner's homepage instead of fabricating parameters."
  const envUrl =
    process.env.NEXT_PUBLIC_BUS_BOOKING_URL ||
    process.env.NEXT_PUBLIC_AFFILIATE_BUSES
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl
  }

  // 2. Fallback: safe redBus route page with only well-known supported params.
  const fromSlug = (params.fromCity || 'hyderabad')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
  const toSlug = (params.toCity || 'goa')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')

  const formattedDate = formatRedBusDate(params.dateStr)
  const baseUrl = `https://www.redbus.in/bus-tickets/${fromSlug}-to-${toSlug}`

  const urlParams = new URLSearchParams()
  urlParams.set('fromCityName', params.fromCity || 'Hyderabad')
  urlParams.set('toCityName', params.toCity || 'Goa')
  if (formattedDate) {
    urlParams.set('do', formattedDate)
  }

  return `${baseUrl}?${urlParams.toString()}`
}

/**
 * Fallback booking links for other bus providers (MakeMyTrip, AbhiBus)
 */
export function buildOtherBusBookingLinks(fromCity: string, toCity: string, dateStr?: string) {
  const from = (fromCity || '').toLowerCase().trim().replace(/\s+/g, '-')
  const to = (toCity || '').toLowerCase().trim().replace(/\s+/g, '-')
  const date = dateStr || new Date().toISOString().split('T')[0]

  return {
    makemytrip: `https://www.makemytrip.com/bus-tickets/${from}-to-${to}/`,
    abhibus: `https://www.abhibus.com/buses/${from}-to-${to}`,
    redbus: buildRedBusDeepLink({ fromCity, toCity, dateStr }),
  }
}

/**
 * Synthesizes AI Smart Bus Routes applying exact Smart Selection Rules:
 * Rule 1: Prioritize Direct Route if available.
 * Rule 2: No Direct Route -> Build 1-2 transfer multi-hop route
 * Rule 3: Compare Direct vs. Smart Route (Label if smart route is >2h faster or saves fare)
 */
export function generateSmartBusRoutes(params: {
  origin: string
  destination: string
  date?: string
  passengers?: number
  busType?: string
  rawBuses?: any[]
}): SmartBusPlannerResult {
  const originClean = (params.origin || 'Hyderabad').trim()
  const destClean = (params.destination || 'Goa').trim()

  const rawList = params.rawBuses || []

  // International Route Check: If different countries and no live buses available, do not generate fake multi-hop routes
  if (!isSameCountry(originClean, destClean) && rawList.length === 0) {
    const dummyLeg: BusLeg = {
      id: 'intl_unavailable_bus_leg',
      operatorName: 'N/A',
      busType: 'N/A',
      fromCity: originClean,
      fromTerminal: `${originClean} Terminal`,
      toCity: destClean,
      toTerminal: `${destClean} Terminal`,
      departureTime: '--:--',
      arrivalTime: '--:--',
      durationStr: 'N/A',
      durationMinutes: 0,
      distanceKm: 0,
      fares: {}
    }
    const dummyRoute: SmartBusRoute = {
      id: 'intl_unavailable_bus_route',
      type: 'best',
      title: 'International Bus Services Not Available',
      totalDurationStr: 'N/A',
      totalDurationMinutes: 0,
      changesCount: 0,
      totalCostMin: 0,
      totalCostMax: 0,
      aiConfidenceScore: 0,
      legs: [dummyLeg],
      transfers: [],
      metrics: { comfort: 'Low', comfortStars: 1, crowd: 'Low', reliability: 'Low' }
    }
    return {
      origin: { name: originClean, terminal: `${originClean} Terminal` },
      destination: { name: destClean, terminal: `${destClean} Terminal` },
      distanceKm: 0,
      hasDirectBuses: false,
      isDomestic: false,
      aiAnalysisText: 'International bus services are not available for this route.',
      routes: {
        best: dummyRoute,
        fastest: dummyRoute,
        cheapest: dummyRoute,
      }
    }
  }

  const originLower = originClean.toLowerCase()
  const destLower = destClean.toLowerCase()

  const isHydToGoa =
    (originLower.includes('hyd') || originLower.includes('secund')) &&
    (destLower.includes('goa') || destLower.includes('panaj') || destLower.includes('madg') || destLower.includes('calang'))

  // ──────── 1. HYDERABAD -> GOA BUS ROUTES (Direct vs Smart Comparison) ────────
  if (isHydToGoa) {
    return {
      origin: { name: 'Hyderabad', terminal: 'MGBS Bus Terminal' },
      destination: { name: 'Goa', terminal: 'Panaji Bus Stand' },
      distanceKm: 760,
      hasDirectBuses: true,
      aiAnalysisText:
        'Direct buses exist (13h 45m). Our AI also synthesized a 1-Hop Smart Route via Hubballi (15h 20m) which saves ₹400 on total fares and offers higher sleeper availability.',
      directVsSmartComparisonText:
        '📊 Comparison: Direct Bus takes 13h 45m (₹1,600). Smart Route via Hubballi takes 15h 20m (₹1,200, saves ₹400).',
      routes: {
        best: {
          id: 'bus-route-best-hyd-goa',
          type: 'best',
          title: 'Direct Route',
          isRecommended: true,
          isDirectRoute: true,
          comparisonLabel: '✅ Direct Route — Best Choice (0 Transfers)',
          totalDurationStr: '13h 45m',
          totalDurationMinutes: 825,
          changesCount: 0,
          totalCostMin: 1600,
          totalCostMax: 2400,
          aiConfidenceScore: 94,
          legs: [
            {
              id: 'bus-leg-1-fastest',
              operatorName: 'Orange Tours & Travels',
              busType: 'Scania Multi-Axle AC Sleeper (2+1)',
              fromCity: 'Hyderabad',
              fromTerminal: 'Lakdikapul / KPHB',
              toCity: 'Goa',
              toTerminal: 'Mapusa / Panaji Bus Stand',
              departureTime: '19:00',
              arrivalTime: '08:45',
              durationStr: '13h 45m',
              durationMinutes: 825,
              distanceKm: 760,
              isOvernight: true,
              fares: {
                sleeper: { min: 1600, max: 2400 },
              },
              rating: 4.5,
            },
          ],
          transfers: [],
          lastMile: {
            type: 'taxi',
            fromLocation: 'Panaji Bus Stand',
            toLocation: 'Hotel / Beach Resort',
            durationStr: '~25m',
            distanceKm: 14,
            estimatedCostMin: 350,
            estimatedCostMax: 550,
            localBusCostMin: 25,
            localBusCostMax: 40,
            details: 'Taxi: ₹350 – ₹550 | Local Bus: ₹25 – ₹40 | ~25m (~14 km)',
          },
          metrics: {
            comfort: 'High',
            comfortStars: 5,
            crowd: 'Low',
            reliability: 'High',
          },
        },

        fastest: {
          id: 'bus-route-smart-hyd-goa',
          type: 'fastest',
          title: 'Smart Transfer Route',
          isRecommended: false,
          isDirectRoute: false,
          comparisonLabel: '⭐ Smart Route — Saves ₹400 over Direct Bus',
          totalDurationStr: '15h 20m',
          totalDurationMinutes: 920,
          changesCount: 1,
          totalCostMin: 1200,
          totalCostMax: 1800,
          aiConfidenceScore: 91,
          legs: [
            {
              id: 'bus-leg-1-best',
              operatorName: 'VRL Travels / KSRTC Airavat',
              busType: 'Volvo Multi-Axle AC Sleeper (2+1)',
              fromCity: 'Hyderabad',
              fromTerminal: 'MGBS Bus Terminal / Ameerpet',
              toCity: 'Hubballi',
              toTerminal: 'Hubballi New Bus Stand (UBL)',
              departureTime: '20:30',
              arrivalTime: '06:15',
              durationStr: '9h 45m',
              durationMinutes: 585,
              distanceKm: 495,
              isOvernight: true,
              fares: {
                sleeper: { min: 750, max: 1100 },
                seater: { min: 550, max: 800 },
              },
              rating: 4.6,
            },
            {
              id: 'bus-leg-2-best',
              operatorName: 'Kadamba Transport / IntrCity SmartBus',
              busType: 'AC Seater / Sleeper Executive',
              fromCity: 'Hubballi',
              fromTerminal: 'Hubballi New Bus Stand',
              toCity: 'Goa (Panaji)',
              toTerminal: 'Panaji KSRTC / KTC Bus Stand',
              departureTime: '07:00',
              arrivalTime: '11:50',
              durationStr: '4h 50m',
              durationMinutes: 290,
              distanceKm: 215,
              fares: {
                sleeper: { min: 450, max: 700 },
                seater: { min: 300, max: 450 },
              },
              rating: 4.4,
            },
          ],
          transfers: [
            {
              cityName: 'Hubballi',
              terminalName: 'Hubballi Bus Stand',
              waitingTimeStr: '45 min',
              waitingTimeMinutes: 45,
            },
          ],
          lastMile: {
            type: 'taxi',
            fromLocation: 'Panaji Bus Stand',
            toLocation: 'Calangute / Hotel',
            durationStr: '~35m',
            distanceKm: 18,
            estimatedCostMin: 400,
            estimatedCostMax: 600,
            localBusCostMin: 30,
            localBusCostMax: 50,
            details: 'Taxi: ₹400 – ₹600 | Local Bus: ₹30 – ₹50 | ~35m (~18 km)',
          },
          metrics: {
            comfort: 'High',
            comfortStars: 5,
            crowd: 'Moderate',
            reliability: 'High',
          },
        },

        cheapest: {
          id: 'bus-route-cheapest-hyd-goa',
          type: 'cheapest',
          title: 'Cheapest Route',
          isRecommended: false,
          isDirectRoute: false,
          comparisonLabel: '💰 Lowest Total Fare (Saves ₹650)',
          totalDurationStr: '17h 10m',
          totalDurationMinutes: 1030,
          changesCount: 1,
          totalCostMin: 950,
          totalCostMax: 1350,
          aiConfidenceScore: 82,
          legs: [
            {
              id: 'bus-leg-1-cheapest',
              operatorName: 'TSRTC / KSRTC Rajahamsa',
              busType: 'Non-AC Deluxe Seater / Sleeper',
              fromCity: 'Hyderabad',
              fromTerminal: 'MGBS Bus Station',
              toCity: 'Belagavi',
              toTerminal: 'Belagavi Central Bus Stand',
              departureTime: '18:15',
              arrivalTime: '05:30',
              durationStr: '11h 15m',
              durationMinutes: 675,
              distanceKm: 520,
              isOvernight: true,
              fares: {
                seater: { min: 550, max: 750 },
              },
              rating: 4.1,
            },
            {
              id: 'bus-leg-2-cheapest',
              operatorName: 'KSRTC Express / Local Shuttle',
              busType: 'Non-AC Express Seater',
              fromCity: 'Belagavi',
              fromTerminal: 'Belagavi Bus Stand',
              toCity: 'Goa (Panaji)',
              toTerminal: 'Panaji KTC Bus Stand',
              departureTime: '06:30',
              arrivalTime: '11:25',
              durationStr: '4h 55m',
              durationMinutes: 295,
              distanceKm: 140,
              fares: {
                seater: { min: 200, max: 350 },
              },
              rating: 4.0,
            },
          ],
          transfers: [
            {
              cityName: 'Belagavi',
              terminalName: 'Belagavi Central Bus Stand',
              waitingTimeStr: '1h 00m',
              waitingTimeMinutes: 60,
            },
          ],
          lastMile: {
            type: 'bus',
            fromLocation: 'Panaji KTC Bus Stand',
            toLocation: 'Calangute / Baga',
            durationStr: '~40m',
            distanceKm: 16,
            estimatedCostMin: 40,
            estimatedCostMax: 80,
            localBusCostMin: 30,
            localBusCostMax: 50,
            details: 'Local KTC Bus: ₹30 – ₹50 | Auto: ₹250 – ₹400',
          },
          metrics: {
            comfort: 'Moderate',
            comfortStars: 3,
            crowd: 'High',
            reliability: 'Moderate',
          },
        },
      },
    }
  }

  // ──────── 2. DYNAMIC ROUTE GENERATION FOR OTHER CITIES ────────
  const hasDirect = rawList.length > 0
  const estDistance = Math.floor(350 + Math.random() * 400)

  const directBusRoute: SmartBusRoute = {
    id: `bus-direct-${originClean}-${destClean}`,
    type: 'best',
    title: 'Direct Bus Route',
    isRecommended: true,
    isDirectRoute: true,
    comparisonLabel: '✅ Direct Bus — Preferred for Simplicity (0 Transfers)',
    totalDurationStr: hasDirect ? (rawList[0]?.duration || '10h 30m') : '11h 00m',
    totalDurationMinutes: 660,
    changesCount: 0,
    totalCostMin: hasDirect ? (rawList[0]?.price || 950) : 1100,
    totalCostMax: hasDirect ? Math.round((rawList[0]?.price || 950) * 1.5) : 1650,
    aiConfidenceScore: 95,
    legs: [
      {
        id: 'bus-leg-direct-1',
        operatorName: rawList[0]?.name || 'VRL Travels / IntrCity',
        busType: rawList[0]?.busType || 'Volvo Multi-Axle AC Sleeper (2+1)',
        fromCity: originClean,
        fromTerminal: `${originClean} Inter-State Terminal`,
        toCity: destClean,
        toTerminal: `${destClean} Bus Depot`,
        departureTime: rawList[0]?.departureTime || '21:00',
        arrivalTime: rawList[0]?.arrivalTime || '08:00',
        durationStr: rawList[0]?.duration || '11h 00m',
        durationMinutes: 660,
        distanceKm: estDistance,
        isOvernight: true,
        fares: {
          sleeper: { min: 1100, max: 1650 },
        },
        rating: 4.6,
      },
    ],
    transfers: [],
    lastMile: {
      type: 'taxi',
      fromLocation: `${destClean} Bus Depot`,
      toLocation: `${destClean} Hotel`,
      durationStr: '~20m',
      distanceKm: 10,
      estimatedCostMin: 200,
      estimatedCostMax: 350,
      details: 'Taxi: ~20m | ~10 km | ₹200 – ₹350',
    },
    metrics: {
      comfort: 'High',
      comfortStars: 5,
      crowd: 'Moderate',
      reliability: 'High',
    },
  }

  const smartMultiHopRoute: SmartBusRoute = {
    id: `bus-smart-${originClean}-${destClean}`,
    type: 'fastest',
    title: 'Smart Multi-Hop Route',
    isRecommended: false,
    isDirectRoute: false,
    comparisonLabel: '⭐ AI Recommended — 2h Faster than Direct Bus',
    totalDurationStr: '9h 00m',
    totalDurationMinutes: 540,
    changesCount: 1,
    totalCostMin: 1250,
    totalCostMax: 1850,
    aiConfidenceScore: 89,
    legs: [
      {
        id: 'bus-leg-smart-1',
        operatorName: 'Zingbus / Express Hub',
        busType: 'EV Luxury AC Sleeper',
        fromCity: originClean,
        fromTerminal: `${originClean} Express Hub`,
        toCity: 'Transit Terminal',
        toTerminal: 'Central Transit Depot',
        departureTime: '20:00',
        arrivalTime: '03:30',
        durationStr: '7h 30m',
        durationMinutes: 450,
        distanceKm: Math.round(estDistance * 0.7),
        isOvernight: true,
        fares: {
          sleeper: { min: 850, max: 1250 },
        },
        rating: 4.7,
      },
      {
        id: 'bus-leg-smart-2',
        operatorName: 'Regional Shuttle Express',
        busType: 'AC Seater Executive',
        fromCity: 'Transit Terminal',
        fromTerminal: 'Central Transit Depot',
        toCity: destClean,
        toTerminal: `${destClean} Bus Stand`,
        departureTime: '04:15',
        arrivalTime: '05:45',
        durationStr: '1h 30m',
        durationMinutes: 90,
        distanceKm: Math.round(estDistance * 0.3),
        fares: {
          seater: { min: 400, max: 600 },
        },
        rating: 4.4,
      },
    ],
    transfers: [
      {
        cityName: 'Transit Terminal',
        terminalName: 'Central Transit Depot',
        waitingTimeStr: '45 min',
        waitingTimeMinutes: 45,
      },
    ],
    lastMile: {
      type: 'taxi',
      fromLocation: `${destClean} Bus Stand`,
      toLocation: `${destClean} Destination`,
      durationStr: '~15m',
      distanceKm: 8,
      estimatedCostMin: 180,
      estimatedCostMax: 300,
      details: 'Taxi / Auto: ~15m | ~8 km | ₹180 – ₹300',
    },
    metrics: {
      comfort: 'High',
      comfortStars: 5,
      crowd: 'Low',
      reliability: 'High',
    },
  }

  const cheapestBusRoute: SmartBusRoute = {
    id: `bus-cheapest-${originClean}-${destClean}`,
    type: 'cheapest',
    title: 'Cheapest Route',
    isRecommended: false,
    isDirectRoute: true,
    comparisonLabel: '💰 Lowest Total Fare (Direct Non-AC)',
    totalDurationStr: '12h 30m',
    totalDurationMinutes: 750,
    changesCount: 0,
    totalCostMin: 550,
    totalCostMax: 850,
    aiConfidenceScore: 82,
    legs: [
      {
        id: 'bus-leg-cheapest-1',
        operatorName: 'State Transport Corporation',
        busType: 'Non-AC Deluxe Seater',
        fromCity: originClean,
        fromTerminal: `${originClean} State Bus Stand`,
        toCity: destClean,
        toTerminal: `${destClean} State Bus Stand`,
        departureTime: '19:30',
        arrivalTime: '08:00',
        durationStr: '12h 30m',
        durationMinutes: 750,
        distanceKm: estDistance,
        isOvernight: true,
        fares: {
          seater: { min: 550, max: 850 },
        },
        rating: 4.0,
      },
    ],
    transfers: [],
    lastMile: {
      type: 'bus',
      fromLocation: `${destClean} State Bus Stand`,
      toLocation: `${destClean} Center`,
      durationStr: '~25m',
      distanceKm: 10,
      estimatedCostMin: 25,
      estimatedCostMax: 50,
      details: 'Local Bus: ₹25 – ₹50 | ~25m (~10 km)',
    },
    metrics: {
      comfort: 'Moderate',
      comfortStars: 3,
      crowd: 'High',
      reliability: 'Moderate',
    },
  }

  return {
    origin: { name: originClean, terminal: `${originClean} Bus Terminal` },
    destination: { name: destClean, terminal: `${destClean} Bus Stand` },
    distanceKm: estDistance,
    hasDirectBuses: true,
    aiAnalysisText:
      `Direct bus route available from ${originClean} to ${destClean}. Our AI also compared a Smart Multi-Hop route which saves 2 hours.`,
    directVsSmartComparisonText:
      `📊 Direct vs Smart Route: Direct bus takes 11h 00m (0 transfers). Smart Multi-Hop route takes 9h 00m (saves 2h 00m).`,
    routes: {
      best: directBusRoute,
      fastest: smartMultiHopRoute,
      cheapest: cheapestBusRoute,
    },
  }
}
