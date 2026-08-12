import { useCallback, useEffect, useRef, useState } from 'react';

export interface CapturedPosition {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  source: 'gps' | 'manual';
}

export type CaptureStatus = 'idle' | 'capturing' | 'success' | 'error';

const TARGET_ACCURACY_M = 20;
const MAX_DURATION_MS = 12000;
export const POOR_ACCURACY_M = 100;

export const useAccuratePosition = () => {
  const [position, setPosition] = useState<CapturedPosition | null>(null);
  const [status, setStatus] = useState<CaptureStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bestRef = useRef<CapturedPosition | null>(null);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => stopWatching, [stopWatching]);

  const capture = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('error');
      setError('Géolocalisation non supportée par votre navigateur');
      return;
    }

    stopWatching();
    bestRef.current = null;
    setError(null);
    setStatus('capturing');

    const finish = () => {
      stopWatching();
      if (bestRef.current) {
        setPosition(bestRef.current);
        setStatus('success');
      } else {
        setStatus('error');
        setError('Impossible d’obtenir votre position. Réessayez à l’extérieur.');
      }
    };

    timeoutRef.current = setTimeout(finish, MAX_DURATION_MS);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const candidate: CapturedPosition = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          source: 'gps',
        };

        const best = bestRef.current;
        if (!best || best.accuracy === null || candidate.accuracy! < best.accuracy) {
          bestRef.current = candidate;
          setPosition(candidate);
        }

        if (candidate.accuracy !== null && candidate.accuracy <= TARGET_ACCURACY_M) {
          finish();
        }
      },
      (err) => {
        if (bestRef.current) return;

        stopWatching();
        setStatus('error');
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Accès à la localisation refusé. Activez la géolocalisation.');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Position indisponible. Vérifiez votre GPS.');
            break;
          case err.TIMEOUT:
            setError('Délai dépassé. Réessayez.');
            break;
          default:
            setError('Erreur de géolocalisation.');
        }
      },
      { enableHighAccuracy: true, timeout: MAX_DURATION_MS, maximumAge: 0 },
    );
  }, [stopWatching]);

  const setManualPosition = useCallback(
    (latitude: number, longitude: number) => {
      stopWatching();
      setPosition({ latitude, longitude, accuracy: null, source: 'manual' });
      setStatus('success');
      setError(null);
    },
    [stopWatching],
  );

  const reset = useCallback(() => {
    stopWatching();
    bestRef.current = null;
    setPosition(null);
    setStatus('idle');
    setError(null);
  }, [stopWatching]);

  return { position, status, error, capture, setManualPosition, reset };
};
