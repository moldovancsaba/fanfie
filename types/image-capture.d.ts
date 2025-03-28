interface ImageCaptureConstructor {
  new (track: MediaStreamTrack): ImageCapture;
  prototype: ImageCapture;
}

interface ImageCapture {
  grabFrame(): Promise<ImageBitmap>;
  takePhoto(): Promise<Blob>;
}

declare var ImageCapture: ImageCaptureConstructor;

interface ImageCaptureOptions {
  imageHeight?: number;
  imageWidth?: number;
}

declare class ImageCapture {
  constructor(videoTrack: MediaStreamTrack);
  grabFrame(): Promise<ImageBitmap>;
  takePhoto(options?: ImageCaptureOptions): Promise<Blob>;
}

