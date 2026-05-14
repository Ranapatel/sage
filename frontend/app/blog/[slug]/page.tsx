import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Calendar, User, ArrowLeft, Share2, Tag, ChevronRight } from 'lucide-react'
import LandingLayout from '@/components/layout/LandingLayout'
import { BLOG_POSTS } from '@/lib/blog-data'

interface PageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = BLOG_POSTS.find((p) => p.slug === params.slug)
  if (!post) return { title: 'Post Not Found' }

  return {
    title: `${post.title} | TripSage Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.image }],
    },
  }
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }))
}

export default function BlogPostPage({ params }: PageProps) {
  const post = BLOG_POSTS.find((p) => p.slug === params.slug)
  if (!post) notFound()

  return (
    <LandingLayout>
      <div className="bg-white min-h-screen">
        {/* Progress bar (visual only) */}
        <div className="fixed top-0 left-0 w-full h-1 bg-slate-100 z-[101]">
          <div className="h-full bg-blue-600 w-1/3 shadow-[0_0_10px_rgba(37,99,235,0.5)]"></div>
        </div>

        <article className="pb-24">
          {/* Hero Section */}
          <header className="relative py-24 px-6 overflow-hidden bg-slate-900 text-white">
            <div className="absolute inset-0 z-0 opacity-40">
              <Image 
                src={post.image} 
                alt={post.title} 
                fill 
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto">
              <Link 
                href="/blog" 
                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-bold text-sm mb-12 transition-colors group"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Back to Blog
              </Link>

              <div className="flex items-center gap-2 mb-6">
                 <span className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-blue-600/30">
                  {post.category}
                </span>
                <span className="text-slate-400 text-sm font-medium">• 6 min read</span>
              </div>

              <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-8 leading-[1.1] tracking-tight">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-slate-300 text-sm font-medium border-t border-white/10 pt-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold border-2 border-white/20">
                    {post.author.charAt(0)}
                  </div>
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-blue-400" />
                  {post.date}
                </div>
                <button className="ml-auto p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/10">
                  <Share2 size={18} />
                </button>
              </div>
            </div>
          </header>

          {/* Breadcrumbs */}
          <nav className="max-w-4xl mx-auto px-6 py-6 border-b border-slate-100 flex items-center gap-2 text-xs font-medium text-slate-400 mb-12">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <ChevronRight size={12} />
            <Link href="/blog" className="hover:text-blue-600">Blog</Link>
            <ChevronRight size={12} />
            <span className="text-slate-600 truncate">{post.title}</span>
          </nav>

          {/* Content */}
          <div className="max-w-4xl mx-auto px-6">
            <div 
              className="prose prose-slate prose-lg max-w-none prose-headings:text-slate-900 prose-headings:font-bold prose-headings:tracking-tight prose-a:text-blue-600 prose-img:rounded-3xl prose-blockquote:border-l-blue-600 prose-blockquote:bg-blue-50 prose-blockquote:p-6 prose-blockquote:rounded-r-2xl prose-blockquote:not-italic"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Author Bio */}
            <div className="mt-20 p-8 md:p-12 bg-slate-50 rounded-[40px] border border-slate-100 flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="w-24 h-24 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-xl">
                {post.author.charAt(0)}
              </div>
              <div className="text-center md:text-left">
                <h4 className="text-xl font-bold text-slate-900 mb-2">Written by {post.author}</h4>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  Expert travel strategist at TripSage. Dedicated to exploring the intersection of technology and global exploration. Helping thousands of travelers plan smarter, not harder.
                </p>
                <div className="flex items-center justify-center md:justify-start gap-4">
                  <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors">Twitter</a>
                  <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors">LinkedIn</a>
                  <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors">Website</a>
                </div>
              </div>
            </div>

            {/* Post Navigation */}
            <div className="mt-12 pt-12 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
              <Link href="/blog" className="btn-outline px-8 py-3 rounded-2xl flex items-center gap-2 group text-sm font-bold">
                 <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                 All Articles
              </Link>
              <Link href="/plan" className="btn-primary px-10 py-3 rounded-2xl flex items-center gap-2 text-sm font-bold shadow-lg shadow-blue-600/20">
                Plan Your Trip with AI
              </Link>
            </div>
          </div>
        </article>
      </div>
    </LandingLayout>
  )
}
