import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Calculator,
  Plus,
  CheckCircle,
  Clock,
  Coins,
  TrendingUp,
  History,
  Settings,
  RefreshCw,
  Sparkles,
  Eye,
  Trash2,
  Calendar
} from "lucide-react";
import {
  useZakatCalculations,
  useZakatStatistics,
  useZakatSettings,
  useZakatPrefilledData,
  useCreateZakat,
  useMarkZakatPaid,
  useDeleteZakat,
  useRefreshZakatPrices,
} from "@/hooks/useZakat";
import ZakatMobileCard from "@/components/zakat/ZakatMobileCard";
import ZakatCalculatorForm from "@/components/zakat/ZakatCalculatorForm";
import ZakatResultCard from "@/components/zakat/ZakatResultCard";
import { ZakatCalculation, CreateZakatDto } from "@/api/zakat";

const formatPrix = (prix: number) => {
  return new Intl.NumberFormat('fr-GN', {
    style: 'currency',
    currency: 'GNF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(prix);
};

type ViewMode = 'list' | 'create' | 'detail';
type StatusFilter = 'all' | 'pending' | 'paid';

const Zakat = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedCalculation, setSelectedCalculation] = useState<ZakatCalculation | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Hooks
  const { data: calculations = [], isLoading } = useZakatCalculations();
  const { data: statistics } = useZakatStatistics();
  const { data: settings } = useZakatSettings();
  const { data: prefilledData } = useZakatPrefilledData();
  const createZakat = useCreateZakat();
  const markPaid = useMarkZakatPaid();
  const deleteZakat = useDeleteZakat();
  const refreshPrices = useRefreshZakatPrices();

  // Filtrage
  const filteredCalculations = useMemo(() => {
    switch (statusFilter) {
      case 'pending':
        return calculations.filter(c => c.statut === 'CALCULE');
      case 'paid':
        return calculations.filter(c => c.statut === 'PAYE');
      default:
        return calculations;
    }
  }, [calculations, statusFilter]);

  const filterCounts = useMemo(() => ({
    all: calculations.length,
    pending: calculations.filter(c => c.statut === 'CALCULE').length,
    paid: calculations.filter(c => c.statut === 'PAYE').length,
  }), [calculations]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleCreate = (data: CreateZakatDto) => {
    createZakat.mutate(data, {
      onSuccess: (result) => {
        setSelectedCalculation(result);
        setViewMode('detail');
      },
    });
  };

  const handleView = (calc: ZakatCalculation) => {
    setSelectedCalculation(calc);
    setViewMode('detail');
  };

  const handleMarkPaid = (id: string) => {
    markPaid.mutate(id, {
      onSuccess: (result) => {
        if (selectedCalculation?.id === id) {
          setSelectedCalculation(result);
        }
      },
    });
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteZakat.mutate(deleteId, {
        onSuccess: () => {
          if (selectedCalculation?.id === deleteId) {
            setViewMode('list');
            setSelectedCalculation(null);
          }
          setDeleteId(null);
        },
      });
    }
  };

  const handleBack = () => {
    setViewMode('list');
    setSelectedCalculation(null);
  };

  // Stats cards data
  const statsCards = [
    {
      title: "Nisab Actuel",
      value: settings ? formatPrix(settings.nisabGnf) : "...",
      subtitle: "85g d'or",
      icon: Coins,
      color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30",
    },
    {
      title: "Zakat Payée",
      value: formatPrix(statistics?.totalZakatPaid || 0),
      subtitle: `${statistics?.paidCount || 0} calcul(s)`,
      icon: CheckCircle,
      color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30",
    },
    {
      title: "Zakat en Attente",
      value: formatPrix(statistics?.totalZakatPending || 0),
      subtitle: `${statistics?.pendingCount || 0} calcul(s)`,
      icon: Clock,
      color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30",
    },
    {
      title: "Prix Or",
      value: settings ? formatPrix(settings.prixOrGrammeGnf) + "/g" : "...",
      subtitle: "Mis à jour via API",
      icon: TrendingUp,
      color: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30",
    },
  ];

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Vue création
  if (viewMode === 'create') {
    return (
      <AppLayout>
        <PageHeader
          title="Calculer ma Zakat"
          description="Remplissez les informations sur votre patrimoine"
          backButton={true}
          onBack={handleBack}
        />

        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-4 sm:p-6">
            <ZakatCalculatorForm
              settings={settings}
              prefilledData={prefilledData}
              onSubmit={handleCreate}
              isSubmitting={createZakat.isPending}
            />
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  // Vue détail
  if (viewMode === 'detail' && selectedCalculation) {
    return (
      <AppLayout>
        <PageHeader
          title={`Zakat ${selectedCalculation.annee}`}
          description={`Calculé le ${formatDate(selectedCalculation.dateCalcul)}`}
          backButton={true}
          onBack={handleBack}
          action={
            <button
              onClick={() => setDeleteId(selectedCalculation.id)}
              className="px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer
            </button>
          }
        />

        <div className="max-w-2xl mx-auto">
          <ZakatResultCard
            calculation={selectedCalculation}
            onMarkPaid={() => handleMarkPaid(selectedCalculation.id)}
            isMarkingPaid={markPaid.isPending}
          />
        </div>

        {/* Dialog suppression */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer ce calcul ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. Le calcul sera définitivement supprimé.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AppLayout>
    );
  }

  // Vue liste (par défaut)
  return (
    <AppLayout>
      <PageHeader
        title="Zakat"
        description="Calculez et gérez votre Zakat annuelle"
        action={
          <button
            onClick={() => setViewMode('create')}
            className="gradient-gold text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-elevated hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Calculer ma Zakat
          </button>
        }
      />

      {/* Stats Cards - Desktop */}
      <div className="hidden md:grid md:grid-cols-4 gap-4 mb-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{stat.title}</p>
                    <p className="text-xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Stats Cards - Mobile (horizontal scroll) */}
      <div className="md:hidden overflow-x-auto pb-4 -mx-4 px-4 mb-4">
        <div className="flex gap-3 min-w-max">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="min-w-[180px] flex-shrink-0">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">{stat.title}</p>
                      <p className="text-sm font-bold">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* CTA si pas de calculs */}
      {calculations.length === 0 && (
        <Card className="mb-6 border-2 border-dashed border-primary/20">
          <CardContent className="py-12 text-center">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Calculez votre Zakat</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              La Zakat est un pilier de l'Islam. Calculez facilement le montant dû sur votre patrimoine.
            </p>
            <button
              onClick={() => setViewMode('create')}
              className="gradient-gold text-primary-foreground px-6 py-3 rounded-lg text-sm font-semibold inline-flex items-center gap-2 shadow-elevated hover:opacity-90 transition-opacity"
            >
              <Calculator className="w-5 h-5" />
              Commencer le calcul
            </button>
          </CardContent>
        </Card>
      )}

      {/* Historique des calculs */}
      {calculations.length > 0 && (
        <>
          {/* Filtres */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2 overflow-x-auto pb-2 -mb-2">
              {[
                { key: 'all' as const, label: 'Tous', icon: History },
                { key: 'pending' as const, label: 'En attente', icon: Clock },
                { key: 'paid' as const, label: 'Payées', icon: CheckCircle },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setStatusFilter(key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    statusFilter === key
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                  <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                    statusFilter === key ? 'bg-primary/20' : 'bg-muted'
                  }`}>
                    {filterCounts[key]}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => refreshPrices.mutate()}
              disabled={refreshPrices.isPending}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshPrices.isPending ? 'animate-spin' : ''}`} />
              Actualiser prix
            </button>
          </div>

          {/* Liste Mobile */}
          <div className="md:hidden space-y-3">
            {filteredCalculations.length === 0 ? (
              <Card className="p-8 text-center">
                <History className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">Aucun calcul dans cette catégorie</p>
              </Card>
            ) : (
              filteredCalculations.map((calc) => (
                <ZakatMobileCard
                  key={calc.id}
                  calculation={calc}
                  onView={handleView}
                  onMarkPaid={handleMarkPaid}
                  onDelete={setDeleteId}
                  formatDate={formatDate}
                />
              ))
            )}
          </div>

          {/* Table Desktop */}
          <div className="hidden md:block">
            <Card>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground px-4 py-3">Date</th>
                      <th className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground px-4 py-3">Année</th>
                      <th className="text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground px-4 py-3">Actifs</th>
                      <th className="text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground px-4 py-3">Zakat</th>
                      <th className="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground px-4 py-3">Statut</th>
                      <th className="text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredCalculations.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                          <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
                          <p>Aucun calcul dans cette catégorie</p>
                        </td>
                      </tr>
                    ) : (
                      filteredCalculations.map((calc) => (
                        <tr key={calc.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">{formatDate(calc.dateCalcul)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-medium">{calc.annee}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="font-medium">{formatPrix(calc.totalActifs)}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={`font-bold ${calc.statut === 'PAYE' ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {formatPrix(calc.zakatTotal)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                              calc.statut === 'PAYE'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                            }`}>
                              {calc.statut === 'PAYE' ? (
                                <><CheckCircle className="w-3 h-3" /> Payée</>
                              ) : (
                                <><Clock className="w-3 h-3" /> En attente</>
                              )}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleView(calc)}
                                className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors"
                                title="Voir"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {calc.statut !== 'PAYE' && calc.zakatTotal > 0 && (
                                <button
                                  onClick={() => handleMarkPaid(calc.id)}
                                  disabled={markPaid.isPending}
                                  className="p-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-lg text-emerald-600 transition-colors disabled:opacity-50"
                                  title="Marquer payée"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => setDeleteId(calc.id)}
                                className="p-2 hover:bg-destructive/10 rounded-lg text-destructive transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Actions rapides */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => navigate('/zakat/settings')}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-muted transition-colors"
        >
          <Settings className="w-4 h-4" />
          Paramètres Zakat
        </button>
        <button
          onClick={() => refreshPrices.mutate()}
          disabled={refreshPrices.isPending}
          className="flex-1 sm:hidden flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshPrices.isPending ? 'animate-spin' : ''}`} />
          Actualiser les prix
        </button>
      </div>

      {/* Dialog suppression */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce calcul ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le calcul sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default Zakat;
