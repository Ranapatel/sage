# TripSage SEO Phase 5: Analytics & Conversion Tracking Documentation

## Overview
TripSage implements Google Analytics 4 (GA4) with a zero-duplication architecture, centralized event dispatching, automated PII (Personally Identifiable Information) scrubbing, and automated metadata enrichment (route type, device category, page context, and UTM campaign tracking).

---

## 1. GA4 Configuration & Setup Audit

- **Audit Findings:**
  - GA4 measurement tag injection is centralized in `frontend/app/layout.tsx` (lines 170-182) using `next/script` loading `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}` with `strategy="afterInteractive"`.
  - Default automatic page views are disabled (`send_page_view: false`) to prevent synthetic or double hits in Next.js App Router client transitions.
  - Page tracking is handled by `frontend/components/analytics/PageViewTracker.tsx` which tracks pathname and search parameter changes.
  - **Single Tag Rule Enforced:** No duplicate GA4 script tags were added.
- **GA4 Measurement ID:**
  - Primary default ID: `G-P4KSB6TZVG` (production)
  - Environment variable override: `process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID`

---

## 2. Privacy & Data Protection Safeguards

To comply with global privacy standards (GDPR, CCPA) and prevent PII leakage:
1. **Never Transmitted:**
   - User names, full names, or traveler lists
   - Email addresses
   - Phone or mobile numbers
   - Passport numbers, visa document numbers, or application IDs
   - Free-form user inputs, custom prompt strings, or private notes
2. **Automated Sanitization in `AnalyticsService`:**
   - **Banned Keys Filter:** Keys matching `/email|name|phone|mobile|passport|address|ssn|first_name|last_name|guest|passenger/i` are automatically deleted before dispatch.
   - **Regex Sanitizer:** Any string value containing email patterns (`[a-zA-Z0-9_.+-]+@[...]`), phone formats, or passport-like strings is automatically redacted (`[REDACTED_EMAIL]`, `[REDACTED_PHONE]`, `[REDACTED_PASSPORT]`).
   - **Safe Error Categories:** Error messages are mapped strictly to standardized categories (`validation_error`, `budget_too_low`, `network_error`, `timeout_error`, `rate_limit`, `server_error`, `unknown_error`) rather than emitting raw server stack traces or user input errors.

---

## 3. Metadata & Context Enrichment

Every event tracked through `analytics` (`frontend/lib/analytics/service.ts`) is automatically enriched with:
- `page`: Cleaned window pathname (e.g., `/destinations/japan`, `/plan`)
- `page_title`: Current `document.title`
- `route_type`: Standardized route taxonomy:
  - `home`: `/`
  - `seo_guide`: `/destinations/*` or `/visa-guide/*`
  - `destination_hub`: `/destinations`
  - `visa_guide`: `/visa-guide`
  - `trip_planner`: `/plan`
  - `budget_planner`: `/budget`
  - `auth`: `/sign-in` or `/sign-up`
  - `general`: other routes
