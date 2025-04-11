# Frame Switching Implementation Guide

## Overview
This document describes the implementation of dynamic frame switching in the camera application, allowing users to cycle through different frame designs while maintaining proper aspect ratios and image quality.

## Technical Implementation

### 1. Frame Configuration
```typescript
const FRAMES = [
  'https://i.ibb.co/mV2jdW46/SEYU-FRAME.png',  // Original frame
  'https://i.ibb.co/HfXZwMTr/SEYU-FRAME-1080x1920.png',
  'https://i.ibb.co/Zzb3Yrxq/SEYU-FRAME-1920x1080.png',
  'https://i.ibb.co/MDzTJdB8/SEYU-FRAME-1080x1080.png'
];
```

### 2. State Management
```typescript
const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
const [currentFrameUrl, setCurrentFrameUrl] = useState(FRAMES[0]);
const [isFrameLoading, setIsFrameLoading] = useState(false);
```

### 3. Frame Loading
```typescript
useEffect(() => {
  let img = new Image();
  img.crossOrigin = 'anonymous';  // Important for canvas operations
  setIsFrameLoading(true);

  img.onload = () => {
    setIsFrameLoading(false);
  };

  img.onerror = (error) => {
    setIsFrameLoading(false);
    onError(new Error(`Failed to load frame: ${currentFrameUrl}`));
  };

  img.src = currentFrameUrl;
}, [currentFrameUrl, onError]);
```

### 4. Frame Switching
```typescript
const handleChangeFrame = useCallback(() => {
  const nextIndex = (currentFrameIndex + 1) % FRAMES.length;
  setCurrentFrameIndex(nextIndex);
  setCurrentFrameUrl(FRAMES[nextIndex]);
}, [currentFrameIndex]);
```

### 5. Frame Rendering
```typescript
<div style={{
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  zIndex: 10,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}}>
  <img
    src={currentFrameUrl}
    alt="Frame"
    className="frame-overlay"
    crossOrigin="anonymous"
    style={{
      width: '100%',
      height: '100%',
      objectFit: 'contain'
    }}
  />
</div>
```

## Key Considerations

### 1. Image Hosting
- Use ImgBB for reliable image hosting
- Ensure CORS is enabled
- Use complete, unmodified URLs
- Keep backup URLs in case of hosting issues

### 2. Performance
- Preload images when possible
- Show loading state during transitions
- Handle errors gracefully
- Clean up resources properly

### 3. Aspect Ratios
- Maintain frame aspect ratios
- Use `object-fit: contain` for proper scaling
- Center frames within container
- Handle different screen sizes

### 4. User Experience
- Show loading state in button
- Disable interactions during loading
- Provide visual feedback
- Maintain smooth transitions

## Error Handling

### 1. Frame Loading Errors
```typescript
img.onerror = (error) => {
  console.error('Frame load error:', error);
  setIsFrameLoading(false);
  onError(new Error(`Failed to load frame: ${currentFrameUrl}`));
};
```

### 2. Canvas Operations
```typescript
try {
  const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
  onCapture(dataUrl);
} catch (error) {
  console.error('Canvas capture error:', error);
  onError(new Error('Failed to capture photo'));
}
```

## Layer Management

### 1. Z-Index Hierarchy
- Video layer: base layer
- Frame overlay: z-index 10
- Controls: z-index 2000

### 2. Positioning
```css
position: absolute;
top: 0;
left: 0;
width: 100%;
height: 100%;
```

## Adding New Frames

1. Upload frame to ImgBB
2. Get direct image URL
3. Add to FRAMES array
4. Test aspect ratio handling
5. Verify CORS headers

## Testing Checklist

1. Frame Loading
   - [ ] All frames load correctly
   - [ ] Loading states show properly
   - [ ] Error handling works
   - [ ] CORS is properly handled

2. Frame Switching
   - [ ] Frames switch correctly
   - [ ] Aspect ratios maintained
   - [ ] No visual glitches
   - [ ] Smooth transitions

3. Capture Function
   - [ ] Frames included in capture
   - [ ] Quality maintained
   - [ ] Proper positioning
   - [ ] Error handling works

4. Performance
   - [ ] Smooth frame switching
   - [ ] No memory leaks
   - [ ] Resource cleanup
   - [ ] Loading indicators

## Future Improvements

1. Frame Categories
2. Favorite Frames
3. Custom Frame Upload
4. Frame Search
5. Frame Preview
6. Frame Effects
7. Frame Animation

