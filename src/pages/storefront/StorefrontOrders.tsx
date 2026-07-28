// src/pages/storefront/StorefrontOrders.tsx
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { StorefrontLayout } from '@/components/storefront/StorefrontLayout';
import { apiClient } from '@/lib/api-client';
import { Loader2, Package, ChevronRight } from 'lucide-react';
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
    LIVREE: 'bg-green-600 text-white',
    ANNULEE: 'bg-red-100 text-red-800',
  };

  const labels = {
    EN_ATTENTE: 'En attente',
    CONFIRMEE: 'Confirmée',
    PRETE: 'Prête',
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

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['customer-orders', customer?.id],
    queryFn: () => apiClient.get('/public/orders').then(res => res.data),
    enabled: !!customer,
  });

  const orders = ordersData?.data || [];

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
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <h1 className="text-xl font-bold">Mes commandes</h1>
          <p className="text-sm text-gray-600 mt-1">
            {orders.length} {orders.length > 1 ? 'commandes' : 'commande'}
          </p>
        </div>

        {/* Orders List */}
        <div className="p-4 space-y-3">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <Package className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="font-semibold text-lg mb-2">Aucune commande</h3>
              <p className="text-sm text-gray-600 text-center mb-4">
                Vous n'avez pas encore passé de commande
              </p>
              <Button onClick={() => navigate(`/b/${slug}`)}>
                Découvrir les produits
              </Button>
            </div>
          ) : (
            orders.map((order: any) => {
              const badge = getStatutBadge(order.statut);
              return (
                <div
                  key={order.id}
                  onClick={() => navigate(`/b/${slug}/orders/${order.id}`)}
                  className="bg-white rounded-lg border border-gray-200 p-4 active:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="h-4 w-4 text-gray-400 shrink-0" />
                        <p className="font-semibold text-sm truncate">
                          Commande {order.numero}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 shrink-0" />
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.className}`}>
                      {badge.label}
                    </span>
                    <span className="font-bold text-sm">
                      {formatPrix(order.total)}
                    </span>
                  </div>
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
