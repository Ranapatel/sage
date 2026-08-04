'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Instagram, Linkedin, Sparkles, ExternalLink } from 'lucide-react'

// Custom X (Twitter) icon component to render cleanly
function XTwitterIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

export interface FounderData {
  name: string
  role: string
  initials: string
  image?: string
  description: string
  skills: string[]
  socials: {
    instagram?: string
    twitter?: string
    linkedin?: string
  }
}

interface FounderModalProps {
  founder: FounderData | null
  onClose: () => void
}

export default function FounderModal({ founder, onClose }: FounderModalProps) {
  React.useEffect(() => {
    if (founder) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [founder])

  return (
    <AnimatePresence>
      {founder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-100"
          >
            {/* Header / Banner */}
            <div className="relative bg-gradient-to-r from-[#EA580C] via-orange-500 to-amber-500 p-6 pt-8 text-white">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
                title="Close"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-4">
                {founder.image ? (
                  <img
                    src={founder.image}
                    alt={founder.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-white/40 shadow-lg shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-white text-[#EA580C] flex items-center justify-center font-black text-2xl shadow-lg border-2 border-white/40 shrink-0">
                    {founder.initials}
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-black leading-snug">{founder.name}</h2>
                  <p className="text-xs text-orange-100 font-semibold mt-0.5">{founder.role}</p>
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-5 bg-white overflow-y-auto max-h-[70vh]">
              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">About</h4>
                <p className="text-slate-700 text-sm leading-relaxed font-normal">
                  {founder.description}
                </p>
              </div>

              {/* Skills */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-[#EA580C]" /> Key Expertise
                </h4>
                <div className="flex flex-wrap gap-2">
                  {founder.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-orange-50 text-[#EA580C] border border-orange-200 rounded-full text-xs font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Connect Links */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Connect</h4>
                <div className="flex items-center gap-3 flex-wrap">
                  {founder.socials.linkedin && (
                    <a
                      href={founder.socials.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 hover:bg-orange-50 text-slate-700 hover:text-[#EA580C] border border-slate-200 hover:border-orange-200 rounded-xl text-xs font-bold transition-all"
                    >
                      <Linkedin size={15} /> LinkedIn <ExternalLink size={12} className="opacity-50" />
                    </a>
                  )}
                  {founder.socials.twitter && (
                    <a
                      href={founder.socials.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 hover:bg-orange-50 text-slate-700 hover:text-[#EA580C] border border-slate-200 hover:border-orange-200 rounded-xl text-xs font-bold transition-all"
                    >
                      <XTwitterIcon size={13} /> X (Twitter) <ExternalLink size={12} className="opacity-50" />
                    </a>
                  )}
                  {founder.socials.instagram && (
                    <a
                      href={founder.socials.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 hover:bg-orange-50 text-slate-700 hover:text-[#EA580C] border border-slate-200 hover:border-orange-200 rounded-xl text-xs font-bold transition-all"
                    >
                      <Instagram size={15} /> Instagram <ExternalLink size={12} className="opacity-50" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 px-6 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-[#EA580C] hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-orange-600/20"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
