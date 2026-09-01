import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Users, Sparkles, ExternalLink, MapPin, ShieldCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Our Leadership & Content Team | TripSage',
  description: 'Meet Ranadheer Patel (Founder) and Saram Vishnu Patel (Co-Founder), and the editorial team behind TripSage\'s AI travel planning platform in Hyderabad, India.',
  keywords: ['TripSage founders', 'Ranadheer Patel', 'Saram Vishnu Patel', 'TripSage authors', 'travel technology India', 'TripSage team Hyderabad'],
  alternates: {
    canonical: 'https://tripsage.in/authors',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Our Leadership & Editorial Team | TripSage',
    description: 'Meet the founders and editorial team behind TripSage\'s AI-powered travel platform.',
    url: 'https://tripsage.in/authors',
    siteName: 'TripSage',
    images: [{ url: 'https://tripsage.in/logo.png', width: 1200, height: 630, alt: 'TripSage Leadership & Authors' }],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Our Leadership & Editorial Team | TripSage',
    description: 'Meet the founders and travel researchers behind TripSage.',
    images: ['https://tripsage.in/logo.png'],
  },
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://tripsage.in' },
    { '@type': 'ListItem', position: 2, name: 'Authors & Leadership', item: 'https://tripsage.in/authors' },
  ],
}

const foundersSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': 'https://tripsage.in/authors#ranadheer-patel',
      name: 'Ranadheer Patel',
      jobTitle: 'Founder',
      worksFor: {
        '@type': 'Organization',
        name: 'TripSage',
        url: 'https://tripsage.in',
      },
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Hyderabad',
        addressRegion: 'Telangana',
        addressCountry: 'India',
      },
      description: 'Founder of TripSage, entrepreneur and developer building AI-powered travel planning products.',
      knowsAbout: ['Business Economics', 'Entrepreneurship', 'Software Development', 'AI Travel Systems'],
    },
    {
      '@type': 'Person',
      '@id': 'https://tripsage.in/authors#saram-vishnu-patel',
      name: 'Saram Vishnu Patel',
      jobTitle: 'Co-Founder',
      worksFor: {
        '@type': 'Organization',
        name: 'TripSage',
        url: 'https://tripsage.in',
      },
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Hyderabad',
        addressRegion: 'Telangana',
        addressCountry: 'India',
      },
      description: 'Co-Founder of TripSage, builder, technologist, and entrepreneur turning ideas into practical travel solutions.',
      knowsAbout: ['Product Engineering', 'Technology Innovation', 'Entrepreneurship', 'Travel Tech'],
    },
  ],
}

const LEADERSHIP = [
  {
    name: 'Ranadheer Patel',
    role: 'Founder',
    location: 'Hyderabad, Telangana, India',
    quote: 'The best way to learn is to build.',
    bio: `I’m Ranadheer Patel, an entrepreneur and computer science student who believes that the best way to learn is to build. My journey started with curiosity about technology, business, and how ideas can become real products. Along the way, I began building TripSage, an AI-powered travel planning platform.

I’ve learned that entrepreneurship isn’t just about having a great idea — it’s about solving problems, facing failures, adapting quickly, and consistently taking action. Today, I’m focused on becoming a better builder, entrepreneur, and problem solver, with a long-term goal of creating products that people genuinely find useful. I’m still at the beginning of the journey and that’s what makes it exciting.`,
    skills: ['Business Economics', 'Entrepreneurship', 'Full-Stack Development', 'AI Product Design'],
    initials: 'RP',
  },
  {
    name: 'Saram Vishnu Patel',
    role: 'Co-Founder',
    location: 'Hyderabad, Telangana, India',
    quote: 'Ideas become meaningful only when you have the courage to build them.',
    bio: `Saram Vishnu Patel is a technology enthusiast, builder, and entrepreneur who believes that ideas become meaningful only when you have the courage to build them.

His journey is driven by curiosity — the desire to understand technology, experiment with ideas, and turn problems into practical solutions. Instead of waiting until everything is perfect, Vishnu prefers to learn by doing, making mistakes, and improving along the way.

As a co-founder, he brings a hands-on mindset to the journey: build, test, learn, and keep moving forward. For Vishnu, entrepreneurship is more than building a company — it is about challenging himself, growing through difficult moments, and creating something that can genuinely help people. He is still at the beginning of his journey and intends to build far beyond where he started.`,
    skills: ['Technology Strategy', 'Product Engineering', 'Rapid Experimentation', 'Operations'],
    initials: 'VP',
  },
]

const EDITORIAL_ROLES = [
  {
    role: 'Lead Travel Research & Itinerary Specialist',
    focus: 'Domestic and international route optimization, budget accuracy, and regional cultural recommendations.',
  },
  {
    role: 'Visa & Regulatory Content Reviewer',
    focus: 'Cross-verifying embassy guidelines, visa-on-arrival entry rules, and official consular documentation.',
  },
  {
    role: 'Transport Intelligence & Rail/Bus Analyst',
    focus: 'Indian Railways schedules, intercity bus connectivity, and flight search intelligence.',
  },
]

