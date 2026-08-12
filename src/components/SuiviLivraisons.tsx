// src/components/SuiviLivraisons.tsx
import { useEffect, useMemo, useState } from 'react';
import { Livreur } from '@/types/livreur';
import { OnlineOrder } from '@/types';
import { LivreursTrackingMap } from '@/components/LivreursTrackingMap';
import { useRoute } from '@/hooks/useRoute';
import { distanceInMeters, formatDistance, formatDuration } from '@/lib/geo';
import {
  FRESHNESS_COLORS,
  FRESHNESS_LABELS,
  formatPositionAge,
  getPositionFreshness,
} from '@/lib/position-freshness';
import { useStorefrontConfig } from '@/hooks/useStorefrontConfig';
import {
  BellRing,
  Clock,
  MapPinOff,
  Phone,
  Route as RouteIcon,
  Truck,
} from 'lucide-react';

interface SuiviLivraisonsProps {
  livreurs: Livreur[];
  ordersEnLivraison: OnlineOrder[];
}

export const SuiviLivraisons = ({
  livreurs,
  ordersEnLivraison,
}: SuiviLivraisonsProps) => {
  const { data: storefront } = useStorefrontConfig();

  const boutique =
    storefront?.latitude != null && storefront?.longitude != null
      ? {
          latitude: storefront.latitude,
          longitude: storefront.longitude,
          nom: storefront.organizationNom,
        }
      : null;
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const livreurById = useMemo(
    () => new Map(livreurs.map((l) => [l.id, l])),
    [livreurs],
  );

  useEffect(() => {
    const stillExists = ordersEnLivraison.some((o) => o.id === selectedOrderId);
    if (!stillExists) {
      setSelectedOrderId(ordersEnLivraison[0]?.id ?? null);
    }
  }, [ordersEnLivraison, selectedOrderId]);

  const selectedOrder = ordersEnLivraison.find((o) => o.id === selectedOrderId) ?? null;
  const selectedLivreur = selectedOrder?.livreurId
    ? livreurById.get(selectedOrder.livreurId) ?? null
    : null;

  const { route: selectedRoute, isApproximate } = useRoute(
    selectedLivreur?.latitude != null && selectedLivreur?.longitude != null
      ? { lat: selectedLivreur.latitude, lng: selectedLivreur.longitude }
      : null,
    selectedOrder?.latitudeLivraison != null && selectedOrder?.longitudeLivraison != null
      ? { lat: selectedOrder.latitudeLivraison, lng: selectedOrder.longitudeLivraison }
      : null,
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] gap-4">
      {/* Liste des livraisons */}
      <div className="space-y-2 lg:max-h-[30rem] lg:overflow-y-auto lg:pr-1">
        {ordersEnLivraison.map((order) => {
          const livreur = order.livreurId ? livreurById.get(order.livreurId) : undefined;
          const freshness = getPositionFreshness(livreur?.lastPositionAt, now);
          const age = formatPositionAge(livreur?.lastPositionAt);
          const isSelected = order.id === selectedOrderId;

          const hasDestination =
            order.latitudeLivraison != null && order.longitudeLivraison != null;
          const hasLivreurPosition =
            livreur?.latitude != null && livreur?.longitude != null;

          const straightLine =
            hasDestination && hasLivreurPosition
              ? distanceInMeters(
                  livreur!.latitude!,
                  livreur!.longitude!,
                  order.latitudeLivraison!,
                  order.longitudeLivraison!,
                )
              : null;

          return (
            <button
              key={order.id}
              type="button"
              onClick={() => setSelectedOrderId(order.id)}
              className={`w-full text-left rounded-lg border p-3 transition-colors ${
                isSelected
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'border-border bg-card hover:bg-muted/40'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-sm truncate">{order.numero}</p>
                    {order.arriveeLe && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-800 shrink-0">
                        <BellRing className="h-2.5 w-2.5" />
                        Arrivé
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {order.clientNom || order.customerNom || 'Client'}
                  </p>
                </div>
                {isSelected && selectedRoute ? (
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-primary leading-tight">
                      {formatDistance(selectedRoute.distanceM)}
                    </p>
                    {selectedRoute.durationS != null && (
                      <p className="flex items-center justify-end gap-1 text-[11px] text-primary">
                        <Clock className="h-3 w-3" />~
                        {formatDuration(selectedRoute.durationS)}
                      </p>
                    )}
                  </div>
                ) : (
                  straightLine != null && (
                    <div className="text-right shrink-0">
                      <p className="text-xs font-semibold text-muted-foreground">
                        ~{formatDistance(straightLine)}
                      </p>
                      <p className="text-[10px] text-muted-foreground/80">
                        à vol d'oiseau
                      </p>
                    </div>
                  )
                )}
              </div>

              <div className="mt-2 flex items-center gap-2 text-xs">
                <Truck className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">{livreur?.nom ?? 'Livreur inconnu'}</span>
                {livreur && (
                  <>
                    <span
                      className="w-2 h-2 rounded-full shrink-0 ml-auto"
                      style={{ backgroundColor: FRESHNESS_COLORS[freshness] }}
                    />
                    <span
                      className="shrink-0"
                      style={{ color: FRESHNESS_COLORS[freshness] }}
                    >
                      {FRESHNESS_LABELS[freshness]}
                    </span>
                  </>
                )}
              </div>

              {livreur && age && (
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Position {age}
                </p>
              )}

              {isSelected && selectedRoute && isApproximate && (
                <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                  <RouteIcon className="h-3 w-3" />
                  Distance à vol d'oiseau, itinéraire indisponible
                </p>
              )}

              {!hasDestination && (
                <p className="mt-1 flex items-center gap-1 text-[11px] text-amber-700">
                  <MapPinOff className="h-3 w-3" />
                  Pas de point GPS client — non traçable sur la carte
                </p>
              )}

              {hasDestination && !hasLivreurPosition && (
                <p className="mt-1 flex items-center gap-1 text-[11px] text-amber-700">
                  <MapPinOff className="h-3 w-3" />
                  Livreur sans position GPS
                </p>
              )}

              {livreur?.telephone && (
                <a
                  href={`tel:${livreur.telephone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-2 inline-flex items-center gap-1 text-[11px] text-primary"
                >
                  <Phone className="h-3 w-3" />
                  {livreur.telephone}
                </a>
              )}
            </button>
          );
        })}
      </div>

      {/* Carte */}
      <LivreursTrackingMap
        livreurs={livreurs}
        ordersEnLivraison={ordersEnLivraison}
        selectedOrderId={selectedOrderId}
        onSelectOrder={setSelectedOrderId}
        boutique={boutique}
      />
    </div>
  );
};
