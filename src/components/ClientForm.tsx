import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import FormField from "@/components/FormField";
import { toast } from "sonner";

interface ClientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  mode?: 'create' | 'edit';
}

const ClientForm = ({ open, onOpenChange, onSubmit, initialData = null, mode = 'create' }: ClientFormProps) => {
  const getInitialState = () => {
    if (mode === 'edit' && initialData) {
      return {
        ...initialData,
      };
    }
    return {
      nom: "",
      telephone: "",
      email: "",
      adresse: "",
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

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom.trim()) {
      toast.error("Le nom du client est obligatoire");
      return;
    }

    const clientData = {
      nom: form.nom,
      telephone: form.telephone || undefined,
      email: form.email || undefined,
      adresse: form.adresse || undefined,
    };

    onSubmit(clientData);
    setForm(getInitialState());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {mode === 'edit' ? 'Modifier le Client' : 'Nouveau Client'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit' ? 'Modifiez les informations du client' : 'Ajoutez un nouveau client'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Nom du client *"
            placeholder="Ex: Aissatou Diallo"
            value={form.nom}
            onChange={e => update("nom", (e.target as HTMLInputElement).value)}
            maxLength={100}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              label="Téléphone"
              type="tel"
              placeholder="Ex: +224 123 456 789"
              value={form.telephone}
              onChange={e => update("telephone", (e.target as HTMLInputElement).value)}
              maxLength={20}
            />
            <FormField
              label="Email"
              type="email"
              placeholder="client@email.com"
              value={form.email}
              onChange={e => update("email", (e.target as HTMLInputElement).value)}
              maxLength={100}
            />
          </div>
          <FormField
            label="Adresse"
            as="textarea"
            placeholder="Adresse complète du client"
            value={form.adresse}
            onChange={e => update("adresse", (e.target as HTMLTextAreaElement).value)}
            maxLength={200}
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
              {mode === 'edit' ? 'Enregistrer' : 'Ajouter'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClientForm;
