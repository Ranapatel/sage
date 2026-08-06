import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Calendar, User, ArrowLeft, Share2, Tag, ChevronRight } from 'lucide-react'
import LandingLayout from '@/components/layout/LandingLayout'
import { BLOG_POSTS } from '@/lib/blog-data'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = BLOG_POSTS.find((p) => p.slug === slug)
  if (!post) return { title: 'Post Not Found' }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tripsage.in'
  const ogImageUrl = post.image.startsWith('http') ? post.image : `${baseUrl}${post.image}`

  return {
    title: `${post.title} | TripSage Journal`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: ogImageUrl }],
    },
  }
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }))
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = BLOG_POSTS.find((p) => p.slug === slug)
  if (!post) notFound()

  return (
    <LandingLayout>
      <div className="bg-[#FFFBF7] min-h-screen text-[#6B6B6B] font-body">
        {/* Top Progress Bar Accent */}
        <div className="fixed top-0 left-0 w-full h-1 bg-[#E8E0D8] z-[101]">
          <div className="h-full bg-[#EA580C] w-1/3 shadow-[0_0_10px_rgba(234,88,12,0.5)]" />
        </div>

        <article className="pb-24">
          {/* Hero Section */}
          <header className="relative py-24 px-6 overflow-hidden bg-[#1A1A1A] text-white">
            <div className="absolute inset-0 z-0 opacity-30">
              <Image 
                src={post.image} 
                alt={post.title} 
                fill 
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-[#1A1A1A]/70 to-transparent" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto">
              <Link 
                href="/blog" 
                className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 font-bold text-sm mb-8 transition-colors group"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Back to Journal
              </Link>

              <div className="flex items-center gap-2 mb-6">
                 <span className="bg-[#EA580C] text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest shadow-md">
                  {post.category}
                </span>
                <span className="text-slate-300 text-xs font-semibold">• 6 min read</span>
              </div>

              <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-8 leading-[1.15] tracking-tight font-display">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-slate-300 text-sm font-medium border-t border-white/15 pt-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#EA580C] flex items-center justify-center text-white font-extrabold border-2 border-white/20 shadow-md">
                    {post.author.charAt(0)}
                  </div>
                  <span className="font-bold text-white">{post.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-orange-400" />
                  {post.date}
                </div>
              </div>
            </div>
          </header>

          {/* Breadcrumbs */}
          <nav className="max-w-4xl mx-auto px-6 py-5 border-b border-[#E8E0D8] flex items-center gap-2 text-xs font-semibold text-[#6B6B6B] mb-12">
            <Link href="/" className="hover:text-[#EA580C]">Home</Link>
            <ChevronRight size={12} />
            <Link href="/blog" className="hover:text-[#EA580C]">Blog</Link>
            <ChevronRight size={12} />
            <span className="text-[#1A1A1A] truncate max-w-[200px] sm:max-w-none">{post.title}</span>
          </nav>

          {/* Article Content Body */}
          <div className="max-w-4xl mx-auto px-6">
            <div 
              className="prose prose-slate prose-lg max-w-none prose-headings:text-[#1A1A1A] prose-headings:font-extrabold prose-headings:tracking-tight prose-a:text-[#EA580C] prose-img:rounded-3xl prose-blockquote:border-l-[#EA580C] prose-blockquote:bg-[#FFF4EE] prose-blockquote:p-6 prose-blockquote:rounded-r-2xl prose-blockquote:not-italic font-medium text-[#4A4A4A] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Author Bio Card */}
            <div className="mt-20 p-8 md:p-10 bg-white rounded-3xl border border-[#E8E0D8] shadow-sm flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#EA580C] to-[#F97316] flex-shrink-0 flex items-center justify-center text-white text-2xl font-black border-4 border-[#FFFBF7] shadow-lg">
                {post.author.charAt(0)}
              </div>
              <div className="text-center md:text-left">
                <h4 className="text-xl font-bold text-[#1A1A1A] mb-2">Written by {post.author}</h4>
                <p className="text-[#6B6B6B] text-sm leading-relaxed mb-4 font-medium">
                  Senior AI Travel Strategist at TripSage. Dedicated to building smart algorithms and sharing actionable guides to help thousands of travelers explore the world effortlessly.
                </p>
                <div className="flex items-center justify-center md:justify-start gap-4 text-xs font-bold">
                  <Link href="/blog" className="text-[#EA580C] hover:underline">More Articles by {post.author.split(' ')[0]}</Link>
                  <span className="text-[#E8E0D8]">•</span>
                  <Link href="/plan" className="text-[#EA580C] hover:underline">Plan Trip with AI</Link>
                </div>
              </div>
            </div>

            {/* Post Navigation Buttons */}
            <div className="mt-12 pt-10 border-t border-[#E8E0D8] flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link href="/blog" className="w-full sm:w-auto px-7 py-3 rounded-2xl border border-[#E8E0D8] bg-white hover:bg-[#FFF4EE] hover:border-[#FED7AA] flex items-center justify-center gap-2 text-sm font-bold text-[#1A1A1A] transition-all cursor-pointer">
                 <ArrowLeft size={16} />
                 All Journal Articles
              </Link>
              <Link href="/plan" className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-[#EA580C] hover:bg-[#C2410C] text-white flex items-center justify-center gap-2 text-sm font-extrabold shadow-md shadow-orange-500/20 transition-all cursor-pointer">
                Plan Your Trip with AI
              </Link>
            </div>
          </div>
        </article>
      </div>
    </LandingLayout>
  )
}
