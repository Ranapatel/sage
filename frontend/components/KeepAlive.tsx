'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'

export default function KeepAlive() {
  const restoreSession = useAuthStore((s) => s.restoreSession)

  useEffect(() => {
    // Restore session on mount to validate token
    restoreSession()

    // Ping backend every 10 minutes (600000 ms) to prevent free tier from sleeping
    const PING_INTERVAL = 10 * 60 * 1000;
    
    const pingBackend = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        await fetch(`${backendUrl}/ping`);
      } catch (e) {
        // Silently fail if backend is down
      }
    };

    // Initial ping
    pingBackend();

    // Setup interval
    const interval = setInterval(pingBackend, PING_INTERVAL);

    return () => clearInterval(interval);
  }, [restoreSession]);

  return null; // This component doesn't render anything
}
