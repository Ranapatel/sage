'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  CheckCircle2,
  Lock,
  Calendar,
  Clock,
  FileText,
  Download,
  Share2,
  ArrowRight,
  Plane,
  Sparkles,
  Award,
  ChevronRight,
  Bookmark,
  RotateCcw,
} from 'lucide-react'
import AcademyVideoPlayer from './AcademyVideoPlayer'

interface Episode {
  episodeNumber: number
  title: string
  synopsis: string
  durationText: string
  releaseDateText: string
  status: 'available' | 'unlocks_date' | 'upcoming'
  unlockDate: string
  videoUrl?: string
  takeaways: string[]
}

const EPISODES_DATA: Episode[] = [
  {
    episodeNumber: 1,
    title: 'What Is AGI, Really?',
    synopsis:
      "Understand what Artificial General Intelligence actually means, the philosophical foundations, and how general cognitive architectures differ from today's narrow LLMs.",
    durationText: '8 min',
    releaseDateText: 'Sep 21, 2026',
    unlockDate: 'Sep 21',
    status: 'available',
    videoUrl: '/academy/intro.mp4',
    takeaways: [
      'Definition of General Intelligence vs Narrow AI',
      'The Turing, ARC, and reasoning benchmarks',
      'Autonomy and transfer learning across unfamiliar domains',
    ],
  },
  {
    episodeNumber: 2,
    title: "AI vs AGI: What's the Difference?",
    synopsis:
      'A deep dive into generative AI, transformer limitations, and the fundamental cognitive capabilities generally associated with genuine AGI.',
    durationText: '8 min',
    releaseDateText: 'Sep 24, 2026',
    unlockDate: 'Sep 24',
    status: 'unlocks_date',
    videoUrl: '',
    takeaways: [
      'Why pattern completion is not full reasoning',
      'System 1 (fast/intuitive) vs System 2 (deliberate) thinking',
      'World models and grounded causal reasoning',
    ],
  },
  {
    episodeNumber: 3,
    title: 'How Does Intelligence Work?',
    synopsis:
      'Explore the mechanics of learning, working memory, episodic memory, planning trees, and self-supervised adaptation.',
    durationText: '9 min',
    releaseDateText: 'Sep 28, 2026',
    unlockDate: 'Sep 28',
    status: 'upcoming',
    videoUrl: '',
    takeaways: [
      'Working memory vs long-term episodic retrieval',
      'Tree-search algorithms and test-time verification',
      'Continual learning without catastrophic forgetting',
    ],
  },
  {
    episodeNumber: 4,
    title: 'AI Agents: From Chatbots to Action',
    synopsis:
      'Understand how models turn into active agents through tool use, sensory grounding, and multi-agent coordination loops.',
    durationText: '10 min',
    releaseDateText: 'Oct 1, 2026',
    unlockDate: 'Oct 1',
    status: 'upcoming',
    videoUrl: '',
    takeaways: [
      'Perception-Action loops and tool invocation',
      'Subagent orchestration and verification pipelines',
      'How TripSage applies autonomous planning to travel logistics',
    ],
  },
  {
    episodeNumber: 5,
    title: 'The Road to AGI',
    synopsis:
      'The frontiers ahead: scaling laws, compute bottlenecks, neural-symbolic hybridization, safety alignment, and society.',
    durationText: '10 min',
    releaseDateText: 'Oct 5, 2026',
    unlockDate: 'Oct 5',
    status: 'upcoming',
    videoUrl: '',
    takeaways: [
      'Frontier compute trajectories and data limits',
      'Safety boundaries and reward hacking mitigation',
      'Preparing engineering careers for the cognitive age',
    ],
  },
]

interface AcademyDashboardProps {
  student: {
    name: string
    email: string
    organization?: string
  }
  progress?: {
    completedEpisodes?: number[]
  }
  onResetSession?: () => void
}

