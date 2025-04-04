# Development Lessons & Solutions

## 📌 Applies To
All operations inside the following path:  
`/Users/moldovan/Projects/fanfie/`

Always use the following documents:
- `README.MD`
- `01_roadmap.MD`
- `02_development.MD`
- `03_lessonslearned.MD`
- `04_releasenotes.MD`
- `05_50FirstDates.MD`
- `06_technology.MD`
- `07_Definition_of_Done_AI_Warp.MD`
- `08_One_Function_At_A_Time_Rule.MD`
- `09_Autopilot_Consent_Project_Access.MD`


## 2025-04-04: Camera Implementation

### Browser Compatibility
- Use `playsInline` attribute for iOS Safari video compatibility
- Set `facingMode: 'user'` for consistent front camera selection
- Handle permissions explicitly for better user experience

### MediaStream Cleanup
- Importance: Always stop camera tracks when component unmounts
- Solution: Implemented cleanup in useEffect return function
- Prevention: Create reusable hooks for media stream management

## 2025-04-04: Initial Setup

### Vercel Deployment
- Issue: Initial deployment resulted in 401 unauthorized
- Solution: Removed and relinked project with proper Git integration
- Prevention: Always use `vercel link` before first deployment

### Dependencies
- Next.js 14.0.0 requires React 18.2.0 for compatibility
- Tailwind CSS requires proper content configuration in tailwind.config.js
- SSH key setup required for secure Git deployment

## Web Share API Implementation

### Challenge: Cross-Browser Compatibility
- **Issue**: Web Share API availability varies significantly across browsers and platforms.
- **Solution**: 
  ```typescript
  // Use useEffect to check API availability after mount
  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && !!navigator.share);
  }, []);
  ```
- **Prevention**: 
  1. Always check for API availability at runtime
  2. Provide fallback mechanisms for unsupported browsers
  3. Use feature detection instead of browser detection

### Challenge: File Sharing Limitations
- **Issue**: File sharing through Web Share API is not universally supported
- **Solution**:
  ```typescript
  const handleShare = async () => {
    try {
      if (navigator.share && navigator.canShare) {
        const shareData = { files: [file] };
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          return;
        }
      }
      // Fallback to traditional sharing methods
      handleFallbackShare();
    } catch (error) {
      handleShareError(error);
    }
  };
  ```
- **Learning**: Always provide multiple sharing options

### Challenge: SSR Compatibility
- **Issue**: Web Share API checks causing hydration mismatches in Next.js
- **Solution**: 
  1. Move API checks to useEffect hooks
  2. Use conditional rendering based on state rather than direct API checks
  3. Initialize state conservatively (assume features not available until proven otherwise)

### Challenge: Toast Notifications
- **Issue**: Toast notifications not appearing in the correct layer/context
- **Solution**:
  1. Add Toaster component to root layout
  2. Use consistent toast durations and positions
  3. Handle all async operations with appropriate feedback

