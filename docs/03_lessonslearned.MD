# Lessons Learned

## Frame Filling & Aspect Ratio (2025-04-11)

### 🎯 Challenge: Perfect Frame Filling
Initially, captured photos didn't match the video preview exactly, with incorrect cropping and scaling.

### ✅ Solution
```typescript
// Calculate dimensions for perfect frame filling
const videoAspect = video.videoWidth / video.videoHeight;
const frameAspect = currentFrame.width / currentFrame.height;

let sourceWidth: number;
let sourceHeight: number;
let sourceX: number;
let sourceY: number;

if (videoAspect > frameAspect) {
  // Video is wider - use full height and crop width
  sourceHeight = video.videoHeight;
  sourceWidth = video.videoHeight * frameAspect;
  sourceY = 0;
  sourceX = (video.videoWidth - sourceWidth) / 2;
} else {
  // Video is taller - use full width and crop height
  sourceWidth = video.videoWidth;
  sourceHeight = video.videoWidth / frameAspect;
  sourceX = 0;
  sourceY = (video.videoHeight - sourceHeight) / 2;
}
```

### 📝 Key Learnings

1. **Video Dimensions**
   - Always use intrinsic dimensions (videoWidth/videoHeight)
   - Consider device pixel ratio
   - Handle orientation changes properly

2. **Aspect Ratio Handling**
   ```typescript
   // Proper ratio calculations
   const videoAspect = video.videoWidth / video.videoHeight;
   const frameAspect = frame.width / frame.height;
   ```

3. **Canvas Operations**
   - Clear canvas before drawing
   - Use proper quality settings
   - Apply hardware acceleration
   - Handle CORS properly

### 🚫 Common Pitfalls

1. **Dimension Calculation**
   - Using element dimensions instead of intrinsic
   - Incorrect aspect ratio calculations
   - Not handling device pixel ratio

2. **Quality Issues**
   - Missing imageSmoothingEnabled
   - Incorrect quality in toDataURL
   - Not handling CORS for frames

3. **Performance Problems**
   - Large canvas dimensions
   - Unnecessary redraws
   - Missing hardware acceleration

### ✨ Best Practices

1. **Camera Setup**
   ```typescript
   const stream = await navigator.mediaDevices.getUserMedia({
     video: {
       facingMode: 'user',
       width: { ideal: 1920 },
       height: { ideal: 1080 }
     }
   });
   ```

2. **Quality Settings**
   ```typescript
   // Canvas optimization
   ctx.imageSmoothingEnabled = true;
   ctx.imageSmoothingQuality = 'high';
   
   // Video optimization
   video.style.transform = 'translateZ(0)';
   video.style.willChange = 'transform';
   ```

3. **Resource Management**
   ```typescript
   // Proper cleanup
   return () => {
     if (videoRef.current?.srcObject) {
       const stream = videoRef.current.srcObject as MediaStream;
       stream.getTracks().forEach(track => track.stop());
     }
   };
   ```

### 🔄 Future Optimizations

1. **Performance**
   - Implement frame caching
   - Add progressive loading
   - Optimize canvas operations
   - Add memory management

2. **Quality**
   - Add face detection
   - Implement smart cropping
   - Add manual adjustments
   - Enhance frame transitions

### 📚 Documentation Standards
1. Keep implementation details updated
2. Document all key decisions
3. Maintain error handling guides
4. Update performance notes

# Lessons Learned

## Viewport Management & Content Overflow (2025-04-11)

### 🎯 Problem Solved
Content overflow and improper sizing were causing issues on different screen sizes and during orientation changes. UI elements would sometimes position incorrectly or become inaccessible.

### 💡 Solution Implemented

#### 1. Viewport Detection
```typescript
// Accurate viewport dimension detection
const getViewportDimensions = () => ({
  width: Math.min(window.innerWidth, document.documentElement.clientWidth),
  height: Math.min(window.innerHeight, document.documentElement.clientHeight)
});
```

#### 2. Container Sizing Strategy
```typescript
const calculateContainerDimensions = (
  frameWidth: number,
  frameHeight: number,
  viewportWidth: number,
  viewportHeight: number
) => {
  // Safe area calculations
  const safeViewportHeight = viewportHeight * 0.9;
  const safeViewportWidth = viewportWidth * 0.95;

  // Aspect ratio preservation
  const frameRatio = frameWidth / frameHeight;
  const viewportRatio = safeViewportWidth / safeViewportHeight;

  // Optimal dimension calculation
  if (frameRatio > viewportRatio) {
    width = safeViewportWidth;
    height = safeViewportWidth / frameRatio;
  } else {
    height = safeViewportHeight;
    width = safeViewportHeight * frameRatio;
  }
};
```

### 📝 Key Learnings

1. **Viewport Handling**
   - Always use safe area calculations
   - Consider UI element spacing
   - Handle orientation changes explicitly

2. **Container Management**
   - Implement smooth transitions
   - Use relative units where appropriate
   - Center content properly

3. **Event Handling**
   - Debounce resize events
   - Clean up event listeners
   - Handle orientation changes separately

