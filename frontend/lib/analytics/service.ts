/**
 * Centralized Google Analytics 4 (GA4) Analytics Service for TripSage
 * Supports deduplication, dev safeguards, error isolation, and strongly typed events.
 */

import {
  AnalyticsEventName,
  CommonMetadata,
  SignupParams,
  LoginParams,
  LogoutParams,
  CreateTripParams,
  ItineraryGenStartedParams,
  ItineraryGenSuccessParams,
  ItineraryGenFailedParams,
  ItinerarySavedParams,
  ItinerarySharedParams,
  ItineraryDeletedParams,
  SearchEventParams,
  RecommendationViewParams,
  RecommendationClickParams,
  RecommendationSaveParams,
  AffiliateClickParams,
  BookingClickParams,
  PremiumUpgradeClickParams,
  PhotoUploadParams,
  MemoryViewParams,
  AiResponseGeneratedParams,
  AiGenerationFailedParams,
  AiFeedbackParams,
  ErrorParams,
  PerformanceParams,
  PlannerStartedParams,
  PlannerCompletedParams,
  PlannerErrorParams,
  GuideCtaClickedParams,
  DestinationViewedParams,
  VisaGuideViewedParams,
  OutboundBookingClickedParams,
} from './types';

export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-P4KSB6TZVG';

