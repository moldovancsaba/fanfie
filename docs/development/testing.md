# Testing Guidelines

**Last Updated**: 2025-05-21T15:50:03.262Z

## Testing Stack

### Core Testing Libraries
- Jest (Test Runner)
- React Testing Library
- @testing-library/jest-dom
- @testing-library/user-event

### Test File Structure
```
ComponentName/
├── ComponentName.tsx
├── ComponentName.test.tsx
└── __tests__/
    ├── integration.test.tsx
    └── unit.test.tsx
```

## Unit Testing

### Component Testing
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { CameraComponent } from './CameraComponent';

describe('CameraComponent', () => {
  beforeEach(() => {
    // Mock MediaDevices API
    global.navigator.mediaDevices = {
      getUserMedia: jest.fn().mockResolvedValue('mock-stream')
    };
  });

  it('renders camera preview', () => {
    render(<CameraComponent onCapture={jest.fn()} onError={jest.fn()} />);
    expect(screen.getByTestId('camera-preview')).toBeInTheDocument();
  });

  it('handles capture button click', async () => {
    const onCapture = jest.fn();
    render(<CameraComponent onCapture={onCapture} onError={jest.fn()} />);
    
    const captureButton = screen.getByRole('button', { name: /take photo/i });
    fireEvent.click(captureButton);
    
    expect(onCapture).toHaveBeenCalled();
  });
});
```

### Hook Testing
```typescript
import { renderHook, act } from '@testing-library/react';
import useCamera from './useCamera';

describe('useCamera', () => {
  it('initializes camera stream', async () => {
    const { result } = renderHook(() => useCamera());
    
    await act(async () => {
      await result.current.startCamera();
    });
    
    expect(result.current.isReady).toBe(true);
  });
});
```

## Integration Testing

### Component Integration
```typescript
describe('Camera Integration', () => {
  it('captures and previews photo', async () => {
    render(
      <CameraApp>
        <CameraComponent />
        <PreviewComponent />
      </CameraApp>
    );

    // Take photo
    const captureButton = screen.getByRole('button', { name: /take photo/i });
    fireEvent.click(captureButton);

    // Check preview
    expect(await screen.findByTestId('photo-preview')).toBeInTheDocument();
  });
});
```

### API Integration
```typescript
describe('Upload Integration', () => {
  it('uploads captured photo', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { url: 'mock-url' } })
    });
    global.fetch = mockFetch;

    render(<UploadComponent photo="mock-photo-data" />);
    
    const uploadButton = screen.getByRole('button', { name: /upload/i });
    fireEvent.click(uploadButton);

    expect(mockFetch).toHaveBeenCalledWith('/api/upload', expect.any(Object));
  });
});
```

## Mock Guidelines

### API Mocks
```typescript
// Mock fetch responses
const mockFetch = jest.fn().mockImplementation((url) => {
  switch (url) {
    case '/api/upload':
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { url: 'mock-url' } })
      });
    default:
      return Promise.reject(new Error('Not Found'));
  }
});

global.fetch = mockFetch;
```

### Browser APIs
```typescript
// Mock MediaDevices
const mockMediaDevices = {
  getUserMedia: jest.fn().mockResolvedValue({
    getTracks: () => [{
      stop: jest.fn()
    }]
  })
};

Object.defineProperty(global.navigator, 'mediaDevices', {
  value: mockMediaDevices,
  writable: true
});
```

## Test Coverage

### Coverage Requirements
- Statements: 80%
- Branches: 80%
- Functions: 90%
- Lines: 80%

### Running Coverage
```bash
# Generate coverage report
npm test -- --coverage

# Watch mode with coverage
npm test -- --coverage --watchAll
```

## Performance Testing

### Component Performance
```typescript
describe('Performance', () => {
  it('renders without unnecessary updates', () => {
    const { rerender } = render(<Component prop="value" />);
    
    // Monitor render count
    const renderCount = jest.fn();
    React.useEffect(renderCount);
    
    rerender(<Component prop="new-value" />);
    expect(renderCount).toHaveBeenCalledTimes(2);
  });
});
```

### Memory Leaks
```typescript
describe('Memory Management', () => {
  it('cleans up resources', () => {
    const { unmount } = render(<Component />);
    
    // Track cleanup
    const cleanup = jest.fn();
    React.useEffect(() => cleanup, []);
    
    unmount();
    expect(cleanup).toHaveBeenCalled();
  });
});
```

## Error Testing

### Error Boundaries
```typescript
describe('Error Handling', () => {
  it('catches rendering errors', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation();
    
    render(
      <ErrorBoundary>
        <ComponentThatThrows />
      </ErrorBoundary>
    );
    
    expect(screen.getByTestId('error-message')).toBeInTheDocument();
    spy.mockRestore();
  });
});
```

### API Errors
```typescript
describe('API Error Handling', () => {
  it('handles API errors gracefully', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('API Error'));
    
    render(<Component />);
    await screen.findByText('Error: API Error');
  });
});
```

## Continuous Integration

### Test Scripts
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage"
  }
}
```

### Pre-commit Hooks
```bash
# Add to .husky/pre-commit
npm test -- --findRelatedTests
```

