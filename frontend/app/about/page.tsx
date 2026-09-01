import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, Mail, Calendar, Shield, Info, ExternalLink, BookOpen, Users, Compass } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About TripSage | AI-Powered Travel Planning for India',
  description: 'Learn what TripSage does, who it is for, and how it works. TripSage is an AI travel planning tool — not a booking provider or travel agency.',
  keywords: ['about TripSage', 'TripSage travel planner', 'AI travel planning India', 'TripSage team', 'TripSage mission'],
  alternates: {
    canonical: 'https://tripsage.in/about',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'About TripSage | AI-Powered Travel Planning for India',
    description: 'TripSage is an AI-powered travel planning platform built for Indian travellers. Learn what we do, who we serve, and what we do not do.',
    url: 'https://tripsage.in/about',
    siteName: 'TripSage',
    images: [
      {
        url: 'https://tripsage.in/logo.png',
        width: 1200,
        height: 630,
        alt: 'About TripSage — AI Travel Planning Platform',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About TripSage | AI-Powered Travel Planning for India',
    description: 'TripSage is an AI travel planning tool — not a booking provider or travel agency. Learn about our mission and how we work.',
    images: ['https://tripsage.in/logo.png'],
  },
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://tripsage.in',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'About',
      item: 'https://tripsage.in/about',
    },
  ],
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'TripSage',
  url: 'https://tripsage.in',
  logo: 'https://tripsage.in/logo.png',
  foundingDate: '2026',
  foundingLocation: {
    '@type': 'Place',
    name: 'Hyderabad, Telangana, India',
  },
  founder: [
    {
      '@type': 'Person',
      name: 'Ranadheer Patel',
      jobTitle: 'Founder',
    },
    {
      '@type': 'Person',
      name: 'Saram Vishnu Patel',
      jobTitle: 'Co-Founder',
    },
  ],
  description: 'AI-powered travel planning platform designed to create personalized itineraries, calculate realistic travel budgets, and provide visa guides.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FFFBF7] flex flex-col">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      {/* Navbar */}
      <nav className="glass-dark sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-[#E8E0D8]">
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="TripSage"
            width={36}
            height={36}
            className="rounded-xl w-[36px] h-[36px] object-contain"
          />
          <span className="font-bold text-xl text-[#1A1A1A]">TripSage</span>
        </Link>
        <Link
          href="/"
          className="text-sm text-[#6B6B6B] hover:text-[#EA580C] transition-colors"
        >
          ← Back to Home
        </Link>
      </nav>

      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto px-6 pt-6 w-full">
        <nav aria-label="Breadcrumb" className="text-xs text-[#A1A1AA] flex items-center gap-1.5">
          <Link href="/" className="hover:text-[#EA580C] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[#6B6B6B]">About</span>
        </nav>
      </div>

      {/* Hero */}
      <header className="max-w-4xl mx-auto px-6 pt-10 pb-8 w-full">
        <div className="inline-flex items-center gap-2 bg-[#FFF0E8] text-[#EA580C] text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
          <Info size={12} />
          Company Overview
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-4 leading-tight">
          About TripSage
        </h1>
        <p className="text-[#6B6B6B] text-base md:text-lg leading-relaxed max-w-2xl">
          TripSage is an AI-powered travel planning platform built for Indian travellers. We help you plan smarter trips — not book them for you.
        </p>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-6 pb-16 w-full">
        <div className="space-y-10">

          {/* What TripSage Does */}
          <section className="bg-white border border-[#E8E0D8] rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-[#FFF0E8] flex items-center justify-center flex-shrink-0">
                <Compass size={18} className="text-[#EA580C]" />
              </div>
              <h2 className="text-xl font-bold text-[#1A1A1A]">What TripSage Does</h2>
            </div>
            <div className="space-y-3 text-[#6B6B6B] text-sm leading-relaxed">
              <p>
                TripSage uses artificial intelligence to generate personalised travel itineraries, estimate trip budgets, summarise visa requirements, and surface flight and hotel options — all in one place.
              </p>
              <p>
                When you describe your destination, travel dates, group size, and budget, TripSage builds a day-by-day plan tailored to your preferences. You can explore visa requirements for popular destinations, estimate costs across accommodation, food, transport, and activities, and discover curated destination guides.
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-1 mt-3">
                <li>AI-generated trip itineraries for domestic and international destinations</li>
                <li>Budget estimations broken down by category</li>
                <li>Visa requirement summaries for popular countries</li>
                <li>Flight and hotel search powered by third-party search APIs</li>
                <li>Destination guides and travel blog articles</li>
              </ul>
            </div>
          </section>

          {/* Who It Is For */}
          <section className="bg-white border border-[#E8E0D8] rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-[#FFF0E8] flex items-center justify-center flex-shrink-0">
                <Users size={18} className="text-[#EA580C]" />
              </div>
              <h2 className="text-xl font-bold text-[#1A1A1A]">Who TripSage Is For</h2>
            </div>
            <div className="space-y-3 text-[#6B6B6B] text-sm leading-relaxed">
              <p>TripSage is built for:</p>
              <ul className="list-disc list-inside space-y-1.5 pl-1">
                <li><strong className="text-[#1A1A1A]">Independent travellers</strong> who plan their own trips and want AI to do the heavy lifting</li>
                <li><strong className="text-[#1A1A1A]">Budget-conscious travellers</strong> who need realistic cost breakdowns before they commit</li>
                <li><strong className="text-[#1A1A1A]">First-time international travellers</strong> from India who want clear visa and documentation guidance</li>
                <li><strong className="text-[#1A1A1A]">Families and groups</strong> planning multi-leg trips with multiple accommodation and transport needs</li>
                <li><strong className="text-[#1A1A1A]">Travel researchers</strong> comparing destinations, costs, and logistics before deciding</li>
              </ul>
            </div>
          </section>

          {/* What TripSage Does NOT Do */}
          <section className="bg-[#FFF8F5] border border-[#FDDFC8] rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-[#FDDFC8] flex items-center justify-center flex-shrink-0">
                <Shield size={18} className="text-[#EA580C]" />
              </div>
              <h2 className="text-xl font-bold text-[#1A1A1A]">What TripSage Does NOT Do</h2>
            </div>
            <p className="text-[#6B6B6B] text-sm leading-relaxed mb-4">
              We believe in being upfront about our role in your travel journey:
            </p>
            <div className="space-y-3">
              {[
                {
                  label: 'Not a booking provider',
                  desc: "TripSage does not sell airline tickets, hotel rooms, bus passes, or tour packages. We display search results and redirect you to the respective provider's website to complete your booking.",
                },
                {
                  label: 'Not a travel agency',
                  desc: 'We are not a licensed travel agency and do not provide travel insurance, visa application services, or on-ground support.',
                },
                {
                  label: 'Not a visa authority',
                  desc: 'Visa summaries on TripSage are informational only. Always verify visa requirements through the official embassy or consulate of your destination country.',
                },
                {
                  label: 'Not a referral or affiliate platform',
                  desc: 'TripSage may earn revenue through affiliate links on some bookings, but this does not influence the recommendations or rankings you see on our platform.',
                },
              ].map((item) => (
                <div key={item.label} className="flex gap-3">
                  <span className="text-[#EA580C] font-bold text-lg leading-none mt-0.5 flex-shrink-0">×</span>
                  <div>
                    <span className="font-semibold text-[#1A1A1A] text-sm">{item.label} — </span>
                    <span className="text-[#6B6B6B] text-sm">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Leadership & Founders */}
          <section className="bg-white border border-[#E8E0D8] rounded-2xl p-6 md:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FFF0E8] flex items-center justify-center flex-shrink-0">
                  <Users size={18} className="text-[#EA580C]" />
                </div>
                <h2 className="text-xl font-bold text-[#1A1A1A]">Founders &amp; Leadership</h2>
              </div>
              <Link
                href="/authors"
                className="text-xs font-semibold text-[#EA580C] hover:underline inline-flex items-center gap-1"
              >
                Meet the Team <ExternalLink size={12} />
              </Link>
            </div>
            <p className="text-[#6B6B6B] text-sm leading-relaxed">
              TripSage was founded in Hyderabad by builders who believe that the best way to solve travel complexity is through technology and hands-on experimentation.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-[#FFFBF7] border border-[#E8E0D8] rounded-xl p-4">
                <span className="text-xs font-semibold text-[#EA580C] bg-[#FFF0E8] px-2 py-0.5 rounded-full inline-block mb-1">
                  Founder
                </span>
                <h3 className="font-bold text-[#1A1A1A] text-base">Ranadheer Patel</h3>
                <p className="text-xs text-[#6B6B6B] mt-1 leading-relaxed">
                  Entrepreneur &amp; computer science student focused on building products that solve real travel friction.
                </p>
              </div>
              <div className="bg-[#FFFBF7] border border-[#E8E0D8] rounded-xl p-4">
                <span className="text-xs font-semibold text-[#EA580C] bg-[#FFF0E8] px-2 py-0.5 rounded-full inline-block mb-1">
                  Co-Founder
                </span>
                <h3 className="font-bold text-[#1A1A1A] text-base">Saram Vishnu Patel</h3>
                <p className="text-xs text-[#6B6B6B] mt-1 leading-relaxed">
                  Technologist &amp; builder with a hands-on mindset: build, test, learn, and improve practical solutions.
                </p>
              </div>
            </div>
          </section>

          {/* Mission */}
          <section className="bg-white border border-[#E8E0D8] rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-[#FFF0E8] flex items-center justify-center flex-shrink-0">
                <BookOpen size={18} className="text-[#EA580C]" />
              </div>
              <h2 className="text-xl font-bold text-[#1A1A1A]">Our Mission</h2>
            </div>
            <p className="text-[#6B6B6B] text-sm leading-relaxed">
              Founded in 2026 and based in Hyderabad, Telangana, TripSage was built on a simple belief: planning a trip should be as enjoyable as taking one. We use AI to collapse hours of research into minutes, so you can spend more time looking forward to your journey and less time lost in spreadsheets and browser tabs.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-white border border-[#E8E0D8] rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-5">Contact &amp; Support</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-[#6B6B6B]">
                <Mail size={16} className="text-[#EA580C] flex-shrink-0" />
                <span>
                  General support:{' '}
                  <a
                    href="mailto:rana@tripsage.in"
                    className="text-[#EA580C] hover:underline"
                  >
                    rana@tripsage.in
                  </a>
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[#6B6B6B]">
                <MapPin size={16} className="text-[#EA580C] flex-shrink-0" />
                <span>Hyderabad, Telangana, India</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[#6B6B6B]">
                <Calendar size={16} className="text-[#EA580C] flex-shrink-0" />
                <span>Founded 2026</span>
              </div>
            </div>
            <div className="mt-5 pt-5 border-t border-[#E8E0D8]">
              <Link
                href="/support"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#EA580C] hover:underline"
              >
                Visit our Support Centre <ExternalLink size={13} />
              </Link>
            </div>
          </section>

          {/* Trust Links */}
          <section className="bg-[#F5F0EA] rounded-2xl p-6">
            <h2 className="text-base font-bold text-[#1A1A1A] mb-4">More from TripSage</h2>
            <div className="flex flex-wrap gap-3">
              {[
                { href: '/methodology', label: 'Our Methodology' },
                { href: '/editorial-policy', label: 'Editorial Policy' },
                { href: '/authors', label: 'Our Authors' },
                { href: '/sources', label: 'Sources & References' },
                { href: '/terms-and-conditions', label: 'Terms & Conditions' },
                { href: '/support', label: 'Support' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-[#6B6B6B] hover:text-[#EA580C] hover:underline transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E8E0D8] px-6 py-8">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-[#EA580C]">TripSage</span>
            <span className="text-[#A1A1AA] text-xs">— AI Travel Planning</span>
          </div>
          <div className="text-[#A1A1AA] text-xs">
            © {new Date().getFullYear()} TripSage. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
