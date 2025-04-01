'use client';
import { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import CameraComponent from './components/CameraComponent';
import ShareComponent from './components/ShareComponent';
import Image from 'next/image';

const validateApiKey = (key: string | undefined): boolean => {
  return key?.length === 32 || false;
};

export default function Home() {
  const [apiConfigured, setApiConfigured] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setApiConfigured(validateApiKey(process.env.NEXT_PUBLIC_IMGBB_API_KEY));
  }, []);

  const handleCapture = (imageData: string) => {
    if (!apiConfigured) return;
    if (!imageData.startsWith('data:image')) {
      toast.error('Invalid image data received');
      return;
    }
    setCapturedImage(imageData);
  };

  const handleUploadConfirm = async () => {
    if (!apiConfigured) {
      toast.error('API not properly configured');
      return;
    }
    
    try {
      setUploading(true);
      const loadingToast = toast.loading('Uploading photo...');

      const formData = new FormData();
      formData.append('image', capturedImage?.split(',')[1] || '');
      
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        setShareUrl(data.data.url);
        toast.success('Upload successful!', { id: loadingToast });
      } else {
        throw new Error(data.error?.message || 'Upload failed');
      }
    } catch (error) {
      toast.error('Upload failed');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setCapturedImage(null);
    setShareUrl(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <Toaster position="top-center" />
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Fanfie</h1>
          <p className="text-gray-300">Take and share photos easily</p>
          {!apiConfigured && (
            <div className="text-red-500 mt-2">
              Warning: API not configured - uploads disabled
            </div>
          )}
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
              onClose={handleCancel}
            />
          ) : capturedImage ? (
            <div className="flex flex-col items-center">
              <div className="relative w-full h-96 mb-4">
                <Image
                  src={capturedImage}
                  alt="Captured preview"
                  fill
                  className="object-contain rounded-lg"
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleUploadConfirm} 
                  className={`px-6 py-3 rounded-lg transition ${
                    apiConfigured 
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                  }`}
                  disabled={!apiConfigured}
                >
                  {apiConfigured ? 'Upload & Share' : 'Upload Disabled'}
                </button>
                <button
                  onClick={handleCancel}
                  className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  Retake Photo
                </button>
              </div>
            </div>
          ) : (
            <CameraComponent 
              onCapture={handleCapture} 
              disabled={!apiConfigured}
            />
          )}
        </div>
      </div>
    </main>
  );
}
