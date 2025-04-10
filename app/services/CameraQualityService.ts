'use client';

/**
 * CameraQualityService
 * 
 * A service for optimizing camera quality for the best possible:
 * - Live preview quality
 * - Captured photo resolution
 * - Image processing preservation
 * - Upload quality
 * 
 * Implements progressive enhancement with graceful fallbacks
 * to ensure stability across different devices and browsers.
 */

// Define camera types for better identification
export enum CameraType {
  REAR = 'rear',
  FRONT = 'front',
  UNKNOWN = 'unknown'
}

// Define resolution hierarchy from highest to lowest quality
export const RESOLUTION_HIERARCHY = [
  { width: 4096, height: 2160, label: '4K' },      // 4K
  { width: 3840, height: 2160, label: 'UHD' },     // UHD
  { width: 1920, height: 1080, label: 'FHD' },     // Full HD
  { width: 1280, height: 720, label: 'HD' },       // HD
  { width: 640, height: 480, label: 'VGA' }        // VGA (fallback)
];

// Define frame rate options from highest to lowest
export const FRAME_RATE_OPTIONS = [60, 30, 24, 15];

// Result of quality optimization
export interface CameraQualityResult {
  stream: MediaStream;
  actualResolution: { width: number; height: number };
  targetResolution: { width: number; height: number; label: string };
  actualFrameRate: number;
  targetFrameRate: number;
  cameraType: CameraType;
  deviceName: string;
  isFrontFacing: boolean;
  supportedConstraints: string[];
}

// Camera initialization options
export interface CameraInitOptions {
  preferredCamera?: 'rear' | 'front';
  minResolution?: { width: number; height: number };
  targetFrameRate?: number;
  enableHighQualityMode?: boolean;
}

/**
 * Detects the type of camera based on its label
 */
export function detectCameraType(deviceLabel: string = ''): CameraType {
  const normalizedLabel = deviceLabel.toLowerCase();
  
  if (normalizedLabel.includes('back') || normalizedLabel.includes('rear') || 
      normalizedLabel.includes('environment')) {
    return CameraType.REAR;
  }
  
  if (normalizedLabel.includes('front') || normalizedLabel.includes('face') || 
      normalizedLabel.includes('user') || normalizedLabel.includes('selfie')) {
    return CameraType.FRONT;
  }
  
  return CameraType.UNKNOWN;
}

/**
 * Type guard to check if a string is a valid MediaTrackConstraint key
 */
function isValidConstraintName(constraintName: string): constraintName is keyof MediaTrackSupportedConstraints {
  // List of standard video constraint names from the MediaTrackSupportedConstraints interface
  // According to https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackSupportedConstraints
  const standardConstraints: Array<keyof MediaTrackSupportedConstraints> = [
    'width', 'height', 'aspectRatio', 'frameRate', 'facingMode',
    'deviceId', 'groupId'
  ];
  
  // Check if the constraint name is in our standard list
  return standardConstraints.includes(constraintName as any);
}

/**
 * Safely checks if a constraint is supported by the browser
 */
export function isBrowserConstraintSupported(constraintName: string): boolean {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getSupportedConstraints) {
      return false;
    }
    
    const supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
    
    // For standard constraint names, check directly
    if (isValidConstraintName(constraintName)) {
      return supportedConstraints[constraintName] === true;
    }
    
    // For non-standard constraints (like brightness, etc.), use safer check
    return Object.prototype.hasOwnProperty.call(supportedConstraints, constraintName) &&
           (supportedConstraints as Record<string, boolean>)[constraintName] === true;
  } catch (error) {
    console.warn(`Error checking support for constraint ${constraintName}:`, error);
    return false;
  }
}

/**
 * Gets the list of available cameras with detailed information
 */
