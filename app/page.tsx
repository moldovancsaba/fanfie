'use client';

import { useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import CameraComponent from './components/CameraComponent';
import ShareComponent from './components/ShareComponent';

export default function Home() {
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleCapture = async (imageData: string) => {
    if (!imageData.startsWith('data:image')) {
      toast.error('Invalid image data received');
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
    if (!apiKey) {
      console.error('ImgBB API key not found');
      toast.error('Upload service not configured');
      return;
    }

    try {
      setUploading(true);
      const loadingToast = toast.loading('Uploading photo...');

      // Upload to imgbb.com
      const formData = new FormData();
      formData.append('image', imageData.split(',')[1]);
      
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        setShareUrl(data.data.url);
        toast.success('Photo uploaded successfully!', {
          id: loadingToast
        });
      } else {
        throw new Error(data.error?.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading:', error);
      toast.error('Failed to upload photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setShareUrl(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <Toaster position="top-center" />
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Fanfie</h1>
          <p className="text-gray-300">Take and share photos easily</p>
        </header>
        
        <div className="max-w-4xl mx-auto">
          {uploading ? (
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-2"></div>
              <p>Uploading photo...</p>
            </div>
          ) : shareUrl ? (
            <ShareComponent 
              imageUrl={shareUrl}
              onClose={handleClose}
            />
          ) : (
            <CameraComponent 
              onCapture={handleCapture}
            />
          )}
        </div>
        
        <footer className="text-center mt-8 text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Fanfie. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}
