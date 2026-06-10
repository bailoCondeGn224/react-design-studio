import { Card, CardContent } from "@/components/ui/card";
import CanAccess from "@/components/CanAccess";
import { Wallet, Eye, AlertCircle, CheckCircle, Phone, TrendingUp } from "lucide-react";

interface VersementClientMobileCardProps {
  client: any;
  onOpenPaymentForm: () => void;
  onViewHistory: (client: any) => void;
  formatPrix: (prix: number) => string;
}

const VersementClientMobileCard = ({
  client,
  onOpenPaymentForm,
  onViewHistory,
  formatPrix,
}: VersementClientMobileCardProps) => {
  const hasDebt = client.totalCredits > 0;

  return (
    <Card className={`transition-shadow hover:shadow-lg ${
      hasDebt ? 'border-destructive/30 bg-destructive/5' : 'border-success/30 bg-success/5'
    }`}>
      <CardContent className="p-0">
        {/* En-tête */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground truncate">{client.nom}</p>
            {client.telephone && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <Phone className="w-3 h-3" />
                {client.telephone}
              </div>
            )}
          </div>
          {hasDebt ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-destructive/20 text-destructive border border-destructive/50 flex-shrink-0">
              <AlertCircle className="w-3 h-3" />
              En Dette
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-success/20 text-success border border-success/50 flex-shrink-0">
              <CheckCircle className="w-3 h-3" />
              À Jour
            </span>
          )}
        </div>

        {/* Détails */}
        <div className="p-4 space-y-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Total Achats
            </p>
            <p className="text-sm font-semibold text-foreground">
              {formatPrix(client.totalAchats || 0)}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <p className="text-xs font-semibold text-muted-foreground">Dette Actuelle</p>
            <p className={`text-xl font-black ${hasDebt ? 'text-destructive' : 'text-success'}`}>
              {formatPrix(client.totalCredits)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 bg-muted/50 border-t border-border/50">
          <div className="flex gap-2">
            {hasDebt && (
              <CanAccess permissions={['versements-client.create']}>
                <button
                  onClick={onOpenPaymentForm}
                  className="flex-1 h-11 rounded-lg bg-success text-white text-sm font-semibold hover:bg-success/90 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Wallet className="w-4 h-4" />
                  Paiement
                </button>
              </CanAccess>
            )}
            <button
              onClick={() => onViewHistory(client)}
              className={`${hasDebt ? 'flex-1' : 'w-full'} h-11 rounded-lg border-2 border-border text-sm font-semibold text-foreground hover:bg-secondary transition-all active:scale-95 flex items-center justify-center gap-2`}
            >
              <Eye className="w-4 h-4" />
              Historique
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VersementClientMobileCard;
