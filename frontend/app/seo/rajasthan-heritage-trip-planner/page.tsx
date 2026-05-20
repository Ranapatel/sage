import type { Metadata } from 'next'
import LandingLayout from '@/components/layout/LandingLayout'
import SEOContent from '@/components/ui/SEOContent'

export const metadata: Metadata = {
  title: 'Rajasthan Royal Heritage Tour Planner | Custom Palaces Itinerary | TripSage',
  description: 'Experience royalty. Plan a custom trip to Jaipur, Udaipur, Jodhpur, and Jaisalmer. Book heritage stays and palace tours with TripSage AI.',
  keywords: ['Rajasthan heritage tour planner', 'Jaipur Udaipur itinerary', 'Rajasthan royal packages', 'desert safari Jaisalmer', 'TripSage Rajasthan'],
  alternates: { canonical: 'https://tripsage.in/seo/rajasthan-heritage-trip-planner' }
}

export default function Page() {
  return (
    <LandingLayout>
      <SEOContent
        title="Embark on a Royal Rajasthan Heritage Journey"
        subtitle="Walk through centuries of history, grand forts, and opulent palaces. Let our AI design your personal route through the land of Kings."
        heroImage="https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1920&q=90"
        content={
          <>
            <h2>Discover the Magnificence of Rajasthan</h2>
            <p>Rajasthan is a vibrant tapestry of color, architectural grandeur, and rich folklore. From the pink-hued streets of Jaipur to the golden sands of Thar, it offers a majestic travel experience.</p>
            
            <h3>Unmissable Heritage Spots for Your Plan</h3>
            <ul>
              <li><strong>The Pink City (Jaipur):</strong> Visit the iconic Hawa Mahal, Amer Fort, and shop for precious gems and handcrafted textiles in Johari Bazaar.</li>
              <li><strong>The City of Lakes (Udaipur):</strong> Take a boat cruise on Lake Pichola and marvel at the majestic City Palace rising from the water.</li>
              <li><strong>The Blue City (Jodhpur):</strong> Stand atop the towering Mehrangarh Fort and gaze over the indigo-colored rooftops of the old town.</li>
              <li><strong>The Golden Oasis (Jaisalmer):</strong> Camp under the stars in Sam Sand Dunes and tour the living fort carved from yellow sandstone.</li>
            </ul>

            <p>Our intelligent AI organizes your travel across these royal cities, optimizing travel modes (trains, flights, or road transfers) to save time and capture the local heritage perfectly.</p>
          </>
        }
        faqs={[
          { question: "When is the best season to explore Rajasthan?", answer: "The cooler months from October to March are perfect for traveling in Rajasthan. Summers can be extremely hot, especially in desert areas like Jaisalmer." },
          { question: "How can I travel between Jaipur, Jodhpur, and Udaipur?", answer: "The Golden Triangle and surrounding cities are well-connected by heritage trains, private cabs, and domestic flights. Our planner dynamically optimizes the best route for your schedule." },
          { question: "What should I pack for a Rajasthan heritage trip?", answer: "Lightweight cotton clothing is best. Bring comfortable walking shoes for fort tours, sunglasses, sunblock, and a camera to capture the spectacular colors." }
        ]}
      />
    </LandingLayout>
  )
}