// PII detection patterns for privacy protection
const EMAIL_REGEX = /[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/gi;
const PHONE_REGEX = /(\+?\d{1,4}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g;
const PASSPORT_REGEX = /\b[A-PR-WYa-pr-wy][1-9]\d\s?\d{4}[1-9]\b/g;

/**
 * Strips potential PII (emails, phone numbers, passport patterns, sensitive fields)
 * Never send names, emails, passport data, or personal form input to analytics.
 */
function sanitizeValue(value: any, keyName?: string): any {
  if (value === null || value === undefined) return value;
  
  // Explicitly drop banned PII fields
  if (keyName) {
    const lowerKey = keyName.toLowerCase();
    if (
      lowerKey.includes('email') ||
      (lowerKey.includes('name') &&
        lowerKey !== 'destinationname' &&
        lowerKey !== 'itemname' &&
        lowerKey !== 'partnername' &&
        lowerKey !== 'guidetitle' &&
        lowerKey !== 'metricname') ||
      lowerKey.includes('phone') ||
      lowerKey.includes('mobile') ||
      lowerKey.includes('passport') ||
      lowerKey.includes('aadhaar') ||
      lowerKey.includes('ssn') ||
      lowerKey.includes('holder') ||
      lowerKey.includes('guest') ||
      lowerKey.includes('passenger') ||
      lowerKey.includes('address') ||
      lowerKey.includes('password')
    ) {
      return undefined;
    }
  }

  if (typeof value === 'string') {
    const emailRegex = /[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/gi;
    const phoneRegex = /(\+?\d{1,4}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g;
    const passportRegex = /\b[A-PR-WYa-pr-wy][1-9]\d\s?\d{4}[1-9]\b/g;

    let sanitized = value
      .replace(emailRegex, '[REDACTED_EMAIL]')
      .replace(phoneRegex, '[REDACTED_PHONE]')
      .replace(passportRegex, '[REDACTED_DOC]');
    return sanitized;
  }

  if (Array.isArray(value)) {
    return value.map(item => sanitizeValue(item)).filter(v => v !== undefined);
  }

  if (typeof value === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) {
      const sanitizedChild = sanitizeValue(v, k);
      if (sanitizedChild !== undefined) {
        cleaned[k] = sanitizedChild;
      }
    }
    return cleaned;
  }

  return value;
}

class AnalyticsService {
  private recentEvents = new Map<string, number>();
  private readonly dedupWindowMs = 1000; // 1 second deduplication window

  /**
   * Helper to resolve device category client-side
   */
  public getDeviceCategory(): 'mobile' | 'tablet' | 'desktop' | 'server' {
    if (typeof window === 'undefined') return 'server';
    const width = window.innerWidth;
    if (width < 640) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  /**
   * Infers route type from current pathname for SEO and funnel analysis
   */
  public getRouteType(path?: string): string {
    if (typeof window === 'undefined' && !path) return 'server';
    const pathname = path || (typeof window !== 'undefined' ? window.location.pathname : '/');
    if (pathname === '/') return 'home';
    if (pathname.startsWith('/seo/') || pathname.startsWith('/guides/')) return 'seo_guide';
    if (pathname === '/destinations' || pathname.startsWith('/destinations/')) return 'destination_hub';
    if (pathname === '/visa' || pathname === '/visa-guide' || pathname.startsWith('/visa/')) return 'visa_guide';
    if (pathname === '/plan') return 'trip_planner';
    if (pathname.startsWith('/itineraries')) return 'itineraries_hub';
    if (pathname.startsWith('/budget')) return 'budget_hub';
    if (pathname.startsWith('/blog')) return 'blog';
    return 'other';
  }

  /**
   * Extracts standard UTM campaign parameters safely from the current URL
   */
  public getUtmParams(): Record<string, string> {
    if (typeof window === 'undefined') return {};
    try {
      const params = new URLSearchParams(window.location.search);
      const utm: Record<string, string> = {};
      const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
      for (const k of keys) {
        const val = params.get(k);
        if (val) utm[k] = val.slice(0, 100);
      }
      return utm;
    } catch {
      return {};
    }
  }

  /**
   * Core dispatcher for all events with deduplication, dev logging & error boundary
   */
  public trackEvent(eventName: AnalyticsEventName, params: CommonMetadata = {}): void {
    if (typeof window === 'undefined') {
      return; // Never execute server-side
    }

    try {
      // 1. Sanitize all incoming parameters against PII
      const sanitizedParams = sanitizeValue(params) || {};

      // 2. Automatic metadata enrichment: page, page title, route type, device category, UTMs
      const pathname = window.location.pathname;
      const enrichedParams: CommonMetadata = {
        page: pathname,
        page_title: typeof document !== 'undefined' ? document.title : '',
        route_type: this.getRouteType(pathname),
        device_category: this.getDeviceCategory(),
        deviceType: this.getDeviceCategory(), // backward compatibility
        ...this.getUtmParams(),
        timestamp: new Date().toISOString(),
        ...sanitizedParams,
      };

      // Event Deduplication Check
      const dedupKey = `${eventName}:${JSON.stringify(enrichedParams)}`;
      const now = Date.now();
      const lastFired = this.recentEvents.get(dedupKey);

      if (lastFired && now - lastFired < this.dedupWindowMs) {
        if (process.env.NODE_ENV === 'development') {
          console.debug(`[GA4 Dedup Suppressed] ${eventName}`, enrichedParams);
        }
        return;
      }
      this.recentEvents.set(dedupKey, now);

      // Cleanup old dedup map keys periodically
      if (this.recentEvents.size > 100) {
        Array.from(this.recentEvents.entries()).forEach(([key, timestamp]) => {
          if (now - timestamp > this.dedupWindowMs * 5) {
            this.recentEvents.delete(key);
          }
        });
      }

      // Development Safeguards & Logging
      const isDev = process.env.NODE_ENV === 'development';
      const isDebugEnabled = process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === 'true';

      if (isDev) {
        console.groupCollapsed(`[GA4 Event] %c${eventName}`, 'color: #3b82f6; font-weight: bold;');
        console.log('Params:', enrichedParams);
        console.log('Measurement ID:', GA_MEASUREMENT_ID);
        console.groupEnd();

        // In dev mode, only dispatch to network if explicitly enabled
        if (!isDebugEnabled) {
          return;
        }
      }

      // Dispatch event to window.gtag
      const w = window as any;
      if (typeof w.gtag === 'function') {
        w.gtag('event', eventName, enrichedParams);
      } else if (Array.isArray(w.dataLayer)) {
        w.dataLayer.push({
          event: eventName,
          ...enrichedParams,
        });
      }
    } catch (err) {
      // Fail silently in production so UI flow is never broken
      if (process.env.NODE_ENV === 'development') {
        console.error(`[GA4 Error] Failed to track event '${eventName}':`, err);
      }
    }
  }

  /**
   * Tracks route/page views automatically or manually
   */
  public pageview(url: string, title?: string): void {
    if (typeof window === 'undefined') return;

    try {
      const isDev = process.env.NODE_ENV === 'development';
      const isDebugEnabled = process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === 'true';
      const pageTitle = title || (typeof document !== 'undefined' ? document.title : '');
      const pathname = url.split('?')[0];

      const pageParams = {
        page_path: url,
        page_title: pageTitle,
        route_type: this.getRouteType(pathname),
        device_category: this.getDeviceCategory(),
        ...this.getUtmParams(),
      };

      if (isDev) {
        console.log(`[GA4 PageView] Path: ${url} | Title: ${pageTitle} | Route: ${pageParams.route_type}`);
        if (!isDebugEnabled) return;
      }

      const pw = window as any;
      if (typeof pw.gtag === 'function') {
        pw.gtag('config', GA_MEASUREMENT_ID, {
          ...pageParams,
        });
        pw.gtag('event', 'page_view', pageParams);
      } else if (Array.isArray(pw.dataLayer)) {
        pw.dataLayer.push({
          event: 'page_view',
          ...pageParams,
        });
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[GA4 Error] PageView tracking failed:', err);
      }
    }
  }

  // ─── Strongly Typed Domain Methods ──────────────────────────────────────────

  // 10. SEO Phase 5 Conversion & Journey Events
  public plannerStarted(params: PlannerStartedParams = {}): void {
    this.trackEvent('planner_started', params);
  }

  public plannerCompleted(params: PlannerCompletedParams = {}): void {
    this.trackEvent('planner_completed', params);
  }

  public plannerError(params: PlannerErrorParams): void {
    this.trackEvent('planner_error', params);
  }

  public guideCtaClicked(params: GuideCtaClickedParams): void {
    this.trackEvent('guide_cta_clicked', params);
  }

  public destinationViewed(params: DestinationViewedParams): void {
    this.trackEvent('destination_viewed', params);
  }

  public visaGuideViewed(params: VisaGuideViewedParams): void {
    this.trackEvent('visa_guide_viewed', params);
  }

  public outboundBookingClicked(params: OutboundBookingClickedParams): void {
    this.trackEvent('outbound_booking_clicked', params);
  }

  public trackCustomEvent(eventName: string, params: Record<string, any> = {}): void {
    this.trackEvent(eventName as AnalyticsEventName, params);
  }

  // 1. Authentication
  public signup(params: SignupParams): void {
    this.trackEvent('signup', params);
  }
  public login(params: LoginParams): void {
    this.trackEvent('login', params);
  }
  public logout(params?: LogoutParams): void {
    this.trackEvent('logout', params || {});
  }

  // 2. Trip Flow
  public createTrip(params: CreateTripParams): void {
    this.trackEvent('create_trip', params);
  }
  public itineraryGenerationStarted(params: ItineraryGenStartedParams): void {
    this.trackEvent('itinerary_generation_started', params);
  }
  public itineraryGenerationSuccess(params: ItineraryGenSuccessParams): void {
    this.trackEvent('itinerary_generation_success', params);
  }
  public itineraryGenerationFailed(params: ItineraryGenFailedParams): void {
    this.trackEvent('itinerary_generation_failed', params);
  }
  public itinerarySaved(params: ItinerarySavedParams): void {
    this.trackEvent('itinerary_saved', params);
  }
  public itineraryShared(params: ItinerarySharedParams): void {
    this.trackEvent('itinerary_shared', params);
  }
  public itineraryDeleted(params?: ItineraryDeletedParams): void {
    this.trackEvent('itinerary_deleted', params || {});
  }

  // 3. Search
  public flightSearch(params: SearchEventParams): void {
    this.trackEvent('flight_search', params);
  }
  public hotelSearch(params: SearchEventParams): void {
    this.trackEvent('hotel_search', params);
  }
  public trainSearch(params: SearchEventParams): void {
    this.trackEvent('train_search', params);
  }
  public busSearch(params: SearchEventParams): void {
    this.trackEvent('bus_search', params);
  }
  public rentalSearch(params: SearchEventParams): void {
    this.trackEvent('rental_search', params);
  }
  public restaurantSearch(params: SearchEventParams): void {
    this.trackEvent('restaurant_search', params);
  }
  public activitySearch(params: SearchEventParams): void {
    this.trackEvent('activity_search', params);
  }

  // 4. Recommendations
  public recommendationView(params: RecommendationViewParams): void {
    this.trackEvent('recommendation_view', params);
  }
  public recommendationClick(params: RecommendationClickParams): void {
    this.trackEvent('recommendation_click', params);
  }
  public recommendationSave(params: RecommendationSaveParams): void {
    this.trackEvent('recommendation_save', params);
  }

  // 5. Monetization
  public affiliateClick(params: AffiliateClickParams): void {
    this.trackEvent('affiliate_click', params);
  }
  public bookingClick(params: BookingClickParams): void {
    this.trackEvent('booking_click', params);
  }
  public premiumUpgradeClick(params: PremiumUpgradeClickParams): void {
    this.trackEvent('premium_upgrade_click', params);
  }

  // 6. Memories
  public photoUpload(params: PhotoUploadParams): void {
    this.trackEvent('photo_upload', params);
  }
  public memoryView(params: MemoryViewParams): void {
    this.trackEvent('memory_view', params);
  }

  // 7. AI
  public aiResponseGenerated(params: AiResponseGeneratedParams): void {
    this.trackEvent('ai_response_generated', params);
  }
  public aiGenerationFailed(params: AiGenerationFailedParams): void {
    this.trackEvent('ai_generation_failed', params);
  }
  public aiFeedbackPositive(params: AiFeedbackParams): void {
    this.trackEvent('ai_feedback_positive', params);
  }
  public aiFeedbackNegative(params: AiFeedbackParams): void {
    this.trackEvent('ai_feedback_negative', params);
  }

  // 8. Errors
  public apiError(params: ErrorParams): void {
    this.trackEvent('api_error', params);
  }
  public uiError(params: ErrorParams): void {
    this.trackEvent('ui_error', params);
  }
  public uploadFailure(params: ErrorParams): void {
    this.trackEvent('upload_failure', params);
  }
  public authError(params: ErrorParams): void {
    this.trackEvent('auth_error', params);
  }

  // 9. Performance
  public pageLoadTime(params: PerformanceParams): void {
    this.trackEvent('page_load_time', params);
  }
  public apiResponseTime(params: PerformanceParams): void {
    this.trackEvent('api_response_time', params);
  }
  public itineraryGenerationDuration(params: PerformanceParams): void {
    this.trackEvent('itinerary_generation_duration', params);
  }
}

// Singleton Instance Export
export const analytics = new AnalyticsService();

