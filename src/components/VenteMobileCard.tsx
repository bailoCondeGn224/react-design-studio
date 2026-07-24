import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import CanAccess from "@/components/CanAccess";
import { Receipt, CreditCard, Banknote, Smartphone, AlertCircle, Edit, Trash, Printer, MessageCircle, User, Phone, Package } from "lucide-react";

interface VenteMobileCardProps {
  vente: any;
  onEdit: (vente: any) => void;
  onDelete: (id: string) => void;
  onViewDetails: (id: string) => void;
  onPrintInvoice: (id: string) => void;
  onShareWhatsApp: (id: string) => void;
  formatPrix: (prix: number) => string;
  formatDate: (date: string) => string;
}

const paymentIcons: Record<string, typeof Banknote> = {
  "especes": Banknote,
  "mobile_money": Smartphone,
  "virement": CreditCard,
  "credit": AlertCircle,
  "acompte_50": CreditCard,
};

const paymentLabels: Record<string, string> = {
  "especes": "Espèces",
  "mobile_money": "Mobile Money",
  "virement": "Virement",
  "credit": "Crédit",
  "acompte_50": "Acompte 50%",
};

const VenteMobileCard = ({
  vente,
  onEdit,
  onDelete,
  onViewDetails,
  onPrintInvoice,
  onShareWhatsApp,
  formatPrix,
  formatDate
}: VenteMobileCardProps) => {
  const PaymentIcon = paymentIcons[vente.modePaiement] || Receipt;
  const hasCredit = vente.montantRestant > 0;
  const totalQuantite = vente.lignes?.reduce((sum: number, ligne: any) => sum + (ligne.quantiteBase || ligne.quantite || 0), 0) || 0;

  return (
    <Card className={`transition-shadow hover:shadow-lg ${
      hasCredit ? 'border-warning/30 bg-warning/5' : 'hover:border-primary/30'
    }`}>
      <CardContent className="p-0">
        {/* En-tête avec numéro et date */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-foreground">{vente.numero}</p>
              <p className="text-[10px] text-muted-foreground">
                {formatDate(vente.date)} • {vente.heure}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {vente.statut === 'annulee' ? (
              <div className="px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800">
                <p className="text-xs font-bold text-red-700 dark:text-red-400">Annulée</p>
              </div>
            ) : hasCredit ? (
              <div className="px-2 py-1 rounded-full bg-warning/10 border border-warning/20">
                <p className="text-xs font-bold text-warning">Crédit</p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Client et infos principales */}
        <div className="p-4 space-y-3">
          {/* Client */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {vente.nom} {vente.prenom}
              </p>
              {vente.tel && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">{vente.tel}</p>
                </div>
              )}
            </div>
          </div>

          {/* Articles */}
          {vente.lignes && vente.lignes.length > 0 && (
            <div className="space-y-1.5">
              {vente.lignes.slice(0, 2).map((ligne: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Package className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <span className="text-foreground truncate">{ligne.nom}</span>
                  </div>
                  <div className="text-muted-foreground whitespace-nowrap ml-2 flex items-center gap-1">
                    <span>×{ligne.quantiteBase || ligne.quantite}</span>
                    {ligne.modeVente && ligne.quantite !== ligne.quantiteBase && (
                      <span className="text-[10px]">({ligne.quantite}×{ligne.modeVente.nom})</span>
                    )}
                  </div>
                </div>
              ))}
              {vente.lignes.length > 2 && (
                <button
                  onClick={() => onViewDetails(vente.id)}
                  className="text-xs text-primary font-medium hover:underline transition-transform active:scale-95"
                >
                  + {vente.lignes.length - 2} autre{vente.lignes.length - 2 > 1 ? 's' : ''}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Montants et paiement */}
        <div className="px-4 py-3 bg-primary/5 border-t border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Total</span>
            <span className="text-2xl font-black text-primary">{formatPrix(vente.total)}</span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <PaymentIcon className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-foreground">
                {paymentLabels[vente.modePaiement] || vente.modePaiement}
              </span>
            </div>
            {totalQuantite > 0 && (
              <div className="px-2 py-1 rounded-md bg-primary/10">
                <span className="text-xs font-bold text-primary">{totalQuantite} article{totalQuantite > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>

          {/* Montant payé et restant */}
          {vente.montantPaye < vente.total && (
            <div className="mt-2 pt-2 border-t border-border/30 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Payé</span>
                <span className="font-semibold text-success">{formatPrix(vente.montantPaye)}</span>
              </div>
              {hasCredit && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Restant</span>
                  <span className="font-semibold text-warning">{formatPrix(vente.montantRestant)}</span>
                </div>
              )}
            </div>
          )}
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
                <SheetTitle className="text-left text-lg">{vente.numero}</SheetTitle>
                <p className="text-sm text-muted-foreground text-left">
                  {vente.nom} {vente.prenom}
                </p>
              </SheetHeader>

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  variant="default"
                  size="lg"
                  className="w-full h-14 justify-start text-left text-base"
                  onClick={() => onPrintInvoice(vente.id)}
                >
                  <Printer className="w-5 h-5 mr-3" />
                  Imprimer Facture
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full h-14 justify-start text-left text-base"
                  onClick={() => onShareWhatsApp(vente.id)}
                >
                  <MessageCircle className="w-5 h-5 mr-3" />
                  Partager sur WhatsApp
                </Button>

                <CanAccess permissions={['ventes.update']}>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full h-14 justify-start text-left text-base"
                    onClick={() => onEdit(vente)}
                  >
                    <Edit className="w-5 h-5 mr-3" />
                    Modifier la vente
                  </Button>
                </CanAccess>

                <CanAccess permissions={['ventes.delete']}>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full h-14 justify-start text-left text-base text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                    onClick={() => onDelete(vente.id)}
                  >
                    <Trash className="w-5 h-5 mr-3" />
                    Supprimer la vente
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

export default VenteMobileCard;
