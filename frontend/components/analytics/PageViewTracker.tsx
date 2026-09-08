'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { analytics } from '@/lib/analytics/service';

/**
 * Next.js App Router Client Component that automatically tracks page_view events on route changes.
 */
export function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedUrl = useRef<string>('');

  useEffect(() => {
    if (!pathname) return;

    const queryString = searchParams?.toString();
    const fullUrl = queryString ? `${pathname}?${queryString}` : pathname;

    // Prevent duplicate pageview calls for the exact same URL string
    if (lastTrackedUrl.current === fullUrl) {
      return;
    }
    lastTrackedUrl.current = fullUrl;

    analytics.pageview(fullUrl);

    // Contextual SEO Event Triggering
    if (pathname === '/visa' || pathname === '/visa-guide' || pathname.startsWith('/visa/')) {
      const countryMatch = pathname.match(/\/visa\/([a-z0-9-]+)-visa/i);
      const destinationCountry = countryMatch && countryMatch[1]
        ? countryMatch[1].charAt(0).toUpperCase() + countryMatch[1].slice(1)
        : pathname.includes('visa-guide') ? 'All' : 'General';
      
      analytics.visaGuideViewed({
        destinationCountry,
        source: 'route_navigation',
      });
    } else if (pathname === '/destinations' || pathname.startsWith('/destinations/')) {
      analytics.destinationViewed({
        destinationName: pathname === '/destinations' ? 'All Destinations' : pathname.replace('/destinations/', ''),
        source: 'destinations_hub',
      });
    }
  }, [pathname, searchParams]);

  return null;
}
