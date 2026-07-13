import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ChevronLeft,
  Filter,
  Download,
  DollarSign,
  Receipt,
  PiggyBank,
  Calendar,
  Target,
  Percent,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Pagination from '@/components/Pagination';
import { Article, ComptageInventaire, Inventaire, categorieDepenseLabels } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { generateFinancesPDF } from '@/utils/pdfGenerator';
import { useCalculerFinances } from '@/hooks/useInventaires';

interface MobileInventaireDetailProps {
  inventaire: Inventaire;
  articles: Article[];
  onAddComptage: (articleId: string, quantite: number) => Promise<void>;
  onValidate: () => void;
  getComptageForArticle: (articleId: string) => ComptageInventaire | undefined;
  isArticleCompte: (articleId: string) => boolean;
}

export default function MobileInventaireDetail({
  inventaire,
  articles,
  onAddComptage,
  onValidate,
  getComptageForArticle,
  isArticleCompte,
}: MobileInventaireDetailProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [quantiteInput, setQuantiteInput] = useState('');
  const [isSavingComptage, setIsSavingComptage] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const calculerFinancesMutation = useCalculerFinances();
  const [isCalculating, setIsCalculating] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 20;

  const progressPercent =
    inventaire && inventaire.totalArticles > 0
      ? (inventaire.articlesComptes / inventaire.totalArticles) * 100
      : 0;

  const formatMontant = (montant: number | string) => {
    const value = typeof montant === 'string' ? parseFloat(montant) : montant;
    return new Intl.NumberFormat('fr-FR', {
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleCalculer = async () => {
    setIsCalculating(true);
    try {
      await calculerFinancesMutation.mutateAsync(inventaire.id);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleDownloadPDF = () => {
    try {
      const doc = generateFinancesPDF(inventaire);
      doc.save(`Rapport-Finances-${format(new Date(inventaire.date), 'yyyy-MM-dd')}.pdf`);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
    }
  };

  // Filtrage
  const filteredArticles = articles.filter((article) => {
    if (searchQuery && !article.nom.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    const isCompte = isArticleCompte(article.id);
    if (filterStatut === 'compté' && !isCompte) return false;
    if (filterStatut === 'non-compté' && isCompte) return false;
    return true;
  });

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

  useEffect(() => {
    if (editingArticleId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingArticleId]);

  // Reset pagination quand les filtres changent
  useEffect(() => {
    setPage(1);
  }, [searchQuery, filterStatut]);

  const handleStartEdit = (article: Article) => {
    if (isArticleCompte(article.id)) return;
    setEditingArticleId(article.id);
    setQuantiteInput(article.stock.toString());
  };

  const handleSaveComptage = async (articleId: string) => {
    const quantite = parseInt(quantiteInput);
    if (isNaN(quantite) || quantite < 0) return;

    setIsSavingComptage(true);
    try {
      await onAddComptage(articleId, quantite);
      setEditingArticleId(null);
      setQuantiteInput('');
    } catch (error) {
      // Erreur gérée par le hook
    } finally {
      setIsSavingComptage(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingArticleId(null);
    setQuantiteInput('');
  };

  const getEcartColor = (ecart: number) => {
    if (ecart === 0) return 'text-success';
    if (Math.abs(ecart) <= 2) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header avec retour */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate('/inventaires')}
            className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-semibold truncate">
              {inventaire.note || 'Inventaire'}
            </h1>
            <p className="text-xs text-muted-foreground truncate">
              {format(new Date(inventaire.date), 'dd MMM yyyy', { locale: fr })}
            </p>
          </div>
          {inventaire.statut === 'EN_COURS' ? (
            <Badge variant="secondary" className="flex-shrink-0">
              <Clock className="w-3 h-3 mr-1" />
              En cours
            </Badge>
          ) : (
            <Badge variant="default" className="bg-success flex-shrink-0">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Terminé
            </Badge>
          )}
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Statistiques - disposition verticale */}
        <div className="space-y-3">
          {/* Articles comptés */}
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Articles Comptés</p>
                  <p className="text-2xl font-bold text-foreground mt-0.5">
                    {inventaire.articlesComptes}<span className="text-lg text-muted-foreground">/{inventaire.totalArticles}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Progression */}
          <div className="bg-gradient-to-br from-success/5 to-success/10 border border-success/20 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-medium">Progression</p>
                <p className="text-2xl font-bold text-foreground mt-0.5">{Math.round(progressPercent)}%</p>
              </div>
            </div>
            <div className="w-full bg-secondary rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-success to-success/80 h-2.5 rounded-full transition-all shadow-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Écarts et Restants - côte à côte */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-warning/5 to-warning/10 border border-warning/20 rounded-xl p-4">
              <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center mb-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
              </div>
              <p className="text-xs text-muted-foreground font-medium mb-1">Avec Écarts</p>
              <p className="text-2xl font-bold text-warning">
                {inventaire.articlesAvecEcarts}
              </p>
            </div>

            <div className="bg-gradient-to-br from-muted/30 to-muted/50 border border-border rounded-xl p-4">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-2">
                <TrendingDown className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground font-medium mb-1">Restants</p>
              <p className="text-2xl font-bold text-foreground">
                {inventaire.totalArticles - inventaire.articlesComptes}
              </p>
            </div>
          </div>
        </div>

        {/* Bouton valider si tout est compté */}
        {inventaire.statut === 'EN_COURS' &&
          inventaire.articlesComptes === inventaire.totalArticles && (
            <Button
              size="lg"
              className="w-full gradient-gold"
              onClick={onValidate}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Valider l'inventaire
            </Button>
          )}

        {/* Inventaire EN_COURS */}
        {inventaire.statut === 'EN_COURS' && (
          <>
            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher un article..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>

            {/* Bouton filtres */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-border bg-card text-sm hover:bg-secondary transition-colors"
            >
              <span className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filtres
              </span>
              <Badge variant="secondary">
                {filterStatut === 'all' ? 'Tous' : filterStatut === 'compté' ? 'Comptés' : 'Non comptés'}
              </Badge>
            </button>

            {/* Panneau filtres */}
            {showFilters && (
              <div className="bg-card border border-border rounded-lg p-3 space-y-2">
                <label className="block">
                  <span className="text-xs text-muted-foreground mb-1 block">Statut</span>
                  <select
                    value={filterStatut}
                    onChange={(e) => setFilterStatut(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="compté">Comptés</option>
                    <option value="non-compté">Non comptés</option>
                  </select>
                </label>
              </div>
            )}

            {/* Compteur résultats */}
            <div className="flex items-center justify-between px-1">
              <p className="text-xs text-muted-foreground">
                {filteredArticles.length} article{filteredArticles.length > 1 ? 's' : ''}
              </p>
              {totalPages > 1 && (
                <p className="text-xs text-muted-foreground">
                  Page {page} / {totalPages}
                </p>
              )}
            </div>

            {/* Liste des articles */}
            <div className="space-y-3">
              {paginatedArticles.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-8 text-center">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">Aucun article trouvé</p>
                </div>
              ) : (
                paginatedArticles.map((article) => {
                  const comptage = getComptageForArticle(article.id);
                  const isCompte = isArticleCompte(article.id);
                  const isEditing = editingArticleId === article.id;

                  return (
                    <div
                      key={article.id}
                      className={`bg-card border rounded-xl p-4 transition-all ${
                        isCompte
                          ? 'border-success/30 bg-success/5'
                          : 'border-border hover:border-primary/30 active:scale-[0.99]'
                      }`}
                      onClick={() => !isCompte && !isEditing && handleStartEdit(article)}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base truncate">{article.nom}</h3>
                          <div className="flex items-center gap-2 mt-1.5">
                            <Badge variant="outline" className="text-xs px-2 py-0.5">
                              Zone {article.zone}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              Stock: {article.stock}
                            </span>
                          </div>
                        </div>
                        {isCompte ? (
                          <Badge className="bg-success/20 text-success border-success/30 flex-shrink-0 text-xs">
                            <Check className="w-3 h-3 mr-1" />
                            Compté
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="flex-shrink-0 text-xs">
                            À compter
                          </Badge>
                        )}
                      </div>

                      {/* Zone de comptage */}
                      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1.5 font-medium">Système</p>
                          <p className="text-base font-mono font-bold">{article.stock}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1.5 font-medium">Compté</p>
                          {isEditing ? (
                            <input
                              ref={inputRef}
                              type="number"
                              min="0"
                              value={quantiteInput}
                              onChange={(e) => setQuantiteInput(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full px-2 py-1.5 text-base font-mono font-bold border-2 border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                          ) : isCompte ? (
                            <p className="text-base font-mono font-bold">
                              {comptage?.quantiteComptee}
                            </p>
                          ) : (
                            <p className="text-base text-muted-foreground">-</p>
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1.5 font-medium">Écart</p>
                          {isCompte && comptage ? (
                            <p className={`text-base font-mono font-bold ${getEcartColor(comptage.ecart)}`}>
                              {comptage.ecart > 0 ? '+' : ''}
                              {comptage.ecart}
                            </p>
                          ) : (
                            <p className="text-base text-muted-foreground">-</p>
                          )}
                        </div>
                      </div>

                      {/* Boutons de validation */}
                      {isEditing && (
                        <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveComptage(article.id);
                            }}
                            disabled={isSavingComptage}
                            className="flex-1 h-11 rounded-lg bg-success text-white text-sm font-semibold active:scale-95 transition-transform disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-1.5"
                          >
                            {isSavingComptage ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Validation...
                              </>
                            ) : (
                              <>
                                <Check className="w-4 h-4" />
                                Valider
                              </>
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelEdit();
                            }}
                            disabled={isSavingComptage}
                            className="flex-1 h-11 rounded-lg border-2 border-border bg-background text-sm font-semibold active:scale-95 transition-transform disabled:opacity-50"
                          >
                            <X className="w-4 h-4 inline mr-1.5" />
                            Annuler
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4">
                <Pagination meta={meta} onPageChange={setPage} />
              </div>
            )}
          </>
        )}

        {/* Inventaire TERMINE */}
        {inventaire.statut === 'TERMINE' && (
          <div className="space-y-4">
            {/* Info terminé */}
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="font-semibold text-base mb-1.5">Inventaire terminé</h3>
              <p className="text-sm text-muted-foreground">
                {inventaire.termineLe
                  ? format(new Date(inventaire.termineLe), 'dd MMMM yyyy à HH:mm', { locale: fr })
                  : '-'}
              </p>
            </div>

            {/* Résumé financier */}
            {!inventaire.financesCalcules ? (
              <div className="bg-card border-2 border-dashed border-border rounded-xl p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold text-base mb-2">Finances non calculées</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Calculez les finances pour voir CA, dépenses et bénéfices
                </p>
                <Button
                  onClick={handleCalculer}
                  disabled={isCalculating}
                  className="w-full h-11"
                >
                  {isCalculating ? 'Calcul en cours...' : 'Calculer les finances'}
                </Button>
              </div>
            ) : (
              <>
                {/* Période et téléchargement */}
                <div className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      <span className="text-sm font-semibold">Période financière</span>
                    </div>
                    <Button
                      onClick={handleDownloadPDF}
                      variant="outline"
                      size="sm"
                      className="h-9 px-3"
                    >
                      <Download className="w-4 h-4 mr-1.5" />
                      <span className="text-xs font-medium">PDF</span>
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Du{' '}
                    {inventaire.dateDebut
                      ? format(new Date(inventaire.dateDebut), 'dd MMM', { locale: fr })
                      : '-'}{' '}
                    au{' '}
                    {inventaire.dateFin
                      ? format(new Date(inventaire.dateFin), 'dd MMM yyyy', { locale: fr })
                      : '-'}
                  </p>
                </div>

                {/* Métriques principales */}
                <div className="space-y-2.5">
                  {/* CA */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border border-blue-200 dark:border-blue-800 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        Chiffre d'Affaires
                      </p>
                    </div>
                    <p className="text-base font-bold text-blue-900 dark:text-blue-100 mb-1">
                      {formatMontant(inventaire.chiffreAffaires || 0)} <span className="text-xs font-normal">GNF</span>
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      {inventaire.nombreVentes || 0} vente(s)
                    </p>
                  </div>

                  {/* CMV */}
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border border-orange-200 dark:border-orange-800 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                        <Receipt className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                        Coût Marchandises
                      </p>
                    </div>
                    <p className="text-base font-bold text-orange-900 dark:text-orange-100 mb-1">
                      {formatMontant(inventaire.coutMarchandises || 0)} <span className="text-xs font-normal">GNF</span>
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-400">CMV</p>
                  </div>

                  {/* Bénéfice Brut */}
                  <div
                    className={`bg-gradient-to-br rounded-xl p-3 border ${
                      parseFloat(inventaire.beneficeBrut?.toString() || '0') >= 0
                        ? 'from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800'
                        : 'from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        parseFloat(inventaire.beneficeBrut?.toString() || '0') >= 0
                          ? 'bg-green-500/20'
                          : 'bg-red-500/20'
                      }`}>
                        <TrendingUp
                          className={`w-4 h-4 ${
                            parseFloat(inventaire.beneficeBrut?.toString() || '0') >= 0
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        />
                      </div>
                      <p
                        className={`text-xs font-medium ${
                          parseFloat(inventaire.beneficeBrut?.toString() || '0') >= 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        Bénéfice Brut
                      </p>
                    </div>
                    <p
                      className={`text-base font-bold mb-1 ${
                        parseFloat(inventaire.beneficeBrut?.toString() || '0') >= 0
                          ? 'text-green-900 dark:text-green-100'
                          : 'text-red-900 dark:text-red-100'
                      }`}
                    >
                      {formatMontant(inventaire.beneficeBrut || 0)} <span className="text-xs font-normal">GNF</span>
                    </p>
                    <p
                      className={`text-xs ${
                        parseFloat(inventaire.beneficeBrut?.toString() || '0') >= 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      CA - CMV
                    </p>
                  </div>

                  {/* Bénéfice Net */}
                  <div
                    className={`bg-gradient-to-br rounded-xl p-3 border ${
                      parseFloat(inventaire.beneficeNet?.toString() || '0') >= 0
                        ? 'from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200 dark:border-emerald-800'
                        : 'from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        parseFloat(inventaire.beneficeNet?.toString() || '0') >= 0
                          ? 'bg-emerald-500/20'
                          : 'bg-red-500/20'
                      }`}>
                        <PiggyBank
                          className={`w-4 h-4 ${
                            parseFloat(inventaire.beneficeNet?.toString() || '0') >= 0
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        />
                      </div>
                      <p
                        className={`text-xs font-medium ${
                          parseFloat(inventaire.beneficeNet?.toString() || '0') >= 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        Bénéfice Net
                      </p>
                    </div>
                    <p
                      className={`text-base font-bold mb-1 ${
                        parseFloat(inventaire.beneficeNet?.toString() || '0') >= 0
                          ? 'text-emerald-900 dark:text-emerald-100'
                          : 'text-red-900 dark:text-red-100'
                      }`}
                    >
                      {formatMontant(inventaire.beneficeNet || 0)} <span className="text-xs font-normal">GNF</span>
                    </p>
                    <p
                      className={`text-xs ${
                        parseFloat(inventaire.beneficeNet?.toString() || '0') >= 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      Résultat final
                    </p>
                  </div>
                </div>

                {/* Dépenses par catégorie */}
                <div className="bg-card border border-border rounded-xl p-4">
                  <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                    <Receipt className="w-5 h-5" />
                    Dépenses
                  </h3>
                  <div className="space-y-2.5">
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">
                        {categorieDepenseLabels.FIXE}
                      </p>
                      <p className="text-base font-bold text-amber-900 dark:text-amber-100">
                        {formatMontant(inventaire.depensesFixes || 0)} <span className="text-xs font-normal">GNF</span>
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                      <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">
                        {categorieDepenseLabels.VARIABLE}
                      </p>
                      <p className="text-base font-bold text-purple-900 dark:text-purple-100">
                        {formatMontant(inventaire.depensesVariables || 0)} <span className="text-xs font-normal">GNF</span>
                      </p>
                    </div>
                    <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
                      <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">
                        {categorieDepenseLabels.EXCEPTIONNELLE}
                      </p>
                      <p className="text-base font-bold text-red-900 dark:text-red-100">
                        {formatMontant(inventaire.depensesExceptionnelles || 0)} <span className="text-xs font-normal">GNF</span>
                      </p>
                    </div>
                    <div className="p-3 bg-secondary rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">Total</span>
                        <span className="text-base font-bold">
                          {formatMontant(inventaire.totalDepenses || 0)} <span className="text-xs font-normal">GNF</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pertes et Indicateurs */}
                <div className="space-y-3">
                  {/* Pertes */}
                  <div className="bg-card border border-border rounded-xl p-4">
                    <h3 className="font-semibold text-base mb-3 flex items-center gap-2 text-destructive">
                      <AlertTriangle className="w-5 h-5" />
                      Pertes
                    </h3>
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Valeur totale</span>
                        <span className="text-sm font-bold text-destructive">
                          {formatMontant(inventaire.totalPertes || 0)} <span className="text-xs font-normal">GNF</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Manquants</span>
                        <span className="text-sm font-semibold text-destructive">
                          {formatMontant(inventaire.valeurArticlesManquants || 0)} <span className="text-xs font-normal">GNF</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Abîmés</span>
                        <span className="text-sm font-semibold text-destructive">
                          {formatMontant(inventaire.valeurArticlesAbimes || 0)} <span className="text-xs font-normal">GNF</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Indicateurs */}
                  <div className="bg-card border border-border rounded-xl p-4">
                    <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      Indicateurs
                    </h3>
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Percent className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Taux de marge</span>
                        </div>
                        <span className="text-base font-bold">
                          {inventaire.tauxMarge
                            ? `${parseFloat(inventaire.tauxMarge.toString()).toFixed(1)}%`
                            : '0%'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Rentabilité</span>
                        </div>
                        <span className="text-base font-bold">
                          {inventaire.tauxRentabilite
                            ? `${parseFloat(inventaire.tauxRentabilite.toString()).toFixed(1)}%`
                            : '0%'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Liste des comptages */}
            <div className="space-y-3">
              <h3 className="font-semibold text-base px-1">Comptages</h3>
              {inventaire.comptages && inventaire.comptages.length > 0 ? (
                inventaire.comptages.map((comptage) => (
                  <div
                    key={comptage.id}
                    className={`bg-card border rounded-xl p-4 ${
                      comptage.ecart !== 0 ? 'border-warning/30 bg-warning/5' : 'border-border'
                    }`}
                  >
                    <h3 className="font-semibold text-base mb-3">{comptage.articleNom}</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1.5 font-medium">Système</p>
                        <p className="text-base font-mono font-bold">
                          {comptage.quantiteSysteme}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1.5 font-medium">Compté</p>
                        <p className="text-base font-mono font-bold">
                          {comptage.quantiteComptee}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1.5 font-medium">Écart</p>
                        <p className={`text-base font-mono font-bold ${getEcartColor(comptage.ecart)}`}>
                          {comptage.ecart > 0 ? '+' : ''}
                          {comptage.ecart}
                        </p>
                      </div>
                    </div>
                    {comptage.note && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-sm text-muted-foreground">{comptage.note}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="bg-card border border-border rounded-xl p-8 text-center">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">Aucun comptage</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
