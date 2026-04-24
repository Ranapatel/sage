import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: {
    default: 'AI Trip Planner India | Plan Smart Travel with TripSage',
    template: '%s | TripSage AI Travel OS'
  },
  description: 'Plan your trips instantly using AI. Compare the cheapest flights in India, book hotels, and generate smart itineraries with TripSage.',
  keywords: 'AI trip planner India, travel planner app, cheapest flights India, itinerary planner AI, TripSage, smart travel',
  openGraph: {
    title: 'AI Trip Planner India | Plan Smart Travel with TripSage',
    description: 'Plan your trips instantly using AI. Compare flights, hotels, and itineraries with TripSage.',
    images: ['https://res.cloudinary.com/dob5llmb2/image/upload/v1774999435/LOGO_xbwcwe.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Trip Planner India | Plan Smart Travel with TripSage',
    description: 'Plan your trips instantly using AI. Compare flights, hotels, and itineraries with TripSage.',
    images: ['https://res.cloudinary.com/dob5llmb2/image/upload/v1774999435/LOGO_xbwcwe.png'],
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="https://res.cloudinary.com/dob5llmb2/image/upload/v1774999435/LOGO_xbwcwe.png" />
      </head>
      <body>
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
