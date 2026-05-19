import type { Metadata } from 'next'
import LandingLayout from '@/components/layout/LandingLayout'
import SEOContent from '@/components/ui/SEOContent'
import { generateMetadata as generateSEOMetadata } from '@/config/seo'

type Props = {
  params: { category: string }
}

function formatString(str: string) {
  return str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = params?.category || 'travel';
  const formattedCategory = formatString(category);
  
  return generateSEOMetadata({
    title: `${formattedCategory} Travel Guide & Trip Planner`,
    description: `Explore the ultimate ${formattedCategory} travel guide. Find the best destinations, tips, and itineraries for your next ${formattedCategory} vacation.`,
    slug: `/seo/${category}-travel-guide`,
    keywords: [`${formattedCategory} travel`, `${formattedCategory} trip planner`, `${formattedCategory} vacation`, `best ${formattedCategory} trips`],
  });
}

export default function Page({ params }: Props) {
  const category = params?.category || 'travel';
  const formattedCategory = formatString(category);

  return (
    <LandingLayout>
      <SEOContent
        title={`The Ultimate ${formattedCategory} Travel Guide`}
        subtitle={`Everything you need to know for your next ${formattedCategory} trip. From top destinations to expert advice.`}
        content={
          <>
            <h2>Why Choose a {formattedCategory} Vacation?</h2>
            <p>Whether you're looking for relaxation or adventure, our {formattedCategory} travel guide provides comprehensive details on the best spots, hidden gems, and must-know travel tips.</p>
            <h3>Top {formattedCategory} Tips</h3>
            <ul>
              <li><strong>Expert Itineraries:</strong> Pre-planned routes for the ultimate {formattedCategory} experience.</li>
              <li><strong>Curated Recommendations:</strong> Handpicked places to stay and dine.</li>
              <li><strong>Travel Hacks:</strong> Insider tips to make your {formattedCategory} trip seamless.</li>
            </ul>
          </>
        }
        faqs={[
          { question: `What are the best destinations for ${formattedCategory} trips?`, answer: "We feature a wide range of top-rated destinations perfect for this travel style." },
          { question: "How far in advance should I book?", answer: "It's always recommended to book flights and hotels at least a few months in advance." },
        ]}
      />
    </LandingLayout>
  )
}
