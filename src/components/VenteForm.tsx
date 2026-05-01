import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import FormField from "@/components/FormField";
import ArticleCombobox from "@/components/ArticleCombobox";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { useClients } from "@/hooks/useClients";
import { formatPrixInput, handlePrixChange } from "@/utils/format-prix";

interface VenteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  mode?: 'create' | 'edit';
}

const VenteForm = ({ open, onOpenChange, onSubmit, initialData = null, mode = 'create' }: VenteFormProps) => {
  const { data: clientsResponse } = useClients({ page: 1, limit: 100 });
  const clients = clientsResponse?.data || [];

  const getInitialState = () => {
    if (mode === 'edit' && initialData) {
      return {
        clientId: initialData.clientId || "",
        nom: initialData.nom || "",
        prenom: initialData.prenom || "",
        tel: initialData.tel || "",
        lignes: initialData.lignes || [],
        montantPaye: initialData.montantPaye || 0,
        modePaiement: initialData.modePaiement || "especes",
      };
    }
    return {
      clientId: "",
      nom: "",
      prenom: "",
      tel: "",
      lignes: [],
      montantPaye: 0,
      modePaiement: "especes",
    };
  };

  const [form, setForm] = useState(getInitialState());

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setForm({
        clientId: initialData.clientId || "",
        nom: initialData.nom || "",
        prenom: initialData.prenom || "",
        tel: initialData.tel || "",
        lignes: initialData.lignes || [],
        montantPaye: initialData.montantPaye || 0,
        modePaiement: initialData.modePaiement || "especes",
      });
    }
  }, [mode, initialData, open]);

  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const handleClientChange = (clientId: string) => {
    const client = clients.find((c: any) => c.id === clientId);
    if (client) {
      // Pré-remplir les infos du client
      const [nom = "", prenom = ""] = (client.nom || "").split(" ", 2);
      setForm(prev => ({
        ...prev,
        clientId: clientId,
        nom: nom,
        prenom: prenom || "",
        tel: client.telephone || ""
      }));
    } else {
      setForm(prev => ({
        ...prev,
        clientId: "",
        nom: "",
        prenom: "",
        tel: ""
      }));
    }
  };

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

      // Garder la valeur telle quelle
      newLignes[index] = { ...newLignes[index], [field]: value };

      // Vérifier le stock si on modifie la quantité
      if (field === 'quantite' && newLignes[index].stockDisponible !== undefined) {
        const quantiteDemandee = Number(value) || 0;
        if (quantiteDemandee > newLignes[index].stockDisponible) {
          toast.warning(`Stock insuffisant ! Disponible: ${newLignes[index].stockDisponible}`);
        }
      }

      // Calculer le sous-total (convertir en nombre seulement ici)
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
    return calculerTotal() - Number(form.montantPaye);
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

    if (!form.nom.trim() || !form.prenom.trim() || !form.tel.trim()) {
      toast.error("Veuillez remplir les informations du client");
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

    // VALIDATION STOCK CRITIQUE : Vérifier le stock disponible
    for (const ligne of form.lignes) {
      if (ligne.stockDisponible !== undefined) {
        if (ligne.quantite > ligne.stockDisponible) {
          toast.error(`Stock insuffisant pour "${ligne.nom}" ! Disponible: ${ligne.stockDisponible}`);
          return;
        }
        if (ligne.stockDisponible === 0) {
          toast.error(`"${ligne.nom}" est en rupture de stock !`);
          return;
        }
      }
    }

    const total = calculerTotal();
    const montantRestant = calculerMontantRestant();

    // Nettoyer les lignes pour ne garder que les champs nécessaires
    const lignesClean = form.lignes.map(ligne => ({
      articleId: ligne.articleId,
      nom: ligne.nom,
      quantite: Number(ligne.quantite),
      prixUnitaire: Number(ligne.prixUnitaire),
      sousTotal: Number(ligne.sousTotal),
    }));

    const venteData = {
      clientId: form.clientId || undefined,
      nom: form.nom,
      prenom: form.prenom,
      tel: form.tel,
      lignes: lignesClean,
      total,
      montantPaye: Number(form.montantPaye),
      montantRestant,
      modePaiement: form.modePaiement,
    };

    onSubmit(venteData);
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
            {mode === 'edit' ? 'Modifier la Vente' : 'Nouvelle Vente'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit' ? 'Modifiez les informations de la vente' : 'Enregistrez une transaction de vente'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Informations Client */}
          <div className="space-y-3">
            <FormField
              label="Client enregistré (optionnel)"
              as="select"
              value={form.clientId}
              onChange={e => handleClientChange((e.target as HTMLSelectElement).value)}
            >
              <option value="">-- Client sans compte --</option>
              {clients.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.nom}
                </option>
              ))}
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                label="Nom *"
                placeholder="Diallo"
                value={form.nom}
                onChange={e => update("nom", (e.target as HTMLInputElement).value)}
                maxLength={100}
              />
              <FormField
                label="Prénom *"
                placeholder="Aminata"
                value={form.prenom}
                onChange={e => update("prenom", (e.target as HTMLInputElement).value)}
                maxLength={100}
              />
            </div>

            <FormField
              label="Téléphone *"
              placeholder="620123456"
              value={form.tel}
              onChange={e => update("tel", (e.target as HTMLInputElement).value)}
              maxLength={20}
            />
          </div>

          {/* Lignes d'articles */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-foreground">Articles *</label>
              <button
                type="button"
                onClick={ajouterLigne}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80"
              >
                <Plus className="w-4 h-4" />
                Ajouter
              </button>
            </div>

            {form.lignes.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">Aucun article ajouté</p>
            ) : (
              <div className="space-y-2">
                {form.lignes.map((ligne: any, index: number) => (
                  <div key={index} className="grid grid-cols-12 gap-2 p-3 bg-secondary/30 rounded-lg">
                    <div className="col-span-5">
                      <ArticleCombobox
                        value={ligne.articleId}
                        onChange={(article) => {
                          if (article) {
                            setForm(prev => {
                              const newLignes = [...prev.lignes];
                              newLignes[index] = {
                                ...newLignes[index],
                                articleId: article.id,
                                nom: article.nom,
                                prixUnitaire: Number(article.prixVente) || 0,
                                stockDisponible: article.stock,
                                sousTotal: Number(newLignes[index].quantite || 1) * (Number(article.prixVente) || 0)
                              };
                              return { ...prev, lignes: newLignes };
                            });
                          }
                        }}
                        placeholder="Sélectionner un article..."
                        showPrice={true}
                        priceType="vente"
                        checkStock={true}
                        excludeIds={form.lignes
                          .filter((l: any, i: number) => i !== index && l.articleId)
                          .map((l: any) => l.articleId)}
                      />
                      {ligne.stockDisponible !== undefined && ligne.stockDisponible <= (ligne.seuilAlerte || 0) && (
                        <p className="text-xs text-warning mt-1 flex items-center gap-1">
                          Stock faible: {ligne.stockDisponible} unités restantes
                        </p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        className={`w-full px-3 py-2 rounded-lg border bg-card text-sm text-foreground ${
                          ligne.stockDisponible !== undefined && ligne.quantite > ligne.stockDisponible ? 'border-destructive' : 'border-border'
                        }`}
                        placeholder="Qté"
                        min="1"
                        max={ligne.stockDisponible !== undefined ? ligne.stockDisponible : undefined}
                        value={ligne.quantite}
                        onChange={e => updateLigne(index, "quantite", e.target.value)}
                      />
                      {ligne.stockDisponible !== undefined && ligne.quantite > ligne.stockDisponible && (
                        <p className="text-xs text-destructive mt-1">
                          Max: {ligne.stockDisponible}
                        </p>
                      )}
                    </div>
                    <div className="col-span-3">
                      <input
                        type="text"
                        inputMode="numeric"
                        className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground"
                        placeholder="Prix unit."
                        value={formatPrixInput(ligne.prixUnitaire)}
                        onChange={e => updateLigne(index, "prixUnitaire", handlePrixChange(e.target.value))}
                      />
                    </div>
                    <div className="col-span-1 flex items-center">
                      <button
                        type="button"
                        onClick={() => supprimerLigne(index)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {ligne.sousTotal > 0 && (
                      <div className="col-span-12 text-right text-xs text-muted-foreground">
                        Sous-total: {formatPrix(ligne.sousTotal)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Total et Paiement */}
          <div className="bg-primary/5 p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold">Total:</span>
              <span className="text-lg font-bold text-primary">{formatPrix(total)}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Montant payé (GNF)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={formatPrixInput(form.montantPaye)}
                  onChange={e => update("montantPaye", handlePrixChange(e.target.value))}
                  onFocus={e => e.target.select()}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Montant restant</label>
                <div className={`px-3 py-2 rounded-lg text-sm font-semibold ${
                  montantRestant > 0 ? 'bg-warning/10 text-warning' : 'bg-secondary'
                }`}>
                  {formatPrix(montantRestant)}
                </div>
              </div>
            </div>
          </div>

          <FormField
            label="Mode de paiement"
            as="select"
            value={form.modePaiement}
            onChange={e => update("modePaiement", (e.target as HTMLSelectElement).value)}
          >
            <option value="especes">Espèces (Cash)</option>
            <option value="mobile_money">Mobile Money</option>
            <option value="virement">Virement bancaire</option>
            <option value="credit">Crédit</option>
            <option value="acompte_50">Acompte 50%</option>
          </FormField>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-lg gradient-gold text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              {mode === 'edit' ? 'Enregistrer' : 'Valider'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VenteForm;
