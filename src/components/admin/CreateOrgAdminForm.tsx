import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import FormField from "@/components/FormField";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { rolesApi } from "@/api/roles";

interface CreateOrgAdminFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  organization: any;
}

const CreateOrgAdminForm = ({ open, onOpenChange, onSubmit, organization }: CreateOrgAdminFormProps) => {
  const [form, setForm] = useState({
    email: "",
    nom: "",
    password: "",
    confirmPassword: "",
    roleId: "",
  });

  const [roles, setRoles] = useState<any[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const resetForm = () => {
    setForm({
      email: "",
      nom: "",
      password: "",
      confirmPassword: "",
      roleId: "",
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // Charger les rôles au montage
  useEffect(() => {
    const loadRoles = async () => {
      if (open) {
        setLoadingRoles(true);
        try {
          const data = await rolesApi.getAll();
          setRoles(data);
        } catch (error) {
          toast.error("Erreur lors du chargement des rôles");
        } finally {
          setLoadingRoles(false);
        }
      }
    };
    loadRoles();
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.email.trim()) {
      toast.error("L'email est obligatoire");
      return;
    }

    if (!form.nom.trim()) {
      toast.error("Le nom est obligatoire");
      return;
    }

    if (!form.roleId) {
      toast.error("Veuillez sélectionner un rôle");
      return;
    }

    if (!form.password.trim()) {
      toast.error("Le mot de passe est obligatoire");
      return;
    }

    if (form.password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    if (!form.confirmPassword.trim()) {
      toast.error("Veuillez confirmer le mot de passe");
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    const adminData = {
      email: form.email,
      nom: form.nom,
      password: form.password,
      roleId: form.roleId,
      organizationId: organization.id,
    };

    onSubmit(adminData);
    resetForm();
  };

  const handleClose = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">
            Créer un administrateur
          </DialogTitle>
          <DialogDescription>
            Créer un utilisateur administrateur pour <strong>{organization?.nom}</strong>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Email *"
            type="email"
            placeholder="admin@organization.com"
            value={form.email}
            onChange={e => update("email", (e.target as HTMLInputElement).value)}
            maxLength={100}
          />

          <FormField
            label="Nom complet *"
            placeholder="Ex: Jean Dupont"
            value={form.nom}
            onChange={e => update("nom", (e.target as HTMLInputElement).value)}
            maxLength={100}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium">Rôle *</label>
            <select
              value={form.roleId}
              onChange={e => update("roleId", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              disabled={loadingRoles}
            >
              <option value="">Sélectionner un rôle</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.nom} - {role.description}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Mot de passe *</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 6 caractères"
                value={form.password}
                onChange={e => update("password", e.target.value)}
                maxLength={50}
                className="w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Eye className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Confirmer le mot de passe *</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Retapez le mot de passe"
                value={form.confirmPassword}
                onChange={e => update("confirmPassword", e.target.value)}
                maxLength={50}
                className="w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Eye className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => handleClose(false)}
              className="flex-1 px-4 py-2.5 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 gradient-gold text-primary-foreground px-4 py-2.5 rounded-lg font-semibold shadow-elevated hover:opacity-90 transition-opacity"
            >
              Créer
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateOrgAdminForm;
