'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight, CheckCircle2, ChevronDown } from 'lucide-react'
import { useState } from 'react'

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

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative py-24 px-6 overflow-hidden bg-[#0F172A] text-white">
        <div className="absolute inset-0 z-0 opacity-40">
          <img src={heroImage} alt={title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/20" />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-blue-500/20 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold text-blue-300 mb-8 border border-blue-500/30"
          >
            <Sparkles className="w-4 h-4" />
            AI-Powered Travel Intelligence
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold mb-8 tracking-tight"
          >
            {title}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-200 max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            {subtitle}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link href={ctaLink} className="btn-primary py-4 px-10 text-lg font-bold inline-flex items-center gap-2 rounded-2xl shadow-xl shadow-blue-600/30">
              {ctaText} <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <div className="prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-blue-600">
          {content}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <button 
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  {faq.question}
                  <ChevronDown className={`w-5 h-5 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6 text-slate-600 leading-relaxed">
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
        <div className="max-w-4xl mx-auto bg-blue-600 rounded-[40px] p-12 md:p-20 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <h2 className="text-3xl md:text-5xl font-bold mb-8">Ready for your next adventure?</h2>
          <p className="text-blue-100 mb-12 text-lg max-w-2xl mx-auto">
            Plan your perfect trip in seconds with our AI travel engine. Compare prices, generate itineraries, and book with confidence.
          </p>
          <Link href="/plan" className="bg-white text-blue-600 hover:bg-blue-50 py-4 px-12 rounded-2xl font-bold text-xl transition-all inline-block shadow-lg">
            Get Started Free
          </Link>
        </div>
      </section>
      
      {/* Internal Links / Recommended Trips */}
      <section className="py-24 px-6 border-t border-slate-100 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-sm font-bold text-blue-600 uppercase tracking-[0.2em] mb-4">Explore More</h3>
            <h2 className="text-3xl font-bold text-slate-900">Recommended Trips & Guides</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Budget Bali Trip', link: '/budget-bali-trip', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80', price: 'Under $500' },
              { title: 'Goa Under 10k', link: '/goa-trip-under-10000', img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&q=80', price: 'Budget Friendly' },
              { title: 'Manali Tour Plan', link: '/manali-trip-planner', img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&q=80', price: 'Adventure' },
              { title: 'Solo Travel India', link: '/solo-travel-guide-india', img: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&q=80', price: 'Expert Guide' }
            ].map((trip, i) => (
              <Link key={i} href={trip.link} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-slate-200">
                <div className="relative h-40">
                  <img src={trip.img} alt={trip.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-blue-600 shadow-sm">
                    {trip.price}
                  </div>
                </div>
                <div className="p-5">
                  <h4 className="font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{trip.title}</h4>
                  <div className="flex items-center gap-1 text-blue-600 text-xs font-bold">
                    View Planner <ArrowRight size={12} />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-16 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-medium border-t border-slate-200 pt-10">
            <Link href="/ai-trip-planner-india" className="text-slate-500 hover:text-blue-600 transition-colors">AI Trip Planner India</Link>
            <Link href="/weekend-trips-from-hyderabad" className="text-slate-500 hover:text-blue-600 transition-colors">Weekend Trips Hyderabad</Link>
            <Link href="/best-honeymoon-destinations-india" className="text-slate-500 hover:text-blue-600 transition-colors">Honeymoon Destinations</Link>
            <Link href="/cheapest-international-trips-from-india" className="text-slate-500 hover:text-blue-600 transition-colors">Cheap International Trips</Link>
            <Link href="/best-beaches-in-india" className="text-slate-500 hover:text-blue-600 transition-colors">Best Beaches India</Link>
            <Link href="/family-trip-planner-india" className="text-slate-500 hover:text-blue-600 transition-colors">Family Trip Planner</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
