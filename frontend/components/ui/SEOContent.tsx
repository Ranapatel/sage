'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight, CheckCircle2, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { getOptimizedImageUrl } from '@/lib/imageUtils'
import { useIsMobile } from '@/hooks/useIsMobile'

interface FAQ {
  question: string
  answer: string
}

interface SEOContentProps {
  title: string
  subtitle: string
  heroImage?: string
  content: React.ReactNode
  faqs: FAQ[]
  ctaText?: string
  ctaLink?: string
}

export default function SEOContent({
  title,
  subtitle,
  heroImage = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=90",
  content,
  faqs,
  ctaText = "Start Planning Now",
  ctaLink = "/plan"
}: SEOContentProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const pathname = usePathname()
  const isMobile = useIsMobile()

  // Generate dynamic BreadcrumbList Schema
  const domain = "https://tripsage.in"
  const pathSegments = pathname ? pathname.split('/').filter(Boolean) : []
  
  const breadcrumbElements = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: domain
    }
  ]

  let accumulatedPath = ""
  pathSegments.forEach((segment, index) => {
    accumulatedPath += `/${segment}`
    const displayName = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
    
    breadcrumbElements.push({
      "@type": "ListItem",
      position: index + 2,
      name: displayName,
      item: `${domain}${accumulatedPath}`
    })
  })

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbElements
  }

  // Generate dynamic FAQPage Schema
  const faqSchema = faqs && faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  } : null

  return (
    <div className="bg-[#FFFBF7] text-[#6B6B6B] font-body">
      {/* Dynamic SEO JSON-LD structured data */}
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Hero Section */}
      <section className="relative py-24 px-6 overflow-hidden bg-[#1A1A1A] text-white">
        <div className="absolute inset-0 z-0 opacity-30">
          <Image 
            src={getOptimizedImageUrl(heroImage, isMobile)} 
            alt={title} 
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A1A]/80 via-[#1A1A1A]/60 to-[#1A1A1A]" />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-orange-500/20 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold text-orange-300 mb-8 border border-orange-500/30"
          >
            <Sparkles className="w-4 h-4 text-orange-400" />
            AI-Powered Travel Intelligence
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold mb-8 tracking-tight font-display"
          >
            {title}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-200 max-w-3xl mx-auto mb-12 leading-relaxed font-medium"
          >
            {subtitle}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link href={ctaLink} className="py-4 px-10 text-lg font-extrabold inline-flex items-center gap-2 rounded-2xl bg-[#EA580C] hover:bg-[#C2410C] text-white shadow-xl shadow-orange-500/20 transition-all cursor-pointer">
              {ctaText} <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <div className="prose prose-slate prose-lg max-w-none prose-headings:text-[#1A1A1A] prose-headings:font-extrabold prose-headings:tracking-tight prose-a:text-[#EA580C] prose-img:rounded-3xl prose-blockquote:border-l-[#EA580C] prose-blockquote:bg-[#FFF4EE] prose-blockquote:p-6 prose-blockquote:rounded-r-2xl prose-blockquote:not-italic text-[#4A4A4A] leading-relaxed font-medium">
          {content}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 bg-white border-y border-[#E8E0D8]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-center mb-12 text-[#1A1A1A] font-display">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-[#FFFBF7] rounded-2xl border border-[#E8E0D8] overflow-hidden shadow-xs">
                <button 
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left font-extrabold text-[#1A1A1A] hover:bg-[#FFF4EE] transition-colors cursor-pointer text-sm md:text-base"
                >
                  {faq.question}
                  <ChevronDown className={`w-5 h-5 text-[#EA580C] transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6 text-[#6B6B6B] leading-relaxed text-sm font-medium border-t border-[#E8E0D8]/60 pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-[#EA580C] via-[#F97316] to-[#EA580C] rounded-[36px] p-10 md:p-16 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6 font-display">Ready for your next adventure?</h2>
          <p className="text-orange-100 mb-10 text-base md:text-lg max-w-2xl mx-auto font-medium">
            Plan your perfect trip in seconds with our AI travel engine. Compare prices, generate itineraries, and book with confidence.
          </p>
          <Link href="/plan" className="bg-[#1A1A1A] text-white hover:bg-slate-800 py-4 px-10 rounded-2xl font-extrabold text-base transition-all inline-block shadow-lg cursor-pointer">
            Get Started Free
          </Link>
        </div>
      </section>
      
      {/* Internal Links / Recommended Trips */}
      <section className="py-20 px-6 border-t border-[#E8E0D8] bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h3 className="text-xs font-extrabold text-[#EA580C] uppercase tracking-[0.2em] mb-3">Explore More</h3>
            <h2 className="text-3xl font-extrabold text-[#1A1A1A] font-display">Recommended Trips & Guides</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Budget Bali Trip', link: '/seo/budget-bali-trip', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80', price: 'Under $500' },
              { title: 'Goa Under 10k', link: '/seo/goa-trip-under-10000', img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&q=80', price: 'Budget Friendly' },
              { title: 'Manali Tour Plan', link: '/seo/manali-trip-planner', img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&q=80', price: 'Adventure' },
              { title: 'Solo Travel India', link: '/seo/solo-travel-guide-india', img: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&q=80', price: 'Expert Guide' }
            ].map((trip, i) => (
              <Link key={i} href={trip.link} className="bg-[#FFFBF7] rounded-3xl overflow-hidden shadow-xs hover:shadow-xl hover:border-[#FED7AA] transition-all duration-300 group border border-[#E8E0D8]">
                <div className="relative h-40">
                  <img src={trip.img} alt={trip.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-extrabold text-[#EA580C] shadow-xs border border-[#FED7AA]">
                    {trip.price}
                  </div>
                </div>
                <div className="p-5">
                  <h4 className="font-bold text-[#1A1A1A] mb-2 group-hover:text-[#EA580C] transition-colors">{trip.title}</h4>
                  <div className="flex items-center gap-1 text-[#EA580C] text-xs font-bold">
                    View Planner <ArrowRight size={12} />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-14 flex flex-wrap justify-center gap-x-8 gap-y-4 text-xs font-bold border-t border-[#E8E0D8] pt-10">
            <Link href="/seo/ai-trip-planner-india" className="text-[#6B6B6B] hover:text-[#EA580C] transition-colors">AI Trip Planner India</Link>
            <Link href="/weekend-trips-from-hyderabad" className="text-[#6B6B6B] hover:text-[#EA580C] transition-colors">Weekend Trips Hyderabad</Link>
            <Link href="/seo/best-honeymoon-destinations-india" className="text-[#6B6B6B] hover:text-[#EA580C] transition-colors">Honeymoon Destinations</Link>
            <Link href="/seo/cheapest-international-trips-from-india" className="text-[#6B6B6B] hover:text-[#EA580C] transition-colors">Cheap International Trips</Link>
            <Link href="/seo/best-beaches-in-india" className="text-[#6B6B6B] hover:text-[#EA580C] transition-colors">Best Beaches India</Link>
            <Link href="/seo/family-trip-planner-india" className="text-[#6B6B6B] hover:text-[#EA580C] transition-colors">Family Trip Planner</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
