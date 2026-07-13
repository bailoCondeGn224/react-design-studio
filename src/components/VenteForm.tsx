import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/useMediaQuery";
import FormField from "@/components/FormField";
import ArticleCombobox from "@/components/ArticleCombobox";
import ClientCombobox from "@/components/ClientCombobox";
import { toast } from "sonner";
import { Plus, Trash2, ShoppingCart, User, Phone, DollarSign, CreditCard, AlertTriangle, Package, CheckCircle2 } from "lucide-react";
import { formatPrixInput, handlePrixChange } from "@/utils/format-prix";

interface VenteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  mode?: 'create' | 'edit';
  preselectedArticle?: {
    id: string;
    nom: string;
    prixVente: number;
    prixAchat?: number;
    stock: number;
  };
}

const VenteForm = ({ open, onOpenChange, onSubmit, initialData = null, mode = 'create', preselectedArticle }: VenteFormProps) => {
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
  const isMobile = useIsMobile();

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

  // Ajouter l'article pré-sélectionné automatiquement
  useEffect(() => {
    if (preselectedArticle && open && mode === 'create') {
      const ligne = {
        articleId: preselectedArticle.id,
        nom: preselectedArticle.nom,
        quantite: 1,
        prixUnitaire: preselectedArticle.prixVente,
        prixAchat: preselectedArticle.prixAchat,
        sousTotal: preselectedArticle.prixVente,
      };
      setForm(prev => ({
        ...prev,
        lignes: [ligne],
        montantPaye: preselectedArticle.prixVente,
      }));
    }
  }, [preselectedArticle, open, mode]);

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

      // Vérifier le prix de vente par rapport au prix d'achat
      if (field === 'prixUnitaire' && newLignes[index].prixAchat !== undefined) {
        const prixSaisi = Number(value) || 0;
        const prixAchat = newLignes[index].prixAchat || 0;

        if (prixSaisi > 0 && prixSaisi < prixAchat) {
          toast.error(`Le prix de vente (${prixSaisi.toLocaleString('fr-GN')} GNF) ne peut pas être inférieur au prix d'achat (${prixAchat.toLocaleString('fr-GN')} GNF) !`);
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

  // Contenu du formulaire (partagé entre Dialog et Sheet)
  const formContent = (
    <div className="h-full flex flex-col p-0 bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header avec gradient */}
      <div className="px-4 sm:px-6 py-4 sm:py-5 border-b bg-gradient-to-r from-primary/10 via-primary/5 to-transparent flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="hidden md:flex w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
            <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              {isMobile ? (mode === 'edit' ? 'Modifier' : 'Vente') : (mode === 'edit' ? 'Modifier la Vente' : 'Nouvelle Vente')}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {mode === 'edit' ? 'Modifiez les informations de la vente' : 'Enregistrez une transaction de vente'}
            </p>
          </div>
        </div>
      </div>

      {/* Zone scrollable */}
      <form onSubmit={handleSubmit} className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-5">
          {/* Alerte client obligatoire */}
          {requiresClient && (
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-warning/10 to-warning/5 border-2 border-warning/30 p-4">
              <div className="absolute top-0 right-0 w-32 h-32 bg-warning/10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-warning">Client enregistré OBLIGATOIRE</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Pour les ventes à crédit ou avec un montant restant
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section Client */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500/5 via-background to-background border-2 border-border p-4 sm:p-5">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-12 -mt-12"></div>
            <div className="relative space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Informations Client</h3>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-foreground mb-2">
                  {requiresClient ? <>Client enregistré <span className="text-destructive">*</span></> : "Client enregistré (optionnel)"}
                </label>
                <ClientCombobox
                  value={form.clientId}
                  onChange={handleClientChange}
                  placeholder="Rechercher un client..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                    Nom complet <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Aminata Diallo"
                    value={form.nomComplet}
                    onChange={e => update("nomComplet", e.target.value)}
                    maxLength={200}
                    className="w-full px-3 h-11 rounded-lg border border-border bg-card text-base sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                    Téléphone <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="tel"
                    inputMode="tel"
                    placeholder="620123456"
                    value={form.tel}
                    onChange={e => update("tel", e.target.value)}
                    maxLength={20}
                    className="w-full px-3 h-11 rounded-lg border border-border bg-card text-base sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-colors"
                  />
                </div>
              </div>
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
                  <h3 className="text-sm font-bold text-foreground">Articles <span className="text-destructive">*</span></h3>
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
                        } p-3 sm:p-4 space-y-3`}
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
                          {/* Article - Pleine largeur */}
                          <div>
                            <label className="text-xs font-semibold text-foreground mb-2 block">Article</label>
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
                                      prixAchat: Number(article.prixAchat) || 0,
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
                              <div className="mt-2 flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-warning/10 border border-warning/20">
                                <AlertTriangle className="w-3.5 h-3.5 text-warning flex-shrink-0" />
                                <p className="text-xs text-warning font-medium">
                                  Stock faible: {ligne.stockDisponible} unités
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Quantité et Prix - Grid responsive qui stack sur mobile */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-semibold text-foreground mb-2 block">Quantité</label>
                              <input
                                type="number"
                                inputMode="numeric"
                                className={`w-full px-4 h-12 rounded-lg border-2 bg-card text-lg font-bold text-foreground transition-all ${
                                  ligne.stockDisponible !== undefined && ligne.quantite > ligne.stockDisponible
                                    ? 'border-destructive focus:ring-2 focus:ring-destructive/30'
                                    : 'border-border focus:ring-2 focus:ring-primary/20 focus:border-primary'
                                }`}
                                placeholder="1"
                                min="1"
                                max={ligne.stockDisponible !== undefined ? ligne.stockDisponible : undefined}
                                value={ligne.quantite}
                                onChange={e => updateLigne(index, "quantite", e.target.value)}
                              />
                              {ligne.stockDisponible !== undefined && ligne.quantite > ligne.stockDisponible && (
                                <p className="text-xs text-destructive mt-1.5 font-medium flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                                  Max: {ligne.stockDisponible}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="text-xs font-semibold text-foreground mb-2 block">Prix unitaire (GNF)</label>
                              <input
                                type="text"
                                inputMode="numeric"
                                className="w-full px-4 h-12 rounded-lg border-2 border-border bg-card text-lg font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="0"
                                value={formatPrixInput(ligne.prixUnitaire)}
                                onChange={e => updateLigne(index, "prixUnitaire", handlePrixChange(e.target.value))}
                              />
                            </div>
                          </div>

                          {/* Sous-total avec checkmark si valide */}
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

          {/* Section Total et Paiement */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-violet-500/10 via-primary/5 to-background border-2 border-primary/20 p-5 sm:p-6 shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative space-y-4">
              {/* Total */}
              <div className="pb-4 border-b-2 border-border/30">
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

              {/* Montant payé et restant */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-foreground mb-2">
                    <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                    Montant payé (GNF)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={formatPrixInput(form.montantPaye)}
                    onChange={e => update("montantPaye", handlePrixChange(e.target.value))}
                    onFocus={e => e.target.select()}
                    className={`w-full px-4 h-12 rounded-lg border-2 bg-card text-lg font-bold text-foreground placeholder:text-muted-foreground focus:outline-none transition-all ${
                      Number(form.montantPaye) > total
                        ? 'border-destructive focus:ring-2 focus:ring-destructive/30'
                        : 'border-border focus:ring-2 focus:ring-primary/30 focus:border-primary'
                    }`}
                  />
                  {Number(form.montantPaye) > total && (
                    <div className="mt-2 flex items-center gap-1.5 px-2 py-1 rounded-md bg-destructive/10 border border-destructive/20">
                      <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
                      <p className="text-xs text-destructive font-medium">
                        Le montant dépasse le total
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-2 block">Montant restant</label>
                  <div className={`px-4 h-12 rounded-lg flex items-center text-lg font-black border-2 transition-all ${
                    montantRestant > 0
                      ? 'bg-warning/10 border-warning/30 text-warning'
                      : montantRestant < 0
                      ? 'bg-destructive/10 border-destructive/30 text-destructive'
                      : 'bg-success/10 border-success/30 text-success'
                  }`}>
                    {formatPrix(Math.max(0, montantRestant))}
                  </div>
                </div>
              </div>

              {/* Mode de paiement */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-foreground mb-2">
                  <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
                  Mode de paiement
                </label>
                <select
                  value={form.modePaiement}
                  onChange={e => update("modePaiement", e.target.value)}
                  className="w-full px-3 h-11 rounded-lg border-2 border-border bg-card text-base sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                >
                  <option value="especes">💵 Espèces (Cash)</option>
                  <option value="mobile_money">📱 Mobile Money</option>
                  <option value="virement">🏦 Virement bancaire</option>
                  <option value="credit">💳 Crédit</option>
                  <option value="acompte_50">💰 Acompte 50%</option>
                </select>
              </div>
            </div>
          </div>
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
          className="w-full sm:flex-1 h-12 rounded-xl text-base font-bold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg shadow-primary/25 active:scale-[0.98] transition-all"
        >
          {mode === 'edit' ? '✓ Enregistrer' : '✓ Valider la Vente'}
        </button>
      </div>
    </div>
  );

  // Rendu conditionnel : Sheet pour mobile, Dialog pour desktop
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[95vh] p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
          {formContent}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl h-[90vh] flex flex-col p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader className="sr-only">
          <DialogTitle>{mode === 'edit' ? 'Modifier la Vente' : 'Nouvelle Vente'}</DialogTitle>
          <DialogDescription>
            {mode === 'edit' ? 'Modifiez les informations de la vente' : 'Enregistrez une nouvelle vente'}
          </DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
};

export default VenteForm;
