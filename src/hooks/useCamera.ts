import { useState, useRef, useCallback, useEffect } from 'react';

export interface UseCameraOptions {
  facingMode?: 'user' | 'environment';
  width?: number;
  height?: number;
}

export const useCamera = (options: UseCameraOptions = {}) => {
  const {
    facingMode = 'environment', // Caméra arrière par défaut
    width = 1280,
    height = 720,
  } = options;

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    // Vérifier si l'API MediaDevices est supportée
    setIsSupported('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices);
  }, []);

  const startCamera = useCallback(async () => {
    if (!isSupported) {
      setError('La caméra n\'est pas supportée sur cet appareil');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: width },
          height: { ideal: height },
        },
        audio: false,
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }

      setIsLoading(false);
      return true;
    } catch (err) {
      setIsLoading(false);

      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Permission d\'accès à la caméra refusée');
        } else if (err.name === 'NotFoundError') {
          setError('Aucune caméra trouvée sur cet appareil');
        } else if (err.name === 'NotReadableError') {
          setError('La caméra est déjà utilisée par une autre application');
        } else {
          setError(`Erreur lors de l'accès à la caméra: ${err.message}`);
        }
      } else {
        setError('Erreur inconnue lors de l\'accès à la caméra');
      }

      return false;
    }
  }, [facingMode, width, height, isSupported]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  const capturePhoto = useCallback((): string | null => {
    if (!videoRef.current || !stream) {
      return null;
    }

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const context = canvas.getContext('2d');
    if (!context) {
      return null;
    }

    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL('image/jpeg', 0.95);
  }, [stream]);

  const switchCamera = useCallback(async () => {
    stopCamera();
    // Inverser la caméra (avant <-> arrière)
    // Cette fonctionnalité nécessite de recréer le hook avec l'autre facingMode
    // Pour une implémentation complète, il faudrait gérer cela différemment
    return startCamera();
  }, [stopCamera, startCamera]);

  // Nettoyer le stream quand le composant est démonté
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    stream,
    isLoading,
    error,
    isSupported,
    isActive: !!stream,
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera,
  };
};
