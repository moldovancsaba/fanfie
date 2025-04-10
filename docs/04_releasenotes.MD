# RELEASE NOTES

## v2.3.1 (2025-04-10)

### 🔒 Security & Stability
- Fixed critical security vulnerabilities in Next.js (updated to 14.2.28)
- Improved upload route error handling and EXIF sanitization
- Fixed TypeScript errors in Camera component
- Aligned React version to 18.2.0 for better compatibility

### 💻 Technical Improvements
- Added proper EXIF data sanitization in image uploads
- Improved error handling and type safety in upload route
- Enhanced Camera component with proper state management
- Added cleanup for camera resources

### 📦 Dependencies
- React: 18.2.0 (downgraded from 19.0.0 for stability)
- Next.js: 14.2.28
- TypeScript: ^5.3.3
- Sharp: ^0.33.2

### 🚀 Deployment
- Production: https://fanfie-e2i2q4b8s-narimato.vercel.app
- Build Status: ✅ Success
- Performance Score: 88.1kB initial JS

## v2.3.0 (2025-04-08)

### 🔒 Security & Stability
- Secured route handler implementation
- Removed deprecated axios dependency
- Aligned React types to v19.0.0
- Cleaned up test configuration

### 🚀 Deployment
- Production: https://fanfie-e2i2q4b8s-narimato.vercel.app
- Build Status: ✅ Success
- Performance Score: 100kB initial JS

### 📦 Dependencies
- React: 19.0.0
- Next.js: 15.2.4
- TypeScript: ^5.8.2

## v1.0.0 (2025-03-25)

- Initial release
- Basic camera functionality
- Production deployment: https://fanfie-secure.vercel.app
- Security patch: Fixed critical route handler syntax and dependency issues
- Build signature: v2.2.5 (2025-04-08)
