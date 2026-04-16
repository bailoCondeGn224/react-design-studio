import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import FormField from "@/components/FormField";
import { toast } from "sonner";
import { useCategoriesActive } from "@/hooks/useCategories";
import { formatPrixInput, handlePrixChange } from "@/utils/format-prix";

interface StockFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  mode?: 'create' | 'edit';
}

const StockForm = ({ open, onOpenChange, onSubmit, initialData = null, mode = 'create' }: StockFormProps) => {
  const { data: categories = [], isLoading: loadingCategories } = useCategoriesActive();

  const getInitialState = () => {
    if (mode === 'edit' && initialData) {
      return {
        ...initialData,
        categorieId: initialData.categorieId || '',
        stock: String(initialData.stock),
        seuilAlerte: String(initialData.seuilAlerte),
        max: String(initialData.max || ''),
        prixVente: initialData.prixVente?.toString().replace(' GNF', '') || '',
        prixAchat: initialData.prixAchat?.toString().replace(' GNF', '') || '',
        reference: initialData.reference || '',
      };
    }
    return {
      nom: "",
      reference: "",
      categorieId: "",
      zone: "A",
      stock: "",
      seuilAlerte: "",
      max: "",
      prixVente: "",
      prixAchat: "",
    };
  };

  const [form, setForm] = useState(getInitialState());

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setForm({
        ...initialData,
        stock: String(initialData.stock),
        seuilAlerte: String(initialData.seuilAlerte),
        max: String(initialData.max),
        prixVente: initialData.prixVente?.replace(' GNF', '') || '',
        prixAchat: initialData.prixAchat?.replace(' GNF', '') || '',
        reference: initialData.reference || '',
      });
    }
  }, [mode, initialData, open]);

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom.trim() || !form.categorieId || !form.seuilAlerte || !form.prixVente.trim()) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    // En mode édition, on ne modifie PAS la quantité en stock
    const articleData = {
      nom: form.nom,
      reference: form.reference || undefined,
      categorieId: form.categorieId,
      zone: form.zone,
      seuilAlerte: Number(form.seuilAlerte),
      max: form.max ? Number(form.max) : undefined,
      prixVente: Number(form.prixVente),
      prixAchat: form.prixAchat ? Number(form.prixAchat) : undefined,
    };

    onSubmit({ ...articleData, id: form.id });

    setForm(getInitialState());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">
            Modifier l'Article
          </DialogTitle>
          <DialogDescription>
            Modifiez les informations de l'article (sauf la quantité qui est gérée par les approvisionnements et ventes)
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Nom de l'article *" placeholder="Ex: Abaya Noire Premium" value={form.nom} onChange={e => update("nom", (e.target as HTMLInputElement).value)} maxLength={100} />
          <FormField label="Référence (SKU)" placeholder="Ex: ABY-001" value={form.reference} onChange={e => update("reference", (e.target as HTMLInputElement).value)} maxLength={50} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              label="Catégorie *"
              as="select"
              value={form.categorieId}
              onChange={e => update("categorieId", (e.target as HTMLSelectElement).value)}
              disabled={loadingCategories}
            >
              <option value="">Sélectionnez une catégorie</option>
              {categories
                .filter(cat => cat.actif)
                .map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nom}
                  </option>
                ))}
            </FormField>
            <FormField
              label="Zone de stockage *"
              as="select"
              value={form.zone}
              onChange={e => update("zone", (e.target as HTMLSelectElement).value)}
            >
              <option value="A">Zone A</option>
              <option value="B">Zone B</option>
              <option value="C">Zone C</option>
              <option value="D">Zone D</option>
              <option value="E">Zone E</option>
            </FormField>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Stock en lecture seule - géré par approvisionnements/ventes */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Stock actuel
              </label>
              <div className="px-4 py-2.5 rounded-lg border border-border bg-muted text-foreground font-semibold">
                {form.stock || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Géré par approvisionnements/ventes</p>
            </div>
            <FormField label="Seuil alerte *" type="number" placeholder="10" value={form.seuilAlerte} onChange={e => update("seuilAlerte", (e.target as HTMLInputElement).value)} min="0" />
            <FormField label="Stock max *" type="number" placeholder="50" value={form.max} onChange={e => update("max", (e.target as HTMLInputElement).value)} min="0" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Prix de vente (GNF) *</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="85 000"
                value={formatPrixInput(form.prixVente)}
                onChange={e => update("prixVente", handlePrixChange(e.target.value))}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Prix d'achat (GNF)</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="50 000"
                value={formatPrixInput(form.prixAchat)}
                onChange={e => update("prixAchat", handlePrixChange(e.target.value))}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => onOpenChange(false)} className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors">
              Annuler
            </button>
            <button type="submit" className="flex-1 py-2.5 rounded-lg gradient-gold text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
              Enregistrer
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StockForm;
