import type { Metadata } from 'next'
import LandingLayout from '@/components/layout/LandingLayout'
import SEOContent from '@/components/ui/SEOContent'

export const metadata: Metadata = {
  title: 'Goa Trip Under 10000 | Budget Goa Itinerary & Guide | TripSage',
  description: 'Plan a full Goa trip under ₹10,000. Discover budget-friendly beaches, cheap stays, and affordable ways to explore Goa with TripSage AI.',
  keywords: ['Goa trip under 10000', 'budget Goa trip', 'cheap Goa travel guide', 'Goa on a budget'],
  alternates: { canonical: 'https://tripsage.in/goa-trip-under-10000' }
}

export default function Page() {
  return (
    <LandingLayout>
      <SEOContent
        title="How to Plan a Goa Trip Under ₹10,000"
        subtitle="Yes, it's possible! From North Goa's party hubs to South Goa's serene beaches, discover how to experience the best of Goa without breaking the bank."
        heroImage="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1920&q=90"
        content={
          <>
            <h2>The Ultimate Budget Guide to Goa</h2>
            <p>Goa is India's favorite holiday destination, but it doesn't have to be expensive. With smart planning and our AI tools, you can enjoy a 3-4 day trip for less than ₹10,000 per person.</p>
            <h3>Top Budget Tips for Goa</h3>
            <ul>
              <li><strong>Off-Season Travel:</strong> Visit between May and September for the lowest accommodation prices.</li>
              <li><strong>Rent a Scooter:</strong> Avoid expensive taxis; rent a bike for ₹300-500 a day to explore freely.</li>
              <li><strong>Eat Local:</strong> Skip the expensive beach shacks for lunch and try local Goan thalis at small eateries.</li>
            </ul>
            <p>Our AI planner can help you find hostels in Anjuna or budget guesthouses in Palolem that offer great value. Start your budget adventure today!</p>
          </>
        }
        faqs={[
          { question: "Does the ₹10,000 include flights?", answer: "This budget typically covers stay, local transport, food, and sightseeing for 3 days. Flights depend on your origin, but booking 2 months in advance helps!" },
          { question: "Which part of Goa is cheaper?", answer: "North Goa usually has more budget hostel options (Anjuna, Vagator), while South Goa has affordable guesthouses if you look away from the main beach front." },
          { question: "What is the best time for a budget trip?", answer: "The monsoon season (June to August) offers the deepest discounts on luxury stays, making them very affordable." }
        ]}
      />
    </LandingLayout>
  )
}
