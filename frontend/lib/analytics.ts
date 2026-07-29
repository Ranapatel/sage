/**
 * Backward compatibility adapter for TripSage Analytics
 * Delegates to the centralized AnalyticsService.
 */

import { analytics, GA_MEASUREMENT_ID } from './analytics/service';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export const GA_TRACKING_ID = GA_MEASUREMENT_ID;

export const pageview = (url: string, title?: string) => {
  analytics.pageview(url, title);
};

export const trackEvent = (action: string, params?: Record<string, any>) => {
  analytics.trackEvent(action, params);
};

export * from './analytics/index';