export async function getAvailableCameras(): Promise<{
  cameras: MediaDeviceInfo[];
  hasRearCamera: boolean;
  hasFrontCamera: boolean;
  bestRearCamera: MediaDeviceInfo | null;
  bestFrontCamera: MediaDeviceInfo | null;
}> {
  try {
    // Request permission first if needed
    try {
      // Quick permission check with low resolution to minimize user disruption
      const permissionStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false
      });
      
      // Stop tracks immediately after permission granted
      permissionStream.getTracks().forEach(track => track.stop());
    } catch (permissionError) {
      console.error('Camera permission denied:', permissionError);
      throw new Error('Camera permission is required to detect available cameras');
    }
    
    // Now enumerate all devices
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter(device => device.kind === 'videoinput');
    
    if (cameras.length === 0) {
      throw new Error('No cameras detected on this device');
    }
    
    // Categorize cameras by type
    const rearCameras = cameras.filter(camera => 
      detectCameraType(camera.label) === CameraType.REAR
    );
    
    const frontCameras = cameras.filter(camera => 
      detectCameraType(camera.label) === CameraType.FRONT
    );
    
    // Unknown cameras (couldn't determine from label)
    const unknownCameras = cameras.filter(camera => 
      detectCameraType(camera.label) === CameraType.UNKNOWN
    );
    
    // If we have unknown cameras and no determined rear cameras,
    // assume the first unknown might be rear (common on some devices)
    let bestRearCamera = rearCameras.length > 0 ? rearCameras[0] : null;
    if (!bestRearCamera && unknownCameras.length > 0) {
      bestRearCamera = unknownCameras[0];
    }
    
    // Get best front camera
    const bestFrontCamera = frontCameras.length > 0 ? frontCameras[0] : null;
    
    return {
      cameras,
      hasRearCamera: rearCameras.length > 0,
      hasFrontCamera: frontCameras.length > 0,
      bestRearCamera,
      bestFrontCamera
    };
  } catch (error) {
    console.error('Error getting camera devices:', error);
    return {
      cameras: [],
      hasRearCamera: false,
      hasFrontCamera: false,
      bestRearCamera: null,
      bestFrontCamera: null
    };
  }
}

/**
 * Builds optimal camera constraints based on device capabilities
 */
export function buildOptimalConstraints(
  preferredResolution: { width: number; height: number },
  preferredFrameRate: number,
  deviceId?: string,
  highQualityMode = false
): MediaTrackConstraints {
  // Start with basic constraints that work everywhere
  const constraints: MediaTrackConstraints = {
    width: { ideal: preferredResolution.width },
    height: { ideal: preferredResolution.height },
    frameRate: { ideal: preferredFrameRate }
  };
  
  // Add device ID if specified
  if (deviceId) {
    constraints.deviceId = { exact: deviceId };
  }
  
  // In high quality mode, try to apply advanced constraints
  if (highQualityMode) {
    // Add advanced constraints if browser supports them
    if (isBrowserConstraintSupported('aspectRatio')) {
      constraints.aspectRatio = { ideal: 4/3 };
    }
    
    // These are extended MediaTrackConstraints that may not be in the TypeScript definition
    // but are supported by some browsers, so we'll use type assertion
    const advancedConstraints = constraints as any;
    
    if (isBrowserConstraintSupported('brightness')) {
      advancedConstraints.brightness = { ideal: 1.0 };
    }
    
    if (isBrowserConstraintSupported('contrast')) {
      advancedConstraints.contrast = { ideal: 1.0 };
    }
    
    if (isBrowserConstraintSupported('saturation')) {
      advancedConstraints.saturation = { ideal: 1.0 };
    }
    
    if (isBrowserConstraintSupported('sharpness')) {
      advancedConstraints.sharpness = { ideal: 1.0 };
    }
    
    if (isBrowserConstraintSupported('focusMode')) {
      advancedConstraints.focusMode = 'continuous';
    }
    
    if (isBrowserConstraintSupported('whiteBalanceMode')) {
      advancedConstraints.whiteBalanceMode = 'continuous';
    }
  }
  
  return constraints;
}

/**
 * Gets the highest quality camera stream available with fallback strategy
 */
