import React from 'react';
import dynamic from 'next/dynamic';
const CameraComponent = dynamic(
  () => import('@/app/components/Camera/SimpleCameraComponent'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <div className="animate-pulse text-gray-600">Initializing camera...</div>
      </div>
    )
  }
);

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Fanfie
        </h1>
        
        <div className="flex flex-col items-center w-full">
          <CameraComponent />
        </div>
      </div>
    </main>
  );
}

