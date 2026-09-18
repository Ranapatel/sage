'use client'

import React, { useState } from 'react'
import { CheckCircle2, ShieldCheck, Sparkles, ArrowRight, GraduationCap, Loader2 } from 'lucide-react'
import AcademyButton3D from './AcademyButton3D'
import AcademyCard3D from './AcademyCard3D'
import toast from 'react-hot-toast'

interface AcademyEnrollFormProps {
  onEnrolled: (data: {
    student: { name: string; email: string; organization?: string }
    progress: any
    course: any
  }) => void
}

const WHAT_YOULL_GET = [
  '5 structured video episodes',
  'Episode release schedule',
  'Practical examples',
  'Course resources & takeaways',
  'Progress tracking (0/5 completion)',
  'Certificate after completion',
]

export default function AcademyEnrollForm({ onEnrolled }: AcademyEnrollFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [organization, setOrganization] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Please enter your name')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }

    setLoading(true)

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
      const res = await fetch(`${backendUrl}/api/academy/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          organization: organization.trim(),
          source: 'academy_page',
        }),
      })

      const data = await res.json()

      if (data.success && data.data) {
        // Save persistent learner session
        localStorage.setItem(
          'tripsage_academy_user',
          JSON.stringify({
            student: data.data.student,
            progress: data.data.progress,
            enrolledAt: new Date().toISOString(),
          })
        )
        toast.success(`Welcome to TripSage Academy, ${name.trim()}! 🎓`)
        onEnrolled(data.data)
      } else {
        throw new Error(data.message || 'Enrollment failed')
      }
    } catch (err: any) {
      console.warn('Backend enrollment sync notice, using local session:', err.message)
      // Fallback local session
      const fallbackData = {
        student: {
          name: name.trim(),
          email: email.trim(),
          organization: organization.trim(),
        },
        progress: {
          studentEmail: email.trim(),
          courseSlug: 'foundations-of-agi',
          completedEpisodes: [],
          hasWatchedIntro: false,
        },
        course: {
          slug: 'foundations-of-agi',
          title: 'Foundations of Artificial General Intelligence',
        },
      }

      localStorage.setItem('tripsage_academy_user', JSON.stringify(fallbackData))
      toast.success(`Welcome to TripSage Academy, ${name.trim()}! 🎓`)
      onEnrolled(fallbackData)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
      {/* Left Column: Course Value Proposition */}
      <div className="lg:col-span-6 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-[#EA580C] text-xs font-bold uppercase tracking-wider">
          <GraduationCap className="w-4 h-4" />
          TripSage Academy
        </div>

        <div className="space-y-3">
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1A1A1A] tracking-tight leading-[1.15]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Learn Artificial General Intelligence
          </h1>
          <p className="text-[#4B5563] text-sm sm:text-base leading-relaxed">
            A free 5-episode course designed to help you understand AGI, modern AI systems, reasoning,
            agents, and the future of intelligent machines.
          </p>
        </div>

        {/* Benefits Card */}
        <div className="p-6 rounded-2xl bg-white/80 backdrop-blur-md border border-[#E8E0D8] shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#EA580C]" />
            What you'll get
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {WHAT_YOULL_GET.map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-[#374151]">
                <CheckCircle2 className="w-4 h-4 text-[#EA580C] shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Micro stats */}
        <div className="flex items-center gap-4 text-xs font-semibold text-[#6B7280]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> 5 Episodes
          </span>
          <span>·</span>
          <span>100% Free</span>
          <span>·</span>
          <span>Beginner Friendly</span>
        </div>
      </div>

      {/* Right Column: 3D Enrollment Card */}
      <div className="lg:col-span-6">
        <AcademyCard3D
          depth={25}
          className="p-8 rounded-3xl bg-white/90 backdrop-blur-xl border border-[#E8E0D8] shadow-[0_20px_50px_rgba(0,0,0,0.08)] relative overflow-hidden"
        >
          {/* Subtle Top Gradient Accent */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#EA580C] via-[#F97316] to-[#FBBF24]" />

          <div className="space-y-6">
            <div>
              <h2
                className="text-2xl font-bold text-[#1A1A1A] tracking-tight"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Enrollment Form
              </h2>
              <p className="text-xs text-[#6B7280] mt-1">
                Enter your details below to get instant access to the course and dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1.5">Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#FFFBF7] border border-[#E8E0D8] text-[#1A1A1A] text-sm focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent transition-all placeholder:text-[#9CA3AF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#FFFBF7] border border-[#E8E0D8] text-[#1A1A1A] text-sm focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent transition-all placeholder:text-[#9CA3AF]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#374151]">College / Company</label>
                  <span className="text-[11px] text-[#9CA3AF] font-medium">Optional</span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Stanford / Google"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#FFFBF7] border border-[#E8E0D8] text-[#1A1A1A] text-sm focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent transition-all placeholder:text-[#9CA3AF]"
                />
              </div>

              <div className="pt-2">
                <AcademyButton3D
                  type="submit"
                  disabled={loading}
                  size="lg"
                  className="w-full justify-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Enrolling...
                    </>
                  ) : (
                    <>
                      Enroll for Free
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </AcademyButton3D>
              </div>

              <div className="flex items-start gap-2 pt-2 text-[11px] text-[#6B7280] leading-relaxed">
                <ShieldCheck className="w-4 h-4 text-[#EA580C] shrink-0 mt-0.5" />
                <span>
                  Your enrollment gives you access to the TripSage Academy course and your learning
                  progress.
                </span>
              </div>
            </form>
          </div>
        </AcademyCard3D>
      </div>
    </div>
  )
}
