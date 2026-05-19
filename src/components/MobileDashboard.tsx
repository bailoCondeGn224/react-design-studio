import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Plus,
  Truck,
  Clock,
  Warehouse,
} from 'lucide-react';
import { useVentesStats } from '@/hooks/useVentes';
import { useStockStats } from '@/hooks/useStock';
import { useStatsClients } from '@/hooks/useClients';

const MobileDashboard = () => {
  const navigate = useNavigate();
  const { data: ventesStats } = useVentesStats();
  const { data: stockStats } = useStockStats();
  const { data: clientsStats } = useStatsClients();

  const formatPrix = (prix: number) => {
    if (prix >= 1000000) {
      return `${(prix / 1000000).toFixed(1)}M GNF`;
    } else if (prix >= 1000) {
      return `${(prix / 1000).toFixed(0)}K GNF`;
    }
    return `${prix} GNF`;
  };

  const caJour = ventesStats?.jour.total || 0;
  const caSemaine = ventesStats?.semaine.total || 0;
  const caMois = ventesStats?.mois.total || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background pb-20">
      {/* Header avec salutation */}
      <div className="bg-primary text-primary-foreground px-4 pt-6 pb-8 rounded-b-3xl shadow-lg">
        <h1 className="text-2xl font-bold mb-1">Bonjour 👋</h1>
        <p className="text-primary-foreground/80 text-sm">Voici votre boutique aujourd'hui</p>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* CA du jour - Card principale */}
        <div className="bg-gradient-to-br from-success via-success/90 to-success/80 text-white rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium opacity-90">Ventes Aujourd'hui</span>
            <div className="bg-white/20 p-2 rounded-full">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <h2 className="text-4xl font-bold mb-1">{formatPrix(caJour)}</h2>
          <p className="text-sm opacity-90">{ventesStats?.jour.count || 0} ventes réalisées</p>
        </div>

        {/* Grille CA semaine et mois */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border-2 border-border rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-primary/10 p-1.5 rounded-lg">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Cette Semaine</span>
            </div>
            <p className="text-xl font-bold text-foreground">{formatPrix(caSemaine)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {ventesStats?.semaine.count || 0} ventes
            </p>
          </div>

          <div className="bg-card border-2 border-border rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-accent/10 p-1.5 rounded-lg">
                <ShoppingCart className="w-4 h-4 text-accent" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Ce Mois</span>
            </div>
            <p className="text-xl font-bold text-foreground">{formatPrix(caMois)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {ventesStats?.mois.count || 0} ventes
            </p>
          </div>
        </div>

        {/* Stock: Nombre d'articles et Valeur */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/stock')}
            className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 rounded-xl p-4 text-left hover:border-primary/40 transition-all shadow-sm active:scale-95"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-primary/20 p-2 rounded-lg">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Articles</span>
            </div>
            <p className="text-3xl font-bold text-primary">{stockStats?.totalArticles || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">En stock</p>
          </button>

          <button
            onClick={() => navigate('/stock')}
            className="bg-gradient-to-br from-accent/10 to-accent/5 border-2 border-accent/20 rounded-xl p-4 text-left hover:border-accent/40 transition-all shadow-sm active:scale-95"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-accent/20 p-2 rounded-lg">
                <Warehouse className="w-5 h-5 text-accent" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Valeur Stock</span>
            </div>
            <p className="text-xl font-bold text-accent">
              {formatPrix(stockStats?.valeurTotaleStock || 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Total investissement</p>
          </button>
        </div>

        {/* Alertes Stock */}
        {(stockStats?.articlesEnRupture || 0) > 0 || (stockStats?.articlesStockFaible || 0) > 0 ? (
          <div className="bg-destructive/10 border-l-4 border-destructive rounded-xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="bg-destructive/20 p-2 rounded-full flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-destructive mb-2">Attention au Stock!</h3>
                <div className="space-y-1.5 text-sm">
                  {(stockStats?.articlesEnRupture || 0) > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-destructive"></div>
                      <span className="text-foreground font-medium">
                        {stockStats?.articlesEnRupture} articles épuisés
                      </span>
                    </div>
                  )}
                  {(stockStats?.articlesStockFaible || 0) > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-warning"></div>
                      <span className="text-foreground font-medium">
                        {stockStats?.articlesStockFaible} articles bientôt épuisés
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => navigate('/stock')}
                  className="mt-3 text-sm font-semibold text-destructive flex items-center gap-1 hover:gap-2 transition-all"
                >
                  Voir le stock <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-success/10 border-l-4 border-success rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-success/20 p-2.5 rounded-full">
                <Package className="w-5 h-5 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-success text-base">Stock en Bonne Santé ✓</h3>
                <p className="text-sm text-muted-foreground">Tous les articles disponibles</p>
              </div>
            </div>
          </div>
        )}

        {/* Clients avec crédits */}
        {(clientsStats?.avecCredits || 0) > 0 && (
          <button
            onClick={() => navigate('/clients')}
            className="w-full bg-warning/10 border-l-4 border-warning rounded-xl p-4 text-left hover:bg-warning/20 transition-colors shadow-sm active:scale-98"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-warning/20 p-2.5 rounded-full">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-base">
                    {clientsStats?.avecCredits} clients ont des crédits
                  </p>
                  <p className="text-sm text-muted-foreground">Tapez pour gérer les paiements</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </button>
        )}

        {/* Nombre de clients */}
        <button
          onClick={() => navigate('/clients')}
          className="w-full bg-card border-2 border-border rounded-xl p-4 text-left hover:bg-accent/5 hover:border-primary/30 transition-all shadow-sm active:scale-98"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2.5 rounded-full">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{clientsStats?.total || 0}</p>
                <p className="text-sm text-muted-foreground">Clients actifs</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </button>

        {/* Actions Rapides */}
        <div className="pt-2">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-1">
            Actions Rapides
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/ventes')}
              className="bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-xl p-6 shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="bg-white/20 p-3 rounded-full">
                  <Plus className="w-7 h-7" />
                </div>
                <span className="text-sm font-semibold">Nouvelle Vente</span>
              </div>
            </button>

            <button
              onClick={() => navigate('/approvisionnements')}
              className="bg-gradient-to-br from-accent to-accent/90 text-accent-foreground rounded-xl p-6 shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="bg-white/20 p-3 rounded-full">
                  <Truck className="w-7 h-7" />
                </div>
                <span className="text-sm font-semibold">Approvisionner</span>
              </div>
            </button>
          </div>
        </div>

        {/* Espace pour navigation bottom */}
        <div className="h-4"></div>
      </div>
    </div>
  );
};

export default MobileDashboard;
