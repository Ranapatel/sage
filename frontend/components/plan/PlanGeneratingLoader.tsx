'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Icon3DTransport,
  Icon3DTrain,
  Icon3DBus,
  Icon3DCar,
  Icon3DSmartRoute,
} from '@/components/ui/TripSageIcons'

const ICONS = [
  { id: 'flight', Icon: Icon3DTransport,  color: '#0284C7', glow: 'rgba(2,132,199,0.3)'  },
  { id: 'train',  Icon: Icon3DTrain,      color: '#7C3AED', glow: 'rgba(124,58,237,0.3)' },
  { id: 'bus',    Icon: Icon3DBus,        color: '#EA580C', glow: 'rgba(234,88,12,0.3)'  },
  { id: 'car',    Icon: Icon3DCar,        color: '#059669', glow: 'rgba(5,150,105,0.3)'  },
  { id: 'route',  Icon: Icon3DSmartRoute, color: '#D97706', glow: 'rgba(217,119,6,0.3)'  },
]

const LOOP_DURATION = 4

interface Props { destination?: string }

export default function PlanGeneratingLoader({ destination }: Props) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setProgress(p => Math.min(p + Math.random() * 3, 92)), 500)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="relative flex flex-col items-center justify-center py-14 px-6 overflow-hidden select-none">

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-slate-100">
        <motion.div
          className="h-full"
          style={{ background: 'linear-gradient(90deg, #EA580C, #F97316, #FBBF24)' }}
          animate={{ width: `${progress}%` }}
          transition={{ ease: 'easeOut', duration: 0.7 }}
        />
      </div>

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 55% 45% at 50% 75%, rgba(234,88,12,0.05) 0%, transparent 70%)',
      }} />

      {/* Destination pill */}
      {destination && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-200/70"
        >
          <motion.span
            className="w-1.5 h-1.5 rounded-full bg-[#EA580C]"
            animate={{ scale: [1, 1.6, 1], opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#EA580C]">
            {destination}
          </span>
        </motion.div>
      )}

      {/* Icons row */}
      <div className="relative w-full max-w-[420px]">

        <div className="flex justify-between items-end px-1 mb-4">
          {ICONS.map(({ id, Icon, glow }, i) => (
            <motion.div
              key={id}
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.3,
              }}
            >
              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                  filter: [
                    `drop-shadow(0 2px 4px transparent)`,
                    `drop-shadow(0 6px 16px ${glow})`,
                    `drop-shadow(0 2px 4px transparent)`,
                  ],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  repeatDelay: LOOP_DURATION - 0.6,
                  ease: 'easeOut',
                  delay: i * (LOOP_DURATION / (ICONS.length - 1)),
                }}
              >
                <Icon size={44} active />
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Track line */}
        <div className="relative h-px mx-1">
          {/* Dashed base */}
          <div className="absolute inset-0" style={{
            background: 'repeating-linear-gradient(90deg, #CBD5E1 0px, #CBD5E1 6px, transparent 6px, transparent 14px)',
          }} />

          {/* Shimmer sweep */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute inset-y-0 w-24"
              style={{ background: 'linear-gradient(90deg, transparent, #EA580C80, transparent)' }}
              animate={{ x: ['-100%', '500%'] }}
              transition={{ duration: LOOP_DURATION, repeat: Infinity, ease: 'linear' }}
            />
          </div>

          {/* Waypoint dots */}
          <div className="absolute inset-0 flex justify-between items-center -translate-y-px">
            {ICONS.map(({ id, color }, i) => (
              <motion.div
                key={id}
                className="w-2 h-2 rounded-full"
                style={{ background: color }}
                animate={{ scale: [1, 1.6, 1], opacity: [0.4, 1, 0.4] }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  repeatDelay: LOOP_DURATION - 0.5,
                  delay: i * (LOOP_DURATION / (ICONS.length - 1)),
                  ease: 'easeOut',
                }}
              />
            ))}
          </div>

          {/* Traveling dot */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
            style={{
              background: '#EA580C',
              boxShadow: '0 0 0 3px rgba(234,88,12,0.2), 0 0 10px rgba(234,88,12,0.5)',
            }}
            animate={{ left: ['0%', '100%'] }}
            transition={{ duration: LOOP_DURATION, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      </div>

      {/* Bouncing loader dots below animation */}
      <div className="flex items-center gap-1.5 mt-8">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="rounded-full"
            style={{ width: 6, height: 6, background: '#EA580C', opacity: 0.7 }}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 0.7, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  )
}
