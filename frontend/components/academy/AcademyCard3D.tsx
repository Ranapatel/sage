'use client'

import React, { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

interface AcademyCard3DProps {
  children: React.ReactNode
  className?: string
  glowColor?: string
  depth?: number
  onClick?: () => void
}

export default function AcademyCard3D({
  children,
  className = '',
  glowColor = 'rgba(234, 88, 12, 0.15)',
  depth = 20,
  onClick,
}: AcademyCard3DProps) {
  const cardRef = useRef<HTMLDivElement | null>(null)
  const [isHovered, setIsHovered] = useState(false)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 25 })
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 25 })

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['10deg', '-10deg'])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-10deg', '10deg'])

  // Gloss sheen position
  const glossX = useTransform(mouseXSpring, [-0.5, 0.5], ['0%', '100%'])
  const glossY = useTransform(mouseYSpring, [-0.5, 0.5], ['0%', '100%'])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5
    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className={`relative rounded-2xl transition-shadow duration-300 ${className}`}
    >
      {/* 3D Depth Specular Sheen */}
      {isHovered && (
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-40 transition-opacity duration-300"
          style={{
            background: `radial-gradient(400px circle at ${glossX} ${glossY}, ${glowColor}, transparent 70%)`,
          }}
        />
      )}

      {/* Inner Content with TranslateZ for physical 3D layering */}
      <div style={{ transform: `translateZ(${isHovered ? depth : 0}px)` }} className="transition-transform duration-200">
        {children}
      </div>
    </motion.div>
  )
}
