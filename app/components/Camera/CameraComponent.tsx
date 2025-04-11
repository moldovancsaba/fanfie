'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { captureHighQualityPhoto } from '../../services/CameraQualityService';

interface CameraProps {
  onCapture: (imageData: string) => void;
  onError: (error: Error) => void;
  fitToScreen?: boolean;
}

interface Dimensions {
  width: number;
  height: number;
}

export default function CameraComponent({ onCapture, onError, fitToScreen = true }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [videoDimensions, setVideoDimensions] = useState<Dimensions>({ width: 0, height: 0 });
  const [containerDimensions, setContainerDimensions] = useState<Dimensions>({ width: 0, height: 0 });

  // Initialize camera with optimal constraints
  useEffect(() => {
    async function startCamera() {
      try {
        const constraints = {
          video: {
            facingMode: 'user',
            width: { ideal: 1920 }, // Prefer HD
            height: { ideal: 1080 },
            aspectRatio: { ideal: 16/9 }
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

  // Handle video metadata loaded - get actual video dimensions
  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      setVideoDimensions({
        width: video.videoWidth,
        height: video.videoHeight
      });
      setIsReady(true);
    }
  }, []);

  // Update container dimensions and calculate video fitting
  useEffect(() => {
    function updateDimensions() {
      if (!containerRef.current) return;

      // Get available space (accounting for margins and UI elements)
      const availableWidth = window.innerWidth - 32; // 16px margin each side
      const availableHeight = window.innerHeight - 120; // Space for UI elements

      // Set container dimensions
      setContainerDimensions({
        width: availableWidth,
        height: availableHeight
      });
    }

    // Initial update
    updateDimensions();

    // Update on resize
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Calculate video display dimensions to maintain aspect ratio
  const videoStyle = useCallback(() => {
    if (!videoDimensions.width || !videoDimensions.height) return {};

    const videoAspectRatio = videoDimensions.width / videoDimensions.height;
    const containerAspectRatio = containerDimensions.width / containerDimensions.height;

    let width = '100%';
    let height = '100%';
    let objectFit: 'cover' | 'contain' = 'contain';

    if (fitToScreen) {
      // If video is wider than container (relative to their aspect ratios)
      if (videoAspectRatio > containerAspectRatio) {
        width = '100%';
        height = `${(containerDimensions.width / videoAspectRatio)}px`;
        objectFit = 'cover';
      } else {
        height = '100%';
        width = `${(containerDimensions.height * videoAspectRatio)}px`;
        objectFit = 'cover';
      }
    }

    return {
      width,
      height,
      objectFit
    };
  }, [videoDimensions, containerDimensions, fitToScreen]);

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
      className="relative bg-black rounded-lg overflow-hidden"
      style={{
        width: containerDimensions.width > 0 ? `${containerDimensions.width}px` : '100%',
        height: containerDimensions.height > 0 ? `${containerDimensions.height}px` : '80vh',
        maxWidth: '100vw',
        maxHeight: '100vh',
        margin: '0 auto'
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          onLoadedMetadata={handleLoadedMetadata}
          style={videoStyle()}
          className="bg-black"
        />
      </div>
      {isReady && (
        <button
          onClick={handleCapture}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-blue-500 text-white rounded-full text-lg shadow-lg hover:bg-blue-600 transition-colors z-10"
        >
          Take Photo
        </button>
      )}
    </div>
  );
}
