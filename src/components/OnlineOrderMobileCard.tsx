import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { OnlineOrder, OnlineOrderStatut, ModeLivraison } from "@/types";
import { Package, MapPin, Phone, CheckCircle, Truck, XCircle, Clock, User, Calendar, MoreVertical } from "lucide-react";

interface OnlineOrderMobileCardProps {
  order: OnlineOrder;
  onConfirm: (id: string) => void;
  onMarkReady: (id: string) => void;
  onMarkDelivered: (id: string) => void;
  onCancel: (id: string) => void;
  onViewDetails: (id: string) => void;
  onDispatch?: (id: string) => void;
  formatPrix: (prix: number) => string;
  formatDate: (date: string) => string;
  isConfirming?: boolean;
  isMarkingReady?: boolean;
  isMarkingDelivered?: boolean;
  isCanceling?: boolean;
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
  [OnlineOrderStatut.EN_LIVRAISON]: {
    label: 'En livraison',
    icon: Truck,
    className: 'text-purple-700 dark:text-purple-400',
    bgClassName: 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-800'
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
  onDispatch,
  formatPrix,
  formatDate,
  isConfirming = false,
  isMarkingReady = false,
  isMarkingDelivered = false,
  isCanceling = false,
}: OnlineOrderMobileCardProps) => {
  const statut = statutConfig[order.statut];
  const StatutIcon = statut.icon;

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 border-l-4" style={{ borderLeftColor: statut.className.includes('orange') ? '#f97316' : statut.className.includes('blue') ? '#3b82f6' : statut.className.includes('green') ? '#10b981' : statut.className.includes('gray') ? '#6b7280' : '#ef4444' }}>
      <CardContent className="p-0">
        {/* En-tête avec numéro et statut */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{order.numero}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3 text-muted-foreground" />
                <p className="text-[10px] text-muted-foreground">{formatDate(order.createdAt)}</p>
              </div>
            </div>
          </div>
          <div className={`px-2.5 py-1.5 rounded-full border ${statut.bgClassName} shadow-sm`}>
            <div className="flex items-center gap-1.5">
              <StatutIcon className={`w-3.5 h-3.5 ${statut.className}`} />
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
              {order.modeLivraison === ModeLivraison.LIVRAISON
                ? order.adresseLivraison || 'Livraison'
                : 'Retrait en boutique'}
            </span>
          </div>

          {/* Articles preview */}
          <div className="space-y-2">
            {order.items.slice(0, 2).map((item, index) => (
              <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium text-foreground truncate block">{item.articleNom}</span>
                    {item.modeVenteNom && item.quantite !== item.quantiteBase && (
                      <span className="text-[10px] text-muted-foreground">({item.quantite} {item.modeVenteNom})</span>
                    )}
                  </div>
                </div>
                <div className="px-2 py-1 rounded-md bg-primary/10">
                  <span className="text-xs font-bold text-primary">×{item.quantiteBase || item.quantite}</span>
                </div>
              </div>
            ))}
            {order.items.length > 2 && (
              <button
                onClick={() => onViewDetails(order.id)}
                className="w-full text-xs text-primary font-semibold hover:underline transition-all active:scale-95 py-1.5"
              >
                + {order.items.length - 2} autre{order.items.length - 2 > 1 ? 's' : ''} article{order.items.length - 2 > 1 ? 's' : ''}
              </button>
            )}
          </div>
        </div>

        {/* Montants */}
        <div className="px-4 py-3 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-t border-primary/10">
          <div className="flex items-end justify-between mb-2">
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Total</p>
              <span className="text-2xl font-black text-primary bg-gradient-to-r from-primary to-primary/80 bg-clip-text">{formatPrix(order.total)}</span>
            </div>
            <div className="px-3 py-1.5 rounded-full bg-primary shadow-sm">
              <span className="text-xs font-bold text-primary-foreground">{order.items.length} article{order.items.length > 1 ? 's' : ''}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="font-medium">Sous-total:</span> {formatPrix(order.sousTotal)}
            </span>
            <span className="text-border">•</span>
            <span className="flex items-center gap-1">
              <Truck className="w-3 h-3" />
              {formatPrix(order.fraisLivraison)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-3 border-t border-border/50 bg-muted/20">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="default"
                size="lg"
                className="w-full h-11 text-sm font-semibold shadow-sm hover:shadow-md transition-all active:scale-95"
              >
                <MoreVertical className="w-4 h-4 mr-2" />
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
                    disabled={isConfirming}
                  >
                    <CheckCircle className="w-5 h-5 mr-3" />
                    {isConfirming ? 'Confirmation...' : 'Confirmer la commande'}
                  </Button>
                )}

                {order.statut === OnlineOrderStatut.CONFIRMEE && (
                  <Button
                    variant="default"
                    size="lg"
                    className="w-full h-14 justify-start text-left text-base"
                    onClick={() => onMarkReady(order.id)}
                    disabled={isMarkingReady}
                  >
                    <Package className="w-5 h-5 mr-3" />
                    {isMarkingReady ? 'Marquage...' : 'Marquer prête'}
                  </Button>
                )}

                {/* PRETE + RETRAIT_BOUTIQUE: Client récupère en boutique */}
                {order.statut === OnlineOrderStatut.PRETE &&
                  order.modeLivraison === ModeLivraison.RETRAIT_BOUTIQUE && (
                  <Button
                    variant="default"
                    size="lg"
                    className="w-full h-14 justify-start text-left text-base bg-green-600 hover:bg-green-700"
                    onClick={() => onMarkDelivered(order.id)}
                    disabled={isMarkingDelivered}
                  >
                    <Package className="w-5 h-5 mr-3" />
                    {isMarkingDelivered ? 'Marquage...' : 'Client a récupéré'}
                  </Button>
                )}

                {/* PRETE + LIVRAISON: Dispatcher à un livreur */}
                {order.statut === OnlineOrderStatut.PRETE &&
                  order.modeLivraison === ModeLivraison.LIVRAISON &&
                  onDispatch && (
                    <Button
                      variant="default"
                      size="lg"
                      className="w-full h-14 justify-start text-left text-base bg-blue-600 hover:bg-blue-700"
                      onClick={() => onDispatch(order.id)}
                    >
                      <Truck className="w-5 h-5 mr-3" />
                      Dispatcher à un livreur
                    </Button>
                  )}

                {/* EN_LIVRAISON: Info - Le livreur marque comme livrée */}
                {order.statut === OnlineOrderStatut.EN_LIVRAISON && (
                  <div className="w-full p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                    <p className="text-sm text-blue-700">
                      🚚 En cours de livraison par <strong>{order.livreur?.nom || 'le livreur'}</strong>
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Le livreur marquera la commande comme livrée
                    </p>
                  </div>
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
                    disabled={isCanceling}
                  >
                    <XCircle className="w-5 h-5 mr-3" />
                    {isCanceling ? 'Annulation...' : 'Annuler la commande'}
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
