import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import FormField from "@/components/FormField";
import { toast } from "sonner";
import { useRoles } from "@/hooks/useRoles";
import { User } from "@/types";

interface UserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  initialData?: User | null;
  mode?: 'create' | 'edit';
}

const UserForm = ({ open, onOpenChange, onSubmit, initialData = null, mode = 'create' }: UserFormProps) => {
  const { data: roles = [], isLoading: loadingRoles } = useRoles();

  const getInitialState = () => {
    if (mode === 'edit' && initialData) {
      return {
        email: initialData.email || "",
        nom: initialData.nom || "",
        roleId: initialData.roleId || "",
        password: "", // Ne pas pré-remplir le mot de passe en mode édition
      };
    }
    return {
      email: "",
      nom: "",
      roleId: "",
      password: "",
    };
  };

  const [form, setForm] = useState(getInitialState());

  useEffect(() => {
    if (open) {
      setForm(getInitialState());
    }
  }, [open, initialData, mode]);

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!form.email.trim() || !form.nom.trim()) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (mode === 'create' && !form.password.trim()) {
      toast.error("Le mot de passe est obligatoire");
      return;
    }

    if (!form.roleId) {
      toast.error("Veuillez sélectionner un rôle");
      return;
    }

    // Préparer les données
    const userData: any = {
      email: form.email.trim(),
      nom: form.nom.trim(),
      roleId: form.roleId,
    };

    // Ajouter le mot de passe seulement s'il est fourni
    if (form.password.trim()) {
      userData.password = form.password;
    }

    onSubmit(userData);
    setForm(getInitialState());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {mode === 'edit' ? 'Modifier l\'Utilisateur' : 'Nouvel Utilisateur'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit'
              ? 'Modifiez les informations de l\'utilisateur'
              : 'Créez un nouveau compte utilisateur'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Nom complet *"
            placeholder="Ex: Mamadou Diallo"
            value={form.nom}
            onChange={e => update("nom", (e.target as HTMLInputElement).value)}
            maxLength={100}
          />

          <FormField
            label="Email *"
            type="email"
            placeholder="utilisateur@example.com"
            value={form.email}
            onChange={e => update("email", (e.target as HTMLInputElement).value)}
            maxLength={100}
          />

          <FormField
            label={mode === 'edit' ? "Nouveau mot de passe (optionnel)" : "Mot de passe *"}
            type="password"
            placeholder={mode === 'edit' ? "Laisser vide pour ne pas changer" : "••••••••"}
            value={form.password}
            onChange={e => update("password", (e.target as HTMLInputElement).value)}
          />

          <FormField
            label="Rôle *"
            as="select"
            value={form.roleId}
            onChange={e => update("roleId", (e.target as HTMLSelectElement).value)}
            disabled={loadingRoles}
          >
            <option value="">Sélectionnez un rôle</option>
            {roles
              .filter(role => role.actif)
              .map(role => (
                <option key={role.id} value={role.id}>
                  {role.nom} {role.description && `- ${role.description}`}
                </option>
              ))}
          </FormField>

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

export default UserForm;
