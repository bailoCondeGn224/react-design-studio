// src/pages/storefront/StorefrontOrders.tsx
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { useCustomerNotifications } from '@/hooks/useCustomerNotifications';
import { StorefrontLayout } from '@/components/storefront/StorefrontLayout';
import { apiClient } from '@/lib/api-client';
import { Loader2, Package, ChevronRight, MapPin, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const formatPrix = (prix: number) => {
  return new Intl.NumberFormat('fr-GN', { style: 'decimal' }).format(prix) + ' GNF';
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const getStatutBadge = (statut: string) => {
  const styles = {
    EN_ATTENTE: 'bg-yellow-100 text-yellow-800',
    CONFIRMEE: 'bg-blue-100 text-blue-800',
    PRETE: 'bg-green-100 text-green-800',
    EN_LIVRAISON: 'bg-purple-100 text-purple-800',
    LIVREE: 'bg-green-600 text-white',
    ANNULEE: 'bg-red-100 text-red-800',
  };

  const labels = {
    EN_ATTENTE: 'En attente',
    CONFIRMEE: 'Confirmée',
    PRETE: 'Prête',
    EN_LIVRAISON: 'En livraison',
    LIVREE: 'Livrée',
    ANNULEE: 'Annulée',
  };

  return {
    className: styles[statut as keyof typeof styles] || styles.EN_ATTENTE,
    label: labels[statut as keyof typeof labels] || statut,
  };
};

const StorefrontOrders = () => {
  const { slug } = useParams<{ slug: string }>();
  const { customer } = useCustomerAuth();
  const navigate = useNavigate();
  const { refresh } = useCustomerNotifications();

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['customer-orders', customer?.id],
    queryFn: () => apiClient.get('/public/orders').then(res => res.data),
    enabled: !!customer,
  });

  const orders = ordersData?.data || [];

  // Rafraîchir les notifications quand on accède à cette page
  useEffect(() => {
    refresh();
  }, [refresh]);

  if (isLoading) {
    return (
      <StorefrontLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </StorefrontLayout>
    );
  }

  return (
    <StorefrontLayout>
      <div className="min-h-screen bg-background pb-20">
        {/* Header */}
        <div className="bg-card border-b border-border px-4 py-4">
          <h1 className="text-xl font-bold text-foreground">Mes commandes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {orders.length} {orders.length > 1 ? 'commandes' : 'commande'}
          </p>
        </div>

        {/* Orders List */}
        <div className="p-4 space-y-3">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <Package className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="font-semibold text-lg text-foreground mb-2">Aucune commande</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Vous n'avez pas encore passé de commande
              </p>
              <Button onClick={() => navigate(`/b/${slug}`)}>
                Découvrir les produits
              </Button>
            </div>
          ) : (
            orders.map((order: any) => {
              const badge = getStatutBadge(order.statut);
              const isEnLivraison = order.statut === 'EN_LIVRAISON';

              return (
                <div
                  key={order.id}
                  className="bg-card rounded-lg border border-border shadow-card overflow-hidden"
                >
                  {/* En-tête cliquable */}
                  <div
                    onClick={() => navigate(`/b/${slug}/orders/${order.id}`)}
                    className="p-4 active:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                          <p className="font-semibold text-sm text-foreground truncate">
                            Commande {order.numero}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.className}`}>
                        {badge.label}
                      </span>
                      <span className="font-bold text-sm text-foreground">
                        {formatPrix(order.total)}
                      </span>
                    </div>
                  </div>

                  {/* Bouton Suivre ma livraison - visible uniquement pour EN_LIVRAISON */}
                  {isEnLivraison && (
                    <div className="border-t border-border bg-primary/5 p-3">
                      <Button
                        onClick={() => navigate(`/b/${slug}/orders/${order.id}`)}
                        className="w-full"
                        size="sm"
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        Suivre ma livraison
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </StorefrontLayout>
  );
};

export default StorefrontOrders;
