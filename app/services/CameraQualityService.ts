'use client';

/**
 * Gets the current screen/viewport dimensions
 */
export function getScreenDimensions(): { width: number; height: number } {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0 };
  }
  // Get window dimensions
  const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  const height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
  
  return { width, height };
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
    fitToScreen?: boolean;
  } = {}
): { canvas: HTMLCanvasElement; width: number; height: number } {
  const {
    maxWidth = 4096,
    maxHeight = 4096,
    quality = 1.0,
    format = 'jpeg',
    fitToScreen = false
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
  
  // If fitToScreen is true, consider screen dimensions
  if (fitToScreen) {
    const { width: screenWidth, height: screenHeight } = getScreenDimensions();
    
    // Use screen dimensions as constraints (with some margin for UI elements)
    const availableWidth = Math.min(screenWidth - 32, maxWidth); // 16px margin on each side
    const availableHeight = Math.min(screenHeight - 120, maxHeight); // Allow space for UI elements
    
    const aspectRatio = videoWidth / videoHeight;
    
    if (aspectRatio > 1) {
      // Landscape orientation
      targetWidth = Math.min(availableWidth, targetWidth);
      targetHeight = Math.round(targetWidth / aspectRatio);
      
      if (targetHeight > availableHeight) {
        targetHeight = availableHeight;
        targetWidth = Math.round(targetHeight * aspectRatio);
      }
    } else {
      // Portrait or square orientation
      targetHeight = Math.min(availableHeight, targetHeight);
      targetWidth = Math.round(targetHeight * aspectRatio);
      
      if (targetWidth > availableWidth) {
        targetWidth = availableWidth;
        targetHeight = Math.round(targetWidth / aspectRatio);
      }
    }
  } else if (targetWidth > maxWidth || targetHeight > maxHeight) {
    const aspectRatio = videoWidth / videoHeight;
    
    if (aspectRatio > 1) {
      targetWidth = Math.min(maxWidth, targetWidth);
      targetHeight = Math.round(targetWidth / aspectRatio);
      
      if (targetHeight > maxHeight) {
        targetHeight = maxHeight;
        targetWidth = Math.round(targetHeight * aspectRatio);
      }
    } else {
      targetHeight = Math.min(maxHeight, targetHeight);
      targetWidth = Math.round(targetHeight * aspectRatio);
      
      if (targetWidth > maxWidth) {
        targetWidth = maxWidth;
        targetHeight = Math.round(targetWidth / aspectRatio);
      }
    }
  }
  
  // Create and setup canvas
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  
  // Draw video frame to canvas
  ctx.drawImage(sourceVideo, 0, 0, targetWidth, targetHeight);
  
  return {
    canvas,
    width: targetWidth,
    height: targetHeight
  };
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
    fitToScreen?: boolean;
  } = {}
): { dataUrl: string; width: number; height: number } {
  const {
    format = 'jpeg',
    quality = 0.95,
    maxWidth = 4096,
    maxHeight = 4096,
    fitToScreen = true
  } = options;

  try {
    const { canvas, width, height } = optimizeCanvas(videoElement, {
      maxWidth,
      maxHeight,
      format,
      quality,
      fitToScreen
    });
    
    const dataUrl = canvas.toDataURL(`image/${format}`, quality);
    
    return {
      dataUrl,
      width,
      height
    };
  } catch (error) {
    console.error('Error capturing high quality photo:', error);
    throw error;
  }
}
