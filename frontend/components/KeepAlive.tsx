'use client'

import { useEffect } from 'react'

export default function KeepAlive() {
  useEffect(() => {
    // Ping backend every 10 minutes (600000 ms) to prevent free tier from sleeping
    const PING_INTERVAL = 10 * 60 * 1000;
    
    const pingBackend = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
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
  }, []);

  return null; // This component doesn't render anything
}
