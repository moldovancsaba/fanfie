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

