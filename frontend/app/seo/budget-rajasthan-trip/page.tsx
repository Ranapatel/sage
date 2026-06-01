import type { Metadata } from 'next'
import LandingLayout from '@/components/layout/LandingLayout'
import SEOContent from '@/components/ui/SEOContent'

export const metadata: Metadata = {
  title: 'Budget Rajasthan Trip Planner | Affordable Rajasthan Itinerary | TripSage',
  description: 'Explore royal Rajasthan on a budget. Learn how to visit Jaipur, Jodhpur, and Jaisalmer affordably with an AI-designed budget plan.',
  keywords: ['budget Rajasthan trip', 'cheap Rajasthan travel guide', 'affordable Rajasthan tour', 'TripSage Rajasthan budget'],
  alternates: { canonical: 'https://tripsage.in/seo/budget-rajasthan-trip' }
}

export default function Page() {
  return (
    <LandingLayout>
      <SEOContent
        title="Budget Rajasthan Trip Planner"
        subtitle="Uncover royal history, colossal forts, and desert sand dunes on a budget."
        heroImage="https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1920&q=90"
        ctaText="Generate AI Trip Plan"
        ctaLink="https://tripsage.in/plan"
        content={
          <>
            <h2>Discover Royal Rajasthan on a Budget</h2>
            <p>Experience the grand heritage and royal legacy of Rajasthan without the royal price tag using our Budget Rajasthan Trip Planner. From the terracotta-pink streets of Jaipur and the indigo-hued houses of Jodhpur to the golden sand dunes of Jaisalmer, Rajasthan offers an immersive cultural adventure that fits any budget. You can explore grand, historic forts and stunning palaces for very reasonable entry fees, and enjoy authentic, hearty Rajasthani thalis at local dhabas for just a few hundred rupees. Opting for affordable heritage guesthouses and utilizing the extensive Indian Railways network are fantastic ways to keep your expenses low. Whether you want to witness a breathtaking desert sunset, camp under the stars, or browse vibrant local bazaars for block-printed textiles, our AI-powered travel assistant crafts the perfect cost-effective itinerary to ensure an authentic and memorable journey.</p>
            
            <div className="my-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Estimated Budget</span>
                <span className="text-lg font-bold text-slate-800">₹14,000 - ₹20,000 per person</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Best Time to Visit</span>
                <span className="text-lg font-bold text-slate-800">October to March (Winter Season)</span>
              </div>
            </div>

            <h3>Smart Money-Saving Hacks for Rajasthan</h3>
            <ul>
              <li><strong>Heritage Haveli Hostels:</strong> Stay in converted historic homes offering hostel dorms starting at just ₹500/night.</li>
              <li><strong>Travel via Trains:</strong> Booking sleeper class or 3AC trains in advance is fast and saves on hotel stays for overnight routes.</li>
              <li><strong>Combined Ticket Packs:</strong> Buy combined entry tickets for major monuments in Jaipur to save on individual entries.</li>
            </ul>
          </>
        }
        faqs={[
          { question: "How to travel between Rajasthan cities cheaply?", answer: "The Indian Railways is the cheapest and most convenient mode. RSRTC government buses are also highly affordable for shorter distances." },
          { question: "Is a desert safari in Jaisalmer expensive?", answer: "No, a standard camel ride and sunset view in the Sam Sand Dunes with group cultural programs can be booked for as low as ₹1,500 per person." },
          { question: "Is 10 days enough for Rajasthan on a budget?", answer: "Yes! Ten days is ideal to cover the core cities of Jaipur, Jodhpur, Jaisalmer, and Udaipur without feeling rushed." }
        ]}
      />
    </LandingLayout>
  )
}
