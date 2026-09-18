'use client'

import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface Academy3DCanvasProps {
  className?: string
}

export default function Academy3DCanvas({ className = '' }: Academy3DCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const width = container.clientWidth || window.innerWidth
    const height = container.clientHeight || window.innerHeight

    // ── 1. Scene, Camera & Renderer ───────────────────────────────────────
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000)
    camera.position.set(0, 0, 18)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.3
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(renderer.domElement)

    // ── 2. Studio Lighting (Apple Keynote High-Key Lighting) ───────────────
    const ambientLight = new THREE.AmbientLight(0xfff7ed, 1.8)
    scene.add(ambientLight)

    // Main Warm Sunset Key Light
    const keyLight = new THREE.DirectionalLight(0xffeedd, 3.5)
    keyLight.position.set(12, 15, 14)
    scene.add(keyLight)

    // Vibrant Orange Rim Light
    const orangeRimLight = new THREE.PointLight(0xea580c, 8, 30)
    orangeRimLight.position.set(-10, 8, 8)
    scene.add(orangeRimLight)

    // Amber Fill Light from below
    const amberFillLight = new THREE.PointLight(0xf59e0b, 5, 25)
    amberFillLight.position.set(8, -10, 6)
    scene.add(amberFillLight)

    // Soft Blue-Violet Specular Highlight
    const specularLight = new THREE.PointLight(0x818cf8, 3, 20)
    specularLight.position.set(0, 10, -8)
    scene.add(specularLight)

    // ── 3. The Cinematic 3D AGI Quantum Core ─────────────────────────────
    const coreRoot = new THREE.Group()
    scene.add(coreRoot)

    // A. Outer Frosted Glass Sphere (Real Optical Refraction & Specular Highlights)
    const glassSphereGeom = new THREE.SphereGeometry(3.6, 64, 64)
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.92,
      opacity: 1,
      transparent: true,
      roughness: 0.08,
      ior: 1.48, // True crown glass index of refraction
      thickness: 1.8,
      specularColor: 0xffedd5,
      specularIntensity: 1.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
    })
    const glassSphere = new THREE.Mesh(glassSphereGeom, glassMaterial)
    coreRoot.add(glassSphere)

    // B. Inner Radiant Plasma Energy Nucleus
    const innerCoreGeom = new THREE.SphereGeometry(1.6, 48, 48)
    const innerCoreMaterial = new THREE.MeshStandardMaterial({
      color: 0xea580c,
      emissive: 0xd97706,
      emissiveIntensity: 1.2,
      roughness: 0.2,
      metalness: 0.5,
    })
    const innerCore = new THREE.Mesh(innerCoreGeom, innerCoreMaterial)
    coreRoot.add(innerCore)

    // C. Concentric Brushed Gold & Titanium Gyroscopic Rings
    const ringConfigs = [
      { radius: 4.8, tube: 0.14, color: 0xd97706, metalness: 0.95, roughness: 0.18, rx: 0.6, ry: 0.4 },
      { radius: 6.2, tube: 0.12, color: 0xea580c, metalness: 0.92, roughness: 0.22, rx: -0.8, ry: 1.2 },
      { radius: 7.6, tube: 0.10, color: 0xb45309, metalness: 0.96, roughness: 0.15, rx: 1.4, ry: -0.5 },
    ]

    const rings: THREE.Mesh[] = []
    ringConfigs.forEach((cfg) => {
      const ringGeom = new THREE.TorusGeometry(cfg.radius, cfg.tube, 32, 120)
      const ringMat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        metalness: cfg.metalness,
        roughness: cfg.roughness,
      })
      const ringMesh = new THREE.Mesh(ringGeom, ringMat)
      ringMesh.rotation.set(cfg.rx, cfg.ry, 0)
      rings.push(ringMesh)
      coreRoot.add(ringMesh)
    })

    // D. Orbiting Neural Satellite Nodes (Solid Polished Spheres)
    const nodeCount = 12
    const satelliteNodes: THREE.Mesh[] = []
    const nodeGeom = new THREE.SphereGeometry(0.24, 24, 24)
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xea580c,
      emissiveIntensity: 0.8,
      metalness: 0.9,
      roughness: 0.1,
    })

    for (let i = 0; i < nodeCount; i++) {
      const node = new THREE.Mesh(nodeGeom, nodeMat)
      satelliteNodes.push(node)
      coreRoot.add(node)
    }

    // E. Glowing AGI Particles Floating in Orbit
    const particleCount = 90
    const particlePositions = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      const radius = 4.2 + Math.random() * 5.0
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      particlePositions[i * 3 + 2] = radius * Math.cos(phi)
    }

    const particlesGeom = new THREE.BufferGeometry()
    particlesGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
    const particlesMat = new THREE.PointsMaterial({
      color: 0xf59e0b,
      size: 0.16,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    })
    const particleField = new THREE.Points(particlesGeom, particlesMat)
    coreRoot.add(particleField)

    // ── 4. Interactive Cursor Parallax Tracking ────────────────────────────
    let targetRotationX = 0
    let targetRotationY = 0
    let currentRotationX = 0
    let currentRotationY = 0

    const onMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1
      const normY = -(e.clientY / window.innerHeight) * 2 + 1
      targetRotationY = normX * 0.45
      targetRotationX = -normY * 0.35
    }

    window.addEventListener('mousemove', onMouseMove)

    // ── 5. Render Loop with Realistic Inertia & Physics ───────────────────
    let animationFrameId: number
    const clock = new THREE.Clock()

    const render = () => {
      animationFrameId = requestAnimationFrame(render)
      const elapsed = clock.getElapsedTime()

      // Smooth camera/object tilt interpolation (Apple spring feel)
      currentRotationX += (targetRotationX - currentRotationX) * 0.05
      currentRotationY += (targetRotationY - currentRotationY) * 0.05

      coreRoot.rotation.x = currentRotationX + Math.sin(elapsed * 0.3) * 0.08
      coreRoot.rotation.y = currentRotationY + elapsed * 0.15

      // Floating gentle levitation
      coreRoot.position.y = Math.sin(elapsed * 0.8) * 0.25

      // Dynamic Gyroscopic Counter-Rotation
      rings.forEach((ring, idx) => {
        const speed = (idx + 1) * 0.005
        ring.rotation.x += (idx % 2 === 0 ? 1 : -1) * speed
        ring.rotation.y += (idx % 2 === 0 ? -1 : 1) * speed * 1.2
      })

      // Inner Core Pulse
      const pulse = 1 + Math.sin(elapsed * 2.2) * 0.08
      innerCore.scale.set(pulse, pulse, pulse)

      // Orbiting Satellite Nodes
      satelliteNodes.forEach((node, idx) => {
        const orbitRadius = 4.8 + (idx % 3) * 1.2
        const speed = 0.5 + (idx % 4) * 0.2
        const offset = (idx * Math.PI * 2) / nodeCount
        const angle = elapsed * speed + offset

        node.position.x = Math.cos(angle) * orbitRadius
        node.position.z = Math.sin(angle) * orbitRadius
        node.position.y = Math.sin(angle * 2) * 1.4
      })

      // Subtle light oscillation
      orangeRimLight.intensity = 7 + Math.sin(elapsed * 3) * 2

      renderer.render(scene, camera)
    }

    render()

    // ── 6. Resize Handler ──────────────────────────────────────────────────
    const onResize = () => {
      if (!container) return
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }

    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
      glassSphereGeom.dispose()
      glassMaterial.dispose()
      innerCoreGeom.dispose()
      innerCoreMaterial.dispose()
      rings.forEach((r) => {
        r.geometry.dispose()
        ;(r.material as THREE.Material).dispose()
      })
      nodeGeom.dispose()
      nodeMat.dispose()
      particlesGeom.dispose()
      particlesMat.dispose()
    }
  }, [])

  return (
    <div
      ref={mountRef}
      className={`pointer-events-none absolute inset-0 overflow-hidden flex items-center justify-center ${className}`}
      style={{ zIndex: 1 }}
      aria-hidden="true"
    />
  )
}
