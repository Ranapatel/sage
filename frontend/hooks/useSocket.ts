'use client'

import { useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useTripStore } from '@/store/tripStore'
import toast from 'react-hot-toast'

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000'

export function useSocket() {
  const socketRef = useRef<Socket | null>(null)
  const { setConnected, setTransport, setHotels, setWeather, addNotification, setLoading } = useTripStore()

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000', {
      transports: ['websocket'],
      withCredentials: true,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      setConnected(true)
      console.log('[TripSage] Socket connected:', socket.id)
    })

    // Save server-issued sessionId
    socket.on('SESSION_INIT', ({ sessionId }: { sessionId: string }) => {
      sessionStorage.setItem('sessionId', sessionId)
      console.log('[TripSage] Session ID registered:', sessionId)
    })

    socket.on('disconnect', () => {
      setConnected(false)
      console.log('[TripSage] Socket disconnected')
    })

    // Real-time price updates
    socket.on('PRICE_UPDATE', (data) => {
      if (data.type === 'flight') {
        addNotification({
          id: Date.now().toString(),
          type: 'deal',
          title: '✈️ Price Alert',
          message: `Flight price dropped to $${data.price}!`,
          timestamp: new Date().toISOString(),
          read: false,
        })
        toast.success(`Flight price dropped to $${data.price}!`)
      }
    })

    // Weather alerts
    socket.on('WEATHER_ALERT', (data) => {
      setWeather(data)
      addNotification({
        id: Date.now().toString(),
        type: 'weather',
        title: '🌦️ Weather Update',
        message: data.message || `${data.condition} at ${data.destination}`,
        timestamp: new Date().toISOString(),
        read: false,
      })
    })

    // Live search results streaming
    socket.on('SEARCH_RESULTS', (data) => {
      if (data.transport) setTransport(data.transport)
      if (data.hotels) setHotels(data.hotels)
      setLoading(false)
    })

    // Booking status updates
    socket.on('BOOKING_UPDATE', (data) => {
      addNotification({
        id: Date.now().toString(),
        type: 'info',
        title: '📋 Booking Update',
        message: data.message,
        timestamp: new Date().toISOString(),
        read: false,
      })
      if (data.status === 'CONFIRMED') {
        toast.success('Booking confirmed! 🎉')
      }
    })

    // Location-based notifications
    socket.on('LOCATION_ALERT', (data) => {
      addNotification({
        id: Date.now().toString(),
        type: 'alert',
        title: '📍 ' + data.title,
        message: data.message,
        timestamp: new Date().toISOString(),
        read: false,
      })
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data)
    }
  }, [])

  return { socket: socketRef.current, emit }
}
