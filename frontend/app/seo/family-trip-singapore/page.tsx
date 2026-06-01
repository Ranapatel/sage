import type { Metadata } from 'next'
import LandingLayout from '@/components/layout/LandingLayout'
import SEOContent from '@/components/ui/SEOContent'

export const metadata: Metadata = {
  title: 'Family Trip to Singapore | Ultimate Singapore Family Guide | TripSage',
  description: 'Plan the perfect family vacation to Singapore. Find kid-friendly hotels, top theme parks, family discounts, and an AI-generated itinerary.',
  keywords: ['family trip Singapore', 'Singapore family package', 'kid friendly Singapore itinerary', 'TripSage Singapore family'],
  alternates: { canonical: 'https://tripsage.in/seo/family-trip-singapore' }
}

export default function Page() {
  return (
    <LandingLayout>
      <SEOContent
        title="Family Trip to Singapore Planner"
        subtitle="Embark on the ultimate multi-generational holiday to the safest city in the world."
        heroImage="https://images.unsplash.com/photo-1565967511849-76a60a516170?w=1920&q=90"
        ctaText="Generate AI Trip Plan"
        ctaLink="https://tripsage.in/plan"
        content={
          <>
            <h2>Create Lasting Memories with Your Family in Singapore</h2>
            <p>Create lifelong memories with our Family Trip to Singapore Planner, the ultimate guide to organizing a fun-filled, multi-generational vacation. Singapore is widely regarded as one of the world's most family-friendly destinations, boasting safe, spotless streets, highly accessible public transit, and a treasure trove of interactive attractions. Kids and adults alike will be wowed by the movie magic of Universal Studios Singapore on Sentosa Island, the mesmerizing nocturnal creatures at the Night Safari, and the futuristic supertrees at Gardens by the Bay. Choose spacious, family-oriented hotels with fantastic swimming pools, and sample a huge variety of foods at clean, modern hawker centers. Our advanced AI trip planner helps you balance high-energy theme park days with relaxing park walks, suggests restaurants that cater to children, and organizes a smooth, stress-free schedule that keeps the entire family happy.</p>
            
            <div className="my-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Estimated Budget</span>
                <span className="text-lg font-bold text-slate-800">₹1,50,000 - ₹2,20,000 for family of 4</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Best Time to Visit</span>
                <span className="text-lg font-bold text-slate-800">Year-round (Festive season Nov-Jan is excellent)</span>
              </div>
            </div>

            <h3>Top Kid-Friendly Spots in Singapore</h3>
            <ul>
              <li><strong>Universal Studios Singapore:</strong> Explore immersive zones, roller coasters, and meet favorite characters.</li>
              <li><strong>Singapore Zoo & River Wonders:</strong> See giant pandas and explore lush wildlife habitats.</li>
              <li><strong>Science Centre Singapore:</strong> Engage in dozens of hands-on exhibits, mirror mazes, and planetarium shows.</li>
            </ul>
          </>
        }
        faqs={[
          { question: "Is Singapore easy to navigate with toddlers and seniors?", answer: "Extremely easy! Elevators, ramps, and escalator pathways are present everywhere. Public transit trains (MRT) and buses are completely stroller and wheelchair-accessible." },
          { question: "How to save money on attractions for a family?", answer: "Buying combo tickets or booking multi-attraction passes online via platforms like Klook offers significant family discounts." },
          { question: "Are hawker centers safe and clean for children?", answer: "Yes, Singapore's National Environment Agency strictly grades hawker stalls for hygiene. Fresh, hot food is safe, nutritious, and very cheap." }
        ]}
      />
    </LandingLayout>
  )
}
