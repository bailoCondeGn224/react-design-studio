import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import FormField from "@/components/FormField";
import { toast } from "sonner";

interface StockFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
}

const StockForm = ({ open, onOpenChange, onSubmit }: StockFormProps) => {
  const [form, setForm] = useState({
    nom: "", categorie: "abayas" as string, zone: "A", stock: "", seuil: "", max: "", prix: "",
  });

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const zoneMap: Record<string, string> = { abayas: "A", foulards: "B", bazin: "C", autres: "D" };

  const handleCatChange = (cat: string) => {
    setForm(prev => ({ ...prev, categorie: cat, zone: zoneMap[cat] || "D" }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom.trim() || !form.stock || !form.seuil || !form.max || !form.prix.trim()) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    onSubmit({
      id: Date.now(),
      nom: form.nom,
      categorie: form.categorie,
      zone: form.zone,
      stock: Number(form.stock),
      seuil: Number(form.seuil),
      max: Number(form.max),
      prix: `${form.prix} GNF`,
    });
    setForm({ nom: "", categorie: "abayas", zone: "A", stock: "", seuil: "", max: "", prix: "" });
    onOpenChange(false);
    toast.success("Article ajouté au stock");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Nouvel Article</DialogTitle>
          <DialogDescription>Ajoutez un article à l'inventaire</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Nom de l'article *" placeholder="Ex: Abaya Noire Premium" value={form.nom} onChange={e => update("nom", (e.target as HTMLInputElement).value)} maxLength={100} />
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Catégorie *" as="select" value={form.categorie} onChange={e => handleCatChange((e.target as HTMLSelectElement).value)}>
              <option value="abayas">Abayas</option>
              <option value="foulards">Foulards</option>
              <option value="bazin">Bazin</option>
              <option value="autres">Autres</option>
            </FormField>
            <FormField label="Zone" value={form.zone} disabled />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Stock initial *" type="number" placeholder="25" value={form.stock} onChange={e => update("stock", (e.target as HTMLInputElement).value)} min="0" />
            <FormField label="Seuil alerte *" type="number" placeholder="10" value={form.seuil} onChange={e => update("seuil", (e.target as HTMLInputElement).value)} min="0" />
            <FormField label="Stock max *" type="number" placeholder="50" value={form.max} onChange={e => update("max", (e.target as HTMLInputElement).value)} min="0" />
          </div>
          <FormField label="Prix (GNF) *" placeholder="85 000" value={form.prix} onChange={e => update("prix", (e.target as HTMLInputElement).value)} maxLength={20} />
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => onOpenChange(false)} className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors">
              Annuler
            </button>
            <button type="submit" className="flex-1 py-2.5 rounded-lg gradient-gold text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
              Ajouter
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StockForm;
