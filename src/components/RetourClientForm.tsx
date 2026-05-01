import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FormField from "@/components/FormField";
import { toast } from "sonner";
import { Check, Search } from "lucide-react";
import { useVentes } from "@/hooks/useVentes";
import { formatPrixInput } from "@/utils/format-prix";
import { LigneRetourClient } from "@/types";

interface RetourClientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
}

const RetourClientForm = ({ open, onOpenChange, onSubmit }: RetourClientFormProps) => {
  const { data: ventesResponse } = useVentes({ page: 1, limit: 50 });
  const ventes = ventesResponse?.data || [];

  const [form, setForm] = useState({
    venteId: "",
    lignes: [] as Array<LigneRetourClient & { selected: boolean; quantiteMax: number }>,
    modeRemboursement: "especes" as 'especes' | 'mobile_money' | 'virement' | 'credit_compte',
    note: "",
  });

  const [selectedVente, setSelectedVente] = useState<any>(null);

  const handleVenteChange = (venteId: string) => {
    const vente = ventes.find((v: any) => v.id === venteId);
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
        venteId: venteId,
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouveau Retour Client</DialogTitle>
          <DialogDescription>
            Sélectionnez une vente et les articles à retourner
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sélection de la vente */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Vente *</label>
            <select
              value={form.venteId}
              onChange={(e) => handleVenteChange(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="">Sélectionner une vente</option>
              {ventes.map((vente: any) => (
                <option key={vente.id} value={vente.id}>
                  {vente.numero} - {vente.nom} {vente.prenom} - {formatPrix(vente.total)} - {new Date(vente.date).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          {/* Informations de la vente sélectionnée */}
          {selectedVente && (
            <div className="p-3 bg-gray-50 rounded-md space-y-1 text-sm">
              <p><span className="font-medium">Client:</span> {selectedVente.nom} {selectedVente.prenom}</p>
              <p><span className="font-medium">Téléphone:</span> {selectedVente.tel}</p>
              <p><span className="font-medium">Date:</span> {new Date(selectedVente.date).toLocaleDateString()}</p>
              <p><span className="font-medium">Total vente:</span> {formatPrix(selectedVente.total)}</p>
            </div>
          )}

          {/* Liste des articles de la vente */}
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
          )}

          {/* Mode de remboursement */}
          <FormField
            label="Mode de remboursement"
            type="select"
            value={form.modeRemboursement}
            onChange={(value) => setForm(prev => ({ ...prev, modeRemboursement: value }))}
            options={[
              { value: "especes", label: "Espèces" },
              { value: "mobile_money", label: "Mobile Money" },
              { value: "virement", label: "Virement" },
              { value: "credit_compte", label: "Crédit sur compte client" },
            ]}
            required
          />

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
            <div className="p-4 bg-blue-50 rounded-md">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Montant à rembourser:</span>
                <span className="text-blue-600">{formatPrix(calculerTotal())}</span>
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

export default RetourClientForm;
