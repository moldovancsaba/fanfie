# Fanfie Technology Stack

## Core Technologies
- **Next.js**: v15.2.4 with App Router
  - Purpose: Main application framework providing server-side rendering and efficient deployment
  - Key Features: App Router, built-in TypeScript support, optimized deployment on Vercel

- **React**: v19.0.0
  - Purpose: Core UI library for component-based architecture
  - Implementation: Latest version with modern React features
  - Integration: Fully integrated with Next.js framework

- **TypeScript**
  - Purpose: Type safety and enhanced development experience
  - Implementation: Full TypeScript support across all components
  - Benefits: Improved code reliability and maintainability

- **Tailwind CSS**: v3.3.3
  - Purpose: Utility-first CSS framework for styling
  - Usage: Responsive design and consistent styling across components

- **Fabric.js**: v6.6.1
  - Purpose: Canvas manipulation and graphics editing
  - Current Implementation: Graphics layer for image editing
  - Note: Under evaluation for potential migration to Konva.js

## Key Dependencies
- **React Hot Toast**: v2.5.2
  - Purpose: User notifications and feedback
  - Implementation: System-wide toast notifications for user actions

- **React Icons**: v5.5.0
  - Purpose: Comprehensive icon library
  - Usage: UI elements and interactive components

- **imgbb.com API Integration**
  - Purpose: Image hosting service
  - Implementation: Direct image upload and sharing capabilities

## Development & Build
- **Node.js**: v16.8.0+
  - Purpose: Runtime environment
  - Requirements: Required for local development and build processes

- **npm**: v8.15.0+
  - Purpose: Package management
  - Usage: Dependency management and script execution

- **Vercel**
  - Purpose: Production deployment platform
  - Features: Automated deployments, preview environments
  - Command: `vercel --prod` for production deployment

## Environment Requirements
- HTTPS or localhost required for camera access
- Environment variables:
  - NEXT_PUBLIC_IMGBB_API_KEY (required for image hosting)

## Browser Support
- **Desktop Browsers**:
  - Chrome 76+
  - Firefox 79+
  - Safari 15+
  - Edge 79+

- **Mobile Browsers**:
  - iOS Safari 14.5+
  - Android Chrome (latest)
  - Firefox Mobile 79+

## Performance Considerations
- Sub-second image loading target
- Memory usage < 100MB
- 60 FPS editing experience
- Export operations < 2s

## Security Requirements
- Secure HTTPS context for camera access
- API key protection
- Proper CORS handling for image loading
- Client-side data processing for privacy

## Testing Infrastructure
- Unit tests for core functionality (Jest v29.7.0)
- Integration tests for camera operations
- Cross-browser compatibility testing
- Performance benchmarking
