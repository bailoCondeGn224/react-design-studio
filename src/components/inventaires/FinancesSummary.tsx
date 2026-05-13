import { useState } from 'react';
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  AlertCircle,
  Calendar,
  PiggyBank,
  Target,
  Percent,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Inventaire, categorieDepenseLabels } from '@/types';
import { useCalculerFinances } from '@/hooks/useInventaires';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { generateFinancesPDF } from '@/utils/pdfGenerator';

interface FinancesSummaryProps {
  inventaire: Inventaire;
}

const FinancesSummary = ({ inventaire }: FinancesSummaryProps) => {
  const calculerFinancesMutation = useCalculerFinances();
  const [isCalculating, setIsCalculating] = useState(false);

  const formatMontant = (montant: number | string) => {
    const value = typeof montant === 'string' ? parseFloat(montant) : montant;
    return new Intl.NumberFormat('fr-GN', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleCalculer = async () => {
    setIsCalculating(true);
    try {
      await calculerFinancesMutation.mutateAsync(inventaire.id);
    } finally {
      setIsCalculating(false);
    }
  };

  if (!inventaire.financesCalcules) {
    return (
      <Card className="bg-gradient-to-br from-card to-secondary/30 border-2 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Calculator className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Finances non calculées</h3>
          <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
            Calculez les finances de cette période pour voir le chiffre d'affaires,
            les dépenses, les pertes et le bénéfice net
          </p>
          <Button
            onClick={handleCalculer}
            disabled={isCalculating}
            size="lg"
            className="gradient-gold"
          >
            {isCalculating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Calcul en cours...
              </>
            ) : (
              <>
                <Calculator className="w-4 h-4 mr-2" />
                Calculer les finances
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const beneficeIsPositive = parseFloat(inventaire.beneficeNet?.toString() || '0') >= 0;
  const beneficeBrutIsPositive = parseFloat(inventaire.beneficeBrut?.toString() || '0') >= 0;

  const handleDownloadPDF = () => {
    try {
      const doc = generateFinancesPDF(inventaire);
      doc.save(`Rapport-Finances-${format(new Date(inventaire.date), 'yyyy-MM-dd')}.pdf`);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Période */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5" />
              Période financière
            </CardTitle>
            <Button
              onClick={handleDownloadPDF}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Télécharger le rapport PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Du</span>
            <span className="font-semibold">
              {inventaire.dateDebut
                ? format(new Date(inventaire.dateDebut), 'dd MMM yyyy', { locale: fr })
                : '-'}
            </span>
            <span className="text-muted-foreground">au</span>
            <span className="font-semibold">
              {inventaire.dateFin
                ? format(new Date(inventaire.dateFin), 'dd MMM yyyy', { locale: fr })
                : '-'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Finances calculées le{' '}
            {inventaire.financesCalculesLe
              ? format(new Date(inventaire.financesCalculesLe), 'dd MMM yyyy à HH:mm', {
                  locale: fr,
                })
              : '-'}
          </p>
        </CardContent>
      </Card>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Chiffre d'affaires */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  Chiffre d'Affaires
                </p>
                <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                  {formatMontant(inventaire.chiffreAffaires || 0)}
                </p>
              </div>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              {inventaire.nombreVentes || 0} vente(s)
            </p>
          </CardContent>
        </Card>

        {/* CMV */}
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <Receipt className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                  Coût Marchandises
                </p>
                <p className="text-xl font-bold text-orange-900 dark:text-orange-100">
                  {formatMontant(inventaire.coutMarchandises || 0)}
                </p>
              </div>
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-400">CMV</p>
          </CardContent>
        </Card>

        {/* Bénéfice Brut */}
        <Card
          className={`bg-gradient-to-br ${
            beneficeBrutIsPositive
              ? 'from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800'
              : 'from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800'
          }`}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <div
                className={`w-10 h-10 rounded-lg ${
                  beneficeBrutIsPositive ? 'bg-green-500/20' : 'bg-red-500/20'
                } flex items-center justify-center`}
              >
                {beneficeBrutIsPositive ? (
                  <TrendingUp
                    className={`w-5 h-5 ${
                      beneficeBrutIsPositive
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                )}
              </div>
              <div className="flex-1">
                <p
                  className={`text-xs font-medium ${
                    beneficeBrutIsPositive
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  Bénéfice Brut
                </p>
                <p
                  className={`text-xl font-bold ${
                    beneficeBrutIsPositive
                      ? 'text-green-900 dark:text-green-100'
                      : 'text-red-900 dark:text-red-100'
                  }`}
                >
                  {formatMontant(inventaire.beneficeBrut || 0)}
                </p>
              </div>
            </div>
            <p
              className={`text-xs ${
                beneficeBrutIsPositive
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              CA - CMV
            </p>
          </CardContent>
        </Card>

        {/* Bénéfice Net */}
        <Card
          className={`bg-gradient-to-br ${
            beneficeIsPositive
              ? 'from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200 dark:border-emerald-800'
              : 'from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800'
          }`}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <div
                className={`w-10 h-10 rounded-lg ${
                  beneficeIsPositive ? 'bg-emerald-500/20' : 'bg-red-500/20'
                } flex items-center justify-center`}
              >
                <PiggyBank
                  className={`w-5 h-5 ${
                    beneficeIsPositive
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                />
              </div>
              <div className="flex-1">
                <p
                  className={`text-xs font-medium ${
                    beneficeIsPositive
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  Bénéfice Net
                </p>
                <p
                  className={`text-xl font-bold ${
                    beneficeIsPositive
                      ? 'text-emerald-900 dark:text-emerald-100'
                      : 'text-red-900 dark:text-red-100'
                  }`}
                >
                  {formatMontant(inventaire.beneficeNet || 0)}
                </p>
              </div>
            </div>
            <p
              className={`text-xs ${
                beneficeIsPositive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              Résultat final
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Dépenses par catégorie */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Receipt className="w-5 h-5" />
            Dépenses par catégorie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">
                {categorieDepenseLabels.FIXE}
              </p>
              <p className="text-lg font-bold text-amber-900 dark:text-amber-100">
                {formatMontant(inventaire.depensesFixes || 0)}
              </p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
              <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">
                {categorieDepenseLabels.VARIABLE}
              </p>
              <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
                {formatMontant(inventaire.depensesVariables || 0)}
              </p>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">
                {categorieDepenseLabels.EXCEPTIONNELLE}
              </p>
              <p className="text-lg font-bold text-red-900 dark:text-red-100">
                {formatMontant(inventaire.depensesExceptionnelles || 0)}
              </p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-secondary rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total des dépenses</span>
              <span className="text-lg font-bold">
                {formatMontant(inventaire.totalDepenses || 0)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pertes et Indicateurs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pertes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertCircle className="w-5 h-5 text-destructive" />
              Pertes d'inventaire
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Valeur des pertes</span>
                <span className="text-lg font-bold text-destructive">
                  {formatMontant(inventaire.totalPertes || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Articles manquants</span>
                <span className="text-lg font-bold text-destructive">
                  {formatMontant(inventaire.valeurArticlesManquants || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Articles abîmés</span>
                <span className="text-lg font-bold text-destructive">
                  {formatMontant(inventaire.valeurArticlesAbimes || 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Indicateurs de performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="w-5 h-5 text-primary" />
              Indicateurs de performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Percent className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Taux de marge</span>
                </div>
                <span className="text-lg font-bold">
                  {inventaire.tauxMarge
                    ? `${parseFloat(inventaire.tauxMarge.toString()).toFixed(1)}%`
                    : '0%'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Rentabilité</span>
                </div>
                <span className="text-lg font-bold">
                  {inventaire.tauxRentabilite
                    ? `${parseFloat(inventaire.tauxRentabilite.toString()).toFixed(1)}%`
                    : '0%'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancesSummary;
