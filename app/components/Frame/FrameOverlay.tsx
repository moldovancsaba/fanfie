'use client';

import { useEffect, useRef } from 'react';

interface FrameOverlayProps {
  className?: string;
  frameUrl?: string;
}

export default function FrameOverlay({ 
  className = '',
  frameUrl = 'https://i.ibb.co/mV2jdW46/SEYU-FRAME.png'
}: FrameOverlayProps) {
  const frameRef = useRef<HTMLImageElement>(null);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 1000 }}>
      <img
        ref={frameRef}
        src={frameUrl}
        alt="Frame"
        className={`absolute w-full h-full ${className}`}
        style={{
          objectFit: 'contain',
          opacity: 1,
          visibility: 'visible',
          pointerEvents: 'none'
        }}
        onError={(e) => console.error('Frame failed to load:', e)}
        onLoad={() => console.log('Frame loaded successfully')}
      />
    </div>
  );
}
