import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import FormField from "@/components/FormField";
import ArticleCombobox from "@/components/ArticleCombobox";
import ClientCombobox from "@/components/ClientCombobox";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { formatPrixInput, handlePrixChange } from "@/utils/format-prix";

interface VenteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  mode?: 'create' | 'edit';
}

const VenteForm = ({ open, onOpenChange, onSubmit, initialData = null, mode = 'create' }: VenteFormProps) => {
  const getInitialState = () => {
    if (mode === 'edit' && initialData) {
      // Si on a nom et prenom séparés, les concaténer
      const nomComplet = initialData.nomComplet ||
        (initialData.nom && initialData.prenom ? `${initialData.nom} ${initialData.prenom}` : "");

      return {
        clientId: initialData.clientId || "",
        nomComplet: nomComplet,
        tel: initialData.tel || "",
        lignes: initialData.lignes || [],
        montantPaye: initialData.montantPaye || 0,
        modePaiement: initialData.modePaiement || "especes",
      };
    }
    return {
      clientId: "",
      nomComplet: "",
      tel: "",
      lignes: [],
      montantPaye: 0,
      modePaiement: "especes",
    };
  };

  const [form, setForm] = useState(getInitialState());

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      // Si on a nom et prenom séparés, les concaténer
      const nomComplet = initialData.nomComplet ||
        (initialData.nom && initialData.prenom ? `${initialData.nom} ${initialData.prenom}` : "");

      setForm({
        clientId: initialData.clientId || "",
        nomComplet: nomComplet,
        tel: initialData.tel || "",
        lignes: initialData.lignes || [],
        montantPaye: initialData.montantPaye || 0,
        modePaiement: initialData.modePaiement || "especes",
      });
    }
  }, [mode, initialData, open]);

  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const handleClientChange = (client: any) => {
    if (client) {
      // Pré-remplir les infos du client
      setForm(prev => ({
        ...prev,
        clientId: client.id,
        nomComplet: client.nom || "",
        tel: client.telephone || ""
      }));
    } else {
      setForm(prev => ({
        ...prev,
        clientId: "",
        nomComplet: "",
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

    if (!form.nomComplet.trim() || !form.tel.trim()) {
      toast.error("Veuillez remplir les informations du client");
      return;
    }

    if (form.lignes.length === 0) {
      toast.error("Veuillez ajouter au moins un article");
      return;
    }

    // VALIDATION MONTANT PAYÉ : Ne pas dépasser le total
    const total = calculerTotal();
    const montantPaye = Number(form.montantPaye);

    if (montantPaye > total) {
      toast.error(`Le montant payé (${formatPrix(montantPaye)}) ne peut pas dépasser le total de la vente (${formatPrix(total)}).`);
      return;
    }

    // VALIDATION CRITIQUE : Vérifier qu'un client est enregistré
    const montantRestant = total - montantPaye;
    const isCreditMode = ['credit', 'acompte_50'].includes(form.modePaiement);

    // Bloquer si: (1) il y a une dette OU (2) le mode est crédit/acompte
    if ((montantRestant > 0 || isCreditMode) && !form.clientId) {
      toast.error("Un client doit être enregistré pour les ventes à crédit ou avec un montant restant. Veuillez sélectionner ou créer un client.");
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

    // Nettoyer les lignes pour ne garder que les champs nécessaires
    const lignesClean = form.lignes.map(ligne => ({
      articleId: ligne.articleId,
      nom: ligne.nom,
      quantite: Number(ligne.quantite),
      prixUnitaire: Number(ligne.prixUnitaire),
      sousTotal: Number(ligne.sousTotal),
    }));

    // Séparer le nom complet en nom et prénom pour le backend
    const nomParts = form.nomComplet.trim().split(' ');
    const nom = nomParts.length > 1 ? nomParts.slice(0, -1).join(' ') : form.nomComplet.trim();
    const prenom = nomParts.length > 1 ? nomParts[nomParts.length - 1] : "";

    const venteData = {
      clientId: form.clientId || undefined,
      nom: nom,
      prenom: prenom,
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
  const isCreditMode = ['credit', 'acompte_50'].includes(form.modePaiement);
  const requiresClient = montantRestant > 0 || isCreditMode;

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
            {requiresClient && (
              <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 mb-2">
                <p className="text-sm text-warning font-medium flex items-center gap-2">
                  <span className="font-bold">⚠</span>
                  Client enregistré OBLIGATOIRE pour les ventes à crédit ou avec un montant restant
                </p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {requiresClient ? "Client enregistré *" : "Client enregistré (optionnel)"}
              </label>
              <ClientCombobox
                value={form.clientId}
                onChange={handleClientChange}
                placeholder="Rechercher un client..."
              />
            </div>

            <FormField
              label="Nom complet *"
              placeholder="Ex: Aminata Diallo"
              value={form.nomComplet}
              onChange={e => update("nomComplet", (e.target as HTMLInputElement).value)}
              maxLength={200}
            />

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
                  className={`w-full px-4 py-2.5 rounded-lg border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 ${
                    Number(form.montantPaye) > total
                      ? 'border-destructive focus:ring-destructive/30'
                      : 'border-border focus:ring-ring/30'
                  }`}
                />
                {Number(form.montantPaye) > total && (
                  <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                    ⚠ Le montant payé dépasse le total
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Montant restant</label>
                <div className={`px-3 py-2 rounded-lg text-sm font-semibold ${
                  montantRestant > 0 ? 'bg-warning/10 text-warning' : montantRestant < 0 ? 'bg-destructive/10 text-destructive' : 'bg-secondary'
                }`}>
                  {formatPrix(Math.max(0, montantRestant))}
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
