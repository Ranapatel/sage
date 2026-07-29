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
} from './types';

export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-2F49Z4DK2H';

class AnalyticsService {
  private recentEvents = new Map<string, number>();
  private readonly dedupWindowMs = 1000; // 1 second deduplication window

  /**
   * Helper to resolve device type client-side
   */
  private getDeviceType(): string {
    if (typeof window === 'undefined') return 'server';
    const width = window.innerWidth;
    if (width < 640) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  /**
   * Core dispatcher for all events with deduplication, dev logging & error boundary
   */
  public trackEvent(eventName: AnalyticsEventName, params: CommonMetadata = {}): void {
    if (typeof window === 'undefined') {
      return; // Never execute server-side
    }

    try {
      // Automatic metadata enrichment
      const enrichedParams: CommonMetadata = {
        deviceType: this.getDeviceType(),
        timestamp: new Date().toISOString(),
        ...params,
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
        for (const [key, timestamp] of this.recentEvents.entries()) {
          if (now - timestamp > this.dedupWindowMs * 5) {
            this.recentEvents.delete(key);
          }
        }
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
      if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, enrichedParams);
      } else if (Array.isArray(window.dataLayer)) {
        window.dataLayer.push({
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

      if (isDev) {
        console.log(`[GA4 PageView] Path: ${url} ${title ? `| Title: ${title}` : ''}`);
        if (!isDebugEnabled) return;
      }

      if (typeof window.gtag === 'function') {
        window.gtag('config', GA_MEASUREMENT_ID, {
          page_path: url,
          page_title: title || document.title,
        });
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[GA4 Error] PageView tracking failed:', err);
      }
    }
  }

  // ─── Strongly Typed Domain Methods ──────────────────────────────────────────

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
