import { Card, CardContent } from "@/components/ui/card";
import { RotateCcw, Package, Calendar, User } from "lucide-react";

interface RetourClientMobileCardProps {
  retour: any;
  formatPrix: (prix: number) => string;
  formatDate: (date: string) => string;
}

const RetourClientMobileCard = ({
  retour,
  formatPrix,
  formatDate
}: RetourClientMobileCardProps) => {
  return (
    <Card className="transition-shadow hover:shadow-lg border-orange-500/30 bg-orange-500/5">
      <CardContent className="p-0">
        {/* En-tête */}
        <div className="flex items-center gap-3 p-4 border-b border-border/50">
          <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0">
            <RotateCcw className="w-5 h-5 text-orange-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground truncate">{retour.numero}</p>
            <p className="text-xs text-muted-foreground">
              {formatDate(retour.date)}
            </p>
          </div>
        </div>

        {/* Détails */}
        <div className="p-4 space-y-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Client</p>
            <p className="text-sm font-semibold text-foreground">{retour.clientNom || '-'}</p>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Vente</p>
            <p className="text-sm font-semibold text-foreground">{retour.venteNumero}</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground">Articles retournés</p>
            </div>
            <p className="text-sm font-bold text-foreground">{retour.lignes?.length || 0}</p>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Mode remboursement</p>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              retour.modeRemboursement === 'especes' ? 'bg-green-500/10 text-green-600' :
              retour.modeRemboursement === 'credit_compte' ? 'bg-blue-500/10 text-blue-600' :
              'bg-gray-500/10 text-gray-600'
            }`}>
              {retour.modeRemboursement === 'especes' ? 'Espèces' :
               retour.modeRemboursement === 'mobile_money' ? 'Mobile Money' :
               retour.modeRemboursement === 'virement' ? 'Virement' :
               retour.modeRemboursement === 'credit_compte' ? 'Crédit compte' : retour.modeRemboursement}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <p className="text-xs font-semibold text-muted-foreground">Montant total</p>
            <p className="text-lg font-black text-orange-600">{formatPrix(retour.total)}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border bg-card">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <User className="w-3 h-3" />
              <span>{retour.userNom}</span>
            </div>
            <span className="font-medium">Réf: {retour.numero}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RetourClientMobileCard;
