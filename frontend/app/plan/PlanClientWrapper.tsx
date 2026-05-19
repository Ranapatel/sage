'use client'

import dynamic from 'next/dynamic'

// Disable SSR for the heavy planner component to avoid hydration mismatches
// and 500 errors caused by browser-only APIs like socket.io or window.
const PlanClient = dynamic(() => import('./PlanClient'), { ssr: false })

export default function PlanClientWrapper() {
  return <PlanClient />
}
