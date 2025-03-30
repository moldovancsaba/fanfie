type CanvasOptions = {
  width?: number;
  height?: number;
  backgroundColor?: string;
}

export interface FabricCanvas {
  add: (object: unknown) => void;
  renderAll: () => void;
  dispose: () => void;
  setActiveObject: (object: unknown) => void;
  setBackgroundImage: (image: unknown, callback: () => void) => void;
  toDataURL: (options?: { format?: string; quality?: number }) => string;
  width: number;
  height: number;
}

export interface FabricImage {
  width?: number;
  height?: number;
  scale: (value: number) => void;
  set: (options: {
    originX?: string;
    originY?: string;
    left?: number;
    top?: number;
  }) => void;
}

export interface FabricModule {
  Canvas: {
    new (element: string | HTMLCanvasElement | undefined, options?: CanvasOptions): FabricCanvas;
  };
  Image: {
    fromURL: (url: string, callback: (img: FabricImage) => void) => void;
  };
  IText: {
    new (text: string, options?: {
      left?: number;
      top?: number;
      fontSize?: number;
      fill?: string;
      fontFamily?: string;
    }): unknown;
  };
  Text: {
    new (text: string, options?: {
      left?: number;
      top?: number;
      fontSize?: number;
      selectable?: boolean;
      hasControls?: boolean;
    }): unknown;
  };
}
