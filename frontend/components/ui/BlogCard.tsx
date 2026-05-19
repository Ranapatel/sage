'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Calendar, User, ArrowRight, Tag } from 'lucide-react'
import { BlogPost } from '@/lib/blog-data'

export default function BlogCard({ post }: { post: BlogPost }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full"
    >
      <Link href={`/blog/${post.slug}`} className="relative h-56 overflow-hidden block">
        <Image 
          src={post.image} 
          alt={post.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-white/90 backdrop-blur-md text-blue-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1.5">
            <Tag size={10} />
            {post.category}
          </span>
        </div>
      </Link>
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center gap-4 text-slate-400 text-[11px] font-medium mb-4">
          <span className="flex items-center gap-1.5">
            <Calendar size={12} className="text-blue-500" />
            {post.date}
          </span>
          <span className="flex items-center gap-1.5">
            <User size={12} className="text-blue-500" />
            {post.author}
          </span>
        </div>
        
        <Link href={`/blog/${post.slug}`}>
          <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
            {post.title}
          </h3>
        </Link>
        
        <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3">
          {post.excerpt}
        </p>
        
        <div className="mt-auto">
          <Link 
            href={`/blog/${post.slug}`}
            className="inline-flex items-center gap-2 text-blue-600 font-bold text-sm group/btn"
          >
            Read Full Article 
            <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
