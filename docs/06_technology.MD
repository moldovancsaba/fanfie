# Fanfie - Technology Stack

This document outlines the technology stack, libraries, and technical decisions for the Fanfie project.

## Core Technologies

### Framework and Languages
- **Next.js 14.0.0** - React framework with App Router for server/client component architecture
- **TypeScript** - For type safety and developer experience
- **React 18.2.0** - UI library for component-based development

### Styling
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **PostCSS** - For processing CSS with plugins
- **Autoprefixer** - For adding vendor prefixes to CSS

### Canvas and Image Manipulation
- **Fabric.js 6.6.2** - Canvas library for image manipulation and overlays
- *Potential Alternative:* Konva.js (being evaluated)

### State Management
- React's built-in state management (useState, useContext)
- No additional state management library at this time

## UI Components and Utilities

### Notifications
- **react-hot-toast** - For toast notifications

### Icons
- **react-icons** - Icon library for UI elements

## External Services

### Image Hosting
- **imgbb API** - For hosting and sharing images
- No authentication required, using API key for uploads

## Development Tools

### Build and Bundling
- Next.js built-in tooling
- SWC for fast compilation

### Code Quality
- TypeScript for static type checking
- ES

