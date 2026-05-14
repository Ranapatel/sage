import type { Metadata } from 'next'
import LandingLayout from '@/components/layout/LandingLayout'
import SEOContent from '@/components/ui/SEOContent'

export const metadata: Metadata = {
  title: 'Best Beaches in India | Top Coastal Destinations | TripSage',
  description: 'Explore the most beautiful beaches in India. From the party beaches of Goa to the pristine shores of Radhanagar, find your paradise with TripSage.',
  keywords: ['best beaches in India', 'pristine beaches India', 'Goa beaches guide', 'Andaman beaches'],
  alternates: { canonical: 'https://tripsage.in/best-beaches-in-india' }
}

export default function Page() {
  return (
    <LandingLayout>
      <SEOContent
        title="Discover the Best Beaches in India"
        subtitle="Sun, sand, and serenity. From hidden coves to world-famous shores, explore the incredible coastline of India."
        heroImage="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1920&q=90"
        content={
          <>
            <h2>India's Top Beach Destinations for Every Traveler</h2>
            <p>With a coastline stretching over 7,500 kilometers, India is home to some of the world's most diverse beach experiences.</p>
            <h3>Where to Head for the Perfect Beach Holiday</h3>
            <ul>
              <li><strong>Radhanagar Beach, Andamans:</strong> Often ranked as the best beach in Asia for its white sand and turquoise water.</li>
              <li><strong>Palolem Beach, Goa:</strong> A crescent-shaped paradise perfect for relaxing and sunset watching.</li>
              <li><strong>Varkala, Kerala:</strong> Unique for its stunning red cliffs overlooking the Arabian Sea.</li>
            </ul>
            <p>Whether you're looking for water sports, nightlife, or just a quiet place to read, our AI can find the perfect coastal spot for you.</p>
          </>
        }
        faqs={[
          { question: "Which is the cleanest beach in India?", answer: "Radhanagar Beach in Havelock Island and the Blue Flag certified beaches like Eden in Pondicherry are known for their cleanliness." },
          { question: "Is South Goa or North Goa better for beaches?", answer: "North Goa is better for parties and water sports; South Goa is better for peace, cleanliness, and relaxation." },
          { question: "Are there good beaches near Mumbai?", answer: "Yes, Alibaug and Kashid are excellent weekend options just a short ferry or drive away." }
        ]}
      />
    </LandingLayout>
  )
}
