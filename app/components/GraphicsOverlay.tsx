'use client';

import { useEffect, useRef } from 'react';
import { fabric } from 'fabric';

interface GraphicsOverlayProps {
  imageUrl?: string;
  onSave?: (dataUrl: string) => void;
}

export default function GraphicsOverlay({ imageUrl, onSave }: GraphicsOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    if (canvasRef.current && !fabricCanvasRef.current) {
      // Initialize Fabric canvas
      fabricCanvasRef.current = new fabric.Canvas(canvasRef.current, {
        width: 800,
        height: 600,
      });
    }

    if (imageUrl && fabricCanvasRef.current) {
      // Load background image
      fabric.Image.fromURL(imageUrl, (img) => {
        if (fabricCanvasRef.current) {
          // Scale image to fit canvas
          const scale = Math.min(
            fabricCanvasRef.current.width! / img.width!,
            fabricCanvasRef.current.height! / img.height!
          );
          
          img.scale(scale);
          
          // Center the image
          img.set({
            left: (fabricCanvasRef.current.width! - img.width! * scale) / 2,
            top: (fabricCanvasRef.current.height! - img.height! * scale) / 2,
          });

          fabricCanvasRef.current.setBackgroundImage(img, fabricCanvasRef.current.renderAll.bind(fabricCanvasRef.current));
        }
      });
    }

    return () => {
      // Cleanup
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, [imageUrl]);

  const addText = () => {
    if (fabricCanvasRef.current) {
      const text = new fabric.IText('Double click to edit', {
        left: 100,
        top: 100,
        fontSize: 20,
        fill: '#ffffff',
        stroke: '#000000',
        strokeWidth: 1,
      });
      fabricCanvasRef.current.add(text);
    }
  };

  const addSticker = (emoji: string) => {
    if (fabricCanvasRef.current) {
      const text = new fabric.Text(emoji, {
        left: 150,
        top: 150,
        fontSize: 40,
      });
      fabricCanvasRef.current.add(text);
    }
  };

  const saveCanvas = () => {
    if (fabricCanvasRef.current && onSave) {
      const dataUrl = fabricCanvasRef.current.toDataURL();
      onSave(dataUrl);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas ref={canvasRef} className="border border-gray-300 rounded-lg" />
      <div className="flex gap-2">
        <button
          onClick={addText}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Text
        </button>
        <button
          onClick={() => addSticker('🌟')}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Add Star
        </button>
        <button
          onClick={() => addSticker('❤️')}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Add Heart
        </button>
        <button
          onClick={saveCanvas}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Save
        </button>
      </div>
    </div>
  );
}
