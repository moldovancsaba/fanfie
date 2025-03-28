interface ImageCaptureOptions {
  imageHeight?: number;
  imageWidth?: number;
}

declare class ImageCapture {
  constructor(videoTrack: MediaStreamTrack);
  grabFrame(): Promise<ImageBitmap>;
  takePhoto(options?: ImageCaptureOptions): Promise<Blob>;
}

