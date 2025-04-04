'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface CameraProps {
  onCapture: (imageData: string) => void;
  onError: (error: Error) => void;
}

export default function CameraComponent({ onCapture, onError }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        onError(error as Error);
      }
    }

    startCamera();

    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onError]);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setIsReady(true);
    }
  }, []);

  const handleCapture = useCallback(() => {
    if (!videoRef.current || !isReady) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    onCapture(imageData);
  }, [isReady, onCapture]);

  return (
    <div className="relative w-full aspect-[4/3] bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        onLoadedMetadata={handleLoadedMetadata}
        className="absolute inset-0 w-full h-full object-cover"
      />
      {isReady && (
        <button
          onClick={handleCapture}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-blue-500 text-white rounded-full"
        >
          Take Photo
        </button>
      )}
    </div>
  );
}
