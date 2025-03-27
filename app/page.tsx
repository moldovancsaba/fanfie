'use client';

import { useState, useRef } from 'react';

export default function Home() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (err) {
      setError('Camera access failed. Please ensure permissions are granted.');
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsStreaming(false);
    }
  };

  const takePhoto = () => {
    if (!videoRef.current || !isStreaming) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const photoUrl = canvas.toDataURL('image/jpeg');
    
    const newWindow = window.open('');
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Captured Photo</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { 
                margin: 0; 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                min-height: 100vh; 
                background: #f0f0f0; 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              }
              .container { 
                text-align: center;
                padding: 20px;
                max-width: 100%;
              }
              img { 
                max-width: 100%; 
                max-height: 80vh; 
                object-fit: contain;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              .download-btn { 
                display: inline-block;
                margin-top: 20px; 
                padding: 12px 24px; 
                background: #0070f3; 
                color: white; 
                border: none; 
                border-radius: 5px; 
                cursor: pointer; 
                font-size: 16px;
                text-decoration: none;
                transition: background 0.2s ease;
              }
              .download-btn:hover { 
                background: #0051a8; 
              }
            </style>
          </head>
          <body>
            <div class="container">
              <img src="${photoUrl}" alt="Captured photo" />
              <br/>
              <a href="${photoUrl}" download="fanfie-photo.jpg" class="download-btn">
                Download Photo
              </a>
            </div>
          </body>
        </html>
      `);
      newWindow.document.close();
    }
    
    stopCamera();
  };

  return (
    <main className="p-4 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Camera Control</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      <div className="w-full max-w-md">
        <div className="bg-gray-100 aspect-video rounded-lg overflow-hidden mb-4">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />
        </div>

        <div className="space-y-2">
          <button
            onClick={isStreaming ? stopCamera : startCamera}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors"
          >
            {isStreaming ? 'Stop Camera' : 'Start Camera'}
          </button>

          <button
            onClick={takePhoto}
            disabled={!isStreaming}
            className={`w-full py-2 px-4 rounded transition-colors ${
              isStreaming
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Take Picture
          </button>
        </div>
      </div>
    </main>
  );
}
