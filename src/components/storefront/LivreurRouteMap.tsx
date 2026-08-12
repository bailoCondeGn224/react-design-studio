import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { OnlineOrder } from '@/types';
import { useRoute } from '@/hooks/useRoute';
import { formatDistance, formatDuration } from '@/lib/geo';
import {
  addTileLayer,
  buildDestinationIcon,
  buildSelfIcon,
  buildUncertaintyCircle,
  DEFAULT_CENTER,
  MIN_UNCERTAINTY_RADIUS_M,
  TileHealth,
} from '@/lib/map-icons';
import { MapTileWarning } from '@/components/MapTileWarning';
import { animateMarkerTo, applyBearing, computeBearing } from '@/lib/marker-animation';
import { createMapFollower, MapFollower } from '@/lib/map-follow';
import { Navigation, Route as RouteIcon, Loader2 } from 'lucide-react';

interface LivreurRouteMapProps {
  orders: OnlineOrder[];
  selectedOrderId: string | null;
  onSelectOrder: (orderId: string) => void;
  position: { latitude: number; longitude: number } | null;
}

const hasCoords = (order: OnlineOrder) =>
  order.latitudeLivraison != null && order.longitudeLivraison != null;

export const LivreurRouteMap = ({
  orders,
  selectedOrderId,
  onSelectOrder,
  position,
}: LivreurRouteMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const selfMarkerRef = useRef<L.Marker | null>(null);
  const destinationMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const uncertaintyCirclesRef = useRef<Map<string, L.Circle>>(new Map());
  const routeLineRef = useRef<L.Polyline | null>(null);
  const fittedForRef = useRef<string | null>(null);

  const onSelectRef = useRef(onSelectOrder);
  onSelectRef.current = onSelectOrder;

  const [tileHealth, setTileHealth] = useState<TileHealth>('loading');
  const followerRef = useRef<MapFollower | null>(null);

  const deliverableOrders = useMemo(() => orders.filter(hasCoords), [orders]);

  const selectedOrder = useMemo(
    () => deliverableOrders.find((o) => o.id === selectedOrderId) ?? null,
    [deliverableOrders, selectedOrderId],
  );

  const { route, isApproximate, isLoading } = useRoute(
    position ? { lat: position.latitude, lng: position.longitude } : null,
    selectedOrder
      ? { lat: selectedOrder.latitudeLivraison!, lng: selectedOrder.longitudeLivraison! }
      : null,
  );

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const destinationMarkers = destinationMarkersRef.current;
    const circles = uncertaintyCirclesRef.current;

    mapInstanceRef.current = L.map(mapRef.current, {
      zoomControl: false,
    }).setView(DEFAULT_CENTER, 13);
    L.control.zoom({ position: 'bottomright' }).addTo(mapInstanceRef.current);

    addTileLayer(mapInstanceRef.current, setTileHealth);

    followerRef.current = createMapFollower(mapInstanceRef.current);

    return () => {
      followerRef.current?.destroy();
      followerRef.current = null;
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
      selfMarkerRef.current = null;
      destinationMarkers.clear();
      circles.clear();
      routeLineRef.current = null;
      fittedForRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !position) return;

    const coords: [number, number] = [position.latitude, position.longitude];

    if (selfMarkerRef.current) {
      const previous = selfMarkerRef.current.getLatLng();
      const bearing = computeBearing([previous.lat, previous.lng], coords);

      animateMarkerTo(selfMarkerRef.current, coords);
      if (bearing !== null) applyBearing(selfMarkerRef.current, bearing);

      followerRef.current?.followTo(coords);
    } else {
      selfMarkerRef.current = L.marker(coords, { icon: buildSelfIcon() })
        .addTo(map)
        .bindPopup('<b>Vous êtes ici</b>');
    }
  }, [position]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const visibleIds = new Set(deliverableOrders.map((o) => o.id));

    destinationMarkersRef.current.forEach((marker, id) => {
      if (!visibleIds.has(id)) {
        marker.remove();
        destinationMarkersRef.current.delete(id);
      }
    });

    uncertaintyCirclesRef.current.forEach((circle, id) => {
      if (!visibleIds.has(id)) {
        circle.remove();
        uncertaintyCirclesRef.current.delete(id);
      }
    });

    deliverableOrders.forEach((order) => {
      const coords: [number, number] = [
        order.latitudeLivraison!,
        order.longitudeLivraison!,
      ];
      const isSelected = order.id === selectedOrderId;
      const icon = buildDestinationIcon({
        label:
          orders.length > 1
            ? String(orders.findIndex((o) => o.id === order.id) + 1)
            : undefined,
        dimmed: !isSelected && deliverableOrders.length > 1,
      });

      const popup = `<b>${order.numero}</b><br/>${order.clientNom || 'Client'}<br/><span style="font-size:11px;color:#666">${order.adresseLivraison || ''}</span>`;

      const existing = destinationMarkersRef.current.get(order.id);
      if (existing) {
        existing.setLatLng(coords);
        existing.setIcon(icon);
        existing.setPopupContent(popup);
      } else {
        const marker = L.marker(coords, { icon }).addTo(map).bindPopup(popup);
        marker.on('click', () => onSelectRef.current(order.id));
        destinationMarkersRef.current.set(order.id, marker);
      }

      const existingCircle = uncertaintyCirclesRef.current.get(order.id);
      const needsCircle =
        order.precisionLivraison != null &&
        order.precisionLivraison > MIN_UNCERTAINTY_RADIUS_M;

      if (existingCircle) {
        existingCircle.remove();
        uncertaintyCirclesRef.current.delete(order.id);
      }

      if (needsCircle) {
        uncertaintyCirclesRef.current.set(
          order.id,
          buildUncertaintyCircle(coords, order.precisionLivraison!).addTo(map),
        );
      }
    });
  }, [deliverableOrders, selectedOrderId, orders]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!route) {
      routeLineRef.current?.remove();
      routeLineRef.current = null;
      return;
    }

    if (routeLineRef.current) {
      routeLineRef.current.setLatLngs(route.coordinates);
      routeLineRef.current.setStyle({ dashArray: isApproximate ? '10, 10' : undefined });
    } else {
      routeLineRef.current = L.polyline(route.coordinates, {
        color: '#2563eb',
        weight: 5,
        opacity: 0.8,
        dashArray: isApproximate ? '10, 10' : undefined,
      }).addTo(map);
    }

    if (fittedForRef.current !== selectedOrderId) {
      const bounds = routeLineRef.current.getBounds();
      followerRef.current?.runProgrammatic(() =>
        map.fitBounds(bounds, { padding: [40, 40] }),
      );
      fittedForRef.current = selectedOrderId;
    }
  }, [route, isApproximate, selectedOrderId]);

  const recenter = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (position) {
      followerRef.current?.recenterOn([position.latitude, position.longitude]);
    } else if (routeLineRef.current) {
      const bounds = routeLineRef.current.getBounds();
      followerRef.current?.runProgrammatic(() =>
        map.fitBounds(bounds, { padding: [40, 40] }),
      );
    }
  };

  if (deliverableOrders.length === 0) return null;

  return (
    <div className="relative">
      <MapTileWarning health={tileHealth} />
      <div
        ref={mapRef}
        className="h-64 rounded-lg overflow-hidden border border-border"
      />

      <button
        type="button"
        onClick={recenter}
        aria-label="Recentrer la carte"
        className="absolute top-3 right-3 z-[400] bg-card border border-border rounded-full p-2 shadow-md"
      >
        <Navigation className="h-4 w-4 text-foreground" />
      </button>

      {selectedOrder && route && (
        <div className="absolute bottom-3 left-3 z-[400] bg-card/95 backdrop-blur border border-border rounded-lg px-3 py-2 shadow-md">
          <p className="text-xs text-muted-foreground">{selectedOrder.numero}</p>
          <div className="flex items-center gap-2">
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
            ) : (
              <RouteIcon className="h-3.5 w-3.5 text-primary" />
            )}
            <p className="text-sm font-bold">
              {formatDistance(route.distanceM)}
              {route.durationS != null && (
                <span className="font-normal text-muted-foreground">
                  {' · '}
                  {formatDuration(route.durationS)}
                </span>
              )}
            </p>
          </div>
          {isApproximate && !isLoading && (
            <p className="text-[10px] text-muted-foreground">à vol d'oiseau</p>
          )}
        </div>
      )}
    </div>
  );
};
