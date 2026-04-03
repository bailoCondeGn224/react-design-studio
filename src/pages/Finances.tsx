import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { Wallet, TrendingUp, TrendingDown, ArrowDownRight, ArrowUpRight, FileText } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const charges = [
  { name: "Achats fournisseurs", value: 3200, color: "hsl(36, 70%, 50%)" },
  { name: "Loyer boutique", value: 800, color: "hsl(160, 35%, 35%)" },
  { name: "Salaires", value: 1200, color: "hsl(20, 15%, 35%)" },
  { name: "Livraison", value: 300, color: "hsl(36, 40%, 65%)" },
  { name: "Marketing", value: 200, color: "hsl(160, 25%, 55%)" },
  { name: "Divers", value: 400, color: "hsl(20, 8%, 60%)" },
];

const transactions = [
  { desc: "Ventes du jour", montant: "+680 000 GNF", type: "in", date: "03/04" },
  { desc: "Achat Bazin — Al-Nour", montant: "-1 200 000 GNF", type: "out", date: "02/04" },
  { desc: "Ventes du jour", montant: "+540 000 GNF", type: "in", date: "02/04" },
  { desc: "Loyer Avril", montant: "-800 000 GNF", type: "out", date: "01/04" },
  { desc: "Salaires Mars", montant: "-1 200 000 GNF", type: "out", date: "31/03" },
  { desc: "Ventes B2B — Oumar Bah", montant: "+925 000 GNF", type: "in", date: "31/03" },
];

const Finances = () => {
  return (
    <AppLayout>
      <PageHeader
        title="Gestion Financière"
        description="Trésorerie, charges et rapports financiers"
        action={
          <button className="gradient-gold text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-elevated hover:opacity-90 transition-opacity">
            <FileText className="w-4 h-4" /> Rapport Mensuel
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <StatCard
          title="Trésorerie Disponible"
          value="4 250 000 GNF"
          subtitle="Seuil minimum : 1 500 000 GNF"
          icon={<Wallet className="w-5 h-5 text-primary" />}
          variant="gold"
        />
        <StatCard
          title="Recettes du Mois"
          value="6 340 000 GNF"
          icon={<TrendingUp className="w-5 h-5 text-success" />}
          trend={{ value: "12%", positive: true }}
        />
        <StatCard
          title="Dépenses du Mois"
          value="6 100 000 GNF"
          icon={<TrendingDown className="w-5 h-5 text-destructive" />}
          trend={{ value: "5%", positive: false }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Charges Breakdown */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-card">
          <h3 className="font-heading font-semibold text-foreground mb-4">Répartition des Charges</h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie data={charges} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {charges.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: number) => `${val} 000 GNF`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1">
              {charges.map((c, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="text-muted-foreground">{c.name}</span>
                  </div>
                  <span className="font-medium text-foreground">{c.value} 000</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-card">
          <h3 className="font-heading font-semibold text-foreground mb-4">Dernières Transactions</h3>
          <div className="space-y-2">
            {transactions.map((t, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    t.type === "in" ? "bg-success/10" : "bg-destructive/10"
                  }`}>
                    {t.type === "in" 
                      ? <ArrowUpRight className="w-4 h-4 text-success" />
                      : <ArrowDownRight className="w-4 h-4 text-destructive" />
                    }
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.desc}</p>
                    <p className="text-xs text-muted-foreground">{t.date}</p>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${
                  t.type === "in" ? "text-success" : "text-destructive"
                }`}>{t.montant}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Finances;
