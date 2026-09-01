import type { Metadata } from 'next'
import Link from 'next/link'
import { ExternalLink, Globe, Plane, Building2, Map, AlertTriangle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Sources & References | Official Travel & Visa Sources Used by TripSage',
  description: 'A curated list of official government, embassy, airline, and tourism sources that TripSage uses to compile itineraries, visa guides, and travel information.',
  keywords: ['TripSage sources', 'travel information sources', 'visa sources India', 'official embassy sources', 'government travel portals'],
  alternates: {
    canonical: 'https://tripsage.in/sources',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Sources & References | TripSage',
    description: 'Official government, embassy, airline, and tourism portals used by TripSage to compile travel and visa information.',
    url: 'https://tripsage.in/sources',
    siteName: 'TripSage',
    images: [{ url: 'https://tripsage.in/logo.png', width: 1200, height: 630, alt: 'TripSage Sources & References' }],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sources & References | TripSage',
    description: 'Official sources TripSage uses for visa, travel, airline, and hotel information.',
    images: ['https://tripsage.in/logo.png'],
  },
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://tripsage.in' },
    { '@type': 'ListItem', position: 2, name: 'Sources', item: 'https://tripsage.in/sources' },
  ],
}

const sourceGroups = [
  {
    icon: Globe,
    title: 'Government & Visa Sources',
    desc: 'Official government and embassy portals for visa and entry requirement information.',
    sources: [
      {
        name: 'Ministry of External Affairs, India',
        desc: 'Official passport, visa, and travel advisory portal for Indian citizens.',
        url: 'https://www.mea.gov.in',
        category: 'India Government',
      },
      {
        name: 'FRRO — Foreigners Regional Registration Office',
        desc: 'Foreign national registration and visa extension information for India.',
        url: 'https://indianfrro.gov.in',
        category: 'India Government',
      },
      {
        name: 'India e-Visa Portal',
        desc: 'Official portal for applying for an Indian e-Visa.',
        url: 'https://indianvisaonline.gov.in',
        category: 'India Government',
      },
      {
        name: 'Indonesia Directorate General of Immigration',
        desc: 'Official source for Bali / Indonesia visa-on-arrival and e-VOA information.',
        url: 'https://www.imigrasi.go.id',
        category: 'Bali / Indonesia',
      },
      {
        name: 'Thailand e-Visa Portal',
        desc: 'Official Thai government portal for e-Visa applications.',
        url: 'https://www.thaievisa.go.th',
        category: 'Thailand',
      },
      {
        name: 'UAE Federal Authority for Identity, Citizenship, Customs & Port Security (ICP)',
        desc: 'Official Dubai / UAE visa information and entry requirements.',
        url: 'https://icp.gov.ae',
        category: 'Dubai / UAE',
      },
      {
        name: 'Singapore Immigration & Checkpoints Authority (ICA)',
        desc: 'Official Singapore visa and entry requirement information.',
        url: 'https://www.ica.gov.sg',
        category: 'Singapore',
      },
      {
        name: 'Sri Lanka Department of Immigration & Emigration',
        desc: 'Official portal for Sri Lanka ETA and visa information.',
        url: 'https://www.immigration.gov.lk',
        category: 'Sri Lanka',
      },
      {
        name: 'Malaysia Immigration Department',
        desc: 'Official portal for Malaysia visa and entry requirement information.',
        url: 'https://www.imi.gov.my',
        category: 'Malaysia',
      },
      {
        name: 'Nepal Department of Immigration',
        desc: 'Official portal for Nepal visa-on-arrival and entry requirements.',
        url: 'https://www.immigration.gov.np',
        category: 'Nepal',
      },
    ],
  },
  {
    icon: Plane,
    title: 'Aviation Sources',
    desc: 'Official aviation regulators and organisations used for airline and flight information.',
    sources: [
      {
        name: 'Directorate General of Civil Aviation (DGCA), India',
        desc: 'Indian aviation regulator — airline safety, passenger rights, and airfare data.',
        url: 'https://www.dgca.gov.in',
        category: 'India',
      },
      {
        name: 'IATA — International Air Transport Association',
        desc: 'Global aviation standards, travel documentation requirements, and airline data.',
        url: 'https://www.iata.org',
        category: 'International',
      },
      {
        name: 'Airports Authority of India (AAI)',
        desc: 'Indian airport information, terminals, and operational details.',
        url: 'https://www.aai.aero',
        category: 'India',
      },
    ],
  },
  {
    icon: Building2,
    title: 'Hotel & Accommodation Sources',
    desc: 'Official and industry sources for accommodation classifications and standards.',
    sources: [
      {
        name: 'Ministry of Tourism, India — Hotel Classification',
        desc: 'Official star category classifications for hotels across India.',
        url: 'https://tourism.gov.in',
        category: 'India Government',
      },
      {
        name: 'Hotel Association of India (HAI)',
        desc: 'Industry body for the Indian hotel sector, standards, and guidelines.',
        url: 'https://www.hotelassociationofindia.com',
        category: 'Industry Body',
      },
    ],
  },
  {
    icon: Map,
    title: 'Tourism & Destination Sources',
    desc: 'Official tourism boards and government travel portals used for destination guides and itinerary research.',
    sources: [
      {
        name: 'Incredible India — Ministry of Tourism',
        desc: 'Official India tourism portal with destination guides, festivals, and travel information.',
        url: 'https://www.incredibleindia.org',
        category: 'India Tourism',
      },
      {
        name: 'Telangana Tourism',
        desc: 'Official tourism portal for Telangana, including Hyderabad.',
        url: 'https://www.telanganatourism.gov.in',
        category: 'State Tourism',
      },
      {
        name: 'Goa Tourism — Department of Tourism',
        desc: 'Official tourism information for Goa.',
        url: 'https://www.goatourism.gov.in',
        category: 'State Tourism',
      },
      {
        name: 'Kerala Tourism',
        desc: 'Official Kerala tourism portal — backwaters, houseboats, and destination guides.',
        url: 'https://www.keralatourism.org',
        category: 'State Tourism',
      },
      {
        name: 'Rajasthan Tourism',
        desc: 'Official portal for Rajasthan heritage, cultural, and desert tourism.',
        url: 'https://www.tourism.rajasthan.gov.in',
        category: 'State Tourism',
      },
      {
        name: 'Himachal Pradesh Tourism',
        desc: 'Official tourism portal for Himachal Pradesh including Manali and Shimla.',
        url: 'https://himachaltourism.gov.in',
        category: 'State Tourism',
      },
      {
        name: 'Jammu & Kashmir Tourism',
        desc: 'Official tourism portal for Jammu & Kashmir including Kashmir Valley and Ladakh.',
        url: 'https://jktourism.jk.gov.in',
        category: 'State Tourism',
      },
      {
        name: 'Andaman & Nicobar Islands Tourism',
        desc: 'Official tourism portal for Andaman & Nicobar Islands.',
        url: 'https://www.andamantourism.gov.in',
        category: 'UT Tourism',
      },
      {
        name: 'Tourism Authority of Thailand (TAT)',
        desc: 'Official Thailand tourism portal with destination and travel information.',
        url: 'https://www.tourismthailand.org',
        category: 'International',
      },
      {
        name: 'Bali Tourism Board — BPPD Bali',
        desc: 'Official Bali tourism authority for destination and travel information.',
        url: 'https://baliprovince.com',
        category: 'International',
      },
      {
        name: 'Dubai Tourism — Department of Economy & Tourism',
        desc: 'Official Dubai and UAE tourism portal.',
        url: 'https://www.visitdubai.com',
        category: 'International',
      },
      {
        name: 'Singapore Tourism Board',
        desc: 'Official Singapore travel and tourism information portal.',
        url: 'https://www.stb.gov.sg',
        category: 'International',
      },
    ],
  },
]

