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
    title: `Budget Trip to ${formattedDestination} | Affordable Travel Guide`,
    description: `Plan a cheap and affordable budget trip to ${formattedDestination}. Discover low-cost hotels, cheap flights, and budget travel tips.`,
    slug: `/seo/budget-${destination}-trip`,
    keywords: [`budget trip ${formattedDestination}`, `cheap travel ${formattedDestination}`, `affordable vacations ${formattedDestination}`, `${formattedDestination} on a budget`],
  });
}

export default function Page({ params }: Props) {
  const destination = params?.destination || 'india';
  const formattedDestination = formatString(destination);

  return (
    <LandingLayout>
      <SEOContent
        title={`Budget Travel Guide to ${formattedDestination}`}
        subtitle={`Explore ${formattedDestination} without breaking the bank. Discover affordable stays, cheap eats, and free activities.`}
        content={
          <>
            <h2>Planning a Budget Trip to {formattedDestination}</h2>
            <p>You don't need a fortune to experience the beauty of {formattedDestination}. Our budget trip planner helps you maximize every dollar while ensuring an unforgettable vacation.</p>
            <h3>How to Save Money in {formattedDestination}</h3>
            <ul>
              <li><strong>Cheap Stays:</strong> Discover top-rated hostels and budget hotels in {formattedDestination}.</li>
              <li><strong>Affordable Dining:</strong> Find local street food and inexpensive restaurants.</li>
              <li><strong>Free Attractions:</strong> We highlight the best free things to do in {formattedDestination}.</li>
            </ul>
          </>
        }
        faqs={[
          { question: `Is ${formattedDestination} expensive to visit?`, answer: `It can be, but with careful planning, ${formattedDestination} can easily be done on a budget.` },
          { question: "Can I find cheap flights?", answer: "Yes, our planner helps you find the most affordable flight options." },
        ]}
      />
    </LandingLayout>
  )
}
