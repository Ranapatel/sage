import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'TripSage Academy | TripSage',
  description:
    'A 5-episode course on how AI systems reason.',
  alternates: { canonical: 'https://www.tripsage.in/academy' },
  openGraph: {
    title: 'TripSage Academy | TripSage',
    description:
      'Enroll in the 5-episode Foundations of AGI course by TripSage. Beginner friendly with progress tracking and completion certificate.',
    url: 'https://www.tripsage.in/academy',
    siteName: 'TripSage',
    images: [
      {
        url: '/academy_3d_preview.jpg',
        width: 1200,
        height: 630,
        alt: 'TripSage Academy AGI Course',
      },
    ],
    type: 'website',
  },
}

export default function AcademyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
