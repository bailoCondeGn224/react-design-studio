import { useState } from "react";
import { TrendingUp, TrendingDown, Package, AlertCircle, Activity, DollarSign, Filter } from "lucide-react";
import { useInventairesDashboard } from "@/hooks/useInventaires";
import { useIsMobile } from "@/hooks/useMediaQuery";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

const InventaireDashboard = () => {
  const [periode, setPeriode] = useState<string>('3');
  const { data: stats, isLoading } = useInventairesDashboard({ periode });
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">Aucune donnée disponible</p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
              Créez et validez des inventaires pour voir les statistiques.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const formatPrix = (prix: number) => {
    return new Intl.NumberFormat('fr-GN', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0
    }).format(prix).replace('GNF', 'GNF');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const { global, comparaison, topArticlesEcarts, moyennes } = stats;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Filtres */}
      <Card>
        <CardContent className="p-2.5 md:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 flex-shrink-0">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs md:text-sm font-medium">Période:</span>
            </div>
            <Select value={periode} onValueChange={setPeriode}>
              <SelectTrigger className="w-full sm:w-[180px] h-9">
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Dernier mois</SelectItem>
                <SelectItem value="3">3 derniers mois</SelectItem>
                <SelectItem value="6">6 derniers mois</SelectItem>
                <SelectItem value="12">Dernière année</SelectItem>
                <SelectItem value="tout">Toute la période</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Vue globale */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        {/* Total inventaires */}
        <div className="bg-card border border-border rounded-lg p-3 md:p-4 shadow-card">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <Package className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] md:text-xs text-muted-foreground">Total Inventaires</p>
              <p className="text-xl md:text-2xl font-bold text-foreground">{global.totalInventaires}</p>
            </div>
          </div>
        </div>

        {/* Inventaire en cours */}
        {global.inventaireEnCours ? (
          <div className="bg-card border border-border rounded-lg p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Inventaire en cours</p>
                <p className="text-xl font-bold text-foreground">{global.inventaireEnCours.progression}%</p>
                <p className="text-xs text-muted-foreground">
                  {global.inventaireEnCours.articlesComptes}/{global.inventaireEnCours.totalArticles} articles
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-500/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Inventaire en cours</p>
                <p className="text-sm text-muted-foreground">Aucun</p>
              </div>
            </div>
          </div>
        )}

        {/* Dernier inventaire */}
        {global.dernierInventaire && (
          <div className="bg-card border border-border rounded-lg p-4 shadow-card">
            <div>
              <p className="text-xs text-muted-foreground mb-2">Dernier inventaire</p>
              <p className="text-sm font-semibold text-foreground">
                {formatDate(global.dernierInventaire.date)}
              </p>
              <div className="mt-2 space-y-1">
                <p className="text-xs text-green-600 dark:text-green-400">
                  Bénéfice: {formatPrix(global.dernierInventaire.benefice)}
                </p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  Pertes: {formatPrix(global.dernierInventaire.pertes)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Comparaison périodes */}
      {comparaison && (
        <div>
          <h3 className="text-xs md:text-sm font-semibold text-foreground mb-2 md:mb-3">Comparaison avec période précédente</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
            {/* CA */}
            <div className="bg-card border border-border rounded-lg p-2.5 md:p-4 shadow-card">
              <p className="text-[10px] md:text-xs text-muted-foreground mb-1 md:mb-2 leading-tight">CA</p>
              <p className="text-sm md:text-xl font-bold text-foreground leading-tight">{isMobile ? formatPrix(comparaison.ca.actuel).replace(/\s/g, '').substring(0, 10) + '...' : formatPrix(comparaison.ca.actuel)}</p>
              <div className={`flex items-center gap-0.5 md:gap-1 mt-1 ${comparaison.ca.evolution >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {comparaison.ca.evolution >= 0 ? <TrendingUp className="w-3 h-3 md:w-4 md:h-4" /> : <TrendingDown className="w-3 h-3 md:w-4 md:h-4" />}
                <span className="text-[10px] md:text-xs font-semibold">{comparaison.ca.evolution.toFixed(1)}%</span>
              </div>
            </div>

            {/* Bénéfice */}
            <div className="bg-card border border-border rounded-lg p-2.5 md:p-4 shadow-card">
              <p className="text-[10px] md:text-xs text-muted-foreground mb-1 md:mb-2 leading-tight">Bénéfice</p>
              <p className="text-sm md:text-xl font-bold text-foreground leading-tight">{isMobile ? formatPrix(comparaison.benefice.actuel).replace(/\s/g, '').substring(0, 10) + '...' : formatPrix(comparaison.benefice.actuel)}</p>
              <div className={`flex items-center gap-0.5 md:gap-1 mt-1 ${comparaison.benefice.evolution >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {comparaison.benefice.evolution >= 0 ? <TrendingUp className="w-3 h-3 md:w-4 md:h-4" /> : <TrendingDown className="w-3 h-3 md:w-4 md:h-4" />}
                <span className="text-[10px] md:text-xs font-semibold">{comparaison.benefice.evolution.toFixed(1)}%</span>
              </div>
            </div>

            {/* Pertes */}
            <div className="bg-card border border-border rounded-lg p-2.5 md:p-4 shadow-card">
              <p className="text-[10px] md:text-xs text-muted-foreground mb-1 md:mb-2 leading-tight">Pertes</p>
              <p className="text-sm md:text-xl font-bold text-foreground leading-tight">{isMobile ? formatPrix(comparaison.pertes.actuel).replace(/\s/g, '').substring(0, 10) + '...' : formatPrix(comparaison.pertes.actuel)}</p>
              <div className={`flex items-center gap-0.5 md:gap-1 mt-1 ${comparaison.pertes.evolution <= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {comparaison.pertes.evolution <= 0 ? <TrendingDown className="w-3 h-3 md:w-4 md:h-4" /> : <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />}
                <span className="text-[10px] md:text-xs font-semibold">{Math.abs(comparaison.pertes.evolution).toFixed(1)}%</span>
              </div>
            </div>

            {/* Taux marge */}
            <div className="bg-card border border-border rounded-lg p-2.5 md:p-4 shadow-card">
              <p className="text-[10px] md:text-xs text-muted-foreground mb-1 md:mb-2 leading-tight">Marge</p>
              <p className="text-sm md:text-xl font-bold text-foreground leading-tight">{comparaison.tauxMarge.actuel.toFixed(1)}%</p>
              <div className={`flex items-center gap-0.5 md:gap-1 mt-1 ${comparaison.tauxMarge.evolution >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {comparaison.tauxMarge.evolution >= 0 ? <TrendingUp className="w-3 h-3 md:w-4 md:h-4" /> : <TrendingDown className="w-3 h-3 md:w-4 md:h-4" />}
                <span className="text-[10px] md:text-xs font-semibold">{comparaison.tauxMarge.evolution > 0 ? '+' : ''}{comparaison.tauxMarge.evolution.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top articles avec écarts */}
      {topArticlesEcarts && topArticlesEcarts.length > 0 && (
        <div>
          <h3 className="text-xs md:text-sm font-semibold text-foreground mb-2 md:mb-3">
            Top {isMobile ? '5' : '10'} articles avec écarts
          </h3>

          {/* Version mobile: cartes */}
          {isMobile ? (
            <div className="space-y-2">
              {topArticlesEcarts.slice(0, 5).map((article) => (
                <div key={article.articleId} className="bg-card border border-border rounded-lg p-3 shadow-card">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-foreground flex-1">{article.articleNom}</p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium flex-shrink-0">
                      {article.nombreEcarts}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-muted-foreground">
                    <div>
                      <span className="font-medium">Écart total:</span> {article.ecartTotal}
                    </div>
                    <div>
                      <span className="font-medium">Moyen:</span> {article.ecartMoyen}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Version desktop: tableau */
            <div className="bg-card border border-border rounded-lg overflow-hidden shadow-card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="text-left p-3 text-xs font-semibold text-foreground">Article</th>
                      <th className="text-center p-3 text-xs font-semibold text-foreground">Nb écarts</th>
                      <th className="text-center p-3 text-xs font-semibold text-foreground">Écart total</th>
                      <th className="text-center p-3 text-xs font-semibold text-foreground">Écart moyen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topArticlesEcarts.map((article) => (
                      <tr key={article.articleId} className="border-t border-border">
                        <td className="p-3 text-sm text-foreground">{article.articleNom}</td>
                        <td className="p-3 text-center">
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium">
                            {article.nombreEcarts}
                          </span>
                        </td>
                        <td className="p-3 text-center text-sm text-foreground">{article.ecartTotal}</td>
                        <td className="p-3 text-center text-sm text-foreground">{article.ecartMoyen}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Moyennes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        <div className="bg-card border border-border rounded-lg p-3 md:p-4 shadow-card">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-[10px] md:text-xs text-muted-foreground leading-tight">Taux rentabilité moyen</p>
              <p className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">{moyennes.tauxRentabilite}%</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-3 md:p-4 shadow-card">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] md:text-xs text-muted-foreground leading-tight">Taux marge moyen</p>
              <p className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">{moyennes.tauxMarge}%</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-3 md:p-4 shadow-card">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-[10px] md:text-xs text-muted-foreground leading-tight">Pertes cumulées</p>
              <p className="text-base md:text-xl font-bold text-red-600 dark:text-red-400">{isMobile ? formatPrix(moyennes.pertesTotales).replace(/\s/g, '').substring(0, 12) + '...' : formatPrix(moyennes.pertesTotales)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventaireDashboard;
