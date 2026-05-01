import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import {
  Building2,
  Users,
  ShoppingCart,
  Package,
  TrendingUp,
  TrendingDown,
  UserPlus,
  Building,
  Activity,
} from 'lucide-react';
import {
  useGlobalStats,
  useOrganizationsByPlan,
  useGrowthStats,
  useRecentActivity,
} from '@/hooks/useAdminDashboard';
import { Badge } from '@/components/ui/badge';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Utiliser les couleurs du thème système au lieu de valeurs hardcodées
const getChartColors = () => {
  const style = getComputedStyle(document.documentElement);
  return [
    `hsl(${style.getPropertyValue('--primary')})`,
    `hsl(${style.getPropertyValue('--accent')})`,
    `hsl(${style.getPropertyValue('--warning')})`,
    `hsl(${style.getPropertyValue('--success')})`,
    `hsl(${style.getPropertyValue('--destructive')})`,
  ];
};

const SuperAdminDashboard = () => {
  // Charger les statistiques avec les hooks personnalisés
  const { data: globalStats } = useGlobalStats();
  const { data: organizationsByPlan } = useOrganizationsByPlan();
  const { data: growthStats } = useGrowthStats();
  const { data: recentActivity } = useRecentActivity();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatGrowth = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const CHART_COLORS = getChartColors();

  return (
    <AppLayout>
      <PageHeader
        title="Dashboard Super Admin"
        description="Vue d'ensemble de la plateforme multi-tenant"
      />

      {/* KPIs Principaux */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Organizations */}
        <div className="bg-gradient-to-br from-primary/10 via-card to-card border border-primary/20 rounded-xl p-5 shadow-card">
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <p className="text-xs text-muted-foreground mb-1">Total Organizations</p>
          <p className="text-2xl font-bold text-foreground mb-1">
            {globalStats?.totalOrganizations || 0}
          </p>
          <p className="text-xs text-muted-foreground">
            {globalStats?.activeOrganizations || 0} actives
          </p>
        </div>

        {/* Total Utilisateurs */}
        <div className="bg-gradient-to-br from-success/10 via-card to-card border border-success/20 rounded-xl p-5 shadow-card">
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-success" />
            </div>
            <TrendingUp className="w-5 h-5 text-success" />
          </div>
          <p className="text-xs text-muted-foreground mb-1">Total Utilisateurs</p>
          <p className="text-2xl font-bold text-foreground mb-1">
            {globalStats?.totalUsers || 0}
          </p>
          <p className="text-xs text-muted-foreground">Hors super admins</p>
        </div>

        {/* Total Ventes */}
        <div className="bg-gradient-to-br from-warning/10 via-card to-card border border-warning/20 rounded-xl p-5 shadow-card">
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-warning" />
            </div>
            <Activity className="w-5 h-5 text-warning" />
          </div>
          <p className="text-xs text-muted-foreground mb-1">Total Ventes</p>
          <p className="text-2xl font-bold text-foreground mb-1">
            {globalStats?.totalVentes || 0}
          </p>
          <p className="text-xs text-muted-foreground">
            {globalStats?.totalClients || 0} clients
          </p>
        </div>

        {/* Total Articles */}
        <div className="bg-gradient-to-br from-accent/10 via-card to-card border border-accent/20 rounded-xl p-5 shadow-card">
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <Package className="w-6 h-6 text-accent" />
            </div>
            <TrendingUp className="w-5 h-5 text-accent" />
          </div>
          <p className="text-xs text-muted-foreground mb-1">Total Articles</p>
          <p className="text-2xl font-bold text-foreground mb-1">
            {globalStats?.totalArticles || 0}
          </p>
          <p className="text-xs text-muted-foreground">Dans toutes les orgs</p>
        </div>
      </div>

      {/* Statistiques de Croissance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Croissance des Organizations */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Croissance des Organizations</h3>
          </div>

          {growthStats && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Ce mois</p>
                    <p className="text-xs text-muted-foreground">Nouvelles orgs</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-primary">
                  {growthStats.organizations.thisMonth}
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Building className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Mois dernier</p>
                    <p className="text-xs text-muted-foreground">Comparaison</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {growthStats.organizations.lastMonth}
                </p>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Taux de croissance</span>
                  <Badge
                    variant={
                      growthStats.organizations.growth >= 0
                        ? 'default'
                        : 'destructive'
                    }
                    className="text-sm px-3 py-1 flex items-center gap-1"
                  >
                    {growthStats.organizations.growth >= 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {formatGrowth(growthStats.organizations.growth)}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Croissance des Utilisateurs */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Croissance des Utilisateurs</h3>
          </div>

          {growthStats && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-success/5 rounded-lg border border-success/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Ce mois</p>
                    <p className="text-xs text-muted-foreground">Nouveaux users</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-success">
                  {growthStats.users.thisMonth}
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Mois dernier</p>
                    <p className="text-xs text-muted-foreground">Comparaison</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {growthStats.users.lastMonth}
                </p>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Taux de croissance</span>
                  <Badge
                    variant={
                      growthStats.users.growth >= 0 ? 'default' : 'destructive'
                    }
                    className="text-sm px-3 py-1 flex items-center gap-1"
                  >
                    {growthStats.users.growth >= 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {formatGrowth(growthStats.users.growth)}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Répartition par Plan + Organizations Récentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Répartition par Plan */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Répartition par Plan</h3>
          </div>

          {organizationsByPlan && organizationsByPlan.length > 0 ? (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={organizationsByPlan}
                    cx="50%"
                    cy="45%"
                    labelLine={false}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    outerRadius={window.innerWidth < 640 ? 70 : 85}
                    innerRadius={window.innerWidth < 640 ? 40 : 50}
                    fill="#8884d8"
                    dataKey="count"
                    paddingAngle={2}
                  >
                    {organizationsByPlan.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(value: any, name: any, props: any) => [
                      `${value} organisation${value > 1 ? 's' : ''}`,
                      props.payload.plan
                    ]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    formatter={(value, entry: any) => (
                      <span className="text-xs text-foreground">
                        {entry.payload.plan} ({entry.payload.count})
                      </span>
                    )}
                    wrapperStyle={{
                      fontSize: '12px',
                      paddingTop: '10px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
              Aucune donnée disponible
            </div>
          )}
        </div>

        {/* Organizations Récentes */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Building className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Organizations Récentes</h3>
          </div>

          <div className="space-y-3 max-h-[250px] overflow-y-auto">
            {recentActivity?.recentOrganizations?.slice(0, 5).map((org) => (
              <div
                key={org.id}
                className="p-4 bg-secondary/30 rounded-lg border border-border hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-semibold text-foreground flex-1 truncate">
                    {org.nom}
                  </p>
                  <Badge variant={org.actif ? 'default' : 'secondary'} className="text-xs ml-2">
                    {org.actif ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="font-semibold text-foreground">
                    {org.plan?.nom || 'Sans plan'}
                  </span>
                </div>
                {org.createdAt && (
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-muted-foreground">Créée le</span>
                    <span className="font-semibold text-foreground">{formatDate(org.createdAt)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Utilisateurs Récents */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Utilisateurs Récents</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentActivity?.recentUsers?.slice(0, 6).map((user) => (
            <div
              key={user.id}
              className="p-4 bg-secondary/30 rounded-lg border border-border hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm font-semibold text-foreground flex-1 truncate">
                  {user.nom}
                </p>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium text-foreground truncate ml-2 max-w-[150px]">
                  {user.email}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-muted-foreground">Organization</span>
                <span className="font-semibold text-foreground truncate ml-2 max-w-[120px]">
                  {user.organization?.nom || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-muted-foreground">Rôle</span>
                <span className="font-semibold text-foreground">
                  {user.role?.nom || 'Sans rôle'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default SuperAdminDashboard;
