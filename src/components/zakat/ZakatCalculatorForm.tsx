import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  Coins,
  TrendingUp,
  ShoppingBag,
  Wheat,
  PiggyBank,
  ArrowRight,
  ArrowLeft,
  Calculator,
  Check,
  AlertCircle,
  Info,
  Sparkles,
  Landmark
} from "lucide-react";
import { CreateZakatDto, ZakatSettings, ZakatPrefilledData } from "@/api/zakat";
import { formatPrixInput, handlePrixChange } from "@/utils/format-prix";

const formatPrix = (prix: number) => {
  return new Intl.NumberFormat('fr-GN', {
    style: 'currency',
    currency: 'GNF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(prix);
};

interface ZakatCalculatorFormProps {
  settings: ZakatSettings | undefined;
  prefilledData?: ZakatPrefilledData;
  onSubmit: (data: CreateZakatDto) => void;
  isSubmitting: boolean;
}

type Step = 'liquidites' | 'or_argent' | 'investissements' | 'commerce' | 'agriculture' | 'betail' | 'dettes' | 'recap';

const steps: { key: Step; label: string; icon: React.ComponentType<any> }[] = [
  { key: 'liquidites', label: 'Liquidités', icon: Wallet },
  { key: 'or_argent', label: 'Or & Argent', icon: Coins },
  { key: 'investissements', label: 'Investissements', icon: TrendingUp },
  { key: 'commerce', label: 'Commerce', icon: ShoppingBag },
  { key: 'agriculture', label: 'Agriculture', icon: Wheat },
  { key: 'betail', label: 'Bétail', icon: PiggyBank },
  { key: 'dettes', label: 'Dettes', icon: Landmark },
  { key: 'recap', label: 'Récapitulatif', icon: Calculator },
];

const inputClasses = "w-full px-3 h-11 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors";

const ZakatCalculatorForm = ({ settings, prefilledData, onSubmit, isSubmitting }: ZakatCalculatorFormProps) => {
  const [currentStep, setCurrentStep] = useState<Step>('liquidites');
  const [formData, setFormData] = useState<CreateZakatDto>({
    cashMaison: 0,
    cashBanque: 0,
    cashMobile: 0,
    orPoids: 0,
    orInclureBijoux: true,
    argentPoids: 0,
    investActions: 0,
    investImmobilier: 0,
    investAutres: 0,
    comStockValeur: 0,
    comCreances: 0,
    comLiquidites: 0,
    hasAgriculture: false,
    agriQuantiteKg: 0,
    agriValeurRecolte: 0,
    agriIrrigation: 'AUCUN',
    hasBetail: false,
    betailChameaux: 0,
    betailBovins: 0,
    betailOvins: 0,
    betailCaprins: 0,
    dettesPersonnelles: 0,
    dettesFournisseurs: 0,
  });

  const [displayValues, setDisplayValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (prefilledData) {
      setFormData(prev => ({
        ...prev,
        comStockValeur: prefilledData.valeurStock || 0,
        comCreances: prefilledData.creancesClients || 0,
        dettesFournisseurs: prefilledData.dettesFournisseurs || 0,
      }));
      setDisplayValues(prev => ({
        ...prev,
        comStockValeur: formatPrixInput(prefilledData.valeurStock || 0),
        comCreances: formatPrixInput(prefilledData.creancesClients || 0),
        dettesFournisseurs: formatPrixInput(prefilledData.dettesFournisseurs || 0),
      }));
    }
  }, [prefilledData]);

  const currentStepIndex = steps.findIndex(s => s.key === currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStep === 'recap';

  const updateField = (field: keyof CreateZakatDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMoneyInput = (field: keyof CreateZakatDto, inputValue: string) => {
    const rawValue = handlePrixChange(inputValue);
    const displayValue = formatPrixInput(rawValue);
    setDisplayValues(prev => ({ ...prev, [field]: displayValue }));
    setFormData(prev => ({ ...prev, [field]: Number(rawValue) || 0 }));
  };

  const getDisplayValue = (field: keyof CreateZakatDto): string => {
    if (displayValues[field] !== undefined) return displayValues[field];
    const value = formData[field];
    if (typeof value === 'number' && value > 0) return formatPrixInput(value);
    return '';
  };

  const nextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].key);
    }
  };

  const prevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].key);
    }
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const totalLiquidites = (formData.cashMaison || 0) + (formData.cashBanque || 0) + (formData.cashMobile || 0);
  const totalOrArgent = ((formData.orPoids || 0) * Number(settings?.prixOrGrammeGnf || 0)) +
    ((formData.argentPoids || 0) * Number(settings?.prixArgentGrammeGnf || 0));
  const totalInvest = (formData.investActions || 0) + (formData.investImmobilier || 0) + (formData.investAutres || 0);
  const totalCommerce = (formData.comStockValeur || 0) + (formData.comCreances || 0) + (formData.comLiquidites || 0);
  const totalDettes = (formData.dettesPersonnelles || 0) + (formData.dettesFournisseurs || 0);
  const totalActifs = totalLiquidites + totalOrArgent + totalInvest + totalCommerce;
  const montantZakatable = Math.max(0, totalActifs - totalDettes);
  const nisab = Number(settings?.nisabGnf) || 0;
  const assujetti = montantZakatable >= nisab;
  const zakatEstimee = assujetti ? montantZakatable * 0.025 : 0;

  const renderStep = () => {
    switch (currentStep) {
      case 'liquidites':
        return (
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/5 via-background to-background border-2 border-border p-4 sm:p-5">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12"></div>
            <div className="relative space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Liquidités</h3>
                  <p className="text-xs text-muted-foreground">Argent en votre possession</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Argent à la maison
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={getDisplayValue('cashMaison')}
                  onChange={(e) => handleMoneyInput('cashMaison', e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="0"
                  className={inputClasses}
                />
                <p className="text-[10px] text-muted-foreground mt-1">Espèces gardées chez vous</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Comptes bancaires
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={getDisplayValue('cashBanque')}
                  onChange={(e) => handleMoneyInput('cashBanque', e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="0"
                  className={inputClasses}
                />
                <p className="text-[10px] text-muted-foreground mt-1">Solde total de vos comptes</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Mobile Money
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={getDisplayValue('cashMobile')}
                  onChange={(e) => handleMoneyInput('cashMobile', e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="0"
                  className={inputClasses}
                />
                <p className="text-[10px] text-muted-foreground mt-1">Orange Money, MTN, etc.</p>
              </div>

              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">Total liquidités</span>
                  <span className="text-sm font-bold text-primary">{formatPrix(totalLiquidites)}</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'or_argent':
        return (
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-yellow-500/5 via-background to-background border-2 border-border p-4 sm:p-5">
            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full -mr-12 -mt-12"></div>
            <div className="relative space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Coins className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Or & Argent</h3>
                  <p className="text-xs text-muted-foreground">Métaux précieux</p>
                </div>
              </div>

              {settings && (
                <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200/50">
                  <p className="text-[10px] text-muted-foreground mb-1">Prix actuels (API)</p>
                  <div className="flex gap-4 text-xs">
                    <div>
                      <span className="text-yellow-700 dark:text-yellow-300">Or: </span>
                      <span className="font-bold">{formatPrix(Number(settings.prixOrGrammeGnf))}/g</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Argent: </span>
                      <span className="font-bold">{formatPrix(Number(settings.prixArgentGrammeGnf))}/g</span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Poids d'or (grammes)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.orPoids || ''}
                  onChange={(e) => updateField('orPoids', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className={inputClasses}
                />
                <p className="text-[10px] text-muted-foreground mt-1">Lingots, pièces, bijoux</p>
              </div>

              <label className="flex items-center space-x-3 p-3 rounded-lg bg-secondary/30 border border-border cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.orInclureBijoux}
                  onChange={(e) => updateField('orInclureBijoux', e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                />
                <span className="text-xs font-medium">Inclure les bijoux personnels portés</span>
              </label>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Poids d'argent (grammes)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.argentPoids || ''}
                  onChange={(e) => updateField('argentPoids', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className={inputClasses}
                />
              </div>

              <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">Valeur totale</span>
                  <span className="text-sm font-bold text-yellow-600">{formatPrix(totalOrArgent)}</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'investissements':
        return (
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500/5 via-background to-background border-2 border-border p-4 sm:p-5">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-12 -mt-12"></div>
            <div className="relative space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Investissements</h3>
                  <p className="text-xs text-muted-foreground">Placements financiers</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Actions & parts sociales
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={getDisplayValue('investActions')}
                  onChange={(e) => handleMoneyInput('investActions', e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="0"
                  className={inputClasses}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Immobilier destiné à la vente
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={getDisplayValue('investImmobilier')}
                  onChange={(e) => handleMoneyInput('investImmobilier', e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="0"
                  className={inputClasses}
                />
                <p className="text-[10px] text-muted-foreground mt-1">Biens destinés à la revente</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Autres investissements
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={getDisplayValue('investAutres')}
                  onChange={(e) => handleMoneyInput('investAutres', e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="0"
                  className={inputClasses}
                />
              </div>

              <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">Total investissements</span>
                  <span className="text-sm font-bold text-blue-600">{formatPrix(totalInvest)}</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'commerce':
        return (
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500/5 via-background to-background border-2 border-border p-4 sm:p-5">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full -mr-12 -mt-12"></div>
            <div className="relative space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Commerce</h3>
                  <p className="text-xs text-muted-foreground">Activités commerciales</p>
                </div>
              </div>

              {prefilledData && (prefilledData.valeurStock > 0 || prefilledData.creancesClients > 0) && (
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200/50">
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Valeurs pré-remplies depuis vos données
                  </p>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Valeur du stock
                  </label>
                  {prefilledData && prefilledData.valeurStock > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">Auto</span>
                  )}
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={getDisplayValue('comStockValeur')}
                  onChange={(e) => handleMoneyInput('comStockValeur', e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="0"
                  className={inputClasses}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Créances clients
                  </label>
                  {prefilledData && prefilledData.creancesClients > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">Auto</span>
                  )}
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={getDisplayValue('comCreances')}
                  onChange={(e) => handleMoneyInput('comCreances', e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="0"
                  className={inputClasses}
                />
                <p className="text-[10px] text-muted-foreground mt-1 flex items-start gap-1">
                  <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  Ajustez si certaines créances sont douteuses
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Liquidités commerciales
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={getDisplayValue('comLiquidites')}
                  onChange={(e) => handleMoneyInput('comLiquidites', e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="0"
                  className={inputClasses}
                />
              </div>

              <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">Total commerce</span>
                  <span className="text-sm font-bold text-purple-600">{formatPrix(totalCommerce)}</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'agriculture':
        return (
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500/5 via-background to-background border-2 border-border p-4 sm:p-5">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full -mr-12 -mt-12"></div>
            <div className="relative space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Wheat className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Agriculture</h3>
                  <p className="text-xs text-muted-foreground">Récoltes et cultures</p>
                </div>
              </div>

              <label className="flex items-center space-x-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasAgriculture}
                  onChange={(e) => updateField('hasAgriculture', e.target.checked)}
                  className="w-4 h-4 rounded border-border text-green-600 focus:ring-green-500/20"
                />
                <span className="text-xs font-medium">J'ai des activités agricoles</span>
              </label>

              <AnimatePresence>
                {formData.hasAgriculture && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200/50">
                      <p className="text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        <strong>Nisab:</strong> minimum 653 kg de récolte
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                        Quantité récoltée (kg)
                      </label>
                      <input
                        type="number"
                        value={formData.agriQuantiteKg || ''}
                        onChange={(e) => updateField('agriQuantiteKg', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className={inputClasses}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                        Valeur de la récolte
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={getDisplayValue('agriValeurRecolte')}
                        onChange={(e) => handleMoneyInput('agriValeurRecolte', e.target.value)}
                        onFocus={(e) => e.target.select()}
                        placeholder="0"
                        className={inputClasses}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2">
                        Type d'irrigation
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: 'PLUIE', label: 'Pluie', rate: '10%' },
                          { value: 'ARTIFICIEL', label: 'Artificielle', rate: '5%' },
                          { value: 'MIXTE', label: 'Mixte', rate: '7.5%' },
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => updateField('agriIrrigation', option.value as any)}
                            className={`p-2 rounded-lg border-2 text-center transition-all ${
                              formData.agriIrrigation === option.value
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                : 'border-border hover:border-green-300'
                            }`}
                          >
                            <p className="text-xs font-medium">{option.label}</p>
                            <p className="text-[10px] text-muted-foreground">{option.rate}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        );

      case 'betail':
        return (
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500/5 via-background to-background border-2 border-border p-4 sm:p-5">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full -mr-12 -mt-12"></div>
            <div className="relative space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <span className="text-base">🐄</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Bétail</h3>
                  <p className="text-xs text-muted-foreground">Animaux d'élevage</p>
                </div>
              </div>

              <label className="flex items-center space-x-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/10 border border-orange-200/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasBetail}
                  onChange={(e) => updateField('hasBetail', e.target.checked)}
                  className="w-4 h-4 rounded border-border text-orange-600 focus:ring-orange-500/20"
                />
                <span className="text-xs font-medium">J'ai du bétail</span>
              </label>

              <AnimatePresence>
                {formData.hasBetail && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200/50">
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        <strong>Nisab:</strong> 40 ovins/caprins, 30 bovins, ou 5 chameaux
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                          🐑 Ovins
                        </label>
                        <input
                          type="number"
                          value={formData.betailOvins || ''}
                          onChange={(e) => updateField('betailOvins', parseInt(e.target.value) || 0)}
                          placeholder="0"
                          className={inputClasses}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                          🐐 Caprins
                        </label>
                        <input
                          type="number"
                          value={formData.betailCaprins || ''}
                          onChange={(e) => updateField('betailCaprins', parseInt(e.target.value) || 0)}
                          placeholder="0"
                          className={inputClasses}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                          🐄 Bovins
                        </label>
                        <input
                          type="number"
                          value={formData.betailBovins || ''}
                          onChange={(e) => updateField('betailBovins', parseInt(e.target.value) || 0)}
                          placeholder="0"
                          className={inputClasses}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                          🐪 Chameaux
                        </label>
                        <input
                          type="number"
                          value={formData.betailChameaux || ''}
                          onChange={(e) => updateField('betailChameaux', parseInt(e.target.value) || 0)}
                          placeholder="0"
                          className={inputClasses}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        );

      case 'dettes':
        return (
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-destructive/5 via-background to-background border-2 border-border p-4 sm:p-5">
            <div className="absolute top-0 right-0 w-24 h-24 bg-destructive/5 rounded-full -mr-12 -mt-12"></div>
            <div className="relative space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <Landmark className="w-4 h-4 text-destructive" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Dettes</h3>
                  <p className="text-xs text-muted-foreground">Ce que vous devez</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200/50">
                <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Les dettes sont déduites avant le calcul
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Dettes personnelles
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={getDisplayValue('dettesPersonnelles')}
                  onChange={(e) => handleMoneyInput('dettesPersonnelles', e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="0"
                  className={inputClasses}
                />
                <p className="text-[10px] text-muted-foreground mt-1">Prêts familiaux, emprunts</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Dettes fournisseurs
                  </label>
                  {prefilledData && prefilledData.dettesFournisseurs > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">Auto</span>
                  )}
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={getDisplayValue('dettesFournisseurs')}
                  onChange={(e) => handleMoneyInput('dettesFournisseurs', e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="0"
                  className={inputClasses}
                />
              </div>

              <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">Total dettes</span>
                  <span className="text-sm font-bold text-destructive">-{formatPrix(totalDettes)}</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'recap':
        return (
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500/5 via-background to-background border-2 border-border p-4 sm:p-5">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-12 -mt-12"></div>
            <div className="relative space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Calculator className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Récapitulatif</h3>
                  <p className="text-xs text-muted-foreground">Vérifiez vos informations</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Liquidités</span>
                  <span className="font-medium">{formatPrix(totalLiquidites)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Or & Argent</span>
                  <span className="font-medium">{formatPrix(totalOrArgent)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Investissements</span>
                  <span className="font-medium">{formatPrix(totalInvest)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Commerce</span>
                  <span className="font-medium">{formatPrix(totalCommerce)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="font-medium">Total Actifs</span>
                  <span className="font-bold">{formatPrix(totalActifs)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-destructive">Dettes</span>
                  <span className="font-medium text-destructive">-{formatPrix(totalDettes)}</span>
                </div>
                <div className="flex justify-between items-center py-2 px-3 -mx-3 bg-secondary/30 rounded-lg">
                  <span className="font-medium">Montant Zakatable</span>
                  <span className="font-bold text-base">{formatPrix(montantZakatable)}</span>
                </div>
              </div>

              <div className={`p-3 rounded-lg ${assujetti ? 'bg-amber-50 dark:bg-amber-900/10 border border-amber-200' : 'bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200'}`}>
                <div className="flex items-start gap-2">
                  {assujetti ? (
                    <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <p className={`text-xs font-medium ${assujetti ? 'text-amber-700 dark:text-amber-300' : 'text-emerald-700 dark:text-emerald-300'}`}>
                      {assujetti ? 'Vous êtes assujetti à la Zakat' : 'Pas de Zakat obligatoire'}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Nisab: {formatPrix(nisab)}
                    </p>
                  </div>
                </div>
              </div>

              {assujetti && (
                <div className="p-4 rounded-lg border-2 border-primary bg-gradient-to-br from-primary/5 to-primary/10 text-center">
                  <p className="text-xs text-primary mb-1">Zakat estimée (2.5%)</p>
                  <p className="text-2xl font-bold text-primary">{formatPrix(zakatEstimee)}</p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-5">
      {/* Progress steps */}
      <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex gap-1 min-w-max md:grid md:grid-cols-8">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = currentStep === step.key;
            const isPast = currentStepIndex > index;

            return (
              <button
                key={step.key}
                type="button"
                onClick={() => setCurrentStep(step.key)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all min-w-[65px] ${
                  isActive
                    ? 'bg-primary/10'
                    : isPast
                      ? 'bg-emerald-50 dark:bg-emerald-900/20'
                      : 'hover:bg-secondary/50'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : isPast
                      ? 'bg-emerald-500 text-white'
                      : 'bg-secondary text-muted-foreground'
                }`}>
                  {isPast ? <Check className="w-3.5 h-3.5" /> : <StepIcon className="w-3.5 h-3.5" />}
                </div>
                <span className={`text-[9px] font-medium text-center leading-tight ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {step.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-3 pt-4 border-t border-border">
        {!isFirstStep && (
          <button
            type="button"
            onClick={prevStep}
            className="flex-1 h-11 px-4 rounded-lg border border-border bg-background text-foreground text-sm font-medium hover:bg-secondary/50 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Précédent
          </button>
        )}
        {isLastStep ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 gradient-gold text-primary-foreground h-11 px-4 rounded-lg text-sm font-semibold shadow-elevated hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Calculator className="w-4 h-4" />
                Calculer ma Zakat
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={nextStep}
            className="flex-1 gradient-gold text-primary-foreground h-11 px-4 rounded-lg text-sm font-semibold shadow-elevated hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            Suivant
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ZakatCalculatorForm;
