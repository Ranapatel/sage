import type { Metadata } from 'next'
import LandingLayout from '@/components/layout/LandingLayout'
import SEOContent from '@/components/ui/SEOContent'

export const metadata: Metadata = {
  title: 'Kerala Backwaters Trip Planner | Hill Stations & Houseboats | TripSage',
  description: 'Plan your dream Kerala vacation. Custom houseboat itineraries in Alleppey, tea gardens of Munnar, and pristine beaches of Kovalam with TripSage AI.',
  keywords: ['Kerala trip planner', 'Kerala houseboat itinerary', 'Munnar hill station guide', 'Alleppey backwaters', 'TripSage Kerala'],
  alternates: { canonical: 'https://tripsage.in/seo/kerala-backwaters-trip-planner' }
}

export default function Page() {
  return (
    <LandingLayout>
      <SEOContent
        title="Plan the Perfect Kerala Backwaters & Hill Station Holiday"
        subtitle="Unveil the serenity of God's Own Country. From mist-covered hills in Munnar to serene houseboats in Alleppey, let AI craft your perfect escape."
        heroImage="https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=1920&q=90"
        content={
          <>
            <h2>Explore Kerala's Diverse Landscapes</h2>
            <p>Kerala is a paradise of contrasts, combining tranquil coastal lines, mist-kissed western ghats, and a world-renowned network of backwaters.</p>
            
            <h3>Top Experiences for Your Kerala Itinerary</h3>
            <ul>
              <li><strong>Cruising Alleppey Backwaters:</strong> Spend a luxurious night on a traditional Kettuvallam (houseboat) floating past emerald rice paddies.</li>
              <li><strong>Exploring Munnar Tea Estates:</strong> Walk through endless carpeted green tea plantations and enjoy panoramic hill-station views.</li>
              <li><strong>Wildlife Safari in Periyar:</strong> Spot elephants and rare birds around the lake in Thekkady's famous wildlife sanctuary.</li>
              <li><strong>Relaxing in Kovalam & Varkala:</strong> Experience towering cliffs merging with gold-sand beaches on the Arabian Sea.</li>
            </ul>

            <p>Our intelligent AI trip planner helps you balance travel times between hill stations and coastal waters, ensuring a relaxed, authentic Kerala experience.</p>
          </>
        }
        faqs={[
          { question: "What is the best time to visit Kerala?", answer: "The winter season from September to March is ideal, as the weather is pleasant and excellent for houseboat cruises and hill station sightseeing." },
          { question: "How many days are needed for a complete Kerala trip?", answer: "A standard itinerary requires 5 to 7 days to cover Munnar, Thekkady, and Alleppey. An extended 10-day trip can include Kovalam and Wayanad." },
          { question: "Are houseboats in Alleppey safe and family-friendly?", answer: "Yes, houseboats are fully equipped with modern safety features, private bedrooms, onboard chefs, and are highly recommended for families and couples alike." }
        ]}
      />
    </LandingLayout>
  )
}
