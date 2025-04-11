# Video Feed Overlay Implementation Guide

## Overview
This guide explains how to implement overlays (graphics, frames, UI elements) on top of a live video feed while maintaining proper alignment and layering.

## Core Concepts

### 1. Container Structure
```jsx
<div className="fixed inset-0 bg-black flex items-center justify-center">
  <div className="relative" style={{ width, height }}>
    {/* Layers go here */}
  </div>
</div>
```
- Outer container uses flex for centering
- Inner container is relative for absolute positioning of layers
- Dimensions calculated based on video aspect ratio

### 2. Layer Positioning
Each layer uses absolute positioning within the relative container:
```jsx
{/* Base Video Layer */}
<video
  style={{
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  }}
/>

{/* Overlay Layer */}
<img
  style={{
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    pointerEvents: 'none',
    zIndex: 10
  }}
/>
```

### 3. Dimension Calculation
```typescript
const handleLoadedMetadata = () => {
  const videoAspectRatio = video.videoWidth / video.videoHeight;
  const containerAspectRatio = containerRect.width / containerRect.height;

  let width, height;
  if (videoAspectRatio > containerAspectRatio) {
    width = containerRect.width;
    height = containerRect.width / videoAspectRatio;
  } else {
    height = containerRect.height;
    width = containerRect.height * videoAspectRatio;
  }

  setDimensions({ width, height });
};
```

## Implementation Steps

1. **Create Container Structure**
   - Fixed outer container
   - Centered using flex
   - Relative inner container for layers

2. **Setup Video Layer**
   - Absolute positioning
   - Fill container
   - objectFit: 'cover' for proper scaling

3. **Add Overlay Layer**
   - Absolute positioning
   - Same dimensions as video
   - Higher z-index
   - Prevent pointer events

4. **Calculate Dimensions**
   - Get video aspect ratio
   - Compare with container
   - Calculate optimal dimensions
   - Update container size

## Key Properties

### Container
- `position: relative`
- Calculated width/height
- Centers content

### Video Layer
- `position: absolute`
- `inset: 0`
- `width/height: 100%`
- `objectFit: cover`

### Overlay Layer
- `position: absolute`
- `inset: 0`
- `width/height: 100%`
- `objectFit: contain`
- `pointerEvents: none`
- `zIndex: > 1`

## Common Issues & Solutions

1. **Overlay Not Visible**
   - Check z-index values
   - Verify absolute positioning
   - Confirm dimensions match

2. **Misaligned Overlay**
   - Verify container dimensions
   - Check aspect ratio calculations
   - Adjust objectFit property

3. **Scaling Issues**
   - Use proper objectFit values
   - Calculate dimensions correctly
   - Handle window resizing

## Best Practices

1. **Performance**
   - Use transform for animations
   - Minimize dimension calculations
   - Handle cleanup properly

2. **Responsive Design**
   - Calculate dimensions on resize
   - Use aspect ratio preservation
   - Handle orientation changes

3. **Resource Management**
   - Clean up video streams
   - Handle unmounting properly
   - Manage memory usage

## Adding New Overlay Types

To add a new overlay type:

1. **Create Overlay Element**
   ```jsx
   <div
     style={{
       position: 'absolute',
       top: 0,
       left: 0,
       width: '100%',
       height: '100%',
       zIndex: [appropriate-level],
       pointerEvents: 'none'
     }}
   >
     {/* Overlay content */}
   </div>
   ```

2. **Set Z-Index Hierarchy**
   - Base video: z-index 1
   - Static overlays: z-index 10-50
   - Interactive elements: z-index 100+
   - Controls: z-index 1000+

3. **Handle Interactions**
   - Enable pointerEvents if needed
   - Add event handlers
   - Manage state appropriately

## Examples

### Adding Text Overlay
```jsx
<div style={{
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  zIndex: 20,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}}>
  <h1 className="text-white text-4xl">Overlay Text</h1>
</div>
```

### Adding Interactive UI
```jsx
<div style={{
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  zIndex: 100,
  pointerEvents: 'auto'
}}>
  <button onClick={handleAction}>
    Interactive Element
  </button>
</div>
```

