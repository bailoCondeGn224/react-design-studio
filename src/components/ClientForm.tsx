import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import FormField from "@/components/FormField";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { UserCheck, Phone } from "lucide-react";

interface ClientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  mode?: 'create' | 'edit';
}

const ClientForm = ({ open, onOpenChange, onSubmit, initialData = null, mode = 'create' }: ClientFormProps) => {
  const isMobile = useIsMobile();

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

  // Contenu du formulaire (partagé entre Dialog et Sheet)
  const formContent = (
    <div className="h-full flex flex-col p-0 bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header avec gradient */}
      <div className="px-4 sm:px-6 py-4 sm:py-5 border-b bg-gradient-to-r from-primary/10 via-primary/5 to-transparent flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="hidden md:flex w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
            <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              {isMobile ? (mode === 'edit' ? 'Modifier' : 'Client') : (mode === 'edit' ? 'Modifier le Client' : 'Nouveau Client')}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {mode === 'edit' ? 'Modifiez les informations du client' : 'Ajoutez un nouveau client'}
            </p>
          </div>
        </div>
      </div>

      {/* Zone scrollable */}
      <form onSubmit={handleSubmit} className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-5">
        {/* Section Informations principales */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/5 via-background to-background border-2 border-border p-4 sm:p-5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12"></div>
          <div className="relative space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <UserCheck className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Informations principales</h3>
            </div>

            <FormField
              label="Nom du client *"
              placeholder="Ex: Aissatou Diallo"
              value={form.nom}
              onChange={e => update("nom", (e.target as HTMLInputElement).value)}
              maxLength={100}
            />
          </div>
        </div>

        {/* Section Contact */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-muted/30 via-background to-background border-2 border-border p-4 sm:p-5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-muted/20 rounded-full -mr-12 -mt-12"></div>
          <div className="relative space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
                <Phone className="w-4 h-4 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Coordonnées</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Téléphone"
                type="tel"
                placeholder="+224 123 456 789"
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
          </div>
        </div>
      </form>

      {/* Footer avec boutons */}
      <div className="px-4 sm:px-6 py-4 border-t bg-gradient-to-r from-muted/50 to-transparent flex flex-col sm:flex-row gap-3 flex-shrink-0">
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="w-full sm:flex-1 h-12 rounded-xl border-2 border-border text-base font-semibold text-muted-foreground hover:bg-secondary active:scale-[0.98] transition-all"
        >
          Annuler
        </button>
        <button
          type="submit"
          onClick={handleSubmit}
          className="w-full sm:flex-1 h-12 rounded-xl text-base font-bold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg shadow-primary/25 active:scale-[0.98] transition-all"
        >
          {mode === 'edit' ? '✓ Enregistrer' : '✓ Ajouter'}
        </button>
      </div>
    </div>
  );

  // Rendu conditionnel : Sheet pour mobile, Dialog pour desktop
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[95vh] p-0">
          {formContent}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md h-[90vh] flex flex-col p-0">
        {formContent}
      </DialogContent>
    </Dialog>
  );
};

export default ClientForm;
