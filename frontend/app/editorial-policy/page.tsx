import type { Metadata } from 'next'
import Link from 'next/link'
import { FileEdit, Bot, AlertTriangle, RefreshCw, Clock, Mail, ExternalLink } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Editorial Policy | How TripSage Creates & Reviews Content — TripSage',
  description: 'Read TripSage\'s editorial policy: who writes travel content, our AI-assistance disclosure, how we handle corrections, and how often visa information is updated.',
  keywords: ['TripSage editorial policy', 'travel content policy', 'AI content disclosure', 'correction policy', 'editorial standards'],
  alternates: {
    canonical: 'https://tripsage.in/editorial-policy',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Editorial Policy | TripSage',
    description: 'How TripSage creates, reviews, and updates travel content — including our AI-assistance disclosure and correction policy.',
    url: 'https://tripsage.in/editorial-policy',
    siteName: 'TripSage',
    images: [{ url: 'https://tripsage.in/logo.png', width: 1200, height: 630, alt: 'TripSage Editorial Policy' }],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Editorial Policy | TripSage',
    description: 'Our editorial standards, AI-assistance disclosure, and correction policy.',
    images: ['https://tripsage.in/logo.png'],
  },
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://tripsage.in' },
    { '@type': 'ListItem', position: 2, name: 'Editorial Policy', item: 'https://tripsage.in/editorial-policy' },
  ],
}

const LAST_REVIEWED = 'September 2026'

