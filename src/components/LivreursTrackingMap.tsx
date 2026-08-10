// src/components/LivreursTrackingMap.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Livreur } from '@/types/livreur';
import { OnlineOrder } from '@/types';
import { distanceInMeters, formatDistance } from '@/lib/geo';
import { useRoute } from '@/hooks/useRoute';
import {
  addTileLayer,
  buildDestinationIcon,
  buildLivreurIcon,
  buildUncertaintyCircle,
  DEFAULT_CENTER,
  MIN_UNCERTAINTY_RADIUS_M,
  TileHealth,
} from '@/lib/map-icons';
import { MapTileWarning } from '@/components/MapTileWarning';
import {
  FRESHNESS_COLORS,
  FRESHNESS_LABELS,
  PositionFreshness,
  formatPositionAge,
  getPositionFreshness,
} from '@/lib/position-freshness';

interface LivreursTrackingMapProps {
  livreurs: Livreur[];
  ordersEnLivraison?: OnlineOrder[];
  /** Livraison mise en avant: son itinéraire réel est tracé et la carte s'y recadre. */
  selectedOrderId?: string | null;
  onSelectOrder?: (orderId: string) => void;
}

const hasDestination = (order: OnlineOrder) =>
  order.latitudeLivraison != null && order.longitudeLivraison != null;

const buildLivreurPopup = (
  livreur: Livreur,
  freshness: PositionFreshness,
  order?: OnlineOrder,
  remaining?: number | null,
) => {
  const age = formatPositionAge(livreur.lastPositionAt);

  return `
    <div style="min-width: 180px;">
      <p style="font-weight: 600; margin-bottom: 4px;">${livreur.nom}</p>
      <p style="font-size: 12px; color: #666;">${livreur.telephone}</p>
      <p style="font-size: 11px; margin-top: 6px; color: ${FRESHNESS_COLORS[freshness]}; font-weight: 500;">
        ${FRESHNESS_LABELS[freshness]}${age ? ` · ${age}` : ''}
      </p>
      ${
        order
          ? `
        <hr style="margin: 8px 0; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 11px; color: #666;">Commande en cours:</p>
        <p style="font-weight: 500; font-size: 12px;">${order.numero}</p>
        ${
          remaining != null
            ? `<p style="font-size: 11px; color: #2563eb; font-weight: 600; margin-top: 2px;">
                 ${formatDistance(remaining)} à vol d'oiseau
               </p>`
            : ''
        }
      `
          : '<p style="font-size: 11px; color: #999; margin-top: 6px;">Aucune course en cours</p>'
      }
    </div>
  `;
};

const buildDestinationPopup = (order: OnlineOrder) => `
  <div style="min-width: 170px;">
    <p style="font-weight: 600; margin-bottom: 4px;">📍 ${order.numero}</p>
    <p style="font-size: 12px;">${order.clientNom || order.customerNom || 'Client'}</p>
    ${
      order.adresseLivraison
        ? `<p style="font-size: 11px; color: #666; margin-top: 4px;">${order.adresseLivraison}</p>`
        : ''
    }
  </div>
`;

