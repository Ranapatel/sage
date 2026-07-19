import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Server-side: trace 20% of requests for performance monitoring
  tracesSampleRate: 0.2,

  // Don't send errors in development
  beforeSend(event) {
    if (process.env.NODE_ENV === 'development') return null
    return event
  },
})
