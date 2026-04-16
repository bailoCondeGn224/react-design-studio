import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import { TrendingUp, TrendingDown, DollarSign, Package, ShoppingCart, Users, AlertCircle, BarChart3, Activity } from "lucide-react";
import { useDashboardAnalytics } from "@/hooks/useAnalytics";
import { useStockAlerts } from "@/hooks/useStock";

const Analytics = () => {
  // Charger les données pré-calculées du backend
  const { data: dashboardData, isLoading: loadingDashboard } = useDashboardAnalytics();
  const { data: articlesEnAlerte = [], isLoading: loadingAlerts } = useStockAlerts();

  const isLoading = loadingDashboard || loadingAlerts;

  // Extraire les données du dashboard
  const valeurTotaleStock = dashboardData?.stock.valeurTotale || 0;
  const totalArticles = dashboardData?.stock.totalArticles || 0;
  const articlesEnAlerteCount = dashboardData?.stock.articlesEnAlerte || 0;
  const articlesEnRupture = dashboardData?.stock.articlesEnRupture || 0;
  const articlesCritiques = dashboardData?.stock.articlesCritiques || 0;
  const articlesOK = totalArticles - articlesEnAlerteCount;

  const totalDetteFournisseurs = dashboardData?.fournisseurs.detteTotal || 0;
  const fournisseursActifs = dashboardData?.fournisseurs.totalActifs || 0;
  const totalFournisseurs = dashboardData?.fournisseurs.totalFournisseurs || 0;
  const totalAchatsFournisseurs = dashboardData?.fournisseurs.totalAchats || 0;
  const nombreCreanciers = dashboardData?.fournisseurs.nombreCreanciers || 0;

  const formatPrix = (prix: number) => {
    return new Intl.NumberFormat('fr-GN', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0
    }).format(prix).replace('GNF', 'GNF');
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Chargement des analytics...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="Dashboard Analytics"
        description="Vue d'ensemble des performances et indicateurs clés"
      />

      {/* KPIs Principaux */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Valeur Stock */}
        <div className="bg-gradient-to-br from-primary/10 via-card to-card border border-primary/20 rounded-xl p-5 shadow-card">
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <p className="text-xs text-muted-foreground mb-1">Valeur du Stock</p>
          <p className="text-2xl font-bold text-foreground mb-1">
            {formatPrix(valeurTotaleStock)}
          </p>
          <p className="text-xs text-muted-foreground">
            {totalArticles} articles
          </p>
        </div>

        {/* Articles en Alerte */}
        <div className="bg-gradient-to-br from-warning/10 via-card to-card border border-warning/20 rounded-xl p-5 shadow-card">
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-warning" />
            </div>
            <TrendingDown className="w-5 h-5 text-warning" />
          </div>
          <p className="text-xs text-muted-foreground mb-1">Stock en Alerte</p>
          <p className="text-2xl font-bold text-warning mb-1">
            {articlesEnAlerteCount}
          </p>
          <p className="text-xs text-muted-foreground">
            dont {articlesCritiques} critiques
          </p>
        </div>

        {/* Total Fournisseurs */}
        <div className="bg-gradient-to-br from-success/10 via-card to-card border border-success/20 rounded-xl p-5 shadow-card">
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-success flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <TrendingUp className="w-5 h-5 text-success" />
          </div>
          <p className="text-xs text-muted-foreground mb-1">Fournisseurs Actifs</p>
          <p className="text-2xl font-bold text-foreground mb-1">
            {fournisseursActifs}
          </p>
          <p className="text-xs text-muted-foreground">
            sur {totalFournisseurs} total
          </p>
        </div>

        {/* Dette Fournisseurs */}
        <div className="bg-gradient-to-br from-destructive/10 via-card to-card border border-destructive/20 rounded-xl p-5 shadow-card">
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-destructive" />
            </div>
            <AlertCircle className="w-5 h-5 text-destructive" />
          </div>
          <p className="text-xs text-muted-foreground mb-1">Dette Fournisseurs</p>
          <p className="text-2xl font-bold text-destructive mb-1">
            {formatPrix(totalDetteFournisseurs)}
          </p>
          <p className="text-xs text-muted-foreground">
            {nombreCreanciers} créanciers
          </p>
        </div>
      </div>

      {/* Alertes et Statistiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Répartition du Stock */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Répartition du Stock</h3>
          </div>

          <div className="space-y-4">
            {/* Rupture de Stock */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Rupture de Stock</span>
                <span className="text-sm font-bold text-destructive">
                  {articlesEnRupture} articles
                </span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-destructive rounded-full transition-all"
                  style={{
                    width: totalArticles > 0 ? `${(articlesEnRupture / totalArticles) * 100}%` : '0%'
                  }}
                />
              </div>
            </div>

            {/* Stock Faible */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Stock Faible (1-5)</span>
                <span className="text-sm font-bold text-warning">
                  {articlesCritiques} articles
                </span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-warning rounded-full transition-all"
                  style={{
                    width: totalArticles > 0 ? `${(articlesCritiques / totalArticles) * 100}%` : '0%'
                  }}
                />
              </div>
            </div>

            {/* Stock OK */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Stock OK</span>
                <span className="text-sm font-bold text-success">
                  {articlesOK} articles
                </span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-success rounded-full transition-all"
                  style={{
                    width: totalArticles > 0 ? `${(articlesOK / totalArticles) * 100}%` : '0%'
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Taux d'alerte</span>
              <span className="text-sm font-bold text-foreground">
                {totalArticles > 0 ? formatPercent((articlesEnAlerteCount / totalArticles) * 100) : '0%'}
              </span>
            </div>
          </div>
        </div>

        {/* Statistiques Fournisseurs */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Statistiques Fournisseurs</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Total</p>
                  <p className="text-xs text-muted-foreground">Fournisseurs</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-primary">{totalFournisseurs}</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-success/5 rounded-lg border border-success/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Actifs</p>
                  <p className="text-xs text-muted-foreground">En service</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-success">{fournisseursActifs}</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Total Achats</p>
                  <p className="text-xs text-muted-foreground">Historique</p>
                </div>
              </div>
              <p className="text-lg font-bold text-foreground">
                {formatPrix(totalAchatsFournisseurs)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Alertes */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-warning" />
          <h3 className="font-semibold text-foreground">Articles Nécessitant une Attention</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {articlesEnAlerte
            .slice(0, 6)
            .map((article: any) => {
              const estCritique = article.stock <= article.seuilAlerte * 0.3;
              const estRupture = article.stock === 0;

              return (
                <div key={article.id} className="p-4 bg-secondary/30 rounded-lg border border-border hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-semibold text-foreground flex-1 truncate">
                      {article.nom}
                    </p>
                    {estRupture ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-destructive text-destructive-foreground ml-2">
                        RUPTURE
                      </span>
                    ) : estCritique ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-destructive/20 text-destructive ml-2">
                        CRITIQUE
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-warning/20 text-warning ml-2">
                        FAIBLE
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Stock actuel</span>
                    <span className={`font-bold ${estRupture ? 'text-destructive' : estCritique ? 'text-destructive' : 'text-warning'}`}>
                      {article.stock}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-muted-foreground">Seuil mini</span>
                    <span className="font-semibold text-foreground">{article.seuilAlerte}</span>
                  </div>
                </div>
              );
            })}

          {articlesEnAlerte.length === 0 && (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Tous les articles sont en stock ! 🎉</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Analytics;
