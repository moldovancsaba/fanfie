'use client';

import { useState, useCallback } from 'react';
import CameraComponent from './components/Camera/CameraComponent';
import toast from 'react-hot-toast';

interface ImageDimensions {
  width: number;
  height: number;
}

export default function Home() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions | null>(null);

  const handleCapture = useCallback((imageData: string) => {
    // Create a temporary image to get dimensions
    const img = new Image();
    img.onload = () => {
      setImageDimensions({
        width: img.width,
        height: img.height
      });
      setCapturedImage(imageData);
      toast.success('Photo captured successfully!');
    };
    img.src = imageData;
  }, []);

  const handleError = useCallback((error: Error) => {
    toast.error(error.message);
  }, []);

  const handleRetake = useCallback(() => {
    setCapturedImage(null);
    setImageDimensions(null);
  }, []);

  // Calculate image display dimensions
  const getImageStyle = useCallback(() => {
    if (!imageDimensions) return {};

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight - 120; // Account for UI elements
    const imageAspectRatio = imageDimensions.width / imageDimensions.height;
    const windowAspectRatio = windowWidth / windowHeight;

    if (imageAspectRatio > windowAspectRatio) {
      // Image is wider than window (relative to aspect ratios)
      return {
        width: '100vw',
        height: `${100 / imageAspectRatio}vw`,
        maxHeight: '100vh'
      };
    } else {
      // Image is taller than window (relative to aspect ratios)
      return {
        width: `${imageAspectRatio * 100}vh`,
        height: '100vh',
        maxWidth: '100vw'
      };
    }
  }, [imageDimensions]);

  return (
    <main className="min-h-screen w-full bg-black">
      {!capturedImage ? (
        <CameraComponent 
          onCapture={handleCapture}
          onError={handleError}
          fitToScreen={true}
        />
      ) : (
        <div className="fixed inset-0 flex items-center justify-center bg-black">
          <div className="relative w-full h-full flex items-center justify-center">
            <div 
              className="relative overflow-hidden"
              style={getImageStyle()}
            >
              <img 
                src={capturedImage} 
                alt="Captured"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 z-10">
                <button
                  onClick={handleRetake}
                  className="px-6 py-3 bg-blue-500 text-white rounded-full text-lg shadow-lg hover:bg-blue-600 transition-colors"
                >
                  Retake Photo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
