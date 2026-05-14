import type { Metadata } from 'next'
import LandingLayout from '@/components/layout/LandingLayout'
import BlogCard from '@/components/ui/BlogCard'
import { BLOG_POSTS } from '@/lib/blog-data'
import { Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'TripSage Blog | AI Travel Insights, Guides & Tips',
  description: 'Explore the latest in AI travel planning, destination guides, and budget travel hacks on the TripSage blog.',
  keywords: ['travel blog', 'AI travel blog', 'India travel guides', 'budget travel tips', 'TripSage'],
}

export default function BlogListingPage() {
  return (
    <LandingLayout>
      <div className="bg-slate-50 min-h-screen py-24 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full text-xs font-bold text-blue-600 mb-6 border border-blue-100">
              <Sparkles size={14} />
              The TripSage Journal
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
              Insights for the <span className="text-blue-600">Modern Traveler</span>
            </h1>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
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
          <div className="mt-32 bg-blue-600 rounded-[40px] p-12 md:p-20 text-white text-center relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
             <h2 className="text-3xl md:text-4xl font-bold mb-6">Stay Ahead of the Curve</h2>
             <p className="text-blue-100 mb-10 text-lg max-w-xl mx-auto">Join our newsletter to get the latest AI travel tips and exclusive destination guides delivered straight to your inbox.</p>
             <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
               <input 
                 type="email" 
                 placeholder="Enter your email" 
                 className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-md"
               />
               <button className="w-full sm:w-auto bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold hover:bg-blue-50 transition-colors shadow-lg">
                 Subscribe
               </button>
             </div>
          </div>
        </div>
      </div>
    </LandingLayout>
  )
}
