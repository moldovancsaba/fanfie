# Fanfie - Camera Web App

A web application for capturing, editing, and sharing photos with fun overlays and graphics.

## Overview

Fanfie is a modern web-based camera application that allows users to:
- Capture photos using their device camera
- Apply fun graphics and overlays
- Edit and customize their photos
- Share their creations directly from the web

## Tech Stack

- **Framework:** Next.js 14.0.0
- **Language:** TypeScript
- **UI:** React 18.2.0, Tailwind CSS
- **Canvas Layer:** Fabric.js 6.6.2
- **Deployment:** Vercel
- **Hosting & Sharing:** imgbb API
- **Notifications:** react-hot-toast
- **Iconography:** react-icons

## Features

- Real-time camera access
- Canvas-based editing with Fabric.js
- Responsive design for mobile and desktop
- Simple sharing functionality
- No login required, privacy-focused

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone [repository-url]

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at http://localhost:3000.

## Project Structure

```
fanfie/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── Camera/
│   │   │   │   └── CameraComponent.tsx
│   │   │   └── ... (other components)
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   └── ... (other source files)
├── public/
│   └── ... (static assets)
├── docs/
│   ├── 01_roadmap.MD
│   ├── 02_development.MD
│   ├── 03_lessonslearned.MD
│   ├── 04_releasenotes.MD
│   └── 05_50FirstDates.MD
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## Development

For development guidelines, please refer to the documentation in the `docs/` directory:
- `01_roadmap.MD` - Future plans and feature roadmap
- `02_development.MD` - Development guidelines and standards
- `03_lessonslearned.MD` - Issues encountered and their resolutions
- `04_releasenotes.MD` - Version history and release notes
- `05_50FirstDates.MD` - Project context and current state

## License

[MIT License](LICENSE)

