'use client';

import { useState, useRef } from 'react';

export default function Home() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          facingMode: 'environment'
        }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (err: any) {
      setError('Failed to access camera. Please ensure camera permissions are granted.');
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsStreaming(false);
    }
  };

  return (
    <main className="min-h-screen p-4 flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-8">Camera Test</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      <div className="w-full max-w-md space-y-4">
        <div className="relative aspect-video w-full bg-gray-100 rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            autoPlay
            muted
          />
        </div>

        <button
          onClick={isStreaming ? stopCamera : startCamera}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {isStreaming ? 'Stop Camera' : 'Start Camera'}
        </button>
      </div>
    </main>
  );
}
