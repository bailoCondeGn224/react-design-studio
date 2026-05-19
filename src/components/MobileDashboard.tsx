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
  Warehouse,
  ChevronRight,
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
    return new Intl.NumberFormat('fr-FR', {
      maximumFractionDigits: 0,
    }).format(prix);
  };

  const caJour = ventesStats?.jour.total || 0;
  const caSemaine = ventesStats?.semaine.total || 0;
  const caMois = ventesStats?.mois.total || 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header simple */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10 px-4 py-3">
        <h1 className="text-lg font-semibold">Tableau de bord</h1>
      </div>

      <div className="px-3 py-4 space-y-3">
        {/* CA du jour - Card principale épurée */}
        <div className="bg-success text-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm opacity-80 mb-1">Aujourd'hui</p>
              <h2 className="text-3xl font-bold">{formatPrix(caJour)} <span className="text-base font-normal">GNF</span></h2>
            </div>
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm opacity-90">{ventesStats?.jour.count || 0} ventes</p>
        </div>

        {/* CA semaine */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Cette Semaine</span>
          </div>
          <p className="text-2xl font-bold">{formatPrix(caSemaine)} <span className="text-base font-normal">GNF</span></p>
          <p className="text-xs text-muted-foreground">{ventesStats?.semaine.count || 0} ventes</p>
        </div>

        {/* CA mois */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="w-4 h-4 text-accent" />
            <span className="text-xs text-muted-foreground">Ce Mois</span>
          </div>
          <p className="text-2xl font-bold">{formatPrix(caMois)} <span className="text-base font-normal">GNF</span></p>
          <p className="text-xs text-muted-foreground">{ventesStats?.mois.count || 0} ventes</p>
        </div>

        {/* Actions rapides - Plus proéminentes */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => navigate('/ventes')}
            className="bg-primary text-primary-foreground rounded-xl p-4 active:scale-95 transition-transform shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <Plus className="w-5 h-5" />
              <ChevronRight className="w-4 h-4 opacity-50" />
            </div>
            <p className="text-sm font-semibold text-left">Nouvelle Vente</p>
          </button>

          <button
            onClick={() => navigate('/approvisionnements')}
            className="bg-accent text-accent-foreground rounded-xl p-4 active:scale-95 transition-transform shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <Truck className="w-5 h-5" />
              <ChevronRight className="w-4 h-4 opacity-50" />
            </div>
            <p className="text-sm font-semibold text-left">Approvisionner</p>
          </button>
        </div>

        {/* Nombre d'articles */}
        <button
          onClick={() => navigate('/stock')}
          className="w-full bg-card rounded-xl border border-border p-4 text-left active:bg-accent/5 transition-colors"
        >
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Articles en Stock</span>
          </div>
          <p className="text-2xl font-bold">{stockStats?.totalArticles || 0}</p>
        </button>

        {/* Valeur du stock */}
        <button
          onClick={() => navigate('/stock')}
          className="w-full bg-card rounded-xl border border-border p-4 text-left active:bg-accent/5 transition-colors"
        >
          <div className="flex items-center gap-2 mb-2">
            <Warehouse className="w-4 h-4 text-accent" />
            <span className="text-xs text-muted-foreground">Valeur du Stock</span>
          </div>
          <p className="text-2xl font-bold">{formatPrix(stockStats?.valeurTotaleStock || 0)} <span className="text-base font-normal">GNF</span></p>
        </button>

        {/* Alertes stock */}
        {((stockStats?.articlesEnRupture || 0) > 0 || (stockStats?.articlesStockFaible || 0) > 0) && (
          <button
            onClick={() => navigate('/stock')}
            className="w-full bg-destructive/5 border-l-4 border-destructive rounded-xl p-4 text-left active:bg-destructive/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-destructive">
                  {(stockStats?.articlesEnRupture || 0) + (stockStats?.articlesStockFaible || 0)} articles en alerte
                </p>
                <p className="text-xs text-muted-foreground truncate">Stock critique - Tapez pour voir</p>
              </div>
              <ChevronRight className="w-5 h-5 text-destructive flex-shrink-0" />
            </div>
          </button>
        )}

        {/* Clients - Card épurée */}
        <button
          onClick={() => navigate('/clients')}
          className="w-full bg-card rounded-xl border border-border p-4 text-left active:bg-accent/5 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Clients actifs</p>
                <p className="text-xl font-bold">{clientsStats?.total || 0}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>

          {(clientsStats?.avecCredits || 0) > 0 && (
            <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-warning"></div>
              <p className="text-xs text-warning font-medium">
                {clientsStats?.avecCredits} avec crédits en cours
              </p>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default MobileDashboard;