export const LivreursTrackingMap = ({
  livreurs,
  ordersEnLivraison = [],
  selectedOrderId = null,
  onSelectOrder,
}: LivreursTrackingMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const destinationMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const uncertaintyCirclesRef = useRef<Map<string, L.Circle>>(new Map());
  const linesRef = useRef<Map<string, L.Polyline>>(new Map());
  const selectedRouteRef = useRef<L.Polyline | null>(null);
  // Clé du dernier recadrage global: on ne recadre que quand la liste des points
  // change, jamais sur un simple déplacement — sinon impossible de naviguer.
  const fittedKeyRef = useRef<string | null>(null);
  /** Livraison pour laquelle la carte a déjà été recadrée. */
  const fittedSelectionRef = useRef<string | null>(null);

  const onSelectRef = useRef(onSelectOrder);
  onSelectRef.current = onSelectOrder;

  const [tileHealth, setTileHealth] = useState<TileHealth>('loading');

  // Ticker: fait vieillir les positions à l'écran même sans nouvelle réponse serveur.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const livreursWithPosition = useMemo(
    () => livreurs.filter((l) => l.latitude && l.longitude && l.isActive),
    [livreurs],
  );

  const destinations = useMemo(
    () => ordersEnLivraison.filter(hasDestination),
    [ordersEnLivraison],
  );

  const hasAnything = livreursWithPosition.length > 0 || destinations.length > 0;

  // Itinéraire réel de la livraison sélectionnée uniquement: un appel de routage
  // par livraison affichée serait disproportionné pour une vue d'ensemble.
  const selectedOrder = useMemo(
    () => destinations.find((o) => o.id === selectedOrderId) ?? null,
    [destinations, selectedOrderId],
  );

  const selectedLivreur = useMemo(
    () =>
      selectedOrder
        ? livreursWithPosition.find((l) => l.id === selectedOrder.livreurId) ?? null
        : null,
    [livreursWithPosition, selectedOrder],
  );

  const { route: selectedRoute, isApproximate } = useRoute(
    selectedLivreur
      ? { lat: selectedLivreur.latitude!, lng: selectedLivreur.longitude! }
      : null,
    selectedOrder
      ? { lat: selectedOrder.latitudeLivraison!, lng: selectedOrder.longitudeLivraison! }
      : null,
  );

  const freshnessCounts = useMemo(() => {
    const counts: Record<PositionFreshness, number> = {
      live: 0,
      stale: 0,
      offline: 0,
    };
    livreursWithPosition.forEach((l) => {
      counts[getPositionFreshness(l.lastPositionAt, now)] += 1;
    });
    return counts;
  }, [livreursWithPosition, now]);

  // Initialisation de la carte (une seule fois)
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current || !hasAnything) return;

    const markers = markersRef.current;
    const destinationMarkers = destinationMarkersRef.current;
    const circles = uncertaintyCirclesRef.current;
    const lines = linesRef.current;

    mapInstanceRef.current = L.map(mapRef.current).setView(DEFAULT_CENTER, 13);
    addTileLayer(mapInstanceRef.current, setTileHealth);

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
      markers.clear();
      destinationMarkers.clear();
      circles.clear();
      lines.clear();
      selectedRouteRef.current = null;
      fittedKeyRef.current = null;
      fittedSelectionRef.current = null;
    };
  }, [hasAnything]);

  // Synchronisation des marqueurs et des liaisons livreur → destination
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const livreurIds = new Set(livreursWithPosition.map((l) => l.id));
    const destinationIds = new Set(destinations.map((o) => o.id));

    // Retirer ce qui a disparu
    markersRef.current.forEach((marker, id) => {
      if (!livreurIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });
    destinationMarkersRef.current.forEach((marker, id) => {
      if (!destinationIds.has(id)) {
        marker.remove();
        destinationMarkersRef.current.delete(id);
      }
    });
    uncertaintyCirclesRef.current.forEach((circle, id) => {
      if (!destinationIds.has(id)) {
        circle.remove();
        uncertaintyCirclesRef.current.delete(id);
      }
    });
    linesRef.current.forEach((line, id) => {
      if (!destinationIds.has(id)) {
        line.remove();
        linesRef.current.delete(id);
      }
    });

    // Destinations
    destinations.forEach((order) => {
      const coords: [number, number] = [
        order.latitudeLivraison!,
        order.longitudeLivraison!,
      ];
      const isSelected = order.id === selectedOrderId;
      const icon = buildDestinationIcon({
        dimmed: selectedOrderId != null && !isSelected,
      });
      const existing = destinationMarkersRef.current.get(order.id);

      if (existing) {
        existing.setLatLng(coords);
        existing.setIcon(icon);
        existing.setPopupContent(buildDestinationPopup(order));
      } else {
        const marker = L.marker(coords, { icon })
          .addTo(map)
          .bindPopup(buildDestinationPopup(order));
        marker.on('click', () => onSelectRef.current?.(order.id));
        destinationMarkersRef.current.set(order.id, marker);
      }

      // Zone d'incertitude du point client
      uncertaintyCirclesRef.current.get(order.id)?.remove();
      uncertaintyCirclesRef.current.delete(order.id);

      if (
        order.precisionLivraison != null &&
        order.precisionLivraison > MIN_UNCERTAINTY_RADIUS_M
      ) {
        uncertaintyCirclesRef.current.set(
          order.id,
          buildUncertaintyCircle(coords, order.precisionLivraison).addTo(map),
        );
      }
    });

    // Livreurs
    livreursWithPosition.forEach((livreur) => {
      const order = ordersEnLivraison.find((o) => o.livreurId === livreur.id);
      const freshness = getPositionFreshness(livreur.lastPositionAt, now);
      const position: [number, number] = [livreur.latitude!, livreur.longitude!];

      const remaining =
        order && hasDestination(order)
          ? distanceInMeters(
              livreur.latitude!,
              livreur.longitude!,
              order.latitudeLivraison!,
              order.longitudeLivraison!,
            )
          : null;

      const popup = buildLivreurPopup(livreur, freshness, order, remaining);
      const existing = markersRef.current.get(livreur.id);

      if (existing) {
        existing.setLatLng(position);
        existing.setIcon(buildLivreurIcon(freshness));
        existing.setPopupContent(popup);
      } else {
        const marker = L.marker(position, { icon: buildLivreurIcon(freshness) })
          .addTo(map)
          .bindPopup(popup);
        if (order) marker.on('click', () => onSelectRef.current?.(order.id));
        markersRef.current.set(livreur.id, marker);
      }

      // Liaison d'ensemble livreur → destination. La sélection a son propre
      // tracé routier, on masque donc son trait droit pour éviter le doublon.
      if (order && hasDestination(order)) {
        const isSelected = order.id === selectedOrderId;
        const path: [number, number][] = [
          position,
          [order.latitudeLivraison!, order.longitudeLivraison!],
        ];
        const line = linesRef.current.get(order.id);

        if (line) {
          line.setLatLngs(path);
          line.setStyle({ opacity: isSelected ? 0 : 0.5 });
        } else {
          linesRef.current.set(
            order.id,
            L.polyline(path, {
              color: FRESHNESS_COLORS[freshness],
              weight: 2,
              opacity: isSelected ? 0 : 0.5,
              dashArray: '6, 8',
            }).addTo(map),
          );
        }
      }
    });

    // Recadrage global uniquement quand l'ensemble des points change,
    // et seulement si aucune livraison n'est mise en avant.
    const fitKey = [
      ...livreursWithPosition.map((l) => `l:${l.id}`),
      ...destinations.map((o) => `d:${o.id}`),
    ]
      .sort()
      .join(',');

    if (fitKey && fitKey !== fittedKeyRef.current) {
      if (!selectedOrderId) {
        const points: [number, number][] = [
          ...livreursWithPosition.map(
            (l) => [l.latitude!, l.longitude!] as [number, number],
          ),
          ...destinations.map(
            (o) => [o.latitudeLivraison!, o.longitudeLivraison!] as [number, number],
          ),
        ];
        map.fitBounds(L.latLngBounds(points), { padding: [50, 50], maxZoom: 15 });
      }
      fittedKeyRef.current = fitKey;
    }
  }, [livreursWithPosition, destinations, ordersEnLivraison, selectedOrderId, now]);

  // Tracé routier de la livraison sélectionnée
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!selectedRoute) {
      selectedRouteRef.current?.remove();
      selectedRouteRef.current = null;
      fittedSelectionRef.current = null;
      return;
    }

    if (selectedRouteRef.current) {
      selectedRouteRef.current.setLatLngs(selectedRoute.coordinates);
      selectedRouteRef.current.setStyle({
        dashArray: isApproximate ? '10, 10' : undefined,
      });
    } else {
      selectedRouteRef.current = L.polyline(selectedRoute.coordinates, {
        color: '#2563eb',
        weight: 5,
        opacity: 0.85,
        dashArray: isApproximate ? '10, 10' : undefined,
      }).addTo(map);
    }

    if (fittedSelectionRef.current !== selectedOrderId) {
      map.fitBounds(selectedRouteRef.current.getBounds(), { padding: [50, 50] });
      fittedSelectionRef.current = selectedOrderId;
    }
  }, [selectedRoute, isApproximate, selectedOrderId]);

  if (!hasAnything) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-muted/30 rounded-lg border border-border">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <svg
            className="w-6 h-6 text-muted-foreground"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="1" y="3" width="15" height="13" rx="2" ry="2"></rect>
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
            <circle cx="5.5" cy="18.5" r="2.5"></circle>
            <circle cx="18.5" cy="18.5" r="2.5"></circle>
          </svg>
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Aucun livreur en activité avec GPS
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Les positions apparaîtront quand les livreurs activeront leur GPS
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Légende */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        {(['live', 'stale', 'offline'] as const)
          .filter((f) => freshnessCounts[f] > 0)
          .map((f) => (
            <div key={f} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: FRESHNESS_COLORS[f] }}
              />
              <span>
                {freshnessCounts[f]} {FRESHNESS_LABELS[f].toLowerCase()}
              </span>
            </div>
          ))}
        {destinations.length > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>
              {destinations.length} destination{destinations.length > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Carte */}
      <div className="relative">
        <MapTileWarning health={tileHealth} />
        <div
          ref={mapRef}
          className="h-[26rem] rounded-lg overflow-hidden border border-border shadow-card"
        />
      </div>
    </div>
  );
};
