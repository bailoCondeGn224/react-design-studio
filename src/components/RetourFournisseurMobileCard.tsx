import { Card, CardContent } from "@/components/ui/card";
import { PackageX, Package, User, TruckIcon, CheckCircle, XCircle } from "lucide-react";

interface RetourFournisseurMobileCardProps {
  retour: any;
  formatPrix: (prix: number) => string;
  formatDate: (date: string) => string;
}

const RetourFournisseurMobileCard = ({
  retour,
  formatPrix,
  formatDate
}: RetourFournisseurMobileCardProps) => {
  const nbArticles = retour.lignes?.length || 0;

  return (
    <Card className="transition-shadow hover:shadow-lg border-red-500/30 bg-red-500/5">
      <CardContent className="p-0">
        {/* En-tête */}
        <div className="flex items-center gap-3 p-4 border-b border-border/50">
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
            <PackageX className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground">{retour.numero}</p>
            <p className="text-xs text-muted-foreground">
              {formatDate(retour.date)}
            </p>
          </div>
          {retour.remboursementRecu ? (
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          )}
        </div>

        {/* Détails */}
        <div className="p-4 space-y-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <TruckIcon className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground">Fournisseur</p>
            </div>
            <p className="text-sm font-semibold text-foreground">{retour.fournisseurNom || 'N/A'}</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground">Articles retournés</p>
            </div>
            <p className="text-sm font-bold text-foreground">{nbArticles} article{nbArticles > 1 ? 's' : ''}</p>
          </div>

          {/* Liste des articles */}
          {retour.lignes && retour.lignes.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-border/50">
              {retour.lignes.slice(0, 3).map((ligne: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground truncate max-w-[60%]">{ligne.nom}</span>
                  <span className="font-medium text-foreground">x{ligne.quantite}</span>
                </div>
              ))}
              {retour.lignes.length > 3 && (
                <p className="text-xs text-muted-foreground text-center">+{retour.lignes.length - 3} autres...</p>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <p className="text-xs font-semibold text-muted-foreground">Montant total</p>
            <p className="text-lg font-black text-orange-600">{formatPrix(retour.total)}</p>
          </div>

          {retour.remboursementRecu && retour.montantRembourse > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-green-600">Remboursé</p>
              <p className="text-sm font-bold text-green-600">{formatPrix(retour.montantRembourse)}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border bg-card">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <User className="w-3 h-3" />
              <span>{retour.userNom || 'N/A'}</span>
            </div>
            <span className="font-medium">Appro: {retour.approvisionnementNumero}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RetourFournisseurMobileCard;
