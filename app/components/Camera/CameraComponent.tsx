'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { captureHighQualityPhoto } from '../../services/CameraQualityService';

interface CameraProps {
  onCapture: (imageData: string) => void;
  onError: (error: Error) => void;
  fitToScreen?: boolean;
}

export default function CameraComponent({ onCapture, onError, fitToScreen = true }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
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

  // Adjust container dimensions based on window size
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const availableWidth = window.innerWidth - 32; // 16px margin on each side
        const availableHeight = window.innerHeight - 120; // Space for UI elements
        
        setDimensions({
          width: availableWidth,
          height: availableHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setIsReady(true);
    }
  }, []);

  const handleCapture = useCallback(() => {
    if (!videoRef.current || !isReady) return;

    const video = videoRef.current;
    
    try {
      const { dataUrl } = captureHighQualityPhoto(video, {
        format: 'jpeg',
        quality: 0.95,
        fitToScreen: fitToScreen
      });
      
      onCapture(dataUrl);
    } catch (error) {
      console.error('Error capturing photo:', error);
      
      // Fallback to basic capture if the enhanced version fails
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (!context) return;
      
      context.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      onCapture(imageData);
    }
  }, [isReady, onCapture, fitToScreen]);

  return (
    <div 
      ref={containerRef}
      className="relative bg-black rounded-lg overflow-hidden flex items-center justify-center"
      style={{
        width: dimensions.width > 0 ? `${dimensions.width}px` : '100%',
        height: dimensions.height > 0 ? `${dimensions.height}px` : '80vh',
        maxWidth: '100%',
        maxHeight: '80vh',
        margin: '0 auto'
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        onLoadedMetadata={handleLoadedMetadata}
        className="w-full h-full object-contain"
      />
      {isReady && (
        <button
          onClick={handleCapture}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-blue-500 text-white rounded-full text-lg shadow-lg hover:bg-blue-600 transition-colors"
        >
          Take Photo
        </button>
      )}
    </div>
  );
}
