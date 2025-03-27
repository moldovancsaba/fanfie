'use client';

import { useState, useRef, useEffect } from 'react';

export default function Home() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const adjustVideoSize = () => {
      if (videoRef.current && containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const size = Math.min(containerWidth, window.innerHeight * 0.7);
        videoRef.current.style.width = `${size}px`;
        videoRef.current.style.height = `${size}px`;
      }
    };

    window.addEventListener('resize', adjustVideoSize);
    return () => window.removeEventListener('resize', adjustVideoSize);
  }, []);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          aspectRatio: 1,
        }
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
    const size = Math.min(videoRef.current.videoWidth, videoRef.current.videoHeight);
    canvas.width = size;
    canvas.height = size;
    
    const context = canvas.getContext('2d');
    if (!context) return;

    const sx = (videoRef.current.videoWidth - size) / 2;
    const sy = (videoRef.current.videoHeight - size) / 2;
    
    context.drawImage(
      videoRef.current,
      sx, sy, size, size,
      0, 0, size, size
    );

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
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              }
              .container { 
                text-align: center;
                padding: 20px;
                max-width: 100%;
              }
              img { 
                width: 100%;
                max-width: 80vh;
                aspect-ratio: 1;
                object-fit: contain;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              .button-container {
                margin-top: 20px;
                display: flex;
                flex-direction: column;
                gap: 10px;
                align-items: center;
              }
              .download-btn { 
                display: inline-block;
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
              .note {
                color: #666;
                font-size: 14px;
                margin-top: 8px;
              }
            </style>
            <script>
              // Function to handle download and close
              function downloadAndClose() {
                // Create a hidden link and click it
                const link = document.createElement('a');
                link.href = '${photoUrl}';
                link.download = 'fanfie-square.jpg';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // Set a timeout to close the window
                setTimeout(() => {
                  // For Safari mobile, we show a message first
                  if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
                    document.getElementById('downloadMessage').textContent = 'Download started! You can close this window.';
                  } else {
                    window.close();
                  }
                }, 1000);
              }
            </script>
          </head>
          <body>
            <div class="container">
              <img src="${photoUrl}" alt="Captured photo" />
              <div class="button-container">
                <button onclick="downloadAndClose()" class="download-btn">
                  Download Photo
                </button>
                <div id="downloadMessage" class="note"></div>
              </div>
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

      <div className="w-full max-w-md" ref={containerRef}>
        <div className="bg-gray-100 rounded-lg overflow-hidden mb-4" style={{ aspectRatio: '1' }}>
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
