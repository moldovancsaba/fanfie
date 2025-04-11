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
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
      <img
        ref={frameRef}
        src={frameUrl}
        alt="Frame"
        className={`w-full h-full object-contain ${className}`}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          maxWidth: '100%',
          maxHeight: '100%'
        }}
      />
    </div>
  );
}
