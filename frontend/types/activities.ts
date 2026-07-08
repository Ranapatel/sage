/**
 * TypeScript interfaces for Hotelbeds Activities API responses.
 * Matches the normalized DTOs returned by activitiesService.js.
 */

// ── Core activity types ───────────────────────────────────────────────────────

export interface ActivityCoordinates {
  latitude:  number | null
  longitude: number | null
}

export interface ActivityDestination {
  code:        string | null
  name:        string | null
  country:     string | null
  coordinates: ActivityCoordinates
}

export interface ActivityAmountsFrom {
  amount:    number | null
  currency:  string
  amountINR: number | null
}

export interface ActivitySession {
  code:      string | null
  name:      string | null
  startTime: string | null
  endTime:   string | null
}

export interface CancellationPolicy {
  amount:   number
  currency: string
  from:     string | null
}

export interface ActivityModality {
  code:                 string | null
  name:                 string | null
  duration:             string | null
  languages:            { code: string; name: string }[]
  sessions:             ActivitySession[]
  amountsFrom:          ActivityAmountsFrom | null
  cancellationPolicies: CancellationPolicy[]
  rateKey:              string | null
}

export interface Activity {
  activityCode:  string
  activityName:  string
  description:   string
  image:         string | null
  images:        string[]
  destination:   ActivityDestination
  type:          string | null
  currency:      string
  amountsFrom:   ActivityAmountsFrom
  modality: {
    code:      string | null
    name:      string | null
    duration:  string | null
    languages: string[]
  }
  modalities:    ActivityModality[]
  averageRating: number | null
  reviewCount:   number
}

// ── Search ────────────────────────────────────────────────────────────────────

export interface ActivitySearchParams {
  destinationCode?: string
  hotelCode?:       string
  coordinates?: {
    latitude:  number
    longitude: number
    radius?:   number
    unit?:     'km' | 'mi'
  }
  fromDate:     string   // YYYY-MM-DD
  toDate:       string
  paxes:        { age: number; type?: 'ADULT' | 'CHILD' | 'INFANT' }[]
  keyword?:     string
  language?:    string
  minPrice?:    number
  maxPrice?:    number
  activityType?: string
  from?:        number
  to?:          number
}

export interface ActivitySearchResult {
  activities: Activity[]
  total:      number
  from:       number
  to:         number
  language:   string
}

// ── Details ───────────────────────────────────────────────────────────────────

export interface ActivityDetailsResult {
  activity:             Activity
  modalities:           ActivityModality[]
  cancellationPolicies: CancellationPolicy[]
  sessions:             ActivitySession[]
  amount:               number | null
  amountINR:            number | null
  currency:             string
  rateKeyStored:        boolean
  bookingId:            string
}

// ── Passengers & Holder ───────────────────────────────────────────────────────

export interface Passenger {
  firstName: string
  lastName:  string
  age:       number
  type:      'ADULT' | 'CHILD' | 'INFANT'
}

export interface BookingHolder {
  firstName: string
  lastName:  string
  email:     string
  phone:     string
}

// ── Preconfirm ────────────────────────────────────────────────────────────────

export interface PreconfirmPayload {
  bookingId:    string   // UUID
  activityCode: string
  activityName: string
  rateKey:      string
  modalityCode?: string
  modalityName?: string
  language?:    string
  fromDate:     string
  toDate:       string
  passengers:   Passenger[]
  holder:       BookingHolder
  amount:       number
  currency:     string
}

export interface PreconfirmResult {
  bookingId:            string
  hotelbedsReference:   string | null
  status:               'PRECONFIRMED'
  amount:               number
  amountINR:            number | null
  currency:             string
  expiresAt:            string    // ISO timestamp
  cancellationPolicies: CancellationPolicy[]
}

// ── Payment ───────────────────────────────────────────────────────────────────

export interface CreatePaymentOrderPayload {
  bookingId:      string
  idempotencyKey: string
  amountINR:      number
  currency:       'INR'
}

export interface RazorpayOrderResult {
  razorpayOrderId: string
  amount:          number    // paise
  currency:        string
  keyId:           string    // RAZORPAY_KEY_ID (public key)
}

export interface VerifyPaymentPayload {
  razorpayOrderId:   string
  razorpayPaymentId: string
  razorpaySignature: string
}

// ── Reconfirm ────────────────────────────────────────────────────────────────

export interface ReconfirmPayload {
  bookingId:         string
  razorpayOrderId:   string
  razorpayPaymentId: string
  razorpaySignature: string
}

export interface ReconfirmResult {
  bookingId:            string
  hotelbedsReference:   string | null
  status:               'CONFIRMED'
  voucherUrl:           string | null
  activityName:         string
  fromDate:             string
  toDate:               string
  amount:               number
  amountINR:            number | null
  currency:             string
  cancellationPolicies: CancellationPolicy[]
}

// ── Booking record ────────────────────────────────────────────────────────────

export type BookingStatus = 'PRECONFIRMED' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED' | 'FAILED'

export interface ActivityBookingRecord {
  bookingId:            string
  hotelbedsReference:   string | null
  status:               BookingStatus
  activityCode:         string
  activityName:         string
  fromDate:             string
  toDate:               string
  holder:               BookingHolder
  passengers:           Passenger[]
  amount:               number
  amountINR:            number | null
  currency:             string
  voucherUrl:           string | null
  cancellationPolicies: CancellationPolicy[]
  createdAt:            string
  cancelledAt:          string | null
  cancellationFee:      number | null
  refundAmount:         number | null
}

// ── Cancellation ─────────────────────────────────────────────────────────────

export interface CancelSimulationResult {
  bookingId:            string
  hotelbedsReference:   string | null
  activityName:         string
  cancellationFee:      number
  refundAmount:         number
  currency:             string
  cancellationPolicies: CancellationPolicy[]
  simulation:           true
}

export interface CancelResult {
  bookingId:          string
  hotelbedsReference: string | null
  status:             'CANCELLED'
  cancellationFee:    number
  refundAmount:       number
  currency:           string
  cancelledAt:        string
}

// ── Booking flow state ─────────────────────────────────────────────────────────

export type BookingStep =
  | 'search'
  | 'details'
  | 'passengers'
  | 'payment'
  | 'confirmed'

export interface BookingFlowState {
  step:               BookingStep
  searchParams:       Partial<ActivitySearchParams>
  selectedActivity:   Activity | null
  detailsResult:      ActivityDetailsResult | null
  preconfirmResult:   PreconfirmResult | null
  razorpayOrder:      RazorpayOrderResult | null
  razorpayPaymentId:  string | null
  razorpaySignature:  string | null
  confirmedBooking:   ReconfirmResult | null
  error:              string | null
}
