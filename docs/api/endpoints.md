# API Endpoints

**Last Updated**: 2025-05-21T15:11:11.043Z

## Image Upload
Upload an image to ImgBB through our secure API.

### POST /api/upload

**Request**
- Method: POST
- Content-Type: multipart/form-data
- Body: FormData containing image file

**Example Request**
```typescript
const formData = new FormData();
formData.append('image', imageBlob);

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData
});
```

**Success Response (200)**
```json
{
  "data": {
    "url": "https://i.ibb.co/example/image.jpg"
  }
}
```

**Error Response (4xx/5xx)**
```json
{
  "error": {
    "message": "Error uploading image"
  },
  "details": "Detailed error description"
}
```

**Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| image | File/Blob | Yes | Image file to upload |

**Restrictions**
- Maximum file size: 32MB
- Supported formats: JPEG, PNG, WebP
- Rate limit: 100 uploads per hour

**Error Codes**
| Code | Description |
|------|-------------|
| 400 | Invalid request format |
| 413 | File too large |
| 415 | Unsupported file type |
| 429 | Rate limit exceeded |
| 503 | ImgBB API key not configured |

**Implementation Notes**
1. The endpoint processes the uploaded image and securely forwards it to ImgBB
2. Server-side validation ensures file type and size compliance
3. Error handling provides clear feedback for common issues
4. Success response includes the direct image URL
5. CORS is enabled for web client access

