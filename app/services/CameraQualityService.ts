'use client';

interface Dimensions {
  width: number;
  height: number;
}

/**
 * Gets the current viewport dimensions
 */
export function getViewportDimensions(): Dimensions {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0 };
  }
  
  return {
    width: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
    height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
  };
}

/**
 * Calculates optimal dimensions while preserving aspect ratio
 */
function calculateTargetDimensions(
  sourceWidth: number,
  sourceHeight: number,
  maxWidth: number,
  maxHeight: number,
  fitToScreen: boolean
): Dimensions {
  const aspectRatio = sourceWidth / sourceHeight;
  let targetWidth = sourceWidth;
  let targetHeight = sourceHeight;

  if (fitToScreen) {
    const viewport = getViewportDimensions();
    const availableWidth = Math.min(viewport.width - 32, maxWidth);
    const availableHeight = Math.min(viewport.height - 120, maxHeight);
    
    if (aspectRatio > availableWidth / availableHeight) {
      // Width limited
      targetWidth = availableWidth;
      targetHeight = Math.round(targetWidth / aspectRatio);
    } else {
      // Height limited
      targetHeight = availableHeight;
      targetWidth = Math.round(targetHeight * aspectRatio);
    }
  } else if (sourceWidth > maxWidth || sourceHeight > maxHeight) {
    if (aspectRatio > maxWidth / maxHeight) {
      // Width limited
      targetWidth = maxWidth;
      targetHeight = Math.round(targetWidth / aspectRatio);
    } else {
      // Height limited
      targetHeight = maxHeight;
      targetWidth = Math.round(targetHeight * aspectRatio);
    }
  }

  return { width: targetWidth, height: targetHeight };
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
    fitToScreen = false
  } = options;
  
  // Get video dimensions
  const videoWidth = sourceVideo.videoWidth;
  const videoHeight = sourceVideo.videoHeight;
  
  if (!videoWidth || !videoHeight) {
    throw new Error('Video dimensions not available. Make sure video is playing.');
  }

  // Calculate target dimensions
  const { width: targetWidth, height: targetHeight } = calculateTargetDimensions(
    videoWidth,
    videoHeight,
    maxWidth,
    maxHeight,
    fitToScreen
  );
  
  // Create and setup canvas
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Optional: Add image smoothing for better quality
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
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
