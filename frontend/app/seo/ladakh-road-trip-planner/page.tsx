
import type { Metadata } from 'next'
import LandingLayout from '@/components/layout/LandingLayout'
import SEOContent from '@/components/ui/SEOContent'

export const metadata: Metadata = {
  title: 'Ladakh Road Trip Planner | TripSage',
  description: 'Plan the adventure of a lifetime. Get the ultimate Ladakh road trip route, packing checklists, acclimatization tips, and safety FAQs with TripSage AI.',
  keywords: ['Ladakh road trip planner', 'Manali to Leh highway route', 'Leh Ladakh road trip guide', 'acclimatization tips Ladakh', 'TripSage Ladakh'],
  alternates: { canonical: 'https://www.tripsage.in/seo/ladakh-road-trip-planner' }
}

export default function Page() {
  return (
    <LandingLayout>
      <SEOContent
        title="The Ultimate Leh Ladakh Road Trip Planner"
        subtitle="Conquer the highest motorable passes in the world. Navigate through dramatic Himalayan valleys, remote military posts, pristine lakes, and centuries-old Buddhist monasteries."
        heroImage="https://images.unsplash.com/photo-1596422846543-75c6fc18a52e?w=1920&q=90"
        content={
          <>
            <h2>The Adventure of a Lifetime Awaits</h2>
            <p>A road trip to Leh Ladakh is a badge of honor for travelers and motorcycle enthusiasts worldwide. Driving across the rugged terrain of the trans-Himalayas, surrounded by jagged snow-capped peaks and deep river gorges, is a raw, humbling, and utterly spectacular experience.</p>

            <h3>Choose Your Route: Manali vs. Srinagar</h3>
            <p>There are two primary highway routes that lead into the beautiful city of Leh, each offering vastly different landscapes and experiences:</p>
            <ul>
              <li><strong>Manali to Leh Highway:</strong> The more adventurous and challenging route. Covering 470 km, it takes you across five high-altitude passes (including Tanglang La and Lachung La), through the surreal Gata Loops, and past desolate plains. Best completed in 2 days with an overnight stop in Keylong or Jispa.</li>
              <li><strong>Srinagar to Leh Highway:</strong> A gentler, more gradual climb. Running along the Indus River, this 420 km route takes you past lush Kashmiri meadows, through the historic Zoji La Pass, Kargil War Memorial, and the ancient Alchi Monastery. Highly recommended for travelers who want a smoother transition to high altitude.</li>
            </ul>

            <h3>Critical Survival & Preparation Checklist</h3>
            <p>Ladakh is an beautiful but unforgiving environment. To ensure a safe and thrilling trip, follow these core guidelines:</p>
            <ol>
              <li><strong>Prioritize Acclimatization (AMS Prevention):</strong> Leh sits at 11,500 feet. Spend your first 36-48 hours in Leh resting completely. Avoid physical exertion, drink plenty of water, and let your body adapt to the thin air.</li>
              <li><strong>Inner Line Permits (ILP):</strong> You will need official government permits to visit restricted frontier zones like Pangong Tso, Nubra Valley, and Tso Moriri. Apply for them on the official permit site before you travel.</li>
              <li><strong>Pack Smart Layers:</strong> The mountain sun is intense, but temperatures plummet rapidly in the shade or after sunset. Bring heavy windproof jackets, thermal underwear, wool socks, and reliable UV-protection sunglasses.</li>
              <li><strong>Cash and Connectivity:</strong> Only postpaid connections (primarily Jio and Airtel) work in Ladakh. ATMs are rare outside Leh, so carry adequate physical cash for fuel, stays, and food in remote villages.</li>
            </ol>

            <p>A TripSage draft can outline a day-by-day Leh plan with a rupee estimate. It does not file permits or watch live weather and pass openings.</p>
          </>
        }
        faqs={[
          { question: "What is the best month for a Leh Ladakh road trip?", answer: "The ideal window is from early June to late September. During these summer months, the snow has cleared, the mountain passes are officially open, and the weather is mostly pleasant for driving." },
          { question: "How do I prevent Acute Mountain Sickness (AMS)?", answer: "Ascend gradually, take a full 2 days of rest upon arrival in Leh, hydrate constantly with water and ORS, avoid alcohol, and carry standard preventative medication like Diamox (consult your physician first)." },
          { question: "Can I rent a self-drive car or bike from Manali and take it to Pangong Lake?", answer: "Due to local Leh transport union regulations, outside commercial rental vehicles (from Manali, Delhi, etc.) are only allowed to reach Leh city. To explore inner regions like Nubra Valley and Pangong Lake, you must rent a local Leh-registered taxi, bike, or self-drive vehicle." }
        ]}
      />
    </LandingLayout>
  )
}