export default function AcademyDashboard({
  student,
  progress = { completedEpisodes: [] },
  onResetSession,
}: AcademyDashboardProps) {
  const [completedEpisodes, setCompletedEpisodes] = useState<number[]>(
    progress.completedEpisodes || []
  )
  const [selectedEpisode, setSelectedEpisode] = useState<Episode>(EPISODES_DATA[0])

  const completedCount = completedEpisodes.length
  const totalEpisodes = 5
  const progressPercent = Math.round((completedCount / totalEpisodes) * 100)

  const handleToggleComplete = (epNum: number) => {
    let next: number[]
    if (completedEpisodes.includes(epNum)) {
      next = completedEpisodes.filter((n) => n !== epNum)
    } else {
      next = [...completedEpisodes, epNum].sort((a, b) => a - b)
    }
    setCompletedEpisodes(next)

    // Sync to backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
    fetch(`${backendUrl}/api/academy/complete-episode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: student.email, episodeNumber: epNum }),
    }).catch(() => {})
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 relative z-10 text-[#1A1A1A]">
      {/* ─── 1. TOP HEADER & PROGRESS BAR ────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E0D8] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-orange-50 text-[#EA580C] text-[11px] font-extrabold uppercase tracking-wider border border-orange-200">
              TripSage Academy
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-semibold text-slate-600">Foundations of AGI</span>
          </div>
          <h1
            className="text-2xl sm:text-3xl font-black text-[#1A1A1A] tracking-tight"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Welcome, {student.name} 👋
          </h1>
          <p className="text-xs sm:text-sm text-[#57534E]">
            Track your lessons, stream course episodes, and earn your certificate upon completion.
          </p>
        </div>

        {/* Circular Progress & Stats Pill */}
        <div className="flex items-center gap-5 shrink-0 bg-[#FFFBF7] px-5 py-4 rounded-2xl border border-[#E8E0D8]">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-[#1A1A1A]">
              <span>Course Progress</span>
              <span className="text-[#EA580C] font-mono">{progressPercent}%</span>
            </div>
            <div className="w-48 sm:w-56 h-2.5 rounded-full bg-[#E8E0D8] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#EA580C] to-[#F97316] transition-all duration-500"
                style={{ width: `${Math.max(progressPercent, 4)}%` }}
              />
            </div>
            <div className="text-[11px] font-semibold text-slate-500">
              {completedCount} of {totalEpisodes} episodes completed
            </div>
          </div>

          <div className="w-11 h-11 rounded-2xl bg-orange-100 border border-orange-200 flex items-center justify-center text-[#EA580C]">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ─── 2. THEATER & PLAYLIST SPLIT LAYOUT ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Stage (Video Theater & Notes) - 8 cols */}
        <div className="lg:col-span-8 space-y-6">
          {/* Theater Video Player Card */}
          <div className="rounded-3xl overflow-hidden bg-black shadow-xl border border-slate-900">
            {selectedEpisode.videoUrl ? (
              <AcademyVideoPlayer
                src={selectedEpisode.videoUrl}
                title={`Episode ${selectedEpisode.episodeNumber}: ${selectedEpisode.title}`}
                subtitle="TripSage Academy"
                autoplay={false}
                onEnded={() => handleToggleComplete(selectedEpisode.episodeNumber)}
              />
            ) : (
              <div className="aspect-video w-full bg-[#18181B] flex flex-col items-center justify-center text-center p-8 text-white space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-orange-400">
                  <Lock className="w-7 h-7" />
                </div>
                <div className="space-y-1 max-w-md">
                  <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                    Drip Release
                  </span>
                  <h3 className="text-xl font-bold">
                    Episode {selectedEpisode.episodeNumber} Unlocks {selectedEpisode.unlockDate}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400">
                    This episode is scheduled to release on {selectedEpisode.releaseDateText}. You will
                    receive instant access as soon as it unlocks.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Episode Info */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E0D8] space-y-6 shadow-sm text-[#1A1A1A]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E0D8] pb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#EA580C] uppercase tracking-wider">
                  <span>Episode {selectedEpisode.episodeNumber}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-slate-500 font-medium">
                    <Clock className="w-3.5 h-3.5" /> {selectedEpisode.durationText}
                  </span>
                </div>
                <h2
                  className="text-xl sm:text-2xl font-bold text-[#1A1A1A] tracking-tight"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {selectedEpisode.title}
                </h2>
              </div>

              {/* Mark Complete Button */}
              <button
                onClick={() => handleToggleComplete(selectedEpisode.episodeNumber)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  completedEpisodes.includes(selectedEpisode.episodeNumber)
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                    : 'bg-[#EA580C] text-white hover:bg-[#C2410C]'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                {completedEpisodes.includes(selectedEpisode.episodeNumber)
                  ? 'Completed'
                  : 'Mark as Watched'}
              </button>
            </div>

            {/* Synopsis */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Episode Synopsis
              </h4>
              <p className="text-sm text-[#57534E] leading-relaxed">{selectedEpisode.synopsis}</p>
            </div>

            {/* Key Takeaways */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Key Learning Outcomes
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {selectedEpisode.takeaways.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 text-xs text-[#4A4A4A] p-3 rounded-xl bg-[#FFFBF7] border border-[#E8E0D8]"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C] shrink-0 mt-1.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Playlist (Syllabus List) - 4 cols */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider">
              Course Playlist
            </h3>
            <span className="text-xs font-semibold text-slate-500">5 Episodes</span>
          </div>

          <div className="space-y-3">
            {EPISODES_DATA.map((ep) => {
              const isSelected = selectedEpisode.episodeNumber === ep.episodeNumber
              const isDone = completedEpisodes.includes(ep.episodeNumber)
              const isUnlocked = ep.status === 'available'

              return (
                <div
                  key={ep.episodeNumber}
                  onClick={() => setSelectedEpisode(ep)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex items-center justify-between gap-3 bg-white ${
                    isSelected
                      ? 'border-[#EA580C] shadow-sm bg-orange-50/50'
                      : 'border-[#E8E0D8] hover:border-orange-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                        isDone
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : isSelected
                          ? 'bg-[#EA580C] text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="w-4 h-4" /> : `0${ep.episodeNumber}`}
                    </div>

                    <div className="min-w-0">
                      <h4
                        className={`text-xs sm:text-sm font-bold truncate ${
                          isSelected ? 'text-[#EA580C]' : 'text-[#1A1A1A]'
                        }`}
                      >
                        {ep.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span>{ep.durationText}</span>
                        <span>·</span>
                        <span>{isUnlocked ? 'Available' : ep.unlockDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isUnlocked ? (
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-orange-100 text-[#EA580C]' : 'text-slate-400'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* TripSage AI Trip Planner Conversion Bridge */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#FFF8F3] to-[#FFFBF7] border border-orange-200 shadow-sm space-y-4 relative overflow-hidden mt-6">
            <div className="space-y-1.5 relative z-10">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#EA580C] flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Real-World Agent
              </span>
              <h4 className="text-lg font-bold tracking-tight text-[#1A1A1A]">Want to see AI in action?</h4>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Test autonomous planning firsthand. Generate transparent travel schedules and smart
                budgets with TripSage.
              </p>
            </div>

            <Link
              href="/ai-trip-planner"
              className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold transition-all shadow-sm"
            >
              <Plane className="w-4 h-4" />
              Plan My Trip with TripSage →
            </Link>
          </div>

          {/* Switch Learner Demo Option */}
          {onResetSession && (
            <div className="text-center pt-2">
              <button
                onClick={onResetSession}
                className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Switch Learner / Demo Reset
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
