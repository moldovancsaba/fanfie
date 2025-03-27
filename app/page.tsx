'use client';

import { useState, useRef } from 'react';

export default function Home() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (err) {
      setError('Camera access failed. Please ensure permissions are granted.');
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
    <main className="p-4 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Camera Control</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      <div className="w-full max-w-md">
        <div className="bg-gray-100 aspect-video rounded-lg overflow-hidden mb-4">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />
        </div>

        <button
          onClick={isStreaming ? stopCamera : startCamera}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors"
        >
          {isStreaming ? 'Stop Camera' : 'Start Camera'}
        </button>
      </div>
    </main>
  );
}
