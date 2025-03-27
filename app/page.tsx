'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function Home() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const takePhoto = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);

      const photoData = canvas.toDataURL('image/jpeg');
      setPhoto(photoData);

      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
    } catch (err) {
      setError('Failed to access camera');
      console.error(err);
    }
  };

  const uploadPhoto = async () => {
    if (!photo) return;

    try {
      setLoading(true);
      setError(null);

      // Convert base64 to blob
      const response = await fetch(photo);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append('image', blob);

      const result = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!result.ok) {
        throw new Error('Upload failed');
      }

      const data = await result.json();
      setUploadedUrl(data.url);
    } catch (err) {
      setError('Failed to upload image');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-8">Photo Upload App</h1>
      
      <div className="space-y-4">
        <button
          onClick={takePhoto}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={loading}
        >
          Take Photo
        </button>

        {photo && (
          <div className="space-y-4">
            <div className="relative w-64 h-64">
              <Image
                src={photo}
                alt="Preview"
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
            <button
              onClick={uploadPhoto}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              disabled={loading}
            >
              {loading ? 'Uploading...' : 'Upload Photo'}
            </button>
          </div>
        )}

        {error && (
          <div className="text-red-500 mt-2">
            {error}
          </div>
        )}

        {uploadedUrl && (
          <div className="mt-4">
            <p className="text-green-500">Upload successful!</p>
            <a
              href={uploadedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              View uploaded image
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
