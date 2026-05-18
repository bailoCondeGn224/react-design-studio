import { Card, CardContent } from "@/components/ui/card";
import { Wallet, AlertCircle, CheckCircle, Eye, Phone } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import CanAccess from "./CanAccess";

interface FournisseurVersementMobileCardProps {
  fournisseur: any;
  formatPrix: (prix: number) => string;
  onPay: (fournisseur: any) => void;
  onViewHistory: (fournisseur: any) => void;
}

const FournisseurVersementMobileCard = ({
  fournisseur,
  formatPrix,
  onPay,
  onViewHistory,
}: FournisseurVersementMobileCardProps) => {
  const hasDebt = fournisseur.dette > 0;

  return (
    <Card className={`transition-shadow hover:shadow-lg ${
      hasDebt ? 'border-destructive/30 bg-destructive/5' : 'border-success/30 bg-success/5'
    }`}>
      <CardContent className="p-0">
        {/* En-tête */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              hasDebt ? 'bg-destructive/10' : 'bg-success/10'
            }`}>
              <Wallet className={`w-5 h-5 ${hasDebt ? 'text-destructive' : 'text-success'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{fournisseur.nom}</p>
              {fournisseur.telephone && (
                <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {fournisseur.telephone}
                </p>
              )}
            </div>
          </div>
          {hasDebt ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20 flex-shrink-0">
              <AlertCircle className="w-3 h-3" />
              En Dette
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20 flex-shrink-0">
              <CheckCircle className="w-3 h-3" />
              À Jour
            </span>
          )}
        </div>

        {/* Détails financiers */}
        <div className="p-4 space-y-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Total achats</p>
            <p className="text-sm font-bold text-foreground">{formatPrix(fournisseur.totalAchats || 0)}</p>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Total payé</p>
            <p className="text-sm font-semibold text-success">{formatPrix(fournisseur.totalPaye || 0)}</p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <p className="text-xs font-semibold text-muted-foreground">Dette actuelle</p>
            <p className={`text-lg font-black ${hasDebt ? 'text-destructive' : 'text-success'}`}>
              {formatPrix(fournisseur.dette)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-3 border-t border-border bg-card">
          <div className="space-y-2">
            {hasDebt && (
              <CanAccess permissions={['versements.create']}>
                <Button
                  onClick={() => onPay(fournisseur)}
                  className="w-full h-11"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Enregistrer paiement
                </Button>
              </CanAccess>
            )}
            <Button
              variant="outline"
              onClick={() => onViewHistory(fournisseur)}
              className="w-full h-11"
            >
              <Eye className="w-4 h-4 mr-2" />
              Historique
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FournisseurVersementMobileCard;
