'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CameraProps, CameraState } from './types';

export default function CameraComponent({ onCapture, onError }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<CameraState>({
    stream: null,
    error: null,
    isLoading: true,
    hasPermission: false,
  });

  const initializeCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' },
        audio: false 
      });
      
      setState(prev => ({
        ...prev,
        stream,
        isLoading: false,
        hasPermission: true,
      }));

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error as Error,
        isLoading: false,
        hasPermission: false,
      }));
      onError(error as Error);
    }
  }, [onError]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !state.stream) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const context = canvas.getContext('2d');
    if (!context) return;

    context.drawImage(videoRef.current, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg');
    onCapture(imageData);
  }, [onCapture, state.stream]);

  useEffect(() => {
    initializeCamera();
    
    return () => {
      if (state.stream) {
        state.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [initializeCamera]);

  if (state.error) {
    return (
      <div className="flex flex-col items-center justify-center p-4 text-red-500">
        <p>Camera Error: {state.error.message}</p>
        <button 
          onClick={initializeCamera}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <p>Initializing camera...</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full max-w-lg mx-auto rounded-lg shadow-lg"
      />
      <button
        onClick={capturePhoto}
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
      >
        Take Photo
      </button>
    </div>
  );
}

