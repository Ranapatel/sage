'use client'

import { useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useTripStore } from '@/store/tripStore'
import toast from 'react-hot-toast'

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000'

export function useSocket() {
  const socketRef = useRef<Socket | null>(null)
  const { setConnected, setTransport, setHotels, setBuses, setCars, setItinerary, setWeather, addNotification, setLoading, setError } = useTripStore()

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],   // polling as fallback
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,              // retry up to 10 times
      reconnectionDelay: 1000,              // start with 1s
      reconnectionDelayMax: 15000,          // cap at 15s (exponential backoff)
      timeout: 10000,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      setConnected(true)
      console.log('[TripSage] Socket connected:', socket.id)
    })

    socket.on('connect_error', (err) => {
      setConnected(false)
      console.warn('[TripSage] Socket connect error:', err.message)
      toast.error('Connection issue — retrying...', { id: 'socket-error', duration: 3000 })
    })

    socket.on('reconnect', (attempt: number) => {
      setConnected(true)
      toast.success('Reconnected!', { id: 'socket-reconnect', duration: 2000 })
      console.log('[TripSage] Socket reconnected after', attempt, 'attempts')
    })

    socket.on('reconnect_failed', () => {
      setConnected(false)
      setLoading(false)
      setError('Unable to connect to TripSage server. Please refresh the page.')
      toast.error('Connection failed — please refresh', { id: 'socket-fail', duration: 8000 })
    })

    // Save server-issued sessionId
    socket.on('SESSION_INIT', ({ sessionId }: { sessionId: string }) => {
      sessionStorage.setItem('sessionId', sessionId)
      console.log('[TripSage] Session ID registered:', sessionId)
    })

    socket.on('disconnect', (reason: string) => {
      setConnected(false)
      console.log('[TripSage] Socket disconnected:', reason)
      // If server forced disconnect, re-trigger connect
      if (reason === 'io server disconnect') {
        toast('Disconnected by server — reconnecting...', { icon: '🔌', id: 'socket-dc' })
        socket.connect()
      }
    })

    // Real-time price updates
    socket.on('PRICE_UPDATE', (data: any) => {
      try {
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
      } catch (_) {}
    })

    // Weather alerts
    socket.on('WEATHER_ALERT', (data: any) => {
      try {
        setWeather(data)
        addNotification({
          id: Date.now().toString(),
          type: 'weather',
          title: '🌦️ Weather Update',
          message: data.message || `${data.condition} at ${data.destination}`,
          timestamp: new Date().toISOString(),
          read: false,
        })
      } catch (_) {}
    })

    // Live search results streaming
    socket.on('SEARCH_RESULTS', (data: any) => {
      try {
        if (data.transport) setTransport(data.transport)
        if (data.hotels) setHotels(data.hotels)
        setLoading(false)
      } catch (_) {}
    })

    // Progressive trip generation stream — fully fault-tolerant
    socket.on('TRIP_STAGE', (payload: any) => {
      try {
        const { stage, data, message } = payload

        if (stage === 'analysis') {
          toast.success(`Analyzing ${data?.userType || ''} trip...`, { id: 'stream-analysis' })
        } else if (stage === 'hotels') {
          setHotels(data || [])
          if ((data?.length || 0) > 0) toast.success(`Found ${data.length} hotels`, { id: 'stream-hotels' })
        } else if (stage === 'transport') {
          if (Array.isArray(data?.flights)) setTransport(data.flights)
          if (Array.isArray(data?.buses)) setBuses(data.buses)
          if (Array.isArray(data?.cars)) setCars(data.cars)
        } else if (stage === 'activities') {
          if ((data?.length || 0) > 0) toast.success(`Found ${data.length} activities`, { id: 'stream-activities' })
        } else if (stage === 'itinerary') {
          setItinerary(data || [])
          if ((data?.length || 0) > 0) toast.success(`${data.length}-day itinerary ready!`, { id: 'stream-itinerary' })
        } else if (stage === 'booking') {
          toast.success('Booking links ready!', { id: 'stream-booking' })
        } else if (stage === 'complete') {
          setLoading(false)
          toast.success('Trip generation complete! 🎉', { id: 'stream-complete' })
        } else if (stage === 'error') {
          setLoading(false)
          toast.error(message || 'Something went wrong — partial results shown', { id: 'stream-error' })
        }
      } catch (err) {
        console.warn('[Socket] TRIP_STAGE handler error:', err)
        setLoading(false)
      }
    })

    // Booking status updates
    socket.on('BOOKING_UPDATE', (data: any) => {
      try {
        addNotification({
          id: Date.now().toString(),
          type: 'info',
          title: '📋 Booking Update',
          message: data.message,
          timestamp: new Date().toISOString(),
          read: false,
        })
        if (data.status === 'CONFIRMED') toast.success('Booking confirmed! 🎉')
      } catch (_) {}
    })

    // Location-based notifications
    socket.on('LOCATION_ALERT', (data: any) => {
      try {
        addNotification({
          id: Date.now().toString(),
          type: 'alert',
          title: data.title || '📍 Alert',
          message: data.message,
          timestamp: new Date().toISOString(),
          read: false,
        })
      } catch (_) {}
    })

    return () => {
      socket.disconnect()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const emit = useCallback((event: string, data?: any) => {
    const socket = socketRef.current
    if (!socket) return
    if (socket.connected) {
      socket.emit(event, data)
    } else {
      // Queue the emit once reconnection succeeds
      socket.once('connect', () => socket.emit(event, data))
    }
  }, [])

  return { socket: socketRef.current, emit }
}
