'use client'

import React, { useState } from 'react'
import LandingLayout from '@/components/layout/LandingLayout'
import BlogCard from '@/components/ui/BlogCard'
import { BLOG_POSTS } from '@/lib/blog-data'
import { Sparkles, Mail } from 'lucide-react'
import toast from 'react-hot-toast'

export default function BlogListingPage() {
  const [email, setEmail] = useState('')

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }
    toast.success('Thank you for subscribing to TripSage Journal!')
    setEmail('')
  }

  return (
    <LandingLayout>
      <div className="bg-[#FFFBF7] text-[#6B6B6B] min-h-screen py-24 px-6 font-body">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#FFF4EE] px-4 py-2 rounded-full text-xs font-bold text-[#EA580C] mb-6 border border-[#FED7AA]">
              <Sparkles size={14} />
              The TripSage Journal
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-[#1A1A1A] mb-6 tracking-tight font-display">
              Insights for the <span className="text-[#EA580C]">Modern Traveler</span>
            </h1>
            <p className="text-[#6B6B6B] text-lg max-w-2xl mx-auto font-medium">
              Expert guides, AI travel trends, and stories from the road to help you plan your next perfect adventure.
            </p>
          </div>

          {/* Blog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {BLOG_POSTS.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>

          {/* Newsletter / CTA */}
          <div className="mt-28 bg-gradient-to-r from-[#EA580C] via-[#F97316] to-[#EA580C] rounded-[36px] p-10 md:p-16 text-white text-center relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 -translate-x-1/2 blur-3xl" />
             <h2 className="text-3xl md:text-4xl font-extrabold mb-4 font-display">Stay Ahead of the Curve</h2>
             <p className="text-orange-100 mb-8 text-base md:text-lg max-w-xl mx-auto font-medium">
               Join 50,000+ smart travelers getting AI itineraries, hidden gems, and deal alerts straight to their inbox.
             </p>
             <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto relative z-10">
               <input 
                 type="email" 
                 value={email}
                 onChange={e => setEmail(e.target.value)}
                 placeholder="Enter your email address" 
                 className="w-full px-5 py-3.5 rounded-2xl bg-white text-[#1A1A1A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-200 text-sm font-semibold shadow-inner"
               />
               <button 
                 type="submit"
                 className="w-full sm:w-auto bg-[#1A1A1A] text-white hover:bg-slate-800 px-8 py-3.5 rounded-2xl font-extrabold text-sm transition-colors shadow-lg shrink-0 cursor-pointer"
               >
                 Subscribe
               </button>
             </form>
          </div>
        </div>
      </div>
    </LandingLayout>
  )
}
