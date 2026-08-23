import type { Metadata } from 'next'
import LandingLayout from '@/components/layout/LandingLayout'
import SEOContent from '@/components/ui/SEOContent'
import HubNav from '@/components/seo/HubNav'
import Link from 'next/link'
import {
  Compass, Map, Clock, Sparkles, ArrowRight, ShieldCheck,
  Building, Sun, Calendar, CheckCircle2, UserCheck, Plane, Wallet, CreditCard
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Dubai Trip Planner from India (2026 Guide): 5-Day Blueprint, Budget & Visa | TripSage',
  description: 'Complete verified Dubai travel planner for Indian tourists. 5-day step-by-step itinerary, direct flight guides (₹18k-₹28k), UAE tourist eVisa rules, Desert Safari tips, Burj Khalifa entry, and itemized cost breakdown.',
  keywords: [
    'Dubai trip planner from India',
    'Dubai 5 day itinerary from India',
    'Dubai trip cost for couple from India',
    'UAE tourist visa for Indian passport',
    'Dubai budget trip guide',
    'best time to visit Dubai from India'
  ],
  alternates: {
    canonical: 'https://tripsage.in/guides/dubai-trip-planner-from-india',
  },
  openGraph: {
    title: 'Dubai Trip Planner from India (2026): 5-Day Itinerary, Visa & Budget Guide',
    description: 'Expert Dubai travel guide for Indian citizens. 5-day day-by-day blueprint, flight comparisons, visa requirements, and itemized expenses.',
    url: 'https://tripsage.in/guides/dubai-trip-planner-from-india',
    siteName: 'TripSage',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=85',
        width: 1200,
        height: 630,
        alt: 'Dubai Skyline and Burj Khalifa Trip Planner',
      },
    ],
    locale: 'en_IN',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dubai Trip Planner from India (2026 Guide): Itinerary, Visa & Costs',
    description: 'Complete 5-day Dubai trip blueprint, flight prices from India, UAE tourist visa rules, and budget breakdown.',
    images: ['https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=85'],
  },
}

