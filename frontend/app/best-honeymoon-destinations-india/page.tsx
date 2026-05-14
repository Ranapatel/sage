import type { Metadata } from 'next'
import LandingLayout from '@/components/layout/LandingLayout'
import SEOContent from '@/components/ui/SEOContent'

export const metadata: Metadata = {
  title: 'Best Honeymoon Destinations in India | Romantic Getaways | TripSage',
  description: 'Plan your romantic escape with the best honeymoon destinations in India. From Udaipur to Andaman, find your perfect match with TripSage AI.',
  keywords: ['best honeymoon destinations India', 'romantic trips India', 'honeymoon guide India', 'top couple destinations'],
  alternates: { canonical: 'https://tripsage.in/best-honeymoon-destinations-india' }
}

export default function Page() {
  return (
    <LandingLayout>
      <SEOContent
        title="India's Most Romantic Honeymoon Destinations"
        subtitle="Celebrate your new beginning in style. Discover breathtaking landscapes and intimate experiences across the most beautiful parts of India."
        heroImage="https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?w=1920&q=90"
        content={
          <>
            <h2>Top Picks for a Dreamy Indian Honeymoon</h2>
            <p>India offers an incredible variety of romantic settings, from the snow-capped mountains of Kashmir to the golden sands of the Andaman Islands.</p>
            <h3>Our Favorite Romantic Escapes</h3>
            <ul>
              <li><strong>Udaipur, Rajasthan:</strong> The 'City of Lakes' offers royal luxury and stunning sunsets over Lake Pichola.</li>
              <li><strong>Gulmarg, Kashmir:</strong> Perfect for couples who love snow and cozy mountain stays.</li>
              <li><strong>Andaman Islands:</strong> For crystal-clear waters and secluded white-sand beaches.</li>
            </ul>
            <p>TripSage AI can curate special 'Couple-Style' itineraries that prioritize privacy, romantic dining, and unforgettable experiences.</p>
          </>
        }
        faqs={[
          { question: "Which is the best month for a honeymoon in India?", answer: "October to March is generally the best time for most of India, while June to September is great for Kerala or the mountains." },
          { question: "Is North or South India better for a honeymoon?", answer: "It depends on your vibe! North offers mountains and royalty, while South offers beaches, greenery, and backwaters." },
          { question: "Can TripSage help book luxury hotels?", answer: "Yes, our optimizer ranks hotels based on 'Romantic' relevance and provides direct booking links." }
        ]}
      />
    </LandingLayout>
  )
}
