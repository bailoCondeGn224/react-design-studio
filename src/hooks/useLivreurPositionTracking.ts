import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  ArriveeSignalee,
  useUpdateLivreurPosition,
} from '@/hooks/useLivreurOrders';
import { distanceInMeters } from '@/lib/geo';

export type GeoStatus =
  | 'starting'
  | 'active'
  | 'denied'
  | 'unavailable'
  | 'unsupported';

/** Intervalle minimum entre deux envois quand le livreur se déplace. */
const MIN_INTERVAL_MS = 15000;
/** Déplacement minimum pour déclencher un envoi. */
const MIN_DISTANCE_M = 50;
/**
 * Envoi systématique passé ce délai, même à l'arrêt: sans ça `watchPosition` ne
 * déclenche plus rien quand le livreur ne bouge pas, et le client le croirait
 * hors ligne alors qu'il est simplement au feu rouge.
 */
const HEARTBEAT_MS = 60000;
/** Fréquence de vérification du heartbeat. */
const HEARTBEAT_CHECK_MS = 20000;

/**
 * Suit la position du livreur et l'envoie au serveur en limitant le débit.
 *
 * Sans limitation, `watchPosition` en `enableHighAccuracy` peut déclencher
 * plusieurs fois par seconde en voiture — coûteux en batterie, en forfait data
 * et en charge serveur.
 */
export const useLivreurPositionTracking = (enabled = true) => {
  const updatePosition = useUpdateLivreurPosition();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<GeoStatus>('starting');
  const [lastSentAt, setLastSentAt] = useState<Date | null>(null);
  /** Arrivées détectées par le serveur au dernier relevé envoyé. */
  const [arrivees, setArrivees] = useState<ArriveeSignalee[]>([]);
  // Position affichée localement: mise à jour à chaque relevé, sans attendre
  // l'envoi au serveur — la carte du livreur doit suivre son mouvement.
  const [position, setPosition] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const latestPositionRef = useRef<{ latitude: number; longitude: number } | null>(null);
  const lastAttemptRef = useRef<{ latitude: number; longitude: number; at: number } | null>(
    null,
  );
  // La mutation change d'identité à chaque rendu: on la garde dans une ref pour
  // que l'effet ne se réabonne pas au GPS en boucle.
  const mutateRef = useRef(updatePosition.mutate);
  mutateRef.current = updatePosition.mutate;
  const queryClientRef = useRef(queryClient);
  queryClientRef.current = queryClient;

  useEffect(() => {
    if (!enabled) return;

    if (!navigator.geolocation) {
      setStatus('unsupported');
      return;
    }

    const send = (latitude: number, longitude: number) => {
      lastAttemptRef.current = { latitude, longitude, at: Date.now() };
      mutateRef.current(
        { latitude, longitude },
        {
          onSuccess: (data) => {
            setLastSentAt(new Date());

            if (data?.arrivees?.length) {
              setArrivees(data.arrivees);
              // La commande porte désormais arriveeLe: on rafraîchit la liste
              // pour que la fiche affiche l'état d'arrivée.
              queryClientRef.current.invalidateQueries({
                queryKey: ['livreur-orders'],
              });
            }
          },
        },
      );
    };

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setStatus('active');

        const { latitude, longitude } = position.coords;
        latestPositionRef.current = { latitude, longitude };
        setPosition({ latitude, longitude });

        const last = lastAttemptRef.current;
        if (!last) {
          send(latitude, longitude);
          return;
        }

        const elapsed = Date.now() - last.at;
        const moved = distanceInMeters(last.latitude, last.longitude, latitude, longitude);

        if (elapsed >= MIN_INTERVAL_MS && moved >= MIN_DISTANCE_M) {
          send(latitude, longitude);
        }
      },
      (error) => {
        setStatus(
          error.code === error.PERMISSION_DENIED ? 'denied' : 'unavailable',
        );
      },
      { enableHighAccuracy: true, maximumAge: 15000, timeout: 20000 },
    );

    // Heartbeat: réémet la dernière position connue si rien n'est parti depuis
    // une minute, pour que le boutiquier et le client sachent qu'il est toujours là.
    const heartbeat = setInterval(() => {
      const latest = latestPositionRef.current;
      const last = lastAttemptRef.current;
      if (!latest) return;
      if (last && Date.now() - last.at < HEARTBEAT_MS) return;

      send(latest.latitude, latest.longitude);
    }, HEARTBEAT_CHECK_MS);

    return () => {
      navigator.geolocation.clearWatch(watchId);
      clearInterval(heartbeat);
    };
  }, [enabled]);

  return {
    status,
    lastSentAt,
    position,
    arrivees,
    /** Acquitte l'annonce d'arrivée une fois vue par le livreur. */
    acquitterArrivees: () => setArrivees([]),
  };
};
