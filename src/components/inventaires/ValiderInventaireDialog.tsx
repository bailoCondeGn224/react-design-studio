import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useValiderInventaire } from '@/hooks/useInventaires';
import { Inventaire } from '@/types';
import { useIsMobile } from '@/hooks/useMediaQuery';

interface ValiderInventaireDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventaire: Inventaire;
}

export default function ValiderInventaireDialog({
  open,
  onOpenChange,
  inventaire,
}: ValiderInventaireDialogProps) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const validerMutation = useValiderInventaire();

  const handleValider = async () => {
    try {
      await validerMutation.mutateAsync(inventaire.id);
      onOpenChange(false);
      // Ne pas naviguer automatiquement - laisser les refetch se terminer
      // L'utilisateur verra le changement de statut et pourra utiliser le bouton "Retour"
    } catch (error) {
      // L'erreur est gérée par le hook
    }
  };

  const content = (
    <div className="h-full flex flex-col">
      <DialogHeader className="flex-shrink-0 px-6 pt-6">
        <DialogTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          Confirmer les Ajustements
        </DialogTitle>
        <DialogDescription>
          Vous êtes sur le point de valider cet inventaire
        </DialogDescription>
      </DialogHeader>

      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
        <div className="space-y-4">
          {/* Résumé compact */}
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div>
                <div className="font-bold text-lg">{inventaire.articlesComptes}</div>
                <div className="text-muted-foreground">Comptés</div>
              </div>
              <div>
                <div className="font-bold text-lg text-orange-600">
                  {inventaire.articlesAvecEcarts}
                </div>
                <div className="text-muted-foreground">Écarts</div>
              </div>
              <div>
                <div className="font-bold text-lg">{inventaire.totalArticles}</div>
                <div className="text-muted-foreground">Total</div>
              </div>
            </div>
          </div>

          {/* Statistiques des écarts */}
          {inventaire.statistiques && inventaire.articlesAvecEcarts > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {/* Pertes */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="text-sm text-red-900 mb-1">Pertes</div>
                <div className="font-bold text-lg text-red-600">
                  {inventaire.statistiques.articlesManquants}
                </div>
                <div className="text-sm text-red-700 mt-1">
                  {inventaire.statistiques.valeurPertes.toLocaleString()} GNF
                </div>
              </div>

              {/* Surplus */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="text-sm text-green-900 mb-1">Surplus</div>
                <div className="font-bold text-lg text-green-600">
                  {inventaire.statistiques.articlesSurplus}
                </div>
                <div className="text-sm text-green-700 mt-1">
                  {inventaire.statistiques.valeurSurplus.toLocaleString()} GNF
                </div>
              </div>
            </div>
          )}

          {/* Écart net */}
          {inventaire.statistiques && inventaire.articlesAvecEcarts > 0 && (
            <div
              className={`rounded-lg p-3 text-center ${
                inventaire.statistiques.valeurNetteEcart < 0
                  ? 'bg-red-100 border border-red-300'
                  : 'bg-green-100 border border-green-300'
              }`}
            >
              <div className="text-sm font-medium mb-1">Impact financier net</div>
              <div
                className={`text-2xl font-bold ${
                  inventaire.statistiques.valeurNetteEcart < 0
                    ? 'text-red-700'
                    : 'text-green-700'
                }`}
              >
                {inventaire.statistiques.valeurNetteEcart > 0 ? '+' : ''}
                {inventaire.statistiques.valeurNetteEcart.toLocaleString()} GNF
              </div>
            </div>
          )}

          {/* Articles avec écarts */}
          {inventaire.articlesAvecEcarts > 0 && (
            <div>
              <p className="font-medium mb-2 text-sm">Articles à ajuster:</p>
              <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-2">
                {inventaire.comptages
                  ?.filter((c) => c.ecart !== 0)
                  .map((comptage) => (
                    <div
                      key={comptage.id}
                      className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded"
                    >
                      <span className="font-medium truncate flex-1">
                        {comptage.articleNom}
                      </span>
                      <span
                        className={`ml-2 ${
                          comptage.ecart > 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {comptage.quantiteSysteme} → {comptage.quantiteComptee}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Avertissement */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm">
            <p className="font-medium text-orange-900 mb-1">⚠️ Attention</p>
            <p className="text-orange-800">
              Les stocks seront ajustés et cette action est irréversible.
            </p>
          </div>
        </div>
      </div>

      <DialogFooter className="flex-shrink-0 px-6 pb-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
        >
          Non, revenir
        </Button>
        <Button
          onClick={handleValider}
          disabled={validerMutation.isPending}
          className="bg-orange-600 hover:bg-orange-700"
        >
          {validerMutation.isPending ? 'Validation...' : 'Oui, ajuster'}
        </Button>
      </DialogFooter>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[95vh] p-0">
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg h-[90vh] flex flex-col p-0">
        {content}
      </DialogContent>
    </Dialog>
  );
}
