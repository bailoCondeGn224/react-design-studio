import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import CanAccess from "@/components/CanAccess";
import { ShoppingBag, CheckCircle, XCircle, Eye, Edit, Trash2, Printer, AlertCircle } from "lucide-react";

interface CommandeMobileCardProps {
  commande: any;
  clientNom: string;
  onViewDetails: (commande: any) => void;
  onLivrer: (commande: any) => void;
  onEdit: (commande: any) => void;
  onAnnuler: (id: string) => void;
  onDelete: (id: string) => void;
  onPrint: (commande: any) => void;
  formatPrix: (prix: number) => string;
  formatDate: (date: string) => string;
}

const CommandeMobileCard = ({
  commande,
  clientNom,
  onViewDetails,
  onLivrer,
  onEdit,
  onAnnuler,
  onDelete,
  onPrint,
  formatPrix,
  formatDate
}: CommandeMobileCardProps) => {
  const isEnAttente = commande.statut === 'en_attente';
  const isLivree = commande.statut === 'livree';
  const isAnnulee = commande.statut === 'annulee';

  return (
    <Card className={`transition-shadow hover:shadow-lg ${
      isLivree ? 'border-success/30 bg-success/5' :
      isAnnulee ? 'border-destructive/30 bg-destructive/5' :
      'border-warning/30 bg-warning/5'
    }`}>
      <CardContent className="p-0">
        {/* En-tête simple */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div>
            <p className="text-sm font-bold text-foreground">{commande.numero}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{clientNom}</p>
          </div>
          {isLivree && (
            <div className="px-2 py-1 rounded-full bg-success/10 border border-success/20">
              <p className="text-xs font-bold text-success">Livrée</p>
            </div>
          )}
          {isAnnulee && (
            <div className="px-2 py-1 rounded-full bg-destructive/10 border border-destructive/20">
              <p className="text-xs font-bold text-destructive">Annulée</p>
            </div>
          )}
          {isEnAttente && (
            <div className="px-2 py-1 rounded-full bg-warning/10 border border-warning/20">
              <p className="text-xs font-bold text-warning">En attente</p>
            </div>
          )}
        </div>

        {/* Total - Section importante */}
        <div className={`px-4 py-3 ${
          isLivree ? 'bg-success/10 border-success/20' :
          isAnnulee ? 'bg-destructive/10 border-destructive/20' :
          'bg-warning/10 border-warning/20'
        } border-t`}>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Total commande</p>
              <p className={`text-lg font-black ${
                isLivree ? 'text-success' :
                isAnnulee ? 'text-destructive' :
                'text-warning'
              }`}>
                {formatPrix(commande.total)}
              </p>
            </div>
            {commande.montantRestant > 0 && (
              <div className="flex items-center justify-between pt-1 border-t border-border/50">
                <p className="text-xs font-medium text-muted-foreground">Restant</p>
                <p className="text-base font-bold text-warning">{formatPrix(commande.montantRestant)}</p>
              </div>
            )}
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
                <SheetTitle className="text-left text-lg">{commande.numero}</SheetTitle>
                <p className="text-sm text-muted-foreground text-left">{clientNom}</p>
              </SheetHeader>

              {/* Infos détaillées dans le Sheet */}
              <div className="space-y-3 mb-6">
                {commande.acompte > 0 && (
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Acompte versé</span>
                    <span className="text-sm font-medium text-success">{formatPrix(commande.acompte)}</span>
                  </div>
                )}
                {commande.dateLivraison && (
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Livraison prévue</span>
                    <span className="text-sm font-medium">{formatDate(commande.dateLivraison)}</span>
                  </div>
                )}
                <div className="flex justify-between py-2">
                  <span className="text-sm text-muted-foreground">Créée le</span>
                  <span className="text-sm font-medium">{formatDate(commande.createdAt)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full h-14 justify-start text-left text-base"
                  onClick={() => onViewDetails(commande)}
                >
                  <Eye className="w-5 h-5 mr-3" />
                  Voir les détails
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full h-14 justify-start text-left text-base"
                  onClick={() => onPrint(commande)}
                >
                  <Printer className="w-5 h-5 mr-3" />
                  Imprimer le reçu
                </Button>

                {isEnAttente && (
                  <>
                    <CanAccess permissions={['commandes.livrer']}>
                      <Button
                        variant="default"
                        size="lg"
                        className="w-full h-14 justify-start text-left text-base bg-success hover:bg-success/90"
                        onClick={() => onLivrer(commande)}
                      >
                        <CheckCircle className="w-5 h-5 mr-3" />
                        Marquer comme livrée
                      </Button>
                    </CanAccess>

                    <CanAccess permissions={['commandes.update']}>
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full h-14 justify-start text-left text-base"
                        onClick={() => onEdit(commande)}
                      >
                        <Edit className="w-5 h-5 mr-3" />
                        Modifier
                      </Button>
                    </CanAccess>

                    <CanAccess permissions={['commandes.annuler']}>
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full h-14 justify-start text-left text-base text-warning hover:text-warning hover:bg-warning/10 border-warning/30"
                        onClick={() => onAnnuler(commande.id)}
                      >
                        <XCircle className="w-5 h-5 mr-3" />
                        Annuler la commande
                      </Button>
                    </CanAccess>
                  </>
                )}

                <CanAccess permissions={['commandes.delete']}>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full h-14 justify-start text-left text-base text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                    onClick={() => onDelete(commande.id)}
                  >
                    <Trash2 className="w-5 h-5 mr-3" />
                    Supprimer
                  </Button>
                </CanAccess>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommandeMobileCard;
