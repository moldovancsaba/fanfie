'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  getOptimalCameraStream, 
  captureHighQualityPhoto, 
  optimizeForUpload,
  generateQualityReport,
  CameraQualityResult
} from '../services/CameraQualityService'

export default function Camera() {
  // State management
  const videoRef = useRef<HTMLVideoElement>(null)
  const [photo, setPhoto] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [cameraReady, setCameraReady] = useState<boolean>(false)
  const [qualityInfo, setQualityInfo] = useState<CameraQualityResult | null>(null)
  const [qualityMessage, setQualityMessage] = useState<string>('')
  const [photoQuality, setPhotoQuality] = useState<{
    score: number;
    level: string;
    resolution: string;
    details: string[];
  } | null>(null)

  // Create a human-readable quality message
  const createQualityMessage = (quality: CameraQualityResult) => {
    const { actualResolution, actualFrameRate, cameraType, deviceName } = quality;
    const resolution = `${actualResolution.width}x${actualResolution.height}`;
    const fps = Math.round(actualFrameRate);
    const camera = cameraType === 'rear' ? 'rear camera' : 
                   cameraType === 'front' ? 'front camera' : 'camera';
    
    const message = `${resolution} at ${fps}fps using ${camera}`;
    setQualityMessage(message);
  };

  // Initialize camera
  const startCamera = async () => {
    try {
      setLoading(true);
      setCameraReady(false);
      setError(null);
      
      // Get optimal quality stream with fallback handling
      const qualityResult = await getOptimalCameraStream({
        preferredCamera: 'rear',  // Prefer rear camera for better quality
        minResolution: { width: 640, height: 480 },
        targetFrameRate: 30,
        enableHighQualityMode: true
      });
      
      // Store quality info for later use
      setQualityInfo(qualityResult);
      
      // Create user-friendly quality message
      createQualityMessage(qualityResult);
      
      // Set stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = qualityResult.stream;
        
        // Add event listener to know when video is actually ready
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded', {
            width: videoRef.current?.videoWidth,
            height: videoRef.current?.videoHeight
          });
        };
        
        videoRef.current.onplaying = () => {
          console.log('Video started playing, ready for capture');
          setCameraReady(true);
        };
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError(err instanceof Error ? err.message : 'Could not access camera');
    } finally {
      setLoading(false);
    }
  };

  // Start camera on component mount
  useEffect(() => {
    startCamera();
    
    // Cleanup camera on unmount
    return () => {
      // Stop camera stream when component unmounts
      const stream = videoRef.current?.srcObject as MediaStream | null;
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => {
          try {
            track.stop();
          } catch (e) {
            console.warn('Error stopping track:', e);
          }
        });
      }
      
      // Reset states
      setCameraReady(false);
      setQualityInfo(null);
    };
  }, []);

  // Take photo with highest quality
  const takePhoto = async () => {
    if (!videoRef.current || !cameraReady) {
      if (!cameraReady) {
        setError('Camera is not ready yet. Please wait a moment.');
      }
      return;
    }

    try {
      // Capture high quality photo using our service
      const { dataUrl, width, height } = captureHighQualityPhoto(videoRef.current, {
        format: 'jpeg',
        quality: 0.95,
        maxWidth: 4096,
        maxHeight: 4096
      });
      
      // Calculate file size in KB (base64 is ~33% larger than binary)
      const sizeInBytes = Math.round(dataUrl.length * 0.75);
      const sizeInKB = Math.round(sizeInBytes / 1024);
      
      // Generate quality report
      const quality = generateQualityReport(width, height, sizeInKB, 'jpeg');
      setPhotoQuality(quality);
      
      console.log('Photo captured with quality:', quality);
      
      // Set photo in state
      setPhoto(dataUrl);
    } catch (err) {
      console.error('Error taking photo:', err);
      setError('Failed to capture photo. Please try again.');
    }
  };

  // Upload the captured photo to the server
  const uploadPhoto = async () => {
    if (!photo) return;

    try {
      // First optimize the photo for upload
      const optimized = await optimizeForUpload(photo, {
        maxWidth: 2048,
        maxHeight: 2048,
        quality: 0.85,
        format: 'jpeg',
        maxSizeKB: 1024 // 1 MB limit
      });
      
      console.log('Photo optimized for upload:', {
        dimensions: `${optimized.width}x${optimized.height}`,
        size: `${optimized.sizeKB}KB`
      });
      
      // Convert base64 to blob for upload
      const res = await fetch(optimized.dataUrl);
      const blob = await res.blob();

      // Create form data for API
      const formData = new FormData();
      formData.append('image', blob);

      // Show loading indicator
      setLoading(true);
      
      // Send to upload API
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      // If successful, open in new tab
      if (result.data?.url) {
        window.open(result.data.url, '_blank');
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle retake by restarting camera
  const retake = async () => {
    // Clear photo and error states
    setPhoto(null);
    setError(null);
    setPhotoQuality(null);
    
    // Restart camera
    await startCamera();
  };
  return (
    <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-black overflow-hidden touch-none">
      {/* Error message display - emoji only */}
      {error && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-500 p-2 text-center">
          ❌
        </div>
      )}
      
      {/* Loading indicator - minimal version */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-75">
          <div className="w-16 h-16 border-t-4 border-b-4 border-white rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Main content area - perfectly fitted to viewport */}
      {photo ? (
        /* Photo view (after capture) */
        <div className="w-full h-full flex items-center justify-center">
          {/* Captured photo - fitted to viewport while maintaining aspect ratio */}
          <div className="w-full h-full flex items-center justify-center">
            <img 
              src={photo} 
              alt="Captured photo"
              className="w-full h-full object-contain" 
            />
          </div>
          
          {/* Emoji controls overlay - positioned relative to viewport */}
          <div className="fixed bottom-6 inset-x-0 flex justify-center items-center space-x-24 z-50 pointer-events-none">
            <button
              onClick={retake}
              className="w-20 h-20 flex items-center justify-center text-5xl bg-black bg-opacity-60 rounded-full hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-white transition-all shadow-xl pointer-events-auto"
              disabled={loading}
              aria-label="Retake photo"
            >
              🔄
            </button>
            
            <button
              onClick={uploadPhoto}
              className="w-20 h-20 flex items-center justify-center text-5xl bg-black bg-opacity-60 rounded-full hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-white transition-all shadow-xl pointer-events-auto"
              disabled={loading}
              aria-label="Upload photo"
            >
              {loading ? 
                <div className="w-10 h-10 border-t-2 border-b-2 border-white rounded-full animate-spin"></div> : 
                '⬆️'}
            </button>
          </div>
        </div>
      ) : (
        /* Camera view (before capture) */
        <div className="w-full h-full flex items-center justify-center">
          {/* Video element - fitted to viewport while maintaining aspect ratio */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-contain"
          />
          
          {/* Camera overlay status - minimal */}
          {!loading && !cameraReady && (
            <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-40">
              <div className="w-12 h-12 border-t-3 border-b-3 border-white rounded-full animate-spin"></div>
            </div>
          )}
          
          {/* Take photo emoji button - positioned at bottom center */}
          <div className="fixed bottom-6 inset-x-0 flex justify-center items-center z-50 pointer-events-none">
            <button
              onClick={takePhoto}
              disabled={loading || !cameraReady}
              className={`w-24 h-24 flex items-center justify-center text-6xl rounded-full shadow-xl pointer-events-auto ${
                loading || !cameraReady 
                  ? 'bg-gray-800 bg-opacity-50 text-gray-400' 
                  : 'bg-black bg-opacity-60 hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-white transition-all'
              }`}
              aria-label="Take photo"
            >
              {loading ? 
                <div className="w-12 h-12 border-t-2 border-b-2 border-white rounded-full animate-spin"></div> : 
                '🆕'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
