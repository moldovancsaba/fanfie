'use client';

import { useState } from 'react';
import CameraComponent from './components/Camera/CameraComponent';

export default function Home() {
  const [photo, setPhoto] = useState<string | null>(null);

  const handleCapture = (imageData: string) => {
    setPhoto(imageData);
  };

  const handleError = (error: Error) => {
    console.error('Camera error:', error);
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Camera Test</h1>
        
        {photo ? (
          <div className="space-y-4">
            <img src={photo} alt="Captured" className="rounded-lg shadow-lg" />
            <button
              onClick={() => setPhoto(null)}
              className="w-full py-2 bg-blue-500 text-white rounded-lg"
            >
              Take Another
            </button>
          </div>
        ) : (
          <CameraComponent
            onCapture={handleCapture}
            onError={handleError}
          />
        )}
      </div>
    </main>
  );
}
