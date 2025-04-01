'use client';

import { useRef, useState, useEffect } from 'react';

interface CameraComponentProps {
  onCapture: (imageData: string) => void;
  disabled?: boolean; // Optional disabled prop
}

export type CameraStatus = 'idle' | 'accessing' | 'streaming' | 'error';

const CameraComponent: React.FC<CameraComponentProps> = ({ onCapture, disabled }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<CameraStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    // Store reference to video element and track mounting state
    let mounted = true;
    const videoElement = videoRef.current;

    // Request camera access on mount
    const setupCamera = async () => {
      try {
        setStatus('accessing');
        
        // Request access to the user's camera
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 } 
          } 
        });
        
        // Only proceed if the component is still mounted
        if (mounted) {
          // Store the stream reference for cleanup
          streamRef.current = stream;
          
          // Set the stream as the source for the video element
          if (videoElement) {
            videoElement.srcObject = stream;
          }
          
          setStatus('streaming');
        }
      } catch (err) {
        // Only update state if component is still mounted
        if (mounted) {
          console.error('Error accessing camera:', err);
          setStatus('error');
          if (err instanceof DOMException) {
            if (err.name === 'NotAllowedError') {
              setErrorMessage('Camera access denied. Please grant permission to use your camera.');
            } else if (err.name === 'NotFoundError') {
              setErrorMessage('No camera device found. Please connect a camera and try again.');
            } else {
              setErrorMessage(`Camera error: ${err.message}`);
            }
          } else {
            setErrorMessage('An unexpected error occurred while accessing the camera.');
          }
        }
      }
    };

    setupCamera();

    // Cleanup function to stop the video stream when component unmounts
    return () => {
      mounted = false;
      
      // Clean up stream tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      // Clean up video element's srcObject
      if (videoElement && videoElement.srcObject) {
        videoElement.srcObject = null;
      }
    };
  }, []);

  const validateImageDimensions = (width: number, height: number) => {
    const MIN_DIMENSION = 100;
    const MAX_DIMENSION = 4096;
    return width >= MIN_DIMENSION && 
           height >= MIN_DIMENSION && 
           width <= MAX_DIMENSION && 
           height <= MAX_DIMENSION;
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || status !== 'streaming') {
      console.error('Cannot capture photo:', {
        hasVideo: !!videoRef.current,
        hasCanvas: !!canvasRef.current,
        status
      });
      setErrorMessage('Cannot capture photo. Please reload the page.');
      setStatus('error');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    try {
      // Validate video dimensions
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      console.log('Video dimensions:', { videoWidth, videoHeight });

      if (!validateImageDimensions(videoWidth, videoHeight)) {
        throw new Error('Invalid video dimensions');
      }

      // Set canvas dimensions
      canvas.width = videoWidth;
      canvas.height = videoHeight;

      // Get and validate canvas context
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Could not get canvas context');
      }

      // Clear canvas and draw new frame
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get image data and validate
      const imageData = canvas.toDataURL('image/jpeg', 0.95);
      
      if (!imageData || imageData.length < 100 || !imageData.startsWith('data:image/jpeg')) {
        throw new Error('Invalid image data generated');
      }

      console.log('Photo captured successfully:', {
        width: canvas.width,
        height: canvas.height,
        dataLength: imageData.length
      });

      // Create a test image to verify the data
      const testImage = new Image();
      testImage.onload = () => {
        // Image loads successfully, we can pass it to parent
        onCapture(imageData);
      };
      testImage.onerror = () => {
        throw new Error('Generated image data is invalid');
      };
      testImage.src = imageData;

    } catch (error) {
      console.error('Error in photo capture:', error);
      setErrorMessage('Failed to capture photo. Please try again.');
      setStatus('error');
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative aspect-video w-full max-w-2xl bg-gray-100 rounded-lg overflow-hidden">
        {status === 'error' ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 p-4">
            <div className="text-center">
              <p className="text-red-500 mb-2">{errorMessage}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <>
            <video 
              ref={videoRef} 
              className="w-full h-full object-cover" 
              autoPlay 
              playsInline 
              muted
            />
            {status === 'accessing' && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-2"></div>
                  <p>Accessing camera...</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {status === 'streaming' && (
        <button 
          onClick={capturePhoto}
          className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition flex items-center justify-center"
          disabled={disabled}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Take Photo
        </button>
      )}
      
      {/* Hidden canvas used for capturing images */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraComponent;

