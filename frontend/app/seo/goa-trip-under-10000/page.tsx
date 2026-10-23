import type { Metadata } from 'next'
import LandingLayout from '@/components/layout/LandingLayout'
import SEOContent from '@/components/ui/SEOContent'
import Link from 'next/link'
import { Sparkles, ArrowRight, ShieldCheck, Wallet, MapPin, Calendar, Compass, Sun, CheckCircle2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Goa Trip Under ₹10,000: 4-Day Plan | TripSage',
  description: 'A 4-day Goa trip can fit within ₹10,000 per person with overnight trains via Madgaon or Thivim and off-peak dates.',
  keywords: ['Goa trip under 10000', 'budget Goa trip', 'cheap Goa travel guide', 'Goa on a budget', 'Goa 4 day itinerary cost', 'Goa trip plan for students'],
  alternates: { canonical: 'https://www.tripsage.in/seo/goa-trip-under-10000' },
  openGraph: {
    title: 'Goa Trip Under ₹10,000: 4-Day Plan | TripSage',
    description: 'Complete verified Goa budget guide. Itemized expenses, top cheap hostels, scooter rentals, and a 4-day itinerary under ₹10,000.',
    url: 'https://www.tripsage.in/seo/goa-trip-under-10000',
    siteName: 'TripSage',
    images: [{ url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&q=85', width: 1200, height: 630, alt: 'Goa Budget Trip Guide Under 10000' }],
    locale: 'en_IN',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Goa Trip Under ₹10,000: 4-Day Plan | TripSage',
    description: 'Complete 4-day Goa budget blueprint under ₹10k: hostels, scooter rentals, beach shacks, and free sights.',
    images: ['https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&q=85'],
  },
}

export default function Page() {
  const publishedDate = '2026-08-01T00:00:00+05:30'
  const lastVerifiedDate = '2026-10-01T00:00:00+05:30'

  return (
    <LandingLayout>
      <SEOContent
        title="Goa Trip Under ₹10,000: Complete 4-Day Budget Itinerary & Costs"
        subtitle="Experience sun, beaches, and vibrant coastal culture without emptying your savings. Here is the verified expense blueprint, hostel recommendations, and day-by-day route to complete Goa under ₹10k."
        heroImage="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1920&q=90"
        ctaText="Plan with TripSage"
        ctaLink="/plan"
        articleData={{
          author: 'TripSage Travel Research Team',
          datePublished: publishedDate,
          dateModified: lastVerifiedDate,
          description: 'A verified 4-day Goa budget travel guide for Indian travelers under ₹10,000 covering hostels, scooters, food, and daily routes.',
        }}
        destinationName="Goa"
        content={
          <>
            <h2>Can You Truly Do a Goa Trip Under ₹10,000?</h2>
            <p>
              Planning a Goa trip under ₹10,000 is entirely achievable with the right strategy. For a 4-day, 3-night trip from major Indian cities, your realistic expense breakdown is: ₹2,400 for hostel stays, ₹2,200 for delicious local Goan thalis and beach cafe dining, ₹1,200 for scooter rental and fuel, ₹1,500 for entry tickets and water activities, and ₹1,500 for sleeper-class train tickets or advance bus bookings. That leaves ₹1,200 for contingency, keeping your total comfortably between ₹8,500 and ₹9,800 per person.
            </p>
            <p>
              With overnight trains via Madgaon or Thivim and off-peak dates, a 4-day Goa trip can fit within ₹10,000 per person. You can build the days with our <Link href="/ai-trip-planner">AI trip planner</Link>.
            </p>

            {/* Itemized Budget Table */}
            <div className="my-8 overflow-x-auto not-prose">
              <table className="w-full text-left border-collapse bg-white rounded-2xl overflow-hidden shadow-xs border border-[#E8E0D8]">
                <thead>
                  <tr className="bg-[#FFF4EE] border-b border-[#E8E0D8] text-[#1A1A1A] text-xs font-black uppercase tracking-wider">
                    <th className="py-3 px-4">Expense Category</th>
                    <th className="py-3 px-4">4-Day Estimated Cost</th>
                    <th className="py-3 px-4">Budget Strategy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E0D8] text-xs text-[#57534E]">
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#1A1A1A]">Accommodation (3 Nights)</td>
                    <td className="py-3 px-4 font-bold text-[#EA580C]">₹1,800 – ₹2,400</td>
                    <td className="py-3 px-4">Hostel dorm beds in Anjuna or Arambol (Zostel, Hosteller) at ₹600–₹800/night</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#1A1A1A]">Food &amp; Drinks</td>
                    <td className="py-3 px-4 font-bold text-[#EA580C]">₹2,000 – ₹2,600</td>
                    <td className="py-3 px-4">Local Goan fish curry thalis (₹150–₹220), street snacks, and beach shacks during happy hours</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#1A1A1A]">Scooter Rental &amp; Petrol</td>
                    <td className="py-3 px-4 font-bold text-[#EA580C]">₹1,200 – ₹1,500</td>
                    <td className="py-3 px-4">Honda Activa @ ₹350–₹400/day + ₹400 fuel (shareable between 2 travelers to halve the cost)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#1A1A1A]">Interstate Transport</td>
                    <td className="py-3 px-4 font-bold text-[#EA580C]">₹1,200 – ₹1,800</td>
                    <td className="py-3 px-4">Sleeper/3AC train from Mumbai/Bangalore/Hyderabad or overnight KSRTC/MSRTC bus</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#1A1A1A]">Activities &amp; Entry Fees</td>
                    <td className="py-3 px-4 font-bold text-[#EA580C]">₹800 – ₹1,200</td>
                    <td className="py-3 px-4">Free fort visits (Aguada, Chapora), ₹500 kayak rental at Palolem, free beach sunsets</td>
                  </tr>
                  <tr className="bg-[#FFFBF7] font-black text-sm text-[#1A1A1A]">
                    <td className="py-3.5 px-4 font-black">Total Expected Budget</td>
                    <td className="py-3.5 px-4 text-[#EA580C]">₹7,000 – ₹9,500</td>
                    <td className="py-3.5 px-4 text-emerald-700">Fully under the ₹10,000 ceiling!</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>Day-by-Day 4-Day Budget Goa Itinerary</h2>

            <h3>Day 1: Arrival, North Goa Hostel Check-in &amp; Sunset Chill</h3>
            <p>
              Arrive at Thivim or Karmali railway station in the morning. Take the local Kadamba bus (₹40–₹60) to Mapusa, then connect to Anjuna or Calangute instead of taking a ₹1,200 private taxi. Check into your backpacker hostel. Rent your scooter for the next 3 days, negotiate a flat multi-day rate of ₹350/day. Spend your afternoon relaxing at Vagator Beach, and head up to Chapora Fort for a free, panoramic sunset over the Arabian Sea. Dinner at a local cafe with traditional Goan poee and curry.
            </p>

            <h3>Day 2: Fort Aguada, Coastal Cruising &amp; Anjuna Night Market</h3>
            <p>
              Start early to beat the afternoon heat. Drive down to Sinquerim and visit the 17th-century Fort Aguada and its historic Portuguese lighthouse. For lunch, skip the touristy beachfront shacks and head into Candolim village for an authentic Goan fish or vegetarian thali (₹160). In the late afternoon, explore the cliffside views of Ozran Beach (Little Vagator) and spend the evening enjoying live acoustic music at an open-air Anjuna cafe.
            </p>

            <h3>Day 3: South Goa Expedition (Palolem &amp; Cabo de Rama)</h3>
            <p>
              Dedicate Day 3 to the pristine, peaceful beaches of South Goa. Ride down the picturesque NH66 coastal highway toward Palolem. Rent a kayak for ₹300–₹500 for an hour to explore Butterfly Beach cove. Visit the cliff ruins of Cabo de Rama Fort for one of the most scenic sunset vantage points on the entire western coast of India. Enjoy fresh seafood or wood-fired pizza in Palolem village.
            </p>

            <h3>Day 4: Latin Quarter of Panaji, Old Goa Churches &amp; Departure</h3>
            <p>
              Before heading to the railway station or bus terminal, spend your morning in Panaji exploring the colorful Portuguese-heritage lanes of Fontainhas. Stop by the historic Basilica of Bom Jesus and Se Cathedral in Old Goa (free entry). Pick up local cashew nuts and bebinca sweets at municipal market prices before boarding your return train or bus.
            </p>

            {/* Call to Action Box */}
            <div className="my-10 bg-gradient-to-br from-[#FFF4EE] via-[#FFFBF7] to-[#FFF4EE] p-8 rounded-3xl border border-[#EA580C]/40 text-center not-prose shadow-sm">
              <Sparkles className="w-8 h-8 text-[#EA580C] mx-auto mb-3" />
              <h3 className="text-xl font-extrabold text-[#1A1A1A] mb-2">Build your custom Goa trip in 30 seconds</h3>
              <p className="text-sm text-[#6B6B6B] max-w-xl mx-auto mb-6">
                Let TripSage AI calculate the exact route, recommend top-rated budget hostels, and optimize your daily itinerary based on your departure city.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/plan"
                  rel="nofollow"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#EA580C] hover:bg-[#C2410C] text-white font-extrabold text-sm rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Plan with TripSage <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/budget"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-white border border-[#E8E0D8] hover:bg-slate-50 text-[#1A1A1A] font-bold text-sm rounded-xl transition-all"
                >
                  Explore Budget Hub
                </Link>
              </div>
            </div>

            <h2>Essential Money-Saving Hacks for Goa</h2>
            <ul>
              <li><strong>Travel in Shoulder Season:</strong> October, November, February, and March offer 40% lower accommodation prices compared to late December peak weeks.</li>
              <li><strong>Kadamba Shuttles Over Taxis:</strong> Goa airport (Mopa &amp; Dabolim) operates direct electric express shuttle buses to Panaji, Calangute, and Margao for ₹150–₹250 compared to ₹1,500+ cabs.</li>
              <li><strong>Split Scooter Rentals:</strong> Traveling as a pair halves your scooter rental and fuel cost to just ₹350 per person for the entire trip.</li>
              <li><strong>Check stays yourself:</strong> Look up hostels and guesthouses on their own sites. TripSage does not book stays or promise breakfast and cancellation terms.</li>
            </ul>
          </>
        }
        faqs={[
          {
            question: "Does the ₹10,000 budget include interstate travel to Goa?",
            answer: "Yes, if booking sleeper-class Indian Railways train tickets (₹450–₹750 each way from Mumbai, Pune, or Bangalore) or advance sleeper buses. For flights, airfare alone can consume ₹4,000–₹8,000, so budget air travelers should add flight costs on top."
          },
          {
            question: "Which part of Goa is best for budget travelers?",
            answer: "North Goa (Anjuna, Vagator, and Arambol) has the highest concentration of affordable backpacker hostels (₹500–₹800/night). South Goa (Palolem and Agonda) has great budget beach huts if booked in advance."
          },
          {
            question: "Is alcohol cheap in Goa?",
            answer: "Yes, Goa has significantly lower excise duties on alcohol than neighboring Maharashtra or Karnataka. Local beers start at ₹60–₹90 in retail stores, making casual dining very economical."
          },
          {
            question: "How much does a scooter rental cost in Goa?",
            answer: "Standard Honda Activa or Dio rentals typically cost ₹300–₹400 per day in regular season. Always carry your original driving license and wear a helmet to avoid traffic fines."
          }
        ]}
      />
    </LandingLayout>
  )
}
