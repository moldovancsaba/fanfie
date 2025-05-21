# API Documentation

**Last Updated**: 2025-05-21T15:11:11.043Z

## Overview
Fanfie provides a secure API for image upload and processing. The API is designed to be simple, efficient, and secure, primarily handling image uploads to ImgBB through a protected server-side implementation.

## Authentication
The API uses environment-based authentication with ImgBB. No direct client authentication is required as the API key is managed server-side.

### Environment Configuration
```env
IMGBB_API_KEY=your_imgbb_api_key
```

## Base URL
For local development:
```
http://localhost:3000/api
```

For production:
```
https://fanfie-2ho8nmoad-narimato.vercel.app/api
```

## Response Format
All API responses follow a consistent JSON format:

### Success Response
```json
{
  "data": {
    "url": "https://i.ibb.co/example/image.jpg"
  }
}
```

### Error Response
```json
{
  "error": {
    "message": "Error description"
  },
  "details": "Detailed error information"
}
```

## Rate Limiting
- ImgBB free tier limitations apply
- Default rate limit: 100 uploads per hour
- Image size limit: 32MB

## Error Codes
- 400: Bad Request
- 401: Unauthorized (Invalid API key)
- 413: Payload Too Large
- 415: Unsupported Media Type
- 429: Too Many Requests
- 500: Internal Server Error
- 503: Service Unavailable (ImgBB API key not configured)

## Security
- HTTPS required in production
- Server-side API key management
- File type validation
- Size limits enforced
- CORS protection enabled

