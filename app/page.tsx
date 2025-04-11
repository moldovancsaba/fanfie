'use client';

import { useState, useCallback } from 'react';
import CameraComponent from './components/Camera/CameraComponent';
import { Button, Stack, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';
import { PhotoCamera, Replay, Upload, ArrowBack, Share, Error } from '@mui/icons-material';
import toast from 'react-hot-toast';

export default function Home() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<{ title: string; details: string } | null>(null);

  const handleCapture = useCallback((imageData: string) => {
    setCapturedImage(imageData);
    toast.success('Photo captured successfully!');
  }, []);

  const handleError = useCallback((error: Error) => {
    toast.error(error.message);
  }, []);

  const handleRetake = useCallback(() => {
    setCapturedImage(null);
    setUploadedUrl(null);
    setError(null);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!capturedImage) return;

    try {
      setIsUploading(true);
      setError(null);
      toast.loading('Uploading image...');

      // Convert base64 to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();

      // Create form data
      const formData = new FormData();
      formData.append('image', blob);

      // Upload to ImgBB through our API route
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await uploadResponse.json();

      if (!uploadResponse.ok) {
        // Handle specific error cases
        if (uploadResponse.status === 503) {
          setError({
            title: 'API Configuration Required',
            details: data.details || 'ImgBB API key needs to be configured. Please contact the administrator.'
          });
        } else {
          setError({
            title: 'Upload Failed',
            details: data.details || 'An error occurred while uploading the image.'
          });
        }
        throw new Error(data.error);
      }
      
      if (data.data?.url) {
        setUploadedUrl(data.data.url);
        toast.dismiss();
        toast.success('Image uploaded successfully!');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.dismiss();
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [capturedImage]);

  const handleShare = useCallback(async () => {
    if (!uploadedUrl) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My Photo',
          text: 'Check out my photo!',
          url: uploadedUrl
        });
        toast.success('Shared successfully!');
      } else {
        await navigator.clipboard.writeText(uploadedUrl);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to share. Please try again.');
    }
  }, [uploadedUrl]);

  // Common button styles
  const buttonStyle = {
    borderRadius: '28px',
    padding: '12px 24px',
    textTransform: 'none',
    fontSize: '1rem',
  };

  return (
    <main className="min-h-screen w-full bg-black">
      {!capturedImage ? (
        <CameraComponent 
          onCapture={handleCapture}
          onError={handleError}
        />
      ) : (
        <div className="fixed inset-0 flex items-center justify-center bg-black">
          <div className="relative w-full h-full">
            <img 
              src={capturedImage} 
              alt="Captured"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <Stack
              direction="row"
              spacing={2}
              sx={{
                position: 'absolute',
                bottom: '2rem',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 2000
              }}
            >
              {!uploadedUrl ? (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Replay />}
                    onClick={handleRetake}
                    disabled={isUploading}
                    sx={buttonStyle}
                  >
                    Retake
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<Upload />}
                    onClick={handleUpload}
                    disabled={isUploading}
                    sx={buttonStyle}
                  >
                    {isUploading ? 'Uploading...' : 'Upload'}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<ArrowBack />}
                    onClick={handleRetake}
                    sx={buttonStyle}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<Share />}
                    onClick={handleShare}
                    sx={buttonStyle}
                  >
                    Share
                  </Button>
                </>
              )}
            </Stack>
          </div>
        </div>
      )}

      {/* Error Dialog */}
      <Dialog
        open={!!error}
        onClose={() => setError(null)}
        aria-labelledby="error-dialog-title"
      >
        <DialogTitle id="error-dialog-title" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Error color="error" />
          {error?.title}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {error?.details}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setError(null)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </main>
  );
}