export default function SourcesPage() {
  return (
    <div className="min-h-screen bg-[#FFFBF7] flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Navbar */}
      <nav className="glass-dark sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-[#E8E0D8]">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="TripSage" width={36} height={36} className="rounded-xl w-[36px] h-[36px] object-contain" />
          <span className="font-bold text-xl text-[#1A1A1A]">TripSage</span>
        </Link>
        <Link href="/" className="text-sm text-[#6B6B6B] hover:text-[#EA580C] transition-colors">← Back to Home</Link>
      </nav>

      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto px-6 pt-6 w-full">
        <nav aria-label="Breadcrumb" className="text-xs text-[#A1A1AA] flex items-center gap-1.5">
          <Link href="/" className="hover:text-[#EA580C] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[#6B6B6B]">Sources</span>
        </nav>
      </div>

      {/* Hero */}
      <header className="max-w-4xl mx-auto px-6 pt-10 pb-8 w-full">
        <div className="inline-flex items-center gap-2 bg-[#FFF0E8] text-[#EA580C] text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
          <Globe size={12} />
          References
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-4 leading-tight">
          Sources & References
        </h1>
        <p className="text-[#6B6B6B] text-base md:text-lg leading-relaxed max-w-2xl">
          Official government, embassy, aviation, and tourism portals that TripSage uses to compile travel information, visa summaries, and destination guides.
        </p>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-4xl mx-auto px-6 pb-16 w-full space-y-8">

        {/* Disclaimer */}
        <div className="bg-[#FFF8F5] border border-[#FDDFC8] rounded-2xl p-5 flex gap-3">
          <AlertTriangle size={18} className="text-[#EA580C] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[#1A1A1A] mb-1">Always check official sources directly</p>
            <p className="text-sm text-[#6B6B6B] leading-relaxed">
              TripSage does not guarantee the currency of information on third-party websites. Government portals update their content independently. For the most accurate and up-to-date travel and visa information, always visit the official source directly before making any travel decisions.
            </p>
          </div>
        </div>

        {/* Source Groups */}
        {sourceGroups.map((group) => {
          const Icon = group.icon
          return (
            <section key={group.title} className="bg-white border border-[#E8E0D8] rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-[#FFF0E8] flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-[#EA580C]" />
                </div>
                <h2 className="text-xl font-bold text-[#1A1A1A]">{group.title}</h2>
              </div>
              <p className="text-sm text-[#6B6B6B] mb-5">{group.desc}</p>
              <div className="space-y-3">
                {group.sources.map((source) => (
                  <div key={source.name} className="flex items-start gap-3 p-3 bg-[#F5F0EA] rounded-xl hover:bg-[#EDE8E2] transition-colors group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-[#1A1A1A] group-hover:text-[#EA580C] transition-colors">
                          {source.name}
                        </span>
                        <span className="text-xs bg-[#FDDFC8] text-[#EA580C] px-1.5 py-0.5 rounded-full font-medium">
                          {source.category}
                        </span>
                      </div>
                      <p className="text-xs text-[#6B6B6B] mt-0.5 leading-relaxed">{source.desc}</p>
                    </div>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 flex items-center gap-1 text-xs text-[#EA580C] hover:underline font-medium mt-0.5"
                      aria-label={`Visit ${source.name} (opens in new tab)`}
                    >
                      Visit <ExternalLink size={11} />
                    </a>
                  </div>
                ))}
              </div>
            </section>
          )
        })}

        {/* Methodology link */}
        <section className="bg-[#F5F0EA] rounded-2xl p-6">
          <h2 className="text-base font-bold text-[#1A1A1A] mb-3">How We Use These Sources</h2>
          <p className="text-sm text-[#6B6B6B] leading-relaxed mb-4">
            Read our Methodology page to understand exactly how these sources inform TripSage itineraries, budget estimates, and visa summaries.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/methodology" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#EA580C] hover:underline">
              Our Methodology <ExternalLink size={13} />
            </Link>
            <Link href="/editorial-policy" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#EA580C] hover:underline">
              Editorial Policy <ExternalLink size={13} />
            </Link>
            <Link href="/about" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#EA580C] hover:underline">
              About TripSage <ExternalLink size={13} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#E8E0D8] px-6 py-8">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-[#EA580C]">TripSage</span>
            <span className="text-[#A1A1AA] text-xs">— AI Travel Planning</span>
          </div>
          <div className="text-[#A1A1AA] text-xs">© {new Date().getFullYear()} TripSage. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}
