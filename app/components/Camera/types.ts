export interface CameraProps {
  onCapture: (imageData: string) => void;
  onError: (error: Error) => void;
  fitToScreen?: boolean; // Add option to control if camera should fit to screen
}

export interface CameraState {
  stream: MediaStream | null;
  error: Error | null;
  isLoading: boolean;
  hasPermission: boolean;
  isVideoReady: boolean;
}
