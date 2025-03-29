'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

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

  const isLandscape = () => window.matchMedia('(orientation: landscape)').matches;

  const adjustVideoSize = () => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    if (!video.videoWidth || !video.videoHeight) {
      requestAnimationFrame(adjustVideoSize);
      return;
    }

    const isPortrait = window.innerHeight > window.innerWidth;
    const footerHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--footer-height') || '40px');
    const padding = Math.max(16, Math.min(window.innerWidth, window.innerHeight) * 0.02); // 2vmin

    // Calculate available space
    const availableWidth = isPortrait ? window.innerWidth : window.innerWidth / 2;
    const availableHeight = isPortrait 
      ? (window.innerHeight - footerHeight) / 2 
      : window.innerHeight - footerHeight;

    // Calculate maximum size (80% of available space)
    const maxSize = Math.min(
      (availableWidth - padding * 2) * 0.8,
      (availableHeight - padding * 2) * 0.8
    );

    // Apply size with minimum bound
    const size = Math.max(320, Math.floor(maxSize));
    
    // Update container size
    const container = video.parentElement;
    if (container) {
      container.style.width = `${size}px`;
      container.style.height = `${size}px`;
    }

    // Ensure video fills container
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.objectFit = 'cover';

    console.log('Video size adjusted:', {
      size,
      availableWidth,
      availableHeight,
      isPortrait,
      padding
    });
  };

  useEffect(() => {
    // Define a debounce function to limit resize event frequency
    const debounce = (func: Function, wait: number) => {
      let timeout: NodeJS.Timeout;
      return function executedFunction(...args: any[]) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    };
    
    // Initial sizing
    adjustVideoSize();
    
    // Listen for resize events with debounce
    const handleResize = debounce(() => {
      adjustVideoSize();
    }, 150);

    // Listen for orientation changes
    const handleOrientationChange = () => {
      // Wait for orientation change to complete
      setTimeout(adjustVideoSize, 300);
    };
    
    // Listen for escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowModal(false);
    };
    
    // Add event listeners
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('keydown', handleEscape);
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('keydown', handleEscape);
    };
  }, []); // Empty dependency array since we want this to run once on mount

  const startCamera = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      const constraints = {
        video: {
          width: { min: 1080, ideal: 1080, max: 1080 },
          height: { min: 1080, ideal: 1080, max: 1080 },
          aspectRatio: 1.0,
          facingMode: { ideal: 'user' }
        },
        audio: false
      };

      console.log('Requesting camera with constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Camera access granted');

      streamRef.current = stream;
      
      if (videoRef.current) {
        // Set properties for secure context
        videoRef.current.setAttribute('crossorigin', 'anonymous');
        videoRef.current.setAttribute('playsinline', '');
        videoRef.current.muted = true;
        
        // Set stream
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        console.log('Camera stream started successfully');
        setIsStreaming(true);
        console.log('isStreaming state set to true');
        
        // Adjust video size after camera starts
        adjustVideoSize();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setError('Failed to access camera. Please ensure camera permissions are granted.');
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

  const isImageCaptureSupported = () => {
    if (typeof window === 'undefined') return false;
    return typeof ImageCapture === 'function' && 'grabFrame' in ImageCapture.prototype;
  };

  const captureUsingImageCapture = async (videoTrack: MediaStreamTrack): Promise<ImageBitmap> => {
    const imageCapture = new ImageCapture(videoTrack);
    return imageCapture.grabFrame();
  };

  const captureUsingStream = async (video: HTMLVideoElement): Promise<ImageBitmap> => {
    const canvas = document.createElement('canvas');
    const size = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');
    
    // Calculate center crop
    const sx = (video.videoWidth - size) / 2;
    const sy = (video.videoHeight - size) / 2;
    
    // Draw the current frame with center crop
    ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);
    
    return createImageBitmap(canvas);
  };

  const takePhoto = async () => {
    console.log('takePhoto triggered');
    console.log('ImageCapture support status:', isImageCaptureSupported());

    if (!videoRef.current || !isStreaming || !streamRef.current) {
      console.log('Early return - checks failed:', {
        hasVideoRef: !!videoRef.current,
        isStreaming,
        hasStream: !!streamRef.current
      });
      return;
    }

    try {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (!videoTrack) {
        throw new Error('No video track available');
      }

      let bitmap: ImageBitmap;
      
      // Try ImageCapture first
      if (isImageCaptureSupported()) {
        console.log('Attempting capture using ImageCapture API');
        try {
          bitmap = await captureUsingImageCapture(videoTrack);
          console.log('Successfully captured using ImageCapture');
        } catch (error) {
          console.log('ImageCapture failed, falling back to stream capture', error);
          bitmap = await captureUsingStream(videoRef.current);
        }
      } else {
        console.log('ImageCapture not supported, using stream capture');
        bitmap = await captureUsingStream(videoRef.current);
      }

      console.log('Captured bitmap:', {
        width: bitmap.width,
        height: bitmap.height
      });

      // Create a canvas with the same dimensions
      const canvas = document.createElement('canvas');
      const size = Math.min(bitmap.width, bitmap.height);
      canvas.width = size;
      canvas.height = size;

      // Get the drawing context
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Calculate center crop coordinates
      const sx = (bitmap.width - size) / 2;
      const sy = (bitmap.height - size) / 2;

      // Draw the bitmap with center crop
      ctx.drawImage(
        bitmap,
        sx, sy, size, size,  // source coordinates
        0, 0, size, size     // destination coordinates
      );

      // Close the bitmap to free memory
      bitmap.close();

      // Load the frame overlay
      const frameImage = new Image();
      await new Promise((resolve, reject) => {
        frameImage.onload = () => {
          ctx.drawImage(frameImage, 0, 0, size, size);
          resolve(null);
        };
        frameImage.onerror = reject;
        frameImage.src = '/frame.png';
      });

      // Convert to data URL with fallback to Blob URL
      try {
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedPhotoUrl(dataUrl);
      } catch (error) {
        console.warn('toDataURL failed, falling back to Blob:', error);
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setCapturedPhotoUrl(url);
          }
        }, 'image/jpeg', 0.9);
      }

      setShowModal(true);
      stopCamera();

    } catch (error) {
      console.error('Error in takePhoto:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
    }
  };

  // Load the frame image and draw it on top of the photo
  // Load the frame image and draw it on top of the photo
  const loadFrameAndFinish = async () => {
    console.log('Starting loadFrameAndFinish');
    return new Promise((resolve, reject) => {
      const frameImage = new Image();
      frameImage.crossOrigin = 'anonymous';
      console.log('Created frame image object');
      
      frameImage.onload = async () => {
        try {
          console.log('Frame image loaded successfully');
          const canvas = document.createElement('canvas');
          const videoElement = videoRef.current;
          if (!videoElement) {
            reject(new Error('Video element not available'));
            return;
          }
          
          const size = Math.min(videoElement.videoWidth, videoElement.videoHeight);
          canvas.width = size;
          canvas.height = size;
          
          const context = canvas.getContext('2d', {
            willReadFrequently: true,
            alpha: false
          });
          if (!context) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          
          // First draw the video frame
          const sx = (videoElement.videoWidth - size) / 2;
          const sy = (videoElement.videoHeight - size) / 2;
          
          try {
            // Create bitmap from video frame
            const videoBitmap = await createImageBitmap(videoElement);
            context.drawImage(videoBitmap, sx, sy, size, size, 0, 0, size, size);
            videoBitmap.close();
            
            // Create bitmap from frame image
            const frameBitmap = await createImageBitmap(frameImage);
            context.drawImage(frameBitmap, 0, 0, size, size);
            frameBitmap.close();
            
            console.log('Frame drawn on canvas');
            
            // Convert to data URL
            try {
              const photoUrl = canvas.toDataURL('image/jpeg', 0.9);
              console.log('Photo converted to data URL');
              setCapturedPhotoUrl(photoUrl);
              setShowModal(true);
              stopCamera();
              resolve(null);
            } catch (error) {
              console.error('Error converting to data URL:', error);
              reject(error);
            }
          } catch (error) {
            console.error('Error creating image bitmap:', error);
            reject(error);
          }
        } catch (error) {
          console.error('Error in frame processing:', error);
          reject(error);
        }
      };
      
      frameImage.onerror = (error) => {
        console.error('Error loading frame image:', error);
        reject(error);
      };
      
      console.log('Setting frame image source');
      frameImage.src = '/frame.png';
    });
  };
  return (
    <>
      <main className="fixed inset-0 flex flex-col landscape:flex-row overflow-hidden">
        {error && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded z-10">
            {error}
          </div>
        )}

        {/* Camera - The composite component including video stream, canvas, and frame overlay */}
        <div className="camera-section" ref={containerRef}>
          <div className="camera">
            <video
              ref={videoRef}
              className="camera-video"
              playsInline
              muted
              crossOrigin="anonymous"
            />
            <img 
              src="/frame.png" 
              alt="Camera Frame" 
              className="camera-frame"
            />
          </div>
        </div>
        {/* Buttons Section */}
        <div className="fixed portrait:bottom-[var(--footer-height)] portrait:left-0 portrait:w-full portrait:h-[50vh] landscape:top-0 landscape:right-0 landscape:w-[50vw] landscape:h-[calc(100vh-var(--footer-height))] bg-white">
          <div className="flex flex-col justify-center h-full gap-4 p-4">
            <button
              onClick={isStreaming ? stopCamera : startCamera}
              className={`px-4 py-2 rounded-lg text-white font-semibold transition-all ${
                isStreaming 
                  ? 'bg-red-500 hover:bg-red-600 active:bg-red-700' 
                  : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
              }`}
            >
              {isStreaming ? 'Stop Camera' : 'Start Camera'}
            </button>
            
            <button
              onClick={() => {
                console.log('Take Picture button clicked');
                takePhoto();
              }}
              disabled={!isStreaming}
              className={`px-4 py-2 rounded-lg text-white font-semibold transition-all ${
                isStreaming
                  ? 'bg-green-500 hover:bg-green-600 active:bg-green-700'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              Take Photo
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="fixed bottom-0 left-0 right-0 h-[var(--footer-height)] bg-white border-t border-gray-200 flex items-center justify-center">
          <div className="flex space-x-4 text-sm text-gray-600">
            <Link href="/terms" className="hover:text-blue-500 hover:underline">Terms</Link>
            <Link href="/privacy" className="hover:text-blue-500 hover:underline">Privacy</Link>
            <Link href="/cookies" className="hover:text-blue-500 hover:underline">Cookies</Link>
          </div>
        </footer>
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
            
            <div className="camera-preview overflow-hidden rounded-lg mb-4">
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

            <div className="mt-4 text-center">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-6 rounded transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        :root {
          --footer-height: 40px;
          --camera-padding: max(1rem, min(2vw, 2vh));
          --camera-max-size: min(80%, min(calc(50vh - var(--camera-padding) * 2), calc(50vw - var(--camera-padding) * 2)));
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(0, 0, 0, 0.75);
          z-index: 50;
        }

        .modal-content {
          background-color: white;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px rgb(0 0 0 / 10%);
          padding: 1rem;
          max-width: 90%;
          max-height: 90%;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .action-button {
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-weight: 600;
          transition: all 0.2s;
        }

        .action-button.download {
          background-color: rgb(59 130 246);
          color: white;
        }

        .action-button.download:hover {
          background-color: rgb(37 99 235);
        }

        .action-button.share {
          background-color: rgb(34 197 94);
          color: white;
        }

        .action-button.share:hover {
          background-color: rgb(22 163 74);
        }

        .action-button.retry {
          background-color: rgb(209 213 219);
          color: rgb(107 114 128);
        }

        .status-message {
          text-align: center;
          padding: 0.5rem;
          border-radius: 0.25rem;
          font-weight: 500;
        }

        .status-message.info {
          background-color: rgb(191 219 254);
          color: rgb(37 99 235);
        }

        .status-message.success {
          background-color: rgb(209 250 229);
          color: rgb(22 163 74);
        }

        .status-message.error {
          background-color: rgb(254 202 202);
          color: rgb(220 38 38);
        }

        .error-message {
          background-color: rgb(254 202 202);
          color: rgb(220 38 38);
          padding: 0.5rem;
          border-radius: 0.25rem;
          margin: 1rem;
          font-weight: 500;
          text-align: center;
        }
          --camera-padding: max(1rem, min(2vw, 2vh));
          --camera-max-size: min(80%, min(calc(50vh - var(--camera-padding) * 2), calc(50vw - var(--camera-padding) * 2)));
        }

        /* Camera section */
        .camera-section {
          position: fixed;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: white;
        }

        /* Camera container */
        .camera {
          position: relative;
          width: var(--camera-max-size);
          aspect-ratio: 1;
          background-color: rgb(243 244 246);
          border-radius: 0.5rem;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
          transition: all 0.3s ease-in-out;
        }

        /* Camera video */
        .camera-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Frame overlay */
        .camera-frame {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: fill;
          pointer-events: none;
          z-index: 10;
        }

        /* Portrait layout */
        @media (orientation: portrait) {
          .camera-section {
            top: 0;
            left: 0;
            width: 100vw;
            height: 50vh;
          }
        }

        /* Landscape layout */
        @media (orientation: landscape) {
          .camera-section {
            top: 0;
            left: 0;
            width: 50vw;
            height: calc(100vh - var(--footer-height));
          }
        }

        /* Preview maintains same dimensions */
        .camera-preview {
          width: var(--camera-max-size);
          aspect-ratio: 1;
          margin: 0 auto;
          background-color: rgb(243 244 246);
          border-radius: 0.5rem;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
        }
        
        /* Animation keyframes */
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
        
        /* Root styles */
        body {
          overflow: hidden;
          position: fixed;
          width: 100%;
          height: 100%;
        }
      `}</style>
    </>
  );
}
