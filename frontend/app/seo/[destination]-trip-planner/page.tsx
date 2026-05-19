import type { Metadata } from 'next'
import LandingLayout from '@/components/layout/LandingLayout'
import SEOContent from '@/components/ui/SEOContent'
import { generateMetadata as generateSEOMetadata } from '@/config/seo'

type Props = {
  params: { destination: string }
}

function formatString(str: string) {
  return str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const destination = params?.destination || 'india';
  const formattedDestination = formatString(destination);
  
  return generateSEOMetadata({
    title: `${formattedDestination} Trip Planner & Itinerary Builder`,
    description: `Plan your perfect trip to ${formattedDestination} with our AI trip planner. Get a customized itinerary, best places to visit, and travel tips.`,
    slug: `/seo/${destination}-trip-planner`,
    keywords: [`${formattedDestination} trip planner`, `plan trip ${formattedDestination}`, `${formattedDestination} travel itinerary`, `${formattedDestination} vacation`],
  });
}

export default function Page({ params }: Props) {
  const destination = params?.destination || 'india';
  const formattedDestination = formatString(destination);

  return (
    <LandingLayout>
      <SEOContent
        title={`The Smartest Trip Planner for ${formattedDestination}`}
        subtitle={`Experience the best of ${formattedDestination}. Our AI creates personalized itineraries for your next adventure in seconds.`}
        content={
          <>
            <h2>Why Use an AI Trip Planner for {formattedDestination}?</h2>
            <p>Planning a trip to {formattedDestination} can be overwhelming with so many places to see and things to do. TripSage uses advanced AI to analyze your preferences and build the perfect {formattedDestination} journey.</p>
            <h3>Smart Features for Your Trip</h3>
            <ul>
              <li><strong>Real-time Logistics:</strong> We find the best travel routes for your {formattedDestination} vacation.</li>
              <li><strong>Personalized Itineraries:</strong> Tailored completely to what you love to do.</li>
              <li><strong>Budget Optimization:</strong> Find the best value for your money.</li>
            </ul>
          </>
        }
        faqs={[
          { question: "Is this planner free?", answer: "Yes, you can generate basic itineraries for free." },
          { question: `Can it plan a multi-day trip to ${formattedDestination}?`, answer: "Absolutely! Our AI can handle trips of any length." },
        ]}
      />
    </LandingLayout>
  )
}
