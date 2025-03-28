# Fanfie

A web application for taking and managing photos.

## Development

### Prerequisites
- Node.js 18+ and npm
- Git
- Modern web browser with camera support

### Local Development Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/moldovancsaba/fanfie.git
   cd fanfie
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Development Guidelines
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Ensure responsive design
- Test on multiple browsers

## Deployment

The application is deployed on Vercel.

### Deployment Process
1. Push changes to the `photo-upload` branch
2. Vercel automatically deploys from this branch
3. Visit [https://fanfie.vercel.app](https://fanfie.vercel.app) to see the live version

### Environment Variables
No environment variables are required for the current version.

## User Manual

### Current Features
- Basic web application structure
- Responsive design
- Camera access and control (Start/Stop functionality)
- Enhanced camera view that adapts to orientation changes
- Optimized interface with a clean, minimalist design
- Restructured UI components for better responsive behavior
- Photo capture functionality using modern ImageCapture API with fallbacks
- Cross-browser compatible photo capture mechanisms
- Built-in error handling and fallback mechanisms for unsupported browsers
### Camera Usage Instructions
1. When you first open the application, you'll see a 'Start Camera' button
2. Click 'Start Camera' to begin - your browser will ask for camera permissions
3. Grant camera permissions when prompted
4. The camera feed will appear in the video container
5. Click the 'Take Photo' button when you're ready to capture an image
6. The application will automatically:
   - Capture the current frame from your camera
   - Apply the decorative frame overlay
   - Display the final image in a preview modal
7. Click 'Stop Camera' to end the camera feed when you're done
8. The layout automatically adjusts based on your device orientation (portrait or landscape)
### Browser Compatibility
- Works best on modern browsers (Chrome, Firefox, Safari, Edge)
- Requires HTTPS for camera access
- On mobile devices, defaults to the back camera
- Requires camera permissions to be granted

### Troubleshooting

#### Camera Access Issues
- **Permission Denied**: Ensure you've allowed camera access in your browser settings
- **Camera Not Found**: Check that your device has a working camera
- **Black Screen**: Try refreshing the page or restarting your browser
- **HTTPS Required**: Camera access only works on secure connections (HTTPS)

#### Photo Capture Issues
- **Failed to Capture**: If photo capture fails, the app will automatically try alternative methods
- **Low Quality Images**: Ensure good lighting conditions and a stable camera position
- **Browser Support**: If encountering issues in a specific browser, try an alternative browser
- **Mobile Devices**: For optimal experience on mobile, use Chrome on Android or Safari on iOS

### Coming Soon
- Enhanced photo management features
- Additional image filters and effects
- Social sharing capabilities
## Project Documentation

Our project maintains several key documentation files:

### Core Documentation
- `README.md` - Project overview, setup instructions, and basic usage guide
- `RELEASE_NOTES.md` - Detailed version history and feature documentation
- `LESSONS_LEARNED.md` - Technical insights, challenges, and solutions from development
- `50FirstDates.MD` - Comprehensive project memory checkpoint for maintaining development context

### Documentation Purposes
- README.md serves as the primary entry point for new developers
- RELEASE_NOTES.md tracks all significant changes and features
- LESSONS_LEARNED.md captures development insights and prevents repeated mistakes
- 50FirstDates.MD maintains the complete context of the project's evolution

### Documentation Updates
- All documentation is updated with each significant release
- The 50FirstDates.MD file is our primary reference for project context
- LESSONS_LEARNED.md is updated whenever we encounter and solve new challenges

## Version History
- v1.0.0 - Implemented photo capture functionality using the ImageCapture API with comprehensive fallback mechanisms for cross-browser compatibility
- v0.3.3-dev - Implemented fully responsive UI for different device orientations (portrait and landscape), removed 'Camera Control' title for a cleaner interface, and restructured UI components for improved responsiveness
- v0.2.0 - Added camera start/stop functionality
- v0.1.0 - Initial setup with basic page structure
