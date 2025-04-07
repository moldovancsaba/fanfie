# Fanfie - Lessons Learned

This document captures challenges, solutions, and insights gained during the development of the Fanfie application.

## Camera Implementation

### 2025-04-06: Success with Simplified Camera Approach

**Issue:** Initial camera implementation was overly complex, trying to handle too many features at once leading to permission issues and unclear user flow.

**Root Cause:**
- Attempting to implement multiple features simultaneously (permission handling, camera switching, capture, preview)
- Overcomplicated state management obscured the core functionality issues
- Error handling was spread across too many conditional branches

**Solution:**
- Completely simplified the component to focus only on core functionality
- Created a minimal implementation (< 90 lines) focused solely on:
  1. Requesting camera permission explicitly
  2. Displaying the video feed when permission granted
  3. Showing clear error messages when permission denied
- Used a simple three-state approach: 'requesting', 'granted', 'denied'
- Added proper stream cleanup in useEffect return function

**Key Learnings:**
- Always implement the simplest possible solution first
- Solve one problem completely before moving to the next
- Camera permission must be the first priority - nothing works without it
- Manual testing between each implementation step is essential
- Clear, simple states lead to more predictable behavior

### 2025-04-06: Camera Permission Handling Challenges

**Issue:** Initial camera implementation showed "Requesting camera permission..." even after permissions were granted.

**Root Cause:** 
- The permission state wasn't properly updating after permission was granted
- The isInitialized flag prevented re-requests
- Error handling was too simplistic

**Solution:**
- Implemented a more robust permission state management with detailed states ('idle', 'requesting', 'granted', 'denied', 'error')
- Added proper cleanup of MediaStream tracks
- Used more specific error handling based on DOMException types
- Added retry mechanism for failed permissions

**Key Learnings:**
- MediaDevices API requires careful state management and error handling
- Different browsers and devices may have different permission behaviors
- Always provide users with clear feedback about permission status
- Important to clean up media streams on component unmount

### 2025-04-06: Canvas-Based Photo Capture

**Issue:** Needed to implement photo capture from video stream.

**Solution:**
- Used a hidden canvas element to capture frames from video
- Applied mirror effect for front-facing camera
- Converted canvas content to base64 data URL for preview and storage

**Best Practice:**
- Set canvas dimensions to match video dimensions
- Consider image quality and size trade-offs
- Provide immediate visual feedback after capture

## Environment and Dependencies

### 2025-04-06: Next.js 14 and Tailwind CSS Compatibility

**Issue:** When setting up Tailwind CSS with Next.js 14, encountered configuration errors with PostCSS plugins.

**Root Cause:** Tailwind CSS configuration needs specific setup with PostCSS for Next.js 14.

**Solution:** 
- Updated postcss.config.js to use proper format with string keys instead of require()
- Created proper next.config.js without experimental flags
- Ensured all peer dependencies were correctly installed

**Prevention:**
- Always check compatibility between major package versions
- Follow official documentation for integrations
- Test configuration changes immediately

### 2025-04-06: React Version Compatibility with Next.js

**Issue:** Initially attempted to use React 19.0.0 with Next.js 14.0.0, which led to compatibility issues.

**Root Cause:** Next.js 14.0.0 doesn't fully support React 19.0.0.

**Solution:**
- Downgraded to React 18.2.0 to ensure compatibility with Next.js 14.0.0
- Updated all related dependencies (react-dom) to match

**Prevention:**
- Check the peer dependency requirements in package.json
- Follow the Next.js documentation for supported React versions
- Consider using the create-next-app tool for initial setup

## Browser and Device Compatibility

### Camera Access

**Note:** Camera access in web browsers requires:
- HTTPS in production or localhost in development
- Explicit user permission
- Handling of permission denial gracefully

**Specific Browser Issues:**
- Safari requires user interaction before camera access (cannot auto-request on page load)
- Mobile browsers may have different permission UIs
- Some browsers require permissions to be requested each session
- Desktop browsers often have persistent permission settings

**Error Types to Handle:**
- NotAllowedError: User denied permission
- NotFoundError: No camera available
- NotReadableError: Camera in use by another application
- SecurityError: Insecure context (not HTTPS)

## Testing Best Practices for Camera Components

### 2025-04-06: Manual Camera Testing Protocol

**Issue:** Automated testing of camera functionality is challenging due to browser security restrictions.

**Solution:** Developed a manual testing protocol for camera components:

1. **Permission Flow Testing:**
   - Test first load (should show permission request)
   - Test permission denial (should show clear error)
   - Test permission grant (should show camera feed)
   - Test permission persistence across page reloads

2. **Browser Compatibility:**
   - Test on Chrome, Firefox, Safari
   - Test on mobile browsers (iOS Safari, Android Chrome)
   - Test with browser permissions previously set to both allow/deny

3. **Error Recovery:**
   - Test camera access when no camera is available
   - Test camera access when camera is in use by another application
   - Test "Try Again" functionality after permission denial

**Best Practice:**
- Always run full permission flow test after any camera-related code changes
- Document browser-specific behaviors in this file
- Always develop and test using HTTPS (localhost or production domain)
- Never assume permissions are granted, even after a successful test

## Coding Patterns

### Client Components in Next.js 14

**Issue:** Initial confusion about when to use 'use client' directive.

**Solution:**
- Added 'use client' directive to components that:
  - Use browser APIs (like navigator.mediaDevices)
  - Use React hooks (useState, useEffect)
  - Handle user interactions

**Best Practice:** Mark only components that need client-side functionality as client components, keeping as much as possible server components for better performance.

### React useCallback for Performance

**Insight:** When dealing with camera initialization and cleanup, useCallback is essential to prevent infinite re-renders and ensure proper dependency tracking.

**Implementation:**
- Used useCallback for camera initialization and stream cleanup
- Carefully tracked dependencies to avoid stale closures
- Ensured proper cleanup on component unmount

---

*This document will be continuously updated as new challenges are encountered and solutions are implemented.*


### Camera Implementation (2025-04-07)
Always validate:
- Actual file paths vs TS config
- Export default patterns
- vercel.json config syntax
