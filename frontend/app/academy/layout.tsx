import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'TripSage Academy — Free Foundations of AGI Course',
  description:
    'Learn what Artificial General Intelligence (AGI) really is, how AI systems reason, and where intelligent agents are heading in this free 5-episode course.',
  openGraph: {
    title: 'TripSage Academy — Free Foundations of AGI Course',
    description:
      'Enroll in the free 5-episode Foundations of AGI course by TripSage. Beginner friendly with progress tracking and completion certificate.',
    url: 'https://tripsage.in/academy',
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
