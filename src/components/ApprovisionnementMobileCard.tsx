import { Card, CardContent } from "@/components/ui/card";
import { Truck, Package, Calendar, MoreVertical, Eye, Printer, Edit, Trash } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import CanAccess from "./CanAccess";

interface ApprovisionnementMobileCardProps {
  item: any;
  formatPrix: (prix: number) => string;
  formatDate: (date: string) => string;
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
  onViewDetails: (id: string) => void;
  onPrintReceipt: (id: string) => void;
}

const ApprovisionnementMobileCard = ({
  item,
  formatPrix,
  formatDate,
  onEdit,
  onDelete,
  onViewDetails,
  onPrintReceipt,
}: ApprovisionnementMobileCardProps) => {
  const totalArticles = item.lignes?.length || 0;
  const totalQuantite = item.lignes?.reduce((sum: number, l: any) => sum + l.quantite, 0) || 0;

  return (
    <Card className="transition-shadow hover:shadow-lg border-primary/30 bg-primary/5">
      <CardContent className="p-0">
        {/* En-tête */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{item.numero}</p>
              <p className="text-xs text-muted-foreground truncate">
                {item.fournisseurNom}
              </p>
            </div>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <button className="w-8 h-8 rounded-full hover:bg-muted transition-all active:scale-95 flex items-center justify-center flex-shrink-0">
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-auto">
              <SheetHeader>
                <SheetTitle className="text-base">Actions</SheetTitle>
              </SheetHeader>
              <div className="grid gap-2 pt-4">
                <Button
                  variant="outline"
                  className="w-full justify-start h-11"
                  onClick={() => onViewDetails(item.id)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Voir détails
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-11"
                  onClick={() => onPrintReceipt(item.id)}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimer Reçu
                </Button>
                <CanAccess permissions={['approvisionnements.update']}>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-11"
                    onClick={() => onEdit(item)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Modifier
                  </Button>
                </CanAccess>
                <CanAccess permissions={['approvisionnements.delete']}>
                  <Button
                    variant="destructive"
                    className="w-full justify-start h-11"
                    onClick={() => onDelete(item.id)}
                  >
                    <Trash className="w-4 h-4 mr-2" />
                    Annuler
                  </Button>
                </CanAccess>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Informations principales */}
        <div className="p-4 space-y-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground">Articles</p>
            </div>
            <p className="text-sm font-bold text-foreground">
              {totalArticles} {totalArticles > 1 ? 'articles' : 'article'} • {totalQuantite} unités
            </p>
          </div>

          {item.numeroFacture && (
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">N° Facture</p>
              <p className="text-sm font-semibold text-foreground">{item.numeroFacture}</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground">Date livraison</p>
            </div>
            <p className="text-sm font-semibold text-foreground">{formatDate(item.dateLivraison)}</p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <p className="text-xs font-semibold text-muted-foreground">Total approvisionnement</p>
            <p className="text-lg font-black text-primary">{formatPrix(item.total)}</p>
          </div>

          {item.montantRestant > 0 && (
            <div className="flex items-center justify-between pt-1 border-t border-border/50">
              <p className="text-xs font-medium text-muted-foreground">Montant restant</p>
              <p className="text-base font-bold text-destructive">{formatPrix(item.montantRestant)}</p>
            </div>
          )}
        </div>

        {/* Articles (afficher les 3 premiers) */}
        {item.lignes && item.lignes.length > 0 && (
          <div className="p-3 border-t border-border bg-card">
            <p className="text-xs font-medium text-muted-foreground mb-2">Articles livrés</p>
            <div className="space-y-2">
              {item.lignes.slice(0, 3).map((ligne: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex-1 min-w-0 mr-2">
                    <p className="font-medium text-foreground truncate">{ligne.nom}</p>
                    <p className="text-muted-foreground">
                      {ligne.quantite} × {formatPrix(ligne.prixUnitaire)}
                    </p>
                  </div>
                  <p className="font-bold text-foreground whitespace-nowrap">{formatPrix(ligne.sousTotal)}</p>
                </div>
              ))}
              {item.lignes.length > 3 && (
                <p className="text-xs text-muted-foreground text-center pt-1">
                  + {item.lignes.length - 3} autres articles
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApprovisionnementMobileCard;
