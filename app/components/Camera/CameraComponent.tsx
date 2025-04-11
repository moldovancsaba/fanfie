'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Stack } from '@mui/material';
import { PhotoCamera, Style } from '@mui/icons-material';

interface CameraProps {
  onCapture: (imageData: string) => void;
  onError: (error: Error) => void;
}

// Exact frame URLs as provided
const FRAMES = [
  'https://i.ibb.co/mV2jdW46/SEYU-FRAME.png',  // Original frame
  'https://i.ibb.co/HfXZwMTr/SEYU-FRAME-1080x1920.png',
  'https://i.ibb.co/Zzb3Yrxq/SEYU-FRAME-1920x1080.png',
  'https://i.ibb.co/MDzTJdB8/SEYU-FRAME-1080x1080.png'
];

export default function CameraComponent({ onCapture, onError }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [currentFrameUrl, setCurrentFrameUrl] = useState(FRAMES[0]);
  const [isFrameLoading, setIsFrameLoading] = useState(false);

  // Load frame image whenever URL changes
  useEffect(() => {
    let img = new Image();
    img.crossOrigin = 'anonymous';
    setIsFrameLoading(true);

    img.onload = () => {
      console.log('Frame loaded:', currentFrameUrl);
      setIsFrameLoading(false);
    };

    img.onerror = (error) => {
      console.error('Frame load error:', error);
      setIsFrameLoading(false);
      onError(new Error(`Failed to load frame: ${currentFrameUrl}`));
    };

    img.src = currentFrameUrl;
  }, [currentFrameUrl, onError]);

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

    // Load current frame for capture
    const frameImage = new Image();
    frameImage.crossOrigin = 'anonymous';
    frameImage.onload = () => {
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

      // Draw frame
      ctx.drawImage(frameImage, x, y, frameWidth, frameHeight);

      // Convert to data URL after frame is drawn
      try {
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        onCapture(dataUrl);
      } catch (error) {
        console.error('Canvas capture error:', error);
        onError(new Error('Failed to capture photo'));
      }
    };

    frameImage.src = currentFrameUrl;
  }, [isReady, onCapture, currentFrameUrl, onError]);

  const handleChangeFrame = useCallback(() => {
    console.log('Changing frame from index:', currentFrameIndex);
    const nextIndex = (currentFrameIndex + 1) % FRAMES.length;
    setCurrentFrameIndex(nextIndex);
    setCurrentFrameUrl(FRAMES[nextIndex]);
    console.log('New frame URL:', FRAMES[nextIndex]);
  }, [currentFrameIndex]);

  // Button styles
  const buttonStyle = {
    borderRadius: '28px',
    padding: '12px 24px',
    textTransform: 'none',
    fontSize: '1rem',
  };

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
        {!isFrameLoading && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <img
              src={currentFrameUrl}
              alt="Frame"
              className="frame-overlay"
              crossOrigin="anonymous"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            />
          </div>
        )}

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
