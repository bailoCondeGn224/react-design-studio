import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import FormField from "@/components/FormField";
import NouvelArticleModal from "@/components/NouvelArticleModal";
import { toast } from "sonner";
import { Plus, Trash2, TrendingUp, Package, DollarSign } from "lucide-react";
import { useFournisseurs } from "@/hooks/useFournisseurs";
import { useStock } from "@/hooks/useStock";
import { formatPrixInput, handlePrixChange } from "@/utils/format-prix";

interface ApprovisionnementFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  mode?: 'create' | 'edit';
}

const ApprovisionnementForm = ({ open, onOpenChange, onSubmit, initialData = null, mode = 'create' }: ApprovisionnementFormProps) => {
  const { data: fournisseursResponse } = useFournisseurs({ page: 1, limit: 100 });
  const fournisseurs = fournisseursResponse?.data || [];
  const { data: articlesResponse } = useStock({ page: 1, limit: 100 });
  const articles = articlesResponse?.data || [];

  const getInitialState = () => {
    if (mode === 'edit' && initialData) {
      return {
        fournisseurId: initialData.fournisseurId || "",
        lignes: initialData.lignes || [],
        montantPaye: initialData.montantPaye || 0,
        dateLivraison: initialData.dateLivraison || "",
        numeroFacture: initialData.numeroFacture || "",
        note: initialData.note || "",
      };
    }
    return {
      fournisseurId: "",
      lignes: [],
      montantPaye: 0,
      dateLivraison: new Date().toISOString().split('T')[0],
      numeroFacture: "",
      note: "",
    };
  };

  const [form, setForm] = useState(getInitialState());
  const [nouvelArticleModalOpen, setNouvelArticleModalOpen] = useState(false);
  const [currentLigneIndex, setCurrentLigneIndex] = useState<number | null>(null);

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setForm({
        fournisseurId: initialData.fournisseurId || "",
        lignes: initialData.lignes || [],
        montantPaye: initialData.montantPaye || 0,
        dateLivraison: initialData.dateLivraison || "",
        numeroFacture: initialData.numeroFacture || "",
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

      // Garder la valeur telle quelle (comme pour montantPaye)
      newLignes[index] = { ...newLignes[index], [field]: value };

      // Si on change l'article, pré-remplir le nom et le prix d'achat
      if (field === 'articleId') {
        const article = articles.find((a: any) => a.id === value);
        if (article) {
          newLignes[index].nom = article.nom;
          // Pré-remplir le prix d'achat avec le dernier prix connu (PMP)
          newLignes[index].prixUnitaire = article.prixAchat || 0;
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

  const handleOpenNouvelArticleModal = (ligneIndex: number) => {
    setCurrentLigneIndex(ligneIndex);
    setNouvelArticleModalOpen(true);
  };

  const handleArticleCreated = (newArticle: any) => {
    // Sélectionner automatiquement le nouvel article dans la ligne
    if (currentLigneIndex !== null) {
      updateLigne(currentLigneIndex, 'articleId', newArticle.id);
    }
    setCurrentLigneIndex(null);
  };

  const formatPrix = (montant: number) => {
    return new Intl.NumberFormat('fr-GN', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0
    }).format(montant).replace('GNF', 'GNF');
  };

  // Calculer le nouveau PMP pour un article
  const calculerNouveauPMP = (articleId: string, quantiteAjoutee: number, prixAchatUnitaire: number) => {
    const article = articles.find((a: any) => a.id === articleId);
    if (!article) return 0;

    const stockActuel = article.stock || 0;
    const pmpActuel = article.prixAchat || 0;
    const nouveauStock = stockActuel + quantiteAjoutee;

    if (nouveauStock === 0) return 0;

    // Formule PMP : (Stock actuel × PMP actuel + Qté entrée × Prix achat) / Stock total
    const nouveauPMP = (stockActuel * pmpActuel + quantiteAjoutee * prixAchatUnitaire) / nouveauStock;
    return nouveauPMP;
  };

  // Calculer l'impact total sur le stock
  const calculerImpactStock = () => {
    let totalArticles = 0;
    let totalQuantiteAjoutee = 0;
    let valeurAjoutee = 0;
    let articlesModifies = new Set();

    form.lignes.forEach((ligne: any) => {
      if (ligne.articleId && ligne.quantite > 0) {
        articlesModifies.add(ligne.articleId);
        totalQuantiteAjoutee += Number(ligne.quantite);
        valeurAjoutee += ligne.sousTotal;
      }
    });

    totalArticles = articlesModifies.size;

    return {
      totalArticles,
      totalQuantiteAjoutee,
      valeurAjoutee
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.fournisseurId) {
      toast.error("Veuillez sélectionner un fournisseur");
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
    const montantRestant = calculerMontantRestant();

    // Trouver le nom du fournisseur
    const fournisseur = fournisseurs.find((f: any) => f.id === form.fournisseurId);
    if (!fournisseur) {
      toast.error("Fournisseur introuvable");
      return;
    }

    // Nettoyer les lignes pour ne garder que les champs nécessaires
    const lignesClean = form.lignes.map(ligne => ({
      articleId: ligne.articleId,
      nom: ligne.nom,
      quantite: Number(ligne.quantite),
      prixUnitaire: Number(ligne.prixUnitaire),
      sousTotal: Number(ligne.sousTotal),
    }));

    const approvisionementData = {
      fournisseurId: form.fournisseurId,
      fournisseurNom: fournisseur.nom,
      lignes: lignesClean,
      total,
      montantPaye: Number(form.montantPaye),
      montantRestant,
      dateLivraison: form.dateLivraison,
      numeroFacture: form.numeroFacture || undefined,
      note: form.note || undefined,
    };

    onSubmit(approvisionementData);
    setForm(getInitialState());
    onOpenChange(false);
  };

  const total = calculerTotal();
  const montantRestant = calculerMontantRestant();
  const impactStock = calculerImpactStock();

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {mode === 'edit' ? 'Modifier l\'Approvisionnement' : 'Nouvel Approvisionnement'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit' ? 'Modifiez les informations de l\'approvisionnement' : 'Enregistrez une livraison fournisseur'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sélection Fournisseur */}
          <FormField
            label="Fournisseur *"
            as="select"
            value={form.fournisseurId}
            onChange={e => update("fournisseurId", (e.target as HTMLSelectElement).value)}
          >
            <option value="">-- Sélectionner un fournisseur --</option>
            {fournisseurs.map((f: any) => (
              <option key={f.id} value={f.id}>
                {f.nom}
              </option>
            ))}
          </FormField>

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
                {form.lignes.map((ligne: any, index: number) => {
                  const article = articles.find((a: any) => a.id === ligne.articleId);
                  const stockActuel = article?.stock || 0;
                  const nouveauStock = stockActuel + (ligne.quantite || 0);
                  const nouveauPMP = ligne.articleId && ligne.quantite > 0 && ligne.prixUnitaire > 0
                    ? calculerNouveauPMP(ligne.articleId, ligne.quantite, ligne.prixUnitaire)
                    : 0;
                  const ancienPMP = article?.prixAchat || 0;

                  return (
                    <div key={index} className="p-3 bg-secondary/30 rounded-lg space-y-2">
                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-4">
                          <select
                            className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground"
                            value={ligne.articleId}
                            onChange={e => updateLigne(index, "articleId", e.target.value)}
                          >
                            <option value="">-- Article --</option>
                            {articles.map((a: any) => {
                              // Vérifier si l'article est déjà sélectionné dans une autre ligne
                              const dejaSelectionne = form.lignes.some((l: any, i: number) =>
                                i !== index && l.articleId === a.id
                              );
                              return (
                                <option
                                  key={a.id}
                                  value={a.id}
                                  disabled={dejaSelectionne}
                                >
                                  {a.nom} (Stock: {a.stock}) {dejaSelectionne ? '✓ Déjà ajouté' : ''}
                                </option>
                              );
                            })}
                          </select>
                          {article && (
                            <div className="mt-1 space-y-0.5">
                              <div className="text-[10px] text-muted-foreground flex items-center gap-2">
                                <span>Stock actuel: <strong>{stockActuel}</strong></span>
                                {article.stock <= article.seuilAlerte && (
                                  <span className="text-warning">⚠️ Faible</span>
                                )}
                              </div>
                              {article.fournisseurPrefereNom && (
                                <div className="text-[10px] text-primary flex items-center gap-1">
                                  <span>⭐</span>
                                  <span>Fournisseur préféré: {article.fournisseurPrefereNom}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="col-span-1 flex items-start">
                          <button
                            type="button"
                            onClick={() => handleOpenNouvelArticleModal(index)}
                            className="w-full h-[42px] rounded-lg border border-border bg-primary/10 hover:bg-primary/20 text-primary transition-colors flex items-center justify-center"
                            title="Créer un nouvel article"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground"
                            placeholder="Qté"
                            min="1"
                            value={ligne.quantite}
                            onChange={e => updateLigne(index, "quantite", e.target.value)}
                          />
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
                        <div className="col-span-1 flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => supprimerLigne(index)}
                            className="text-destructive hover:text-destructive/80"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Affichage de l'impact */}
                      {ligne.articleId && ligne.quantite > 0 && ligne.prixUnitaire > 0 && (
                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
                          <div className="bg-success/10 rounded p-2">
                            <p className="text-[9px] text-muted-foreground mb-0.5">Nouveau stock</p>
                            <p className="text-sm font-bold text-success flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              {nouveauStock}
                            </p>
                          </div>
                          <div className="bg-primary/10 rounded p-2">
                            <p className="text-[9px] text-muted-foreground mb-0.5">Nouveau PMP</p>
                            <p className="text-[10px] font-bold text-primary">
                              {formatPrix(nouveauPMP)}
                            </p>
                            {ancienPMP > 0 && Math.abs(nouveauPMP - ancienPMP) > 1 && (
                              <p className={`text-[8px] ${nouveauPMP > ancienPMP ? 'text-warning' : 'text-success'}`}>
                                {nouveauPMP > ancienPMP ? '↑' : '↓'} {formatPrix(Math.abs(nouveauPMP - ancienPMP))}
                              </p>
                            )}
                          </div>
                          <div className="bg-secondary rounded p-2">
                            <p className="text-[9px] text-muted-foreground mb-0.5">Sous-total</p>
                            <p className="text-[10px] font-bold text-foreground">
                              {formatPrix(ligne.sousTotal)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Récapitulatif Impact Stock */}
          {impactStock.totalArticles > 0 && (
            <div className="bg-gradient-to-r from-success/5 via-primary/5 to-success/5 border border-success/20 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-success" />
                Impact sur le Stock
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Articles</p>
                  <p className="text-xl font-bold text-foreground">{impactStock.totalArticles}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Quantité +</p>
                  <p className="text-xl font-bold text-success">+{impactStock.totalQuantiteAjoutee}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Valeur</p>
                  <p className="text-sm font-bold text-primary">{formatPrix(impactStock.valeurAjoutee)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Total et Paiement */}
          <div className="bg-primary/5 p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold">Total Approvisionnement:</span>
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
                <div className="px-3 py-2 rounded-lg bg-secondary text-sm font-semibold">
                  {formatPrix(montantRestant)}
                </div>
              </div>
            </div>
          </div>

          {/* Informations complémentaires */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              label="Date de livraison *"
              type="date"
              value={form.dateLivraison}
              onChange={e => update("dateLivraison", (e.target as HTMLInputElement).value)}
            />
            <FormField
              label="Numéro de facture"
              placeholder="Ex: FACT-2024-001"
              value={form.numeroFacture}
              onChange={e => update("numeroFacture", (e.target as HTMLInputElement).value)}
              maxLength={50}
            />
          </div>

          <FormField
            label="Note"
            as="textarea"
            placeholder="Notes ou remarques sur cet approvisionnement"
            value={form.note}
            onChange={e => update("note", (e.target as HTMLTextAreaElement).value)}
            maxLength={500}
          />

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

    {/* Modal pour créer un nouvel article */}
    <NouvelArticleModal
      open={nouvelArticleModalOpen}
      onOpenChange={setNouvelArticleModalOpen}
      onArticleCreated={handleArticleCreated}
    />
    </>
  );
};

export default ApprovisionnementForm;
