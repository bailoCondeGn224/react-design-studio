import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import {
  Package, ShoppingCart, Users, Wallet, TrendingUp,
  AlertTriangle, ArrowUpRight, UserCheck, Truck
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { useVentesStats, useVentesRecent } from "@/hooks/useVentes";
import { useStockStats, useStockAlerts } from "@/hooks/useStock";
import { useTopClients } from "@/hooks/useClients";
import { useApprovisionnements } from "@/hooks/useApprovisionnements";
import { useStatsFournisseurs } from "@/hooks/useFournisseurs";

const Dashboard = () => {
  // Données temporaires pour les graphiques (à remplacer par vraies données quand disponibles)
  const salesData = [
    { name: "Lun", ventes: 45 },
    { name: "Mar", ventes: 62 },
    { name: "Mer", ventes: 38 },
    { name: "Jeu", ventes: 71 },
    { name: "Ven", ventes: 89 },
    { name: "Sam", ventes: 95 },
    { name: "Dim", ventes: 30 },
  ];

  const revenueData = [
    { name: "Jan", montant: 4200 },
    { name: "Fév", montant: 5100 },
    { name: "Mar", montant: 4800 },
    { name: "Avr", montant: 6300 },
  ];
  const { data: ventesStats } = useVentesStats();
  const { data: stockStats } = useStockStats();
  const { data: recentVentes = [] } = useVentesRecent();
  const { data: stockAlerts = [] } = useStockAlerts();
  const { data: topClients = [] } = useTopClients(5);
  const { data: approvisionnementsResponse } = useApprovisionnements({ page: 1, limit: 10 });
  const approvisionnements = approvisionnementsResponse?.data || [];
  const { data: fournisseursStats } = useStatsFournisseurs();

  const formatPrix = (prix: number) => {
    return new Intl.NumberFormat('fr-GN', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0
    }).format(prix).replace('GNF', 'GNF');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);

    if (diff < 60) return `Il y a ${diff} min`;
    if (diff < 1440) return `Il y a ${Math.floor(diff / 60)}h`;
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  };

  // Prendre les 3 derniers approvisionnements
  const dernierAppros = approvisionnements.slice(0, 3);

  return (
    <AppLayout>
      <PageHeader
        title="Tableau de Bord"
        description="Vue d'ensemble de votre activité — Avril 2026"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6 sm:mb-8">
        <StatCard
          title="Chiffre d'Affaires"
          value={formatPrix(ventesStats?.mois?.total || 0)}
          subtitle="Ce mois"
          icon={<Wallet className="w-5 h-5 text-primary" />}
          trend={{ value: "12%", positive: true }}
          variant="gold"
        />
        <StatCard
          title="Ventes du Jour"
          value={String(ventesStats?.jour?.count || 0)}
          subtitle={formatPrix(ventesStats?.jour?.total || 0)}
          icon={<ShoppingCart className="w-5 h-5 text-primary" />}
          trend={{ value: "8%", positive: true }}
        />
        <StatCard
          title="Articles en Stock"
          value={String(stockStats?.total || 0)}
          subtitle={`${stockStats?.enAlerte || 0} en alerte`}
          icon={<Package className="w-5 h-5 text-accent" />}
        />
        <StatCard
          title="Dettes Fournisseurs"
          value={formatPrix(fournisseursStats?.totalDette || 0)}
          subtitle={`${fournisseursStats?.fournisseursEnDette || 0} fournisseurs`}
          icon={<AlertTriangle className="w-5 h-5 text-destructive" />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 mb-6 sm:mb-8">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-4 sm:p-5 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <div>
              <h3 className="font-heading font-semibold text-sm sm:text-base text-foreground">Ventes de la Semaine</h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Nombre d'articles vendus par jour</p>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-success font-semibold">
              <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> <span>+15%</span> <span className="hidden sm:inline">vs semaine précédente</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200} className="sm:h-[220px]">
            <BarChart data={salesData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(0 0% 30%)" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(0 0% 30%)" }} />
              <Tooltip
                contentStyle={{
                  background: "hsl(120 25% 96%)",
                  border: "1px solid hsl(120 35% 75%)",
                  borderRadius: "8px",
                  fontSize: "13px",
                }}
              />
              <Bar dataKey="ventes" fill="hsl(119, 80%, 35%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Trend */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-card">
          <h3 className="font-heading font-semibold text-sm sm:text-base text-foreground mb-1">Tendance Revenus</h3>
          <p className="text-[10px] sm:text-xs text-muted-foreground mb-3 sm:mb-4">4 derniers mois (en milliers GNF)</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(119, 80%, 35%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(119, 80%, 35%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(0 0% 30%)" }} />
              <Tooltip
                contentStyle={{
                  background: "hsl(120 25% 96%)",
                  border: "1px solid hsl(120 35% 75%)",
                  borderRadius: "8px",
                  fontSize: "13px",
                }}
              />
              <Area type="monotone" dataKey="montant" stroke="hsl(119, 80%, 35%)" fill="url(#goldGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {/* Recent Sales */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-card">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="font-heading font-semibold text-sm sm:text-base text-foreground">Ventes Récentes</h3>
            <button className="text-[10px] sm:text-xs text-primary font-medium flex items-center gap-1 hover:underline">
              Voir tout <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2 sm:space-y-3">
            {recentVentes.slice(0, 4).map((sale: any) => (
              <div key={sale.id} className="flex items-center justify-between py-2 sm:py-2.5 border-b border-border last:border-0">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <ShoppingCart className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-foreground truncate">{sale.clientNom}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{sale.numero}</p>
                  </div>
                </div>
                <div className="text-right ml-2">
                  <p className="text-xs sm:text-sm font-bold text-foreground whitespace-nowrap">{formatPrix(sale.total)}</p>
                  <p className="text-[10px] text-muted-foreground whitespace-nowrap">{formatDate(sale.createdAt)}</p>
                </div>
              </div>
            ))}
            {recentVentes.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Aucune vente récente</p>
            )}
          </div>
        </div>

        {/* Stock Alerts */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-card">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="font-heading font-semibold text-sm sm:text-base text-foreground">Alertes Stock</h3>
            <button className="text-[10px] sm:text-xs text-destructive font-medium flex items-center gap-1 hover:underline">
              Voir tout <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2 sm:space-y-3">
            {stockAlerts.slice(0, 3).map((alert: any) => {
              const percentage = (alert.stock / alert.seuilAlerte) * 100;
              const isCritical = percentage <= 30;
              return (
                <div key={alert.id} className="py-2 sm:py-2.5 border-b border-border last:border-0">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-start gap-2 min-w-0 flex-1">
                      <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isCritical ? 'text-destructive' : 'text-warning'}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-semibold text-foreground truncate">{alert.nom}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Zone {alert.zone}</p>
                      </div>
                    </div>
                    <span className={`text-xs sm:text-sm font-bold whitespace-nowrap ${isCritical ? 'text-destructive' : 'text-warning'}`}>
                      {alert.stock} / {alert.seuilAlerte}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isCritical ? 'bg-destructive' : 'bg-warning'}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {stockAlerts.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Aucune alerte de stock</p>
            )}
          </div>
        </div>
      </div>

      {/* New Row: Top Clients & Recent Approvisionnements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mt-6">
        {/* Top Clients */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-card">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="font-heading font-semibold text-sm sm:text-base text-foreground">Top 5 Clients</h3>
            <UserCheck className="w-4 h-4 text-primary" />
          </div>
          <div className="space-y-2 sm:space-y-3">
            {topClients.map((client: any, index: number) => (
              <div key={client.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-primary">
                    {index + 1}
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-foreground truncate">{client.nom}</p>
                </div>
                <p className="text-xs sm:text-sm font-bold text-primary whitespace-nowrap ml-2">
                  {formatPrix(client.totalAchats)}
                </p>
              </div>
            ))}
            {topClients.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Aucun client</p>
            )}
          </div>
        </div>

        {/* Recent Approvisionnements */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-card">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="font-heading font-semibold text-sm sm:text-base text-foreground">Derniers Approvisionnements</h3>
            <Truck className="w-4 h-4 text-success" />
          </div>
          <div className="space-y-2 sm:space-y-3">
            {dernierAppros.map((appro: any) => (
              <div key={appro.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                    <Truck className="w-4 h-4 text-success" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-foreground truncate">{appro.fournisseurNom}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{appro.numero}</p>
                  </div>
                </div>
                <p className="text-xs sm:text-sm font-bold text-foreground whitespace-nowrap ml-2">
                  {formatPrix(appro.total)}
                </p>
              </div>
            ))}
            {dernierAppros.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Aucun approvisionnement</p>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
