import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FormField from "@/components/FormField";
import { toast } from "sonner";
import { Depense, TypeDepense, CategorieDepense, typeDepenseLabels, categorieDepenseLabels, typeToCategorieMap } from "@/types";
import { formatPrixInput, handlePrixChange } from "@/utils/format-prix";
import { Wallet, Tag, DollarSign, Calendar, FileText, Check } from "lucide-react";

interface DepenseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  initialData?: Depense | null;
  mode?: 'create' | 'edit';
}

const DepenseForm = ({ open, onOpenChange, onSubmit, initialData = null, mode = 'create' }: DepenseFormProps) => {
  const getInitialState = () => {
    if (mode === 'edit' && initialData) {
      return {
        type: initialData.type || TypeDepense.AUTRE,
        categorie: initialData.categorie || CategorieDepense.VARIABLE,
        montant: initialData.montant || '',
        montantDisplay: formatPrixInput(initialData.montant) || '',
        description: initialData.description || '',
        date: initialData.date || new Date().toISOString().split('T')[0],
        reference: initialData.reference || '',
      };
    }
    return {
      type: TypeDepense.AUTRE,
      categorie: CategorieDepense.VARIABLE,
      montant: '',
      montantDisplay: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      reference: '',
    };
  };

  const [form, setForm] = useState(getInitialState());

  useEffect(() => {
    if (open) {
      setForm(getInitialState());
    }
  }, [mode, initialData, open]);

  const update = (field: string, value: string | number) => {
    // Si on change le type, mettre à jour automatiquement la catégorie
    if (field === 'type') {
      const newType = value as TypeDepense;
      const autoCategorie = typeToCategorieMap[newType];
      setForm(prev => ({ ...prev, type: newType, categorie: autoCategorie }));
    } else {
      setForm(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleMontantChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = handlePrixChange(e.target.value);
    const displayValue = formatPrixInput(rawValue);
    setForm(prev => ({
      ...prev,
      montant: rawValue,
      montantDisplay: displayValue,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const montantNumber = Number(form.montant);

    if (!form.type || !form.categorie || !form.montant || montantNumber <= 0 || !form.date) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    // Vérifier que la date n'est pas dans le futur
    const dateDepense = new Date(form.date);
    const aujourdhui = new Date();
    aujourdhui.setHours(23, 59, 59, 999);

    if (dateDepense > aujourdhui) {
      toast.error("La date de la dépense ne peut pas être dans le futur");
      return;
    }

    const depenseData = {
      type: form.type,
      categorie: form.categorie,
      montant: montantNumber,
      description: form.description.trim() || undefined,
      date: form.date,
      reference: form.reference.trim() || undefined,
    };

    if (mode === 'edit' && initialData) {
      onSubmit({ id: initialData.id, data: depenseData });
    } else {
      onSubmit(depenseData);
    }

    setForm(getInitialState());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] flex flex-col p-0 bg-gradient-to-br from-background via-background to-destructive/5">
        {/* Header avec gradient */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b bg-gradient-to-r from-destructive/10 via-destructive/5 to-transparent flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-destructive to-destructive/80 flex items-center justify-center shadow-lg flex-shrink-0">
                <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-bold text-foreground">
                  {mode === 'edit' ? 'Modifier la Dépense' : 'Nouvelle Dépense'}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  {mode === 'edit' ? 'Modifiez les informations de la dépense' : 'Enregistrez une nouvelle dépense de l\'entreprise'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Zone scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-5">
          {/* Section Type & Catégorie */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/5 via-background to-background border-2 border-border p-4 sm:p-5">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12"></div>
            <div className="relative space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Tag className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Type et catégorie *</h3>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Type de dépense *
                </label>
                <select
                  value={form.type}
                  onChange={e => update("type", e.target.value)}
                  className="w-full px-3 h-11 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                >
                  {Object.values(TypeDepense).map((type) => (
                    <option key={type} value={type}>
                      {typeDepenseLabels[type]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Catégorie * (automatique)
                </label>
                <select
                  value={form.categorie}
                  onChange={e => update("categorie", e.target.value)}
                  className="w-full px-3 h-11 rounded-lg border border-border bg-secondary text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-not-allowed"
                  required
                  disabled
                >
                  {Object.values(CategorieDepense).map((cat) => (
                    <option key={cat} value={cat}>
                      {categorieDepenseLabels[cat]}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  La catégorie est définie automatiquement selon le type de dépense
                </p>
              </div>
            </div>
          </div>

          {/* Section Montant */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-destructive/5 via-background to-background border-2 border-border p-4 sm:p-5">
            <div className="absolute top-0 right-0 w-24 h-24 bg-destructive/5 rounded-full -mr-12 -mt-12"></div>
            <div className="relative space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-destructive" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Montant de la dépense *</h3>
              </div>
              <div>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={form.montantDisplay}
                  onChange={handleMontantChange}
                  onFocus={e => e.target.select()}
                  className="w-full px-4 h-11 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-destructive/20 focus:border-destructive"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section Informations complémentaires */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-muted/30 via-background to-background border-2 border-border p-4 sm:p-5">
            <div className="absolute top-0 right-0 w-24 h-24 bg-muted/20 rounded-full -mr-12 -mt-12"></div>
            <div className="relative space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Informations complémentaires</h3>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Date de la dépense *
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => update("date", e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 h-11 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Référence / N° Facture
                </label>
                <input
                  type="text"
                  placeholder="Ex: FACT-2024-001"
                  value={form.reference}
                  onChange={e => update("reference", e.target.value)}
                  maxLength={200}
                  className="w-full px-3 h-11 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Description (optionnelle)
                </label>
                <textarea
                  placeholder="Détails de la dépense..."
                  value={form.description}
                  onChange={e => update("description", e.target.value)}
                  maxLength={500}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer avec actions - fixe en bas */}
        <div className="px-4 sm:px-6 py-4 border-t bg-muted/30 flex-shrink-0">
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              onClick={(e: any) => {
                const dialogContent = e.target.closest('[role="dialog"]');
                const formElement = dialogContent?.querySelector('form');
                if (formElement) {
                  formElement.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                }
              }}
              className="w-full sm:w-auto"
            >
              <Check className="w-4 h-4 mr-2" />
              {mode === 'edit' ? 'Enregistrer les modifications' : 'Enregistrer la dépense'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DepenseForm;
