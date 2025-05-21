# Installation Guide

**Last Updated**: 2025-05-21T15:35:03.435Z

## Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)
- Git
- A modern web browser
- ImgBB API key for image hosting

## Step-by-Step Installation

### 1. Clone the Repository
```bash
git clone https://github.com/moldovancsaba/fanfie.git
cd fanfie
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:
```env
IMGBB_API_KEY=your_imgbb_api_key
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Access the Application
Open your browser and navigate to:
```
http://localhost:3000
```

## Verification
1. Allow camera access when prompted
2. Test photo capture functionality
3. Verify frame overlay system
4. Test image upload capability

## Troubleshooting

### Common Issues
1. **Camera Access Error**
   - Ensure HTTPS in production
   - Check browser permissions
   - Verify camera hardware

2. **Build Errors**
   - Clear `.next` directory
   - Remove `node_modules`
   - Run clean install

3. **Upload Issues**
   - Verify ImgBB API key
   - Check network connectivity
   - Validate file size limits

## Next Steps
1. Review development guide
2. Test the application
3. Set up deployment
4. Read API documentation

