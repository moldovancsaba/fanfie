'use client';

import { useRef, useState, useEffect } from 'react';

interface CameraComponentProps {
  onCapture: (imageData: string) => void;
}

type CameraStatus = 'idle' | 'accessing' | 'streaming' | 'error';

const CameraComponent: React.FC<CameraComponentProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<CameraStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
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
        
        // Store the stream reference for cleanup
        streamRef.current = stream;
        
        // Set the stream as the source for the video element
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        setStatus('streaming');
      } catch (err) {
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
    };

    setupCamera();

    // Cleanup function to stop the video stream when component unmounts
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && status === 'streaming') {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match the video stream
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the current video frame to the canvas
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert the canvas content to a data URL and pass it to the parent component
        const imageData = canvas.toDataURL('image/jpeg');
        onCapture(imageData);
      }
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

