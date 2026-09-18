'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface AcademyButton3DProps {
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  className?: string
  variant?: 'primary' | 'secondary' | 'glass'
  size?: 'sm' | 'md' | 'lg'
}

export default function AcademyButton3D({
  children,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  variant = 'primary',
  size = 'md',
}: AcademyButton3DProps) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm font-semibold',
    lg: 'px-8 py-4 text-base font-bold',
  }

  const variantStyles = {
    primary:
      'bg-gradient-to-b from-[#EA580C] to-[#C2410C] text-white shadow-[0_6px_0_#9A3412,0_12px_20px_rgba(234,88,12,0.35)] active:shadow-[0_2px_0_#9A3412,0_4px_10px_rgba(234,88,12,0.2)] border-t border-orange-300/40',
    secondary:
      'bg-gradient-to-b from-white to-[#F5EFEB] text-[#1A1A1A] shadow-[0_6px_0_#D7CCC8,0_10px_16px_rgba(0,0,0,0.06)] active:shadow-[0_2px_0_#D7CCC8,0_4px_8px_rgba(0,0,0,0.04)] border border-[#E8E0D8]',
    glass:
      'bg-white/70 backdrop-blur-md text-[#1A1A1A] shadow-[0_6px_0_rgba(232,224,216,0.8),0_10px_20px_rgba(0,0,0,0.05)] border border-white/60 active:shadow-[0_2px_0_rgba(232,224,216,0.8)]',
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ y: -2 }}
      whileTap={{ y: 4 }}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      className={`relative inline-flex items-center justify-center gap-2 rounded-xl transition-all select-none disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </motion.button>
  )
}
