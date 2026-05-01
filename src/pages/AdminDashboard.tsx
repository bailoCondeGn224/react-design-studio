import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  AlertTriangle,
  Clock,
  UserCheck,
  Truck,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useVentesStats } from '@/hooks/useVentes';
import { useStockStats } from '@/hooks/useStock';
import { useStatsClients } from '@/hooks/useClients';
import { useStatsFournisseurs } from '@/hooks/useFournisseurs';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { data: ventesStats } = useVentesStats();
  const { data: stockStats } = useStockStats();
  const { data: clientsStats } = useStatsClients();
  const { data: fournisseursStats } = useStatsFournisseurs();

  // Données pour les graphiques (à remplacer par vraies données de l'API)
  const ventesParJour = [
    { jour: 'Lun', ventes: 45000, objectif: 50000 },
    { jour: 'Mar', ventes: 52000, objectif: 50000 },
    { jour: 'Mer', ventes: 48000, objectif: 50000 },
    { jour: 'Jeu', ventes: 61000, objectif: 50000 },
    { jour: 'Ven', ventes: 72000, objectif: 50000 },
    { jour: 'Sam', ventes: 85000, objectif: 50000 },
    { jour: 'Dim', ventes: 38000, objectif: 50000 },
  ];

  const categoriesVentes = [
    { nom: 'Vêtements', montant: 125000, pourcentage: 35 },
    { nom: 'Accessoires', montant: 85000, pourcentage: 24 },
    { nom: 'Chaussures', montant: 75000, pourcentage: 21 },
    { nom: 'Autres', montant: 71000, pourcentage: 20 },
  ];

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--success))', 'hsl(var(--warning))'];

  const evolutionMensuelle = [
    { mois: 'Jan', ca: 420000, benefice: 105000 },
    { mois: 'Fév', ca: 510000, benefice: 127500 },
    { mois: 'Mar', ca: 480000, benefice: 120000 },
    { mois: 'Avr', ca: 630000, benefice: 157500 },
  ];

  const formatPrix = (prix: number) => {
    return new Intl.NumberFormat('fr-GN', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0,
    })
      .format(prix)
      .replace('GNF', 'GNF');
  };

  const calculerCroissance = (actuel: number, precedent: number) => {
    if (precedent === 0) return 0;
    return ((actuel - precedent) / precedent) * 100;
  };

  // KPIs
  const caJour = ventesStats?.jour.total || 0;
  const caSemaine = ventesStats?.semaine.total || 0;
  const caMois = ventesStats?.mois.total || 0;
  const croissanceSemaine = 12.5; // À calculer depuis l'API

  return (
    <AppLayout>
      <PageHeader
        title="Dashboard Administrateur"
        description="Vue d'ensemble complète de votre entreprise"
      />

      {/* KPIs Principaux */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="CA Aujourd'hui"
          value={formatPrix(caJour)}
          subtitle={`${ventesStats?.jour.count || 0} ventes`}
          icon={<DollarSign className="w-5 h-5 text-primary" />}
          variant="gold"
        />
        <StatCard
          title="CA Semaine"
          value={formatPrix(caSemaine)}
          subtitle={
            <div className="flex items-center gap-1">
              {croissanceSemaine >= 0 ? (
                <TrendingUp className="w-3 h-3 text-success" />
              ) : (
                <TrendingDown className="w-3 h-3 text-destructive" />
              )}
              <span className={croissanceSemaine >= 0 ? 'text-success' : 'text-destructive'}>
                {croissanceSemaine >= 0 ? '+' : ''}
                {croissanceSemaine.toFixed(1)}%
              </span>
            </div>
          }
          icon={<TrendingUp className="w-5 h-5 text-success" />}
        />
        <StatCard
          title="CA Mois"
          value={formatPrix(caMois)}
          subtitle={`${ventesStats?.mois.count || 0} ventes`}
          icon={<ShoppingCart className="w-5 h-5 text-accent" />}
        />
        <StatCard
          title="Valeur Stock"
          value={formatPrix(stockStats?.valeurTotaleStock || 0)}
          subtitle={`${stockStats?.totalArticles || 0} articles`}
          icon={<Package className="w-5 h-5 text-primary" />}
        />
      </div>

      {/* Alertes & KPIs secondaires */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="shadow-card border-l-4 border-l-destructive">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Stock Critique</p>
                <p className="text-2xl font-bold text-destructive">
                  {stockStats?.articlesEnRupture || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Articles en rupture</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-destructive opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-l-4 border-l-warning">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Stock Faible</p>
                <p className="text-2xl font-bold text-warning">
                  {stockStats?.articlesStockFaible || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Nécessite réappro</p>
              </div>
              <Clock className="w-8 h-8 text-warning opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Clients Actifs</p>
                <p className="text-2xl font-bold text-primary">{clientsStats?.total || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {clientsStats?.avecCredits || 0} avec crédits
                </p>
              </div>
              <UserCheck className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-l-4 border-l-accent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fournisseurs</p>
                <p className="text-2xl font-bold text-accent">{fournisseursStats?.actifs || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Dette: {formatPrix(fournisseursStats?.totalDette || 0)}
                </p>
              </div>
              <Truck className="w-8 h-8 text-accent opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Ventes par jour */}
        <Card className="shadow-card">
          <CardHeader>
            <h3 className="font-heading font-semibold text-sm sm:text-base text-foreground">Ventes de la Semaine</h3>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ventesParJour}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="jour" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="ventes" fill="hsl(var(--primary))" name="Ventes" radius={[8, 8, 0, 0]} />
                <Bar dataKey="objectif" fill="hsl(var(--muted))" name="Objectif" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Répartition par catégorie */}
        <Card className="shadow-card">
          <CardHeader>
            <h3 className="font-heading font-semibold text-sm sm:text-base text-foreground">Ventes par Catégorie</h3>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoriesVentes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ nom, pourcentage }) => `${nom} (${pourcentage}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="montant"
                >
                  {categoriesVentes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => formatPrix(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Évolution Mensuelle */}
      <Card className="shadow-card mb-6">
        <CardHeader>
          <h3 className="font-heading font-semibold text-sm sm:text-base text-foreground">Évolution CA & Bénéfices (4 derniers mois)</h3>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={evolutionMensuelle}>
              <defs>
                <linearGradient id="colorCA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorBenefice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="mois" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => formatPrix(value)}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="ca"
                stroke="hsl(var(--primary))"
                fillOpacity={1}
                fill="url(#colorCA)"
                name="Chiffre d'Affaires"
              />
              <Area
                type="monotone"
                dataKey="benefice"
                stroke="hsl(var(--success))"
                fillOpacity={1}
                fill="url(#colorBenefice)"
                name="Bénéfices"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Actions Rapides */}
      <Card className="shadow-card">
        <CardHeader>
          <h3 className="font-heading font-semibold text-sm sm:text-base text-foreground">Actions Rapides</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/ventes')}
              className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed hover:border-primary hover:bg-primary/5 transition-all"
            >
              <div className="p-2 rounded-full bg-primary/10">
                <ShoppingCart className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold">Nouvelle Vente</p>
                <p className="text-xs text-muted-foreground">Enregistrer une vente</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/approvisionnements')}
              className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed hover:border-accent hover:bg-accent/5 transition-all"
            >
              <div className="p-2 rounded-full bg-accent/10">
                <Truck className="w-5 h-5 text-accent" />
              </div>
              <div className="text-left">
                <p className="font-semibold">Approvisionnement</p>
                <p className="text-xs text-muted-foreground">Gérer le stock</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/clients')}
              className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed hover:border-success hover:bg-success/5 transition-all"
            >
              <div className="p-2 rounded-full bg-success/10">
                <Users className="w-5 h-5 text-success" />
              </div>
              <div className="text-left">
                <p className="font-semibold">Nouveau Client</p>
                <p className="text-xs text-muted-foreground">Ajouter un client</p>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default AdminDashboard;
