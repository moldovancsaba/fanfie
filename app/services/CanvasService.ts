import { fabric } from 'fabric';
import { MonitoringService } from './MonitoringService';

export type CanvasOptions = {
    width: number;
    height: number;
    backgroundColor?: string;
};

export type ImageOptions = {
    scale?: number;
    left?: number;
    top?: number;
    selectable?: boolean;
    originX?: 'left' | 'center' | 'right';
    originY?: 'top' | 'center' | 'bottom';
};

export class CanvasService {
    private canvas: fabric.Canvas | null = null;
    private readonly mountedRef: React.MutableRefObject<boolean>;
    private monitoring = MonitoringService.getInstance();

    constructor(mountedRef: React.MutableRefObject<boolean>) {
        this.mountedRef = mountedRef;
    }

    async initialize(canvasElement: HTMLCanvasElement, options: CanvasOptions): Promise<void> {
        const startTime = this.monitoring.startOperation('initialize');
        try {
            // Initialize Fabric.js canvas
            this.canvas = new fabric.Canvas(canvasElement, {
                width: options.width,
                height: options.height,
                backgroundColor: options.backgroundColor || '#ffffff',
                selection: false, // Disable group selection by default
                preserveObjectStacking: true // Maintain object stacking order
            });

            // Enable touch events
            if (this.canvas) {
                this.canvas.enablePointerEvents = true;
            }

            // Setup event listeners
            this.setupEventListeners();
        } catch (error) {
            console.error('Failed to initialize canvas:', error);
            this.monitoring.logError('initialize', error as Error);
            throw new Error('Canvas initialization failed');
        } finally {
            this.monitoring.endOperation('initialize', startTime);
        }
    }

    private setupEventListeners(): void {
        if (!this.canvas) return;

        // Handle object selection
        this.canvas.on('selection:created', (e) => {
            const activeObject = e.target;
            if (activeObject instanceof fabric.IText) {
                activeObject.enterEditing();
            }
        });

        // Handle object modification
        this.canvas.on('object:modified', () => {
            this.canvas.renderAll();
        });
    }

    async loadImage(url: string, options: ImageOptions = {}): Promise<void> {
        const startTime = this.monitoring.startOperation('loadImage');
        if (!this.canvas) {
            this.monitoring.logError('loadImage', new Error('Canvas not initialized'));
            this.monitoring.endOperation('loadImage', startTime);
            throw new Error('Canvas not initialized');
        }

        try {
            return await new Promise((resolve, reject) => {
                fabric.Image.fromURL(
                    url,
                    (img) => {
                        if (!this.mountedRef.current || !this.canvas) {
                            reject(new Error('Component unmounted or canvas disposed'));
                            return;
                        }

                        if (!img) {
                            reject(new Error('Failed to load image'));
                            return;
                        }

                        // Apply default image options
                        const defaultOptions: ImageOptions = {
                            originX: 'center',
                            originY: 'center',
                            left: this.canvas.width ? this.canvas.width / 2 : 0,
                            top: this.canvas.height ? this.canvas.height / 2 : 0,
                            selectable: false,
                            ...options
                        };

                        // Calculate scale if not provided
                        if (!options.scale && this.canvas.width && this.canvas.height) {
                            const scale = Math.min(
                                this.canvas.width / (img.width || 1),
                                this.canvas.height / (img.height || 1)
                            );
                            img.scale(scale);
                        }

                        // Apply all options
                        img.set(defaultOptions);

                        // Add to canvas and render
                        this.canvas.add(img);
                        this.canvas.renderAll();
                        resolve();
                    },
                    {
                        crossOrigin: 'anonymous'
                    }
                );
            });
        } catch (error) {
            console.error('Error loading image:', error);
            this.monitoring.logError('loadImage', error as Error);
            throw error;
        } finally {
            this.monitoring.endOperation('loadImage', startTime);
        }
    }

    addText(text: string, options: fabric.ITextOptions = {}): void {
        const startTime = this.monitoring.startOperation('addText');
        if (!this.canvas) {
            this.monitoring.logError('addText', new Error('Canvas not initialized'));
            this.monitoring.endOperation('addText', startTime);
            throw new Error('Canvas not initialized');
        }

        try {
            const defaultOptions: fabric.ITextOptions = {
                left: this.canvas.width ? this.canvas.width / 2 : 0,
                top: this.canvas.height ? this.canvas.height / 2 : 0,
                originX: 'center',
                originY: 'center',
                selectable: true,
                editable: true,
                ...options
            };

            const textObject = new fabric.IText(text, defaultOptions);
            this.canvas.add(textObject);
            this.canvas.setActiveObject(textObject);
            this.canvas.renderAll();
        } catch (error) {
            console.error('Error adding text:', error);
            this.monitoring.logError('addText', error as Error);
            throw error;
        } finally {
            this.monitoring.endOperation('addText', startTime);
        }
    }

    cleanup(): void {
        const startTime = this.monitoring.startOperation('cleanup');
        if (this.canvas) {
            try {
                // Remove event listeners
                this.canvas.off();
                // Remove all objects
                this.canvas.clear();
                // Dispose canvas
                this.canvas.dispose();
                this.canvas = null;
            } catch (error) {
                console.error('Error during canvas cleanup:', error);
                this.monitoring.logError('cleanup', error as Error);
            } finally {
                this.monitoring.endOperation('cleanup', startTime);
            }
        }
    }

    getCanvas(): fabric.Canvas | null {
        return this.canvas;
    }

    isInitialized(): boolean {
        return this.canvas !== null;
    }

    // Add method to set active object
    setActiveObject(object: fabric.Object): boolean {
        if (!this.canvas) return false;
        return this.canvas.setActiveObject(object);
    }

    // Add method to get active object
    getActiveObject(): fabric.Object | null {
        if (!this.canvas) return null;
        return this.canvas.getActiveObject();
    }

    // Add method to deselect active object
    discardActiveObject(): void {
        if (!this.canvas) return;
        this.canvas.discardActiveObject();
        this.canvas.renderAll();
    }
}

