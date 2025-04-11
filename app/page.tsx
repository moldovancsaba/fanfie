'use client';

import { useState } from 'react';
import CameraComponent from './components/Camera/CameraComponent';
import toast from 'react-hot-toast';

export default function Home() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const handleCapture = (imageData: string) => {
    setCapturedImage(imageData);
    toast.success('Photo captured successfully!');
  };

  const handleError = (error: Error) => {
    toast.error(error.message);
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        {!capturedImage ? (
          <CameraComponent 
            onCapture={handleCapture}
            onError={handleError}
            fitToScreen={true}
          />
        ) : (
          <div className="relative bg-black rounded-lg overflow-hidden">
            <img 
              src={capturedImage} 
              alt="Captured" 
              className="w-full h-auto"
            />
            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4">
              <button
                onClick={handleRetake}
                className="px-6 py-3 bg-blue-500 text-white rounded-full text-lg shadow-lg hover:bg-blue-600 transition-colors"
              >
                Retake Photo
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
