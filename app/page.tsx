'use client';

import { useState, useCallback, useEffect } from 'react';
import CameraComponent from './components/Camera/CameraComponent';
import toast from 'react-hot-toast';

interface ImageDimensions {
  width: number;
  height: number;
}

export default function Home() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions | null>(null);
  const [displayStyle, setDisplayStyle] = useState({});

  const handleCapture = useCallback((imageData: string) => {
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

  // Update display style whenever window size or image dimensions change
  useEffect(() => {
    function updateImageStyle() {
      if (!imageDimensions) return;

      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const imageAspectRatio = imageDimensions.width / imageDimensions.height;
      const windowAspectRatio = windowWidth / windowHeight;

      let width, height;

      if (imageAspectRatio > windowAspectRatio) {
        // Image is wider than window relative to aspect ratios
        height = windowHeight;
        width = windowHeight * imageAspectRatio;
      } else {
        // Image is taller than window relative to aspect ratios
        width = windowWidth;
        height = windowWidth / imageAspectRatio;
      }

      setDisplayStyle({
        width: `${width}px`,
        height: `${height}px`,
        maxWidth: '100vw',
        maxHeight: '100vh',
      });
    }

    updateImageStyle();
    window.addEventListener('resize', updateImageStyle);
    return () => window.removeEventListener('resize', updateImageStyle);
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
          <div 
            className="relative overflow-hidden"
            style={displayStyle}
          >
            <img 
              src={capturedImage} 
              alt="Captured"
              className="absolute inset-0 w-full h-full object-cover"
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
      )}
    </main>
  );
}
