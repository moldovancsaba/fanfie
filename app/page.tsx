'use client';

import { useState, useRef, useEffect } from 'react';

export default function Home() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const adjustVideoSize = () => {
      if (videoRef.current && containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const size = Math.min(containerWidth, window.innerHeight * 0.7);
        videoRef.current.style.width = `${size}px`;
        videoRef.current.style.height = `${size}px`;
      }
    };

    window.addEventListener('resize', adjustVideoSize);
    return () => window.removeEventListener('resize', adjustVideoSize);
  }, []);

  // Close modal when Escape key is pressed
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowModal(false);
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          aspectRatio: 1,
        }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (err) {
      setError('Camera access failed. Please ensure permissions are granted.');
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsStreaming(false);
    }
  };

  const handleDownload = () => {
    if (!capturedPhotoUrl) return;
    
    const link = document.createElement('a');
    link.href = capturedPhotoUrl;
    link.download = 'fanfie-square.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Close modal after download
    setShowModal(false);
  };

  const handleDownloadAndShare = async () => {
    if (!capturedPhotoUrl) return;
    
    // Download locally
    const link = document.createElement('a');
    link.href = capturedPhotoUrl;
    link.download = 'fanfie-square.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Upload to ImgBB
    try {
      setIsUploading(true);
      setUploadStatus('Uploading to ImgBB...');
      
      // Convert base64 data URL to Blob
      const fetchResponse = await fetch(capturedPhotoUrl);
      const blob = await fetchResponse.blob();
      
      // Create FormData and append the blob
      const formData = new FormData();
      formData.append('image', blob, 'fanfie-square.jpg');
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setUploadStatus('Uploaded successfully!');
        setTimeout(() => {
          setShowModal(false);
          setUploadStatus(null);
        }, 1500);
      } else {
        setUploadStatus(`Upload failed: ${data.error || 'Unknown error'}`);
        setTimeout(() => {
          setUploadStatus(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadStatus('Upload failed. Please try again.');
      setTimeout(() => {
        setUploadStatus(null);
      }, 3000);
    } finally {
      setIsUploading(false);
    }
  };

  const takePhoto = () => {
    if (!videoRef.current || !isStreaming) return;

    const canvas = document.createElement('canvas');
    const size = Math.min(videoRef.current.videoWidth, videoRef.current.videoHeight);
    canvas.width = size;
    canvas.height = size;
    
    const context = canvas.getContext('2d');
    if (!context) return;

    const sx = (videoRef.current.videoWidth - size) / 2;
    const sy = (videoRef.current.videoHeight - size) / 2;
    
    context.drawImage(
      videoRef.current,
      sx, sy, size, size,
      0, 0, size, size
    );

    const photoUrl = canvas.toDataURL('image/jpeg');
    setCapturedPhotoUrl(photoUrl);
    setShowModal(true);
    stopCamera();
  };

  return (
    <>
      <main className="p-4 flex flex-col items-center landscape:flex-row landscape:items-start landscape:justify-center">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        {/* Camera Section */}
        <div className="w-full max-w-md landscape:max-w-[50%] landscape:mr-4 mb-4 landscape:mb-0" ref={containerRef}>
          <div className="bg-gray-100 rounded-lg overflow-hidden" style={{ aspectRatio: '1' }}>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
          </div>
        </div>

        {/* Buttons Section */}
        <div className="w-full max-w-md landscape:max-w-[50%] space-y-2 landscape:space-y-4">
          <button
            onClick={isStreaming ? stopCamera : startCamera}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors"
          >
            {isStreaming ? 'Stop Camera' : 'Start Camera'}
          </button>

          <button
            onClick={takePhoto}
            disabled={!isStreaming}
            className={`w-full py-2 px-4 rounded transition-colors ${
              isStreaming
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Take Picture
          </button>
        </div>
      </main>

      {/* Modal */}
      {showModal && capturedPhotoUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in">
          <div 
            className="bg-white rounded-lg p-4 max-w-lg w-full mx-4 relative animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 p-2"
            >
              Cancel
            </button>
            
            <div className="aspect-square overflow-hidden rounded-lg mb-4">
              <img
                src={capturedPhotoUrl}
                alt="Captured photo"
                className="w-full h-full object-cover"
              />
            </div>
            
            {uploadStatus && (
              <div className={`mb-3 py-2 px-3 rounded text-center ${
                uploadStatus.includes('failed') 
                  ? 'bg-red-100 text-red-700' 
                  : uploadStatus.includes('success') 
                    ? 'bg-green-100 text-green-700'
                    : 'bg-blue-100 text-blue-700'
              }`}>
                {uploadStatus}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDownload}
                className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded transition-colors"
              >
                Download Photo
              </button>
              
              <button
                onClick={handleDownloadAndShare}
                disabled={isUploading}
                className={`
                  text-white py-3 px-4 rounded transition-colors
                  ${isUploading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-500 hover:bg-green-600'}
                `}
              >
                {isUploading ? 'Uploading...' : 'Download & Share'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-scale-in {
          animation: scaleIn 0.2s ease-out;
        }
        
        /* Responsive layout styles */
        @media (orientation: landscape) {
          .landscape\:flex-row {
            flex-direction: row;
          }
          
          .landscape\:items-start {
            align-items: flex-start;
          }
          
          .landscape\:justify-center {
            justify-content: center;
          }
          
          .landscape\:max-w-\[50\%\] {
            max-width: 50%;
          }
          
          .landscape\:mr-4 {
            margin-right: 1rem;
          }
          
          .landscape\:space-y-4 > * + * {
            margin-top: 1rem;
          }
        }
      `}</style>
    </>
  );
}
