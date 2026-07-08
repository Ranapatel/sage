'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import LegalModal from '@/components/ui/LegalModal'
import { FileText, Shield, AlertCircle, Cookie, RefreshCcw, MessageSquare, Instagram, X, Linkedin } from 'lucide-react'

export default function Footer() {
  const [activeLegal, setActiveLegal] = useState<{ title: string; content: React.ReactNode } | null>(null)

  const legalLinks = [
    { 
      title: "Terms & Conditions", 
      icon: FileText,
      content: (
        <div className="space-y-4">
          <p><strong>Effective Date:</strong> 01 April 2026</p>
          <p>Welcome to TripSage. By accessing or using this platform, you agree to comply with these Terms & Conditions.</p>
          <p><strong>Service:</strong> TripSage provides AI-powered travel planning, personalized recommendations, and third-party booking links.</p>
          <p><strong>User Responsibilities:</strong></p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Provide accurate and truthful information when using the platform</li>
            <li>Do not misuse the platform for any illegal or unauthorized activity</li>
            <li>Do not attempt to reverse engineer or harm the platform in any way</li>
          </ul>
          <p><strong>Third-Party Services:</strong> We are not responsible for bookings, pricing, availability, or services provided by third parties.</p>
          <p><strong>Liability:</strong> TripSage is not liable for any travel disruptions, losses, damages, or errors arising from use of this platform.</p>
          <p><strong>Governing Law:</strong> Governed by Indian law under the jurisdiction of Andhra Pradesh.</p>
        </div>
      )
    },
    { 
      title: "Privacy Policy", 
      icon: Shield,
      content: (
        <div className="space-y-4">
          <p><strong>Effective Date:</strong> 01 April 2026</p>
          <p><strong>What We Collect:</strong> Name, email, location, and travel preferences. We do NOT sell your personal data.</p>
          <p><strong>How We Use Data:</strong> To personalize your experience and improve our platform analytics.</p>
          <p className="font-bold">We do NOT sell your personal data to any third party.</p>
          <p><strong>Data Sharing:</strong> We may share anonymized data with trusted APIs and analytics tools solely to improve the service.</p>
          <p><strong>Your Rights:</strong></p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Access your personal data at any time</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your account and data</li>
          </ul>
        </div>
      )
    },
    { 
      title: "Disclaimer", 
      icon: AlertCircle,
      content: (
        <div className="space-y-4">
          <p>TripSage provides travel suggestions and recommendations only. We are an AI-powered planning tool, not a travel agency.</p>
          <p><strong>No Guarantees:</strong> We do not guarantee accuracy of prices or availability. Use at your own risk.</p>
          <p><strong>No Responsibility:</strong> We are not responsible for any third-party services or providers, and we are not liable for travel disruptions, delays, or cancellations.</p>
        </div>
      )
    },
    {
      title: "Cookie Policy",
      icon: Cookie,
      content: (
        <div className="space-y-4">
          <p>TripSage uses cookies to enhance your experience.</p>
          <p><strong>What Cookies We Use:</strong></p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Functionality cookies - to remember your preferences and settings</li>
            <li>Analytics cookies - to understand how users interact with the platform</li>
            <li>Session cookies - to keep you logged in during your visit</li>
          </ul>
          <p><strong>Your Choice:</strong> You can disable cookies at any time through your browser settings. Disabling cookies may affect some features of the platform.</p>
        </div>
      )
    },
    {
      title: "Refund Policy",
      icon: RefreshCcw,
      content: (
        <div className="space-y-4">
          <p>For paid features or subscriptions on TripSage, refund requests must be submitted within 7 days of purchase to <a href="mailto:rana@tripsage.in" className="text-[var(--primary)] hover:underline inline-block cursor-pointer relative z-10">rana@tripsage.in</a></p>
          <p><strong>Third-Party Bookings:</strong> TripSage does not handle bookings directly. Refunds for flights, hotels, buses, or cabs are subject to each provider's own refund and cancellation policies.</p>
        </div>
      )
    },
    {
      title: "Grievance Redressal",
      icon: MessageSquare,
      content: (
        <div className="space-y-4">
          <p>In accordance with the Information Technology Act 2000, TripSage has appointed a Grievance Officer to address user complaints.</p>
          <p><strong>Grievance Officer:</strong></p>
          <ul className="list-none space-y-1">
            <li><strong>Name:</strong> Rana</li>
            <li><strong>Email:</strong> <a href="mailto:rana@tripsage.in" className="text-[var(--primary)] hover:underline inline-block cursor-pointer relative z-10">rana@tripsage.in</a></li>
          </ul>
          <p><strong>Response Time:</strong> All grievances will be responded to within 7 business days.</p>
          <p><strong>How to Submit:</strong> Email <a href="mailto:rana@tripsage.in" className="text-[var(--primary)] hover:underline inline-block cursor-pointer relative z-10">rana@tripsage.in</a> with subject: "Grievance - [Your Issue]". Include your registered email and description of your concern.</p>
        </div>
      )
    }
  ]

  return (
    <footer className="bg-[#F5F0EA] text-[#6B6B6B] px-6 py-20 border-t border-[#E8E0D8]">
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
              <span className="font-display text-2xl font-bold text-[#1A1A1A]">TripSage</span>
            </div>
            <p className="text-[#6B6B6B] text-sm leading-relaxed mb-4">
              TripSage helps you build customized itineraries and find flight and hotel bookings that fit your budget.
            </p>
            <p className="text-[#9CA3AF] text-xs italic leading-relaxed mb-6">
              Affiliate Disclosure: TripSage earns a referral commission when you book through our partner links (flights, hotels, cabs). You pay the exact same price.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 text-sm w-full md:w-auto">
            <div>
              <h4 className="font-bold mb-6 uppercase tracking-widest text-[#1A1A1A]">Platform</h4>
              <div className="flex flex-col gap-4">
                <Link href="/#features" className="hover:text-[#EA580C] transition-colors">Features</Link>
                <Link href="/#destinations" className="hover:text-[#EA580C] transition-colors">Destinations</Link>
                <Link href="/blog" className="hover:text-[#EA580C] transition-colors">Blog</Link>
                <Link href="/plan" className="hover:text-[#EA580C] transition-colors">AI Planner</Link>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-6 uppercase tracking-widest text-[#1A1A1A]">Company</h4>
              <div className="flex flex-col gap-4">
                <Link href="/support" className="hover:text-[#EA580C] transition-colors">Support Center</Link>
                <a href="mailto:rana@tripsage.in" className="hover:text-[#EA580C] transition-colors">Contact Us</a>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-6 uppercase tracking-widest text-[#1A1A1A]">Legal</h4>
              <div className="flex flex-col gap-4">
                {legalLinks.map((link) => (
                  <button 
                    key={link.title}
                    onClick={() => setActiveLegal(link)} 
                    className="hover:text-[#EA580C] transition-colors text-left flex items-center gap-2 group"
                    suppressHydrationWarning
                  >
                    <link.icon size={16} className="text-[#6B6B6B] group-hover:text-[#EA580C] transition-colors" />
                    {link.title}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-6 uppercase tracking-widest text-[#1A1A1A]">Social</h4>
              <div className="flex flex-col gap-4">
                <a
                  href="https://www.instagram.com/tripsage_?igsh=NDBzdWhzejgwaDh1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#EA580C] transition-colors duration-300 flex items-center gap-2"
                >
                  <Instagram size={16} /> Instagram
                </a>
                <a
                  href="https://x.com/SageTrip8016?s=20"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#EA580C] transition-colors duration-300 flex items-center gap-2"
                >
                  <X size={16} /> X (Twitter)
                </a>
                <a
                  href="https://www.linkedin.com/company/tripsage/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#EA580C] transition-colors duration-300 flex items-center gap-2"
                >
                  <Linkedin size={16} /> LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-[#E8E0D8] text-center text-[#6B6B6B] text-xs">
          © {new Date().getFullYear()} TripSage. All rights reserved.
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

