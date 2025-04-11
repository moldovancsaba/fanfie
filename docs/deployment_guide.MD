# Deployment Guide for Frame Switching Feature

## Prerequisites
- Vercel CLI installed
- Environment variables configured:
  - IMGBB_API_KEY

## Deployment Steps

### 1. Pre-deployment Checklist
- [x] All features tested locally
- [x] Frame URLs verified
- [x] Documentation updated
- [x] TypeScript types checked
- [x] Build succeeding locally

### 2. Build Process
```bash
npm run build
```

### 3. Vercel Deployment
```bash
vercel --prod
```

## Environment Configuration

### Local Development
```env
IMGBB_API_KEY=your_api_key_here
```

### Vercel Production
- Navigate to Project Settings
- Environment Variables section
- Add IMGBB_API_KEY

## Verification Steps

1. Frame Switching
   - Test all frame transitions
   - Verify frame loading
   - Check aspect ratios
   - Confirm loading states

2. Image Capture
   - Test photo capture
   - Verify frame overlay in capture
   - Check image quality
   - Confirm upload function

3. Error Handling
   - Test with invalid frames
   - Verify error messages
   - Check loading states
   - Confirm recovery

## Rollback Procedure

If issues are detected:
1. Identify the last working version
2. Use Vercel dashboard to rollback
3. Verify functionality
4. Fix issues in development
5. Redeploy when ready

## Monitoring

Check for:
1. Frame loading errors
2. Upload success rates
3. Performance metrics
4. Error rates

