import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import StockForm from "@/components/StockForm";
import Pagination from "@/components/Pagination";
import CanAccess from "@/components/CanAccess";
import { Package, AlertTriangle, Search, Plus, Edit, Trash, MoreVertical, AlertCircle, TrendingDown, History, ArrowUpCircle, ArrowDownCircle, Flame, Zap, Clock, Snail, Snowflake, TrendingUp as TrendUp } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMouvementsByArticle } from "@/hooks/useMouvements";
import { useStatsRotation } from "@/hooks/useRotation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { useStock, useStockStats, useCreateArticle, useUpdateArticle, useDeleteArticle } from "@/hooks/useStock";
import { useCategoriesActive } from "@/hooks/useCategories";
import { useDebounce } from "@/hooks/useDebounce";

const Stock = () => {
  const [selectedCategorieId, setSelectedCategorieId] = useState<string>("all");
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 500);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [historyArticleId, setHistoryArticleId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Hooks React Query avec filtres backend et recherche débouncée
  const { data: stockResponse, isLoading } = useStock({
    page,
    limit,
    search: debouncedSearch || undefined,
    categorieId: selectedCategorieId !== "all" ? selectedCategorieId : undefined,
  });
  const articles = stockResponse?.data || [];
  const meta = stockResponse?.meta;
  const { data: categories = [], isLoading: loadingCategories } = useCategoriesActive();
  const { data: stockStats } = useStockStats();
  const createArticle = useCreateArticle();
  const updateArticle = useUpdateArticle();
  const deleteArticle = useDeleteArticle();

  // Historique mouvements
  const { data: mouvementsResponse } = useMouvementsByArticle(historyArticleId || '', { page: 1, limit: 10 });
  const mouvements = mouvementsResponse?.data || [];
  const articleEnCours = articles.find((a: any) => a.id === historyArticleId);

  // Statistiques de rotation
  const { data: statsRotation } = useStatsRotation();

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleSubmit = (data: any) => {
    if (editingItem) {
      // Mode édition
      updateArticle.mutate({ id: editingItem.id, data });
    } else {
      // Mode création
      createArticle.mutate(data);
    }
    setEditingItem(null);
    setFormOpen(false);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteArticle.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingItem(null);
    }
  };

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedCategorieId]);

  // Statistiques d'alerte (depuis le backend)
  const articlesEnRupture = stockStats?.articlesEnRupture || 0;
  const articlesStockCritique = stockStats?.articlesStockCritique || 0;
  const articlesStockFaible = stockStats?.articlesStockFaible || 0;
  const totalAlertes = articlesEnRupture + articlesStockCritique + articlesStockFaible;

  // Valeur totale du stock (depuis le backend)
  const valeurTotaleStock = stockStats?.valeurTotaleStock || 0;

  const calculerValeurArticle = (stock: number, prixAchat: number) => {
    return stock * (prixAchat || 0);
  };

  const calculerMargeTheorique = (prixVente: number, prixAchat: number) => {
    if (!prixAchat || prixAchat === 0) return 0;
    return ((prixVente - prixAchat) / prixVente) * 100;
  };

  const getStockStatus = (stock: number, seuilAlerte: number) => {
    if (stock === 0) return { label: "Rupture", color: "bg-destructive text-destructive-foreground", icon: AlertCircle };
    if (stock <= seuilAlerte * 0.3) return { label: "Critique", color: "bg-destructive/20 text-destructive border border-destructive/50", icon: AlertTriangle };
    if (stock <= seuilAlerte) return { label: "Faible", color: "bg-warning/20 text-warning border border-warning/50", icon: TrendingDown };
    return { label: "OK", color: "bg-success/20 text-success border border-success/50", icon: Package };
  };

  const getRotationBadge = (vitesse: string | undefined, joursSansVente: number | undefined) => {
    if (!vitesse && !joursSansVente) return null;

    // Déterminer la vitesse si non fournie
    const vitesseCalculee = vitesse || (
      joursSansVente && joursSansVente > 90 ? 'dormant' :
      joursSansVente && joursSansVente > 60 ? 'lent' :
      joursSansVente && joursSansVente > 30 ? 'normal' :
      joursSansVente && joursSansVente > 15 ? 'rapide' : 'tres_rapide'
    );

    const badges = {
      'tres_rapide': { icon: Flame, label: 'Très Rapide', color: 'text-red-500' },
      'rapide': { icon: Zap, label: 'Rapide', color: 'text-success' },
      'normal': { icon: Clock, label: 'Normal', color: 'text-primary' },
      'lent': { icon: Snail, label: 'Lent', color: 'text-warning' },
      'dormant': { icon: Snowflake, label: 'Dormant', color: 'text-muted-foreground' },
    };

    return badges[vitesseCalculee as keyof typeof badges] || null;
  };

  const formatPrix = (prix: number) => {
    return new Intl.NumberFormat('fr-GN', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0
    }).format(prix).replace('GNF', 'GNF');
  };

  // Notifications automatiques au chargement
  useEffect(() => {
    if (!isLoading && articles.length > 0) {
      // Vérifier les ruptures de stock
      if (articlesEnRupture > 0) {
        toast.error(`⚠️ ${articlesEnRupture} article${articlesEnRupture > 1 ? 's' : ''} en rupture de stock !`, {
          duration: 5000,
          action: {
            label: 'Voir',
            onClick: () => {
              // Scroll vers le tableau
              document.querySelector('table')?.scrollIntoView({ behavior: 'smooth' });
            }
          }
        });
      }

      // Vérifier les stocks critiques
      if (articlesStockCritique > 0) {
        toast.warning(`⚠️ ${articlesStockCritique} article${articlesStockCritique > 1 ? 's' : ''} en stock critique`, {
          duration: 4000,
        });
      }

      // Vérifier les stocks faibles (seulement si pas de rupture/critique)
      if (articlesEnRupture === 0 && articlesStockCritique === 0 && articlesStockFaible > 0) {
        toast.info(`ℹ️ ${articlesStockFaible} article${articlesStockFaible > 1 ? 's' : ''} avec stock faible`, {
          duration: 3000,
        });
      }
    }
  }, [isLoading, articlesEnRupture, articlesStockCritique, articlesStockFaible]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Chargement du stock...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="Gestion du Stock"
        description="Consultation du stock - Les articles sont créés via les approvisionnements"
      />

      {/* Formulaire de modification (infos article uniquement, pas la quantité) */}
      <StockForm
        open={formOpen}
        onOpenChange={handleFormClose}
        onSubmit={handleSubmit}
        initialData={editingItem}
        mode="edit"
      />

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Retirer du stock</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir retirer cet article de l'inventaire ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Historique Mouvements */}
      <Dialog open={historyArticleId !== null} onOpenChange={() => setHistoryArticleId(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading flex items-center gap-1.5 sm:gap-2 text-base sm:text-lg">
              <History className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              Historique des Mouvements
            </DialogTitle>
            {articleEnCours && (
              <p className="text-xs sm:text-sm text-muted-foreground">
                {articleEnCours.nom} — Stock actuel: <strong>{articleEnCours.stock}</strong>
              </p>
            )}
          </DialogHeader>

          {mouvements.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <Package className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-2 sm:mb-3 opacity-50" />
              <p className="text-xs sm:text-sm text-muted-foreground">Aucun mouvement enregistré pour cet article</p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {mouvements.map((mouvement: any) => (
                <div key={mouvement.id} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    mouvement.type === 'entree' ? 'bg-success/20' : 'bg-destructive/20'
                  }`}>
                    {mouvement.type === 'entree' ? (
                      <ArrowUpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
                    ) : (
                      <ArrowDownCircle className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-foreground">
                          {mouvement.type === 'entree' ? 'Entrée' : 'Sortie'}
                          {' '}— {mouvement.motif === 'vente' ? 'Vente' : mouvement.motif === 'approvisionnement' ? 'Approvisionnement' : mouvement.motif}
                        </p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                          {new Date(mouvement.date).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <span className={`text-base sm:text-lg font-bold whitespace-nowrap ${mouvement.type === 'entree' ? 'text-success' : 'text-destructive'}`}>
                        {mouvement.type === 'entree' ? '+' : '-'}{mouvement.quantite}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground flex-wrap">
                      <span className="font-mono">{mouvement.stockAvant}</span>
                      <span>→</span>
                      <span className="font-mono font-semibold text-foreground">{mouvement.stockApres}</span>
                      {mouvement.reference && (
                        <>
                          <span>•</span>
                          <span className="font-mono">{mouvement.reference}</span>
                        </>
                      )}
                    </div>

                    {mouvement.valeurTotal && (
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                        Valeur: {formatPrix(mouvement.valeurTotal)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bannière d'alerte si stock critique */}
      {totalAlertes > 0 && (
        <div className="bg-gradient-to-r from-destructive/10 via-warning/10 to-destructive/10 border-l-4 border-destructive rounded-lg p-3 sm:p-4 mb-6 flex items-start gap-2 sm:gap-3">
          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1">Alertes Stock</h3>
            <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
              {articlesEnRupture > 0 && (
                <p className="flex items-center gap-1.5 sm:gap-2">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-destructive rounded-full flex-shrink-0"></span>
                  <span><strong className="text-destructive">{articlesEnRupture}</strong> article{articlesEnRupture > 1 ? 's' : ''} en rupture de stock</span>
                </p>
              )}
              {articlesStockCritique > 0 && (
                <p className="flex items-center gap-1.5 sm:gap-2">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-destructive/70 rounded-full flex-shrink-0"></span>
                  <span><strong className="text-destructive">{articlesStockCritique}</strong> article{articlesStockCritique > 1 ? 's' : ''} en stock critique</span>
                </p>
              )}
              {articlesStockFaible > 0 && (
                <p className="flex items-center gap-1.5 sm:gap-2">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-warning rounded-full flex-shrink-0"></span>
                  <span><strong className="text-warning">{articlesStockFaible}</strong> article{articlesStockFaible > 1 ? 's' : ''} en stock faible</span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Section Analyse de Rotation */}
      {statsRotation && (statsRotation.topVentes?.length > 0 || statsRotation.stockMort?.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-6">
          {/* Top Produits à Rotation Rapide */}
          {statsRotation.topVentes && statsRotation.topVentes.length > 0 && (
            <div className="bg-gradient-to-br from-success/5 via-card to-card border border-success/20 rounded-xl p-3 sm:p-4 lg:p-5 shadow-card">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-success/20 flex items-center justify-center flex-shrink-0">
                  <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-success" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-foreground">Top Produits à Forte Rotation</h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Articles les plus vendus</p>
                </div>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                {statsRotation.topVentes.slice(0, 5).map((article: any, index: number) => (
                  <div key={article.articleId} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-card border border-border rounded-lg hover:shadow-md transition-shadow">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] sm:text-xs font-bold text-success">#{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-foreground truncate">{article.nom}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        {article.totalVendu || 0} vendus (30j) • Stock: {article.stockActuel}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      <Flame className="w-3 h-3 sm:w-4 sm:h-4 text-success" />
                      <span className="text-xs sm:text-sm font-bold text-success whitespace-nowrap">
                        {article.tauxRotation !== 'N/A' ? parseFloat(article.tauxRotation).toFixed(1) : 'N/A'}×
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Produits Dormants */}
          {statsRotation.stockMort && statsRotation.stockMort.length > 0 && (
            <div className="bg-gradient-to-br from-warning/5 via-card to-card border border-warning/20 rounded-xl p-3 sm:p-4 lg:p-5 shadow-card">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-warning/20 flex items-center justify-center flex-shrink-0">
                  <Snowflake className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-warning" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-foreground">Stock à Rotation Lente</h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Articles avec faible rotation</p>
                </div>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                {statsRotation.stockMort.slice(0, 5).map((article: any) => (
                  <div key={article.articleId} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-card border border-border rounded-lg hover:shadow-md transition-shadow">
                    <Snowflake className="w-4 h-4 sm:w-5 sm:h-5 text-warning flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-foreground truncate">{article.nom}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        {article.joursCouverture || 0} jours couverture • Stock: {article.stockActuel}
                      </p>
                    </div>
                    <span className="text-[10px] sm:text-xs font-semibold text-warning whitespace-nowrap">
                      {formatPrix(article.valeurStock || 0)}
                    </span>
                  </div>
                ))}
              </div>

              {statsRotation.resume?.valeurStockImmobilise > 0 && (
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border">
                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Valeur immobilisée</p>
                  <p className="text-base sm:text-lg font-bold text-warning">{formatPrix(statsRotation.resume.valeurStockImmobilise)}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Statistiques du stock */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-card border border-border rounded-lg p-3 sm:p-4 shadow-card">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs text-muted-foreground">Articles Total</p>
              <p className="text-lg sm:text-xl font-bold text-foreground">{articles.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-3 sm:p-4 shadow-card">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] sm:text-xs text-muted-foreground">Valeur du Stock</p>
              <p className="text-base sm:text-lg font-bold text-foreground truncate">{formatPrix(valeurTotaleStock)}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-3 sm:p-4 shadow-card">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
              <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs text-muted-foreground">Stock Faible</p>
              <p className="text-lg sm:text-xl font-bold text-warning">{articlesStockFaible}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-3 sm:p-4 shadow-card">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs text-muted-foreground">Rupture/Critique</p>
              <p className="text-lg sm:text-xl font-bold text-destructive">{articlesEnRupture + articlesStockCritique}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 mb-4 sm:mb-6">
        {["A — Abayas", "B — Foulards", "C — Bazin", "D — Autres", "E — Sécurité"].map((zone, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-2 sm:p-3 text-center shadow-card">
            <p className="text-[10px] sm:text-xs text-muted-foreground">Zone</p>
            <p className="text-xs sm:text-sm font-semibold text-foreground">{zone}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Rechercher un article..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setSelectedCategorieId("all")}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              selectedCategorieId === "all" ? "gradient-gold text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            Tous
          </button>
          {categories.filter(c => c.actif).map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategorieId(c.id)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                selectedCategorieId === c.id ? "gradient-gold text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {c.nom}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="bg-secondary border-b border-border">
                <th className="text-left text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">Article</th>
                <th className="text-left text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden lg:table-cell">Catégorie</th>
                <th className="text-left text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">Zone</th>
                <th className="text-center text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">Stock</th>
                <th className="text-center text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">Seuil</th>
                <th className="text-center text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">Statut</th>
                <th className="text-center text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden lg:table-cell">Rotation</th>
                <th className="text-right text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden xl:table-cell">PMP</th>
                <th className="text-right text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden md:table-cell">Prix Vente</th>
                <th className="text-right text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden xl:table-cell">Valeur</th>
                <th className="text-center text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
          <tbody className="divide-y divide-border">
            {articles.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-6 py-12 text-center text-muted-foreground">
                  Aucun article trouvé
                </td>
              </tr>
            ) : (
              articles.map((item: any) => {
                const status = getStockStatus(item.stock, item.seuilAlerte);
                const rotationBadge = getRotationBadge(item.vitesseRotation, item.joursSansVente);
                return (
                  <tr key={item.id} className={`hover:bg-secondary/30 transition-colors ${
                    item.stock === 0 ? 'bg-destructive/5' : item.stock <= item.seuilAlerte * 0.3 ? 'bg-destructive/5' : ''
                  }`}>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center gap-2 min-w-[120px] sm:min-w-[150px]">
                        {item.stock === 0 && (
                          <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="w-4 h-4 text-destructive" />
                          </div>
                        )}
                        {item.stock > 0 && item.stock <= item.seuilAlerte && (
                          <AlertTriangle className={`w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 ${
                            item.stock <= item.seuilAlerte * 0.3 ? 'text-destructive' : 'text-warning'
                          }`} />
                        )}
                        <div>
                          <span className="text-xs sm:text-sm font-semibold text-foreground">{item.nom}</span>
                          {item.reference && <p className="text-[10px] text-muted-foreground">{item.reference}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">
                      <span className="text-xs text-muted-foreground">
                        {item.categorie?.nom || categories.find(c => c.id === item.categorieId)?.nom || '-'}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md bg-primary/10 text-primary text-[10px] sm:text-xs font-medium">
                        {item.zone}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex flex-col items-center gap-1 sm:gap-1.5">
                        <span className="text-sm sm:text-base font-bold text-foreground">{item.stock}</span>
                        <div className="w-16 sm:w-20 h-1.5 sm:h-2 rounded-full bg-secondary overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${
                            item.stock <= item.seuilAlerte * 0.3 ? "bg-destructive" : item.stock <= item.seuilAlerte ? "bg-warning" : "bg-primary"
                          }`} style={{ width: `${Math.min((item.stock / item.max) * 100, 100)}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm text-muted-foreground font-medium hidden sm:table-cell">{item.seuilAlerte}</td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                      <span className={`inline-flex items-center gap-1 text-[10px] sm:text-xs px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full font-bold ${status.color}`}>
                        {(() => {
                          const StatusIcon = status.icon;
                          return <StatusIcon className="w-3 h-3" />;
                        })()}
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-center hidden lg:table-cell">
                      {rotationBadge ? (
                        <div className="flex flex-col items-center gap-1">
                          <rotationBadge.icon className={`w-4 h-4 ${rotationBadge.color}`} />
                          <span className={`text-[10px] font-medium ${rotationBadge.color}`}>
                            {rotationBadge.label}
                          </span>
                          {item.tauxRotation && (
                            <span className="text-[10px] text-muted-foreground">
                              {item.tauxRotation.toFixed(1)}×
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-right hidden xl:table-cell">
                      <span className="text-xs sm:text-sm font-semibold text-muted-foreground">
                        {item.prixAchat ? formatPrix(item.prixAchat) : '-'}
                      </span>
                      {item.prixAchat && item.prixVente && (
                        <p className="text-[10px] text-success">
                          +{calculerMargeTheorique(item.prixVente, item.prixAchat).toFixed(0)}%
                        </p>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-bold text-foreground hidden md:table-cell">{formatPrix(item.prixVente)}</td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-right hidden xl:table-cell">
                      <span className="text-xs sm:text-sm font-bold text-primary">
                        {item.prixAchat ? formatPrix(calculerValeurArticle(item.stock, item.prixAchat)) : '-'}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="text-muted-foreground hover:text-foreground transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setHistoryArticleId(item.id)}>
                            <History className="w-4 h-4 mr-2" />
                            Voir historique
                          </DropdownMenuItem>
                          <CanAccess permissions={['stock.update']}>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEdit(item)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                          </CanAccess>
                          <CanAccess permissions={['stock.delete']}>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeleteId(item.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash className="w-4 h-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </CanAccess>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>

        {/* Pagination */}
        {meta && (
          <Pagination meta={meta} onPageChange={setPage} />
        )}
      </div>
    </AppLayout>
  );
};

export default Stock;
