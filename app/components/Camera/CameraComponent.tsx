'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Stack } from '@mui/material';
import { PhotoCamera, Style } from '@mui/icons-material';

interface CameraProps {
  onCapture: (imageData: string) => void;
  onError: (error: Error) => void;
}

interface FrameInfo {
  url: string;
  width: number;
  height: number;
}

const FRAMES = [
  'https://i.ibb.co/mV2jdW46/SEYU-FRAME.png',  // Original frame
  'https://i.ibb.co/HfXZwMTr/SEYU-FRAME-1080x1920.png',
  'https://i.ibb.co/Zzb3Yrxq/SEYU-FRAME-1920x1080.png',
  'https://i.ibb.co/MDzTJdB8/SEYU-FRAME-1080x1080.png'
];

export default function CameraComponent({ onCapture, onError }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isFrameLoading, setIsFrameLoading] = useState(true);
  const [currentFrame, setCurrentFrame] = useState<FrameInfo | null>(null);

  // Load frame and set up canvas dimensions
  const loadFrame = useCallback(async (frameUrl: string) => {
    setIsFrameLoading(true);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = () => {
          setCurrentFrame({
            url: frameUrl,
            width: img.naturalWidth,
            height: img.naturalHeight
          });
          resolve(img);
        };
        img.onerror = reject;
        img.src = frameUrl;
      });
      
      setIsFrameLoading(false);
    } catch (error) {
      console.error('Frame load error:', error);
      setIsFrameLoading(false);
      onError(new Error(`Failed to load frame: ${frameUrl}`));
    }
  }, [onError]);

  // Initialize with first frame
  useEffect(() => {
    loadFrame(FRAMES[0]);
  }, [loadFrame]);

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

  const handleCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isReady || !currentFrame) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas size to match frame dimensions
    canvas.width = currentFrame.width;
    canvas.height = currentFrame.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw video onto canvas, matching frame dimensions
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Load and draw frame
    const frameImage = new Image();
    frameImage.crossOrigin = 'anonymous';
    frameImage.onload = () => {
      ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
      
      try {
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        onCapture(dataUrl);
      } catch (error) {
        console.error('Canvas capture error:', error);
        onError(new Error('Failed to capture photo'));
      }
    };
    frameImage.src = currentFrame.url;
  }, [isReady, currentFrame, onCapture, onError]);

  const handleLoadedMetadata = useCallback(() => {
    setIsReady(true);
  }, []);

  const handleChangeFrame = useCallback(() => {
    const nextIndex = (currentFrameIndex + 1) % FRAMES.length;
    setCurrentFrameIndex(nextIndex);
    loadFrame(FRAMES[nextIndex]);
  }, [currentFrameIndex, loadFrame]);

  // Button styles
  const buttonStyle = {
    borderRadius: '28px',
    padding: '12px 24px',
    textTransform: 'none',
    fontSize: '1rem',
  };

  if (!currentFrame) {
    return <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div>Loading frame...</div>
    </div>;
  }

  const containerStyle = {
    width: '100%',
    height: '100%',
    maxWidth: `${currentFrame.width}px`,
    maxHeight: `${currentFrame.height}px`,
    aspectRatio: `${currentFrame.width}/${currentFrame.height}`,
    position: 'relative' as const,
    overflow: 'hidden'
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div style={containerStyle}>
        {/* Video Layer */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          onLoadedMetadata={handleLoadedMetadata}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />

        {/* Frame Layer */}
        <img
          src={currentFrame.url}
          alt="Frame"
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
          crossOrigin="anonymous"
        />

        {/* Hidden canvas for captures */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Controls Layer */}
        {isReady && (
          <Stack
            direction="row"
            spacing={2}
            sx={{
              position: 'absolute',
              bottom: '2rem',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 2000
            }}
          >
            <Button
              variant="contained"
              startIcon={<Style />}
              onClick={handleChangeFrame}
              disabled={isFrameLoading}
              sx={{
                ...buttonStyle,
                backgroundColor: '#9c27b0',
                '&:hover': {
                  backgroundColor: '#7b1fa2'
                }
              }}
            >
              {isFrameLoading ? 'Loading...' : 'Change Design'}
            </Button>
            <Button
              variant="contained"
              startIcon={<PhotoCamera />}
              onClick={handleCapture}
              disabled={isFrameLoading}
              sx={buttonStyle}
            >
              Take Photo
            </Button>
          </Stack>
        )}
      </div>
    </div>
  );
}
