import type { Metadata } from 'next'
import LandingLayout from '@/components/layout/LandingLayout'
import SEOContent from '@/components/ui/SEOContent'

export const metadata: Metadata = {
  title: 'Best Weekend Trips from Hyderabad | Nearby Getaways | TripSage',
  description: 'Discover the best weekend getaways from Hyderabad within 200-500km. Plan trips to Hampi, Gokarna, Srisailam, and more with TripSage AI.',
  keywords: ['weekend trips from Hyderabad', 'getaways near Hyderabad', 'Hyderabad weekend guide', 'Hampi from Hyderabad'],
  alternates: { canonical: 'https://tripsage.in/weekend-trips-from-hyderabad' }
}

export default function Page() {
  return (
    <LandingLayout>
      <SEOContent
        title="Top Weekend Getaways from Hyderabad"
        subtitle="Need a break from the city? Explore stunning historic sites, serene hill stations, and beautiful beaches just a few hours from Hyderabad."
        heroImage="https://images.unsplash.com/photo-1589133405370-96f30e9f8072?w=1920&q=90"
        content={
          <>
            <h2>Escape the City: Weekend Destinations Near Hyderabad</h2>
            <p>Hyderabad is perfectly located for some of India's most unique weekend trips. Whether you're looking for spiritual peace, historical wonder, or adventure, there's something for everyone.</p>
            <h3>Popular Destinations</h3>
            <ul>
              <li><strong>Hampi (370km):</strong> Step back in time among the ruins of the Vijayanagara Empire. A must-visit for history buffs and photographers.</li>
              <li><strong>Srisailam (213km):</strong> A spiritual retreat nestled in the Nallamala Hills, famous for the Mallikarjuna Jyotirlinga.</li>
              <li><strong>Ananthagiri Hills (80km):</strong> The perfect day trip or quick overnight stay for nature lovers and trekkers.</li>
            </ul>
            <p>Use our AI planner to check the best routes, book buses or cabs, and find the perfect resort for your weekend escape.</p>
          </>
        }
        faqs={[
          { question: "What is the best 2-day trip from Hyderabad?", answer: "Hampi or Gandikota are excellent for 2-day trips, offering a mix of adventure and sightseeing." },
          { question: "Are there any hill stations near Hyderabad?", answer: "Ananthagiri Hills is the closest, while Horsley Hills and Lambasingi are popular options a bit further away." },
          { question: "Is it better to take a bus or drive?", answer: "For places like Hampi, overnight buses are very comfortable. For Srisailam or Ananthagiri, a self-drive is highly recommended." }
        ]}
      />
    </LandingLayout>
  )
}