export default function DubaiTripPlannerPage() {
  const publishedDate = '2026-08-15T00:00:00+05:30'
  const lastVerifiedDate = '2026-08-20T00:00:00+05:30'

  return (
    <LandingLayout>
      <SEOContent
        title="Dubai Trip Planner from India: 5-Day Blueprint, Visa & Cost Breakdown"
        subtitle="Turn your dream trip to the City of Gold into reality. Explore a verified, step-by-step 5-day itinerary, round-trip flight guide from major Indian metros, UAE tourist visa rules, and realistic budget calculations."
        heroImage="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&q=90"
        ctaText="Plan My Dubai Trip with AI"
        ctaLink="/plan"
        articleData={{
          author: 'TripSage Travel Editorial Team',
          datePublished: publishedDate,
          dateModified: lastVerifiedDate,
          description: 'A comprehensive 5-day Dubai trip blueprint for Indian travelers covering flights, UAE visa, daily costs, and top landmarks.',
          image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=85'
        }}
        content={
          <>
            {/* Editorial Metadata Box */}
            <div className="not-prose bg-[#FFFBF7] border border-[#E8E0D8] rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 text-[#EA580C] flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-extrabold text-[#1A1A1A]">Written by TripSage Travel Editorial Team</p>
                  <p className="text-[#6B6B6B]">Reviewed & Fact-Checked by Middle East Travel Specialists</p>
                </div>
              </div>
              <div className="flex sm:flex-col items-center sm:items-end gap-2 text-[#6B6B6B]">
                <span><strong>Published:</strong> August 2026</span>
                <span><strong>Last Verified:</strong> August 2026</span>
              </div>
            </div>

            {/* Direct Answer Summary Box */}
            <div className="my-6 p-6 rounded-3xl bg-[#FFF4EE] border border-[#EA580C]/30 not-prose">
              <div className="flex items-center gap-2 mb-2 text-[#EA580C] font-extrabold text-sm uppercase tracking-wider">
                <Compass className="w-4 h-4" /> Direct Answer: Planning a 5-Day Dubai Trip from India
              </div>
              <p className="text-sm font-semibold text-[#1A1A1A] leading-relaxed mb-4">
                A 5-day/4-night Dubai holiday from India averages between <strong>₹60,000 to ₹85,000 per person</strong> on a comfortable mid-range budget (₹1,20,000 – ₹1,60,000 for a couple), covering direct flights, 4-star city hotels, UAE tourist visa, Desert Safari, Burj Khalifa At The Top, and metro transit.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-3 border-t border-[#EA580C]/20">
                <div>
                  <span className="text-[#6B6B6B] block">Return Flights</span>
                  <strong className="text-[#1A1A1A]">₹18,000 – ₹28,000</strong>
                </div>
                <div>
                  <span className="text-[#6B6B6B] block">UAE Tourist Visa</span>
                  <strong className="text-[#1A1A1A]">~₹6,500 – ₹8,000 (30 Days)</strong>
                </div>
                <div>
                  <span className="text-[#6B6B6B] block">Best Travel Window</span>
                  <strong className="text-[#1A1A1A]">November to March</strong>
                </div>
                <div>
                  <span className="text-[#6B6B6B] block">Ideal Duration</span>
                  <strong className="text-[#1A1A1A]">5 Days / 4 Nights</strong>
                </div>
              </div>
            </div>

            <h2>1. UAE Visa Requirements for Indian Passport Holders</h2>
            <p>
              Indian citizens require an entry visa prior to boarding flights to the UAE, unless holding qualifying third-country visas:
            </p>
            <ul>
              <li>
                <strong>30-Day Single Entry Tourist eVisa:</strong> The standard visa for vacationers. Applied online via authorized airlines (Emirates, flydubai, Air Arabia, IndiGo) or licensed UAE travel agencies. Processing takes 2 to 4 working days and costs approximately <strong>AED 300 to AED 380 (~₹6,800 – ₹8,500)</strong> including mandatory travel insurance.
              </li>
              <li>
                <strong>Visa on Arrival for US/UK/EU Visa Holders:</strong> Indian passport holders who possess a valid US Visitor Visa (B1/B2), US Green Card, UK Residence Permit, or EU Schengen Visa with at least 6 months validity are eligible for a <strong>14-day Visa on Arrival</strong> at Dubai airports for approximately <strong>AED 120 (~₹2,700)</strong>.
              </li>
            </ul>

            <h2>2. Itemized 5-Day Dubai Budget Breakdown (Per Person)</h2>
            <div className="overflow-x-auto not-prose my-6 rounded-2xl border border-[#E8E0D8] bg-white shadow-xs">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="bg-[#FFFBF7] border-b border-[#E8E0D8] text-[#1A1A1A] font-extrabold">
                    <th className="p-4">Expense Category</th>
                    <th className="p-4">Budget Option</th>
                    <th className="p-4">Mid-Range (Recommended)</th>
                    <th className="p-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E0D8]/60 text-[#4A4A4A]">
                  <tr>
                    <td className="p-4 font-bold text-[#1A1A1A]">Return Flights from India</td>
                    <td className="p-4">₹18,000 – ₹22,000</td>
                    <td className="p-4">₹22,000 – ₹28,000</td>
                    <td className="p-4">Direct 3.5-4hr flights from Mumbai, Delhi, Hyderabad, Bengaluru, Kochi, or Chennai.</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-[#1A1A1A]">30-Day UAE Tourist Visa</td>
                    <td className="p-4">₹6,800</td>
                    <td className="p-4">₹7,500</td>
                    <td className="p-4">Online eVisa with COVID-19 health cover included.</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-[#1A1A1A]">Hotel Accommodation (4 Nights)</td>
                    <td className="p-4">₹10,000 (Bur Dubai 3★)</td>
                    <td className="p-4">₹20,000 (Downtown/Marina 4★)</td>
                    <td className="p-4">Shared double occupancy rate per person.</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-[#1A1A1A]">Food & Dining (5 Days)</td>
                    <td className="p-4">₹6,000 – ₹8,000</td>
                    <td className="p-4">₹12,000 – ₹16,000</td>
                    <td className="p-4">Indian/Arabian eateries (₹500/meal) vs. mall cafes & marina restaurants (₹1,500/meal).</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-[#1A1A1A]">Dubai Metro & Taxis</td>
                    <td className="p-4">₹2,000 (Silver NOL Card)</td>
                    <td className="p-4">₹4,500 (Metro + Careem cabs)</td>
                    <td className="p-4">Dubai Metro covers all major tourist spots efficiently.</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-[#1A1A1A]">Key Activities & Entry Fees</td>
                    <td className="p-4">₹8,000</td>
                    <td className="p-4">₹14,000</td>
                    <td className="p-4">Burj Khalifa 124th Floor (~₹3.8k), Desert Safari with BBQ (~₹2.5k), Museum of the Future (~₹3.5k), Dubai Frame (~₹1.2k).</td>
                  </tr>
                  <tr className="bg-orange-50 font-extrabold text-[#1A1A1A]">
                    <td className="p-4">Total Estimated Trip Cost</td>
                    <td className="p-4 text-[#EA580C]">₹50,800 – ₹57,000</td>
                    <td className="p-4 text-[#EA580C]">₹72,000 – ₹88,000</td>
                    <td className="p-4">Per person for a full 5-day international vacation.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>3. The Ideal 5-Day Dubai Blueprint</h2>

            {/* Day 1 */}
            <div className="p-6 rounded-2xl bg-white border border-[#E8E0D8] my-6 not-prose shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-[#EA580C] uppercase tracking-wider mb-1">
                <Clock className="w-4 h-4" /> Day 1 • Downtown Glitz, Burj Khalifa & Dubai Mall
              </div>
              <h3 className="text-lg font-extrabold text-[#1A1A1A] mb-2">Iconic Skyscrapers, Giant Aquarium & Dubai Fountain Show</h3>
              <p className="text-xs text-[#6B6B6B] leading-relaxed mb-3">
                Arrive at Dubai International Airport (DXB). Check into your hotel (Bur Dubai, Al Barsha, or Downtown area). Take the Dubai Metro Red Line to Burj Khalifa/Dubai Mall Station.
              </p>
              <ul className="text-xs text-[#4A4A4A] space-y-1.5 list-disc pl-4 mb-3">
                <li><strong>Afternoon:</strong> Explore <em>The Dubai Mall</em>, see the massive Indoor Aquarium & Underwater Zoo, and browse luxury boutiques.</li>
                <li><strong>05:00 PM:</strong> Ascend to <em>Burj Khalifa At The Top (124th & 125th Floor)</em> for breathtaking 360-degree sunset views over the desert and Arabian Gulf.</li>
                <li><strong>07:30 PM:</strong> Watch the synchronized <em>Dubai Fountain Show</em> at the foot of Burj Khalifa (runs every 30 minutes, free to watch).</li>
                <li><strong>08:30 PM:</strong> Dinner at <em>Souk Al Bahar</em> with fountain views.</li>
              </ul>
            </div>

            {/* Day 2 */}
            <div className="p-6 rounded-2xl bg-white border border-[#E8E0D8] my-6 not-prose shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-[#EA580C] uppercase tracking-wider mb-1">
                <Clock className="w-4 h-4" /> Day 2 • Old Dubai Heritage, Creek Abra & Gold Souk
              </div>
              <h3 className="text-lg font-extrabold text-[#1A1A1A] mb-2">Al Fahidi Historical District, 1 AED Abra Ride & Dubai Frame</h3>
              <p className="text-xs text-[#6B6B6B] leading-relaxed mb-3">
                Step back into Dubai's trading origins and contrast old architecture with the modern skyline.
              </p>
              <ul className="text-xs text-[#4A4A4A] space-y-1.5 list-disc pl-4 mb-3">
                <li><strong>09:30 AM:</strong> Wander through the winding alleyways and wind-tower architecture of <em>Al Fahidi Historical Neighbourhood</em>.</li>
                <li><strong>11:00 AM:</strong> Ride a traditional wooden <em>Abra boat across Dubai Creek</em> for just 1 AED (~₹23).</li>
                <li><strong>11:30 AM:</strong> Browse authentic saffron, dates, and dazzling jewelry at the <em>Spice Souk</em> and <em>Deira Gold Souk</em>.</li>
                <li><strong>03:30 PM:</strong> Visit the iconic <em>Dubai Frame</em> in Zabeel Park to see Old Dubai to the north and futuristic Downtown to the south from a glass skydeck.</li>
              </ul>
            </div>

            {/* Day 3 */}
            <div className="p-6 rounded-2xl bg-white border border-[#E8E0D8] my-6 not-prose shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-[#EA580C] uppercase tracking-wider mb-1">
                <Clock className="w-4 h-4" /> Day 3 • Red Dune Desert Safari with BBQ Dinner
              </div>
              <h3 className="text-lg font-extrabold text-[#1A1A1A] mb-2">Dune Bashing, Sandboarding, Camel Ride & Tanoura Show</h3>
              <p className="text-xs text-[#6B6B6B] leading-relaxed mb-3">
                A quintessential Dubai experience in the Lahbab red sand dunes.
              </p>
              <ul className="text-xs text-[#4A4A4A] space-y-1.5 list-disc pl-4 mb-3">
                <li><strong>Morning:</strong> Relax at your hotel pool or visit <em>Miracle Garden</em> (world's largest natural flower garden, open Nov-Apr).</li>
                <li><strong>02:30 PM:</strong> 4x4 Land Cruiser hotel pickup for the <em>Lahbab Desert Safari</em>.</li>
                <li><strong>04:30 PM:</strong> Thrilling dune bashing over crimson sand dunes, sandboarding, and sunset photo stop.</li>
                <li><strong>06:30 PM:</strong> Traditional Bedouin camp feast with BBQ buffet dinner (vegetarian/Jain options available), live belly dance, Tanoura show, and fire show.</li>
              </ul>
            </div>

            {/* Day 4 */}
            <div className="p-6 rounded-2xl bg-white border border-[#E8E0D8] my-6 not-prose shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-[#EA580C] uppercase tracking-wider mb-1">
                <Clock className="w-4 h-4" /> Day 4 • Palm Jumeirah, Dubai Marina & JBR Beach
              </div>
              <h3 className="text-lg font-extrabold text-[#1A1A1A] mb-2">The View at The Palm, Marina Yacht Promenade & Ain Dubai</h3>
              <p className="text-xs text-[#6B6B6B] leading-relaxed mb-3">
                Explore Dubai’s modern coastline and man-made architectural marvels.
              </p>
              <ul className="text-xs text-[#4A4A4A] space-y-1.5 list-disc pl-4 mb-3">
                <li><strong>10:00 AM:</strong> Visit <em>The View at The Palm</em> (52nd floor observation deck) for the ultimate view of the palm-tree shaped archipelago.</li>
                <li><strong>01:00 PM:</strong> Ride the Palm Monorail to <em>Atlantis The Palm</em> and visit the Lost Chambers Aquarium.</li>
                <li><strong>04:00 PM:</strong> Stroll along the luxury yacht promenade of <em>Dubai Marina Walk</em> and relax on the sands of <em>JBR Beach</em>.</li>
                <li><strong>07:30 PM:</strong> Cross the footbridge to <em>Bluewaters Island</em> under the towering <em>Ain Dubai</em> wheel for dinner.</li>
              </ul>
            </div>

            {/* Day 5 */}
            <div className="p-6 rounded-2xl bg-white border border-[#E8E0D8] my-6 not-prose shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-[#EA580C] uppercase tracking-wider mb-1">
                <Clock className="w-4 h-4" /> Day 5 • Museum of the Future & Departure
              </div>
              <h3 className="text-lg font-extrabold text-[#1A1A1A] mb-2">Futuristic Exhibits, Last-Minute Shopping & DXB Departure</h3>
              <p className="text-xs text-[#6B6B6B] leading-relaxed mb-3">
                Wrap up your holiday with cutting-edge innovations and souvenir shopping.
              </p>
              <ul className="text-xs text-[#4A4A4A] space-y-1.5 list-disc pl-4 mb-3">
                <li><strong>10:00 AM:</strong> Tour the architectural masterpiece <em>Museum of the Future</em> on Sheikh Zayed Road (book tickets 3-4 weeks in advance).</li>
                <li><strong>01:30 PM:</strong> Last-minute shopping for electronics and dates at <em>Meena Bazaar</em> in Bur Dubai.</li>
                <li><strong>05:00 PM:</strong> Metro transfer to DXB Airport for your evening flight back to India.</li>
              </ul>
            </div>

            <h2>4. Best Season to Visit Dubai from India</h2>
            <p>
              Dubai experiences an arid desert climate with two distinct seasons:
            </p>
            <ul>
              <li>
                <strong>Winter (November to March — Best Time):</strong> Temperatures range from <strong>20°C to 28°C</strong>. Ideal for outdoor beaches, desert safaris, walking tours, and the <em>Dubai Shopping Festival (DSF)</em> in December–January.
              </li>
              <li>
                <strong>Summer (May to September — Avoid):</strong> Temperatures exceed <strong>42°C to 48°C</strong> with high humidity. While hotel rates drop by 40%, daytime outdoor exploration is uncomfortable and restricted to air-conditioned indoor malls and theme parks.
              </li>
            </ul>

            {/* AI Trip Planner CTA */}
            <div className="my-10 bg-gradient-to-br from-[#FFF4EE] via-[#FFFBF7] to-[#FFF4EE] p-8 rounded-3xl border border-[#EA580C]/40 text-center not-prose shadow-sm">
              <Sparkles className="w-8 h-8 text-[#EA580C] mx-auto mb-3" />
              <h3 className="text-xl font-extrabold text-[#1A1A1A] mb-2">Generate your custom Dubai itinerary now</h3>
              <p className="text-sm text-[#6B6B6B] max-w-xl mx-auto mb-6">
                Use TripSage AI to compare direct flight fares from your home city in India, discover top 4-star hotels near Dubai Metro stations, and generate a day-by-day route in seconds.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/plan"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#EA580C] hover:bg-[#C2410C] text-white font-extrabold text-sm rounded-xl shadow-md transition-all"
                >
                  Plan Dubai Trip with AI <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/destinations"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-white border border-[#E8E0D8] hover:bg-slate-50 text-[#1A1A1A] font-bold text-sm rounded-xl transition-all"
                >
                  Explore All Destinations
                </Link>
              </div>
            </div>

            {/* Official Travel Disclaimer */}
            <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-[#6B6B6B] my-6 not-prose">
              <strong>Official Travel Information Disclaimer:</strong> Visa regulations, attraction ticket prices, and entry rules are established by the Dubai Department of Economy and Tourism (DET) and the UAE Federal Authority for Identity and Citizenship (ICP). Information in this guide is verified against official 2026 standards. Always ensure your passport holds at least 6 months validity and check official visa regulations prior to booking international flights.
            </div>

            {/* Related Guides Links */}
            <h2>Related International Trip Planners & Guides</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6 not-prose">
              <Link href="/itineraries/bali-7-day-itinerary-from-india" className="p-4 rounded-xl bg-white border border-[#E8E0D8] hover:border-[#EA580C] hover:shadow-xs transition-all flex flex-col justify-between">
                <span className="text-xs font-extrabold text-[#EA580C] uppercase">Itinerary Guide</span>
                <h4 className="font-extrabold text-sm text-[#1A1A1A] mt-1 mb-2">Bali 7-Day Itinerary</h4>
                <span className="text-xs font-semibold text-[#6B6B6B] flex items-center gap-1">Read guide <ArrowRight className="w-3 h-3" /></span>
              </Link>
              <Link href="/visa/thailand-visa-for-indian-citizens" className="p-4 rounded-xl bg-white border border-[#E8E0D8] hover:border-[#EA580C] hover:shadow-xs transition-all flex flex-col justify-between">
                <span className="text-xs font-extrabold text-[#EA580C] uppercase">Visa Guide</span>
                <h4 className="font-extrabold text-sm text-[#1A1A1A] mt-1 mb-2">Thailand Visa for Indians</h4>
                <span className="text-xs font-semibold text-[#6B6B6B] flex items-center gap-1">Read guide <ArrowRight className="w-3 h-3" /></span>
              </Link>
              <Link href="/budget/bali-trip-cost-from-india" className="p-4 rounded-xl bg-white border border-[#E8E0D8] hover:border-[#EA580C] hover:shadow-xs transition-all flex flex-col justify-between">
                <span className="text-xs font-extrabold text-[#EA580C] uppercase">Budget Guide</span>
                <h4 className="font-extrabold text-sm text-[#1A1A1A] mt-1 mb-2">Bali Trip Cost from India</h4>
                <span className="text-xs font-semibold text-[#6B6B6B] flex items-center gap-1">Read guide <ArrowRight className="w-3 h-3" /></span>
              </Link>
            </div>
          </>
        }
        faqs={[
          {
            question: "How much does a 5-day Dubai trip cost from India?",
            answer: "On average, a 5-day Dubai trip costs between ₹60,000 to ₹85,000 per person on a comfortable mid-range budget, covering round-trip flights, 4-star hotel stay, 30-day UAE tourist visa, Desert Safari, Burj Khalifa entry, food, and metro transit."
          },
          {
            question: "Do Indian passport holders get Visa on Arrival in Dubai?",
            answer: "Indian passport holders can only get a 14-day Visa on Arrival (costing approx. 120 AED) if they have a valid US Visitor Visa (B1/B2), US Green Card, UK Residence Visa, or EU Schengen Visa with at least 6 months validity. Otherwise, an advance 30-day or 60-day tourist eVisa must be obtained."
          },
          {
            question: "What is the best area to stay in Dubai for Indian tourists?",
            answer: "Bur Dubai and Deira offer great budget 3-star hotels and countless Indian restaurants with easy Metro access. For modern luxury and nightlife, Downtown Dubai and Dubai Marina / JBR are the top areas."
          },
          {
            question: "Is Dubai Metro convenient for visiting top tourist sights?",
            answer: "Yes, the Dubai Metro Red Line directly connects DXB Airport to Burj Khalifa, Dubai Mall, Dubai Frame, Mall of the Emirates, and Dubai Marina. Purchasing a rechargeable Silver NOL card is the most economical way to travel."
          },
          {
            question: "What is the dress code for tourists visiting Dubai?",
            answer: "Dubai is cosmopolitan, but modest attire is appreciated in public areas. Swimwear is allowed at pools, beach clubs, and private beaches. When visiting heritage areas, souks, government buildings, or mosques (like Grand Mosque), shoulders and knees must be covered."
          }
        ]}
      />
      <HubNav />
    </LandingLayout>
  )
}
