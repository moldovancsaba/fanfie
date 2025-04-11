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

  useEffect(() => {
    // Preload the frame image
    const img = new Image();
    img.src = frameUrl;
  }, [frameUrl]);

  return (
    <img
      ref={frameRef}
      src={frameUrl}
      alt="Frame"
      className={`absolute inset-0 w-full h-full pointer-events-none z-10 ${className}`}
      style={{ objectFit: 'contain' }}
    />
  );
}
