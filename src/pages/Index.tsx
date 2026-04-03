import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { 
  Package, ShoppingCart, Users, Wallet, TrendingUp, 
  AlertTriangle, ArrowUpRight, Clock
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

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

const recentSales = [
  { id: 1, client: "Fatimata D.", article: "Abaya Noire Premium", montant: "85 000 GNF", time: "Il y a 12 min" },
  { id: 2, client: "Aissatou B.", article: "Lot Foulards Soie (x5)", montant: "125 000 GNF", time: "Il y a 34 min" },
  { id: 3, client: "Mamadou S.", article: "Bazin Riche Bleu 10m", montant: "350 000 GNF", time: "Il y a 1h" },
  { id: 4, client: "Kadiatou C.", article: "Djellaba Brodée", montant: "120 000 GNF", time: "Il y a 2h" },
];

const stockAlerts = [
  { article: "Foulards Coton Blanc", stock: 8, seuil: 20, zone: "Zone B" },
  { article: "Abaya Bleu Marine M", stock: 3, seuil: 10, zone: "Zone A" },
  { article: "Bazin Doré", stock: 2, seuil: 5, zone: "Zone C" },
];

const Dashboard = () => {
  return (
    <AppLayout>
      <PageHeader
        title="Tableau de Bord"
        description="Vue d'ensemble de votre activité — Avril 2026"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Chiffre d'Affaires"
          value="6 340 000 GNF"
          subtitle="Ce mois"
          icon={<Wallet className="w-5 h-5 text-primary" />}
          trend={{ value: "12%", positive: true }}
          variant="gold"
        />
        <StatCard
          title="Ventes du Jour"
          value="23"
          subtitle="680 000 GNF encaissés"
          icon={<ShoppingCart className="w-5 h-5 text-primary" />}
          trend={{ value: "8%", positive: true }}
        />
        <StatCard
          title="Articles en Stock"
          value="1 247"
          subtitle="4 catégories"
          icon={<Package className="w-5 h-5 text-accent" />}
          trend={{ value: "3%", positive: false }}
        />
        <StatCard
          title="Fournisseurs Actifs"
          value="12"
          subtitle="2 en attente de livraison"
          icon={<Users className="w-5 h-5 text-accent" />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-semibold text-foreground">Ventes de la Semaine</h3>
              <p className="text-xs text-muted-foreground">Nombre d'articles vendus par jour</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-success font-semibold">
              <TrendingUp className="w-3.5 h-3.5" /> +15% vs semaine précédente
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={salesData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(20 8% 50%)" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(20 8% 50%)" }} />
              <Tooltip
                contentStyle={{
                  background: "hsl(40 30% 99%)",
                  border: "1px solid hsl(36 20% 88%)",
                  borderRadius: "8px",
                  fontSize: "13px",
                }}
              />
              <Bar dataKey="ventes" fill="hsl(36, 70%, 50%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Trend */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-card">
          <h3 className="font-heading font-semibold text-foreground mb-1">Tendance Revenus</h3>
          <p className="text-xs text-muted-foreground mb-4">4 derniers mois (en milliers GNF)</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(36, 70%, 50%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(36, 70%, 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(20 8% 50%)" }} />
              <Tooltip
                contentStyle={{
                  background: "hsl(40 30% 99%)",
                  border: "1px solid hsl(36 20% 88%)",
                  borderRadius: "8px",
                  fontSize: "13px",
                }}
              />
              <Area type="monotone" dataKey="montant" stroke="hsl(36, 70%, 50%)" fill="url(#goldGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Sales */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-foreground">Ventes Récentes</h3>
            <button className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
              Voir tout <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {recentSales.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-sm font-semibold text-secondary-foreground">
                    {sale.client.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{sale.client}</p>
                    <p className="text-xs text-muted-foreground">{sale.article}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{sale.montant}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                    <Clock className="w-3 h-3" /> {sale.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stock Alerts */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-foreground">Alertes Stock</h3>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-destructive/10 text-destructive">
              {stockAlerts.length} alertes
            </span>
          </div>
          <div className="space-y-3">
            {stockAlerts.map((alert, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{alert.article}</p>
                  <p className="text-xs text-muted-foreground">{alert.zone} — Seuil : {alert.seuil}</p>
                </div>
                <span className="text-lg font-heading font-bold text-destructive">{alert.stock}</span>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors">
            Gérer le réapprovisionnement
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
