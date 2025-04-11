'use client';

import { useState, useCallback } from 'react';
import CameraComponent from './components/Camera/CameraComponent';
import FrameOverlay from './components/Frame/FrameOverlay';
import toast from 'react-hot-toast';

export default function Home() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const handleCapture = useCallback((imageData: string) => {
    setCapturedImage(imageData);
    toast.success('Photo captured successfully!');
  }, []);

  const handleError = useCallback((error: Error) => {
    toast.error(error.message);
  }, []);

  const handleRetake = useCallback(() => {
    setCapturedImage(null);
    setUploadedUrl(null);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!capturedImage) return;

    try {
      setIsUploading(true);
      toast.loading('Uploading image...');

      // Convert base64 to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();

      // Create form data
      const formData = new FormData();
      formData.append('image', blob);

      // Upload to ImgBB through our API route
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const data = await uploadResponse.json();
      
      if (data.data?.url) {
        setUploadedUrl(data.data.url);
        toast.dismiss();
        toast.success('Image uploaded successfully!');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.dismiss();
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [capturedImage]);

  const handleShare = useCallback(async () => {
    if (!uploadedUrl) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My Photo',
          text: 'Check out my photo!',
          url: uploadedUrl
        });
        toast.success('Shared successfully!');
      } else {
        await navigator.clipboard.writeText(uploadedUrl);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to share. Please try again.');
    }
  }, [uploadedUrl]);

  // Common button styles
  const buttonContainerStyle = "fixed left-0 right-0 mx-auto flex justify-center gap-4 z-50";
  const buttonStyle = "px-6 py-3 rounded-full text-lg shadow-lg transition-colors";

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
          <div className="relative w-full h-full">
            <img 
              src={capturedImage} 
              alt="Captured"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div 
              className={buttonContainerStyle}
              style={{ bottom: '10vh' }} // 10% up from bottom
            >
              <button
                onClick={handleRetake}
                className={`${buttonStyle} bg-blue-500 hover:bg-blue-600 text-white`}
                disabled={isUploading}
              >
                Retake Photo
              </button>
              {!uploadedUrl ? (
                <button
                  onClick={handleUpload}
                  className={`${buttonStyle} bg-green-500 hover:bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                  disabled={isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Upload Photo'}
                </button>
              ) : (
                <button
                  onClick={handleShare}
                  className={`${buttonStyle} bg-purple-500 hover:bg-purple-600 text-white`}
                >
                  Share Photo
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
