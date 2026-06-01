import type { Metadata } from 'next'
import LandingLayout from '@/components/layout/LandingLayout'
import SEOContent from '@/components/ui/SEOContent'

export const metadata: Metadata = {
  title: 'Budget Kerala Trip Planner | Cheap Kerala Itinerary | TripSage',
  description: 'Plan an affordable trip to Kerala. Discover budget houseboats, cheap homestays in Munnar, free attractions, and get an AI Kerala travel guide.',
  keywords: ['budget Kerala trip', 'cheap Kerala tour package', 'Kerala budget travel guide', 'TripSage Kerala budget'],
  alternates: { canonical: 'https://tripsage.in/seo/budget-kerala-trip' }
}

export default function Page() {
  return (
    <LandingLayout>
      <SEOContent
        title="Budget Kerala Trip Planner"
        subtitle="Experience God's Own Country without overspending on luxury resorts."
        heroImage="https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=1920&q=90"
        ctaText="Generate AI Trip Plan"
        ctaLink="https://tripsage.in/plan"
        content={
          <>
            <h2>Explore God's Own Country on a Budget</h2>
            <p>Explore the lush landscapes of 'God’s Own Country' without overspending using our comprehensive Budget Kerala Trip Guide. Known for its tranquil backwaters, mist-shrouded tea plantations, and golden sandy beaches, Kerala is an incredible destination that can easily be enjoyed on a modest budget. You can save significantly by booking cozy local homestays instead of luxury resorts, eating delicious traditional Kerala meals at local eateries, and traveling via public buses or train networks. Cruise through the peaceful waters of Alleppey by opting for budget-friendly canoe tours or shared houseboats, and visit Munnar’s stunning viewpoints for free. From historical walks in Fort Kochi to sunset viewing in Kovalam, Kerala offers pocket-friendly magic around every corner. Our intelligent AI planner helps you map out an efficient, affordable route that minimizes transport costs while ensuring you experience all the essential sights.</p>
            
            <div className="my-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Estimated Budget</span>
                <span className="text-lg font-bold text-slate-800">₹12,000 - ₹18,000 per person</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Best Time to Visit</span>
                <span className="text-lg font-bold text-slate-800">September to March (Pleasant Weather)</span>
              </div>
            </div>

            <h3>Budget Tips for Traveling in Kerala</h3>
            <ul>
              <li><strong>Local Homestays:</strong> Stay with welcoming local hosts for ₹1,000 to ₹1,500 per night.</li>
              <li><strong>Shared Canoe & Ferry:</strong> Opt for public KSWTD ferries in Alleppey instead of hiring private houseboats.</li>
              <li><strong>Try Local Food:</strong> Enjoy authentic Kerala Sadhya on a banana leaf at pocket-friendly prices.</li>
            </ul>
          </>
        }
        faqs={[
          { question: "Is a shared houseboat cheaper in Alleppey?", answer: "Yes! A private houseboat starts at ₹7,000+ per night, but you can book a shared boat cabin or a daytime public ferry for only a few hundred rupees." },
          { question: "Which is the cheapest month to visit Kerala?", answer: "The monsoon season (June to August) offers massive discounts on accommodations and tours, making it the cheapest time to explore." },
          { question: "How to travel within Kerala cheaply?", answer: "The Indian Railways network and state-run KSRTC buses are incredibly cheap and connect Cochin, Munnar, Alleppey, and Trivandrum seamlessly." }
        ]}
      />
    </LandingLayout>
  )
}
