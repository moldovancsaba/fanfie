'use client';

import { useState } from 'react';
import CameraComponent from './components/CameraComponent';
import GraphicsOverlay from './components/GraphicsOverlay';
import ShareComponent from './components/ShareComponent';
import { Toaster } from 'react-hot-toast';
export default function Home() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const handleCapture = (imageData: string) => {
    setCapturedImage(imageData);
  };

  const handleSave = (editedImage: string) => {
    setEditedImage(editedImage);
  };

  const handleClose = () => {
    setEditedImage(null);
    setCapturedImage(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <Toaster position="top-center" />
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Fanfie</h1>
          <p className="text-gray-300">Take amazing photos with custom graphics</p>
        </header>
        
        <div className="max-w-4xl mx-auto">
          {editedImage ? (
            <ShareComponent 
              imageUrl={editedImage}
              onClose={handleClose}
            />
          ) : capturedImage ? (
            <GraphicsOverlay 
              imageUrl={capturedImage} 
              onSave={handleSave}
              onClose={() => setCapturedImage(null)}
            />
          ) : (
            <CameraComponent onCapture={handleCapture} />
          )}
        </div>
        
        <footer className="text-center mt-8 text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Fanfie. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}
