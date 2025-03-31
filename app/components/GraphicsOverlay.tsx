/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useRef, useState } from 'react';

interface FabricCanvas {
    width?: number;
    height?: number;
    add(object: any): FabricCanvas;
    renderAll(): void;
    setActiveObject(object: any): boolean;
    dispose(): void;
    toDataURL(options?: { format?: string; quality?: number; multiplier?: number }): string;
}

interface FabricIText {
    set(options: Record<string, any>): void;
}

interface FabricText {
    set(options: Record<string, any>): void;
}

interface GraphicsOverlayProps {
  imageUrl: string;
  onSave: (editedImage: string) => void;
  onClose: () => void;
}


export default function GraphicsOverlay({ imageUrl, onSave, onClose }: GraphicsOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadImage = async (canvas: FabricCanvas, url: string): Promise<void> => {
    try {
      const { default: fabric } = await import('fabric');
      
      if (!fabric) {
        throw new Error('Failed to load fabric.js library');
      }
      
      return new Promise((resolve, reject) => {
        // Go back to using the callback pattern as it's the recommended approach
        fabric.Image.fromURL(
          url,
          (img) => {
            if (!mountedRef.current || !canvas) {
              reject(new Error('Component unmounted'));
              return;
            }

            if (!img) {
              reject(new Error('Failed to load image'));
              return;
            }

            console.log('Image loaded with dimensions:', {
              width: img.width,
              height: img.height
            });

            const containerWidth = canvas.width || 800;
            const containerHeight = canvas.height || 600;

            const scale = Math.min(
              containerWidth / (img.width || 1),
              containerHeight / (img.height || 1)
            );

            console.log('Applying scale:', scale);

            img.scale(scale);
            img.set({
              originX: 'center',
              originY: 'center',
              left: containerWidth / 2,
              top: containerHeight / 2,
              selectable: false,
              evented: false,
            });

            canvas.add(img);
            canvas.renderAll();
            resolve();
          },
          { crossOrigin: 'anonymous' as const }
        );
      });
    } catch (error) {
      console.error('Error loading image:', error);
      throw new Error('Failed to load image: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  useEffect(() => {
    
    const initCanvas = async () => {
      if (!canvasRef.current || fabricCanvasRef.current) return;
      
      try {
        setLoading(true);
        setError(null);
        
        console.log('Initializing canvas...');
        
        // Dynamically import fabric.js
        const { default: fabric } = await import('fabric');
        
        if (!fabric) {
          throw new Error('Failed to load fabric.js library');
        }
        
        console.log('Fabric.js loaded successfully');
        
        const containerWidth = 800;
        const containerHeight = 600;
        
        // Set initial canvas element size
        canvasRef.current.width = containerWidth;
        canvasRef.current.height = containerHeight;
        
        const canvas = new fabric.Canvas(canvasRef.current, {
          width: containerWidth,
          height: containerHeight,
          backgroundColor: '#f0f0f0',
          preserveObjectStacking: true,
        });
        
        fabricCanvasRef.current = canvas;
        
        if (imageUrl) {
          console.log('Loading image:', imageUrl.substring(0, 50) + '...');
          await loadImage(canvas, imageUrl);
        } else {
          throw new Error('No image URL provided');
        }
        
        if (mountedRef.current) {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in canvas setup:', error);
        if (mountedRef.current) {
          setError(error instanceof Error ? error.message : 'Failed to initialize editor');
          setLoading(false);
        }
      }
    };
    
    initCanvas();
    
    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, [imageUrl]);

  const addText = async () => {
    if (!fabricCanvasRef.current) return;
    
    try {
      // Dynamically import fabric.js for text
      const { default: fabric } = await import('fabric');
      
      if (!fabric) {
        throw new Error('Failed to load fabric.js library');
      }
      
      const text: FabricIText = new fabric.IText('Double click to edit', {
        left: 100,
        top: 100,
        fontSize: 20,
        fill: '#000000',
        fontFamily: 'Arial'
      });
      
      fabricCanvasRef.current.add(text);
      fabricCanvasRef.current.setActiveObject(text);
      fabricCanvasRef.current.renderAll();
    } catch (error) {
      console.error('Error adding text:', error);
      setError('Failed to add text. Please try again.');
    }
  };
  const addSticker = async (emoji: string) => {
    if (!fabricCanvasRef.current) return;
    
    try {
      // Dynamically import fabric.js for sticker
      const { default: fabric } = await import('fabric');
      
      if (!fabric) {
        throw new Error('Failed to load fabric.js library');
      }
      
      const text: FabricText = new fabric.Text(emoji, {
        left: 150,
        top: 150,
        fontSize: 40,
        selectable: true,
        hasControls: true
      });
      
      fabricCanvasRef.current.add(text);
      fabricCanvasRef.current.setActiveObject(text);
      fabricCanvasRef.current.renderAll();
    } catch (error) {
      console.error('Error adding sticker:', error);
      setError('Failed to add sticker. Please try again.');
    }
  };
  const handleSave = () => {
    if (fabricCanvasRef.current) {
      const dataUrl = fabricCanvasRef.current.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 1
      });
      onSave(dataUrl);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-6xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Edit Your Photo</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex gap-4">
          <div className="flex-1 relative">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80 rounded-lg z-10">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p className="text-gray-600">Loading editor...</p>
                </div>
              </div>
            )}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-50 rounded-lg z-10">
                <div className="text-center p-4">
                  <p className="text-red-600 mb-2">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}
            <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
              <canvas 
                ref={canvasRef} 
                className="max-w-full max-h-full object-contain" 
                style={{
                  width: '800px',
                  height: '600px',
                }}
              />
            </div>
          </div>
          
          <div className="w-48 space-y-4">
            <button
              onClick={addText}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !!error}
            >
              Add Text
            </button>
            
            <div>
              <h3 className="font-medium mb-2">Stickers</h3>
              <div className="grid grid-cols-3 gap-2">
                {['❤️', '⭐', '🌟', '✨', '🎵', '🎨'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => addSticker(emoji)}
                    className="p-2 text-2xl bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading || !!error}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={handleSave}
              className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !!error}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
