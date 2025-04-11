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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Preload the frame image
    const img = new Image();
    img.onload = () => {
      if (containerRef.current && frameRef.current) {
        // Once image is loaded, we can calculate proper dimensions
        const containerRect = containerRef.current.getBoundingClientRect();
        const frameAspectRatio = img.width / img.height;
        
        // Calculate frame size to match container while maintaining aspect ratio
        let frameWidth, frameHeight;
        const containerAspectRatio = containerRect.width / containerRect.height;
        
        if (frameAspectRatio > containerAspectRatio) {
          frameWidth = containerRect.width;
          frameHeight = containerRect.width / frameAspectRatio;
        } else {
          frameHeight = containerRect.height;
          frameWidth = containerRect.height * frameAspectRatio;
        }

        frameRef.current.style.width = `${frameWidth}px`;
        frameRef.current.style.height = `${frameHeight}px`;
      }
    };
    img.src = frameUrl;
  }, [frameUrl]);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
    >
      <img
        ref={frameRef}
        src={frameUrl}
        alt="Frame"
        className={`${className}`}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
          transform: 'translate(-50%, -50%)',
          position: 'absolute',
          top: '50%',
          left: '50%'
        }}
      />
    </div>
  );
}