export default function AuthorsPage() {
  return (
    <div className="min-h-screen bg-[#FFFBF7] flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(foundersSchema) }}
      />

      {/* Navbar */}
      <nav className="glass-dark sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-[#E8E0D8]">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="TripSage" width={36} height={36} className="rounded-xl w-[36px] h-[36px] object-contain" />
          <span className="font-bold text-xl text-[#1A1A1A]">TripSage</span>
        </Link>
        <Link href="/" className="text-sm text-[#6B6B6B] hover:text-[#EA580C] transition-colors">← Back to Home</Link>
      </nav>

      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto px-6 pt-6 w-full">
        <nav aria-label="Breadcrumb" className="text-xs text-[#A1A1AA] flex items-center gap-1.5">
          <Link href="/" className="hover:text-[#EA580C] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[#6B6B6B]">Authors &amp; Leadership</span>
        </nav>
      </div>

      {/* Hero */}
      <header className="max-w-4xl mx-auto px-6 pt-10 pb-8 w-full">
        <div className="inline-flex items-center gap-2 bg-[#FFF0E8] text-[#EA580C] text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
          <Users size={12} />
          Founders &amp; Editorial Team
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-4 leading-tight">
          People Behind TripSage
        </h1>
        <p className="text-[#6B6B6B] text-base md:text-lg leading-relaxed max-w-2xl">
          TripSage is built and maintained by a team of builders, researchers, and travel technologists based in Hyderabad, Telangana, India.
        </p>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-6 pb-16 w-full space-y-10">

        {/* Founders Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FFF0E8] flex items-center justify-center">
              <Sparkles size={16} className="text-[#EA580C]" />
            </div>
            <h2 className="text-2xl font-bold text-[#1A1A1A]">Founders &amp; Leadership</h2>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {LEADERSHIP.map((member) => (
              <article
                key={member.name}
                className="bg-white border border-[#E8E0D8] rounded-3xl p-6 md:p-8 shadow-xs hover:border-[#EA580C]/40 transition-all"
              >
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  {/* Avatar / Badge */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#EA580C] to-[#C2410C] text-white font-bold text-xl flex items-center justify-center flex-shrink-0 shadow-md">
                    {member.initials}
                  </div>

                  <div className="flex-1 min-w-0 space-y-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5 mb-1">
                        <h3 className="text-xl font-bold text-[#1A1A1A]">{member.name}</h3>
                        <span className="bg-[#FFF0E8] text-[#EA580C] text-xs font-semibold px-2.5 py-0.5 rounded-full">
                          {member.role}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-[#6B6B6B]">
                        <MapPin size={13} className="text-[#EA580C]" />
                        <span>{member.location}</span>
                      </div>
                    </div>

                    {/* Founder Quote */}
                    <div className="border-l-2 border-[#EA580C] pl-3 py-0.5 italic text-sm text-[#44403C] font-medium bg-[#FFFBF7] rounded-r-lg">
                      &ldquo;{member.quote}&rdquo;
                    </div>

                    {/* Bio */}
                    <div className="text-sm text-[#57534E] leading-relaxed space-y-2 whitespace-pre-line">
                      {member.bio}
                    </div>

                    {/* Skills / Expertise */}
                    <div className="pt-3 border-t border-[#F5F0EA]">
                      <span className="text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider block mb-2">
                        Core Competencies &amp; Focus
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {member.skills.map((skill) => (
                          <span
                            key={skill}
                            className="bg-[#FAF7F2] text-[#44403C] border border-[#E8E0D8] text-xs font-medium px-2.5 py-1 rounded-lg"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Editorial Team Workflow */}
        <section className="bg-white border border-[#E8E0D8] rounded-3xl p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FFF0E8] flex items-center justify-center">
              <ShieldCheck size={16} className="text-[#EA580C]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1A1A1A]">Editorial Review &amp; Research Desk</h2>
              <p className="text-xs text-[#6B6B6B]">Our multi-step verification process for travel itineraries and guides</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {EDITORIAL_ROLES.map((role, idx) => (
              <div
                key={idx}
                className="bg-[#FFFBF7] border border-[#E8E0D8] rounded-2xl p-5 space-y-2"
              >
                <div className="w-7 h-7 rounded-lg bg-[#FFF0E8] text-[#EA580C] text-xs font-bold flex items-center justify-center">
                  0{idx + 1}
                </div>
                <h3 className="font-bold text-sm text-[#1A1A1A]">{role.role}</h3>
                <p className="text-xs text-[#6B6B6B] leading-relaxed">{role.focus}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#FAF7F2] border border-[#E8E0D8] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#6B6B6B]">
            <span>Learn how we research, draft, fact-check, and maintain our travel information.</span>
            <Link
              href="/editorial-policy"
              className="inline-flex items-center gap-1.5 font-semibold text-[#EA580C] hover:underline whitespace-nowrap"
            >
              Editorial Policy <ExternalLink size={12} />
            </Link>
          </div>
        </section>

        {/* Related Pages */}
        <section className="bg-[#F5F0EA] rounded-2xl p-6">
          <h2 className="text-base font-bold text-[#1A1A1A] mb-4">Related Trust &amp; Authority Pages</h2>
          <div className="flex flex-wrap gap-4">
            {[
              { href: '/about', label: 'About TripSage' },
              { href: '/methodology', label: 'Our Methodology' },
              { href: '/editorial-policy', label: 'Editorial Policy' },
              { href: '/sources', label: 'Sources & Official Links' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-[#6B6B6B] hover:text-[#EA580C] hover:underline transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E8E0D8] px-6 py-8 bg-white">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-[#EA580C]">TripSage</span>
            <span className="text-[#A1A1AA] text-xs">— AI Travel Planning Platform</span>
          </div>
          <div className="text-[#A1A1AA] text-xs">
            © {new Date().getFullYear()} TripSage. Hyderabad, Telangana, India. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
