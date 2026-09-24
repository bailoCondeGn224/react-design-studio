import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/useMediaQuery";
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
  isSubmitting?: boolean;
}

const RetourClientForm = ({ open, onOpenChange, onSubmit, isSubmitting = false }: RetourClientFormProps) => {
  const isMobile = useIsMobile();
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
      // Initialiser les lignes avec toutes les lignes de la vente (avec infos mode vente)
      const lignes = vente.lignes.map((ligne: any) => ({
        articleId: ligne.articleId,
        nom: ligne.nom,
        quantite: ligne.quantite,
        quantiteBase: ligne.quantiteBase || ligne.quantite,
        quantiteMax: ligne.quantite, // Pour validation (en packs/modes)
        modeVenteId: ligne.modeVenteId || null,
        modeVente: ligne.modeVente || null,
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

      // Recalculer sous-total et quantiteBase si quantité change
      if (field === 'quantite') {
        const quantite = Number(value) || 0;
        if (quantite > newLignes[index].quantiteMax) {
          toast.warning(`Quantité maximum: ${newLignes[index].quantiteMax}`);
          newLignes[index].quantite = newLignes[index].quantiteMax;
        }
        // Recalculer quantiteBase en fonction du mode de vente
        if (newLignes[index].modeVente) {
          newLignes[index].quantiteBase = newLignes[index].quantite * Number(newLignes[index].modeVente.quantiteStock);
        } else {
          newLignes[index].quantiteBase = newLignes[index].quantite;
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
      lignes: lignesSelectionnees.map(({ selected, quantiteMax, modeVente, ...ligne }) => ({
        ...ligne,
        quantiteBase: ligne.quantiteBase || ligne.quantite,
        modeVenteId: ligne.modeVenteId || undefined,
      })),
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

  // Shared content for both Sheet and Dialog
  const content = (
    <>
      {/* Header avec gradient */}
      <DialogHeader className="px-4 sm:px-6 py-4 sm:py-5 border-b bg-gradient-to-r from-orange-500/10 via-orange-500/5 to-transparent flex-shrink-0">
        <div className="flex items-center gap-3 pr-12">
          <div className="hidden md:flex w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
            <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <DialogTitle className="text-base sm:text-lg font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              <span className="md:hidden">Retour Client</span>
              <span className="hidden md:inline">Nouveau Retour Client</span>
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Sélectionnez une vente et les articles à retourner
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {/* Zone scrollable */}
      <form onSubmit={handleSubmit} className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-5">
        {/* Section Sélection de la vente */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500/5 via-background to-background border-2 border-border p-4 sm:p-5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-12 -mt-12"></div>
          <div className="relative space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Vente concernée <span className="text-destructive">*</span></h3>
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
                <h3 className="text-sm font-bold text-foreground">Articles à retourner <span className="text-destructive">*</span></h3>
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
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">{ligne.nom}</p>
                          <span className="text-sm font-bold text-primary">×{ligne.quantiteBase || ligne.quantite}</span>
                          {ligne.modeVente && ligne.quantite !== ligne.quantiteBase && (
                            <span className="text-xs text-muted-foreground">({ligne.quantite} {ligne.modeVente.nom})</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">Max: {ligne.quantiteMax} {ligne.modeVente ? ligne.modeVente.nom : 'unités'} • Prix: {formatPrix(ligne.prixUnitaire)}</p>
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
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <span>{ligne.nom}</span>
                            <span className="text-sm font-bold text-primary">×{ligne.quantiteBase || ligne.quantite}</span>
                            {ligne.modeVente && ligne.quantite !== ligne.quantiteBase && (
                              <span className="text-xs text-muted-foreground">({ligne.quantite} {ligne.modeVente.nom})</span>
                            )}
                          </div>
                        </td>
                        <td className="p-2">{ligne.quantiteMax} {ligne.modeVente ? ligne.modeVente.nom : ''}</td>
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
          <>
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border-2 border-primary/30 p-5 sm:p-6 shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-semibold text-muted-foreground">Montant total du retour</span>
                  </div>
                  <span className="text-lg sm:text-base font-black text-primary">{formatPrix(calculerTotal())}</span>
                </div>
              </div>
            </div>

            {/* Détail du remboursement selon logique Q2:C */}
            {selectedVente && (() => {
              const montantRetour = calculerTotal();
              const detteClient = selectedVente.montantRestant || 0;
              const montantPaye = selectedVente.montantPaye || 0;

              // Logique Q2:C - Calcul correct du remboursement
              const isRetourSuperDette = montantRetour > detteClient;
              // Si retour > dette: rembourser (montantRetour - dette), sinon 0
              const remboursementCash = isRetourSuperDette ? (montantRetour - detteClient) : 0;
              // Si retour > dette: annuler toute la dette, sinon réduire de montantRetour
              const reductionDette = isRetourSuperDette ? detteClient : montantRetour;

              return (
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500/10 via-green-500/5 to-background border-2 border-green-500/30 p-5 sm:p-6 shadow-lg">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="relative space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-sm font-bold text-green-700 dark:text-green-400">Détail du remboursement</span>
                    </div>

                    {/* Dette actuelle du client */}
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                      <span className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300">Dette actuelle du client</span>
                      <span className="text-sm sm:text-base font-bold text-blue-600 dark:text-blue-400">{formatPrix(detteClient)}</span>
                    </div>

                    {/* Montant payé */}
                    {montantPaye > 0 && (
                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                        <span className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300">Montant déjà payé</span>
                        <span className="text-sm sm:text-base font-bold text-green-600 dark:text-green-400">{formatPrix(montantPaye)}</span>
                      </div>
                    )}

                    <div className="border-t-2 border-dashed border-green-300 dark:border-green-700 my-2"></div>

                    {/* Résultat selon Q2:C */}
                    {isRetourSuperDette ? (
                      <>
                        {/* Cas: Retour > Dette - Annulation totale + remboursement cash */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
                            <span className="text-xs sm:text-sm font-semibold text-orange-700 dark:text-orange-300">✓ Annulation de la dette</span>
                            <span className="text-sm sm:text-base font-black text-orange-600 dark:text-orange-400">{formatPrix(reductionDette)}</span>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg shadow-lg">
                            <span className="text-xs sm:text-sm font-bold text-white">💵 Remboursement en espèces</span>
                            <span className="text-base sm:text-lg font-black text-white">{formatPrix(remboursementCash)}</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground italic">
                          Le montant du retour dépasse la dette. La dette sera annulée et le surplus remboursé.
                        </p>
                      </>
                    ) : (
                      <>
                        {/* Cas: Retour ≤ Dette - Réduction de dette uniquement */}
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg">
                          <span className="text-xs sm:text-sm font-bold text-white">📉 Réduction de la dette</span>
                          <span className="text-base sm:text-lg font-black text-white">{formatPrix(reductionDette)}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-gray-200 dark:border-gray-800">
                          <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">💵 Remboursement en espèces</span>
                          <span className="text-sm sm:text-base font-bold text-gray-400 dark:text-gray-600">0 FG</span>
                        </div>
                        <p className="text-xs text-muted-foreground italic">
                          Le montant du retour sera déduit de la dette. Aucun remboursement en espèces.
                        </p>
                      </>
                    )}

                    {/* Nouvelle dette après retour */}
                    <div className="flex items-center justify-between p-3 bg-violet-50 dark:bg-violet-950/30 rounded-lg border-2 border-violet-300 dark:border-violet-700">
                      <span className="text-xs sm:text-sm font-bold text-violet-700 dark:text-violet-300">Dette après retour</span>
                      <span className="text-sm sm:text-base font-black text-violet-600 dark:text-violet-400">
                        {formatPrix(Math.max(0, detteClient - montantRetour))}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </>
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
          disabled={isSubmitting}
          className="w-full sm:flex-1 h-12 rounded-xl text-base font-bold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check className="w-5 h-5" />
          {isSubmitting ? 'En cours...' : 'Enregistrer le retour'}
        </button>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[95vh] p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
          <div className="h-full flex flex-col bg-gradient-to-br from-background via-background to-orange-500/5">
            {content}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl h-[90vh] flex flex-col p-0 bg-gradient-to-br from-background via-background to-orange-500/5" onOpenAutoFocus={(e) => e.preventDefault()}>
        {content}
      </DialogContent>
    </Dialog>
  );
};

export default RetourClientForm;
