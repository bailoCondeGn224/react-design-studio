import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { Wallet, TrendingUp, TrendingDown, ArrowDownRight, ArrowUpRight, FileText } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useTresorerie, useRecettesMois, useDepensesMois, useChargesBreakdown, useTransactions } from "@/hooks/useFinances";

const Finances = () => {
  const { data: tresorerie } = useTresorerie();
  const { data: recettes } = useRecettesMois();
  const { data: depenses } = useDepensesMois();
  const { data: chargesBreakdown = [] } = useChargesBreakdown();
  const { data: transactionsResponse } = useTransactions({ page: 1, limit: 50 });
  const transactions = transactionsResponse?.data || [];

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
      month: '2-digit'
    });
  };

  // Couleurs pour le graphique
  const COLORS = [
    "hsl(119, 80%, 35%)",
    "hsl(119, 70%, 40%)",
    "hsl(119, 60%, 45%)",
    "hsl(119, 50%, 55%)",
    "hsl(138, 60%, 45%)",
    "hsl(0, 0%, 55%)"
  ];

  const chargesData = chargesBreakdown.map((c: any, i: number) => ({
    name: c.categorie,
    value: c.total,
    color: COLORS[i % COLORS.length]
  }));

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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 mb-6 sm:mb-8">
        <StatCard
          title="Trésorerie Disponible"
          value={formatPrix(tresorerie?.solde || 0)}
          subtitle="Solde actuel"
          icon={<Wallet className="w-5 h-5 text-primary" />}
          variant="gold"
        />
        <StatCard
          title="Recettes du Mois"
          value={formatPrix(recettes?.total || 0)}
          subtitle={`${recettes?.count || 0} transactions`}
          icon={<TrendingUp className="w-5 h-5 text-success" />}
        />
        <StatCard
          title="Dépenses du Mois"
          value={formatPrix(depenses?.total || 0)}
          subtitle={`${depenses?.count || 0} transactions`}
          icon={<TrendingDown className="w-5 h-5 text-destructive" />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {/* Charges Breakdown */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-card">
          <h3 className="font-heading font-semibold text-foreground mb-4">Répartition des Charges</h3>
          {chargesData.length > 0 ? (
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="w-full sm:w-[180px] h-[180px] flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chargesData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                      {chargesData.map((entry: any, i: number) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val: number) => formatPrix(val)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 flex-1 w-full">
                {chargesData.map((c: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                      <span className="text-muted-foreground text-xs sm:text-sm">{c.name}</span>
                    </div>
                    <span className="font-semibold text-foreground text-xs sm:text-sm">{formatPrix(c.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">Aucune charge enregistrée</p>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-card">
          <h3 className="font-heading font-semibold text-foreground mb-4">Transactions Récentes</h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {transactions.slice(0, 10).map((t: any) => (
              <div key={t.id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    t.type === 'IN' ? 'bg-success/10' : 'bg-destructive/10'
                  }`}>
                    {t.type === 'IN' ? (
                      <ArrowUpRight className="w-4 h-4 text-success" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-destructive" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{t.description}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(t.date)}</p>
                  </div>
                </div>
                <span className={`text-sm font-bold whitespace-nowrap ml-2 ${
                  t.type === 'IN' ? 'text-success' : 'text-destructive'
                }`}>
                  {t.type === 'IN' ? '+' : '-'}{formatPrix(t.montant)}
                </span>
              </div>
            ))}
            {transactions.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">Aucune transaction</p>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Finances;