### 🚫 Pitfalls to Avoid

1. **Common Mistakes**
   - Using window dimensions directly
   - Ignoring safe areas
   - Missing cleanup in useEffect
   - Hardcoding dimensions

2. **Browser Quirks**
   - Mobile Safari viewport issues
   - Android keyboard affecting height
   - Different orientation APIs

### 🎓 Best Practices

1. **Safe Area Handling**
   ```typescript
   // Always use safe dimensions
   const safeHeight = viewportHeight * 0.9;
   const safeWidth = viewportWidth * 0.95;
   ```

2. **Event Management**
   ```typescript
   useEffect(() => {
     const updateDimensions = () => {
       // Update logic
     };

     window.addEventListener('resize', updateDimensions);
     window.addEventListener('orientationchange', updateDimensions);

     return () => {
       window.removeEventListener('resize', updateDimensions);
       window.removeEventListener('orientationchange', updateDimensions);
     };
   }, [dependencies]);
   ```

3. **Container Styling**
   ```typescript
   const containerStyle = {
     width: `${dimensions.width}px`,
     height: `${dimensions.height}px`,
     margin: '0 auto',
     overflow: 'hidden',
     transition: 'width 0.3s ease-out, height 0.3s ease-out'
   };
   ```

### 🔄 Future Improvements

1. **Feature Enhancements**
   - Add resize observer for container changes
   - Implement progressive container scaling
   - Add custom safe area calculations

2. **Performance Optimizations**
   - Debounce dimension calculations
   - Cache computed dimensions
   - Use ResizeObserver where supported

### 📚 Documentation Standards
- Document viewport calculations
- Include browser-specific notes
- Keep dimension formulas updated
- Document event handling patterns

## Camera Aspect Ratio & Quality Enhancement (2025-04-11)

### 🎯 Problem Solved
We encountered issues with photo capture quality and aspect ratio preservation when implementing different frame types. Photos were being stretched or distorted to fit frames, resulting in poor quality output.

### 💡 Solution Implemented

#### 1. Technical Approach
```typescript
// Core optimization function
export function optimizeCanvas(
  video: HTMLVideoElement,
  options: {
    frameWidth?: number;
    frameHeight?: number;
    quality?: number;
  }
): { canvas: HTMLCanvasElement } {
  // Get intrinsic dimensions
  const { width: videoWidth, height: videoHeight } = 
    getVideoIntrinsicDimensions(video);
    
  // Calculate crop dimensions
  const cropDims = getCropDimensions(
    videoWidth,
    videoHeight,
    options.frameWidth,
    options.frameHeight
  );
  
  // Draw with proper cropping
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  ctx.drawImage(
    video,
    cropDims.offsetX,
    cropDims.offsetY,
    cropDims.width,
    cropDims.height,
    0,
    0,
    options.frameWidth,
    options.frameHeight
  );
  
  return { canvas };
}
```

#### 2. Key Components
- CameraQualityService for centralized quality control
- Aspect ratio preservation utilities
- Smart cropping system
- Frame-aware canvas optimization

#### 3. Quality Assurance
- Verified output quality across devices
- Tested with multiple frame types
- Validated aspect ratio preservation
- Confirmed high-quality rendering

### 📝 Key Learnings

1. **Camera Handling**
   - Always use intrinsic video dimensions
   - Handle camera initialization properly
   - Clean up resources effectively

2. **Image Processing**
   - Maintain aspect ratio during processing
   - Use appropriate quality settings
   - Implement proper error handling

3. **Performance Considerations**
   - Optimize canvas operations
   - Handle memory efficiently
   - Clean up unused resources

### 🚫 Pitfalls to Avoid

1. **Common Mistakes**
   - Using element dimensions instead of intrinsic
   - Direct canvas manipulation without quality settings
   - Ignoring aspect ratio in calculations

2. **Browser Quirks**
   - Handle vendor-specific implementations
   - Account for different default behaviors
   - Test across multiple browsers

### 🎓 Best Practices

1. **Camera Setup**
   ```typescript
   const stream = await navigator.mediaDevices.getUserMedia({
     video: {
       facingMode: 'user',
       width: { ideal: 1920 },
       height: { ideal: 1080 }
     }
   });
   ```

2. **Quality Settings**
   ```typescript
   // Always set quality options
   ctx.imageSmoothingEnabled = true;
   ctx.imageSmoothingQuality = 'high';
   ```

3. **Resource Management**
   ```typescript
   // Clean up properly
   return () => {
     if (videoRef.current?.srcObject) {
       const stream = videoRef.current.srcObject as MediaStream;
       stream.getTracks().forEach(track => track.stop());
     }
   };
   ```

### 🔄 Future Improvements

1. **Features to Consider**
   - Manual crop adjustment
   - Zoom functionality
   - Face detection for smart cropping
   - Progressive image loading

2. **Performance Optimizations**
   - WebAssembly implementation
   - Worker thread processing
   - Caching mechanisms

### 📚 Documentation Standards
- Maintain clear technical documentation
- Include code examples
- Document edge cases
- Keep implementation notes updated
