'use client';

import { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { FaArrowLeft, FaFont, FaLayerGroup, FaSave, FaTrash } from 'react-icons/fa';

interface GraphicsOverlayProps {
  image: string; // base64 image data
  onBack?: () => void; // optional callback to return to camera
  onSave?: (finalImage: string) => void; // optional callback for when image is saved
}

interface FontOptions {
  size: number;
  family: string;
  color: string;
}

interface CanvasElement {
  id: string;
  type: 'text' | 'image';
  zIndex: number;
  fabricObject: fabric.Object;
}

export default function GraphicsOverlay({ image, onBack, onSave }: GraphicsOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fontOptions, setFontOptions] = useState<FontOptions>({
    size: 36,
    family: 'Arial',
    color: '#000000',
  });

  // Initialize canvas and load image
  useEffect(() => {
    if (!canvasRef.current || !canvasContainerRef.current) return;

    const canvasContainer = canvasContainerRef.current;
    const containerWidth = canvasContainer.clientWidth;
    const containerHeight = canvasContainer.clientHeight;

    // Create canvas with dimensions matching the container
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: containerWidth,
      height: containerHeight,
      backgroundColor: '#f0f0f0',
      preserveObjectStacking: true,
      selection: true,
    });

    // Load the image as background
    fabric.Image.fromURL(image, (img) => {
      // Calculate scale to fit the canvas while maintaining aspect ratio
      const imgWidth = img.width || 1;
      const imgHeight = img.height || 1;
      const scale = Math.min(
        containerWidth / imgWidth,
        containerHeight / imgHeight
      );

      img.scale(scale);
      img.set({
        left: (containerWidth - imgWidth * scale) / 2,
        top: (containerHeight - imgHeight * scale) / 2,
        selectable: false,
        evented: false,
      });

      fabricCanvas.add(img);
      fabricCanvas.sendToBack(img);
      fabricCanvas.renderAll();

      // Set background image ID for reference
      img.set('id', 'background-image');
    }, { crossOrigin: 'anonymous' });

    // Handle window resize
    const handleResize = () => {
      if (!canvasContainer) return;
      
      const newWidth = canvasContainer.clientWidth;
      const newHeight = canvasContainer.clientHeight;
      
      fabricCanvas.setDimensions({
        width: newWidth,
        height: newHeight,
      });
      
      fabricCanvas.renderAll();
    };

    window.addEventListener('resize', handleResize);

    // Handle object selection
    fabricCanvas.on('selection:created', (e) => {
      if (e.selected && e.selected[0]) {
        const id = e.selected[0].get('id') as string;
        if (id && id !== 'background-image') {
          setSelectedElement(id);
        }
      }
    });

    fabricCanvas.on('selection:updated', (e) => {
      if (e.selected && e.selected[0]) {
        const id = e.selected[0].get('id') as string;
        if (id && id !== 'background-image') {
          setSelectedElement(id);
        }
      }
    });

    fabricCanvas.on('selection:cleared', () => {
      setSelectedElement(null);
    });

    setCanvas(fabricCanvas);

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      fabricCanvas.dispose();
      setCanvas(null);
    };
  }, [image]);

  // Function to add text to canvas
  const addText = () => {
    if (!canvas) return;

    try {
      const text = new fabric.IText('Double-click to edit', {
        left: canvas.width! / 2,
        top: canvas.height! / 2,
        fontFamily: fontOptions.family,
        fontSize: fontOptions.size,
        fill: fontOptions.color,
        originX: 'center',
        originY: 'center',
        centeredRotation: true,
      });

      const id = `text-${Date.now()}`;
      text.set('id', id);

      canvas.add(text);
      canvas.setActiveObject(text);
      canvas.renderAll();

      // Add to elements array for z-index management
      const newElement: CanvasElement = {
        id,
        type: 'text',
        zIndex: canvas.getObjects().length - 1, // -1 because background is at index 0
        fabricObject: text,
      };

      setElements((prev) => [...prev, newElement]);
      setSelectedElement(id);
    } catch (err) {
      setError('Failed to add text. Please try again.');
      console.error('Error adding text:', err);
    }
  };

  // Function to update text properties
  const updateTextProperties = (textObj: fabric.IText, options: Partial<FontOptions>) => {
    if (options.family) textObj.set('fontFamily', options.family);
    if (options.size) textObj.set('fontSize', options.size);
    if (options.color) textObj.set('fill', options.color);
    
    canvas?.renderAll();
  };

  // Function to update selected element's font properties
  const updateSelectedElementFont = (options: Partial<FontOptions>) => {
    if (!canvas || !selectedElement) return;

    const updatedOptions = { ...fontOptions, ...options };
    setFontOptions(updatedOptions);

    const selectedObj = canvas.getObjects().find(
      (obj) => obj.get('id') === selectedElement
    );

    if (selectedObj && selectedObj.type === 'i-text') {
      updateTextProperties(selectedObj as fabric.IText, updatedOptions);
    }
  };

  // Function to change layer order (move up or down)
  const changeElementLayer = (direction: 'up' | 'down') => {
    if (!canvas || !selectedElement) return;

    try {
      const activeObject = canvas.getActiveObject();
      if (!activeObject) return;

      if (direction === 'up') {
        canvas.bringForward(activeObject);
      } else {
        canvas.sendBackward(activeObject);
        
        // Make sure background image stays at the very back
        const backgroundImg = canvas.getObjects().find(obj => obj.get('id') === 'background-image');
        if (backgroundImg) {
          canvas.sendToBack(backgroundImg);
        }
      }

      // Update z-index values in our elements state
      const updatedElements = [...elements].sort((a, b) => {
        const aIndex = canvas.getObjects().findIndex(obj => obj.get('id') === a.id);
        const bIndex = canvas.getObjects().findIndex(obj => obj.get('id') === b.id);
        return aIndex - bIndex;
      });

      setElements(updatedElements);
      canvas.renderAll();
    } catch (err) {
      setError('Failed to change layer order. Please try again.');
      console.error('Error changing layer order:', err);
    }
  };

  // Function to delete selected element
  const deleteSelectedElement = () => {
    if (!canvas || !selectedElement) return;

    try {
      const activeObject = canvas.getActiveObject();
      if (!activeObject) return;

      canvas.remove(activeObject);
      setElements((prev) => prev.filter((el) => el.id !== selectedElement));
      setSelectedElement(null);
      canvas.renderAll();
    } catch (err) {
      setError('Failed to delete element. Please try again.');
      console.error('Error deleting element:', err);
    }
  };

  // Function to save the canvas as an image
  const saveCanvas = () => {
    if (!canvas) return;

    try {
      // Temporarily disable selection borders and controls
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        canvas.discardActiveObject();
      }
      canvas.renderAll();

      // Get canvas data URL
      const dataUrl = canvas.toDataURL({
        format: 'png',
        quality: 0.8,
      });

      // Re-enable selection if there was an active object
      if (activeObject) {
        canvas.setActiveObject(activeObject);
        canvas.renderAll();
      }

      // Call onSave callback if provided
      if (onSave) {
        onSave(dataUrl);
      } else {
        // Fallback: trigger download
        const link = document.createElement('a');
        link.download = `fanfie-${new Date().toISOString().slice(0, 10)}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      setError('Failed to save canvas. Please try again.');
      console.error('Error saving canvas:', err);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with controls */}
      <div className="flex justify-between items-center p-4 bg-gray-100">
        <button 
          onClick={onBack} 
          className="flex items-center gap-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
        >
          <FaArrowLeft /> Back
        </button>
        
        <div className="flex gap-2">
          {/* Font size control */}
          <select 
            value={fontOptions.size}
            onChange={(e) => updateSelectedElementFont({ size: Number(e.target.value) })}
            className="px-2 py-1 border rounded"
            disabled={!selectedElement || !selectedElement.includes('text')}
          >
            {[12, 16, 20, 24, 36, 48, 64].map((size) => (
              <option key={size} value={size}>{size}px</option>
            ))}
          </select>
          
          {/* Font family control */}
          <select 
            value={fontOptions.family}
            onChange={(e) => updateSelectedElementFont({ family: e.target.value })}
            className="px-2 py-1 border rounded"
            disabled={!selectedElement || !selectedElement.includes('text')}
          >
            {['Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Comic Sans MS'].map((font) => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>
          
          {/* Font color control */}
          <input 
            type="color" 
            value={fontOptions.color}
            onChange={(e) => updateSelectedElementFont({ color: e.target.value })}
            className="w-8 h-8 border rounded cursor-pointer"
            disabled={!selectedElement || !selectedElement.includes('text')}
          />
        </div>
        
        <button 
          onClick={saveCanvas} 
          className="flex items-center gap-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
        >
          <FaSave /> Save
        </button>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="p-2 bg-red-100 text-red-700 text-center">
          {error}
          <button 
            onClick={() => setError(null)} 
            className="ml-2 text-red-700 font-bold"
          >
            ×
          </button>
        </div>
      )}
      
      {/* Canvas container */}
      <div className="relative flex-grow">
        <div 
          ref={canvasContainerRef} 
          className="w-full h-full relative bg-gray-800"
        >
          <canvas ref={canvasRef} className="absolute inset-0" />
        </div>
        
        {/* Editing tools sidebar */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 bg-white p-2 rounded-md shadow-md">
          <button 
            onClick={addText}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            title="Add Text"
          >
            <FaFont />
          </button>
          
          {selectedElement && (
            <>
              <button 
                onClick={() => changeElementLayer('up')}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                title="Bring Forward"
              >
                <FaLayerGroup />
              </button>
              
              <button 
                onClick={deleteSelectedElement}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                title="Delete Element"
              >
                <FaTrash />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

