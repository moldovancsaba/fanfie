'use client';

import { useState, useCallback, useEffect } from 'react';
import CameraComponent from './components/Camera/CameraComponent';
import { Button, Stack, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';
import { PhotoCamera, Replay, Upload, ArrowBack, Share, Error as ErrorIcon } from '@mui/icons-material';
import toast from 'react-hot-toast';

// Utility functions for viewport-aware sizing
const getViewportDimensions = () => {
  if (typeof window === 'undefined') {
    // Return default dimensions during server-side rendering
    return {
      width: 1080,
      height: 1920
    };
  }
  return {
    width: Math.min(window.innerWidth, document.documentElement.clientWidth),
    height: Math.min(window.innerHeight, document.documentElement.clientHeight)
  };
};

const calculateContainerDimensions = (
  viewportWidth: number,
  viewportHeight: number,
  frameWidth: number = 1080,  // Default frame width
  frameHeight: number = 1920  // Default frame height
): { width: number; height: number } => {
  // Use 98% of viewport dimensions
  const safeHeight = viewportHeight * 0.98;
  const safeWidth = viewportWidth * 0.98;
  
  // Use actual frame aspect ratio
  const frameAspect = frameWidth / frameHeight;
  
  if (safeWidth / safeHeight > frameAspect) {
    // Width is the constraint
    const height = safeHeight;
    const width = height * frameAspect;
    return { 
      width: Math.round(width), 
      height: Math.round(height) 
    };
  } else {
    // Height is the constraint
    const width = safeWidth;
    const height = width / frameAspect;
    return { 
      width: Math.round(width), 
      height: Math.round(height) 
    };
  }
};

interface ImgBBResponse {
  data?: {
    url: string;
  };
  error?: {
    message: string;
  };
  details?: string;
}

interface ErrorState {
  title: string;
  details: string;
}

// Custom error class
class ImageUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImageUploadError';
  }
}

export default function Home() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<ErrorState | null>(null);
  const [currentFrame, setCurrentFrame] = useState({ width: 1080, height: 1920 });
  const [previewDimensions, setPreviewDimensions] = useState(() => {
    // Only calculate dimensions on client-side
    if (typeof window === 'undefined') {
      return {
        width: 1080,
        height: 1920
      };
    }
    const viewport = getViewportDimensions();
    return calculateContainerDimensions(
      viewport.width,
      viewport.height,
      currentFrame.width,
      currentFrame.height
    );
  });

  const handleCapture = useCallback((imageData: string, frameInfo: { width: number; height: number }) => {
    setCapturedImage(imageData);
    setCurrentFrame({
      width: frameInfo.width,
      height: frameInfo.height
    });
    // Recalculate preview dimensions with new frame size
    const viewport = getViewportDimensions();
    setPreviewDimensions(calculateContainerDimensions(
      viewport.width,
      viewport.height,
      frameInfo.width,
      frameInfo.height
    ));
    toast.success('Photo captured successfully!');
  }, []);

  const handleError = useCallback((error: Error) => {
    toast.error(error.message);
  }, []);

  const handleRetake = useCallback(() => {
    setCapturedImage(null);
    setUploadedUrl(null);
    setError(null);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!capturedImage) return;

    try {
      setIsUploading(true);
      setError(null);
      toast.loading('Uploading image...');

      // Convert base64 to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();

      // Create form data
      const formData = new FormData();
      formData.append('image', blob);

      // Upload to ImgBB through our API route
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data: ImgBBResponse = await uploadResponse.json();

      if (!uploadResponse.ok) {
        const errorMessage = data.error?.message || 'Upload failed';
        
        // Handle specific error cases
        if (uploadResponse.status === 503) {
          setError({
            title: 'API Configuration Required',
            details: data.details || 'ImgBB API key needs to be configured. Please contact the administrator.'
          });
        } else {
          setError({
            title: 'Upload Failed',
            details: data.details || 'An error occurred while uploading the image.'
          });
        }
        throw new ImageUploadError(errorMessage);
      }
      
      if (data.data?.url) {
        setUploadedUrl(data.data.url);
        toast.dismiss();
        toast.success('Image uploaded successfully!');
      } else {
        throw new ImageUploadError('Invalid response from server');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.dismiss();
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to upload image. Please try again.');
      }
    } finally {
      setIsUploading(false);
    }
  }, [capturedImage]);

  const handleShare = useCallback(async () => {
    if (!uploadedUrl) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My Photo',
          text: 'Check out my photo!',
          url: uploadedUrl
        });
        toast.success('Shared successfully!');
      } else {
        await navigator.clipboard.writeText(uploadedUrl);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to share. Please try again.');
    }
  }, [uploadedUrl]);

  // Handle window resize for preview dimensions
  useEffect(() => {
    // Skip effect during SSR
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      const viewport = getViewportDimensions();
      const dimensions = calculateContainerDimensions(
        viewport.width, 
        viewport.height,
        currentFrame.width,
        currentFrame.height
      );
      setPreviewDimensions(dimensions);
    };

    // Initial calculation
    handleResize();

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [currentFrame]);

  // Common button styles
  const buttonStyle = {
    borderRadius: '28px',
    padding: '12px 24px',
    textTransform: 'none',
    fontSize: '1rem',
  };

  return (
  <>
    <div className="min-h-screen w-full bg-black">
      {!capturedImage ? (
        <CameraComponent 
          onCapture={handleCapture}
          onError={handleError}
        />
      ) : (
        <div className="fixed inset-0 flex items-center justify-center bg-black m-0 p-0 overflow-hidden">
          <div 
            className="relative"
            style={{
              position: 'relative',
              width: `${previewDimensions.width}px`,
              height: `${previewDimensions.height}px`,
              margin: '0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              backgroundColor: '#000',
              transition: 'width 0.3s ease-out, height 0.3s ease-out'
            }}
          >
            <div 
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#000',
                overflow: 'hidden'
              }}
            >
              <img 
                src={capturedImage} 
                alt="Captured"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  willChange: 'transform',
                  backgroundColor: '#000'
                }}
              />
            </div>
          </div>
          
          <Stack
            direction="row"
            spacing={2}
            sx={{
              position: 'fixed',
              bottom: 'calc(2vh + env(safe-area-inset-bottom))',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 2000,
              width: '100%',
              maxWidth: '500px',
              padding: '0.75rem 1rem',
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem',
              backdropFilter: 'blur(10px)',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '16px',
              margin: '0 auto'
            }}
          >
            {!uploadedUrl ? (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Replay />}
                  onClick={handleRetake}
                  disabled={isUploading}
                  sx={buttonStyle}
                >
                  Retake
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<Upload />}
                  onClick={handleUpload}
                  disabled={isUploading}
                  sx={buttonStyle}
                >
                  {isUploading ? 'Uploading...' : 'Upload'}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<ArrowBack />}
                  onClick={handleRetake}
                  sx={buttonStyle}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<Share />}
                  onClick={handleShare}
                  sx={buttonStyle}
                >
                  Share
                </Button>
              </>
            )}
          </Stack>
        </div>
      )}
    </div>

    <Dialog
      open={!!error}
      onClose={() => setError(null)}
      aria-labelledby="error-dialog-title"
    >
      <DialogTitle id="error-dialog-title" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ErrorIcon color="error" />
        {error?.title}
      </DialogTitle>
      <DialogContent>
        <Typography>
          {error?.details}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setError(null)} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  </>
);
}
