import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';

interface ZoneFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  mode: 'create' | 'edit';
}

const ZoneForm = ({ open, onOpenChange, onSubmit, initialData, mode }: ZoneFormProps) => {
  const [formData, setFormData] = useState({
    code: '',
    nom: '',
    description: '',
    actif: true,
  });

  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormData({
        code: initialData.code || '',
        nom: initialData.nom || '',
        description: initialData.description || '',
        actif: initialData.actif !== undefined ? initialData.actif : true,
      });
    } else {
      setFormData({
        code: '',
        nom: '',
        description: '',
        actif: true,
      });
    }
  }, [initialData, mode, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'edit' && initialData) {
      onSubmit({ id: initialData.id, data: formData });
    } else {
      onSubmit(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            {mode === 'create' ? 'Nouvelle Zone' : 'Modifier la Zone'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
              Code <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="Ex: A, B, C"
              maxLength={10}
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-border bg-card text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
              Code unique de la zone (max 10 caractères)
            </p>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
              Nom <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              placeholder="Ex: Zone Abayas"
              maxLength={100}
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-border bg-card text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description de la zone (optionnel)"
              rows={3}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-border bg-card text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="actif"
              name="actif"
              checked={formData.actif}
              onChange={handleChange}
              className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-ring/30"
            />
            <label htmlFor="actif" className="text-xs sm:text-sm text-foreground">
              Zone active
            </label>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-2 sm:pt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 border border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <X className="w-4 h-4" />
              Annuler
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto gradient-gold text-primary-foreground px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-sm font-semibold shadow-elevated hover:opacity-90 transition-opacity"
            >
              {mode === 'create' ? 'Créer' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ZoneForm;
