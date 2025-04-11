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
  const [videoAspectRatio, setVideoAspectRatio] = useState(16/9); // Default aspect ratio

  // Initialize camera with optimal constraints
  useEffect(() => {
    async function startCamera() {
      try {
        const constraints = {
          video: {
            facingMode: 'user',
            width: { ideal: 1920 }, // Prefer HD
            height: { ideal: 1080 }
          }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);

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

  // Handle video metadata loaded
  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      setVideoAspectRatio(video.videoWidth / video.videoHeight);
      setIsReady(true);

      // Force a resize to adjust video dimensions
      window.dispatchEvent(new Event('resize'));
    }
  }, []);

  // Dynamic video sizing
  useEffect(() => {
    function updateVideoSize() {
      if (!videoRef.current || !containerRef.current) return;

      const video = videoRef.current;
      const container = containerRef.current;

      // Get window dimensions minus margins
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const windowAspectRatio = windowWidth / windowHeight;

      if (videoAspectRatio > windowAspectRatio) {
        // Video is wider than window (relative to aspect ratios)
        container.style.width = '100%';
        container.style.height = `${100 / videoAspectRatio}vw`;
        video.style.width = '100%';
        video.style.height = '100%';
      } else {
        // Video is taller than window (relative to aspect ratios)
        container.style.width = `${videoAspectRatio * 100}vh`;
        container.style.height = '100%';
        video.style.width = '100%';
        video.style.height = '100%';
      }
    }

    // Initial update
    updateVideoSize();

    // Update on resize
    window.addEventListener('resize', updateVideoSize);
    return () => window.removeEventListener('resize', updateVideoSize);
  }, [videoAspectRatio]);

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
    <div className="fixed inset-0 bg-black">
      <div 
        ref={containerRef}
        className="relative overflow-hidden flex items-center justify-center h-full"
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          onLoadedMetadata={handleLoadedMetadata}
          className="bg-black object-cover"
        />
        {isReady && (
          <div 
            className="fixed left-0 right-0 mx-auto flex justify-center gap-4 z-50"
            style={{ bottom: '10vh' }} // 10% up from bottom
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
