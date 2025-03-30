/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useRef, useState } from 'react';

interface GraphicsOverlayProps {
  imageUrl: string;
  onSave: (editedImage: string) => void;
  onClose: () => void;
}

interface FabricImage {
  width?: number;
  height?: number;
  scale: (value: number) => void;
  set: (options: Record<string, any>) => void;
}

let fabric: any = null;

const initFabric = async () => {
  if (!fabric) {
    const fabricModule = await import('fabric');
    fabric = fabricModule.default;
  }
  return fabric;
};

export default function GraphicsOverlay({ imageUrl, onSave, onClose }: GraphicsOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const setupCanvas = async () => {
      if (!canvasRef.current || fabricCanvasRef.current) return;
      
      try {
        const fabric = await initFabric();
        
        if (!mounted) return;
        
        fabricCanvasRef.current = new fabric.Canvas(canvasRef.current, {
          width: 800,
          height: 600,
          backgroundColor: '#ffffff',
        });
        
        if (imageUrl) {
          fabric.Image.fromURL(imageUrl, (img: FabricImage) => {
            if (!mounted || !fabricCanvasRef.current) return;

            const scale = Math.min(
              fabricCanvasRef.current.width / (img.width || 1),
              fabricCanvasRef.current.height / (img.height || 1)
            );
            
            img.scale(scale);
            img.set({
              originX: 'center',
              originY: 'center',
              left: fabricCanvasRef.current.width / 2,
              top: fabricCanvasRef.current.height / 2,
              selectable: false,
              evented: false,
            });

            fabricCanvasRef.current.add(img);
            fabricCanvasRef.current.renderAll();
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error initializing Fabric.js:', error);
        setLoading(false);
      }
    };
    
    setupCanvas();
    
    return () => {
      mounted = false;
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, [imageUrl]);

  const addText = async () => {
    if (!fabricCanvasRef.current) return;

    const fabric = await initFabric();
    const text = new fabric.IText('Double click to edit', {
      left: 100,
      top: 100,
      fontSize: 20,
      fill: '#000000',
      fontFamily: 'Arial'
    });
    
    fabricCanvasRef.current.add(text);
    fabricCanvasRef.current.setActiveObject(text);
    fabricCanvasRef.current.renderAll();
  };

  const addSticker = async (emoji: string) => {
    if (!fabricCanvasRef.current) return;

    const fabric = await initFabric();
    const text = new fabric.Text(emoji, {
      left: 150,
      top: 150,
      fontSize: 40,
      selectable: true,
      hasControls: true
    });
    
    fabricCanvasRef.current.add(text);
    fabricCanvasRef.current.setActiveObject(text);
    fabricCanvasRef.current.renderAll();
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
          <div className="flex-1">
            {loading && <div className="text-center py-4">Loading editor...</div>}
            <canvas ref={canvasRef} className="border border-gray-300 rounded-lg" />
          </div>
          
          <div className="w-48 space-y-4">
            <button
              onClick={addText}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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
                    className="p-2 text-2xl bg-gray-100 rounded hover:bg-gray-200"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={handleSave}
              className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
