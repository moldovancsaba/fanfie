# Fanfie 📸

Production-grade selfie application with advanced camera controls and sharing capabilities.

**Status**: 🟢 Foundation Complete  
**Version**: v0.1.1  
**Live**: [fanfie-2ho8nmoad-narimato.vercel.app](https://fanfie-2ho8nmoad-narimato.vercel.app)

## Quick Start

```bash
git clone https://github.com/moldovancsaba/fanfie.git
cd fanfie
npm install
npm run dev
```

## Project Structure

- `app/` - Next.js application core
  - `layout.tsx` - Root layout with theme configuration
  - `page.tsx` - Main application entry point
- `docs/` - Project documentation
  - [50FirstDates.MD](50FirstDates.MD) - Development diary and progress
  - [RELEASE_NOTES.md](RELEASE_NOTES.md) - Version history
  - [LESSONS_LEARNED.md](LESSONS_LEARNED.md) - Implementation insights

## Tech Stack

- Next.js 14.0.0
- React 18.2.0
- TypeScript (Strict Mode)
- Tailwind CSS
- Vercel Deployment
- Git Version Control

## Documentation

- [Development Timeline](50FirstDates.MD#development-timeline)
- [Release History](RELEASE_NOTES.md)
- [Implementation Insights](LESSONS_LEARNED.md)

## Screen-Sized Camera Implementation (v2.3.0)

### New Features
- Responsive camera view that adapts to screen size
- Intelligent aspect ratio preservation
- Optimized image quality for different screen sizes
- Flexible canvas sizing with consistent quality

### Usage
```tsx
import CameraComponent from './components/Camera/CameraComponent';

// Basic usage with screen-fitting enabled
<CameraComponent 
  onCapture={handleCapture}
  onError={handleError}
  fitToScreen={true}
/>
```

### Configuration Options
- `fitToScreen`: Enable/disable screen-size adaptation (default: true)
- `onCapture`: Callback function receiving the captured image data
- `onError`: Error handling callback

### Technical Implementation
The camera view now automatically adjusts to the available screen space while maintaining image quality and aspect ratio. Key features include:

1. **Responsive Container**:
   - Adapts to screen dimensions
   - Maintains proper margins and spacing
   - Handles orientation changes

2. **Quality Preservation**:
   - Maintains aspect ratio during resizing
   - Optimizes canvas dimensions for quality
   - Implements fallback capture mechanism

3. **Error Handling**:
   - Graceful fallbacks for capture errors
   - Clear error messaging
   - Comprehensive error reporting

### Browser Support
- Chrome (desktop & mobile)
- Safari (iOS)
- Firefox
- Edge

### Known Limitations
- Requires HTTPS for camera access
- Performance may vary on low-end devices
- Some mobile browsers may have limited camera controls

