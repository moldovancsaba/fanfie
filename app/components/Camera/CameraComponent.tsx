'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { captureHighQualityPhoto } from '../../services/CameraQualityService';
import FrameOverlay from '../Frame/FrameOverlay';

interface CameraProps {
  onCapture: (imageData: string) => void;
  onError: (error: Error) => void;
  fitToScreen?: boolean;
}

export default function CameraComponent({ onCapture, onError, fitToScreen = true }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const frameImageRef = useRef<HTMLImageElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [videoDimensions, setVideoDimensions] = useState<{ width: number; height: number } | null>(null);

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

  const handleCapture = useCallback(async () => {
    if (!videoRef.current || !isReady) return;

    const video = videoRef.current;
    
    try {
      // Create a canvas to combine video frame and frame overlay
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Draw video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Load and draw frame overlay
      const frameImage = new Image();
      await new Promise((resolve, reject) => {
        frameImage.onload = resolve;
        frameImage.onerror = reject;
        frameImage.src = 'https://i.ibb.co/mV2jdW46/SEYU-FRAME.png';
      });

      // Draw frame maintaining aspect ratio
      const frameAspectRatio = frameImage.width / frameImage.height;
      const canvasAspectRatio = canvas.width / canvas.height;
      
      let drawWidth = canvas.width;
      let drawHeight = canvas.height;
      
      if (frameAspectRatio > canvasAspectRatio) {
        drawHeight = canvas.width / frameAspectRatio;
      } else {
        drawWidth = canvas.height * frameAspectRatio;
      }
      
      const x = (canvas.width - drawWidth) / 2;
      const y = (canvas.height - drawHeight) / 2;
      
      ctx.drawImage(frameImage, x, y, drawWidth, drawHeight);

      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      onCapture(dataUrl);
    } catch (error) {
      console.error('Error capturing photo:', error);
      onError(error instanceof Error ? error : new Error('Failed to capture photo'));
    }
  }, [isReady, onCapture, onError]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black">
      <div 
        ref={containerRef}
        className="relative w-full h-full overflow-hidden"
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          onLoadedMetadata={handleLoadedMetadata}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <FrameOverlay />
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
