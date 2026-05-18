import { Card, CardContent } from "@/components/ui/card";
import { Wallet, Calendar, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import CanAccess from "./CanAccess";
import { Depense, typeDepenseLabels, categorieDepenseLabels } from "@/types";

interface DepenseMobileCardProps {
  depense: Depense;
  formatPrix: (prix: number) => string;
  onEdit: (depense: Depense) => void;
  onDelete: (id: string) => void;
}

const DepenseMobileCard = ({
  depense,
  formatPrix,
  onEdit,
  onDelete,
}: DepenseMobileCardProps) => {
  const getCategorieColor = (categorie: string) => {
    if (categorie === 'FIXE') return 'bg-primary/10 text-primary border-primary/20';
    if (categorie === 'VARIABLE') return 'bg-warning/10 text-warning border-warning/20';
    return 'bg-secondary/10 text-secondary-foreground border-secondary/20';
  };

  return (
    <Card className="transition-shadow hover:shadow-lg border-destructive/30 bg-destructive/5">
      <CardContent className="p-0">
        {/* En-tête */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-destructive/10">
              <Wallet className="w-5 h-5 text-destructive" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">
                {typeDepenseLabels[depense.type]}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(depense.date).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${getCategorieColor(depense.categorie)}`}>
            {categorieDepenseLabels[depense.categorie]}
          </span>
        </div>

        {/* Détails */}
        <div className="p-4 space-y-3 bg-muted/30">
          {depense.description && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Description</p>
              <p className="text-sm text-foreground">{depense.description}</p>
            </div>
          )}

          {depense.reference && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Référence</p>
              <p className="text-sm text-foreground font-mono">{depense.reference}</p>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <p className="text-xs font-semibold text-muted-foreground">Montant</p>
            <p className="text-lg font-black text-destructive">
              {formatPrix(depense.montant)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-3 border-t border-border bg-card">
          <div className="space-y-2">
            <CanAccess permissions={['depenses.update']}>
              <Button
                variant="outline"
                onClick={() => onEdit(depense)}
                className="w-full h-11"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Modifier
              </Button>
            </CanAccess>
            <CanAccess permissions={['depenses.delete']}>
              <Button
                variant="destructive"
                onClick={() => onDelete(depense.id)}
                className="w-full h-11"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            </CanAccess>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DepenseMobileCard;
