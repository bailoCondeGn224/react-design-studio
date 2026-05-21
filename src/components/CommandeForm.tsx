import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/useMediaQuery";
import FormField from "@/components/FormField";
import ArticleCombobox from "@/components/ArticleCombobox";
import ClientCombobox from "@/components/ClientCombobox";
import { toast } from "sonner";
import { Plus, Trash2, ShoppingBag, User, Package, DollarSign, Calendar, CheckCircle2, AlertTriangle } from "lucide-react";
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
  const isMobile = useIsMobile();

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

    if (!form.clientId) {
      toast.error("Veuillez sélectionner un client");
      return;
    }

    if (form.lignes.length === 0) {
      toast.error("Veuillez ajouter au moins un article");
      return;
    }

    for (const ligne of form.lignes) {
      if (!ligne.articleId || !ligne.quantite || !ligne.prixUnitaire) {
        toast.error("Veuillez remplir tous les champs des articles");
        return;
      }
    }

    const total = calculerTotal();
    const acompte = Number(form.acompte) || 0;

    if (acompte > total) {
      toast.error("L'acompte ne peut pas dépasser le total");
      return;
    }

    const montantRestant = total - acompte;

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

  // Contenu du formulaire (partagé)
  const formBody = (
    <>

        {/* Zone scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-5">
          {/* Section Client */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500/5 via-background to-background border-2 border-border p-4 sm:p-5">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-12 -mt-12"></div>
            <div className="relative space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Client *</h3>
              </div>

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
          </div>

          {/* Section Articles */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500/5 via-background to-background border-2 border-border p-4 sm:p-5">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-12 -mt-12"></div>
            <div className="relative space-y-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Package className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">Articles *</h3>
                  {form.lignes.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold">
                      {form.lignes.length}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={ajouterLigne}
                  className="flex items-center gap-1.5 px-3 h-9 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-xs sm:text-sm font-semibold active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Ajouter</span>
                </button>
              </div>

              {form.lignes.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-border rounded-xl bg-muted/30">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-30" />
                  <p className="text-sm text-muted-foreground">Aucun article ajouté</p>
                  <p className="text-xs text-muted-foreground mt-1">Cliquez sur "Ajouter" pour commencer</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {form.lignes.map((ligne: any, index: number) => {
                    const isValid = ligne.articleId && ligne.quantite > 0 && ligne.prixUnitaire > 0;
                    return (
                      <div
                        key={index}
                        className={`relative rounded-xl border-2 transition-all ${
                          isValid
                            ? 'border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 via-background to-background'
                            : 'border-border bg-secondary/30'
                        } p-3 sm:p-4`}
                      >
                        {/* En-tête avec numéro et bouton supprimer */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-xs font-bold text-primary-foreground shadow-lg">
                            {index + 1}
                          </div>
                          <button
                            type="button"
                            onClick={() => supprimerLigne(index)}
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-destructive hover:bg-destructive/10 border-2 border-transparent hover:border-destructive/20 active:scale-95 transition-all"
                            title="Supprimer cet article"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-3">
                          {/* Article */}
                          <div>
                            <label className="text-xs font-semibold text-foreground mb-2 block">Article</label>
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
                          </div>

                          {/* Quantité et Prix */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-semibold text-foreground mb-2 block">Quantité</label>
                              <input
                                type="number"
                                inputMode="numeric"
                                placeholder="1"
                                value={ligne.quantite}
                                onChange={e => updateLigne(index, "quantite", e.target.value)}
                                min={1}
                                className="w-full px-4 h-12 rounded-lg border-2 border-border bg-card text-lg font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                              />
                            </div>

                            <div>
                              <label className="text-xs font-semibold text-foreground mb-2 block">Prix unitaire (GNF)</label>
                              <input
                                type="text"
                                inputMode="numeric"
                                placeholder="0"
                                value={formatPrixInput(ligne.prixUnitaire)}
                                onChange={e => updateLigne(index, "prixUnitaire", handlePrixChange(e.target.value))}
                                className="w-full px-4 h-12 rounded-lg border-2 border-border bg-card text-lg font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                              />
                            </div>
                          </div>

                          {/* Sous-total */}
                          {ligne.sousTotal > 0 && (
                            <div className="pt-3 border-t-2 border-border/50">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  {isValid && <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                                  <span className="text-sm font-semibold text-muted-foreground">Sous-total</span>
                                </div>
                                <span className="text-base sm:text-sm font-black text-primary">{formatPrix(ligne.sousTotal)}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Section Informations complémentaires */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-violet-500/5 via-background to-background border-2 border-border p-4 sm:p-5">
            <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full -mr-12 -mt-12"></div>
            <div className="relative space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-violet-600" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Informations complémentaires</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-2">
                    <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                    Acompte (GNF)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={formatPrixInput(form.acompte)}
                    onChange={e => update("acompte", handlePrixChange(e.target.value))}
                    className={`w-full px-4 h-12 rounded-lg border-2 bg-card text-lg font-bold text-foreground focus:outline-none transition-all ${
                      Number(form.acompte) > total
                        ? 'border-destructive focus:ring-2 focus:ring-destructive/30'
                        : 'border-border focus:ring-2 focus:ring-primary/20 focus:border-primary'
                    }`}
                  />
                  {Number(form.acompte) > total && (
                    <div className="mt-2 flex items-center gap-1.5 px-2 py-1 rounded-md bg-destructive/10 border border-destructive/20">
                      <AlertTriangle className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
                      <p className="text-xs text-destructive font-medium">
                        L'acompte dépasse le total
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-2">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    Date de livraison souhaitée
                  </label>
                  <input
                    type="date"
                    value={form.dateLivraison}
                    onChange={e => update("dateLivraison", e.target.value)}
                    className="w-full px-3 h-12 rounded-lg border-2 border-border bg-card text-base sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-2 block">Note (optionnel)</label>
                <textarea
                  placeholder="Instructions spéciales, commentaires..."
                  value={form.note}
                  onChange={e => update("note", e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border-2 border-border bg-card text-base sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section Résumé */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border-2 border-primary/20 p-5 sm:p-6 shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative space-y-3">
              <div className="pb-3 border-b-2 border-border/30">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-semibold text-muted-foreground">Total</span>
                  </div>
                  <span className="text-lg sm:text-base font-black text-primary">{formatPrix(total)}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="text-sm text-muted-foreground">Acompte versé</span>
                <span className="text-sm font-bold text-success">{formatPrix(Number(form.acompte) || 0)}</span>
              </div>

              <div className="pt-2 border-t-2 border-border/30">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="text-sm font-semibold text-muted-foreground">Montant restant</span>
                  <span className="text-base sm:text-sm font-black text-warning">{formatPrix(montantRestant)}</span>
                </div>
              </div>
            </div>
          </div>
        </form>

    </>
  );

  // Footer partagé
  const footer = (
    <div className="px-4 sm:px-6 py-4 border-t bg-gradient-to-r from-muted/50 to-transparent flex flex-col sm:flex-row gap-3 flex-shrink-0">
      <button
        type="button"
        onClick={() => {
          setForm(getInitialState());
          onOpenChange(false);
        }}
        className="w-full sm:flex-1 h-12 rounded-xl border-2 border-border text-base font-semibold text-muted-foreground hover:bg-secondary active:scale-[0.98] transition-all"
      >
        Annuler
      </button>
      <button
        type="submit"
        onClick={handleSubmit}
        className="w-full sm:flex-1 h-12 rounded-xl text-base font-bold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg shadow-primary/25 active:scale-[0.98] transition-all"
      >
        {mode === 'edit' ? '✓ Modifier' : '✓ Créer la commande'}
      </button>
    </div>
  );

  // Rendu conditionnel : Sheet pour mobile, Dialog pour desktop
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[95vh] p-0">
          <div className="h-full flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
            {/* Header Sheet */}
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b bg-gradient-to-r from-primary/10 via-primary/5 to-transparent flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
                  <ShoppingBag className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                    {mode === 'edit' ? 'Modifier Commande' : 'Nouvelle Commande'}
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    {mode === 'edit' ? 'Modifiez les informations' : 'Enregistrez une nouvelle commande'}
                  </p>
                </div>
              </div>
            </div>
            {formBody}
            {footer}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] flex flex-col p-0 bg-gradient-to-br from-background via-background to-primary/5">
        {/* Header Dialog avec DialogTitle pour l'accessibilité */}
        <DialogHeader className="px-4 sm:px-6 py-4 sm:py-5 border-b bg-gradient-to-r from-primary/10 via-primary/5 to-transparent flex-shrink-0">
          <div className="flex items-center gap-3 pr-12">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                {mode === 'edit' ? 'Modifier la Commande' : 'Nouvelle Commande'}
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {mode === 'edit' ? 'Modifiez les informations de la commande' : 'Enregistrez une nouvelle commande client'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        {formBody}
        {footer}
      </DialogContent>
    </Dialog>
  );
};

export default CommandeForm;
