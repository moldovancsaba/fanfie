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

    console.log('Initializing camera and requesting permissions...');
    
    // Request camera access
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((mediaStream) => {
        console.log('Camera permission granted, setting up video stream');
        // Set the stream as the video source
        stream = mediaStream;
        
        if (videoRef.current) {
          console.log('Video element found, setting srcObject');
          videoRef.current.srcObject = stream;
          
          // Explicitly call play with error handling
          try {
            const playPromise = videoRef.current.play();
            
            // Modern browsers return a promise from play()
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  console.log('Video playback started successfully');
                  setStatus('granted');
                })
                .catch(error => {
                  console.error('Error playing video:', error);
                  // Still mark as granted since we have the stream, even if autoplay failed
                  setStatus('granted');
                });
            } else {
              // Older browsers don't return a promise
              console.log('Video play() called (no promise returned)');
              setStatus('granted');
            }
          } catch (playError) {
            console.error('Exception while calling play():', playError);
            // Still set to granted since we have permission, even if play failed
            setStatus('granted');
          }
        } else {
          console.error('Video element reference is null');
          setStatus('granted');
        }
      })
      .catch((error) => {
        console.error('Camera access denied:', error);
        setStatus('denied');
        
        // Handle different types of errors
        if (error.name === 'NotAllowedError') {
          console.warn('Permission denied by user');
          setErrorMessage('Camera permission denied. Please allow access in your browser settings.');
        } else if (error.name === 'NotFoundError') {
          console.warn('No camera found on device');
          setErrorMessage('No camera found on this device.');
        } else if (error.name === 'NotReadableError') {
          console.warn('Camera already in use by another application');
          setErrorMessage('Camera is already in use by another application.');
        } else if (error.name === 'AbortError') {
          console.warn('Camera initialization was aborted');
          setErrorMessage('Camera initialization was aborted. Please try again.');
        } else if (error.name === 'SecurityError') {
          console.warn('Security error - likely not using HTTPS');
          setErrorMessage('Camera access is blocked due to security. Please ensure you are using HTTPS.');
        } else {
          console.warn(`Unknown camera error: ${error.name}`, error);
          setErrorMessage(`Camera error: ${error.message || 'Unknown error'}`);
        }
      });

    // Cleanup: stop all tracks when component unmounts
    return () => {
      console.log('Component unmounting, cleaning up camera resources');
      
      // Clean up video element
      if (videoRef.current) {
        try {
          if (!videoRef.current.paused) {
            videoRef.current.pause();
          }
          videoRef.current.srcObject = null;
        } catch (error) {
          console.error('Error cleaning up video element:', error);
        }
      }
      
      // Stop all tracks
      if (stream) {
        stream.getTracks().forEach(track => {
          console.log(`Stopping track: ${track.kind}`);
          track.stop();
        });
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
            muted
            className="w-full h-full object-cover rounded-lg"
            style={{ minHeight: "300px" }}
            onPlaying={() => console.log('Video playing event fired')}
            onLoadedMetadata={() => console.log('Video metadata loaded')}
            onError={(e) => console.error('Video element error:', e)}
          />
        </div>
      )}
    </div>
  );
};

export default SimpleCameraComponent;
