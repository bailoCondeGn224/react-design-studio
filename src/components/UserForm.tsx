import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FormField from "@/components/FormField";
import { toast } from "sonner";
import { useRoles } from "@/hooks/useRoles";
import { User } from "@/types";
import { UserCircle, Mail, Lock, Shield, Check, Eye, EyeOff, User as UserIcon } from "lucide-react";

interface UserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  initialData?: User | null;
  mode?: 'create' | 'edit';
}

const UserForm = ({ open, onOpenChange, onSubmit, initialData = null, mode = 'create' }: UserFormProps) => {
  const { data: roles = [], isLoading: loadingRoles } = useRoles();
  const [showPassword, setShowPassword] = useState(false);

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
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] flex flex-col p-0 bg-gradient-to-br from-background via-background to-primary/5">
        {/* Header avec gradient */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b bg-gradient-to-r from-primary/10 via-primary/5 to-transparent flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg flex-shrink-0">
                <UserCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-bold text-foreground">
                  {mode === 'edit' ? 'Modifier l\'Utilisateur' : 'Nouvel Utilisateur'}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  {mode === 'edit' ? 'Modifiez les informations de l\'utilisateur' : 'Créez un nouveau compte utilisateur'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Zone scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-5">
          {/* Section Informations personnelles */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/5 via-background to-background border-2 border-border p-4 sm:p-5">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12"></div>
            <div className="relative space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Informations personnelles *</h3>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Nom complet *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Mamadou Diallo"
                  value={form.nom}
                  onChange={e => update("nom", e.target.value)}
                  maxLength={100}
                  className="w-full px-3 h-11 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Email *
                </label>
                <input
                  type="email"
                  placeholder="utilisateur@example.com"
                  value={form.email}
                  onChange={e => update("email", e.target.value)}
                  maxLength={100}
                  className="w-full px-3 h-11 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Section Sécurité */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-secondary/5 via-background to-background border-2 border-border p-4 sm:p-5">
            <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-full -mr-12 -mt-12"></div>
            <div className="relative space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-secondary-foreground" />
                </div>
                <h3 className="text-sm font-bold text-foreground">
                  {mode === 'edit' ? 'Sécurité' : 'Sécurité *'}
                </h3>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  {mode === 'edit' ? "Nouveau mot de passe (optionnel)" : "Mot de passe *"}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={mode === 'edit' ? "Laisser vide pour ne pas changer" : "••••••••"}
                    value={form.password}
                    onChange={e => update("password", e.target.value)}
                    className="w-full pr-12 px-3 h-11 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section Rôle et permissions */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-success/5 via-background to-background border-2 border-border p-4 sm:p-5">
            <div className="absolute top-0 right-0 w-24 h-24 bg-success/5 rounded-full -mr-12 -mt-12"></div>
            <div className="relative space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-success" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Rôle et permissions *</h3>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Rôle de l'utilisateur *
                </label>
                <select
                  value={form.roleId}
                  onChange={e => update("roleId", e.target.value)}
                  disabled={loadingRoles}
                  className="w-full px-3 h-11 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">Sélectionnez un rôle</option>
                  {roles
                    .filter(role => role.actif)
                    .map(role => (
                      <option key={role.id} value={role.id}>
                        {role.nom} {role.description && `- ${role.description}`}
                      </option>
                    ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Le rôle détermine les permissions et accès de l'utilisateur
                </p>
              </div>
            </div>
          </div>
        </form>

        {/* Footer avec actions - fixe en bas */}
        <div className="px-4 sm:px-6 py-4 border-t bg-muted/30 flex-shrink-0">
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              onClick={(e: any) => {
                const dialogContent = e.target.closest('[role="dialog"]');
                const formElement = dialogContent?.querySelector('form');
                if (formElement) {
                  formElement.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                }
              }}
              className="w-full sm:w-auto"
            >
              <Check className="w-4 h-4 mr-2" />
              {mode === 'edit' ? 'Enregistrer les modifications' : 'Créer l\'utilisateur'}
            </Button>
          </div>
        </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserForm;
