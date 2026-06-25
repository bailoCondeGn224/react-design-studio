import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Sparkles, Edit, Trash2, Check, X } from "lucide-react";

interface PlanMobileCardProps {
  plan: any;
  onEdit: (plan: any) => void;
  onDelete: (id: string) => void;
  formatPrix: (prix: number) => string;
}

const PlanMobileCard = ({
  plan,
  onEdit,
  onDelete,
  formatPrix,
}: PlanMobileCardProps) => {
  return (
    <Card className="transition-shadow hover:shadow-lg overflow-hidden">
      <CardContent className="p-0">
        {/* En-tête avec gradient */}
        <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{plan.nom}</p>
              <p className="text-xs text-muted-foreground">{plan.code}</p>
            </div>
            {plan.actif ? (
              <span className="inline-flex items-center gap-1 text-xs text-success bg-success/10 px-2 py-1 rounded-full flex-shrink-0">
                <Check className="w-3 h-3" />
                Actif
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full flex-shrink-0">
                <X className="w-3 h-3" />
                Inactif
              </span>
            )}
          </div>
        </div>

        {/* Prix */}
        <div className="p-4 space-y-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Prix mensuel</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-foreground">{formatPrix(plan.prixMensuel)}</span>
              <span className="text-xs text-muted-foreground">/mois</span>
            </div>
          </div>

          {plan.description && (
            <div className="pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground line-clamp-2">{plan.description}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-3 border-t border-border bg-card">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="lg" className="w-full text-sm font-semibold">
                Actions
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-auto max-h-[85vh]">
              <SheetHeader className="mb-4">
                <SheetTitle className="text-left text-lg">{plan.nom}</SheetTitle>
              </SheetHeader>

              {/* Infos rapides */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Code</span>
                  <span className="text-sm font-medium">{plan.code}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Prix mensuel</span>
                  <span className="text-sm font-bold">{formatPrix(plan.prixMensuel)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Statut</span>
                  {plan.actif ? (
                    <span className="inline-flex items-center gap-1 text-xs text-success bg-success/10 px-2 py-1 rounded-full">
                      <Check className="w-3 h-3" />
                      Actif
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                      <X className="w-3 h-3" />
                      Inactif
                    </span>
                  )}
                </div>
                {plan.description && (
                  <div className="py-2">
                    <p className="text-sm text-muted-foreground mb-1">Description</p>
                    <p className="text-sm">{plan.description}</p>
                  </div>
                )}
              </div>

              {/* Actions buttons */}
              <div className="space-y-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full justify-start text-left text-base"
                  onClick={() => onEdit(plan)}
                >
                  <Edit className="w-5 h-5 mr-3" />
                  Modifier
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full justify-start text-left text-base text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                  onClick={() => onDelete(plan.id)}
                >
                  <Trash2 className="w-5 h-5 mr-3" />
                  Supprimer
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanMobileCard;
