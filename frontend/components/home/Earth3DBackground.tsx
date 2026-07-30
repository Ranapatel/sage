'use client'

import React, { useEffect, useRef } from 'react'

interface CityNode {
  lat: number
  lng: number
}

const GLOBAL_CITY_NODES: CityNode[] = [
  { lat: 35.6762, lng: 139.6503 }, // Tokyo
  { lat: 40.7128, lng: -74.006 },  // New York
  { lat: 51.5074, lng: -0.1278 },  // London
  { lat: 25.2048, lng: 55.2708 },  // Dubai
  { lat: 1.3521, lng: 103.8198 },  // Singapore
  { lat: -8.4095, lng: 115.1889 }, // Bali
  { lat: 19.076, lng: 72.8777 },   // Mumbai
  { lat: 48.8566, lng: 2.3522 },   // Paris
  { lat: -33.8688, lng: 151.2093 },// Sydney
  { lat: 37.7749, lng: -122.4194 },// San Francisco
]

// Sparse continent vector points
const CONTINENT_VECTORS: [number, number][] = [
  // North America
  [58, -110], [52, -100], [45, -120], [40, -95], [36, -80], [30, -100], [25, -80], [64, -150], [48, -65],
  // South America
  [8, -75], [0, -60], [-10, -50], [-22, -43], [-33, -70], [-42, -65], [-12, -76],
  // Europe
  [60, 10], [55, 37], [52, 13], [48, 2], [42, -8], [40, 15], [38, 24], [64, 26],
  // Africa
  [30, 10], [25, 32], [15, 38], [12, -15], [5, 10], [0, 30], [-12, 18], [-25, 28], [-34, 18],
  // Asia
  [60, 75], [55, 90], [50, 130], [40, 116], [35, 105], [30, 80], [28, 77], [19, 73], [15, 100], [3, 114],
  // East Asia & Japan
  [43, 142], [36, 138], [33, 130], [13, 122], [4, 102],
  // Oceania
  [-18, 130], [-25, 134], [-32, 116], [-34, 150], [-22, 148], [-41, 174], [-36, 175],
]

