import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { OnlineOrder, OnlineOrderStatut } from "@/types";
import { Package, MapPin, Phone, CheckCircle, Truck, XCircle, Clock, User, Calendar } from "lucide-react";

interface OnlineOrderMobileCardProps {
  order: OnlineOrder;
  onConfirm: (id: string) => void;
  onMarkReady: (id: string) => void;
  onMarkDelivered: (id: string) => void;
  onCancel: (id: string) => void;
  onViewDetails: (id: string) => void;
  formatPrix: (prix: number) => string;
  formatDate: (date: string) => string;
}

const statutConfig: Record<OnlineOrderStatut, { label: string; icon: typeof Clock; className: string; bgClassName: string }> = {
  [OnlineOrderStatut.EN_ATTENTE]: {
    label: 'En attente',
    icon: Clock,
    className: 'text-orange-700 dark:text-orange-400',
    bgClassName: 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-800'
  },
  [OnlineOrderStatut.CONFIRMEE]: {
    label: 'Confirmée',
    icon: CheckCircle,
    className: 'text-blue-700 dark:text-blue-400',
    bgClassName: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-800'
  },
  [OnlineOrderStatut.PRETE]: {
    label: 'Prête',
    icon: Package,
    className: 'text-green-700 dark:text-green-400',
    bgClassName: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-800'
  },
  [OnlineOrderStatut.LIVREE]: {
    label: 'Livrée',
    icon: Truck,
    className: 'text-gray-700 dark:text-gray-400',
    bgClassName: 'bg-gray-100 dark:bg-gray-900/30 border-gray-300 dark:border-gray-800'
  },
  [OnlineOrderStatut.ANNULEE]: {
    label: 'Annulée',
    icon: XCircle,
    className: 'text-red-700 dark:text-red-400',
    bgClassName: 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-800'
  },
};

const OnlineOrderMobileCard = ({
  order,
  onConfirm,
  onMarkReady,
  onMarkDelivered,
  onCancel,
  onViewDetails,
  formatPrix,
  formatDate,
}: OnlineOrderMobileCardProps) => {
  const statut = statutConfig[order.statut];
  const StatutIcon = statut.icon;

  return (
    <Card className="transition-shadow hover:shadow-lg hover:border-primary/30">
      <CardContent className="p-0">
        {/* En-tête avec numéro et statut */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-foreground">{order.numero}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3 text-muted-foreground" />
                <p className="text-[10px] text-muted-foreground">{formatDate(order.createdAt)}</p>
              </div>
            </div>
          </div>
          <div className={`px-2 py-1 rounded-full border ${statut.bgClassName}`}>
            <div className="flex items-center gap-1">
              <StatutIcon className={`w-3 h-3 ${statut.className}`} />
              <p className={`text-xs font-bold ${statut.className}`}>{statut.label}</p>
            </div>
          </div>
        </div>

        {/* Client et infos */}
        <div className="p-4 space-y-3">
          {/* Client */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {order.clientNom || 'Client anonyme'}
              </p>
              {order.telephoneLivraison && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">{order.telephoneLivraison}</p>
                </div>
              )}
            </div>
          </div>

          {/* Livraison */}
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {order.modeLivraison === 'LIVRAISON'
                ? order.adresseLivraison || 'Livraison'
                : 'Retrait en boutique'}
            </span>
          </div>

          {/* Articles preview */}
          <div className="space-y-1.5">
            {order.items.slice(0, 2).map((item) => (
              <div key={item.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Package className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  <span className="text-foreground truncate">{item.articleNom}</span>
                </div>
                <span className="text-muted-foreground whitespace-nowrap ml-2">×{item.quantite}</span>
              </div>
            ))}
            {order.items.length > 2 && (
              <button
                onClick={() => onViewDetails(order.id)}
                className="text-xs text-primary font-medium hover:underline transition-transform active:scale-95"
              >
                + {order.items.length - 2} autre{order.items.length - 2 > 1 ? 's' : ''}
              </button>
            )}
          </div>
        </div>

        {/* Montants */}
        <div className="px-4 py-3 bg-primary/5 border-t border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Total</span>
            <span className="text-2xl font-black text-primary">{formatPrix(order.total)}</span>
          </div>

          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-muted-foreground">
              Sous-total: {formatPrix(order.sousTotal)} • Livraison: {formatPrix(order.fraisLivraison)}
            </span>
            <div className="px-2 py-1 rounded-md bg-primary/10">
              <span className="font-bold text-primary">{order.items.length} article{order.items.length > 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-3 border-t border-border bg-card">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="lg" className="w-full h-12 text-sm font-semibold">
                Actions
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-auto max-h-[85vh]">
              <SheetHeader className="mb-4">
                <SheetTitle className="text-left text-lg">{order.numero}</SheetTitle>
                <p className="text-sm text-muted-foreground text-left">
                  {order.clientNom || 'Client anonyme'} • {order.telephoneLivraison}
                </p>
              </SheetHeader>

              <div className="space-y-3">
                {order.statut === OnlineOrderStatut.EN_ATTENTE && (
                  <Button
                    variant="default"
                    size="lg"
                    className="w-full h-14 justify-start text-left text-base"
                    onClick={() => onConfirm(order.id)}
                  >
                    <CheckCircle className="w-5 h-5 mr-3" />
                    Confirmer la commande
                  </Button>
                )}

                {order.statut === OnlineOrderStatut.CONFIRMEE && (
                  <Button
                    variant="default"
                    size="lg"
                    className="w-full h-14 justify-start text-left text-base"
                    onClick={() => onMarkReady(order.id)}
                  >
                    <Package className="w-5 h-5 mr-3" />
                    Marquer prête
                  </Button>
                )}

                {order.statut === OnlineOrderStatut.PRETE && (
                  <Button
                    variant="default"
                    size="lg"
                    className="w-full h-14 justify-start text-left text-base"
                    onClick={() => onMarkDelivered(order.id)}
                  >
                    <Truck className="w-5 h-5 mr-3" />
                    Marquer livrée
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full h-14 justify-start text-left text-base"
                  onClick={() => onViewDetails(order.id)}
                >
                  <Package className="w-5 h-5 mr-3" />
                  Voir les détails
                </Button>

                {(order.statut === OnlineOrderStatut.EN_ATTENTE || order.statut === OnlineOrderStatut.CONFIRMEE) && (
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full h-14 justify-start text-left text-base text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                    onClick={() => onCancel(order.id)}
                  >
                    <XCircle className="w-5 h-5 mr-3" />
                    Annuler la commande
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </CardContent>
    </Card>
  );
};

export default OnlineOrderMobileCard;
