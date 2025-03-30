'use client';

import { useState } from 'react';
import CameraComponent from './components/CameraComponent';
import GraphicsOverlay from './components/GraphicsOverlay';
import ShareComponent from './components/ShareComponent';
import { Toaster } from 'react-hot-toast';

export default function Home() {
  // State management
  // State management
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [finalImage, setFinalImage] = useState<string | null>(null);
  const [mode, setMode] = useState<'capture' | 'edit' | 'share'>('capture');
  // Handler for when an image is captured
  const handleCapture = (imageData: string) => {
    setCapturedImage(imageData);
    setMode('edit');
  };

  // Handler for returning to camera
  const handleBack = () => {
    setCapturedImage(null);
    setMode('capture');
  };

  // Handler for saving the final image
  const handleSave = (finalImageData: string) => {
    // Save the final image data and transition to share mode
    console.log('Image saved:', finalImageData.substring(0, 50) + '...');
    setFinalImage(finalImageData);
    setMode('share');
  };

  // Handler for going back from share to edit
  const handleBackToEdit = () => {
    setMode('edit');
  };

  // Handler for download in share mode
  const handleDownload = () => {
    if (finalImage) {
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = finalImage;
      link.download = `fanfie-${new Date().toISOString().split('T')[0]}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 bg-gradient-to-b from-blue-50 to-pink-50">
      {/* Add Toaster component for notifications */}
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 text-indigo-600">
          Fanfie - Create Your Moment
        </h1>
        
        <div className="grid grid-cols-1 gap-4 w-full">
          {mode === 'capture' && (
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Capture a Photo</h2>
              <CameraComponent onCapture={handleCapture} />
            </div>
          )}
          
          {mode === 'edit' && capturedImage && (
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Edit Your Photo</h2>
              <GraphicsOverlay 
                image={capturedImage} 
                onBack={handleBack} 
                onSave={handleSave} 
              />
            </div>
          )}
          
          {mode === 'share' && finalImage && (
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Share Your Creation</h2>
                <button 
                  onClick={handleBackToEdit}
                  className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                >
                  Back to Edit
                </button>
              </div>
              <ShareComponent 
                imageUrl={finalImage} 
                title="My Fanfie Creation"
                description="Created with Fanfie - the fun photo editor!"
              />
            </div>
          )}
          
          <div className="text-center mt-4 text-sm text-gray-500">
            <p>
              {mode === 'capture' && 'Take a photo to get started!'}
              {mode === 'edit' && 'Make your photo special with our editor tools!'}
              {mode === 'share' && 'Share your creation with friends or download it!'}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

