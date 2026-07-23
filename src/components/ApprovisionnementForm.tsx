import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { Button } from "@/components/ui/button";
import FormField from "@/components/FormField";
import ArticleCombobox from "@/components/ArticleCombobox";
import FournisseurCombobox from "@/components/FournisseurCombobox";
import NouvelArticleModal from "@/components/NouvelArticleModal";
import { toast } from "sonner";
import { Plus, Trash2, TrendingUp, Package, Truck, DollarSign, FileText, Check, Calendar, Layers } from "lucide-react";
import { formatPrixInput, handlePrixChange } from "@/utils/format-prix";

interface ApprovisionnementFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  mode?: 'create' | 'edit';
}

const ApprovisionnementForm = ({ open, onOpenChange, onSubmit, initialData = null, mode = 'create' }: ApprovisionnementFormProps) => {

  const getInitialState = () => {
    if (mode === 'edit' && initialData) {
      // Recalculer les sousTotal pour chaque ligne en s'assurant que tout est en nombre
      const lignesWithSousTotal = (initialData.lignes || []).map((ligne: any) => {
        const quantite = Number(ligne.quantite) || 0;
        const prixUnitaire = Number(ligne.prixUnitaire) || 0;
        return {
          ...ligne,
          quantite,
          prixUnitaire,
          sousTotal: quantite * prixUnitaire
        };
      });

      return {
        fournisseurId: initialData.fournisseurId || "",
        lignes: lignesWithSousTotal,
        montantPaye: Number(initialData.montantPaye) || 0,
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
  const [selectedFournisseur, setSelectedFournisseur] = useState<any>(null);
  const [nouvelArticleModalOpen, setNouvelArticleModalOpen] = useState(false);
  const [currentLigneIndex, setCurrentLigneIndex] = useState<number | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      // Recalculer les sousTotal pour chaque ligne en s'assurant que tout est en nombre
      const lignesWithSousTotal = (initialData.lignes || []).map((ligne: any) => {
        const quantite = Number(ligne.quantite) || 0;
        const prixUnitaire = Number(ligne.prixUnitaire) || 0;
        return {
          ...ligne,
          quantite,
          prixUnitaire,
          sousTotal: quantite * prixUnitaire
        };
      });

      setForm({
        fournisseurId: initialData.fournisseurId || "",
        lignes: lignesWithSousTotal,
        montantPaye: Number(initialData.montantPaye) || 0,
        dateLivraison: initialData.dateLivraison || "",
        numeroFacture: initialData.numeroFacture || "",
        note: initialData.note || "",
      });

      // Initialiser selectedFournisseur en mode édition
      if (initialData.fournisseurId && initialData.fournisseurNom) {
        setSelectedFournisseur({
          id: initialData.fournisseurId,
          nom: initialData.fournisseurNom
        });
      }
    } else {
      // Réinitialiser en mode création
      setSelectedFournisseur(null);
    }
  }, [mode, initialData, open]);

  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const ajouterLigne = () => {
    setForm(prev => ({
      ...prev,
      lignes: [...prev.lignes, {
        articleId: "",
        nom: "",
        quantite: 1,
        prixUnitaire: 0,
        sousTotal: 0,
        dateExpiration: "",
        delaiAlerteExpiration: 30,
        // Champs pour mode gros/détail
        modesVente: [],
        modeVenteId: null,
        modeVenteNom: null,
        modeQuantiteStock: 1, // Multiplicateur pour le stock (1 pour détail, N pour gros)
        quantiteUnites: 1, // Quantité totale en unités (quantite × modeQuantiteStock)
      }]
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

      // Calculer le sous-total (convertir en nombre seulement ici)
      const quantite = Number(newLignes[index].quantite) || 0;
      const prixUnitaire = Number(newLignes[index].prixUnitaire) || 0;
      newLignes[index].sousTotal = quantite * prixUnitaire;

      // Calculer la quantité en unités (pour impact stock)
      const modeQuantiteStock = Number(newLignes[index].modeQuantiteStock) || 1;
      newLignes[index].quantiteUnites = quantite * modeQuantiteStock;

      return { ...prev, lignes: newLignes };
    });
  };

  // Changer le mode de vente d'une ligne (gros/détail)
  const changerModeVente = (index: number, modeVente: any) => {
    setForm(prev => {
      const newLignes = [...prev.lignes];
      const ligne = newLignes[index];
      const quantite = Number(ligne.quantite) || 1;

      // Calculer le nouveau prix unitaire suggéré
      // En mode gros: prixAchat × quantiteStock du mode
      // En mode détail: prixAchat de l'article
      const prixAchatBase = ligne.ancienPMP || 0;
      const nouveauPrixUnitaire = prixAchatBase * modeVente.quantiteStock;

      newLignes[index] = {
        ...ligne,
        modeVenteId: modeVente.id,
        modeVenteNom: modeVente.nom,
        modeQuantiteStock: modeVente.quantiteStock,
        prixUnitaire: nouveauPrixUnitaire,
        sousTotal: quantite * nouveauPrixUnitaire,
        quantiteUnites: quantite * modeVente.quantiteStock,
      };

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
    // Sélectionner automatiquement le nouvel article dans la ligne ET pré-remplir toutes les infos
    if (currentLigneIndex !== null) {
      setForm(prev => {
        const newLignes = [...prev.lignes];
        newLignes[currentLigneIndex] = {
          ...newLignes[currentLigneIndex],
          articleId: newArticle.id,
          nom: newArticle.nom,
          prixUnitaire: newArticle.prixAchat || 0, // ← PRÉ-REMPLIR le prix d'achat
          stockActuel: newArticle.stock || 0,
          seuilAlerte: newArticle.seuilAlerte,
          ancienPMP: newArticle.prixAchat || 0,
          fournisseurPrefereNom: newArticle.fournisseurPrefereNom,
          dateExpiration: newArticle.dateExpiration || "",
          delaiAlerteExpiration: newArticle.delaiAlerteExpiration || 30,
          sousTotal: Number(newLignes[currentLigneIndex].quantite || 1) * (Number(newArticle.prixAchat) || 0)
        };
        return { ...prev, lignes: newLignes };
      });
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

  // Calculer l'impact total sur le stock
  const calculerImpactStock = () => {
    let totalArticles = 0;
    let totalQuantiteAjoutee = 0; // En unités
    let valeurAjoutee = 0;
    let articlesModifies = new Set();

    form.lignes.forEach((ligne: any) => {
      if (ligne.articleId && ligne.quantite > 0) {
        articlesModifies.add(ligne.articleId);
        // Calculer la quantité en unités
        const modeQuantiteStock = Number(ligne.modeQuantiteStock) || 1;
        totalQuantiteAjoutee += Number(ligne.quantite) * modeQuantiteStock;
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

    // Vérifier que le fournisseur est sélectionné
    if (!selectedFournisseur || !selectedFournisseur.nom) {
      toast.error("Fournisseur introuvable ou incomplet");
      return;
    }

    // Nettoyer les lignes pour ne garder que les champs nécessaires
    const lignesClean = form.lignes.map(ligne => {
      const modeQuantiteStock = Number(ligne.modeQuantiteStock) || 1;
      const quantiteUnites = Number(ligne.quantite) * modeQuantiteStock;

      return {
        articleId: ligne.articleId,
        nom: ligne.nom,
        quantite: Number(ligne.quantite),
        prixUnitaire: Number(ligne.prixUnitaire),
        sousTotal: Number(ligne.sousTotal),
        dateExpiration: ligne.dateExpiration || undefined,
        delaiAlerteExpiration: ligne.delaiAlerteExpiration ? Number(ligne.delaiAlerteExpiration) : undefined,
        // Champs mode vente
        modeVenteId: ligne.modeVenteId || undefined,
        modeVenteNom: ligne.modeVenteNom || undefined,
        modeQuantiteStock: modeQuantiteStock,
        quantiteUnites: quantiteUnites, // Quantité réelle en unités pour le stock
      };
    });

    const approvisionementData = {
      fournisseurId: form.fournisseurId,
      fournisseurNom: selectedFournisseur.nom || '',
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
    setSelectedFournisseur(null);
    onOpenChange(false);
  };

  const total = calculerTotal();
  const montantRestant = calculerMontantRestant();
  const impactStock = calculerImpactStock();

  // Contenu partagé entre Sheet et Dialog
  const formContent = (
    <>
      {/* Header pour Sheet (mobile) */}
      <div className="md:hidden px-4 sm:px-6 py-4 sm:py-5 border-b bg-gradient-to-r from-primary/10 via-primary/5 to-transparent flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
            <Truck className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-base font-bold">
              {mode === 'edit' ? 'Modifier' : 'Approvisionnement'}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {mode === 'edit' ? 'Modifiez les informations' : 'Enregistrez une livraison'}
            </p>
          </div>
        </div>
      </div>

      {/* Zone scrollable */}
      <form onSubmit={handleSubmit} className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-5">
          {/* Section Fournisseur */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/5 via-background to-background border-2 border-border p-4 sm:p-5">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12"></div>
            <div className="relative space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Truck className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Fournisseur <span className="text-destructive">*</span></h3>
              </div>
              <FournisseurCombobox
                value={form.fournisseurId}
                onChange={(fournisseur) => {
                  if (fournisseur) {
                    setSelectedFournisseur(fournisseur);
                    update("fournisseurId", fournisseur.id);
                  } else {
                    setSelectedFournisseur(null);
                    update("fournisseurId", "");
                  }
                }}
                placeholder="Rechercher un fournisseur..."
              />
            </div>
          </div>

          {/* Section Articles */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-success/5 via-background to-background border-2 border-border p-4 sm:p-5">
            <div className="absolute top-0 right-0 w-24 h-24 bg-success/5 rounded-full -mr-12 -mt-12"></div>
            <div className="relative space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                  <Package className="w-4 h-4 text-success" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Articles à approvisionner <span className="text-destructive">*</span></h3>
              </div>

              <Button
                type="button"
                onClick={ajouterLigne}
                size="sm"
                variant="outline"
                className="w-full h-11 border-success/30 hover:bg-success/10"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un article
              </Button>

              {form.lignes.length === 0 ? (
                <div className="p-6 text-center bg-muted/30 rounded-lg border border-dashed border-border">
                  <Package className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-30" />
                  <p className="text-sm text-muted-foreground">Aucun article ajouté</p>
                  <p className="text-xs text-muted-foreground mt-1">Cliquez sur "Ajouter" pour commencer</p>
                </div>
              ) : (
                <div className="space-y-3">
                {form.lignes.map((ligne: any, index: number) => {
                  const stockActuel = Number(ligne.stockActuel) || 0;
                  const modeQuantiteStock = Number(ligne.modeQuantiteStock) || 1;
                  const quantiteUnites = Number(ligne.quantite || 0) * modeQuantiteStock;
                  const nouveauStock = stockActuel + quantiteUnites;
                  // PMP calculé sur la base des unités: (ancienStock × ancienPMP + nouvelleValeur) / nouveauStock
                  // nouvelleValeur = quantite × prixUnitaire (prixUnitaire est déjà pour le lot/unité selon le mode)
                  const nouveauPMP = ligne.articleId && ligne.quantite > 0 && ligne.prixUnitaire > 0 && nouveauStock > 0
                    ? (stockActuel * (ligne.ancienPMP || 0) + Number(ligne.quantite) * Number(ligne.prixUnitaire)) / nouveauStock
                    : ligne.ancienPMP || 0;
                  const ancienPMP = ligne.ancienPMP || 0;
                  const modesVente = ligne.modesVente || [];

                  return (
                    <div key={index} className="p-3 sm:p-4 bg-card border border-border rounded-lg space-y-3 hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:grid sm:grid-cols-12 gap-2 sm:gap-3">
                        <div className="sm:col-span-4">
                          <label className="block text-xs font-medium text-muted-foreground mb-1.5 sm:hidden">Article</label>
                          <ArticleCombobox
                            value={ligne.articleId}
                            preselectedArticle={ligne.articleId ? {
                              id: ligne.articleId,
                              nom: ligne.nom,
                              stock: ligne.stockActuel || 0,
                              prixAchat: ligne.ancienPMP || 0,
                              prixVente: 0,
                              uniteStock: ligne.uniteStock,
                              modesVente: ligne.modesVente || [],
                              fournisseurPrefereNom: ligne.fournisseurPrefereNom,
                              seuilAlerte: ligne.seuilAlerte,
                            } : null}
                            onChange={(article) => {
                              if (article) {
                                const modesVente = article.modesVente || [];
                                // Prendre le mode par défaut ou le premier mode
                                const modeDefaut = modesVente.find(m => m.parDefaut) || modesVente[0];
                                const modeQuantiteStock = modeDefaut?.quantiteStock || 1;
                                // Prix d'achat: base × quantiteStock du mode
                                const prixAchatBase = article.prixAchat || 0;
                                const prixUnitaire = prixAchatBase * modeQuantiteStock;
                                const quantite = Number(form.lignes[index].quantite) || 1;

                                setForm(prev => {
                                  const newLignes = [...prev.lignes];
                                  newLignes[index] = {
                                    ...newLignes[index],
                                    articleId: article.id,
                                    nom: article.nom,
                                    prixUnitaire: prixUnitaire,
                                    stockActuel: article.stock,
                                    seuilAlerte: article.seuilAlerte,
                                    ancienPMP: prixAchatBase, // Prix d'achat unitaire de base
                                    fournisseurPrefereNom: article.fournisseurPrefereNom,
                                    dateExpiration: article.dateExpiration || "",
                                    delaiAlerteExpiration: article.delaiAlerteExpiration || 30,
                                    sousTotal: quantite * prixUnitaire,
                                    // Champs mode vente
                                    modesVente: modesVente,
                                    modeVenteId: modeDefaut?.id || null,
                                    modeVenteNom: modeDefaut?.nom || null,
                                    modeQuantiteStock: modeQuantiteStock,
                                    quantiteUnites: quantite * modeQuantiteStock,
                                    uniteStock: article.uniteStock,
                                  };
                                  return { ...prev, lignes: newLignes };
                                });
                              }
                            }}
                            placeholder="Sélectionner un article..."
                            showPrice={true}
                            priceType="achat"
                            checkStock={false}
                            excludeIds={form.lignes
                              .filter((l: any, i: number) => i !== index && l.articleId)
                              .map((l: any) => l.articleId)}
                          />
                          {ligne.articleId && (
                            <div className="mt-1 space-y-0.5">
                              <div className="text-[10px] text-muted-foreground flex items-center gap-2">
                                <span>Stock actuel: <strong>{stockActuel}</strong> {ligne.uniteStock || 'unités'}</span>
                                {ligne.seuilAlerte && stockActuel <= ligne.seuilAlerte && (
                                  <span className="text-warning">Faible</span>
                                )}
                              </div>
                              {ligne.fournisseurPrefereNom && (
                                <div className="text-[10px] text-primary flex items-center gap-1">
                                  <span>Fournisseur préféré: {ligne.fournisseurPrefereNom}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Boutons de sélection gros/détail */}
                          {ligne.articleId && modesVente.length > 1 && (
                            <div className="mt-2 pt-2 border-t border-border">
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <Layers className="w-3 h-3 text-primary" />
                                <span className="text-[10px] font-medium text-muted-foreground">Mode de réception</span>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {modesVente.map((mode: any) => (
                                  <button
                                    key={mode.id}
                                    type="button"
                                    onClick={() => changerModeVente(index, mode)}
                                    className={`px-2.5 py-1.5 text-xs rounded-lg border transition-all ${
                                      ligne.modeVenteId === mode.id
                                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                        : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:border-primary/30'
                                    }`}
                                  >
                                    {mode.nom}
                                    {mode.quantiteStock > 1 && (
                                      <span className="ml-1 opacity-75">({mode.quantiteStock} {ligne.uniteStock || 'u'})</span>
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="sm:col-span-1 flex items-start">
                          <Button
                            type="button"
                            onClick={() => handleOpenNouvelArticleModal(index)}
                            variant="outline"
                            size="sm"
                            className="w-full h-11 sm:h-10 border-primary/30 hover:bg-primary/10 text-primary"
                            title="Créer un nouvel article"
                          >
                            <Plus className="w-4 h-4" />
                            <span className="sm:hidden ml-2">Nouvel article</span>
                          </Button>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-muted-foreground mb-1.5 sm:hidden">
                            {modeQuantiteStock > 1 ? `Qté (${ligne.modeVenteNom || 'lots'})` : 'Quantité'}
                          </label>
                          <input
                            type="number"
                            className="w-full px-3 h-11 sm:h-10 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-success/20 focus:border-success"
                            placeholder={modeQuantiteStock > 1 ? `Nb ${ligne.modeVenteNom || 'lots'}` : 'Quantité'}
                            min="1"
                            value={ligne.quantite}
                            onChange={e => updateLigne(index, "quantite", e.target.value)}
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block text-xs font-medium text-muted-foreground mb-1.5 sm:hidden">
                            {modeQuantiteStock > 1 ? `Prix / ${ligne.modeVenteNom || 'lot'}` : 'Prix unitaire'}
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            className="w-full px-3 h-11 sm:h-10 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-success/20 focus:border-success"
                            placeholder={modeQuantiteStock > 1 ? `Prix / ${ligne.modeVenteNom || 'lot'}` : 'Prix unitaire'}
                            value={formatPrixInput(ligne.prixUnitaire)}
                            onChange={e => updateLigne(index, "prixUnitaire", handlePrixChange(e.target.value))}
                          />
                        </div>
                        <div className="sm:col-span-1 flex items-center justify-center">
                          <Button
                            type="button"
                            onClick={() => supprimerLigne(index)}
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Champs Date d'expiration */}
                      {ligne.articleId && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 pt-2 border-t border-border">
                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Date d'expiration
                            </label>
                            <input
                              type="date"
                              className="w-full px-3 h-10 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                              value={ligne.dateExpiration || ""}
                              onChange={e => updateLigne(index, "dateExpiration", e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                              Délai alerte (jours)
                            </label>
                            <input
                              type="number"
                              className="w-full px-3 h-10 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                              placeholder="30"
                              min="1"
                              max="365"
                              value={ligne.delaiAlerteExpiration || ""}
                              onChange={e => updateLigne(index, "delaiAlerteExpiration", e.target.value)}
                            />
                          </div>
                        </div>
                      )}

                      {/* Affichage de l'impact */}
                      {ligne.articleId && ligne.quantite > 0 && ligne.prixUnitaire > 0 && (
                        <div className="space-y-2 pt-2 border-t border-border">
                          {/* Indication du mode et quantité ajoutée */}
                          {modeQuantiteStock > 1 && (
                            <div className="bg-primary/5 rounded p-2 sm:p-3 border border-primary/20">
                              <p className="text-xs text-muted-foreground mb-1">Quantité à ajouter</p>
                              <p className="text-sm font-semibold text-primary">
                                {ligne.quantite} {ligne.modeVenteNom || 'lot(s)'} = <strong>{quantiteUnites}</strong> {ligne.uniteStock || 'unités'}
                              </p>
                            </div>
                          )}
                          <div className="bg-success/10 rounded p-2 sm:p-3">
                            <p className="text-xs text-muted-foreground mb-1">Nouveau stock</p>
                            <p className="text-base sm:text-lg font-bold text-success flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" />
                              {nouveauStock} {ligne.uniteStock || 'unités'}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              ({stockActuel} + {quantiteUnites})
                            </p>
                          </div>
                          <div className="bg-primary/10 rounded p-2 sm:p-3">
                            <p className="text-xs text-muted-foreground mb-1">Nouveau PMP (par unité)</p>
                            <p className="text-sm sm:text-base font-bold text-primary">
                              {formatPrix(nouveauPMP)}
                            </p>
                            {ancienPMP > 0 && Math.abs(nouveauPMP - ancienPMP) > 1 && (
                              <p className={`text-xs ${nouveauPMP > ancienPMP ? 'text-warning' : 'text-success'}`}>
                                {nouveauPMP > ancienPMP ? '↑' : '↓'} {formatPrix(Math.abs(nouveauPMP - ancienPMP))}
                              </p>
                            )}
                          </div>
                          <div className="bg-secondary rounded p-2 sm:p-3">
                            <p className="text-xs text-muted-foreground mb-1">Sous-total</p>
                            <p className="text-sm sm:text-base font-bold text-foreground">
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
          </div>

          {/* Récapitulatif Impact Stock */}
          {impactStock.totalArticles > 0 && (
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-success/5 via-primary/5 to-success/5 border-2 border-success/20 p-4 sm:p-5">
              <div className="absolute top-0 right-0 w-24 h-24 bg-success/10 rounded-full -mr-12 -mt-12"></div>
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-success" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">Impact sur le Stock</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground">Articles</p>
                    <p className="text-xl font-bold text-foreground">{impactStock.totalArticles}</p>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground">Quantité ajoutée</p>
                    <p className="text-xl font-bold text-success">+{impactStock.totalQuantiteAjoutee}</p>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground">Valeur totale</p>
                    <p className="text-base font-bold text-primary">{formatPrix(impactStock.valeurAjoutee)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section Paiement */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-warning/5 via-background to-background border-2 border-border p-4 sm:p-5">
            <div className="absolute top-0 right-0 w-24 h-24 bg-warning/5 rounded-full -mr-12 -mt-12"></div>
            <div className="relative space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-warning" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Paiement</h3>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-warning/10 rounded-lg border border-warning/20">
                <span className="text-xs sm:text-sm font-medium text-foreground">Total Approvisionnement</span>
                <span className="text-lg sm:text-xl font-black text-primary">{formatPrix(total)}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Montant payé</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={formatPrixInput(form.montantPaye)}
                    onChange={e => update("montantPaye", handlePrixChange(e.target.value))}
                    onFocus={e => e.target.select()}
                    className="w-full px-3 h-11 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-warning/20 focus:border-warning"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Montant restant</label>
                  <div className="flex items-center h-11 px-3 rounded-lg bg-muted border border-border">
                    <span className="text-sm font-bold text-foreground">{formatPrix(montantRestant)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section Informations - Gris */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-muted/30 via-background to-background border-2 border-border p-4 sm:p-5">
            <div className="absolute top-0 right-0 w-24 h-24 bg-muted/20 rounded-full -mr-12 -mt-12"></div>
            <div className="relative space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Informations complémentaires</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Date de livraison <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.dateLivraison}
                    onChange={e => update("dateLivraison", e.target.value)}
                    className="w-full px-3 h-11 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Numéro de facture
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: FACT-2024-001"
                    value={form.numeroFacture}
                    onChange={e => update("numeroFacture", e.target.value)}
                    maxLength={50}
                    className="w-full px-3 h-11 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Note (optionnelle)
                </label>
                <textarea
                  placeholder="Notes ou remarques sur cet approvisionnement"
                  value={form.note}
                  onChange={e => update("note", e.target.value)}
                  maxLength={500}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground resize-none"
                />
              </div>
            </div>
          </div>

        </form>

        {/* Footer avec actions - fixe en bas */}
        <div className="px-4 sm:px-6 py-4 border-t bg-muted/30 flex-shrink-0">
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              onClick={(e: any) => {
                const form = e.target.closest('form');
                if (!form) {
                  // Si on est dans le footer, chercher le form dans le DialogContent
                  const dialogContent = e.target.closest('[role="dialog"]');
                  const formElement = dialogContent?.querySelector('form');
                  if (formElement) {
                    formElement.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                  }
                } else {
                  form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                }
              }}
              className="w-full sm:w-auto"
            >
              <Check className="w-4 h-4 mr-2" />
              {mode === 'edit' ? 'Enregistrer' : 'Valider l\'approvisionnement'}
            </Button>
          </div>
        </div>
    </>
  );

  // Rendu conditionnel : Sheet pour mobile, Dialog pour desktop
  if (isMobile) {
    return (
      <>
        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetContent side="bottom" className="h-[95vh] p-0 flex flex-col bg-gradient-to-br from-background via-background to-primary/5" onOpenAutoFocus={(e) => e.preventDefault()}>
            {formContent}
          </SheetContent>
        </Sheet>

        {/* Modal pour créer un nouvel article */}
        <NouvelArticleModal
          open={nouvelArticleModalOpen}
          onOpenChange={setNouvelArticleModalOpen}
          onArticleCreated={handleArticleCreated}
        />
      </>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl h-[90vh] flex flex-col p-0 bg-gradient-to-br from-background via-background to-primary/5" onOpenAutoFocus={(e) => e.preventDefault()}>
          {/* Header avec gradient pour Desktop */}
          <DialogHeader className="px-4 sm:px-6 py-4 sm:py-5 border-b bg-gradient-to-r from-primary/10 via-primary/5 to-transparent flex-shrink-0">
            <div className="flex items-center gap-3 pr-12">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
                <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
              </div>
              <div>
                <DialogTitle className="text-base sm:text-lg font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                  {mode === 'edit' ? 'Modifier l\'Approvisionnement' : 'Nouvel Approvisionnement'}
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  {mode === 'edit' ? 'Modifiez les informations de l\'approvisionnement' : 'Enregistrez une livraison fournisseur'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          {formContent}
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
