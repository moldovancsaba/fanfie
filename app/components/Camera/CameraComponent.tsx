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
