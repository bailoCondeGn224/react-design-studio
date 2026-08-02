import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLivreurAuth } from '@/contexts/LivreurAuthContext';
import {
  useLivreurOrders,
  useMarkDelivered,
  useUpdateLivreurPosition,
} from '@/hooks/useLivreurOrders';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Loader2,
  MapPin,
  Phone,
  Package,
  Navigation,
  CheckCircle,
  LogOut,
} from 'lucide-react';

const formatPrix = (prix: number) => {
  return (
    new Intl.NumberFormat('fr-GN', { style: 'decimal' }).format(prix) + ' GNF'
  );
};

const LivreurDashboard = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { livreur, isAuthenticated, logout } = useLivreurAuth();
  const { data: orders = [], isLoading } = useLivreurOrders();
  const markDelivered = useMarkDelivered();
  const updatePosition = useUpdateLivreurPosition();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(`/b/${slug}/livreur`);
    }
  }, [isAuthenticated, navigate, slug]);

  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        updatePosition.mutate({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 30000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const handleNavigate = (address: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
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

      <div className="p-4 space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Aucune livraison en cours</p>
          </div>
        ) : (
          orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-bold">{order.numero}</p>
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
                    <span>{order.adresseLivraison}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="h-12"
                    onClick={() => handleNavigate(order.adresseLivraison || '')}
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
