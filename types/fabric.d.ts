declare module 'fabric' {
  export interface Canvas {
    add(object: any): Canvas;
    renderAll(): void;
    dispose(): void;
    setActiveObject(object: any): Canvas;
    setBackgroundImage(image: any, callback: () => void): void;
    toDataURL(options?: { format?: string; quality?: number }): string;
    width: number;
    height: number;
  }
  
  export interface Image {
    width?: number;
    height?: number;
    scale(value: number): Image;
    set(options: {
      originX?: string;
      originY?: string;
      left?: number;
      top?: number;
    }): Image;
  }
  
  export interface IText {
    set(options: any): IText;
  }
  
  export interface Text {
    set(options: any): Text;
  }
  
  export interface StaticCanvas extends Canvas {}
  
  const fabric: {
    Canvas: {
      new (element: string | HTMLCanvasElement, options?: {
        width?: number;
        height?: number;
        backgroundColor?: string;
      }): Canvas;
    };
    StaticCanvas: typeof Canvas;
    Image: {
      fromURL(url: string, callback: (img: Image) => void): void;
    };
    IText: {
      new (text: string, options?: {
        left?: number;
        top?: number;
        fontSize?: number;
        fill?: string;
        fontFamily?: string;
      }): IText;
    };
    Text: {
      new (text: string, options?: {
        left?: number;
        top?: number;
        fontSize?: number;
        selectable?: boolean;
        hasControls?: boolean;
      }): Text;
    };
  };
  
  export default fabric;
}
