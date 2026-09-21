import { CheckCircle, Loader2, MapPin, Navigation, Package, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { buildDirectionsUrl } from '@/lib/geo';
import { OnlineOrder } from '@/types';

// Même rendu que les autres pages de la boutique (« 150 000 GNF ») ;
// utils/format-prix donnerait « 150 000 FG ».
const formatPrix = (prix: number) =>
  new Intl.NumberFormat('fr-GN', { style: 'decimal' }).format(prix) + ' GNF';

interface LivreurOrderCardProps {
  order: OnlineOrder;
  /** Numéro affiché dans la pastille ; absent quand il n'y a qu'une course. */
  position?: number;
  isSelected: boolean;
  onSelect: () => void;
  onNavigate: () => void;
  onMarkDelivered: () => void;
  isMarkingDelivered: boolean;
}

export const LivreurOrderCard = ({
  order,
  position,
  isSelected,
  onSelect,
  onNavigate,
  onMarkDelivered,
  isMarkingDelivered,
}: LivreurOrderCardProps) => {
  const canNavigate = !!buildDirectionsUrl({
    latitude: order.latitudeLivraison,
    longitude: order.longitudeLivraison,
    adresse: order.adresseLivraison,
  });
  const hasGpsPoint =
    order.latitudeLivraison != null && order.longitudeLivraison != null;

  return (
    <Card
      onClick={onSelect}
      className={isSelected ? 'border-primary ring-1 ring-primary' : undefined}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {position != null && (
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">
                {position}
              </span>
            )}
            <p className="font-bold">{order.numero}</p>
          </div>
          <p className="text-lg font-bold text-primary">{formatPrix(order.total)}</p>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span>{order.clientNom || 'Client'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <a href={`tel:${order.telephoneLivraison}`} className="text-primary">
              {order.telephoneLivraison}
            </a>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <span>{order.adresseLivraison || 'Adresse non précisée'}</span>
              {hasGpsPoint && (
                <p className="text-xs text-green-700">Point GPS fourni par le client</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button
            variant="outline"
            className="h-12"
            disabled={!canNavigate}
            onClick={onNavigate}
          >
            <Navigation className="h-4 w-4 mr-2" />
            Naviguer
          </Button>
          <Button
            className="h-12"
            onClick={onMarkDelivered}
            disabled={isMarkingDelivered}
          >
            {isMarkingDelivered ? (
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
  );
};
