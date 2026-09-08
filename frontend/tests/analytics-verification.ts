/**
 * Verification test for TripSage SEO Phase 5 Analytics
 * Tests event firing, parameter shapes, PII scrubbing, and metadata enrichment.
 */

import { analytics, GA_MEASUREMENT_ID } from '../lib/analytics/service';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failed++;
  }
}

// Mock window and gtag
const sentEvents: Array<{ command: string; eventName: string; params: any }> = [];

(globalThis as any).window = {
  innerWidth: 1024,
  location: {
    pathname: '/destinations/tokyo',
    search: '?utm_source=google&utm_medium=cpc&utm_campaign=spring_deals',
    href: 'https://tripsage.ai/destinations/tokyo?utm_source=google&utm_medium=cpc&utm_campaign=spring_deals',
  },
  document: {
    title: 'Tokyo Travel Guide - TripSage',
    referrer: 'https://google.com',
  },
  gtag: (command: string, eventName: string, params: any) => {
    sentEvents.push({ command, eventName, params });
  },
};
(globalThis as any).document = (globalThis as any).window.document;

console.log('--- TripSage SEO Phase 5 Analytics Verification ---\n');

// 1. Verify GA_MEASUREMENT_ID
assert(GA_MEASUREMENT_ID === 'G-P4KSB6TZVG' || GA_MEASUREMENT_ID.startsWith('G-'), `GA4 Measurement ID is valid: ${GA_MEASUREMENT_ID}`);

// 2. Test destination_viewed event
analytics.destinationViewed({
  destinationName: 'Tokyo, Japan',
  destinationCategory: 'city_guide',
  source: 'seo_content',
});

const destEvent = sentEvents.find((e) => e.eventName === 'destination_viewed');
assert(!!destEvent, 'destination_viewed event fired');
assert(destEvent?.params?.destinationName === 'Tokyo, Japan', 'destinationName param is correct');
assert(destEvent?.params?.page === '/destinations/tokyo', 'Page path automatically enriched');
assert(destEvent?.params?.utm_source === 'google', 'UTM source enriched from query');
assert(destEvent?.params?.utm_campaign === 'spring_deals', 'UTM campaign enriched from query');

// 3. Test guide_cta_clicked
analytics.guideCtaClicked({
  guideSlug: 'tokyo-3-day-itinerary',
  guideTitle: 'Ultimate Tokyo 3-Day Guide',
  ctaText: 'Plan with TripSage',
  targetDestination: 'Tokyo',
});

const ctaEvent = sentEvents.find((e) => e.eventName === 'guide_cta_clicked');
assert(!!ctaEvent, 'guide_cta_clicked event fired');
assert(ctaEvent?.params?.guideSlug === 'tokyo-3-day-itinerary', 'guideSlug param is correct');
assert(ctaEvent?.params?.ctaText === 'Plan with TripSage', 'ctaText param is correct');

// 4. Test visa_guide_viewed
analytics.visaGuideViewed({
  destinationCountry: 'Japan',
  source: 'visa_hub',
});

const visaEvent = sentEvents.find((e) => e.eventName === 'visa_guide_viewed');
assert(!!visaEvent, 'visa_guide_viewed event fired');
assert(visaEvent?.params?.destinationCountry === 'Japan', 'destinationCountry param is correct');

// 5. Test planner_started
analytics.plannerStarted({
  origin: 'New York',
  destination: 'Tokyo',
  source: 'hero_search',
  hasDates: true,
});

const startEvent = sentEvents.find((e) => e.eventName === 'planner_started');
assert(!!startEvent, 'planner_started event fired');
assert(startEvent?.params?.origin === 'New York', 'planner_started origin recorded');
assert(startEvent?.params?.destination === 'Tokyo', 'planner_started destination recorded');

// 6. Test planner_completed
analytics.plannerCompleted({
  destination: 'Tokyo',
  durationDays: 5,
  travelers: 2,
  hasTransport: true,
  hasHotels: true,
  hasItinerary: true,
});

const compEvent = sentEvents.find((e) => e.eventName === 'planner_completed');
assert(!!compEvent, 'planner_completed event fired');
assert(compEvent?.params?.durationDays === 5, 'durationDays param is correct');
assert(compEvent?.params?.travelers === 2, 'travelers count is correct');

// 7. Test planner_error with safe category
analytics.plannerError({
  errorCategory: 'budget_too_low',
  destination: 'Tokyo',
});

const errEvent = sentEvents.find((e) => e.eventName === 'planner_error');
assert(!!errEvent, 'planner_error event fired');
assert(errEvent?.params?.errorCategory === 'budget_too_low', 'Safe error category preserved');

// 8. Test outbound_booking_clicked
analytics.outboundBookingClicked({
  provider: 'Kiwi.com',
  category: 'flight',
  destination: 'Tokyo',
});

const bookEvent = sentEvents.find((e) => e.eventName === 'outbound_booking_clicked');
assert(!!bookEvent, 'outbound_booking_clicked event fired');
assert(bookEvent?.params?.provider === 'Kiwi.com', 'provider param is correct');
assert(bookEvent?.params?.category === 'flight', 'category param is correct');

// 9. Test Privacy / PII scrubbing protection
analytics.trackCustomEvent('pii_safety_test', {
  user_email: 'john.doe@example.com', // banned key
  contact: 'Call me at +1 555-123-4567 or email jane@test.com', // string with PII
  safe_field: 'Tokyo vacation',
});

const piiEvent = sentEvents.find((e) => e.eventName === 'pii_safety_test');
assert(!!piiEvent, 'Custom test event tracked');
assert(!piiEvent?.params?.user_email, 'Banned key user_email was stripped');
assert(
  piiEvent?.params?.contact === 'Call me at [REDACTED_PHONE] or email [REDACTED_EMAIL]',
  'Embedded PII (phone & email) was scrubbed from string values'
);
assert(piiEvent?.params?.safe_field === 'Tokyo vacation', 'Safe field preserved unchanged');

console.log(`\nResults: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  throw new Error(`${failed} test(s) failed — see output above.`);
} else {
  console.log('🎉 All 7 SEO Phase 5 Analytics events and privacy controls verified successfully!');
}
