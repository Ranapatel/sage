import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import { Toaster } from 'react-hot-toast'
// GoogleAnalytics from @next/third-parties omitted — it emits a spurious preload hint.

export const metadata: Metadata = {
  metadataBase: new URL('https://tripsage.in'),
  title: {
    default: 'AI Trip Planner India | Plan Smart Travel with TripSage',
    template: '%s | TripSage AI Travel OS'
  },
  description: 'Plan your trips instantly using AI. Compare the cheapest flights in India, book hotels, and generate smart itineraries with TripSage.',
  keywords: ['AI trip planner India', 'travel planner app', 'cheapest flights India', 'itinerary planner AI', 'TripSage', 'smart travel', 'AI travel agent', 'holiday planner'],
  authors: [{ name: 'TripSage Team' }],
  creator: 'TripSage',
  publisher: 'TripSage',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: 'https://res.cloudinary.com/dob5llmb2/image/upload/v1778407506/Primary.JPEG.Logo_1_o0h85v.png',
  },
  openGraph: {
    title: 'AI Trip Planner India | Plan Smart Travel with TripSage',
    description: 'Plan your trips instantly using AI. Compare flights, hotels, and itineraries with TripSage.',
    url: 'https://tripsage.in',
    siteName: 'TripSage',
    images: [
      {
        url: 'https://res.cloudinary.com/dob5llmb2/image/upload/v1778407506/Primary.JPEG.Logo_1_o0h85v.png',
        width: 1200,
        height: 630,
        alt: 'TripSage - AI Trip Planner',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Trip Planner India | Plan Smart Travel with TripSage',
    description: 'Plan your trips instantly using AI. Compare flights, hotels, and itineraries with TripSage.',
    images: ['https://res.cloudinary.com/dob5llmb2/image/upload/v1778407506/Primary.JPEG.Logo_1_o0h85v.png'],
    creator: '@tripsage',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "TripSage",
  "operatingSystem": "Any",
  "applicationCategory": "TravelApplication",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "ratingCount": "12400"
  }
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "url": "https://tripsage.in",
  "name": "TripSage",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://tripsage.in/plan?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    /*
     * suppressHydrationWarning is required here because the perf-opt script
     * (afterInteractive — runs only on the client) may add 'slow-connection' to
     * <html> before React reconciles. Without this flag React will warn about
     * "Extra attributes from the server: class". The attribute is intentional
     * and safe — suppressHydrationWarning silences the warning without
     * disabling hydration for child nodes.
     */
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* JSON-LD structured data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />

        {/* Google Analytics — two Script tags avoids the spurious preload warning
            that @next/third-parties/GoogleAnalytics emits internally. */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-2F49Z4DK2H"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-2F49Z4DK2H', { send_page_view: true });
          `}
        </Script>

        {/* Temporary Debug Logging for API URLs */}
        <Script id="debug-env" strategy="afterInteractive">
          {`
            console.log('[DEBUG] NEXT_PUBLIC_API_URL:', '${process.env.NEXT_PUBLIC_API_URL}');
            console.log('[DEBUG] NEXT_PUBLIC_SOCKET_URL:', '${process.env.NEXT_PUBLIC_SOCKET_URL}');
          `}
        </Script>

        {/*
          * Slow-connection detection — afterInteractive so it only runs client-side.
          * Adds 'slow-connection' class to <html> to disable animations on 2G/3G.
          */}
        <Script
          id="perf-opt"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if ('connection' in navigator) {
                  var conn = navigator.connection;
                  if (conn && (conn.saveData || /2g|3g/.test(conn.effectiveType || ''))) {
                    document.documentElement.classList.add('slow-connection');
                  }
                }
              } catch(e) {}
            `,
          }}
        />
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.875rem',
            },
            success: {
              iconTheme: {
                primary: 'var(--primary)',
                secondary: 'white',
              },
            },
          }}
        />
      </body>
    </html>
  )
}
