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

### Camera Usage Instructions
1. When you first open the application, you'll see a 'Start Camera' button
2. Click 'Start Camera' to begin - your browser will ask for camera permissions
3. Grant camera permissions when prompted
4. The camera feed will appear in the video container
5. Click 'Stop Camera' to end the camera feed

### Browser Compatibility
- Works best on modern browsers (Chrome, Firefox, Safari, Edge)
- Requires HTTPS for camera access
- On mobile devices, defaults to the back camera
- Requires camera permissions to be granted

### Coming Soon
- Photo capture functionality
- Photo management
- Image filters and effects

## Version History
- v0.2.0 - Added camera start/stop functionality
- v0.1.0 - Initial setup with basic page structure
