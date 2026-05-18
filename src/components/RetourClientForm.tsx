import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FormField from "@/components/FormField";
import VenteCombobox from "@/components/VenteCombobox";
import { toast } from "sonner";
import { Check, RotateCcw, ShoppingBag, Package, DollarSign, FileText } from "lucide-react";
import { formatPrixInput } from "@/utils/format-prix";
import { LigneRetourClient } from "@/types";

interface RetourClientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
}

const RetourClientForm = ({ open, onOpenChange, onSubmit }: RetourClientFormProps) => {
  const [form, setForm] = useState({
    venteId: "",
    lignes: [] as Array<LigneRetourClient & { selected: boolean; quantiteMax: number }>,
    modeRemboursement: "especes" as 'especes' | 'mobile_money' | 'virement' | 'credit_compte',
    note: "",
  });

  const [selectedVente, setSelectedVente] = useState<any>(null);

  const handleVenteChange = (vente: any) => {
    if (vente) {
      setSelectedVente(vente);
      // Initialiser les lignes avec toutes les lignes de la vente
      const lignes = vente.lignes.map((ligne: any) => ({
        articleId: ligne.articleId,
        nom: ligne.nom,
        quantite: ligne.quantite,
        quantiteMax: ligne.quantite, // Pour validation
        prixUnitaire: ligne.prixUnitaire,
        sousTotal: ligne.quantite * ligne.prixUnitaire,
        selected: false,
        raison: undefined,
        noteArticle: "",
      }));
      setForm(prev => ({
        ...prev,
        venteId: vente.id,
        lignes: lignes
      }));
    } else {
      setSelectedVente(null);
      setForm(prev => ({
        ...prev,
        venteId: "",
        lignes: []
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

      // Recalculer sous-total si quantité ou prix change
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

    if (!form.venteId) {
      toast.error("Veuillez sélectionner une vente");
      return;
    }

    const lignesSelectionnees = form.lignes.filter(l => l.selected);

    if (lignesSelectionnees.length === 0) {
      toast.error("Veuillez sélectionner au moins un article à retourner");
      return;
    }

    // Vérifier que toutes les lignes ont une raison
    const lignesSansRaison = lignesSelectionnees.filter(l => !l.raison);
    if (lignesSansRaison.length > 0) {
      toast.error("Veuillez indiquer la raison du retour pour tous les articles");
      return;
    }

    const data = {
      venteId: form.venteId,
      lignes: lignesSelectionnees.map(({ selected, quantiteMax, ...ligne }) => ligne),
      total: calculerTotal(),
      modeRemboursement: form.modeRemboursement,
      note: form.note,
    };

    onSubmit(data);
    resetForm();
  };

  const resetForm = () => {
    setForm({
      venteId: "",
      lignes: [],
      modeRemboursement: "especes",
      note: "",
    });
    setSelectedVente(null);
  };

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] flex flex-col p-0 bg-gradient-to-br from-background via-background to-orange-500/5">
        {/* Header avec gradient */}
        <DialogHeader className="px-4 sm:px-6 py-4 sm:py-5 border-b bg-gradient-to-r from-orange-500/10 via-orange-500/5 to-transparent flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
              <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Nouveau Retour Client
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Sélectionnez une vente et les articles à retourner
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Zone scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-5">
          {/* Section Sélection de la vente */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500/5 via-background to-background border-2 border-border p-4 sm:p-5">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-12 -mt-12"></div>
            <div className="relative space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Vente concernée *</h3>
              </div>

              <VenteCombobox
                value={form.venteId}
                onChange={handleVenteChange}
                placeholder="Rechercher une vente..."
              />

              {/* Informations de la vente sélectionnée */}
              {selectedVente && (
                <div className="p-3 bg-blue-500/10 rounded-lg space-y-1.5 text-sm border border-blue-500/20">
                  <p><span className="font-semibold text-foreground">Client:</span> <span className="text-muted-foreground">{selectedVente.nom} {selectedVente.prenom}</span></p>
                  <p><span className="font-semibold text-foreground">Téléphone:</span> <span className="text-muted-foreground">{selectedVente.tel}</span></p>
                  <p><span className="font-semibold text-foreground">Date:</span> <span className="text-muted-foreground">{new Date(selectedVente.date).toLocaleDateString()}</span></p>
                  <p><span className="font-semibold text-foreground">Total vente:</span> <span className="text-primary font-bold">{formatPrix(selectedVente.total)}</span></p>
                </div>
              )}
            </div>
          </div>

          {/* Section Articles à retourner */}
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
                    <div key={index} className={`rounded-lg border-2 transition-all p-3 ${ligne.selected ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-border bg-card'}`}>
                      <div className="flex items-start gap-3 mb-3">
                        <input
                          type="checkbox"
                          checked={ligne.selected}
                          onChange={() => toggleLigneSelection(index)}
                          className="mt-1 w-5 h-5 rounded border-border"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground">{ligne.nom}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Max: {ligne.quantiteMax} • Prix: {formatPrix(ligne.prixUnitaire)}</p>
                        </div>
                      </div>

                      {ligne.selected && (
                        <div className="space-y-3 pt-3 border-t border-border/50">
                          <div>
                            <label className="text-xs font-semibold text-foreground mb-1.5 block">Quantité à retourner</label>
                            <input
                              type="number"
                              value={ligne.quantite}
                              onChange={(e) => updateLigne(index, 'quantite', Number(e.target.value))}
                              min="1"
                              max={ligne.quantiteMax}
                              className="w-full px-3 h-11 rounded-lg border-2 border-border bg-card text-base font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-semibold text-foreground mb-1.5 block">Raison du retour</label>
                            <select
                              value={ligne.raison || ""}
                              onChange={(e) => updateLigne(index, 'raison', e.target.value)}
                              className="w-full px-3 h-11 rounded-lg border-2 border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                              required
                            >
                              <option value="">Sélectionner une raison</option>
                              <option value="defectueux">Défectueux</option>
                              <option value="taille_incorrecte">Taille incorrecte</option>
                              <option value="couleur_incorrecte">Couleur incorrecte</option>
                              <option value="erreur_commande">Erreur commande</option>
                              <option value="non_conforme">Non conforme</option>
                              <option value="qualite_insuffisante">Qualité insuffisante</option>
                              <option value="changement_avis">Changement d'avis</option>
                              <option value="autre">Autre</option>
                            </select>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-border/50">
                            <span className="text-xs font-semibold text-muted-foreground">Sous-total</span>
                            <span className="text-base font-black text-primary">{formatPrix(ligne.sousTotal)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Version desktop: Tableau */}
                <div className="hidden md:block border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
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
                        <tr key={index} className={ligne.selected ? "bg-emerald-50 dark:bg-emerald-950/30" : ""}>
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
                              <option value="changement_avis">Changement d'avis</option>
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

          {/* Section Remboursement */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-violet-500/5 via-background to-background border-2 border-border p-4 sm:p-5">
            <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full -mr-12 -mt-12"></div>
            <div className="relative space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-violet-600" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Remboursement</h3>
              </div>

              <FormField
                label="Mode de remboursement"
                as="select"
                value={form.modeRemboursement}
                onChange={(e: any) => setForm(prev => ({ ...prev, modeRemboursement: e.target.value }))}
                required
              >
                <option value="especes">Espèces</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="virement">Virement</option>
                <option value="credit_compte">Crédit sur compte client</option>
              </FormField>

              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  <FileText className="w-3.5 h-3.5 inline mr-1.5 text-muted-foreground" />
                  Note (optionnel)
                </label>
                <textarea
                  value={form.note}
                  onChange={(e) => setForm(prev => ({ ...prev, note: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border-2 border-border bg-card text-base sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all resize-none"
                  rows={3}
                  placeholder="Informations supplémentaires..."
                />
              </div>
            </div>
          </div>

          {/* Total à rembourser */}
          {form.lignes.some(l => l.selected) && (
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border-2 border-primary/30 p-5 sm:p-6 shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-semibold text-muted-foreground">Montant à rembourser</span>
                  </div>
                  <span className="text-lg sm:text-base font-black text-primary">{formatPrix(calculerTotal())}</span>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Footer avec boutons */}
        <div className="px-4 sm:px-6 py-4 border-t bg-gradient-to-r from-muted/50 to-transparent flex flex-col sm:flex-row gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full sm:flex-1 h-12 rounded-xl border-2 border-border text-base font-semibold text-muted-foreground hover:bg-secondary active:scale-[0.98] transition-all"
          >
            Annuler
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="w-full sm:flex-1 h-12 rounded-xl text-base font-bold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            Enregistrer le retour
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RetourClientForm;
