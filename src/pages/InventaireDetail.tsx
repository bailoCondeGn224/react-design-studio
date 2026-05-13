import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  Search,
  Check,
  X,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import Pagination from '@/components/Pagination';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useInventaire, useAddComptage } from '@/hooks/useInventaires';
import { useStock } from '@/hooks/useStock';
import { useCategoriesActive } from '@/hooks/useCategories';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import ValiderInventaireDialog from '@/components/inventaires/ValiderInventaireDialog';
import FinancesSummary from '@/components/inventaires/FinancesSummary';
import { Article, ComptageInventaire } from '@/types';

export default function InventaireDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: inventaire, isLoading } = useInventaire(id || null);
  const { data: stockResponse, isLoading: loadingStock } = useStock({ page: 1, limit: 100 }); // Limite max du backend
  const { data: categories = [] } = useCategoriesActive();
  const addComptageMutation = useAddComptage();

  // Filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategorie, setSelectedCategorie] = useState<string>('all');
  const [filterStatut, setFilterStatut] = useState<string>('all'); // all, compté, non-compté
  const [filterEcart, setFilterEcart] = useState<string>('all'); // all, avec-ecart, sans-ecart

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(50);

  // Dialog
  const [validerDialogOpen, setValiderDialogOpen] = useState(false);

  // Saisie rapide
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [quantiteInput, setQuantiteInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const getComptageForArticle = (articleId: string): ComptageInventaire | undefined => {
    return inventaire?.comptages?.find((c) => c.articleId === articleId);
  };

  const isArticleCompte = (articleId: string): boolean => {
    return inventaire?.comptages?.some((c) => c.articleId === articleId) || false;
  };

  // Filtrage des articles
  const filteredArticles = stockResponse?.data?.filter((article: Article) => {
    // Recherche
    if (searchQuery && !article.nom.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Catégorie
    if (selectedCategorie !== 'all' && article.categorieId !== selectedCategorie) {
      return false;
    }

    // Statut (compté/non compté)
    const isCompte = isArticleCompte(article.id);
    if (filterStatut === 'compté' && !isCompte) return false;
    if (filterStatut === 'non-compté' && isCompte) return false;

    // Écart
    if (filterEcart !== 'all' && isCompte) {
      const comptage = getComptageForArticle(article.id);
      if (filterEcart === 'avec-ecart' && comptage?.ecart === 0) return false;
      if (filterEcart === 'sans-ecart' && comptage?.ecart !== 0) return false;
    }

    return true;
  }) || [];

  // Pagination
  const totalPages = Math.ceil(filteredArticles.length / limit);
  const paginatedArticles = filteredArticles.slice((page - 1) * limit, page * limit);
  const meta = {
    page: page,
    totalPages,
    total: filteredArticles.length,
    limit: limit,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };

  // Focus automatique sur l'input
  useEffect(() => {
    if (editingArticleId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingArticleId]);

  // Reset pagination quand les filtres changent
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedCategorie, filterStatut, filterEcart]);

  const handleStartEdit = (article: Article) => {
    if (isArticleCompte(article.id)) return;
    setEditingArticleId(article.id);
    setQuantiteInput(article.stock.toString());
  };

  const handleSaveComptage = async (article: Article) => {
    const quantite = parseInt(quantiteInput);
    if (isNaN(quantite) || quantite < 0) return;

    try {
      await addComptageMutation.mutateAsync({
        inventaireId: inventaire!.id,
        data: {
          articleId: article.id,
          quantiteComptee: quantite,
        },
      });
      setEditingArticleId(null);
      setQuantiteInput('');
    } catch (error) {
      // Erreur gérée par le hook
    }
  };

  const handleCancelEdit = () => {
    setEditingArticleId(null);
    setQuantiteInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent, article: Article) => {
    if (e.key === 'Enter') {
      handleSaveComptage(article);
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const getEcartColor = (ecart: number) => {
    if (ecart === 0) return 'text-success';
    if (Math.abs(ecart) <= 2) return 'text-warning';
    return 'text-destructive';
  };

  const progressPercent =
    inventaire && inventaire.totalArticles > 0
      ? (inventaire.articlesComptes / inventaire.totalArticles) * 100
      : 0;

  if (isLoading || loadingStock) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">
              {isLoading ? 'Chargement de l\'inventaire...' : 'Chargement des articles...'}
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!inventaire) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <Package className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Inventaire non trouvé</p>
          <Button onClick={() => navigate('/inventaires')} className="mt-4">
            Retour aux inventaires
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title={inventaire.note || 'Inventaire'}
        description={`${format(new Date(inventaire.date), 'dd MMMM yyyy', { locale: fr })} — Responsable: ${inventaire.responsableNom}`}
        backButton
        backTo="/inventaires"
        action={
          inventaire.statut === 'EN_COURS' ? (
            <Badge variant="secondary" className="text-base px-4 py-2">
              <Clock className="w-4 h-4 mr-2" />
              En cours
            </Badge>
          ) : (
            <Badge variant="default" className="bg-success text-base px-4 py-2">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Terminé
            </Badge>
          )
        }
      />

      {/* Statistiques compactes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-card border border-border rounded-lg p-3 sm:p-4 shadow-card">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs text-muted-foreground">Articles Comptés</p>
              <p className="text-lg sm:text-xl font-bold text-foreground">
                {inventaire.articlesComptes} / {inventaire.totalArticles}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-3 sm:p-4 shadow-card">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs text-muted-foreground">Avec Écarts</p>
              <p className="text-lg sm:text-xl font-bold text-warning">
                {inventaire.articlesAvecEcarts}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-3 sm:p-4 shadow-card">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs text-muted-foreground">Progression</p>
              <p className="text-lg sm:text-xl font-bold text-foreground">
                {Math.round(progressPercent)}%
              </p>
            </div>
          </div>
          <div className="w-full bg-secondary rounded-full h-2 mt-2">
            <div
              className="bg-success h-2 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-3 sm:p-4 shadow-card">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
              <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs text-muted-foreground">Restants</p>
              <p className="text-lg sm:text-xl font-bold text-foreground">
                {inventaire.totalArticles - inventaire.articlesComptes}
              </p>
            </div>
          </div>
          {inventaire.statut === 'EN_COURS' &&
            inventaire.articlesComptes === inventaire.totalArticles && (
              <Button
                size="sm"
                className="w-full mt-2"
                onClick={() => setValiderDialogOpen(true)}
              >
                Valider l'inventaire
              </Button>
            )}
        </div>
      </div>

      {/* Vue pour inventaire TERMINE */}
      {inventaire.statut === 'TERMINE' && (
        <>
          {/* Résumé financier - EN HAUT pour éviter le scroll */}
          <div className="mb-6">
            <FinancesSummary inventaire={inventaire} />
          </div>

          {/* Récapitulatif des comptages */}
          <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
            <div className="bg-secondary border-b border-border p-4">
              <h3 className="font-semibold text-lg">Récapitulatif de l'inventaire</h3>
              <p className="text-sm text-muted-foreground">
                Inventaire terminé le {inventaire.termineLe ? format(new Date(inventaire.termineLe), 'dd MMMM yyyy à HH:mm', { locale: fr }) : '-'}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="bg-secondary border-b border-border">
                    <th className="text-left text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      Article
                    </th>
                    <th className="text-center text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      Zone
                    </th>
                    <th className="text-right text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      Stock Système
                    </th>
                    <th className="text-right text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      Qté Comptée
                    </th>
                    <th className="text-right text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      Écart
                    </th>
                    <th className="text-left text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      Note
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {inventaire.comptages && inventaire.comptages.length > 0 ? (
                    inventaire.comptages.map((comptage) => (
                      <tr key={comptage.id} className={comptage.ecart !== 0 ? 'bg-warning/5' : ''}>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <span className="text-xs sm:text-sm font-semibold text-foreground">
                            {comptage.articleNom}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                          <span className="text-xs sm:text-sm text-muted-foreground">
                            {comptage.article?.zone || '-'}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                          <span className="text-xs sm:text-sm font-mono font-medium text-foreground">
                            {comptage.quantiteSysteme}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                          <span className="text-xs sm:text-sm font-mono font-medium text-foreground">
                            {comptage.quantiteComptee}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                          <span className={`text-xs sm:text-sm font-bold font-mono ${getEcartColor(comptage.ecart)}`}>
                            {comptage.ecart > 0 ? '+' : ''}
                            {comptage.ecart}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <span className="text-xs text-muted-foreground">
                            {comptage.note || '-'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                        Aucun comptage enregistré
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Vue pour inventaire EN_COURS */}
      {inventaire.statut === 'EN_COURS' && (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher un article..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <button
                onClick={() => setSelectedCategorie('all')}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  selectedCategorie === 'all'
                    ? 'gradient-gold text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                Toutes catégories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategorie(cat.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    selectedCategorie === cat.id
                      ? 'gradient-gold text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  {cat.nom}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <div className="flex gap-1.5">
              <button
                onClick={() => setFilterStatut('all')}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  filterStatut === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-accent'
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setFilterStatut('compté')}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  filterStatut === 'compté'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-accent'
                }`}
              >
                Comptés
              </button>
              <button
                onClick={() => setFilterStatut('non-compté')}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  filterStatut === 'non-compté'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-accent'
                }`}
              >
                Non comptés
              </button>
            </div>

            <div className="flex gap-1.5">
              <button
                onClick={() => setFilterEcart('all')}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  filterEcart === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-accent'
                }`}
              >
                Tous écarts
              </button>
              <button
                onClick={() => setFilterEcart('avec-ecart')}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  filterEcart === 'avec-ecart'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-accent'
                }`}
              >
                Avec écart
              </button>
              <button
                onClick={() => setFilterEcart('sans-ecart')}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  filterEcart === 'sans-ecart'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-accent'
                }`}
              >
                Sans écart
              </button>
            </div>
          </div>

          {/* Tableau compact */}
          <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="bg-secondary border-b border-border">
                    <th className="text-left text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      #
                    </th>
                    <th className="text-left text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      Article
                    </th>
                    <th className="text-left text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      Zone
                    </th>
                    <th className="text-right text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      Stock Système
                    </th>
                    <th className="text-right text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      Qté Comptée
                    </th>
                    <th className="text-right text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      Écart
                    </th>
                    <th className="text-center text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedArticles.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                        Aucun article trouvé
                      </td>
                    </tr>
                  ) : (
                    paginatedArticles.map((article, idx) => {
                      const comptage = getComptageForArticle(article.id);
                      const isCompte = isArticleCompte(article.id);
                      const isEditing = editingArticleId === article.id;

                      return (
                        <tr
                          key={article.id}
                          className={`${
                            isCompte
                              ? 'bg-success/5'
                              : 'hover:bg-secondary/30 cursor-pointer'
                          } transition-colors`}
                          onClick={() => !isCompte && !isEditing && handleStartEdit(article)}
                        >
                          <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-muted-foreground">
                            {(page - 1) * limit + idx + 1}
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4">
                            <span className="text-xs sm:text-sm font-semibold text-foreground">
                              {article.nom}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4">
                            <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md bg-primary/10 text-primary text-[10px] sm:text-xs font-medium">
                              Zone {article.zone}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                            <span className="text-xs sm:text-sm font-mono font-medium text-foreground">
                              {article.stock}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                            {isEditing ? (
                              <input
                                ref={inputRef}
                                type="number"
                                min="0"
                                value={quantiteInput}
                                onChange={(e) => setQuantiteInput(e.target.value)}
                                onKeyDown={(e) => handleKeyPress(e, article)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-20 px-2 py-1 text-right font-mono text-sm border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary/50"
                              />
                            ) : isCompte ? (
                              <span className="text-xs sm:text-sm font-mono font-medium text-foreground">
                                {comptage?.quantiteComptee}
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-xs">-</span>
                            )}
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                            {isCompte && comptage ? (
                              <span
                                className={`text-xs sm:text-sm font-bold font-mono ${getEcartColor(
                                  comptage.ecart
                                )}`}
                              >
                                {comptage.ecart > 0 ? '+' : ''}
                                {comptage.ecart}
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-xs">-</span>
                            )}
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                            {isEditing ? (
                              <div className="flex gap-1 justify-center">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSaveComptage(article);
                                  }}
                                  className="w-7 h-7 rounded hover:bg-success/20 flex items-center justify-center transition-colors"
                                >
                                  <Check className="w-4 h-4 text-success" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancelEdit();
                                  }}
                                  className="w-7 h-7 rounded hover:bg-destructive/20 flex items-center justify-center transition-colors"
                                >
                                  <X className="w-4 h-4 text-destructive" />
                                </button>
                              </div>
                            ) : isCompte ? (
                              <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full font-bold bg-success/20 text-success">
                                <Check className="w-3 h-3" />
                                Compté
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full font-medium bg-secondary text-secondary-foreground">
                                À compter
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {meta && <Pagination meta={meta} onPageChange={setPage} />}
          </div>
        </>
      )}

      <ValiderInventaireDialog
        open={validerDialogOpen}
        onOpenChange={setValiderDialogOpen}
        inventaire={inventaire}
      />
    </AppLayout>
  );
}
