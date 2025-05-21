# Image Processing Technical Documentation

**Last Updated**: 2025-05-21T15:11:11.043Z

## Overview
Fanfie implements comprehensive image processing functionality to ensure high-quality photo capture, proper scaling, and optimal display across various screen sizes and devices.

## Core Components

### Image Capture System

```typescript
function handleCapture() {
  // Create canvas for capture
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Set dimensions
  const { videoWidth, videoHeight } = videoRef.current;
  canvas.width = frameWidth;
  canvas.height = frameHeight;
  
  // Calculate source area
  const sourceX = (videoWidth - sourceWidth) / 2;
  const sourceY = (videoHeight - sourceHeight) / 2;
  
  // Draw video frame to canvas with mirroring if needed
  if (mirrorImage) {
    ctx.scale(-1, 1);
    ctx.drawImage(
      videoRef.current, 
      sourceX, sourceY, sourceWidth, sourceHeight,
      -frameWidth, 0, frameWidth, frameHeight
    );
  } else {
    ctx.drawImage(
      videoRef.current, 
      sourceX, sourceY, sourceWidth, sourceHeight,
      0, 0, frameWidth, frameHeight
    );
  }
  
  // Convert to data URL
  return canvas.toDataURL('image/jpeg', 0.95);
}
```

### Image Scaling System

```typescript
function calculateContainerDimensions(
  viewportWidth: number,
  viewportHeight: number,
  imageWidth: number,
  imageHeight: number
): { width: number; height: number } {
  // Use 90% of viewport height and 95% of width for safe margins
  const safeHeight = viewportHeight * 0.9;
  const safeWidth = viewportWidth * 0.95;
  
  // Use actual frame aspect ratio
  const frameAspect = imageWidth / imageHeight;
  
  if (safeWidth / safeHeight > frameAspect) {
    // Width is the constraint
    const height = safeHeight;
    const width = height * frameAspect;
    return { 
      width: Math.round(width), 
      height: Math.round(height) 
    };
  } else {
    // Height is the constraint
    const width = safeWidth;
    const height = width / frameAspect;
    return { 
      width: Math.round(width), 
      height: Math.round(height) 
    };
  }
}
```

## Key Features

### Aspect Ratio Preservation
The system ensures that images maintain their original aspect ratio throughout the capture and display process by:
1. Calculating container dimensions based on aspect ratio
2. Applying consistent scaling logic
3. Using proper source area calculations
4. Implementing boundary checks

### Image Quality Optimization
Fanfie optimizes image quality through:
1. High-quality image smoothing
2. Proper scaling algorithms
3. Canvas optimization techniques
4. Quality parameter tuning

### Viewport Awareness
The image processing system adapts to different viewport sizes and orientations:
1. Dynamic viewport dimension detection
2. Responsive container sizing
3. Orientation change handling
4. Device-specific optimizations

### Mirror Handling
The system properly handles mirroring for selfie cameras:
1. Detects front-facing camera usage
2. Applies horizontal scaling transformation
3. Adjusts source coordinates accordingly
4. Preserves quality during transformation

## Implementation Details

### Source Area Calculations
```typescript
// Calculate video and container aspect ratios
const videoAspect = videoWidth / videoHeight;
const containerAspect = containerWidth / containerHeight;

// Determine capture dimensions
let captureWidth, captureHeight;

if (videoAspect > containerAspect) {
  // Video is wider than container - use container height
  captureHeight = videoHeight;
  captureWidth = videoHeight * containerAspect;
} else {
  // Video is taller than container - use container width
  captureWidth = videoWidth;
  captureHeight = videoWidth / containerAspect;
}
```

### Preview Rendering
```typescript
// Set preview image with proper dimensions
setPreviewDimensions(calculateContainerDimensions(
  viewport.width,
  viewport.height,
  currentFrame.width,
  currentFrame.height
));
```

## Performance Considerations
- Efficient canvas operations
- Memory management
- Resource cleanup
- Render optimization

## Browser Compatibility
- Modern browser support with fallbacks
- Mobile-specific optimizations
- Touch event handling
- Device capability detection

## Future Enhancements
1. Advanced image filters
2. Face detection integration
3. Custom cropping tools
4. Brightness/contrast adjustments

