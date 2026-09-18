'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, ShieldCheck, ArrowRight, Loader2, GraduationCap } from 'lucide-react'
import toast from 'react-hot-toast'

interface AcademyEnrollModalProps {
  isOpen: boolean
  onClose: () => void
  onEnrolled: (data: any) => void
}

export default function AcademyEnrollModal({ isOpen, onClose, onEnrolled }: AcademyEnrollModalProps) {
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
          source: 'academy_modal',
        }),
      })

      const data = await res.json()

      if (data.success && data.data) {
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
        const fallbackData = {
          student: {
            name: name.trim(),
            email: email.trim(),
            organization: organization.trim(),
            enrolledAt: new Date().toISOString(),
          },
          progress: {
            studentEmail: email.trim(),
            completedEpisodes: [],
            hasWatchedIntro: false,
          },
          course: {
            title: 'Foundations of Artificial General Intelligence',
          },
        }
        localStorage.setItem('tripsage_academy_user', JSON.stringify(fallbackData))
        toast.success(`Welcome to TripSage Academy, ${name.trim()}! 🎓`)
        onEnrolled(fallbackData)
      }
    } catch (err) {
      const fallbackData = {
        student: {
          name: name.trim(),
          email: email.trim(),
          organization: organization.trim(),
          enrolledAt: new Date().toISOString(),
        },
        progress: {
          studentEmail: email.trim(),
          completedEpisodes: [],
          hasWatchedIntro: false,
        },
        course: {
          title: 'Foundations of Artificial General Intelligence',
        },
      }

      localStorage.setItem('tripsage_academy_user', JSON.stringify(fallbackData))
      toast.success(`Welcome to TripSage Academy, ${name.trim()}! 🎓`)
      onEnrolled(fallbackData)
    } finally {
      setLoading(false)
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop with Frosted Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal Container in TripSage Theme */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl sm:rounded-3xl bg-white border border-[#E8E0D8] shadow-[0_25px_70px_rgba(0,0,0,0.18)] p-5 sm:p-8 z-10 text-[#1A1A1A]"
          >
            {/* Top Accent Gradient Ribbon */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#EA580C] via-[#F97316] to-[#FBBF24]" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="space-y-1.5 sm:space-y-2 mb-5 sm:mb-6 pr-6 sm:pr-0">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[#EA580C] text-[11px] font-extrabold uppercase tracking-wider">
                <GraduationCap className="w-3.5 h-3.5" />
                Free Course Enrollment
              </div>

              <h2
                className="text-xl sm:text-3xl font-black text-[#1A1A1A] tracking-tight"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Join TripSage Academy
              </h2>
              <p className="text-xs sm:text-sm text-[#6B6B6B]">
                Get instant access to the orientation video, release schedule, and progress tracking.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#4A4A4A] mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#FFFBF7] border border-[#E8E0D8] text-[#1A1A1A] text-sm focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent transition-all placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A4A4A] mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#FFFBF7] border border-[#E8E0D8] text-[#1A1A1A] text-sm focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent transition-all placeholder:text-slate-400"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#4A4A4A]">College / Company</label>
                  <span className="text-[10px] text-slate-400 font-medium">Optional</span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. IIT Bombay / Google"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#FFFBF7] border border-[#E8E0D8] text-[#1A1A1A] text-sm focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-base shadow-[0_4px_15px_rgba(234,88,12,0.35)] active:scale-98 transition-all flex items-center justify-center gap-2"
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
                </button>
              </div>

              <div className="flex items-start gap-2 pt-1 text-[11px] text-slate-500 leading-relaxed">
                <ShieldCheck className="w-4 h-4 text-[#EA580C] shrink-0 mt-0.5" />
                <span>
                  No password or credit card required. Instant access to the course and dashboard.
                </span>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
