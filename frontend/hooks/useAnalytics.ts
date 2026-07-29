'use client';

import { useCallback } from 'react';
import { analytics } from '@/lib/analytics/service';
import type {
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
} from '@/lib/analytics/types';

/**
 * Reusable React Hook for accessing strongly typed GA4 analytics
 */
export function useAnalytics() {
  const trackCustomEvent = useCallback((name: string, params?: CommonMetadata) => {
    analytics.trackEvent(name, params);
  }, []);

  const trackSignup = useCallback((params: SignupParams) => {
    analytics.signup(params);
  }, []);

  const trackLogin = useCallback((params: LoginParams) => {
    analytics.login(params);
  }, []);

  const trackLogout = useCallback((params?: LogoutParams) => {
    analytics.logout(params);
  }, []);

  const trackCreateTrip = useCallback((params: CreateTripParams) => {
    analytics.createTrip(params);
  }, []);

  const trackItineraryStarted = useCallback((params: ItineraryGenStartedParams) => {
    analytics.itineraryGenerationStarted(params);
  }, []);

  const trackItinerarySuccess = useCallback((params: ItineraryGenSuccessParams) => {
    analytics.itineraryGenerationSuccess(params);
  }, []);

  const trackItineraryFailed = useCallback((params: ItineraryGenFailedParams) => {
    analytics.itineraryGenerationFailed(params);
  }, []);

  const trackItinerarySaved = useCallback((params: ItinerarySavedParams) => {
    analytics.itinerarySaved(params);
  }, []);

  const trackItineraryShared = useCallback((params: ItinerarySharedParams) => {
    analytics.itineraryShared(params);
  }, []);

  const trackItineraryDeleted = useCallback((params?: ItineraryDeletedParams) => {
    analytics.itineraryDeleted(params);
  }, []);

  const trackFlightSearch = useCallback((params: SearchEventParams) => {
    analytics.flightSearch(params);
  }, []);

  const trackHotelSearch = useCallback((params: SearchEventParams) => {
    analytics.hotelSearch(params);
  }, []);

  const trackTrainSearch = useCallback((params: SearchEventParams) => {
    analytics.trainSearch(params);
  }, []);

  const trackBusSearch = useCallback((params: SearchEventParams) => {
    analytics.busSearch(params);
  }, []);

  const trackRentalSearch = useCallback((params: SearchEventParams) => {
    analytics.rentalSearch(params);
  }, []);

  const trackRestaurantSearch = useCallback((params: SearchEventParams) => {
    analytics.restaurantSearch(params);
  }, []);

  const trackActivitySearch = useCallback((params: SearchEventParams) => {
    analytics.activitySearch(params);
  }, []);

  const trackRecommendationView = useCallback((params: RecommendationViewParams) => {
    analytics.recommendationView(params);
  }, []);

  const trackRecommendationClick = useCallback((params: RecommendationClickParams) => {
    analytics.recommendationClick(params);
  }, []);

  const trackRecommendationSave = useCallback((params: RecommendationSaveParams) => {
    analytics.recommendationSave(params);
  }, []);

  const trackAffiliateClick = useCallback((params: AffiliateClickParams) => {
    analytics.affiliateClick(params);
  }, []);

  const trackBookingClick = useCallback((params: BookingClickParams) => {
    analytics.bookingClick(params);
  }, []);

  const trackPremiumUpgrade = useCallback((params: PremiumUpgradeClickParams) => {
    analytics.premiumUpgradeClick(params);
  }, []);

  const trackPhotoUpload = useCallback((params: PhotoUploadParams) => {
    analytics.photoUpload(params);
  }, []);

  const trackMemoryView = useCallback((params: MemoryViewParams) => {
    analytics.memoryView(params);
  }, []);

  const trackAiResponse = useCallback((params: AiResponseGeneratedParams) => {
    analytics.aiResponseGenerated(params);
  }, []);

  const trackAiFailed = useCallback((params: AiGenerationFailedParams) => {
    analytics.aiGenerationFailed(params);
  }, []);

  const trackAiFeedbackPositive = useCallback((params: AiFeedbackParams) => {
    analytics.aiFeedbackPositive(params);
  }, []);

  const trackAiFeedbackNegative = useCallback((params: AiFeedbackParams) => {
    analytics.aiFeedbackNegative(params);
  }, []);

  const trackApiError = useCallback((params: ErrorParams) => {
    analytics.apiError(params);
  }, []);

  const trackUiError = useCallback((params: ErrorParams) => {
    analytics.uiError(params);
  }, []);

  const trackUploadFailure = useCallback((params: ErrorParams) => {
    analytics.uploadFailure(params);
  }, []);

  const trackAuthError = useCallback((params: ErrorParams) => {
    analytics.authError(params);
  }, []);

  const trackPerformance = useCallback((params: PerformanceParams) => {
    if (params.metricName === 'api_response_time') {
      analytics.apiResponseTime(params);
    } else if (params.metricName === 'itinerary_generation_duration') {
      analytics.itineraryGenerationDuration(params);
    } else {
      analytics.pageLoadTime(params);
    }
  }, []);

  /**
   * Timing helper function to measure async execution time and report performance event
   */
  const measureExecutionTime = useCallback(
    async <T>(metricName: string, fn: () => Promise<T>, metadata?: CommonMetadata): Promise<T> => {
      const startTime = performance.now();
      try {
        const result = await fn();
        const durationMs = Math.round(performance.now() - startTime);
        analytics.trackEvent(metricName, { ...metadata, durationMs });
        return result;
      } catch (err: any) {
        const durationMs = Math.round(performance.now() - startTime);
        analytics.trackEvent(`${metricName}_failed`, {
          ...metadata,
          durationMs,
          errorMessage: err.message,
        });
        throw err;
      }
    },
    []
  );

  return {
    analytics,
    trackCustomEvent,
    trackSignup,
    trackLogin,
    trackLogout,
    trackCreateTrip,
    trackItineraryStarted,
    trackItinerarySuccess,
    trackItineraryFailed,
    trackItinerarySaved,
    trackItineraryShared,
    trackItineraryDeleted,
    trackFlightSearch,
    trackHotelSearch,
    trackTrainSearch,
    trackBusSearch,
    trackRentalSearch,
    trackRestaurantSearch,
    trackActivitySearch,
    trackRecommendationView,
    trackRecommendationClick,
    trackRecommendationSave,
    trackAffiliateClick,
    trackBookingClick,
    trackPremiumUpgrade,
    trackPhotoUpload,
    trackMemoryView,
    trackAiResponse,
    trackAiFailed,
    trackAiFeedbackPositive,
    trackAiFeedbackNegative,
    trackApiError,
    trackUiError,
    trackUploadFailure,
    trackAuthError,
    trackPerformance,
    measureExecutionTime,
  };
}
