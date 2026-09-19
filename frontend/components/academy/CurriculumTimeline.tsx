'use client'

import React from 'react'
import { Calendar, Clock, Lock, Unlock, Play, Sparkles } from 'lucide-react'
import AcademyCard3D from './AcademyCard3D'
import AcademyButton3D from './AcademyButton3D'

interface CurriculumTimelineProps {
  onOpenEnroll: () => void
}

const EPISODES = [
  {
    num: '01',
    title: 'What Is AGI, Really?',
    desc: "Understand what Artificial General Intelligence actually means and how it differs from today's AI.",
    date: 'Sep 21, 2026',
    duration: '8 min',
    status: 'Unlocks Sep 21',
    unlocked: false,
  },
  {
    num: '02',
    title: "AI vs AGI: What's the Difference?",
    desc: 'Understand narrow AI, generative AI, and the capabilities generally associated with AGI.',
    date: 'Sep 24, 2026',
    duration: '8 min',
    status: 'Unlocks Sep 24',
    unlocked: false,
  },
  {
    num: '03',
    title: 'How Does Intelligence Work?',
    desc: 'Explore learning, reasoning, memory, planning, and adaptation across modern cognitive architectures.',
    date: 'Sep 28, 2026',
    duration: '9 min',
    status: 'Unlocks Sep 28',
    unlocked: false,
  },
  {
    num: '04',
    title: 'AI Agents: From Chatbots to Action',
    desc: 'Learn how AI agents combine models, memory, tools, reasoning, and autonomous multi-step actions.',
    date: 'Oct 1, 2026',
    duration: '10 min',
    status: 'Unlocks Oct 1',
    unlocked: false,
  },
  {
    num: '05',
    title: 'The Road to AGI',
    desc: 'Explore the major capabilities, challenges, open questions, and possible directions toward more general AI.',
    date: 'Oct 5, 2026',
    duration: '10 min',
    status: 'Unlocks Oct 5',
    unlocked: false,
  },
]

export default function CurriculumTimeline({ onOpenEnroll }: CurriculumTimelineProps) {
  return (
    <div className="w-full space-y-6 pt-16">
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-[#EA580C] text-xs font-bold uppercase tracking-wider">
          <Calendar className="w-3.5 h-3.5" />
          5-Part Syllabus
        </div>
        <h2
          className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1A1A1A] tracking-tight"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Course Curriculum & Schedule
        </h2>
        <p className="text-[#6B7280] text-sm">
          A structured roadmap from foundational concepts to frontier agentic architectures.
        </p>
      </div>

      <div className="space-y-4 max-w-4xl mx-auto">
        {EPISODES.map((ep) => (
          <AcademyCard3D
            key={ep.num}
            depth={14}
            className={`p-6 rounded-2xl border transition-all ${
              ep.unlocked
                ? 'bg-white/90 border-[#FED7AA] shadow-[0_8px_24px_rgba(234,88,12,0.08)] ring-1 ring-orange-200/60'
                : 'bg-white/70 border-[#E8E0D8] shadow-sm'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-xs ${
                    ep.unlocked
                      ? 'bg-gradient-to-tr from-[#EA580C] to-[#F97316] text-white shadow-orange-500/30'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {ep.num}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#9CA3AF]">
                      EPISODE {ep.num}
                    </span>
                    {ep.unlocked ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                        🔓 {ep.status}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600">
                        🔒 {ep.status}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-[#1A1A1A] tracking-tight">
                    {ep.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#4B5563] max-w-xl leading-relaxed">
                    {ep.desc}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-[#6B7280] pt-1">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      {ep.date}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5" />~{ep.duration}
                    </span>
                  </div>
                </div>
              </div>

              <div className="sm:text-right shrink-0">
                <AcademyButton3D
                  size="sm"
                  variant={ep.unlocked ? 'primary' : 'secondary'}
                  onClick={onOpenEnroll}
                >
                  {ep.unlocked ? (
                    <>
                      <Play className="w-3 h-3 fill-current" />
                      Enroll to Watch
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3" />
                      Enroll to Reserve
                    </>
                  )}
                </AcademyButton3D>
              </div>
            </div>
          </AcademyCard3D>
        ))}
      </div>
    </div>
  )
}
