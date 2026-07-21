// src/pages/customer/CustomerOrderDetail.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useCustomerOrder } from '@/hooks/useOnlineOrders';
import { CustomerNavbar } from '@/components/customer/CustomerNavbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Loader2, Package, Calendar, MapPin, Phone } from 'lucide-react';
import { OnlineOrderStatut } from '@/types';

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

const statutConfig: Record<OnlineOrderStatut, { label: string; className: string }> = {
  [OnlineOrderStatut.EN_ATTENTE]: { label: 'En attente', className: 'bg-orange-100 text-orange-700' },
  [OnlineOrderStatut.CONFIRMEE]: { label: 'Confirmée', className: 'bg-blue-100 text-blue-700' },
  [OnlineOrderStatut.PRETE]: { label: 'Prête', className: 'bg-green-100 text-green-700' },
  [OnlineOrderStatut.LIVREE]: { label: 'Livrée', className: 'bg-gray-100 text-gray-700' },
  [OnlineOrderStatut.ANNULEE]: { label: 'Annulée', className: 'bg-red-100 text-red-700' },
};

const CustomerOrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading } = useCustomerOrder(id || '');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-muted-foreground mb-4">Commande introuvable</p>
        <Button onClick={() => navigate('/customer/orders')}>Retour</Button>
      </div>
    );
  }

  const statut = statutConfig[order.statut];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background border-b">
        <div className="flex items-center h-14 px-4 gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/customer/orders')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold">{order.numero}</h1>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Statut */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Statut</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statut.className}`}>
            {statut.label}
          </span>
        </div>

        {/* Infos */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{formatDate(order.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {order.modeLivraison === 'LIVRAISON' ? order.adresseLivraison : 'Retrait en boutique'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{order.telephoneLivraison}</span>
            </div>
          </CardContent>
        </Card>

        {/* Articles */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Articles ({order.items.length})
            </h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div>
                    <p className="font-medium">{item.articleNom}</p>
                    {item.modeVenteNom && (
                      <p className="text-xs text-muted-foreground">{item.modeVenteNom}</p>
                    )}
                    <p className="text-muted-foreground">
                      {formatPrix(item.prixUnitaire)} × {item.quantite}
                    </p>
                  </div>
                  <span className="font-medium">{formatPrix(item.sousTotal)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Totaux */}
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Sous-total</span>
              <span>{formatPrix(order.sousTotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Livraison</span>
              <span>{formatPrix(order.fraisLivraison)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total</span>
              <span className="text-primary">{formatPrix(order.total)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <CustomerNavbar />
    </div>
  );
};

export default CustomerOrderDetail;
