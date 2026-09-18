'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  Brain,
  Layers,
  Network,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Clock,
  Lock,
  Play,
  Award,
  Video,
  Compass,
} from 'lucide-react'
import AcademyEnrollModal from './AcademyEnrollModal'

interface AcademyLandingExperienceProps {
  onEnrolled: (data: any) => void
}

const EPISODES = [
  {
    num: '01',
    title: 'What Is AGI, Really?',
    desc: "Understand what Artificial General Intelligence actually means, philosophical foundations, and how general cognitive architectures differ from today's narrow LLMs.",
    date: 'Sep 21, 2026',
    duration: '8 min',
    status: 'Available Now',
    unlocked: true,
  },
  {
    num: '02',
    title: "AI vs AGI: What's the Difference?",
    desc: 'Understand narrow AI, generative models, transformer limitations, and the core cognitive capabilities generally associated with AGI.',
    date: 'Sep 24, 2026',
    duration: '8 min',
    status: 'Unlocks Sep 24',
    unlocked: false,
  },
  {
    num: '03',
    title: 'How Does Intelligence Work?',
    desc: 'Explore working memory, episodic memory, planning trees, test-time compute, and continual adaptation.',
    date: 'Sep 28, 2026',
    duration: '9 min',
    status: 'Unlocks Sep 28',
    unlocked: false,
  },
  {
    num: '04',
    title: 'AI Agents: From Chatbots to Action',
    desc: 'Learn how AI agents combine models, memory, tools, reasoning loops, and multi-agent autonomous coordination.',
    date: 'Oct 1, 2026',
    duration: '10 min',
    status: 'Unlocks Oct 1',
    unlocked: false,
  },
  {
    num: '05',
    title: 'The Road to AGI',
    desc: 'Explore frontier compute scaling, safety alignment, neuro-symbolic architectures, and the roadmap toward general intelligence.',
    date: 'Oct 5, 2026',
    duration: '10 min',
    status: 'Unlocks Oct 5',
    unlocked: false,
  },
]

