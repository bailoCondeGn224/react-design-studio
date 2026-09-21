import { useEffect, useState } from 'react';
import { useLivreurAuth } from '@/contexts/LivreurAuthContext';
import { useLivreurOrders, useMarkDelivered } from '@/hooks/useLivreurOrders';
import { useLivreurPositionTracking } from '@/hooks/useLivreurPositionTracking';
import { LivreurRouteMap } from '@/components/storefront/LivreurRouteMap';
import { GpsBanner } from '@/components/livreur/GpsBanner';
import { ArriveeBanner } from '@/components/livreur/ArriveeBanner';
import { LivreurOrderCard } from '@/components/livreur/LivreurOrderCard';
import { Button } from '@/components/ui/button';
import { buildDirectionsUrl } from '@/lib/geo';
import { OnlineOrder } from '@/types';
import { Loader2, Package, LogOut } from 'lucide-react';

// Accès protégé par LivreurProtectedRoute : ici le livreur est toujours connecté.
const LivreurDashboard = () => {
  const { livreur, logout } = useLivreurAuth();
  const { data: orders = [], isLoading } = useLivreurOrders();
  const markDelivered = useMarkDelivered();
  const {
    status: gpsStatus,
    lastSentAt,
    position,
    arrivees,
    acquitterArrivees,
  } = useLivreurPositionTracking();

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Par défaut on trace vers la première course, et on ne laisse jamais
  // la sélection pointer sur une commande qui vient d'être livrée.
  useEffect(() => {
    const stillExists = orders.some((o) => o.id === selectedOrderId);
    if (!stillExists) {
      setSelectedOrderId(orders[0]?.id ?? null);
    }
  }, [orders, selectedOrderId]);

  const handleNavigate = (order: OnlineOrder) => {
    const url = buildDirectionsUrl({
      latitude: order.latitudeLivraison,
      longitude: order.longitudeLivraison,
      adresse: order.adresseLivraison,
    });
    if (url) window.open(url, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const hasSeveralOrders = orders.length > 1;

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div>
          <p className="font-bold text-foreground">{livreur?.nom}</p>
          <p className="text-xs text-muted-foreground">
            {orders.length} livraison(s) en cours
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={logout} aria-label="Se déconnecter">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>

      <GpsBanner status={gpsStatus} lastSentAt={lastSentAt} />
      <ArriveeBanner arrivees={arrivees} onAcknowledge={acquitterArrivees} />

      <div className="p-4 space-y-4">
        {orders.length > 0 && (
          <LivreurRouteMap
            orders={orders}
            selectedOrderId={selectedOrderId}
            onSelectOrder={setSelectedOrderId}
            position={position}
            onNavigate={handleNavigate}
          />
        )}

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Aucune livraison en cours</p>
          </div>
        ) : (
          orders.map((order, index) => (
            <LivreurOrderCard
              key={order.id}
              order={order}
              position={hasSeveralOrders ? index + 1 : undefined}
              isSelected={hasSeveralOrders && order.id === selectedOrderId}
              onSelect={() => setSelectedOrderId(order.id)}
              onNavigate={() => handleNavigate(order)}
              onMarkDelivered={() => markDelivered.mutate(order.id)}
              isMarkingDelivered={markDelivered.isPending}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default LivreurDashboard;
