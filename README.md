# Fanfie - Camera & Graphics Editor Web App

Fanfie is a modern web application that allows users to capture photos from their device camera, enhance them with text and graphics, and share them across multiple platforms. Built with Next.js and modern web technologies, Fanfie delivers a seamless, responsive user experience across devices.

## Features

### 📸 Camera Functionality
- Immediate access to device camera (with permissions)
- Real-time camera preview
- Photo capture with a single tap
- Support for both front and rear cameras (where available)

### 🎨 Graphics Editor
- Text overlay with customizable fonts, sizes, and colors
- Layer management for precise control over elements
- Interactive canvas for intuitive editing
- Drag and drop positioning of all elements

### 🔗 Sharing Options
- Direct sharing via Web Share API (where supported)
- Social media platform integration
- Image download in multiple formats (PNG/JPEG)
- Copy link functionality for easy distribution

## Technology Stack

- **Next.js 13+** - React framework with App Router
- **TypeScript** - For type safety and developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **Fabric.js** - HTML5 canvas library for graphics editing
- **React Icons** - Icon component library
- **React Hot Toast** - Notifications and feedback

## Getting Started

### Prerequisites

- Node.js 16.8.0 or later
- npm (comes with Node.js)
- Modern web browser with camera access

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/fanfie.git
   cd fanfie
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development Server

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Browser Compatibility

Fanfie works best in modern browsers with the following requirements:
- **Camera Access**: Requires HTTPS or localhost for security
- **Optimal Experience**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile Support**: iOS Safari 14.5+, Android Chrome (latest)
- **Web Share API**: Available on mobile browsers and some desktop browsers (falls back gracefully)

## Usage Guide

### Taking a Photo
1. Allow camera permissions when prompted
2. Position your subject in the frame
3. Click/tap the capture button

### Editing Your Photo
1. Add text by using the text tool in the toolbar
2. Customize text with font options
3. Drag elements to position them
4. Use the layer controls to arrange elements

### Sharing Your Creation
1. Click/tap the "Share" button
2. Choose your preferred sharing method:
   - Direct share (mobile)
   - Social media platforms
   - Download as image
   - Copy shareable link

## Deploy on Vercel

The easiest way to deploy Fanfie is to use the [Vercel Platform](https://vercel.com/new) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
