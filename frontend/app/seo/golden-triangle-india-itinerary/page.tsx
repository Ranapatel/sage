import type { Metadata } from 'next'
import LandingLayout from '@/components/layout/LandingLayout'
import SEOContent from '@/components/ui/SEOContent'

export const metadata: Metadata = {
  title: 'Golden Triangle India Itinerary | Delhi, Agra, Jaipur Tour | TripSage',
  description: 'Plan the ultimate 4-6 day Golden Triangle tour of India. Explore Delhi\'s historical heritage, Agra\'s Taj Mahal, and Jaipur\'s royal palaces with TripSage AI.',
  keywords: ['Golden Triangle India itinerary', 'Delhi Agra Jaipur tour', 'India Golden Triangle trip planner', 'Delhi Agra Jaipur travel guide', 'TripSage Golden Triangle'],
  alternates: { canonical: 'https://tripsage.in/seo/golden-triangle-india-itinerary' }
}

export default function Page() {
  return (
    <LandingLayout>
      <SEOContent
        title="The Ultimate Golden Triangle India Itinerary"
        subtitle="Embark on India's most iconic heritage journey. Explore the historic lanes of Delhi, witness the eternal beauty of the Taj Mahal in Agra, and uncover the royal palace gates of Jaipur."
        heroImage="https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1920&q=90"
        content={
          <>
            <h2>Discover India's Royal Heritage Route</h2>
            <p>The Golden Triangle is India's most famous tourist circuit for a reason. Connecting the capital city of Delhi, the city of romance Agra, and the pink-hued royal city of Jaipur, it offers an incredible introduction to the country's diverse history, culture, and architecture.</p>
            
            <h3>Step 1: Uncover Historic Delhi (Days 1-2)</h3>
            <p>Your journey begins in Delhi, a massive metropolis of contrasts where ancient history merges with ultra-modern urban life.</p>
            <ul>
              <li><strong>Old Delhi:</strong> Navigate the chaotic, vibrant alleys of Chandni Chowk on a rickshaw, and visit the massive 17th-century Red Fort and Jama Masjid.</li>
              <li><strong>New Delhi:</strong> Drive down the grand Rajpath past India Gate and Rashtrapati Bhavan, and explore stunning UNESCO sites like Humayun's Tomb and the towering Qutub Minar.</li>
            </ul>

            <h3>Step 2: Gaze Upon the Taj Mahal in Agra (Day 3)</h3>
            <p>Next, travel south to Agra, the home of the world's most beautiful tribute to eternal love.</p>
            <ul>
              <li><strong>Sunrise at the Taj Mahal:</strong> Witness the ivory-white marble monument change colors from soft pink to radiant gold in the early morning light.</li>
              <li><strong>Agra Fort:</strong> Tour the massive red sandstone fortress that was the imperial seat of the Mughal emperors.</li>
              <li><strong>Baby Taj & Mehtab Bagh:</strong> Catch a stunning sunset view of the Taj Mahal from across the Yamuna River at the Mehtab Bagh gardens.</li>
            </ul>

            <h3>Step 3: Step Into the Royal Era of Jaipur (Days 4-5)</h3>
            <p>End your loop in the capital of Rajasthan, painted pink in 1876 to welcome the Prince of Wales.</p>
            <ul>
              <li><strong>Amber Fort:</strong> Ride or hike up the cobblestone paths of this majestic hilltop palace complex, known for its intricate Sheesh Mahal (Mirror Palace).</li>
              <li><strong>Hawa Mahal & City Palace:</strong> Admire the iconic honeycombed facade of the Palace of the Winds and explore the regal collections of the royal family.</li>
              <li><strong>Local Bazaars:</strong> Shop for traditional block-print textiles, blue pottery, and exquisite hand-cut gemstones.</li>
            </ul>

            <p>Our intelligent AI travel engine helps you balance your transit schedules, book premium AC express trains, and optimize your local sightseeing hours for a flawless, stress-free Golden Triangle trip.</p>
          </>
        }
        faqs={[
          { question: "What is the best order to visit the Golden Triangle?", answer: "The classic and most popular route is Delhi -> Agra -> Jaipur -> Delhi. This forms a perfect triangle and matches train and expressway connections ideally." },
          { question: "How many days are recommended for the Golden Triangle tour?", answer: "We recommend a minimum of 4 full days, but 5 to 6 days is the sweet spot. This allows 2 days in Delhi, 1 day in Agra, and 2 days in Jaipur, ensuring you don't feel rushed." },
          { question: "What is the best mode of transport between the cities?", answer: "AC Express trains like the Gatimaan Express (Delhi-Agra) and Shatabdi Express are fast, clean, and highly comfortable. Alternatively, hiring a private AC cab via the Yamuna Expressway is extremely popular and flexible." }
        ]}
      />
    </LandingLayout>
  )
}
