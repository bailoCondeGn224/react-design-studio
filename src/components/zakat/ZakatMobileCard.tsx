import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Calculator,
  CheckCircle,
  MoreHorizontal,
  Trash2,
  Eye,
  Coins,
  Calendar
} from "lucide-react";
import { ZakatCalculation } from "@/api/zakat";

const formatPrix = (prix: number) => {
  return new Intl.NumberFormat('fr-GN', {
    style: 'currency',
    currency: 'GNF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(prix);
};

interface ZakatMobileCardProps {
  calculation: ZakatCalculation;
  onView: (calc: ZakatCalculation) => void;
  onMarkPaid: (id: string) => void;
  onDelete: (id: string) => void;
  formatDate: (date: string) => string;
}

const ZakatMobileCard = ({
  calculation,
  onView,
  onMarkPaid,
  onDelete,
  formatDate,
}: ZakatMobileCardProps) => {
  const isPaid = calculation.statut === 'PAYE';
  const isAssujetti = calculation.assujetti;

  return (
    <div className={`bg-card border border-border rounded-lg shadow-card overflow-hidden transition-all duration-300 ${
      isPaid
        ? 'border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-50/50 to-transparent dark:from-emerald-950/20'
        : isAssujetti
          ? 'border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50/30 to-transparent dark:from-amber-950/10'
          : 'border-l-4 border-l-muted'
    }`}>
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isPaid
                ? 'bg-emerald-100 dark:bg-emerald-900/30'
                : 'bg-amber-100 dark:bg-amber-900/30'
            }`}>
              {isPaid ? (
                <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Calculator className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Zakat {calculation.annee}
              </h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(calculation.dateCalcul)}
              </p>
            </div>
          </div>
          <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
            isPaid
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
          }`}>
            {isPaid ? 'Payée' : 'À payer'}
          </div>
        </div>
      </div>

      {/* Montants */}
      <div className="px-4 pb-3 grid grid-cols-2 gap-3">
        <div className="bg-secondary/30 rounded-lg p-3">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
            Total Actifs
          </p>
          <p className="text-sm font-bold text-foreground">
            {formatPrix(calculation.totalActifs)}
          </p>
        </div>
        <div className={`rounded-lg p-3 ${
          isPaid
            ? 'bg-emerald-100/50 dark:bg-emerald-900/20'
            : 'bg-amber-100/50 dark:bg-amber-900/20'
        }`}>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
            Zakat Due
          </p>
          <p className={`text-sm font-bold ${
            isPaid ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'
          }`}>
            {formatPrix(calculation.zakatTotal)}
          </p>
        </div>
      </div>

      {/* Détails rapides */}
      <div className="px-4 pb-3 flex items-center gap-4 text-xs text-muted-foreground">
        {calculation.totalOrArgent > 0 && (
          <span className="flex items-center gap-1">
            <Coins className="w-3 h-3 text-amber-500" />
            Or/Argent
          </span>
        )}
        {calculation.hasAgriculture && (
          <span className="flex items-center gap-1">
            🌾 Agriculture
          </span>
        )}
        {calculation.hasBetail && (
          <span className="flex items-center gap-1">
            🐄 Bétail
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="p-3 pt-0">
        <Sheet>
          <SheetTrigger asChild>
            <button className="w-full h-11 rounded-lg border border-border bg-background text-foreground font-medium hover:bg-secondary/50 transition-colors flex items-center justify-center gap-2">
              <MoreHorizontal className="w-4 h-4" />
              Actions
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto max-h-[85vh] rounded-t-2xl">
            <SheetHeader className="pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                  isPaid ? 'bg-emerald-100' : 'bg-amber-100'
                }`}>
                  {isPaid ? (
                    <CheckCircle className="w-7 h-7 text-emerald-600" />
                  ) : (
                    <Calculator className="w-7 h-7 text-amber-600" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <SheetTitle className="text-lg">Zakat {calculation.annee}</SheetTitle>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(calculation.dateCalcul)}
                  </p>
                </div>
              </div>
            </SheetHeader>

            {/* Résumé détaillé */}
            <div className="py-4 space-y-3 border-b border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Actifs totaux</span>
                <span className="font-semibold">{formatPrix(calculation.totalActifs)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Dettes</span>
                <span className="font-semibold text-red-600">-{formatPrix(calculation.totalDettes)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Montant zakatable</span>
                <span className="font-semibold">{formatPrix(calculation.montantZakatable)}</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Zakat à payer</span>
                <span className={`text-lg font-bold ${isPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {formatPrix(calculation.zakatTotal)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 space-y-2">
              <button
                onClick={() => onView(calculation)}
                className="w-full h-12 rounded-lg border border-border bg-background text-foreground font-medium hover:bg-secondary/50 transition-colors flex items-center justify-start px-4 gap-3"
              >
                <Eye className="w-5 h-5" />
                Voir les détails
              </button>

              {!isPaid && calculation.zakatTotal > 0 && (
                <button
                  onClick={() => onMarkPaid(calculation.id)}
                  className="w-full h-12 rounded-lg border border-emerald-200 bg-background text-emerald-600 font-medium hover:bg-emerald-50 transition-colors flex items-center justify-start px-4 gap-3"
                >
                  <CheckCircle className="w-5 h-5" />
                  Marquer comme payée
                </button>
              )}

              <div className="pt-2 mt-2 border-t border-border">
                <button
                  onClick={() => onDelete(calculation.id)}
                  className="w-full h-12 rounded-lg border border-destructive/30 bg-background text-destructive font-medium hover:bg-destructive/10 transition-colors flex items-center justify-start px-4 gap-3"
                >
                  <Trash2 className="w-5 h-5" />
                  Supprimer
                </button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default ZakatMobileCard;
