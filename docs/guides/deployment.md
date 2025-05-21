# Deployment Guide

**Last Updated**: 2025-05-21T15:35:03.435Z

## Deployment Options

### 1. Vercel (Recommended)

#### Prerequisites
- Vercel account
- GitHub repository
- ImgBB API key

#### Steps
1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Login to Vercel
   vercel login

   # Deploy
   vercel --prod
   ```

2. **Environment Variables**
   - Go to Vercel Dashboard
   - Project Settings > Environment Variables
   - Add `IMGBB_API_KEY`

3. **Deploy Settings**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
   - Development Command: `npm run dev`

4. **Domains & HTTPS**
   - Custom domain (optional)
   - Automatic HTTPS
   - SSL certificate management

### 2. Manual Deployment

#### Prerequisites
- Node.js server
- HTTPS certificate
- Process manager (PM2)

#### Steps
1. **Server Setup**
   ```bash
   # Install PM2
   npm install -g pm2

   # Build application
   npm run build

   # Start with PM2
   pm2 start npm --name "fanfie" -- start
   ```

2. **Environment Configuration**
   ```bash
   # Create production env file
   echo "IMGBB_API_KEY=your_key_here" > .env.production
   ```

3. **NGINX Configuration**
   ```nginx
   server {
       listen 443 ssl;
       server_name your-domain.com;

       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/key.pem;

       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

## Security Considerations

### 1. Environment Variables
- Never commit `.env` files
- Use secret management
- Rotate API keys regularly

### 2. HTTPS
- Required for camera access
- SSL certificate setup
- Automatic renewal

### 3. Access Control
- Rate limiting
- CORS configuration
- Input validation

## Performance Optimization

### 1. Build Optimization
```bash
# Analyze bundle
npm run build -- --analyze

# Enable compression
COMPRESS=true npm run build
```

### 2. Cache Configuration
- Static file caching
- API response caching
- Browser caching headers

### 3. Image Optimization
- Next.js Image optimization
- Proper image formats
- Lazy loading

## Monitoring

### 1. Error Tracking
- Vercel Analytics
- Custom error logging
- Performance monitoring

### 2. Health Checks
```bash
# Basic health check
curl -I https://your-domain.com/api/health

# Expected response
HTTP/2 200
```

## Backup & Recovery

### 1. Database Backup
- Regular backups
- Versioned assets
- Recovery procedures

### 2. Rollback Procedure
```bash
# Revert to previous deployment
vercel rollback

# Or specific deployment
vercel rollback --to dpl_123
```

## Troubleshooting

### Common Deployment Issues

1. **Build Failures**
   - Check build logs
   - Verify dependencies
   - Check environment variables

2. **Runtime Errors**
   - Check server logs
   - Monitor error tracking
   - Verify API access

3. **Performance Issues**
   - Check analytics
   - Monitor response times
   - Analyze bundle size

## Maintenance

### Regular Tasks
1. Update dependencies
2. Monitor error logs
3. Check performance metrics
4. Update SSL certificates

### Updates
1. Stage updates in development
2. Test thoroughly
3. Deploy during low traffic
4. Monitor post-deployment

## Next Steps
1. Set up monitoring
2. Configure alerts
3. Document recovery procedures
4. Plan scaling strategy

