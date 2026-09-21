import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { OnlineOrder } from '@/types';
import { useRoute } from '@/hooks/useRoute';
import { MapStatTiles } from '@/components/MapStatTiles';
import { createRouteLine, RouteLine } from '@/lib/map-route-style';
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
import { Crosshair, Navigation } from 'lucide-react';

interface LivreurRouteMapProps {
  orders: OnlineOrder[];
  selectedOrderId: string | null;
  onSelectOrder: (orderId: string) => void;
  position: { latitude: number; longitude: number } | null;
  onNavigate?: (order: OnlineOrder) => void;
}

const hasCoords = (order: OnlineOrder) =>
  order.latitudeLivraison != null && order.longitudeLivraison != null;

export const LivreurRouteMap = ({
  orders,
  selectedOrderId,
  onSelectOrder,
  position,
  onNavigate,
}: LivreurRouteMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const selfMarkerRef = useRef<L.Marker | null>(null);
  const destinationMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const uncertaintyCirclesRef = useRef<Map<string, L.Circle>>(new Map());
  const routeLineRef = useRef<RouteLine | null>(null);
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

  const { route, isApproximate } = useRoute(
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
      routeLineRef.current.setApproximate(isApproximate);
    } else {
      routeLineRef.current = createRouteLine(map, route.coordinates, isApproximate);
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
    <div className="relative overflow-hidden rounded-xl border border-border">
      <MapTileWarning health={tileHealth} />
      <div
        ref={mapRef}
        className={`h-[58vh] min-h-[340px] w-full ${
          selectedOrder && onNavigate ? '[&_.leaflet-bottom]:bottom-20' : ''
        }`}
      />

      <div className="pointer-events-none absolute inset-x-3 top-3 z-[400]">
        <MapStatTiles
          distanceM={route?.distanceM}
          durationS={route?.durationS}
          approximate={isApproximate}
        />
      </div>

      <button
        type="button"
        onClick={recenter}
        aria-label="Recentrer la carte"
        className="absolute right-3 top-24 z-[400] rounded-full border border-border bg-card p-3 shadow-lg"
      >
        <Crosshair className="h-5 w-5 text-foreground" />
      </button>

      {selectedOrder && onNavigate && (
        <div className="absolute inset-x-4 bottom-4 z-[400]">
          <button
            type="button"
            onClick={() => onNavigate(selectedOrder)}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-primary text-base font-semibold text-primary-foreground shadow-xl active:scale-[0.98]"
          >
            <Navigation className="h-5 w-5" />
            Naviguer
          </button>
        </div>
      )}
    </div>
  );
};
