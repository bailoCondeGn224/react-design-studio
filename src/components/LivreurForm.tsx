import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Truck, User, KeyRound, CheckCircle, Check } from 'lucide-react';
import { Livreur, CreateLivreurDto, UpdateLivreurDto } from '@/types/livreur';

// Mêmes règles que CreateLivreurDto / UpdateLivreurDto côté backend
const PASSWORD_MIN_LENGTH = 6;

export type LivreurFormSubmit =
  | { mode: 'create'; data: CreateLivreurDto }
  | { mode: 'edit'; id: string; data: UpdateLivreurDto };

interface LivreurFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (submit: LivreurFormSubmit) => void;
  initialData?: Livreur | null;
  mode: 'create' | 'edit';
  isSubmitting?: boolean;
}

const emptyForm = { nom: '', telephone: '', password: '', isActive: true };

const inputClasses =
  'w-full px-3 h-11 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary';

const LivreurForm = ({ open, onOpenChange, onSubmit, initialData, mode, isSubmitting = false }: LivreurFormProps) => {
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormData({
        nom: initialData.nom || '',
        telephone: initialData.telephone || '',
        password: '',
        isActive: initialData.isActive,
      });
    } else {
      setFormData(emptyForm);
    }
  }, [initialData, mode, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nom = formData.nom.trim();
    const telephone = formData.telephone.trim();
    const { password } = formData;

    if (!nom || !telephone) {
      toast.error('Le nom et le téléphone sont obligatoires');
      return;
    }
    // Obligatoire à la création ; en modification, vide = inchangé
    if ((mode === 'create' || password) && password.length < PASSWORD_MIN_LENGTH) {
      toast.error(`Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères`);
      return;
    }

    if (mode === 'edit' && initialData) {
      const data: UpdateLivreurDto = { nom, telephone, isActive: formData.isActive };
      if (password) data.password = password;
      onSubmit({ mode: 'edit', id: initialData.id, data });
    } else {
      onSubmit({ mode: 'create', data: { nom, telephone, password } });
    }
  };

  const title = mode === 'edit' ? 'Modifier le Livreur' : 'Nouveau Livreur';
  const description =
    mode === 'edit'
      ? 'Modifiez les informations du livreur'
      : 'Créez le compte avec lequel le livreur se connectera';

  const formContent = (
    <div className="h-full flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header avec gradient */}
      <div className="px-4 sm:px-6 py-4 sm:py-5 border-b bg-gradient-to-r from-primary/10 via-primary/5 to-transparent flex-shrink-0">
        <div className="flex items-center gap-3 flex-1 min-w-0 pr-12">
          <div className="hidden md:flex w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 items-center justify-center shadow-lg flex-shrink-0">
            <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-foreground">
              <span className="md:hidden">{mode === 'edit' ? 'Modifier' : 'Livreur'}</span>
              <span className="hidden md:inline">{title}</span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{description}</p>
          </div>
        </div>
      </div>

      {/* Zone scrollable */}
      <form id="livreur-form" onSubmit={handleSubmit} className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-5">
        {/* Section Identité */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/5 via-background to-background border-2 border-border p-4 sm:p-5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12"></div>
          <div className="relative space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-sm font-bold text-foreground">
                Identité <span className="text-destructive">*</span>
              </h3>
            </div>

            <div>
              <label htmlFor="livreur-nom" className="block text-xs font-medium text-muted-foreground mb-1.5">
                Nom complet <span className="text-destructive">*</span>
              </label>
              <input
                id="livreur-nom"
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                placeholder="Ex: Mamadou Diallo"
                maxLength={100}
                required
                className={inputClasses}
              />
            </div>

            <div>
              <label htmlFor="livreur-telephone" className="block text-xs font-medium text-muted-foreground mb-1.5">
                Téléphone <span className="text-destructive">*</span>
              </label>
              <input
                id="livreur-telephone"
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                placeholder="Ex: 620 00 00 00"
                required
                className={inputClasses}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Sert d'identifiant de connexion pour le livreur
              </p>
            </div>
          </div>
        </div>

        {/* Section Accès */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-muted/30 via-background to-background border-2 border-border p-4 sm:p-5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-muted/20 rounded-full -mr-12 -mt-12"></div>
          <div className="relative space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
                <KeyRound className="w-4 h-4 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-bold text-foreground">
                Mot de passe {mode === 'create' && <span className="text-destructive">*</span>}
              </h3>
            </div>
            <input
              id="livreur-password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              placeholder={mode === 'edit' ? 'Laisser vide pour ne pas changer' : `${PASSWORD_MIN_LENGTH} caractères minimum`}
              required={mode === 'create'}
              className={inputClasses}
            />
          </div>
        </div>

        {/* Section Statut (modification uniquement : un nouveau livreur est actif) */}
        {mode === 'edit' && (
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-success/5 via-background to-background border-2 border-border p-4 sm:p-5">
            <div className="absolute top-0 right-0 w-24 h-24 bg-success/5 rounded-full -mr-12 -mt-12"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-success" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Statut</h3>
              </div>
              <div className="flex items-start gap-3 p-3 bg-success/10 rounded-lg border border-success/20">
                <input
                  type="checkbox"
                  id="livreur-isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-5 h-5 mt-0.5 rounded flex-shrink-0"
                />
                <div className="flex-1">
                  <label htmlFor="livreur-isActive" className="text-sm font-medium text-foreground cursor-pointer block">
                    Livreur actif
                  </label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Un livreur inactif ne peut plus se connecter ni recevoir de commandes
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>

      {/* Footer avec actions - fixe en bas */}
      <div className="px-4 sm:px-6 py-4 border-t bg-muted/30 flex-shrink-0">
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Annuler
          </Button>
          <Button type="submit" form="livreur-form" disabled={isSubmitting} className="w-full sm:w-auto">
            <Check className="w-4 h-4 mr-2" />
            {isSubmitting ? 'En cours...' : mode === 'create' ? 'Créer le livreur' : 'Enregistrer les modifications'}
          </Button>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[95vh] p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
          {formContent}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] flex flex-col p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
};

export default LivreurForm;
