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
  }, [pathname, searchParams]);

  return null;
}
