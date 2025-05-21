# Frame System Technical Documentation

**Last Updated**: 2025-05-21T15:11:11.043Z

## Overview
The Frame System in Fanfie provides a mechanism for overlaying decorative frames on camera views and captured images. The implementation uses canvas-based composition to ensure proper alignment, scaling, and quality preservation.

## Core Components

### FrameOverlay Component
```typescript
interface FrameProps {
  frameUrl: string;
  containerWidth: number;
  containerHeight: number;
  onError?: (error: Error) => void;
}
```

### Canvas Composition System
The frame system uses a multi-layered canvas approach:

```typescript
// Create primary canvas for composition
const canvas = document.createElement('canvas');
canvas.width = containerWidth;
canvas.height = containerHeight;
const ctx = canvas.getContext('2d');

// Draw video/image content
ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

// Draw frame overlay
ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
```

## Frame Positioning

### Centering Algorithm
```typescript
// Calculate scaling factors
const scale = Math.min(
  containerWidth / frameImage.width,
  containerHeight / frameImage.height
);

// Calculate positioning for center alignment
const xOffset = (containerWidth - frameImage.width * scale) / 2;
const yOffset = (containerHeight - frameImage.height * scale) / 2;

// Apply positioning
ctx.drawImage(
  frameImage,
  xOffset, yOffset,
  frameImage.width * scale,
  frameImage.height * scale
);
```

## Implementation Details

### Frame Preloading
```typescript
// Preload frame image for better performance
const frameImage = new Image();
frameImage.crossOrigin = 'anonymous';
frameImage.src = frameUrl;
frameImage.onload = () => {
  isFrameLoaded = true;
  renderFrame();
};
```

### Z-Index Management
The frame system implements a clear Z-index hierarchy to ensure proper layering:
1. Base layer: Video/captured image (z-index: 1)
2. Middle layer: Frame overlay (z-index: 10)
3. Top layer: UI controls (z-index: 100)

### State Management
```typescript
// Frame loading state
const [isFrameLoaded, setIsFrameLoaded] = useState(false);
const [isFrameError, setIsFrameError] = useState(false);

// Frame references
const frameRef = useRef<HTMLImageElement | null>(null);
const canvasRef = useRef<HTMLCanvasElement | null>(null);
```

## Capture Process with Frame

### Composition Steps
1. Capture raw image from video
2. Create composition canvas
3. Draw image on canvas
4. Apply frame overlay
5. Convert canvas to data URL

```typescript
function captureWithFrame() {
  // Create capture canvas
  const captureCanvas = document.createElement('canvas');
  captureCanvas.width = containerWidth;
  captureCanvas.height = containerHeight;
  const ctx = captureCanvas.getContext('2d');
  
  // Draw video content
  ctx.drawImage(videoElement, 0, 0, containerWidth, containerHeight);
  
  // Draw frame
  if (isFrameLoaded && frameRef.current) {
    ctx.drawImage(frameRef.current, 0, 0, containerWidth, containerHeight);
  }
  
  // Convert to data URL
  return captureCanvas.toDataURL('image/jpeg', 0.95);
}
```

## Quality Considerations

### Resolution Management
The frame system maintains quality through intelligent resolution management:
- Preserves source resolution when possible
- Uses high-quality image smoothing
- Implements proper scaling calculations
- Maintains aspect ratios

### Performance Optimization
- Caches frame images
- Uses requestAnimationFrame for rendering
- Implements proper resource cleanup
- Optimizes canvas operations

## Error Handling
- Frame load timeout detection
- Error state management
- Fallback rendering without frames
- User feedback mechanisms

## Future Enhancements
1. Multiple frame selection
2. Frame position adjustment
3. Frame opacity controls
4. Custom frame uploads