export default function Earth3DBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let rotationAngle = 0
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth)
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight)

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return
      width = canvas.width = canvas.parentElement.clientWidth
      height = canvas.height = canvas.parentElement.clientHeight
    }

    window.addEventListener('resize', handleResize)

    // Projection helper: 3D sphere coordinate to 2D screen coordinate
    const project3D = (lat: number, lng: number, radius: number, rotAngle: number) => {
      const phi = (90 - lat) * (Math.PI / 180)
      const theta = (lng + rotAngle) * (Math.PI / 180)
      const tilt = 0.22 // quiet 3D axis tilt

      let x = radius * Math.sin(phi) * Math.cos(theta)
      let y = radius * Math.cos(phi)
      let z = radius * Math.sin(phi) * Math.sin(theta)

      const tiltedY = y * Math.cos(tilt) - z * Math.sin(tilt)
      const tiltedZ = y * Math.sin(tilt) + z * Math.cos(tilt)

      return { x, y: tiltedY, z: tiltedZ }
    }

    let pulseStep = 0

    const render = () => {
      ctx.clearRect(0, 0, width, height)
      rotationAngle += 0.12 // Extremely slow, calm Earth rotation
      pulseStep += 0.02

      const cx = width / 2
      const cy = height / 2.05
      const radius = Math.max(10, Math.min(width, height) * (width < 768 ? 0.44 : 0.36))

      // 1. Luminous Warm Light Atmosphere Glow (Full Upper Globe Highlight)
      const atmosGlow = ctx.createRadialGradient(cx, cy, radius * 0.85, cx, cy, radius * 1.5)
      atmosGlow.addColorStop(0, 'rgba(254, 215, 170, 0.55)')
      atmosGlow.addColorStop(0.4, 'rgba(253, 186, 116, 0.3)')
      atmosGlow.addColorStop(0.8, 'rgba(255, 237, 213, 0.12)')
      atmosGlow.addColorStop(1, 'rgba(255, 251, 247, 0)')

      ctx.beginPath()
      ctx.arc(cx, cy, radius * 1.5, 0, Math.PI * 2)
      ctx.fillStyle = atmosGlow
      ctx.fill()

      // 2. Translucent Light Glass Globe Base
      const sphereBg = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, radius * 0.1, cx, cy, radius)
      sphereBg.addColorStop(0, 'rgba(255, 255, 255, 0.92)')
      sphereBg.addColorStop(0.65, 'rgba(254, 243, 199, 0.52)')
      sphereBg.addColorStop(1, 'rgba(253, 230, 138, 0.25)')

      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.fillStyle = sphereBg
      ctx.shadowColor = 'rgba(234, 88, 12, 0.22)'
      ctx.shadowBlur = 28
      ctx.fill()
      ctx.shadowBlur = 0

      // Clip subsequent layers to 3D sphere
      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.clip()

      // 3. Crisp Upper Hemisphere Longitude & Latitude Grid Threads
      for (let lat = -75; lat <= 75; lat += 25) {
        ctx.beginPath()
        let first = true
        for (let lng = 0; lng <= 360; lng += 6) {
          const pt = project3D(lat, lng, radius, rotationAngle)
          if (pt.z > 0) {
            const px = cx + pt.x
            const py = cy - pt.y
            if (first) {
              ctx.moveTo(px, py)
              first = false
            } else {
              ctx.lineTo(px, py)
            }
          } else {
            first = true
          }
        }
        ctx.strokeStyle = 'rgba(234, 88, 12, 0.28)'
        ctx.lineWidth = 0.9
        ctx.stroke()
      }

      for (let lng = 0; lng < 360; lng += 30) {
        ctx.beginPath()
        let first = true
        for (let lat = -90; lat <= 90; lat += 5) {
          const pt = project3D(lat, lng, radius, rotationAngle)
          if (pt.z > 0) {
            const px = cx + pt.x
            const py = cy - pt.y
            if (first) {
              ctx.moveTo(px, py)
              first = false
            } else {
              ctx.lineTo(px, py)
            }
          } else {
            first = true
          }
        }
        ctx.strokeStyle = 'rgba(202, 138, 4, 0.3)'
        ctx.lineWidth = 0.9
        ctx.stroke()
      }

      // 4. Continent Points (Warm Terracotta Dots)
      CONTINENT_VECTORS.forEach(([lat, lng]) => {
        const pt = project3D(lat, lng, radius, rotationAngle)
        if (pt.z > 0) {
          const px = cx + pt.x
          const py = cy - pt.y
          const alpha = (pt.z / radius) * 0.7
          ctx.beginPath()
          ctx.arc(px, py, 1.8, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(194, 65, 12, ${alpha})`
          ctx.fill()
        }
      })

      // 5. Major City Light Hubs (Glowing Orange Nodes)
      const visibleNodes: { px: number; py: number }[] = []

      GLOBAL_CITY_NODES.forEach((city) => {
        const pt = project3D(city.lat, city.lng, radius, rotationAngle)
        if (pt.z > 0) {
          const px = cx + pt.x
          const py = cy - pt.y
          visibleNodes.push({ px, py })

          // Outer pulsing ring
          ctx.beginPath()
          ctx.arc(px, py, 5 + Math.sin(pulseStep * 3) * 1.5, 0, Math.PI * 2)
          ctx.strokeStyle = 'rgba(234, 88, 12, 0.45)'
          ctx.lineWidth = 0.9
          ctx.stroke()

          // Inner solid node
          ctx.beginPath()
          ctx.arc(px, py, 3, 0, Math.PI * 2)
          ctx.fillStyle = '#EA580C'
          ctx.shadowColor = 'rgba(234, 88, 12, 0.9)'
          ctx.shadowBlur = 12
          ctx.fill()
          ctx.shadowBlur = 0
        }
      })

      // 6. Luminous Flight Path Arcs
      for (let i = 0; i < visibleNodes.length; i++) {
        const c1 = visibleNodes[i]
        const c2 = visibleNodes[(i + 1) % visibleNodes.length]

        const midX = (c1.px + c2.px) / 2
        const midY = (c1.py + c2.py) / 2 - radius * 0.22

        ctx.beginPath()
        ctx.moveTo(c1.px, c1.py)
        ctx.quadraticCurveTo(midX, midY, c2.px, c2.py)
        ctx.strokeStyle = 'rgba(234, 88, 12, 0.42)'
        ctx.lineWidth = 1.2
        ctx.stroke()

        // Traveling pulse dot
        const t = (pulseStep * 0.6 + i * 0.2) % 1
        const partX = (1 - t) * (1 - t) * c1.px + 2 * (1 - t) * t * midX + t * t * c2.px
        const partY = (1 - t) * (1 - t) * c1.py + 2 * (1 - t) * t * midY + t * t * c2.py

        ctx.beginPath()
        ctx.arc(partX, partY, 2.5, 0, Math.PI * 2)
        ctx.fillStyle = '#F97316'
        ctx.shadowColor = '#EA580C'
        ctx.shadowBlur = 12
        ctx.fill()
        ctx.shadowBlur = 0
      }

      ctx.restore()

      // 7. Luminous Upper Rim Arc Highlight
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(234, 88, 12, 0.45)'
      ctx.lineWidth = 1.5
      ctx.shadowColor = '#EA580C'
      ctx.shadowBlur = 14
      ctx.stroke()
      ctx.shadowBlur = 0

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none z-0">
      <canvas ref={canvasRef} className="w-full h-full block opacity-85" />
    </div>
  )
}
