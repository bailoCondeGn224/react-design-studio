// src/pages/storefront/StorefrontOrderDetail.tsx
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { StorefrontLayout } from '@/components/storefront/StorefrontLayout';
import { TrackingMap } from '@/components/storefront/TrackingMap';
import { CustomerLocationShare } from '@/components/storefront/CustomerLocationShare';
import { apiClient } from '@/lib/api-client';
import { useOrderTracking } from '@/hooks/useLivreurs';
import { Loader2, ArrowLeft, Package, MapPin, Phone, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OnlineOrderStatut } from '@/types/customer';

const formatPrix = (prix: number) => {
  return new Intl.NumberFormat('fr-GN', { style: 'decimal' }).format(prix) + ' GNF';
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
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

const StorefrontOrderDetail = () => {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const navigate = useNavigate();

  const { data: orderData, isLoading } = useQuery({
    queryKey: ['order-detail', id],
    queryFn: () => apiClient.get(`/public/orders/${id}`).then(res => res.data),
    enabled: !!id,
  });

  // Suivi GPS du livreur (seulement si commande en livraison)
  const isEnLivraison = orderData?.statut === OnlineOrderStatut.EN_LIVRAISON;
  const { data: tracking, isLoading: trackingLoading } = useOrderTracking(
    id || '',
    isEnLivraison && !!id
  );

  if (isLoading) {
    return (
      <StorefrontLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </StorefrontLayout>
    );
  }

  if (!orderData) {
    return (
      <StorefrontLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <Package className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="font-semibold text-lg mb-2">Commande non trouvée</h3>
          <Button onClick={() => navigate(`/b/${slug}/orders`)}>
            Retour à mes commandes
          </Button>
        </div>
      </StorefrontLayout>
    );
  }

  const order = orderData;
  const badge = getStatutBadge(order.statut);

  return (
    <StorefrontLayout>
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => navigate(`/b/${slug}/orders`)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-bold">Commande {order.numero}</h1>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.className}`}>
              {badge.label}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Suivi GPS du livreur */}
          {isEnLivraison && (
            <div className="bg-white rounded-lg border border-purple-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Truck className="h-5 w-5 text-purple-600" />
                <h2 className="font-semibold text-base text-purple-800">Suivi en temps réel</h2>
              </div>
              <TrackingMap
                tracking={tracking}
                isLoading={trackingLoading}
                height="250px"
              />
              <p className="text-xs text-gray-500 mt-2 text-center">
                La position est mise à jour toutes les 30 secondes
              </p>
            </div>
          )}

          {/* Partage de position client */}
          <CustomerLocationShare
            orderId={order.id}
            isOrderEnLivraison={isEnLivraison}
          />

          {/* Informations de livraison */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="font-semibold text-base mb-3">Informations de livraison</h2>
            <div className="space-y-2">
              {order.adresseLivraison && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Adresse</p>
                    <p className="text-sm text-gray-600">{order.adresseLivraison}</p>
                  </div>
                </div>
              )}
              {order.telephoneLivraison && (
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Téléphone</p>
                    <p className="text-sm text-gray-600">{order.telephoneLivraison}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Articles */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="font-semibold text-base mb-3">Articles commandés</h2>
            <div className="space-y-3">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex-1 min-w-0 pr-3">
                    <p className="font-medium text-sm">{item.articleNom}</p>
                    {item.modeVenteNom && (
                      <p className="text-xs text-gray-500">{item.modeVenteNom}</p>
                    )}
                    <p className="text-xs text-gray-600 mt-1">
                      {formatPrix(item.prixUnitaire)} × {item.quantite}
                    </p>
                  </div>
                  <p className="font-semibold text-sm shrink-0">
                    {formatPrix(item.sousTotal)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Résumé */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="font-semibold text-base mb-3">Résumé</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Sous-total</span>
                <span>{formatPrix(order.sousTotal)}</span>
              </div>
              {order.fraisLivraison > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Frais de livraison</span>
                  <span>{formatPrix(order.fraisLivraison)}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-lg">{formatPrix(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Statut timeline */}
          {(order.confirmeeLe || order.preteLe || order.expedieeLe || order.livreeLe || order.annuleeLe) && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="font-semibold text-base mb-3">Suivi</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-500 mt-1.5 shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium">Commande passée</p>
                    <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
                {order.confirmeeLe && (
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium">Confirmée</p>
                      <p className="text-xs text-gray-500">{formatDate(order.confirmeeLe)}</p>
                    </div>
                  </div>
                )}
                {order.preteLe && (
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-green-500 mt-1.5 shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium">Prête</p>
                      <p className="text-xs text-gray-500">{formatDate(order.preteLe)}</p>
                    </div>
                  </div>
                )}
                {order.expedieeLe && (
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-purple-500 mt-1.5 shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium">En livraison</p>
                      <p className="text-xs text-gray-500">{formatDate(order.expedieeLe)}</p>
                      {order.livreurNom && (
                        <p className="text-xs text-gray-600 mt-1">Livreur: {order.livreurNom}</p>
                      )}
                    </div>
                  </div>
                )}
                {order.livreeLe && (
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-green-600 mt-1.5 shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium">Livrée</p>
                      <p className="text-xs text-gray-500">{formatDate(order.livreeLe)}</p>
                    </div>
                  </div>
                )}
                {order.annuleeLe && (
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-red-500 mt-1.5 shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium">Annulée</p>
                      <p className="text-xs text-gray-500">{formatDate(order.annuleeLe)}</p>
                      {order.motifAnnulation && (
                        <p className="text-xs text-gray-600 mt-1">Motif: {order.motifAnnulation}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </StorefrontLayout>
  );
};

export default StorefrontOrderDetail;
