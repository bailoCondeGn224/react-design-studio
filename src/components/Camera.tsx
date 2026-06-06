import { useEffect } from 'react';
import { Camera as CameraIcon, FlipHorizontal, X, Loader2 } from 'lucide-react';
import { useCamera } from '@/hooks/useCamera';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CameraProps {
  onCapture?: (dataUrl: string) => void;
  onClose?: () => void;
  facingMode?: 'user' | 'environment';
  className?: string;
}

export const Camera = ({
  onCapture,
  onClose,
  facingMode = 'environment',
  className,
}: CameraProps) => {
  const {
    videoRef,
    isLoading,
    error,
    isSupported,
    isActive,
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera,
  } = useCamera({ facingMode });

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const handleCapture = () => {
    const photo = capturePhoto();
    if (photo && onCapture) {
      onCapture(photo);
    }
  };

  const handleClose = () => {
    stopCamera();
    if (onClose) {
      onClose();
    }
  };

  if (!isSupported) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <CameraIcon className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Caméra non supportée</h3>
        <p className="text-sm text-muted-foreground">
          Votre appareil ne supporte pas l'accès à la caméra.
        </p>
        {onClose && (
          <Button onClick={onClose} variant="outline" className="mt-4">
            Fermer
          </Button>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <CameraIcon className="w-16 h-16 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Erreur d'accès à la caméra</h3>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <div className="flex gap-2">
          <Button onClick={startCamera} variant="outline">
            Réessayer
          </Button>
          {onClose && (
            <Button onClick={onClose} variant="outline">
              Fermer
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative w-full h-full bg-black', className)}>
      {/* Video Stream */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-center text-white">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-2" />
            <p>Chargement de la caméra...</p>
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      {isActive && (
        <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center justify-center gap-4">
            {/* Close Button */}
            {onClose && (
              <Button
                onClick={handleClose}
                variant="outline"
                size="icon"
                className="rounded-full w-12 h-12 bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <X className="w-6 h-6" />
              </Button>
            )}

            {/* Capture Button */}
            <Button
              onClick={handleCapture}
              size="icon"
              className="rounded-full w-16 h-16 bg-white text-black hover:bg-white/90"
            >
              <CameraIcon className="w-8 h-8" />
            </Button>

            {/* Switch Camera Button */}
            <Button
              onClick={switchCamera}
              variant="outline"
              size="icon"
              className="rounded-full w-12 h-12 bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <FlipHorizontal className="w-6 h-6" />
            </Button>
          </div>
        </div>
      )}

      {/* Top Bar with Close Button */}
      {onClose && (
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent">
          <Button
            onClick={handleClose}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>
      )}
    </div>
  );
};
