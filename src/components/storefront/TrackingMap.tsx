import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TrackingInfo } from '@/types/livreur';
import { Phone, Truck, AlertCircle, BellRing, Crosshair } from 'lucide-react';
import { useRoute } from '@/hooks/useRoute';
import { MapStatTiles } from '@/components/MapStatTiles';
import { createRouteLine, RouteLine } from '@/lib/map-route-style';
import {
  addTileLayer,
  buildBoutiqueIcon,
  buildDestinationIcon,
  buildLivreurIcon,
  buildUncertaintyCircle,
  MIN_UNCERTAINTY_RADIUS_M,
  TileHealth,
} from '@/lib/map-icons';
import { MapTileWarning } from '@/components/MapTileWarning';
import {
  animateMarkerTo,
  applyBearing,
  computeBearing,
  setIconPreservingBearing,
} from '@/lib/marker-animation';
import { createMapFollower, MapFollower } from '@/lib/map-follow';
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
  const boutiqueMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<RouteLine | null>(null);
  const followerRef = useRef<MapFollower | null>(null);
  const [isFollowing, setIsFollowing] = useState(true);
  const hasFittedRef = useRef(false);

  const [tileHealth, setTileHealth] = useState<TileHealth>('loading');

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

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current || !hasPosition) return;

    mapInstanceRef.current = L.map(mapRef.current).setView(
      [tracking.latitude!, tracking.longitude!],
      15,
    );
    addTileLayer(mapInstanceRef.current, setTileHealth);

    followerRef.current = createMapFollower(mapInstanceRef.current);
    followerRef.current.onChange(setIsFollowing);

    return () => {
      followerRef.current?.destroy();
      followerRef.current = null;
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
      livreurMarkerRef.current = null;
      destinationMarkerRef.current = null;
      routeLineRef.current = null;
      hasFittedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPosition]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !hasPosition) return;

    const position: [number, number] = [tracking.latitude!, tracking.longitude!];
    const icon = buildLivreurIcon(freshness, { size: 40 });

    if (livreurMarkerRef.current) {
      const previous = livreurMarkerRef.current.getLatLng();
      const bearing = computeBearing([previous.lat, previous.lng], position);

      setIconPreservingBearing(livreurMarkerRef.current, icon);
      animateMarkerTo(livreurMarkerRef.current, position);

      if (bearing !== null) applyBearing(livreurMarkerRef.current, bearing);
    } else {
      livreurMarkerRef.current = L.marker(position, { icon }).addTo(map);
    }

    livreurMarkerRef.current.bindPopup(
      `<b>${tracking.livreurNom}</b><br/>${FRESHNESS_LABELS[freshness]}${age ? ` · ${age}` : ''}`,
    );

    followerRef.current?.followTo(position);
  }, [
    hasPosition,
    hasDestination,
    tracking.latitude,
    tracking.longitude,
    tracking.livreurNom,
    freshness,
    age,
  ]);

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
          `<b>Destination</b><br/>${tracking.destinationAdresse || 'Adresse de livraison'}`,
        );
    }

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

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const hasBoutique =
      tracking.boutiqueLatitude != null && tracking.boutiqueLongitude != null;

    if (!hasBoutique) {
      boutiqueMarkerRef.current?.remove();
      boutiqueMarkerRef.current = null;
      return;
    }

    const coords: [number, number] = [
      tracking.boutiqueLatitude!,
      tracking.boutiqueLongitude!,
    ];

    if (boutiqueMarkerRef.current) {
      boutiqueMarkerRef.current.setLatLng(coords);
    } else {
      boutiqueMarkerRef.current = L.marker(coords, { icon: buildBoutiqueIcon() })
        .addTo(map)
        .bindPopup('<b>Boutique</b><br/>Départ de votre commande');
    }
  }, [tracking.boutiqueLatitude, tracking.boutiqueLongitude]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !route) return;

    if (routeLineRef.current) {
      routeLineRef.current.setLatLngs(route.coordinates);
      routeLineRef.current.setApproximate(isApproximate);
    } else {
      routeLineRef.current = createRouteLine(map, route.coordinates, isApproximate);
    }

    if (!hasFittedRef.current) {
      const bounds = routeLineRef.current.getBounds();
      followerRef.current?.runProgrammatic(() =>
        map.fitBounds(bounds, { padding: [50, 50] }),
      );
      hasFittedRef.current = true;
    }
  }, [route, isApproximate]);

  return (
    <div className="space-y-3">
      {tracking.arriveeLe && (
        <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <BellRing className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <div>
            <p className="text-sm font-semibold text-emerald-900">
              Votre livreur est arrivé
            </p>
            <p className="text-xs text-emerald-800">
              Il est à votre adresse{' '}
              {formatPositionAge(tracking.arriveeLe) ?? ''}.
            </p>
          </div>
        </div>
      )}

      {/* Livreur */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-blue-900">{tracking.livreurNom}</p>
            <p className="text-sm text-blue-700">{tracking.livreurTelephone}</p>
          </div>
          <a
            href={`tel:${tracking.livreurTelephone}`}
            aria-label="Appeler le livreur"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-md active:scale-95"
          >
            <Phone className="h-5 w-5" />
          </a>
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

          <div className="relative overflow-hidden rounded-xl border">
            <MapTileWarning health={tileHealth} />
            <div
              ref={mapRef}
              className="h-[52vh] min-h-[300px] w-full [&_.leaflet-top]:top-24"
            />

            <div className="pointer-events-none absolute inset-x-3 top-3 z-[500]">
              <MapStatTiles
                distanceM={route?.distanceM}
                durationS={route?.durationS}
                approximate={isApproximate}
              />
            </div>

            {!isFollowing && hasPosition && (
              <button
                type="button"
                onClick={() =>
                  followerRef.current?.recenterOn([
                    tracking.latitude!,
                    tracking.longitude!,
                  ])
                }
                aria-label="Recentrer sur le livreur"
                className="absolute bottom-3 right-3 z-[500] rounded-full bg-white p-2.5 shadow-lg border border-gray-200 active:scale-95 transition-transform"
              >
                <Crosshair className="h-5 w-5 text-blue-600" />
              </button>
            )}
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
