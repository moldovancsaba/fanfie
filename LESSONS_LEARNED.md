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

