import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TrackingInfo } from '@/types/livreur';
import { Phone, Truck, AlertCircle, Clock } from 'lucide-react';
import { formatDistance, formatDuration } from '@/lib/geo';
import { useRoute } from '@/hooks/useRoute';
import {
  addTileLayer,
  buildDestinationIcon,
  buildLivreurIcon,
  buildUncertaintyCircle,
  MIN_UNCERTAINTY_RADIUS_M,
  TileHealth,
} from '@/lib/map-icons';
import { MapTileWarning } from '@/components/MapTileWarning';
import {
  FRESHNESS_COLORS,
  FRESHNESS_LABELS,
  formatPositionAge,
  getPositionFreshness,
} from '@/lib/position-freshness';

interface TrackingMapProps {
  tracking: TrackingInfo;
}

export const TrackingMap = ({ tracking }: TrackingMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const livreurMarkerRef = useRef<L.Marker | null>(null);
  const destinationMarkerRef = useRef<L.Marker | null>(null);
  const uncertaintyCircleRef = useRef<L.Circle | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const hasFittedRef = useRef(false);

  const [tileHealth, setTileHealth] = useState<TileHealth>('loading');

  // Fait vieillir l'affichage même si le serveur ne renvoie rien de neuf
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const hasPosition = tracking.latitude != null && tracking.longitude != null;
  const hasDestination =
    tracking.destinationLatitude != null && tracking.destinationLongitude != null;

  const freshness = getPositionFreshness(tracking.lastPositionAt, now);
  const age = formatPositionAge(tracking.lastPositionAt);

  const { route, isApproximate } = useRoute(
    hasPosition ? { lat: tracking.latitude!, lng: tracking.longitude! } : null,
    hasDestination
      ? { lat: tracking.destinationLatitude!, lng: tracking.destinationLongitude! }
      : null,
  );

  // Création de la carte dès qu'on a une position
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current || !hasPosition) return;

    mapInstanceRef.current = L.map(mapRef.current).setView(
      [tracking.latitude!, tracking.longitude!],
      15,
    );
    addTileLayer(mapInstanceRef.current, setTileHealth);

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
      livreurMarkerRef.current = null;
      destinationMarkerRef.current = null;
      routeLineRef.current = null;
      hasFittedRef.current = false;
    };
    // La carte n'est créée qu'une fois, avec la première position reçue.
    // Les positions suivantes sont appliquées au marqueur par l'effet ci-dessous.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPosition]);

  // Marqueur livreur: position + couleur selon la fraîcheur
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !hasPosition) return;

    const position: [number, number] = [tracking.latitude!, tracking.longitude!];
    const icon = buildLivreurIcon(freshness, { size: 40 });

    if (livreurMarkerRef.current) {
      livreurMarkerRef.current.setLatLng(position);
      livreurMarkerRef.current.setIcon(icon);
    } else {
      livreurMarkerRef.current = L.marker(position, { icon }).addTo(map);
    }

    livreurMarkerRef.current.bindPopup(
      `<b>🚚 ${tracking.livreurNom}</b><br/>${FRESHNESS_LABELS[freshness]}${age ? ` · ${age}` : ''}`,
    );

    if (!hasDestination) {
      map.panTo(position);
    }
  }, [
    hasPosition,
    hasDestination,
    tracking.latitude,
    tracking.longitude,
    tracking.livreurNom,
    freshness,
    age,
  ]);

  // Marqueur destination.
  // Effet séparé: la destination peut arriver après le premier rendu.
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !hasDestination) return;

    const destination: [number, number] = [
      tracking.destinationLatitude!,
      tracking.destinationLongitude!,
    ];

    if (destinationMarkerRef.current) {
      destinationMarkerRef.current.setLatLng(destination);
    } else {
      destinationMarkerRef.current = L.marker(destination, {
        icon: buildDestinationIcon(),
      })
        .addTo(map)
        .bindPopup(
          `<b>📍 Destination</b><br/>${tracking.destinationAdresse || 'Adresse de livraison'}`,
        );
    }

    // Cercle d'incertitude si le point n'est pas fiable au mètre près
    uncertaintyCircleRef.current?.remove();
    uncertaintyCircleRef.current = null;

    if (
      tracking.destinationPrecision != null &&
      tracking.destinationPrecision > MIN_UNCERTAINTY_RADIUS_M
    ) {
      uncertaintyCircleRef.current = buildUncertaintyCircle(
        destination,
        tracking.destinationPrecision,
      ).addTo(map);
    }
  }, [
    hasDestination,
    tracking.destinationLatitude,
    tracking.destinationLongitude,
    tracking.destinationPrecision,
    tracking.destinationAdresse,
  ]);

  // Tracé de l'itinéraire
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !route) return;

    if (routeLineRef.current) {
      routeLineRef.current.setLatLngs(route.coordinates);
      routeLineRef.current.setStyle({
        dashArray: isApproximate ? '10, 10' : undefined,
      });
    } else {
      routeLineRef.current = L.polyline(route.coordinates, {
        color: '#3b82f6',
        weight: 4,
        opacity: 0.75,
        dashArray: isApproximate ? '10, 10' : undefined,
      }).addTo(map);
    }

    // Un seul recadrage: après, le client doit pouvoir zoomer librement
    if (!hasFittedRef.current) {
      map.fitBounds(routeLineRef.current.getBounds(), { padding: [50, 50] });
      hasFittedRef.current = true;
    }
  }, [route, isApproximate]);

  return (
    <div className="space-y-3">
      {/* Livreur */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-blue-900">{tracking.livreurNom}</p>
            <a
              href={`tel:${tracking.livreurTelephone}`}
              className="flex items-center gap-1 text-sm text-blue-700"
            >
              <Phone className="w-3 h-3" />
              {tracking.livreurTelephone}
            </a>
          </div>
          {route && (
            <div className="text-right shrink-0">
              <p className="text-xs text-gray-500">
                {isApproximate ? 'À vol d’oiseau' : 'Par la route'}
              </p>
              <p className="text-lg font-bold text-blue-600 leading-tight">
                {formatDistance(route.distanceM)}
              </p>
              {route.durationS != null && (
                <p className="flex items-center justify-end gap-1 text-xs text-blue-700">
                  <Clock className="w-3 h-3" />~{formatDuration(route.durationS)}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {hasPosition ? (
        <>
          {/* Fraîcheur de la position */}
          <div className="flex items-center gap-2 text-xs">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: FRESHNESS_COLORS[freshness] }}
            />
            <span style={{ color: FRESHNESS_COLORS[freshness] }} className="font-medium">
              {FRESHNESS_LABELS[freshness]}
            </span>
            {age && <span className="text-gray-500">· position {age}</span>}
          </div>

          {freshness !== 'live' && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">
                La position affichée n'est plus à jour. Le livreur a peut-être perdu le
                réseau — vous pouvez l'appeler directement.
              </p>
            </div>
          )}

          <div className="relative">
            <MapTileWarning health={tileHealth} />
            <div
              ref={mapRef}
              className="h-72 rounded-lg overflow-hidden border shadow-inner"
            />
          </div>

          {/* Légende */}
          <div className="flex items-center justify-center gap-6 text-xs text-gray-600">
            <div className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: FRESHNESS_COLORS[freshness] }}
              />
              <span>Livreur</span>
            </div>
            {hasDestination && (
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span>Destination</span>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex items-start gap-2 bg-gray-50 border border-gray-200 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
          <p className="text-xs text-gray-600">
            Le livreur n'a pas encore partagé sa position. Le suivi sur la carte
            apparaîtra dès qu'il activera sa localisation.
          </p>
        </div>
      )}
    </div>
  );
};
