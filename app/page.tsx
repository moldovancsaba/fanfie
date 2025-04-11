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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

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

  // Share functionality
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
        height = windowHeight;
        width = windowHeight * imageAspectRatio;
      } else {
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
                disabled={isUploading}
              >
                Retake Photo
              </button>
              {!uploadedUrl ? (
                <button
                  onClick={handleUpload}
                  className="px-6 py-3 bg-green-500 text-white rounded-full text-lg shadow-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Upload Photo'}
                </button>
              ) : (
                <button
                  onClick={handleShare}
                  className="px-6 py-3 bg-purple-500 text-white rounded-full text-lg shadow-lg hover:bg-purple-600 transition-colors"
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
