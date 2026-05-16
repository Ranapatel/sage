'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import LegalModal from '@/components/ui/LegalModal'

export default function Footer() {
  const [activeLegal, setActiveLegal] = useState<{ title: string; content: React.ReactNode } | null>(null)

  const legalLinks = [
    { 
      title: "Terms & Conditions", 
      content: (
        <div className="space-y-4">
          <p><strong>Effective Date:</strong> 01 April 2026</p>
          <p>Welcome to TripSage. By accessing or using this platform, you agree to comply with these Terms & Conditions.</p>
          <p><strong>Service:</strong> TripSage provides AI-powered travel planning, personalized recommendations, and third-party booking links.</p>
          <p><strong>Liability:</strong> TripSage is not liable for any travel disruptions, losses, damages, or errors arising from use of this platform.</p>
        </div>
      )
    },
    { 
      title: "Privacy Policy", 
      content: (
        <div className="space-y-4">
          <p><strong>Effective Date:</strong> 01 April 2026</p>
          <p><strong>What We Collect:</strong> Name, email, location, and travel preferences. We do NOT sell your personal data.</p>
          <p><strong>How We Use Data:</strong> To personalize your experience and improve our platform analytics.</p>
        </div>
      )
    },
    { 
      title: "Disclaimer", 
      content: (
        <div className="space-y-4">
          <p>TripSage provides travel suggestions and recommendations only. We are an AI-powered planning tool, not a travel agency.</p>
          <p><strong>No Guarantees:</strong> We do not guarantee accuracy of prices or availability. Use at your own risk.</p>
        </div>
      )
    }
  ]

  return (
    <footer className="bg-slate-900 text-white px-6 py-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start justify-between gap-12 mb-16">
          <div className="max-w-sm">
            <div className="flex items-center gap-3 mb-6">
              <img
                src="https://res.cloudinary.com/dob5llmb2/image/upload/v1778407506/Primary.JPEG.Logo_1_o0h85v.png"
                alt="TripSage"
                width={40}
                height={40}
                className="rounded-xl w-[40px] h-[40px] object-contain"
              />
              <span className="font-display text-2xl font-bold text-white">TripSage</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              The world's first AI-powered Travel Operating System. We orchestrate real-time travel intelligence for the modern explorer.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-sm">
            <div>
              <h4 className="font-bold mb-6 uppercase tracking-widest text-slate-200">Platform</h4>
              <div className="flex flex-col gap-4 text-slate-400">
                <Link href="/#features" className="hover:text-blue-400 transition-colors">Features</Link>
                <Link href="/#destinations" className="hover:text-blue-400 transition-colors">Destinations</Link>
                <Link href="/blog" className="hover:text-blue-400 transition-colors">Blog</Link>
                <Link href="/plan" className="hover:text-blue-400 transition-colors">AI Planner</Link>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-6 uppercase tracking-widest text-slate-200">Popular Guides</h4>
              <div className="flex flex-col gap-4 text-slate-400">
                <Link href="/ai-trip-planner-india" className="hover:text-blue-400 transition-colors">India Trip Planner</Link>
                <Link href="/solo-travel-guide-india" className="hover:text-blue-400 transition-colors">Solo Travel Guide</Link>
                <Link href="/family-trip-planner-india" className="hover:text-blue-400 transition-colors">Family Vacation Plan</Link>
                <Link href="/best-honeymoon-destinations-india" className="hover:text-blue-400 transition-colors">Honeymoon Spots</Link>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-6 uppercase tracking-widest text-slate-200">Top Destinations</h4>
              <div className="flex flex-col gap-4 text-slate-400">
                <Link href="/goa-trip-under-10000" className="hover:text-blue-400 transition-colors">Budget Goa Trip</Link>
                <Link href="/manali-trip-planner" className="hover:text-blue-400 transition-colors">Manali Tour Plan</Link>
                <Link href="/budget-bali-trip" className="hover:text-blue-400 transition-colors">Bali Under Budget</Link>
                <Link href="/best-beaches-in-india" className="hover:text-blue-400 transition-colors">India's Best Beaches</Link>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-6 uppercase tracking-widest text-slate-200">Company</h4>
              <div className="flex flex-col gap-4 text-slate-400">
                <Link href="/support" className="hover:text-blue-400 transition-colors">Support Center</Link>
                <a href="mailto:rana@tripsage.in" className="hover:text-blue-400 transition-colors">Contact Us</a>
                {legalLinks.map((link) => (
                  <button 
                    key={link.title}
                    onClick={() => setActiveLegal(link)} 
                    className="hover:text-blue-400 transition-colors text-left"
                  >
                    {link.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-slate-800 text-center text-slate-500 text-xs">
          © {new Date().getFullYear()} TripSage AI Travel OS. All rights reserved.
        </div>
      </div>

      <LegalModal 
        isOpen={!!activeLegal} 
        onClose={() => setActiveLegal(null)} 
        title={activeLegal?.title || ''}
        content={activeLegal?.content}
      />
    </footer>
  )
}
