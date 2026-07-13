import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import StockForm from "@/components/StockForm";
import StockMobileCard from "@/components/StockMobileCard";
import ArticleCard from "@/components/ArticleCard";
import Pagination from "@/components/Pagination";
import CanAccess from "@/components/CanAccess";
import { Package, AlertTriangle, Search, Plus, Edit, Trash, MoreVertical, AlertCircle, TrendingDown, History, ArrowUpCircle, ArrowDownCircle, Flame, Zap, Clock, Snail, Snowflake, TrendingUp as TrendUp, RotateCcw, Upload, ShoppingCart, BarChart3 } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPhotoUrl } from "@/lib/api-client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { Button } from "@/components/ui/button";
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
import { useStock, useStockStats, useArticleStats, useCreateArticle, useUpdateArticle, useDeleteArticle, useCreateBulkArticles } from "@/hooks/useStock";
import BulkArticleForm from "@/components/BulkArticleForm";
import ExcelImportDialog from "@/components/ExcelImportDialog";
import { useCategoriesActive } from "@/hooks/useCategories";
import { useZonesActive } from "@/hooks/useZones";
import { useDebounce } from "@/hooks/useDebounce";

const Stock = () => {
  const [selectedCategorieId, setSelectedCategorieId] = useState<string>("all");
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 800);
  // Vérifier si on doit rouvrir le formulaire après un rechargement (capture photo mobile)
  const [formOpen, setFormOpen] = useState(false);
  const [bulkFormOpen, setBulkFormOpen] = useState(() => {
    // Si on restaure depuis sessionStorage, ouvrir le formulaire bulk (création)
    return sessionStorage.getItem('bulkArticleFormState') !== null;
  });
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [historyArticleId, setHistoryArticleId] = useState<string | null>(null);
  const [rotationDialogOpen, setRotationDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ url: string; nom: string } | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20); // Par défaut 20 articles pour meilleure UX
  const [historyPage, setHistoryPage] = useState(1);
  const [historyLimit] = useState(10);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Hooks React Query avec filtres backend et recherche débouncée
  const { data: stockResponse, isLoading, isFetching } = useStock({
    page,
    limit,
    search: debouncedSearch || undefined,
    categorieId: selectedCategorieId !== "all" ? selectedCategorieId : undefined,
  });
  const articles = stockResponse?.data || [];
  const meta = stockResponse?.meta;
  const { data: categories = [], isLoading: loadingCategories } = useCategoriesActive();
  const { data: zones = [], isLoading: loadingZones } = useZonesActive();
  const { data: stockStats } = useStockStats();
  const createArticle = useCreateArticle();
  const updateArticle = useUpdateArticle();
  const deleteArticle = useDeleteArticle();
  const createBulkArticles = useCreateBulkArticles();

  // Historique mouvements
  const { data: mouvementsResponse } = useMouvementsByArticle(historyArticleId || '', { page: historyPage, limit: historyLimit });
  const mouvements = mouvementsResponse?.data || [];
  const mouvementsMeta = mouvementsResponse?.meta;
  const articleEnCours = articles.find((a: any) => a.id === historyArticleId);

  // Statistiques de l'article sélectionné (depuis backend)
  const { data: articleStats } = useArticleStats(historyArticleId);

  // Statistiques de rotation
  const { data: statsRotation } = useStatsRotation();

  // Reset pagination historique quand on ouvre le dialog
  useEffect(() => {
    if (historyArticleId) {
      setHistoryPage(1);
    }
  }, [historyArticleId]);

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleSell = (item: any) => {
    // Naviguer vers la page ventes avec l'article pré-sélectionné
    navigate('/ventes', {
      state: {
        preselectedArticle: {
          id: item.id,
          nom: item.nom,
          prixVente: item.prixVente,
          prixAchat: item.prixAchat,
          stock: item.stock
        }
      }
    });
  };

  const handleSubmit = (data: any) => {
    // Extraire la photo si présente
    const { photo, ...articleData } = data;

    if (editingItem) {
      // Mode édition
      updateArticle.mutate({ id: editingItem.id, data: articleData, photo });
    } else {
      // Mode création
      createArticle.mutate({ data: articleData, photo });
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

  const handleBulkSubmit = (articles: any[], photos: (File | null)[]) => {
    createBulkArticles.mutate({ articles, photos });
  };

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingItem(null);
    }
  };

  // Réinitialiser la page quand les filtres ou la limite changent
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedCategorieId, limit]);

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

  // Afficher spinner pleine page SEULEMENT au premier chargement (pas de données)
  if (isLoading && !articles.length) {
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <PageHeader
          title="Gestion du Stock"
          description="Gestion des articles en stock"
        />
        <CanAccess permissions={['stock.create']}>
          <div className="flex gap-2">
            <Button
              onClick={() => setImportDialogOpen(true)}
              variant="outline"
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              Import
            </Button>
            <Button
              onClick={() => setBulkFormOpen(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Ajouter
            </Button>
          </div>
        </CanAccess>
      </div>

      {/* Formulaire d'ajout multiple */}
      <BulkArticleForm
        open={bulkFormOpen}
        onOpenChange={setBulkFormOpen}
        onSubmit={handleBulkSubmit}
      />

      {/* Dialog Import Excel */}
      <ExcelImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onSuccess={() => {
          setImportDialogOpen(false);
          setPage(1);
        }}
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
      {isMobile ? (
        <Sheet open={historyArticleId !== null} onOpenChange={() => setHistoryArticleId(null)}>
          <SheetContent side="bottom" className="h-[85vh] p-0 flex flex-col">
            {/* Header mobile */}
            <div className="px-4 py-4 border-b flex-shrink-0">
              <div className="flex items-start justify-between gap-3 mb-1 pr-8">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <History className="w-5 h-5 text-primary shrink-0" />
                  <h2 className="font-heading text-base font-bold">Historique</h2>
                </div>
              </div>
              {articleEnCours && (
                <p className="text-xs text-muted-foreground pr-8">
                  {articleEnCours.nom} — Stock actuel: <strong>{articleEnCours.stock}</strong>
                </p>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              {/* Statistiques principales de l'article */}
              {articleStats && (
                <>
                  {/* Cartes principales - Grid 2 colonnes */}
                  <div className="grid grid-cols-2 gap-2.5 mb-3">
                    {/* Stock actuel */}
                    <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-2 border-blue-500/20 rounded-lg p-2.5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="w-6 h-6 rounded-md bg-blue-500/20 flex items-center justify-center shrink-0">
                          <Package className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 leading-tight">Stock<br/>Restant</span>
                      </div>
                      <p className="text-xl font-black text-blue-600 dark:text-blue-400 text-right">{articleStats.stockActuel}</p>
                    </div>

                    {/* Total vendu */}
                    <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-2 border-green-500/20 rounded-lg p-2.5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="w-6 h-6 rounded-md bg-green-500/20 flex items-center justify-center shrink-0">
                          <TrendUp className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-[10px] font-bold text-green-700 dark:text-green-300 leading-tight">Total<br/>Vendu</span>
                      </div>
                      <p className="text-xl font-black text-green-600 dark:text-green-400 text-right">{articleStats.totalVendu}</p>
                    </div>

                    {/* Total approvisionné */}
                    <div className="bg-gradient-to-br from-violet-500/10 to-violet-500/5 border-2 border-violet-500/20 rounded-lg p-2.5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="w-6 h-6 rounded-md bg-violet-500/20 flex items-center justify-center shrink-0">
                          <ArrowUpCircle className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                        </div>
                        <span className="text-[10px] font-bold text-violet-700 dark:text-violet-300 leading-tight">Total<br/>Appro.</span>
                      </div>
                      <p className="text-xl font-black text-violet-600 dark:text-violet-400 text-right">{articleStats.totalApprovisionne}</p>
                    </div>

                    {/* Retours clients */}
                    {articleStats.totalRetoursClients > 0 && (
                      <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-2 border-orange-500/20 rounded-lg p-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <div className="w-6 h-6 rounded-md bg-orange-500/20 flex items-center justify-center shrink-0">
                            <RotateCcw className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                          </div>
                          <span className="text-[10px] font-bold text-orange-700 dark:text-orange-300 leading-tight">Retours<br/>Clients</span>
                        </div>
                        <p className="text-xl font-black text-orange-600 dark:text-orange-400 text-right">{articleStats.totalRetoursClients}</p>
                      </div>
                    )}
                  </div>

                  {/* Section Mouvements - Compact */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 border border-border rounded-lg p-2.5 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Mouvements</span>
                      <TrendingDown className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {/* Entrées */}
                      <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-md p-2 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <ArrowUpCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">Entrées</span>
                        </div>
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{articleStats.totalEntrees}</span>
                      </div>
                      {/* Sorties */}
                      <div className="bg-red-50 dark:bg-red-950/30 rounded-md p-2 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <ArrowDownCircle className="w-3 h-3 text-red-600 dark:text-red-400" />
                          <span className="text-[10px] font-semibold text-red-700 dark:text-red-400">Sorties</span>
                        </div>
                        <span className="text-sm font-black text-red-600 dark:text-red-400">{articleStats.totalSorties}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {mouvements.length === 0 ? (
            <div className="text-center py-12 md:py-8">
              <Package className="w-16 h-16 md:w-12 md:h-12 text-muted-foreground mx-auto mb-3 md:mb-2 opacity-30" />
              <p className="text-sm md:text-xs text-muted-foreground font-medium">Aucun mouvement enregistré</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Les mouvements s'afficheront ici</p>
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

              {/* Pagination si nécessaire */}
              {mouvementsMeta && mouvementsMeta.totalPages > 1 && (
                <div className="mt-4 pt-4 border-t">
                  <Pagination
                    meta={mouvementsMeta}
                    onPageChange={setHistoryPage}
                  />
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={historyArticleId !== null} onOpenChange={() => setHistoryArticleId(null)}>
          <DialogContent className="max-w-[95vw] sm:max-w-2xl h-[80vh] flex flex-col p-0">
            <DialogHeader className="p-6 pb-4 flex-shrink-0">
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

            <div className="flex-1 overflow-y-auto min-h-0 px-6 pb-6">
              {/* Statistiques principales de l'article */}
              {articleStats && (
                <>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {/* Stock actuel */}
                    <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-2 border-blue-500/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center">
                          <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Stock Restant</span>
                      </div>
                      <p className="text-3xl font-black text-blue-600 dark:text-blue-400 ml-11">{articleStats.stockActuel}</p>
                      <p className="text-xs text-blue-600/60 dark:text-blue-400/60 ml-11 mt-1">unités disponibles</p>
                    </div>

                    {/* Total vendu */}
                    <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-2 border-green-500/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-9 h-9 rounded-lg bg-green-500/20 flex items-center justify-center">
                          <TrendUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-sm font-semibold text-green-700 dark:text-green-300">Total Vendu</span>
                      </div>
                      <p className="text-3xl font-black text-green-600 dark:text-green-400 ml-11">{articleStats.totalVendu}</p>
                      <p className="text-xs text-green-600/60 dark:text-green-400/60 ml-11 mt-1">unités vendues</p>
                    </div>

                    {/* Total approvisionné */}
                    <div className="bg-gradient-to-br from-violet-500/10 to-violet-500/5 border-2 border-violet-500/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-9 h-9 rounded-lg bg-violet-500/20 flex items-center justify-center">
                          <ArrowUpCircle className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                        </div>
                        <span className="text-sm font-semibold text-violet-700 dark:text-violet-300">Total Approvisionné</span>
                      </div>
                      <p className="text-3xl font-black text-violet-600 dark:text-violet-400 ml-11">{articleStats.totalApprovisionne}</p>
                      <p className="text-xs text-violet-600/60 dark:text-violet-400/60 ml-11 mt-1">unités reçues</p>
                    </div>
                  </div>

                  {/* Ligne 2: Retours et Mouvements */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {/* Retours clients */}
                    {articleStats.totalRetoursClients > 0 ? (
                      <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-2 border-orange-500/20 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-9 h-9 rounded-lg bg-orange-500/20 flex items-center justify-center">
                            <RotateCcw className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                          </div>
                          <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">Retours Clients</span>
                        </div>
                        <p className="text-3xl font-black text-orange-600 dark:text-orange-400 ml-11">{articleStats.totalRetoursClients}</p>
                        <p className="text-xs text-orange-600/60 dark:text-orange-400/60 ml-11 mt-1">unités retournées</p>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-br from-gray-500/5 to-gray-500/5 border border-border rounded-xl p-4 flex items-center justify-center">
                        <p className="text-xs text-muted-foreground">Aucun retour client</p>
                      </div>
                    )}

                    {/* Total Entrées */}
                    <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                          <ArrowUpCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Total Entrées</span>
                      </div>
                      <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 ml-11">{articleStats.totalEntrees}</p>
                      <p className="text-xs text-emerald-600/60 dark:text-emerald-400/60 ml-11 mt-1">mouvements d'entrée</p>
                    </div>

                    {/* Total Sorties */}
                    <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-9 h-9 rounded-lg bg-red-500/20 flex items-center justify-center">
                          <ArrowDownCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <span className="text-sm font-semibold text-red-700 dark:text-red-300">Total Sorties</span>
                      </div>
                      <p className="text-3xl font-black text-red-600 dark:text-red-400 ml-11">{articleStats.totalSorties}</p>
                      <p className="text-xs text-red-600/60 dark:text-red-400/60 ml-11 mt-1">mouvements de sortie</p>
                    </div>
                  </div>
                </>
              )}

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

              {/* Pagination si nécessaire */}
              {mouvementsMeta && mouvementsMeta.totalPages > 1 && (
                <div className="mt-4 pt-4 border-t">
                  <Pagination
                    meta={mouvementsMeta}
                    onPageChange={setHistoryPage}
                  />
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog Visualisation Photo */}
      {isMobile ? (
        // Lightbox mobile plein écran - Style moderne naturel
        selectedImage && (
          <div
            className="fixed inset-0 z-50 bg-black animate-in fade-in duration-200"
            onClick={() => setSelectedImage(null)}
          >
            {/* Titre en overlay - Top */}
            <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-4 pt-8">
              <h3 className="text-base font-semibold text-white truncate">
                {selectedImage.nom}
              </h3>
            </div>

            {/* Image - Tap pour fermer, support pinch-to-zoom */}
            <div className="flex items-center justify-center h-full w-full p-4">
              <img
                src={selectedImage.url}
                alt={selectedImage.nom}
                className="max-w-full max-h-full object-contain select-none"
                style={{ touchAction: 'pinch-zoom' }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Indicateur de fermeture - Bottom */}
            <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-6 pb-8">
              <div className="flex items-center justify-center">
                <div className="text-white/60 text-sm flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Touchez pour fermer
                </div>
              </div>
            </div>
          </div>
        )
      ) : (
        <Dialog open={selectedImage !== null} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-[95vw] sm:max-w-4xl h-[95vh] p-0 overflow-hidden bg-background/95 backdrop-blur-sm border-2">
            <DialogHeader className="sr-only">
              <DialogTitle>{selectedImage?.nom || 'Photo de l\'article'}</DialogTitle>
            </DialogHeader>
            <div className="relative">
              {/* Header avec nom de l'article */}
              {selectedImage && (
                <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-background/90 to-transparent p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground truncate">
                    {selectedImage.nom}
                  </h3>
                </div>
              )}

              {/* Image */}
              {selectedImage && (
                <div className="flex items-center justify-center min-h-[50vh] max-h-[85vh] p-4 sm:p-8 pt-16 sm:pt-20">
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.nom}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                  />
                </div>
              )}

              {/* Bouton de fermeture personnalisé */}
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-background/80 hover:bg-background border-2 border-border flex items-center justify-center transition-all hover:scale-110 shadow-lg z-20"
                aria-label="Fermer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-foreground"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}

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

      {/* Bouton Analyse de Rotation */}
      {statsRotation && (statsRotation.topVentes?.length > 0 || statsRotation.stockMort?.length > 0) && (
        <div className="mb-4 sm:mb-6">
          <Button
            onClick={() => setRotationDialogOpen(true)}
            variant="outline"
            className="w-full sm:w-auto gap-2 h-12 sm:h-10 bg-gradient-to-r from-success/5 via-card to-warning/5 border-2 border-primary/20 hover:border-primary/40 hover:shadow-lg transition-all"
          >
            <BarChart3 className="w-5 h-5 text-primary" />
            <span className="font-semibold">Analyse de Rotation</span>
            <div className="flex items-center gap-1 ml-2">
              {statsRotation.topVentes?.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-success/20 text-success text-xs font-bold">
                  {statsRotation.topVentes.length}
                </span>
              )}
              {statsRotation.stockMort?.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-warning/20 text-warning text-xs font-bold">
                  {statsRotation.stockMort.length}
                </span>
              )}
            </div>
          </Button>
        </div>
      )}

      {/* Modal Analyse de Rotation */}
      {isMobile ? (
        <Sheet open={rotationDialogOpen} onOpenChange={setRotationDialogOpen}>
          <SheetContent side="bottom" className="h-[90vh] p-0 flex flex-col">
            {/* Header */}
            <div className="px-4 py-4 border-b bg-gradient-to-r from-primary/10 via-primary/5 to-transparent flex-shrink-0">
              <div className="flex items-center gap-3 pr-8">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
                  <BarChart3 className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-base font-bold">Analyse de Rotation</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Performance des articles (30 jours)</p>
                </div>
              </div>
            </div>

            {/* Contenu avec Tabs */}
            <div className="flex-1 overflow-hidden">
              <Tabs defaultValue="top" className="h-full flex flex-col">
                <TabsList className="w-full justify-start px-4 pt-3 pb-0 bg-transparent gap-2 flex-shrink-0">
                  <TabsTrigger
                    value="top"
                    className="flex-1 data-[state=active]:bg-success/20 data-[state=active]:text-success data-[state=active]:border-success/50 border-2 border-transparent rounded-xl py-3 gap-2"
                  >
                    <Flame className="w-4 h-4" />
                    <span className="font-semibold">Forte Rotation</span>
                    {statsRotation?.topVentes?.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-success/30 text-[10px] font-bold">
                        {statsRotation.topVentes.length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="slow"
                    className="flex-1 data-[state=active]:bg-warning/20 data-[state=active]:text-warning data-[state=active]:border-warning/50 border-2 border-transparent rounded-xl py-3 gap-2"
                  >
                    <Snowflake className="w-4 h-4" />
                    <span className="font-semibold">Rotation Lente</span>
                    {statsRotation?.stockMort?.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-warning/30 text-[10px] font-bold">
                        {statsRotation.stockMort.length}
                      </span>
                    )}
                  </TabsTrigger>
                </TabsList>

                {/* Top Ventes */}
                <TabsContent value="top" className="flex-1 overflow-y-auto px-4 py-4 mt-0">
                  {statsRotation?.topVentes && statsRotation.topVentes.length > 0 ? (
                    <div className="space-y-3">
                      {statsRotation.topVentes.map((article: any, index: number) => (
                        <div
                          key={article.articleId}
                          className="flex items-center gap-3 p-3 bg-gradient-to-r from-success/5 to-transparent border border-success/20 rounded-xl"
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-success to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                            <span className="text-sm font-black text-white">#{index + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-foreground truncate">{article.nom}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground">
                                <strong className="text-success">{article.totalVendu || 0}</strong> vendus
                              </span>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">
                                Stock: <strong>{article.stockActuel}</strong>
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 justify-end">
                              <Flame className="w-4 h-4 text-success" />
                              <span className="text-lg font-black text-success">
                                {article.tauxRotation !== 'N/A' ? parseFloat(article.tauxRotation).toFixed(1) : 'N/A'}×
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground">taux rotation</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Flame className="w-12 h-12 text-muted-foreground/30 mb-3" />
                      <p className="text-sm text-muted-foreground">Aucun article à forte rotation</p>
                    </div>
                  )}
                </TabsContent>

                {/* Stock Lent */}
                <TabsContent value="slow" className="flex-1 overflow-y-auto px-4 py-4 mt-0">
                  {statsRotation?.stockMort && statsRotation.stockMort.length > 0 ? (
                    <>
                      {/* Résumé valeur immobilisée */}
                      {statsRotation.resume?.valeurStockImmobilise > 0 && (
                        <div className="mb-4 p-4 bg-gradient-to-r from-warning/10 to-orange-500/5 border-2 border-warning/30 rounded-xl">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-medium text-muted-foreground">Valeur immobilisée</p>
                              <p className="text-xl font-black text-warning">{formatPrix(statsRotation.resume.valeurStockImmobilise)}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center">
                              <Snowflake className="w-6 h-6 text-warning" />
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-3">
                        {statsRotation.stockMort.map((article: any, index: number) => (
                          <div
                            key={article.articleId}
                            className="flex items-center gap-3 p-3 bg-gradient-to-r from-warning/5 to-transparent border border-warning/20 rounded-xl"
                          >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-warning to-orange-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                              <Snowflake className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-foreground truncate">{article.nom}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-muted-foreground">
                                  <strong className="text-warning">{article.joursCouverture || 0}</strong> jours
                                </span>
                                <span className="text-muted-foreground">•</span>
                                <span className="text-xs text-muted-foreground">
                                  Stock: <strong>{article.stockActuel}</strong>
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-warning">{formatPrix(article.valeurStock || 0)}</p>
                              <p className="text-[10px] text-muted-foreground">immobilisé</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Snowflake className="w-12 h-12 text-muted-foreground/30 mb-3" />
                      <p className="text-sm text-muted-foreground">Aucun article à rotation lente</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={rotationDialogOpen} onOpenChange={setRotationDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 gap-0">
            <DialogHeader className="px-6 py-5 border-b bg-gradient-to-r from-primary/10 via-primary/5 to-transparent flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
                  <BarChart3 className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold">Analyse de Rotation du Stock</DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground mt-1">
                    Performance des articles sur les 30 derniers jours
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {/* Contenu avec Tabs */}
            <div className="flex-1 overflow-hidden">
              <Tabs defaultValue="top" className="h-full flex flex-col">
                <TabsList className="w-full justify-start px-6 pt-4 pb-0 bg-transparent gap-3 flex-shrink-0">
                  <TabsTrigger
                    value="top"
                    className="data-[state=active]:bg-success/20 data-[state=active]:text-success data-[state=active]:border-success/50 border-2 border-transparent rounded-xl px-6 py-3 gap-2"
                  >
                    <Flame className="w-4 h-4" />
                    <span className="font-semibold">Forte Rotation</span>
                    {statsRotation?.topVentes?.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-success/30 text-xs font-bold">
                        {statsRotation.topVentes.length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="slow"
                    className="data-[state=active]:bg-warning/20 data-[state=active]:text-warning data-[state=active]:border-warning/50 border-2 border-transparent rounded-xl px-6 py-3 gap-2"
                  >
                    <Snowflake className="w-4 h-4" />
                    <span className="font-semibold">Rotation Lente</span>
                    {statsRotation?.stockMort?.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-warning/30 text-xs font-bold">
                        {statsRotation.stockMort.length}
                      </span>
                    )}
                  </TabsTrigger>
                </TabsList>

                {/* Top Ventes Desktop */}
                <TabsContent value="top" className="flex-1 overflow-y-auto px-6 py-4 mt-0">
                  {statsRotation?.topVentes && statsRotation.topVentes.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      {statsRotation.topVentes.map((article: any, index: number) => (
                        <div
                          key={article.articleId}
                          className="flex items-center gap-4 p-4 bg-gradient-to-r from-success/5 to-transparent border border-success/20 rounded-xl hover:shadow-lg hover:border-success/40 transition-all"
                        >
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-success to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                            <span className="text-lg font-black text-white">#{index + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-foreground truncate">{article.nom}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-muted-foreground">
                                <strong className="text-success">{article.totalVendu || 0}</strong> vendus (30j)
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Stock: <strong>{article.stockActuel}</strong>
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 justify-end">
                              <Flame className="w-5 h-5 text-success" />
                              <span className="text-xl font-black text-success">
                                {article.tauxRotation !== 'N/A' ? parseFloat(article.tauxRotation).toFixed(1) : 'N/A'}×
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">taux rotation</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <Flame className="w-16 h-16 text-muted-foreground/30 mb-4" />
                      <p className="text-muted-foreground">Aucun article à forte rotation</p>
                    </div>
                  )}
                </TabsContent>

                {/* Stock Lent Desktop */}
                <TabsContent value="slow" className="flex-1 overflow-y-auto px-6 py-4 mt-0">
                  {statsRotation?.stockMort && statsRotation.stockMort.length > 0 ? (
                    <>
                      {/* Résumé valeur immobilisée */}
                      {statsRotation.resume?.valeurStockImmobilise > 0 && (
                        <div className="mb-5 p-5 bg-gradient-to-r from-warning/10 to-orange-500/5 border-2 border-warning/30 rounded-xl">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Valeur totale immobilisée</p>
                              <p className="text-2xl font-black text-warning mt-1">{formatPrix(statsRotation.resume.valeurStockImmobilise)}</p>
                            </div>
                            <div className="w-14 h-14 rounded-full bg-warning/20 flex items-center justify-center">
                              <Snowflake className="w-7 h-7 text-warning" />
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {statsRotation.stockMort.map((article: any) => (
                          <div
                            key={article.articleId}
                            className="flex items-center gap-4 p-4 bg-gradient-to-r from-warning/5 to-transparent border border-warning/20 rounded-xl hover:shadow-lg hover:border-warning/40 transition-all"
                          >
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-warning to-orange-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                              <Snowflake className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-foreground truncate">{article.nom}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-muted-foreground">
                                  <strong className="text-warning">{article.joursCouverture || 0}</strong> jours couverture
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  Stock: <strong>{article.stockActuel}</strong>
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-base font-bold text-warning">{formatPrix(article.valeurStock || 0)}</p>
                              <p className="text-xs text-muted-foreground">immobilisé</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <Snowflake className="w-16 h-16 text-muted-foreground/30 mb-4" />
                      <p className="text-muted-foreground">Aucun article à rotation lente</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Statistiques du stock */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
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

      {/* Zones - Cachées sur mobile */}
      {zones.length > 0 && (
        <div className="hidden md:grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 mb-4 sm:mb-6">
          {zones.map((zone: any) => (
            <div key={zone.id} className="bg-card border border-border rounded-lg p-2 sm:p-3 text-center shadow-card">
              <p className="text-[10px] sm:text-xs text-muted-foreground">Zone</p>
              <p className="text-xs sm:text-sm font-semibold text-foreground truncate" title={`${zone.code} — ${zone.nom}`}>
                {zone.code} — {zone.nom}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher un article..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <div className="sm:w-64">
          <select
            value={selectedCategorieId}
            onChange={(e) => setSelectedCategorieId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 cursor-pointer"
          >
            <option value="all">Toutes les catégories</option>
            {categories.filter(c => c.actif).map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grille d'articles - Style Facebook Feed */}
      <div className="mb-6">
        {/* Indicateur de chargement */}
        {isFetching && (
          <div className="h-1 bg-primary/20 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-primary w-1/3 animate-pulse" />
          </div>
        )}

        {/* Grille responsive: 1 col mobile, 2 cols tablet, 3 cols desktop */}
        {articles.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-xl border border-border">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-sm text-muted-foreground">Aucun article trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {articles.map((item: any) => (
              <ArticleCard
                key={item.id}
                article={{
                  ...item,
                  categorieNom: item.categorie?.nom || categories.find(c => c.id === item.categorieId)?.nom || '-'
                }}
                formatPrix={formatPrix}
                getStockStatus={getStockStatus}
                onEdit={handleEdit}
                onDelete={setDeleteId}
                onViewHistory={setHistoryArticleId}
                onSell={handleSell}
                onViewPhoto={(photo, nom) => setSelectedImage({ url: getPhotoUrl(photo) || '', nom })}
              />
            ))}
          </div>
        )}
      </div>

      {/* Ancien tableau Desktop caché - À supprimer plus tard si tout fonctionne */}
      <div className="hidden">
      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden relative">
        {/* Indicateur de chargement subtil pendant le refetch */}
        {isFetching && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary/20 overflow-hidden z-10">
            <div className="h-full bg-primary w-1/3 animate-pulse" />
          </div>
        )}
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
                      <div className="flex items-center gap-2 sm:gap-3 min-w-[120px] sm:min-w-[200px]">
                        {/* Photo miniature */}
                        <div
                          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg border border-border overflow-hidden bg-muted/50 flex-shrink-0 transition-all ${
                            item.photo ? 'cursor-pointer hover:border-primary hover:shadow-md hover:scale-105' : ''
                          }`}
                          onClick={() => {
                            if (item.photo) {
                              setSelectedImage({
                                url: getPhotoUrl(item.photo) || '',
                                nom: item.nom
                              });
                            }
                          }}
                        >
                          {item.photo ? (
                            <img
                              src={getPhotoUrl(item.photo) || ''}
                              alt={item.nom}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.currentTarget;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.classList.add('flex', 'items-center', 'justify-center');
                                  const icon = document.createElement('div');
                                  icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" x2="12" y1="22.08" y2="12"/></svg>';
                                  parent.appendChild(icon.firstChild!);
                                }
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        {/* Alert icons et nom */}
                        <div className="flex items-center gap-2 flex-1 min-w-0">
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
                          <div className="min-w-0">
                            <span className="text-xs sm:text-sm font-semibold text-foreground block truncate">{item.nom}</span>
                            {item.reference && <p className="text-[10px] text-muted-foreground truncate">{item.reference}</p>}
                          </div>
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
                          }`} style={{ width: `${Math.min((item.stock / (item.seuilAlerte * 3)) * 100, 100)}%` }} />
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
                          <button className="text-muted-foreground hover:text-foreground transition-all active:scale-95">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <CanAccess permissions={['ventes.create']}>
                            <DropdownMenuItem
                              onClick={() => handleSell(item)}
                              className="text-primary focus:text-primary"
                            >
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              Vendre
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </CanAccess>
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
      </div>
      </div>

      {/* Pagination partagée - Optimisée pour grands datasets */}
      {meta && (
        <div className="mt-6">
          <Pagination
            meta={meta}
            onPageChange={setPage}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1); // Retour à la première page quand on change la taille
            }}
            showPageSizeSelector={true}
            pageSizeOptions={[10, 20, 50, 100]}
          />
        </div>
      )}
    </AppLayout>
  );
};

export default Stock;
