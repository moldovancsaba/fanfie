'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface CameraProps {
  onCapture: (imageData: string) => void;
  onError: (error: Error) => void;
}

export default function CameraComponent({ onCapture, onError }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Initialize camera
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        onError(error instanceof Error ? error : new Error('Failed to access camera'));
      }
    }

    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onError]);

  // Update dimensions when video metadata is loaded
  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current && containerRef.current) {
      const video = videoRef.current;
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      
      const videoAspectRatio = video.videoWidth / video.videoHeight;
      const containerAspectRatio = containerRect.width / containerRect.height;

      let width, height;
      if (videoAspectRatio > containerAspectRatio) {
        width = containerRect.width;
        height = containerRect.width / videoAspectRatio;
      } else {
        height = containerRect.height;
        width = containerRect.height * videoAspectRatio;
      }

      setDimensions({ width, height });
      setIsReady(true);
    }
  }, []);

  const handleCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isReady) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw video
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Draw frame
    const frameElement = document.querySelector('.frame-overlay') as HTMLImageElement;
    if (frameElement && frameElement.complete) {
      ctx.drawImage(frameElement, 0, 0, canvas.width, canvas.height);
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    onCapture(dataUrl);
  }, [isReady, onCapture]);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div 
        ref={containerRef} 
        className="relative"
        style={{
          width: dimensions.width > 0 ? `${dimensions.width}px` : '100%',
          height: dimensions.height > 0 ? `${dimensions.height}px` : '100%',
        }}
      >
        {/* Video Layer */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          onLoadedMetadata={handleLoadedMetadata}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />

        {/* Frame Layer */}
        <img
          src="https://i.ibb.co/mV2jdW46/SEYU-FRAME.png"
          alt="Frame"
          className="frame-overlay"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            pointerEvents: 'none',
            zIndex: 10
          }}
        />

        {/* Hidden canvas for captures */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Controls Layer */}
        {isReady && (
          <div 
            className="absolute left-0 right-0 flex justify-center"
            style={{ bottom: '10vh', zIndex: 20 }}
          >
            <button
              onClick={handleCapture}
              className="px-6 py-3 bg-blue-500 text-white rounded-full text-lg shadow-lg hover:bg-blue-600 transition-colors"
            >
              Take Photo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
