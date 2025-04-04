'use client';

import { useState } from 'react';
import CameraComponent from './components/Camera/CameraComponent';

export default function Home() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = (imageData: string) => {
    setCapturedImage(imageData);
    setError(null);
  };

  const handleError = (error: Error) => {
    setError(error.message);
    console.error('Camera error:', error);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Fanfie</h1>
        <p className="text-center text-gray-600 mb-8">Your selfie companion</p>
        
        {error && (
          <div className="mb-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {capturedImage ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-full max-w-lg">
              <img 
                src={capturedImage} 
                alt="Captured photo" 
                className="w-full rounded-lg shadow-lg"
              />
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleRetake}
                className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
              >
                Take Another Photo
              </button>
              <a
                href={capturedImage}
                download="fanfie.jpg"
                className="px-6 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
              >
                Download
              </a>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-lg mx-auto">
            <CameraComponent
              onCapture={handleCapture}
              onError={handleError}
            />
      </div>
    </main>
  );
}
