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
    if (videoRef.current) {
      const video = videoRef.current;
      // Wait for video metadata to load
      if (video.videoWidth === 0) {
        setTimeout(adjustVideoSize, 100);
        return;
      }

      // Calculate size based on video dimensions
      const size = Math.min(video.videoWidth, video.videoHeight);
      video.style.width = `${size}px`;
      video.style.height = `${size}px`;
      console.log('Video size adjusted:', { size });
    }
  };

  useEffect(() => {
    // Initial sizing
    adjustVideoSize();
    
    // Listen for resize events
    window.addEventListener('resize', adjustVideoSize);
    
    // Listen for orientation changes
    // Add a more robust orientation change listener
    window.addEventListener('orientationchange', () => {
      // Small delay to ensure the browser has updated dimensions after rotation
      setTimeout(() => {
        console.log('Orientation changed, adjusting video size');
        adjustVideoSize();
      }, 300); // Slightly longer delay for more reliable orientation change detection
    });
    
    return () => {
      window.removeEventListener('resize', adjustVideoSize);
      window.removeEventListener('orientationchange', () => setTimeout(adjustVideoSize, 300));
    };
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
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      const constraints = {
        video: {
          width: { ideal: 1080 },
          height: { ideal: 1080 },
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
    // Create a canvas to capture the current frame
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');
    
    // Draw the current frame
    ctx.drawImage(video, 0, 0);
    
    // Convert to ImageBitmap
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
      <main className="flex flex-col landscape:flex-row items-center justify-center h-[calc(100vh-var(--footer-height))] overflow-hidden w-full">
        {error && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded z-10">
            {error}
          </div>
        )}

        {/* Camera Section */}
        <div className="camera-section w-full max-w-md h-[calc(50vh-var(--section-gap))] landscape:h-[calc(100vh-var(--footer-height))] landscape:w-[calc(50vw-var(--section-gap))] flex items-center justify-center" ref={containerRef}>
          <div className="bg-gray-100 rounded-lg overflow-hidden relative flex items-center justify-center aspect-square" 
               style={{ 
                 width: 'min(calc(50vh - var(--section-gap)), 100%)',
                 height: 'min(calc(50vh - var(--section-gap)), 100%)'
               }}>
            <video
              ref={videoRef}
              className="object-cover transition-all duration-300 w-full h-full rounded-lg"
              playsInline
              muted
              crossOrigin="anonymous"
            />
            <img 
              src="/frame.png" 
              alt="Camera Frame" 
              className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10 rounded-lg"
            />
          </div>
        </div>

        {/* Buttons Section */}
        <div className="buttons-section w-full max-w-md h-[calc(50vh-var(--section-gap))] landscape:h-[calc(100vh-var(--footer-height))] landscape:w-[calc(50vw-var(--section-gap))] buttons-container">
          <div className="flex flex-col justify-center h-full gap-4 px-4">
          <button
            onClick={isStreaming ? stopCamera : startCamera}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors"
          >
            {isStreaming ? 'Stop Camera' : 'Start Camera'}
          </button>

          <button
            onClick={() => {
              console.log('Take Picture button clicked');
              takePhoto();
            }}
            disabled={!isStreaming}
            className={`w-full py-2 px-4 rounded transition-colors ${
              isStreaming
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Take Picture (Select Camera View)
          </button>
          </div>
        </div>
      </main>
      
      {/* Footer with Policy Links */}
      <footer className="footer-container text-center text-sm text-gray-600 bg-white py-2">
        <div className="flex justify-center space-x-4">
          <Link href="/terms" className="hover:text-blue-500 hover:underline">Terms and Conditions</Link>
          <Link href="/privacy" className="hover:text-blue-500 hover:underline">Privacy Policy</Link>
          <Link href="/cookies" className="hover:text-blue-500 hover:underline">Cookie Policy</Link>
        </div>
      </footer>

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
          .landscape\\:flex-row {
            flex-direction: row;
          }
          
          .landscape\\:items-start {
            align-items: flex-start;
          }
          
          .landscape\\:justify-center {
            justify-content: center;
          }
          
          .landscape\\:max-w-\\[50\\%\\] {
            max-width: 50%;
          }
          
          
          .landscape\\:space-y-4 > * + * {
            margin-top: 1rem;
          }
        }
        
        /* Video container adjustments */
        video {
          transition: width 0.3s ease, height 0.3s ease, transform 0.3s ease;
        }
        
        /* Enhance video display within container */
        @media (orientation: portrait) {
          video {
            max-width: 100%;
            max-height: calc(50vh - var(--section-gap));
            object-position: center;
          }
          
          /* Ensure container keeps square aspect in portrait */
          div[style*="aspectRatio"] {
            width: 100%;
            max-width: calc(50vh - var(--section-gap));
            max-height: calc(50vh - var(--section-gap));
          }
        }
        
        @media (orientation: landscape) {
          video {
            max-width: 100%;
            max-height: calc(100vh - var(--footer-height));
            object-position: center;
          }
          
          /* Allow container to adjust in landscape while maintaining aspect */
          div[style*="aspectRatio"] {
            width: 100%;
            height: 100%;
            max-width: calc(100vh - var(--footer-height));
            max-height: calc(100vh - var(--footer-height));
          }
        }
        /* Frame and video alignment enhancements */
        img[src*="frame.png"] {
          transition: all 0.3s ease;
          pointer-events: none;
          object-fit: contain;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
        }

        /* Ensure frame and video are perfectly aligned */
        .relative:hover img[src*="frame.png"] {
          opacity: 0.95; /* Subtle effect on hover */
        }
        
        /* Optimize for different devices/orientations */
        @media (orientation: portrait) {
          img[src*="frame.png"] {
            width: 100%;
            height: 100%;
            max-width: calc(50vh - var(--section-gap));
            max-height: calc(50vh - var(--section-gap));
          }
        }
        
        @media (orientation: landscape) {
          img[src*="frame.png"] {
            width: 100%;
            height: 100%;
            max-width: calc(100vh - var(--footer-height));
            max-height: calc(100vh - var(--footer-height));
          }
        }

        /* Ensure video and frame maintain consistent dimensions */
        .relative {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        /* Prevent scrolling on body */
        body {
          overflow: hidden;
          position: fixed;
          width: 100%;
          height: 100%;
        }
        
        /* Ensure main content fills available space */
      `}</style>
    </>
  );
}
