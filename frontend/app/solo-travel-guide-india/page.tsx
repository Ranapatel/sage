import type { Metadata } from 'next'
import LandingLayout from '@/components/layout/LandingLayout'
import SEOContent from '@/components/ui/SEOContent'

export const metadata: Metadata = {
  title: 'Solo Travel Guide India | Best Solo Destinations | TripSage',
  description: 'Your ultimate guide to solo travel in India. Find the safest destinations, budget tips, and AI-powered solo itineraries with TripSage.',
  keywords: ['solo travel India', 'solo trip destinations India', 'safe travel for solo women India', 'solo travel guide'],
  alternates: { canonical: 'https://tripsage.in/solo-travel-guide-india' }
}

export default function Page() {
  return (
    <LandingLayout>
      <SEOContent
        title="The Ultimate Solo Travel Guide for India"
        subtitle="Embark on a journey of self-discovery. Learn how to navigate India solo with confidence, safety, and a sense of adventure."
        heroImage="https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=1920&q=90"
        content={
          <>
            <h2>Why India is an Incredible Solo Adventure</h2>
            <p>Solo travel in India is life-changing. It offers a chance to connect with people, explore diverse landscapes, and learn more about yourself than you ever thought possible.</p>
            <h3>Safest & Best Destinations for Solo Travelers</h3>
            <ul>
              <li><strong>Rishikesh:</strong> The yoga capital is extremely welcoming and perfect for solo spiritual seekers.</li>
              <li><strong>Ziro Valley:</strong> A peaceful and unique destination in Arunachal Pradesh known for its friendly local community.</li>
              <li><strong>Pondicherry:</strong> Safe, walkable, and filled with charming French architecture and cafes.</li>
            </ul>
            <p>Our AI 'Solo Mode' helps you find social hostels, group tours, and safe transport options to ensure you're never truly alone unless you want to be.</p>
          </>
        }
        faqs={[
          { question: "Is solo travel in India safe for women?", answer: "Yes, with basic precautions and choosing traveler-friendly hubs like Pondicherry, Goa, or Rishikesh, many women travel solo safely in India." },
          { question: "How can I meet people while traveling solo?", answer: "Stay in hostels with common areas and join walking tours. Our AI can recommend the most social stays!" },
          { question: "What is the most important solo travel tip?", answer: "Always arrive at a new destination during daylight hours and keep your emergency contacts updated." }
        ]}
      />
    </LandingLayout>
  )
}
