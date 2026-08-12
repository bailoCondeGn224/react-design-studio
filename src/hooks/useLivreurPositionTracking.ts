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

const MIN_INTERVAL_MS = 15000;
const MIN_DISTANCE_M = 50;
const HEARTBEAT_MS = 60000;
const HEARTBEAT_CHECK_MS = 20000;

export const useLivreurPositionTracking = (enabled = true) => {
  const updatePosition = useUpdateLivreurPosition();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<GeoStatus>('starting');
  const [lastSentAt, setLastSentAt] = useState<Date | null>(null);
  const [arrivees, setArrivees] = useState<ArriveeSignalee[]>([]);
  const [position, setPosition] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const latestPositionRef = useRef<{ latitude: number; longitude: number } | null>(null);
  const lastAttemptRef = useRef<{ latitude: number; longitude: number; at: number } | null>(
    null,
  );
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
    acquitterArrivees: () => setArrivees([]),
  };
};
