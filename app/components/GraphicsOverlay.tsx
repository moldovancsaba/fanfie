/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useRef, useState } from 'react';
import { CanvasService } from '../services/CanvasService';

interface GraphicsOverlayProps {
  imageUrl: string;
  onSave: (editedImage: string) => void;
  onClose: () => void;
}


export default function GraphicsOverlay({ imageUrl, onSave, onClose }: GraphicsOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasService, setCanvasService] = useState<CanvasService | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const initCanvas = async () => {
      if (!canvasRef.current || canvasService) return;
      
      try {
        setLoading(true);
        setError(null);
        
        console.log('Initializing canvas...');
        
        const service = new CanvasService(mountedRef);
        await service.initialize(canvasRef.current, {
          width: 800,
          height: 600,
          backgroundColor: '#f0f0f0'
        });
        
        setCanvasService(service);
        
        if (imageUrl) {
          console.log('Loading image:', imageUrl.substring(0, 50) + '...');
          await service.loadImage(imageUrl);
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
      if (canvasService) {
        canvasService.cleanup();
      }
    };
  }, [imageUrl, canvasService]);

  const addText = async () => {
    if (!canvasService) return;
    
    try {
      canvasService.addText('Double click to edit', {
        left: 100,
        top: 100,
        fontSize: 20,
        fill: '#000000',
        fontFamily: 'Arial'
      });
    } catch (error) {
      console.error('Error adding text:', error);
      setError('Failed to add text. Please try again.');
    }
  };

  const addSticker = async (emoji: string) => {
    if (!canvasService) return;
    
    try {
      canvasService.addText(emoji, {
        left: 150,
        top: 150,
        fontSize: 40,
        selectable: true,
        hasControls: true
      });
    } catch (error) {
      console.error('Error adding sticker:', error);
      setError('Failed to add sticker. Please try again.');
    }
  };

  const handleSave = () => {
    const canvas = canvasService?.getCanvas();
    if (canvas) {
      const dataUrl = canvas.toDataURL({
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