export async function getOptimalCameraStream(options: CameraInitOptions = {}): Promise<CameraQualityResult> {
  // Default options
  const {
    preferredCamera = 'rear',
    minResolution = { width: 640, height: 480 },
    targetFrameRate = 30,
    enableHighQualityMode = true
  } = options;
  
  // First get available cameras
  const { cameras, hasRearCamera, hasFrontCamera, bestRearCamera, bestFrontCamera } = 
    await getAvailableCameras();
  
  // Choose camera based on preference and availability
  let selectedCamera: MediaDeviceInfo | null = null;
  let isFrontFacing = false;
  
  if (preferredCamera === 'rear' && bestRearCamera) {
    selectedCamera = bestRearCamera;
  } else if (preferredCamera === 'front' && bestFrontCamera) {
    selectedCamera = bestFrontCamera;
    isFrontFacing = true;
  } else if (bestRearCamera) {
    // Fall back to rear if preferred not available
    selectedCamera = bestRearCamera;
  } else if (bestFrontCamera) {
    // Fall back to front if no rear
    selectedCamera = bestFrontCamera;
    isFrontFacing = true;
  }
  
  // Track attempts for logging
  const attemptLog: string[] = [];
  
  // Try each resolution in hierarchy until successful
  for (const resolution of RESOLUTION_HIERARCHY) {
    // Skip resolutions below minimum requirements
    if (resolution.width < minResolution.width || resolution.height < minResolution.height) {
      continue;
    }
    
    // Try each frame rate until successful
    for (const frameRate of FRAME_RATE_OPTIONS) {
      try {
        attemptLog.push(`Trying ${resolution.label} (${resolution.width}x${resolution.height}) at ${frameRate}fps`);
        
        // Build optimal constraints
        const constraints = buildOptimalConstraints(
          resolution, 
          frameRate,
          selectedCamera?.deviceId,
          enableHighQualityMode
        );
        
        // Try to get the stream
        const stream = await navigator.mediaDevices.getUserMedia({
          video: constraints,
          audio: false
        });
        
        // Get video track for analysis
        const videoTrack = stream.getVideoTracks()[0];
        if (!videoTrack) {
          throw new Error('No video track found in stream');
        }
        
        // Get actual settings
        const settings = videoTrack.getSettings();
        const actualWidth = settings.width || 0;
        const actualHeight = settings.height || 0;
        const actualFrameRate = settings.frameRate || 0;
        
        // Get supported constraints
        const supportedConstraints: string[] = [];
        if (navigator.mediaDevices && navigator.mediaDevices.getSupportedConstraints) {
          const constraintList = navigator.mediaDevices.getSupportedConstraints();
          Object.entries(constraintList).forEach(([constraint, isSupported]) => {
            if (isSupported) {
              supportedConstraints.push(constraint);
            }
          });
        }
        
        console.log('Camera stream acquired successfully', {
          target: `${resolution.label} (${resolution.width}x${resolution.height}) at ${frameRate}fps`,
          actual: `${actualWidth}x${actualHeight} at ${actualFrameRate}fps`,
          cameraLabel: videoTrack.label,
          cameraType: detectCameraType(videoTrack.label)
        });
        
        // Return success result
        return {
          stream,
          actualResolution: {
            width: actualWidth,
            height: actualHeight
          },
          targetResolution: resolution,
          actualFrameRate: actualFrameRate,
          targetFrameRate: frameRate,
          cameraType: detectCameraType(videoTrack.label),
          deviceName: videoTrack.label,
          isFrontFacing,
          supportedConstraints
        };
      } catch (error) {
        console.warn(
          `Failed attempt for ${resolution.width}x${resolution.height} at ${frameRate}fps:`,
          error
        );
        // Continue to next option
      }
    }
  }
  
  // All specified resolutions failed, try basic fallback
  console.warn('All quality attempts failed, using basic fallback camera access. Attempts:', attemptLog);
  
  try {
    let fallbackConstraints: MediaTrackConstraints = {
      width: { min: minResolution.width },
      height: { min: minResolution.height }
    };
    
    // Add device ID if available
    if (selectedCamera?.deviceId) {
      fallbackConstraints.deviceId = { exact: selectedCamera.deviceId };
    } else if (preferredCamera === 'front') {
      // If no device ID but front camera preferred, try facingMode
      fallbackConstraints.facingMode = { exact: 'user' };
      isFrontFacing = true;
    } else if (preferredCamera === 'rear') {
      // If no device ID but rear camera preferred, try facingMode
      fallbackConstraints.facingMode = { exact: 'environment' };
    }
    
    const fallbackStream = await navigator.mediaDevices.getUserMedia({
      video: fallbackConstraints,
      audio: false
    });
    
    const videoTrack = fallbackStream.getVideoTracks()[0];
    const settings = videoTrack.getSettings();
    
    // Create fallback result
    return {
      stream: fallbackStream,
      actualResolution: {
        width: settings.width || 640,
        height: settings.height || 480
      },
      targetResolution: { width: 640, height: 480, label: 'Fallback' },
      actualFrameRate: settings.frameRate || 30,
      targetFrameRate: 30,
      cameraType: detectCameraType(videoTrack.label),
      deviceName: videoTrack.label,
      isFrontFacing,
      supportedConstraints: []
    };
  } catch (finalError) {
    console.error('Complete camera access failure:', finalError);
    throw new Error('Unable to access any camera. Please check permissions and try again.');
  }
}

