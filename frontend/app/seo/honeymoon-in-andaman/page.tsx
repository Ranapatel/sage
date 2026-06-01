import type { Metadata } from 'next'
import LandingLayout from '@/components/layout/LandingLayout'
import SEOContent from '@/components/ui/SEOContent'

export const metadata: Metadata = {
  title: 'Andaman Honeymoon Planner | Best Andaman Itinerary | TripSage',
  description: 'Plan your dream honeymoon in Andaman. Explore romantic resorts in Havelock, pristine beaches, scuba diving, and get a custom AI plan.',
  keywords: ['honeymoon in Andaman', 'Andaman honeymoon package', 'romantic Andaman trip', 'TripSage Andaman honeymoon'],
  alternates: { canonical: 'https://tripsage.in/seo/honeymoon-in-andaman' }
}

export default function Page() {
  return (
    <LandingLayout>
      <SEOContent
        title="Romantic Andaman Honeymoon Planner"
        subtitle="Unveil the secluded white-sand beaches and turquoise tropical waters of the Bay of Bengal."
        heroImage="https://images.unsplash.com/photo-1589979482837-e74f2e145060?w=1920&q=90"
        ctaText="Generate AI Trip Plan"
        ctaLink="https://tripsage.in/plan"
        content={
          <>
            <h2>Begin Your Married Life in a Tropical Paradise</h2>
            <p>Escape to a tropical paradise with our Romantic Andaman Honeymoon Planner, designed to help you organize a dreamy post-wedding vacation. The Andaman and Nicobar Islands offer an exquisite blend of secluded white-sand beaches, emerald-green waters, and lush tropical forests. Walk hand-in-and along Havelock Island’s world-famous Radhanagar Beach, watch spectacular sunsets over the ocean, and explore the vibrant coral reefs together through snorkeling or scuba diving. Andaman's luxury beachfront resorts provide the perfect setting for romance, offering private candlelit dinners right on the sand and soothing couples' spa treatments. From exploring the historic ruins of Ross Island to witnessing the unique bioluminescence at Havelock, Andaman is a magical destination for couples. Our advanced AI trip planner helps you design a seamless island-hopping schedule, booking ferry transfers and premium stays for an effortless tropical honeymoon.</p>
            
            <div className="my-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Estimated Budget</span>
                <span className="text-lg font-bold text-slate-800">₹45,000 - ₹70,000 per couple</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Best Time to Visit</span>
                <span className="text-lg font-bold text-slate-800">October to May (Sunny Skies & Calm Seas)</span>
              </div>
            </div>

            <h3>Romantic Activities in Andaman</h3>
            <ul>
              <li><strong>Radhanagar Beach Sunset:</strong> Stroll on soft white sand voted among the best beaches in Asia.</li>
              <li><strong>Candlelit Dinner by the Beach:</strong> Enjoy freshly caught seafood under a canopy of stars.</li>
              <li><strong>Scuba Diving at Havelock:</strong> Explore rich marine life and bright coral gardens hand-in-hand.</li>
            </ul>
          </>
        }
        faqs={[
          { question: "Which islands should we include in our honeymoon itinerary?", answer: "Havelock Island (Swaraj Dweep) and Neil Island (Shaheed Dweep) are the absolute best for couples seeking romance, peace, and natural beauty." },
          { question: "How to travel between islands in Andaman?", answer: "Private high-speed cruise ferries like Nautika or Makruzz are fast, comfortable, and the most popular way to hop between Port Blair, Havelock, and Neil." },
          { question: "How many days are recommended for an Andaman honeymoon?", answer: "A 5 to 6-day trip is ideal, allowing you 1 day in Port Blair, 3 days in Havelock, and 1 day in Neil Island." }
        ]}
      />
    </LandingLayout>
  )
}
