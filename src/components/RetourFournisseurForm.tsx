import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { Button } from "@/components/ui/button";
import FormField from "@/components/FormField";
import ApprovisionnementCombobox from "@/components/ApprovisionnementCombobox";
import { toast } from "sonner";
import { Check, PackageX, TruckIcon, Package, DollarSign, FileText } from "lucide-react";
import { LigneRetourFournisseur } from "@/types";
import { formatPrixInput, handlePrixChange } from "@/utils/format-prix";

interface RetourFournisseurFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
}

const RetourFournisseurForm = ({ open, onOpenChange, onSubmit }: RetourFournisseurFormProps) => {
  const isMobile = useIsMobile();
  const [form, setForm] = useState({
    approvisionnementId: "",
    lignes: [] as Array<LigneRetourFournisseur & { selected: boolean; quantiteMax: number }>,
    remboursementRecu: false,
    montantRembourse: 0,
    note: "",
  });

  const [selectedAppro, setSelectedAppro] = useState<any>(null);

  const handleApproChange = (appro: any) => {
    if (appro) {
      setSelectedAppro(appro);
      // Initialiser les lignes avec toutes les lignes de l'approvisionnement
      const lignes = appro.lignes.map((ligne: any) => ({
        articleId: ligne.articleId,
        nom: ligne.nom,
        quantite: ligne.quantite,
        quantiteMax: ligne.quantite,
        prixUnitaire: ligne.prixUnitaire,
        sousTotal: ligne.quantite * ligne.prixUnitaire,
        selected: false,
        raison: undefined,
        noteArticle: "",
      }));
      setForm(prev => ({
        ...prev,
        approvisionnementId: appro.id,
        lignes: lignes,
        montantRembourse: 0
      }));
    } else {
      setSelectedAppro(null);
      setForm(prev => ({
        ...prev,
        approvisionnementId: "",
        lignes: [],
        montantRembourse: 0
      }));
    }
  };

  const toggleLigneSelection = (index: number) => {
    setForm(prev => {
      const newLignes = [...prev.lignes];
      newLignes[index] = {
        ...newLignes[index],
        selected: !newLignes[index].selected
      };
      return { ...prev, lignes: newLignes };
    });
  };

  const updateLigne = (index: number, field: string, value: any) => {
    setForm(prev => {
      const newLignes = [...prev.lignes];
      newLignes[index] = { ...newLignes[index], [field]: value };

      if (field === 'quantite') {
        const quantite = Number(value) || 0;
        if (quantite > newLignes[index].quantiteMax) {
          toast.warning(`Quantité maximum: ${newLignes[index].quantiteMax}`);
          newLignes[index].quantite = newLignes[index].quantiteMax;
        }
        newLignes[index].sousTotal = newLignes[index].quantite * newLignes[index].prixUnitaire;
      }

      return { ...prev, lignes: newLignes };
    });
  };

  const calculerTotal = () => {
    return form.lignes
      .filter(ligne => ligne.selected)
      .reduce((sum, ligne) => sum + (ligne.sousTotal || 0), 0);
  };

  const formatPrix = (montant: number) => {
    return new Intl.NumberFormat('fr-GN', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0
    }).format(montant).replace('GNF', 'GNF');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.approvisionnementId) {
      toast.error("Veuillez sélectionner un approvisionnement");
      return;
    }

    const lignesSelectionnees = form.lignes.filter(l => l.selected);

    if (lignesSelectionnees.length === 0) {
      toast.error("Veuillez sélectionner au moins un article à retourner");
      return;
    }

    const lignesSansRaison = lignesSelectionnees.filter(l => !l.raison);
    if (lignesSansRaison.length > 0) {
      toast.error("Veuillez indiquer la raison du retour pour tous les articles");
      return;
    }

    if (form.remboursementRecu && (!form.montantRembourse || form.montantRembourse <= 0)) {
      toast.error("Veuillez indiquer le montant remboursé");
      return;
    }

    const data = {
      approvisionnementId: form.approvisionnementId,
      lignes: lignesSelectionnees.map(({ selected, quantiteMax, ...ligne }) => ligne),
      total: calculerTotal(),
      remboursementRecu: form.remboursementRecu,
      montantRembourse: form.remboursementRecu ? form.montantRembourse : undefined,
      note: form.note,
    };

    onSubmit(data);
    resetForm();
  };

  const resetForm = () => {
    setForm({
      approvisionnementId: "",
      lignes: [],
      remboursementRecu: false,
      montantRembourse: 0,
      note: "",
    });
    setSelectedAppro(null);
  };

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const formContent = (
    <>
      {/* Header avec gradient */}
      <div className="px-4 sm:px-6 py-4 sm:py-5 border-b bg-gradient-to-r from-destructive/10 via-destructive/5 to-transparent flex-shrink-0">
        <div className="flex items-center gap-3 pr-12">
          <div className="hidden md:flex w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-destructive to-destructive/80 flex items-center justify-center shadow-lg">
            <PackageX className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              <span className="md:hidden">Retour Fournisseur</span>
              <span className="hidden md:inline">Nouveau Retour Fournisseur</span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Sélectionnez un approvisionnement et les articles à retourner
            </p>
          </div>
        </div>
      </div>

      {/* Zone scrollable */}
      <form onSubmit={handleSubmit} className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-5">
          {/* Section Sélection de l'approvisionnement */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/5 via-background to-background border-2 border-border p-4 sm:p-5">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12"></div>
            <div className="relative space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TruckIcon className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Approvisionnement concerné *</h3>
              </div>

              <ApprovisionnementCombobox
                value={form.approvisionnementId}
                onChange={handleApproChange}
                placeholder="Rechercher un approvisionnement..."
              />

              {/* Informations de l'approvisionnement sélectionné */}
              {selectedAppro && (
                <div className="p-3 bg-primary/10 rounded-lg space-y-1.5 text-sm border border-primary/20">
                  <p><span className="font-semibold text-foreground">Fournisseur:</span> <span className="text-muted-foreground">{selectedAppro.fournisseurNom}</span></p>
                  <p><span className="font-semibold text-foreground">Date livraison:</span> <span className="text-muted-foreground">{new Date(selectedAppro.dateLivraison).toLocaleDateString()}</span></p>
                  <p><span className="font-semibold text-foreground">Total achat:</span> <span className="text-primary font-bold">{formatPrix(selectedAppro.total)}</span></p>
                  {selectedAppro.numeroFacture && (
                    <p><span className="font-semibold text-foreground">N° Facture:</span> <span className="text-muted-foreground">{selectedAppro.numeroFacture}</span></p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Section Articles - Vert */}
          {form.lignes.length > 0 && (
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500/5 via-background to-background border-2 border-border p-4 sm:p-5">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-12 -mt-12"></div>
              <div className="relative space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Package className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">Articles à retourner *</h3>
                </div>

                {/* Version mobile: Cards */}
                <div className="md:hidden space-y-3">
                  {form.lignes.map((ligne, index) => (
                    <div
                      key={index}
                      className={`rounded-lg border-2 transition-all ${
                        ligne.selected
                          ? 'border-emerald-500/50 bg-emerald-500/5 shadow-sm'
                          : 'border-border bg-card'
                      }`}
                    >
                      <div className="p-3">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={ligne.selected}
                            onChange={() => toggleLigneSelection(index)}
                            className="w-5 h-5 mt-0.5 rounded flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground text-sm mb-1">{ligne.nom}</p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Qté max: {ligne.quantiteMax}</span>
                              <span>Prix: {formatPrix(ligne.prixUnitaire)}</span>
                            </div>
                          </div>
                        </div>

                        {ligne.selected && (
                          <div className="space-y-3 pt-3 mt-3 border-t border-border">
                            <div>
                              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                                Quantité à retourner
                              </label>
                              <input
                                type="number"
                                value={ligne.quantite}
                                onChange={(e) => updateLigne(index, 'quantite', Number(e.target.value))}
                                min="1"
                                max={ligne.quantiteMax}
                                className="w-full px-3 h-11 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                                Raison du retour
                              </label>
                              <select
                                value={ligne.raison || ""}
                                onChange={(e) => updateLigne(index, 'raison', e.target.value)}
                                className="w-full px-3 h-11 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                required
                              >
                                <option value="">Sélectionner une raison</option>
                                <option value="defectueux">Défectueux</option>
                                <option value="taille_incorrecte">Taille incorrecte</option>
                                <option value="couleur_incorrecte">Couleur incorrecte</option>
                                <option value="erreur_commande">Erreur commande</option>
                                <option value="non_conforme">Non conforme</option>
                                <option value="qualite_insuffisante">Qualité insuffisante</option>
                                <option value="autre">Autre</option>
                              </select>
                            </div>
                            <div className="pt-2 border-t border-border flex items-center justify-between">
                              <span className="text-xs font-medium text-muted-foreground">Sous-total</span>
                              <span className="text-base font-bold text-foreground">{formatPrix(ligne.sousTotal)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Version desktop: Tableau */}
                <div className="hidden md:block border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary/50">
                      <tr>
                        <th className="p-2 text-left w-10"></th>
                        <th className="p-2 text-left">Article</th>
                        <th className="p-2 text-left w-24">Qté Max</th>
                        <th className="p-2 text-left w-24">Qté Retour</th>
                        <th className="p-2 text-left w-32">Prix Unit.</th>
                        <th className="p-2 text-left w-48">Raison</th>
                        <th className="p-2 text-right w-32">Sous-total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.lignes.map((ligne, index) => (
                        <tr key={index} className={ligne.selected ? "bg-emerald-50 dark:bg-emerald-500/10" : ""}>
                          <td className="p-2">
                            <input
                              type="checkbox"
                              checked={ligne.selected}
                              onChange={() => toggleLigneSelection(index)}
                              className="w-4 h-4"
                            />
                          </td>
                          <td className="p-2">{ligne.nom}</td>
                          <td className="p-2">{ligne.quantiteMax}</td>
                          <td className="p-2">
                            <input
                              type="number"
                              value={ligne.quantite}
                              onChange={(e) => updateLigne(index, 'quantite', Number(e.target.value))}
                              min="1"
                              max={ligne.quantiteMax}
                              disabled={!ligne.selected}
                              className="w-full p-1 border rounded"
                            />
                          </td>
                          <td className="p-2">{formatPrix(ligne.prixUnitaire)}</td>
                          <td className="p-2">
                            <select
                              value={ligne.raison || ""}
                              onChange={(e) => updateLigne(index, 'raison', e.target.value)}
                              disabled={!ligne.selected}
                              className="w-full p-1 border rounded text-xs"
                              required={ligne.selected}
                            >
                              <option value="">Sélectionner</option>
                              <option value="defectueux">Défectueux</option>
                              <option value="taille_incorrecte">Taille incorrecte</option>
                              <option value="couleur_incorrecte">Couleur incorrecte</option>
                              <option value="erreur_commande">Erreur commande</option>
                              <option value="non_conforme">Non conforme</option>
                              <option value="qualite_insuffisante">Qualité insuffisante</option>
                              <option value="autre">Autre</option>
                            </select>
                          </td>
                          <td className="p-2 text-right font-medium">{formatPrix(ligne.sousTotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Section Remboursement - Violet */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-violet-500/5 via-background to-background border-2 border-border p-4 sm:p-5">
            <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full -mr-12 -mt-12"></div>
            <div className="relative space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-violet-600" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Remboursement</h3>
              </div>

              <div className="flex items-start gap-3 p-3 bg-violet-500/10 rounded-lg border border-violet-500/20">
                <input
                  type="checkbox"
                  id="remboursementRecu"
                  checked={form.remboursementRecu}
                  onChange={(e) => setForm(prev => ({ ...prev, remboursementRecu: e.target.checked }))}
                  className="w-5 h-5 mt-0.5 rounded flex-shrink-0"
                />
                <label htmlFor="remboursementRecu" className="text-sm font-medium text-foreground cursor-pointer">
                  Remboursement reçu du fournisseur
                </label>
              </div>

              {form.remboursementRecu && (
                <div className="pt-2">
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Montant remboursé *
                  </label>
                  <input
                    type="number"
                    value={form.montantRembourse || ''}
                    onChange={(e) => setForm(prev => ({ ...prev, montantRembourse: Number(e.target.value) }))}
                    className="w-full px-3 h-11 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                    placeholder="Montant du remboursement"
                    required
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section Note - Gris */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-muted/30 via-background to-background border-2 border-border p-4 sm:p-5">
            <div className="absolute top-0 right-0 w-24 h-24 bg-muted/20 rounded-full -mr-12 -mt-12"></div>
            <div className="relative space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Note (optionnelle)</h3>
              </div>
              <textarea
                value={form.note}
                onChange={(e) => setForm(prev => ({ ...prev, note: e.target.value }))}
                className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                rows={3}
                placeholder="Informations supplémentaires sur le retour..."
              />
            </div>
          </div>

          {/* Total */}
          {form.lignes.some(l => l.selected) && (
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent border-2 border-red-500/30 p-4 sm:p-5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <PackageX className="w-4 h-4 text-red-600" />
                  </div>
                  <span className="text-sm sm:text-base font-bold text-foreground">Montant du retour</span>
                </div>
                <span className="text-xl sm:text-2xl font-black text-red-600">{formatPrix(calculerTotal())}</span>
              </div>
            </div>
          )}
      </form>

      {/* Footer avec actions - fixe en bas */}
      <div className="px-4 sm:px-6 py-4 border-t bg-muted/30 flex-shrink-0">
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            onClick={(e: any) => {
              const dialogContent = e.target.closest('[role="dialog"]');
              const formElement = dialogContent?.querySelector('form');
              if (formElement) {
                formElement.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
              }
            }}
            className="w-full sm:w-auto"
          >
            <Check className="w-4 h-4 mr-2" />
            Enregistrer le retour
          </Button>
        </div>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[95vh] p-0">
          <div className="h-full flex flex-col bg-gradient-to-br from-background via-background to-destructive/5">
            {formContent}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl h-[90vh] flex flex-col p-0 bg-gradient-to-br from-background via-background to-destructive/5">
        {formContent}
      </DialogContent>
    </Dialog>
  );
};

export default RetourFournisseurForm;
