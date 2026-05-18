import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, Tag, FileText, CheckCircle, Check } from 'lucide-react';

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
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] flex flex-col p-0 bg-gradient-to-br from-background via-background to-primary/5">
        {/* Header avec gradient */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b bg-gradient-to-r from-primary/10 via-primary/5 to-transparent flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg flex-shrink-0">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-bold text-foreground">
                  {mode === 'edit' ? 'Modifier la Zone' : 'Nouvelle Zone'}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  {mode === 'edit' ? 'Modifiez les informations de la zone' : 'Créez une nouvelle zone d\'entreposage'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Zone scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-5">
          {/* Section Informations */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/5 via-background to-background border-2 border-border p-4 sm:p-5">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12"></div>
            <div className="relative space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Tag className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Informations principales *</h3>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Code de la zone *
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="Ex: A, B, C"
                  maxLength={10}
                  required
                  className="w-full px-3 h-11 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono uppercase"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Code unique de la zone (max 10 caractères)
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Nom de la zone *
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  placeholder="Ex: Zone Abayas"
                  maxLength={100}
                  required
                  className="w-full px-3 h-11 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Section Description */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-muted/30 via-background to-background border-2 border-border p-4 sm:p-5">
            <div className="absolute top-0 right-0 w-24 h-24 bg-muted/20 rounded-full -mr-12 -mt-12"></div>
            <div className="relative space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Description (optionnelle)</h3>
              </div>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Description de la zone"
                maxLength={500}
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
            </div>
          </div>

          {/* Section Statut */}
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
                  id="actif"
                  name="actif"
                  checked={formData.actif}
                  onChange={handleChange}
                  className="w-5 h-5 mt-0.5 rounded flex-shrink-0"
                />
                <div className="flex-1">
                  <label htmlFor="actif" className="text-sm font-medium text-foreground cursor-pointer block">
                    Zone active
                  </label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Les zones actives sont disponibles lors de la création de catégories
                  </p>
                </div>
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
              {mode === 'create' ? 'Créer la zone' : 'Enregistrer les modifications'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ZoneForm;