/**
 * Optimizes a canvas for high-quality image capture
 */
export function optimizeCanvas(
  sourceVideo: HTMLVideoElement, 
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: 'jpeg' | 'png';
  } = {}
): { canvas: HTMLCanvasElement; width: number; height: number } {
  const {
    maxWidth = 4096,
    maxHeight = 4096,
    quality = 1.0,
    format = 'jpeg'
  } = options;
  
  // Get video dimensions
  const videoWidth = sourceVideo.videoWidth;
  const videoHeight = sourceVideo.videoHeight;
  
  if (!videoWidth || !videoHeight) {
    throw new Error('Video dimensions not available. Make sure video is playing.');
  }
  
  // Calculate dimensions while preserving aspect ratio
  let targetWidth = videoWidth;
  let targetHeight = videoHeight;
  
  // Scale down if necessary to respect max dimensions
  if (targetWidth > maxWidth || targetHeight > maxHeight) {
    const aspectRatio = videoWidth / videoHeight;
    
    if (aspectRatio > 1) {
      // Landscape orientation
      targetWidth = Math.min(maxWidth, targetWidth);
      targetHeight = Math.round(targetWidth / aspectRatio);
      
      // Check if height still exceeds max after adjusting width
      if (targetHeight > maxHeight) {
        targetHeight = maxHeight;
        targetWidth = Math.round(targetHeight * aspectRatio);
      }
    } else {
      // Portrait or square orientation
      targetHeight = Math.min(maxHeight, targetHeight);
      targetWidth = Math.round(targetHeight * aspectRatio);
      
      // Check if width still exceeds max after adjusting height
      if (targetWidth > maxWidth) {
        targetWidth = maxWidth;
        targetHeight = Math.round(targetWidth / aspectRatio);
      }
    }
  }
  
  // Create and configure canvas for optimal quality
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  
  try {
    // Get optimal context with quality settings
    const ctx = canvas.getContext('2d', {
      alpha: format === 'png', // Only use alpha for PNG
      desynchronized: true,    // Potential performance boost
      willReadFrequently: false // Not planning frequent readbacks
    });
    
    if (!ctx) {
      throw new Error('Could not create canvas context');
    }
    
    // Apply quality optimizations
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Clear canvas with black background (for JPEG) or transparent (for PNG)
    if (format === 'jpeg') {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    // Draw video frame to canvas at target dimensions
    ctx.drawImage(sourceVideo, 0, 0, canvas.width, canvas.height);
    
    return {
      canvas,
      width: targetWidth,
      height: targetHeight
    };
  } catch (error) {
    console.error('Canvas optimization error:', error);
    throw new Error(`Failed to optimize canvas: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Captures a high quality photo from video element
 */
export function captureHighQualityPhoto(
  videoElement: HTMLVideoElement,
  options: {
    format?: 'jpeg' | 'png';
    quality?: number;
    maxWidth?: number;
    maxHeight?: number;
  } = {}
): { dataUrl: string; width: number; height: number } {
  const {
    format = 'jpeg',
    quality = 0.95,
    maxWidth = 4096,
    maxHeight = 4096
  } = options;
  
  // Validate video element state
  if (!videoElement) {
    throw new Error('Video element is required for photo capture');
  }
  
  if (videoElement.readyState < 2) { // HAVE_CURRENT_DATA (2) or higher needed
    throw new Error('Video is not ready for capture. Ensure video is playing before capture.');
  }
  
  try {
    // First, create optimized canvas from video
    const { canvas, width, height } = optimizeCanvas(videoElement, {
      maxWidth,
      maxHeight,
      format,
      quality
    });
    
    // Convert to data URL with specified format and quality
    const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const dataUrl = canvas.toDataURL(mimeType, quality);
    
    return {
      dataUrl,
      width,
      height
    };
  } catch (error) {
    console.error('High quality photo capture failed:', error);
    throw new Error(`Failed to capture photo: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Optimizes an image for upload (balancing quality and file size)
 */
export async function optimizeForUpload(
  imageDataUrl: string,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: 'jpeg' | 'png';
    maxSizeKB?: number;
  } = {}
): Promise<{ dataUrl: string; width: number; height: number; sizeKB: number }> {
  const {
    maxWidth = 2048,  // More reasonable for upload
    maxHeight = 2048, // More reasonable for upload
    quality = 0.85,   // Good balance between quality and size
    format = 'jpeg',  // JPEG usually better for photos
    maxSizeKB = 1024  // 1MB default max size
  } = options;
  
  return new Promise((resolve, reject) => {
    // Create image element to load the data URL
    const img = new Image();
    
    img.onload = () => {
      try {
        // Start with desired quality
        let currentQuality = quality;
        let outputDataUrl = "";
        let currentSizeKB = 0;
        let attempts = 0;
        const maxAttempts = 5;
        
        // Calculate target dimensions while preserving aspect ratio
        const aspectRatio = img.width / img.height;
        
        let targetWidth = img.width;
        let targetHeight = img.height;
        
        // Scale down if necessary
        if (targetWidth > maxWidth || targetHeight > maxHeight) {
          if (aspectRatio > 1) {
            // Landscape orientation
            targetWidth = Math.min(maxWidth, targetWidth);
            targetHeight = Math.round(targetWidth / aspectRatio);
          } else {
            // Portrait or square orientation
            targetHeight = Math.min(maxHeight, targetHeight);
            targetWidth = Math.round(targetHeight * aspectRatio);
          }
        }
        
        // Create optimized canvas
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        
        const ctx = canvas.getContext('2d', {
          alpha: format === 'png'
        });
        
        if (!ctx) {
          throw new Error('Could not get canvas context');
        }
        
        // Set optimization options
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Draw image to canvas
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        
        // Try to get output within size limit through quality adjustment
        do {
          // Convert to data URL with current quality
          const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
          outputDataUrl = canvas.toDataURL(mimeType, currentQuality);
          
          // Calculate size in KB
          currentSizeKB = Math.round(outputDataUrl.length * 0.75 / 1024); // Base64 overhead is ~33%
          
          // Reduce quality if size is too large and we're using JPEG
          if (currentSizeKB > maxSizeKB && format === 'jpeg' && currentQuality > 0.5) {
            currentQuality -= 0.05; // Reduce quality by 5%
            attempts++;
          } else {
            break;
          }
        } while (attempts < maxAttempts);
        
        // Return optimized image info
        resolve({
          dataUrl: outputDataUrl,
          width: targetWidth,
          height: targetHeight,
          sizeKB: currentSizeKB
        });
      } catch (error) {
        reject(new Error(`Image optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image for optimization'));
    };
    
    // Load the image from data URL
    img.src = imageDataUrl;
  });
}

/**
 * Validates image quality against requirements
 */
export function validateImageQuality(
  width: number,
  height: number,
  options: {
    minWidth?: number;
    minHeight?: number;
    minPixels?: number;
    aspectRatioTolerance?: number;
  } = {}
): {
  isValid: boolean;
  pixelCount: number;
  aspectRatio: number;
  issues: string[];
} {
  const {
    minWidth = 640,
    minHeight = 480,
    minPixels = 307200, // 640x480
    aspectRatioTolerance = 0.1 // 10% tolerance for aspect ratio
  } = options;
  
  const issues: string[] = [];
  
  // Check dimensions
  if (width < minWidth) {
    issues.push(`Width (${width}px) is below minimum (${minWidth}px)`);
  }
  
  if (height < minHeight) {
    issues.push(`Height (${height}px) is below minimum (${minHeight}px)`);
  }
  
  // Calculate pixel count
  const pixelCount = width * height;
  if (pixelCount < minPixels) {
    issues.push(`Resolution (${pixelCount} pixels) is below minimum (${minPixels} pixels)`);
  }
  
  // Calculate aspect ratio
  const aspectRatio = width / height;
  
  // Common target aspect ratios
  const standardRatios = [
    { name: '4:3', value: 4/3 },
    { name: '16:9', value: 16/9 },
    { name: '3:2', value: 3/2 },
    { name: '1:1', value: 1 }
  ];
  
  // Check if aspect ratio is close to common standards
  const isStandardRatio = standardRatios.some(ratio => {
    return Math.abs(aspectRatio - ratio.value) <= aspectRatioTolerance;
  });
  
  if (!isStandardRatio) {
    issues.push(`Aspect ratio (${aspectRatio.toFixed(2)}) is non-standard`);
  }
  
  return {
    isValid: issues.length === 0,
    pixelCount,
    aspectRatio,
    issues
  };
}

/**
 * Generates a quality report for the captured image
 */
export function generateQualityReport(
  width: number,
  height: number,
  sizeKB: number,
  format: 'jpeg' | 'png' = 'jpeg'
): {
  score: number;
  resolution: string;
  level: string;
  details: string[];
} {
  // Calculate base quality score (0-100)
  let qualityScore = 0;
  const details: string[] = [];
  
  // Resolution score (0-40 points)
  const pixelCount = width * height;
  if (pixelCount >= 8294400) { // 4K (3840x2160)
    qualityScore += 40;
    details.push('4K+ resolution detected (+40)');
  } else if (pixelCount >= 2073600) { // Full HD (1920x1080)
    qualityScore += 30;
    details.push('Full HD resolution detected (+30)');
  } else if (pixelCount >= 921600) { // HD (1280x720)
    qualityScore += 20;
    details.push('HD resolution detected (+20)');
  } else if (pixelCount >= 307200) { // VGA (640x480)
    qualityScore += 10;
    details.push('Standard resolution detected (+10)');
  } else {
    details.push('Low resolution detected (+0)');
  }
  
  // Format score (0-10 points)
  if (format === 'png') {
    qualityScore += 10;
    details.push('Lossless PNG format (+10)');
  } else if (format === 'jpeg') {
    // Size vs quality for JPEG
    // For a given resolution, larger file size generally means better quality
    // This is a simplified heuristic
    const pixelsPerKB = pixelCount / sizeKB;
    if (pixelsPerKB < 5000) { // Very high quality JPEG
      qualityScore += 8;
      details.push('High quality JPEG compression (+8)');
    } else if (pixelsPerKB < 10000) { // Good quality JPEG
      qualityScore += 5;
      details.push('Good quality JPEG compression (+5)');
    } else {
      qualityScore += 2;
      details.push('Standard JPEG compression (+2)');
    }
  }
  
  // Aspect ratio score (0-10 points)
  const aspectRatio = width / height;
  const standardRatios = [
    { name: '4:3', value: 4/3 },
    { name: '16:9', value: 16/9 },
    { name: '3:2', value: 3/2 },
    { name: '1:1', value: 1 }
  ];
  
  const closestRatio = standardRatios.reduce((prev, curr) => {
    return (Math.abs(aspectRatio - curr.value) < Math.abs(aspectRatio - prev.value)) 
      ? curr : prev;
  });
  
  const aspectRatioDeviation = Math.abs(aspectRatio - closestRatio.value) / closestRatio.value;
  
  if (aspectRatioDeviation < 0.01) { // Near-perfect aspect ratio
    qualityScore += 10;
    details.push(`Perfect ${closestRatio.name} aspect ratio (+10)`);
  } else if (aspectRatioDeviation < 0.05) { // Close to standard
    qualityScore += 5;
    details.push(`Close to ${closestRatio.name} aspect ratio (+5)`);
  } else {
    details.push('Non-standard aspect ratio (+0)');
  }
  
  // Dimensions bonus (0-20 points)
  if (width >= 3840 && height >= 2160) { // 4K or higher
    qualityScore += 20;
    details.push('4K or higher dimensions (+20)');
  } else if (width >= 1920 && height >= 1080) { // Full HD
    qualityScore += 15;
    details.push('Full HD or higher dimensions (+15)');
  } else if (width >= 1280 && height >= 720) { // HD
    qualityScore += 10;
    details.push('HD or higher dimensions (+10)');
  }
  
  // File size efficiency score (0-20 points)
  // Check if file size is appropriate for resolution
  const pixelsPerKB = pixelCount / Math.max(sizeKB, 1);
  if (format === 'png') {
    // For PNG, larger files are expected but shouldn't be excessive
    if (pixelsPerKB > 2000) {
      qualityScore += 20;
      details.push('Excellent file size efficiency for PNG (+20)');
    } else if (pixelsPerKB > 1000) {
      qualityScore += 15;
      details.push('Good file size efficiency for PNG (+15)');
    } else if (pixelsPerKB > 500) {
      qualityScore += 10;
      details.push('Average file size efficiency for PNG (+10)');
    } else {
      qualityScore += 5;
      details.push('Below average file size efficiency for PNG (+5)');
    }
  } else {
    // For JPEG, we expect better compression
    if (pixelsPerKB > 15000) {
      qualityScore += 20;
      details.push('Excellent file size efficiency for JPEG (+20)');
    } else if (pixelsPerKB > 10000) {
      qualityScore += 15;
      details.push('Good file size efficiency for JPEG (+15)');
    } else if (pixelsPerKB > 5000) {
      qualityScore += 10;
      details.push('Average file size efficiency for JPEG (+10)');
    } else {
      qualityScore += 5;
      details.push('Below average file size efficiency for JPEG (+5)');
    }
  }
  
  // Determine quality level based on score
  let resolution: string;
  
  // Resolution description
  if (width >= 3840 && height >= 2160) {
    resolution = '4K';
  } else if (width >= 1920 && height >= 1080) {
    resolution = 'Full HD';
  } else if (width >= 1280 && height >= 720) {
    resolution = 'HD';
  } else if (width >= 640 && height >= 480) {
    resolution = 'SD';
  } else {
    resolution = 'Low Resolution';
  }
  
  // Quality level based on overall score
  let qualityLevel: string;
  if (qualityScore >= 80) {
    qualityLevel = 'Ultra Premium';
  } else if (qualityScore >= 65) {
    qualityLevel = 'Premium';
  } else if (qualityScore >= 50) {
    qualityLevel = 'High';
  } else if (qualityScore >= 35) {
    qualityLevel = 'Good';
  } else if (qualityScore >= 20) {
    qualityLevel = 'Standard';
  } else {
    qualityLevel = 'Basic';
  }
  
  return {
    score: qualityScore,
    resolution,
    level: qualityLevel,
    details
  };
}

