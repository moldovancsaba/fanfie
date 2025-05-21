# API Usage Examples

**Last Updated**: 2025-05-21T15:11:11.043Z

## Image Upload Examples

### Basic Upload
This example shows a simple image upload using the Fetch API.

```typescript
async function uploadImage(imageBlob) {
  try {
    // Create form data
    const formData = new FormData();
    formData.append('image', imageBlob);
    
    // Upload to our API
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    // Parse response
    const data = await response.json();
    
    // Check for errors
    if (!response.ok) {
      throw new Error(data.error?.message || 'Upload failed');
    }
    
    // Return image URL
    return data.data.url;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}
```

### Upload with Progress Tracking
This example implements progress tracking for uploads using XMLHttpRequest.

```typescript
function uploadImageWithProgress(imageBlob, onProgress) {
  return new Promise((resolve, reject) => {
    // Create XMLHttpRequest
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    
    // Append image to form data
    formData.append('image', imageBlob);
    
    // Setup progress tracking
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    });
    
    // Setup completion handler
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        resolve(data.data.url);
      } else {
        try {
          const errorData = JSON.parse(xhr.responseText);
          reject(new Error(errorData.error?.message || 'Upload failed'));
        } catch (e) {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    });
    
    // Setup error handler
    xhr.addEventListener('error', () => {
      reject(new Error('Network error occurred'));
    });
    
    // Send request
    xhr.open('POST', '/api/upload');
    xhr.send(formData);
  });
}

// Usage
uploadImageWithProgress(imageBlob, (progress) => {
  console.log(`Upload progress: ${progress}%`);
})
  .then(url => console.log('Image uploaded:', url))
  .catch(error => console.error('Upload failed:', error));
```

### React Integration Example
This example shows how to integrate the API into a React component.

```tsx
import { useState } from 'react';

function ImageUploader() {
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };
  
  const handleUpload = async () => {
    if (!image) return;
    
    try {
      setIsUploading(true);
      setError(null);
      
      // Create form data
      const formData = new FormData();
      formData.append('image', image);
      
      // Upload to our API
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      // Parse response
      const data = await response.json();
      
      // Check for errors
      if (!response.ok) {
        throw new Error(data.error?.message || 'Upload failed');
      }
      
      // Set image URL
      setImageUrl(data.data.url);
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      
      <button 
        onClick={handleUpload} 
        disabled={!image || isUploading}
      >
        {isUploading ? 'Uploading...' : 'Upload'}
      </button>
      
      {error && <p className="error">{error}</p>}
      
      {imageUrl && (
        <div>
          <h3>Uploaded Image:</h3>
          <img src={imageUrl} alt="Uploaded" style={{ maxWidth: '100%' }} />
        </div>
      )}
    </div>
  );
}

export default ImageUploader;
```

## Error Handling Examples

### Complete Error Handling
This example shows comprehensive error handling for the upload process.

```typescript
async function uploadImageWithErrorHandling(imageBlob) {
  try {
    // Validate input
    if (!(imageBlob instanceof Blob)) {
      throw new Error('Invalid image format');
    }
    
    // Check file size (32MB limit)
    const MAX_SIZE = 32 * 1024 * 1024; // 32MB in bytes
    if (imageBlob.size > MAX_SIZE) {
      throw new Error('Image size exceeds 32MB limit');
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('image', imageBlob);
    
    // Set timeout (30 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    try {
      // Upload to our API
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });
      
      // Parse response
      const data = await response.json();
      
      // Handle specific error cases
      if (!response.ok) {
        switch (response.status) {
          case 400:
            throw new Error('Invalid request format');
          case 413:
            throw new Error('Image size too large');
          case 415:
            throw new Error('Unsupported file type');
          case 429:
            throw new Error('Upload rate limit exceeded, please try again later');
          case 503:
            throw new Error('ImgBB service not configured, please contact administrator');
          default:
            throw new Error(data.error?.message || `Upload failed with status ${response.status}`);
        }
      }
      
      // Return image URL
      return data.data.url;
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Upload timed out after 30 seconds');
    }
    throw error;
  }
}
```

