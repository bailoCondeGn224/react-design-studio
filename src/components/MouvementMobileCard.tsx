import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpCircle, ArrowDownCircle, Package, Calendar, TrendingUp } from "lucide-react";

interface MouvementMobileCardProps {
  mouvement: any;
  formatPrix: (prix: number) => string;
  formatDate: (date: string) => string;
  motifLabels: Record<string, string>;
  motifColors: Record<string, string>;
}

const MouvementMobileCard = ({
  mouvement,
  formatPrix,
  formatDate,
  motifLabels,
  motifColors,
}: MouvementMobileCardProps) => {
  const isEntree = mouvement.type === 'entree';

  return (
    <Card className={`transition-shadow hover:shadow-lg ${
      isEntree ? 'border-success/30 bg-success/5' : 'border-destructive/30 bg-destructive/5'
    }`}>
      <CardContent className="p-0">
        {/* En-tête */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              isEntree ? 'bg-success/10' : 'bg-destructive/10'
            }`}>
              {isEntree ? (
                <ArrowUpCircle className="w-5 h-5 text-success" />
              ) : (
                <ArrowDownCircle className="w-5 h-5 text-destructive" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-primary flex-shrink-0" />
                <p className="text-sm font-bold text-foreground truncate">{mouvement.articleNom}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {formatDate(mouvement.date)}
              </div>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold border flex-shrink-0 ${
            isEntree ? 'bg-success/20 text-success border-success/50' : 'bg-destructive/20 text-destructive border-destructive/50'
          }`}>
            {isEntree ? 'Entrée' : 'Sortie'}
          </span>
        </div>

        {/* Détails */}
        <div className="p-4 space-y-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Motif</p>
            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${motifColors[mouvement.motif] || 'bg-secondary'}`}>
              {motifLabels[mouvement.motif] || mouvement.motif}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Quantité</p>
            <span className={`text-xl font-black ${isEntree ? 'text-success' : 'text-destructive'}`}>
              {isEntree ? '+' : '-'}{mouvement.quantite}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Stock</p>
            <div className="text-xs">
              <span className="font-mono text-muted-foreground">{mouvement.stockAvant}</span>
              <span className="mx-1 text-muted-foreground">→</span>
              <span className="font-mono font-bold text-foreground">{mouvement.stockApres}</span>
            </div>
          </div>

          {mouvement.valeurTotal && (
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Valeur
              </p>
              <p className="text-sm font-bold text-foreground">
                {formatPrix(mouvement.valeurTotal)}
              </p>
            </div>
          )}

          {mouvement.reference && (
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Référence</p>
              <p className="text-xs text-foreground font-mono">{mouvement.reference}</p>
            </div>
          )}

          {mouvement.utilisateurNom && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Par:</span>
              <span>{mouvement.utilisateurNom}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MouvementMobileCard;
