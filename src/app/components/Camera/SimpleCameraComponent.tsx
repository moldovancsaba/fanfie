'use client';

import React, { useRef, useEffect, useState } from 'react';

const SimpleCameraComponent = () => {
  const [error, setError] = useState<string|null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera API not supported');
      return;
    }

    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => {
            setError('Autoplay prevented. Please click to start.');
          });
        }
      })
      .catch(err => {
        setError(`Camera error: ${err.message}`);
      });

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {error && <div className="text-red-500 p-4 text-center">{error}</div>}
      {!error && <video ref={videoRef} autoPlay playsInline muted className="w-full h-auto rounded-lg" />}
    </div>
  );
};

export default SimpleCameraComponent;

