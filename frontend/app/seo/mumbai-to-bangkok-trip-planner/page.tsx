import type { Metadata } from 'next'
import LandingLayout from '@/components/layout/LandingLayout'
import SEOContent from '@/components/ui/SEOContent'

export const metadata: Metadata = {
  title: 'Mumbai to Bangkok Trip Planner | Perfect Bangkok Itinerary | TripSage',
  description: 'Plan your perfect trip from Mumbai to Bangkok. Get the best travel routes, budget breakdown, top attractions, and an AI-powered Bangkok itinerary.',
  keywords: ['Mumbai to Bangkok trip planner', 'Bangkok itinerary AI', 'best time to visit Bangkok', 'Bangkok travel guide', 'TripSage Bangkok'],
  alternates: { canonical: 'https://tripsage.in/seo/mumbai-to-bangkok-trip-planner' }
}

export default function Page() {
  return (
    <LandingLayout>
      <SEOContent
        title="Mumbai to Bangkok Trip Planner"
        subtitle="Embark on an exciting journey from India's commercial hub to the high-energy streets of Thailand's capital."
        heroImage="https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1920&q=90"
        ctaText="Generate AI Trip Plan"
        ctaLink="https://tripsage.in/plan"
        content={
          <>
            <h2>Discover the Magic of Bangkok from Mumbai</h2>
            <p>Planning a trip from Mumbai to Bangkok is an exciting venture that connects India’s bustling commercial hub with the vibrant, energy-filled streets of Thailand’s capital. Bangkok is a fascinating mix of ancient temples, colossal modern shopping malls, and mouth-watering street food that caters to every kind of traveler. Whether you want to witness the grandeur of the Grand Palace, shop until you drop at Chatuchak Weekend Market, or enjoy a scenic dinner cruise along the Chao Phraya River, Bangkok promises an unforgettable experience. A direct flight from Mumbai takes just about four hours, making it an incredibly convenient destination for both long weekend getaways and extended vacations. Our AI-powered travel planner is designed to customize your ideal Bangkok itinerary from Mumbai, taking into account flight options, budget accommodations, and tailored sightseeing options to create the perfect tropical escape.</p>
            
            <div className="my-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Estimated Budget</span>
                <span className="text-lg font-bold text-slate-800">₹35,000 - ₹50,000 per person</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Best Time to Visit</span>
                <span className="text-lg font-bold text-slate-800">November to February (Cool & Dry)</span>
              </div>
            </div>

            <h3>Must-See Attractions in Bangkok</h3>
            <ul>
              <li><strong>The Grand Palace & Wat Phra Kaew:</strong> The spectacular home of the kings of Siam and the sacred Emerald Buddha.</li>
              <li><strong>Wat Arun (Temple of Dawn):</strong> A majestic riverside temple adorned with colorful porcelain designs.</li>
              <li><strong>Shopping Hubs:</strong> Explore high-end fashion at Siam Paragon or experience local bargaining at MBK Center and Chatuchak.</li>
            </ul>
          </>
        }
        faqs={[
          { question: "Is a visa required for Indians traveling to Bangkok?", answer: "Yes, but Thailand frequently offers Visa-on-Arrival or visa-exempt schemes for Indian citizens. Be sure to check the current travel advisories before flying." },
          { question: "How long is the flight from Mumbai to Bangkok?", answer: "Direct flights from Chhatrapati Shivaji Maharaj International Airport (BOM) to Bangkok (BKK or DMK) take approximately 4 hours and 15 minutes." },
          { question: "How many days are recommended for a Bangkok trip?", answer: "A 3 to 4-day trip is ideal for experiencing the major temples, shopping markets, and local street food scenes of Bangkok." }
        ]}
      />
    </LandingLayout>
  )
}
