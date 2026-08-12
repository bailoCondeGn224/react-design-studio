import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { distanceInMeters } from '@/lib/geo';

export interface RoutePoint {
  lat: number;
  lng: number;
}

export interface Route {
  /** Points du tracé, dans l'ordre, au format Leaflet [lat, lng]. */
  coordinates: [number, number][];
  distanceM: number;
  /** Durée estimée en secondes. null quand on est retombé sur la ligne droite. */
  durationS: number | null;
}

/**
 * Service de calcul d'itinéraire. Le serveur public d'OSRM est une démo: pour un
 * usage en production, héberger sa propre instance et renseigner VITE_ROUTING_URL.
 */
const ROUTING_URL =
  import.meta.env.VITE_ROUTING_URL || 'https://router.project-osrm.org';

/**
 * Arrondit à ~110 m. Sert de clé de cache: sans ça, chaque point GPS reçu
 * relancerait un calcul d'itinéraire complet.
 */
const quantize = (n: number) => Math.round(n * 1000) / 1000;

const straightLine = (from: RoutePoint, to: RoutePoint): Route => ({
  coordinates: [
    [from.lat, from.lng],
    [to.lat, to.lng],
  ],
  distanceM: distanceInMeters(from.lat, from.lng, to.lat, to.lng),
  durationS: null,
});

/**
 * Itinéraire routier entre deux points.
 *
 * Retombe silencieusement sur la ligne droite si le service ne répond pas —
 * le suivi doit rester lisible même sans réseau ou hors zone couverte par OSM.
 */
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
    // Le serveur public d'OSRM est intermittent: il rate-limite et coupe sous
    // charge. Sans plusieurs tentatives, on retombe en ligne droite alors que
    // l'itinéraire réel est disponible — soit ~30 % d'erreur sur Conakry.
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
    // fetch et non apiClient: l'intercepteur axios attacherait le JWT du livreur
    // ou du client à un service tiers.
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
        // OSRM renvoie du GeoJSON [lon, lat], Leaflet attend [lat, lng]
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
    /** true quand on affiche la ligne droite faute d'itinéraire réel. */
    isApproximate: !query.data,
    isLoading: query.isLoading,
  };
};
