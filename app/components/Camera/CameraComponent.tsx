'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface CameraProps {
  onCapture: (imageData: string) => void;
  onError: (error: Error) => void;
  fitToScreen?: boolean;
}

export default function CameraComponent({ onCapture, onError, fitToScreen = true }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const [isReady, setIsReady] = useState(false);
  const [frameImage, setFrameImage] = useState<HTMLImageElement | null>(null);

  // Initialize frame image
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setFrameImage(img);
    };
    img.onerror = (error) => {
      console.error('Failed to load frame:', error);
      onError(new Error('Failed to load frame overlay'));
    };
    img.src = 'https://i.ibb.co/mV2jdW46/SEYU-FRAME.png';
  }, [onError]);

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
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [onError]);

  // Draw frame on canvas
  const drawFrame = useCallback(() => {
    if (!canvasRef.current || !videoRef.current || !frameImage) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    const video = videoRef.current;

    // Set canvas size to match video
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    // Draw video frame
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Calculate frame dimensions to maintain aspect ratio
    const frameAspectRatio = frameImage.width / frameImage.height;
    const canvasAspectRatio = canvas.width / canvas.height;
    
    let frameWidth, frameHeight;
    if (frameAspectRatio > canvasAspectRatio) {
      frameWidth = canvas.width;
      frameHeight = canvas.width / frameAspectRatio;
    } else {
      frameHeight = canvas.height;
      frameWidth = canvas.height * frameAspectRatio;
    }

    // Center the frame
    const x = (canvas.width - frameWidth) / 2;
    const y = (canvas.height - frameHeight) / 2;

    // Draw frame overlay
    context.drawImage(frameImage, x, y, frameWidth, frameHeight);

    // Continue animation
    animationFrameRef.current = requestAnimationFrame(drawFrame);
  }, [frameImage]);

  // Handle video metadata loaded
  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setIsReady(true);
    }
  }, []);

  // Start continuous drawing when both video and frame are ready
  useEffect(() => {
    if (isReady && frameImage) {
      drawFrame();
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isReady, frameImage, drawFrame]);

  const handleCapture = useCallback(() => {
    if (!canvasRef.current || !isReady || !frameImage) return;
    
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    onCapture(dataUrl);
  }, [isReady, frameImage, onCapture]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black">
      <div className="relative w-full h-full overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          onLoadedMetadata={handleLoadedMetadata}
          style={{ display: 'none' }}
        />
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain"
        />
        {isReady && frameImage && (
          <div 
            className="fixed left-0 right-0 mx-auto flex justify-center gap-4"
            style={{ bottom: '10vh', zIndex: 2000 }}
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
