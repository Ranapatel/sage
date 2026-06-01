import type { Metadata } from 'next'
import LandingLayout from '@/components/layout/LandingLayout'
import SEOContent from '@/components/ui/SEOContent'

export const metadata: Metadata = {
  title: 'Best Places to Visit in December in India | Winter Travel | TripSage',
  description: 'Discover the top destinations to visit in India during December. From snowy mountains to sunny beaches, plan your winter getaway with TripSage AI.',
  keywords: ['best places December India', 'places to visit in December', 'winter holiday India', 'TripSage winter travel'],
  alternates: { canonical: 'https://tripsage.in/seo/best-places-december-india' }
}

export default function Page() {
  return (
    <LandingLayout>
      <SEOContent
        title="Best Places to Visit in December in India"
        subtitle="Discover snowy peaks, vibrant desert festivals, and warm sunny beaches in peak winter."
        heroImage="https://images.unsplash.com/photo-1548574505-5e239809ee19?w=1920&q=90"
        ctaText="Generate AI Trip Plan"
        ctaLink="https://tripsage.in/plan"
        content={
          <>
            <h2>Top Winter Getaways in India for December</h2>
            <p>Discover the best places to visit in December in India and plan the ultimate winter escape with our expert guide. December is a spectacular month for travel in India, as the weather is wonderfully pleasant across the country, offering diverse options for every traveler. You can head north to experience snowy wonderlands and winter sports in places like Auli and Gulmarg, or travel south to bask in the warm sunshine on the tropical beaches of Goa, Gokarna, and Kerala. It is also the absolute perfect time to explore the vast, golden deserts of Jaisalmer and catch the vibrant Rann Utsav festival in Gujarat. Whether you want to enjoy a chilly mountain retreat or dynamic coastal celebrations, our AI-powered travel planner helps you explore top-rated winter destinations, compares seasonal travel rates, and creates a tailored holiday itinerary that makes your December vacation extraordinary.</p>
            
            <div className="my-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Estimated Budget</span>
                <span className="text-lg font-bold text-slate-800">₹15,000 - ₹30,000 per person</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Best Time to Visit</span>
                <span className="text-lg font-bold text-slate-800">December (Peak winter holiday & festive season)</span>
              </div>
            </div>

            <h3>Top Winter Destinations</h3>
            <ul>
              <li><strong>Goa:</strong> Experience dynamic beach parties, electronic music festivals, and pleasant sunny weather.</li>
              <li><strong>Gulmarg, Kashmir:</strong> The absolute dream choice for winter snow lovers and skiers.</li>
              <li><strong>Jaisalmer, Rajasthan:</strong> Enjoy camel safaris and clear starry nights in the Thar Desert.</li>
              <li><strong>Auli, Uttarakhand:</strong> A pristine Himalayan ski resort featuring panoramic views of Nanda Devi.</li>
            </ul>
          </>
        }
        faqs={[
          { question: "Is December expensive for traveling in India?", answer: "Yes, December is peak holiday season, especially around Christmas and New Year. Booking flights and accommodations 2-3 months in advance is highly recommended." },
          { question: "Where is the best place to see snow in December in India?", answer: "Gulmarg in Kashmir, Manali in Himachal Pradesh, and Auli in Uttarakhand are highly reliable for winter snowfall in late December." },
          { question: "Are coastal areas hot in December?", answer: "No, southern coastal areas like Kerala, Goa, and Gokarna experience extremely comfortable, breezy, and warm daytime weather, perfect for beach getaways." }
        ]}
      />
    </LandingLayout>
  )
}
