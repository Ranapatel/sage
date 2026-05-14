import type { Metadata } from 'next'
import LandingLayout from '@/components/layout/LandingLayout'
import SEOContent from '@/components/ui/SEOContent'

export const metadata: Metadata = {
  title: 'AI Trip Planner India | Free Personalized Itineraries | TripSage',
  description: 'Plan your perfect Indian holiday with TripSage, the best AI trip planner for India. Get personalized itineraries for North, South, East, and West India instantly.',
  keywords: ['AI trip planner India', 'automated itinerary India', 'plan trip India AI', 'India travel guide'],
  alternates: { canonical: 'https://tripsage.in/ai-trip-planner-india' }
}

export default function Page() {
  return (
    <LandingLayout>
      <SEOContent
        title="The Smartest AI Trip Planner for India"
        subtitle="Experience the future of travel planning. From the Himalayas to the backwaters of Kerala, our AI creates personalized itineraries in seconds."
        content={
          <>
            <h2>Why Use an AI Trip Planner for India?</h2>
            <p>India is a vast and diverse country with countless destinations, cultures, and experiences. Planning a trip here can be overwhelming. TripSage uses advanced artificial intelligence to analyze your preferences, budget, and travel style to craft the perfect journey.</p>
            <h3>Smart Features for Indian Travelers</h3>
            <ul>
              <li><strong>Real-time Logistics:</strong> We check live flight and train availability across India.</li>
              <li><strong>Hyper-Local Insights:</strong> Our AI understands seasonal weather patterns, from monsoons in Goa to winters in Manali.</li>
              <li><strong>Budget Optimization:</strong> Find the best value for your money, whether you're looking for luxury palaces in Rajasthan or budget stays in Rishikesh.</li>
            </ul>
            <p>Ready to explore India like never before? Our AI engine is trained on millions of travel data points to ensure you get the most efficient and enjoyable route possible.</p>
          </>
        }
        faqs={[
          { question: "Is TripSage's AI planner free?", answer: "Yes, you can generate basic itineraries and search for real-time travel options for free." },
          { question: "Can it plan for specific Indian states?", answer: "Absolutely! Our AI covers all 28 states and 8 union territories, providing detailed plans for any city or region." },
          { question: "Does it include budget options?", answer: "Yes, you can specify your budget during the planning phase, and the AI will prioritize options that fit your financial range." }
        ]}
      />
    </LandingLayout>
  )
}
