'use client';

import React, { useState, useRef, useEffect } from 'react';

const SimpleCameraComponent: React.FC = () => {
  const [status, setStatus] = useState<'requesting' | 'granted' | 'denied'>('requesting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Check if navigator.mediaDevices is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setStatus('denied');
      setErrorMessage('Camera access not supported in this browser.');
      return;
    }

    let stream: MediaStream | null = null;

    // Request camera access
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((mediaStream) => {
        // Set the stream as the video source
        stream = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStatus('granted');
      })
      .catch((error) => {
        console.error('Camera access denied:', error);
        setStatus('denied');
        
        // Handle different types of errors
        if (error.name === 'NotAllowedError') {
          setErrorMessage('Camera permission denied. Please allow access in your browser settings.');
        } else if (error.name === 'NotFoundError') {
          setErrorMessage('No camera found on this device.');
        } else if (error.name === 'NotReadableError') {
          setErrorMessage('Camera is already in use by another application.');
        } else {
          setErrorMessage(`Camera error: ${error.message || 'Unknown error'}`);
        }
      });

    // Cleanup: stop all tracks when component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Render based on camera status
  return (
    <div className="camera-container w-full max-w-2xl mx-auto">
      {status === 'requesting' && (
        <div className="text-center p-4 bg-gray-100 rounded-lg">
          <p>Requesting camera permission...</p>
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mt-2"></div>
        </div>
      )}

      {status === 'denied' && (
        <div className="text-center p-4 bg-red-100 rounded-lg">
          <p className="text-red-600 font-medium">{errorMessage}</p>
          <button 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      )}

      {status === 'granted' && (
        <div className="relative">
          <video 
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      )}
    </div>
  );
};

export default SimpleCameraComponent;
