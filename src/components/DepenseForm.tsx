import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import FormField from "@/components/FormField";
import { toast } from "sonner";
import { Depense, TypeDepense, CategorieDepense, typeDepenseLabels, categorieDepenseLabels, typeToCategorieMap } from "@/types";
import { formatPrixInput, handlePrixChange } from "@/utils/format-prix";

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
      <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {mode === 'edit' ? 'Modifier la Dépense' : 'Nouvelle Dépense'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit' ? 'Modifiez les informations de la dépense' : 'Enregistrez une nouvelle dépense'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
              Type de dépense *
            </label>
            <select
              value={form.type}
              onChange={e => update("type", e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-border bg-card text-sm sm:text-base text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
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
            <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
              Catégorie * (automatique)
            </label>
            <select
              value={form.categorie}
              onChange={e => update("categorie", e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-border bg-secondary text-sm sm:text-base text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 cursor-not-allowed"
              required
              disabled
            >
              {Object.values(CategorieDepense).map((cat) => (
                <option key={cat} value={cat}>
                  {categorieDepenseLabels[cat]}
                </option>
              ))}
            </select>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
              La catégorie est définie automatiquement selon le type de dépense
            </p>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
              Montant (GNF) *
            </label>
            <input
              type="text"
              placeholder="Ex: 500 000"
              value={form.montantDisplay}
              onChange={handleMontantChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-border bg-card text-sm sm:text-base text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
              required
            />
          </div>

          <FormField
            label="Date *"
            type="date"
            value={form.date}
            onChange={e => update("date", (e.target as HTMLInputElement).value)}
            max={new Date().toISOString().split('T')[0]}
            required
          />

          <FormField
            label="Référence / N° Facture"
            placeholder="Ex: FACT-2024-001"
            value={form.reference}
            onChange={e => update("reference", (e.target as HTMLInputElement).value)}
            maxLength={200}
          />

          <FormField
            label="Description"
            as="textarea"
            placeholder="Détails de la dépense (optionnel)"
            value={form.description}
            onChange={e => update("description", (e.target as HTMLTextAreaElement).value)}
            maxLength={500}
          />

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-lg gradient-gold text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              {mode === 'edit' ? 'Enregistrer' : 'Créer'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DepenseForm;
