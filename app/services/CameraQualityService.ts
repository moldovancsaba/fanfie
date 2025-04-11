'use client';

interface Dimensions {
  width: number;
  height: number;
}

interface CropDimensions extends Dimensions {
  offsetX: number;
  offsetY: number;
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
 * Safely retrieves the intrinsic dimensions of a video element
 */
export function getVideoIntrinsicDimensions(video: HTMLVideoElement): Dimensions {
  const videoWidth = video.videoWidth;
  const videoHeight = video.videoHeight;

  if (!videoWidth || !videoHeight) {
    throw new Error('Video dimensions not available. Make sure video is playing.');
  }

  return {
    width: videoWidth,
    height: videoHeight
  };
}

/**
 * Calculates dimensions to fit content within a container while preserving aspect ratio
 */
export function calculateAspectRatioFit(
  contentWidth: number,
  contentHeight: number,
  containerWidth: number,
  containerHeight: number
): Dimensions {
  const contentRatio = contentWidth / contentHeight;
  const containerRatio = containerWidth / containerHeight;
  
  let width = containerWidth;
  let height = containerHeight;

  if (contentRatio > containerRatio) {
    // Content is wider than container - scale by height
    height = containerHeight;
    width = height * contentRatio;
  } else {
    // Content is taller than container - scale by width
    width = containerWidth;
    height = width / contentRatio;
  }

  return {
    width: Math.round(width),
    height: Math.round(height)
  };
}

/**
 * Calculates dimensions and offsets for center-cropped content
 */
export function getCropDimensions(
  contentWidth: number,
  contentHeight: number,
  targetWidth: number,
  targetHeight: number
): CropDimensions {
  const contentRatio = contentWidth / contentHeight;
  const targetRatio = targetWidth / targetHeight;
  
  let sourceWidth = contentWidth;
  let sourceHeight = contentHeight;
  let offsetX = 0;
  let offsetY = 0;

  if (contentRatio > targetRatio) {
    // Content is wider - crop sides
    sourceWidth = contentHeight * targetRatio;
    offsetX = Math.round((contentWidth - sourceWidth) / 2);
  } else {
    // Content is taller - crop top/bottom
    sourceHeight = contentWidth / targetRatio;
    offsetY = Math.round((contentHeight - sourceHeight) / 2);
  }

  return {
    width: Math.round(sourceWidth),
    height: Math.round(sourceHeight),
    offsetX,
    offsetY
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
    frameWidth?: number;   // Added for frame-specific dimensions
    frameHeight?: number;  // Added for frame-specific dimensions
  } = {}
): { canvas: HTMLCanvasElement; width: number; height: number } {
  const {
    maxWidth = 4096,
    maxHeight = 4096,
    fitToScreen = false,
    frameWidth,
    frameHeight
  } = options;
  
  // Get video dimensions safely
  const { width: videoWidth, height: videoHeight } = getVideoIntrinsicDimensions(sourceVideo);

  // If frame dimensions are provided, use them for aspect ratio calculations
  const targetWidth = frameWidth || maxWidth;
  const targetHeight = frameHeight || maxHeight;

  // Get crop dimensions to maintain aspect ratio
  const cropDims = getCropDimensions(
    videoWidth,
    videoHeight,
    targetWidth,
    targetHeight
  );

  // Calculate dimensions that fit within max constraints
  const finalDims = calculateAspectRatioFit(
    cropDims.width,
    cropDims.height,
    maxWidth,
    maxHeight
  );
  
  // Create and setup canvas with frame dimensions if provided
  const canvas = document.createElement('canvas');
  canvas.width = frameWidth || finalDims.width;
  canvas.height = frameHeight || finalDims.height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Configure for high quality rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  // Draw video frame to canvas, maintaining aspect ratio and cropping as needed
  ctx.drawImage(
    sourceVideo,
    cropDims.offsetX,
    cropDims.offsetY,
    cropDims.width,
    cropDims.height,
    0,
    0,
    canvas.width,
    canvas.height
  );
  
  return {
    canvas,
    width: canvas.width,
    height: canvas.height
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
