import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLivreurAuth } from '@/contexts/LivreurAuthContext';
import { useLivreurOrders, useMarkDelivered } from '@/hooks/useLivreurOrders';
import {
  GeoStatus,
  useLivreurPositionTracking,
} from '@/hooks/useLivreurPositionTracking';
import { LivreurRouteMap } from '@/components/storefront/LivreurRouteMap';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { buildDirectionsUrl } from '@/lib/geo';
import { formatPositionAge } from '@/lib/position-freshness';
import { OnlineOrder } from '@/types';
import {
  Loader2,
  MapPin,
  Phone,
  Package,
  Navigation,
  CheckCircle,
  LogOut,
  AlertTriangle,
  BellRing,
} from 'lucide-react';

const formatPrix = (prix: number) => {
  return (
    new Intl.NumberFormat('fr-GN', { style: 'decimal' }).format(prix) + ' GNF'
  );
};

const GpsBanner = ({
  status,
  lastSentAt,
}: {
  status: GeoStatus;
  lastSentAt: Date | null;
}) => {
  if (status === 'active') {
    const age = lastSentAt ? formatPositionAge(lastSentAt.toISOString()) : null;
    return (
      <div className="bg-green-50 border-b border-green-200 px-4 py-2 flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600" />
        </span>
        <p className="text-xs text-green-800">
          Position partagée{age ? ` · envoyée ${age}` : ''}
        </p>
      </div>
    );
  }

  if (status === 'starting') {
    return (
      <div className="bg-muted border-b border-border px-4 py-2 flex items-center gap-2">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
        <p className="text-xs text-muted-foreground">Recherche du signal GPS…</p>
      </div>
    );
  }

  const messages: Record<Exclude<GeoStatus, 'active' | 'starting'>, string> = {
    denied:
      "Localisation refusée. Le client ne peut pas suivre sa livraison. Autorisez la localisation dans les réglages de votre navigateur.",
    unavailable:
      "Position GPS indisponible. Vérifiez que la localisation de votre téléphone est activée.",
    unsupported:
      "Ce navigateur ne gère pas la localisation. Le suivi en direct est désactivé.",
  };

  return (
    <div className="bg-destructive/10 border-b border-destructive/30 px-4 py-3 flex items-start gap-2">
      <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
      <p className="text-xs text-destructive font-medium">{messages[status]}</p>
    </div>
  );
};

const LivreurDashboard = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { livreur, isAuthenticated, logout } = useLivreurAuth();
  const { data: orders = [], isLoading } = useLivreurOrders();
  const markDelivered = useMarkDelivered();
  const {
    status: gpsStatus,
    lastSentAt,
    position,
    arrivees,
    acquitterArrivees,
  } = useLivreurPositionTracking(isAuthenticated);

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Par défaut on trace vers la première course, et on ne laisse jamais
  // la sélection pointer sur une commande qui vient d'être livrée.
  useEffect(() => {
    const stillExists = orders.some((o) => o.id === selectedOrderId);
    if (!stillExists) {
      setSelectedOrderId(orders[0]?.id ?? null);
    }
  }, [orders, selectedOrderId]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(`/b/${slug}/livreur`);
    }
  }, [isAuthenticated, navigate, slug]);

  const handleNavigate = (order: OnlineOrder) => {
    const url = buildDirectionsUrl({
      latitude: order.latitudeLivraison,
      longitude: order.longitudeLivraison,
      adresse: order.adresseLivraison,
    });
    if (url) window.open(url, '_blank');
  };

  const handleLogout = () => {
    logout();
    navigate(`/b/${slug}/livreur`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div>
          <p className="font-bold text-foreground">{livreur?.nom}</p>
          <p className="text-xs text-muted-foreground">
            {orders.length} livraison(s) en cours
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>

      <GpsBanner status={gpsStatus} lastSentAt={lastSentAt} />

      {arrivees.length > 0 && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-3">
          <div className="flex items-start gap-2">
            <BellRing className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-emerald-900">
                Vous êtes arrivé à destination
              </p>
              <p className="text-xs text-emerald-800">
                {arrivees.map((a) => a.numero).join(', ')} — le client et la boutique
                ont été prévenus.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-emerald-800 shrink-0"
              onClick={acquitterArrivees}
            >
              OK
            </Button>
          </div>
        </div>
      )}

      <div className="p-4 space-y-4">
        {orders.length > 0 && (
          <LivreurRouteMap
            orders={orders}
            selectedOrderId={selectedOrderId}
            onSelectOrder={setSelectedOrderId}
            position={position}
          />
        )}

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Aucune livraison en cours</p>
          </div>
        ) : (
          orders.map((order, index) => (
            <Card
              key={order.id}
              onClick={() => setSelectedOrderId(order.id)}
              className={
                order.id === selectedOrderId && orders.length > 1
                  ? 'border-primary ring-1 ring-primary'
                  : undefined
              }
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {orders.length > 1 && (
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                    )}
                    <p className="font-bold">{order.numero}</p>
                  </div>
                  <p className="text-lg font-bold text-primary">
                    {formatPrix(order.total)}
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span>{order.clientNom || 'Client'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`tel:${order.telephoneLivraison}`}
                      className="text-primary"
                    >
                      {order.telephoneLivraison}
                    </a>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <span>{order.adresseLivraison || 'Adresse non précisée'}</span>
                      {order.latitudeLivraison != null &&
                        order.longitudeLivraison != null && (
                          <p className="text-xs text-green-700">
                            Point GPS fourni par le client
                          </p>
                        )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="h-12"
                    disabled={
                      !buildDirectionsUrl({
                        latitude: order.latitudeLivraison,
                        longitude: order.longitudeLivraison,
                        adresse: order.adresseLivraison,
                      })
                    }
                    onClick={() => handleNavigate(order)}
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Naviguer
                  </Button>
                  <Button
                    className="h-12"
                    onClick={() => markDelivered.mutate(order.id)}
                    disabled={markDelivered.isPending}
                  >
                    {markDelivered.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Livrée
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default LivreurDashboard;
