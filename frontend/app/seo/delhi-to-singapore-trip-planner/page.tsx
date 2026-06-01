import type { Metadata } from 'next'
import LandingLayout from '@/components/layout/LandingLayout'
import SEOContent from '@/components/ui/SEOContent'

export const metadata: Metadata = {
  title: 'Delhi to Singapore Trip Planner | Complete Singapore Itinerary | TripSage',
  description: 'Plan the ultimate Delhi to Singapore trip. Find direct flights, entry requirements, budget advice, and a custom AI-designed Singapore itinerary.',
  keywords: ['Delhi to Singapore trip planner', 'Singapore itinerary AI', 'best time to visit Singapore', 'Singapore travel guide', 'TripSage Singapore'],
  alternates: { canonical: 'https://tripsage.in/seo/delhi-to-singapore-trip-planner' }
}

export default function Page() {
  return (
    <LandingLayout>
      <SEOContent
        title="Delhi to Singapore Trip Planner"
        subtitle="Embark on an incredible journey to the futuristic garden city of Southeast Asia."
        heroImage="https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1920&q=90"
        ctaText="Generate AI Trip Plan"
        ctaLink="https://tripsage.in/plan"
        content={
          <>
            <h2>Embark on a Delhi to Singapore Adventure</h2>
            <p>Embark on an incredible journey from Delhi to Singapore, the stunning garden city of Southeast Asia that perfectly blends futuristic architecture, lush green spaces, and diverse cultures. Singapore offers a world-class travel experience, featuring iconic highlights like the spectacular Gardens by the Bay, the vibrant Sentosa Island, and the historic streets of Chinatown and Little India. From Delhi, several direct flights connect you to Changi Airport in less than six hours, making this world-renowned city extremely accessible for families, solo travelers, and couples. Beyond the skyscrapers, Singapore boasts a legendary food scene, ranging from affordable Michelin-starred hawker centers to high-end rooftop dining. Our advanced AI trip planner helps you organize every detail of your travel from Delhi to Singapore, from visa guidelines and hotel suggestions near major transit lines to a highly structured daily itinerary so you can make the absolute most of your visit.</p>
            
            <div className="my-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Estimated Budget</span>
                <span className="text-lg font-bold text-slate-800">₹60,000 - ₹85,000 per person</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Best Time to Visit</span>
                <span className="text-lg font-bold text-slate-800">December to June (Dry Season)</span>
              </div>
            </div>

            <h3>Top Family-Friendly Places in Singapore</h3>
            <ul>
              <li><strong>Gardens by the Bay:</strong> Walk through the iconic Supertree Grove and the giant greenhouse domes.</li>
              <li><strong>Sentosa Island:</strong> Home to Universal Studios Singapore, S.E.A. Aquarium, and pristine beaches.</li>
              <li><strong>Marina Bay Sands:</strong> Enjoy spectacular skyline views from the Sands SkyPark Observation Deck.</li>
            </ul>
          </>
        }
        faqs={[
          { question: "Do Indian citizens need a visa for Singapore?", answer: "Yes, Indian passport holders need to apply for a tourist visa before entering Singapore. This is usually processed online via registered agents." },
          { question: "How long is the direct flight from Delhi to Singapore?", answer: "Direct flights from Indira Gandhi International Airport (DEL) to Singapore Changi Airport (SIN) take approximately 5 hours and 45 minutes." },
          { question: "Can Singapore be explored on a budget?", answer: "Yes! Utilizing Singapore's highly efficient MRT train system and eating delicious meals at local hawker centers are great ways to save money." }
        ]}
      />
    </LandingLayout>
  )
}
