# Fanfie

A web application for taking and managing photos with precise camera control and responsive layout.

## 📚 Documentation Overview

We maintain several key documentation files:

### Core Documentation Files
- `README.md` (this file) - Project overview, setup guide, and documentation index
- `50FirstDates.MD` - Complete project context and memory checkpoint
  * Quick reference section for latest status
  * Current progress and milestones
  * Technical architecture details
  * Known issues and solutions
- `RELEASE_NOTES.md` - Version history and feature documentation
  * Detailed changelog by version
  * Implementation details
  * Breaking changes
- `LESSONS_LEARNED.md` - Technical insights and solutions
  * Implementation challenges and solutions
  * Best practices discovered
  * Performance optimizations

### When to Use Each Document
- 👋 **New to the project?** Start with `README.md`
- 🧠 **Need project context?** Check `50FirstDates.MD`
- 📝 **Looking for version info?** See `RELEASE_NOTES.md`
- 🔍 **Solving a technical issue?** Refer to `LESSONS_LEARNED.md`

## 🎯 Features

### Camera Implementation
- Precise 1:1 aspect ratio camera container
- 80% viewport size constraint
- Optimal positioning (20% from top)
- Responsive layout for portrait/landscape
- Photo capture with ImgBB integration
- Cross-browser compatibility with fallbacks

## 🚀 Development

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

## 🚀 Deployment

Deployed via Vercel:
- Production: [https://fanfie.vercel.app](https://fanfie.vercel.app)
- Auto-deploys from main branch
- Manual deploy: `vercel --prod`

### Environment Variables
- `IMGBB_API_KEY` - Required for image upload functionality

## 📱 Usage Guide
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
7. The camera view follows strict layout rules:
   - Maintains a perfect square (1:1 aspect ratio)
   - Takes up to 80% of the available viewport space
   - Positions at 20% from the top of its container
   - Automatically adjusts for both portrait and landscape orientations:
     * Portrait: Takes up the top half of the screen
     * Landscape: Takes up the left half of the screen
   - Includes smooth transitions for orientation changes
   - Features a decorative frame overlay
   - Centers the video feed with proper cropping
8. Click 'Stop Camera' to end the camera feed when you're done
9. The layout automatically adjusts based on your device orientation (portrait or landscape)
### Browser Compatibility
- Works best on modern browsers (Chrome, Firefox, Safari, Edge)
- Requires HTTPS for camera access
- On mobile devices, defaults to the back camera
- Requires camera permissions to be granted

## 🐛 Troubleshooting

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
- Improved sharing options with direct social media integration
- Enhanced photo filters and frame options
- Gallery view for managing multiple photos
- Advanced camera controls (zoom, focus, exposure)

## 🔜 Coming Soon
- Enhanced photo filters
- Social sharing capabilities
- Gallery view
- Advanced camera controls

## 📝 License
[MIT](LICENSE)