### Challenge: Image Format Conversion
- **Issue**: Different platforms prefer different image formats
- **Solution**:
  ```typescript
  const handleDownload = async (format: 'png' | 'jpeg') => {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `fanfie-${Date.now()}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };
  ```

### Challenge: Social Media Integration
- **Issue**: Direct social media sharing requires complex API integrations
- **Solution**: Use Web Intent URLs for basic sharing
  ```typescript
  const shareToTwitter = (text: string, url: string) => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank');
  };
  ```
- **Learning**: Start with simple integrations and enhance based on user needs

### Best Practices Learned
1. **Progressive Enhancement**
   - Start with basic functionality that works everywhere
   - Add advanced features when available
   - Always provide fallbacks

2. **Error Handling**
   - Catch and handle all network operations
   - Provide user-friendly error messages
   - Log errors for debugging
   - Keep users informed of operation status

3. **Performance Considerations**
   - Load social media icons asynchronously
   - Optimize image formats for sharing
   - Use efficient state management
   - Implement loading states for feedback

4. **Security**
   - Only share files over HTTPS
   - Validate file types before sharing
   - Sanitize URLs for social media sharing
   - Handle user permissions appropriately

5. **Testing Strategy**
   - Test across different browsers
   - Test with various file types and sizes
   - Verify fallback mechanisms
   - Check error handling paths

# Lessons Learned

This document captures key technical learnings, challenges encountered, and solutions implemented during the development of the camera and graphics editor application. Use this knowledge to inform future development decisions and avoid repeating past issues.

## Camera Access and Permission Challenges

### Challenge: Inconsistent Permission Behaviors
- **Issue**: Different browsers handle camera permission requests differently, particularly on mobile devices.
- **Solution**: Implemented a unified permission request flow with clear user guidance before accessing getUserMedia API.
- **Example**:
  ```typescript
  // Pre-request check with user guidance
  const requestCameraAccess = async () => {
    setIsRequesting(true);
    try {
      // Clear instructions before requesting
      await displayPermissionInstructions();
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      return stream;
    } catch (error) {
      handlePermissionError(error);
      return null;
    }
  };
  ```

### Challenge: Permission Persistence
- **Issue**: Permission states can persist between sessions but are not easily detectable beforehand.
- **Solution**: Used the Permission API where available and implemented fallbacks for unsupported browsers.
- **Learning**: Always check `navigator.permissions` availability before using it.

### Challenge: iOS Safari Constraints
- **Issue**: iOS Safari has specific requirements for camera initialization.
- **Solution**: Added `playsInline={true}` to video elements and initialized stream only after user interaction.

## Canvas and Fabric.js Implementation Learnings

### Challenge: Image Loading and Scaling
- **Issue**: Captured images needed proper scaling on the canvas to maintain aspect ratio.
- **Solution**: Implemented a dynamic scaling function that preserves aspect ratio:
  ```typescript
  const setBackgroundImage = (canvas: fabric.Canvas, imageUrl: string) => {
    fabric.Image.fromURL(imageUrl, (img) => {
      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();
      
      // Calculate scale to fit while maintaining aspect ratio
      const scale = Math.min(
        canvasWidth / img.width!,
        canvasHeight / img.height!
      );
      
      img.scale(scale);
      canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
        originX: 'center',
        originY: 'center',
        left: canvasWidth / 2,
        top: canvasHeight / 2,
      });
    });
  };
  ```

### Challenge: Touch vs Mouse Events
- **Issue**: Fabric.js behavior differences between touch and mouse events.
- **Solution**: Explicitly enabled touch events and added touch event handling:
  ```typescript
  useEffect(() => {
    if (canvas) {
      canvas.isDrawingMode = false;
      canvas.selection = true;
      canvas.enablePointerEvents = true;
      
      // Critical for mobile touch support
      canvas.upperCanvasEl.style.touchAction = 'none';
    }
  }, [canvas]);
  ```

### Challenge: Text Editing Controls
- **Issue**: Managing text editing state and controls was complex.
- **Solution**: Implemented a dedicated text control panel that activates only when text objects are selected.
- **Learning**: Keep UI state tightly coupled with canvas selection state for intuitive editing.

## State Management Considerations

### Challenge: Component Communication
- **Issue**: Needed a clean way for the three main components (Camera, Editor, Share) to communicate.
- **Solution**: Used React state lifting for main application flow and callbacks for component-specific actions.
- **Learning**: Avoid prop drilling by using a simple state management pattern.

### Challenge: Canvas History Management
- **Issue**: Users needed undo/redo functionality in the editor.
- **Solution**: Implemented a simple history stack using custom hooks:
  ```typescript
  const useCanvasHistory = (canvas: fabric.Canvas | null) => {
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    
    const saveToHistory = useCallback(() => {
      if (!canvas) return;
      
      const json = JSON.stringify(canvas.toJSON());
      setHistory(prev => [...prev.slice(0, historyIndex + 1), json]);
      setHistoryIndex(prev => prev + 1);
    }, [canvas, historyIndex]);
    
    // Undo/redo implementation...
  };
  ```

### Challenge: Performance with Large State Updates
- **Issue**: Performance degraded when frequently updating state with large objects.
- **Solution**: Used the `useCallback` and `useMemo` hooks strategically to prevent unnecessary re-renders.
- **Learning**: Always memoize heavy computation functions and event handlers in canvas operations.

## Browser Compatibility Issues and Solutions

### Challenge: getUserMedia API Differences
- **Issue**: Different browsers implement getUserMedia with varying features and constraints.
- **Solution**: Created adapter functions with browser detection:
  ```typescript
  const getCameraStream = async (constraints: MediaStreamConstraints) => {
    // Safari on iOS requires a user gesture before accessing camera
    if (isIOS && !hasUserInteracted) {
      setNeedsUserInteraction(true);
      return null;
    }
    
    // Feature detection
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Camera API not supported in this browser');
    }
    
    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
      // Browser specific error handling
      handleBrowserSpecificErrors(error);
      throw error;
    }
  };
  ```

### Challenge: Canvas Rendering Differences
- **Issue**: Canvas rendering varied between browsers, especially for text and shadows.
- **Solution**: Implemented browser-specific styling adjustments and standardized font handling.
- **Learning**: Always test canvas rendering on Safari, Chrome, and Firefox during development.

### Challenge: Web Share API Support
- **Issue**: Web Share API not available in all browsers.
- **Solution**: Implemented feature detection with fallbacks to clipboard or direct download:
  ```typescript
  const shareImage = async (imageData: string) => {
    try {
      // Feature detection
      if (navigator.share) {
        // Convert base64 to blob for sharing
        const blob = await fetch(imageData).then(res => res.blob());
        const file = new File([blob], 'fanfie-image.png', { type: 'image/png' });
        
        await navigator.share({
          title: 'My Fanfie Image',
          files: [file],
        });
        return true;
      } else {
        // Fallback to clipboard or download
        handleSharingFallback(imageData);
        return false;
      }
    } catch (error) {
      console.error('Error sharing:', error);
      return false;
    }
  };
  ```

## Performance Optimizations Discovered

### Challenge: Camera Stream Resource Management
- **Issue**: Camera streams not properly closed caused memory leaks and battery drain.
- **Solution**: Implemented strict cleanup with React useEffect:
  ```typescript
  useEffect(() => {
    return () => {
      if (videoStreamRef.current) {
        const tracks = videoStreamRef.current.getTracks();
        tracks.forEach(track => track.stop());
        videoStreamRef.current = null;
      }
    };
  }, []);
  ```

### Challenge: Canvas Rendering Performance
- **Issue**: Complex canvas operations caused lag, especially on mobile devices.
- **Solution**: 
  1. Reduced canvas event listeners
  2. Implemented debounced rendering
  3. Used object caching for static elements
  ```typescript
  const optimizeCanvasObjects = (canvas: fabric.Canvas) => {
    canvas.getObjects().forEach(obj => {
      // Cache static objects
      if (!obj.isAnimating) {
        obj.objectCaching = true;
      }
      
      // Optimize text objects
      if (obj instanceof fabric.Text) {
        obj.set({
          strokeWidth: 0,
          shadow: null
        });
      }
    });
    canvas.renderAll();
  };
  ```

### Challenge: Image Compression
- **Issue**: Large image sizes slowed down processing and sharing.
- **Solution**: Added client-side image compression before canvas loading:
  ```typescript
  const compressImage = async (base64Image: string, quality = 0.7): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        // Target max dimensions while preserving aspect ratio
        const maxDimension = 1200;
        const ratio = Math.min(maxDimension / img.width, maxDimension / img.height);
        
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Convert to compressed JPEG
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = base64Image;
    });
  };
  ```

## Security Considerations for Camera Access

### Challenge: Secure Permissions
- **Issue**: Needed to ensure camera access is only granted when truly needed.
- **Solution**: 
  1. Only request camera permission after explicit user action
  2. Clear visual indicators when camera is active
  3. Implement strict HTTPS enforcement for production

### Challenge: User Privacy
- **Issue**: Users concerned about camera data privacy.
- **Solution**: Added clear privacy messaging and all processing done client-side:
  ```tsx
  const PrivacyNotice = () => (
    <div className="text-xs text-gray-600 mt-2 p-2 bg-gray-100 rounded">
      <p>
        <span className="font-bold">Privacy:</span> All photos are processed locally on your device. 
        No images are uploaded to any server unless you explicitly choose to share.
      </p>
    </div>
  );
  ```

### Challenge: Permission Transparency
- **Issue**: Users suspicious of permission requests without context.
- **Solution**: Clear, informative UI before permission requests explaining exactly why camera access is needed and how data will be used.

## Error Handling Patterns That Worked Well

### Challenge: Graceful Degradation
- **Issue**: Application needed to handle various failure modes elegantly.
- **Solution**: Implemented a cascading capability detection system:
  ```typescript
  const checkCapabilities = () => {
    const capabilities = {
      camera: !!navigator.mediaDevices?.getUserMedia,
      canvas: !!document.createElement('canvas').getContext('2d'),
      share: !!navigator.share,
      clipboard: !!navigator.clipboard,
    };
    
    // Determine app mode based on capabilities
    if (!capabilities.camera) {
      setAppMode('upload-only');
    } else if (!capabilities.canvas) {
      setAppMode('capture-only');
    } else {
      setAppMode('full-featured');
    }
    
    return capabilities;
  };
  ```

### Challenge: User-Friendly Error Messages
- **Issue**: Technical errors needed translation to user-friendly language.
- **Solution**: Created error mapping system:
  ```typescript
  const mapErrorToUserMessage = (error: unknown): string => {
    if (error instanceof DOMException) {
      switch (error.name) {
        case 'NotAllowedError':
          return 'Camera access was denied. Please check your browser permissions and try again.';
        case 'NotFoundError':
          return 'No camera detected. Please connect a camera or try a different device.';
        case 'NotReadableError':
          return 'Your camera is already in use by another application. Please close other apps and try again.';
        default:
          return `Camera error: ${error.message}`;
      }
    }
    
    return 'Something went wrong. Please try again later.';
  };
  ```

### Challenge: Recovery Strategies
- **Issue**: Needed ways to recover from errors without full application restart.
- **Solution**: Implemented retry mechanisms and alternative workflows:
  ```typescript
  const handleCameraError = async (error: unknown) => {
    const errorMessage = mapErrorToUserMessage(error);
    toast.error(errorMessage);
    
    // Offer fallback options
    setShowFallbackOptions(true);
    
    // If this was a temporary error, allow retry
    if (error instanceof DOMException && error.name !== 'NotAllowedError') {
      setCanRetry(true);
    }
  };
  ```

## Future Safeguards to Implement

### Challenge: Preventing Unintended Photo Sharing
- **Recommendation**: Implement a confirmation dialog before any sharing action with preview of content to be shared.
- **Implementation Plan**: Create a reusable confirmation component with image preview.

### Challenge: Data Loss Prevention
- **Recommendation**: Implement automatic saving of editor state to localStorage.
- **Example**:
  ```typescript
  // Save canvas state periodically
  useEffect(() => {
    if (!canvas) return;
    
    const saveInterval = setInterval(() => {
      const canvasJSON = JSON.stringify(canvas.toJSON());
      localStorage.setItem('fanfie_editor_autosave', canvasJSON);
    }, 5000); // Save every 5 seconds
    
    return () => clearInterval(saveInterval);
  }, [canvas]);
  
  // Recover from autosave on component mount
  useEffect(() => {
    if (!canvas) return;
    
    const savedCanvas = localStorage.getItem('fanfie_editor_autosave');
    if (savedCanvas) {
      try {
        canvas.loadFromJSON(savedCanvas, canvas.renderAll.bind(canvas));
        toast.success('Recovered your previous edit session');
      } catch (error) {
        console.error('Failed to restore canvas:', error);
      }
    }
  }, [canvas]);
  ```

### Challenge: Browser Compatibility Testing
- **Recommendation**: Implement automated browser compatibility testing with Playwright or similar tool.
- **Implementation Plan**: Create test suite that verifies core functionality across major browsers.

### Challenge: Performance Monitoring
- **Recommendation**: Add client-side performance monitoring for canvas operations.
- **Example**:
  ```typescript
  const measurePerformance = (operationName: string, operation: () => void) => {
    if (process.env.NODE_ENV === 'development') {
      console.time(`[Performance] ${operationName}`);
      operation();
      console.timeEnd(`[Performance] ${operationName}`);
    } else {
      operation();
    }
  };
  
  // Usage
  measurePerformance('Canvas Render', () => {
    canvas.renderAll();
  });
  ```

### Challenge: Accessibility Improvements
- **Recommendation**: Implement keyboard navigation and screen reader support for editor tools.
- **Implementation Plan**: 
  1. Add ARIA attributes to all interactive elements
  2. Ensure keyboard focus management for modal dialogs
  3. Add voice command capabilities for common actions

## Conclusion

The camera and graphics editor implementation revealed several important patterns and challenges that are valuable for future development. By addressing these issues proactively, we have created a more robust, performant, and user-friendly application. 

Key takeaways:
1. Always implement graceful degradation for features that depend on browser APIs
2. Focus on performance optimization early, especially for canvas operations
3. Prioritize clear user communication around permissions and privacy
4. Test across different devices and browsers throughout development
5. Implement proper resource cleanup to prevent memory leaks

These lessons will inform future development decisions and help maintain a high-quality application.

## Code Organization and Structure

### Issue: Duplicate Component Files
- **Problem**: Having duplicate component files in both `./app/components` and `./src/app/components` led to build errors and TypeScript warnings about unused variables.
- **Solution**: 
  1. Identify all duplicate files using `find . -name "ComponentName.tsx"`
  2. Compare versions and keep the most up-to-date one
  3. Remove duplicates and update import paths accordingly
- **Prevention**: 
  - Maintain a clear project structure with a single source of truth for components
  - Use absolute imports with path aliases to avoid confusion
  
### Issue: Fabric.js Integration with Next.js
- **Problem**: Direct imports of Fabric.js caused type errors and build issues in Next.js
- **Solution**:
  1. Use dynamic imports for Fabric.js
  2. Properly type Fabric.js objects and canvas
  3. Initialize Fabric.js asynchronously after import
- **Code Example**:
  ```typescript
  const initFabric = async () => {
    const fabricModule = await import('fabric').then(fab => fab.fabric);
    return fabricModule;
  };
  ```

### Issue: Image Component Best Practices
- **Problem**: Using HTML `<img>` tags in Next.js led to performance warnings
- **Solution**:
  1. Replace `<img>` with Next.js `Image` component
  2. Properly configure Image component with required props:
     - width/height or fill
     - sizes for responsive images
     - priority for above-the-fold images
     - quality for optimization
- **Example**:
  ```typescript
  <Image
    src={imageUrl}
    alt="Description"
    fill
    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 500px"
    priority
    quality={90}
    className="object-contain"
  />
  ```

## Build and Deployment

### Issue: Module Resolution
- **Problem**: Build fails with "Module not found" after reorganizing component files
- **Solution**:
  1. Update import paths to match new file structure
  2. Consider using path aliases (e.g., @components) to avoid relative path issues
  3. Verify tsconfig.json and build configuration align with project structure


## Image Editing and Canvas Handling

### Issue: Photos Not Appearing in Editor
We encountered an issue where captured photos weren't appearing in the editing view. This led to several important learnings:

1. **Fabric.js Initialization**
   - Always ensure proper import of Fabric.js (use `import { fabric } from 'fabric'` instead of default import)
   - Initialize canvas with explicit dimensions before loading images
   - Handle canvas cleanup properly on component unmount

2. **Image Validation**
   - Validate image dimensions before processing
   - Check image data format and integrity
   - Test image loading before passing to editor
   - Add proper error handling and user feedback

3. **Component State Management**
   - Track component mount state to prevent memory leaks
   - Handle async operations safely with mount checks
   - Properly clean up resources (canvas, image data)

4. **Cross-Origin Considerations**
   - Add crossOrigin handling for image loading
   - Use proper image data formats (JPEG/PNG)
   - Handle image loading errors gracefully

### Future Safeguards
- Always test image capture and editing flow thoroughly
- Implement comprehensive error handling
- Add debug logging for image processing steps
- Consider implementing image format and size validation early in the process

# Lessons Learned

## Google Analytics Implementation (2025-03-30)

### Key Decisions and Best Practices

1. **Script Loading Strategy**
   - Used Next.js Script component with 'afterInteractive' strategy
   - This ensures analytics doesn't block initial page load while still loading early enough for accurate tracking
   - Scripts are properly managed by Next.js without need for manual cleanup

2. **Component Architecture**
   - Created a dedicated Analytics component for better separation of concerns
   - Implemented at root layout level for consistent site-wide tracking
   - Used 'use client' directive to ensure proper client-side execution

3. **Testing Approach**
   - Implemented unit tests to verify:
     - Component rendering
     - Correct tracking ID integration
     - Proper script tag presence
   - Focus on structural testing as runtime behavior is handled by Google's script

4. **Test Mocking Strategy**
   - Created custom mock for Next.js Script component to enable proper testing
   - Mock implementation preserves key props and behavior
   - Ensures tests can verify:
     - Script loading configuration
     - Google Analytics ID integration
     - Initialization code presence
   - Benefits:
     - More reliable tests without actual script loading
     - Faster test execution
     - Consistent behavior across test environments

This approach allows for comprehensive testing of the Analytics implementation without depending on the actual Next.js Script component or Google Analytics loading.

### Considerations for Future Updates

1. When adding custom event tracking:
   - Create type-safe event definitions
   - Document all custom events
   - Consider implementing a tracking middleware

2. Privacy and Performance:
   - Monitor analytics impact on Core Web Vitals
   - Consider implementing cookie consent if expanding to EU users
   - Review data collection practices periodically


## Recent Fabric.js Integration Challenges (2025-03-31)

### Issue: Complex Fabric.js Type System and Next.js Integration
- **Problem**: Multiple type-related errors when integrating Fabric.js with Next.js and TypeScript:
    1. Incorrect typing of Image.fromURL parameters
    2. Issues with LoadImageOptions interface
    3. Callback pattern type mismatches
    4. Cross-origin type assertions

- **Root Cause Analysis**:
    1. Fabric.js's TypeScript definitions don't align perfectly with its runtime behavior
    2. Next.js strict type checking reveals edge cases in Fabric.js types
    3. Multiple valid API patterns causing confusion (callback vs options object)

- **Attempted Solutions**:
    1. Using LoadImageOptions interface (failed due to type mismatch)
    2. Direct callback pattern with type assertions (partially successful)
    3. Options object with onload callback (failed due to interface mismatch)
    4. Separate callback and options parameters (final working solution)

### Alternative Approaches Considered

1. **Native Canvas API**
- **Pros**:
    - Better TypeScript support
    - Lighter weight
    - Direct browser API access
- **Cons**:
    - More complex implementation for interactive features
    - Need to build own object model
    - More code to maintain

2. **Konva.js**
- **Pros**:
    - Better TypeScript support
    - Modern architecture
    - Active development
- **Cons**:
    - Learning curve for team
    - Migration effort required
    - Potential new integration challenges

### Recommended Path Forward

After careful consideration, we recommend a two-phase approach:

1. **Short Term (Current Sprint)**:
    - Continue with Fabric.js using the working callback pattern
    - Add comprehensive error handling
    - Document all type workarounds
    - Create utility functions to encapsulate Fabric.js complexities

2. **Medium Term (Next 2-3 Sprints)**:
    - Evaluate Konva.js as a potential replacement
    - Create proof of concept with core features
    - If successful, plan gradual migration
    - If not, optimize current Fabric.js implementation

### Implementation Guide

Current working pattern for Fabric.js image loading:
```typescript
const loadImage = async (canvas: FabricCanvas, url: string): Promise<void> => {
    const { fabric } = await import('fabric');
    
    return new Promise((resolve, reject) => {
        fabric.Image.fromURL(
            url,
            (img) => {
                if (!img) {
                    reject(new Error('Failed to load image'));
                    return;
                }
                // Handle successful load
                canvas.add(img);
                resolve();
            },
            {
                crossOrigin: 'anonymous'
            }
        );
    });
};
```

### Key Learnings

1. **Type Safety**:
    - Always verify Fabric.js types with runtime behavior
    - Create custom type definitions when needed
    - Use type guards for better error handling

2. **Error Handling**:
    - Implement comprehensive error handling
    - Add type checking for all parameters
    - Validate canvas state before operations

3. **Performance**:
    - Monitor memory usage with large images
    - Implement cleanup routines
    - Consider image optimization before canvas operations

4. **Testing**:
    - Add specific tests for Fabric.js operations
    - Test error scenarios
    - Verify memory cleanup
    - Test cross-origin scenarios

### Future Safeguards

1. Create a Canvas Service layer to:
    - Abstract Fabric.js complexity
    - Provide consistent error handling
    - Enable easier library switching if needed
    - Maintain type safety
    - Handle cleanup and resource management

2. Implement monitoring:
    - Track canvas operation performance
    - Monitor memory usage
    - Log error patterns
    - Measure user interaction success rates

3. Documentation requirements:
    - Document all type workarounds
    - Maintain troubleshooting guide
    - Keep updated library compatibility notes
    - Record performance benchmarks
