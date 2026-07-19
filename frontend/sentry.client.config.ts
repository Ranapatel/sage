import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Capture performance traces — helps identify slow pages
  tracesSampleRate: 0.2, // 20% of requests traced (adjust in production)

  // Session replays — records user session on error (great for debugging)
  replaysOnErrorSampleRate: 1.0,  // 100% replay on errors
  replaysSessionSampleRate: 0.05, // 5% of all sessions

  // Don't send errors in development
  beforeSend(event) {
    if (process.env.NODE_ENV === 'development') return null
    return event
  },

  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
})
