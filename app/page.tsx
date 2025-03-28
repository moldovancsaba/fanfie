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
    if (videoRef.current && containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const containerHeight = containerRef.current.offsetHeight;
      const orientation = isLandscape() ? 'landscape' : 'portrait';
      
      let size;
      if (orientation === 'portrait') {
        // In portrait mode, keep it square but respect container width
        size = containerWidth;
        videoRef.current.style.maxHeight = '100vw'; // Limit height to viewport width for square aspect
      } else {
        // In landscape mode, optimize for height while maintaining aspect ratio
        size = Math.min(containerWidth, window.innerHeight * 0.8);
        videoRef.current.style.maxHeight = '80vh'; // Allow more height in landscape
      }
      
      // Apply the calculated size
      videoRef.current.style.width = `${size}px`;
      videoRef.current.style.height = `${size}px`;
      
      // Ensure video fits within container
      videoRef.current.style.maxWidth = '100%';
      videoRef.current.style.objectFit = 'cover';
      
      console.log(`Adjusted video size for ${orientation}: ${size}px`);
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
        
        // Adjust video size after camera starts
        adjustVideoSize();
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
    console.log('takePhoto triggered');
    if (!videoRef.current || !isStreaming) {
      console.log('Early return - videoRef or streaming check failed:', {
        hasVideoRef: !!videoRef.current,
        isStreaming
      });
      return;
    }

    const canvas = document.createElement('canvas');
    const size = Math.min(videoRef.current.videoWidth, videoRef.current.videoHeight);
    console.log('Canvas created with size:', size);
    canvas.width = size;
    canvas.height = size;
    
    const context = canvas.getContext('2d');
    if (!context) {
      console.log('Failed to get canvas context');
      return;
    }

    const sx = (videoRef.current.videoWidth - size) / 2;
    const sy = (videoRef.current.videoHeight - size) / 2;
    console.log('Drawing parameters:', { sx, sy, size });
    
    // Draw the video frame to the canvas
    context.drawImage(
      videoRef.current,
      sx, sy, size, size,
      0, 0, size, size
    );

    // Load the frame image and draw it on top of the photo
    const loadFrameAndFinish = () => {
      console.log('Starting loadFrameAndFinish');
      return new Promise((resolve, reject) => {
        const frameImage = new Image();
        console.log('Created frame image object');
        
        frameImage.onload = () => {
          console.log('Frame image loaded successfully');
          // Draw the frame on top of the video capture
          context.drawImage(frameImage, 0, 0, size, size);
          console.log('Frame drawn on canvas');
          
          // Convert to data URL after the frame is drawn
          const photoUrl = canvas.toDataURL('image/jpeg');
          console.log('Photo converted to data URL');
          setCapturedPhotoUrl(photoUrl);
          setShowModal(true);
          stopCamera();
          resolve(null);
        };
        
        frameImage.onerror = (error) => {
          console.error('Error loading frame image:', error);
          // Fall back to photo without frame if frame fails to load
          const photoUrl = canvas.toDataURL('image/jpeg');
          setCapturedPhotoUrl(photoUrl);
          setShowModal(true);
          stopCamera();
          reject(error);
        };
        
        console.log('Setting frame image source');
        frameImage.src = 'https://i.ibb.co/mV2jdW46/SEYU-FRAME.png';
      });
    };

    // Execute the frame loading and photo finishing
    loadFrameAndFinish().catch(error => {
      console.error('Failed to load frame:', error);
      // Ensure we show the modal even if frame loading fails
      setShowModal(true);
    });
  };

  return (
    <>
      <main className="p-4 flex flex-col items-center landscape:flex-row landscape:items-start landscape:justify-center min-h-[calc(100vh-40px)]">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        {/* Camera Section */}
        <div className="w-full max-w-md landscape:max-w-[50%] landscape:mr-4 mb-4 landscape:mb-0" ref={containerRef}>
          <div className="bg-gray-100 rounded-lg overflow-hidden relative flex items-center justify-center" style={{ aspectRatio: '1' }}>
            <video
              ref={videoRef}
              className="object-cover transition-all duration-300"
              playsInline
              muted
              style={{ 
                width: '100%', 
                height: '100%',
                objectFit: 'cover',
                borderRadius: '0.375rem' // 6px to match rounded-lg
              }}
            />
            <img 
              src="https://i.ibb.co/mV2jdW46/SEYU-FRAME.png" 
              alt="Camera Frame" 
              className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10"
              style={{
                borderRadius: '0.375rem' // 6px to match video rounded-lg
              }}
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
      
      {/* Footer with Policy Links */}
      <footer className="bg-gray-100 py-2 px-4 text-center text-sm text-gray-600 w-full">
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
          
          .landscape\\:mr-4 {
            margin-right: 1rem;
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
            max-height: 100vw;
            object-position: center;
          }
          
          /* Ensure container keeps square aspect in portrait */
          div[style*="aspectRatio"] {
            width: 100%;
            max-width: 100vw;
          }
        }
        
        @media (orientation: landscape) {
          video {
            max-width: 100%;
            max-height: 80vh;
            object-position: center;
          }
          
          /* Allow container to adjust in landscape while maintaining aspect */
          div[style*="aspectRatio"] {
            width: 100%;
            height: auto;
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
            max-width: 100vw;
          }
        }
        
        @media (orientation: landscape) {
          img[src*="frame.png"] {
            width: 100%;
            height: 100%;
            max-height: 80vh;
          }
        }

        /* Ensure video and frame maintain consistent dimensions */
        .relative {
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </>
  );
}
