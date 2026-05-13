import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FormField from "@/components/FormField";
import ApprovisionnementCombobox from "@/components/ApprovisionnementCombobox";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { LigneRetourFournisseur } from "@/types";

interface RetourFournisseurFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
}

const RetourFournisseurForm = ({ open, onOpenChange, onSubmit }: RetourFournisseurFormProps) => {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouveau Retour Fournisseur</DialogTitle>
          <DialogDescription>
            Sélectionnez un approvisionnement et les articles à retourner
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sélection de l'approvisionnement */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Approvisionnement *</label>
            <ApprovisionnementCombobox
              value={form.approvisionnementId}
              onChange={handleApproChange}
              placeholder="Rechercher un approvisionnement..."
            />
          </div>

          {/* Informations de l'approvisionnement sélectionné */}
          {selectedAppro && (
            <div className="p-3 bg-gray-50 rounded-md space-y-1 text-sm">
              <p><span className="font-medium">Fournisseur:</span> {selectedAppro.fournisseurNom}</p>
              <p><span className="font-medium">Date livraison:</span> {new Date(selectedAppro.dateLivraison).toLocaleDateString()}</p>
              <p><span className="font-medium">Total achat:</span> {formatPrix(selectedAppro.total)}</p>
              {selectedAppro.numeroFacture && (
                <p><span className="font-medium">N° Facture:</span> {selectedAppro.numeroFacture}</p>
              )}
            </div>
          )}

          {/* Liste des articles de l'approvisionnement */}
          {form.lignes.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Articles à retourner *</label>
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
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
                      <tr key={index} className={ligne.selected ? "bg-blue-50" : ""}>
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
          )}

          {/* Remboursement */}
          <div className="space-y-3 p-3 border rounded-md">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remboursementRecu"
                checked={form.remboursementRecu}
                onChange={(e) => setForm(prev => ({ ...prev, remboursementRecu: e.target.checked }))}
                className="w-4 h-4"
              />
              <label htmlFor="remboursementRecu" className="text-sm font-medium">
                Remboursement reçu du fournisseur
              </label>
            </div>

            {form.remboursementRecu && (
              <FormField
                label="Montant remboursé"
                type="number"
                value={form.montantRembourse}
                onChange={(value) => setForm(prev => ({ ...prev, montantRembourse: Number(value) }))}
                required
              />
            )}
          </div>

          {/* Note */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Note</label>
            <textarea
              value={form.note}
              onChange={(e) => setForm(prev => ({ ...prev, note: e.target.value }))}
              className="w-full p-2 border rounded-md"
              rows={3}
              placeholder="Informations supplémentaires..."
            />
          </div>

          {/* Total */}
          {form.lignes.some(l => l.selected) && (
            <div className="p-4 bg-orange-50 rounded-md">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Montant du retour:</span>
                <span className="text-orange-600">{formatPrix(calculerTotal())}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">
              <Check className="w-4 h-4 mr-2" />
              Enregistrer le retour
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RetourFournisseurForm;
