import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms & Conditions | TripSage AI Travel Planner',
  description: 'Read the terms and conditions for using TripSage, your AI-powered travel planning platform.',
}

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-grid flex flex-col">
      <nav className="glass-dark sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="https://res.cloudinary.com/dob5llmb2/image/upload/v1774999435/LOGO_xbwcwe.png"
            alt="TripSage"
            width={40}
            height={40}
            className="rounded-xl"
            unoptimized
          />
          <span className="font-display text-xl font-bold gradient-text-green">TripSage</span>
        </Link>
        <Link href="/" className="text-sm text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors">
          Back to Home
        </Link>
      </nav>

      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full">
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">Terms & Conditions</h1>
        <p className="text-[var(--text-muted)] mb-12">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8 text-[var(--text-secondary)] text-sm md:text-base leading-relaxed">
          
          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">1. Introduction</h2>
            <p>
              Welcome to TripSage. TripSage is an AI-powered travel planning platform designed to help you generate itineraries, estimate budgets, and discover flights and hotels. We do not directly provide airlines, hotels, or transport services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">2. Use of Service</h2>
            <p>
              By using our service, you agree to provide accurate and complete information. TripSage is intended for personal, non-commercial use only. Any misuse of our platform may result in termination of your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">3. Third-Party Services</h2>
            <p>
              TripSage acts as a search engine and aggregator. We redirect you to external third-party providers (such as Skyscanner, Booking.com, etc.) for finalizing reservations. We are not responsible for the pricing, availability, cancellations, or service quality provided by these third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">4. Pricing & Affiliate Disclosure</h2>
            <p>
              All prices displayed on TripSage are dynamic, estimated, and subject to change based on real-time availability. The final booking and transaction occur on third-party platforms. TripSage may earn affiliate commissions from partner bookings made through our links.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">5. Cancellations & Refunds</h2>
            <p>
              TripSage does not process payments for flights or accommodations. Therefore, all cancellations, modifications, and refunds are strictly managed by the respective third-party providers according to their policies. We hold no liability for disputes regarding refunds.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">6. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, TripSage shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of the service. We are not responsible for travel delays, accidents, or other travel-related damages.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">7. User Responsibility</h2>
            <p>
              Users must independently verify all booking details, including dates, names, and pricing, before confirming any transaction on third-party sites. You are solely responsible for ensuring you have the necessary travel documents (passports, visas, IDs, medical certificates) required for your trip.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">8. Privacy Policy Reference</h2>
            <p>
              Your privacy is important to us. Please review our <Link href="/privacy-policy" className="text-[var(--primary)] hover:underline">Privacy Policy</Link> to understand how we collect, use, and safeguard your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">9. Modifications</h2>
            <p>
              TripSage reserves the right to modify or replace these Terms & Conditions at any time. We will provide notice of significant changes, but it is your responsibility to check this page periodically for updates.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">10. Governing Law</h2>
            <p>
              These Terms & Conditions shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or relating to these terms shall be subject to the exclusive jurisdiction of the courts in India.
            </p>
          </section>

        </div>
      </main>

      <footer className="border-t border-[var(--border)] px-6 py-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-[var(--primary)]">TripSage</span>
            <span className="text-[var(--text-muted)] text-xs">— AI Travel Operating System</span>
          </div>
          <div className="text-[var(--text-muted)] text-xs font-mono">
            © {new Date().getFullYear()} TripSage
          </div>
        </div>
      </footer>
    </div>
  )
}
