'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Stack } from '@mui/material';
import { PhotoCamera, Style } from '@mui/icons-material';
import { optimizeCanvas } from '../../services/CameraQualityService';

interface ViewportDimensions {
  width: number;
  height: number;
}

interface ContainerStyle extends React.CSSProperties {
  width: string;
  height: string;
  position: 'relative';
  overflow: 'hidden';
  margin: string;
  backgroundColor: string;
  transition: string;
}

interface VideoDimensions {
  width: number;
  height: number;
  top: number;
  left: number;
  scale: number;
  offsetX: number;
  offsetY: number;
}

const getViewportDimensions = (): ViewportDimensions => ({
  width: Math.min(window.innerWidth, document.documentElement.clientWidth),
  height: Math.min(window.innerHeight, document.documentElement.clientHeight)
});

const calculateContainerDimensions = (
  frameWidth: number,
  frameHeight: number,
  viewportWidth: number,
  viewportHeight: number
): { width: number; height: number; scale: number } => {
  // Account for potential UI elements by reducing viewport
  const safeViewportHeight = viewportHeight * 0.9; // 90% of viewport height
  const safeViewportWidth = viewportWidth * 0.95; // 95% of viewport width

  const frameRatio = frameWidth / frameHeight;
  const viewportRatio = safeViewportWidth / safeViewportHeight;

  let width: number;
  let height: number;
  let scale: number;

  if (frameRatio > viewportRatio) {
    // Frame is wider than viewport ratio - constrain by width
    width = safeViewportWidth;
    height = safeViewportWidth / frameRatio;
    scale = safeViewportWidth / frameWidth;
  } else {
    // Frame is taller than viewport ratio - constrain by height
    height = safeViewportHeight;
    width = safeViewportHeight * frameRatio;
    scale = safeViewportHeight / frameHeight;
  }

  return {
    width: Math.floor(width),
    height: Math.floor(height),
    scale: scale
  };
};

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
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isFrameLoading, setIsFrameLoading] = useState(true);
  const [currentFrame, setCurrentFrame] = useState<FrameInfo | null>(null);
  const [videoDimensions, setVideoDimensions] = useState<VideoDimensions>({
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    scale: 1,
    offsetX: 0,
    offsetY: 0
  });
  const [containerDimensions, setContainerDimensions] = useState<ViewportDimensions>({
    width: 0,
    height: 0
  });
  // Update video dimensions when container changes
  const updateVideoDimensions = useCallback(() => {
    if (!videoRef.current || !videoContainerRef.current) return;

    const videoElement = videoRef.current;
    const container = videoContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    
    // Get the actual rendered dimensions with high precision
    const videoRect = videoElement.getBoundingClientRect();
    
    // Calculate exact cover positioning
    const containerAspect = containerRect.width / containerRect.height;
    const videoAspect = videoElement.videoWidth / videoElement.videoHeight;
    
    let scale = 1;
    let offsetX = 0;
    let offsetY = 0;
    
    if (containerAspect > videoAspect) {
      // Container is wider - video height matches container height
      scale = containerRect.width / videoElement.videoWidth;
      offsetY = Math.round((containerRect.height - (videoElement.videoHeight * scale)) / 2);
    } else {
      // Container is taller - video width matches container width
      scale = containerRect.height / videoElement.videoHeight;
      offsetX = Math.round((containerRect.width - (videoElement.videoWidth * scale)) / 2);
    }
    
    // Update with precise measurements
    setVideoDimensions({
      width: Math.round(videoRect.width),
      height: Math.round(videoRect.height),
      top: Math.round(videoRect.top - containerRect.top),
      left: Math.round(videoRect.left - containerRect.left),
      scale: Number(scale.toFixed(6)),  // Maintain high precision for scale
      offsetX,
      offsetY
    });
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    setIsReady(true);
    updateVideoDimensions();
  }, [updateVideoDimensions]);

  // Load frame and set up canvas dimensions
  const loadFrame = useCallback(async (frameUrl: string) => {
    setIsFrameLoading(true);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          // Set current frame with loaded dimensions
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

  // Handle viewport size changes
  useEffect(() => {
    const updateDimensions = () => {
      if (!currentFrame) return;
      
      const viewport = getViewportDimensions();
      const newDimensions = calculateContainerDimensions(
        currentFrame.width,
        currentFrame.height,
        viewport.width,
        viewport.height
      );
      
      setContainerDimensions(newDimensions);
      // Update video dimensions after container resize
      setTimeout(updateVideoDimensions, 100); // Allow time for resize transition
    };

    // Initial calculation
    updateDimensions();

    // Handle resize events
    window.addEventListener('resize', updateDimensions);
    window.addEventListener('orientationchange', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('orientationchange', updateDimensions);
    };
  }, [currentFrame, updateVideoDimensions]);
  // Initialize camera
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1920 },
            height: { ideal: 1920 }, // Changed to support square frames better
            aspectRatio: { ideal: 1 } // Added to maintain aspect ratio
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
    if (!videoRef.current || !canvasRef.current || !isReady || !currentFrame || !videoContainerRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    try {
      canvas.width = currentFrame.width;
      canvas.height = currentFrame.height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Get container and video dimensions
      const containerRect = videoContainerRef.current.getBoundingClientRect();
      const videoRect = video.getBoundingClientRect();

      // Calculate aspect ratios
      const containerAspect = containerRect.width / containerRect.height;
      const videoAspect = video.videoWidth / video.videoHeight;

      // Calculate the source dimensions
      let sourceWidth: number;
      let sourceHeight: number;
      let sourceX: number;
      let sourceY: number;

      if (containerAspect > videoAspect) {
        // Container is wider than video - use full video width and calculate height
        sourceWidth = video.videoWidth;
        sourceHeight = video.videoWidth / containerAspect;
        sourceX = 0;
        sourceY = (video.videoHeight - sourceHeight) / 2;
      } else {
        // Container is taller than video - use full video height and calculate width
        sourceHeight = video.videoHeight;
        sourceWidth = video.videoHeight * containerAspect;
        sourceX = (video.videoWidth - sourceWidth) / 2;
        sourceY = 0;
      }

      // Ensure dimensions are valid
      sourceWidth = Math.min(sourceWidth, video.videoWidth);
      sourceHeight = Math.min(sourceHeight, video.videoHeight);
      sourceX = Math.max(0, sourceX);
      sourceY = Math.max(0, sourceY);

      // Clear canvas and apply mirroring
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);

      // Draw the video frame
      ctx.drawImage(
        video,
        sourceX, sourceY,
        sourceWidth, sourceHeight,
        0, 0,
        canvas.width, canvas.height
      );

      // Reset transformation
      ctx.restore();

      // Load and draw frame overlay
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
      frameImage.onerror = () => {
        console.error('Frame loading failed');
        onError(new Error('Failed to load frame overlay'));
      };
      frameImage.src = currentFrame.url;
    } catch (error) {
      console.error('Photo capture error:', error);
      onError(error instanceof Error ? error : new Error('Failed to capture photo'));
    }
  }, [isReady, currentFrame, onCapture, onError]);
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

  const containerStyle: ContainerStyle = {
    width: `${containerDimensions.width}px`,
    height: `${containerDimensions.height}px`,
    position: 'relative',
    overflow: 'hidden',
    margin: 'auto',
    backgroundColor: '#000',
    transition: 'width 0.3s ease-out, height 0.3s ease-out'
  };
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden">
      <div style={containerStyle} ref={videoContainerRef}>
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
            objectFit: 'cover',
            transform: 'scaleX(-1) translateZ(0)', // Mirror effect for selfie camera + hardware acceleration
            willChange: 'transform',               // Optimize for animations
            backgroundColor: '#000'
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
            objectFit: 'cover',
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
              bottom: '1rem',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 2000,
              padding: '0 1rem',
              width: '100%',
              maxWidth: '500px'
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
