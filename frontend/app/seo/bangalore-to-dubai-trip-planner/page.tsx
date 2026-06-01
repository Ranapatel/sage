import type { Metadata } from 'next'
import LandingLayout from '@/components/layout/LandingLayout'
import SEOContent from '@/components/ui/SEOContent'

export const metadata: Metadata = {
  title: 'Bangalore to Dubai Trip Planner | Ultimate Dubai Guide | TripSage',
  description: 'Plan your dream Dubai vacation from Bangalore. Discover flight options, cheap luxury stays, desert safaris, and customize an AI itinerary.',
  keywords: ['Bangalore to Dubai trip planner', 'Dubai itinerary AI', 'best time to visit Dubai', 'Dubai travel guide', 'TripSage Dubai'],
  alternates: { canonical: 'https://tripsage.in/seo/bangalore-to-dubai-trip-planner' }
}

export default function Page() {
  return (
    <LandingLayout>
      <SEOContent
        title="Bangalore to Dubai Trip Planner"
        subtitle="Embark on a luxury and adventure filled vacation from Silicon Valley of India to Dubai."
        heroImage="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&q=90"
        ctaText="Generate AI Trip Plan"
        ctaLink="https://tripsage.in/plan"
        content={
          <>
            <h2>Experience the Wonders of Dubai from Bangalore</h2>
            <p>Design your perfect getaway from Bangalore to Dubai, a city of dazzling superlatives, futuristic skyscrapers, and rich desert heritage. Dubai is a playground of luxury and adventure, boasting the world's tallest building, the Burj Khalifa, the sprawling Dubai Mall, and the stunning artificial island of Palm Jumeirah. Direct flights from Bangalore’s Kempegowda International Airport reach Dubai in just about four hours, making it highly convenient for quick getaways or luxurious shopping retreats. Experience thrilling desert safaris with sandboarding and dune bashing, or relax along the pristine shores of Jumeirah Beach. Whether you're traveling with family or looking for a premium couple's getaway, our AI travel engine customizes your daily sightseeing schedule, estimates your overall expenditures, finds affordable luxury hotels, and guides you on the best times to book flights to maximize your budget.</p>
            
            <div className="my-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Estimated Budget</span>
                <span className="text-lg font-bold text-slate-800">₹55,000 - ₹75,000 per person</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Best Time to Visit</span>
                <span className="text-lg font-bold text-slate-800">November to March (Pleasant Winter)</span>
              </div>
            </div>

            <h3>Top Activities to Include in Dubai</h3>
            <ul>
              <li><strong>Burj Khalifa Observation Deck:</strong> Stand on the highest outdoor observation deck in the world.</li>
              <li><strong>Desert Safari:</strong> Enjoy traditional Arabian hospitality, tanoura dance, and dune bashing in the desert.</li>
              <li><strong>The Dubai Mall:</strong> Shop at global brands, see the massive indoor aquarium, and watch the fountain show.</li>
            </ul>
          </>
        }
        faqs={[
          { question: "Is a visa required for Indians traveling to Dubai?", answer: "Yes, Indian citizens require a pre-arranged visa or a transit visa to enter Dubai. Eligible travelers with a valid US/UK/Schengen visa can obtain a visa on arrival." },
          { question: "What is the travel time from Bangalore to Dubai?", answer: "Direct flights from Bangalore (BLR) to Dubai International Airport (DXB) take approximately 4 hours to 4.5 hours." },
          { question: "What is the best way to travel locally in Dubai?", answer: "The Dubai Metro is highly efficient, clean, and connects major shopping malls, tourist spots, and airport terminals directly." }
        ]}
      />
    </LandingLayout>
  )
}
