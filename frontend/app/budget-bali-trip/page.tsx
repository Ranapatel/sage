import type { Metadata } from 'next'
import LandingLayout from '@/components/layout/LandingLayout'
import SEOContent from '@/components/ui/SEOContent'

export const metadata: Metadata = {
  title: 'Budget Bali Trip Guide | Affordable Bali Itinerary | TripSage',
  description: 'Plan an affordable Bali trip from India. Discover the best time to visit, cheap flights, and budget stays in Ubud, Kuta, and Uluwatu.',
  keywords: ['budget Bali trip', 'Bali trip from India cost', 'affordable Bali itinerary', 'Bali travel guide'],
  alternates: { canonical: 'https://tripsage.in/budget-bali-trip' }
}

export default function Page() {
  return (
    <LandingLayout>
      <SEOContent
        title="Ultimate Budget Bali Trip Guide for Indians"
        subtitle="Dreaming of Bali? Learn how to plan an exotic international vacation on a budget. Beaches, temples, and rice terraces await!"
        heroImage="https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1920&q=90"
        content={
          <>
            <h2>Why Bali is the Perfect Budget International Destination</h2>
            <p>Bali offers a unique blend of luxury and affordability. For Indian travelers, the favorable exchange rate and easy visa process make it a top choice for a first international trip.</p>
            <h3>Money-Saving Hacks for Bali</h3>
            <ul>
              <li><strong>Fly from Big Hubs:</strong> Look for flights from Chennai or Kochi for the cheapest rates to Denpasar.</li>
              <li><strong>Stay in Homestays:</strong> Bali's guesthouses (homestays) are beautiful, clean, and often cost less than ₹1,500 per night.</li>
              <li><strong>Eat at Warungs:</strong> Local Indonesian eateries (warungs) serve delicious Nasi Goreng for just a few dollars.</li>
            </ul>
            <p>Our AI can help you calculate the exact cost of your Bali trip, including currency conversion and live flight prices.</p>
          </>
        }
        faqs={[
          { question: "Is Bali visa-free for Indians?", answer: "Currently, Indians can get a Visa on Arrival (VoA) for approximately IDR 500,000 (about ₹2,700)." },
          { question: "What is the best month for a budget trip?", answer: "October and November (shoulder season) offer great weather and lower prices than the peak summer months." },
          { question: "How much does a 5-day Bali trip cost?", answer: "Excluding flights, a budget trip can be done for ₹25,000 - ₹35,000 per person." }
        ]}
      />
    </LandingLayout>
  )
}
