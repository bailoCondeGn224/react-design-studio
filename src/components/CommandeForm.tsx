import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import FormField from "@/components/FormField";
import ArticleCombobox from "@/components/ArticleCombobox";
import ClientCombobox from "@/components/ClientCombobox";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { formatPrixInput, handlePrixChange } from "@/utils/format-prix";

interface CommandeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  mode?: 'create' | 'edit';
}

const CommandeForm = ({ open, onOpenChange, onSubmit, initialData = null, mode = 'create' }: CommandeFormProps) => {
  const getInitialState = () => {
    if (mode === 'edit' && initialData) {
      return {
        clientId: initialData.clientId || "",
        lignes: initialData.lignes || [],
        acompte: initialData.acompte || 0,
        dateLivraison: initialData.dateLivraison || "",
        note: initialData.note || "",
      };
    }
    return {
      clientId: "",
      lignes: [],
      acompte: 0,
      dateLivraison: "",
      note: "",
    };
  };

  const [form, setForm] = useState(getInitialState());
  const [selectedClient, setSelectedClient] = useState<any>(null);

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setForm({
        clientId: initialData.clientId || "",
        lignes: initialData.lignes || [],
        acompte: initialData.acompte || 0,
        dateLivraison: initialData.dateLivraison || "",
        note: initialData.note || "",
      });
    }
  }, [mode, initialData, open]);

  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const ajouterLigne = () => {
    setForm(prev => ({
      ...prev,
      lignes: [...prev.lignes, { articleId: "", nom: "", quantite: 1, prixUnitaire: 0, sousTotal: 0 }]
    }));
  };

  const supprimerLigne = (index: number) => {
    setForm(prev => ({
      ...prev,
      lignes: prev.lignes.filter((_, i) => i !== index)
    }));
  };

  const updateLigne = (index: number, field: string, value: any) => {
    setForm(prev => {
      const newLignes = [...prev.lignes];
      newLignes[index] = { ...newLignes[index], [field]: value };

      // Calculer le sous-total
      const quantite = Number(newLignes[index].quantite) || 0;
      const prixUnitaire = Number(newLignes[index].prixUnitaire) || 0;
      newLignes[index].sousTotal = quantite * prixUnitaire;

      return { ...prev, lignes: newLignes };
    });
  };

  const calculerTotal = () => {
    return form.lignes.reduce((sum, ligne) => sum + (ligne.sousTotal || 0), 0);
  };

  const calculerMontantRestant = () => {
    return calculerTotal() - Number(form.acompte);
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

    // Validation client requis
    if (!form.clientId) {
      toast.error("Veuillez sélectionner un client");
      return;
    }

    if (form.lignes.length === 0) {
      toast.error("Veuillez ajouter au moins un article");
      return;
    }

    // Vérifier que toutes les lignes sont remplies
    for (const ligne of form.lignes) {
      if (!ligne.articleId || !ligne.quantite || !ligne.prixUnitaire) {
        toast.error("Veuillez remplir tous les champs des articles");
        return;
      }
    }

    const total = calculerTotal();
    const acompte = Number(form.acompte) || 0;

    // Vérifier que l'acompte ne dépasse pas le total
    if (acompte > total) {
      toast.error("L'acompte ne peut pas dépasser le total");
      return;
    }

    const montantRestant = total - acompte;

    // Nettoyer les lignes
    const lignesClean = form.lignes.map(ligne => ({
      articleId: ligne.articleId,
      nom: ligne.nom,
      quantite: Number(ligne.quantite),
      prixUnitaire: Number(ligne.prixUnitaire),
      sousTotal: Number(ligne.sousTotal),
    }));

    const commandeData = {
      clientId: form.clientId,
      lignes: lignesClean,
      total,
      acompte,
      montantRestant,
      dateLivraison: form.dateLivraison || undefined,
      note: form.note || undefined,
    };

    onSubmit(commandeData);
    setForm(getInitialState());
    onOpenChange(false);
  };

  const total = calculerTotal();
  const montantRestant = calculerMontantRestant();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {mode === 'edit' ? 'Modifier la Commande' : 'Nouvelle Commande'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit' ? 'Modifiez les informations de la commande' : 'Enregistrez une nouvelle commande client'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sélection Client (REQUIS) */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Client *</label>
            <ClientCombobox
              value={form.clientId}
              onChange={(client) => {
                if (client) {
                  setSelectedClient(client);
                  update("clientId", client.id);
                } else {
                  setSelectedClient(null);
                  update("clientId", "");
                }
              }}
              placeholder="Rechercher un client..."
            />
          </div>

          {/* Articles */}
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium">Articles *</label>
              <button
                type="button"
                onClick={ajouterLigne}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-primary bg-primary/10 hover:bg-primary/20 rounded-md transition-colors"
              >
                <Plus size={16} />
                Ajouter un article
              </button>
            </div>

            {form.lignes.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b">
                      <tr>
                        <th className="text-left p-3 font-medium">Article</th>
                        <th className="text-left p-3 font-medium w-24">Qté</th>
                        <th className="text-left p-3 font-medium w-32">Prix unitaire</th>
                        <th className="text-right p-3 font-medium w-36">Sous-total</th>
                        <th className="p-3 w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {form.lignes.map((ligne: any, index: number) => (
                        <tr key={index} className="hover:bg-muted/30">
                          <td className="p-3">
                            <ArticleCombobox
                              value={ligne.articleId}
                              onChange={(article: any) => {
                                if (article) {
                                  updateLigne(index, "articleId", article.id);
                                  updateLigne(index, "nom", article.nom);
                                  updateLigne(index, "prixUnitaire", article.prixVente);
                                  updateLigne(index, "stockDisponible", article.stock);
                                }
                              }}
                              excludeIds={form.lignes.map((l: any) => l.articleId).filter(Boolean)}
                              showPrice={false}
                              priceType="vente"
                              checkStock={false}
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              placeholder="Qté"
                              value={ligne.quantite}
                              onChange={e => updateLigne(index, "quantite", e.target.value)}
                              min={1}
                              className="w-full px-2 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              placeholder="Prix"
                              value={formatPrixInput(ligne.prixUnitaire)}
                              onChange={e => updateLigne(index, "prixUnitaire", handlePrixChange(e.target.value))}
                              className="w-full px-2 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
                            />
                          </td>
                          <td className="p-3 text-right">
                            <span className="font-medium text-primary">{formatPrix(ligne.sousTotal)}</span>
                          </td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => supprimerLigne(index)}
                              className="p-1.5 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="border rounded-lg text-center py-8 text-muted-foreground bg-muted/30">
                <p className="text-sm">Aucun article ajouté</p>
                <p className="text-xs mt-1">Cliquez sur "Ajouter un article" pour commencer</p>
              </div>
            )}
          </div>

          {/* Informations de paiement */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              label="Acompte (optionnel)"
              placeholder="0"
              value={formatPrixInput(form.acompte)}
              onChange={e => update("acompte", handlePrixChange((e.target as HTMLInputElement).value))}
            />
            <FormField
              label="Date de livraison souhaitée"
              type="date"
              value={form.dateLivraison}
              onChange={e => update("dateLivraison", (e.target as HTMLInputElement).value)}
            />
          </div>

          {/* Note */}
          <FormField
            label="Note (optionnel)"
            as="textarea"
            placeholder="Instructions spéciales, commentaires..."
            value={form.note}
            onChange={e => update("note", (e.target as HTMLTextAreaElement).value)}
            rows={3}
          />

          {/* Résumé */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Total</span>
              <span className="font-bold text-lg">{formatPrix(total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Acompte versé</span>
              <span>{formatPrix(Number(form.acompte) || 0)}</span>
            </div>
            <div className="flex justify-between text-sm border-t pt-2">
              <span className="font-medium">Montant restant</span>
              <span className="font-bold text-lg">{formatPrix(montantRestant)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => {
                setForm(getInitialState());
                onOpenChange(false);
              }}
              className="px-4 py-2 text-sm border rounded-md hover:bg-muted"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              {mode === 'edit' ? 'Modifier' : 'Créer la commande'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CommandeForm;
