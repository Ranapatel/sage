import type { Metadata } from 'next'
import LandingLayout from '@/components/layout/LandingLayout'
import SEOContent from '@/components/ui/SEOContent'
import Link from 'next/link'
import { Sparkles, ArrowRight, ShieldCheck, MapPin, Compass, Car, Clock, Navigation } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Weekend Trips from Hyderabad (2026): 7 Best Getaways (100–400km)',
  description: 'Top 7 weekend getaways from Hyderabad: Hampi (370km), Gandikota (380km), Srisailam (213km), Ananthagiri (80km) with driving routes, bus info & AI trip planner.',
  keywords: ['weekend trips from Hyderabad', 'getaways near Hyderabad', 'Hyderabad weekend guide', 'Hampi from Hyderabad', 'Gandikota from Hyderabad', 'places to visit near Hyderabad within 300 km'],
  alternates: { canonical: 'https://tripsage.in/weekend-trips-from-hyderabad' },
  openGraph: {
    title: 'Best Weekend Trips from Hyderabad: 7 Top Getaways & Routes (2026)',
    description: 'Expert verified weekend getaways from Hyderabad. Distance, driving times, road conditions, and complete expense breakdown.',
    url: 'https://tripsage.in/weekend-trips-from-hyderabad',
    siteName: 'TripSage',
    images: [{ url: 'https://images.unsplash.com/photo-1589133405370-96f30e9f8072?w=1200&q=85', width: 1200, height: 630, alt: 'Weekend Trips from Hyderabad' }],
    locale: 'en_IN',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Weekend Trips from Hyderabad (2026): 7 Best Getaways (100–400km)',
    description: 'Complete weekend guide from Hyderabad: Hampi, Gandikota, Srisailam, Ananthagiri Hills with road routes and costs.',
    images: ['https://images.unsplash.com/photo-1589133405370-96f30e9f8072?w=1200&q=85'],
  },
}

