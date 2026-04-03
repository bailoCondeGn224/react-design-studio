import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import FormField from "@/components/FormField";
import { toast } from "sonner";

interface FournisseurFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
}

const produitOptions = ["Abayas", "Foulards", "Bazin Riche", "Bazin Brodé", "Djellabas", "Boubous", "Pagne", "Tissus"];

const FournisseurForm = ({ open, onOpenChange, onSubmit }: FournisseurFormProps) => {
  const [form, setForm] = useState({
    nom: "", ville: "", tel: "", email: "", produits: [] as string[], statut: "actif",
  });

  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const toggleProduit = (p: string) => {
    setForm(prev => ({
      ...prev,
      produits: prev.produits.includes(p) ? prev.produits.filter(x => x !== p) : [...prev.produits, p],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom.trim() || !form.ville.trim() || !form.tel.trim()) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }
    onSubmit({ ...form, id: Date.now(), rating: 0 });
    setForm({ nom: "", ville: "", tel: "", email: "", produits: [], statut: "actif" });
    onOpenChange(false);
    toast.success("Fournisseur ajouté avec succès");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Nouveau Fournisseur</DialogTitle>
          <DialogDescription>Renseignez les informations du fournisseur</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Nom *" placeholder="Ex: Al-Nour Textiles" value={form.nom} onChange={e => update("nom", (e.target as HTMLInputElement).value)} maxLength={100} />
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Ville *" placeholder="Dubaï" value={form.ville} onChange={e => update("ville", (e.target as HTMLInputElement).value)} maxLength={50} />
            <FormField label="Statut" as="select" value={form.statut} onChange={e => update("statut", (e.target as HTMLSelectElement).value)}>
              <option value="actif">Actif</option>
              <option value="en attente">En attente</option>
            </FormField>
          </div>
          <FormField label="Téléphone *" type="tel" placeholder="+224 6XX XXX XXX" value={form.tel} onChange={e => update("tel", (e.target as HTMLInputElement).value)} maxLength={20} />
          <FormField label="Email" type="email" placeholder="contact@exemple.com" value={form.email} onChange={e => update("email", (e.target as HTMLInputElement).value)} maxLength={100} />
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Produits fournis</label>
            <div className="flex flex-wrap gap-1.5">
              {produitOptions.map(p => (
                <button key={p} type="button" onClick={() => toggleProduit(p)}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                    form.produits.includes(p)
                      ? "gradient-gold text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-accent"
                  }`}
                >{p}</button>
              ))}
            </div>
          </div>

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

export default FournisseurForm;
