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
      whileHover={{ y: -4 }}
      className="bg-white rounded-3xl border border-[#E8E0D8] overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[#FED7AA] group flex flex-col h-full"
    >
      <Link href={`/blog/${post.slug}`} className="relative h-56 overflow-hidden block">
        <Image 
          src={post.image} 
          alt={post.title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-white/95 backdrop-blur-md text-[#EA580C] text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1.5 border border-[#FED7AA]">
            <Tag size={10} />
            {post.category}
          </span>
        </div>
      </Link>
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center gap-4 text-[#6B6B6B] text-[11px] font-semibold mb-3">
          <span className="flex items-center gap-1.5">
            <Calendar size={12} className="text-[#EA580C]" />
            {post.date}
          </span>
          <span className="flex items-center gap-1.5">
            <User size={12} className="text-[#EA580C]" />
            {post.author}
          </span>
        </div>
        
        <Link href={`/blog/${post.slug}`}>
          <h3 className="text-xl font-bold text-[#1A1A1A] mb-3 group-hover:text-[#EA580C] transition-colors line-clamp-2 leading-tight">
            {post.title}
          </h3>
        </Link>
        
        <p className="text-[#6B6B6B] text-sm leading-relaxed mb-6 line-clamp-3 font-medium">
          {post.excerpt}
        </p>
        
        <div className="mt-auto">
          <Link 
            href={`/blog/${post.slug}`}
            className="inline-flex items-center gap-2 text-[#EA580C] font-extrabold text-sm group/btn hover:text-[#C2410C] transition-colors"
          >
            Read Full Article 
            <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
