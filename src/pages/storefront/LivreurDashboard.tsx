// src/pages/storefront/LivreurDashboard.tsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLivreurAuth } from '@/contexts/LivreurAuthContext';
import {
  useLivreurOrders,
  useUpdateLivreurPosition,
  useStartDelivery,
  useStopDelivery,
  useMarkOrderDelivered,
} from '@/hooks/useLivreurs';
import { OnlineOrder, OnlineOrderStatut } from '@/types/customer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Truck,
  MapPin,
  Phone,
  Package,
  CheckCircle2,
  Navigation,
  LogOut,
  Loader2,
  RefreshCw,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const LivreurDashboard = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { livreur, isAuthenticated, logout, refreshProfile } = useLivreurAuth();

  const { data: orders, isLoading, refetch } = useLivreurOrders();
  const updatePosition = useUpdateLivreurPosition();
  const startDelivery = useStartDelivery();
  const stopDelivery = useStopDelivery();
  const markDelivered = useMarkOrderDelivered();

  const [isTracking, setIsTracking] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [confirmDeliveryId, setConfirmDeliveryId] = useState<string | null>(null);
  const [pendingDeliveryId, setPendingDeliveryId] = useState<string | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Rediriger si non connecté
  useEffect(() => {
    if (!isAuthenticated) {
      navigate(`/b/${slug}/livreur`);
    }
  }, [isAuthenticated, navigate, slug]);

  // Initialiser l'état de suivi depuis le livreur
  useEffect(() => {
    if (livreur?.isDelivering) {
      setIsTracking(true);
    }
  }, [livreur]);

  // Fonction pour envoyer la position
  const sendPosition = useCallback(
    (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      updatePosition.mutate({ latitude, longitude });
    },
    [updatePosition]
  );

  // Gérer le suivi GPS
  const startGpsTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError("La géolocalisation n'est pas supportée par votre navigateur");
      return;
    }

    // Demander la position immédiatement
    navigator.geolocation.getCurrentPosition(
      (position) => {
        sendPosition(position);
        setGpsError(null);
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGpsError('Vous devez autoriser la géolocalisation');
            break;
          case error.POSITION_UNAVAILABLE:
            setGpsError('Position non disponible');
            break;
          case error.TIMEOUT:
            setGpsError('Délai de localisation dépassé');
            break;
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    // Surveiller les changements de position
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        sendPosition(position);
        setGpsError(null);
      },
      (error) => {
        console.error('GPS error:', error);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );

    // Envoyer la position toutes les 30 secondes
    intervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        sendPosition,
        (error) => console.error('GPS interval error:', error),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }, 30000);
  }, [sendPosition]);

  const stopGpsTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Nettoyer lors du démontage
  useEffect(() => {
    return () => {
      stopGpsTracking();
    };
  }, [stopGpsTracking]);

  const handleToggleTracking = async () => {
    if (isTracking) {
      // Arrêter le suivi
      stopGpsTracking();
      await stopDelivery.mutateAsync();
      setIsTracking(false);
    } else {
      // Démarrer le suivi
      try {
        await startDelivery.mutateAsync();
        startGpsTracking();
        setIsTracking(true);
      } catch (error) {
        toast.error('Impossible de démarrer le suivi');
      }
    }
  };

  const handleMarkDelivered = async (orderId: string) => {
    setPendingDeliveryId(orderId);
    try {
      await markDelivered.mutateAsync(orderId);
      setConfirmDeliveryId(null);
    } finally {
      setPendingDeliveryId(null);
    }
  };

  const handleLogout = () => {
    stopGpsTracking();
    if (isTracking) {
      stopDelivery.mutate();
    }
    logout();
    navigate(`/b/${slug}/livreur`);
  };

  const getStatusBadge = (statut: OnlineOrderStatut) => {
    switch (statut) {
      case OnlineOrderStatut.EN_LIVRAISON:
        return <Badge className="bg-blue-500">En livraison</Badge>;
      case OnlineOrderStatut.PRETE:
        return <Badge className="bg-orange-500">Prête</Badge>;
      case OnlineOrderStatut.LIVREE:
        return <Badge className="bg-green-500">Livrée</Badge>;
      default:
        return <Badge variant="secondary">{statut}</Badge>;
    }
  };

  if (!isAuthenticated || !livreur) {
    return null;
  }

  const activeOrders = orders?.filter(
    (o: OnlineOrder) =>
      o.statut === OnlineOrderStatut.EN_LIVRAISON || o.statut === OnlineOrderStatut.PRETE
  ) || [];
  const deliveredOrders = orders?.filter(
    (o: OnlineOrder) => o.statut === OnlineOrderStatut.LIVREE
  ) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">{livreur.nom}</p>
              <p className="text-xs opacity-80">{livreur.telephone}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* GPS Tracking Control */}
      <div className="p-4">
        <Card className={`${isTracking ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isTracking ? 'bg-green-500 text-white' : 'bg-gray-100'
                  }`}
                >
                  <Navigation className={`h-6 w-6 ${isTracking ? 'animate-pulse' : ''}`} />
                </div>
                <div>
                  <p className="font-semibold">
                    {isTracking ? 'Suivi GPS actif' : 'Suivi GPS inactif'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isTracking
                      ? 'Votre position est partagée'
                      : 'Activez pour partager votre position'}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleToggleTracking}
                variant={isTracking ? 'destructive' : 'default'}
                disabled={startDelivery.isPending || stopDelivery.isPending}
              >
                {startDelivery.isPending || stopDelivery.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isTracking ? (
                  'Arrêter'
                ) : (
                  'Activer'
                )}
              </Button>
            </div>
            {gpsError && (
              <div className="mt-3 flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {gpsError}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">Mes livraisons</h2>
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : activeOrders.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Aucune livraison en cours</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {activeOrders.map((order: OnlineOrder) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">
                      Commande #{order.numero}
                    </CardTitle>
                    {getStatusBadge(order.statut)}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(order.createdAt), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Adresse */}
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{order.adresseLivraison || 'Adresse non spécifiée'}</p>
                  </div>

                  {/* Téléphone */}
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`tel:${order.telephoneLivraison || order.customerTelephone}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {order.telephoneLivraison || order.customerTelephone}
                    </a>
                  </div>

                  <Separator />

                  {/* Articles */}
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Articles</p>
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>
                          {item.quantite}x {item.articleNom}
                        </span>
                        <span className="text-muted-foreground">
                          {item.sousTotal.toLocaleString('fr-FR')} F
                        </span>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Total */}
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{order.total.toLocaleString('fr-FR')} F</span>
                  </div>

                  {/* Action */}
                  {order.statut === OnlineOrderStatut.EN_LIVRAISON && (
                    <Button
                      className="w-full mt-2"
                      onClick={() => setConfirmDeliveryId(order.id)}
                      disabled={pendingDeliveryId === order.id}
                    >
                      {pendingDeliveryId === order.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                      )}
                      Marquer comme livrée
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Historique des livraisons */}
        {deliveredOrders.length > 0 && (
          <>
            <h3 className="font-semibold text-muted-foreground mt-6">
              Livrées aujourd'hui ({deliveredOrders.length})
            </h3>
            <div className="space-y-2">
              {deliveredOrders.slice(0, 5).map((order: OnlineOrder) => (
                <Card key={order.id} className="opacity-70">
                  <CardContent className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">#{order.numero}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.total.toLocaleString('fr-FR')} F
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Livrée
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={!!confirmDeliveryId}
        onOpenChange={() => setConfirmDeliveryId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la livraison</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr que cette commande a été livrée au client ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDeliveryId && handleMarkDelivered(confirmDeliveryId)}
            >
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LivreurDashboard;
