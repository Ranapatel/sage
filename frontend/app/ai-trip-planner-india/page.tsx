import type { Metadata } from 'next'
import LandingLayout from '@/components/layout/LandingLayout'
import SEOContent from '@/components/ui/SEOContent'

export const metadata: Metadata = {
  title: 'AI Trip Planner for Indian Travellers | TripSage',
  description: 'AI trip planner for Indian travellers. Build a day-by-day India itinerary, then open the main TripSage planner.',
  keywords: ['AI trip planner India', 'automated itinerary India', 'plan trip India AI', 'India travel guide'],
  alternates: { canonical: 'https://www.tripsage.in/ai-trip-planner-india' }
}

export default function Page() {
  return (
    <LandingLayout>
      <SEOContent
        title="The Smartest AI Trip Planner for India"
        subtitle="A day-by-day draft for one departure city and one destination in India. It is not a multi-city route, and it does not adjust for the season."
        content={
          <>
            <h2>Why Use an AI Trip Planner for India?</h2>
            <p>India is a vast and diverse country with countless destinations, cultures, and experiences. Planning a trip here can be overwhelming. TripSage uses advanced artificial intelligence to analyze your preferences, budget, and travel style to craft the perfect journey.</p>
            <h3>Smart Features for Indian Travelers</h3>
            <ul>
              <li><strong>One route:</strong> The draft covers one departure city and one destination, with a rupee estimate. It does not check live flights or trains.</li>
              <li><strong>Not season-aware:</strong> The draft does not change for a Goa monsoon or a Manali winter. Check the season yourself.</li>
              <li><strong>Budget Optimization:</strong> Find the best value for your money, whether you're looking for luxury palaces in Rajasthan or budget stays in Rishikesh.</li>
            </ul>
            <p>Ready to explore India like never before? Our AI engine is trained on millions of travel data points to ensure you get the most efficient and enjoyable route possible.</p>
          </>
        }
        faqs={[
          { question: "Is TripSage's AI planner free?", answer: "Yes. TripSage is free to use." },
          { question: "Can it plan for specific Indian states?", answer: "Absolutely! Our AI covers all 28 states and 8 union territories, providing detailed plans for any city or region." },
          { question: "Does it include budget options?", answer: "Yes, you can specify your budget during the planning phase, and the AI will prioritize options that fit your financial range." }
        ]}
      />
    </LandingLayout>
  )
}