export default function EditorialPolicyPage() {
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
          <span className="text-[#6B6B6B]">Editorial Policy</span>
        </nav>
      </div>

      {/* Hero */}
      <header className="max-w-4xl mx-auto px-6 pt-10 pb-8 w-full">
        <div className="inline-flex items-center gap-2 bg-[#FFF0E8] text-[#EA580C] text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
          <FileEdit size={12} />
          Editorial Standards
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-4 leading-tight">
          Editorial Policy
        </h1>
        <p className="text-[#6B6B6B] text-base md:text-lg leading-relaxed max-w-2xl">
          How we create, review, and maintain travel content on TripSage — and what we disclose about AI involvement.
        </p>
        <div className="flex items-center gap-2 mt-4 text-xs text-[#A1A1AA]">
          <Clock size={13} />
          <span>Last reviewed: <strong className="text-[#6B6B6B]">{LAST_REVIEWED}</strong></span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-4xl mx-auto px-6 pb-16 w-full space-y-8">

        {/* Who Writes Content */}
        <section className="bg-white border border-[#E8E0D8] rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-[#FFF0E8] flex items-center justify-center flex-shrink-0">
              <FileEdit size={18} className="text-[#EA580C]" />
            </div>
            <h2 className="text-xl font-bold text-[#1A1A1A]">Who Writes & Reviews Content</h2>
          </div>
          <div className="space-y-3 text-[#6B6B6B] text-sm leading-relaxed">
            <p>
              Travel content on TripSage — including destination guides, itineraries, visa summaries, and blog articles — is produced by the TripSage editorial team. Our editors are travel researchers and writers with practical knowledge of the destinations covered.
            </p>
            <p>
              All published content goes through the following process before it appears on the site:
            </p>
            <div className="space-y-3 mt-3">
              {[
                { step: '1', label: 'Research', desc: 'The writer researches official sources (embassy websites, government tourism portals, airline data) and cross-references with curated travel knowledge.' },
                { step: '2', label: 'Drafting', desc: 'A draft is created — sometimes with AI assistance to improve structure and coverage (see AI Disclosure below).' },
                { step: '3', label: 'Editorial review', desc: 'A human editor reviews the draft for accuracy, tone, and completeness against the research sources.' },
                { step: '4', label: 'Fact check', desc: 'Key facts (visa fees, entry requirements, attraction details) are verified against official sources immediately before publication.' },
                { step: '5', label: 'Publication', desc: 'The piece is published with a "Last reviewed" date indicating when the content was last verified.' },
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="w-7 h-7 rounded-full bg-[#FFF0E8] border border-[#FDDFC8] flex items-center justify-center flex-shrink-0 text-xs font-bold text-[#EA580C]">
                    {item.step}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1A1A1A]">{item.label}</p>
                    <p className="text-sm text-[#6B6B6B] mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-2">
              View our <Link href="/authors" className="text-[#EA580C] hover:underline">Authors page</Link> for individual team member profiles.
            </p>
          </div>
        </section>

        {/* AI Disclosure */}
        <section className="bg-[#F0F7FF] border border-[#BFDBFE] rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-[#BFDBFE] flex items-center justify-center flex-shrink-0">
              <Bot size={18} className="text-[#2563EB]" />
            </div>
            <h2 className="text-xl font-bold text-[#1A1A1A]">AI-Assistance Disclosure</h2>
          </div>
          <div className="space-y-3 text-[#6B6B6B] text-sm leading-relaxed">
            <p>
              TripSage uses large language models (LLMs) as a writing and structuring aid in content production. We are transparent about this:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-1 mt-2">
              <li><strong className="text-[#1A1A1A]">Itinerary planner (live tool):</strong> Responses are generated entirely by AI in real time. They are not individually reviewed by a human editor before delivery.</li>
              <li><strong className="text-[#1A1A1A]">Published destination guides & visa pages:</strong> AI may assist with drafting and structuring, but every published page is reviewed and fact-checked by a human editor before it goes live.</li>
              <li><strong className="text-[#1A1A1A]">Blog articles:</strong> May be AI-drafted with human review, or entirely human-written. Each article will indicate this in its byline where applicable.</li>
            </ul>
            <div className="bg-white border border-[#BFDBFE] rounded-xl p-4 mt-3">
              <p className="text-xs font-semibold text-[#1A1A1A] mb-1">Our commitment</p>
              <p className="text-xs text-[#6B6B6B]">We never publish AI-generated content without human review on pages where accuracy is safety-critical — specifically visa requirements, entry restrictions, and health advisories. A human editor must confirm such information against official government sources before publication.</p>
            </div>
          </div>
        </section>

        {/* Correction Policy */}
        <section className="bg-white border border-[#E8E0D8] rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-[#FFF0E8] flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={18} className="text-[#EA580C]" />
            </div>
            <h2 className="text-xl font-bold text-[#1A1A1A]">Correction Policy</h2>
          </div>
          <div className="space-y-3 text-[#6B6B6B] text-sm leading-relaxed">
            <p>
              TripSage takes accuracy seriously. If you find an error, outdated information, or a factual inaccuracy on any page, we want to know.
            </p>
            <div className="bg-[#F5F0EA] rounded-xl p-4">
              <p className="text-sm font-semibold text-[#1A1A1A] mb-2">How to report an error</p>
              <p className="text-sm text-[#6B6B6B]">
                Email{' '}
                <a href="mailto:rana@tripsage.in" className="text-[#EA580C] hover:underline">
                  rana@tripsage.in
                </a>{' '}
                with the subject line <strong className="text-[#1A1A1A]">"Content Correction — [page URL]"</strong>. Include the specific claim you believe is incorrect and, if possible, a link to the official source with the correct information.
              </p>
            </div>
            <p>
              Our editorial team will review the report within <strong className="text-[#1A1A1A]">5 business days</strong>. If the correction is confirmed, we will:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-1">
              <li>Update the page with the corrected information</li>
              <li>Update the "Last reviewed" date on the page</li>
              <li>For material factual errors, add a brief correction note at the bottom of the page</li>
            </ul>
          </div>
        </section>

        {/* Update Policy for Visa Info */}
        <section className="bg-white border border-[#E8E0D8] rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-[#FFF0E8] flex items-center justify-center flex-shrink-0">
              <RefreshCw size={18} className="text-[#EA580C]" />
            </div>
            <h2 className="text-xl font-bold text-[#1A1A1A]">Update Schedule for Visa Information</h2>
          </div>
          <div className="space-y-3 text-[#6B6B6B] text-sm leading-relaxed">
            <p>
              Visa requirements change frequently and without public notice. TripSage follows this update schedule for visa-related content:
            </p>
            <div className="space-y-3 mt-2">
              {[
                {
                  freq: 'Monthly',
                  scope: 'High-traffic visa pages',
                  detail: 'Top destinations (e.g., Bali, Thailand, Dubai, Singapore, Sri Lanka) are reviewed every month against official embassy sources.',
                },
                {
                  freq: 'Quarterly',
                  scope: 'Standard visa pages',
                  detail: 'All other destination visa pages are reviewed at least once every three months.',
                },
                {
                  freq: 'Immediately',
                  scope: 'Policy changes & alerts',
                  detail: 'If we become aware of a significant visa policy change (e.g., a country suspends visa-on-arrival for Indian passport holders), we update the affected page within 48 hours.',
                },
              ].map((row) => (
                <div key={row.freq} className="flex gap-4 p-4 bg-[#F5F0EA] rounded-xl">
                  <span className="text-xs font-bold text-[#EA580C] bg-[#FDDFC8] px-2 py-1 rounded-lg h-fit flex-shrink-0">{row.freq}</span>
                  <div>
                    <p className="text-sm font-semibold text-[#1A1A1A]">{row.scope}</p>
                    <p className="text-xs text-[#6B6B6B] mt-0.5">{row.detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-2">
              Despite this schedule, visa rules can change between review cycles. Always verify visa requirements through the official embassy or consulate of your destination country before applying.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section className="bg-[#F5F0EA] rounded-2xl p-6">
          <h2 className="text-base font-bold text-[#1A1A1A] mb-3">Editorial Contact</h2>
          <div className="flex items-center gap-3 text-sm text-[#6B6B6B]">
            <Mail size={15} className="text-[#EA580C] flex-shrink-0" />
            <span>For corrections, queries, or editorial feedback: <a href="mailto:rana@tripsage.in" className="text-[#EA580C] hover:underline">rana@tripsage.in</a></span>
          </div>
          <div className="mt-4 pt-4 border-t border-[#E8E0D8] flex flex-wrap gap-4">
            {[
              { href: '/about', label: 'About TripSage' },
              { href: '/methodology', label: 'Our Methodology' },
              { href: '/authors', label: 'Our Authors' },
              { href: '/sources', label: 'Sources & References' },
            ].map((link) => (
              <Link key={link.href} href={link.href} className="text-sm text-[#6B6B6B] hover:text-[#EA580C] hover:underline transition-colors">
                {link.label}
              </Link>
            ))}
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
