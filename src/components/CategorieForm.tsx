import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import FormField from "@/components/FormField";
import { toast } from "sonner";
import { Categorie } from "@/types";
import { useZonesActive } from "@/hooks/useZones";

interface CategorieFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  initialData?: Categorie | null;
  mode?: 'create' | 'edit';
}

const CategorieForm = ({ open, onOpenChange, onSubmit, initialData = null, mode = 'create' }: CategorieFormProps) => {
  const { data: zones = [], isLoading: loadingZones } = useZonesActive();

  const getInitialState = () => {
    if (mode === 'edit' && initialData) {
      return {
        nom: initialData.nom || '',
        code: initialData.code || '',
        description: initialData.description || '',
        actif: initialData.actif ?? true,
        zoneId: (initialData as any).zoneId || '',
      };
    }
    return {
      nom: '',
      code: '',
      description: '',
      actif: true,
      zoneId: '',
    };
  };

  const [form, setForm] = useState(getInitialState());

  useEffect(() => {
    if (open) {
      setForm(getInitialState());
    }
  }, [mode, initialData, open]);

  const update = (field: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.nom.trim() || !form.code.trim()) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const categorieData = {
      nom: form.nom.trim(),
      code: form.code.trim().toUpperCase(),
      description: form.description.trim() || undefined,
      actif: form.actif,
      zoneId: form.zoneId || undefined,
    };

    if (mode === 'edit' && initialData) {
      onSubmit({ id: initialData.id, data: categorieData });
    } else {
      onSubmit(categorieData);
    }

    setForm(getInitialState());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {mode === 'edit' ? 'Modifier la Catégorie' : 'Nouvelle Catégorie'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit' ? 'Modifiez les informations de la catégorie' : 'Créez une nouvelle catégorie de produits'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Nom de la catégorie *"
            placeholder="Ex: Abayas"
            value={form.nom}
            onChange={e => update("nom", (e.target as HTMLInputElement).value)}
            maxLength={100}
          />

          <FormField
            label="Code *"
            placeholder="Ex: ABY"
            value={form.code}
            onChange={e => update("code", (e.target as HTMLInputElement).value.toUpperCase())}
            maxLength={10}
          />

          <FormField
            label="Description"
            as="textarea"
            placeholder="Description de la catégorie (optionnel)"
            value={form.description}
            onChange={e => update("description", (e.target as HTMLTextAreaElement).value)}
            maxLength={500}
          />

          <div>
            <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
              Zone (optionnel)
            </label>
            <select
              value={form.zoneId}
              onChange={e => update("zoneId", e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-border bg-card text-sm sm:text-base text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
              disabled={loadingZones}
            >
              <option value="">Aucune zone</option>
              {zones.map((zone: any) => (
                <option key={zone.id} value={zone.id}>
                  {zone.code} — {zone.nom}
                </option>
              ))}
            </select>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
              Associez cette catégorie à une zone d'entreposage
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="actif"
              checked={form.actif}
              onChange={e => update("actif", e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
            />
            <label htmlFor="actif" className="text-sm font-medium">
              Catégorie active
            </label>
          </div>

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

export default CategorieForm;
