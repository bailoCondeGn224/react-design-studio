// src/components/customer/CustomerOrderMobileCard.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OnlineOrder, OnlineOrderStatut } from '@/types';
import { Package, Calendar, MapPin, ShoppingCart } from 'lucide-react';

interface CustomerOrderMobileCardProps {
  order: OnlineOrder;
  onViewDetails: () => void;
  formatPrix: (prix: number) => string;
  formatDate: (date: string) => string;
}

const statutConfig: Record<OnlineOrderStatut, { label: string; className: string }> = {
  [OnlineOrderStatut.EN_ATTENTE]: { label: 'En attente', className: 'bg-orange-100 text-orange-700 border-orange-200' },
  [OnlineOrderStatut.CONFIRMEE]: { label: 'Confirmée', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  [OnlineOrderStatut.PRETE]: { label: 'Prête', className: 'bg-green-100 text-green-700 border-green-200' },
  [OnlineOrderStatut.LIVREE]: { label: 'Livrée', className: 'bg-gray-100 text-gray-700 border-gray-200' },
  [OnlineOrderStatut.ANNULEE]: { label: 'Annulée', className: 'bg-red-100 text-red-700 border-red-200' },
};

export const CustomerOrderMobileCard = ({
  order,
  onViewDetails,
  formatPrix,
  formatDate,
}: CustomerOrderMobileCardProps) => {
  const statut = statutConfig[order.statut];

  return (
    <Card>
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <span className="font-bold">{order.numero}</span>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statut.className}`}>
            {statut.label}
          </span>
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(order.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>
              {order.modeLivraison === 'LIVRAISON' ? `Livraison - ${order.adresseLivraison}` : 'Retrait en boutique'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShoppingCart className="h-4 w-4" />
            <span>{order.items.length} article{order.items.length > 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Total */}
        <div className="px-4 py-3 bg-muted/50">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-xl font-bold text-primary">{formatPrix(order.total)}</span>
          </div>
        </div>

        {/* Action */}
        <div className="p-3 border-t">
          <Button variant="outline" className="w-full h-12" onClick={onViewDetails}>
            Voir les détails
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