- `device_category`: `mobile` (< 768px), `tablet` (768px–1024px), or `desktop` (> 1024px)
- `referrer`: Sanitized document referrer
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`: Inferred from URL query params.

---

## 4. Tracked Events Specification

| Event Name | Trigger Location | Primary Parameters | Description |
| :--- | :--- | :--- | :--- |
| `planner_started` | • `HomeClient.tsx` (hero form submission)<br>• `PlanClient.tsx` (planner wizard execution) | `origin`, `destination`, `source`, `has_dates` | User begins planning a trip. Origin and destination are sanitized high-level location names. |
| `planner_completed` | • `PlanClient.tsx` (itinerary generated successfully) | `destination`, `duration_days`, `travelers`, `has_flights`, `has_hotels`, `has_activities` | A trip plan is successfully assembled and displayed to the user. |
| `planner_error` | • `PlanClient.tsx` (validation failure or API catch) | `error_category` (`budget_too_low`, `validation_error`, `network_error`, `timeout_error`, `rate_limit`, `server_error`, `unknown_error`), `step` | Trip planning fails. Raw stack traces and inputs are omitted; only the safe category is logged. |
| `guide_cta_clicked` | • `SEOContent.tsx` (Hero & Bottom "Plan with TripSage" buttons) | `guide_slug`, `guide_title`, `cta_text`, `target_destination` | User clicks an activation CTA from an SEO guide to start planning. |
| `destination_viewed` | • `PageViewTracker.tsx` (route transitions)<br>• `SEOContent.tsx` (guide component mount) | `destination_name`, `destination_category`, `source` | User views the destinations hub or a dedicated SEO destination guide. |
| `visa_guide_viewed` | • `PageViewTracker.tsx` (route transitions)<br>• `VisaGuideClient.tsx` (portal mount) | `destination_country`, `source` | User views visa requirements, hub, or destination visa guide. |
| `outbound_booking_clicked` | • `TransportCard.tsx` (flight booking)<br>• `AiFlightCard.tsx` (Kiwi)<br>• `TrainCard.tsx` (IRCTC)<br>• `BusCard.tsx` & `RedBusBookingModal.tsx` (redBus)<br>• `AiDiscoverCarsPlanner.tsx` (car rental)<br>• `RideButton.tsx` (Uber)<br>• `VisaGuideClient.tsx` (Official Visa Portal)<br>• `HotelBookingFlow.tsx` (Hotelbeds) | `provider`, `category`, `destination`, `price` | User clicks to navigate to a verified 3rd-party provider or booking partner. |

---

## 5. Reusable Analytics Helper Architecture

All tracking calls route through the singleton instance:
```typescript
import { analytics } from '@/lib/analytics';

// Examples:
analytics.plannerStarted({ origin: 'SFO', destination: 'Tokyo', source: 'home_hero', hasDates: true });
analytics.plannerCompleted({ destination: 'Tokyo', durationDays: 5, travelers: 2, hasFlights: true, hasHotels: true, hasActivities: true });
analytics.plannerError({ category: 'budget_too_low', step: 'form_validation' });
analytics.guideCtaClicked({ guideSlug: 'tokyo-guide', guideTitle: 'Tokyo 5-Day', ctaText: 'Plan with TripSage', targetDestination: 'Tokyo' });
analytics.destinationViewed({ destinationName: 'Kyoto', destinationCategory: 'city_guide', source: 'seo_content' });
analytics.visaGuideViewed({ destinationCountry: 'Japan', source: 'visa_hub' });
analytics.outboundBookingClicked({ provider: 'Kiwi.com', category: 'flight', destination: 'Tokyo', price: 540 });
```

---

## 6. Production Verification Steps

### Step 1: Google Tag Assistant
1. Open [Google Tag Assistant](https://tagassistant.google.com/).
2. Enter the domain URL (e.g., `https://tripsage.ai`).
3. Verify that only **one** Google Tag (`G-P4KSB6TZVG`) is detected and connected.

### Step 2: GA4 DebugView
1. In Google Analytics, navigate to **Admin > Data display > DebugView**.
2. Run TripSage in debug mode (or install the [Google Analytics Debugger Chrome Extension](https://chromewebstore.google.com/detail/google-analytics-debugger/jnkmfdileelsofflhijedlhjhgapmgbh)).
3. Trigger actions and confirm the timeline:
   - Navigate to `/destinations/tokyo` → Confirm `destination_viewed` fires with `destination_name` and `route_type: "seo_guide"`.
   - Click "Plan with TripSage" → Confirm `guide_cta_clicked` fires with `cta_text: "Plan with TripSage"`.
   - On `/visa-guide` → Confirm `visa_guide_viewed` fires with `destination_country`.
   - Trigger a search on `/plan` → Confirm `planner_started` fires.
   - Wait for plan generation → Confirm `planner_completed` fires.
   - Enter an invalid budget (e.g. $5) → Confirm `planner_error` fires with `error_category: "budget_too_low"`.
   - Click booking/affiliate links (Kiwi, redBus, DiscoverCars, Uber, IRCTC) → Confirm `outbound_booking_clicked` fires with `provider` and `category`.

### Step 3: Browser Network Console Inspection
1. Open Chrome DevTools (`F12`) → **Network** tab.
2. Filter by `collect?v=2`.
3. Verify the payload parameters (e.g. `en=planner_started`, `en=guide_cta_clicked`).
4. Ensure no query strings or payload bodies contain `@`, passport numbers, or user email keys.
