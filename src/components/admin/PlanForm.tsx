import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import FormField from "@/components/FormField";
import { toast } from "sonner";

interface PlanFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  mode?: 'create' | 'edit';
}

const PlanForm = ({ open, onOpenChange, onSubmit, initialData = null, mode = 'create' }: PlanFormProps) => {
  const getInitialState = () => {
    if (mode === 'edit' && initialData) {
      return {
        ...initialData,
      };
    }
    return {
      code: "FREE",
      nom: "",
      description: "",
      prixMensuel: 0,
      actif: true,
    };
  };

  const [form, setForm] = useState(getInitialState());

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setForm({
        ...initialData,
      });
    }
  }, [mode, initialData, open]);

  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.code.trim()) {
      toast.error("Le code du plan est obligatoire");
      return;
    }
    if (!form.nom.trim()) {
      toast.error("Le nom du plan est obligatoire");
      return;
    }
    if (form.prixMensuel < 0) {
      toast.error("Le prix mensuel doit être positif");
      return;
    }

    const planData = {
      code: form.code,
      nom: form.nom,
      description: form.description || undefined,
      prixMensuel: Number(form.prixMensuel),
      actif: form.actif,
    };

    onSubmit(planData);
    setForm(getInitialState());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {mode === 'edit' ? 'Modifier le Plan' : 'Nouveau Plan'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit' ? 'Modifiez les informations du plan' : 'Créez un nouveau plan tarifaire'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Code du plan <span className="text-destructive">*</span></label>
            <select
              value={form.code}
              onChange={e => update("code", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              disabled={mode === 'edit'}
            >
              <option value="FREE">Gratuit (FREE)</option>
              <option value="STANDARD">Standard (STANDARD)</option>
              <option value="PREMIUM">Premium (PREMIUM)</option>
              <option value="ENTERPRISE">Entreprise (ENTERPRISE)</option>
            </select>
            {mode === 'edit' && (
              <p className="text-xs text-muted-foreground">Le code ne peut pas être modifié</p>
            )}
          </div>

          <FormField
            label="Nom du plan *"
            placeholder="Ex: Plan Gratuit, Plan Standard..."
            value={form.nom}
            onChange={e => update("nom", (e.target as HTMLInputElement).value)}
            maxLength={100}
          />

          <FormField
            label="Description"
            as="textarea"
            placeholder="Description du plan"
            value={form.description}
            onChange={e => update("description", (e.target as HTMLTextAreaElement).value)}
            maxLength={500}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              label="Prix mensuel (GNF) *"
              type="number"
              placeholder="0"
              value={form.prixMensuel}
              onChange={e => update("prixMensuel", (e.target as HTMLInputElement).value)}
              min={0}
            />
            <div className="space-y-2">
              <label className="text-sm font-medium">Statut</label>
              <select
                value={form.actif ? "true" : "false"}
                onChange={e => update("actif", e.target.value === "true")}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="true">Actif</option>
                <option value="false">Inactif</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 px-4 py-2.5 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 gradient-gold text-primary-foreground px-4 py-2.5 rounded-lg font-semibold shadow-elevated hover:opacity-90 transition-opacity"
            >
              {mode === 'edit' ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PlanForm;