export default function AcademyLandingExperience({ onEnrolled }: AcademyLandingExperienceProps) {
  const [modalOpen, setModalOpen] = useState(false)

  const scrollToCurriculum = () => {
    const el = document.getElementById('curriculum')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="w-full relative text-[#1A1A1A] space-y-16 sm:space-y-24 pb-16 bg-[#FFFBF7]">
      {/* ─── 1. HERO SECTION (TripSage Warm Cream & 3D Bionic Singularity Hand) ─── */}
      <section className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 flex flex-col items-center text-center">
        {/* Top Academy Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center px-4 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-[#EA580C] text-xs sm:text-sm font-extrabold uppercase tracking-widest shadow-2xs mb-4"
        >
          <span>TRIPSAGE ACADEMY</span>
        </motion.div>

        {/* Master Headline: Learn Artificial General Intelligence */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-[64px] font-black tracking-tight text-[#1A1A1A] leading-[1.1] max-w-4xl"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Learn Artificial{' '}
          <span className="text-[#EA580C] drop-shadow-[0_4px_25px_rgba(234,88,12,0.25)]">
            General Intelligence
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="text-base sm:text-lg md:text-xl text-[#57534E] max-w-2xl mx-auto mt-4 font-normal leading-relaxed"
        >
          A free 5-episode masterclass into the foundations, cognitive architectures, and future of
          human-level AI.
        </motion.p>

        {/* ─── 3D Bionic Hand Visual with 3 Interactive Glass Cards ─── */}
        <div className="relative w-full max-w-4xl aspect-[16/9] mx-auto mt-6 rounded-3xl overflow-hidden shadow-[0_15px_45px_rgba(0,0,0,0.06)] border border-[#E8E0D8]/80 bg-white">
          <Image
            src="/academy/bionic-agi-cream-hero.jpg"
            alt="TripSage Academy - Bionic hand cradling the glowing AGI singularity orb"
            fill
            priority
            className="object-cover object-center"
          />

          {/* Interactive Floating Card 1: Autonomous Reasoning (Left Top) */}
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            onClick={scrollToCurriculum}
            className="absolute top-[28%] left-[5%] sm:left-[8%] z-20 flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-2.5 rounded-2xl bg-white/90 backdrop-blur-md border border-[#E8E0D8] shadow-[0_8px_25px_rgba(0,0,0,0.08)] cursor-pointer hover:border-[#EA580C] hover:scale-105 transition-all group"
          >
            <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#EA580C] shadow-inner group-hover:bg-[#EA580C] group-hover:text-white transition-colors">
              <Brain className="w-4 sm:w-5 h-4 sm:h-5" />
            </div>
            <div className="text-left">
              <div className="text-xs sm:text-sm font-bold text-[#1A1A1A] tracking-tight">
                Autonomous Reasoning
              </div>
              <div className="text-[10px] text-slate-500 font-medium">System 2 Thinking</div>
            </div>
          </motion.div>

          {/* Interactive Floating Card 2: Foundations of AGI (Left Bottom) */}
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            onClick={scrollToCurriculum}
            className="absolute bottom-[20%] left-[4%] sm:left-[7%] z-20 flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-2.5 rounded-2xl bg-white/90 backdrop-blur-md border border-[#E8E0D8] shadow-[0_8px_25px_rgba(0,0,0,0.08)] cursor-pointer hover:border-[#EA580C] hover:scale-105 transition-all group"
          >
            <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-inner group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Layers className="w-4 sm:w-5 h-4 sm:h-5" />
            </div>
            <div className="text-left">
              <div className="text-xs sm:text-sm font-bold text-[#1A1A1A] tracking-tight">
                Foundations of AGI
              </div>
              <div className="text-[10px] text-slate-500 font-medium">5-Part Syllabus</div>
            </div>
          </motion.div>

          {/* Interactive Floating Card 3: Agent Workflows (Right) */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            onClick={scrollToCurriculum}
            className="absolute top-[32%] right-[5%] sm:right-[8%] z-20 flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-2.5 rounded-2xl bg-white/90 backdrop-blur-md border border-[#E8E0D8] shadow-[0_8px_25px_rgba(0,0,0,0.08)] cursor-pointer hover:border-[#EA580C] hover:scale-105 transition-all group"
          >
            <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Network className="w-4 sm:w-5 h-4 sm:h-5" />
            </div>
            <div className="text-left">
              <div className="text-xs sm:text-sm font-bold text-[#1A1A1A] tracking-tight">
                Agent Workflows
              </div>
              <div className="text-[10px] text-slate-500 font-medium">Tools & Actions</div>
            </div>
          </motion.div>
        </div>

        {/* ─── Glowing CTA Button: Enroll for Free → ─── */}
        <div className="mt-8 sm:mt-10 space-y-4">
          <div className="relative group inline-block">
            {/* Ambient Warm Radiant Glow */}
            <div className="absolute -inset-1.5 rounded-full bg-[#EA580C] opacity-40 blur-lg group-hover:opacity-70 transition-opacity duration-300 animate-pulse" />

            <button
              onClick={() => setModalOpen(true)}
              className="relative inline-flex items-center justify-center px-10 sm:px-14 py-4 rounded-full bg-gradient-to-r from-[#EA580C] via-[#F97316] to-[#D97706] text-white text-base sm:text-lg font-black tracking-tight shadow-[0_10px_25px_rgba(234,88,12,0.4)] hover:brightness-105 active:scale-98 transition-all select-none border-t border-orange-200/50"
            >
              <span>Enroll for Free →</span>
            </button>
          </div>

          {/* Subtext Metadata Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-bold uppercase tracking-widest text-[#6B6B6B] pt-2">
            <span className="flex items-center gap-1.5 text-[#1A1A1A]">
              <Video className="w-3.5 h-3.5 text-[#EA580C]" />
              5 Structured Episodes
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5 text-[#1A1A1A]">
              <Calendar className="w-3.5 h-3.5 text-[#EA580C]" />
              Drip Schedule
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5 text-[#EA580C] font-extrabold">
              <Award className="w-3.5 h-3.5" />
              Official Certificate
            </span>
          </div>
        </div>
      </section>

      {/* ─── 2. 5-PART SYLLABUS & SCHEDULE ─── */}
      <section id="curriculum" className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 space-y-8 pt-4">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-[#EA580C] text-xs font-bold uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5" />
            Master Schedule
          </div>
          <h2
            className="text-3xl sm:text-4xl font-black text-[#1A1A1A] tracking-tight"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Course Episodes & Release Dates
          </h2>
          <p className="text-[#6B6B6B] text-sm">
            5 structured episodes released every 3–4 days to ensure complete conceptual mastery.
          </p>
        </div>

        <div className="space-y-4">
          {EPISODES.map((ep) => (
            <div
              key={ep.num}
              className={`p-6 sm:p-7 rounded-3xl border transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white ${
                ep.unlocked
                  ? 'border-orange-300 shadow-[0_8px_30px_rgba(234,88,12,0.1)] ring-1 ring-orange-400/20'
                  : 'border-[#E8E0D8] shadow-2xs'
              }`}
            >
              <div className="flex items-start gap-4 sm:gap-5">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-inner ${
                    ep.unlocked
                      ? 'bg-gradient-to-tr from-[#EA580C] to-[#F97316] text-white shadow-[0_4px_15px_rgba(234,88,12,0.35)]'
                      : 'bg-[#FFFBF7] text-slate-400 border border-[#E8E0D8]'
                  }`}
                >
                  {ep.num}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#6B6B6B]">
                      EPISODE {ep.num}
                    </span>
                    {ep.unlocked ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        🔓 {ep.status}
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        🔒 {ep.status}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-[#1A1A1A] tracking-tight">
                    {ep.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#57534E] max-w-2xl leading-relaxed">
                    {ep.desc}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-[#6B6B6B] pt-1 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#EA580C]" />
                      {ep.date}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#EA580C]" />
                      ~{ep.duration}
                    </span>
                  </div>
                </div>
              </div>

              <div className="sm:text-right shrink-0">
                <button
                  onClick={() => setModalOpen(true)}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    ep.unlocked
                      ? 'bg-[#EA580C] hover:bg-[#C2410C] text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {ep.unlocked ? (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Enroll to Stream
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      Enroll to Reserve
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 3. ABOUT TRIPSAGE ACADEMY ─── */}
      <section id="about" className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[#E8E0D8] shadow-sm space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-[#EA580C] text-xs font-semibold">
            <Compass className="w-3.5 h-3.5" />
            Our Educational Mission
          </div>
          <h3
            className="text-2xl sm:text-3xl font-black text-[#1A1A1A] tracking-tight"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Why TripSage Built a Free AGI Course
          </h3>
          <p className="text-sm text-[#57534E] leading-relaxed max-w-2xl mx-auto">
            At TripSage, we engineer autonomous multi-agent intelligence daily to solve complex real-world
            travel planning and logistics. We believe true AGI knowledge belongs to everyone. This course is
            100% free, non-commercial, and open to all engineers, researchers, and students worldwide.
          </p>
        </div>
      </section>

      {/* ─── 4. BOTTOM PERSUASION HERO CARD ─── */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#FFF8F3] to-[#FFFBF7] border border-orange-200 text-center space-y-6 shadow-md relative overflow-hidden">
          <div className="space-y-2 relative z-10">
            <h3
              className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1A1A1A] tracking-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Start the Foundations of AGI Today
            </h3>
            <p className="text-sm sm:text-base text-[#57534E] max-w-lg mx-auto">
              Join engineers, researchers, and creators. Free enrollment takes 10 seconds.
            </p>
          </div>

          <div className="flex justify-center relative z-10">
            <button
              onClick={() => setModalOpen(true)}
              className="px-10 py-4 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-base shadow-[0_8px_25px_rgba(234,88,12,0.35)] active:scale-98 transition-all"
            >
              Enroll for Free →
            </button>
          </div>
        </div>
      </section>

      {/* ─── 5. ENROLLMENT MODAL ─── */}
      <AcademyEnrollModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onEnrolled={onEnrolled}
      />
    </div>
  )
}
