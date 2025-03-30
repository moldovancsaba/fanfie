import '@testing-library/jest-dom';

// Add environment variables
process.env = {
  ...process.env,
  NEXT_PUBLIC_VERCEL_URL: 'http://localhost:3000',
};

// Mock window.URL.createObjectURL

// Mock window.URL.createObjectURL
window.URL.createObjectURL = jest.fn();
window.URL.revokeObjectURL = jest.fn();

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    blob: () => Promise.resolve(new Blob()),
  })
);

