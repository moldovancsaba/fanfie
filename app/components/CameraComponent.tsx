'use client';

import { useRef, useState, useEffect } from 'react';
import GraphicsOverlay from './GraphicsOverlay';
import ShareComponent from './ShareComponent';

export default function CameraComponent() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user' } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasPermission(true);
        }
      } catch (err) {
        setError('Camera access denied or not available');
        console.error('Error accessing camera:', err);
      }
    }

    setupCamera();
    
    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const imageUrl = canvasRef.current.toDataURL('image/png');
        setCapturedImage(imageUrl);
      }
    }
  };

  const handleSave = (dataUrl: string) => {
    setEditedImage(dataUrl);
  };

  const resetAll = () => {
    setCapturedImage(null);
    setEditedImage(null);
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (editedImage) {
    return <ShareComponent imageUrl={editedImage} onClose={resetAll} />;
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {!capturedImage ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full max-w-lg rounded-lg shadow-lg"
          />
          <button
            onClick={captureImage}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Take Photo
          </button>
          <canvas
            ref={canvasRef}
            className="hidden"
          />
        </>
      ) : (
        <>
          <GraphicsOverlay
            imageUrl={capturedImage}
            onSave={handleSave}
          />
          <button
            onClick={() => setCapturedImage(null)}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Take New Photo
          </button>
        </>
      )}
    </div>
  );
}
