import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { distanceInMeters } from '@/lib/geo';

export interface RoutePoint {
  lat: number;
  lng: number;
}

export interface Route {
  coordinates: [number, number][];
  distanceM: number;
  durationS: number | null;
}

const ROUTING_URL =
  import.meta.env.VITE_ROUTING_URL || 'https://router.project-osrm.org';

const quantize = (n: number) => Math.round(n * 1000) / 1000;

const straightLine = (from: RoutePoint, to: RoutePoint): Route => ({
  coordinates: [
    [from.lat, from.lng],
    [to.lat, to.lng],
  ],
  distanceM: distanceInMeters(from.lat, from.lng, to.lat, to.lng),
  durationS: null,
});

export const useRoute = (from: RoutePoint | null, to: RoutePoint | null) => {
  const enabled = from != null && to != null;

  const query = useQuery<Route>({
    queryKey: enabled
      ? [
          'route',
          quantize(from!.lat),
          quantize(from!.lng),
          quantize(to!.lat),
          quantize(to!.lng),
        ]
      : ['route', 'disabled'],
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
    queryFn: async () => {
      const url =
        `${ROUTING_URL}/route/v1/driving/` +
        `${from!.lng},${from!.lat};${to!.lng},${to!.lat}` +
        `?overview=full&geometries=geojson`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`Routage indisponible (${response.status})`);

      const data = await response.json();
      const route = data?.routes?.[0];
      if (!route?.geometry?.coordinates?.length) {
        throw new Error('Aucun itinéraire trouvé');
      }

      return {
        coordinates: (route.geometry.coordinates as [number, number][]).map(
          ([lon, lat]) => [lat, lon] as [number, number],
        ),
        distanceM: route.distance,
        durationS: route.duration,
      };
    },
  });

  const fallback = useMemo(
    () => (enabled ? straightLine(from!, to!) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enabled, from?.lat, from?.lng, to?.lat, to?.lng],
  );

  return {
    route: query.data ?? fallback,
    isApproximate: !query.data,
    isLoading: query.isLoading,
  };
};
