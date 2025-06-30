// Mosaic visualization component
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

// Define the Image type for TypeScript
interface Image {
  _id: string;
  url: string;
  title: string;
  description?: string;
}

export default function Mosaic() {
  const [images, setImages] = useState<Image[]>([]);
  useEffect(() => {
    fetchImages();
  }, []);

  // Function to fetch images from the API
  async function fetchImages() {
    try {
      const response = await fetch('/api/images');
      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch images');
      }
      setImages(result.data);
    } catch (err) {
      console.error('Failed to fetch images:', err);
    }
  }

  return (
    <>
      <div className="mosaic-container">
          {images.map((image) => (
            <div key={image._id}>
              <Image
                src={image.url}
                alt=""
                width={0}
                height={0}
                sizes="100vw"
                className="original-image"
                unoptimized
              />
            </div>
          ))}
      </div>
    </>
  );
}
