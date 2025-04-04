export interface CameraProps {
  onCapture: (imageData: string) => void;
  onError: (error: Error) => void;
}

export interface CameraState {
  stream: MediaStream | null;
  error: Error | null;
  isLoading: boolean;
  hasPermission: boolean;
}

