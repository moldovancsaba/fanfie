# Release Notes

## v0.3.0-dev - Square Format Update (2025-03-27)

### New Features
- Enforced 1:1 square aspect ratio for photos
    - Square camera viewport
    - Automatic center cropping
    - Consistent square output
- Improved mobile compatibility
    - Responsive square viewport
    - Better device orientation handling
- Enhanced photo viewer
    - Square photo display
    - Improved download experience
    - Renamed photos to 'fanfie-square.jpg'

### Technical Updates
- Added aspect ratio constraints to MediaStream
- Implemented dynamic square cropping
- Enhanced responsive design for square format
- Improved video container sizing logic

### Known Limitations
- Photos are not stored persistently
- No image editing capabilities
- Single photo capture at a time

## v0.2.0 - Photo Capture Release (2025-03-27)

### Features
- Photo capture functionality
    - Take Picture button (enabled when camera is active)
    - Opens captured photo in new window
    - Download option for captured photos
    - Automatic camera stop after capture
- Improved UI/UX
    - Dynamic button states
    - Responsive photo viewer
    - Improved error handling

## v0.1.0 - Prototype Release (2025-03-27)

### Features
- Basic web application structure using Next.js 13
- Camera access and control functionality
    - Start/Stop camera stream
    - Proper error handling for permissions
    - Mobile device support
- Responsive design using Tailwind CSS
- Comprehensive documentation

### URLs
- Production: https://fanfie.vercel.app
- GitHub: https://github.com/moldovancsaba/fanfie

