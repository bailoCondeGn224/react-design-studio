import { useRef, useState } from "react";
import {
  CheckCircle,
  Calculator,
  Wallet,
  Coins,
  TrendingUp,
  ShoppingBag,
  Wheat,
  Landmark,
  Sparkles,
  Download,
  Loader2
} from "lucide-react";
import { ZakatCalculation } from "@/api/zakat";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const formatPrix = (prix: number) => {
  return new Intl.NumberFormat('fr-GN', {
    style: 'currency',
    currency: 'GNF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(prix);
};

interface ZakatResultCardProps {
  calculation: ZakatCalculation;
  onMarkPaid?: () => void;
  isMarkingPaid?: boolean;
}

const ZakatResultCard = ({ calculation, onMarkPaid, isMarkingPaid }: ZakatResultCardProps) => {
  const isPaid = calculation.statut === 'PAYE';
  const contentRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;

    setIsDownloading(true);
    try {
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      // Ajouter un titre
      pdf.setFontSize(18);
      pdf.setTextColor(139, 92, 42); // Couleur dorée
      pdf.text('Attestation de Zakat', pdfWidth / 2, 15, { align: 'center' });

      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Année ${calculation.annee}`, pdfWidth / 2, 22, { align: 'center' });

      // Ajouter l'image du calcul
      pdf.addImage(imgData, 'PNG', imgX, 30, imgWidth * ratio * 0.9, imgHeight * ratio * 0.9);

      // Footer
      const footerY = pdfHeight - 15;
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text('Document généré automatiquement - Gestion Boutique', pdfWidth / 2, footerY, { align: 'center' });
      pdf.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, pdfWidth / 2, footerY + 4, { align: 'center' });

      pdf.save(`zakat-${calculation.annee}-${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const categories = [
    {
      label: 'Liquidités',
      value: calculation.totalLiquidites,
      icon: Wallet,
      color: 'text-amber-600 bg-amber-100',
      details: [
        { label: 'Cash maison', value: calculation.cashMaison },
        { label: 'Banque', value: calculation.cashBanque },
        { label: 'Mobile Money', value: calculation.cashMobile },
      ].filter(d => d.value > 0)
    },
    {
      label: 'Or & Argent',
      value: calculation.totalOrArgent,
      icon: Coins,
      color: 'text-yellow-600 bg-yellow-100',
      details: [
        { label: `Or (${calculation.orPoids}g)`, value: calculation.orPoids * calculation.orPrixGramme },
        { label: `Argent (${calculation.argentPoids}g)`, value: calculation.argentPoids * calculation.argentPrixGramme },
      ].filter(d => d.value > 0)
    },
    {
      label: 'Investissements',
      value: calculation.totalInvestissements,
      icon: TrendingUp,
      color: 'text-blue-600 bg-blue-100',
      details: [
        { label: 'Actions', value: calculation.investActions },
        { label: 'Immobilier', value: calculation.investImmobilier },
        { label: 'Autres', value: calculation.investAutres },
      ].filter(d => d.value > 0)
    },
    {
      label: 'Commerce',
      value: calculation.totalCommerce,
      icon: ShoppingBag,
      color: 'text-purple-600 bg-purple-100',
      details: [
        { label: 'Stock', value: calculation.comStockValeur },
        { label: 'Créances', value: calculation.comCreances },
        { label: 'Liquidités', value: calculation.comLiquidites },
      ].filter(d => d.value > 0)
    },
  ].filter(c => c.value > 0);

  return (
    <div className="space-y-6">
      {/* Bouton télécharger */}
      <div className="flex justify-end">
        <button
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="h-10 px-4 rounded-lg border border-border bg-background text-foreground text-sm font-medium hover:bg-secondary/50 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Génération...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Télécharger PDF
            </>
          )}
        </button>
      </div>

      {/* Contenu à capturer pour le PDF */}
      <div ref={contentRef} className="space-y-6 bg-background p-1">
        {/* Header avec résultat principal */}
        <div className={`bg-card border rounded-lg shadow-card overflow-hidden ${
        isPaid
          ? 'border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30'
          : 'border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30'
      }`}>
        <div className="p-6">
          <div className="text-center">
            <div className={`w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
              isPaid ? 'bg-emerald-100' : 'bg-amber-100'
            }`}>
              {isPaid ? (
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              ) : (
                <Sparkles className="w-10 h-10 text-amber-600" />
              )}
            </div>

            <h2 className="text-lg font-medium text-muted-foreground mb-2">
              {isPaid ? 'Zakat Payée' : 'Zakat à Payer'}
            </h2>

            <p className={`text-4xl sm:text-5xl font-bold mb-4 ${
              isPaid ? 'text-emerald-600' : 'text-amber-600'
            }`}>
              {formatPrix(calculation.zakatTotal)}
            </p>

            <p className="text-sm text-muted-foreground">
              Calculé le {formatDate(calculation.dateCalcul)}
              {calculation.datePaiement && (
                <> • Payé le {formatDate(calculation.datePaiement)}</>
              )}
            </p>

            {!isPaid && onMarkPaid && calculation.zakatTotal > 0 && (
              <button
                onClick={onMarkPaid}
                disabled={isMarkingPaid}
                className="mt-6 h-12 px-8 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-semibold shadow-elevated transition-all disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
              >
                {isMarkingPaid ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Marquer comme payée
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Détail par catégorie */}
      <div className="bg-card border border-border rounded-lg shadow-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Calculator className="w-5 h-5 text-muted-foreground" />
            Détail du calcul
          </h3>
        </div>
        <div className="p-4 space-y-4">
          {categories.map((cat, index) => {
            const Icon = cat.icon;
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cat.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-medium">{cat.label}</span>
                  </div>
                  <span className="font-bold">{formatPrix(cat.value)}</span>
                </div>
                {cat.details.length > 0 && (
                  <div className="ml-10 space-y-1">
                    {cat.details.map((detail, idx) => (
                      <div key={idx} className="flex justify-between text-sm text-muted-foreground">
                        <span>{detail.label}</span>
                        <span>{formatPrix(detail.value)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Agriculture */}
          {calculation.hasAgriculture && calculation.zakatAgriculture > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-100 text-green-600">
                    <Wheat className="w-4 h-4" />
                  </div>
                  <span className="font-medium">Agriculture</span>
                </div>
                <span className="font-bold">{formatPrix(calculation.zakatAgriculture)}</span>
              </div>
              <div className="ml-10 space-y-1 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Récolte ({calculation.agriQuantiteKg} kg)</span>
                  <span>{formatPrix(calculation.agriValeurRecolte)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Irrigation: {calculation.agriIrrigation}</span>
                  <span>{calculation.agriIrrigation === 'PLUIE' ? '10%' : calculation.agriIrrigation === 'ARTIFICIEL' ? '5%' : '7.5%'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Bétail */}
          {calculation.hasBetail && calculation.zakatBetail > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-orange-100 text-orange-600">
                    <span>🐄</span>
                  </div>
                  <span className="font-medium">Bétail</span>
                </div>
                <span className="font-bold">{formatPrix(calculation.zakatBetail)}</span>
              </div>
              <div className="ml-10 space-y-1 text-sm text-muted-foreground">
                {calculation.betailOvins > 0 && (
                  <div className="flex justify-between">
                    <span>Ovins</span>
                    <span>{calculation.betailOvins} têtes</span>
                  </div>
                )}
                {calculation.betailCaprins > 0 && (
                  <div className="flex justify-between">
                    <span>Caprins</span>
                    <span>{calculation.betailCaprins} têtes</span>
                  </div>
                )}
                {calculation.betailBovins > 0 && (
                  <div className="flex justify-between">
                    <span>Bovins</span>
                    <span>{calculation.betailBovins} têtes</span>
                  </div>
                )}
                {calculation.betailChameaux > 0 && (
                  <div className="flex justify-between">
                    <span>Chameaux</span>
                    <span>{calculation.betailChameaux} têtes</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Séparateur */}
          <div className="border-t border-border pt-4 mt-4">
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Total Actifs</span>
              <span className="font-medium">{formatPrix(calculation.totalActifs)}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-red-600 flex items-center gap-2">
                <Landmark className="w-4 h-4" />
                Dettes
              </span>
              <span className="font-medium text-red-600">-{formatPrix(calculation.totalDettes)}</span>
            </div>
            <div className="flex items-center justify-between py-2 bg-secondary/30 rounded-lg px-3 -mx-3">
              <span className="font-medium">Montant Zakatable</span>
              <span className="font-bold text-lg">{formatPrix(calculation.montantZakatable)}</span>
            </div>
          </div>

          {/* Nisab info */}
          <div className={`p-3 rounded-lg ${calculation.assujetti ? 'bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200' : 'bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-200'}`}>
            <p className="text-sm">
              <span className="font-medium">Nisab utilisé: </span>
              {formatPrix(calculation.nisabUtilise)}
            </p>
            <p className={`text-xs mt-1 ${calculation.assujetti ? 'text-amber-700 dark:text-amber-300' : 'text-emerald-700 dark:text-emerald-300'}`}>
              {calculation.assujetti
                ? 'Votre patrimoine dépasse le Nisab, la Zakat est obligatoire.'
                : 'Votre patrimoine est inférieur au Nisab, pas de Zakat obligatoire.'}
            </p>
          </div>

          {/* Résumé Zakat */}
          <div className="border-t border-border pt-4 space-y-2">
            {calculation.zakatMal > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Zakat al-Mal (2.5%)</span>
                <span className="font-medium">{formatPrix(calculation.zakatMal)}</span>
              </div>
            )}
            {calculation.zakatAgriculture > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Zakat Agriculture</span>
                <span className="font-medium">{formatPrix(calculation.zakatAgriculture)}</span>
              </div>
            )}
            {calculation.zakatBetail > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Zakat Bétail</span>
                <span className="font-medium">{formatPrix(calculation.zakatBetail)}</span>
              </div>
            )}
            <div className={`flex justify-between items-center py-3 px-4 -mx-4 rounded-xl ${
              isPaid
                ? 'bg-emerald-100 dark:bg-emerald-900/30'
                : 'bg-amber-100 dark:bg-amber-900/30'
            }`}>
              <span className="font-bold">TOTAL ZAKAT</span>
              <span className={`text-2xl font-bold ${isPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                {formatPrix(calculation.zakatTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>
      </div>
      {/* Fin du contenu PDF */}

      {/* Notes */}
      {calculation.notes && (
        <div className="bg-card border border-border rounded-lg shadow-card p-4">
          <p className="text-sm text-muted-foreground">{calculation.notes}</p>
        </div>
      )}
    </div>
  );
};

export default ZakatResultCard;
