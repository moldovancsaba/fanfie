# Development Guide

**Last Updated**: 2025-05-21T15:35:03.435Z

## Project Structure
```
fanfie/
├── app/
│   ├── components/
│   │   ├── Camera/
│   │   │   ├── CameraComponent.tsx
│   │   │   └── types.ts
│   │   └── Frame/
│   │       └── FrameOverlay.tsx
│   ├── services/
│   │   └── CameraQualityService.ts
│   ├── api/
│   │   └── upload/
│   │       └── route.ts
│   ├── layout.tsx
│   └── page.tsx
├── docs/
│   ├── guides/
│   ├── technical/
│   ├── api/
│   └── release-notes/
├── public/
│   └── frames/
└── package.json
```

## Development Workflow

### 1. Code Style
We follow strict TypeScript and ESLint rules:
```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### 2. Component Development
Follow these principles:
- Use TypeScript for all components
- Implement proper error handling
- Add JSDoc comments for public APIs
- Follow React best practices
- Use proper type definitions

### 3. Git Workflow
```bash
# Create feature branch
git checkout -b feature/feature-name

# Make changes and commit
git add .
git commit -m "feat: description of changes"

# Push changes
git push origin feature/feature-name
```

### 4. Testing
```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage
```

## Key Components

### CameraComponent
The main camera interface component:
```typescript
interface CameraProps {
  onCapture: (imageData: string, frameInfo: { width: number; height: number }) => void;
  onError: (error: Error) => void;
}
```

### Frame System
Frame overlay implementation:
```typescript
interface FrameInfo {
  url: string;
  width: number;
  height: number;
}
```

### API Integration
Upload endpoint implementation:
```typescript
interface UploadResponse {
  data?: {
    url: string;
  };
  error?: {
    message: string;
  };
}
```

## Development Tools

### Required VS Code Extensions
- ESLint
- Prettier
- TypeScript
- Tailwind CSS IntelliSense
- GitHub Copilot (recommended)

### Environment Setup
1. Install extensions
2. Configure editor settings
3. Set up Git hooks
4. Configure debugging

## Debug Configuration
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}"
    }
  ]
}
```

## Best Practices

### Code Organization
1. Group related components
2. Use proper file naming
3. Implement clean architecture
4. Follow SOLID principles

### Performance
1. Optimize images
2. Minimize re-renders
3. Use proper memoization
4. Implement lazy loading

### Security
1. Validate inputs
2. Sanitize outputs
3. Handle errors properly
4. Implement proper CORS

## Common Tasks

### Adding a New Frame
1. Add frame image to public/frames
2. Update frame configuration
3. Test frame rendering
4. Verify aspect ratio handling

### Implementing New Features
1. Create feature branch
2. Implement feature
3. Add tests
4. Update documentation
5. Create pull request

## Troubleshooting Development

### Common Development Issues
1. **Hot Reload Not Working**
   - Clear Next.js cache
   - Restart development server
   - Check file watchers

2. **Type Errors**
   - Update TypeScript version
   - Clear type cache
   - Check type definitions

3. **Build Issues**
   - Clear build cache
   - Update dependencies
   - Check for conflicts

## Next Steps
1. Review API documentation
2. Explore camera implementation
3. Study frame system
4. Test deployment process

