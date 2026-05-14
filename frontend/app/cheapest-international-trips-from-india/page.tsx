import type { Metadata } from 'next'
import LandingLayout from '@/components/layout/LandingLayout'
import SEOContent from '@/components/ui/SEOContent'

export const metadata: Metadata = {
  title: 'Cheapest International Trips from India | Budget Foreign Travel | TripSage',
  description: 'Explore the world without a huge budget. Discover the cheapest international trips from India, including Thailand, Vietnam, and Sri Lanka.',
  keywords: ['cheapest international trips from India', 'budget foreign trips', 'low cost foreign travel', 'cheap countries to visit from India'],
  alternates: { canonical: 'https://tripsage.in/cheapest-international-trips-from-india' }
}

export default function Page() {
  return (
    <LandingLayout>
      <SEOContent
        title="Cheapest International Destinations for Indians"
        subtitle="Think you can't afford a trip abroad? Think again! Explore these stunning countries where the Indian Rupee goes a long way."
        heroImage="https://images.unsplash.com/photo-1528127269322-539801943592?w=1920&q=90"
        content={
          <>
            <h2>Go Global on a Local Budget</h2>
            <p>International travel is more accessible than ever. Several neighboring countries offer incredible value, stunning landscapes, and rich cultures at prices comparable to a domestic trip.</p>
            <h3>Top Budget-Friendly Countries</h3>
            <ul>
              <li><strong>Vietnam:</strong> Famous for its street food, history, and the breathtaking Ha Long Bay. Very affordable once you're there.</li>
              <li><strong>Thailand:</strong> The classic choice for a reason. Great flights, amazing islands, and something for every budget.</li>
              <li><strong>Sri Lanka:</strong> Beautiful beaches, tea plantations, and ancient temples just a short flight away.</li>
            </ul>
            <p>Use our AI search to compare live flight prices across multiple countries to find the absolute cheapest deal for your dates.</p>
          </>
        }
        faqs={[
          { question: "Which is the cheapest country to visit from India?", answer: "Vietnam and Sri Lanka currently offer some of the best value for money in terms of daily expenses." },
          { question: "Do I need a lot of documents for these trips?", answer: "Many of these countries offer E-visas or Visa on Arrival for Indian passport holders, making it very easy to plan." },
          { question: "How can I find cheap flights?", answer: "Use our real-time engine to track price trends and book at least 4-6 weeks in advance." }
        ]}
      />
    </LandingLayout>
  )
}
