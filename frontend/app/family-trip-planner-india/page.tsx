import type { Metadata } from 'next'
import LandingLayout from '@/components/layout/LandingLayout'
import SEOContent from '@/components/ui/SEOContent'

export const metadata: Metadata = {
  title: 'Family Trip Planner India | Best Family Holidays | TripSage',
  description: 'Plan the perfect family holiday in India. Discover family-friendly resorts, kid-friendly activities, and stress-free AI itineraries with TripSage.',
  keywords: ['family trip planner India', 'family holidays India', 'kid friendly vacations India', 'best family resorts India'],
  alternates: { canonical: 'https://tripsage.in/family-trip-planner-india' }
}

export default function Page() {
  return (
    <LandingLayout>
      <SEOContent
        title="Stress-Free Family Trip Planning for India"
        subtitle="Creating memories together shouldn't be a chore. Plan your next multi-generational family vacation with ease and joy."
        heroImage="https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=1920&q=90"
        content={
          <>
            <h2>Make Every Family Vacation Unforgettable</h2>
            <p>Planning for a family means balancing different ages, interests, and energy levels. TripSage AI takes the stress out of the equation by finding destinations that everyone will love.</p>
            <h3>Best Family Destinations in India</h3>
            <ul>
              <li><strong>Kerala:</strong> Relaxing backwater cruises and spice plantation tours that are great for all ages.</li>
              <li><strong>Jaipur:</strong> Majestic forts and interactive museums that fascinate children and adults alike.</li>
              <li><strong>Munnar:</strong> Beautiful tea gardens and wildlife parks for a nature-filled family escape.</li>
            </ul>
            <p>Use our family optimizer to find hotels with kids' clubs, spacious rooms, and central locations to minimize travel time.</p>
          </>
        }
        faqs={[
          { question: "How does TripSage help with family planning?", answer: "We prioritize 'Family-Friendly' filters and ensure itineraries include regular breaks and kid-friendly attractions." },
          { question: "Which is the best state for a family trip?", answer: "Kerala and Rajasthan are top choices due to their excellent infrastructure and variety of activities." },
          { question: "Can we plan for a large group of 10+ people?", answer: "Yes, our planner can handle large group sizes and help find villas or interconnected rooms." }
        ]}
      />
    </LandingLayout>
  )
}
