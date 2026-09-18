'use client'

import React, { useRef, useState, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, CheckCircle2, Sparkles, X } from 'lucide-react'

interface AcademyVideoPlayerProps {
  src?: string
  title?: string
  subtitle?: string
  autoplay?: boolean
  onClose?: () => void
  onEnded?: () => void
  isModal?: boolean
}

export default function AcademyVideoPlayer({
  src = '/academy/intro.mp4',
  title = 'Foundations of AGI — Orientation & Intro',
  subtitle = 'Welcome to TripSage Academy',
  autoplay = false,
  onClose,
  onEnded,
  isModal = false,
}: AcademyVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState('0:00')
  const [duration, setDuration] = useState('0:00')
  const [isMuted, setIsMuted] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [showControls, setShowControls] = useState(true)
  const [isCompleted, setIsCompleted] = useState(false)

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (autoplay) {
      video.play().then(() => {
        setIsPlaying(true)
        setHasStarted(true)
      }).catch(() => {
        // Autoplay blocked: mute and retry
        video.muted = true
        setIsMuted(true)
        video.play().then(() => {
          setIsPlaying(true)
          setHasStarted(true)
        }).catch(() => {})
      })
    }
  }, [autoplay, src])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return
    if (isPlaying) {
      video.pause()
      setIsPlaying(false)
    } else {
      video.play()
      setIsPlaying(true)
      setHasStarted(true)
    }
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setIsMuted(video.muted)
  }

  const handleTimeUpdate = () => {
    const video = videoRef.current
    if (!video) return
    const current = video.currentTime
    const total = video.duration || 1
    setProgress((current / total) * 100)
    setCurrentTime(formatTime(current))
    setDuration(formatTime(total))
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current
    if (!video) return
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newProgress = clickX / rect.width
    video.currentTime = newProgress * video.duration
  }

  const cycleSpeed = () => {
    const video = videoRef.current
    if (!video) return
    const speeds = [1, 1.25, 1.5, 2]
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length
    const nextSpeed = speeds[nextIdx]
    video.playbackRate = nextSpeed
    setPlaybackSpeed(nextSpeed)
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }

  const handleVideoEnded = () => {
    setIsPlaying(false)
    setIsCompleted(true)
    if (onEnded) onEnded()
  }

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className={`relative w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10 group ${
        isModal ? 'max-w-4xl mx-auto' : ''
      }`}
    >
      {/* Top Header Bar inside Video */}
      <div
        className={`absolute top-0 inset-x-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-white text-sm sm:text-base font-bold tracking-tight">{title}</h4>
            <p className="text-white/60 text-xs">{subtitle}</p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* HTML5 Video Element */}
      <video
        ref={videoRef}
        src={src}
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleVideoEnded}
        onClick={togglePlay}
        className="w-full aspect-video object-cover cursor-pointer"
      />

      {/* Big Center Play Button (when paused) */}
      {!isPlaying && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-[2px] cursor-pointer transition-all hover:bg-black/30"
        >
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-[#EA580C] to-[#F97316] text-white flex items-center justify-center shadow-[0_0_40px_rgba(234,88,12,0.6)] transform hover:scale-110 active:scale-95 transition-all">
            {isCompleted ? <RotateCcw className="w-9 h-9" /> : <Play className="w-9 h-9 ml-1" />}
          </div>
        </div>
      )}

      {/* Bottom Controls Bar */}
      <div
        className={`absolute bottom-0 inset-x-0 z-20 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Progress Scrubber */}
        <div
          onClick={handleSeek}
          className="relative w-full h-2 rounded-full bg-white/20 cursor-pointer overflow-hidden mb-3 hover:h-2.5 transition-all"
        >
          <div
            className="h-full bg-gradient-to-r from-[#EA580C] to-[#F97316] relative transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between text-white text-xs sm:text-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>

            <button
              onClick={toggleMute}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            <span className="font-mono text-white/70 text-xs">
              {currentTime} / {duration}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={cycleSpeed}
              className="px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white font-mono text-xs transition-colors"
            >
              {playbackSpeed}x
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
