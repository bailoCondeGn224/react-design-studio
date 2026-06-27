import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import {
  Coins,
  RefreshCw,
  Save,
  Clock,
  AlertCircle,
  DollarSign
} from "lucide-react";
import {
  useZakatSettings,
  useUpdateZakatSettings,
  useRefreshZakatPrices,
} from "@/hooks/useZakat";

const formatPrix = (prix: number) => {
  return new Intl.NumberFormat('fr-GN', {
    style: 'currency',
    currency: 'GNF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(prix);
};

const ZakatSettings = () => {
  const { data: settings, isLoading } = useZakatSettings();
  const updateSettings = useUpdateZakatSettings();
  const refreshPrices = useRefreshZakatPrices();

  const [formData, setFormData] = useState({
    prixMouton: 0,
    prixVeau1an: 0,
    prixVeau2ans: 0,
    prixVache: 0,
    prixChamelle1an: 0,
    prixChamelle2ans: 0,
    prixChameauAdulte: 0,
    tauxUsdGnf: 0,
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        prixMouton: Number(settings.prixMouton) || 0,
        prixVeau1an: Number(settings.prixVeau1an) || 0,
        prixVeau2ans: Number(settings.prixVeau2ans) || 0,
        prixVache: Number(settings.prixVache) || 0,
        prixChamelle1an: Number(settings.prixChamelle1an) || 0,
        prixChamelle2ans: Number(settings.prixChamelle2ans) || 0,
        prixChameauAdulte: Number(settings.prixChameauAdulte) || 0,
        tauxUsdGnf: Number(settings.tauxUsdGnf) || 0,
      });
    }
  }, [settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate(formData);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Jamais';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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

  return (
    <AppLayout>
      <PageHeader
        title="Paramètres Zakat"
        description="Configurez les prix et paramètres de calcul"
        backButton={true}
      />

      <form onSubmit={handleSave} className="max-w-2xl mx-auto space-y-5">
        {/* Section Prix des métaux */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-500/5 via-background to-background border-2 border-border p-4 sm:p-5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -mr-12 -mt-12"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Coins className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Prix des Métaux Précieux</h3>
                  <p className="text-xs text-muted-foreground">Mis à jour via API</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => refreshPrices.mutate()}
                disabled={refreshPrices.isPending}
                className="px-3 py-2 rounded-lg border border-border bg-background text-xs font-medium text-foreground hover:bg-secondary/50 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshPrices.isPending ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/10 dark:to-amber-900/10 border border-yellow-200/50">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">🥇</span>
                  <span className="text-xs font-medium text-muted-foreground">Or (24k)</span>
                </div>
                <p className="text-lg font-bold text-yellow-700 dark:text-yellow-400">
                  {formatPrix(Number(settings?.prixOrGrammeGnf) || 0)}/g
                </p>
                <p className="text-[10px] text-muted-foreground">
                  ${Number(settings?.prixOrGrammeUsd || 0).toFixed(2)} USD
                </p>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/10 dark:to-slate-900/10 border border-gray-200/50">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">🥈</span>
                  <span className="text-xs font-medium text-muted-foreground">Argent</span>
                </div>
                <p className="text-lg font-bold text-gray-700 dark:text-gray-300">
                  {formatPrix(Number(settings?.prixArgentGrammeGnf) || 0)}/g
                </p>
                <p className="text-[10px] text-muted-foreground">
                  ${Number(settings?.prixArgentGrammeUsd || 0).toFixed(2)} USD
                </p>
              </div>
            </div>

            {/* Nisab */}
            <div className="p-3 rounded-lg bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 mb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-300">Nisab Actuel</p>
                  <p className="text-[10px] text-muted-foreground">85 grammes d'or</p>
                </div>
                <p className="text-xl font-bold text-amber-600">{formatPrix(Number(settings?.nisabGnf) || 0)}</p>
              </div>
            </div>

            {/* Taux de change */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/30">
              <div className="flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs">Taux USD/GNF</span>
              </div>
              <span className="text-sm font-medium">{Number(settings?.tauxUsdGnf || 0).toLocaleString()}</span>
            </div>

            {/* Dernière mise à jour */}
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-3">
              <Clock className="w-3 h-3" />
              Dernière mise à jour: {formatDate(settings?.lastPriceUpdate)}
            </div>
          </div>
        </div>

        {/* Section Prix du bétail */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500/5 via-background to-background border-2 border-border p-4 sm:p-5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full -mr-12 -mt-12"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <span className="text-base">🐄</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Prix du Bétail</h3>
                <p className="text-xs text-muted-foreground">Pour le calcul de la Zakat sur le bétail</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  🐑 Mouton
                </label>
                <input
                  type="number"
                  value={formData.prixMouton || ''}
                  onChange={(e) => setFormData({ ...formData, prixMouton: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 h-11 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  🐂 Veau (1 an)
                </label>
                <input
                  type="number"
                  value={formData.prixVeau1an || ''}
                  onChange={(e) => setFormData({ ...formData, prixVeau1an: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 h-11 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  🐂 Veau (2 ans)
                </label>
                <input
                  type="number"
                  value={formData.prixVeau2ans || ''}
                  onChange={(e) => setFormData({ ...formData, prixVeau2ans: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 h-11 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  🐄 Vache adulte
                </label>
                <input
                  type="number"
                  value={formData.prixVache || ''}
                  onChange={(e) => setFormData({ ...formData, prixVache: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 h-11 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  🐪 Chamelle (1 an)
                </label>
                <input
                  type="number"
                  value={formData.prixChamelle1an || ''}
                  onChange={(e) => setFormData({ ...formData, prixChamelle1an: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 h-11 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  🐪 Chamelle (2 ans)
                </label>
                <input
                  type="number"
                  value={formData.prixChamelle2ans || ''}
                  onChange={(e) => setFormData({ ...formData, prixChamelle2ans: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 h-11 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="0"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  🐫 Chameau adulte
                </label>
                <input
                  type="number"
                  value={formData.prixChameauAdulte || ''}
                  onChange={(e) => setFormData({ ...formData, prixChameauAdulte: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 h-11 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Info box */}
            <div className="mt-4 p-3 rounded-lg bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200/50">
              <p className="text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                Ces prix convertissent la Zakat en bétail en équivalent monétaire. Mettez-les à jour selon le marché local.
              </p>
            </div>
          </div>
        </div>

        {/* Section Taux de change */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500/5 via-background to-background border-2 border-border p-4 sm:p-5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full -mr-12 -mt-12"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Taux de Change</h3>
                <p className="text-xs text-muted-foreground">Ajustez manuellement si nécessaire</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                💱 Taux USD → GNF
              </label>
              <input
                type="number"
                value={formData.tauxUsdGnf || ''}
                onChange={(e) => setFormData({ ...formData, tauxUsdGnf: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 h-11 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Bouton sauvegarder */}
        <button
          type="submit"
          disabled={updateSettings.isPending}
          className="w-full gradient-gold text-primary-foreground py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 shadow-elevated hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {updateSettings.isPending ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5" />
              Enregistrer les modifications
            </>
          )}
        </button>
      </form>
    </AppLayout>
  );
};

export default ZakatSettings;
