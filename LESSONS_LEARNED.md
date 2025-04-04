# Development Lessons & Solutions

## 2025-04-04: Camera Implementation

### Browser Compatibility
- Use `playsInline` attribute for iOS Safari video compatibility
- Set `facingMode: 'user'` for consistent front camera selection
- Handle permissions explicitly for better user experience

### MediaStream Cleanup
- Importance: Always stop camera tracks when component unmounts
- Solution: Implemented cleanup in useEffect return function
- Prevention: Create reusable hooks for media stream management

## 2025-04-04: Initial Setup

### Vercel Deployment
- Issue: Initial deployment resulted in 401 unauthorized
- Solution: Removed and relinked project with proper Git integration
- Prevention: Always use `vercel link` before first deployment

### Dependencies
- Next.js 14.0.0 requires React 18.2.0 for compatibility
- Tailwind CSS requires proper content configuration in tailwind.config.js
- SSH key setup required for secure Git deployment
