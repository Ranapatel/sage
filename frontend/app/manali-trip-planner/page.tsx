import type { Metadata } from 'next'
import LandingLayout from '@/components/layout/LandingLayout'
import SEOContent from '@/components/ui/SEOContent'

export const metadata: Metadata = {
  title: 'Manali Trip Planner | Ultimate Manali Itinerary | TripSage',
  description: 'Plan your perfect Manali trip. From Solang Valley to Old Manali, get the best AI-generated Manali itinerary, hotel recommendations, and more.',
  keywords: ['Manali trip planner', 'Manali itinerary AI', 'best time to visit Manali', 'Manali budget guide'],
  alternates: { canonical: 'https://tripsage.in/manali-trip-planner' }
}

export default function Page() {
  return (
    <LandingLayout>
      <SEOContent
        title="Complete Manali Trip Planner & Guide"
        subtitle="Experience the magic of the Himalayas. Whether you want snow-filled adventures or peaceful mountain vibes, plan your Manali trip here."
        heroImage="https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1920&q=90"
        content={
          <>
            <h2>Your Gateway to the Mountains: Manali</h2>
            <p>Manali is more than just a hill station; it's an experience. From the bustling Mall Road to the quiet cafes of Old Manali, there's a reason why it remains one of India's top destinations.</p>
            <h3>Must-Visit Spots in Manali</h3>
            <ul>
              <li><strong>Solang Valley:</strong> The hub for adventure sports like paragliding, zorbing, and skiing.</li>
              <li><strong>Old Manali:</strong> Famous for its rustic charm, quaint cafes, and the Hadimba Devi Temple.</li>
              <li><strong>Rohtang Pass:</strong> Experience year-round snow and breathtaking views (permit required).</li>
            </ul>
            <p>Our AI can help you plan your travel from Delhi or Chandigarh, book the best mountain-view hotels, and create a daily sightseeing schedule.</p>
          </>
        }
        faqs={[
          { question: "When is the best time to see snow in Manali?", answer: "Late December to February is the best time for heavy snow and winter sports." },
          { question: "Is Manali safe for solo travelers?", answer: "Yes, Manali is generally very safe and has a vibrant traveler community, especially in the Old Manali area." },
          { question: "How many days are enough for Manali?", answer: "A 3-4 day trip is usually sufficient to see the main attractions, but add 2 more days if you plan to visit Kasol or Rohtang." }
        ]}
      />
    </LandingLayout>
  )
}
