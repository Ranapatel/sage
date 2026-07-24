'use client';

import React, { useState, useEffect } from 'react';
import { buildHotelImageUrl, IMAGE_FALLBACK_CHAIN, type ImageSize } from '@/lib/hotels/images';
import { Building2 } from 'lucide-react';

interface HotelImageProps {
  path: string | null | undefined;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  preferredSize?: ImageSize;
}

export default function HotelImage({ path, alt, className, style, preferredSize = 'bigger' }: HotelImageProps) {
  const chain = [preferredSize, ...IMAGE_FALLBACK_CHAIN.filter(s => s !== preferredSize)];
  const [sizeIndex, setSizeIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  // Reset states if path changes
  useEffect(() => {
    Promise.resolve().then(() => {
      setSizeIndex(0);
      setFailed(false);
    })
  }, [path]);

  if (!path || failed) {
    // Real placeholder — NO AI image, just a styled empty state
    return (
      <div 
        className={className} 
        style={{ 
          background: 'var(--bg-card-hover, rgba(255,255,255,0.05))', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          border: '1px dashed var(--border)',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center',
          width: '100%',
          height: '100%',
          ...style 
        }}
      >
        <Building2 size={28} className="text-slate-400 mb-1.5" />
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>No photo available</span>
      </div>
    );
  }

  const src = buildHotelImageUrl(path, chain[sizeIndex]);

  // If URL building returns empty (e.g. rejected external URL), show placeholder immediately
  if (!src) {
    return (
      <div
        className={className}
        style={{
          background: 'var(--bg-card-hover, rgba(255,255,255,0.05))',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px dashed var(--border)',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center',
          width: '100%',
          height: '100%',
          ...style
        }}
      >
        <Building2 size={28} className="text-slate-400 mb-1.5" />
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>No photo available</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={() => {
        if (sizeIndex < chain.length - 1) {
          setSizeIndex(i => i + 1);   // try next size
        } else {
          setFailed(true);             // all sizes exhausted → show empty state
        }
      }}
    />
  );
}