export default function Page() {
  const publishedDate = '2026-08-01T00:00:00+05:30'
  const lastVerifiedDate = '2026-10-01T00:00:00+05:30'

  return (
    <LandingLayout>
      <SEOContent
        title="Best Weekend Trips from Hyderabad: 7 Top Getaways, Routes & Budgets"
        subtitle="Need a quick escape from city traffic and IT corridor deadlines? Explore our handpicked weekend destinations from Hyderabad with driving routes, road conditions, and realistic weekend budgets."
        heroImage="https://images.unsplash.com/photo-1589133405370-96f30e9f8072?w=1920&q=90"
        ctaText="Plan with TripSage"
        ctaLink="/plan"
        articleData={{
          author: 'TripSage Hyderabad Research Team',
          datePublished: publishedDate,
          dateModified: lastVerifiedDate,
          description: 'A verified weekend getaway guide for Hyderabad residents covering Hampi, Gandikota, Srisailam, and Ananthagiri Hills with road conditions and costs.',
        }}
        destinationName="Hyderabad"
        content={
          <>
            <h2>Top Weekend Escapes from Hyderabad: Overview &amp; Distances</h2>
            <p>
              Planning a weekend trip from Hyderabad offers a diverse range of historic ruins, canyon landscapes, hill stations, and spiritual sanctuaries within a 1 to 7 hour driving radius. For quick 1-day or 2-day getaways, the top destinations include: Ananthagiri Hills (80km, 2 hours) for serene forest coffee plantations, Srisailam (213km, 4.5 hours) for temple heritage along the Krishna River gorge, the Grand Canyon of India at Gandikota (380km, 7 hours), and the UNESCO World Heritage boulder city of Hampi (370km, 7.5 hours). A typical 2-day self-drive or overnight bus weekend trip costs between ₹3,500 and ₹7,000 per person.
            </p>
            <p>
              Whether you are taking the Outer Ring Road (ORR) towards NH44 (Bangalore highway) or NH65 (Vijayawada highway), our <Link href="/ai-trip-planner">AI trip planner</Link> calculates live toll charges, fuel costs, and optimal departure windows to avoid city gridlock.
            </p>

            {/* Quick Comparison Table */}
            <div className="my-8 overflow-x-auto not-prose">
              <table className="w-full text-left border-collapse bg-white rounded-2xl overflow-hidden shadow-xs border border-[#E8E0D8]">
                <thead>
                  <tr className="bg-[#FFF4EE] border-b border-[#E8E0D8] text-[#1A1A1A] text-xs font-black uppercase tracking-wider">
                    <th className="py-3 px-4">Destination</th>
                    <th className="py-3 px-4">Distance / Travel Time</th>
                    <th className="py-3 px-4">Best Route / Highway</th>
                    <th className="py-3 px-4">Trip Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E0D8] text-xs text-[#57534E]">
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#1A1A1A]">Ananthagiri Hills (Vikarabad)</td>
                    <td className="py-3 px-4 font-bold text-[#EA580C]">80 km • ~2.0 hrs</td>
                    <td className="py-3 px-4">Chevella Road via Appa Junction</td>
                    <td className="py-3 px-4">Day Trip / 1 Night</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#1A1A1A]">Srisailam Wildlife &amp; Temple</td>
                    <td className="py-3 px-4 font-bold text-[#EA580C]">213 km • ~4.5 hrs</td>
                    <td className="py-3 px-4">NH765 via Dindi &amp; Mannanur forest checkpost</td>
                    <td className="py-3 px-4">2 Days / 1 Night</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#1A1A1A]">Warangal &amp; Ramappa Temple</td>
                    <td className="py-3 px-4 font-bold text-[#EA580C]">150 km • ~3.0 hrs</td>
                    <td className="py-3 px-4">NH163 4-lane highway via Ghatkesar</td>
                    <td className="py-3 px-4">Day Trip / 1 Night</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#1A1A1A]">Gandikota &amp; Belum Caves</td>
                    <td className="py-3 px-4 font-bold text-[#EA580C]">380 km • ~7.0 hrs</td>
                    <td className="py-3 px-4">NH44 via Kurnool &amp; Banaganapalle</td>
                    <td className="py-3 px-4">2 Days / 2 Nights</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#1A1A1A]">Hampi (UNESCO Heritage)</td>
                    <td className="py-3 px-4 font-bold text-[#EA580C]">370 km • ~7.5 hrs</td>
                    <td className="py-3 px-4">NH44 via Mahabubnagar &amp; Raichur or Overnight Sleeper Train</td>
                    <td className="py-3 px-4">3 Days / 2 Nights</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#1A1A1A]">Bidar Heritage Fort</td>
                    <td className="py-3 px-4 font-bold text-[#EA580C]">140 km • ~3.0 hrs</td>
                    <td className="py-3 px-4">NH65 via Sangareddy &amp; Zaheerabad</td>
                    <td className="py-3 px-4">Day Trip / 1 Night</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>In-Depth Guides to the Top 3 Weekend Getaways</h2>

            <h3>1. Srisailam &amp; Nallamala Forest Drive (213 km)</h3>
            <p>
              Srisailam offers one of Telangana and Andhra Pradesh's most picturesque scenic road trips. The highway cuts through the dense Nallamala Tiger Reserve, crossing the ghat road with dramatic views of the Krishna River gorge. Highlights include the sacred Mallikarjuna Swamy Jyotirlinga Temple, the Srisailam Dam ropeway, Pathalaganga boating, and the Akka Mahadevi Caves boat ride. <em>Tip: The forest gate at Mannanur closes to night traffic between 9:00 PM and 6:00 AM, so plan to enter the forest before 5:00 PM.</em>
            </p>

            <h3>2. Gandikota &amp; Belum Caves: The Grand Canyon Experience (380 km)</h3>
            <p>
              Perched atop the gorge carved by the Penna River in Kadapa district, Gandikota is rightfully called the "Grand Canyon of India." Watch the sunset illuminate the deep red sandstone gorge from the ramparts of Gandikota Fort, pitch a camp under starlit skies near the gorge edge, and visit the massive subterranean limestone caverns of Belum Caves (3.2 km underground system with freshwater galleries) on your drive back.
            </p>

            <h3>3. Hampi: The Ancient City of Vijayanagara (370 km)</h3>
            <p>
              For long weekends (3 days), Hampi is an unforgettable road trip or train journey (the Hyderabad-Hospet express operates overnight). Explore the iconic Stone Chariot at the Vijaya Vittala Temple, climb Matanga Hill for sunrise over thousands of prehistoric granite boulders, rent a moped in Sanapur to explore hippie cafes and quiet lakes, and admire the monolithic Virupaksha Temple.
            </p>

            {/* Call to Action Box */}
            <div className="my-10 bg-gradient-to-br from-[#FFF4EE] via-[#FFFBF7] to-[#FFF4EE] p-8 rounded-3xl border border-[#EA580C]/40 text-center not-prose shadow-sm">
              <Sparkles className="w-8 h-8 text-[#EA580C] mx-auto mb-3" />
              <h3 className="text-xl font-extrabold text-[#1A1A1A] mb-2">Plan your Hyderabad weekend getaway with AI</h3>
              <p className="text-sm text-[#6B6B6B] max-w-xl mx-auto mb-6">
                TripSage calculates your exact driving time from Gachibowli, Madhapur, or Secunderabad, optimizes meal stops on the highway, and finds verified resort stays.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/plan"
                  rel="nofollow"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#EA580C] hover:bg-[#C2410C] text-white font-extrabold text-sm rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Plan with TripSage — Free <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/itineraries"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-white border border-[#E8E0D8] hover:bg-slate-50 text-[#1A1A1A] font-bold text-sm rounded-xl transition-all"
                >
                  Explore Itineraries Hub
                </Link>
              </div>
            </div>
          </>
        }
        faqs={[
          {
            question: "What is the best 1-day road trip from Hyderabad?",
            answer: "Ananthagiri Hills (80km) or Warangal and the UNESCO World Heritage Ramappa Temple (150km) are the best single-day trips with smooth 4-lane roads and excellent roadside eateries."
          },
          {
            question: "Is Gandikota safe for overnight camping with friends and family?",
            answer: "Yes, Gandikota has several authorized camping operators offering tents with campfire setups, dinner, and safety fencing near the gorge view. Haritha Resort Gandikota (run by APTDC) is also an excellent option."
          },
          {
            question: "What are the timings for the Srisailam forest checkpost?",
            answer: "The Nallamala Forest ghat road closes entry between 9:00 PM and 6:00 AM daily to protect wildlife. Ensure you cross the Mannanur forest checkpost before 8:30 PM."
          },
          {
            question: "Can I take a direct train from Hyderabad to Hampi?",
            answer: "Yes, you can take an overnight train from Kacheguda (KCG) or Hyderabad Deccan (HYB) to Hosapete Junction (HPT), which is just 12 km from Hampi."
          }
        ]}
      />
    </LandingLayout>
  )
}
