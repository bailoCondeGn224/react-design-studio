import { useCallback, useEffect, useRef, useState } from 'react';

export interface CapturedPosition {
  latitude: number;
  longitude: number;
  /** Rayon d'incertitude en mètres. null si le point a été placé à la main. */
  accuracy: number | null;
  source: 'gps' | 'manual';
}

export type CaptureStatus = 'idle' | 'capturing' | 'success' | 'error';

/** En dessous de ce rayon, inutile de continuer à affiner. */
const TARGET_ACCURACY_M = 20;
/** Durée maximale de convergence. */
const MAX_DURATION_MS = 12000;
/** Au-delà, le point est trop grossier pour guider un livreur. */
export const POOR_ACCURACY_M = 100;

/**
 * Capture une position GPS en la laissant s'affiner.
 *
 * `getCurrentPosition` renvoie le premier point disponible, qui vient presque
 * toujours d'une triangulation Wi-Fi ou GSM précise à plusieurs centaines de
 * mètres: la puce GPS met 10 à 30 s à accrocher les satellites. On écoute donc
 * les relevés successifs pendant quelques secondes et on garde le meilleur.
 */
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
        // On ne garde un relevé que s'il est plus précis que le meilleur connu
        if (!best || best.accuracy === null || candidate.accuracy! < best.accuracy) {
          bestRef.current = candidate;
          // Affichage temps réel de l'affinage pendant la capture
          setPosition(candidate);
        }

        if (candidate.accuracy !== null && candidate.accuracy <= TARGET_ACCURACY_M) {
          finish();
        }
      },
      (err) => {
        // Une erreur ponctuelle n'annule pas la capture si on a déjà un point
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

  /** Point repositionné à la main par le client sur la carte. */
  const setManualPosition = useCallback(
    (latitude: number, longitude: number) => {
      stopWatching();
      // accuracy null: un point pointé du doigt n'a pas d'incertitude de mesure
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
