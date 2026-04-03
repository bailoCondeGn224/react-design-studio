import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import FormField from "@/components/FormField";
import { toast } from "sonner";

interface VenteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
}

const VenteForm = ({ open, onOpenChange, onSubmit }: VenteFormProps) => {
  const [form, setForm] = useState({
    client: "", articles: "", total: "", paiement: "Cash",
  });

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.client.trim() || !form.articles.trim() || !form.total.trim()) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }
    const now = new Date();
    onSubmit({
      id: `V-${String(Date.now()).slice(-3)}`,
      client: form.client,
      articles: form.articles,
      total: `${form.total} GNF`,
      paiement: form.paiement,
      date: now.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }),
      heure: now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    });
    setForm({ client: "", articles: "", total: "", paiement: "Cash" });
    onOpenChange(false);
    toast.success("Vente enregistrée avec succès");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Nouvelle Vente</DialogTitle>
          <DialogDescription>Enregistrez une transaction de vente</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Client *" placeholder="Nom du client" value={form.client} onChange={e => update("client", (e.target as HTMLInputElement).value)} maxLength={100} />
          <FormField label="Articles *" as="textarea" placeholder="Ex: Abaya Noire Premium, Hijab Soie Crème" value={form.articles} onChange={e => update("articles", (e.target as HTMLTextAreaElement).value)} maxLength={500} />
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Montant (GNF) *" type="number" placeholder="85000" value={form.total} onChange={e => update("total", (e.target as HTMLInputElement).value)} min="0" />
            <FormField label="Mode de paiement" as="select" value={form.paiement} onChange={e => update("paiement", (e.target as HTMLSelectElement).value)}>
              <option value="Cash">Espèces (Cash)</option>
              <option value="Mobile Money">Mobile Money</option>
              <option value="Virement">Virement bancaire</option>
              <option value="Acompte 50%">Acompte 50%</option>
            </FormField>
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

export default VenteForm;
