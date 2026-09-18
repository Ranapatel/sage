'use client'

import React, { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import AcademyLandingExperience from '@/components/academy/AcademyLandingExperience'
import AcademyDashboard from '@/components/academy/AcademyDashboard'
import { motion, AnimatePresence } from 'framer-motion'

export default function AcademyPage() {
  const [enrolledSession, setEnrolledSession] = useState<{
    student: { name: string; email: string; organization?: string }
    progress?: any
  } | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Check local session on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('tripsage_academy_user')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed?.student?.email) {
          setEnrolledSession(parsed)
        }
      }
    } catch (e) {
      console.warn('Could not read academy session from localStorage')
    } finally {
      setIsLoaded(true)
    }
  }, [])

  const handleEnrolled = (data: any) => {
    setEnrolledSession(data)
  }

  const handleResetSession = () => {
    localStorage.removeItem('tripsage_academy_user')
    setEnrolledSession(null)
  }

  return (
    <div className="min-h-screen bg-[#FFFBF7] text-[#1A1A1A] font-body selection:bg-orange-500/20 selection:text-orange-700 antialiased w-full relative overflow-x-hidden flex flex-col justify-between">
      {/* TripSage Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 w-full pb-16">
        {isLoaded && (
          <AnimatePresence mode="wait">
            {!enrolledSession ? (
              <motion.div
                key="landing-experience"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <AcademyLandingExperience onEnrolled={handleEnrolled} />
              </motion.div>
            ) : (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
              >
                <AcademyDashboard
                  student={enrolledSession.student}
                  progress={enrolledSession.progress}
                  onResetSession={handleResetSession}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* TripSage Footer */}
      <Footer />
    </div>
  )
}
