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
    <div className="flex flex-col items-center gap-4">
      {/* Error message display */}
      {error && (
        <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {/* Loading indicator */}
      {loading && (
        <div className="flex items-center justify-center w-full h-64 bg-gray-100 rounded-lg">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mb-3"></div>
            <p className="text-gray-600">Loading camera with optimal quality settings...</p>
          </div>
        </div>
      )}
      
      {/* Photo view (after capture) */}
      {photo ? (
        <div className="w-full">
          {/* Captured photo */}
          <img 
            src={photo} 
            alt="Captured photo" 
            className="w-full rounded-lg shadow-lg mb-2"
          />
          
          {/* Photo quality indicator */}
          {photoQuality && (
            <div className="bg-gray-100 p-3 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-semibold">
                  {photoQuality.resolution} • {photoQuality.level} Quality
                </div>
                <div className="text-xs text-gray-500">
                  Quality Score: {photoQuality.score}/100
                </div>
              </div>
              
              {/* Quality bar */}
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div 
                  className={`h-2.5 rounded-full ${
                    photoQuality.score >= 80 ? 'bg-green-600' : 
                    photoQuality.score >= 60 ? 'bg-green-500' : 
                    photoQuality.score >= 40 ? 'bg-yellow-500' : 
                    'bg-red-500'
                  }`}
                  style={{ width: `${photoQuality.score}%` }}
                ></div>
              </div>
              
              {/* Quality details (collapsible) */}
              <details className="text-xs text-gray-600 mt-1">
                <summary className="cursor-pointer">Quality details</summary>
                <ul className="pl-5 mt-2 list-disc">
                  {photoQuality.details.map((detail, index) => (
                    <li key={index}>{detail}</li>
                  ))}
                </ul>
              </details>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex gap-4">
            <button
              onClick={retake}
              className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors duration-200"
              disabled={loading}
            >
              Retake
            </button>
            <button
              onClick={uploadPhoto}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors duration-200"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </span>
              ) : 'Upload'}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Camera view (before capture) */}
          <div className="relative w-full">
            {/* Video element */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full rounded-lg shadow-lg mb-2"
            />
            
            {/* Camera overlay status */}
            {!loading && !cameraReady && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                <div className="text-white text-center p-4">
                  <p>Initializing camera...</p>
                  <div className="w-8 h-8 border-t-2 border-b-2 border-white rounded-full animate-spin mx-auto mt-2"></div>
                </div>
              </div>
            )}
          </div>
          
          {/* Quality information */}
          {qualityInfo && (
            <div className="w-full px-2 py-2 bg-gray-100 rounded-lg text-xs text-gray-700 mb-3">
              <div className="flex justify-between items-center">
                <div>📷 {qualityMessage}</div>
                <div className={`px-2 py-0.5 rounded-full text-white text-xs font-semibold ${
                  qualityInfo.actualResolution.width >= 1920 ? 'bg-green-500' : 
                  qualityInfo.actualResolution.width >= 1280 ? 'bg-blue-500' : 
                  'bg-yellow-500'
                }`}>
                  {qualityInfo.actualResolution.width >= 1920 ? 'HD+' : 
                   qualityInfo.actualResolution.width >= 1280 ? 'HD' : 'SD'}
                </div>
              </div>
            </div>
          )}
          
          {/* Camera controls */}
          <button
            onClick={takePhoto}
            disabled={loading || !cameraReady}
            className={`w-full py-3 px-6 rounded-lg font-medium transition-colors duration-200 ${
              loading || !cameraReady 
                ? 'bg-gray-400 cursor-not-allowed text-gray-200' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {loading ? 'Initializing Camera...' : !cameraReady ? 'Camera Preparing...' : 'Take Photo'}
          </button>
        </>
      )}
    </div>
  );
}
