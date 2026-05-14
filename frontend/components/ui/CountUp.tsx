'use client'

import { useState, useEffect, useRef } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'

interface CountUpProps {
  to: number
  suffix?: string
}

export default function CountUp({ to, suffix = "" }: CountUpProps) {
  const [count, setCount] = useState(0)
  const [mounted, setMounted] = useState(false)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (inView && mounted && !shouldReduceMotion) {
      let start = 0
      const end = to
      const duration = 2000
      const increment = end / (duration / 16)

      const timer = setInterval(() => {
        start += increment
        if (start >= end) {
          setCount(end)
          clearInterval(timer)
        } else {
          setCount(Math.floor(start))
        }
      }, 16)
      return () => clearInterval(timer)
    } else if (inView && (shouldReduceMotion || !mounted)) {
      setCount(to)
    }
  }, [inView, to, shouldReduceMotion, mounted])

  // Avoid hydration mismatch by rendering a stable placeholder or the final number
  return (
    <span ref={ref}>
      {mounted ? count.toLocaleString() : '0'}
      {suffix}
    </span>
  )
}
