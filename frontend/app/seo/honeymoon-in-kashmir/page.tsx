import type { Metadata } from 'next'
import LandingLayout from '@/components/layout/LandingLayout'
import SEOContent from '@/components/ui/SEOContent'

export const metadata: Metadata = {
  title: 'Kashmir Honeymoon Planner | Romantic Kashmir Itinerary | TripSage',
  description: 'Plan a romantic honeymoon in Kashmir. Discover cozy houseboats in Srinagar, snow-filled Gulmarg, scenic Pahalgam, and get a custom AI itinerary.',
  keywords: ['honeymoon in Kashmir', 'Kashmir honeymoon package', 'romantic Kashmir trip', 'TripSage Kashmir honeymoon'],
  alternates: { canonical: 'https://tripsage.in/seo/honeymoon-in-kashmir' }
}

export default function Page() {
  return (
    <LandingLayout>
      <SEOContent
        title="Romantic Kashmir Honeymoon Planner"
        subtitle="Embark on a dreamlike romantic getaway to the paradise of the Himalayas."
        heroImage="https://images.unsplash.com/photo-1616036740257-9449ea1f6605?w=1920&q=90"
        ctaText="Generate AI Trip Plan"
        ctaLink="https://tripsage.in/plan"
        content={
          <>
            <h2>Begin Your Forever in Heaven on Earth</h2>
            <p>Celebrate your new beginning with a romantic honeymoon in Kashmir, widely described as heaven on earth. Kashmir is the ultimate romantic destination, offering a dreamlike landscape of snow-dusted mountains, crystal-clear lakes, and valleys carpeted with vibrant wildflowers. Spend quiet, magical evenings staying in a traditional hand-carved wooden houseboat on Srinagar's serene Dal Lake, enjoying peaceful Shikara rides as the sun dips below the horizon. Explore the gorgeous, pine-fringed meadows of Pahalgam and ride the famous high-altitude Gondola in Gulmarg to experience snow-covered peaks. Whether you want to walk hand-in-hand through historic Mughal Gardens or cozy up by a warm fireplace in a mountain chalet, Kashmir sets a beautifully poetic stage for love. Let our AI travel planner design a bespoke honeymoon itinerary that secures romantic accommodations, scenic private travel, and experiences that you will cherish for a lifetime.</p>
            
            <div className="my-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Estimated Budget</span>
                <span className="text-lg font-bold text-slate-800">₹35,000 - ₹55,000 per couple</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Best Time to Visit</span>
                <span className="text-lg font-bold text-slate-800">April to October (Lush Meadows) / Dec to Feb (Snow)</span>
              </div>
            </div>

            <h3>Romantic Experiences for Couples in Kashmir</h3>
            <ul>
              <li><strong>Dal Lake Houseboat Stay:</strong> Wake up to misty mountain views and fresh tea served on your wooden deck.</li>
              <li><strong>Gulmarg Gondola Ride:</strong> Ride one of the highest cable cars in Asia for sweeping snow-covered views.</li>
              <li><strong>Stroll in Shalimar & Nishat Bagh:</strong> Walk through terraced lawns, cascading fountains, and historic Chinar trees.</li>
            </ul>
          </>
        }
        faqs={[
          { question: "Which is the most romantic town in Kashmir?", answer: "Pahalgam is highly romantic for its quiet pine forests and gushing streams, while Srinagar is famous for dreamy houseboat stays on Dal Lake." },
          { question: "Is Kashmir safe for honeymoon couples?", answer: "Yes, Kashmir is a highly popular and welcoming tourist destination. Local hospitality is legendary, and tourism routes are exceptionally safe." },
          { question: "How long should a Kashmir honeymoon be?", answer: "A 5 to 7-day trip is perfect to cover Srinagar, Gulmarg, and Pahalgam at a relaxing, romantic pace." }
        ]}
      />
    </LandingLayout>
  )
}
